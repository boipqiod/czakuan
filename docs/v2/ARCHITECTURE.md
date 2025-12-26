# 에대숲 v2 아키텍처 설계

> 마지막 업데이트: 2025-12-26

## 1. 개요

### 1.1 프로젝트 정보
- **서비스명**: 에대숲 (Czakuan)
- **서비스 유형**: 익명 커뮤니티 플랫폼
- **타겟 사용자**: 에버랜드 캐스트(직원) & 주변 상권 종사자

### 1.2 기술 스택
| 영역 | 기술 |
|------|------|
| **Mobile** | Expo (React Native) |
| **Backend** | Hono |
| **Database** | PostgreSQL + Prisma |
| **Auth** | 카카오 OAuth + JWT |
| **Storage** | 추후 결정 (S3 호환) |

---

## 2. 데모 범위

### 2.1 포함 기능
- [x] 카카오 로그인
- [x] 게시글 CRUD
- [x] 댓글 + 대댓글
- [x] 익명 시스템 (해시 기반)
- [x] 좋아요/싫어요 (택1)
- [x] 카테고리 (3단계)

### 2.2 제외 기능 (추후 구현)
- [ ] 이미지 업로드
- [ ] 비공개 댓글
- [ ] 신고 기능
- [ ] 검색

---

## 3. 프로젝트 구조

> TODO: 모노레포 구조 확정 필요

```
czakuan-v2/
├── apps/
│   ├── mobile/          # Expo 앱
│   └── server/          # Hono API 서버
├── packages/
│   └── shared/          # 공통 타입, 유틸
├── package.json         # 워크스페이스 루트
└── pnpm-workspace.yaml
```

---

## 4. ERD

```mermaid
erDiagram
    User {
        int id PK
        bigint kakaoId UK
        string nickname UK
        string profileImageUrl
        string role "USER, ADMIN 등"
        datetime createdAt
        datetime deletedAt
    }

    CategoryGroup {
        int id PK
        string name
        int priority
        boolean isActive
    }

    Category {
        int id PK
        int groupId FK
        string name
        int priority
        boolean isActive
        boolean isAnonymous
    }

    SubCategory {
        int id PK
        int categoryId FK
        string name
        int priority
        boolean isActive
    }

    Post {
        int id PK
        int categoryId FK
        int subCategoryId FK "nullable"
        int userId FK
        string title
        string content
        int views
        int likeCount "default 0"
        int dislikeCount "default 0"
        boolean isNotice
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    Comment {
        int id PK
        int postId FK
        int userId FK
        int rootId FK "nullable, 그룹화"
        int parentId FK "nullable, 멘션대상"
        string content
        int likeCount "default 0"
        int dislikeCount "default 0"
        datetime createdAt
        datetime deletedAt
    }

    PostReaction {
        int postId PK_FK
        int userId PK_FK
        boolean isLike
    }

    CommentReaction {
        int commentId PK_FK
        int userId PK_FK
        boolean isLike
    }

    CategoryGroup ||--o{ Category : has
    Category ||--o{ SubCategory : has
    Category ||--o{ Post : contains
    SubCategory ||--o{ Post : contains
    User ||--o{ Post : writes
    User ||--o{ Comment : writes
    Post ||--o{ Comment : has
    Comment ||--o{ Comment : replies
    User ||--o{ PostReaction : reacts
    Post ||--o{ PostReaction : receives
    User ||--o{ CommentReaction : reacts
    Comment ||--o{ CommentReaction : receives
```

### 4.1 익명 처리
- **방식**: 해시 기반 (DB 저장 없음)
- **salt**: 환경변수 고정 값
- **계산**: `sha256(userId + postId + salt).substring(0, 6)`
- **표시**: 글쓴이 = "익명(글쓴이)", 댓글러 = "익명(a3f8e2)"

---

## 5. API 설계

> TODO: 확정 필요

### 5.1 스타일
- [ ] RESTful
- [ ] RPC 스타일 (Hono RPC)

### 5.2 응답 형식
```typescript
// 성공
{
  success: true,
  data: T
}

// 실패
{
  success: false,
  error: {
    code: string,
    message: string
  }
}
```

### 5.3 엔드포인트 목록
> TODO: 정의 필요

---

## 6. 인증 플로우

> TODO: 확정 필요

### 6.1 OAuth 플로우
```
1. Expo에서 카카오 로그인
2. 카카오 access token 획득
3. BE에 카카오 토큰 전달
4. BE에서 카카오 API로 사용자 정보 조회
5. JWT 발급 (access + refresh)
6. Expo에서 SecureStore에 저장
```

### 6.2 토큰 설정
- Access Token: ??? 분
- Refresh Token: ??? 일

---

## 7. 타입 공유

> TODO: 확정 필요

---

## 8. 배포

> 추후 결정

