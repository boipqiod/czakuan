import styles from '@/assets/styles/layouts/content.module.css';
import {ReactNode} from 'react';

export const Content = ({children}: Readonly<{children: ReactNode}>) => {
  return <div className={styles.content}>{children}</div>;
};
