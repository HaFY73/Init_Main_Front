// components/EnhancedJobRecommendations.tsx
// 기존 대시보드의 JobRecommendations 컴포넌트를 확장
// 기존 추천 공고 + 새로운 검색 기능을 탭으로 분리

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Building,
    RefreshCw,
    Search,
    Filter,
    MapPin,
    Calendar,
    ExternalLink,
    ChevronDown,
    X,
    Loader2,
    Briefcase,
    GraduationCap,
    Clock,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Star
} from "lucide-react"
import { api, JobRecommendation, PublicJobPosting, PublicJobSearchRequest } from "@/lib/dash-api"

// 기존 대시보드 타입들을 dash-api.ts에서 import
interface ConditionsData {
    jobs: string[];
    locations: string[];
    salary: string;
    others: string[];
}

interface SearchFilters {
    title: string
    workRgnLst: string[]
    hireTypeLst: string[]
    recrutSe: string
    acbgCondLst: string[]
    ncsCdLst: string[]
}

// 필터 옵션들
const FILTER_OPTIONS = {
    regions: [
        { code: "101000", name: "서울" },
        { code: "102000", name: "부산" },
        { code: "103000", name: "대구" },
        { code: "104000", name: "인천" },
        { code: "105000", name: "광주" },
        { code: "106000", name: "대전" },
        { code: "107000", name: "울산" },
        { code: "108000", name: "세종" },
        { code: "109000", name: "경기" },
        { code: "110000", name: "강원" },
        { code: "111000", name: "충북" },
        { code: "112000", name: "충남" },
        { code: "113000", name: "전북" },
        { code: "114000", name: "전남" },
        { code: "115000", name: "경북" },
        { code: "116000", name: "경남" },
        { code: "117000", name: "제주" }
    ],
    employmentTypes: [
        { code: "R1010", name: "정규직" },
        { code: "R1020", name: "무기계약직" },
        { code: "R1030", name: "기간제" },
        { code: "R1040", name: "비정규직" }
    ],
    recruitmentTypes: [
        { code: "R2010", name: "신입" },
        { code: "R2020", name: "경력" },
        { code: "R2030", name: "인턴" }
    ],
    educationLevels: [
        { code: "R7010", name: "학력무관" },
        { code: "R7020", name: "고등학교졸업" },
        { code: "R7030", name: "대학교졸업(2,3년)" },
        { code: "R7040", name: "대학교졸업(4년)" },
        { code: "R7050", name: "대학원졸업(석사)" },
        { code: "R7060", name: "대학원졸업(박사)" }
    ],
    ncsClassifications: [
        { code: "20", name: "정보통신" },
        { code: "02", name: "경영·회계·사무" },
        { code: "14", name: "건설" },
        { code: "06", name: "보건·의료" },
        { code: "04", name: "교육·자연·사회과학" }
    ]
}

// 통합 API 사용으로 개별 함수들 제거
// api.searchPublicJobs와 api.getJobRecommendations 사용

// 필터 모달 컴포넌트
const FilterModal = ({
                         isOpen,
                         onClose,
                         filters,
                         onFiltersChange
                     }: {
    isOpen: boolean
    onClose: () => void
    filters: SearchFilters
    onFiltersChange: (filters: SearchFilters) => void
}) => {
    const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)
    const [expandedSections, setExpandedSections] = useState<string[]>([])

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        )
    }

    const handleMultiSelect = (field: keyof SearchFilters, value: string) => {
        const currentValues = localFilters[field] as string[]
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value]

        setLocalFilters(prev => ({ ...prev, [field]: newValues }))
    }

    const handleApply = () => {
        onFiltersChange(localFilters)
        onClose()
    }

    const handleReset = () => {
        const resetFilters: SearchFilters = {
            title: "",
            workRgnLst: [],
            hireTypeLst: [],
            recrutSe: "",
            acbgCondLst: [],
            ncsCdLst: []
        }
        setLocalFilters(resetFilters)
    }

    useEffect(() => {
        setLocalFilters(filters)
    }, [filters])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">상세 필터</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* 공고 제목 검색 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">공고 제목</label>
                        <input
                            type="text"
                            value={localFilters.title}
                            onChange={(e) => setLocalFilters(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="검색할 공고 제목을 입력하세요"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    {/* 채용 구분 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">채용 구분</label>
                        <select
                            value={localFilters.recrutSe}
                            onChange={(e) => setLocalFilters(prev => ({ ...prev, recrutSe: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">전체</option>
                            {FILTER_OPTIONS.recruitmentTypes.map(type => (
                                <option key={type.code} value={type.code}>{type.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* 지역 필터 */}
                    <div>
                        <button
                            onClick={() => toggleSection('region')}
                            className="flex items-center justify-between w-full text-left text-sm font-medium mb-2"
                        >
                            <span>지역</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('region') ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSections.includes('region') && (
                            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                {FILTER_OPTIONS.regions.map(region => (
                                    <label key={region.code} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={localFilters.workRgnLst.includes(region.code)}
                                            onChange={() => handleMultiSelect('workRgnLst', region.code)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">{region.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 고용형태 필터 */}
                    <div>
                        <button
                            onClick={() => toggleSection('employment')}
                            className="flex items-center justify-between w-full text-left text-sm font-medium mb-2"
                        >
                            <span>고용형태</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('employment') ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSections.includes('employment') && (
                            <div className="grid grid-cols-2 gap-2">
                                {FILTER_OPTIONS.employmentTypes.map(type => (
                                    <label key={type.code} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={localFilters.hireTypeLst.includes(type.code)}
                                            onChange={() => handleMultiSelect('hireTypeLst', type.code)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">{type.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleReset}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                        초기화
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        적용하기
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

// 공고 카드 컴포넌트
const JobCard = ({ job, isPublicJob = false }: { job: JobRecommendation | PublicJobPosting, isPublicJob?: boolean }) => {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return ''
        return dateStr.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3')
    }

    const getDaysLeft = () => {
        if (isPublicJob) {
            const publicJob = job as PublicJobPosting
            return publicJob.decimalDay
        } else {
            const recommendJob = job as JobRecommendation
            if (!recommendJob.deadline || recommendJob.deadline === '정보 없음') return null

            try {
                const endDate = new Date(recommendJob.deadline.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
                const today = new Date()
                const diffTime = endDate.getTime() - today.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                return diffDays >= 0 ? diffDays : -1
            } catch {
                return null
            }
        }
    }

    const daysLeft = getDaysLeft()

    const getJobInfo = () => {
        if (isPublicJob) {
            const publicJob = job as PublicJobPosting
            return {
                company: publicJob.instNm,
                title: publicJob.recrutPbancTtl,
                location: publicJob.workRgnNmLst,
                experience: publicJob.recrutSeNm,
                employment: publicJob.hireTypeNmLst,
                education: publicJob.acbgCondNmLst,
                url: publicJob.srcUrl,
                recruitCount: publicJob.recrutNope?.toString(),
                deadline: formatDate(publicJob.pbancEndYmd)
            }
        } else {
            const recommendJob = job as JobRecommendation
            return {
                company: recommendJob.company,
                title: recommendJob.title,
                location: recommendJob.location,
                experience: recommendJob.experience,
                employment: recommendJob.employmentType,
                education: recommendJob.education,
                url: recommendJob.url,
                recruitCount: recommendJob.recruitCount,
                deadline: recommendJob.deadline,
                matchScore: recommendJob.matchScore,
                keywords: recommendJob.keywords
            }
        }
    }

    const jobInfo = getJobInfo()

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => jobInfo.url && jobInfo.url !== '#' ? window.open(jobInfo.url, '_blank') : null}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{jobInfo.company}</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 leading-tight">
                        {jobInfo.title}
                    </h3>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    {!isPublicJob && jobInfo.matchScore && jobInfo.matchScore > 70 && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            매칭 {jobInfo.matchScore}%
                        </span>
                    )}
                    {daysLeft !== null && daysLeft !== undefined && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            daysLeft <= 0
                                ? 'bg-red-100 text-red-800'
                                : daysLeft <= 3
                                    ? 'bg-orange-100 text-orange-800'
                                    : daysLeft <= 7
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                        }`}>
                            {daysLeft <= 0 ? '마감' : `D-${daysLeft}`}
                        </span>
                    )}
                    {jobInfo.url && jobInfo.url !== '#' && (
                        <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400 truncate">{jobInfo.experience}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400 truncate">{jobInfo.employment}</span>
                </div>
                <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400 truncate">{jobInfo.location}</span>
                </div>
                <div className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400 truncate">{jobInfo.education}</span>
                </div>
            </div>

            {jobInfo.recruitCount && (
                <div className="mb-2">
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
                        채용인원: {jobInfo.recruitCount}명
                    </span>
                </div>
            )}

            {!isPublicJob && jobInfo.keywords && jobInfo.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {jobInfo.keywords.slice(0, 2).map((keyword, i) => (
                        <span key={i} className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                            {keyword}
                        </span>
                    ))}
                </div>
            )}

            {jobInfo.deadline && jobInfo.deadline !== '정보 없음' && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>마감: {jobInfo.deadline}</span>
                    </div>
                </div>
            )}
        </motion.div>
    )
}

// 페이지네이션 컴포넌트
const Pagination = ({
                        currentPage,
                        totalCount,
                        itemsPerPage,
                        onPageChange
                    }: {
    currentPage: number
    totalCount: number
    itemsPerPage: number
    onPageChange: (page: number) => void
}) => {
    const totalPages = Math.ceil(totalCount / itemsPerPage)
    const maxVisiblePages = 5

    const getVisiblePages = () => {
        const half = Math.floor(maxVisiblePages / 2)
        let start = Math.max(currentPage - half, 1)
        const end = Math.min(start + maxVisiblePages - 1, totalPages)

        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(end - maxVisiblePages + 1, 1)
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    }

    const visiblePages = getVisiblePages()

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-700"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {visiblePages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                        page === currentPage
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
                    }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-700"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    )
}

// 메인 컴포넌트 - 기존 JobRecommendations를 확장
const EnhancedJobRecommendations = React.memo(({
                                                   conditions,
                                                   userId,
                                                   isParentLoading
                                               }: {
    conditions: ConditionsData | null,
    userId: number,
    isParentLoading: boolean
}) => {
    const [activeTab, setActiveTab] = useState<'recommendations' | 'search'>('recommendations')

    // 추천 공고 상태
    const [recommendations, setRecommendations] = useState<JobRecommendation[]>([])
    const [recommendationsLoading, setRecommendationsLoading] = useState(false)
    const [recommendationsError, setRecommendationsError] = useState<string | null>(null)

    // 검색 공고 상태
    const [searchJobs, setSearchJobs] = useState<PublicJobPosting[]>([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
    const [quickSearch, setQuickSearch] = useState("")
    const [filters, setFilters] = useState<SearchFilters>({
        title: "",
        workRgnLst: [],
        hireTypeLst: [],
        recrutSe: "",
        acbgCondLst: [],
        ncsCdLst: []
    })

    // 추천 공고 가져오기 (통합 API 사용)
    const fetchRecommendations = async () => {
        if (isParentLoading || !conditions || conditions.jobs.length === 0) {
            console.log('🔍 추천 공고 가져오기 스킵:', { isParentLoading, conditions });
            setRecommendations([])
            return
        }

        setRecommendationsLoading(true)
        setRecommendationsError(null)

        try {
            console.log('🔍 추천 공고 API 호출 시작:', { 
                userId, 
                jobs: conditions.jobs, 
                locations: conditions.locations 
            });

            const data = await api.getJobRecommendations(userId, conditions.jobs, conditions.locations)
            
            console.log('✅ 추천 공고 데이터 수신:', { 
                dataType: typeof data, 
                isArray: Array.isArray(data), 
                length: data?.length 
            });

            setRecommendations(data || [])
        } catch (err) {
            console.error('❌ 공고 추천 API 호출 실패:', err)
            setRecommendationsError('공고를 불러오는데 실패했습니다.')
            setRecommendations([]) // 🔥 에러시 빈 배열로 설정
        } finally {
            setRecommendationsLoading(false)
        }
    }

    // 공고 검색하기 (통합 API 사용)
    const handleSearch = async (searchFilters: SearchFilters = filters, page: number = 1) => {
        setSearchLoading(true)
        setSearchError(null)

        try {
            const searchRequest: PublicJobSearchRequest = {
                keywords: searchFilters.title ? [searchFilters.title] : [],
                locations: searchFilters.workRgnLst,
                pageNo: page,
                numOfRows: 20,
                ...(searchFilters.hireTypeLst.length > 0 && { hireTypeLst: searchFilters.hireTypeLst }),
                ...(searchFilters.recrutSe && { recrutSe: searchFilters.recrutSe }),
                ...(searchFilters.acbgCondLst.length > 0 && { acbgCondLst: searchFilters.acbgCondLst }),
                ...(searchFilters.ncsCdLst.length > 0 && { ncsCdLst: searchFilters.ncsCdLst }),
            }

            const result = await api.searchPublicJobs(searchRequest)
            setSearchJobs(result.result || [])
            setTotalCount(result.totalCount || 0)
            setCurrentPage(page)
        } catch (err) {
            setSearchError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.')
            setSearchJobs([])
        } finally {
            setSearchLoading(false)
        }
    }

    // 빠른 검색
    const handleQuickSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const searchFilters = { ...filters, title: quickSearch }
        setFilters(searchFilters)
        handleSearch(searchFilters, 1)
    }

    // 필터 변경 처리
    const handleFiltersChange = (newFilters: SearchFilters) => {
        setFilters(newFilters)
        handleSearch(newFilters, 1)
    }

    // 페이지 변경
    const handlePageChange = (page: number) => {
        handleSearch(filters, page)
    }

    useEffect(() => {
        console.log('🔧 EnhancedJobRecommendations useEffect:', {
            activeTab,
            userId,
            isParentLoading,
            conditions: conditions?.jobs,
            environment: {
                NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
                NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
            }
        });

        if (activeTab === 'recommendations') {
            fetchRecommendations()
        } else if (activeTab === 'search' && searchJobs.length === 0) {
            // 검색 탭 첫 진입시 기본 검색
            handleSearch()
        }
    }, [activeTab, conditions, userId, isParentLoading])

    if (isParentLoading) {
        return (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 h-[600px] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                <p className="mt-4 text-gray-500">사용자 정보 로딩 중...</p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 h-[600px] flex flex-col">
            {/* 탭 헤더 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                        <Building className="w-5 h-5 mr-2 text-indigo-500" />
                        채용 공고
                    </h3>
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('recommendations')}
                            className={`px-3 py-1 text-sm rounded-md transition-all ${
                                activeTab === 'recommendations'
                                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Star className="w-4 h-4 mr-1 inline" />
                            추천
                        </button>
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`px-3 py-1 text-sm rounded-md transition-all ${
                                activeTab === 'search'
                                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Search className="w-4 h-4 mr-1 inline" />
                            검색
                        </button>
                    </div>
                </div>

                {activeTab === 'recommendations' && (
                    <button
                        onClick={fetchRecommendations}
                        disabled={recommendationsLoading}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="새로고침"
                    >
                        <RefreshCw className={`w-4 h-4 ${recommendationsLoading ? 'animate-spin' : ''}`} />
                    </button>
                )}
            </div>

            {/* 검색 탭 검색바 */}
            {activeTab === 'search' && (
                <div className="mb-4">
                    <form onSubmit={handleQuickSearch} className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={quickSearch}
                                onChange={(e) => setQuickSearch(e.target.value)}
                                placeholder="공고 제목 검색..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={searchLoading}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 text-sm"
                        >
                            {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '검색'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsFilterModalOpen(true)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}

            {/* 컨텐츠 영역 */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'recommendations' ? (
                        <motion.div
                            key="recommendations"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="h-full flex flex-col"
                        >
                            {/* 추천 공고 탭 내용 */}
                            {!conditions || conditions.jobs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <Building className="w-12 h-12 text-gray-400 mb-4" />
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">맞춤 공고 추천</h4>
                                    <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                                        희망 직무를 설정하면<br />맞춤 공고를 추천해드려요
                                    </p>
                                </div>
                            ) : recommendationsError ? (
                                <div className="flex items-center justify-center h-full text-red-500">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    {recommendationsError}
                                </div>
                            ) : recommendationsLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                    추천 공고를 불러오는 중...
                                </div>
                            ) : (
                                <div className="space-y-3 overflow-y-auto flex-grow pr-2">
                                    {recommendations.map((job) => (
                                        <JobCard
                                            key={job.id}
                                            job={job}
                                            isPublicJob={false}
                                        />
                                    ))}
                                    {recommendations.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-600">
                                            <Building className="w-12 h-12 mb-4" />
                                            <p>추천할 공고가 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="h-full flex flex-col"
                        >
                            {/* 검색 공고 탭 내용 */}
                            {searchError ? (
                                <div className="flex items-center justify-center h-full text-red-500">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    {searchError}
                                </div>
                            ) : searchLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                    공고를 검색하는 중...
                                </div>
                            ) : (
                                <>
                                    {/* 검색 결과 헤더 */}
                                    {totalCount > 0 && (
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                총 <span className="font-semibold text-indigo-600">{totalCount.toLocaleString()}</span>개의 공고
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {currentPage}페이지 / {Math.ceil(totalCount / 20)}페이지
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex-1 overflow-y-auto pr-2">
                                        <div className="space-y-3">
                                            {searchJobs.map((job) => (
                                                <JobCard
                                                    key={job.recrutPblntSn}
                                                    job={job}
                                                    isPublicJob={true}
                                                />
                                            ))}
                                        </div>

                                        {searchJobs.length === 0 && !searchLoading && (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-600">
                                                <Search className="w-12 h-12 mb-4" />
                                                <p className="text-center">
                                                    {filters.title || filters.workRgnLst.length > 0 || filters.hireTypeLst.length > 0 || filters.recrutSe || filters.acbgCondLst.length > 0 || filters.ncsCdLst.length > 0
                                                        ? '검색 조건에 맞는 공고가 없습니다.'
                                                        : '검색어를 입력하거나 필터를 설정해주세요.'
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* 페이지네이션 */}
                                    {totalCount > 20 && (
                                        <Pagination
                                            currentPage={currentPage}
                                            totalCount={totalCount}
                                            itemsPerPage={20}
                                            onPageChange={handlePageChange}
                                        />
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 필터 모달 */}
            <AnimatePresence>
                {isFilterModalOpen && (
                    <FilterModal
                        isOpen={isFilterModalOpen}
                        onClose={() => setIsFilterModalOpen(false)}
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                    />
                )}
            </AnimatePresence>
        </div>
    )
})

EnhancedJobRecommendations.displayName = "EnhancedJobRecommendations"

export default EnhancedJobRecommendations