const router = require('express').Router();
const { Review } = require('../models');
const { withAuth } = require('../js/auth');

router.get('/', async (req, res) => {
    try {
        const reviews = await Review.findAll();
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json(err);
    }
});

// update route to handle POST request for writing reviews using the new models
router.post('/', withAuth, async (req, res) => {
    try {
        const { bookId, review } = req.body;
        const userId = req.session.user_id;
        if (!userId) {
            return res.status(401).json({ message: 'You need to be logged in to submit a review.' });
        }

        await Review.create({
            bookId,
            review,
            userId
        });

        res.redirect('/reviews');
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// Add route to get the edit review page
router.get('/edit/:id', withAuth, async (req, res) => {
    try {
        const reviewData = await Review.findByPk(req.params.id);

        if (!reviewData) {
            res.status(404).json({ message: 'No review found with this id!' });
            return;
        }

        const review = reviewData.get({ plain: true });

        res.render('edit-review', {
            review,
            user: req.session.user_id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// Add route to update a review
router.post('/edit/:id', withAuth, async (req, res) => {
    try {
        await Review.update(
            { review: req.body.review },
            { where: { id: req.params.id, userId: req.session.user_id } }
        );

        res.redirect('/reviews');
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// Add route to delete a review
router.post('/delete/:id', withAuth, async (req, res) => {
    try {
        await Review.destroy({
            where: { id: req.params.id, userId: req.session.user_id }
        });

        res.redirect('/reviews');
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

module.exports = router;

module.exports = router;
