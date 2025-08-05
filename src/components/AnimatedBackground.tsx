"use client"
import { motion } from "framer-motion"

export default function AnimatedBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* 격자 패턴 */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(53,106,228,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(53,106,228,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

            {/* 떠다니는 기하학적 요소들 */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        rotate: [0, 180, 360],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: Math.random() * 5,
                    }}
                >
                    {i % 3 === 0 && (
                        <div className="w-4 h-4 bg-gradient-to-br from-[#356ae4]/30 to-purple-500/30 rounded-full" />
                    )}
                    {i % 3 === 1 && <div className="w-6 h-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rotate-45" />}
                    {i % 3 === 2 && (
                        <div className="w-3 h-8 bg-gradient-to-b from-[#356ae4]/25 to-indigo-500/25 rounded-full" />
                    )}
                </motion.div>
            ))}
        </div>
    )
}