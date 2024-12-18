import {colors} from '@/assets/color';
import {Avatar, Flex, Text} from '@/client/ui/widgets';
import {Input} from '@/client/ui/widgets/Input';
import {getUserInfo} from '@/server/actions/user.actions';
import {PagePathProps} from '@/types/common';

const UserPage = async ({params}: PagePathProps<{id: string}>) => {
  const {id: _id} = await params;
  const id = Number(_id);

  const {nickName, profileImageUrl} = await getUserInfo(id);

  return (
    <Flex width={'100%'}>
      <h1>내정보</h1>
      <Flex gap={'1rem'}>
        <Flex width={'100%'}>
          <Avatar
            style={{
              width: '100%',
              height: '100%',
              aspectRatio: '4/5',
              borderRadius: '5px',
            }}
            src={profileImageUrl}
          />
        </Flex>
        <Flex padding={10}>
          <Text color={colors['dark.400']}>닉네임</Text>
          <Input value={nickName} disabled />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default UserPage;
