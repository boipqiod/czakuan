'use client';
import {CSSProperties} from 'react';

const styles: {[key: string]: CSSProperties} = {
  postListWraper: {
    width: '100%',
    height: '100%',
    backgroundColor: '#123',
  },
  postTitleSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
};

export const PostListWraper = () => {
  return (
    <div style={styles.postListWraper}>
      <section style={styles.postTitleSection}>
        <h2>게시판 제목</h2>
      </section>
      <div></div>
    </div>
  );
};
