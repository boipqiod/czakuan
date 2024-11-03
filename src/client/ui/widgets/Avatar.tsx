import Image from 'next/image';
import {FaUser} from 'react-icons/fa';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: number;
}

export const Avatar = ({src, alt, size = 50}: AvatarProps) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
      }}>
      {src ? (
        <Image src={src} alt={alt} width={size} height={size} />
      ) : (
        <FaUser size={size} />
      )}
    </div>
  );
};
