'use client';
import styles from '@/assets/styles/components/post/post.module.css';
import {Avatar} from '@/client/ui/widgets/Avatar';
import {Flex, HFlex} from '@/client/ui/widgets/Flex';
import {Text} from '@/client/ui/widgets/Text';
import dayjs from 'dayjs';
import Link from 'next/link';
import {AiOutlineLike} from 'react-icons/ai';
import {FiEye} from 'react-icons/fi';
import {LuDot} from 'react-icons/lu';

export const PostListWrapper = () => {
  return (
    <div className={styles.postListWrapper}>
      <section className={styles.title}>
        <h2>게시판 제목123</h2>
      </section>
      <div>
        <PostItem />
        <PostItem />
        <PostItem />
        <PostItem />
        <PostItem />
        <PostItem />
        <PostItem />
        <PostItem />
        <PostItem />
        <PostItem />
      </div>
    </div>
  );
};

const PostItem = () => (
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
        />
        <Flex gap={'.5rem'}>
          <HFlex>
            <Text>{'제목'}</Text>
            <Text color={'#'}>{0}</Text>
          </HFlex>
          <HFlex>
            {'작성자 이름'}
            <LuDot />
            <span>{dayjs(new Date()).toString()}</span>
            <LuDot />
            <div>
              <FiEye />
              10
            </div>
            <LuDot />
            <div>
              <AiOutlineLike />
              {0}
            </div>
          </HFlex>
        </Flex>
      </HFlex>
    </Flex>
  </Link>
);
