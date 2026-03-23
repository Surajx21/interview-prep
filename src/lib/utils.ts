import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// UUID v4 validation regex
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(uuid: string): boolean {
  return UUID_V4_REGEX.test(uuid);
}


// Helper function to extract evaluation data from AI response
export const parseEvaluationData = (text: string) => {
  const evaluationRegex = /<EVALUATION_DATA>([\s\S]*?)<\/EVALUATION_DATA>/;
  const evaluationMatch = evaluationRegex.exec(text);

  if (!evaluationMatch?.[1]) {
    return null;
  }

  const data = evaluationMatch[1];

  const extractTag = (tagName: string): string => {
    const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`);
    const match = regex.exec(data);
    return match?.[1]?.trim() ?? "";
  };

  return {
    accuracyScore: parseInt(extractTag("ACCURACY_SCORE")) || 0,
    communicationScore: parseInt(extractTag("COMMUNICATION_SCORE")) || 0,
    problemSolvingScore: parseInt(extractTag("PROBLEM_SOLVING_SCORE")) || 0,
    consistencyScore: parseInt(extractTag("CONSISTENCY_SCORE")) || 0,
    overallScore: parseInt(extractTag("OVERALL_SCORE")) || 0,
    performanceSummary: extractTag("PERFORMANCE_SUMMARY"),
    verdict: extractTag("VERDICT") as
      | "excellent"
      | "good"
      | "average"
      | "needs_improvement",
  };
};

// Helper function to check if interview has ended
export const hasInterviewEnded = (text: string): boolean => {
  return text.includes("[INTERVIEW_ENDED]");
};
