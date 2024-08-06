const router = require('express').Router();
const { Review } = require('../models');

router.get('/', async (req, res) => {
    try {
        const reviews = await Review.findAll();
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json(err);
    }
});

// update route to handle POST request for writing reviews using the new models
router.post('/', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
    try {
        const reviewData = await Review.destroy({
            where: {
                id: req.params.id,
                userId: req.session.user_id
            }
        });

        if (!reviewData) {
            res.status(404).json({ message: 'No review found with this id!' });
            return;
        }

        res.status(200).json(reviewData);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
