import {User} from '@/types/user';
import jwt from 'jsonwebtoken';
import {cookies} from 'next/headers';

export class TokenService {
  constructor(
    private readonly jwtSectet: string = process.env.JWT_SECRET as string,
  ) {}

  createToken(payload: any, expiresIn: string) {
    return jwt.sign(payload, this.jwtSectet, {expiresIn});
  }

  verifyToken(token: string) {
    return jwt.verify(token, this.jwtSectet);
  }

  createTokenByUser(user: User) {
    const payload = {
      id: user.id,
      role: user.role,
      nickName: user.nickName,
      profileImageUrl: user.profileImageUrl,
    };

    const accessToken = this.createToken(payload, '1h');
    const refreshToken = this.createToken(payload, '7d');

    return {accessToken, refreshToken};
  }

  verifyAccessToken(token: string) {
    return this.verifyToken(token) as User;
  }

  async verifyCookieToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    const refreshToken = cookieStore.get('refreshToken');
    if (!token || !refreshToken) {
      return null;
    }
    return this.verifyAccessToken(token.value);
  }
}
