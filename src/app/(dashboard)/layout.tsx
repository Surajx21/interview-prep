import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="p-8">{children}</main>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export default Layout;
