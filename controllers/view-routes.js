const router = require('express').Router();
const { User, Review } = require('../models');
const { withAuth } = require('../js/auth');

// OLD Guest Redirect function
// function redirectGuest(req, res, next) {
//     if (!req.session.user_id) {
//         return res.redirect('/login');
//     }
//     next();
// }

router.get('/', async (req, res) => {
    try {
        // Fetch the 10 most recent reviews
        const recentReviews = await Review.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, attributes: ['username'] }]
        });

        const reviews = recentReviews.map(review => review.get({ plain: true }));

        res.render('homepage', {
            user: req.session.user_id ? await User.findByPk(req.session.user_id) : null,
            reviews
        });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

router.get('/register', async (req, res) => {
    res.render('register');
});

router.get('/login', async (req, res) => {
    res.render('login');
});

router.get('/reviews', withAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.session.user_id, {
            include: [{ model: Review }]
        });

        // Ensure we correctly get the reviews
        const reviews = user.Reviews ? user.Reviews.map(review => review.get({ plain: true })) : [];

        res.render('reviews', {
            user: user.get({ plain: true }),
            reviews
        });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

router.get('/write-review', withAuth, async (req, res) => {
    res.render('write-review', { user: req.session.user_id ? await User.findByPk(req.session.user_id) : null });
});

module.exports = router;
