import type { UserProfile } from "./User";
import type { Category, SubCategory } from "./Category";

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
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
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
  createdAt: Date;
  author: {
    nickname: string;
    profileImageUrl: string | null;
  } | null;
  anonymousId: string | null;
}

export interface PostDetail extends Post {
  author: UserProfile | null;
  anonymousId: string | null;
  category: Category;
  subCategory: SubCategory | null;
  commentCount: number;
  myReaction: {
    liked: boolean;
    disliked: boolean;
  } | null;
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
