import { ChatSection } from "@/components/chat/chat-section";
import { api } from "@/trpc/server";
import { isValidUUID } from "@/lib/utils";
import { ErrorState } from "@/components/ui/error-state";
import { type Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isValidUUID(id)) {
    return { title: "Invalid Interview" };
  }
  const data = await api.interview
    .getInterviewSession({ id })
    .catch(() => null);
  if (!data) {
    return { title: "Interview Not Found" };
  }
  return {
    title: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Interview – ${data.difficulty}`,
  };
}

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

  const data = await api.interview
    .getInterviewSession({ id })
    .catch(() => null);

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
