import {CSSProperties} from 'react';

type TextProps = CSSProperties & {
  children?: React.ReactNode;
};

export const Text = ({children, ...props}: TextProps) => {
  return <div style={{...props}}>{children}</div>;
};
