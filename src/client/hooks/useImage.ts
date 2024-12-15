import {useState} from 'react';

export const useSeleteImage = () => {
  const [image, setImage] = useState<File>();

  const selectImage = (file: File) => {
    setImage(file);
  };
};
