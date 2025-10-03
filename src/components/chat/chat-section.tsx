"use client";
import { MultimodalInput } from "./multimodal-input";
import React from "react";

export function ChatSection({ id }: { id: string }) {
  const handleSendMessage = (message: string) => {
    // Mock function - replace with actual send logic
    console.log("Sending message:", message, "In chat section:", id);
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-4">
      {/* chat box */}
      <div className="flex-1 bg-red-50"></div>

      {/* input box */}
      <div className="flex-shrink-0">
        <MultimodalInput
          onSendMessage={handleSendMessage}
          buttonDisabled={true}
        />
      </div>
    </div>
  );
}
