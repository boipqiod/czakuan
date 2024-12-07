import {CSSProperties, ReactNode} from 'react';

type ButtonProps = CSSProperties & {
  children?: ReactNode;
  onClick?: () => void;
};
export const Button = ({onClick, children, ...props}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 10px',
        borderRadius: 4,
        backgroundColor: '#444',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        ...props,
      }}>
      {children}
    </button>
  );
};
export const ClearButton = (props: ButtonProps) => {
  return <Button backgroundColor={'transparent'} {...props} />;
};

type ImageButtonProps = {
  src?: string;
  alt?: string;
} & ButtonProps;
export const ImageButton = ({src, alt, ...props}: ImageButtonProps) => {
  return (
    <ClearButton {...props}>
      <img width={'100%'} src={src} alt={alt ?? 'imageButton'} />
    </ClearButton>
  );
};
