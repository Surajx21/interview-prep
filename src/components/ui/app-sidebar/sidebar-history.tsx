"use client";
import type { InterviewSession } from "@/server/db/schema";
import { api } from "@/trpc/react";
import Link from "next/link";
import { Skeleton } from "../skeleton";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Route } from "next";
import { useSidebar } from "../sidebar";

function SidebarHistory() {
  const { data: history, isLoading } =
    api.interview.getInterviewHistory.useQuery();

  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const currentPath = pathname.split("/").pop();
  if (isLoading)
    return (
      <>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-25 w-full rounded-md" />
        ))}
      </>
    );

  if (!history || history.length === 0)
    return (
      <div className="text-center text-sm">
        Start an interview to see history here.
      </div>
    );

  return (
    <div className="space-y-2">
      {history.map((item) => (
        <ChatBoxItem
          key={item.id}
          {...item}
          currentPath={currentPath}
          toggleSidebar={toggleSidebar}
        />
      ))}
    </div>
  );
}

const ChatBoxItem = ({
  id,
  difficulty,
  language,
  type,
  startedAt,
  isCompleted,
  currentPath,
  toggleSidebar,
}: InterviewSession & {
  currentPath: string | undefined;
  toggleSidebar: () => void;
}) => {
  return (
    <Link
      href={`/chat/${id}` as Route}
      className="inline-block w-full"
      onClick={toggleSidebar}
    >
      <div
        className={cn(
          "bg-card/80 text-accent-foreground hover:border-primary/70 hover:bg-card flex cursor-pointer flex-col gap-3 rounded-md border-1 p-4 transition-all duration-100",

          currentPath === id ? "border-primary bg-card" : "",
        )}
      >
        {/* Content */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* Title */}
          <div className="w-full space-y-1">
            <div className="truncate text-sm font-medium">
              {type.charAt(0).toUpperCase() + type.slice(1)} Interview
            </div>
            <div className="text-muted-foreground text-xs">
              {difficulty} - {language}
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <Calendar className="size-3" />
            {new Date(startedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div>
            {isCompleted ? (
              <div className="bg-secondary text-foreground flex items-center gap-1 rounded-lg px-2 py-1 text-xs">
                <CheckCircle className="size-3" />
                Completed
              </div>
            ) : (
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Clock className="size-3" /> In Progress
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SidebarHistory;
