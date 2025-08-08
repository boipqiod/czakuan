export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BOARD_ADMIN = 'BOARD_ADMIN',
  USER = 'USER',
}

export interface User {
  id: number;
  email: string | null;
  nickName: string;
  profileImageUrl: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  updatedAt: Date;
  name: string | null;
  phoneNumber: string | null;
  role: Role;
  kakaoId: bigint;
}

export interface Post {
  id: number;
  subCategoryId: number | null;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  views: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  userId: number;
  images: string[];
  categoryId: number;
  isNotice: boolean;
  isAnonymous: boolean;
}

export interface Comment {
  id: number;
  content: string;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
  postId: number;
  userId: number;
  deletedAt: Date | null;
  rootId: number;
}

export interface Category {
  id: number;
  name: string;
  isUse: boolean;
  groupId: number;
  priority: number;
  isAnonymous: boolean;
  isPrivateComment: boolean;
}

export interface CategoryGroup {
  id: number;
  name: string;
  priority: number;
  isUse: boolean;
}