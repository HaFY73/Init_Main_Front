"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MessageSquare, BookmarkIcon, PenSquare, Menu, type LucideIcon } from "lucide-react"
import { useProfileDialog } from "@/contexts/ProfileDialogContext"
import { useCommunityProfile } from "@/hooks/useCommunityProfile"
import { getAvatarData } from "@/utils/imageUtils"

interface UpwardMenuProps {
  className?: string
  onFollowClick: () => void
  onMyPostsClick: () => void
  onMyCommentsClick: () => void
  onSavedClick: () => void
}

interface MenuItem {
  icon: LucideIcon | typeof Avatar
  label: string
  color: string
  onClick: () => void
  isAvatar?: boolean
}

export function UpwardMenu({
                             className,
                             onFollowClick,
                             onMyPostsClick,
                             onMyCommentsClick,
                             onSavedClick,
                           }: UpwardMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { setIsOpen } = useProfileDialog()

  // 커뮤니티 프로필 정보 가져오기
  const { profile, loading } = useCommunityProfile()

  // 디버깅용 로그
  useEffect(() => {
    if (profile) {
      console.log("프로필 정보:", profile)
      console.log("프로필 이미지 URL:", profile.profileImageUrl)
    }
  }, [profile])

  // 메뉴 버튼 배열
  const menuItems: MenuItem[] = [
    {
      icon: Avatar,
      label: "프로필",
      color: "bg-indigo-500 hover:bg-indigo-600",
      onClick: () => setIsOpen(true),
      isAvatar: true,
    },
    { icon: Users, label: "팔로우", color: "bg-blue-500 hover:bg-blue-600", onClick: onFollowClick },
    { icon: PenSquare, label: "작성한 글", color: "bg-green-500 hover:bg-green-600", onClick: onMyPostsClick },
    {
      icon: MessageSquare,
      label: "댓글단 글",
      color: "bg-yellow-500 hover:bg-yellow-600",
      onClick: onMyCommentsClick,
    },
    { icon: BookmarkIcon, label: "저장한 글", color: "bg-orange-500 hover:bg-orange-600", onClick: onSavedClick },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuVisible(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMenuItemClick = (callback: () => void) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    callback()
    setMenuVisible(false)
  }

  const handleMainButtonClick = () => setMenuVisible(!menuVisible)

  // 아바타 데이터 처리
  const getAvatarInfo = () => {
    if (loading) {
      return {
        imageUrl: "",
        fallbackChar: "U"
      };
    }
    
    return getAvatarData(profile?.profileImageUrl, profile?.displayName);
  };

  return (
      <div className={`fixed bottom-20 sm:bottom-6 z-[9999] ${className ?? "right-4 sm:right-6"}`} ref={menuRef}>
        <div className="flex flex-col-reverse items-center gap-3 mb-4">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon
            return (
                <Button
                    key={index}
                    onClick={handleMenuItemClick(item.onClick)}
                    className={`rounded-full w-12 h-12 shadow-lg ${item.color} text-white flex items-center justify-center`}
                    style={{
                      opacity: menuVisible ? 1 : 0,
                      transform: menuVisible ? "translateY(0)" : "translateY(20px)",
                      pointerEvents: menuVisible ? "auto" : "none",
                      transition: `transform 0.3s ease, opacity 0.3s ease`,
                      transitionDelay: `${index * 50}ms`,
                    }}
                    title={item.label}
                    size="icon"
                >
                  {item.isAvatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                            src={getAvatarInfo().imageUrl}
                            alt={profile?.displayName || "프로필"}
                            onError={(e) => {
                              console.log("이미지 로딩 실패:", getAvatarInfo().imageUrl)
                              // 이미지 로딩 실패시 아바타를 숨기고 fallback 표시
                              e.currentTarget.style.display = 'none'
                            }}
                        />
                        <AvatarFallback className="text-xs font-medium">
                          {getAvatarInfo().fallbackChar}
                        </AvatarFallback>
                      </Avatar>
                  ) : (
                      <IconComponent className="h-5 w-5" />
                  )}
                </Button>
            )
          })}
        </div>
        <Button
            className="rounded-full w-14 h-14 shadow-lg bg-[#6366f1] hover:bg-[#6366f1]/90 text-white flex items-center justify-center"
            onClick={handleMainButtonClick}
            size="icon"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
  )
}