"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer,
  PolarAngleAxis,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import type { InterviewResult } from "@/server/db/schema";
import { useChatContext } from "@/contexts/chat-context";
import { Button } from "../ui/button";

const clamp100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const NO_SCORE_PREFIX =
  "No score awarded: the candidate did not provide any substantive answer.";

function isNoScoreResult(result: InterviewResult): boolean {
  return result.performanceSummary.startsWith(NO_SCORE_PREFIX);
}

function VerdictBadge({ verdict }: { verdict: InterviewResult["verdict"] }) {
  // Map verdicts to badge variants using theme tokens (no hard-coded colors)
  const variant: "default" | "secondary" | "destructive" | "outline" =
    verdict === "needs_improvement"
      ? "destructive"
      : verdict === "average"
        ? "outline"
        : verdict === "good"
          ? "secondary"
          : "default";

  // Format display text
  const displayText =
    verdict === "needs_improvement"
      ? "Needs Improvement"
      : verdict.charAt(0).toUpperCase() + verdict.slice(1);

  return <Badge variant={variant}>{displayText}</Badge>;
}

function MetricList({ result }: { result: InterviewResult }) {
  const items: Array<{ key: string; label: string; value: number }> = [
    {
      key: "accuracyScore",
      label: "Accuracy Score",
      value: clamp100(result.accuracyScore),
    },
    {
      key: "communicationScore",
      label: "Communication Score",
      value: clamp100(result.communicationScore),
    },
    {
      key: "problemSolvingScore",
      label: "Problem-Solving Score",
      value: clamp100(result.problemSolvingScore),
    },
    {
      key: "consistencyScore",
      label: "Consistency Score",
      value: clamp100(result.consistencyScore),
    },
  ];

  return (
    <div className="space-y-5">
      {items.map((it) => (
        <div key={it.key} className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-foreground text-sm font-medium">
              {it.label}
            </span>
            <span className="text-base font-semibold tabular-nums">
              {it.value}
            </span>
          </div>
          <Progress value={it.value} aria-label={`${it.label} score`} />
        </div>
      ))}
    </div>
  );
}

function OverallGauge({ overallScore }: { overallScore: number }) {
  const value = clamp100(overallScore);
  const gaugeData = [
    {
      name: "score",
      value,
      fill: "hsl(var(--primary))",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Overall Score</CardTitle>
        <CardDescription className="text-sm">
          Aggregate performance out of 100
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center pb-8">
        <div className="relative h-[200px] w-[200px]">
          <ChartContainer
            config={{
              score: { label: "Overall", color: "hsl(var(--primary))" },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={gaugeData}
                innerRadius="70%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                barSize={24}

              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background={{ fill: "hsl(var(--muted))" }}
                  dataKey="value"
                  cornerRadius={10}
                  fill="var(--color-score)"
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-foreground text-5xl font-bold tracking-tight tabular-nums">
                {value}
              </div>
              <div className="text-muted-foreground mt-1 text-sm font-medium">
                out of 100
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultSection({ result }: { result: InterviewResult }) {
  const noScoreResult = isNoScoreResult(result);

  return (
    <div className="space-y-6">
      <VerdictBadge verdict={result.verdict} />

      <div className="space-y-6">
        {!noScoreResult ? (
          <div className="space-y-6">
            <OverallGauge overallScore={result.overallScore} />

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">
                  Detailed Scores
                </CardTitle>
                <CardDescription className="text-sm">
                  Breakdown by dimension
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MetricList result={result} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">
                Evaluation Status
              </CardTitle>
              <CardDescription className="text-sm">
                No performance score was issued for this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-7 text-pretty">
                The session ended without any substantive answer from the
                candidate, so no performance score was awarded.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">
              Performance Summary
            </CardTitle>
            <CardDescription className="text-sm">
              Strengths and areas for improvement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-7 text-pretty">
              {result.performanceSummary}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ResultsModal() {
  const { closeResultModal, isResultModalOpen, resultData } = useChatContext();

  if (!isResultModalOpen) {
    return null;
  }

  return (
    <Dialog open={isResultModalOpen} onOpenChange={closeResultModal}>
      <DialogContent className="max-h-[85vh] w-[90vw] max-w-5xl overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Interview Results
          </DialogTitle>
          <DialogDescription className="text-base">
            Review your interview performance breakdown
          </DialogDescription>
        </DialogHeader>
        {resultData ? (
          <ResultSection result={resultData} />
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No results available yet.</p>
          </div>
        )}

        <DialogFooter>
          <Button onClick={closeResultModal}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ResultsModal;
