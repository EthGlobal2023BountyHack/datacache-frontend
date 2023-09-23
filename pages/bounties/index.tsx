import { Button, Layout } from '@/components';
import { FaUserCircle, FaDiscord as DiscordLogo, FaTwitter as TwitterLogo, FaMicrosoft } from 'react-icons/fa'
import { HiEllipsisVertical } from 'react-icons/hi2'
import { TfiSearch } from 'react-icons/tfi'
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import classnames from 'classnames';
import { useContractRead, useToken } from 'wagmi'
import { marketplaceContract } from '@lib/constants';

const Bounties = ({ user }) => {
  const [ensName, setEnsName] = useState(null);
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

      return acc;
    } catch (e) {
      console.log(e);
      return acc;
    }
  }, []))

  const renderIcon = (icon) => {
    const Icon = icon

    return (
      <Icon size={35}/>
    )
  }

  const dotFormatter = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  const kFormatter = (num) => {
    return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'K' : Math.sign(num)*Math.abs(num)
}

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

      const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_PROVIDER_URL);
      const ensName = await provider.lookupAddress(user?.ethAddress);
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
              {tempTags.slice(0, 5).map(tag => (
                <p className='border-[1px] border-solid border-[#252525] px-4 text-white bg-[#131313]'>{tag}</p>
              ))}
              {tempTags.length > 5 && (
                <p className='border-[1px] border-solid border-[#252525] px-4 text-white bg-[#131313]'>{tempTags.length - 5}+</p>
              )}
            </div>
          )}
        </div>
        <div className='col-span-9'>
          <div className='border-[1px] border-solid border-[#252525] mb-5 p-5 flex items-center gap-x-4'>
            <TfiSearch color={"gray"}/>
            <input
              className='bg-black w-full'
              onChange={({ target: { value } }) => {
                setQuery(value)
              }}
            />
          </div>
          <div className="flex gap-3 flex-wrap items-center justify-center">
            {filteredBounties.map(bounty => (
              <div className='flex flex-col gap-4 w-3/12 bg-[#131313] p-6 flex-grow border-[1px] border-solid border-[#252525]'> 
                <h2 className='font-bold text-2xl'>{ bounty.name }</h2>
                <p>{ bounty.description }</p>
                <div className='flex justify-between items-center'>
                  <div>
                    <div className='flex'>
                      <span className='bg-[#252525] rounded-full'>
                        <FaUserCircle size={35} color='white'/>
                      </span>
                      <span className='ml-[-15px] bg-[#252525] rounded-full'>
                        <FaUserCircle size={35} color='blue'/>
                      </span>
                      <span className='ml-[-15px] bg-[#252525] rounded-full'>
                        <FaUserCircle size={35} color='purple'/>
                      </span>
                      <span className='ml-[-15px] bg-[#252525] rounded-full'>
                        <FaUserCircle size={35} color='red'/>
                      </span>
                      <div className='ml-[-15px] bg-[#252525] w-[35px] self-center justify-center h-[35px] rounded-full flex justify-center items-center'>
                        <span className='text-sm'>+99</span>
                      </div>
                    </div>
                    <span className='text-xs'>{bounty.totalJoined} joined</span>
                  </div>
                  <div className='flex'>
                    <button
                      disabled={ bounty.hasJoined ? true : false }
                      className={classnames(
                        'border-[1px] border-solid border-[#252525] px-5 py-1',
                        { 'hover:text-black hover:cursor-pointer hover:bg-white': !bounty.hasJoined },
                        { 'opacity-50': bounty.hasJoined }
                      )}
                      onClick={() => {

                      }}
                    >
                      { bounty.hasJoined ? "Joined!" : "Join" }
                    </button>
                    <div className='border-t-[1px] border-r-[1px] border-b-[1px] border-solid border-[#252525] p-2 hover:bg-white hover:text-black hover:cursor-pointer'><HiEllipsisVertical /></div>
                  </div>
                </div>
                <div className='flex justify-between border-[1px] border-solid border-[#252525] p-3 '>
                  <div>
                    <p className='text-xxs'>Available payout</p>
                    <p className='text-lg'>{kFormatter(bounty.rewardTotal.toNumber())} Matic</p>
                  </div>
                  <div>
                    <p className='text-xxs'>Participants needed</p>
                    <p className='text-lg'>{dotFormatter(bounty.rewardTotal.toNumber() / bounty.reward.toNumber())}</p>
                  </div>
                </div>
                <div className='flex justify-between items-center'>
                  <p>From {bounty.payoutFrom}</p>
                  {/* <div className='bg-yellow-500 p-2 rounded-sm'>
                    {renderIcon(bounty.icon)}
                  </div> */}
                </div>
              </div>
            ))}
            {/* {filteredBounties.length === 2 && (
              <>
                <div className='w-4/12'></div>
              </>
            )}
            {filteredBounties.length === 1 && (
              <>
                <div className='w-4/12'></div>
                <div className='w-4/12'></div>
              </>
            )} */}
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Bounties