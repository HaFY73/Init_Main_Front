const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'initmainback-production.up.railway.app',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
                port: '',
                pathname: '/**',
            }
        ],
        // 도메인 기반 설정 (fallback)
        domains: [
            'res.cloudinary.com',
            'initmainback-production.up.railway.app',
            'ui-avatars.com'
        ]
    },
}

export default nextConfig
