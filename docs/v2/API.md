# 에대숲 v2 API 명세서

> 마지막 업데이트: 2025-12-26

## 1. 개요

### 1.1 Base URL
```
개발: http://localhost:3000
운영: TBD
```

### 1.2 API 스타일
- **RESTful** (언어/프레임워크 독립적)

### 1.3 HTTP 상태 코드 정책
| 상황 | 상태 코드 |
|------|----------|
| 비즈니스 로직 (성공/실패) | **200** |
| 인증 안 됨 (토큰 없음/유효하지 않음) | 401 |
| 서버 에러 | 500 |

### 1.4 응답 형식
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

### 1.5 인증
- Authorization 헤더에 Bearer 토큰 사용
```
Authorization: Bearer {accessToken}
```

---

## 2. 에러 코드

### 2.1 인증 (AUTH)
| 코드 | 설명 |
|------|------|
| `AUTH_INVALID_TOKEN` | 토큰이 유효하지 않음 |
| `AUTH_EXPIRED_TOKEN` | 토큰이 만료됨 |
| `AUTH_USER_NOT_FOUND` | 사용자를 찾을 수 없음 |
| `AUTH_KAKAO_FAILED` | 카카오 인증 실패 |

### 2.2 게시글 (POST)
| 코드 | 설명 |
|------|------|
| `POST_NOT_FOUND` | 게시글을 찾을 수 없음 |
| `POST_NO_PERMISSION` | 권한이 없음 |
| `POST_ALREADY_DELETED` | 이미 삭제된 게시글 |

### 2.3 댓글 (COMMENT)
| 코드 | 설명 |
|------|------|
| `COMMENT_NOT_FOUND` | 댓글을 찾을 수 없음 |
| `COMMENT_NO_PERMISSION` | 권한이 없음 |
| `COMMENT_ALREADY_DELETED` | 이미 삭제된 댓글 |

### 2.4 카테고리 (CATEGORY)
| 코드 | 설명 |
|------|------|
| `CATEGORY_NOT_FOUND` | 카테고리를 찾을 수 없음 |
| `CATEGORY_INACTIVE` | 비활성화된 카테고리 |

### 2.5 공통 (COMMON)
| 코드 | 설명 |
|------|------|
| `VALIDATION_ERROR` | 입력값 검증 실패 |
| `DUPLICATE_NICKNAME` | 닉네임 중복 |

---

## 3. 엔드포인트 목록

### 3.1 인증 (Auth) - 3개
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|:----:|
| POST | `/auth/kakao` | 카카오 로그인/회원가입 | - |
| POST | `/auth/refresh` | 토큰 갱신 | - |
| POST | `/auth/logout` | 로그아웃 | ✓ |

### 3.2 사용자 (User) - 4개
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|:----:|
| GET | `/users/me` | 내 정보 조회 | ✓ |
| PATCH | `/users/me` | 내 정보 수정 | ✓ |
| GET | `/users/me/posts` | 내가 쓴 글 목록 | ✓ |
| GET | `/users/me/comments` | 내가 쓴 댓글 목록 | ✓ |

### 3.3 카테고리 (Category) - 1개
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|:----:|
| GET | `/categories` | 전체 카테고리 목록 | - |

### 3.4 게시글 (Post) - 7개
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|:----:|
| GET | `/posts` | 게시글 목록 | - |
| POST | `/posts` | 게시글 작성 | ✓ |
| GET | `/posts/:id` | 게시글 상세 | - |
| PATCH | `/posts/:id` | 게시글 수정 | ✓ |
| DELETE | `/posts/:id` | 게시글 삭제 | ✓ |
| POST | `/posts/:id/reaction` | 좋아요/싫어요 | ✓ |
| DELETE | `/posts/:id/reaction` | 좋아요/싫어요 취소 | ✓ |

### 3.5 댓글 (Comment) - 5개
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|:----:|
| GET | `/posts/:postId/comments` | 댓글 목록 | - |
| POST | `/posts/:postId/comments` | 댓글 작성 | ✓ |
| DELETE | `/comments/:id` | 댓글 삭제 | ✓ |
| POST | `/comments/:id/reaction` | 좋아요/싫어요 | ✓ |
| DELETE | `/comments/:id/reaction` | 좋아요/싫어요 취소 | ✓ |

**총 20개 엔드포인트**

---

## 4. 상세 스펙

### 4.1 인증 (Auth)

#### POST `/auth/kakao`
카카오 로그인/회원가입

**Request**
```typescript
{
  kakaoAccessToken: string
}
```

**Response**
```typescript
{
  success: true,
  data: {
    accessToken: string,
    refreshToken: string,
    user: {
      id: number,
      nickname: string,
      profileImageUrl: string | null,
      isNew: boolean  // 신규 가입 여부
    }
  }
}
```

**Error**
- `AUTH_KAKAO_FAILED`: 카카오 인증 실패

---

#### POST `/auth/refresh`
토큰 갱신

**Request**
```typescript
{
  refreshToken: string
}
```

**Response**
```typescript
{
  success: true,
  data: {
    accessToken: string,
    refreshToken: string
  }
}
```

**Error**
- `AUTH_INVALID_TOKEN`: 유효하지 않은 refresh token
- `AUTH_EXPIRED_TOKEN`: 만료된 refresh token

---

#### POST `/auth/logout`
로그아웃

**Request**
```typescript
// Body 없음
```

**Response**
```typescript
{
  success: true,
  data: null
}
```

---

### 4.2 사용자 (User)

#### GET `/users/me`
내 정보 조회

**Response**
```typescript
{
  success: true,
  data: {
    id: number,
    nickname: string,
    profileImageUrl: string | null,
    role: string,
    createdAt: string
  }
}
```

---

#### PATCH `/users/me`
내 정보 수정

**Request**
```typescript
{
  nickname?: string
}
```

**Response**
```typescript
{
  success: true,
  data: {
    id: number,
    nickname: string,
    profileImageUrl: string | null
  }
}
```

**Error**
- `DUPLICATE_NICKNAME`: 닉네임 중복
- `VALIDATION_ERROR`: 닉네임 형식 오류

---

#### GET `/users/me/posts`
내가 쓴 글 목록

**Query Parameters**
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|:----:|-------|------|
| page | number | - | 1 | 페이지 번호 |
| limit | number | - | 20 | 페이지당 개수 |

**Response**
```typescript
{
  success: true,
  data: {
    posts: [{
      id: number,
      title: string,
      category: { id: number, name: string },
      commentCount: number,
      createdAt: string
    }],
    pagination: {
      page: number,
      limit: number,
      total: number,
      lastPage: number
    }
  }
}
```

---

#### GET `/users/me/comments`
내가 쓴 댓글 목록

**Query Parameters**
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|:----:|-------|------|
| page | number | - | 1 | 페이지 번호 |
| limit | number | - | 20 | 페이지당 개수 |

**Response**
```typescript
{
  success: true,
  data: {
    comments: [{
      id: number,
      content: string,
      post: { id: number, title: string },
      createdAt: string
    }],
    pagination: {
      page: number,
      limit: number,
      total: number,
      lastPage: number
    }
  }
}
```

---

### 4.3 카테고리 (Category)

#### GET `/categories`
전체 카테고리 목록 (그룹, 서브카테고리 포함)

**Response**
```typescript
{
  success: true,
  data: {
    groups: [{
      id: number,
      name: string,
      priority: number,
      categories: [{
        id: number,
        name: string,
        priority: number,
        isAnonymous: boolean,
        subCategories: [{
          id: number,
          name: string,
          priority: number
        }]
      }]
    }]
  }
}
```

---

### 4.4 게시글 (Post)

#### GET `/posts`
게시글 목록

**Query Parameters**
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|:----:|-------|------|
| categoryId | number | ✓ | - | 카테고리 ID |
| subCategoryId | number | - | - | 서브카테고리 ID |
| page | number | - | 1 | 페이지 번호 |
| limit | number | - | 20 | 페이지당 개수 |

**Response**
```typescript
{
  success: true,
  data: {
    posts: [{
      id: number,
      title: string,
      preview: string,           // content 앞 100자
      author: {
        nickname: string,        // 익명이면 "익명(a3f8e2)" 또는 "익명(글쓴이)"
        profileImageUrl: string | null  // 익명이면 null
      },
      category: { id: number, name: string },
      subCategory: { id: number, name: string } | null,
      likeCount: number,
      dislikeCount: number,
      commentCount: number,
      views: number,
      isNotice: boolean,
      createdAt: string
    }],
    pagination: {
      page: number,
      limit: number,
      total: number,
      lastPage: number
    }
  }
}
```

---

#### POST `/posts`
게시글 작성

**Request**
```typescript
{
  categoryId: number,
  subCategoryId?: number,
  title: string,           // 1~100자
  content: string          // 1~10000자
}
```

**Response**
```typescript
{
  success: true,
  data: {
    id: number
  }
}
```

**Error**
- `CATEGORY_NOT_FOUND`: 카테고리 없음
- `CATEGORY_INACTIVE`: 비활성 카테고리
- `VALIDATION_ERROR`: 입력값 오류

---

#### GET `/posts/:id`
게시글 상세

**Response**
```typescript
{
  success: true,
  data: {
    id: number,
    title: string,
    content: string,
    author: {
      nickname: string,
      profileImageUrl: string | null
    },
    category: { id: number, name: string },
    subCategory: { id: number, name: string } | null,
    likeCount: number,
    dislikeCount: number,
    commentCount: number,
    views: number,
    isNotice: boolean,
    isAnonymous: boolean,
    isMine: boolean,              // 내 글인지
    myReaction: "like" | "dislike" | null,
    createdAt: string,
    updatedAt: string | null
  }
}
```

**Error**
- `POST_NOT_FOUND`: 게시글 없음

---

#### PATCH `/posts/:id`
게시글 수정

**Request**
```typescript
{
  title?: string,
  content?: string
}
```

**Response**
```typescript
{
  success: true,
  data: {
    id: number
  }
}
```

**Error**
- `POST_NOT_FOUND`: 게시글 없음
- `POST_NO_PERMISSION`: 권한 없음

---

#### DELETE `/posts/:id`
게시글 삭제 (soft delete)

**Response**
```typescript
{
  success: true,
  data: null
}
```

**Error**
- `POST_NOT_FOUND`: 게시글 없음
- `POST_NO_PERMISSION`: 권한 없음

---

#### POST `/posts/:id/reaction`
게시글 좋아요/싫어요

**Request**
```typescript
{
  isLike: boolean  // true=좋아요, false=싫어요
}
```

**Response**
```typescript
{
  success: true,
  data: {
    likeCount: number,
    dislikeCount: number,
    myReaction: "like" | "dislike"
  }
}
```

**동작 방식**
- 기존 reaction과 같은 값이면 → 취소 (myReaction: null)
- 기존 reaction과 다른 값이면 → 변경
- 없었으면 → 생성

**Error**
- `POST_NOT_FOUND`: 게시글 없음

---

#### DELETE `/posts/:id/reaction`
게시글 좋아요/싫어요 취소

**Response**
```typescript
{
  success: true,
  data: {
    likeCount: number,
    dislikeCount: number,
    myReaction: null
  }
}
```

---

### 4.5 댓글 (Comment)

#### GET `/posts/:postId/comments`
댓글 목록

**Query Parameters**
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|:----:|-------|------|
| page | number | - | 1 | 페이지 번호 |
| limit | number | - | 20 | 페이지당 개수 |

**Response**
```typescript
{
  success: true,
  data: {
    comments: [{
      id: number,
      content: string,
      author: {
        nickname: string,
        profileImageUrl: string | null
      },
      rootId: number | null,       // 그룹화용 (null이면 원댓글)
      parentId: number | null,     // 멘션 대상
      parentAuthor: {              // parentId가 있을 때만
        nickname: string
      } | null,
      likeCount: number,
      dislikeCount: number,
      isMine: boolean,
      myReaction: "like" | "dislike" | null,
      isDeleted: boolean,          // 삭제된 댓글 (내용 숨김)
      createdAt: string
    }],
    pagination: {
      page: number,
      limit: number,
      total: number,
      lastPage: number
    }
  }
}
```

**정렬 방식**
- `rootId` (또는 id) 오름차순 → `id` 오름차순
- 같은 그룹(rootId)의 댓글들이 모여서 표시됨

---

#### POST `/posts/:postId/comments`
댓글 작성

**Request**
```typescript
{
  content: string,         // 1~1000자
  parentId?: number        // 대댓글인 경우 멘션 대상 댓글 ID
}
```

**Response**
```typescript
{
  success: true,
  data: {
    id: number,
    content: string,
    author: {
      nickname: string,
      profileImageUrl: string | null
    },
    rootId: number | null,
    parentId: number | null,
    parentAuthor: { nickname: string } | null,
    createdAt: string
  }
}
```

**동작 방식**
- `parentId`가 없으면 → 원댓글 (`rootId` = null)
- `parentId`가 있으면 → 대댓글
  - 부모 댓글의 `rootId`가 null이면 → 부모가 원댓글, `rootId` = 부모 id
  - 부모 댓글의 `rootId`가 있으면 → `rootId` = 부모의 rootId

**Error**
- `POST_NOT_FOUND`: 게시글 없음
- `COMMENT_NOT_FOUND`: 부모 댓글 없음 (parentId 지정 시)
- `VALIDATION_ERROR`: 입력값 오류

---

#### DELETE `/comments/:id`
댓글 삭제 (soft delete)

**Response**
```typescript
{
  success: true,
  data: null
}
```

**동작 방식**
- 삭제된 댓글은 `isDeleted: true`로 표시
- 내용은 "삭제된 댓글입니다"로 대체
- 대댓글이 있어도 삭제 가능 (대댓글은 유지)

**Error**
- `COMMENT_NOT_FOUND`: 댓글 없음
- `COMMENT_NO_PERMISSION`: 권한 없음

---

#### POST `/comments/:id/reaction`
댓글 좋아요/싫어요

**Request**
```typescript
{
  isLike: boolean
}
```

**Response**
```typescript
{
  success: true,
  data: {
    likeCount: number,
    dislikeCount: number,
    myReaction: "like" | "dislike" | null
  }
}
```

---

#### DELETE `/comments/:id/reaction`
댓글 좋아요/싫어요 취소

**Response**
```typescript
{
  success: true,
  data: {
    likeCount: number,
    dislikeCount: number,
    myReaction: null
  }
}
```

---

## 5. 공통 타입

```typescript
// 페이지네이션
interface Pagination {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
}

// 작성자 정보
interface Author {
  nickname: string;
  profileImageUrl: string | null;
}

// 카테고리
interface Category {
  id: number;
  name: string;
}

// 서브카테고리
interface SubCategory {
  id: number;
  name: string;
}
```

---

## 6. 익명 처리

### 6.1 익명 ID 생성
```typescript
function getAnonymousId(userId: number, postId: number): string {
  const salt = process.env.ANON_SALT;
  const hash = sha256(`${userId}:${postId}:${salt}`);
  return hash.substring(0, 6);
}
```

### 6.2 표시 규칙
| 상황 | 표시 |
|------|------|
| 글쓴이 본인 | `익명(글쓴이)` |
| 댓글 작성자 | `익명(a3f8e2)` |
| 같은 사람 다른 댓글 | 동일 익명 ID |

### 6.3 적용 조건
- `Category.isAnonymous = true`인 게시판의 글/댓글
