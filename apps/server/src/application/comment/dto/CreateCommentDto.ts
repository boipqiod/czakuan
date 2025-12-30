export interface CreateCommentDto {
  content: string;
  parentId?: number;
  isPrivate?: boolean;
}
