"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  backgroundColor?: string;
  progressColor?: string;
  progressGradient?: string;
}

function Progress({
  className,
  value,
  backgroundColor,
  progressColor,
  progressGradient,
  ...props
}: ProgressProps) {
  const progressStyle = progressGradient 
    ? { background: progressGradient }
    : { backgroundColor: progressColor };

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      style={{ backgroundColor }}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 transition-all"
        style={{ 
          ...progressStyle,
          transform: `translateX(-${100 - (value || 0)}%)` 
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
