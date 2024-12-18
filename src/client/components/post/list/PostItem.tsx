'use client';
import {colors} from '@/assets/color';
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
  const query = new URLSearchParams(window.location.search).toString();

  return (
    <Link
      href={`/post/${id}?${query}`}
      style={{
        color: 'white',
        textDecoration: 'none',
      }}>
      <HFlex
        alignItems={'center'}
        gap={'1rem'}
        paddingBottom={'.8rem'}
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
