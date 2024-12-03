import {CSSProperties} from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  CSSProperties;
export const Button = ({children, ...props}: ButtonProps) => {
  return (
    <button
      {...props}
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
export const ClearButton = ({children, ...props}: ButtonProps) => {
  return (
    <Button
      {...props}
      style={{
        backgroundColor: '#00011',
        color: '#444',
        ...props,
      }}>
      {children}
    </Button>
  );
};
