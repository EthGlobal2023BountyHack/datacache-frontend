import jwt from 'jsonwebtoken';

const authUser = (fn) => async (req, res) => {
  if (!req.cookies.token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
  }

  const user = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
  if (user?.issuer.indexOf('did:ethr') === 0 && !user?.publicAddress) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }
  // Add user into req
  req.user = user;
  return await fn(req, res);
};

export default authUser;
