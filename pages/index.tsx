import { Button, Layout } from '@/components';
import { FaUserCircle, FaDiscord as DiscordLogo, FaTwitter as TwitterLogo, FaMicrosoft } from 'react-icons/fa';
import { HiEllipsisVertical } from 'react-icons/hi2';
import { TfiClose, TfiSearch } from 'react-icons/tfi';
import { ethers } from 'ethers';
import { useEffect, useState, useCallback } from 'react';
import classnames from 'classnames';
import { chainIdToContractMapping } from '@lib/constants';
import { MetaMaskAvatar } from 'react-metamask-avatar';
import BountyCard from '@/components/layouts/BountyCard';
import {
  useInitWeb3InboxClient,
  useManageSubscription,
  useW3iAccount,
  useMessages,
  useSubscription,
} from '@web3inbox/widget-react';
import { useAccount, useContractRead, useSignMessage, useNetwork } from 'wagmi';

const Home = ({ user }) => {
  const isReady = useInitWeb3InboxClient({
    projectId: '418e276fdef7a308d3399d8598b7e135',
    domain: 'datacache.ecalculator.pro',
  });

  const { chain: currentChain } = useNetwork();

  const marketplaceContract = chainIdToContractMapping[currentChain?.id];

  const { address } = useAccount({
    onDisconnect: () => {
      setAccount('');
    },
  });
  // Getting the account -- Use register before attempting to subscribe
  const { account, setAccount, register: registerIdentity, identityKey } = useW3iAccount();
  const { signMessageAsync } = useSignMessage();

  // Checking if subscribed
  const { subscribe, isSubscribed } = useManageSubscription(account);

  // Get the subscription
  const { subscription } = useSubscription();

  const { messages } = useMessages();

  const signMessage = useCallback(
    async (message: string) => {
      const res = await signMessageAsync({
        message,
      });

      return res as string;
    },
    [signMessageAsync],
  );

  useEffect(() => {
    if (!address) return;
    setAccount(`eip155:1:${address}`);
  }, [signMessage, address, setAccount]);

  const handleRegistration = useCallback(async () => {
    if (!account) return;
    console.log('handleRegistration');
    try {
      await registerIdentity(signMessage);
    } catch (registerIdentityError) {
      console.error({ registerIdentityError });
    }
  }, [signMessage, registerIdentity, account]);

  useEffect(() => {
    if (!identityKey) {
      handleRegistration();
    }
  }, [handleRegistration, identityKey]);

  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [ensName, setEnsName] = useState(null);
  const [tags, setTags] = useState([]);
  const [query, setQuery] = useState('');
  const [filteredBounties, setFilteredBounties] = useState([]);
  const {
    data: fetchedBounties,
    isError,
    isLoading: loadingBounties,
  } = useContractRead({
    address: marketplaceContract?.address,
    abi: marketplaceContract?.abi,
    functionName: 'getAllBounties',
  });
  const [bounties, setBounties] = useState(
    fetchedBounties?.reduce((acc, bytes) => {
      try {
        const [bountyId, name, description, reward, rewardType, rewardTotal, rewardAddress, payoutFrom] =
          ethers.utils.defaultAbiCoder.decode(
            ['uint256', 'string', 'string', 'uint256', 'bytes32', 'uint256', 'address', 'address'],
            bytes,
            false,
          );
        acc.push({
          bountyId,
          name,
          description,
          reward,
          rewardType,
          rewardTotal,
          rewardAddress,
          payoutFrom,
        });
        console.log(acc);
        return acc;
      } catch (e) {
        console.log(e);
        return acc;
      }
    }, []),
  );
  const { chain, chains } = useNetwork();

  const eligibleBounties = (bounties) => {
    return bounties?.filter(({ rewardTotal }) => rewardTotal?.toNumber() > 0);
  };

  useEffect(() => {
    if (loadingBounties) return;

    setFilteredBounties(eligibleBounties(bounties));
  }, [loadingBounties]);

  useEffect(() => {
    if (query === '') {
      setFilteredBounties(eligibleBounties(bounties));
      return;
    }

    const matchedBounties = bounties?.filter(
      ({ name, rewardTotal }) => name?.toLowerCase().includes(query) && rewardTotal > 0,
    );
    setFilteredBounties(eligibleBounties(matchedBounties));
  }, [query]);

  useEffect(() => {
    console.log('isReady before', isReady);

    if (!isReady) return;
    console.log('isReady', isReady);
    subscribe();
  }, [isReady]);

  useEffect(() => {
    (async function () {
      if (!user) return;

      const { list } = await fetch(
        `https://datacache.ecalculator.pro/api/wallet/tag/list/?address=${user.ethAddress}`,
      ).then((res) => res.json());
      console.log('list', list);
      setTags(list);

      const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_PROVIDER_URL);
      const ensName = await provider.lookupAddress(user.ethAddress);
      setEnsName(ensName);
    })();
  }, [user]);

  return (
    <Layout isHeaderTransparent={true}>
      <section className="px-20 grid grid-cols-12 gap-6">
        <div
          className={classnames(
            'flex border-[1px] border-solid border-[#252525] flex-col text-white col-span-3 h-fit',
            { 'py-10 items-center': user },
            { 'p-6': !user },
          )}
        >
          {!user && (
            <div className="hidden lg:flex flex-col">
              <p className="text-xs text-white/60">About</p>
              <h1 className="uppercase text-4xl font-black">Datacache</h1>
              <p className="pt-5 leading-[32px]">
                {`Control your data destiny with us! Upload your data securely, and our accredited issuers verify its
                accuracy. Advertisers can set 'bounties' for specific data they need, and when you match their criteria,
                you get paid. It's your data, your trust, and your reward, all in one app.`}
              </p>
            </div>
          )}
          <div className={classnames('flex flex-col items-center', { 'pb-4': user })}>
            <div className={classnames({ 'pb-3': user })}>
              <MetaMaskAvatar address={user?.ethAddress} size={150} />
            </div>
            {user && (
              <>
                <p className="font-bold text-lg">{ensName}</p>
                <p
                  className={classnames(
                    'text-white',
                    { 'text-sm': ensName !== null },
                    { 'text-lg font-bold': ensName === null },
                  )}
                >
                  {user?.ethAddress.substring(0, 12)}...
                </p>
              </>
            )}
          </div>
          {user && (
            <div className="flex gap-1 flex-wrap px-3 justify-center">
              {tags.slice(0, 5).map((tag) => (
                <p className="border-[1px] border-solid border-[#252525] px-4 text-white bg-[#131313]">{tag.name}</p>
              ))}
              {tags.length > 5 && (
                <p className="border-[1px] border-solid border-[#252525] px-4 text-white bg-[#131313]">
                  {tags.length - 5}+
                </p>
              )}
            </div>
          )}
        </div>
        <div className="col-span-9">
          <div className="border-[1px] border-solid border-[#252525] mb-5 p-5 flex items-center gap-x-4">
            <TfiSearch color={'gray'} />
            <input
              className="bg-black w-full outline-none"
              placeholder="Search"
              onChange={({ target: { value } }) => {
                setQuery(value);
              }}
            />
          </div>
          <div className="flex gap-3 flex-wrap items-center justify-center">
            {filteredBounties?.map((bounty) => <BountyCard bounty={bounty} />)}
            {filteredBounties?.length === 0 && query === '' && (
              <p>
                No bounties have been created yet! isRead:{isReady} test: {isSubscribed}
              </p>
            )}
          </div>
        </div>
      </section>
      <div className="absolute flex bottom-0 mb-[120px] right-10 hover:cursor-pointer w-[500px] flex flex-col bg-black">
        <button
          onClick={() => {
            setIsMessageOpen((prev) => !prev);
          }}
        >
          <div
            className={classnames(
              'border-x-[1px] border-t-[1px] border-solid border-[#252525] px-5 py-3 flex justify-between items-center',
              { 'border-b-[1px]': isMessageOpen },
            )}
          >
            <div className="flex items-center gap-x-3">
              <p>Messages</p>
              <button className="border-[1px] border-solid border-[#252525] px-4 py-1" onClick={subscribe}>
                Subscribe
              </button>
            </div>
            <TfiClose />
          </div>
        </button>
        {isMessageOpen && (
          <div className="border-x-[1px] border-solid border-[#252525] h-[400px] px-5 py-3 overflow-auto">
            {messages.map(({ message: { body } }) => {
              if (body[0] !== '{') return;

              const parsedMessage = JSON.parse(body);

              if (!Object.keys(parsedMessage).includes('bountyId')) return;

              const time = new Date(parsedMessage.timestamp * 1000);

              return (
                <div className="border-[1px] border-solid border-[#252525] max-w-[400px] p-2 mb-3">
                  <p className="font-bold">{bounties?.filter(({ bountyId }) => bountyId === body.bountyId)[0]?.name}</p>
                  <p className="">Based on your verified traits, you are elligible to join this bounty!</p>
                  <p className="text-xs pt-3">{time.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
