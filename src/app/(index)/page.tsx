'use client';

import {getData} from '@/server/actions/PostActions';

const Home = () => {
  const test = async () => {
    const data = await getData();
    console.log(data);
  };

  return <div onClick={test}>1234</div>;
};

export default Home;
