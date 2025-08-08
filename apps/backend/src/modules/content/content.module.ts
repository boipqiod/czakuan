import { Module } from '@nestjs/common';
import { PostController } from './controllers/post.controller';
import { CommentController } from './controllers/comment.controller';
import { CategoryController } from './controllers/category.controller';
import { PostService } from './services/post.service';
import { CommentService } from './services/comment.service';
import { CategoryService } from './services/category.service';

@Module({
  controllers: [PostController, CommentController, CategoryController],
  providers: [PostService, CommentService, CategoryService],
  exports: [PostService, CommentService, CategoryService],
})
export class ContentModule {}