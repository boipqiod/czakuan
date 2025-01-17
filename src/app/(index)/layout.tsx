import {AddPost} from '@/client/components/post/AddPost';
import {Flex} from '@/client/ui/widgets';
import {ReactNode} from 'react';

const PostLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <Flex width={'100%'}>
      {children}
      <AddPost />
    </Flex>
  );
};

export default PostLayout;
