# 배포 준비 실패 (workTitle required)

## Issue Description

원고 내보내기(Export) 시 다음 에러 발생:
`workTitle is required for publishing 백엔드 서버(localhost:8080)가 실행 중인지 확인해주세요.`

- **에러 원인**: 백엔드 API (`POST /works/{workId}/chapters`)가 `workTitle` 필드를 필수로 요구하나, 프론트엔드에서 이를 보내지 않음.
- **추가 이슈**: `useExportChapter.ts` 수정 과정에서 `useQueryClient`를 비동기 함수 내부에서 호출하는 React Hook 규칙 위반 발생.

## Solution Strategy

`useExportChapter` 훅을 수정하여 `workTitle`을 페이로드에 포함.

### 1. `workTitle` 데이터 확보

- 신규 작품 생성 시: 폼 데이터(`newWork.title`) 사용
- 기존 작품 선택 시: `queryClient.getQueryData(['myWorks'])` 캐시에서 작품 제목 조회

### 2. 페이로드 수정

`useCreateChapter` 뮤테이션의 `chapterData` 타입에 `workTitle` 추가 및 전송.

### 변경 코드 (src/hooks/useExportChapter.ts)

```typescript
// Hook 최상단으로 이동
const queryClient = useQueryClient();

// ...

// exportChapter 함수 내부
let workTitle = "";
if (formData.isNewWork && formData.newWork) {
  workTitle = formData.newWork.title;
} else {
  // 캐시에서 조회
  const works = queryClient.getQueryData<Work[]>(["myWorks"]);
  const work = works?.find((w) => w.id === workId);
  workTitle = work?.title || "";
}

// 요청 전송
const chapter = await createChapter.mutateAsync({
  workId,
  chapterData: {
    // ...
    workTitle, // 추가됨
  },
});
```

## Outcome

- `workTitle` 필드가 정상적으로 전송되어 백엔드 유효성 검사 통과 예상.
