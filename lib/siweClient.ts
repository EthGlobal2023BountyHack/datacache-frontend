import { configureClientSIWE } from 'connectkit-next-siwe';

export const siweClient = configureClientSIWE({
  apiRoutePrefix: '/api/siwe', // Your API route directory
  statement: "This website wants you to 'Sign In With Ethereum' (SIWE) to prove you control this wallet.",
});
