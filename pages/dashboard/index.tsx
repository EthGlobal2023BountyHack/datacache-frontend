import { Layout } from '@/components';
import { useEffect, useState, useMemo } from 'react';
import { chainIdToContractMapping } from '@lib/constants';
import { ethers } from 'ethers';
import { useContractRead, useNetwork, useToken } from 'wagmi';
import BountyCard from '@/components/layouts/BountyCard';
import { TfiSearch, TfiPlus, TfiClose } from 'react-icons/tfi';
import classnames from 'classnames';

const Dashboard = ({ user }) => {
  const [query, setQuery] = useState('');
  const [filteredBounties, setFilteredBounties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isUsingNativeToken, setIsUsingNativeToken] = useState(true);
  const [tokenType, setTokenType] = useState('');
  const [createBounty, setCreateBounty] = useState({
    tokenAddress: '0x0000000000000000000000000000000000000000',
    rewardType: 'ERC20_REWARD',
  });
  const [isFormComplete, setIsFormComplete] = useState(null);

  const { chain: currentChain } = useNetwork();

  const marketplaceContract = chainIdToContractMapping[currentChain?.id];

  const {
    data: fetchedBounties,
    isError,
    isLoading: loadingBounties,
  } = useContractRead({
    address: marketplaceContract?.address,
    abi: marketplaceContract?.abi,
    functionName: 'getAllBounties',
  });

  const bounties = useMemo(() => {
    return fetchedBounties?.reduce((acc, bytes) => {
      try {
        const [bountyId, name, description, imageUrl, reward, rewardType, rewardTotal, rewardAddress, payoutFrom] =
          ethers.utils.defaultAbiCoder.decode(
            ['uint256', 'string', 'string', 'string', 'uint256', 'bytes32', 'uint256', 'address', 'address'],
            bytes,
            false,
          );
        acc.push({
          bountyId,
          name,
          description,
          imageUrl,
          reward,
          rewardType,
          rewardTotal,
          rewardAddress,
          payoutFrom,
        });

        return acc;
      } catch (e) {
        console.log(e);
        return acc;
      }
    }, []);
  }, [fetchedBounties]);

  const eligibleBounties = (bounties) => {
    return bounties?.filter(({ rewardTotal }) => rewardTotal.toNumber() > 0);
  };

  useEffect(() => {
    if (loadingBounties) return;

    // setFilteredBounties(eligibleBounties([bounties[0], bounties[0], bounties[0], bounties[0], bounties[0], bounties[0]]))
    setFilteredBounties(eligibleBounties(bounties));
  }, [loadingBounties]);

  useEffect(() => {
    if (query === '') {
      // setFilteredBounties(eligibleBounties([bounties[0], bounties[0], bounties[0], bounties[0], bounties[0], bounties[0]]))
      setFilteredBounties(eligibleBounties(bounties));
      return;
    }

    const matchedBounties = bounties?.filter(
      ({ name, rewardTotal }) => name?.toLowerCase().includes(query) && rewardTotal > 0,
    );
    setFilteredBounties(eligibleBounties(matchedBounties));
  }, [query]);

  return (
    <Layout isHeaderTransparent={true}>
      <section className="px-6 lg:px-10 flex gap-6 flex-col">
        <div className="border-[1px] border-solid border-[#252525] p-5 flex items-center gap-x-4 w-full">
          <TfiSearch color={'gray'} />
          <input
            className="bg-black w-full flex-grow outline-none"
            placeholder="Search"
            onChange={({ target: { value } }) => {
              setQuery(value);
            }}
          />
        </div>
        <button
          className="border-[1px] border-solid border-[#252525] px-5 py-3 w-fit self-end flex items-center gap-2 hover:bg-white hover:text-black"
          onClick={() => {
            setShowModal(true);
          }}
        >
          <TfiPlus />
          Create Bounty
        </button>
        <div className={classnames('flex gap-3 flex-wrap', { 'justify-center': bounties?.length === 0 })}>
          {filteredBounties?.map((bounty) => <BountyCard bounty={bounty} />)}
          {filteredBounties?.length === 0 && query === '' && (
            <div className="text-white/60">You have no bounties yet</div>
          )}
        </div>
      </section>
      {showModal && (
        <div
          className="fixed h-full w-full bg-black bg-opacity-10 flex items-center justify-center z-[10000] top-0 left-0"
          style={{
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="border-x-[1px] border-t-[1px] border-solid border-[#252525] w-1/3 pt-6 bg-black">
            <div className="flex items-center justify-between px-6 pb-6 bg-dark">
              <h1 className="text-xl">Create Bounty</h1>
              <button
                onClick={() => {
                  setShowModal(false);
                }}
              >
                <TfiClose />
              </button>
            </div>
            <div className="border-y-[1px] border-solid border-[#252525] p-6 flex flex-col gap-3">
              <div className="bg-[#131313] p-2">
                <p className="text-xs">Name</p>
                <input
                  onChange={({ target: { value } }) => {
                    setCreateBounty((prev) => {
                      return { ...prev, name: value };
                    });
                    setIsFormComplete(null);
                  }}
                  className="bg-[#131313] w-full flex-grow outline-none text-lg"
                  value={createBounty?.name || ''}
                />
              </div>
              <div className="bg-[#131313] p-2">
                <p className="text-xs">Description</p>
                <textarea
                  onChange={({ target: { value } }) => {
                    setCreateBounty((prev) => {
                      return { ...prev, description: value };
                    });
                    setIsFormComplete(null);
                  }}
                  className="bg-[#131313] w-full flex-grow outline-none text-lg"
                  value={createBounty?.description || ''}
                />
              </div>
              <div className="bg-[#131313] p-2">
                <p className="text-xs">Image URL</p>
                <input
                  onChange={({ target: { value } }) => {
                    setCreateBounty((prev) => {
                      return { ...prev, imageUrl: value };
                    });
                    setIsFormComplete(null);
                  }}
                  className="bg-[#131313] w-full flex-grow outline-none text-lg"
                  value={createBounty?.imageUrl || ''}
                />
              </div>
              <div className="flex gap-3">
                <div className="bg-[#131313] p-2">
                  <p className="text-xs">Total Reward</p>
                  <input
                    onChange={({ target: { value } }) => {
                      setCreateBounty((prev) => {
                        return { ...prev, totalReward: value };
                      });
                      setIsFormComplete(null);
                    }}
                    className="bg-[#131313] w-full flex-grow outline-none text-lg"
                    value={createBounty?.totalReward || ''}
                  />
                </div>
                <div className="bg-[#131313] p-2">
                  <p className="text-xs">Reward per user</p>
                  <input
                    onChange={({ target: { value } }) => {
                      setCreateBounty((prev) => {
                        return { ...prev, reward: value };
                      });
                      setIsFormComplete(null);
                    }}
                    className="bg-[#131313] w-full flex-grow outline-none text-lg"
                    value={createBounty?.reward || ''}
                  />
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs pb-2">Token type</p>
                <div className="flex justify-between gap-2">
                  <button
                    onClick={() => {
                      setCreateBounty((prev) => {
                        return { ...prev, rewardType: 'ERC20_REWARD' };
                      });
                      setIsFormComplete(null);
                    }}
                    className={classnames(
                      'border-[1px] border-solid border-[#252525] w-full hover:bg-white hover:text-black',
                      { 'bg-white text-black': createBounty.rewardType === 'ERC20_REWARD' },
                    )}
                  >
                    ERC-20
                  </button>
                  <button
                    onClick={() => {
                      setTokenType('ERC-721');
                      setCreateBounty((prev) => {
                        return { ...prev, rewardType: 'ERC721_REWARD' };
                      });
                      setIsFormComplete(null);
                    }}
                    className={classnames(
                      'border-[1px] border-solid border-[#252525] w-full opacity-50 cursor-not-allowed',
                      { 'bg-white text-black': tokenType === 'ERC-721' },
                    )}
                    disabled
                  >
                    ERC-721
                  </button>
                  <button
                    onClick={() => {
                      setTokenType('ERC-1155');
                      setCreateBounty((prev) => {
                        return { ...prev, rewardType: 'ERC1155_REWARD' };
                      });
                      setIsFormComplete(null);
                    }}
                    className={classnames(
                      'border-[1px] border-solid border-[#252525] w-full opacity-50 cursor-not-allowed',
                      { 'bg-white text-black': tokenType === 'ERC-1155' },
                    )}
                    disabled
                  >
                    ERC-1155
                  </button>
                </div>
              </div>
              <div>
                <div className={classnames('bg-[#131313] p-2', { 'opacity-50': isUsingNativeToken })}>
                  <p className="text-xs">Token address</p>
                  <input
                    disabled={isUsingNativeToken}
                    className="bg-[#131313] w-full flex-grow outline-none text-lg"
                    onChange={({ target: { value } }) => {
                      setCreateBounty((prev) => {
                        return { ...prev, tokenAddress: value };
                      });
                      setIsFormComplete(null);
                    }}
                    value={createBounty?.tokenAddress}
                  />
                </div>
                <button
                  onClick={() => {
                    if (!isUsingNativeToken) {
                      // is false, will set to true
                      setTokenType('ERC-20');
                      setCreateBounty((prev) => {
                        return { ...prev, rewardType: 'ERC20_REWARD' };
                      });
                      setCreateBounty((prev) => {
                        return { ...prev, tokenAddress: '0x0000000000000000000000000000000000000000' };
                      });
                    } else {
                      setCreateBounty((prev) => {
                        return { ...prev, tokenAddress: '' };
                      });
                    }
                    setIsUsingNativeToken((prev) => !prev);
                    setIsFormComplete(null);
                  }}
                  className={classnames('border-[1px] border-solid border-[#252525] py-1 px-3 mt-2 bg-primary', {
                    'bg-primary text-white': isUsingNativeToken,
                    'bg-white text-black': !isUsingNativeToken,
                  })}
                >
                  {isUsingNativeToken ? 'Use another ERC20' : 'Use native token'}
                </button>
              </div>
            </div>
            <div className="border-b-[1px] border-solid border-[#252525] p-6">
              <button
                onClick={() => {
                  if (Object.keys(createBounty)?.length !== 6) {
                    setIsFormComplete(false);
                    return;
                  }
                }}
                className="border-[1px] border-solid border-[#252525] w-full py-3 hover:bg-white hover:text-black"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
