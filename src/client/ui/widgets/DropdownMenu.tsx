'use client';
import styles from '@/assets/styles/widgets/dropdownMenu.module.css';
import React, {ReactNode, useState} from 'react';

interface DropdownMenuProps {
  children: ReactNode;
  isRight?: boolean;
}

interface DropdownMenuButtonProps {
  onClick?: () => void;
  children: ReactNode;
}

interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
}

interface DropdownMenuLinkProps {
  children: ReactNode;
  href: string;
}

export const DropdownMenu = ({children, isRight}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.dropdown}>
      {React.Children.map(children, child => {
        if (
          React.isValidElement<DropdownMenuButtonProps>(child) &&
          child.type === DropdownMenuButton
        ) {
          return React.cloneElement(child, {onClick: toggleMenu});
        }
      })}
      {isOpen && (
        <ul
          className={styles.dropdownMenu}
          style={{
            right: isRight ? 0 : 'auto',
            left: isRight ? 'auto' : 0,
          }}>
          <div onClick={toggleMenu} className={styles.dropdownOverlay} />

          {React.Children.map(children, child => {
            if (
              React.isValidElement<DropdownMenuItemProps>(child) &&
              child.type === DropdownMenuItem
            ) {
              return (
                <li className={styles.dropdownMenuItem}>
                  {React.cloneElement(child, {
                    onClick: () => {
                      if (child.props.onClick) {
                        child.props.onClick();
                      }
                      toggleMenu();
                    },
                  })}
                </li>
              );
            }

            return null;
          })}
        </ul>
      )}
    </div>
  );
};

export const DropdownMenuButton = ({
  onClick,
  children,
}: DropdownMenuButtonProps) => (
  <button onClick={onClick} className={styles.dropdownButton}>
    {children}
  </button>
);

export const DropdownMenuItem = ({
  onClick,
  children,
}: DropdownMenuItemProps) => (
  <div onClick={onClick} className={styles.dropdownMenuItemContent}>
    {children}
  </div>
);
