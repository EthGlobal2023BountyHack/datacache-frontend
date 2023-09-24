import { Layout, toast } from '@/components';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { chainIdToContractMapping } from '@lib/constants';
import { ethers } from 'ethers';
import { useContractRead, useNetwork, useWalletClient } from 'wagmi';
import {
  toHex,
  encodeFunctionData,
  createPublicClient,
  http,
  parseEther,
  createWalletClient,
  custom,
  formatEther,
} from 'viem';
import BountyCard from '@/components/layouts/BountyCard';
import { TfiSearch, TfiPlus, TfiClose } from 'react-icons/tfi';
import classnames from 'classnames';
import { IBundler, Bundler } from '@biconomy/bundler';
import { BiconomySmartAccount, BiconomySmartAccountConfig, DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy/account';
import { IPaymaster, BiconomyPaymaster, PaymasterMode } from '@biconomy/paymaster';
import { ChainId } from '@biconomy/core-types';
import { base, mantle, polygon, polygonZkEvm, scrollSepolia } from 'wagmi/chains';
import { getWalletClient, getPublicClient, waitForTransaction } from '@wagmi/core';

function useSimpleAccountOwner() {
  const walletClientQuery = useWalletClient();

  // We need this to by pass a viem bug https://github.com/wagmi-dev/viem/issues/606
  const signMessage = useCallback(
    (data: string | Uint8Array) =>
      walletClientQuery.data!.request({
        // ignore the type error here, it's a bug in the viem typing
        // @ts-ignore
        method: 'personal_sign',
        // @ts-ignore
        params: [toHex(data), walletClientQuery.data?.account?.address],
      }),
    [walletClientQuery.data],
  );

  const getAddress = useCallback(() => walletClientQuery.data?.account?.address, [walletClientQuery.data]);

  if (walletClientQuery.isLoading) {
    return {
      isLoading: true,
      owner: undefined,
    };
  }
  return { isLoading: false, owner: { signMessage, getAddress } };
}

const useBounty = ({ onSuccess }) => {
  const { chain } = useNetwork();
  const { isLoading, owner: signer } = useSimpleAccountOwner();

  const biconomyAccount =
    chain?.id === ChainId.POLYGON_MAINNET
      ? new BiconomySmartAccount({
          signer,
          chainId: ChainId.POLYGON_MAINNET,
          rpcUrl: process.env.NEXT_PUBLIC_PROVIDER_L2_URL,
          paymaster: new BiconomyPaymaster({
            paymasterUrl: 'https://paymaster.biconomy.io/api/v1/137/pQ4YfSfVI.5f85bc99-110a-4594-9629-5f5c5ddacded',
          }),
          bundler: new Bundler({
            bundlerUrl: 'https://bundler.biconomy.io/api/v2/137/BB897hJ89.dd7fopYh-iJkl-jI89-af80-6877f74b7Fcg',
            chainId: ChainId.POLYGON_MAINNET,
            entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
          }),
          entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
        })
      : null;

  const marketplaceContract = chainIdToContractMapping[chain?.id];

  const checkSmartWalletAssociation = async ({ smartAccount }) => {
    const polygonClient = createPublicClient({
      chain: polygon,
      transport: http(process.env.NEXT_PUBLIC_PROVIDER_L2_URL),
    });

    const smartAccountAddress = await smartAccount.getSmartAccountAddress();

    console.log(smartAccountAddress);

    // // Set up smart wallet association if different than expected
    // if (!smartAccountAddress) {
    //   toast.info(`Setting up smart wallet permissions for EOA: ${smartAccount.owner}`);
    //
    //   const publicClient = getPublicClient({
    //     chainId: polygon.id,
    //   });
    //
    //   const { request } = await publicClient.simulateContract({
    //     address: marketplaceContract.address,
    //     abi: marketplaceContract.abi,
    //     functionName: 'associateOperatorAsOwner',
    //     args: [smartAccountAddress],
    //     account: {
    //       address: signer.getAddress(),
    //     },
    //   });
    //
    //   const walletClient = await getWalletClient({
    //     chainId: polygon.id,
    //   });
    //
    //   const hash = await walletClient.writeContract(request);
    //
    //   const receipt = await waitForTransaction({
    //     hash,
    //   });
    //
    //   toast.success(`Created smart wallet: ${smartAccountAddress}...continuing...`);
    // }
  };

  const createRequest = (validator) => {
    const Operators = {
      NOOP: 0, // No operation, skip query verification in circuit
      EQ: 1, // equal
      LT: 2, // less than
      GT: 3, // greater than
      IN: 4, // in
      NIN: 5, // not in
      NE: 6, // not equal
    };

    // Set up the proof request
    const schemaBigInt = '74977327600848231385663280181476307657';

    // merklized path to field in the W3C credential according to JSONLD  schema e.g. birthday in the KYCAgeCredential under the url "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld"
    const schemaClaimPathKey = '20376033832371109177683048456014525905119173674985843915445634726167450989630';

    const requestId = 1;

    const query = {
      schema: schemaBigInt,
      claimPathKey: schemaClaimPathKey,
      operator: Operators.LT, // operator
      value: [20020101, ...new Array(63).fill(0).map((i) => 0)], // for operators 1-3 only first value matters
    };

    return [requestId, validator, query.schema, query.claimPathKey, query.operator, query.value];
  };

  return {
    actions: {
      onCreateBounty: async (values) => {
        try {
          const validatorByChain = {
            [polygon.id]: '0xEC1f49f41A0313c5437Ee399fa44dAFFe56E7eE0',
            [polygonZkEvm.id]: '0xC3DCf42828ACE92ceA54B79dBA0Abd3b8bE4ff2d',
            [mantle.id]: '0xC3DCf42828ACE92ceA54B79dBA0Abd3b8bE4ff2d',
            [base.id]: '0xE5179B37De3010506fCb94549e304306D3A4B335',
            [scrollSepolia.id]: '0xC3DCf42828ACE92ceA54B79dBA0Abd3b8bE4ff2d',
          };

          if (false) {
            const smartAccount = await biconomyAccount?.init();
            await checkSmartWalletAssociation({ smartAccount });

            // const publicClient = getPublicClient({
            //   chainId: polygon.id,
            // });
            //
            // const { request } = await publicClient.simulateContract({
            //   address: marketplaceContract.address,
            //   abi: marketplaceContract.abi,
            //   functionName: 'setApprovalForAll',
            //   args: [marketplaceContract.address, true],
            //   account: {
            //     address: signer.getAddress(),
            //   },
            // });
            //
            // const walletClient = await getWalletClient({
            //   chainId: polygon.id,
            // });
            //
            // toast.info('Setting up token approvals...');
            //
            // const hash = await walletClient.writeContract(request);
            //
            // const receipt = await waitForTransaction({
            //   hash,
            // });

            const callData = encodeFunctionData({
              abi: marketplaceContract.abi,
              functionName: 'createBounty',
              args: [
                [values.name, values.description, values.imageUrl],
                'ERC20_REWARD',
                parseEther(String(values.reward)),
                parseEther(String(values.totalReward)),
                values.tokenAddress,
                // MTP validator
                createRequest(validatorByChain[chain?.id]),
              ],
            });

            const partialUserOp = await smartAccount.buildUserOp([
              {
                to: marketplaceContract.address,
                data: callData,
                value: parseEther(String(values.totalReward)),
              },
            ]);

            const { paymasterAndData } = await smartAccount.paymaster.getPaymasterAndData(partialUserOp, {
              mode: PaymasterMode.SPONSORED,
            });

            partialUserOp.paymasterAndData = paymasterAndData;

            const userOpResponse = await smartAccount.sendUserOp(partialUserOp);

            await toast.promise(userOpResponse.wait(), {
              pending: 'Creating data bounty...please wait...',
              success: 'Bounty has been created',
              error: 'There was an error',
            });
          } else {
            const publicClient = getPublicClient({
              chainId: chain.id,
            });

            console.log(values);

            const createArgs = [
              [values.name, values.description, values.imageUrl],
              'ERC20_REWARD',
              parseEther(String(values.reward)),
              parseEther(String(values.totalReward)),
              values.tokenAddress,
              // MTP validator
              createRequest(validatorByChain[chain?.id]),
            ];

            const { request } = await publicClient.simulateContract({
              address: marketplaceContract.address,
              abi: marketplaceContract.abi,
              functionName: 'createBounty',
              args: createArgs,
              account: {
                address: signer.getAddress(),
              },
              value: parseEther(String(values.totalReward)),
            });

            const walletClient = await getWalletClient({
              chainId: chain.id,
            });

            const hash = await walletClient.writeContract(request);

            toast.info('Creating bounty....');

            const receipt = await waitForTransaction({
              hash,
            });

            toast.info(`Created bounty!`);

            onSuccess();
          }
        } catch (e) {
          console.log(e);
          toast.error('There was an error. Please try again!');
        }
      },
    },
  };
};

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
    refetch,
  } = useContractRead({
    address: marketplaceContract?.address,
    abi: marketplaceContract?.abi,
    functionName: 'getAllBounties',
    chainId: currentChain?.id,
  });

  const { actions } = useBounty({
    onSuccess: async () => {
      await refetch();
      setShowModal(false);
    },
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
    return bounties?.filter(({ rewardTotal }) => rewardTotal > 0n);
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
                onClick={async () => {
                  await actions?.onCreateBounty(createBounty);
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
