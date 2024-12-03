import {CSSProperties, ReactNode} from 'react';

type FlexProps = {
  direction?: 'row' | 'column';
  children?: ReactNode;
} & CSSProperties;

export const Flex = ({children, ...props}: FlexProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: props.direction ?? 'column',
        ...props,
      }}>
      {children}
    </div>
  );
};

export const HFlex = (props: FlexProps) => {
  return <Flex {...props} flexDirection={'row'} />;
};
