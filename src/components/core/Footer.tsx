import { FaDiscord as DiscordLogo, FaTwitter as TwitterLogo } from 'react-icons/fa';
import { Button } from '@components';
import { chainIdToContractMapping } from '@lib/constants';
import { useNetwork } from 'wagmi';

const Footer: React.FC = () => {
  const { chain: currentChain } = useNetwork();
  const marketplaceContract = chainIdToContractMapping[currentChain?.id];
  return (
    <footer className="flex flex-row justify-between h-[90px] border-0 border-solid border-white/30 px-6 lg:px-10 transition-all duration-200 text-white">
      <div className="flex flex-col w-1/2 lg:w-1/4">
        <div className="flex flex-row gap-4">
          <Button
            onClick={() => {}}
            size="auto"
            variant="tertiary"
            link={{ href: 'https://discord.gg/', target: '_blank' }}
          >
            <DiscordLogo className="opacity-80 hover:opacity-100 text-xl" />
          </Button>
          <Button
            onClick={() => {}}
            size="auto"
            variant="tertiary"
            link={{ href: 'https://twitter.com/', target: '_blank' }}
          >
            <TwitterLogo className="opacity-80 hover:opacity-100 text-xl" />
          </Button>
        </div>
        <div className="flex text-left flex-start pt-2">
          <div className="flex">
            <div className="flex flex-col shrink-0 w-full">
              <p className="lg:hidden text-left text-white/60 text-xs">© Copyright 2023 All Rights Reserved 2023</p>
            </div>
          </div>
          {/* Center Section */}
          <div className="hidden lg:flex flex-col text-base space-y-1">
            <a
              className="text-white/60 text-xs hover:text-white hover:underline"
              href={marketplaceContract?.url}
              target="_blank"
            >
              View contract on {currentChain?.name}
            </a>
            <p className=" text-white/60 text-xs">© Copyright 2023 All Rights Reserved 2023</p>
          </div>
        </div>
      </div>
      {/* Left Section */}

      {/* Right Section */}
      <div />
    </footer>
  );
};

export default Footer;
