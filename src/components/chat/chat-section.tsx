"use client";

import React, { Fragment, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { type ChatStatus, type UIMessage } from "ai";
import { Loader2 } from "lucide-react";

import { api } from "@/trpc/react";
import { parseEvaluationData, cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { getInitials, resolveUserAvatarImage } from "@/lib/avatar";
import { type InterviewSession } from "@/server/db/schema";
import { useChatContext } from "@/contexts/chat-context";

import { MultimodalInput } from "./multimodal-input";
import ResultsModal from "./result-modal";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "../ai-elements/conversation";
import { Message, MessageContent } from "../ai-elements/message";
import { Response } from "../ai-elements/response";
import Logo from "../layout/header/logo";

/** Strip interview markers and XML evaluation tags from display text. */
function cleanMessageForDisplay(text: string): string {
  return text
    .replace(/\[INTERVIEW_ENDED\]/g, "")
    .replace(/<EVALUATION_DATA>[\s\S]*?<\/EVALUATION_DATA>/gi, "")
    .replace(/<\/?[A-Z_]+>/g, "")
    .trim();
}

/** Extract the full text content from a message's parts. */
function extractTextFromParts(parts: UIMessage["parts"]): string {
  return parts
    .filter(
      (p): p is Extract<UIMessage["parts"][number], { type: "text" }> =>
        p.type === "text",
    )
    .map((p) => p.text)
    .join("\n");
}

// ---------------------------------------------------------------------------
// ChatSection
// ---------------------------------------------------------------------------

export function ChatSection({ data }: { data: InterviewSession }) {
  const [isInterviewEnded, setIsInterviewEnded] = useState(false);
  const [hasResultsSaved, setHasResultsSaved] = useState(false);
  const isSavingRef = useRef(false);
  const hasBootstrappedChatRef = useRef(false);

  const { data: userData } = authClient.useSession();
  const utils = api.useUtils();
  const { openResultModal, openErrorModal } = useChatContext();

  // ---- Queries & mutations ----

  const { data: oldMessages } = api.message.getMessages.useQuery(
    { interviewSessionId: data.id },
    { refetchInterval: 0 },
  );

  const saveResultMutation = api.interview.saveInterviewResult.useMutation();

  const {
    data: existingResult,
    isLoading: isLoadingResult,
    refetch: refetchResult,
  } = api.interview.getInterviewResult.useQuery({
    interviewSessionId: data.id,
  });

  // ---- Chat hook (handles error inline via onError) ----

  const { messages, sendMessage, status, setMessages } = useChat({
    id: data.id,
    onError(error) {
      openErrorModal(error.message || "An error occurred during the chat");
    },
  });

  // ---- Effect 1: Hydrate messages from DB on mount ----

  useEffect(() => {
    if (!oldMessages || hasBootstrappedChatRef.current) return;

    hasBootstrappedChatRef.current = true;

    if (oldMessages.length === 0) {
      void sendMessage({
        role: "system",
        parts: [{ type: "text", text: "__INTERVIEW_INIT__" }],
      });
      return;
    }

    const restored: UIMessage[] = oldMessages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      parts: msg.parts as UIMessage["parts"],
      metadata: msg.metadata,
    }));
    setMessages(restored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oldMessages]);

  // ---- Effect 2: Detect interview end + save results ----

  useEffect(() => {
    // Sync from existing DB result
    if (existingResult && !hasResultsSaved) {
      setHasResultsSaved(true);
      setIsInterviewEnded(true);
      return;
    }

    if (
      messages.length === 0 ||
      hasResultsSaved ||
      isSavingRef.current ||
      existingResult
    ) {
      return;
    }

    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (!lastAssistant) return;

    const fullText = extractTextFromParts(lastAssistant.parts);
    if (!fullText.includes("[INTERVIEW_ENDED]")) return;

    setIsInterviewEnded(true);

    const evaluationData = parseEvaluationData(fullText);
    if (!evaluationData) return;

    isSavingRef.current = true;

    saveResultMutation
      .mutateAsync({ interviewSessionId: data.id, ...evaluationData })
      .then(() => {
        setHasResultsSaved(true);
        isSavingRef.current = false;
        void utils.interview.getInterviewHistory.invalidate();
        void refetchResult();
      })
      .catch((err) => {
        console.error("Failed to save interview results:", err);
        isSavingRef.current = false;
        openErrorModal(
          err instanceof Error
            ? err.message
            : "Failed to save interview results",
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, data.id, hasResultsSaved, existingResult]);

  // ---- Handlers ----

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage({
        role: "user",
        parts: [{ type: "text", text: message }],
      });
    } catch (err) {
      openErrorModal(
        err instanceof Error ? err.message : "Failed to send message",
      );
    }
  };

  // ---- Derived state ----

  const showResultButton =
    hasResultsSaved ||
    !!existingResult ||
    isLoadingResult ||
    saveResultMutation.isPending;

  const resultButtonDisabled =
    isLoadingResult || saveResultMutation.isPending || !existingResult;

  // ---- Render ----

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-4">
      <ChatBox
        messages={messages}
        status={status}
        userName={userData?.user?.name ?? null}
        userImage={userData?.user?.image ?? null}
      />

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
          {showResultButton && (
            <Button
              onClick={() => existingResult && openResultModal(existingResult)}
              className="w-full"
              size="lg"
              disabled={resultButtonDisabled}
            >
              {resultButtonDisabled ? (
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
  status,
  userName,
  userImage,
}: {
  messages: UIMessage[];
  status: ChatStatus;
  userName: string | null;
  userImage: string | null;
}) => {
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

  const isActive = status === "streaming" || status === "submitted";
  const lastAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")?.id;

  return (
    <div
      style={{
        scrollbarWidth: "none",
      }}
      className="bg-background max-h-screen flex-1 space-y-4 overflow-y-auto rounded-(--radius) border-1 p-4"
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
                              <Avatar
                                className={cn(
                                  "text-primary hidden size-8 shrink-0 lg:block",
                                  {
                                    "animate-[spin_2s_linear_infinite]":
                                      isActive &&
                                      message.id === lastAssistantId &&
                                      !isWaitingForResponse,
                                  },
                                )}
                              >
                                <Logo />
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
                                  src={resolveUserAvatarImage(
                                    userName,
                                    userImage,
                                  )}
                                  alt="User"
                                />
                                <AvatarFallback>
                                  {getInitials(userName)}
                                </AvatarFallback>
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
                <Avatar className="text-primary hidden size-8 shrink-0 animate-[spin_2s_linear_infinite] lg:block">
                  <Logo />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <MessageContent className="max-w-fit pr-6">
                  <div className="text-muted-foreground flex items-start gap-2">
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
