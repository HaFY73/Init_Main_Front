"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// AdminDashboard 컴포넌트를 동적으로 로드
const AdminDashboard = dynamic(() => import('@/components/AdminDashboard'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">관리자 대시보드 로딩 중...</h2>
                <p className="text-gray-500">잠시만 기다려 주세요.</p>
            </div>
        </div>
    )
})

// 쿠키 읽기 헬퍼 함수
const getCookie = (name: string): string | null => {
    if (typeof window === 'undefined') return null

    try {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || null
        }
        return null
    } catch {
        return null
    }
}

export default function Page() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        const checkAdminAuth = () => {
            try {
                const userRole = localStorage.getItem('userRole') || getCookie('userRole')
                const userId = localStorage.getItem('userId') || getCookie('userId')
                const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken')

                console.log('🔍 Admin auth check:', { userRole, hasUserId: !!userId, hasToken: !!token })

                if (!userId || !token) {
                    console.log('❌ No auth info - redirecting to login')
                    router.replace('/login?reason=admin_required')
                    return
                }

                if (userRole !== 'ADMIN') {
                    console.log('❌ Not admin role - redirecting to dashboard')
                    router.replace('/dashboard?reason=insufficient_permission')
                    return
                }

                console.log('✅ Admin authorization successful')
                setIsAuthorized(true)
            } catch (authError) {
                console.error('❌ Admin auth check error:', authError)
                router.replace('/login?reason=auth_error')
            } finally {
                setIsLoading(false)
            }
        }

        checkAdminAuth()
    }, [router])

    // 로딩 중
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">관리자 권한 확인 중...</h2>
                    <p className="text-gray-500">잠시만 기다려 주세요.</p>
                </div>
            </div>
        )
    }

    // 권한 없음
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-4">
                        <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">접근 권한이 없습니다</h2>
                    <p className="text-gray-500 mb-6">관리자 권한이 필요한 페이지입니다.</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        로그인 페이지로 이동
                    </button>
                </div>
            </div>
        )
    }

    // 관리자 대시보드 렌더링
    return <AdminDashboard />
}