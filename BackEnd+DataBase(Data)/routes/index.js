var ObjectID = require('mongodb').ObjectID;
var express = require('express');
var jwt    = require('jsonwebtoken');
var crypto = require('crypto');
var config = require('../config'); // get our config file
var multer = require('multer');
var path = require('path');
var router = express.Router();
var key = config.secret;
var app = express();

// var upload = multer({ dest: '../upload/'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

getPengguna = function(req, res, id_user, level_jabatan) {
  var db = req.db;
  var collection = db.get('pengguna');

  resTree = function(parent_id, level) {
    if (typeof(parent_id) != 'undefined') {
      level = parseInt(level) + 1;
      if (level > 4) {
        level = 4;
      }
      $criteria = { 
        "is_delete" : "0" , 
        "$or": [
          {"detail_jabatan.level_jabatan" : {"$gt": level}},
          {"detail_jabatan.parent_id": new ObjectID(parent_id)}
        ]
      };
    } else {
      $criteria = { "is_delete" : "0" };
    }
    searchQuery = [{ "$lookup" :
      {
        "from" :"jabatan",
        "localField" : "id_jabatan",
        "foreignField" : "_id",
        "as" : "detail_jabatan"
      }},
      {
          "$unwind": '$detail_jabatan'
      },
      { "$project": {
          "nama": 1,
          "id_jabatan":1,
          "detail_jabatan": 1,
          "is_delete": 1,
          "list_anggota": 1,
          "jabatan": "$detail_jabatan.nama_jabatan"
      }},
      { "$match" : $criteria
      },
      { "$sort" : {
        "detail_jabatan.level_jabatan": 1,
        "detail_jabatan.parent_id": 1,
        "detail_jabatan._id": 1
      }
    }];
    collection.col.aggregate(searchQuery, function(err, docs) {
      if (err) {
        res.json({
          "result":{
            "success": false,
            "message": "data pengguna tidak ditemukan"
          }
        });
      }
      else{
        if (typeof(parent_id) != 'undefined') {
          whiteList = [parent_id.toString()];
          for(i=0;i<docs.length;i++) {
            if (whiteList.indexOf(docs[i].detail_jabatan.parent_id.toString()) > -1) {
              whiteList.push(docs[i].detail_jabatan._id.toString());
            } else {
              // delete docs[i];
              docs.splice(i,1);
            }
          }
        }
        
        res.json({
          "results": docs
        });
      }
    });
  }
  if (typeof(id_user) != 'undefined') {
      collection.findById(id_user, function(err,docs){
        if (err) {
          res.json({
            "results": {
                "success": false,
                "message": "Data jabatan dengan ObjectID" + id_user +"  tidak ditemukan"
              }
          });
        }
        else {
          id_jabatan = docs.id_jabatan;
          resTree(id_jabatan, level_jabatan);
        }
      });
    } else {
      resTree();
    }
    
}

router.get('/pengguna_tree/:id_user/:level_jabatan', function(req, res, next){
  getPengguna(req, res, req.params.id_user, req.params.level_jabatan);
});

router.get("/pengguna_all", function(req, res, next){
  getPengguna(req, res);
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
  var collection = db.get('pengguna');
  var username = req.body.username;  
  collection.findOne({"username" : username},function(err,docs){
    if (err) {
        
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
      } 
      else if (docs) {
      // check if password matches
      var hash = crypto.createHash('md5').update(req.body.password).digest('hex');
      if (docs.password != hash) {
        res.json({
          "results": {
              "success": false,
              "message": "Kombinasi username dan password salah"
            }
        });
      } else {
          var iduser = docs._id;
          var nama = docs.nama;
          var id_jabatan= docs.id_jabatan;
          var token = jwt.sign(docs, key, {
            expiresIn: 999999 // expires in 24 hours
          });
          collection=db.get('jabatan');
          collection.find({"_id": id_jabatan},function(err,doc){
            res.json({
            "results": {
              "success": true,
              "user_id": iduser,
              "nama" : nama,
              "nama_jabatan" : doc[0].nama_jabatan,
              "level_jabatan": doc[0].level_jabatan,
              "token": token,
              "message": "Login berhasil"}
            });
          });
        }
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
