import { ethers } from 'ethers';
import { polygon, polygonZkEvm, base, mantle, scrollSepolia } from 'wagmi/chains';

export const networkMap = {
  MAINNET: {
    chainId: ethers.utils.hexValue(1), // '0x1'
  },
  POLYGON_MAINNET: {
    chainId: ethers.utils.hexValue(137), // '0x89'
    chainName: 'Matic (Polygon) Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://www.polygonscan.com/'],
  },
};

const baseABI = [
  {
    inputs: [{ internalType: 'address', name: '_trustedForwarder', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'addr', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'bountyId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' },
      { indexed: false, internalType: 'bytes32', name: 'rewardType', type: 'bytes32' },
      { indexed: false, internalType: 'address', name: 'tokenAddress', type: 'address' },
    ],
    name: 'ClaimedBounty',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'ownerOf', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'bountyId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'reward', type: 'uint256' },
      { indexed: false, internalType: 'bytes32', name: 'rewardType', type: 'bytes32' },
      { indexed: false, internalType: 'address', name: 'rewardAddress', type: 'address' },
    ],
    name: 'CreatedBounty',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'userAddress', type: 'address' },
      { indexed: false, internalType: 'address payable', name: 'relayerAddress', type: 'address' },
      { indexed: false, internalType: 'bytes', name: 'functionSignature', type: 'bytes' },
    ],
    name: 'MetaTransactionExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint64', name: 'requestId', type: 'uint64' },
      { indexed: false, internalType: 'contract ICircuitValidator', name: 'validator', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'schema', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'claimPathKey', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'operator', type: 'uint256' },
      { indexed: false, internalType: 'uint256[]', name: 'value', type: 'uint256[]' },
    ],
    name: 'NewBountyRequestSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'bytes32', name: 'previousAdminRole', type: 'bytes32' },
      { indexed: true, internalType: 'bytes32', name: 'newAdminRole', type: 'bytes32' },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'account', type: 'address' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'account', type: 'address' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  { stateMutability: 'payable', type: 'fallback' },
  {
    inputs: [],
    name: 'BOUNTY_MANAGER',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ERC1155_REWARD',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ERC20_REWARD',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ERC712_VERSION',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ERC721_REWARD',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'OWNER_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'VERIFY_REQUEST_ID',
    outputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'bountyId', type: 'uint256' },
      { internalType: 'uint256', name: 'totalRewards', type: 'uint256' },
      { internalType: 'address', name: 'tokenAddress', type: 'address' },
    ],
    name: 'addBountyBalance',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'addressToId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'bounties',
    outputs: [
      { internalType: 'uint256', name: 'bountyId', type: 'uint256' },
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'string', name: 'imageUrl', type: 'string' },
      { internalType: 'bytes32', name: 'rewardType', type: 'bytes32' },
      { internalType: 'uint256', name: 'reward', type: 'uint256' },
      { internalType: 'address', name: 'rewardAddress', type: 'address' },
      { internalType: 'address', name: 'payoutFrom', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'bountyBalance',
    outputs: [
      { internalType: 'address', name: 'ownerOf', type: 'address' },
      { internalType: 'uint256', name: 'balance', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'bountyIds',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'description', type: 'string' },
          { internalType: 'string', name: 'imageUrl', type: 'string' },
        ],
        internalType: 'struct IBounty.BountyInfo',
        name: 'info',
        type: 'tuple',
      },
      { internalType: 'string', name: 'rewardType', type: 'string' },
      { internalType: 'uint256', name: 'reward', type: 'uint256' },
      { internalType: 'uint256', name: 'totalRewards', type: 'uint256' },
      { internalType: 'address', name: 'tokenAddress', type: 'address' },
      {
        components: [
          { internalType: 'uint64', name: 'requestId', type: 'uint64' },
          { internalType: 'contract ICircuitValidator', name: 'validator', type: 'address' },
          { internalType: 'uint256', name: 'schema', type: 'uint256' },
          { internalType: 'uint256', name: 'claimPathKey', type: 'uint256' },
          { internalType: 'uint256', name: 'operator', type: 'uint256' },
          { internalType: 'uint256[]', name: 'value', type: 'uint256[]' },
        ],
        internalType: 'struct IBounty.ZKPBountyRequest',
        name: 'request',
        type: 'tuple',
      },
    ],
    name: 'createBounty',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  { inputs: [], name: 'emergencyWithdraw', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [
      { internalType: 'address', name: 'contractAddress', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'emergencyWithdrawERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'userAddress', type: 'address' },
      { internalType: 'bytes', name: 'functionSignature', type: 'bytes' },
      { internalType: 'bytes32', name: 'sigR', type: 'bytes32' },
      { internalType: 'bytes32', name: 'sigS', type: 'bytes32' },
      { internalType: 'uint8', name: 'sigV', type: 'uint8' },
    ],
    name: 'executeMetaTransaction',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllBounties',
    outputs: [{ internalType: 'bytes[]', name: '', type: 'bytes[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'bountyId', type: 'uint256' }],
    name: 'getBountyOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getChainId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getDomainSeperator',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getNonce',
    outputs: [{ internalType: 'uint256', name: 'nonce', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'bountyId', type: 'uint256' }],
    name: 'getRemainingBounty',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSupportedRequests',
    outputs: [{ internalType: 'uint64[]', name: 'arr', type: 'uint64[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint64', name: 'requestId', type: 'uint64' }],
    name: 'getZKPRequest',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'schema', type: 'uint256' },
          { internalType: 'uint256', name: 'claimPathKey', type: 'uint256' },
          { internalType: 'uint256', name: 'operator', type: 'uint256' },
          { internalType: 'uint256[]', name: 'value', type: 'uint256[]' },
          { internalType: 'uint256', name: 'queryHash', type: 'uint256' },
          { internalType: 'string', name: 'circuitId', type: 'string' },
        ],
        internalType: 'struct ICircuitValidator.CircuitQuery',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'idToAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'forwarder', type: 'address' }],
    name: 'isTrustedForwarder',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'pendingBountyProofs',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint64', name: '', type: 'uint64' },
    ],
    name: 'proofs',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  { inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
    name: 'requestQueries',
    outputs: [
      { internalType: 'uint256', name: 'schema', type: 'uint256' },
      { internalType: 'uint256', name: 'claimPathKey', type: 'uint256' },
      { internalType: 'uint256', name: 'operator', type: 'uint256' },
      { internalType: 'uint256', name: 'queryHash', type: 'uint256' },
      { internalType: 'string', name: 'circuitId', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
    name: 'requestValidators',
    outputs: [{ internalType: 'contract ICircuitValidator', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'bountyId', type: 'uint256' }],
    name: 'revokeBounty',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_treasury', type: 'address' }],
    name: 'setTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint64', name: 'requestId', type: 'uint64' },
      { internalType: 'contract ICircuitValidator', name: 'validator', type: 'address' },
      { internalType: 'uint256', name: 'schema', type: 'uint256' },
      { internalType: 'uint256', name: 'claimPathKey', type: 'uint256' },
      { internalType: 'uint256', name: 'operator', type: 'uint256' },
      { internalType: 'uint256[]', name: 'value', type: 'uint256[]' },
    ],
    name: 'setZKPRequest',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint64', name: 'requestId', type: 'uint64' },
      { internalType: 'contract ICircuitValidator', name: 'validator', type: 'address' },
      { internalType: 'uint256', name: 'schema', type: 'uint256' },
      { internalType: 'uint256', name: 'claimPathKey', type: 'uint256' },
      { internalType: 'uint256', name: 'operator', type: 'uint256' },
      { internalType: 'uint256[]', name: 'value', type: 'uint256[]' },
      { internalType: 'uint256', name: 'queryHash', type: 'uint256' },
    ],
    name: 'setZKPRequestRaw',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint64', name: 'requestId', type: 'uint64' },
          { internalType: 'uint256', name: 'bountyId', type: 'uint256' },
        ],
        internalType: 'struct IZKPVerifier.SubmitResponse',
        name: 'request',
        type: 'tuple',
      },
      { internalType: 'uint256[]', name: 'inputs', type: 'uint256[]' },
      { internalType: 'uint256[2]', name: 'a', type: 'uint256[2]' },
      { internalType: 'uint256[2][2]', name: 'b', type: 'uint256[2][2]' },
      { internalType: 'uint256[2]', name: 'c', type: 'uint256[2]' },
    ],
    name: 'submitZKPResponse',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_bountyId', type: 'uint256' },
    ],
    name: 'testFulfillBounty',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'treasury',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
];

export const chainIdToContractMapping = {
  [polygon.id]: {
    url: 'https://polygonscan.com/address/0xeb825C7276255471be49551F3136b7095E45BCFf#code',
    address: '0xeb825C7276255471be49551F3136b7095E45BCFf',
    abi: baseABI,
  },
  [polygonZkEvm.id]: {
    url: 'https://zkevm.polygonscan.com/address/0x77Ee16210Ef96AcD38370ec64494907B5C41Cbee',
    address: '0x77Ee16210Ef96AcD38370ec64494907B5C41Cbee',
    abi: baseABI,
  },
  [mantle.id]: {
    url: 'https://explorer.mantle.xyz/address/0x77Ee16210Ef96AcD38370ec64494907B5C41Cbee',
    address: '0x77Ee16210Ef96AcD38370ec64494907B5C41Cbee',
    abi: baseABI,
  },
  [base.id]: {
    url: 'https://basescan.org/address/0x9daF11eD636Bc02be5d7e9414Eb8C4f3724CC5DD#code',
    address: '0x9daF11eD636Bc02be5d7e9414Eb8C4f3724CC5DD',
    abi: baseABI,
  },
  [scrollSepolia.id]: {
    url: 'https://sepolia.scrollscan.dev/address/0x77Ee16210Ef96AcD38370ec64494907B5C41Cbee',
    address: '0x77Ee16210Ef96AcD38370ec64494907B5C41Cbee',
    abi: baseABI,
  },
};
