const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const User = require('./User'); // Ensure this path is correct

class Review extends Model {}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    bookId: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    modelName: 'Review'
  }
);

// Define the association
Review.belongsTo(User, {
  foreignKey: 'userId'
});

module.exports = Review;
