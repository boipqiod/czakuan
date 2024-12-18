'use client';
import {CSSProperties} from 'react';

type InputProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
} & CSSProperties;
export const Input = ({
  value,
  onChange,
  placeholder,
  disabled,
  ...sytle
}: InputProps) => {
  return (
    <input
      disabled={disabled}
      placeholder={placeholder}
      type={'text'}
      value={value}
      onChange={e => onChange && onChange(e.target.value)}
      style={{
        ...sytle,
        border: '1px solid #979797',
        borderRadius: '5px',
        padding: '10px',
        fontSize: '14px',
      }}
    />
  );
};
