import {colors} from '@/assets/color';

const Loading = ({isShow = true}: {isShow: boolean}) => {
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // 화면 위로 띄우기
  };

  const spinnerStyle: React.CSSProperties = {
    width: '25px',
    height: '25px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid ' + colors.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  if (!isShow) {
    return null;
  }

  return (
    <div style={overlayStyle}>
      <div style={spinnerStyle}></div>
    </div>
  );
};

export default Loading;
