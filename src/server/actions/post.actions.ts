'use server';

import {PostRepository} from '@/server/repositories/post.repository';

type getPostListParams = {
  page?: number;
  limit?: number;
};

export const getPostList = async ({
  page = 1,
  limit = 10,
}: getPostListParams | undefined = {}) => {
  const repo = new PostRepository();
  const [posts, count] = await Promise.all([
    repo.getList(page ?? 1, 10),
    repo.getCount(),
  ]);
  const lastPage = Math.ceil(count / limit);

  console.log(posts);

  return {
    page,
    lastPage,
    total: count,
    list: posts,
  };
};
