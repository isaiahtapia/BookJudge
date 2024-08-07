const User = require('./User');
const Review = require('./Review');

// Define associations after importing both models
User.hasMany(Review, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});
Review.belongsTo(User, {
  foreignKey: 'userId',
});

module.exports = { User, Review };
