const express = require('express')
passport = require('passport');

  require('../config/passport');


const router = express.Router()

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile'] }))

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard')
  }
)



// @dec logout user

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });


module.exports = router