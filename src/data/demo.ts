/**
 * 데모 데이터 (백엔드 연결 전 UI 테스트용)
 * 추후 백엔드 연결 완료 시 본 파일을 제거하거나 사용하지 않도록 수정하면 됩니다.
 */
import type { Work, Chapter } from '@/types';

// === 샘플 유저 ===
export const DEMO_USER = {
    id: 'user-1',
    email: 'demo@example.com',
    nickname: '데모작가',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

// === 샘플 작품 ===
export const DEMO_WORKS: Work[] = [
    {
        id: 'work-1',
        authorId: 'user-1',
        title: '회귀한 천마의 제과점',
        synopsis: '무림을 제패한 천마, 눈을 떠보니 현대 서울의 망해가는 빵집 알바생이 되었다? 내공으로 반죽하고 경공으로 배달하는 좌충우돌 빵집 경영기!',
        genre: 'FANTASY',
        status: 'ONGOING',
        coverImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=600&fit=crop',
        ratingSum: 48,
        ratingCount: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: DEMO_USER,
        avgRating: 4.8,
    },
    {
        id: 'work-2',
        authorId: 'user-1',
        title: 'S급 헌터는 조용히 살고 싶다',
        synopsis: '세상을 구하고 은퇴한 최강의 헌터. 이제는 평범한 공무원이 되어 워라밸을 즐기려 했건만, 자꾸만 던전 게이트가 내 집 마당에서 열린다.',
        genre: 'FANTASY',
        status: 'ONGOING',
        coverImageUrl: 'https://images.unsplash.com/photo-1614726365723-49cfaeb5d2a6?w=400&h=600&fit=crop',
        ratingSum: 45,
        ratingCount: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: DEMO_USER,
        avgRating: 4.5,
    },
    {
        id: 'work-3',
        authorId: 'user-1',
        title: '대표님은 왜 제 빵만 드세요?',
        synopsis: '냉혈한으로 소문난 재벌 3세 CEO. 우연히 먹은 내 빵에 반해 매일 아침 출근도장을 찍기 시작했다. "이 빵, 계약하지. 연봉 1억."',
        genre: 'ROMANCE',
        status: 'ONGOING',
        coverImageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=600&fit=crop',
        ratingSum: 50,
        ratingCount: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: DEMO_USER,
        avgRating: 5.0,
    },
];

// === 샘플 챕터 ===
export const DEMO_CHAPTERS: Record<string, Chapter[]> = {
    'work-1': [
        {
            id: 'chapter-1-1',
            workId: 'work-1',
            title: '1화. 천마, 바게트를 굽다',
            content: '천마는 눈을 떴다. 낯선 천장이었다. "여기가 어디냐..."\n\n그때였다. "야! 김민수! 빵 안 굽고 뭐해!"\n\n등짝을 강타하는 매운 손길. 나는 천마인데... 김민수라고? 그리고 눈앞에 보이는 건 거대한 밀가루 포대였다.\n\n"이것은... 흡사 만년설삼의 가루 같구나."',
            chapterNumber: 1,
            viewCount: 120,
            ratingSum: 48,
            ratingCount: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            avgRating: 4.8,
        },
        {
            id: 'chapter-1-2',
            workId: 'work-1',
            title: '2화. 내공 실은 팥빵',
            content: '반죽에 내공을 주입하자 놀라운 일이 벌어졌다. 반죽이 스스로 발효되기 시작한 것이다.\n\n"이게 무슨..."\n\n점장님은 눈을 의심했다. 3시간 걸릴 발효가 3초 만에 끝났기 때문이다.\n\n"너... 재능 있구나?"',
            chapterNumber: 2,
            viewCount: 105,
            ratingSum: 45,
            ratingCount: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            avgRating: 4.5,
        },
    ],
    'work-2': [
        {
            id: 'chapter-2-1',
            workId: 'work-2',
            title: '1화. 은퇴 신고합니다',
            content: '드디어 끝났다. 10년간의 헌터 생활. 이제는 연금 받으며 편안하게 살리라.\n\n하지만 구청에 사직서를 내러 가는 길, 내 발밑에서 푸른색 게이트가 열렸다.\n\n"아... 진짜 왜 이러냐."',
            chapterNumber: 1,
            viewCount: 200,
            ratingSum: 50,
            ratingCount: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            avgRating: 5.0,
        }
    ]
};
