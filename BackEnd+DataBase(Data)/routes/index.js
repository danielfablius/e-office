var express = require('express');
var jwt    = require('jsonwebtoken');
var crypto = require('crypto');
var config = require('../config'); // get our config file
var router = express.Router();
var app = express();
var key = config.secret;
var multer = require('multer');
var path = require('path');
// var upload = multer({ dest: '../upload/'});

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

router.post('/login', function(req, res) {
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

// SAMPLE UPLOAD
// router.get('/upload', function(req, res, next){
//   res.render('index');
// });

// var uploadProfileImgs = multer({dest: '../uploads/'}).single('upl');
// var storage = multer.diskStorage({
//   destination: '../uploads/',
//   filename: function (req, file, cb) {
//     crypto.pseudoRandomBytes(16, function (err, raw) {
//       if (err) return cb(err)

//       cb(null, raw.toString('hex') + path.extname(file.originalname))
//     })
//   }
//   });
// var upload = multer({ storage: storage }).single('upl');

// router. post('/upload', function(req, res){
//   var db = req.db;
//   var collection = db.get('test');
//   var nama = req.body.nama;
//   upload(req, res, function(err){
//     if(err){
//       console.log(err.message);
//       return
//     }
//     console.log(req.body);
//     console.log(req.file);
//     // var paths = req.file.path;
//     // var originalname = req.file.originalname;
//     // var result = originalname.split(".");
//     // var path = paths+'.'+result[1];
//     // console.log(result[0]);
//     // console.log(result[1]);
//     collection.insert({
//       "nama" : nama,
//       "path" : req.file.path
//     }, function(err, docs){
//         if (err) {
//           res.json({
//             "results": {
//               "success": false,
//               "message": "Gagal menambahkan data agenda,"+ err
//             }
//           });
//         }
//         else {
//           res.json({
//             "results": {
//               "success": true,
//               "message": "Data agenda berhasil ditambahkan"
//             }
//           });
//         }
//     });
//   });
// });

module.exports = router;
