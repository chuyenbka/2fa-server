var express = require('express');
var router = express.Router();
var speakeasy = require('speakeasy');

const tempCode = {};

function generateSecret() {
  return speakeasy.generateSecret();
}

function generateOtpauthURL(secret, username) {
  return speakeasy.otpauthURL({
    secret: secret.ascii,
    label: `RiChat:${ username }`,
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/generate-token', function(req, res, next) {
  if (req.body.token === '2fa') {
    const token = generateSecret();
    const username = req.body.username;
    
    /*
     * save temp code of user to db 
     * 
     */
    tempCode[username] = token;

    res.json({
      token: token.otpauth_url,
    });
  } else {
    throw new Error('You must login to do this.')
  }
});

router.post('/verify-token', function(req, res, next) {
  if (req.body.token === '2fa') {
    const token = req.body.confirmToken;
    const username = req.body.username;
    const secret = tempCode[username];
    var tokenValidates = speakeasy.totp.verify({
      secret: secret.base32,
      encoding: 'base32',
      token,
      window: 2
    });
    res.json({
      valid: tokenValidates,
    });
  } else {
    throw new Error('You must login to do this.')
  }
});

module.exports = router;
