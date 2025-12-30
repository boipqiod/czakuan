import type { UserRepository } from "@/domain/repositories/UserRepository";
import { UserRepositoryImpl } from "@/infrastructure/repositories/UserRepositoryImpl";
import { JwtProvider } from "@/infrastructure/auth/JwtProvider";
import { KakaoClient } from "@/infrastructure/kakao/KakaoClient";
import { DomainError } from "@/domain/errors/DomainError";
import { ErrorCodes } from "@/domain/errors/ErrorCodes";
import type { User } from "@/domain/entities/User";

export interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

export class AuthService {
  private userRepository: UserRepository;
  private jwtProvider: JwtProvider;
  private kakaoClient: KakaoClient;

  constructor() {
    this.userRepository = new UserRepositoryImpl();
    this.jwtProvider = new JwtProvider();
    this.kakaoClient = new KakaoClient();
  }

  getKakaoAuthUrl(): string {
    return this.kakaoClient.getAuthorizationUrl();
  }

  async kakaoLogin(code: string, nickname?: string): Promise<LoginResult> {
    const kakaoToken = await this.kakaoClient.getToken(code);
    const kakaoUser = await this.kakaoClient.getUserInfo(kakaoToken.access_token);

    let user = await this.userRepository.findByKakaoId(BigInt(kakaoUser.id));
    let isNewUser = false;

    if (!user) {
      if (!nickname) {
        throw new DomainError(ErrorCodes.USER_INVALID_NICKNAME, "닉네임을 입력해주세요.");
      }

      const exists = await this.userRepository.existsByNickname(nickname);
      if (exists) {
        throw new DomainError(ErrorCodes.USER_DUPLICATE_NICKNAME);
      }

      user = await this.userRepository.create({
        kakaoId: BigInt(kakaoUser.id),
        nickname,
        email: kakaoUser.kakao_account?.email,
        profileImageUrl: kakaoUser.kakao_account?.profile?.profile_image_url,
      });

      isNewUser = true;
    }

    const tokens = this.jwtProvider.createTokenPair({
      userId: user.id,
      role: user.role,
    });

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isNewUser,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtProvider.verifyToken(refreshToken);

      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new DomainError(ErrorCodes.USER_NOT_FOUND);
      }

      return this.jwtProvider.createTokenPair({
        userId: user.id,
        role: user.role,
      });
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw new DomainError(ErrorCodes.AUTH_EXPIRED_TOKEN);
    }
  }

  async verifyAndGetUser(accessToken: string): Promise<User> {
    try {
      const payload = this.jwtProvider.verifyToken(accessToken);
      const user = await this.userRepository.findById(payload.userId);

      if (!user) {
        throw new DomainError(ErrorCodes.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw new DomainError(ErrorCodes.AUTH_INVALID_TOKEN);
    }
  }
}
