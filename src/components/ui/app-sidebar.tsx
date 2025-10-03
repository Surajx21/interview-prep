import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { PlusIcon } from "lucide-react";
import Logo from "../layout/header/logo";

export function AppSidebar() {
  return (
    <Sidebar className="group-data-[side=left]:border-r-1">
      <SidebarHeader className="p-0">
        <SidebarMenu className="flex h-16 justify-center border-b p-0 pl-4">
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button>
                <PlusIcon />
                <span className="ml-2">New Interview</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Start a new Interview</p>
            </TooltipContent>
          </Tooltip>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>{/* <SidebarHistory user={user} /> */}</SidebarContent>
      <SidebarFooter>
        <div className="border-t p-4">
          <div className="text-center">
            <p className="text-xs font-medium text-gray-400">
              Practice makes perfect
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Keep improving your skills
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
