const router = require('express').Router();
const { User } = require('../models');


// its path is /api/user/
router.get('/', async (req, res) => {
    try {
        const userData = await User.findAll();
        res.status(200).json(userData);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/register', async (req, res) => {
    try {
        const user = await User.create(req.body);
        req.session.user_id = user.id;
        res.redirect('/reviews');
    } catch (err) {
        console.log(err)
        res.redirect('/register');
    }
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({
        where:{
            email: req.body.email
        }
    });

    if(!user){
        return res.redirect('/register');
    }

    if(!user.validatePassword(req.body.password)){
        return res.redirect('/login');
    }

    req.session.user_id = user.id;
    res.redirect('/reviews');
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;

