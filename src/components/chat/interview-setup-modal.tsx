"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { useChatContext } from "@/contexts/chat-context";
import {
  AtomIcon,
  BinaryIcon,
  BookOpenTextIcon,
  BrainCircuitIcon,
  BracesIcon,
  CoffeeIcon,
  DatabaseIcon as LucideDatabaseIcon,
  ServerCogIcon,
} from "lucide-react";
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

const languages: LanguageOption[] = [
  { value: "javascript", label: "JavaScript", icon: <BracesIcon className="h-4 w-4" /> },
  { value: "python", label: "Python", icon: <BookOpenTextIcon className="h-4 w-4" /> },
  { value: "java", label: "Java", icon: <CoffeeIcon className="h-4 w-4" /> },
  { value: "cpp", label: "C++", icon: <BinaryIcon className="h-4 w-4" /> },
  { value: "react", label: "React", icon: <AtomIcon className="h-4 w-4" /> },
  { value: "nodejs", label: "Node.js", icon: <ServerCogIcon className="h-4 w-4" /> },
  { value: "sql", label: "SQL/DBMS", icon: <LucideDatabaseIcon className="h-4 w-4" /> },
  { value: "system-design", label: "System Design", icon: <BrainCircuitIcon className="h-4 w-4" /> },
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
  const {
    closeInterviewSetupModal,
    isInterviewSetupModalOpen,
    openErrorModal,
  } = useChatContext();
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

        await utils.interview.getInterviewHistory.refetch();
        toast.dismiss();
        toast.success("Interview session created successfully!");

        setConfig({ language: "", difficulty: "", type: "" });

        closeInterviewSetupModal();
        toggleSidebar();
        router.push(`/chat/${result.sessionId}` as Route);
      } catch (error) {
        toast.dismiss();
        const errorMessage =
          error instanceof Error
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
      <DialogContent showCloseButton={false} className="w-[92vw] max-w-2xl p-0 font-mono">
        <DialogHeader className="border-b px-5 py-4 text-left sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex min-h-10 flex-col justify-center space-y-1">
              <DialogTitle className="text-left text-lg font-medium tracking-tight">
                New interview
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-5">
                Pick a type, topic, and level.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[80vh] space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          <section className="space-y-3">
            <Label className="text-xs font-medium tracking-wide uppercase">
              Type
            </Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {interviewTypes.map((type) => {
                const selected = config.type === type.value;

                return (
                  <Button
                    key={type.value}
                    variant="outline"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        type: type.value as InterviewConfig["type"],
                      }))
                    }
                    className={`cursor-pointer hover:bg-primary/20 ${
                      selected
                        ? "border-primary bg-primary/8"
                        : "hover:border-primary/40"
                    }`}
                  >
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="text-xs font-medium tracking-wide uppercase">
              Topic
            </Label>
            <Select
              value={config.language}
              onValueChange={(value) =>
                setConfig((prev) => ({
                  ...prev,
                  language: value as InterviewConfig["language"],
                }))
              }
            >
              <SelectTrigger className="bg-background h-11 w-full rounded-md text-sm">
                <SelectValue placeholder="Choose a topic" />
              </SelectTrigger>
              <SelectContent className="font-mono">
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
          </section>

          <section className="space-y-3">
            <Label className="text-xs font-medium tracking-wide uppercase">
              Level
            </Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {difficulties.map((difficulty) => {
                const selected = config.difficulty === difficulty.value;

                return (
                  <Button
                    variant={"outline"}
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        difficulty:
                          difficulty.value as InterviewConfig["difficulty"],
                      }))
                    }
                    key={difficulty.value}
                    className={`cursor-pointer hover:bg-primary/20 ${
                      selected
                        ? "border-primary bg-primary/8"
                        : "hover:border-primary/40"
                    }`}
                  >
                    {difficulty.label}
                  </Button>
                );
              })}
            </div>
          </section>

          <div className="bg-muted/30 flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium">
                {config.type
                  ? interviewTypes.find((type) => type.value === config.type)
                      ?.label
                  : "Choose type"}
                {" • "}
                {config.language
                  ? languages.find((lang) => lang.value === config.language)
                      ?.label
                  : "Choose topic"}
                {" • "}
                {config.difficulty
                  ? difficulties.find(
                      (difficulty) => difficulty.value === config.difficulty,
                    )?.label
                  : "Choose level"}
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 font-mono">
              10 Qs
            </Badge>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={closeInterviewSetupModal}
              disabled={startInterviewMutation.isPending}
              className="h-11 flex-1 cursor-pointer bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStart}
              disabled={!isValid || startInterviewMutation.isPending}
              className="h-11 flex-1 cursor-pointer"
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
                "Start"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
