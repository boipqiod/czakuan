'use client';
import {colors} from '@/assets/color';
import {useAuthStore} from '@/client/store/AuthStore';
import {Avatar, Flex, Text} from '@/client/ui/widgets';
import {Button, ClearButton} from '@/client/ui/widgets/Button';
import {Input} from '@/client/ui/widgets/Input';
import {imageSelector} from '@/lib/image';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

const UserPage = () => {
  const router = useRouter();
  const {user} = useAuthStore();
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(
    user?.profileImageUrl ?? undefined,
  );
  const [nickName, setNickName] = useState<string | undefined>(user?.nickName);

  const handleImageChange = async () => {
    const imageFile = await imageSelector();
    if (!imageFile) {
      return;
    }

    const imageUrl = URL.createObjectURL(imageFile);
    setProfileImageUrl(imageUrl);
  };

  const handleChangeNickName = (value: string) => {
    setNickName(value);
  };

  const handleSave = () => {
    // save
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
        <Button>저장</Button>
      </Flex>
    </Flex>
  );
};

export default UserPage;
