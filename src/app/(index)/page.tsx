'use client';

import {PostListWrapper} from '@/client/components/post/PostListWrapper';
import {getData} from '@/server/actions/PostActions';

const Home = () => {
  const test = async () => {
    const data = await getData();
    console.log(data);
  };

  return (
    <>
      <PostListWrapper />
    </>
  );
};

export default Home;
