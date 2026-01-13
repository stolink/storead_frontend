/**
 * AI 스마트 스토리 플랫폼 - 타입 정의
 * 백엔드 ERD 기반 TypeScript 인터페이스
 */

import type { GraphSnapshotDTO } from "@/adapters/graphSnapshotAdapter";

// === Enums ===
export type Genre =
  | "FANTASY"
  | "ROMANCE"
  | "MARTIAL_ARTS"
  | "THRILLER"
  | "SF"
  | "DRAMA"
  | "HEROIC_FANTASY"
  | "DARK_FANTASY"
  | "URBAN_FANTASY"
  | "HIGH_FANTASY"
  | "ISEKAI"
  | "MODERN_FANTASY"
  | "TRADITIONAL_FANTASY"
  | "ROMANCE_FANTASY"
  | "COMEDY"
  | "HORROR"
  | "OTHER";

export type WorkStatus = "ONGOING" | "HIATUS" | "COMPLETED";

// 챕터 접근 유형 (무료/유료/독점)
export type ChapterAccessType = "FREE" | "PAID" | "EXCLUSIVE";

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
  projectId?: string; // stolink 프로젝트 ID (에디터 연결용)
  title: string;
  synopsis: string;
  authorNickname?: string; // 백엔드 응답 필드
  coverImageUrl?: string;
  genre: Genre;
  status: WorkStatus;
  ratingSum: number; // 역정규화: 별점 합계
  ratingCount: number; // 역정규화: 별점 개수
  chapterCount?: number; // 역정규화: 챕터 개수
  createdAt: string;
  updatedAt: string;
  // 프론트엔드 계산/확장 필드
  avgRating?: number;
  author?: User;
  chapters?: Chapter[]; // 작품 상세 조회 시 챕터 목록 포함
  // 유저별 상태 필드 (Discovery API)
  isLiked?: boolean;
  likeCount?: number;
  isInLibrary?: boolean;
}

// === Chapters (챕터/회차) ===
export interface Chapter {
  id: string; // UUID
  workId: string;
  documentId?: string; // stolink 문서 ID (에디터 연결용)
  title: string;
  content: string;
  chapterNumber: number;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED"; // 상태 추가
  viewCount: number;
  ratingSum: number; // 역정규화: 별점 합계
  ratingCount: number; // 역정규화: 별점 개수

  // 유료/무료 관련 필드
  isFree?: boolean; // 무료 여부 (기본값: true)
  price?: number; // 크레딧 가격
  accessType?: ChapterAccessType; // 접근 유형 (FREE/PAID/EXCLUSIVE)
  isPurchased?: boolean; // 현재 사용자가 구매했는지 여부

  graphSnapshot?: GraphSnapshotDTO; // 캐릭터 관계도 스냅샷 (JSONB)
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
  relationId?: string; // 관계 ID (link.id)
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  // 프론트엔드 확장 필드
  author?: User;
  replies?: Comment[]; // 자식 댓글 (재귀 구조)
  replyCount?: number; // 답글 개수 (lazy loading 전 표시용)
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
  chapterId?: string; // 챕터 ID (훅에서 주입 가능하므로 선택사항으로 변경)
  content: string;
  parentId?: string; // 대댓글인 경우
  relationId?: string; // 특정 관계에 대한 댓글인 경우
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

// === Reading History (읽기 기록) ===
export interface ReadingHistory {
  id: string;
  userId: string;
  workId: string;
  lastChapterId: string;
  lastChapterNumber: number;
  progress: number; // 0-100%
  lastReadAt: string;
  work?: Work; // 조인된 작품 정보
}

// === Personalized Recommendation (개인화 추천) ===
export interface PersonalizedRecommendation {
  continueReading: ReadingHistory[]; // 읽던 작품 목록
  tagBasedRecommendations: Work[]; // 태그 기반 추천 작품
}

// === Exports ===
export * from "./character";
export * from "./characterGraph";
