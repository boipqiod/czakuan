import {CSSProperties} from 'react';
import {FaUser} from 'react-icons/fa';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export const Avatar = ({src, alt, size = 50, style}: AvatarProps) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: '50%',
        backgroundColor: 'lightgray',
        ...style,
      }}>
      {src ? (
        <img
          src={src}
          alt={alt ?? 'avatar'}
          style={{
            width: '100%',
            height: '100%',
            // objectFit: 'cover',
          }}
        />
      ) : (
        <FaUser color={'black'} />
      )}
    </div>
  );
};
