import {CSSProperties, ReactNode} from 'react';

type FlexProps = {
  direction?: 'row' | 'column';
  gap?: number | string;
  width?: string | number;
  height?: string | number;
  alignItem?: 'center' | 'flex-start' | 'flex-end';
  justifyContent?: 'center' | 'flex-start' | 'flex-end';
  children?: ReactNode;
} & CSSProperties;

export const Flex = (props: FlexProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: props.direction ?? 'column',
        gap: props.gap,
        width: props.width,
        height: props.height,
        alignItems: props.alignItem,
        justifyContent: props.justifyContent,
        ...props,
      }}>
      {props.children}
    </div>
  );
};

export const HFlex = (props: FlexProps) => {
  return <Flex {...props} flexDirection={'row'} />;
};
