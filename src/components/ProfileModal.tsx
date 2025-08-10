"use client"

import {useState, useEffect} from "react"
import {
    Dialog,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import {
    MapPin,
    Building2,
    Users,
    MessageSquare,
    Lock,
    Eye
} from "lucide-react"
import { getAvatarData } from "@/utils/imageUtils"

// 백엔드 ProfileModalDto에 맞춘 인터페이스
interface ProfileModalData {
    id: number
    userId: number
    displayName: string
    bio?: string
    jobTitle?: string
    company?: string
    location?: string
    profileImageUrl?: string
    coverImageUrl?: string  // 배경 이미지/색상
    postsCount?: number
    followersCount?: number
    followingCount?: number
    isFollowing?: boolean
    isMutualFollow?: boolean
    isOwner?: boolean
    allowFollow?: boolean
    isPublic?: boolean
}

interface ProfileModalProps {
    isOpen: boolean
    onClose: () => void
    userId: number | null
}

export default function ProfileModal({isOpen, onClose, userId}: ProfileModalProps) {
    const [profile, setProfile] = useState<ProfileModalData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 현재 사용자 ID 가져오기
    const getCurrentUserId = () => {
        const userId = localStorage.getItem('userId')
        return userId ? parseInt(userId) : null
    }

    // 배경 스타일 결정
    const getBackgroundStyle = (coverImageUrl?: string) => {
        if (coverImageUrl) {
            console.log('🎨 배경 스타일 처리:', coverImageUrl)
            // 색상 코드인지 확인 (#으로 시작하거나 rgb, hsl 등)
            if (coverImageUrl.startsWith('#') ||
                coverImageUrl.startsWith('rgb') ||
                coverImageUrl.startsWith('hsl') ||
                coverImageUrl.startsWith('linear-gradient')) {
                console.log('✅ 색상 코드로 인식:', coverImageUrl)
                return {backgroundColor: coverImageUrl}
            }
            // 이미지 URL인 경우
            else {
                const imageUrl = coverImageUrl.startsWith('http')
                    ? coverImageUrl
                    : `http://localhost:8080${coverImageUrl}`
                console.log('✅ 이미지 URL로 인식:', imageUrl)
                return {
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }
            }
        }
        // 기본 그라데이션
        console.log('🎨 기본 배경 사용')
        return {background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}
    }

    const loadProfile = async (targetUserId: number) => {
        setLoading(true)
        setError(null)

        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken')
            const currentUserId = getCurrentUserId()

            // 백엔드 API 엔드포인트에 맞춘 URL
            const url = new URL(`https://initmainback-production.up.railway.app/api/community/profile/${targetUserId}/modal`)

            if (currentUserId) {
                url.searchParams.append('currentUserId', currentUserId.toString())
            }

            console.log('🔍 프로필 모달 API 호출:', url.toString())

            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            console.log('📥 응답 상태:', response.status, response.statusText)

            if (response.ok) {
                const data: ProfileModalData = await response.json()
                console.log('✅ 프로필 모달 데이터 수신:', data)

                setProfile(data)
            } else if (response.status === 404) {
                setError('프로필을 찾을 수 없습니다.')
            } else if (response.status === 403) {
                setError('비공개 프로필입니다.')
            } else {
                setError('프로필을 불러올 수 없습니다.')
            }
        } catch (err) {
            console.error('❌ 프로필 모달 로딩 에러:', err)
            setError('프로필 로딩 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    // userId 변경시 프로필 로드
    useEffect(() => {
        if (isOpen && userId) {
            loadProfile(userId)
        } else {
            setProfile(null)
            setError(null)
        }
    }, [isOpen, userId])

    if (!isOpen) return null

    const backgroundStyle = profile ? getBackgroundStyle(profile.coverImageUrl) :
        {background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent
              className="sm:max-w-[420px] lg:max-w-[480px] max-h-[85vh] overflow-hidden p-0 bg-transparent border-none shadow-2xl
             fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
             lg:left-[calc(50%+140px)]">
                <DialogTitle className="sr-only"/>
                {/* 커스텀 모달 디자인 */}
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                    <div
                        className="relative h-28 sm:h-32"
                        style={backgroundStyle}
                    >
                        {/* 배경 오버레이 (가독성을 위해) */}
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>

                    {/* 메인 콘텐츠 */}
                    <div className="relative px-4 sm:px-6 pb-4 sm:pb-6 -mt-12 sm:-mt-16">
                        {/* 로딩 중 */}
                        {loading && (
                            <div className="flex justify-center py-16 sm:py-20">
                                <div
                                    className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                            </div>
                        )}

                        {/* 에러 */}
                        {error && (
                            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
                                <div className="bg-white dark:bg-gray-700 rounded-full p-4 shadow-lg mb-4">
                                    <Lock className="h-8 w-8 text-gray-400 dark:text-gray-500"/>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 font-medium">{error}</p>
                            </div>
                        )}

                        {/* 프로필 데이터 */}
                        {profile && !loading && !error && (
                            <div className="space-y-4 sm:space-y-6">
                                {/* 프로필 이미지 & 기본 정보 */}
                                <div className="text-center">
                                    <div className="relative inline-block">
                                        {(() => {
                                            const avatarData = getAvatarData(profile.profileImageUrl, profile.displayName);
                                            return (
                                                <Avatar
                                                    className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white shadow-xl">
                                                    <AvatarImage
                                                        src={avatarData.imageUrl}
                                                        alt={profile.displayName}
                                                        className="object-cover"
                                                    />
                                                    <AvatarFallback
                                                        className="text-xl sm:text-2xl font-semibold bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                                        {avatarData.fallbackChar}
                                                    </AvatarFallback>
                                                </Avatar>
                                            );
                                        })()}
                                        {/* 공개/비공개 배지 */}
                                        <div className="absolute -bottom-1 -right-1">
                                            <Badge
                                                variant={profile.isPublic ? "default" : "secondary"}
                                                className="text-xs px-2 py-1 shadow-md border-2 border-white"
                                            >
                                                {profile.isPublic ? (
                                                    <Eye className="w-3 h-3"/>
                                                ) : (
                                                    <Lock className="w-3 h-3"/>
                                                )}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="mt-3 sm:mt-4 space-y-1">
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.displayName}</h3>
                                        {profile.jobTitle && (
                                            <p className="text-violet-600 dark:text-violet-400 font-medium text-sm sm:text-base">{profile.jobTitle}</p>
                                        )}
                                    </div>
                                </div>

                                {/* 회사 & 위치 정보 */}
                                {(profile.company || profile.location) && (
                                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-sm">
                                        {profile.company && (
                                            <div
                                                className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full transition-colors">
                                                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400"/>
                                                <span
                                                    className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{profile.company}</span>
                                            </div>
                                        )}
                                        {profile.location && (
                                            <div
                                                className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full transition-colors">
                                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400"/>
                                                <span
                                                    className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{profile.location}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 소개글 */}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-gray-600">
                                    {profile.bio ? (
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center whitespace-pre-wrap text-sm sm:text-base">
                                            {profile.bio}
                                        </p>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center italic text-sm sm:text-base">
                                            아직 소개글이 없습니다.
                                        </p>
                                    )}
                                </div>

                                {/* 통계 정보 */}
                                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                    <div
                                        className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 sm:p-4 border border-blue-100 dark:border-blue-800">
                                        <div
                                            className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{profile.postsCount || 0}</div>
                                        <div
                                            className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center mt-1">
                                            <MessageSquare className="h-3 w-3 mr-1"/>
                                            게시물
                                        </div>
                                    </div>
                                    <div
                                        className="text-center bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-3 sm:p-4 border border-purple-100 dark:border-purple-800">
                                        <div
                                            className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{profile.followersCount || 0}</div>
                                        <div
                                            className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center mt-1">
                                            <Users className="h-3 w-3 mr-1"/>
                                            팔로워
                                        </div>
                                    </div>
                                    <div
                                        className="text-center bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-3 sm:p-4 border border-pink-100 dark:border-pink-800">
                                        <div
                                            className="text-xl sm:text-2xl font-bold text-pink-600 dark:text-pink-400">{profile.followingCount || 0}</div>
                                        <div
                                            className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center mt-1">
                                            <Users className="h-3 w-3 mr-1"/>
                                            팔로잉
                                        </div>
                                    </div>
                                </div>

                                {/* 관계 배지 */}
                                {profile.isMutualFollow && (
                                    <div className="flex justify-center">
                                        <Badge variant="outline"
                                               className="text-violet-600 dark:text-violet-400 border-violet-300 dark:border-violet-600 bg-violet-50 dark:bg-violet-900/20 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                                            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2"/>
                                            서로 팔로우하는 사이
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
