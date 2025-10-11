"use client";
import { MultimodalInput } from "./multimodal-input";
import React, { Fragment, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { api } from "@/trpc/react";
import { type ChatStatus, type UIMessage } from "ai";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { systemPrompt, parseEvaluationData } from "@/lib/utils";
import { type InterviewSession } from "@/server/db/schema";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "../ai-elements/conversation";
import { Message, MessageContent } from "../ai-elements/message";
import { Response } from "../ai-elements/response";
import { Loader2 } from "lucide-react";
import ResultsModal from "./result-modal";
import { useChatContext } from "@/contexts/chat-context";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";

// Helper function to clean assistant messages for display
function cleanMessageForDisplay(text: string): string {
  let cleanedText = text;

  // Remove the [INTERVIEW_ENDED] marker
  cleanedText = cleanedText.replace(/\[INTERVIEW_ENDED\]/g, "");

  // Remove ONLY the XML evaluation data block (keep the formatted text above it)
  cleanedText = cleanedText.replace(
    /<EVALUATION_DATA>[\s\S]*?<\/EVALUATION_DATA>/gi,
    "",
  );

  // Also remove any remaining XML-like tags (both uppercase and lowercase)
  // This catches standalone tags like <VERDICT>, <ACCURACY_SCORE>, etc.
  cleanedText = cleanedText.replace(/<\/?[A-Z_]+>/g, "");

  return cleanedText.trim();
}

export function ChatSection({ data }: { data: InterviewSession }) {
  const [isInterviewEnded, setIsInterviewEnded] = useState(false);
  const [hasResultsSaved, setHasResultsSaved] = useState(false);
  const { data: userData } = authClient.useSession();
  const utils = api.useUtils();
  const isSavingRef = React.useRef(false);
  const { openResultModal, openErrorModal } = useChatContext();
  const { data: oldMessages, isLoading: isLoadingMessages } =
    api.message.getMessages.useQuery(
      {
        interviewSessionId: data.id,
      },
      {
        refetchInterval: 0,
      },
    );
  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: data.id,
  });
  const saveResultMutation = api.interview.saveInterviewResult.useMutation();
  const {
    data: existingResult,
    isLoading: isLoadingResult,
    refetch: refetchResult,
  } = api.interview.getInterviewResult.useQuery({
    interviewSessionId: data.id,
  });

  // Set state if results already exist in database
  useEffect(() => {
    if (existingResult && !hasResultsSaved) {
      setHasResultsSaved(true);
      setIsInterviewEnded(true);
    }
  }, [existingResult, hasResultsSaved, utils]);

  // Handle chat errors
  useEffect(() => {
    if (error) {
      openErrorModal(error.message || "An error occurred during the chat");
    }
  }, [error, openErrorModal]);

  useEffect(() => {
    if (oldMessages && oldMessages.length === 0) {
      const prompt = systemPrompt
        .replace("{{NAME}}", userData?.user?.name ?? "Candidate")
        .replace("{{INTERVIEW_TYPE}}", data.type)
        .replace("{{DIFFICULTY_LEVEL}}", data.difficulty)
        .replace("{{CODING_LANGUAGE}}", data.language);

      void sendMessage({
        role: "system",
        parts: [{ type: "text", text: prompt }],
      });
    }

    if (oldMessages && oldMessages.length > 0) {
      const messages: UIMessage[] = oldMessages.map((message) => ({
        id: message.id,
        role: message.role,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        parts: message.parts as any,
        metadata: message.metadata,
      }));

      setMessages([
        {
          id: "system-prompt",
          role: "system",
          parts: [
            {
              type: "text",
              text: systemPrompt
                .replace("{{NAME}}", userData?.user?.name ?? "Candidate")
                .replace("{{INTERVIEW_TYPE}}", data.type)
                .replace("{{DIFFICULTY_LEVEL}}", data.difficulty)
                .replace("{{CODING_LANGUAGE}}", data.language),
            },
          ],
        },
        ...messages,
      ]);
    }
  }, [oldMessages, setMessages, data, sendMessage, userData]);

  // Check for interview end marker and save results
  useEffect(() => {
    if (
      messages.length === 0 ||
      hasResultsSaved ||
      isSavingRef.current ||
      existingResult
    )
      return;

    // Get the last assistant message
    const lastAssistantMessage = messages
      .filter((msg) => msg.role === "assistant")
      .pop();

    if (!lastAssistantMessage) return;

    // Check if any part contains the [INTERVIEW_ENDED] marker
    const hasEndMarker = lastAssistantMessage.parts.some((part) => {
      if (part.type === "text" && "text" in part) {
        return part.text.includes("[INTERVIEW_ENDED]");
      }
      return false;
    });

    if (hasEndMarker) {
      setIsInterviewEnded(true);

      // Parse evaluation data from the last message
      const fullText = lastAssistantMessage.parts
        .filter((part) => part.type === "text" && "text" in part)
        .map((part) => ("text" in part ? part.text : ""))
        .join("\n");

      const evaluationData = parseEvaluationData(fullText);

      if (evaluationData && !hasResultsSaved && !isSavingRef.current) {
        // Mark as saving to prevent duplicate calls
        isSavingRef.current = true;

        // Save to database
        saveResultMutation
          .mutateAsync({
            interviewSessionId: data.id,
            ...evaluationData,
          })
          .then(() => {
            setHasResultsSaved(true);
            isSavingRef.current = false;
            // Invalidate and refetch the result query immediately
            void utils.interview.getInterviewHistory.invalidate();
            void refetchResult();
          })
          .catch((error) => {
            console.error("Failed to save interview results:", error);
            isSavingRef.current = false;
            openErrorModal(
              error instanceof Error
                ? error.message
                : "Failed to save interview results",
            );
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, data.id, hasResultsSaved, existingResult]);

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage({
        role: "user",
        parts: [{ type: "text", text: message }],
      });
    } catch (error) {
      openErrorModal(
        error instanceof Error ? error.message : "Failed to send message",
      );
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-4">
      {/* chat box */}
      <ChatBox
        messages={messages}
        isLoading={status === "streaming" || isLoadingMessages}
        status={status}
        userImage={userData?.user?.image ?? null}
      />
      {/* input box */}
      {!isInterviewEnded && (
        <div className="flex-shrink-0">
          <MultimodalInput
            onSendMessage={handleSendMessage}
            buttonDisabled={status === "streaming" || isInterviewEnded}
            placeholder={
              isInterviewEnded ? "Interview has ended" : "Type your message..."
            }
          />
        </div>
      )}

      {isInterviewEnded && (
        <div className="mt-2 space-y-2">
          {(Boolean(hasResultsSaved) ||
            Boolean(existingResult) ||
            Boolean(isLoadingResult) ||
            Boolean(saveResultMutation.isPending)) && (
            <Button
              onClick={() => {
                if (existingResult) {
                  openResultModal(existingResult);
                }
              }}
              className="w-full"
              size="lg"
              disabled={
                isLoadingResult ||
                saveResultMutation.isPending ||
                !existingResult
              }
            >
              {isLoadingResult ||
              saveResultMutation.isPending ||
              !existingResult ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Results...
                </>
              ) : (
                "View Results"
              )}
            </Button>
          )}
        </div>
      )}

      <ResultsModal />
    </div>
  );
}

const ChatBox = ({
  messages,
  isLoading,
  status,
  userImage,
}: {
  messages: UIMessage[];
  isLoading: boolean;
  status: ChatStatus;
  userImage: string | null;
}) => {
  if (isLoading && messages.length === 0) {
    return <Skeleton className="h-full w-full" />;
  }

  // Check if we should show the loading indicator
  // Show it when status is submitted/streaming AND the assistant hasn't sent meaningful content yet
  const lastMessage = messages[messages.length - 1];
  const lastAssistantHasContent =
    lastMessage?.role === "assistant" &&
    lastMessage.parts.some(
      (part) =>
        part.type === "text" &&
        "text" in part &&
        part.text &&
        part.text.trim().length > 3, // At least a few characters to avoid flicker
    );

  const isWaitingForResponse =
    (status === "submitted" || status === "streaming") &&
    !lastAssistantHasContent;

  return (
    <div
      style={{
        scrollbarWidth: "none",
      }}
      className="bg-background max-h-screen flex-1 space-y-4 overflow-y-auto rounded-lg border-1 p-4"
    >
      <Conversation className="h-full">
        <ConversationContent>
          {messages.map((message) => (
            <div key={message.id}>
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case "text":
                    if (message.role === "system") {
                      return null;
                    }
                    return (
                      <Fragment key={`${message.id}-${i}`}>
                        <div
                          className={
                            message.role === "assistant" &&
                            status === "streaming"
                              ? "animate-in fade-in duration-300"
                              : ""
                          }
                        >
                          <Message from={message.role}>
                            {message.role === "assistant" && (
                              <Avatar className="hidden size-8 shrink-0 lg:block">
                                <AvatarImage
                                  src="/assistant-avatar.png"
                                  alt="Assistant"
                                  className=""
                                  style={{
                                    filter:
                                      "invert(58%) sepia(24%) saturate(749%) hue-rotate(179deg) brightness(96%) contrast(91%)",
                                  }}
                                />
                                <AvatarFallback>AI</AvatarFallback>
                              </Avatar>
                            )}
                            <MessageContent>
                              <Response>
                                {message.role === "assistant"
                                  ? cleanMessageForDisplay(part.text)
                                  : part.text}
                              </Response>
                            </MessageContent>
                            {message.role === "user" && (
                              <Avatar className="hidden size-8 shrink-0 lg:block">
                                <AvatarImage
                                  src={userImage ?? "/user-avatar.png"}
                                  alt="User"
                                />
                                <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                            )}
                          </Message>
                        </div>
                      </Fragment>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          ))}
          {isWaitingForResponse && (
            <div className="animate-in fade-in duration-200">
              <Message from="assistant">
                <Avatar className="hidden size-8 shrink-0 lg:block">
                  <AvatarImage
                    src="/assistant-avatar.png"
                    alt="Assistant"
                    style={{
                      filter:
                        "invert(58%) sepia(24%) saturate(749%) hue-rotate(179deg) brightness(96%) contrast(91%)",
                    }}
                  />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <MessageContent className="max-w-full">
                  <div className="text-muted-foreground flex items-start gap-2">
                    {/* <Loader className="size-4 animate-spin" /> */}
                    <span className="animate-blink text-sm">
                      {status === "submitted" ? "Thinking..." : "Typing..."}
                    </span>
                  </div>
                </MessageContent>
              </Message>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
};
