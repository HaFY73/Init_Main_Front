"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff, Check, User, Mail, Lock, Phone } from "lucide-react"

interface EnhancedSignupModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function EnhancedSignupModal({ isOpen, onClose }: EnhancedSignupModalProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        id: "",
        password: "",
        confirmPassword: "",
        phone: "",
        email: "",
        name: "",
        interests: [] as string[],
    })
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        hasLetter: false,
        hasNumber: false,
        hasSpecial: false,
    })

    // 비밀번호 유효성 검사
    useEffect(() => {
        const password = formData.password
        setPasswordValidation({
            length: password.length >= 8,
            hasLetter: /[a-zA-Z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        })
    }, [formData.password])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleInterestChange = (interest: string) => {
        setFormData((prev) => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter((i) => i !== interest)
                : [...prev.interests, interest],
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("회원가입 데이터:", formData)
        // 여기에 실제 회원가입 로직 구현
        onClose()
    }

    const interests = [
        "경영/기획/전략",
        "디자인/컨텐츠",
        "개발/IT",
        "마케팅/브랜딩",
        "영업/고객관리",
        "교육/강의/연구",
        "운영/사무관리",
        "생산/물류/품질관리",
    ]

    const isPasswordMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ""
    const isPasswordValid = Object.values(passwordValidation).every(Boolean)
    const isFormValid = isPasswordValid && isPasswordMatch && formData.id && formData.email && formData.name

    return (
        <>
            <style jsx>{`
        .modal-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }
        
        .modal-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .modal-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        
        .modal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.3);
        }
        
        .modal-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => e.target === e.currentTarget && onClose()}
                    >
                        <motion.div
                            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-[720px] max-h-[80vh] relative overflow-hidden"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* 헤더 */}
                            <div className="relative text-center p-6 border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-10">
                                <h2 className="text-2xl font-bold text-[#6366f1] mb-1">Init 시작하기</h2>
                                <p className="text-sm text-slate-600">몇 분만 투자하여 더 나은 취업 준비를 시작하세요</p>

                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* 스크롤 가능한 폼 컨테이너 */}
                            <div className="modal-scrollbar overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                                <div onSubmit={handleSubmit} className="pt-6 px-6 pb-6 space-y-5">
                                    {/* 이름 */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">이름</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="이름"
                                                className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-[#8b5cf6] bg-white/50 text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* ID */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">아이디</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                name="id"
                                                value={formData.id}
                                                onChange={handleInputChange}
                                                placeholder="영문, 숫자 조합 4-12자"
                                                className="flex-1 px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-[#8b5cf6] bg-white/50 text-sm"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="bg-slate-200 hover:bg-slate-300 px-4 py-3 rounded-lg text-xs transition-colors font-semibold whitespace-nowrap"
                                            >
                                                중복확인
                                            </button>
                                        </div>
                                    </div>

                                    {/* 이메일 */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">이메일</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="example@email.com"
                                                className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-[#8b5cf6] bg-white/50 text-sm"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="bg-slate-200 hover:bg-slate-300 px-4 py-3 rounded-lg text-xs transition-colors font-semibold whitespace-nowrap"
                                        >
                                            인증번호
                                        </button>
                                    </div>

                                    {/* 비밀번호 */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">비밀번호</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="8자 이상, 영문+숫자+특수문자"
                                                className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-[#8b5cf6] bg-white/50 text-sm"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {/* 비밀번호 유효성 표시 */}
                                        {formData.password && (
                                            <div className="mt-2 space-y-1">
                                                <div className="flex items-center gap-2 text-xs">
                                                    {passwordValidation.length ? (
                                                        <Check className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <X className="h-3 w-3 text-red-500" />
                                                    )}
                                                    <span className={passwordValidation.length ? "text-green-600" : "text-red-600"}>8자 이상</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    {passwordValidation.hasLetter && passwordValidation.hasNumber && passwordValidation.hasSpecial ? (
                                                        <Check className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <X className="h-3 w-3 text-red-500" />
                                                    )}
                                                    <span
                                                        className={
                                                            passwordValidation.hasLetter && passwordValidation.hasNumber && passwordValidation.hasSpecial
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                        }
                                                    >
                            영문, 숫자, 특수문자 포함
                          </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 비밀번호 확인 */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">비밀번호 확인</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                placeholder="비밀번호를 다시 입력하세요"
                                                className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-[#8b5cf6] bg-white/50 text-sm"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {formData.confirmPassword && (
                                            <div className="mt-1 flex items-center gap-2 text-xs">
                                                {isPasswordMatch ? (
                                                    <>
                                                        <Check className="h-3 w-3 text-green-500" />
                                                        <span className="text-green-600">비밀번호가 일치합니다</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <X className="h-3 w-3 text-red-500" />
                                                        <span className="text-red-600">비밀번호가 일치하지 않습니다</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* 휴대폰 번호 */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            휴대폰 번호
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="010-1234-5678"
                                                    className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-[#8b5cf6] bg-white/50 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* 관심 분야 */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-3">
                                            관심 분야 <span className="text-slate-400 text-xs">(복수 선택 가능)</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {interests.map((interest, index) => (
                                                <label
                                                    key={index}
                                                    className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                                                        formData.interests.includes(interest)
                                                            ? "bg-[#6366f1]/10 border border-[#6366f1]/30"
                                                            : "hover:bg-slate-50 border border-slate-200"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.interests.includes(interest)}
                                                        onChange={() => handleInterestChange(interest)}
                                                        className="mr-2 h-3 w-3 text-[#6366f1] focus:ring-[#8b5cf6] rounded"
                                                    />
                                                    <span className="text-slate-700 text-xs">{interest}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">선택한 관심 분야: {formData.interests.length}개</p>
                                    </div>

                                    {/* 약관 동의 */}
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm">
                                                <input
                                                    type="checkbox"
                                                    className="mr-2 h-4 w-4 text-[#6366f1] focus:ring-[#8b5cf6] rounded"
                                                    required
                                                />
                                                <span className="text-slate-700">
                          <span className="text-red-500">*</span> 이용약관에 동의합니다
                        </span>
                                            </label>
                                            <label className="flex items-center text-sm">
                                                <input
                                                    type="checkbox"
                                                    className="mr-2 h-4 w-4 text-[#6366f1] focus:ring-[#8b5cf6] rounded"
                                                    required
                                                />
                                                <span className="text-slate-700">
                          <span className="text-red-500">*</span> 개인정보처리방침에 동의합니다
                        </span>
                                            </label>
                                            <label className="flex items-center text-sm">
                                                <input type="checkbox" className="mr-2 h-4 w-4 text-[#6366f1] focus:ring-[#8b5cf6] rounded" />
                                                <span className="text-slate-700">마케팅 정보 수신에 동의합니다 (선택)</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* 제출 버튼 */}
                                    <div className="pt-4">
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <button
                                                type="submit"
                                                className="w-full bg-[#6366f1] hover:bg-[#8b5cf6] text-white px-4 py-4 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-base text-center"
                                                disabled={!isFormValid}
                                            >
                                                Init 시작하기
                                            </button>
                                        </motion.div>
                                        <p className="text-xs text-slate-500 text-center mt-3">
                                            이미 계정이 있으신가요?{" "}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onClose()
                                                    // 실제 라우팅 로직으로 교체 필요
                                                    console.log("Navigate to login")
                                                }}
                                                className="text-[#6366f1] hover:text-[#8b5cf6] font-medium"
                                            >
                                                로그인하기
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}