export const extractImageSrc = (html: string): string[] => {
  const imgTagRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/g;
  const srcList: string[] = [];
  let match;

  while ((match = imgTagRegex.exec(html)) !== null) {
    srcList.push(match[1]);
  }

  return srcList;
};
