import Header from "@/components/layout/header";
import React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { InterviewSetupModal } from "@/components/chat/interview-setup-modal";
import ErrorModal from "@/components/chat/error-modal";
import { ChatProvider } from "@/contexts/chat-context";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ChatProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <div className="h-[calc(100svh-4.5rem)] overflow-y-auto px-4 pt-4 pb-3 lg:px-8">
              {children}
            </div>
          </SidebarInset>
          <InterviewSetupModal />
        </SidebarProvider>
        <ErrorModal />
      </ChatProvider>
    </>
  );
}

export default Layout;
