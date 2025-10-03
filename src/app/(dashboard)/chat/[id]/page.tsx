import { ChatSection } from "@/components/chat/chat-section";
import React from "react";

async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ChatSection id={id} />;
}

export default ChatPage;
