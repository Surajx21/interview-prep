import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
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
            <main className="p-8">{children}</main>
            <Footer />
          </SidebarInset>
        </SidebarProvider>

        <InterviewSetupModal />
      </ChatProvider>
    </>
  );
}

export default Layout;
