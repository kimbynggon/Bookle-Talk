const authService = require("../services/authService");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json({ message: "회원가입 성공", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.login = async (req, res) => {
  try {
    const user = await authService.login(req.body);

 
    const token = jwt.sign(
      {
        id: user.id,
        user_id: user.user_id,
        nickname: user.nickname,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.status(200).json({
      message: "로그인 성공",
      token,         
      user,
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
// 중복체크
exports.checkUserId = async (req, res) => {
  try {
    const { userId } = req.query || {};

    if (!userId) {
      return res.status(400).json({ message: "ID를 입력해주세요" });
    }

    const exists = await authService.isUserIdTaken(userId);

    if (exists) {
      return res.status(409).json({ message: "이미 사용 중인 아이디입니다." });
    }

    return res.status(200).json({ message: "사용 가능한 아이디입니다." });
  } catch (err) {
    console.error("checkUserId error:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

exports.checkNickname = async (req, res) => {
  const { nickname } = req.query;

  if (!nickname) return res.status(400).json({ message: "닉네임을 입력해주세요" });

  const exists = await authService.isNicknameTaken(nickname);
  if (exists) {
    return res.status(409).json({ message: "이미 사용 중인 닉네임입니다." });
  }

  return res.status(200).json({ message: "사용 가능한 닉네임입니다." });
};