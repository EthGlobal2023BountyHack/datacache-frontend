import { connect } from '@planetscale/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cors } from '@lib/middleware';
import { setTokenCookie } from '@lib/jwt';
import { GET_USER } from '@lib/queries/users';

const conn = connect({
  url: process.env.DATABASE_URL,
});

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(422).json({
        error: 'Email is required.',
      });
    } else if (!password) {
      return res.status(422).json({
        error: 'Password is required.',
      });
    }

    const { rows } = await conn.execute(GET_USER, [email]);
    const dbUser = rows[0];

    if (!dbUser) {
      return res.status(404).json({
        error: 'User not found.',
      });
    }

    const isValid = await bcrypt.compare(password, dbUser.password);
    if (!isValid) {
      return res.status(404).json({
        error: 'User not found.',
      });
    }

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const metadata = {
      id: dbUser.id,
      issuer: dbUser.id,
      publicAddress: dbUser.ethAddress,
      connectedAddress: dbUser.ethAddress,
      wallets: [dbUser.ethAddress],
      exp,
      avatarUrl: dbUser.avatarUrl,
      displayName: dbUser.displayName,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
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
      await login(req, res);
      break;
    default:
      res.setHeader('Allow', ['POST', 'OPTIONS']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default cors(handler);
