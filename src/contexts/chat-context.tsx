"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { InterviewResult } from "@/server/db/schema";

interface ChatContextType {
  isInterviewSetupModalOpen: boolean;
  openInterviewSetupModal: () => void;
  closeInterviewSetupModal: () => void;
  isResultModalOpen: boolean;
  resultData: InterviewResult | null;
  openResultModal: (result: InterviewResult) => void;
  closeResultModal: () => void;
  isErrorModalOpen: boolean;
  errorMessage: string | null;
  openErrorModal: (message: string) => void;
  closeErrorModal: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [isInterviewSetupModalOpen, setIsInterviewSetupModalOpen] =
    useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [resultData, setResultData] = useState<InterviewResult | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openInterviewSetupModal = useCallback(() => {
    setIsInterviewSetupModalOpen(true);
  }, []);

  const closeInterviewSetupModal = useCallback(() => {
    setIsInterviewSetupModalOpen(false);
  }, []);

  const openResultModal = useCallback((result: InterviewResult) => {
    setResultData(result);
    setIsResultModalOpen(true);
  }, []);

  const closeResultModal = useCallback(() => {
    setIsResultModalOpen(false);
    setResultData(null);
  }, []);

  const openErrorModal = useCallback((message: string) => {
    setErrorMessage(message);
    setIsErrorModalOpen(true);
  }, []);

  const closeErrorModal = useCallback(() => {
    setIsErrorModalOpen(false);
    setErrorMessage(null);
  }, []);

  const value: ChatContextType = {
    isInterviewSetupModalOpen,
    openInterviewSetupModal,
    closeInterviewSetupModal,
    isResultModalOpen,
    resultData,
    openResultModal,
    closeResultModal,
    isErrorModalOpen,
    errorMessage,
    openErrorModal,
    closeErrorModal,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
