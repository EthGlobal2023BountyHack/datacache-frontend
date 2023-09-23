import { Button, Layout, Link } from '@/components';
import { FaUserCircle, FaDiscord as DiscordLogo, FaTwitter as TwitterLogo, FaMicrosoft } from 'react-icons/fa';
import { HiEllipsisVertical } from 'react-icons/hi2';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import classnames from 'classnames';

const Lander = ({ user }) => {
  const [ensName, setEnsName] = useState(null);
  const [bounties, setBounties] = useState([
    {
      id: 1,
      title: 'Web3 Gaming Audience',
      description:
        'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before final copy is available',
      totalJoined: 8123,
      payout: {
        total: 100000,
        type: 'USDC',
      },
      neededParticipants: 10000,
      from: 'Microsoft',
      logoUrl: '',
      icon: FaMicrosoft,
    },
  ]);

  const tempTags = ['> 18', 'opensea user', 'hiker', 'programer', 'nft degen', 'investor'];

  useEffect(() => {
    (async function () {
      if (!user) return;

      const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_PROVIDER_URL);
      const ensName = await provider.lookupAddress(user?.ethAddress);
      setEnsName(ensName);
    })();
  }, []);

  return (
    <Layout isHeaderTransparent={true}>
      <section className="px-20 flex gap-5">
        <div className="flex border-[1px] border-solid border-[#252525] w-1/4 flex-col py-10 text-zinc-500 items-center">
          <div className="pb-4">
            <div className="pb-3">
              <FaUserCircle size={150} color="grey" />
            </div>
            <p className="font-bold text-lg">{ensName}</p>
            <p className={classnames({ 'text-sm': ensName !== null }, { 'text-lg font-bold': ensName === null })}>
              {user?.ethAddress.substring(0, 12)}...
            </p>
          </div>
          <div className="pb-4 flex gap-4">
            <div className="border-[1px] border-solid border-[#252525] rounded-full">
              <Button
                className="text-2xl p-2"
                onClick={() => {}}
                size="auto"
                variant="tertiary"
                link={{ href: 'https://discord.gg/', target: '_blank' }}
              >
                <DiscordLogo size={25} />
              </Button>
            </div>
            <div className="border-[1px] border-solid border-[#252525] rounded-full">
              <Button
                className="text-2xl p-2"
                onClick={() => {}}
                size="auto"
                variant="tertiary"
                link={{ href: 'https://discord.gg/', target: '_blank' }}
              >
                <TwitterLogo size={25} />
              </Button>
            </div>
            <div className="border-[1px] border-solid border-[#252525] rounded-full">
              <Button
                className="p-2"
                onClick={() => {}}
                size="auto"
                variant="tertiary"
                link={{ href: 'https://discord.gg/', target: '_blank' }}
              >
                <img className="max-w-[25px]" src="/images/lens-logo.svg" alt="neo city map" />
              </Button>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap px-3 justify-center">
            {tempTags.slice(0, 5).map((tag) => (
              <p className="bg-red-500 px-4 text-white">{tag}</p>
            ))}
            {tempTags.length > 5 && <p className="bg-red-500 px-4 text-white">{tempTags.length - 5}+</p>}
          </div>
          <Link href="/profile" className="w-4/5 m-2 border px-4 text-center rounded-lg">
            + verify tags
          </Link>
        </div>
        <div className="flex-grow">
          {bounties.map((bounty) => (
            <div className="flex flex-col gap-4 w-1/3 bg-[#131313] p-6">
              <h2 className="font-bold text-2xl">{bounty.title}</h2>
              <p>{bounty.description}</p>
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex">
                    <span className="bg-[#252525] rounded-full">
                      <FaUserCircle size={35} color="white" />
                    </span>
                    <span className="ml-[-15px] bg-[#252525] rounded-full">
                      <FaUserCircle size={35} color="blue" />
                    </span>
                    <span className="ml-[-15px] bg-[#252525] rounded-full">
                      <FaUserCircle size={35} color="purple" />
                    </span>
                    <span className="ml-[-15px] bg-[#252525] rounded-full">
                      <FaUserCircle size={35} color="red" />
                    </span>
                    <div className="ml-[-15px] bg-[#252525] w-[35px] self-center justify-center h-[35px] rounded-full flex justify-center items-center">
                      <span className="text-sm">+99</span>
                    </div>
                  </div>
                  <span className="text-xs">{bounty.totalJoined} joined</span>
                </div>
                <div className="flex">
                  <div className="border-[1px] border-solid border-[#252525] px-5 py-1">Join</div>
                  <div className="border-t-[1px] border-r-[1px] border-b-[1px] border-solid border-[#252525] p-2">
                    <HiEllipsisVertical />
                  </div>
                </div>
              </div>
              <div className="flex justify-between border-[1px] border-solid border-[#252525] p-3 ">
                <div>
                  <p className="text-xxs">Total payout</p>
                  <p className="text-lg">
                    {bounty.payout.total} {bounty.payout.type}
                  </p>
                </div>
                <div>
                  <p className="text-xxs">Participants needed</p>
                  <p className="text-lg">{bounty.neededParticipants}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p>From {bounty.from}</p>
                <div className="bg-yellow-500 p-2 rounded-sm"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Lander;
