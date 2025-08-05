'use client';
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function JobCalendarPage() {
    const { isAuthenticated, isLoading, userId } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login?redirect=/job-calendar')
            } else if (userId) {
                // 사용자 ID로 리다이렉트
                router.push(`/job-calendar/${userId}`)
            }
        }
    }, [isAuthenticated, isLoading, userId, router])

    // 로딩 화면
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {isLoading ? '인증 확인 중...' : '페이지 이동 중...'}
                </p>
            </div>
        </div>
    )
}