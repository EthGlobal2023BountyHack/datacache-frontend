import React, { useContext, useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { useDisconnect } from 'wagmi';
import { useScroll, Image, Button } from '@components';
import { ErrorBoundary } from 'react-error-boundary';
import { UserContext } from '@/context/UserContext';
import { MdNotifications as BellIcon, MdMenu as HamburgerMenu } from 'react-icons/md';
import Dropdown from './Dropdown';
import { useRouter } from 'next/router'

function fallbackRender({ error }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  );
}

type NavbarProps = {
  isHeaderTransparent?: boolean;
  openLoginModal: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ isHeaderTransparent = false, openLoginModal }) => {
  const [{ user }, setUser] = useContext(UserContext);
  const [isHidden, setIsHidden] = useState(isHeaderTransparent);
  const { disconnect } = useDisconnect();
  const { scrollY } = useScroll();
  const [isNewNotification, setIsNewNotification] = useState(true);
  const router = useRouter()

  useEffect(() => {
    if (!isHeaderTransparent) return;
    scrollY.on('change', (latest) => {
      if (latest < 1) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
    });
  }, []);

  const bgHidden = useMemo(() => isHidden, [isHidden]);

  const handleLogOut = () => {
    disconnect();
    setUser({});
  };

  return (
    <ErrorBoundary fallbackRender={fallbackRender}>
      <div
        className={classnames(
          'absolute top-0 flex h-[88px] w-full flex-row items-center justify-between bg-[#131313] px-6 lg:px-10 transition-all duration-200 text-white',
          bgHidden ? 'bg-opacity-0' : 'shadow-xl',
        )}
      >
        {/* Left Section */}
        <div className="flex shrink-0 w-1/2 sm:w-1/4">
          <h1 className="uppercase text-lg font-black">DataCache</h1>
        </div>
        {/* Center Section */}
        <div className="hidden lg:flex justify-center flex-grow w-1/2 gap-5 h-[100%]">
          <button
            className={classnames(
              { 'border-b-[1px] pt-[1px]': router.pathname === '/' }
            )}
            onClick={() => { router.push('/') }}
          >
            Bounties
          </button>
          <button
            className={classnames(
              { 'border-b-[1px] pt-[1px]': router.pathname === '/dashboard' }
            )}
            onClick={() => { router.push('/dashboard') }}
          >
            Dashboard
          </button>
        </div>

        {/* Right Section */}
        <div className="flex justify-end w-1/2 lg:w-1/4 items-center">
          {user?.id ? (
            <div className="flex flex-row items-center relative">
              {/* <div className="block lg:hidden xl:block absolute top-[5.5px] sm:top-[12.5px] xl:top-[13.5px] -right-[40.5px] xl:left-[21.5px] rounded-full w-2 h-2 bg-hot-pink"></div>
              <BellIcon width={32} height={32} className="hidden xl:block mr-[36px]" /> */}
              <Dropdown
                className="font-bold w-[111px] sm:w-[239px]"
                text={user?.displayName || user?.ethAddress || user?.email}
                options={[
                  {
                    label: 'Log Out',
                    callback: () => handleLogOut(),
                  },
                  // {
                  //   label: 'Option 2',
                  //   callback: () => console.log('option2'),
                  // },
                ]}
              />
            </div>
          ) : (
            <div className="flex flex-row gap-3">
              <button
                className='border-[1px] border-solid border-[#252525] px-5 py-1'
                onClick={() => {

                }}
              >
                Sign up
              </button>
              <button
                className='border-[1px] border-solid border-[#252525] px-5 py-1 bg-[#131313]'
                onClick={openLoginModal}
              >
                Log In
              </button>
              {/* <Button className="hidden lg:block" onClick={() => {}} size="sm" variant="secondary">
                Sign Up
              </Button>
              <Button onClick={openLoginModal} className="" size="sm">
                Log In
              </Button> */}
            </div>
          )}
          <div className="lg:hidden ml-[8px]">
            <HamburgerMenu />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Navbar;
