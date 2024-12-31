import {Author} from '@/types/user';
import {DislikeToComment, LikeToComment, ReportToComment} from '@prisma/client';

export type CommentResultType = {
  total: number;
  page: number;
  lastPage: number;
  list: CommentType[];
};

export type CommentType = {
  id: number;
  postId: number;
  content: string | null;
  likes: LikeToComment[];
  dislikes: DislikeToComment[];
  reports: ReportToComment[];
  parentId: number | null;
  rootId: number;
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date | null;
  author: Author;
  parent: {
    author: {
      nickName: string;
    };
  } | null;
};

export type PostDetailType = {
  id: number; // 게시물 ID
  subCategoryId: number | null; // 서브 카테고리 ID (없을 경우 null)
  title: string; // 게시물 제목
  content: string; // 게시물 내용 (HTML 또는 텍스트)
  views: number; // 조회수
  createdAt: Date; // 생성 날짜
  updatedAt: Date | null; // 수정 날짜 (수정되지 않았을 경우 null)
  categoryId: number; // 카테고리 ID

  dislikes: {
    userId: number; // 싫어요를 누른 사용자 ID
  }[]; // 싫어요 정보 배열

  likes: {
    userId: number; // 좋아요를 누른 사용자 ID
  }[]; // 좋아요 정보 배열

  author: Author; // 작성자 정보

  reports: {
    userId: number; // 신고한 사용자 ID
    // reason: string; // 신고 사유
    // createdAt: Date; // 신고 날짜
  }[]; // 신고 정보 배열
};
