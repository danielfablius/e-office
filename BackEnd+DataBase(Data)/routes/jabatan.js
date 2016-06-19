var express = require('express');
var router = express.Router();

/* GET jabatans listing. */
//select all jabatan Done
router.get('/', function(req, res, next) {
  	var db = req.db;
  	var collection = db.get('jabatan');
  	collection.find({},{},function(err,docs){
  		res.json({"jabatan" : docs});
  });  
});

//insert into jabatan Done?Status dan Lampiran
router.post('/', function(req, res) {
	var db = req.db;

	var no_surat = req.body.no_surat;
	var no_user = req.body.no_user;
	var tanggal_surat = req.body.tanggal_surat;
	var tanggal_diterima = req.body.tanggal_diterima;
	var pengirim = req.body.pengirim;
	var perihal = req.body.perihal;
	var penerima = req.body.penerima;
	var jenis_surat = req.body.jenis_surat;
	var lampiran = req.body.lampiran;
	var status = req.body.status;
	var is_delete = "0";

	var collection = db.get('jabatan');
	
	collection.insert({
		"no_surat" : no_surat,
		"no_user" : no_user,
		"tanggal_surat" : new Date(tanggal_surat),
		"tanggal_diterima" : new Date(tanggal_diterima),
		"pengirim" : pengirim,
		"perihal" : perihal,
		"penerima" : penerima,
		"jenis_surat" : jenis_surat,
		"lampiran" : lampiran,
		"status" : status,
		"is_delete" : is_delete
	}, function (err, doc) {
		if (err) {
			res.json({message: 'insert failed'});
		}
		else {
			res.json({message: 'insert success'});
		}
	});
});

//select jabatan by ID Done
router.get('/:jabatan_id', function(req, res, next) {
  	var db = req.db;
  	var collection = db.get('jabatan');
  	collection.findById(req.params.jabatan_id, function(err,docs){
  		res.json({"jabatan" : docs});
  });  
});

//update jabatan by ID Done?Status dan Lampiran
router.put('/:jabatan_id', function(req, res, next) {
	var db = req.db;

	var no_surat = req.body.no_surat;
	var no_user = req.body.no_user;
	var tanggal_surat = req.body.tanggal_surat;
	var tanggal_diterima = req.body.tanggal_diterima;
	var pengirim = req.body.pengirim;
	var perihal = req.body.perihal;
	var penerima = req.body.penerima;
	var jenis_surat = req.body.jenis_surat;
	var lampiran = req.body.lampiran;
	var status = req.body.status;
	var is_delete = "0";

	var collection = db.get('jabatan');
	
	collection.update(req.params.jabatan_id, {
		"no_surat" : no_surat,
		"no_user" : no_user,
		"tanggal_surat" : new Date(tanggal_surat),
		"tanggal_diterima" : new Date(tanggal_diterima),
		"pengirim" : pengirim,
		"perihal" : perihal,
		"penerima" : penerima,
		"jenis_surat" : jenis_surat,
		"lampiran" : lampiran,
		"status" : status,
		"is_delete" : is_delete
	}, function (err, doc) {
		if (err) {
			res.json({message: 'update failed'});
		}
		else {
			res.json({message: 'update success'});
		}
	});
});

//soft Delete jabatan
router.delete('/:jabatan_id', function(req, res ,next) {
	var db = req.db;
	var is_delete = "1";

  	var collection = db.get('jabatan');
  	collection.update(
  	{"_id" : req.params.jabatan_id}, 
  	{$set:{"is_delete" : is_delete}}, 
  	function(err,docs){
  		if (err) {
			res.json({message: 'delete failed'});
		}
		else {
			res.json({message: 'delete success'});
		}
  });  
});


module.exports = router;
