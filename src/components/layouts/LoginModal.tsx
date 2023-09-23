import React, { useContext } from 'react';
import { Button, Form, Formik, ConnectWallet, Modal } from '@components';
import { UserContext } from '@/context/UserContext';

type LoginModalProps = {
  setIsLoginModalOpen: (isOpen: boolean | Function) => void;
};

const LoginForm = ({ onWeb2SignIn, onCloseForm }) => {
  return (
    <div className="mt-4 flex flex-col space-y-2">
      <p className="text-secondary-lightGrey-300">You can login & create and account using an email or wallet</p>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values, actions) => {
          console.log('setup non custodial wallet');
          onCloseForm();
        }}
        enableReinitialize
      >
        <Form className="flex w-full max-w-2xl flex-col items-center justify-center space-y-2 sm:space-y-4 md:w-[350px]">
          <input
            className="mt-2 h-[56px] rounded-[4px] border-[1px] border-secondary-lightGrey-300 bg-primary-dark px-4 text-lg text-primary placeholder:opacity-80"
            id="email"
            name="email"
            placeholder="Your email address"
          />
          <Button>Log In</Button>
        </Form>
      </Formik>
      <div className="flex w-full max-w-2xl flex-row items-center space-x-8 py-2 font-header uppercase md:w-[350px]">
        <div className="h-[1px] w-full bg-primary-dark" />
        <span>OR</span>
        <div className="h-[1px] w-full bg-primary-dark" />
      </div>
      <ConnectWallet displayAddress={false} onClick={onCloseForm} />
    </div>
  );
};

const LoginModal: React.FC<LoginModalProps> = ({ setIsLoginModalOpen }) => {
  const [, , , onWeb2SignIn] = useContext(UserContext);
  return (
    <Modal onClose={() => setIsLoginModalOpen((isOpen) => !isOpen)}>
      <div className="relative left-1/2 top-[122px] mb-[182px] max-w-[400px] -translate-x-1/2 rounded-[28px] bg-primary-dark p-[24px] lg:top-1/2  lg:-translate-y-1/2">
        <h1 className="font-header text-[32px] leading-[32px]">Join & Login</h1>
        <LoginForm
          onWeb2SignIn={onWeb2SignIn}
          onCloseForm={() => {
            setIsLoginModalOpen(false);
          }}
        />
        <div className="!mt-[24px] flex justify-end px-6 py-3 text-[18px] font-semibold leading-[24px] text-accent">
          <button
            onClick={() => {
              setIsLoginModalOpen(false);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
