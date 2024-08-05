const router = require('express').Router();
const apiRoutes = require('./api');
const view_routes = require('./view-routes');
const user_routes = require('./user-routes');

router.use('/', [view_routes, user_routes]);
router.use('/api', apiRoutes);

router.use((req, res) => {
  res.send("<h1>Wrong Route!</h1>")
});

module.exports = router;