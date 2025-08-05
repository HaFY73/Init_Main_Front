// lib/dateUtils.ts

/**
 * Date 객체를 yyyy-MM-dd 형식의 문자열로 변환
 */
export function formatDateToString(date: Date | string | null | undefined): string | undefined {
    if (!date) return undefined;

    if (typeof date === 'string') {
        // 이미 문자열인 경우, 올바른 형식인지 확인
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(date)) {
            return date;
        }
        // 잘못된 형식이면 Date로 파싱 후 다시 포맷
        date = new Date(date);
    }

    if (date instanceof Date && !isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
    }

    return undefined;
}

/**
 * 날짜 문자열을 Date 객체로 변환
 */
export function parseDateFromString(dateString: string | null | undefined): Date | undefined {
    if (!dateString) return undefined;

    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date : undefined;
}