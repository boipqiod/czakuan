'use client';
import {Flex, HFlex, Text} from '@/client/ui/widgets';
import {Avatar} from '@/client/ui/widgets/Avatar';
import dayjs from 'dayjs';
import Link from 'next/link';
import {AiOutlineLike} from 'react-icons/ai';
import {FiEye} from 'react-icons/fi';
import {LuDot} from 'react-icons/lu';

export type PostItemProps = {
  id: number;
  categoryId: number;
  subCategoryId: number | null;
  isNotice: boolean;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  views: number;
  reports: any[];
  updatedAt: Date | null;
  createdAt: Date;
  _count: {comments: number; dislikes: number; likes: number};
  author: {
    id: number;
    nickName: string;
    profileImageUrl: string | null;
    role: string;
  };
};

export const PostItem = ({
  id,
  categoryId,
  subCategoryId,
  isNotice,
  title,
  content,
  thumbnailUrl,
  views,
  reports,
  updatedAt,
  createdAt,
  _count,
  author,
}: PostItemProps) => {
  const {nickName, profileImageUrl} = author;
  const {comments, likes} = _count;

  return (
    <Link
      href={`/`}
      style={{
        color: 'white',
        textDecoration: 'none',
      }}>
      <Flex justifyContent={'center'}>
        <HFlex gap={'1rem'}>
          <Avatar
            style={{
              borderRadius: '8px',
            }}
            size={30}
            src={thumbnailUrl}
          />
          <Flex gap={'.5rem'}>
            <HFlex>
              <Text>{title}</Text>
              <Text color={'#'}>{comments}</Text>
            </HFlex>
            <HFlex>
              {nickName}
              <LuDot />
              <span>{dayjs(createdAt).toString()}</span>
              <LuDot />
              <div>
                <FiEye />
                {views}
              </div>
              <LuDot />
              <div>
                <AiOutlineLike />
                {likes}
              </div>
            </HFlex>
          </Flex>
        </HFlex>
      </Flex>
    </Link>
  );
};
