"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { incrementVisitors, incrementInterviewStarted } from "@/lib/analytics-api";
import type { JobCategory } from "@/types/interview";

const jobOptions = [
  {
    value: "frontend" as JobCategory,
    label: "프론트엔드 개발자",
    description: "React, Vue, Angular 등",
  },
  {
    value: "backend" as JobCategory,
    label: "백엔드 개발자",
    description: "Node.js, Python, Java 등",
  },
  {
    value: "mobile-development" as JobCategory,
    label: "모바일 개발자",
    description: "iOS, Android, React Native 등",
  },
  {
    value: "data-science" as JobCategory,
    label: "데이터 사이언티스트",
    description: "머신러닝, 데이터 분석 등",
  },
  {
    value: "devops" as JobCategory,
    label: "데브옵스 엔지니어",
    description: "CI/CD, 클라우드, 인프라 등",
  },
  {
    value: "qa" as JobCategory,
    label: "QA 엔지니어",
    description: "테스트 자동화, 품질 관리 등",
  },
  {
    value: "product-management" as JobCategory,
    label: "프로덕트 매니저",
    description: "제품 기획, 로드맵 관리 등",
  },
  {
    value: "planner" as JobCategory,
    label: "서비스 기획자",
    description: "서비스 기획, 비즈니스 기획 등",
  },
  {
    value: "designer" as JobCategory,
    label: "디자이너",
    description: "UI/UX, 그래픽 디자인 등",
  },
  {
    value: "marketer" as JobCategory,
    label: "마케터",
    description: "디지털 마케팅, 브랜딩 등",
  },
  {
    value: "other" as JobCategory,
    label: "기타",
    description: "직접 입력해주세요",
  },
];

interface JobSelectionScreenProps {
  startSession: (category: JobCategory, customCategory?: string) => void;
}

export function JobSelectionScreen({ startSession }: JobSelectionScreenProps) {
  const [selectedJob, setSelectedJob] = useState<JobCategory | "">("");
  const [customJob, setCustomJob] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  // 페이지 방문 시 방문자 수 증가
  useEffect(() => {
    incrementVisitors();
  }, []);

  const handleStart = async () => {
    if (!selectedJob) return;

    setIsStarting(true);

    // 면접 시작 수 증가
    incrementInterviewStarted();

    await new Promise((resolve) => setTimeout(resolve, 500));

    startSession(selectedJob, selectedJob === "other" ? customJob : undefined);
    setIsStarting(false);
  };

  const canStart = selectedJob && (selectedJob !== "other" || customJob.trim());

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Analytics Dashboard */}
      <div className="mb-12">
        <AnalyticsDashboard />
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">AI 면접 첨삭 서비스</h1>
          <p className="text-lg text-muted-foreground">
            AI가 분석하는 맞춤형 면접 질문과 전문적인 답변 피드백을 받아보세요
          </p>
        </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">직무를 선택해주세요</CardTitle>
          <CardDescription>
            선택하신 직무에 맞는 면접 질문을 준비해드립니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedJob}
            onValueChange={(value) => setSelectedJob(value as JobCategory)}
            className="space-y-3"
          >
            {jobOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => setSelectedJob(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <div className="flex-1">
                  <Label
                    htmlFor={option.value}
                    className="text-base font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>

          {selectedJob === "other" && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <Label htmlFor="custom-job" className="text-sm font-medium">
                직무명을 입력해주세요
              </Label>
              <Input
                id="custom-job"
                placeholder="예: 데이터 분석가, QA 엔지니어 등"
                value={customJob}
                onChange={(e) => setCustomJob(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          <Button
            onClick={handleStart}
            disabled={!canStart || isStarting}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isStarting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                면접 준비 중...
              </div>
            ) : (
              "면접 시작하기"
            )}
          </Button>
        </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            회원가입 없이 바로 시작할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}
