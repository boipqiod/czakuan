import axios from 'axios';

//TODO: 데이터 같은거 좀 정리를 하는게 좋을듯
export interface KakaoTokenResponse {
  access_token: string;
}

export interface KakaoUserResponse {
  id: number;
  kakao_account?: {
    name?: string;
    email?: string;
    phone_number?: string;
  };
}

export class Kakao {
  readonly clientId: string = process.env.KAKAO_CLIENT_ID ?? '';

  async getToken(code: string) {
    console.log('### Kakao.getToken', {code});

    const response = await axios.post<KakaoTokenResponse>(
      'https://kauth.kakao.com/oauth/token',
      {
        grant_type: 'authorization_code',
        client_id: this.clientId,
        code,
      },
      {
        headers: {
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      },
    );

    return response.data;
  }

  async getUserData(token: string): Promise<KakaoUserResponse> {
    const response = await axios.get<KakaoUserResponse>(
      'https://kapi.kakao.com/v2/user/me',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  }
}

export default new Kakao();
