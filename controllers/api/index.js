const router = require('express').Router();

const user_routes = require('./user-routes');

router.use('/users', user_routes);

module.exports = router;