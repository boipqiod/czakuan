'use client';

import {Profile} from '@/client/ui/components/Profile';
import {HFlex} from '@/client/ui/widgets';
import {formatRelativeTime} from '@/lib/dayjs';
import {PostDetailType} from '@/types/post';
import {FiEye} from 'react-icons/fi';
import {LuDot} from 'react-icons/lu';

type PostAuthorProps = {
  post: PostDetailType;
};
export const PostAuthor = ({post}: PostAuthorProps) => {
  const {author, createdAt, views} = post;

  return (
    <HFlex alignItems={'center'}>
      <Profile author={author} />
      <LuDot />
      {formatRelativeTime(createdAt)}
      <LuDot />
      <HFlex gap={3}>
        <FiEye />
        {views}
      </HFlex>
    </HFlex>
  );
};
