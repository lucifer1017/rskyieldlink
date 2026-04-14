"use client";

import type { DepositFlowStatus } from "../hooks/useYieldDeposit";

interface StepDef {
  label: string;
  sublabel: string;
}

const STEPS: StepDef[] = [
  { label: "Quote",     sublabel: "Generate BTC address" },
  { label: "Send BTC",  sublabel: "Send to deposit address" },
  { label: "Bridging",  sublabel: "Flyover delivers rBTC" },
  { label: "Depositing",sublabel: "Into yield protocol" },
  { label: "Done",      sublabel: "Earning yield!" },
];

/** Maps the flow status to the index of the active step (0-based). */
function statusToStep(status: DepositFlowStatus): number {
  switch (status) {
    case "idle":
    case "creating-quote":
      return 0;
    case "waiting-for-btc":
      return 1;
    case "peg-in-complete":
      return 2;
    case "deposit-pending":
      return 3;
    case "complete":
      return 4;
    case "failed":
      return 2;
    case "error":
      return 3;
    default:
      return 0;
  }
}

export interface StatusStepperProps {
  status: DepositFlowStatus;
}

export function StatusStepper({ status }: StatusStepperProps) {
  const isError = status === "error" || status === "failed";
  const currentStep = statusToStep(status);

  return (
    <div aria-label="Deposit progress" className="w-full">
      <ol className="flex items-start">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;
          const isPending = idx > currentStep;

          const circleClass = isError && idx === currentStep
            ? "bg-red-500 text-white ring-2 ring-red-200"
            : isDone
            ? "bg-green-500 text-white"
            : isActive
            ? "bg-amber-500 text-white ring-2 ring-amber-200 dark:ring-amber-800"
            : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400";

          const labelClass = isDone
            ? "text-green-600 dark:text-green-400"
            : isActive
            ? "text-amber-600 dark:text-amber-400 font-semibold"
            : isPending
            ? "text-zinc-400 dark:text-zinc-500"
            : "text-red-600";

          const lineClass = isDone
            ? "bg-green-500"
            : "bg-zinc-200 dark:bg-zinc-700";

          return (
            <li
              key={step.label}
              aria-current={isActive ? "step" : undefined}
              className="relative flex flex-1 flex-col items-center"
            >
              {/* Connector line (not on first item) */}
              {idx > 0 && (
                <div
                  aria-hidden="true"
                  className={`absolute left-0 right-1/2 top-3 h-0.5 ${lineClass}`}
                />
              )}
              {/* Circle */}
              <div
                className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${circleClass}`}
              >
                {isDone ? "✓" : isError && isActive ? "✗" : idx + 1}
              </div>
              {/* Labels */}
              <p className={`mt-1.5 text-center text-xs leading-tight ${labelClass}`}>
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>

      {isError && (
        <p role="alert" className="mt-2 text-center text-xs text-red-600 dark:text-red-400">
          {status === "failed" ? "Peg-in failed or expired." : "An error occurred."}
        </p>
      )}
    </div>
  );
}
