import { FaDiscord as DiscordLogo, FaTwitter as TwitterLogo } from 'react-icons/fa';
import { Button } from '@components';

const Footer: React.FC = () => (
  <div>
    <footer className="flex justify-between items-center h-[100px] border-[1px] border-solid border-[#252525] px-6 lg:px-10 transition-all duration-200 text-white">
      {/* Left Section */}
      <div className="flex shrink-0 w-1/2 lg:w-1/4">
        <div className="flex flex-col shrink-0 w-full">
          <p className="lg:hidden text-left text-white/60">© Copyright 2023 All Rights Reserved 2023</p>
        </div>
      </div>
      {/* Center Section */}
      <div className="hidden lg:flex justify-center items-center flex-grow w-2/4 text-base">
        <p className="text-center text-white/60">© Copyright 2023 All Rights Reserved 2023</p>
      </div>

      {/* Right Section */}
      <div className="flex justify-end w-1/2 lg:w-1/4 items-center">
        <div className="flex flex-row gap-4">
          <Button
            className="text-2xl"
            onClick={() => {}}
            size="auto"
            variant="tertiary"
            link={{ href: 'https://discord.gg/', target: '_blank' }}
          >
            <DiscordLogo />
          </Button>
          <Button
            className="text-2xl"
            onClick={() => {}}
            size="auto"
            variant="tertiary"
            link={{ href: 'https://twitter.com/', target: '_blank' }}
          >
            <TwitterLogo />
          </Button>
        </div>
      </div>
    </footer>
  </div>
);

export default Footer;
