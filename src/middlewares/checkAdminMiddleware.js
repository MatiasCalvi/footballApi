import HTTP_STATUS from '../helpers/httpstatus.js';
import { isAdmin } from '../utils/roleUtils.js';

const checkAdminMiddleware = (req, res, next) => {
  if (req.user && !isAdmin(req.user.rolId)) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

export default checkAdminMiddleware;

