import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, ArrowLeft} from "lucide-react";

interface ErrorStateProps {
  title: string;
  description: string;
  message: string;
  showNewInterviewButton?: boolean;
}

export function ErrorState({ title, description, message }: ErrorStateProps) {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="text-destructive h-5 w-5" />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">{message}</p>
          <div className="flex justify-end gap-2">
            <Button asChild variant="default">
              <Link href="/">
                <ArrowLeft className=" h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
