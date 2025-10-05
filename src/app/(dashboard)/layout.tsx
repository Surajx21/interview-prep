import Header from "@/components/layout/header";
import React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { InterviewSetupModal } from "@/components/chat/interview-setup-modal";
import { ChatProvider } from "@/contexts/chat-context";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ChatProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <div className="px-4 lg:px-8 pt-4 pb-3 h-[calc(100svh-4.5rem)] overflow-y-auto">{children}</div>
          </SidebarInset>
        </SidebarProvider>

        <InterviewSetupModal />
      </ChatProvider>
    </>
  );
}

export default Layout;
