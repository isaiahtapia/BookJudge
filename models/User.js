const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const Review = require('./Review');
const bcrypt = require('bcrypt');

class User extends Model {
  async validatePassword(formPassword) {
    return await bcrypt.compare(formPassword, this.password);
  }
}

User.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: 6
      }
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
    }
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'User',
    hooks: {
      async beforeCreate(user){
        user.password = await bcrypt.hash(user.password, 10);
        return user;
      }
    }
  }
);

User.hasMany(Review, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

module.exports = User;
