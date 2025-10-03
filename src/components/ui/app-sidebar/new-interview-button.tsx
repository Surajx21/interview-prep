"use client";

import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { PlusIcon } from "lucide-react";
import { Button } from "../button";
import { useChatContext } from "@/contexts/chat-context";

function NewInterviewButton() {
  const { openInterviewSetupModal } = useChatContext();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button onClick={openInterviewSetupModal}>
          <PlusIcon />
          <span className="ml-2">New Interview</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>Start a new Interview</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default NewInterviewButton;
