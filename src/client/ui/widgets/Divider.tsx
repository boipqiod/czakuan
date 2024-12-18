import {CSSProperties} from 'react';

type DividerProps = {
  marginX?: number;
  marginY?: number;
} & CSSProperties;

export const Divider = ({marginX = 0, marginY = 0, ...props}: DividerProps) => {
  return (
    <hr
      style={{
        border: 'none',
        backgroundColor: '#e9ecef30',
        height: 1,
        width: '100%',
        margin: `${marginY}px ${marginX}px`,
        ...props,
      }}
    />
  );
};
