import {ReactNode} from 'react';
import styles from './content.module.css';

export const Content = ({children}: Readonly<{children: ReactNode}>) => {
  return <div className={styles.content}>{children}</div>;
};
