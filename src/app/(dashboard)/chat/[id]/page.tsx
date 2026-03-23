import { ChatSection } from "@/components/chat/chat-section";
import { api } from "@/trpc/server";
import { isValidUUID } from "@/lib/utils";
import { ErrorState } from "@/components/ui/error-state";

async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Validate UUID format
  if (!isValidUUID(id)) {
    return (
      <ErrorState
        title="Invalid Interview ID"
        description="The interview session ID you provided is not valid."
        message="This could happen if the URL was mistyped or the link is broken."
      />
    );
  }

  const data = await api.interview.getInterviewSession({ id });

  if (!data) {
    return (
      <ErrorState
        title="Interview Not Found"
        description="We couldn't find the interview session you're looking for."
        message="This interview may have been deleted or you may not have permission to access it."
      />
    );
  }

  return <ChatSection data={data} />;
}

export default ChatPage;
