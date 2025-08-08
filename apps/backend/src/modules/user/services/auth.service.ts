import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { CreateUserDto } from '../dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(kakaoId: string, userData: Partial<CreateUserDto>) {
    let user = await this.userService.findByKakaoId(kakaoId);
    
    if (!user) {
      user = await this.userService.create({
        kakaoId,
        nickName: userData.nickName || `user_${kakaoId}`,
        email: userData.email,
        name: userData.name,
        profileImageUrl: userData.profileImageUrl,
      });
    }

    const payload = { sub: user.id, kakaoId: user.kakaoId.toString() };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async validateUser(userId: number) {
    return this.userService.findOne(userId);
  }
}