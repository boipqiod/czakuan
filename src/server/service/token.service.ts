import {User} from '@/types/user';
import jwt from 'jsonwebtoken';

export const TOKEN_NAME = '_t';
export const REFRESH_TOKEN_NAME = '_rt';

class TokenService {
  constructor(
    private readonly jwtSectet: string = process.env.JWT_SECRET as string,
  ) {}

  createToken(payload: object, expiresIn: string) {
    return jwt.sign(payload, this.jwtSectet, {expiresIn});
  }

  verifyToken(token: string) {
    try {
      const _token = token.split('').toReversed().join('');
      return jwt.verify(_token, this.jwtSectet);
    } catch (e) {
      console.error('### verifyToken', e);
      throw e;
    }
  }

  createTokenByUser(user: User) {
    const payload = {
      id: user.id,
      role: user.role,
      nickName: user.nickName,
      profileImageUrl: user.profileImageUrl,
    };
    const _accessToken = this.createToken(payload, '1m');
    const _refreshToken = this.createToken(payload, '7d');

    const accessToken = _accessToken.split('').toReversed().join('');
    const refreshToken = _refreshToken.split('').toReversed().join('');

    return {accessToken, refreshToken};
  }
}

export default TokenService;
