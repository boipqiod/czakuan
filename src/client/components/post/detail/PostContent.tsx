'use client';
type PostContentProps = {
  content: string;
};
export const PostContent = ({content}: PostContentProps) => {
  const _content = content.replace(/<img/g, '<img style="max-width: 100%"');

  return (
    <div
      style={{
        margin: '30px 0',
        maxWidth: '100%',
        width: '100%',
      }}
      dangerouslySetInnerHTML={{__html: _content}}
    />
  );
};
