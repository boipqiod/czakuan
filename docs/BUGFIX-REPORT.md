# 에대숲 v2 버그 수정 및 개선 리포트

## 개요

코드 스캔을 통해 발견된 문제점들을 수정하고 개선한 내용을 정리한 문서입니다.

## 수정 내역

### 1. HTTP 상태 코드 수정 (신고 API)

**문제점**: 신고 API가 `201 Created`를 반환했으나, 신고는 리소스 생성보다는 "처리 접수"에 가까움

**수정 내용**: `202 Accepted`로 변경

**수정 파일**:
- `apps/server/src/presentation/routes/postRoutes.ts:145`
- `apps/server/src/presentation/routes/commentRoutes.ts:105`

---

### 2. React Query Mutation 에러 핸들링

**문제점**: 모든 mutation에 `onError` 핸들러가 없어 에러 발생 시 디버깅이 어려움

**수정 내용**: 모든 mutation에 `onError` 콜백 추가

**수정 파일**:
- `apps/web/src/features/post/hooks/usePosts.ts`
  - `useCreatePost`: 게시글 작성 실패 로깅
  - `useUpdatePost`: 게시글 수정 실패 로깅
  - `useDeletePost`: 게시글 삭제 실패 로깅
  - `useToggleLike`: 좋아요 토글 실패 로깅
  - `useToggleDislike`: 싫어요 토글 실패 로깅
  - `useReportPost`: 게시글 신고 실패 로깅

- `apps/web/src/features/comment/hooks/useComments.ts`
  - `useCreateComment`: 댓글 작성 실패 로깅
  - `useDeleteComment`: 댓글 삭제 실패 로깅
  - `useToggleCommentLike`: 댓글 좋아요 실패 로깅
  - `useToggleCommentDislike`: 댓글 싫어요 실패 로깅
  - `useReportComment`: 댓글 신고 실패 로깅

---

### 3. useKakaoLogin 의존성 배열 수정

**문제점**: `redirectToKakao`, `handleCallback` 함수가 매 렌더링마다 재생성됨

**수정 내용**: `useCallback`으로 함수 메모이제이션 적용

**수정 파일**:
- `apps/web/src/features/auth/hooks/useKakaoLogin.ts`
  - `redirectToKakao`: `useCallback([], [])`
  - `handleCallback`: `useCallback([navigate, setTokens, setUser])`

---

### 4. 페이지 컴포넌트 에러 처리

**문제점**: async 함수에서 발생하는 에러가 처리되지 않음

**수정 내용**: try-catch 블록 추가 및 사용자 친화적 에러 메시지 표시

**수정 파일**:
- `apps/web/src/pages/post/PostWritePage.tsx`
  - `handleSubmit`: 게시글 작성 실패 시 alert 표시

- `apps/web/src/pages/post/PostDetailPage.tsx`
  - `handleDelete`: 게시글 삭제 실패 시 alert 표시
  - `handleSubmitComment`: 댓글 작성 실패 시 alert 표시

---

### 5. Reaction Count 동시성 문제 수정

**문제점**: 좋아요/싫어요 토글 시 이전에 조회한 카운트 값에서 +1/-1 연산을 수행하여 동시성 이슈 발생 가능

**수정 내용**: 트랜잭션 후 DB에서 반환된 실제 카운트 값을 사용하도록 변경

**수정 파일**:
- `apps/server/src/domain/repositories/ReactionRepository.ts`
  - `createPostLike`, `deletePostLike`: 반환 타입 `void` → `number`
  - `createPostDislike`, `deletePostDislike`: 반환 타입 `void` → `number`
  - `createCommentLike`, `deleteCommentLike`: 반환 타입 `void` → `number`
  - `createCommentDislike`, `deleteCommentDislike`: 반환 타입 `void` → `number`

- `apps/server/src/infrastructure/repositories/ReactionRepositoryImpl.ts`
  - 모든 reaction 메서드가 트랜잭션 후 업데이트된 카운트 반환

- `apps/server/src/application/post/PostService.ts`
  - `toggleLike`, `toggleDislike`: DB 반환값 사용

- `apps/server/src/application/comment/CommentService.ts`
  - `toggleLike`, `toggleDislike`: DB 반환값 사용 및 카운트 반환 추가

---

### 6. 접근성(a11y) 개선

**문제점**: 스크린 리더 사용자를 위한 접근성 속성 부재

**수정 내용**: aria 속성 및 label 연결 추가

**수정 파일**:
- `apps/web/src/pages/post/PostWritePage.tsx`
  - 게시판 select에 `id`, `htmlFor` 연결
  - `aria-required="true"` 추가

- `apps/web/src/pages/post/PostDetailPage.tsx`
  - 좋아요/싫어요 버튼: `aria-label`, `aria-pressed` 추가
  - 댓글 Textarea: `aria-label` 추가
  - 답글/삭제 버튼: `type="button"`, `aria-label` 추가

---

## 이전 세션에서 수정된 보안 관련 사항 (참고)

### XSS 취약점 수정
- `PostDetailPage.tsx`에서 `DOMPurify`를 사용하여 HTML 콘텐츠 sanitize

### 환경변수 검증
- `KakaoClient.ts`에서 필수 환경변수 누락 시 경고 로그 출력

### CORS 설정 개선
- 하드코딩된 origin 대신 `ALLOWED_ORIGINS` 환경변수 사용

### 닉네임 중복 체크 미들웨어
- `authMiddleware` → `optionalAuthMiddleware`로 변경 (회원가입 시에도 사용 가능)

---

## 빌드 검증

모든 수정 후 TypeScript 타입 체크 통과:
```bash
pnpm run -r typecheck
# apps/server typecheck: Done
# apps/web typecheck: Done
```

---

## 추가 권장 사항

1. **테스트 코드 작성**: 수정된 기능에 대한 단위/통합 테스트 추가
2. **에러 바운더리**: React Error Boundary 컴포넌트 추가
3. **토스트 알림**: alert 대신 토스트 UI로 개선
4. **로깅 시스템**: console.error 대신 중앙화된 로깅 시스템 도입
