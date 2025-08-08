// lib/dash-api.ts
// 통합 API 클라이언트 - 모든 API 호출을 여기서 관리

// 🔥 환경변수 fallback 처리 - 더 명확한 설정
const getApiBaseUrl = () => {
    // 클라이언트 사이드에서만 환경변수 확인
    if (typeof window !== 'undefined') {
        return process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://initmainback-production.up.railway.app';
    }
    // 서버 사이드에서는 기본값 사용
    return 'https://initmainback-production.up.railway.app';
};

const API_BASE_URL = getApiBaseUrl();

// =============================================================================
// 타입 정의
// =============================================================================

export interface ProfileData {
    name: string;
    email: string;
    career: string;
    job: string;
}

export interface ConditionsData {
    jobs: string[];
    locations: string[];
    salary: string;
    others: string[];
}

export interface ApplicationData {
    id: number;
    company: string;
    category: string;
    status: '지원 완료' | '서류 합격' | '최종 합격' | '불합격';
}

export interface HomeStats {
    totalApplications: number;
    documentPassed: number;
    finalPassed: number;
    rejected: number;
    totalResumes: number;
    totalCoverLetters: number;
    bookmarkedCompanies: number;
    deadlineSoon: number;
}

export interface ProfileCompletion {
    basicInfo: boolean;
    desiredConditions: boolean;
    workExperience: boolean;
    education: boolean;
    certificates: boolean;
    languages: boolean;
    skills: boolean;
    links: boolean;
    military: boolean;
    portfolio: boolean;
    completionPercentage?: number;
}

export interface TodoItem {
    id: number;
    text: string;
    completed: boolean;
}

export interface DashboardData {
    profile: ProfileData;
    conditions: ConditionsData;
    applications: ApplicationData[];
    stats: HomeStats;
    completion: ProfileCompletion;
    todos: TodoItem[];
}

// 🔥 공고 추천 요청 타입 (백엔드 JobRecommendationRequestDto와 일치)
export interface JobRecommendationRequestDto {
    keywords: string[];
    locations: string[];
}

// 🔥 공고 추천 관련 타입
export interface JobRecommendation {
    id: string;
    title: string;
    company: string;
    location: string;
    experience: string;
    education: string;
    employmentType: string;
    salary: string;
    deadline: string;
    url: string;
    keywords: string[];
    postedDate: string;
    matchScore: number;
    description?: string;
    requirements?: string;
    benefits?: string;
    recruitCount?: string;
}

// 🔥 공고 검색 관련 타입
export interface PublicJobPosting {
    recrutPblntSn: string
    instNm: string
    recrutPbancTtl: string
    recrutSeNm: string
    hireTypeNmLst: string
    workRgnNmLst: string
    acbgCondNmLst: string
    pbancBgngYmd: string
    pbancEndYmd: string
    srcUrl: string
    recrutNope: number
    aplyQlfcCn: string
    decimalDay: number
}

export interface PublicJobSearchRequest {
    keywords?: string[]
    locations?: string[]
    pageNo?: number
    numOfRows?: number
    hireTypeLst?: string[]
    recrutSe?: string
    acbgCondLst?: string[]
    ncsCdLst?: string[]
}

export interface PublicJobSearchResponse {
    resultCode: number
    resultMsg: string
    totalCount: number
    result: PublicJobPosting[]
}

// 🔥 Job Calendar 관련 타입 추가
export interface JobPostingDto {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    location?: string;
    position?: string;
    salary?: string;
    color?: string;
    status: 'ACTIVE' | 'EXPIRED' | 'UPCOMING' | 'CLOSED';
    description?: string;
    company?: string;
    department?: string;
    experienceLevel?: string;
    employmentType?: string;
    createdAt: string;
    updatedAt: string;
}

export interface JobBookmarkDto {
    id: number;
    userId?: number;
    jobPosting: JobPostingDto;
    memo?: string;
    status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
    createdAt: string;
}

export interface CreateJobPostingRequest {
    title: string;
    startDate: string;
    endDate: string;
    location?: string;
    position?: string;
    salary?: string;
    color?: string;
    description?: string;
    company?: string;
    department?: string;
    experienceLevel?: string;
    employmentType?: string;
}

export interface CreateJobBookmarkRequest {
    userId: number;
    jobPostingId: number;
    memo?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    errorCode?: string;
}

// 백엔드 응답 타입 (enum 형태)
export type ApplicationStatusEnum = 'APPLIED' | 'DOCUMENT_PASSED' | 'FINAL_PASSED' | 'REJECTED';

// =============================================================================
// HTTP 클라이언트 설정
// =============================================================================

interface ApiClientConfig {
    headers: Record<string, string>;
    credentials: RequestCredentials;
}

// 🔥 통합된 API 클라이언트 생성 함수
const createApiClient = (includeUserId?: string): ApiClientConfig => {
    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // JWT 토큰이 있다면 헤더에 추가
    const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('authToken') || localStorage.getItem('accessToken'))
        : null;
    
    if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
    }

    // 🔥 Job Calendar API용 x-user-id 헤더 추가
    if (includeUserId) {
        defaultHeaders['x-user-id'] = includeUserId;
    }

    return {
        headers: defaultHeaders,
        credentials: 'include',
    };
};

// 🔥 통합 HTTP 요청 헬퍼 함수 - 에러 처리 강화
const apiRequest = async <T>(
    url: string, 
    options: RequestInit = {}, 
    includeUserId?: string,
    expectApiWrapper: boolean = false
): Promise<T> => {
    const config = createApiClient(includeUserId);

    // 🔥 URL 구성 검증
    const fullUrl = `${API_BASE_URL}${url}`;
    
    try {
        console.log('🌐 API 요청:', fullUrl, {
            method: options.method || 'GET',
            includeUserId,
            expectApiWrapper,
            baseUrl: API_BASE_URL
        });

        const response = await fetch(fullUrl, {
            ...config,
            ...options,
            headers: {
                ...config.headers,
                ...options.headers,
            },
        });

        console.log('📡 API 응답:', {
            url: fullUrl,
            status: response.status, 
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            let errorText = '';
            try {
                errorText = await response.text();
            } catch (e) {
                errorText = `HTTP ${response.status} ${response.statusText}`;
            }
            
            console.error('❌ API 에러 응답:', {
                status: response.status,
                statusText: response.statusText,
                errorText: errorText,
                url: fullUrl
            });
            
            throw new Error(`HTTP error! status: ${response.status} - ${errorText || response.statusText}`);
        }

        // 🔥 API 응답 형태에 따라 분기 처리
        if (expectApiWrapper) {
            // Job Calendar API - ApiResponse 래퍼 사용
            const data: ApiResponse<T> = await response.json();
            console.log('📦 ApiResponse 래퍼:', data.success, data.message);
            if (!data.success) {
                throw new Error(data.message || '요청이 실패했습니다.');
            }
            return data.data;
        } else {
            // Home API, Public Jobs API - 직접 반환
            const result = await response.json();
            console.log('📄 직접 응답:', typeof result, Array.isArray(result) ? `배열(${result.length}개)` : '객체');
            return result;
        }
    } catch (error) {
        console.error('❌ API 요청 실패:', {
            url: fullUrl,
            error: error instanceof Error ? error.message : error,
            baseUrl: API_BASE_URL
        });
        throw error;
    }
};

// =============================================================================
// Home API 함수들
// =============================================================================

export const getUserId = (): string => {
    if (typeof window === 'undefined') return '1'; // SSR 환경
    return localStorage.getItem('userId') || '1';
};

export const getProfileData = async (): Promise<ProfileData> => {
    const userId = getUserId();
    console.log('🔍 프로필 조회 API 호출:', userId);

    try {
        const data = await apiRequest<any>(`/api/home/profile/${userId}`, {
            method: 'GET'
        });

        console.log('✅ 프로필 조회 성공:', data);

        return {
            name: data.name || '',
            email: data.email || '',
            career: data.careerType || '신입',
            job: data.jobTitle || ''
        };
    } catch (error) {
        console.error('❌ 프로필 조회 실패:', error);
        // 404/405 에러 시 기본값 반환
        return {
            name: '',
            email: '',
            career: '신입',
            job: ''
        };
    }
};

export const updateProfileData = async (profileData: ProfileData): Promise<void> => {
    const userId = getUserId();
    console.log('💾 프로필 저장 API 호출:', { userId, profileData });

    try {
        const backendData = {
            name: profileData.name,
            email: profileData.email,
            careerType: profileData.career,
            jobTitle: profileData.job,
            matching: true
        };

        await apiRequest(`/api/home/profile/${userId}`, {
            method: 'POST',
            body: JSON.stringify(backendData)
        });

        console.log('✅ 프로필 저장 성공');
    } catch (error) {
        console.error('❌ 프로필 저장 실패:', error);
        throw error;
    }
};

export const getDesiredConditions = async (): Promise<ConditionsData> => {
    const userId = getUserId();
    console.log('🔍 희망조건 조회 API 호출:', userId);

    try {
        const data = await apiRequest<any>(`/api/home/conditions/${userId}`, {
            method: 'GET'
        });

        console.log('✅ 희망조건 조회 성공:', data);

        return {
            jobs: data.jobs || [],
            locations: data.locations || [],
            salary: data.salary || '0',
            others: data.others || []
        };
    } catch (error) {
        console.error('❌ 희망조건 조회 실패:', error);
        // 404/405 에러 시 기본값 반환
        return {
            jobs: [],
            locations: [],
            salary: '0',
            others: []
        };
    }
};

export const updateDesiredConditions = async (conditionsData: ConditionsData): Promise<void> => {
    const userId = getUserId();
    console.log('💾 희망조건 저장 API 호출:', { userId, conditionsData });

    try {
        await apiRequest(`/api/home/conditions/${userId}`, {
            method: 'POST',
            body: JSON.stringify(conditionsData)
        });

        console.log('✅ 희망조건 저장 성공');
    } catch (error) {
        console.error('❌ 희망조건 저장 실패:', error);
        throw error;
    }
};

export const getApplications = async (): Promise<ApplicationData[]> => {
    const userId = getUserId();
    console.log('🔍 지원현황 조회 API 호출:', userId);

    try {
        const data = await apiRequest<any[]>(`/api/home/applications/${userId}`, {
            method: 'GET'
        });

        console.log('✅ 지원현황 조회 성공:', data);

        return data.map((app: any) => ({
            id: app.id,
            company: app.company,
            category: app.category,
            status: app.status
        }));
    } catch (error) {
        console.error('❌ 지원현황 조회 실패:', error);
        // 404/405 에러 시 빈 배열 반환
        return [];
    }
};

export const updateApplications = async (applications: ApplicationData[]): Promise<void> => {
    const userId = getUserId();
    console.log('💾 지원현황 저장 API 호출:', applications);

    try {
        const applicationsWithUserId = applications.map(app => ({
            ...app,
            userId: parseInt(userId)
        }));

        await apiRequest(`/api/home/applications/batch/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(applicationsWithUserId)
        });

        console.log('✅ 지원현황 저장 성공');
    } catch (error) {
        console.error('❌ 지원현황 저장 실패:', error);
        throw error;
    }
};

// =============================================================================
// 통계 및 기타 Home API 함수들
// =============================================================================

export const getHomeStats = async (): Promise<HomeStats> => {
    const userId = getUserId();
    console.log('📊 통계 조회 API 호출:', userId);

    try {
        const data = await apiRequest<any>(`/api/home/stats/${userId}`, {
            method: 'GET'
        });

        console.log('✅ 통계 조회 성공:', data);

        return {
            totalApplications: data.totalApplications || 0,
            documentPassed: data.documentPassed || 0,
            finalPassed: data.finalPassed || 0,
            rejected: data.rejected || 0,
            totalResumes: data.totalResumes || 0,
            totalCoverLetters: data.totalCoverLetters || 0,
            bookmarkedCompanies: data.bookmarkedCompanies || 0,
            deadlineSoon: data.deadlineSoon || 0
        };
    } catch (error) {
        console.error('❌ 통계 조회 실패:', error);
        // 에러 시 기본 통계 반환
        return {
            totalApplications: 0,
            documentPassed: 0,
            finalPassed: 0,
            rejected: 0,
            totalResumes: 0,
            totalCoverLetters: 0,
            bookmarkedCompanies: 0,
            deadlineSoon: 0
        };
    }
};

export const getProfileCompletion = async (): Promise<ProfileCompletion> => {
    const userId = getUserId();
    console.log('🔍 프로필 완성도 조회 API 호출:', userId);

    try {
        const data = await apiRequest<any>(`/api/home/completion/${userId}`, {
            method: 'GET'
        });

        console.log('✅ 프로필 완성도 조회 성공:', data);

        return {
            basicInfo: data.basicInfo || false,
            desiredConditions: data.desiredConditions || false,
            workExperience: data.workExperience || false,
            education: data.education || false,
            certificates: data.certificates || false,
            languages: data.languages || false,
            skills: data.skills || false,
            links: data.links || false,
            military: data.military || false,
            portfolio: data.portfolio || false,
            completionPercentage: data.completionPercentage || 0
        };
    } catch (error) {
        console.error('❌ 프로필 완성도 조회 실패:', error);
        // 에러 시 기본값 반환
        return {
            basicInfo: false,
            desiredConditions: false,
            workExperience: false,
            education: false,
            certificates: false,
            languages: false,
            skills: false,
            links: false,
            military: false,
            portfolio: false,
            completionPercentage: 0
        };
    }
};

export const getDashboardData = async (): Promise<DashboardData> => {
    console.log('🔍 전체 대시보드 데이터 조회 시작');

    try {
        // 병렬로 모든 데이터 요청 (에러가 나도 다른 데이터는 계속 로드)
        const [profile, conditions, applications, stats, completion] = await Promise.allSettled([
            getProfileData(),
            getDesiredConditions(), 
            getApplications(),
            getHomeStats(),
            getProfileCompletion()
        ]);

        const result: DashboardData = {
            profile: profile.status === 'fulfilled' ? profile.value : { name: '', email: '', career: '신입', job: '' },
            conditions: conditions.status === 'fulfilled' ? conditions.value : { jobs: [], locations: [], salary: '0', others: [] },
            applications: applications.status === 'fulfilled' ? applications.value : [],
            stats: stats.status === 'fulfilled' ? stats.value : {
                totalApplications: 0, documentPassed: 0, finalPassed: 0, rejected: 0,
                totalResumes: 0, totalCoverLetters: 0, bookmarkedCompanies: 0, deadlineSoon: 0
            },
            completion: completion.status === 'fulfilled' ? completion.value : {
                basicInfo: false, desiredConditions: false, workExperience: false, education: false,
                certificates: false, languages: false, skills: false, links: false, military: false, portfolio: false
            },
            todos: [] // TODO 기능이 구현되면 추가
        };

        console.log('✅ 전체 대시보드 데이터 조회 완료');
        return result;
    } catch (error) {
        console.error('❌ 전체 대시보드 데이터 조회 실패:', error);
        throw error;
    }
};

// =============================================================================
// 🔥 공고 추천 관련 API
// =============================================================================

export const getJobRecommendations = async (
    userId: number,
    keywords: string[],
    locations: string[]
): Promise<JobRecommendation[]> => {
    try {
        console.log('🔍 공고 추천 API 호출:', { userId, keywords, locations });

        // 🔥 올바른 request body 구조로 수정 (백엔드 JobRecommendationRequestDto와 일치)
        const requestBody: JobRecommendationRequestDto = {
            keywords: keywords || [],
            locations: locations || []
        };

        console.log('📤 요청 데이터:', requestBody);

        const data = await apiRequest<JobRecommendation[]>(`/api/home/job-recommendations/${userId}`, {
            method: 'POST',
            body: JSON.stringify(requestBody)
        });

        console.log('✅ 공고 추천 조회 성공:', data?.length || 0);

        // 🔥 데이터가 없거나 배열이 아닌 경우 빈 배열 반환
        if (!data || !Array.isArray(data)) {
            console.warn('⚠️ 응답 데이터가 배열이 아닙니다:', data);
            return [];
        }

        return data.map(job => ({
            ...job,
            deadline: job.deadline || '정보 없음',
            postedDate: job.postedDate || '',
            id: job.id || `${job.company}-${job.title}-${Math.random()}`,
            url: job.url || '#'
        }));

    } catch (error) {
        console.error('❌ 공고 추천 API 실패:', error);
        // 🔥 에러 발생시 빈 배열 반환 (throw하지 않음)
        return [];
    }
};

// =============================================================================
// 🔥 공고 검색 관련 API
// =============================================================================

export const searchPublicJobs = async (
    searchParams: PublicJobSearchRequest
): Promise<PublicJobSearchResponse> => {
    try {
        console.log('📡 공공데이터 채용정보 검색 요청:', searchParams);

        const result = await apiRequest<PublicJobSearchResponse>('/api/public-jobs/search', {
            method: 'POST',
            body: JSON.stringify(searchParams)
        });

        console.log('✅ 공공데이터 채용정보 검색 성공:', {
            totalCount: result.totalCount,
            resultCount: result.result?.length || 0
        });

        return result;

    } catch (error) {
        console.error('❌ 공고 검색 API 실패:', error);
        throw error;
    }
};

// =============================================================================
// 🔥 Job Calendar API 함수들
// =============================================================================

// 북마크 관련 API - 에러 처리 강화
export const getBookmarksByUserId = async (userId: number): Promise<JobBookmarkDto[]> => {
    try {
        console.log('🔍 북마크 조회 API 호출:', userId);

        const data = await apiRequest<JobBookmarkDto[]>(
            `/api/job-calendar/bookmarks/user/${userId}`, 
            { method: 'GET' },
            userId.toString(),
            true // ApiResponse 래퍼 사용
        );

        console.log('✅ 북마크 조회 성공:', data.length);
        return data;
    } catch (error) {
        console.error('❌ 북마크 조회 실패:', error);
        // 404/401 에러 시 빈 배열 반환 (에러를 throw하지 않음)
        return [];
    }
};

export const createJobPosting = async (request: CreateJobPostingRequest, userId: number): Promise<JobPostingDto> => {
    try {
        console.log('📝 공고 생성 API 호출:', { request, userId });

        const data = await apiRequest<JobPostingDto>(
            '/api/job-calendar/job-postings',
            {
                method: 'POST',
                body: JSON.stringify(request)
            },
            userId.toString(),
            true // ApiResponse 래퍼 사용
        );

        console.log('✅ 공고 생성 성공:', data);
        return data;
    } catch (error) {
        console.error('❌ 공고 생성 실패:', error);
        throw error;
    }
};

export const updateJobPosting = async (id: number, request: CreateJobPostingRequest, userId: number): Promise<JobPostingDto> => {
    try {
        console.log('🔄 공고 수정 API 호출:', { id, request, userId });

        const data = await apiRequest<JobPostingDto>(
            `/api/job-calendar/job-postings/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify(request)
            },
            userId.toString(),
            true // ApiResponse 래퍼 사용
        );

        console.log('✅ 공고 수정 성공:', data);
        return data;
    } catch (error) {
        console.error('❌ 공고 수정 실패:', error);
        throw error;
    }
};

export const createBookmark = async (request: CreateJobBookmarkRequest): Promise<JobBookmarkDto> => {
    try {
        console.log('📌 북마크 생성 API 호출:', request);

        const data = await apiRequest<JobBookmarkDto>(
            '/api/job-calendar/bookmarks',
            {
                method: 'POST',
                body: JSON.stringify(request)
            },
            request.userId.toString(),
            true // ApiResponse 래퍼 사용
        );

        console.log('✅ 북마크 생성 성공:', data);
        return data;
    } catch (error) {
        console.error('❌ 북마크 생성 실패:', error);
        throw error;
    }
};

export const deleteBookmarkByUserAndJob = async (userId: number, jobPostingId: number): Promise<void> => {
    try {
        console.log('🗑️ 북마크 삭제 API 호출:', { userId, jobPostingId });

        await apiRequest<void>(
            `/api/job-calendar/bookmarks/user/${userId}/job/${jobPostingId}`,
            { method: 'DELETE' },
            userId.toString(),
            true // ApiResponse 래퍼 사용
        );

        console.log('✅ 북마크 삭제 성공');
    } catch (error) {
        console.error('❌ 북마크 삭제 실패:', error);
        throw error;
    }
};

// =============================================================================
// 유틸리티 함수들
// =============================================================================

// 날짜 변환 유틸리티
export const dateToISOString = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const convertDatesToStrings = (request: {
    title: string;
    start: Date;
    end: Date;
    position?: string;
    location?: string;
    salary?: string;
    color?: string;
    description?: string;
    company?: string;
    department?: string;
    experienceLevel?: string;
    employmentType?: string;
}): CreateJobPostingRequest => {
    return {
        title: request.title,
        startDate: dateToISOString(request.start),
        endDate: dateToISOString(request.end),
        position: request.position,
        location: request.location,
        salary: request.salary,
        color: request.color,
        description: request.description,
        company: request.company,
        department: request.department,
        experienceLevel: request.experienceLevel,
        employmentType: request.employmentType,
    };
};

// 에러 처리 유틸리티
export const handleApiError = (error: Error): string => {
    if (error.message.includes('401')) {
        return '로그인이 필요합니다.';
    } else if (error.message.includes('403')) {
        return '권한이 없습니다.';
    } else if (error.message.includes('404')) {
        return '요청한 데이터를 찾을 수 없습니다.';
    } else if (error.message.includes('500')) {
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    } else {
        return error.message || '알 수 없는 오류가 발생했습니다.';
    }
};

// =============================================================================
// 🔥 통합 API 객체
// =============================================================================

export const api = {
    // Home API
    getProfileData,
    updateProfileData,
    getDesiredConditions,
    updateDesiredConditions,
    getApplications,
    updateApplications,
    getHomeStats,
    getProfileCompletion,
    getDashboardData,
    
    // Job Recommendations
    getJobRecommendations,
    
    // Public Jobs Search
    searchPublicJobs,
    
    // Job Calendar
    getBookmarksByUserId,
    createJobPosting,
    updateJobPosting,
    createBookmark,
    deleteBookmarkByUserAndJob,
    
    // Utilities
    dateToISOString,
    convertDatesToStrings,
    handleApiError
};

// =============================================================================
// React Query용 쿼리 키들
// =============================================================================

export const QUERY_KEYS = {
    dashboard: ['dashboard'] as const,
    profile: ['profile'] as const,
    conditions: ['conditions'] as const,
    applications: ['applications'] as const,
    stats: ['stats'] as const,
    completion: ['completion'] as const,
    todos: ['todos'] as const,
    jobRecommendations: ['jobRecommendations'] as const,
    publicJobSearch: ['publicJobSearch'] as const,
    jobCalendarBookmarks: ['jobCalendarBookmarks'] as const,
} as const;
