const { User, Sequelize } = require("../models"); 
const { Op } = Sequelize; 

exports.findByUserIdOrNickname = async (userId, nickname) => {
    return await User.findOne({
      where: {
        [Op.or]: [{ user_id: userId }, { nickname }],
      },
    });
  };
  
  exports.findByUserId = async (userId) => {
    return await User.findOne({ where: { user_id: userId } });
  };
  
  exports.createUser = async (userData) => {
    return await User.create(userData);
  };


exports.findByUserId = async (userId) => {
  return await User.findOne({ where: { user_id: userId } });
};

exports.findByNickname = async (nickname) => {
  return await User.findOne({ where: { nickname } });
};
