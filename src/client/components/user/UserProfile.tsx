'use client';
import {Avatar} from '@/client/ui/widgets';
import {ClearButton} from '@/client/ui/widgets/Button';
import {imageSelector} from '@/lib/image';
import {User} from '@/types/user';
import {useState} from 'react';

type UserProfileProps = {
  user?: User;
};
export const UserProfile = ({user}: UserProfileProps) => {
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(
    user?.profileImageUrl ?? undefined,
  );

  const handleImageChange = async () => {
    const imageFile = await imageSelector();
    if (!imageFile) {
      return;
    }

    const imageUrl = URL.createObjectURL(imageFile);
    setProfileImageUrl(imageUrl);
  };

  return (
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
  );
};
