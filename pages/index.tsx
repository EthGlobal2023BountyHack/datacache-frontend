import { Button, Layout } from '@/components';
import { FaUserCircle, FaDiscord as DiscordLogo, FaTwitter as TwitterLogo, FaMicrosoft } from 'react-icons/fa'
import { HiEllipsisVertical } from 'react-icons/hi2'
import { TfiSearch } from 'react-icons/tfi'
import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import classnames from 'classnames';
import { useContractRead, useNetwork } from 'wagmi'
import { marketplaceContract } from '@lib/constants';
import { MetaMaskAvatar } from 'react-metamask-avatar';
import BountyCard from '@/components/layouts/BountyCard';

import { useManageSubscription, useSubscription, useW3iAccount, useInitWeb3InboxClient, useMessages } from "@web3inbox/widget-react";
import { useSignMessage, useAccount } from 'wagmi'

const Home = ({ user }) => {

 // -----

 const isReady = useInitWeb3InboxClient({projectId: "418e276fdef7a308d3399d8598b7e135", domain: "datacache.ecalculator.pro" })
  
 const { address } = useAccount({
  onDisconnect: () => {
    setAccount("");
  },
}); 
 // Getting the account -- Use register before attempting to subscribe
 const { setAccount, register: registerIdentity, identityKey } = useW3iAccount()
 
 const { signMessageAsync } = useSignMessage();
 
 // Checking if subscribed
 const { subscribe, isSubscribed } = useManageSubscription(user?.ethAddress)
 
 // Get the subscription
 const { subscription } = useSubscription()
 
 const { messages } = useMessages()
 
  useEffect(() => {
    if (!address) return
    setAccount(`eip155:1:${address}`);
 }, [address, setAccount,]);

 const handleRegistration = useCallback(async () => {
   if (!address) return;
   try {
     await registerIdentity(signMessageAsync);
   } catch (registerIdentityError) {
     console.error({ registerIdentityError });
   }
 }, [signMessageAsync, registerIdentity, address]);

 useEffect(() => {
   if (!identityKey) {
     handleRegistration();
   }
 }, [handleRegistration, identityKey]);

 // -----

  const [ensName, setEnsName] = useState(null);
  const [tags, setTags] = useState([])
  const [query, setQuery] = useState("")
  const [filteredBounties, setFilteredBounties] = useState([])
  const { data: fetchedBounties, isError, isLoading: loadingBounties } = useContractRead({
    address: marketplaceContract.address,
    abi: marketplaceContract.abi,
    functionName: 'getAllBounties', 
  })
  const [bounties, setBounties] = useState(fetchedBounties?.reduce((acc, bytes) => {
    try {
      const [bountyId, name, description, reward, rewardType, rewardTotal, rewardAddress, payoutFrom] =
          ethers.utils.defaultAbiCoder.decode(
              ["uint256", "string", "string", "uint256", "bytes32", "uint256", "address", "address"],
              bytes,
              false
          );
      acc.push({
        bountyId, name, description, reward, rewardType, rewardTotal, rewardAddress, payoutFrom
      });
      console.log(acc)
      return acc;
    } catch (e) {
      console.log(e);
      return acc;
    }
  }, []))
  const { chain, chains } = useNetwork()

  const elligibleBounties = (bounties) => {
    return bounties.filter(({ rewardTotal }) => rewardTotal.toNumber() > 0)
  }

  useEffect(() => {
    if (loadingBounties) return

    setFilteredBounties(elligibleBounties(bounties))
  }, [loadingBounties])

  useEffect(() => {
    if (query === "") {
      setFilteredBounties(elligibleBounties(bounties))
      return
    }

    const matchedBounties = bounties.filter(({ name, rewardTotal }) => name.toLowerCase().includes(query) && rewardTotal > 0)
    setFilteredBounties(elligibleBounties(matchedBounties))
  }, [query])

  useEffect(() => {
    console.log("isReady before", isReady)

    if (!isReady) return
    console.log("isReady", isReady)
    if (!Boolean(address)) return;
    // setAccount(`eip155:1:${address}`);
    subscribe()
  }, [isReady])

  useEffect(() => {
    (async function () {
      if (!user) return

      const { list } = await fetch(`https://datacache.ecalculator.pro/api/wallet/tag/list/?address=${user.ethAddress}`)
        .then(res => res.json())
      console.log("list", list)
      setTags(list)

      const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_PROVIDER_URL);
      const ensName = await provider.lookupAddress(user.ethAddress);
      setEnsName(ensName)
    })();
  }, [user])

  return (
    <Layout isHeaderTransparent={true}>
      <section className="px-20 grid grid-cols-12 gap-6">
        <div className={classnames(
          "flex border-[1px] border-solid border-[#252525] flex-col text-white col-span-3 h-fit",
          { 'py-10 items-center': user },
          { 'p-10': !user }
        )}>
          {!user && (
            <div>
              <p className='text-xs'>About</p>
              <h1 className='uppercase text-3xl'>DataCache</h1>
              <p className='pt-5'>Control your data destiny with us! Upload your data securely, and our accredited issuers verify its accuracy. Advertisers can set 'bounties' for specific data they need, and when you match their criteria, you get paid. It's your data, your trust, and your reward, all in one app.</p>
            </div>
          )} 
          <div className={classnames(
            'flex flex-col items-center',
            { 'pb-4': user }
          )}>
            <div className={classnames(
              { 'pb-3': user }
            )}>
              <MetaMaskAvatar address={user?.ethAddress} size={150} />
            </div>
            {user && (
              <>
                <p className='font-bold text-lg'>{ ensName }</p>
                <p className={classnames(
                  "text-white",
                  { 'text-sm': ensName !== null },
                  { 'text-lg font-bold': ensName === null }
                )}>
                  { user?.ethAddress.substring(0, 12) }...
                </p>
              </>
            )}
          </div>
          {user && (
            <div className='pb-4 flex gap-4'>
              <div className='border-[1px] border-solid border-[#252525] rounded-full'>
                <Button
                  className="text-2xl p-2"
                  onClick={() => {}}
                  size="auto"
                  variant="tertiary"
                  link={{ href: 'https://discord.gg/', target: '_blank' }}
                >
                  <DiscordLogo size={25}/>
                </Button>
              </div>
              <div className='border-[1px] border-solid border-[#252525] rounded-full'>
                <Button
                  className="text-2xl p-2"
                  onClick={() => {}}
                  size="auto"
                  variant="tertiary"
                  link={{ href: 'https://discord.gg/', target: '_blank' }}
                >
                  <TwitterLogo size={25}/>
                </Button>
              </div>
              <div className='border-[1px] border-solid border-[#252525] rounded-full'>
                <Button
                  className="p-2"
                  onClick={() => {}}
                  size="auto"
                  variant="tertiary"
                  link={{ href: 'https://discord.gg/', target: '_blank' }}
                >
                  <img
                    className="max-w-[25px]"
                    src="/images/lens-logo.svg"
                    alt="neo city map"
                  />
                </Button>
              </div>
            </div>
          )}
          {user && (
            <div className='flex gap-1 flex-wrap px-3 justify-center'>
              {tags.slice(0, 5).map(tag => (
                <p className='border-[1px] border-solid border-[#252525] px-4 text-white bg-[#131313]'>{tag.name}</p>
              ))}
              {tags.length > 5 && (
                <p className='border-[1px] border-solid border-[#252525] px-4 text-white bg-[#131313]'>{tags.length - 5}+</p>
              )}
            </div>
          )}
        </div>
        <div className='col-span-9'>
          <div className='border-[1px] border-solid border-[#252525] mb-5 p-5 flex items-center gap-x-4'>
            <TfiSearch color={"gray"}/>
            <input
              className='bg-black w-full outline-none'
              placeholder='Search'
              onChange={({ target: { value } }) => {
                setQuery(value)
              }}
            />
          </div>
          <div className="flex gap-3 flex-wrap items-center justify-center">
            {filteredBounties.map(bounty => (
              <BountyCard bounty={bounty} />
            ))}
            {filteredBounties.length === 0 && query === "" && (
              <p>No bounties have been created yet! isRead:{isReady} test: {isSubscribed}</p>
            )}
          </div>
        </div>
      </section>
      <div className='absolute bg-blue-500 flex bottom-0 mb-[190px] right-0'>
        <p>asjkdhasdasdasd</p>
      </div>
    </Layout>
  )
}

export default Home