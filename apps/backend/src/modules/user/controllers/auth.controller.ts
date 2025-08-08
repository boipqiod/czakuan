import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';

export class KakaoLoginDto {
  kakaoId: string;
  nickName?: string;
  email?: string;
  name?: string;
  profileImageUrl?: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('kakao')
  @ApiOperation({ summary: 'Kakao login' })
  async kakaoLogin(@Body() kakaoLoginDto: KakaoLoginDto) {
    return this.authService.login(kakaoLoginDto.kakaoId, kakaoLoginDto);
  }
}