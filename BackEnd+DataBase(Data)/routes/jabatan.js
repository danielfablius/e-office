var express = require('express');
var router = express.Router();

/* GET jabatan listing. */
//select all jabatan Done
router.get('/', function(req, res, next) {
  	var db = req.db;
    var collection = db.get('jabatan');
  	collection.find({}, {sort: {level_jabatan: 1}}, function(err, docs){
    if (err) {
			res.json({
				"results": {
	    			"success": false,
	    			"message": "Data Jabatan tidak ditemukan"
  				}
			});
		}
		else {
			res.json({
		 	 	"results": docs
			});
		}
    });
});
  	

//insert into jabatan Done?Status dan Lampiran
router.post('/', function(req, res) {
	var db = req.db;

	var level_jabatan = req.body.level_jabatan;
	var nama_jabatan = req.body.nama_jabatan;
	var parent_id = req.body.parent_id;

	var collection = db.get('jabatan');
	
	collection.insert({
		"level_jabatan" : level_jabatan,
		"nama_jabatan" : nama_jabatan,
		"parent_id" : parent_id
	}, function (err, doc) {
		if (err) {
			res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal menambahkan data Jabatan, "+ err
			  }
			});
		}
		else {
			res.json({
			  "results": {
			    "success": true,
			    "message": "Data jabatan berhasil ditambahkan"
			  }
			});
		}
	});
});

//select jabatan by ID Done
router.get('/:jabatan_id', function(req, res, next) {
  	var db = req.db;
  	var collection = db.get('jabatan');
  	collection.findById(req.params.jabatan_id, function(err,docs){
   		if (err) {
			res.json({
				"results": {
	    			"success": false,
	    			"message": "Data jabatan dengan ObjectID" + req.params.jabatan_id +"  tidak ditemukan"
  				}
			});
		}
		else {
			res.json({
		 	 	"results": {
					"success": true,
					"data": docs
		  		}
			});
		}
  	});  
});

//update jabatan by ID Done?Status dan Lampiran
router.put('/:jabatan_id', function(req, res, next) {
	var db = req.db;
	console.log(req);

	var level_jabatan = req.body.level_jabatan;
	var nama_jabatan = req.body.nama_jabatan;
	var parent_id = req.body.parent_id;

	var collection = db.get('jabatan');
	
	collection.update(req.params.jabatan_id, {
		"level_jabatan" : level_jabatan,
		"nama_jabatan" : nama_jabatan,
		"parent_id" : parent_id
	}, function (err, doc) {
		if (err) {
			res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal mengubah data jabatan dengan id"+ req.params.jabatan_id +","+ err
			  }
			});
		}
		else {
			res.json({
			  "results": {
			    "success": true,
			    "message": "Data jabatan berhasil diubah"
			  }
			});
		}
	});
});

//soft Delete jabatan ?isdelete?
router.delete('/:jabatan_id', function(req, res ,next) {
	var db = req.db;
	var is_delete = "1";

  	var collection = db.get('jabatan');
  	collection.update(
  	{"_id" : req.params.jabatan_id}, 
  	{$set:{"is_delete" : is_delete}}, 
  	  	function(err,docs){
  		if (err) {
			res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal menghapus data jabatan dengan id " +req.params.jabatan_id +" , "+ err
			  }
			});
		}
		else {
			res.json({
			  "results": {
			    "success": true,
			    "message": "Berhasil menghapus data jabatan dengan id "+req.params.jabatan_id
			  }
			});
		}
  	});
});

module.exports = router;
