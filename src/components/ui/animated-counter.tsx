"use client"

import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

interface AnimatedCounterProps {
    end: number
    label: string
    duration?: number
    delay?: number
}

export const AnimatedCounter = ({ end, label, duration = 1.5, delay = 0 }: AnimatedCounterProps) => {
    const nodeRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const node = nodeRef.current
        if (!node) return

        const controls = animate(0, end, {
            duration,
            delay,
            ease: "easeOut",
            onUpdate(value) {
                node.textContent = Math.round(value).toString()
            }
        })

        return () => controls.stop()
    }, [end, duration, delay])

    return (
        <div className="text-center">
            <div ref={nodeRef} className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                0
            </div>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
        </div>
    )
}