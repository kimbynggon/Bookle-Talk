const authService = require("../services/authService");

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
    res.status(200).json({ message: "로그인 성공", user });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
