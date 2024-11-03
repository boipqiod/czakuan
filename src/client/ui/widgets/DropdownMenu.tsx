import React, {useState} from 'react';
import {FaChevronDown} from 'react-icons/fa';
import styles from './dropdownMenu.module.css';

interface DropdownMenuProps {
  label: string;
  items: string[];
}
export const DropdownMenu = ({label, items}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.dropdown}>
      <button onClick={toggleMenu} className={styles.dropdownButton}>
        {label} <FaChevronDown />
      </button>
      {isOpen && (
        <ul className={styles.dropdownMenu}>
          {items.map((item, index) => (
            <li key={index} className={styles.dropdownMenuItem}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
