'use client';

import {PostListWraper} from '@/client/components/post/PostListWraper';
import {getData} from '@/server/actions/PostActions';

const Home = () => {
  const test = async () => {
    const data = await getData();
    console.log(data);
  };

  return (
    <>
      <PostListWraper />
    </>
  );
};

export default Home;
