import { connect } from '@planetscale/database';
import jwt from 'jsonwebtoken';
import { cors } from '@lib/middleware';
import { setTokenCookie } from '@lib/jwt';
import { CREATE_USER, GET_USER, SET_EMAIL_ADDRESS } from '@lib/queries/users';

const conn = connect({
  url: process.env.DATABASE_URL,
});

const connectWallet = async (req, res) => {
  try {
    const { address, chainId, email } = req.body;

    if (!chainId) {
      return res.status(422).json({
        error: 'Chain Id is required. Only supporting Ethereum at the moment.',
      });
    } else if (!address) {
      return res.status(422).json({
        error: 'Address is required.',
      });
    }

    let initialSignUp = false;

    // TODO: Create polygon id
    const issuer = `did:ethr:${address}`;
    const { rows } = await conn.execute(GET_USER, [issuer]);

    // Create / Sync record user record from auth upstream
    if (!rows[0]) {
      await conn.execute(CREATE_USER, [issuer, email || '', address]);
      initialSignUp = true;
    } else if (email) {
      // Check email
      await conn.execute(SET_EMAIL_ADDRESS, [email, issuer]);
    }

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;

    const { rows: newRows } = await conn.execute(GET_USER, [issuer]);

    const metadata = {
      issuer: issuer,
      publicAddress: address,
      connectedAddress: address,
      wallets: [address],
      isDelegate: false,
      chainId,
      exp,
      initialSignUp,
      ...newRows[0],
    };

    const token = jwt.sign(metadata, process.env.JWT_SECRET);

    setTokenCookie(res, token);

    return res.json({ isAuthenticated: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, isAuthenticated: false });
  }
};

const handler = async (req, res) => {
  const { method } = req;
  switch (method) {
    case 'POST':
      await connectWallet(req, res);
      break;
    default:
      res.setHeader('Allow', ['POST', 'OPTIONS']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default cors(handler);
