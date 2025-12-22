# 에대숲 (Czakuan) ERD (Entity Relationship Diagram)

> **기준**: Prisma Schema
> **최종 수정일**: 2025-12-22

---

## 1. ERD 다이어그램

```mermaid
erDiagram
    %% ========================================
    %% 사용자 (User)
    %% ========================================
    User {
        Int id PK "자동증가"
        BigInt kakaoId UK "카카오 고유 ID"
        String nickName UK "닉네임"
        String email "이메일 (선택)"
        String name "실명 (선택)"
        String phoneNumber "전화번호 (선택)"
        String profileImageUrl "프로필 이미지 URL"
        Role role "권한 (USER/BOARD_ADMIN/SUPER_ADMIN)"
        DateTime createdAt "생성일"
        DateTime updatedAt "수정일"
        DateTime deletedAt "삭제일 (소프트삭제)"
    }

    %% ========================================
    %% 카테고리 그룹 (CategoryGroup)
    %% ========================================
    CategoryGroup {
        Int id PK "자동증가"
        String name "그룹명"
        Int priority "정렬 우선순위"
        Boolean isUse "활성화 여부"
    }

    %% ========================================
    %% 카테고리 (Category)
    %% ========================================
    Category {
        Int id PK "자동증가"
        String name "카테고리명"
        Int groupId FK "그룹 ID"
        Int priority "정렬 우선순위"
        Boolean isUse "활성화 여부"
        Boolean isAnonymous "익명 게시판 여부"
        Boolean isPrivateComment "비공개 댓글 여부"
    }

    %% ========================================
    %% 서브카테고리 (SubCategory)
    %% ========================================
    SubCategory {
        Int id PK "자동증가"
        String name "서브카테고리명"
        Int categoryId FK "카테고리 ID"
        Int priority "정렬 우선순위"
        Boolean isUse "활성화 여부"
    }

    %% ========================================
    %% 게시글 (Post)
    %% ========================================
    Post {
        Int id PK "자동증가"
        String title "제목"
        String content "본문 (HTML)"
        String[] images "이미지 URL 배열"
        String thumbnailUrl "썸네일 URL"
        Int views "조회수"
        Boolean isNotice "공지사항 여부"
        Boolean isAnonymous "익명 게시글 여부"
        Int categoryId FK "카테고리 ID"
        Int subCategoryId FK "서브카테고리 ID (선택)"
        Int userId FK "작성자 ID"
        DateTime createdAt "생성일"
        DateTime updatedAt "수정일"
        DateTime deletedAt "삭제일 (소프트삭제)"
    }

    %% ========================================
    %% 댓글 (Comment)
    %% ========================================
    Comment {
        Int id PK "자동증가"
        String content "댓글 내용"
        Int postId FK "게시글 ID"
        Int userId FK "작성자 ID"
        Int parentId FK "부모 댓글 ID (대댓글)"
        Int rootId "루트 댓글 ID (그룹화)"
        DateTime createdAt "생성일"
        DateTime updatedAt "수정일"
        DateTime deletedAt "삭제일 (소프트삭제)"
    }

    %% ========================================
    %% 익명 사용자 매핑 (AnonymousUserInPost)
    %% ========================================
    AnonymousUserInPost {
        Int id PK "자동증가"
        Int userId FK "사용자 ID"
        Int postId FK "게시글 ID"
        String anonymId "익명 ID (익명1, 익명2...)"
    }

    %% ========================================
    %% 게시글 좋아요 (LikeToPost)
    %% ========================================
    LikeToPost {
        Int userId PK_FK "사용자 ID"
        Int postId PK_FK "게시글 ID"
    }

    %% ========================================
    %% 게시글 싫어요 (DislikeToPost)
    %% ========================================
    DislikeToPost {
        Int userId PK_FK "사용자 ID"
        Int postId PK_FK "게시글 ID"
    }

    %% ========================================
    %% 게시글 신고 (ReportToPost)
    %% ========================================
    ReportToPost {
        Int userId PK_FK "사용자 ID"
        Int postId PK_FK "게시글 ID"
        String reason "신고 사유"
        DateTime createdAt "신고일"
    }

    %% ========================================
    %% 댓글 좋아요 (LikeToComment)
    %% ========================================
    LikeToComment {
        Int userId PK_FK "사용자 ID"
        Int commentId PK_FK "댓글 ID"
    }

    %% ========================================
    %% 댓글 싫어요 (DislikeToComment)
    %% ========================================
    DislikeToComment {
        Int userId PK_FK "사용자 ID"
        Int commentId PK_FK "댓글 ID"
    }

    %% ========================================
    %% 댓글 신고 (ReportToComment)
    %% ========================================
    ReportToComment {
        Int userId PK_FK "사용자 ID"
        Int commentId PK_FK "댓글 ID"
        String reason "신고 사유"
        DateTime createdAt "신고일"
    }

    %% ========================================
    %% 관계 정의
    %% ========================================

    %% 카테고리 계층 구조
    CategoryGroup ||--o{ Category : "contains"
    Category ||--o{ SubCategory : "contains"

    %% 게시글 관계
    Category ||--o{ Post : "has"
    SubCategory ||--o{ Post : "has"
    User ||--o{ Post : "writes"

    %% 댓글 관계
    Post ||--o{ Comment : "has"
    User ||--o{ Comment : "writes"
    Comment ||--o{ Comment : "replies to"

    %% 익명 매핑
    User ||--o{ AnonymousUserInPost : "has"
    Post ||--o{ AnonymousUserInPost : "has"

    %% 게시글 상호작용
    User ||--o{ LikeToPost : "likes"
    Post ||--o{ LikeToPost : "liked by"
    User ||--o{ DislikeToPost : "dislikes"
    Post ||--o{ DislikeToPost : "disliked by"
    User ||--o{ ReportToPost : "reports"
    Post ||--o{ ReportToPost : "reported by"

    %% 댓글 상호작용
    User ||--o{ LikeToComment : "likes"
    Comment ||--o{ LikeToComment : "liked by"
    User ||--o{ DislikeToComment : "dislikes"
    Comment ||--o{ DislikeToComment : "disliked by"
    User ||--o{ ReportToComment : "reports"
    Comment ||--o{ ReportToComment : "reported by"
```

---

## 2. 테이블 상세 명세

### 2.1 User (사용자)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `id` | Int | PK, Auto Increment | - | 고유 식별자 |
| `kakaoId` | BigInt | Unique, Not Null | - | 카카오 OAuth ID |
| `nickName` | String | Unique, Not Null | - | 서비스 닉네임 |
| `email` | String | Nullable | - | 이메일 주소 |
| `name` | String | Nullable | - | 실명 |
| `phoneNumber` | String | Nullable | - | 전화번호 |
| `profileImageUrl` | String | Nullable | - | 프로필 이미지 URL |
| `role` | Role (Enum) | Not Null | `USER` | 사용자 권한 |
| `createdAt` | DateTime | Not Null | `now()` | 생성 일시 |
| `updatedAt` | DateTime | Not Null | `now()` | 수정 일시 |
| `deletedAt` | DateTime | Nullable | - | 삭제 일시 (소프트 삭제) |

**인덱스:**
- `id` (Primary Key)
- `kakaoId` (Unique)
- `nickName` (Unique)

---

### 2.2 CategoryGroup (카테고리 그룹)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `id` | Int | PK, Auto Increment | - | 고유 식별자 |
| `name` | String | Not Null | - | 그룹명 |
| `priority` | Int | Not Null | `0` | 정렬 우선순위 (낮을수록 먼저) |
| `isUse` | Boolean | Not Null | `false` | 활성화 여부 |

---

### 2.3 Category (카테고리)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `id` | Int | PK, Auto Increment | - | 고유 식별자 |
| `name` | String | Not Null | - | 카테고리명 |
| `groupId` | Int | FK → CategoryGroup.id | - | 소속 그룹 ID |
| `priority` | Int | Not Null | `0` | 정렬 우선순위 |
| `isUse` | Boolean | Not Null | `false` | 활성화 여부 |
| `isAnonymous` | Boolean | Not Null | `false` | 익명 게시판 여부 |
| `isPrivateComment` | Boolean | Not Null | `false` | 비공개 댓글 활성화 |

**관계:**
- `groupId` → `CategoryGroup.id` (N:1)

---

### 2.4 SubCategory (서브카테고리)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `id` | Int | PK, Auto Increment | - | 고유 식별자 |
| `name` | String | Not Null | - | 서브카테고리명 |
| `categoryId` | Int | FK → Category.id | - | 부모 카테고리 ID |
| `priority` | Int | Not Null | `0` | 정렬 우선순위 |
| `isUse` | Boolean | Not Null | `false` | 활성화 여부 |

**관계:**
- `categoryId` → `Category.id` (N:1)

---

### 2.5 Post (게시글)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `id` | Int | PK, Auto Increment | - | 고유 식별자 |
| `title` | String | Not Null | - | 게시글 제목 |
| `content` | String | Not Null | - | 게시글 본문 (HTML) |
| `images` | String[] | - | `[]` | 이미지 URL 배열 |
| `thumbnailUrl` | String | Nullable | - | 썸네일 이미지 URL |
| `views` | Int | Not Null | `0` | 조회수 |
| `isNotice` | Boolean | Not Null | `false` | 공지사항 여부 |
| `isAnonymous` | Boolean | Not Null | `false` | 익명 게시글 여부 |
| `categoryId` | Int | FK → Category.id | - | 카테고리 ID |
| `subCategoryId` | Int | FK → SubCategory.id, Nullable | - | 서브카테고리 ID |
| `userId` | Int | FK → User.id | - | 작성자 ID |
| `createdAt` | DateTime | Not Null | `now()` | 생성 일시 |
| `updatedAt` | DateTime | Nullable | - | 수정 일시 |
| `deletedAt` | DateTime | Nullable | - | 삭제 일시 |

**관계:**
- `categoryId` → `Category.id` (N:1)
- `subCategoryId` → `SubCategory.id` (N:1, Optional)
- `userId` → `User.id` (N:1)

---

### 2.6 Comment (댓글)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `id` | Int | PK, Auto Increment | - | 고유 식별자 |
| `content` | String | Not Null | - | 댓글 내용 |
| `postId` | Int | FK → Post.id | - | 게시글 ID |
| `userId` | Int | FK → User.id | - | 작성자 ID |
| `parentId` | Int | FK → Comment.id, Nullable | - | 부모 댓글 ID (대댓글) |
| `rootId` | Int | Not Null | - | 루트 댓글 ID (그룹화) |
| `createdAt` | DateTime | Not Null | `now()` | 생성 일시 |
| `updatedAt` | DateTime | Not Null | - | 수정 일시 |
| `deletedAt` | DateTime | Nullable | - | 삭제 일시 |

**관계:**
- `postId` → `Post.id` (N:1)
- `userId` → `User.id` (N:1)
- `parentId` → `Comment.id` (N:1, Self-referencing, Optional)

**특이사항:**
- `rootId`: 최상위 댓글인 경우 자신의 ID, 대댓글인 경우 루트 댓글의 ID
- 자기 참조 관계로 무한 깊이 대댓글 지원

---

### 2.7 AnonymousUserInPost (익명 사용자 매핑)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `id` | Int | PK, Auto Increment | - | 고유 식별자 |
| `userId` | Int | FK → User.id | - | 사용자 ID |
| `postId` | Int | FK → Post.id | - | 게시글 ID |
| `anonymId` | String | Not Null | - | 익명 ID ("익명1", "익명2" 등) |

**제약조건:**
- `@@unique([userId, postId])` - 한 게시글 내 한 사용자는 하나의 익명 ID만 가질 수 있음

**관계:**
- `userId` → `User.id` (N:1)
- `postId` → `Post.id` (N:1)

---

### 2.8 LikeToPost (게시글 좋아요)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `userId` | Int | PK, FK → User.id | - | 사용자 ID |
| `postId` | Int | PK, FK → Post.id | - | 게시글 ID |

**제약조건:**
- `@@id([userId, postId])` - 복합 기본키

---

### 2.9 DislikeToPost (게시글 싫어요)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `userId` | Int | PK, FK → User.id | - | 사용자 ID |
| `postId` | Int | PK, FK → Post.id | - | 게시글 ID |

**제약조건:**
- `@@id([userId, postId])` - 복합 기본키

---

### 2.10 ReportToPost (게시글 신고)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `userId` | Int | PK, FK → User.id | - | 신고자 ID |
| `postId` | Int | PK, FK → Post.id | - | 게시글 ID |
| `reason` | String | Not Null | - | 신고 사유 |
| `createdAt` | DateTime | Not Null | `now()` | 신고 일시 |

**제약조건:**
- `@@id([userId, postId])` - 복합 기본키 (동일 사용자 중복 신고 방지)

---

### 2.11 LikeToComment (댓글 좋아요)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `userId` | Int | PK, FK → User.id | - | 사용자 ID |
| `commentId` | Int | PK, FK → Comment.id | - | 댓글 ID |

**제약조건:**
- `@@id([userId, commentId])` - 복합 기본키

---

### 2.12 DislikeToComment (댓글 싫어요)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `userId` | Int | PK, FK → User.id | - | 사용자 ID |
| `commentId` | Int | PK, FK → Comment.id | - | 댓글 ID |

**제약조건:**
- `@@id([userId, commentId])` - 복합 기본키

---

### 2.13 ReportToComment (댓글 신고)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `userId` | Int | PK, FK → User.id | - | 신고자 ID |
| `commentId` | Int | PK, FK → Comment.id | - | 댓글 ID |
| `reason` | String | Not Null | - | 신고 사유 |
| `createdAt` | DateTime | Not Null | `now()` | 신고 일시 |

**제약조건:**
- `@@id([userId, commentId])` - 복합 기본키

---

## 3. Enum 정의

### 3.1 Role (사용자 권한)

| 값 | 설명 |
|----|------|
| `SUPER_ADMIN` | 슈퍼 관리자 - 모든 권한 |
| `BOARD_ADMIN` | 게시판 관리자 - 게시판 운영 권한 |
| `USER` | 일반 사용자 - 기본 권한 |

---

## 4. 관계 요약

### 4.1 카테고리 계층 구조

```
CategoryGroup (1) ──────< (N) Category (1) ──────< (N) SubCategory
```

### 4.2 게시글 관계

```
User (1) ──────< (N) Post (N) >────── (1) Category
                      │ (N) >────── (1) SubCategory (Optional)
                      │
                      └──────< (N) Comment
                      └──────< (N) LikeToPost
                      └──────< (N) DislikeToPost
                      └──────< (N) ReportToPost
                      └──────< (N) AnonymousUserInPost
```

### 4.3 댓글 관계

```
Post (1) ──────< (N) Comment (1) ──────< (N) Comment (Self-reference)
                      │
                      └──────< (N) LikeToComment
                      └──────< (N) DislikeToComment
                      └──────< (N) ReportToComment
```

### 4.4 사용자 상호작용

```
User (1) ──────< (N) Post
      │ ──────< (N) Comment
      │ ──────< (N) LikeToPost
      │ ──────< (N) DislikeToPost
      │ ──────< (N) ReportToPost
      │ ──────< (N) LikeToComment
      │ ──────< (N) DislikeToComment
      │ ──────< (N) ReportToComment
      └ ──────< (N) AnonymousUserInPost
```

---

## 5. 물리적 ERD (간소화)

```
┌─────────────────┐
│  CategoryGroup  │
├─────────────────┤
│ id (PK)         │
│ name            │
│ priority        │
│ isUse           │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐         ┌─────────────────┐
│    Category     │         │   SubCategory   │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │ 1:N     │ id (PK)         │
│ name            │────────>│ name            │
│ groupId (FK)    │         │ categoryId (FK) │
│ priority        │         │ priority        │
│ isUse           │         │ isUse           │
│ isAnonymous     │         └────────┬────────┘
│ isPrivateComment│                  │
└────────┬────────┘                  │
         │ 1:N                       │ 1:N
         ▼                           ▼
┌──────────────────────────────────────────────────────────────┐
│                            Post                               │
├──────────────────────────────────────────────────────────────┤
│ id (PK)          │ categoryId (FK)    │ subCategoryId (FK)   │
│ title            │ userId (FK)        │ isNotice             │
│ content          │ views              │ isAnonymous          │
│ images[]         │ thumbnailUrl       │                      │
│ createdAt        │ updatedAt          │ deletedAt            │
└───────────────────────────┬──────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼ 1:N              ▼ 1:N              ▼ 1:N
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Comment      │  │   LikeToPost    │  │  ReportToPost   │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ userId (PK,FK)  │  │ userId (PK,FK)  │
│ content         │  │ postId (PK,FK)  │  │ postId (PK,FK)  │
│ postId (FK)     │  └─────────────────┘  │ reason          │
│ userId (FK)     │                       │ createdAt       │
│ parentId (FK)   │  ┌─────────────────┐  └─────────────────┘
│ rootId          │  │ DislikeToPost   │
│ createdAt       │  ├─────────────────┤  ┌─────────────────────┐
│ updatedAt       │  │ userId (PK,FK)  │  │ AnonymousUserInPost │
│ deletedAt       │  │ postId (PK,FK)  │  ├─────────────────────┤
└────────┬────────┘  └─────────────────┘  │ id (PK)             │
         │                                │ userId (FK)         │
         │ 1:N                            │ postId (FK)         │
         ▼                                │ anonymId            │
┌─────────────────┐                       │ @@unique(user,post) │
│ LikeToComment   │                       └─────────────────────┘
├─────────────────┤
│ userId (PK,FK)  │  ┌───────────────────┐
│ commentId(PK,FK)│  │ DislikeToComment  │
└─────────────────┘  ├───────────────────┤
                     │ userId (PK,FK)    │  ┌───────────────────┐
                     │ commentId (PK,FK) │  │ ReportToComment   │
                     └───────────────────┘  ├───────────────────┤
                                            │ userId (PK,FK)    │
                                            │ commentId (PK,FK) │
                                            │ reason            │
                                            │ createdAt         │
                                            └───────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                           User                               │
├─────────────────────────────────────────────────────────────┤
│ id (PK)           │ kakaoId (UK)       │ nickName (UK)      │
│ email             │ name               │ phoneNumber        │
│ profileImageUrl   │ role               │                    │
│ createdAt         │ updatedAt          │ deletedAt          │
└─────────────────────────────────────────────────────────────┘
         │
         │ 1:N (모든 상호작용 테이블과 연결)
         ▼
    Post, Comment, LikeToPost, DislikeToPost, ReportToPost,
    LikeToComment, DislikeToComment, ReportToComment,
    AnonymousUserInPost
```

---

## 6. 주요 설계 패턴

### 6.1 소프트 삭제 (Soft Delete)

| 테이블 | deletedAt 컬럼 |
|--------|---------------|
| User | ✓ |
| Post | ✓ |
| Comment | ✓ |

- 데이터 복구 가능
- 조회 시 `deletedAt IS NULL` 조건 필요

### 6.2 복합 기본키 (Composite Primary Key)

| 테이블 | 복합키 |
|--------|--------|
| LikeToPost | `[userId, postId]` |
| DislikeToPost | `[userId, postId]` |
| ReportToPost | `[userId, postId]` |
| LikeToComment | `[userId, commentId]` |
| DislikeToComment | `[userId, commentId]` |
| ReportToComment | `[userId, commentId]` |

- 중복 상호작용 방지
- 별도 PK 없이 두 FK의 조합으로 유일성 보장

### 6.3 자기 참조 관계 (Self-referencing)

| 테이블 | 컬럼 | 용도 |
|--------|------|------|
| Comment | `parentId` → `Comment.id` | 대댓글 구현 |

### 6.4 계층 구조

```
CategoryGroup → Category → SubCategory (3단계 계층)
Comment → Comment → Comment → ... (무제한 깊이)
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-22 | 최초 작성 |

---

*본 문서는 prisma/schema.prisma 파일을 기반으로 작성되었습니다.*
