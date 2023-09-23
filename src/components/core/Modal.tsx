import { FC, PropsWithChildren, useCallback, useEffect } from 'react';

interface ModalProps {
  onClose: () => void;
}

const Modal: FC<PropsWithChildren<ModalProps>> = ({ onClose, children }) => {
  const handleEscapeButtonPress = useCallback(({ key }) => {
    if (key === 'Escape') {
      onClose();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeButtonPress);

    document.body.style.overflowY = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscapeButtonPress);

      document.body.style.overflowY = 'auto';
    };
  }, []);

  return (
    <div
      className="fixed left-0 top-0 z-[100] h-screen w-screen overflow-y-auto bg-[#000000CC] px-[22px]"
      onClick={({ target, currentTarget }) => {
        if (target === currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
};

export default Modal;
