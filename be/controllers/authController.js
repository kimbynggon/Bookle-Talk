
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
