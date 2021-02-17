export const authenticateUser = (req, res, next) => {
  // For the time being we will bypass this.
  // TODO: Remove next line and finish implementation.
  return next();
  // TODO: Check against database.
  try {
    const { authorization } = req.headers;
    if (!authorization)
      return res
        .status(403)
        .json({ error: "Not Authorized to access this route." });
    const creds = {
      username: Buffer.from(authorization.split(" ").pop(), "base64")
        .toString()
        .split(":")[0],
      password: Buffer.from(authorization.split(" ").pop(), "base64")
        .toString()
        .split(":")
        .pop(),
    };
    try {
      // TODO: connect to database and check against `creds.username` and `creds.password`
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};
