import { FunctionComponent, ComponentProps } from 'react';
import { SIWEProvider } from 'connectkit';
import { ethers } from 'ethers';
import type { IncomingMessage, ServerResponse } from 'http';
import { getIronSession, IronSession, IronSessionOptions } from 'iron-session';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { generateNonce, SiweErrorType, SiweMessage } from 'siwe';
import { mainnet } from 'wagmi';
import { getSignMessageLibDeployment } from '@safe-global/safe-deployments';

type RouteHandlerOptions = {
  afterNonce?: (req: NextApiRequest, res: NextApiResponse, session: NextSIWESession<{}>) => Promise<void>;
  afterVerify?: (req: NextApiRequest, res: NextApiResponse, session: NextSIWESession<{}>) => Promise<void>;
  afterSession?: (req: NextApiRequest, res: NextApiResponse, session: NextSIWESession<{}>) => Promise<void>;
  afterLogout?: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
};
type NextServerSIWEConfig = {
  session?: Partial<IronSessionOptions>;
  options?: RouteHandlerOptions;
};
type NextClientSIWEConfig = {
  apiRoutePrefix: string;
  statement?: string;
};

type NextSIWESession<TSessionData extends Object = {}> = IronSession &
  TSessionData & {
    nonce?: string;
    address?: string;
    chainId?: number;
  };

type NextSIWEProviderProps = Omit<
  ComponentProps<typeof SIWEProvider>,
  | 'getNonce'
  | 'createMessage'
  | 'verifyMessage'
  | 'getSession'
  | 'signOut'
  | 'data'
  | 'signIn'
  | 'status'
  | 'resetStatus'
>;

type ConfigureServerSIWEResult<TSessionData extends Object = {}> = {
  apiRouteHandler: NextApiHandler;
  getSession: (req: IncomingMessage, res: ServerResponse) => Promise<NextSIWESession<TSessionData>>;
};

type ConfigureClientSIWEResult<TSessionData extends Object = {}> = {
  Provider: FunctionComponent<NextSIWEProviderProps>;
};

export const getSession = async <TSessionData extends Object = {}>(
  req: IncomingMessage,
  res: any, // ServerResponse<IncomingMessage>,
  sessionConfig: IronSessionOptions,
) => {
  return (await getIronSession(req, res, sessionConfig)) as NextSIWESession<TSessionData>;
};

const logoutRoute = async (
  req: NextApiRequest,
  res: NextApiResponse<void>,
  sessionConfig: IronSessionOptions,
  afterCallback?: RouteHandlerOptions['afterLogout'],
) => {
  switch (req.method) {
    case 'GET':
      const session = await getSession(req, res, sessionConfig);
      session.destroy();
      if (afterCallback) {
        await afterCallback(req, res);
      }
      res.status(200).end();
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

const nonceRoute = async (
  req: NextApiRequest,
  res: NextApiResponse<string>,
  sessionConfig: IronSessionOptions,
  afterCallback?: RouteHandlerOptions['afterNonce'],
) => {
  switch (req.method) {
    case 'GET':
      const session = await getSession(req, res, sessionConfig);
      if (!session.nonce) {
        session.nonce = generateNonce();
        await session.save();
      }
      if (afterCallback) {
        await afterCallback(req, res, session);
      }
      res.send(session.nonce);
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

const sessionRoute = async (
  req: NextApiRequest,
  res: NextApiResponse<{ address?: string; chainId?: number }>,
  sessionConfig: IronSessionOptions,
  afterCallback?: RouteHandlerOptions['afterSession'],
) => {
  switch (req.method) {
    case 'GET':
      const session = await getSession(req, res, sessionConfig);
      if (afterCallback) {
        await afterCallback(req, res, session);
      }
      const { address, chainId } = session;
      res.send({ address, chainId });
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

async function verifyGnosisSignature(walletAddress: string, message: string) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_PROVIDER_URL);

  // check if exists on network first
  const byteCode = await provider.getCode(walletAddress);
  if (!byteCode || ethers.utils.hexStripZeros(byteCode) == '0x') {
    return false;
  }

  const gnosisSafeDeployment = getSignMessageLibDeployment({
    network: mainnet.id.toString(),
  });

  if (!gnosisSafeDeployment) {
    return false;
  }

  const gnosisSafeContract = new ethers.Contract(walletAddress, gnosisSafeDeployment?.abi, provider);

  const messageHash = ethers.utils.hashMessage(message);
  // this is the message hash that would be emitted in the event SignMsg
  const gnosisMessageHash = await gnosisSafeContract.getMessageHash(messageHash);

  let timeout: NodeJS.Timeout;

  const waitForSignedEvent = new Promise<boolean>((resolve, reject) => {
    const onMultiSigSigned = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    timeout = setTimeout(() => {
      gnosisSafeContract.removeListener('SignMsg', onMultiSigSigned);
      reject(false);
    }, 60000); // 60 seconds

    gnosisSafeContract.on('SignMsg', async (msgHash) => {
      if (msgHash == gnosisMessageHash) {
        onMultiSigSigned();
      }
    });
  });

  waitForSignedEvent
    .then(async (value) => {
      if (value) {
        return value;
      }
      return false;
    })
    .catch((err) => {
      console.error(err);
      return false;
    });
  return await waitForSignedEvent;
}

const verifyRoute = async (
  req: NextApiRequest,
  res: NextApiResponse<void>,
  sessionConfig: IronSessionOptions,
  afterCallback?: RouteHandlerOptions['afterVerify'],
) => {
  switch (req.method) {
    case 'POST':
      try {
        const session = await getSession(req, res, sessionConfig);
        const { message, signature } = req.body;
        const siweMessage = new SiweMessage(message);

        if (signature === '0x') {
          const isValidSignature = await verifyGnosisSignature(siweMessage.address, siweMessage.prepareMessage());
          if (isValidSignature) {
            session.address = siweMessage.address;
            session.chainId = 1;
            await session.save();
            if (afterCallback) {
              await afterCallback(req, res, session);
            }
            return res.status(200).end();
          }
        } else {
          const { data: fields } = await siweMessage.verify({
            signature,
            nonce: session.nonce,
          });
          if (fields.nonce !== session.nonce) {
            return res.status(422).end('Invalid nonce.');
          }
          session.address = fields.address;
          session.chainId = fields.chainId;
          await session.save();
          if (afterCallback) {
            await afterCallback(req, res, session);
          }
          return res.status(200).end();
        }
      } catch (error) {
        switch (error) {
          case SiweErrorType.INVALID_NONCE:
          case SiweErrorType.INVALID_SIGNATURE: {
            res.status(422).end(String(error));
            break;
          }
          default: {
            res.status(400).end(String(error));
            break;
          }
        }
      }
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export const sessionConfig: IronSessionOptions = {
  cookieName: 'datacache-siwe',
  password: process.env.JWT_SECRET,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

const apiRouteHandler: NextApiHandler = async (req, res) => {
  if (!(req.query.route instanceof Array)) {
    throw new Error(
      'Catch-all query param `route` not found. SIWE API page should be named `[...route].ts` and within your `pages/api` directory.',
    );
  }

  const route = req.query.route.join('/');
  switch (route) {
    case 'nonce':
      return await nonceRoute(req, res, sessionConfig, null);
    case 'verify':
      return await verifyRoute(req, res, sessionConfig, null);
    case 'session':
      return await sessionRoute(req, res, sessionConfig, null);
    case 'logout':
      return await logoutRoute(req, res, sessionConfig, null);
    default:
      return res.status(404).end();
  }
};

export default apiRouteHandler;
