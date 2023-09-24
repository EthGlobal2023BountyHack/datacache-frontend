import { FaUserCircle, FaMicrosoft } from 'react-icons/fa';
import classnames from 'classnames';
import { HiEllipsisVertical } from 'react-icons/hi2';
import { useContractRead, useNetwork } from 'wagmi';
import { chainIdToContractMapping } from '@lib/constants';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { formatEther } from 'viem';

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

function truncate(address: string, { nPrefix, nSuffix, separator } = {}) {
  if (!address) return;
  const match = address.match(/^(0x[a-zA-Z0-9])[a-zA-Z0-9]+([a-zA-Z0-9])$/);
  const nTotalIsLongerThanAddress = (nPrefix || 0) + (nSuffix || 0) > address.length;

  return match && !nTotalIsLongerThanAddress
    ? `0x${address.slice(2, 2 + (nPrefix || 4))}${separator ? opening[separator] : ''}…${
        separator ? closing[separator] : ''
      }${address.slice(address.length - (nSuffix || 4))}`
    : address;
}

const BountyCard = ({ bounty }) => {
  const router = useRouter();

  const { chain: currentChain } = useNetwork();

  const marketplaceContract = chainIdToContractMapping[currentChain?.id];

  const {
    data: bountyBalance,
    isError,
    isLoading,
  } = useContractRead({
    address: marketplaceContract?.address,
    abi: marketplaceContract?.abi,
    functionName: 'bountyBalance',
    args: [bounty.bountyId],
  });

  useEffect(() => {
    if (isLoading) return;

    console.log('bountyBalance', bountyBalance);
  }, [isLoading]);

  const renderIcon = (icon) => {
    const Icon = icon;

    return <Icon size={35} />;
  };

  const dotFormatter = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const kFormatter = (num) => {
    return Math.abs(num) > 999
      ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'K'
      : Math.sign(num) * Math.abs(num);
  };

  return (
    <div
      className={classnames(
        'flex flex-col gap-4 bg-[#131313] p-6 flex-grow border-[1px] border-solid border-[#252525]',
        { 'max-w-3/12': router.pathname === '/bounties' },
        { 'max-w-1/4': router.pathname !== '/bounties' },
      )}
    >
      <h2 className="font-bold text-2xl">{bounty.name}</h2>
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
          {router.pathname !== '/dashboard' && (
            <>
              <button
                disabled={bounty.hasJoined ? true : false}
                className={classnames(
                  'border-[1px] border-solid border-[#252525] px-5 py-1',
                  { 'hover:text-black hover:cursor-pointer hover:bg-white': !bounty.hasJoined },
                  { 'opacity-50': bounty.hasJoined },
                )}
                onClick={() => {}}
              >
                {bounty.hasJoined ? 'Joined!' : 'Join'}
              </button>
              <div className="border-t-[1px] border-r-[1px] border-b-[1px] border-solid border-[#252525] p-2 hover:bg-white hover:text-black hover:cursor-pointer">
                <HiEllipsisVertical />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-between border-[1px] border-solid border-[#252525] p-3 ">
        <div>
          <p className="text-xxs">Available payout</p>
          <p className="text-lg">{kFormatter(Number(formatEther(bounty?.rewardTotal || 0n)))}</p>
        </div>
        <div>
          <p className="text-xxs">Participants needed</p>
          <p className="text-lg">
            {dotFormatter(
              Math.floor(Number(formatEther(bounty?.rewardTotal || 0n)) / Number(formatEther(bounty?.reward || 0n))),
            )}
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        {router.pathname !== '/dashboard' && (
          <div className="space-x-1">
            <span>Created by:</span>
            <a
              href={`"https://polygonscan.com/address/${bountyBalance?.[0]}#code"`}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              {bountyBalance?.[0] ? truncate(bountyBalance?.[0]) : 'Unknown'}
            </a>
          </div>
        )}
        <img src={bounty?.imageUrl} className="h-[50px] w-[50px] rounded-full" />
      </div>
    </div>
  );
};

export default BountyCard;
