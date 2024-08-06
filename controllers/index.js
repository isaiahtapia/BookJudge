const router = require('express').Router();
const apiRoutes = require('./api');
const viewRoutes = require('./view-routes');
const userRoutes = require('./user-routes');
const reviewRoutes = require('./review-routes'); // Ensure you include this

router.use('/', viewRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes); // Ensure you use this
router.use('/api', apiRoutes);

router.use((req, res) => {
  res.send("<h1>Wrong Route!</h1>");
});

module.exports = router;
