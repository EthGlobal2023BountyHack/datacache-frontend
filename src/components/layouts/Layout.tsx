import React, { forwardRef, useState } from 'react';
import { Navbar, Footer } from '@components';
import { useAutoConnect } from '@hooks';
import LoginModal from './LoginModal';

const Layout = ({ children, isHeaderTransparent = false }, ref) => {
  useAutoConnect();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div
      ref={ref}
      className="min-w-screen relative flex min-h-screen flex-col font-paragraph text-primary-light bg-black"
    >
      {isLoginModalOpen && <LoginModal setIsLoginModalOpen={setIsLoginModalOpen} />}
      <header className="sticky top-0 z-[99] flex h-0 w-full flex-row items-center pb-navbarHeight">
        <Navbar openLoginModal={() => setIsLoginModalOpen(true)} isHeaderTransparent={isHeaderTransparent} />
      </header>
      <div className="flex h-full w-full grow flex-col pt-24">{children}</div>
      <Footer />
    </div>
  );
};

export default forwardRef(Layout);
