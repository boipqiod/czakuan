'use client';
import {colors} from '@/assets/color';
import {useAuthStore} from '@/client/store/AuthStore';
import {Avatar, Flex, Text} from '@/client/ui/widgets';
import {Button, ClearButton} from '@/client/ui/widgets/Button';
import {Input} from '@/client/ui/widgets/Input';
import {actionWrapper} from '@/lib/actions';
import {convertToJpeg, imageSelector} from '@/lib/image';
import {changeUserInfo} from '@/server/actions/user.actions';
import {useEffect, useRef, useState} from 'react';

const UserPage = () => {
  const {user, setUserInfo} = useAuthStore();
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(
    user?.profileImageUrl ?? undefined,
  );
  const [nickName, setNickName] = useState<string | undefined>(user?.nickName);
  const imageFileRef = useRef<File>();

  const handleImageChange = async () => {
    const imageFile = await imageSelector();
    if (!imageFile) {
      return;
    }
    const convertImage = await convertToJpeg(imageFile);

    imageFileRef.current = convertImage;
    const imageUrl = URL.createObjectURL(convertImage);
    setProfileImageUrl(imageUrl);
  };

  const handleChangeNickName = (value: string) => {
    setNickName(value);
  };

  const handleSave = async () => {
    // save
    try {
      const user = await actionWrapper(
        changeUserInfo({
          nickName,
          profileImage: imageFileRef.current,
        }),
      );
      setUserInfo(user);
      alert('저장되었습니다.');
      window.location.reload();
    } catch (error) {
      console.error('### 사용자 정보 변경 실패', error);
      alert('사용자 정보 변경에 실패했습니다.');
    }
  };

  useEffect(() => {
    setProfileImageUrl(user?.profileImageUrl ?? undefined);
    setNickName(user?.nickName);
  }, [user]);

  return (
    <Flex width={'100%'}>
      <h1>내정보</h1>
      <Flex gap={'1rem'}>
        <Flex width={'100%'}>
          <ClearButton onClick={handleImageChange}>
            <Avatar
              style={{
                width: '100%',
                height: '100%',
                aspectRatio: '4/5',
                borderRadius: '5px',
              }}
              src={profileImageUrl}
            />
          </ClearButton>
        </Flex>
        <Flex padding={10}>
          <Text color={colors['dark.400']}>닉네임</Text>
          <Input value={nickName} onChange={handleChangeNickName} />
        </Flex>
        <Button onClick={handleSave}>저장</Button>
      </Flex>
    </Flex>
  );
};

export default UserPage;
