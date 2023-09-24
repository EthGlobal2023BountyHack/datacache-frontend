import { Button, Layout } from '@/components';
import { FaUserCircle, FaDiscord as DiscordLogo, FaTwitter as TwitterLogo, FaMicrosoft } from 'react-icons/fa'
import { HiEllipsisVertical } from 'react-icons/hi2'
import { TfiSearch } from 'react-icons/tfi'
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import classnames from 'classnames';
import { useContractRead, useToken } from 'wagmi'
import { marketplaceContract } from '@lib/constants';
import BountyCard from '@/components/layouts/BountyCard';

const Home = ({ user }) => {
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

  const tempTags = ["> 18", "opensea user", "hiker", "programer", "nft degen", "investor"]

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
        <div className="flex border-[1px] border-solid border-[#252525] flex-col py-10 text-zinc-500 items-center col-span-3 h-fit">
          <div className={classnames(
            'flex flex-col items-center',
            { 'pb-4': user }
          )}>
            <div className={classnames(
              { 'pb-3': user }
            )}>
              <FaUserCircle size={150} color='white'/>
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
              <p>No bounties have been created yet!</p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Home