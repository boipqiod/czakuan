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
