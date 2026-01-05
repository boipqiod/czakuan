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
import type { UpdateUserDto } from "./dto/UpdateUserDto";

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

  async updateProfile(userId: number, data: UpdateUserDto): Promise<User> {
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
    return !exists;
  }
}
