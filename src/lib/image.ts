export function convertToJpeg(file: File, width: number = 600): Promise<File> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = event => {
      const imgElement = document.createElement('img');
      imgElement.src = event.target?.result as string;
      imgElement.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // 원본 비율에 맞게 높이 계산
        const scaleFactor = width / imgElement.width;
        canvas.width = width; // 너비를 500px로 고정
        canvas.height = imgElement.height * scaleFactor; // 비율에 맞는 높이 계산

        ctx?.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

        // JPEG로 변환하고 품질 조절
        canvas.toBlob(
          blob => {
            if (!blob) {
              resolve(file);
              return;
            }
            const newFile = new File([blob], 'converted.jpeg', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          'image/jpeg',
          1.0,
        ); // JPEG 품질을 75%로 설정
      };
    };
    reader.readAsDataURL(file);
  });
}

export const imageSelector = (): Promise<File | undefined> => {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  return new Promise(resolve => {
    input.onchange = () => {
      resolve(input.files ? input.files[0] : undefined);
    };
  });
};
