import { connect } from '@planetscale/database';
import { toSqlDatetime } from '@lib/formatting';
import { authUser, cors, sessionCookie } from '@lib/middleware';
import { GET_USER, SET_MAIN_INFO } from '@lib/queries/users';

const conn = connect({
  url: process.env.DATABASE_URL,
});

const inputError = ({ displayName }) => {
  const error = '';
  // TODO: validate data
  return error;
};

// TODO: normalize numbers
const normalizeData = (body, dbUser) => {
  const { firstName, lastName, displayName, ethAddress } = body;
  return {
    firstName: firstName === null ? null : firstName || dbUser.firstName,
    lastName: lastName === null ? null : lastName || dbUser.lastName,
    displayName: displayName === null ? null : displayName || dbUser.displayName,
    ethAddress: ethAddress === null ? null : ethAddress || dbUser.ethAddress,
  };
};

const updateUserInfo = async (req, res) => {
  try {
    const error = inputError(req.body);

    if (error) {
      return res.status(422).json({
        success: false,
        error,
      });
    }

    const { rows } = await conn.execute(GET_USER, [req.user?.id]);
    const dbUser = rows[0];

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const { firstName, lastName, displayName, ethAddress } = normalizeData(req.body, dbUser);

    const { rowsAffected } = await conn.execute(SET_MAIN_INFO, [
      firstName,
      lastName,
      displayName,
      ethAddress,
      toSqlDatetime(new Date()),
      dbUser.id,
    ]);

    return res.json({
      success: rowsAffected > 0,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

const handler = async (req, res) => {
  const { method } = req;
  switch (method) {
    case 'POST':
      await updateUserInfo(req, res);
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default authUser(sessionCookie(cors(handler)));
