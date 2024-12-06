import {User} from '@prisma/client';

export class TokenService {
  private readonly jwtSectet: string;
  constructor() {
    this.jwtSectet = process.env.JWT_SECRET ?? '';
  }

  createTokenByUser(user: User) {
    return {accessToken: '', refreshToken: ''};
  }
}
