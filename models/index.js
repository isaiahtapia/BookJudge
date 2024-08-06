const User = require('./User');
const Review = require('./Review');

// Ensure the associations are established
User.hasMany(Review, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
Review.belongsTo(User, {
  foreignKey: 'userId'
});

module.exports = { User, Review };
