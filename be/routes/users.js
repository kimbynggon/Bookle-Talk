const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "프로필 정보",
    user: req.user, // verifyToken에서 디코딩된 토큰 정보
  });
});

module.exports = router;
