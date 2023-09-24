import { FaDiscord as DiscordLogo, FaTwitter as TwitterLogo } from 'react-icons/fa';
import { Button } from '@components';
import { chainIdToContractMapping } from '@lib/constants';
import { useNetwork } from 'wagmi';

const Footer: React.FC = () => {
  const { chain: currentChain } = useNetwork();
  const marketplaceContract = chainIdToContractMapping[currentChain?.id];
  return (
    <footer className="flex justify-between items-center h-[120px] border-l-none border-r-none border-t-[1px] border-solid border-white/30 px-6 lg:px-10 transition-all duration-200 text-white">
      {/* Left Section */}
      <div className="flex shrink-0 w-1/2 lg:w-1/4">
        <div className="flex flex-col shrink-0 w-full">
          <p className="lg:hidden text-left text-white/60 text-xs">© Copyright 2023 All Rights Reserved 2023</p>
        </div>
      </div>
      {/* Center Section */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-grow w-2/4 text-base space-y-2">
        <a
          className="text-center text-white/60 text-sm hover:text-white hover:underline"
          href={marketplaceContract?.url}
          target="_blank"
        >
          View Bounty Contract
        </a>
        <p className="text-center text-white/60 text-xs">© Copyright 2023 All Rights Reserved 2023</p>
      </div>

      {/* Right Section */}
      <div className="flex justify-end w-1/2 lg:w-1/4 items-center">
        <div className="flex flex-row gap-4">
          <Button
            onClick={() => {}}
            size="auto"
            variant="tertiary"
            link={{ href: 'https://discord.gg/', target: '_blank' }}
          >
            <DiscordLogo className="text-2xl" />
          </Button>
          <Button
            onClick={() => {}}
            size="auto"
            variant="tertiary"
            link={{ href: 'https://twitter.com/', target: '_blank' }}
          >
            <TwitterLogo className="text-2xl" />
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
