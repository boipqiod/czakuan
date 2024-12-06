export type PageProps<T = any, U = any> = {
  searchParams: Promise<T>;
  params: Promise<U>;
};

export type PageQeuryProps<T = any> = {
  searchParams: Promise<T>;
};

export type PagePathProps<T = any> = {
  params: Promise<T>;
};
