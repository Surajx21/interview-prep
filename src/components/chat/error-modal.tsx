"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Key, Zap } from "lucide-react";
import { useChatContext } from "@/contexts/chat-context";

function getErrorDetails(error: string | null) {
  if (!error) {
    return {
      title: "An Error Occurred",
      description: "Something went wrong. Please try again.",
      icon: AlertCircle,
      iconColor: "text-red-500",
    };
  }

  const errorLower = error.toLowerCase();

  // Rate limit errors
  if (
    errorLower.includes("rate limit") ||
    errorLower.includes("too many requests") ||
    errorLower.includes("429")
  ) {
    return {
      title: "Rate Limit Exceeded",
      description:
        "You've exceeded the API rate limit. Please wait a moment before trying again, or check your API quota.",
      icon: Zap,
      iconColor: "text-yellow-500",
      suggestion: "Try again in a few minutes or upgrade your API plan.",
    };
  }

  // API key errors
  if (
    errorLower.includes("api key") ||
    errorLower.includes("unauthorized") ||
    errorLower.includes("invalid key") ||
    errorLower.includes("401")
  ) {
    return {
      title: "AI Configuration Error",
      description:
        "The server-side AI key is invalid or missing. Please check the app environment configuration.",
      icon: Key,
      iconColor: "text-red-500",
      suggestion: "Verify the server AI key and redeploy or restart the app.",
    };
  }

  // Network errors
  if (
    errorLower.includes("network") ||
    errorLower.includes("fetch") ||
    errorLower.includes("connection")
  ) {
    return {
      title: "Network Error",
      description:
        "Unable to connect to the server. Please check your internet connection.",
      icon: RefreshCw,
      iconColor: "text-orange-500",
      suggestion: "Check your connection and try again.",
    };
  }

  // Generic error
  return {
    title: "An Error Occurred",
    description: error,
    icon: AlertCircle,
    iconColor: "text-red-500",
    suggestion: "Please try again or contact support if the issue persists.",
  };
}

export function ErrorModal() {
  const { isErrorModalOpen, closeErrorModal, errorMessage } = useChatContext();

  if (!isErrorModalOpen) {
    return null;
  }

  const errorDetails = getErrorDetails(errorMessage);
  const Icon = errorDetails.icon;

  return (
    <Dialog open={isErrorModalOpen} onOpenChange={closeErrorModal}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <Icon className={`h-6 w-6 ${errorDetails.iconColor}`} />
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            {errorDetails.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {errorDetails.description}
          </DialogDescription>
        </DialogHeader>

        {errorDetails.suggestion && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Suggestion:</strong> {errorDetails.suggestion}
            </p>
          </div>
        )}

        <DialogFooter className="sm:justify-center">
          <Button onClick={closeErrorModal} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ErrorModal;
