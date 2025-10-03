"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface ChatContextType {
  isInterviewSetupModalOpen: boolean;
  openInterviewSetupModal: () => void;
  closeInterviewSetupModal: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [isInterviewSetupModalOpen, setIsInterviewSetupModalOpen] =
    useState(false);

  const openInterviewSetupModal = useCallback(() => {
    setIsInterviewSetupModalOpen(true);
  }, []);

  const closeInterviewSetupModal = useCallback(() => {
    setIsInterviewSetupModalOpen(false);
  }, []);

  const value: ChatContextType = {
    isInterviewSetupModalOpen,
    openInterviewSetupModal,
    closeInterviewSetupModal,
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
