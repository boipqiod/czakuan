import {Author} from '@/types/user';
import {DislikeToComment, LikeToComment, ReportToComment} from '@prisma/client';

export type CommentReslut = {
  id: string;
  postId: string;
  content: string;
  likes: LikeToComment[];
  dislikes: DislikeToComment[];
  reports: ReportToComment[];
  parentId?: string | null;
  rootId?: string | null;
  updatedAt: Date;
  createdAt: Date;
  deletedAt?: Date | null;
  author: Author;
};
