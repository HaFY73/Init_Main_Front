import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 인증이 필요한 경로들 (GlobalSidebar의 메뉴와 일치)
const protectedPaths = [
    '/dashboard',
    '/profile',
    '/resume',
    '/introduce',
    '/spec-management', // 🔥 스펙 관리 경로 추가
    '/job-calendar',
    '/community',
    '/statistics',
    '/settings'
]

// 인증된 사용자가 접근하면 안 되는 경로들 (로그인, 회원가입 등)
const authPaths = [
    '/login',
    '/signup'
]

// 완전히 공개된 경로들 (인증 체크 없이 접근 가능)
const publicPaths = [
    '/',
    '/about',
    '/contact',
    '/terms',
    '/privacy'
]

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 🔥 모든 쿠키 확인
    const userIdFromCookie = request.cookies.get('userId')?.value
    const userNameFromCookie = request.cookies.get('userName')?.value
    const userIdFromHeader = request.headers.get('x-user-id')

    // 🔥 디버깅 로그 - 모든 요청에 대해 출력
    console.log('🛡️ === MIDDLEWARE DEBUG START ===');
    console.log('📍 Path:', pathname);
    console.log('🍪 Cookies found:', {
        userId: userIdFromCookie ? `***${userIdFromCookie.slice(-3)}` : 'NONE',
        userName: userNameFromCookie ? userNameFromCookie : 'NONE'
    });
    console.log('🔗 Header x-user-id:', userIdFromHeader ? `***${userIdFromHeader.slice(-3)}` : 'NONE');

    const isAuthenticated = userIdFromCookie || userIdFromHeader
    console.log('🔐 Is Authenticated:', !!isAuthenticated);

    // 🔥 경로 매칭 확인
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
    const isAuthPath = authPaths.some(path => pathname.startsWith(path))
    const isPublicPath = publicPaths.some(path => pathname === path)

    console.log('🗺️ Route matching:', {
        isProtectedPath,
        isAuthPath,
        isPublicPath
    });

    // 🔥 공개 경로는 바로 통과
    if (isPublicPath) {
        console.log('✅ Public path - allowing access');
        console.log('🛡️ === MIDDLEWARE DEBUG END ===\n');
        return NextResponse.next()
    }

    // 🔥 보호된 경로에 접근 시 인증 체크
    if (isProtectedPath) {
        console.log('🚨 Protected path detected!');
        if (!isAuthenticated) {
            console.log('❌ NO AUTHENTICATION - REDIRECTING TO LOGIN');
            console.log('🛡️ === MIDDLEWARE DEBUG END ===\n');

            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            loginUrl.searchParams.set('reason', 'auth_required')

            const response = NextResponse.redirect(loginUrl)

            // 🔥 캐시 방지 헤더 강화
            response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
            response.headers.set('Pragma', 'no-cache')
            response.headers.set('Expires', '0')

            return response
        }

        console.log('✅ AUTHENTICATED - ALLOWING ACCESS');
    }

    // 🔥 인증된 사용자가 로그인/회원가입 페이지에 접근 시
    if (isAuthPath) {
        console.log('🔄 Auth page detected');
        if (isAuthenticated) {
            console.log('🔄 AUTHENTICATED USER - REDIRECTING TO DASHBOARD');
            console.log('🛡️ === MIDDLEWARE DEBUG END ===\n');

            const dashboardUrl = new URL('/dashboard', request.url)
            return NextResponse.redirect(dashboardUrl)
        }
        console.log('⚪ Not authenticated - allowing access to auth page');
    }

    console.log('⚪ Default - allowing access');
    console.log('🛡️ === MIDDLEWARE DEBUG END ===\n');

    // 🔥 API 요청에 userId 헤더 자동 추가
    if (pathname.startsWith('/api/') && isAuthenticated && !userIdFromHeader) {
        const requestHeaders = new Headers(request.headers)
        if (userIdFromCookie) {
            requestHeaders.set('x-user-id', userIdFromCookie)
        }

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    }

    // 🔥 보안 헤더 설정 (모든 응답에)
    const response = NextResponse.next()

    // CSP, XSS 방지 등 보안 헤더
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // 인증된 사용자의 페이지는 캐시하지 않음
    if (isAuthenticated && isProtectedPath) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - 이미지 파일들 (.svg, .png, .jpg, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|public|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$|.*\\.ico$).*)',
    ],
}