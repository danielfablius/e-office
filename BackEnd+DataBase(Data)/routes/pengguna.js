var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
//select all jabatan Done(that is_delete not 1)
router.get('/', function(req, res, next) {
  	var db = req.db;
  	var collection = db.get('pengguna');
	collection.col.aggregate(
	[	{ "$match" : { "is_delete" : "0" }},
		{ "$lookup" :
			{
				"from" :"jabatan",
				"localField" : "id_jabatan",
				"foreignField" : "_id",
				"as" : "detail_jabatan"
			}}
	], function(err, docs) {
	if (err) {
		res.json({
			"result":{
				"success": false,
				"message": "data pengguna tidak ditemukan"
			}
		});
	}
	else{
		res.json({
			"results": docs});
		}		
	}
)});

//select Pengguna by ID Done
router.get('/:pengguna_id', function(req, res, next) {
  	var db = req.db;
  	var collection = db.get('pengguna');
  	var id = collection.id(req.params.pengguna_id);
  	collection.col.aggregate(
	[	{ "$match" : { "_id" : id }},
		{ "$lookup" :
			{
				"from" :"jabatan",
				"localField" : "id_jabatan",
				"foreignField" : "_id",
				"as" : "detail_jabatan"
			}
		}
	], function(err, docs) {
	if (err) {
		res.json({
			"result":{
				"success": false,
				"message": "data pengguna tidak ditemukan"
			}
		});
	}
	else if(docs[0].is_delete == "1"){
			res.json({
		 	 	"results": {
				"success": false,
				"message": "data pengguna tidak ditemukan"
			}
		});
	}
	else{
		delete docs[0].password;
		res.json({
			"results": {
				"success": true,
				"data": docs[0]
			}
		});
	}		
	}
)});
//pengguna tree
// router.get('/', function(req,res,next){
// 	var db = req.db
// })


//insert into pengguna
router.post('/', function(req, res){
	var db = req.db;

	var username		= req.body.username;
	var password		= req.body.password;
	var nama			= req.body.nama;
	var id_jabatan		= req.body.id_jabatan;
	var no_telp			= req.body.no_telp;
	var email			= req.body.email;
	var is_delete		= "0";
	var hash = crypto.createHash('md5').update(password).digest('hex');
	var collection = db.get('pengguna');

	collection.insert({
		"username"	: username,
		"password" : hash,
		"nama"		: nama,
		"id_jabatan" : new ObjectID(id_jabatan),
		"no_telp"	: no_telp,
		"email"		: email,
		"is_delete"	: is_delete,
		"id_disposisi_masuk" : [""],
		"id_disposisi_keluar" : [""]
	}, 
	function (err, doc){
		if(err){
			res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal menambahkan data pengguna, "+err
			  }
			});
		}
		else {
			res.json({
			  "results": {
			    "success": true,
			    "message": "Data pengguna - berhasil ditambahkan"
			  }
			});
		}
	});
});

//update pengguna
router.put('/:pengguna_id', function(req, res){
	var db = req.db;

	var username		= req.body.username;
	var password		= req.body.password;
	var nama			= req.body.nama;
	var id_jabatan		= req.body.id_jabatan;
	var no_telp			= req.body.no_telp;
	var email			= req.body.email;
	var is_delete		= "0";
	var hash = crypto.createHash('md5').update(password).digest('hex');
	var collection = db.get('pengguna');

	var updatedArray = {  
		"username"	: username,
		"password" : hash,
		"nama"		: nama,
		"id_jabatan" : new ObjectID(id_jabatan),
		"no_telp"	: no_telp,
		"email"		: email
	};
	if(password == ""){
		delete updatedArray.password;
	}

	collection.update(
	{"_id" : req.params.pengguna_id},
	{$set: updatedArray}, function (err, doc){
		if(err){
			res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal mengubah data pengguna ," + err
			  }
			});
		}
		else{
			res.json({
			  "results": {
			    "success": true,
			    "message": "Data pengguna berhasil diubah"
			  }
			});
		}
	});
});

//delete pengguna
router.delete('/:pengguna_id', function(req, res,next){
	var db			= req.db;
	var is_delete	= "1";

	var collection	= db.get('pengguna');
	collection.update(
	{"_id" : req.params.pengguna_id},
	{$set: {"is_delete" : is_delete}},
	function(err,docs){
		if(err){
			res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal menghapus data Pengguna dengan id " +req.params.pengguna_id +" , "+ err
			  }
			});
		}
		else{
			res.json({
			  "results": {
			    "success": true,
			    "message": "Berhasil menghapus data Pengguna dengan id "+req.params.pengguna_id
			  }
			});
		}
	});
});

module.exports = router;