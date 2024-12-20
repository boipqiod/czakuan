'use client';
import {CSSProperties} from 'react';

type InputProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
} & CSSProperties;
export const Input = ({
  value,
  onChange,
  placeholder,
  disabled,
  autoFocus,
  ...sytle
}: InputProps) => {
  return (
    <input
      autoFocus={autoFocus}
      disabled={disabled}
      placeholder={placeholder}
      type={'text'}
      value={value}
      onChange={e => onChange && onChange(e.target.value)}
      style={{
        border: '1px solid #979797',
        borderRadius: '5px',
        padding: '4px',
        fontSize: '14px',
        ...sytle,
      }}
    />
  );
};
