import {colors} from '@/assets/color';
import {Avatar, Flex, Text} from '@/client/ui/widgets';
import {Button, ClearButton} from '@/client/ui/widgets/Button';
import {Input} from '@/client/ui/widgets/Input';
import {getUserInfo} from '@/server/actions/user.actions';

const UserPage = async () => {
  const user = await getUserInfo();

  return (
    <Flex width={'100%'}>
      <h1>내정보</h1>
      <Flex gap={'1rem'}>
        <Flex width={'100%'}>
          <ClearButton>
            <Avatar
              style={{
                width: '100%',
                height: '100%',
                aspectRatio: '4/5',
                borderRadius: '5px',
              }}
              src={user?.profileImageUrl}
            />
          </ClearButton>
        </Flex>
        <Flex padding={10}>
          <Text color={colors['dark.400']}>닉네임</Text>
          <Input value={user?.nickName} />
        </Flex>
        <Button>저장</Button>
      </Flex>
    </Flex>
  );
};

export default UserPage;
