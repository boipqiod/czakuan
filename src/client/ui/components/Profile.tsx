'use client';
import {colors} from '@/assets/color';
import {
  Avatar,
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  Flex,
  HFlex,
} from '@/client/ui/widgets';
import {Author} from '@/types/user';
import {Role} from '@prisma/client';
import {useRouter} from 'next/navigation';
import {LiaCertificateSolid} from 'react-icons/lia';

type ProfileProps = {
  author: Author;
};

export const Profile = ({author}: ProfileProps) => {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuButton>
        <HFlex alignItems={'center'} gap={5}>
          <Avatar src={author.profileImageUrl} size={25} />
          <Flex color={'var(--font-color)'} fontWeight={'1rem'}>
            {author.nickName}
          </Flex>
          <MarkOfRole role={author.role} />
        </HFlex>
      </DropdownMenuButton>
      <DropdownMenuItem
        onClick={() => {
          router.push(`/user/${author.id}`);
        }}>
        프로필
      </DropdownMenuItem>
    </DropdownMenu>
  );
};

export const MarkOfRole = ({role}: {role: Role}) => {
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
