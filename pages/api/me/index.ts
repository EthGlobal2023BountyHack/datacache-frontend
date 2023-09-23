import jwt from 'jsonwebtoken';
import { setTokenCookie } from '@lib/jwt';
import { cors, sessionCookie } from '@lib/middleware';
import { connect } from '@planetscale/database';

const conn = connect({
  url: process.env.DATABASE_URL,
});

const me = async (req, res) => {
  try {
    let token = req.cookies.token;
    let user = jwt.verify(token, process.env.JWT_SECRET);

    const { rows } = await conn.execute(`select * from users where id = ? limit 1`, [user.id]);
    const dbUser = rows[0];

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Refresh JWT
    let newToken = jwt.sign(
      {
        // @ts-ignore
        ...user,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      },
      process.env.JWT_SECRET,
    );

    setTokenCookie(res, newToken);

    return res.json({
      user: dbUser,
    });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const handler = async (req, res) => {
  const { method } = req;
  switch (method) {
    case 'GET':
      await me(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'OPTIONS']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default sessionCookie(cors(handler));
