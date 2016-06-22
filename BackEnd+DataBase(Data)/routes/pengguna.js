var express = require('express');
var router = express.Router();


//select all jabatan Done(that is_delete not 1)
router.get('/pengguna', function(req, res, next) {
  	var db = req.db;
  	var collection = db.get('pengguna');
  			db.pengguna.aggregate([{
			$lookup:
			{
				from:"jabatan",
				localField: : "id_jabatan",
				foreignField: "id_jabatan",
				as: "detail_pengguna:"
			}
		}]),
  	collection.find({},{},function(err,docs){
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
  				"pengguna" : docs});
		}
  });  
});

//detail pengguna

//insert into pengguna
router.post('/pengguna', function(req, res){
	var db = req.db;

	var username		= req.body.username;
	var password		= req.body.password;
	var nama			= req.body.nama;
	var id_jabatan		= req.body.id_jabatan;
	var no_telp			= req.body.no_telp;
	var email			= req.body.email;
	var is_delete		= "0";

	var collection = db.get('pengguna');

	collection.insert({
		"username"	: username,
		"nama"		: nama,
		"no_telp"	: no_telp,
		"email"		: email,
		"is_delete"	: is_delete
	}, 
	function (err, doc){
		if(err){
			res.json({message: 'insert failed'});
		}
		else {
			res.json({message: 'insert success'});
		}
	});
});

//update pengguna
router.put('/pengguna/:id_pengguna', function(req, res){
	var db = req.db;

	var username	= req.body.username;
	var password	= req.body.password;
	var nama		= req.body.nama;
	var id_jabatan	= req.body.id_jabatan;
	var no_telp		= req.body.no_telp;
	var email		= req.body.email;
	var is_delete	= req.body.is_delete;

	var collection	= db.get('pengguna');

	collection.update({
		"username"	: username,
		"nama"		: nama,
		"no_telp"	: no_telp,
		"email"		: email,
		"is_delete"	: is_delete
	}, function (err, doc){
		if(err){
			res.json({message: 'update failed'});
		}
		else{
			res.json({message: 'update success'});
		}
	});
});

//delete pengguna
router.delete('/pengguna/:id_pengguna', function(req, res,next){
	var db			= req.db;
	var is_delete	= "1";

	var collection	= db.get('pengguna');
	collection.update(
	{"_id" : req.params.agenda_id},
	{$set: {"is_delete" : is_delete}},
	function(err,docs){
		if(err){
			res.json({message: 'delete failed'});
		}
		else{
			res.json({message: 'delete success'});
		}
	});
});