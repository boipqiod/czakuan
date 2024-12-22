'use client';

type BadgeProps = {
  bg?: string;
  color?: string;
  children: React.ReactNode;
};
export const Badge = ({children, bg, color}: BadgeProps) => {
  return (
    <div
      style={{
        padding: '.5em .6em',
        fontSize: '.8em',
        fontWeight: 700,
        lineHeight: 1,
        color: color || 'white',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        verticalAlign: 'baseline',
        borderRadius: '0.25rem',
        backgroundColor: bg || '#007bff',
      }}>
      {children}
    </div>
  );
};
