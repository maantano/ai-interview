"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Database, Bot } from "lucide-react";
import { useState, useEffect } from "react";

interface LoadingScreenProps {
  jobCategory?: string;
}

export function LoadingScreen({ jobCategory }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { text: "AI 면접관을 준비하고 있습니다...", icon: Bot },
    { text: "맞춤형 질문을 생성하고 있습니다...", icon: Sparkles },
    { text: "면접 환경을 설정하고 있습니다...", icon: Database },
  ];

  useEffect(() => {
    const duration = 6000; // 6 seconds total
    const intervals = 20; // Update every 300ms
    const stepDuration = duration / intervals;

    let currentInterval = 0;
    const timer = setInterval(() => {
      currentInterval++;
      const newProgress = (currentInterval / intervals) * 100;
      setProgress(newProgress);

      // Update step based on progress
      if (newProgress < 33) {
        setCurrentStep(0);
      } else if (newProgress < 66) {
        setCurrentStep(1);
      } else {
        setCurrentStep(2);
      }

      if (currentInterval >= intervals) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <CurrentIcon className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-25" />
              </div>
            </div>
            <CardTitle className="text-xl">면접 준비 중</CardTitle>
            <CardDescription>
              {jobCategory && `${jobCategory} 직무에 맞는 `}
              AI 면접 질문을 생성하고 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CurrentIcon className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  {steps[currentStep].text}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {Math.round(progress)}% 완료
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium mb-2">잠깐만요!</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• AI가 실제 면접 상황을 고려하여 질문을 생성합니다</p>
                <p>• 해당 직무의 최신 트렌드가 반영된 질문입니다</p>
                <p>• 개인 맞춤형 피드백을 위한 분석 모델을 준비합니다</p>
              </div>
            </div>

            {/* Animated dots */}
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}