'use client';
import {colors} from '@/assets/color';
import {checkViewPost} from '@/client/hooks/usePost';
import {Flex, HFlex, Text} from '@/client/ui/widgets';
import {Avatar} from '@/client/ui/widgets/Avatar';
import {formatRelativeTime} from '@/lib/dayjs';
import Link from 'next/link';
import {AiFillNotification, AiOutlineLike} from 'react-icons/ai';
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
  isNowPost?: boolean;
};

export const PostItem = ({
  id,
  isNotice,
  title,
  thumbnailUrl,
  views,
  createdAt,
  _count,
  author,
  isNowPost,
}: PostItemProps) => {
  const isViewed = checkViewPost(id);
  const {nickName} = author;
  const {comments, likes} = _count;
  const query = new URLSearchParams(window.location.search).toString();

  return (
    <Link
      href={`/post/${id}?${query}`}
      style={{
        color: isViewed ? 'var(--font-read-color)' : 'var(--font-color)',
        textDecoration: 'none',
      }}>
      <HFlex
        backgroundColor={isNowPost ? 'rgba(0, 0, 0, 0.5)' : undefined}
        alignItems={'center'}
        gap={'1rem'}
        padding={'.5rem'}
        borderBottom={`1px solid #d0d0d030`}>
        {!isNotice && (
          <Avatar
            style={{
              borderRadius: 4,
            }}
            size={40}
            src={thumbnailUrl}
          />
        )}
        {isNotice && (
          <Flex
            width={40}
            height={40}
            justifyContent={'center'}
            alignItems={'center'}
            backgroundColor={'white'}
            borderRadius={'50%'}>
            <AiFillNotification size={20} color={colors.primary} />
          </Flex>
        )}
        <Flex gap={'.2rem'}>
          <HFlex gap={8}>
            {/* {isNotice && <AiFillNotification color={colors.primary} />} */}
            <Text
              fontWeight={isNotice ? 'bold' : 'normal'}
              textOverflow={'hidden'}
              maxLines={1}>
              {title}
            </Text>
            <Text color={colors.primary}>{comments}</Text>
          </HFlex>
          <HFlex fontSize={'.8rem'}>
            {nickName}
            <LuDot />
            <span>{formatRelativeTime(createdAt)}</span>
            <LuDot />
            <HFlex gap={2}>
              <FiEye />
              {views}
            </HFlex>
            <LuDot />
            <HFlex gap={2}>
              <AiOutlineLike />
              {likes}
            </HFlex>
          </HFlex>
        </Flex>
      </HFlex>
    </Link>
  );
};
