import Logo from "@/components/layout/header/logo";
import React from "react";

function Page() {
  return (
    <div className="bg-background flex h-[calc(100vh-4rem)] flex-1 items-center justify-center">
      <div className="max-w-md space-y-6 text-center">
        <div className="bg-primary/10 text-primary mx-auto flex h-20 w-20 items-center justify-center rounded-full">
          <Logo />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-balance">
            Welcome to AI Interview Prep
          </h2>
          <p className="text-muted-foreground leading-relaxed text-balance">
            Select an existing session from the sidebar or start a new interview
            to begin practicing your skills.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Page;
