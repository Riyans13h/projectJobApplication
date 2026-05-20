import { Badge } from "@/components/ui/badge";
import type { HelpScore } from "@/types/contact";
import { cn } from "@/utils/cn";

const values: Record<HelpScore, number> = {
  ZERO: 0,
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  SIX: 6,
  SEVEN: 7,
  EIGHT: 8,
  NINE: 9,
  TEN: 10,
};

export function HelpScoreBadge({ helpScore }: { helpScore?: HelpScore }) {
  if (!helpScore) {
    return <Badge className="border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">No score</Badge>;
  }

  const value = values[helpScore];
  const tone =
    value >= 8
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
      : value >= 5
        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
        : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300";

  return <Badge className={cn("border", tone)}>Help {value}/10</Badge>;
}
