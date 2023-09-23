import { cors } from '@lib/middleware';
import { removeTokenCookie } from '@lib/jwt';

const logout = async (req, res) => {
  try {
    if (!req.cookies.token) {
      return res.redirect('/');
    }
    removeTokenCookie(res);
    return res.redirect('/');
  } catch (error) {
    return res.status(401).json({ message: 'User is not logged in' });
  }
};

const handler = async (req, res) => {
  const { method } = req;
  switch (method) {
    case 'GET':
      await logout(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'OPTIONS']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default cors(handler);
