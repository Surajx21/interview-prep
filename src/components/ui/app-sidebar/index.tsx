import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import NewInterviewButton from "./new-interview-button";
import SidebarHistory from "./sidebar-history";
import Logo from "@/components/layout/header/logo";

export function AppSidebar() {
  return (
    <Sidebar className="group-data-[side=left]:border-r-1">
      <SidebarHeader className="p-0">
        <SidebarMenu className="flex h-[4.05rem] justify-center border-b p-0 pl-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-primary hover:text-primary/90">
              <Logo />
            </Link>
            <div>
              <h1 className="text-sm font-semibold">AI Interview</h1>
              <p className="text-xs">Practice & Improve</p>
            </div>
          </div>
        </SidebarMenu>
        <SidebarMenu className="flex h-16 justify-center border-b p-4">
          <NewInterviewButton />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarHistory />
      </SidebarContent>
      <SidebarFooter>
        <div className="border-t p-4">
          <div className="text-center">
            <p className="text-xs font-bold">Practice makes perfect</p>
            <p className="mt-1 text-xs">Keep improving your skills</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
