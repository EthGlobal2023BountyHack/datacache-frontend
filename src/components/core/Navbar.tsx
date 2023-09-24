import React, { useContext, useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { useDisconnect, useNetwork } from 'wagmi';
import { useScroll, Image, Button, Link } from '@components';
import { ErrorBoundary } from 'react-error-boundary';
import { UserContext } from '@/context/UserContext';
import { MdNotifications as BellIcon, MdMenu as HamburgerMenu } from 'react-icons/md';
import Dropdown from './Dropdown';
import { useRouter } from 'next/router';

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

const opening = {
  braces: '{',
  brackets: '[',
  parenthesis: '(',
};

const closing = {
  braces: '}',
  brackets: ']',
  parenthesis: ')',
};

export function truncate(address: string, { nPrefix, nSuffix, separator } = {}) {
  if (!address) return;
  const match = address.match(/^(0x[a-zA-Z0-9])[a-zA-Z0-9]+([a-zA-Z0-9])$/);
  const nTotalIsLongerThanAddress = (nPrefix || 0) + (nSuffix || 0) > address.length;

  return match && !nTotalIsLongerThanAddress
    ? `0x${address.slice(2, 2 + (nPrefix || 4))}${separator ? opening[separator] : ''}…${
        separator ? closing[separator] : ''
      }${address.slice(address.length - (nSuffix || 4))}`
    : address;
}

const Navbar: React.FC<NavbarProps> = ({ isHeaderTransparent = false, openLoginModal }) => {
  const [{ user }, setUser] = useContext(UserContext);
  const [isHidden, setIsHidden] = useState(isHeaderTransparent);
  const { disconnect } = useDisconnect();
  const { scrollY } = useScroll();
  const [isNewNotification, setIsNewNotification] = useState(true);
  const router = useRouter();

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
    router.push('/api/auth/logout', undefined, { shallow: true });
  };

  const { chain: currentChain } = useNetwork();

  return (
    <ErrorBoundary fallbackRender={fallbackRender}>
      <div
        className={classnames(
          'absolute top-0 flex h-[88px] w-full flex-row items-center justify-between bg-[#131313] px-6 lg:px-10 transition-all duration-200 text-white',
          bgHidden ? 'bg-opacity-0' : 'shadow-xl',
        )}
      >
        {/* Left Section */}
        <Link href="/" className="flex flex-row items-center space-x-1 shrink-0 w-1/2 sm:w-1/4">
          <Image src="/logo.png" alt="logo datacache" height={50} width={50} />
          <h1 className="uppercase text-lg font-black">Datacache</h1>
        </Link>
        {/* Center Section */}
        <div className="hidden lg:flex justify-center flex-grow w-1/2 gap-5 h-[50px]">
          <button
            className={classnames('transition-all duration-300', {
              'font-semibold opacity-100 border-b-[2px] pt-[1px] text-[#0074F0] border-[#0074F0]':
                router.pathname === '/',
              'opacity-80': router.pathname !== '/',
            })}
            onClick={() => {
              router.push('/');
            }}
          >
            Bounties
          </button>
          <button
            className={classnames('transition-all duration-300', {
              'font-semibold opacity-100 border-b-[2px] pt-[1px] text-[#0074F0] border-[#0074F0]':
                router.pathname === '/dashboard',
              'opacity-80': router.pathname !== '/dashboard',
            })}
            onClick={() => {
              router.push('/dashboard');
            }}
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
                text={
                  <div className="relative flex flex-col jusitfy-center h-full w-full">
                    <span className="absolute top-[-15px] left-0 text-center text-white/60 text-[12px] z-[2]">
                      {currentChain?.name || 'Unknown Network'}
                    </span>
                    <span className="truncate w-full">
                      {user?.displayName || truncate(user?.ethAddress) || user?.email}
                    </span>
                  </div>
                }
                options={[
                  {
                    label: 'Profile',
                    callback: () => router.push('/profile'),
                  },
                  {
                    label: 'Log Out',
                    callback: () => handleLogOut(),
                  },
                ]}
              />
            </div>
          ) : (
            <div className="flex flex-row gap-3">
              <button
                className="border-[1px] border-solid border-[#252525] hover:bg-[#0074F0] hover:text-white px-5 py-2 bg-[#131313]"
                onClick={openLoginModal}
              >
                Log In
              </button>
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
