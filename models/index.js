const User = require('./User');
const Review = require('./Review');

// Establish associations
User.hasMany(Review, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
Review.belongsTo(User, {
  foreignKey: 'userId'
});

module.exports = { User, Review };
