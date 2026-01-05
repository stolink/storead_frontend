/**
 * 장르 관련 상수 (중앙화된 장르 매핑)
 * 
 * 여러 컴포넌트에서 사용되는 장르 레이블을 한 곳에서 관리합니다.
 */

/**
 * 장르 Enum 값과 한글 레이블 매핑
 */
export const GENRE_LABELS: Record<string, string> = {
    FANTASY: '판타지',
    ROMANCE: '로맨스',
    ROMANCE_FANTASY: '로판',
    TRADITIONAL_FANTASY: '정통판타지',
    MARTIAL_ARTS: '무협',
    MODERN_FANTASY: '현판',
    MYSTERY: '미스터리',
    THRILLER: '스릴러',
    SF: 'SF',
    DRAMA: '드라마',
    COMEDY: '코미디',
    HORROR: '호러',
    HEROIC_FANTASY: '영웅판타지',
    DARK_FANTASY: '다크판타지',
    URBAN_FANTASY: '어반판타지',
    HIGH_FANTASY: '하이판타지',
    ISEKAI: '이세계',
    OTHER: '기타',
};

/**
 * 장르 레이블 가져오기 (fallback 포함)
 */
export function getGenreLabel(genre: string | undefined | null): string {
    if (!genre) return '';
    return GENRE_LABELS[genre] || genre;
}

export default GENRE_LABELS;
