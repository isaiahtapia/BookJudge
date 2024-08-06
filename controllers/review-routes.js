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

router.post('/', async (req, res) => {
    try {
        const newReview = await Review.create({
            ...req.body,
            userId: req.session.user_id
        });
        res.status(200).json(newReview);
    } catch (err) {
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
