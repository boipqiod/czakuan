'use client';
import {CSSProperties} from 'react';

type InputProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  defaultValue?: string | number;
} & CSSProperties;
export const Input = ({
  value,
  onChange,
  placeholder,
  disabled,
  autoFocus,
  defaultValue,
  ...sytle
}: InputProps) => {
  return (
    <input
      autoFocus={autoFocus}
      disabled={disabled}
      placeholder={placeholder}
      type={'text'}
      value={value}
      defaultValue={defaultValue}
      onChange={e => onChange && onChange(e.target.value)}
      style={{
        border: '1px solid #979797',
        borderRadius: '4px',
        padding: '0.5rem',
        fontSize: '14px',
        ...sytle,
      }}
    />
  );
};
