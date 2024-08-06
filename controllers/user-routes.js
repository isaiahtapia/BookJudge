const router = require('express').Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');


// its path is /api/user/
router.get('/', async (req, res) => {
    try {
        const userData = await User.findAll();
        res.status(200).json(userData);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Register route
router.post('/register', async (req, res) => {
    try {
        console.log('Register form submitted');

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });
        
        req.session.user_id = user.id;
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});


// Login Route
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });

        if (!user) {
            return res.render('login', { error: 'User not found. Please register.' });
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);

        if (!validPassword) {
            return res.render('login', { error: 'Invalid password. Please try again.' });
        }

        req.session.user_id = user.id;
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// Logout Route
router.post('/logout', (req, res) => {
    if (req.session.user_id) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: 'Failed to log out.' });
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.status(404).end();
    }
});


module.exports = router;

