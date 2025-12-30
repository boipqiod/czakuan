import type { UserProfile } from "../user/types";

export interface Post {
  id: number;
  title: string;
  content: string;
  images: string[];
  thumbnailUrl: string | null;
  views: number;
  likeCount: number;
  dislikeCount: number;
  isNotice: boolean;
  isAnonymous: boolean;
  categoryId: number;
  subCategoryId: number | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostListItem {
  id: number;
  title: string;
  thumbnailUrl: string | null;
  views: number;
  likeCount: number;
  commentCount: number;
  isNotice: boolean;
  isAnonymous: boolean;
  createdAt: string;
  author: {
    nickname: string;
    profileImageUrl: string | null;
  } | null;
  anonymousId: string | null;
}

export interface PostDetail {
  id: number;
  title: string;
  content: string;
  images: string[];
  thumbnailUrl: string | null;
  views: number;
  likeCount: number;
  dislikeCount: number;
  isNotice: boolean;
  isAnonymous: boolean;
  categoryId: number;
  subCategoryId: number | null;
  createdAt: string;
  updatedAt: string;
  author: UserProfile | null;
  anonymousId: string | null;
  commentCount: number;
  myReaction: {
    liked: boolean;
    disliked: boolean;
  } | null;
  category: Category;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  isAnonymous: boolean;
  isUse: boolean;
}

export interface CategoryGroup {
  id: number;
  name: string;
  categories: Category[];
}

export interface PostListResult {
  posts: PostListItem[];
  notices: PostListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePostInput {
  title: string;
  content: string;
  images: string[];
  categoryId: number;
  subCategoryId?: number;
  isNotice?: boolean;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  images?: string[];
}
