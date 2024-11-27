import {colors} from '@/assets/color';
import {Avatar, HFlex} from '@/client/ui/widgets';
import {Author} from '@/types/user';
import {Role} from '@prisma/client';
import {LiaCertificateSolid} from 'react-icons/lia';

type ProfileProps = {
  author: Author;
};

export const Profile = ({author}: ProfileProps) => {
  return (
    <HFlex alignItem={'center'} gap={5}>
      <Avatar src={author.profileImageUrl} size={25} />
      <div>{author.nickName}</div>
      <MarkOfRole role={author.role} />
    </HFlex>
  );
};

const MarkOfRole = ({role}: {role: Role}) => {
  const sx = {width: 15, height: 15, color: colors.primary};

  switch (role) {
    case 'SUPER_ADMIN':
      return <LiaCertificateSolid color={colors.primary} size={'1.3rem'} />;
    case 'BOARD_ADMIN':
      return <LiaCertificateSolid color={colors['blue.500']} size={'1.3rem'} />;
    case 'USER':
      return null;
  }
};
