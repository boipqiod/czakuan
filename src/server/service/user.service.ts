import kakao from '@/server/modules/kakao';
import s3 from '@/server/modules/s3';
import {UserRepository} from '@/server/repositories/user.repository';
import {TokenService} from '@/server/service/token.service';
import {NextResponse} from 'next/server';

class UserService {
  private tokenService: TokenService;
  private userRepository: UserRepository;

  constructor() {
    this.tokenService = new TokenService();
    this.userRepository = new UserRepository();
  }

  async getUser(id: number) {
    console.log('### 사용자 조회 요청', {id});

    const user = await this.userRepository.getUserById(id);
    console.log('### 사용자 조회 요청', {id, user});

    if (!user) {
      throw NextResponse.json(
        {message: '사용자 정보가 존재하지 않습니다.'},
        {status: 404},
      );
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

  async getUserByKakaoId(kakaoId: number) {
    const user = await this.userRepository.getUserByKakaoId(kakaoId);

    if (!user) {
      throw NextResponse.json(
        {message: '사용자 정보가 존재하지 않습니다.'},
        {status: 404},
      );
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

  async loginCallback(code: string) {
    const {access_token} = await kakao.getToken(code);
    const {id} = await kakao.getUserData(access_token);
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
    id,
    nickName,
  }: {
    id: number;
    nickName: string;
    profileImageUrl?: string;
  }) {
    const isNickNameExist =
      await this.userRepository.getUserByNickName(nickName);

    if (isNickNameExist) {
      throw new Error('닉네임이 이미 존재합니다.');
    }

    const user = await this.userRepository.getUserByKakaoId(id);

    if (user) {
      throw new Error('이미 존재하는 유저입니다. 로그인 해주세요.');
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
      ? await s3.moveObject(profileImageUrl, `profile/${id}`, 'profile')
      : undefined;

    await this.userRepository.updateUser(id, nickName, movedProfileImageUrl);

    return {
      id,
      nickName,
      profileImageUrl,
    };
  }

  async uploadTempImage(prifix: string, file: File) {
    const fileUrl = await s3.uploadTempImage('profile', file);
    console.log('### 프로필 이미지 임시 업로드', {fileUrl});

    return {url: fileUrl};
  }
}

export default UserService;
