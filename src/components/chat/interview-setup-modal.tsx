"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChatContext } from "@/contexts/chat-context";
import type {
  InterviewConfig,
  LanguageOption,
  DifficultyOption,
  InterviewTypeOption,
} from "@/types";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { Route } from "next";
import { useSidebar } from "../ui/sidebar";

const BrainIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
);

const MessageIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const CalculatorIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

const CodeIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  </svg>
);

const DatabaseIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
    />
  </svg>
);

const GlobeIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
    />
  </svg>
);

const CpuIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 3v2m6-2v2M9 19v2m6-2v2m5-16v2m0 6v2m0 6v2M4 9h2m-2 6h2m-2 6h2m16-5h2m-2-6h2m-2-6h2M7 8h10a1 1 0 011 1v6a1 1 0 01-1 1H7a1 1 0 01-1-1V9a1 1 0 011-1z"
    />
  </svg>
);

const languages: LanguageOption[] = [
  { value: "javascript", label: "JavaScript", icon: <CodeIcon /> },
  { value: "python", label: "Python", icon: <CodeIcon /> },
  { value: "java", label: "Java", icon: <CodeIcon /> },
  { value: "cpp", label: "C++", icon: <CodeIcon /> },
  { value: "react", label: "React", icon: <GlobeIcon /> },
  { value: "nodejs", label: "Node.js", icon: <CpuIcon /> },
  { value: "sql", label: "SQL/DBMS", icon: <DatabaseIcon /> },
  { value: "system-design", label: "System Design", icon: <BrainIcon /> },
] as const;

const difficulties: DifficultyOption[] = [
  {
    value: "easy",
    label: "Easy",
    description: "Basic concepts and simple problems",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Intermediate concepts and moderate complexity",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  {
    value: "hard",
    label: "Hard",
    description: "Advanced concepts and complex problems",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
  },
] as const;

const interviewTypes: InterviewTypeOption[] = [
  {
    value: "technical",
    label: "Technical",
    description: "Coding problems and technical concepts",
    icon: <BrainIcon />,
  },
  {
    value: "hr",
    label: "HR Round",
    description: "Behavioral and situational questions",
    icon: <MessageIcon />,
  },
  {
    value: "aptitude",
    label: "Aptitude",
    description: "Logical reasoning and problem solving",
    icon: <CalculatorIcon />,
  },
] as const;

export function InterviewSetupModal() {
  const [config, setConfig] = useState<InterviewConfig>({
    language: "",
    difficulty: "",
    type: "",
  });

  const utils = api.useUtils();
  const router = useRouter();
  const startInterviewMutation = api.interview.startInterview.useMutation();
  const { closeInterviewSetupModal, isInterviewSetupModalOpen, openErrorModal } =
    useChatContext();

    const { toggleSidebar } = useSidebar();

  const handleStart = async () => {
    if (config.language && config.difficulty && config.type) {
      try {
        toast.loading("Creating interview session...");

        const result = await startInterviewMutation.mutateAsync(
          {
            language: config.language,
            difficulty: config.difficulty,
            type: config.type,
          },
          {},
        );

        // await utils.interview.getInterviewHistory.invalidate();
        await utils.interview.getInterviewHistory.refetch();
        toast.dismiss();

        toast.success("Interview session created successfully!");

        setConfig({ language: "", difficulty: "", type: "" });

        closeInterviewSetupModal();
        toggleSidebar();
        router.push(`/chat/${result.sessionId}` as Route);
      } catch (error) {
        toast.dismiss();
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Failed to create interview session. Please try again.";
        openErrorModal(errorMessage);
        console.error("Error creating interview session:", error);
      }
    }
  };

  const isValid = config.language && config.difficulty && config.type;
  return (
    <Dialog
      open={isInterviewSetupModalOpen}
      onOpenChange={closeInterviewSetupModal}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Start New Interview Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Interview Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Interview Type</Label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {interviewTypes.map((type) => (
                <Card
                  key={type.value}
                  className={`hover:border-primary/50 cursor-pointer transition-all duration-200 ${
                    config.type === type.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent/50"
                  }`}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      type: type.value as InterviewConfig["type"],
                    }))
                  }
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`rounded-lg p-2 ${
                          config.type === type.value
                            ? "bg-primary/20 text-primary"
                            : "bg-muted"
                        }`}
                      >
                        {type.icon}
                      </div>
                      <h3 className="font-medium">{type.label}</h3>
                      <p className="text-muted-foreground text-center text-xs">
                        {type.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Language/Domain Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Language/Domain</Label>
            <Select
              value={config.language}
              onValueChange={(value) =>
                setConfig((prev) => ({
                  ...prev,
                  language: value as InterviewConfig["language"],
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a language or domain" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <div className="flex items-center gap-2">
                      {lang.icon}
                      <span>{lang.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Difficulty Level</Label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {difficulties.map((difficulty) => (
                <Card
                  key={difficulty.value}
                  className={`hover:border-primary/50 cursor-pointer transition-all duration-200 ${
                    config.difficulty === difficulty.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent/50"
                  }`}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      difficulty:
                        difficulty.value as InterviewConfig["difficulty"],
                    }))
                  }
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${difficulty.color} border`}
                      >
                        {difficulty.label}
                      </Badge>
                      <p className="text-muted-foreground text-center text-xs">
                        {difficulty.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Summary */}
          {isValid && (
            <div className="bg-accent/50 rounded-lg border p-4">
              <h4 className="mb-2 font-medium">Interview Summary</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {config.type.charAt(0).toUpperCase() + config.type.slice(1)}
                </Badge>
                <Badge variant="outline">
                  {config.difficulty.charAt(0).toUpperCase() +
                    config.difficulty.slice(1)}
                </Badge>
                <Badge variant="outline">
                  {languages.find((l) => l.value === config.language)?.label}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                You&apos;ll be asked 10 questions in this session. Good luck!
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={closeInterviewSetupModal}
            disabled={startInterviewMutation.isPending}
            className="flex-1 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            disabled={!isValid || startInterviewMutation.isPending}
            className="bg-primary hover:bg-primary/90 flex-1"
          >
            {startInterviewMutation.isPending ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              "Start Interview"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
