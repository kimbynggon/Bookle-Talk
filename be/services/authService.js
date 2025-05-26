const crypto = require("crypto");
const userDao = require("../dao/userDao");
const { User, Sequelize } = require("../models");
const { Op } = Sequelize;

const HASH_ITER = parseInt(process.env.HASH_ITER || "10000", 10);

function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, HASH_ITER, 64, "sha256").toString("hex");
}

exports.signup = async ({ userId, password, email, nickname }) => {
  const existingUser = await userDao.findByUserIdOrNickname(userId, nickname);
  if (existingUser) throw new Error("아이디 또는 닉네임이 이미 존재합니다.");

  const salt = generateSalt();
  const hashed = hashPassword(password, salt);
  const passwordWithSalt = `${salt}.${hashed}`;

  const newUser = await userDao.createUser({
    user_id: userId,
    password: passwordWithSalt,
    nickname,
  });

  return newUser;
};
exports.login = async ({ userId, password }) => {
    const user = await userDao.findByUserId(userId);
    if (!user) throw new Error("아이디 또는 비밀번호를 확인해주세요");
  
    const [salt, storedHash] = user.password.split(".");
    const inputHash = hashPassword(password, salt);
  
    if (inputHash !== storedHash) {
      throw new Error("아이디 또는 비밀번호를 확인해주세요");
    }
  
    return user;
  };


exports.isUserIdTaken = async (userId) => {
  const user = await userDao.findByUserId(userId);
  return !!user;  
};

exports.isNicknameTaken = async (nickname) => {
  const user = await userDao.findByNickname(nickname);
  return !!user;
};
