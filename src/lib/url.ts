export const getSearchParam = (search: string) => {
  const searchParams = new URLSearchParams(search);
  return Object.fromEntries(searchParams);
};
