import { useState, useEffect } from 'react';
import { getCurrentUserId } from '@/utils/auth';

// ProfileData 타입 정의
export interface ProfileData {
    id: number;
    userId: number;
    displayName: string;
    profileImageUrl?: string;
    jobTitle?: string;
    company?: string;
    location?: string;
    bio?: string;
    followersCount?: number;
    followingCount?: number;
    postsCount?: number;
    isFollowing?: boolean;
    coverImageUrl?: string;
    isPublic?: boolean;
    allowFollow?: boolean;
}

// 🔥 현재 사용자 프로필 훅 (매개변수 없음)
export const useCommunityProfile = () => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentUserId = getCurrentUserId();

    const fetchProfile = async () => {
        if (!currentUserId) {
            console.log('❌ 사용자 ID가 없습니다.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('🔄 현재 사용자 프로필 조회:', currentUserId);

            const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
            
            // 🔥 커뮤니티 프로필 API 사용
            const response = await fetch(`https://initmainback-production.up.railway.app/api/community/profile/${currentUserId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ 커뮤니티 프로필 응답:', result);
                
                if (result.success && result.data) {
                    console.log('✅ 프로필 데이터 설정:', result.data);
                    setProfile(result.data);
                } else {
                    console.log('⚠️ 프로필 데이터가 없음');
                    setProfile(null);
                }
            } else {
                console.error('❌ 프로필 API 응답 오류:', response.status);
                setError('프로필을 불러올 수 없습니다.');
            }
        } catch (err) {
            console.error('❌ 프로필 조회 실패:', err);
            setError('네트워크 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [currentUserId]);

    return {
        profile,
        loading,
        error,
        refetch: fetchProfile
    };
};

// 🔥 특정 사용자 프로필 훅 (매개변수 있음)
export const useUserProfile = (userId: number | null) => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
            const currentUserId = getCurrentUserId();
            
            // 🔥 커뮤니티 프로필 API 사용 (currentUserId 파라미터 추가)
            const url = new URL(`https://initmainback-production.up.railway.app/api/community/profile/${userId}`);
            if (currentUserId) {
                url.searchParams.append('currentUserId', currentUserId.toString());
            }
            
            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setProfile(result.data);
                } else {
                    setProfile(null);
                }
            } else {
                setError('프로필을 불러올 수 없습니다.');
            }
        } catch (err) {
            console.error('프로필 조회 실패:', err);
            setError('네트워크 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    return {
        profile,
        loading,
        error,
        refetch: fetchProfile
    };
};

export default useCommunityProfile;
