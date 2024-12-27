'use server';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@/server/Error';
import s3 from '@/server/modules/s3';
import {UserRepository} from '@/server/repositories/user.repository';
import {User} from '@/types/user';

class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUser(id: number) {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw NotFoundError('사용자 정보가 존재하지 않습니다.');
    }
    return {
      id: user.id,
      role: user.role,
      nickName: user.nickName,
      profileImageUrl: user.profileImageUrl,
    };
  }

  async getUserByKakaoId(kakaoId: number) {
    const user = await this.userRepository.getUserByKakaoId(kakaoId);

    if (!user) {
      throw NotFoundError('사용자 정보가 존재하지 않습니다.');
    }

    return {
      id: user.id,
      role: user.role,
      nickName: user.nickName,
      profileImageUrl: user.profileImageUrl,
    };
  }

  async createUser({
    id,
    nickName,
    email,
  }: {
    id: number;
    nickName: string;
    profileImageUrl?: string;
    email?: string;
  }) {
    const isNickNameExist =
      await this.userRepository.getUserByNickName(nickName);

    if (isNickNameExist) throw BadRequestError('이미 사용중인 닉네임입니다.');

    const user = await this.userRepository.getUserByKakaoId(id);

    if (user) throw BadRequestError('이미 가입된 사용자입니다.');

    try {
      const createdUser = await this.userRepository.createUser(
        id,
        nickName,
        email,
      );

      return {
        id: createdUser.id,
        role: createdUser.role,
        profileImageUrl: createdUser.profileImageUrl,
        nickName: createdUser.nickName,
      };
    } catch (error) {
      console.error('### 사용자 생성 실패', error);
      throw InternalServerError('사용자 생성에 실패했습니다.');
    }
  }

  async updateUser(
    id: number,
    nickName?: string,
    profileImageUrl?: string,
  ): Promise<User> {
    const movedProfileImageUrl = profileImageUrl
      ? await s3.moveObject(profileImageUrl, `profile/${id}`, 'profile')
      : undefined;

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

    return {url: fileUrl};
  }
}

export default UserService;
