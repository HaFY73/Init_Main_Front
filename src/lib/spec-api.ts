// src/lib/spec-api.ts

//const BASE_URL = 'http://localhost:8080/api';

const BASE_URL = `https://initmainback-production.up.railway.app/api`;


// =============================================================================
// 타입 정의 (기존 컴포넌트와 호환)
// =============================================================================

export interface SpecApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 기존 컴포넌트에서 사용하는 타입들 그대로 사용
export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  careerLevel: string;
  jobTitle: string;
  introduction: string;
  birthDate?: string; // 생년월일 추가
  skills?: string[]; // 스킬 배열 추가
}

export interface CareerStats {
  experience: string;
  workRecords: string;
  careerGoal: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  acquisitionDate: string;
}

export interface Link {
  id: string;
  title: string;
  url: string;
}

export interface Language {
  id: string;
  language: string;
  level: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface Activity {
  id: string;
  name: string;
  organization: string;
  startDate: string;
  endDate: string;
}

export interface Military {
  id: string;
  serviceType: string;
  militaryBranch: string;
  startDate: string;
  endDate: string;
}

export interface UserSpecData {
  profile: ProfileData;
  careerStats: CareerStats;
  skills: string[];
  workExperiences: WorkExperience[];
  educations: Education[];
  certificates: Certificate[];
  links: Link[];
  languages: Language[];
  projects: Project[];
  activities: Activity[];
  military: Military[];
}

// 백엔드 데이터 타입 정의 (any 타입 제거)
interface BackendSkill {
  id?: number;
  name: string;
}

interface BackendWorkExperience {
  id?: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface BackendEducation {
  id?: number;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
}

interface BackendCertificate {
  id?: number;
  name: string;
  organization1?: string; // 백엔드 실제 필드명 추가
  organization?: string;
  issuer?: string;
  acquisitionDate: string;
}

interface BackendLink {
  id?: number;
  title: string;
  url: string;
}

interface BackendLanguage {
  id?: number;
  language?: string;
  name?: string;
  level: number; // string → number로 변경
  testName?: string;
  score?: string;
  acquisitionDate?: string;
}

interface BackendProject {
  id?: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

interface BackendActivity {
  id?: number;
  name: string;
  organization: string;
  startDate: string;
  endDate: string;
}

interface BackendMilitary {
  id?: number;
  serviceType: string;
  militaryBranch: string;
  startDate: string;
  endDate: string;
}

interface BackendSpecData {
  profile?: ProfileData;
  careerStats?: CareerStats;
  skills?: (BackendSkill | string)[];
  workExperiences?: BackendWorkExperience[];
  educations?: BackendEducation[];
  certificates?: BackendCertificate[];
  links?: BackendLink[];
  languages?: BackendLanguage[];
  projects?: BackendProject[];
  activities?: BackendActivity[];
  militaries?: BackendMilitary[];
}

// =============================================================================
// HTTP 클라이언트
// =============================================================================

const apiCall = async <T>(endpoint: string, options: RequestInit = {}): Promise<SpecApiResponse<T>> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    console.log('🔍 Spec API 호출:', `${BASE_URL}${endpoint}`, {
      method: options.method || 'GET',
      hasToken: !!token
    });

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    console.log('📡 Spec API 응답:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });

    // 🔥 빈 응답 처리
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true, data: {} as T };
    }

    // 🔥 텍스트로 먼저 받아서 JSON 파싱 시도
    const responseText = await response.text();
    console.log('📝 응답 텍스트 길이:', responseText.length);

    let responseBody: SpecApiResponse<T>;
    
    if (responseText.trim()) {
      try {
        responseBody = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON 파싱 실패:', parseError);
        console.error('응답 내용:', responseText.substring(0, 200));
        throw new Error(`서버 응답을 파싱할 수 없습니다: ${responseText.substring(0, 100)}`);
      }
    } else {
      console.warn('⚠️ 빈 응답 받음');
      responseBody = { success: true, data: {} as T };
    }

    if (!response.ok) {
      console.error('❌ API 응답 에러:', {
        status: response.status,
        statusText: response.statusText,
        message: responseBody.message,
        endpoint
      });

      if (response.status === 401) {
        console.log('🔄 토큰 만료, 로그아웃 처리');
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
      throw new Error(responseBody.message || `API 호출 실패: ${response.status}`);
    }

    console.log('✅ Spec API 성공:', responseBody.success);
    return responseBody;
  } catch (error) {
    console.error('❌ API 호출 중 오류 발생:', {
      endpoint,
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
};

// =============================================================================
// 데이터 변환 함수
// =============================================================================

const transformBackendData = (backendData: BackendSpecData): UserSpecData => {
  return {
    profile: backendData.profile || {
      name: "",
      email: "",
      phone: "",
      location: "",
      careerLevel: "",
      jobTitle: "",
      introduction: ""
    },
    careerStats: backendData.careerStats || {
      experience: "",
      workRecords: "",
      careerGoal: ""
    },
    skills: (backendData.skills || []).map((skill: BackendSkill | string) =>
        typeof skill === 'string' ? skill : skill.name
    ),
    workExperiences: (backendData.workExperiences || []).map((exp: BackendWorkExperience) => ({
      ...exp,
      id: exp.id?.toString() || Date.now().toString()
    })),
    educations: (backendData.educations || []).map((edu: BackendEducation) => ({
      ...edu,
      id: edu.id?.toString() || Date.now().toString()
    })),
    certificates: (backendData.certificates || []).map((cert: BackendCertificate) => ({
      id: cert.id?.toString() || Date.now().toString(),
      name: cert.name,
      issuer: cert.organization1 || cert.organization || cert.issuer || "", // organization1 우선 사용
      acquisitionDate: cert.acquisitionDate
    })),
    links: (backendData.links || []).map((link: BackendLink) => ({
      ...link,
      id: link.id?.toString() || Date.now().toString()
    })),
    languages: (backendData.languages || []).map((lang: BackendLanguage) => ({
      ...lang,
      id: lang.id?.toString() || Date.now().toString(),
      language: lang.language || lang.name || ""
    })),
    projects: (backendData.projects || []).map((proj: BackendProject) => ({
      ...proj,
      id: proj.id?.toString() || Date.now().toString()
    })),
    activities: (backendData.activities || []).map((act: BackendActivity) => ({
      ...act,
      id: act.id?.toString() || Date.now().toString()
    })),
    military: (backendData.militaries || []).map((mil: BackendMilitary) => ({
      ...mil,
      id: mil.id?.toString() || Date.now().toString()
    }))
  };
};

// =============================================================================
// API 함수들
// =============================================================================

export const fetchUserSpec = async (userId: number): Promise<UserSpecData> => {
  try {
    console.log('📥 스펙 데이터 요청:', userId);
    const result = await apiCall<BackendSpecData>(`/spec/${userId}`);
    if (!result.success) {
      throw new Error(result.message || '스펙 데이터를 불러오는데 실패했습니다.');
    }
    console.log('✅ 스펙 데이터 로딩 성공:', result.data);
    return transformBackendData(result.data);
  } catch (error) {
    console.error('❌ 스펙 데이터 로딩 실패:', error);
    
    // 🔥 API 실패 시 기본값 반환하여 페이지가 동작하도록 함
    console.log('🔄 기본 데이터로 fallback');
    return {
      profile: { 
        name: "", email: "", phone: "", location: "", 
        careerLevel: "", jobTitle: "", introduction: "" 
      },
      careerStats: { 
        experience: "", workRecords: "", careerGoal: "" 
      },
      skills: [],
      workExperiences: [],
      educations: [],
      certificates: [],
      links: [],
      languages: [],
      projects: [],
      activities: [],
      military: []
    };
  }
};

export const updateProfile = async (userId: number, profileData: ProfileData): Promise<ProfileData> => {
  // 🔥 프로필 데이터 검증 및 정제
  const validatedProfile = {
    name: profileData.name?.trim() || "",
    email: profileData.email?.trim() || "",
    phone: profileData.phone?.trim() || "",
    location: profileData.location?.trim() || "",
    careerLevel: profileData.careerLevel?.trim() || "",
    jobTitle: profileData.jobTitle?.trim() || "",
    introduction: profileData.introduction?.trim() || "",
    birthDate: profileData.birthDate || null, // 생년월일 추가
    skills: profileData.skills || [] // 스킬 배열 추가
  };

  console.log('📤 프로필 데이터 전송:', validatedProfile);

  const result = await apiCall<ProfileData>(`/spec/${userId}/profile`, {
    method: 'PUT',
    body: JSON.stringify(validatedProfile),
  });
  if (!result.success) {
    throw new Error(result.message || '프로필 업데이트에 실패했습니다.');
  }
  return result.data;
};

export const updateSkills = async (userId: number, skills: string[]): Promise<string[]> => {
  const result = await apiCall<string[]>(`/spec/${userId}/skills`, {
    method: 'PUT',
    body: JSON.stringify(skills),
  });
  if (!result.success) {
    throw new Error(result.message || '스킬 업데이트에 실패했습니다.');
  }
  return result.data;
};

export const updateWorkExperiences = async (userId: number, experiences: WorkExperience[]): Promise<WorkExperience[]> => {
  // 🔥 데이터 검증 및 정제
  const validatedExperiences = experiences.map((exp, index) => {
    // 필수 필드 검증 - 더 유연하게 처리
    if (!exp.company?.trim() || !exp.position?.trim()) {
      throw new Error(`${index + 1}번째 경력의 회사명과 직책은 필수입니다.`);
    }

    // 날짜 형식 검증 (날짜가 있는 경우에만)
    if (exp.startDate && !exp.startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error(`${index + 1}번째 경력의 시작일 형식이 올바르지 않습니다. (YYYY-MM-DD)`);
    }
    if (exp.endDate && !exp.endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error(`${index + 1}번째 경력의 종료일 형식이 올바르지 않습니다. (YYYY-MM-DD)`);
    }

    return {
      company: exp.company.trim(),
      position: exp.position.trim(),
      department: exp.department?.trim() || "",
      startDate: exp.startDate || null,
      endDate: exp.endDate || null,
      isCurrent: exp.isCurrent || false,
      description: exp.description?.trim() || "",
      displayOrder: index
    };
  });

  console.log('📤 업무 경력 데이터 전송:', validatedExperiences);

  const result = await apiCall<WorkExperience[]>(`/spec/${userId}/careers`, {
    method: 'PUT',
    body: JSON.stringify(validatedExperiences),
  });
  if (!result.success) {
    throw new Error(result.message || '업무 경력 업데이트에 실패했습니다.');
  }
  return result.data;
};

export const updateEducations = async (userId: number, educations: Education[]): Promise<Education[]> => {
  // 🔥 데이터 검증 및 정제
  const validatedEducations = educations.map((edu, index) => {
    // 필수 필드 검증 - 더 유연하게 처리
    if (!edu.school?.trim() || !edu.major?.trim() || !edu.degree?.trim()) {
      throw new Error(`${index + 1}번째 학력의 학교명, 전공, 학위는 필수입니다.`);
    }

    // 날짜 형식 검증 (날짜가 있는 경우에만)
    if (edu.startDate && !edu.startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error(`${index + 1}번째 학력의 입학일 형식이 올바르지 않습니다. (YYYY-MM-DD)`);
    }
    if (edu.endDate && !edu.endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error(`${index + 1}번째 학력의 졸업일 형식이 올바르지 않습니다. (YYYY-MM-DD)`);
    }

    return {
      school: edu.school.trim(),
      major: edu.major.trim(),
      degree: edu.degree.trim(),
      startDate: edu.startDate || null,
      endDate: edu.endDate || null,
      isCurrent: edu.isCurrent || false,
      gpa: edu.gpa || null,
      maxGpa: edu.maxGpa || null,
      description: edu.description?.trim() || "",
      displayOrder: index
    };
  });

  console.log('📤 학력 데이터 전송:', validatedEducations);

  const result = await apiCall<Education[]>(`/spec/${userId}/educations`, {
    method: 'PUT',
    body: JSON.stringify(validatedEducations),
  });
  if (!result.success) {
    throw new Error(result.message || '학력 업데이트에 실패했습니다.');
  }
  return result.data;
};

export const updateCertificates = async (userId: number, certificates: Certificate[]): Promise<Certificate[]> => {
  // 🔥 백엔드 필드명과 일치하도록 변환
  const backendCerts = certificates.map(cert => ({
    name: cert.name,
    organization1: cert.issuer, // issuer -> organization1으로 변환
    acquisitionDate: cert.acquisitionDate,
    displayOrder: 0 // 기본값 추가
  }));

  console.log('📤 자격증 데이터 전송:', backendCerts);

  const result = await apiCall<Certificate[]>(`/spec/${userId}/certificates`, {
    method: 'PUT',
    body: JSON.stringify(backendCerts),
  });
  if (!result.success) {
    throw new Error(result.message || '자격증 업데이트에 실패했습니다.');
  }
  return result.data;
};

export const updateLinks = async (userId: number, links: Link[]): Promise<Link[]> => {
  const result = await apiCall<Link[]>(`/spec/${userId}/links`, {
    method: 'PUT',
    body: JSON.stringify(links),
  });
  if (!result.success) {
    throw new Error(result.message || '링크 업데이트에 실패했습니다.');
  }
  return result.data;
};

export const updateLanguages = async (userId: number, languages: Language[]): Promise<Language[]> => {
  const backendLanguages = languages.map((lang, index) => ({
    name: lang.language?.trim() || "",
    level: parseInt(lang.level) || 1, // 숫자로 변환
    testName: lang.testName?.trim() || "",
    score: lang.score?.trim() || "",
    acquisitionDate: lang.acquisitionDate || null,
    displayOrder: index
  }));

  console.log('📤 어학 데이터 전송:', backendLanguages);

  const result = await apiCall<Language[]>(`/spec/${userId}/languages`, {
    method: 'PUT',
    body: JSON.stringify(backendLanguages),
  });
  if (!result.success) {
    throw new Error(result.message || '어학 정보 업데이트에 실패했습니다.');
  }
  return result.data;
};

export const updateProjects = async (userId: number, projects: Project[]): Promise<Project[]> => {
  const validatedProjects = projects.map((proj, index) => ({
    name: proj.name?.trim() || "",
    description: proj.description?.trim() || "",
    startDate: proj.startDate || null,
    endDate: proj.endDate || null,
    technologies: proj.technologies?.trim() || "",
    url: proj.url?.trim() || "",
    displayOrder: index
  }));

  console.log('📤 프로젝트 데이터 전송:', validatedProjects);

  const result = await apiCall<Project[]>(`/spec/${userId}/projects`, {
    method: 'PUT',
    body: JSON.stringify(validatedProjects),
  });
  if (!result.success) {
    throw new Error(result.message || '프로젝트 업데이트에 실패했습니다.');
  }
  return result.data;
};

export const updateActivities = async (userId: number, activities: Activity[]): Promise<Activity[]> => {
  const result = await apiCall<Activity[]>(`/spec/${userId}/activities`, {
    method: 'PUT',
    body: JSON.stringify(activities),
  });
  if (!result.success) {
    throw new Error(result.message || '활동 정보 업데이트에 실패했습니다.');
  }
  return result.data;
};

export const updateMilitary = async (userId: number, military: Military[]): Promise<Military[]> => {
  const result = await apiCall<Military[]>(`/spec/${userId}/militaries`, {
    method: 'PUT',
    body: JSON.stringify(military),
  });
  if (!result.success) {
    throw new Error(result.message || '병역 정보 업데이트에 실패했습니다.');
  }
  return result.data;
};

export const updateCareerStats = async (userId: number, stats: CareerStats): Promise<CareerStats> => {
  const result = await apiCall<CareerStats>(`/spec/${userId}/career-stats`, {
    method: 'PUT',
    body: JSON.stringify(stats),
  });
  if (!result.success) {
    throw new Error(result.message || '경력 통계 업데이트에 실패했습니다.');
  }
  return result.data;
};