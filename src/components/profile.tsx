"use client"

import {useState, useRef, useEffect} from "react"
import {useProfileDialog} from "@/contexts/ProfileDialogContext"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {ImageIcon, User, Briefcase, MapPin, Building2, Lock} from "lucide-react"
import {getCurrentUserId} from "@/utils/auth"
import {uploadProfileImage} from "@/lib/profile-api"
import {HexColorPicker} from "react-colorful"
import {getAvatarData, refreshAllProfileImages} from "@/utils/imageUtils"

interface CommunityProfile {
    id?: number
    displayName: string
    bio?: string
    jobTitle?: string
    company?: string
    location?: string
    profileImageUrl?: string
    coverImageUrl?: string
    postsCount?: number
    followersCount?: number
    followingCount?: number
    isPublic?: boolean
    allowFollow?: boolean
}

const SimpleToggle = ({checked, onChange, label}: {
    checked: boolean,
    onChange: (checked: boolean) => void,
    label: string
}) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium">{label}</span>
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-violet-500' : 'bg-gray-400'}`}
        >
      <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
        </button>
    </div>
)

const SimpleSeparator = () => (
    <div className="my-6 border-t border-gray-200"/>
)

export default function ProfileDialog() {
    const {isOpen, setIsOpen} = useProfileDialog()
    const profileFileInputRef = useRef<HTMLInputElement>(null)
    const colorPickerRef = useRef<HTMLDivElement>(null)

    const [profile, setProfile] = useState<CommunityProfile>({
        displayName: "",
        bio: "",
        jobTitle: "",
        company: "",
        location: "",
        profileImageUrl: "",
        coverImageUrl: "#c7d2fe", // 💜 기본 배경색
        isPublic: true,
        allowFollow: true,
        postsCount: 0,
        followersCount: 0,
        followingCount: 0
    })

    const [profileImage, setProfileImage] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [imageUploading, setImageUploading] = useState(false)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [colorPickerPosition, setColorPickerPosition] = useState({x: 0, y: 0})

    const userId = getCurrentUserId()

    // 🔥 프로필 이름 변경 시 기본 아바타 업데이트
    useEffect(() => {
        // 프로필 이미지가 기본 아바타이고 이름이 변경된 경우에만 업데이트
        if (profileImage.includes('ui-avatars.com') && profile.displayName) {
            const avatarData = getAvatarData("", profile.displayName)
            const newAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarData.fallbackChar)}&background=6366f1&color=fff&size=96`
            if (profileImage !== newAvatarUrl) {
                setProfileImage(newAvatarUrl)
            }
        }
    }, [profile.displayName, profileImage])

    useEffect(() => {
        if (isOpen && userId) loadCommunityProfile()
    }, [isOpen, userId])

    // 🔥 프로필 이름 변경 시 기본 아바타 업데이트
    useEffect(() => {
        // 프로필 이미지가 기본 아바타이고 이름이 변경된 경우에만 업데이트
        if (profileImage.includes('ui-avatars.com') && profile.displayName) {
            const avatarData = getAvatarData("", profile.displayName)
            const newAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarData.fallbackChar)}&background=6366f1&color=fff&size=96`
            if (profileImage !== newAvatarUrl) {
                setProfileImage(newAvatarUrl)
            }
        }
    }, [profile.displayName, profileImage])

    useEffect(() => {
        // 컴포넌트 언마운트시 Object URL 정리
        return () => {
            if (profileImage && profileImage.startsWith('blob:')) {
                URL.revokeObjectURL(profileImage)
            }
        }
    }, [profileImage])

    // 🔥 프로필 이름 변경 시 기본 아바타 업데이트
    useEffect(() => {
        // 프로필 이미지가 기본 아바타이고 이름이 변경된 경우에만 업데이트
        if (profileImage.includes('ui-avatars.com') && profile.displayName) {
            const avatarData = getAvatarData("", profile.displayName)
            const newAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarData.fallbackChar)}&background=6366f1&color=fff&size=96`
            if (profileImage !== newAvatarUrl) {
                setProfileImage(newAvatarUrl)
            }
        }
    }, [profile.displayName, profileImage])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setShowColorPicker(false)
            }
        }
        if (showColorPicker) {
            document.addEventListener("mousedown", handleClickOutside)
            return () => document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [showColorPicker])

    const handleCoverClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setColorPickerPosition({x: e.clientX - rect.left, y: e.clientY - rect.top})
        setShowColorPicker(true)
    }

    const loadCommunityProfile = async () => {
        if (!userId) return;
        setLoading(true);

        try {
            const res = await fetch(`https://initmainback-production.up.railway.app/api/community/profile/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const result: any = await res.json();
                if (result.success && result.data) {
                    const profileData = result.data;
                    setProfile(prev => ({ ...prev, ...profileData }));

                    const avatarData = getAvatarData(profileData.profileImageUrl, profileData.displayName);
                    if (avatarData.hasImage) {
                        console.log('🖼️ 프로필 이미지 설정:', avatarData.imageUrl);
                        setProfileImage(avatarData.imageUrl);
                    } else {
                        const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarData.fallbackChar)}&background=6366f1&color=fff&size=96`;
                        console.log('🎨 기본 아바타 생성:', fallbackUrl);
                        setProfileImage(fallbackUrl);
                    }
                } else {
                    const displayName = profile.displayName || "사용자";
                    const firstChar = displayName.charAt(0).toUpperCase();
                    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstChar)}&background=6366f1&color=fff&size=96`;
                    console.log('🎨 새 사용자 기본 아바타 생성:', fallbackUrl);
                    setProfileImage(fallbackUrl);
                }
            }
        } catch (err) {
            console.error("프로필 로딩 오류", err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return

        const file = e.target.files[0]
        setImageUploading(true)

        try {
            console.log('🔄 프로필 이미지 업로드 시작:', {
                userId,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            });

            // 🔥 즉시 미리보기를 위한 Object URL 생성
            const previewUrl = URL.createObjectURL(file)
            console.log('👀 미리보기 URL 생성:', previewUrl)
            setProfileImage(previewUrl)

            // 🔥 프로필 이미지 업로드 (이제 백엔드에서 자동으로 DB 업데이트까지 처리)
            const imageUrl = await uploadProfileImage(userId!, file)
            console.log('✅ 서버 업로드 및 DB 저장 완료, 받은 URL:', imageUrl)
            
            // 🔥 URL 유형 확인
            if (imageUrl.startsWith('http')) {
                console.log('✅ 완전한 URL 확인됨:', imageUrl)
            } else {
                console.log('⚠️ 상대 경로 URL:', imageUrl)
            }

            // 🔥 실제 서버 URL로 교체
            setProfileImage(imageUrl)
            setProfile(prev => ({...prev, profileImageUrl: imageUrl}))

            // 🔥 임시 Object URL 해제
            URL.revokeObjectURL(previewUrl)
            
            // 🔥 이미지 캐시 새로고침
            setTimeout(() => {
                refreshAllProfileImages()
            }, 1000)
            
            console.log('🎉 프로필 이미지 업로드 및 설정 완료')
        } catch (error) {
            console.error('❌ 프로필 이미지 업로드 에러:', error)

            // 🔥 에러시 현재 프로필 이름에 맞는 기본 이미지로 복원
            const avatarData = getAvatarData(profile.profileImageUrl, profile.displayName)
            if (avatarData.hasImage) {
                setProfileImage(avatarData.imageUrl)
            } else {
                // 🔥 이미지가 없으면 현재 프로필 이름으로 기본 아바타 생성
                const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarData.fallbackChar)}&background=6366f1&color=fff&size=96`
                setProfileImage(fallbackUrl)
            }

            alert('이미지 업로드 중 오류가 발생했습니다.')
        } finally {
            setImageUploading(false)
        }
    }

    const handleSave = async () => {
        if (!userId || !profile.displayName.trim()) {
            return alert("표시 이름은 필수입니다")
        }

        setSaving(true)
        try {
            // 🔥 프로필 이미지가 Object URL인 경우 경고
            if (profile.profileImageUrl?.startsWith('blob:')) {
                alert('이미지 업로드가 완료되지 않았습니다. 잠시 후 다시 시도해주세요.')
                setSaving(false)
                return
            }

            const method = profile.id ? 'PUT' : 'POST'
            const response = await fetch(`https://initmainback-production.up.railway.app/api/community/profile/${userId}`, {
                method,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profile)
            })

            if (response.ok) {
                alert("프로필이 저장되었습니다")
                
                // 🔥 프로필 저장 후 이미지 캐시 새로고침
                console.log('💾 프로필 저장 완료 - 이미지 캐시 새로고침 시작')
                
                // 1. 전체 프로필 이미지 캐시 새로고침
                refreshAllProfileImages()
                
                // 2. 페이지별 처리
                const currentPath = window.location.pathname
                console.log('📍 현재 경로:', currentPath)
                
                if (currentPath.includes('/community/')) {
                    console.log('🔄 커뮤니티 페이지 - 페이지 새로고침')
                    
                    // 커뮤니티 페이지에서는 강제 새로고침
                    setTimeout(() => {
                        // 브라우저 캐시 무효화
                        if ('caches' in window) {
                            caches.keys().then(names => {
                                names.forEach(name => caches.delete(name))
                            })
                        }
                        
                        // 페이지 새로고침
                        window.location.reload()
                    }, 800) // 800ms 후 새로고침 (이미지 캐시 정리 시간 확보)
                } else {
                    console.log('ℹ️ 일반 페이지 - 이미지 캐시만 새로고침')
                    
                    // 다른 페이지에서는 이미지만 새로고침
                    setTimeout(() => {
                        refreshAllProfileImages()
                    }, 500)
                }
                
                setIsOpen(false)
            } else {
                const errorText = await response.text()
                alert(`저장 실패: ${errorText}`)
            }
        } catch (err) {
            console.error('프로필 저장 에러:', err)
            alert("저장 중 오류 발생")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-white shadow-lg"
                style={{
                    position: "fixed",
                    top: "12%",
                    left: "calc((100% - 250px) / 2 + 250px)",
                    transform: "translateX(-50%)"
                }}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5"/> 커뮤니티 프로필 관리
                    </DialogTitle>
                    <DialogDescription>
                        커뮤니티에서 사용할 프로필 정보를 설정하세요.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* 커버 색상 선택 */}
                        <div className="space-y-2">
                            <div
                                className="relative h-32 rounded-lg cursor-pointer border border-gray-300"
                                style={{backgroundColor: profile.coverImageUrl || '#c7d2fe'}}
                                onClick={handleCoverClick}
                            >
                                <div
                                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 text-white transition-opacity">
                                    <span className="text-sm">배경색 변경</span>
                                </div>
                            </div>
                            {showColorPicker && (
                                <div
                                    ref={colorPickerRef}
                                    className="absolute z-50"
                                    style={{
                                        top: colorPickerPosition.y,
                                        left: colorPickerPosition.x,
                                    }}
                                >
                                    <HexColorPicker
                                        color={profile.coverImageUrl || '#c7d2fe'}
                                        onChange={(newColor) => {
                                            setProfile(prev => ({...prev, coverImageUrl: newColor}))
                                            setShowColorPicker(false)
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* 프로필 이미지 */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <Avatar className="h-24 w-24 cursor-pointer ring-4 ring-white -mt-12 relative z-10"
                                        onClick={() => profileFileInputRef.current?.click()}>
                                    <AvatarImage src={profileImage}/>
                                    <AvatarFallback
                                        className="text-lg bg-violet-500 text-white">
                                        {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                {imageUploading && <div
                                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </div>}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => profileFileInputRef.current?.click()}
                                    disabled={imageUploading}>
                                <ImageIcon className="h-4 w-4 mr-2"/> 프로필 사진 변경
                            </Button>
                            <input type="file" accept="image/*" ref={profileFileInputRef}
                                   onChange={handleProfileImageChange} className="hidden"/>
                        </div>

                        {/* 기본 정보 입력 */}
                        <SimpleSeparator/>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">프로필 이름</label>
                            <Input value={profile.displayName}
                                   onChange={(e) => setProfile(p => ({...p, displayName: e.target.value}))}
                                   maxLength={20}/>
                            <p className="text-xs text-gray-500">{profile.displayName.length}/20</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1"><Briefcase
                                className="h-4 w-4"/> 직책</label>
                            <Input value={profile.jobTitle}
                                   onChange={(e) => setProfile(p => ({...p, jobTitle: e.target.value}))}
                                   maxLength={30}/>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1"><Building2
                                className="h-4 w-4"/> 회사</label>
                            <Input value={profile.company}
                                   onChange={(e) => setProfile(p => ({...p, company: e.target.value}))} maxLength={30}/>
                        </div>

                        <div className="space-y-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-1"><MapPin
                                    className="h-4 w-4"/> 지역</label>
                                <Input
                                    value={profile.location || ""}
                                    onChange={(e) => setProfile(p => ({...p, location: e.target.value}))}
                                    maxLength={20}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">소개</label>
                                <Textarea
                                    rows={3}
                                    value={profile.bio || ""}
                                    onChange={(e) => setProfile(p => ({...p, bio: e.target.value}))}
                                    maxLength={200}
                                />
                                <p className="text-xs text-gray-500">{profile.bio?.length || 0}/200</p>
                            </div>

                            <SimpleSeparator/>

                            {/* 프로필 설정 */}
                            <div className="space-y-4">
                                <h4 className="font-medium flex items-center gap-2"><Lock className="h-4 w-4"/> 프로필 설정
                                </h4>
                                <SimpleToggle
                                    label="공개 프로필"
                                    checked={profile.isPublic || false}
                                    onChange={(v) => setProfile(p => ({...p, isPublic: v}))}
                                />
                                <SimpleToggle
                                    label="팔로우 허용"
                                    checked={profile.allowFollow || false}
                                    onChange={(v) => setProfile(p => ({...p, allowFollow: v}))}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={saving}>
                        취소
                    </Button>
                    <Button
                        className="bg-[#6366f1] hover:bg-[#6366f1]/90"
                        onClick={handleSave}
                        disabled={saving || !profile.displayName.trim()}
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                저장중...
                            </>
                        ) : (
                            '저장하기'
                        )}
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}
