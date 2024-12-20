import {MarkOfRole} from '@/client/ui/components/Profile';
import {Avatar, Flex} from '@/client/ui/widgets';
import {getUserInfo} from '@/server/actions/user.actions';
import {PagePathProps} from '@/types/common';

const UserPage = async ({params}: PagePathProps<{id: string}>) => {
  const {id: _id} = await params;
  const id = Number(_id);

  const {nickName, profileImageUrl, role} = await getUserInfo(id);

  return (
    <Flex width={'100%'}>
      <h1>
        {nickName} <MarkOfRole role={role} />
      </h1>
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
      </Flex>
    </Flex>
  );
};

export default UserPage;
