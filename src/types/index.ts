/**
 * AI 스마트 스토리 플랫폼 - 타입 정의
 * 백엔드 ERD 기반 TypeScript 인터페이스
 */

// === Enums ===
export type Genre =
  | "FANTASY"
  | "ROMANCE"
  | "MARTIAL_ARTS"
  | "THRILLER"
  | "SF"
  | "DRAMA";

export type WorkStatus = "ONGOING" | "HIATUS" | "COMPLETED";

// === Users (사용자) ===
export interface User {
  id: string; // UUID
  email: string;
  nickname: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// === Works (작품) ===
export interface Work {
  id: string; // UUID
  authorId: string;
  title: string;
  synopsis: string;
  authorNickname?: string; // 백엔드 응답 필드
  coverImageUrl?: string;
  genre: Genre;
  status: WorkStatus;
  ratingSum: number; // 역정규화: 별점 합계
  ratingCount: number; // 역정규화: 별점 개수
  createdAt: string;
  updatedAt: string;
  // 프론트엔드 계산/확장 필드
  avgRating?: number;
  author?: User;
  chapters?: Chapter[]; // 작품 상세 조회 시 챕터 목록 포함
}

// === Chapters (챕터/회차) ===
export interface Chapter {
  id: string; // UUID
  workId: string;
  title: string;
  content: string;
  chapterNumber: number;
  viewCount: number;
  ratingSum: number; // 역정규화: 별점 합계
  ratingCount: number; // 역정규화: 별점 개수
  createdAt: string;
  updatedAt: string;
  // 프론트엔드 계산 필드
  avgRating?: number;
}

// === Comments (계층형 댓글) - Self-referencing 구조 ===
export interface Comment {
  id: string; // UUID
  chapterId: string;
  userId: string;
  parentId: string | null; // 대댓글일 경우 부모 ID
  content: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  // 프론트엔드 확장 필드
  author?: User;
  replies?: Comment[]; // 자식 댓글 (재귀 구조)
  isLiked?: boolean; // 현재 사용자의 좋아요 여부
}

// === ChapterRatings (챕터 별점) - 1~10점 ===
export interface ChapterRating {
  id: string;
  chapterId: string;
  userId: string;
  score: number; // 1~10
  createdAt: string;
  updatedAt: string;
}

// === CommentLikes (댓글 좋아요) ===
export interface CommentLike {
  id: string;
  commentId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// === Libraries (내 서재) ===
export interface Library {
  id: string;
  userId: string;
  workId: string;
  createdAt: string;
  updatedAt: string;
  work?: Work; // 조인된 작품 정보
}

// === Bookmarks (북마크/읽은 위치) ===
export interface Bookmark {
  id: string;
  userId: string;
  chapterId: string;
  position: number; // 읽은 위치 (스크롤 위치 등)
  createdAt: string;
  updatedAt: string;
}

// === API Response Types ===
export interface RatingResponse {
  myRating: number | null; // 내 별점 (없으면 null)
  avgRating: number; // 평균 별점
  ratingCount: number; // 별점 참여 인원
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

// === API Request Types ===
export interface CreateWorkRequest {
  title: string;
  synopsis: string;
  genre: Genre;
  coverImageUrl?: string;
}

export interface CreateChapterRequest {
  title: string;
  content: string;
  chapterNumber: number;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string; // 대댓글인 경우
}

export interface RatingRequest {
  score: number; // 1~10
}

// === Auth Types ===
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
