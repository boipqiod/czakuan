import {Author} from '@/types/user';
import {DislikeToComment, LikeToComment, ReportToComment} from '@prisma/client';

export type CommentReslut = {
  id: number;
  postId: number;
  content: string;
  likes: LikeToComment[];
  dislikes: DislikeToComment[];
  reports: ReportToComment[];
  parentId: number | null;
  rootId: number;
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date | null;
  author: Author;
};
