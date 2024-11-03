import Image from 'next/image';
import {BsList} from 'react-icons/bs';
import logo from '../../../assets/image/logo.png';
import styles from './header.module.css';
import {Avatar} from '@/client/ui/widgets/Avatar';

export const Header = () => {
  return (
    <header className={styles.header}>
      <button className={styles['menu-button']}>
        <BsList fontSize={30} color={'white'} />
      </button>
      <Image height={50} src={logo} alt={'logo'} />
      <Avatar alt={'avatar'} size={30} />
    </header>
  );
};
