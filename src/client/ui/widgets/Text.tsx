import {ReactNode} from 'react';

type TextProps = {
  size?: string | number;
  color?: string;
  fontWeight?: string | number;
  children?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const Text = (props: TextProps) => {
  return (
    <div
      style={{
        fontSize: props.size,
        color: props.color,
        fontWeight: props.fontWeight,
      }}
      {...props}>
      {props.children}
    </div>
  );
};
