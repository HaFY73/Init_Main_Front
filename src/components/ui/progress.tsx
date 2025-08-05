"use client"

import React from 'react'

// cn 유틸리티 함수 (실제 프로젝트에서는 @/lib/utils에서 import)
const cn = (...inputs: (string | undefined | null | boolean)[]) => {
    return inputs.filter(Boolean).join(' ')
}

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number
    max?: number
    indicatorClassName?: string
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
        // value를 0-100 범위로 정규화
        const normalizedValue = Math.min(Math.max(value, 0), max)
        const percentage = (normalizedValue / max) * 100

        return (
            <div
                ref={ref}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={max}
                aria-valuenow={normalizedValue}
                aria-label={`Progress: ${percentage.toFixed(0)}%`}
                className={cn(
                    'relative h-2 w-full overflow-hidden rounded-full bg-gray-200',
                    className
                )}
                {...props}
            >
                <div
                    className={cn(
                        'h-full bg-blue-600 transition-all duration-500 ease-out',
                        percentage >= 100 && 'bg-green-600',
                        indicatorClassName
                    )}
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>
        )
    }
)

Progress.displayName = "Progress"