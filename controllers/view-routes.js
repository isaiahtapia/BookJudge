const router = require('express').Router();
const { User, Review } = require('../models');

function redirectGuest(req, res, next) {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }
    next();
}

router.get('/', async (req, res) => {
    res.render('homepage', { user: req.session.user_id ? await User.findByPk(req.session.user_id) : null });
});

router.get('/register', async (req, res) => {
    res.render('register');
});

router.get('/login', async (req, res) => {
    res.render('login');
});

router.get('/reviews', redirectGuest, async (req, res) => {
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



router.get('/write-review', redirectGuest, async (req, res) => {
    res.render('write-review', { user: req.session.user_id ? await User.findByPk(req.session.user_id) : null });
});

module.exports = router;
