import React from "react";

async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>ChatPage {id}</div>;
}

export default ChatPage;
