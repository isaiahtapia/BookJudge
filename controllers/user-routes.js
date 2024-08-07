const router = require('express').Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { withAuth } = require('../js/auth');
const { Op } = require('sequelize')

// Logging middleware for debugging
router.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    console.log(`Request Method: ${req.method}`);
    next();
});

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

// profile display route
router.get('/profile', withAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.session.user_id, {
            attributes: { exclude: ['password'] }
        });

        res.render('profile', {
            user: user.get({ plain: true })
        });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// profile update route
router.post('/profile', withAuth, async (req, res) => {
    try {
        const { username, email } = req.body;
        await User.update(
            { username, email },
            { where: { id: req.session.user_id } }
        );
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    } 
});

// Route to render forgot password page
router.get('/forgot-password', (req, res) => {
    console.log('Forgot Password Route Hit');
    res.render('forgot-password');
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });

        if (!user) {
            return res.render('forgot-password', { error: 'No account with that email found.' });
        }

        const token = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                `http://${req.headers.host}/reset-password/${token}\n\n` +
                `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        await transporter.sendMail(mailOptions);

        res.render('forgot-password', { message: 'An email has been sent to ' + user.email + ' with further instructions.' });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// Reset password route
router.get('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.render('forgot-password', { error: 'Password reset token is invalid or has expired.' });
        }

        res.render('reset-password', { token: req.params.token });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

router.post('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.render('forgot-password', { error: 'Password reset token is invalid or has expired.' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

module.exports = router;

