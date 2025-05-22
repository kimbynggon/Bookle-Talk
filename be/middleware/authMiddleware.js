const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader)
  if (!authHeader) return res.status(401).json({ message: "토큰 없음" }),console.log(authHeader);

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "토큰 형식 오류" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "유효하지 않은 토큰" });
  }
};

module.exports = authMiddleware;

