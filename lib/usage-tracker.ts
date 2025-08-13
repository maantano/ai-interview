/**
 * Simple in-memory usage tracking for MVP
 * In production, this should be replaced with Redis or database storage
 */

interface UsageRecord {
  questionGeneration: {
    daily: number;
    hourly: number;
    lastDailyReset: number;
    lastHourlyReset: number;
  };
  answerAnalysis: {
    daily: number;
    hourly: number;
    lastDailyReset: number;
    lastHourlyReset: number;
  };
}

interface UsageLimits {
  questionGeneration: {
    daily: number;
    hourly: number;
  };
  answerAnalysis: {
    daily: number;
    hourly: number;
  };
}

// In-memory storage for MVP (use Redis or DB in production)
const usageStore = new Map<string, UsageRecord>();

// Default usage limits for free tier
const DEFAULT_LIMITS: UsageLimits = {
  questionGeneration: {
    daily: 50,
    hourly: 20,
  },
  answerAnalysis: {
    daily: 100,
    hourly: 50,
  },
};

/**
 * Get client identifier (IP address for now)
 */
function getClientId(request: Request): string {
  // In development or when behind proxy, check various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const clientIp = forwarded?.split(",")[0] || realIp || "unknown";

  return clientIp;
}

/**
 * Get current usage for a client
 */
function getUsageRecord(clientId: string): UsageRecord {
  if (!usageStore.has(clientId)) {
    const now = Date.now();
    usageStore.set(clientId, {
      questionGeneration: {
        daily: 0,
        hourly: 0,
        lastDailyReset: now,
        lastHourlyReset: now,
      },
      answerAnalysis: {
        daily: 0,
        hourly: 0,
        lastDailyReset: now,
        lastHourlyReset: now,
      },
    });
  }
  return usageStore.get(clientId)!;
}

/**
 * Reset counters if time window has passed
 */
function resetCountersIfNeeded(record: UsageRecord): void {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneHour = 60 * 60 * 1000;

  // Reset daily counters
  if (now - record.questionGeneration.lastDailyReset > oneDay) {
    record.questionGeneration.daily = 0;
    record.questionGeneration.lastDailyReset = now;
  }
  if (now - record.answerAnalysis.lastDailyReset > oneDay) {
    record.answerAnalysis.daily = 0;
    record.answerAnalysis.lastDailyReset = now;
  }

  // Reset hourly counters
  if (now - record.questionGeneration.lastHourlyReset > oneHour) {
    record.questionGeneration.hourly = 0;
    record.questionGeneration.lastHourlyReset = now;
  }
  if (now - record.answerAnalysis.lastHourlyReset > oneHour) {
    record.answerAnalysis.hourly = 0;
    record.answerAnalysis.lastHourlyReset = now;
  }
}

/**
 * Check if client can make a request
 */
export function checkRateLimit(
  request: Request,
  type: "questionGeneration" | "answerAnalysis"
): {
  allowed: boolean;
  message?: string;
  remaining?: { daily: number; hourly: number };
} {
  const clientId = getClientId(request);
  const record = getUsageRecord(clientId);

  resetCountersIfNeeded(record);

  const limits = DEFAULT_LIMITS[type];
  const usage = record[type];

  // Check hourly limit first
  if (usage.hourly >= limits.hourly) {
    return {
      allowed: false,
      message: `시간당 ${limits.hourly}회 제한을 초과했습니다. 잠시 후 다시 시도해주세요.`,
    };
  }

  // Check daily limit
  if (usage.daily >= limits.daily) {
    return {
      allowed: false,
      message: `일일 ${limits.daily}회 제한을 초과했습니다. 내일 다시 시도해주세요.`,
    };
  }

  return {
    allowed: true,
    remaining: {
      daily: limits.daily - usage.daily,
      hourly: limits.hourly - usage.hourly,
    },
  };
}

/**
 * Record usage after successful request
 */
export function recordUsage(
  request: Request,
  type: "questionGeneration" | "answerAnalysis"
): void {
  const clientId = getClientId(request);
  const record = getUsageRecord(clientId);

  resetCountersIfNeeded(record);

  record[type].daily += 1;
  record[type].hourly += 1;

  usageStore.set(clientId, record);
}

/**
 * Get current usage stats for a client
 */
export function getUsageStats(request: Request): {
  questionGeneration: { daily: number; hourly: number };
  answerAnalysis: { daily: number; hourly: number };
  limits: UsageLimits;
} {
  const clientId = getClientId(request);
  const record = getUsageRecord(clientId);

  resetCountersIfNeeded(record);

  return {
    questionGeneration: {
      daily: record.questionGeneration.daily,
      hourly: record.questionGeneration.hourly,
    },
    answerAnalysis: {
      daily: record.answerAnalysis.daily,
      hourly: record.answerAnalysis.hourly,
    },
    limits: DEFAULT_LIMITS,
  };
}

/**
 * Clean up old usage records (call periodically)
 * Remove records older than 24 hours
 */
export function cleanupOldRecords(): void {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  for (const [clientId, record] of usageStore.entries()) {
    const oldestResetTime = Math.min(
      record.questionGeneration.lastDailyReset,
      record.answerAnalysis.lastDailyReset
    );

    if (now - oldestResetTime > oneDay * 2) {
      usageStore.delete(clientId);
    }
  }
}

// Clean up old records every hour
if (typeof globalThis !== "undefined" && typeof setInterval !== "undefined") {
  setInterval(cleanupOldRecords, 60 * 60 * 1000);
}
