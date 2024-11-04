import Image from 'next/image';
import {CSSProperties} from 'react';
import {FaUser} from 'react-icons/fa';
import styles from './avatar.module.css';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export const Avatar = ({
  src,
  alt,
  size = 50,
  className,
  style,
}: AvatarProps) => {
  return (
    <div
      className={styles.avatar + ' ' + className}
      style={{
        ...style,
        width: size,
        height: size,
      }}>
      {src ? <Image src={src} alt={alt} /> : <FaUser />}
    </div>
  );
};
