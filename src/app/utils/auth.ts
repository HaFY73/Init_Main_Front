// utils/auth.ts
"use client"

/**
 * 로그인 상태를 확인하는 유틸리티 함수
 */
export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false

    const userId = localStorage.getItem('userId')
    const userName = localStorage.getItem('userName')

    return !!(userId && userName)
}

/**
 * 현재 사용자 정보를 가져오는 함수
 */
export const getCurrentUser = () => {
    if (typeof window === 'undefined') return null

    const userId = localStorage.getItem('userId')
    const userName = localStorage.getItem('userName')

    if (!userId || !userName) return null

    return {
        userId,
        name: userName
    }
}

/**
 * 쿠키 설정 함수
 */
export const setCookie = (name: string, value: string, days: number = 7) => {
    if (typeof window === 'undefined') return

    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

/**
 * 쿠키 가져오기 함수
 */
export const getCookie = (name: string): string | null => {
    if (typeof window === 'undefined') return null

    const nameEQ = name + "="
    const ca = document.cookie.split(';')

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') c = c.substring(1, c.length)
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
}

/**
 * 쿠키 삭제 함수
 */
export const deleteCookie = (name: string) => {
    if (typeof window === 'undefined') return

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

/**
 * 로그아웃 함수
 */
export const logout = () => {
    if (typeof window === 'undefined') return

    // localStorage 클리어
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')

    // 쿠키 클리어
    deleteCookie('userId')
    deleteCookie('userName')

    // 페이지 새로고침하여 상태 초기화
    window.location.href = '/login'
}

/**
 * 로그인 처리 함수
 */
export const saveUserSession = (userData: { id: string | number, name: string }) => {
    if (typeof window === 'undefined') return

    const userId = userData.id.toString()

    // localStorage에 저장
    localStorage.setItem('userId', userId)
    localStorage.setItem('userName', userData.name)

    // 쿠키에 저장
    setCookie('userId', userId)
    setCookie('userName', userData.name)
}