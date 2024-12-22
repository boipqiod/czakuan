import s3 from '@/server/modules/s3';
import {UserRepository} from '@/server/repositories/user.repository';
import {TokenService} from '@/server/service/token.service';
import {User} from '@/types/user';
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
        {statusText: '사용자 정보가 존재하지 않습니다.'},
        {status: 404},
      );
    }

    const {accessToken, refreshToken} =
      this.tokenService.createTokenByUser(user);

    return {
      id: user.id,
      role: user.role,
      nickName: user.nickName,
      profileImageUrl: user.profileImageUrl,
    };
  }

  async getUserByKakaoId(kakaoId: number) {
    const user = await this.userRepository.getUserByKakaoId(kakaoId);
    console.log('### 카카오 사용자 조회 요청', {kakaoId, user});

    if (!user) {
      throw NextResponse.json(
        {statusText: '사용자 정보가 존재하지 않습니다.'},
        {status: 404},
      );
    }

    const {accessToken, refreshToken} =
      this.tokenService.createTokenByUser(user);

    return {
      id: user.id,
      role: user.role,
      nickName: user.nickName,
      profileImageUrl: user.profileImageUrl,
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
      throw NextResponse.json(
        {statusText: '이미 존재하는 닉네임입니다.'},
        {status: 400},
      );
    }

    const user = await this.userRepository.getUserByKakaoId(id);

    if (user) {
      throw NextResponse.json(
        {statusText: '이미 가입된 사용자입니다.'},
        {status: 409},
      );
    }

    try {
      const createdUser = await this.userRepository.createUser(id, nickName);

      const {accessToken, refreshToken} =
        this.tokenService.createTokenByUser(createdUser);

      return {
        id: createdUser.id,
        role: createdUser.role,
        profileImageUrl: createdUser.profileImageUrl,
        nickName: createdUser.nickName,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('### 사용자 생성 실패', error);
      throw new Error('사용자 생성에 실패했습니다.');
    }
  }

  async updateUser(
    id: number,
    nickName?: string,
    profileImageUrl?: string,
  ): Promise<User> {
    console.log('### 사용자 정보 수정 요청', {id, nickName, profileImageUrl});

    const movedProfileImageUrl = profileImageUrl
      ? await s3.moveObject(profileImageUrl, `profile/${id}`, 'profile')
      : undefined;

    console.log('### 사용자 정보 수정 요청', {
      id,
      nickName,
      movedProfileImageUrl,
    });

    const {
      id: updatedId,
      nickName: updatedNickName,
      role: updatedRole,
      profileImageUrl: updatedProfileImageUrl,
    } = await this.userRepository.updateUser(
      id,
      nickName,
      movedProfileImageUrl,
    );

    return {
      id: updatedId,
      role: updatedRole,
      nickName: updatedNickName,
      profileImageUrl: updatedProfileImageUrl,
    };
  }

  async uploadTempImage(file: File) {
    const fileUrl = await s3.uploadTempImage('profile', file);
    console.log('### 프로필 이미지 임시 업로드', {fileUrl});

    return {url: fileUrl};
  }
}

export default UserService;
