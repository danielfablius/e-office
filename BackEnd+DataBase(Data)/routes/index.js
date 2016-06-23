var express = require('express');
var jwt    = require('jsonwebtoken');
var config = require('../config'); // get our config file
var router = express.Router();
var app = express();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/restore', function(req, res, next) {
    var db = req.db;
    var collection = db.get('agenda');
    collection.update({},{$set:{"is_delete" : "0"}},{multi:true},
    function(err,docs){
        if (err) {
            res.json({
              "results": {
                "success": false,
                "message": err
              }
            });
        }
        else {
            res.json({
              "results": {
                "success": true,
                "message": "Berhasil"
              }
            });
        }
    });  
});

router.post('/auth', function(req, res) {
  var db = req.db;
  var collection = db.get('user');
  var username = req.body.username;  
  collection.findOne({"username" : username},function(err,docs){
      if (err) {
        // console.log(docs);
        res.json({
          "results": {
            "success": false,
            "message": "Kombinasi username dan password salah"
          }
        });
      }
      if (!docs) {
        res.json({
          "results": {
              "success": false,
              "message": "Kombinasi username dan password salah"
            }
        });
      // console.log(user);
      } else {
        // console.log(docs);
        var key = config.secret;
        // console.log(key);
        var token = jwt.sign(docs, key, {
          expiresIn: 1440 // expires in 24 hours
        });

        res.json({
          "results": {
            "success": true,
            "user_id": docs._id,
            "jabatan": docs.id_jabatan,
            "token": token,
            "message": "Login berhasil"
          }
        });
      }
  });
});

router.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, key, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    }); 
  }
});

module.exports = router;
