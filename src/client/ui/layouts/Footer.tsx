import Link from 'next/link';
import {LuDot} from 'react-icons/lu';
import styles from './footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div>
        <Link style={{color: '#979797'}} href={'/terms-of-service'}>
          이용약관
        </Link>
        <LuDot />
        <Link style={{color: '#979797'}} href={'/privacy-policy'}>
          개인정보 처리방침
        </Link>
      </div>
      <div>Copyright©시작관 All rights reserved.</div>
    </footer>
  );
};
