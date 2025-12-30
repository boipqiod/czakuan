# Phase 03: BE Application Layer

> 백엔드 애플리케이션 레이어 - 비즈니스 로직 서비스

## 목표

- 도메인별 Service 클래스 구현
- 비즈니스 로직 오케스트레이션
- 트랜잭션 처리
- DTO 정의

## 선행 조건

- Phase 01 완료 (Domain 레이어)
- Phase 02 완료 (Infrastructure 레이어)

---

## 1. 폴더 구조

```
apps/server/src/application/
├── auth/
│   ├── AuthService.ts
│   └── dto/
│       └── KakaoLoginDto.ts
├── post/
│   ├── PostService.ts
│   └── dto/
│       ├── CreatePostDto.ts
│       └── UpdatePostDto.ts
├── comment/
│   ├── CommentService.ts
│   └── dto/
│       └── CreateCommentDto.ts
├── category/
│   └── CategoryService.ts
├── user/
│   ├── UserService.ts
│   └── dto/
│       └── UpdateUserDto.ts
└── common/
    └── AnonymousService.ts
```

---

## 2. 태스크 체크리스트

### 2.1 Services

- [ ] `AuthService.ts` - 카카오 로그인, 토큰 갱신, 로그아웃
- [ ] `PostService.ts` - 게시글 CRUD, 좋아요/싫어요, 신고
- [ ] `CommentService.ts` - 댓글 CRUD, 좋아요/싫어요, 신고
- [ ] `CategoryService.ts` - 카테고리 목록 조회
- [ ] `UserService.ts` - 프로필 조회/수정, 내 글/댓글 조회
- [ ] `AnonymousService.ts` - 익명 ID 관리

### 2.2 DTOs

- [ ] `KakaoLoginDto.ts`
- [ ] `CreatePostDto.ts`, `UpdatePostDto.ts`
- [ ] `CreateCommentDto.ts`
- [ ] `UpdateUserDto.ts`

---

## 3. AuthService

### 3.1 application/auth/AuthService.ts

```typescript
// application/auth/AuthService.ts

import type { UserRepository } from "@/domain/repositories/UserRepository";
import { UserRepositoryImpl } from "@/infrastructure/repositories/UserRepositoryImpl";
import { JwtProvider } from "@/infrastructure/auth/JwtProvider";
import { KakaoClient } from "@/infrastructure/kakao/KakaoClient";
import { DomainError } from "@/domain/errors/DomainError";
import { ErrorCodes } from "@/domain/errors/ErrorCodes";
import type { User } from "@/domain/entities/User";

export interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

export class AuthService {
  private userRepository: UserRepository;
  private jwtProvider: JwtProvider;
  private kakaoClient: KakaoClient;

  constructor() {
    this.userRepository = new UserRepositoryImpl();
    this.jwtProvider = new JwtProvider();
    this.kakaoClient = new KakaoClient();
  }

  // 카카오 인가 URL 반환
  getKakaoAuthUrl(): string {
    return this.kakaoClient.getAuthorizationUrl();
  }

  // 카카오 로그인/회원가입
  async kakaoLogin(code: string, nickname?: string): Promise<LoginResult> {
    // 1. 카카오 토큰 발급
    const kakaoToken = await this.kakaoClient.getToken(code);

    // 2. 카카오 사용자 정보 조회
    const kakaoUser = await this.kakaoClient.getUserInfo(kakaoToken.access_token);

    // 3. 기존 사용자 확인
    let user = await this.userRepository.findByKakaoId(BigInt(kakaoUser.id));
    let isNewUser = false;

    if (!user) {
      // 신규 사용자 - 닉네임 필수
      if (!nickname) {
        throw new DomainError(ErrorCodes.USER_INVALID_NICKNAME, "닉네임을 입력해주세요.");
      }

      // 닉네임 중복 확인
      const exists = await this.userRepository.existsByNickname(nickname);
      if (exists) {
        throw new DomainError(ErrorCodes.USER_DUPLICATE_NICKNAME);
      }

      // 사용자 생성
      user = await this.userRepository.create({
        kakaoId: BigInt(kakaoUser.id),
        nickname,
        email: kakaoUser.kakao_account?.email,
        profileImageUrl: kakaoUser.kakao_account?.profile?.profile_image_url,
      });

      isNewUser = true;
    }

    // 4. JWT 토큰 발급
    const tokens = this.jwtProvider.createTokenPair({
      userId: user.id,
      role: user.role,
    });

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isNewUser,
    };
  }

  // 토큰 갱신
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtProvider.verifyToken(refreshToken);

      // 사용자 존재 확인
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new DomainError(ErrorCodes.USER_NOT_FOUND);
      }

      // 새 토큰 발급
      return this.jwtProvider.createTokenPair({
        userId: user.id,
        role: user.role,
      });
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw new DomainError(ErrorCodes.AUTH_EXPIRED_TOKEN);
    }
  }

  // 토큰 검증 및 사용자 조회
  async verifyAndGetUser(accessToken: string): Promise<User> {
    try {
      const payload = this.jwtProvider.verifyToken(accessToken);
      const user = await this.userRepository.findById(payload.userId);

      if (!user) {
        throw new DomainError(ErrorCodes.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw new DomainError(ErrorCodes.AUTH_INVALID_TOKEN);
    }
  }
}
```

---

## 4. PostService

### 4.1 application/post/PostService.ts

```typescript
// application/post/PostService.ts

import type { PostRepository } from "@/domain/repositories/PostRepository";
import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type { ReactionRepository } from "@/domain/repositories/ReactionRepository";
import { PostRepositoryImpl } from "@/infrastructure/repositories/PostRepositoryImpl";
import { CategoryRepositoryImpl } from "@/infrastructure/repositories/CategoryRepositoryImpl";
import { ReactionRepositoryImpl } from "@/infrastructure/repositories/ReactionRepositoryImpl";
import { S3Client } from "@/infrastructure/s3/S3Client";
import { validatePost, canEditPost, canDeletePost, canCreateNotice } from "@/domain/rules/postRules";
import { DomainError } from "@/domain/errors/DomainError";
import { ErrorCodes } from "@/domain/errors/ErrorCodes";
import type { Post, PostListItem, PostDetail } from "@/domain/entities/Post";
import type { UserRole } from "@/domain/entities/User";
import type { CreatePostDto, UpdatePostDto } from "./dto/CreatePostDto";

export interface PostListResult {
  posts: PostListItem[];
  notices: PostListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PostService {
  private postRepository: PostRepository;
  private categoryRepository: CategoryRepository;
  private reactionRepository: ReactionRepository;
  private s3Client: S3Client;

  constructor() {
    this.postRepository = new PostRepositoryImpl();
    this.categoryRepository = new CategoryRepositoryImpl();
    this.reactionRepository = new ReactionRepositoryImpl();
    this.s3Client = new S3Client();
  }

  // 게시글 목록 조회
  async getPostList(params: {
    categoryId?: number;
    subCategoryId?: number;
    page: number;
    limit: number;
  }): Promise<PostListResult> {
    const { categoryId, page, limit } = params;

    const [posts, notices, total] = await Promise.all([
      this.postRepository.findList(params),
      categoryId ? this.postRepository.findNoticeList(categoryId) : Promise.resolve([]),
      this.postRepository.count(params),
    ]);

    return {
      posts,
      notices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 게시글 상세 조회
  async getPostDetail(postId: number, userId?: number): Promise<PostDetail> {
    const post = await this.postRepository.findDetail(postId, userId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }
    return post;
  }

  // 조회수 증가
  async incrementViews(postId: number): Promise<void> {
    await this.postRepository.incrementViews(postId);
  }

  // 게시글 생성
  async createPost(userId: number, userRole: UserRole, dto: CreatePostDto): Promise<Post> {
    // 1. 입력값 검증
    const validation = validatePost({ title: dto.title, content: dto.content });
    if (!validation.valid) {
      throw new DomainError(ErrorCodes.VALIDATION_ERROR, validation.message);
    }

    // 2. 카테고리 확인
    const category = await this.categoryRepository.findCategoryById(dto.categoryId);
    if (!category || !category.isUse) {
      throw new DomainError(ErrorCodes.CATEGORY_NOT_FOUND);
    }

    // 3. 공지사항 권한 확인
    if (dto.isNotice && !canCreateNotice(userRole)) {
      throw new DomainError(ErrorCodes.AUTH_FORBIDDEN, "공지사항은 관리자만 작성할 수 있습니다.");
    }

    // 4. 이미지 이동 (tmp → post)
    const movedImages = await this.moveImagesToPost(dto.images, 0); // ID 없이 임시 처리

    // 5. 게시글 생성
    const post = await this.postRepository.create(userId, {
      ...dto,
      images: movedImages,
      isNotice: dto.isNotice ?? false,
    });

    // 6. 익명 게시판이면 익명 ID 생성
    if (category.isAnonymous) {
      await this.reactionRepository.findOrCreateAnonymousId(userId, post.id);
    }

    // 7. 이미지 최종 경로로 이동
    const finalImages = await this.moveImagesToPost(movedImages, post.id);
    if (finalImages.length > 0) {
      await this.postRepository.update(post.id, { images: finalImages });
    }

    return post;
  }

  // 게시글 수정
  async updatePost(
    postId: number,
    userId: number,
    userRole: UserRole,
    dto: UpdatePostDto
  ): Promise<Post> {
    // 1. 게시글 조회
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }

    // 2. 수정 권한 확인
    if (!canEditPost(post, userId)) {
      throw new DomainError(ErrorCodes.POST_FORBIDDEN);
    }

    // 3. 입력값 검증
    const validation = validatePost({
      title: dto.title ?? post.title,
      content: dto.content ?? post.content,
    });
    if (!validation.valid) {
      throw new DomainError(ErrorCodes.VALIDATION_ERROR, validation.message);
    }

    // 4. 이미지 처리 (새 이미지 이동, 삭제된 이미지 정리)
    let images = post.images;
    if (dto.images) {
      images = await this.processUpdateImages(post.id, post.images, dto.images);
    }

    // 5. 업데이트
    return this.postRepository.update(postId, {
      title: dto.title,
      content: dto.content,
      images,
    });
  }

  // 게시글 삭제
  async deletePost(postId: number, userId: number, userRole: UserRole): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }

    if (!canDeletePost(post, userId, userRole)) {
      throw new DomainError(ErrorCodes.POST_FORBIDDEN);
    }

    await this.postRepository.softDelete(postId);
  }

  // 좋아요 토글
  async toggleLike(postId: number, userId: number): Promise<{ liked: boolean; likeCount: number }> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }

    const reactions = await this.reactionRepository.findPostReactions(userId, postId);

    if (reactions.liked) {
      await this.reactionRepository.deletePostLike(userId, postId);
      return { liked: false, likeCount: post.likeCount - 1 };
    } else {
      await this.reactionRepository.createPostLike(userId, postId);
      return { liked: true, likeCount: post.likeCount + 1 };
    }
  }

  // 싫어요 토글
  async toggleDislike(postId: number, userId: number): Promise<{ disliked: boolean; dislikeCount: number }> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }

    const reactions = await this.reactionRepository.findPostReactions(userId, postId);

    if (reactions.disliked) {
      await this.reactionRepository.deletePostDislike(userId, postId);
      return { disliked: false, dislikeCount: post.dislikeCount - 1 };
    } else {
      await this.reactionRepository.createPostDislike(userId, postId);
      return { disliked: true, dislikeCount: post.dislikeCount + 1 };
    }
  }

  // 신고
  async reportPost(postId: number, userId: number, reason: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }

    if (post.userId === userId) {
      throw new DomainError(ErrorCodes.CANNOT_REPORT_OWN);
    }

    if (!reason.trim()) {
      throw new DomainError(ErrorCodes.REPORT_REASON_REQUIRED);
    }

    const existing = await this.reactionRepository.findReport(userId, "POST", postId);
    if (existing) {
      throw new DomainError(ErrorCodes.ALREADY_REPORTED);
    }

    await this.reactionRepository.createReport(userId, "POST", postId, reason);
  }

  // 인기 게시글
  async getPopularPosts(page: number, limit: number): Promise<PostListItem[]> {
    return this.postRepository.findPopularList(page, limit);
  }

  // 이미지 처리 헬퍼
  private async moveImagesToPost(images: string[], postId: number): Promise<string[]> {
    // 실제 S3 이동 로직
    return images; // 간략화
  }

  private async processUpdateImages(
    postId: number,
    oldImages: string[],
    newImages: string[]
  ): Promise<string[]> {
    // 삭제된 이미지 제거, 새 이미지 이동
    return newImages; // 간략화
  }
}
```

### 4.2 application/post/dto/CreatePostDto.ts

```typescript
// application/post/dto/CreatePostDto.ts

export interface CreatePostDto {
  title: string;
  content: string;
  images: string[];
  categoryId: number;
  subCategoryId?: number;
  isNotice?: boolean;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  images?: string[];
}
```

---

## 5. CommentService

### 5.1 application/comment/CommentService.ts

```typescript
// application/comment/CommentService.ts

import type { CommentRepository } from "@/domain/repositories/CommentRepository";
import type { PostRepository } from "@/domain/repositories/PostRepository";
import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type { ReactionRepository } from "@/domain/repositories/ReactionRepository";
import { CommentRepositoryImpl } from "@/infrastructure/repositories/CommentRepositoryImpl";
import { PostRepositoryImpl } from "@/infrastructure/repositories/PostRepositoryImpl";
import { CategoryRepositoryImpl } from "@/infrastructure/repositories/CategoryRepositoryImpl";
import { ReactionRepositoryImpl } from "@/infrastructure/repositories/ReactionRepositoryImpl";
import { validateComment, canDeleteComment, canViewPrivateComment, getDeletedCommentText, getPrivateCommentText } from "@/domain/rules/commentRules";
import { DomainError } from "@/domain/errors/DomainError";
import { ErrorCodes } from "@/domain/errors/ErrorCodes";
import type { Comment, CommentListItem } from "@/domain/entities/Comment";
import type { UserRole } from "@/domain/entities/User";

export interface CommentListResult {
  comments: CommentListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CommentService {
  private commentRepository: CommentRepository;
  private postRepository: PostRepository;
  private categoryRepository: CategoryRepository;
  private reactionRepository: ReactionRepository;

  constructor() {
    this.commentRepository = new CommentRepositoryImpl();
    this.postRepository = new PostRepositoryImpl();
    this.categoryRepository = new CategoryRepositoryImpl();
    this.reactionRepository = new ReactionRepositoryImpl();
  }

  // 댓글 목록 조회
  async getCommentList(
    postId: number,
    page: number,
    limit: number,
    userId?: number,
    userRole?: UserRole
  ): Promise<CommentListResult> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }

    const [comments, total] = await Promise.all([
      this.commentRepository.findList({ postId, page, limit, userId }),
      this.commentRepository.count(postId),
    ]);

    // 익명 및 비공개 처리
    const processedComments = await this.processComments(
      comments,
      post,
      userId ?? null,
      userRole ?? null
    );

    return {
      comments: processedComments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 댓글 생성
  async createComment(
    userId: number,
    postId: number,
    content: string,
    parentId?: number,
    isPrivate?: boolean
  ): Promise<Comment> {
    // 1. 검증
    const validation = validateComment(content);
    if (!validation.valid) {
      throw new DomainError(ErrorCodes.COMMENT_INVALID_CONTENT, validation.message);
    }

    // 2. 게시글 확인
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }

    // 3. 부모 댓글 확인 (대댓글인 경우)
    let rootId: number | undefined;
    if (parentId) {
      const parent = await this.commentRepository.findById(parentId);
      if (!parent || parent.postId !== postId) {
        throw new DomainError(ErrorCodes.COMMENT_NOT_FOUND, "부모 댓글을 찾을 수 없습니다.");
      }
      rootId = parent.rootId;
    }

    // 4. 댓글 생성
    const comment = await this.commentRepository.create(userId, {
      content,
      postId,
      parentId,
      isPrivate: isPrivate ?? false,
    });

    // 5. rootId 업데이트 (루트 댓글이면 자기 자신)
    const finalRootId = rootId ?? comment.id;
    await this.commentRepository.updateRootId(comment.id, finalRootId);

    // 6. 익명 게시판이면 익명 ID 생성
    const category = await this.categoryRepository.findCategoryById(post.categoryId);
    if (category?.isAnonymous) {
      await this.reactionRepository.findOrCreateAnonymousId(userId, postId);
    }

    return { ...comment, rootId: finalRootId };
  }

  // 댓글 삭제
  async deleteComment(commentId: number, userId: number, userRole: UserRole): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new DomainError(ErrorCodes.COMMENT_NOT_FOUND);
    }

    if (!canDeleteComment(comment, userId, userRole)) {
      throw new DomainError(ErrorCodes.COMMENT_FORBIDDEN);
    }

    await this.commentRepository.softDelete(commentId);
  }

  // 좋아요/싫어요 토글 (PostService와 유사)
  async toggleLike(commentId: number, userId: number): Promise<{ liked: boolean }> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new DomainError(ErrorCodes.COMMENT_NOT_FOUND);
    }

    const reactions = await this.reactionRepository.findCommentReactions(userId, commentId);

    if (reactions.liked) {
      await this.reactionRepository.deleteCommentLike(userId, commentId);
      return { liked: false };
    } else {
      await this.reactionRepository.createCommentLike(userId, commentId);
      return { liked: true };
    }
  }

  async toggleDislike(commentId: number, userId: number): Promise<{ disliked: boolean }> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new DomainError(ErrorCodes.COMMENT_NOT_FOUND);
    }

    const reactions = await this.reactionRepository.findCommentReactions(userId, commentId);

    if (reactions.disliked) {
      await this.reactionRepository.deleteCommentDislike(userId, commentId);
      return { disliked: false };
    } else {
      await this.reactionRepository.createCommentDislike(userId, commentId);
      return { disliked: true };
    }
  }

  // 신고
  async reportComment(commentId: number, userId: number, reason: string): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new DomainError(ErrorCodes.COMMENT_NOT_FOUND);
    }

    if (comment.userId === userId) {
      throw new DomainError(ErrorCodes.CANNOT_REPORT_OWN);
    }

    if (!reason.trim()) {
      throw new DomainError(ErrorCodes.REPORT_REASON_REQUIRED);
    }

    const existing = await this.reactionRepository.findReport(userId, "COMMENT", commentId);
    if (existing) {
      throw new DomainError(ErrorCodes.ALREADY_REPORTED);
    }

    await this.reactionRepository.createReport(userId, "COMMENT", commentId, reason);
  }

  // 댓글 처리 (익명, 비공개, 삭제 표시)
  private async processComments(
    comments: CommentListItem[],
    post: any,
    userId: number | null,
    userRole: UserRole | null
  ): Promise<CommentListItem[]> {
    const category = await this.categoryRepository.findCategoryById(post.categoryId);
    const isAnonymous = category?.isAnonymous ?? false;

    // 익명 ID 맵 조회
    let anonymousMap = new Map<number, string>();
    if (isAnonymous) {
      const anonymousIds = await this.reactionRepository.findAnonymousIdsInPost(post.id);
      anonymousIds.forEach((a) => anonymousMap.set(a.userId, a.anonymousId));
    }

    return comments.map((comment) => {
      // 삭제된 댓글
      if (comment.isDeleted) {
        return {
          ...comment,
          content: getDeletedCommentText(),
          author: null,
          anonymousId: null,
        };
      }

      // 비공개 댓글 조회 권한 확인
      const canView = canViewPrivateComment(
        comment as any,
        userId,
        post.userId,
        userRole
      );

      if (comment.isPrivate && !canView) {
        return {
          ...comment,
          content: getPrivateCommentText(),
          author: null,
          anonymousId: null,
          canView: false,
        };
      }

      // 익명 처리
      if (isAnonymous) {
        const authorId = (comment as any).author?.id;
        return {
          ...comment,
          author: null,
          anonymousId: authorId ? anonymousMap.get(authorId) ?? null : null,
          canView: true,
        };
      }

      return { ...comment, canView: true };
    });
  }
}
```

---

## 6. CategoryService & UserService

### 6.1 CategoryService.ts

```typescript
// application/category/CategoryService.ts

import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryRepositoryImpl } from "@/infrastructure/repositories/CategoryRepositoryImpl";
import type { CategoryGroupWithCategories } from "@/domain/entities/Category";

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepositoryImpl();
  }

  async getAllCategories(): Promise<CategoryGroupWithCategories[]> {
    return this.categoryRepository.findAllGroups();
  }
}
```

### 6.2 UserService.ts

```typescript
// application/user/UserService.ts

import type { UserRepository } from "@/domain/repositories/UserRepository";
import type { PostRepository } from "@/domain/repositories/PostRepository";
import type { CommentRepository } from "@/domain/repositories/CommentRepository";
import { UserRepositoryImpl } from "@/infrastructure/repositories/UserRepositoryImpl";
import { PostRepositoryImpl } from "@/infrastructure/repositories/PostRepositoryImpl";
import { CommentRepositoryImpl } from "@/infrastructure/repositories/CommentRepositoryImpl";
import { validateNickname } from "@/domain/rules/userRules";
import { DomainError } from "@/domain/errors/DomainError";
import { ErrorCodes } from "@/domain/errors/ErrorCodes";
import type { User, UserProfile } from "@/domain/entities/User";

export class UserService {
  private userRepository: UserRepository;
  private postRepository: PostRepository;
  private commentRepository: CommentRepository;

  constructor() {
    this.userRepository = new UserRepositoryImpl();
    this.postRepository = new PostRepositoryImpl();
    this.commentRepository = new CommentRepositoryImpl();
  }

  async getProfile(userId: number): Promise<UserProfile> {
    const profile = await this.userRepository.findProfile(userId);
    if (!profile) {
      throw new DomainError(ErrorCodes.USER_NOT_FOUND);
    }
    return profile;
  }

  async updateProfile(userId: number, data: { nickname?: string; profileImageUrl?: string }): Promise<User> {
    if (data.nickname) {
      const validation = validateNickname(data.nickname);
      if (!validation.valid) {
        throw new DomainError(ErrorCodes.USER_INVALID_NICKNAME, validation.message);
      }

      const exists = await this.userRepository.existsByNickname(data.nickname, userId);
      if (exists) {
        throw new DomainError(ErrorCodes.USER_DUPLICATE_NICKNAME);
      }
    }

    return this.userRepository.update(userId, data);
  }

  async getMyPosts(userId: number, page: number, limit: number) {
    const [posts, total] = await Promise.all([
      this.postRepository.findByUserId(userId, page, limit),
      this.postRepository.countByUserId(userId),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMyComments(userId: number, page: number, limit: number) {
    const [comments, total] = await Promise.all([
      this.commentRepository.findByUserId(userId, page, limit),
      this.commentRepository.countByUserId(userId),
    ]);

    return {
      comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async checkNickname(nickname: string, excludeUserId?: number): Promise<boolean> {
    const validation = validateNickname(nickname);
    if (!validation.valid) {
      return false;
    }

    const exists = await this.userRepository.existsByNickname(nickname, excludeUserId);
    return !exists; // true면 사용 가능
  }
}
```

---

## 7. 검증 체크리스트

- [ ] 모든 Service 클래스 구현
- [ ] 모든 DTO 정의
- [ ] 비즈니스 규칙이 Service에서 호출됨
- [ ] 에러 상황에 적절한 DomainError throw
- [ ] TypeScript 컴파일 에러 없음

---

## 8. 다음 Phase

Phase 03 완료 후 → **Phase 04: BE_PRESENTATION.md** (Routes, Middlewares, DTOs)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-30 | 최초 작성 |
