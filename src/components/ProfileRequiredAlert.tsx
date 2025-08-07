"use client"

import { useState } from "react"
import { useProfileDialog } from "@/contexts/ProfileDialogContext"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, UserPlus, AlertCircle, Sparkles, Heart, MessageCircle, Users } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ProfileRequiredAlertProps {
  variant?: "banner" | "card" | "modal"
  className?: string
  showDismiss?: boolean
  onDismiss?: () => void
}

export default function ProfileRequiredAlert({ 
  variant = "banner", 
  className = "", 
  showDismiss = true,
  onDismiss 
}: ProfileRequiredAlertProps) {
  const { setIsOpen } = useProfileDialog()
  const [dismissed, setDismissed] = useState(false)

  const handleCreateProfile = () => {
    setIsOpen(true)
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  if (dismissed) return null

  // 🔥 배너 스타일 (상단 고정)
  if (variant === "banner") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className={`bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4 shadow-lg ${className}`}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">커뮤니티 프로필을 만들어보세요!</h3>
                <p className="text-white/90 text-sm">
                  다른 사용자들과 소통하고 팔로우 기능을 사용하려면 프로필이 필요해요.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateProfile}
                variant="secondary"
                className="bg-white text-violet-600 hover:bg-gray-100 font-medium"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                프로필 만들기
              </Button>
              {showDismiss && (
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  ✕
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // 🔥 카드 스타일 (인라인)
  if (variant === "card") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={className}
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
            <div className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">
                    커뮤니티에 참여해보세요!
                  </h3>
                  <p className="text-white/90 max-w-md drop-shadow-md">
                    프로필을 만들면 다른 사용자들과 소통하고, 
                    팔로우하며, 더 풍부한 커뮤니티 경험을 즐길 수 있어요.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-6 py-2">
                  <div className="flex items-center gap-2 text-white/80">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm font-medium">좋아요</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">댓글</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">팔로우</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleCreateProfile}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    프로필 만들기
                  </Button>
                  {showDismiss && (
                    <Button
                      onClick={handleDismiss}
                      variant="outline"
                      className="border-white/30 text-white/90 bg-white/10 hover:bg-white/20"
                    >
                      나중에
                    </Button>
                  )}
                </div>
              </div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // 🔥 모달/오버레이 스타일
  if (variant === "modal") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center animate-pulse">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  프로필이 필요해요!
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  커뮤니티 기능을 사용하려면<br />
                  먼저 프로필을 만들어주세요.
                </p>
              </div>

              <div className="w-full pt-4 space-y-3">
                <Button
                  onClick={handleCreateProfile}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                  size="lg"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  지금 프로필 만들기
                </Button>
                {showDismiss && (
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    className="w-full text-gray-600"
                  >
                    나중에 하기
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return null
}
