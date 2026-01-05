export interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
}

export interface KakaoUserInfo {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

export class KakaoClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor() {
    const clientId = process.env.KAKAO_CLIENT_ID;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET;
    const redirectUri = process.env.KAKAO_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.warn(
        "Warning: Kakao OAuth 환경변수가 설정되지 않았습니다. " +
        "KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET, KAKAO_REDIRECT_URI를 설정해주세요."
      );
    }

    this.clientId = clientId || "";
    this.clientSecret = clientSecret || "";
    this.redirectUri = redirectUri || "";
  }

  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
    });
    return `https://kauth.kakao.com/oauth/authorize?${params}`;
  }

  async getToken(code: string): Promise<KakaoTokenResponse> {
    const response = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get Kakao token");
    }

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<KakaoUserInfo> {
    const response = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get Kakao user info");
    }

    return response.json();
  }
}
