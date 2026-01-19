/**
 * 날짜 및 시간 관련 유틸리티
 */

/**
 * 상대 시간 계산 (예: "방금 전", "1시간 전")
 * SQL 포맷 (공백 구분) 및 ISO 포맷 지원
 */
export const getRelativeTime = (date: string): string => {
  if (!date) return "";

  // 1. 공백을 T로 치환 (SQL 포맷 대응: YYYY-MM-DD HH:mm:ss -> YYYY-MM-DDTHH:mm:ss)
  let stdDate = date.replace(" ", "T");

  // 2. Z가 없고, +기호(오프셋)도 없으면 Z 추가 (UTC로 간주)
  if (!stdDate.endsWith("Z") && !stdDate.includes("+")) {
    stdDate += "Z";
  }

  const commentDate = new Date(stdDate);
  const now = new Date();

  // 유효하지 않은 날짜인 경우 최후의 수단으로 폴백
  if (isNaN(commentDate.getTime())) {
    try {
      const fallbackDate = new Date(date);
      if (!isNaN(fallbackDate.getTime())) {
        return fallbackDate.toLocaleDateString("ko-KR");
      }
    } catch {
      return date;
    }
    return date;
  }

  const diffMs = now.getTime() - commentDate.getTime();

  // 미래 시간(오차) 방어
  if (diffMs < 0) return "방금 전";

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return commentDate.toLocaleDateString("ko-KR");
};
