const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const header = req.headers.authorization;

  console.log("Authorization Header:", header);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  if (!header) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = header.split(' ')[1];

  console.log("Received Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT Verify Error:", err.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = auth;