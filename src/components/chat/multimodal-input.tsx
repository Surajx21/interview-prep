"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { useState, useRef, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

interface MultimodalInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  buttonDisabled?: boolean;
}

export function MultimodalInput({
  onSendMessage,
  buttonDisabled,
  placeholder = "Type your message...",
}: MultimodalInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    const value = input.trim();
    if (!value || buttonDisabled) return;
    onSendMessage(value);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 140) + "px";
  };

  const hasText = input.trim().length > 0;

  return (
    <div className="group border-border bg-card relative rounded-2xl border transition-shadow">
      {/* Subtle top border accent on focus */}
      <div className="relative flex items-end gap-2 p-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="placeholder:text-muted-foreground  max-h-[140px] min-h-[52px] w-full resize-none overflow-y-auto rounded-xl px-4 py-3 pr-12 text-sm transition-colors outline-none ring-0"
            aria-label="Message input"
          />
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={!hasText || buttonDisabled}
          aria-label="Send message"
          className={`absolute z-10 right-3 bottom-3 h-10 w-10 rounded-full p-0 transition-transform duration-150 ${hasText ? "bg-primary text-primary-foreground hover:scale-105 active:scale-95" : "bg-muted text-muted-foreground"} `}
        >
          <ArrowUp className="size-5 stroke-3" />
        </Button>
      </div>

      {/* Helper row: hint + subtle divider */}
      <div className="border-border text-muted-foreground flex items-center justify-between border-t px-3 py-2 text-xs">
        <span className="hidden sm:inline">
          Press Enter to send • Shift + Enter for newline
        </span>
        <span className="sm:hidden">Enter to send</span>
      </div>
    </div>
  );
}
