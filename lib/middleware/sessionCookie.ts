const sessionCookie = (fn) => async (req, res) => {
  if (!req.cookies.token) {
    res.status(403).end();
    return;
  }
  return await fn(req, res);
};

export default sessionCookie;
