const router = require('express').Router();
const {User} = require('../models');

function redirectGuest(req, res, next) {
    if(!req.session.user_id){
        return res.redirect('/login');
    }
    next();
}

router.get('/', async (req, res) => {
    res.render('homepage', { user: req.session.user_id ? await User.findByPk(req.session.user_id) : null });
});

router.get('/register', async (req, res) => {
    res.render('register');
})

router.get('/login', async (req, res) => {
    res.render('login');
})

router.get('/reviews', redirectGuest, async (req, res) => {
    const user = await User.findByPk(req.session.user_id);
    res.render('reviews', {
        user: user.get({
            plain:true
        })
    });
})

module.exports = router;