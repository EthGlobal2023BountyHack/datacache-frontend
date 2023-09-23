import { useRef, useContext, useEffect, useState } from 'react';
import classnames from 'classnames';
import { ethers } from 'ethers';
import { Image, Button } from '@components';
import { useDisconnect } from 'wagmi';
import { FaCaretDown as DownIcon } from 'react-icons/fa';
import { ConnectKitButton } from 'connectkit';
import { shortAddress } from '@/utils';
import { UserContext } from '@/context/UserContext';

const CustomConnectKit = ({ connectText, className, onClick }) => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return (
          <Button
            className={className}
            onClick={() => {
              show();

              if (onClick) {
                onClick();
              }
            }}
          >
            {connectText}
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};

const NameDisplay = ({ address, className }) => {
  const ref = useRef(null);
  const [isOpened, setIsOpened] = useState(false);
  const [ensName, setEnsName] = useState(null);
  const isLoading = ensName === null;
  const { disconnect } = useDisconnect();

  useEffect(() => {
    (async function () {
      const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_PROVIDER_URL);
      const ensName = await provider.lookupAddress(address);
      setEnsName(ensName || '');
    })();
  }, [address]);

  return (
    <>
      <div
        className={classnames('relative flex flex-row items-center space-x-2 text-lg font-light', className)}
        role="button"
        onClick={() => setIsOpened((prev) => !prev)}
      >
        {isLoading ? (
          <span className="text-kermit">...</span>
        ) : (
          <>
            <span className="text-kermit flex flex-row items-center space-x-1">
              <span>{ensName || shortAddress(address, 2)}</span>
              <DownIcon />
            </span>
            {isOpened && (
              <div
                ref={ref}
                className="absolute top-[40px] w-[160px] space-y-2 rounded-md bg-primary p-2 text-sm font-semibold text-primary-light shadow-lg"
              >
                <button
                  className="flex h-full opacity-90 duration-300 hover:opacity-100"
                  onClick={async () => {
                    await disconnect();
                  }}
                >
                  Disconnect
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

const ConnectWallet = ({
  buttonClassName = null,
  className = null,
  siteName = 'datacache.xyz',
  displayAddress = false,
  connectText = 'Connect Wallet',
  onClick,
}) => {
  const [{ user }, setUser] = useContext(UserContext);
  const isLoggedIn = !!user?.issuer;

  const formatMessage = (address, chainId, nonce) =>
    `${siteName} wants you to sign in with your Ethereum account: ${address} \n\nWelcome to ${siteName}. Signing is the only way we can truly know that you are the owner of the wallet you are connecting. Signing is a safe, gas-less transaction that does not in any way give ${siteName} permission to perform any transactions with your wallet. \n\nChain Id: ${chainId} \nNonce: ${nonce}`;

  return !isLoggedIn ? (
    <CustomConnectKit connectText={connectText} className={buttonClassName} onClick={onClick} />
  ) : displayAddress ? (
    <NameDisplay className={className} address={user?.publicAddress} />
  ) : null;
};

export default ConnectWallet;
