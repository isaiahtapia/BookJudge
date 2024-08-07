const router = require('express').Router();
const { Op, literal} = require('sequelize'); 
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
            attributes: {
                include: [
                    [literal(`to_char("created_at", 'Mon DD YYYY')`), 'formattedDate'],
                    'id',
                    'bookId',
                    'review',
                    'userId'
                ]
            },
            include: [{
                model: User,
                    attributes: ['username']
            }]
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
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    try {
        const user = await User.findByPk(req.session.user_id, {
            include: [{
                model: Review,
                where: {
                    [Op.or]: [
                        { bookId: { [Op.like]: `%${search}%` } },
                        { review: { [Op.like]: `%${search}%` } }
                    ]
                },
                limit,
                offset,
                attributes: {
                    include: [
                        [literal(`to_char("created_at", 'Mon DD YYYY')`), 'formattedDate'],
                        'id',
                        'bookId',
                        'review',
                        'userId'
                    ]
                }
            }]
        });

        const reviews = user.Reviews ? user.Reviews.map(review => review.get({ plain: true })) : [];

        const rawCount = await Review.count({
            where: {
                userId: req.session.user_id,
                [Op.or]: [
                    { bookId: { [Op.like]: `%${search}%` } },
                    { review: { [Op.like]: `%${search}%` } }
                ]
            }
        }) / limit

        const count =  Math.ceil(rawCount)

        res.render('reviews', {
            user: user.get({ plain: true }),
            reviews,
            multiPage: page > 1,
            showNext: page < count,
            pagination: {
                current: page,
                total: count,
            },
            search
        });
    } catch (err) {
        console.error('\n\nREVIEWS ERROR\n\n' + err);
        res.status(500).json(err);
    }
});


router.get('/write-review', withAuth, async (req, res) => {
    res.render('write-review', { user: req.session.user_id ? await User.findByPk(req.session.user_id) : null });
});

module.exports = router;
