import kakao from '@/server/modules/kakao';
import s3 from '@/server/modules/s3';
import {UserRepository} from '@/server/repositories/user.repository';
import {TokenService} from '@/server/service/token.service';

export class UserService {
  constructor(
    private readonly tokenService: TokenService = new TokenService(),
    private readonly userRepository: UserRepository,
    private readonly kakaoHelper = kakao,
    private readonly s3Helper = s3,
  ) {}
  async getUser(id: number) {
    const user = await this.userRepository.getUserById(id);

    if (!user) {
      throw new Error('사용자 정보가 존재하지 않습니다.');
    }

    const {role, nickName, profileImageUrl} = user;

    const {accessToken, refreshToken} =
      this.tokenService.createTokenByUser(user);

    return {
      id,
      role,
      nickName,
      profileImageUrl,
      accessToken,
      refreshToken,
    };
  }

  async loginCallback(code: string) {
    /**
     * 1. 카카오 로그인 콜백으로부터 받은 code를 이용하여 카카오 로그인 API에 요청
     * 2. 카카오 로그인 API로부터 받은 access_token이용하여 네이버 사용자 정보 조회
     * 3. 우리 시스템 내부에 사용자가 존재하는지 확인
     * 4. 사용자가 존재하지 않는다면, 토큰과 함께 회원가입 페이지로 리다이렉트
     * 5. 사용자가 존재한다면, 사용자 id와 사용자 정보 페이지로 리다이렉트
     */
    const {access_token} = await this.kakaoHelper.getToken(code);

    const {id} = await this.kakaoHelper.getUserData(access_token);
    console.log('### 카카오 사용자 조회 요청', {id, access_token});

    const user = await this.userRepository.getUserByKakaoId(id);

    if (!user) {
      throw new Error('사용자 정보가 존재하지 않습니다.');
    }

    const {accessToken, refreshToken} =
      this.tokenService.createTokenByUser(user);

    return {
      id: user.id,
      role: user.role,
      nickName: user.nickName,
      profileImageUrl: user.profileImageUrl ?? undefined,
      accessToken,
      refreshToken,
    };
  }

  async createUser({
    code,
    userData,
  }: {
    code: string;
    userData: {
      nickName: string;
      profileImageUrl?: string;
    };
  }) {
    const {nickName} = userData;
    const {access_token} = await this.kakaoHelper.getToken(code);
    const {id} = await this.kakaoHelper.getUserData(access_token);

    const isNickNameExist =
      await this.userRepository.getUserByNickName(nickName);

    if (isNickNameExist) {
      throw new Error('이미 존재하는 닉네임입니다.');
    }

    const user = await this.userRepository.getUserByKakaoId(id);

    // 사용자가 이미 존재하는 경우 로그인 처리
    if (user) {
      const {accessToken, refreshToken} =
        this.tokenService.createTokenByUser(user);
      return {
        id: user.id,
        role: user.role,
        nickName: user.nickName,
        profileImageUrl: user.profileImageUrl ?? undefined,
        accessToken,
        refreshToken,
      };
    }

    try {
      const createdUser = await this.userRepository.createUser(id, nickName);

      const {accessToken, refreshToken} =
        this.tokenService.createTokenByUser(createdUser);

      return {
        id: createdUser.id,
        role: createdUser.role,
        profileImageUrl: createdUser.profileImageUrl ?? undefined,
        nickName: createdUser.nickName,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('### 사용자 생성 실패', error);
      throw new Error('사용자 생성에 실패했습니다.');
    }
  }

  async updateUser(id: number, nickName?: string, profileImageUrl?: string) {
    const movedProfileImageUrl = profileImageUrl
      ? await this.s3Helper.moveObject(
          profileImageUrl,
          `profile/${id}`,
          'profile',
        )
      : undefined;

    await this.userRepository.updateUser(id, nickName, movedProfileImageUrl);

    return {
      id,
      nickName,
      profileImageUrl,
    };
  }

  // 프로필 이미지 임시 업로드
  async uploadTempImage(prifix: string, file: File) {
    const fileUrl = await this.s3Helper.uploadTempImage('profile', file);
    console.log('### 프로필 이미지 임시 업로드', {fileUrl});

    return {url: fileUrl};
  }
}
