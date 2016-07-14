var express = require('express');
var multer = require('multer');
// var upload = multer({ dest: '../upload/'});
var router = express.Router();
var multer = require('multer');
var path = require('path');
var crypto = require('crypto');
var fs = require('fs');

//select all agenda Done(that is_delete not 1)
router.get('/', function(req, res, next) {
  	var db = req.db;
  	var collection = db.get('agenda');
  	collection.find({"is_delete" : "0"},{sort: {updatedAt:1}},function(err,docs){
  		if (err) {
			res.json({
				"results": {
	    			"success": false,
	    			"message": "Data Agenda tidak ditemukan"
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


//insert into agenda Done?Status dan Lampiran


router.post('/', function(req, res) {
	var storage = multer.diskStorage({
	destination: '../uploads/',
	filename: function (req, file, cb) {
	    crypto.pseudoRandomBytes(16, function (err, raw) {
	      if (err) return cb(err)

	      cb(null, raw.toString('hex') + path.extname(file.originalname))
	    })
  	}
	});
	var upload = multer({ storage: storage }).single('lampiran');
	var db = req.db;
	var status = "Belum dibaca";
	var is_delete = "0";
	var collection = db.get('agenda');

	upload(req, res, function(err){
	    var no_surat = req.body.no_surat;
		var no_agenda = req.body.no_agenda;
		var tanggal_surat = req.body.tanggal_surat;
		var tanggal_diterima = req.body.tanggal_diterima;
		var pengirim = req.body.pengirim;
		var perihal = req.body.perihal;
		var penerima = req.body.penerima;
		var jenis_surat = req.body.jenis_surat;
		var lampiran = "/uploads/"+req.file.filename;
	    if(err){
		    res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal menambahkan data agenda,"+ err
			  }
			}); 
	    }
    	collection.insert({
			"no_surat" : no_surat,
			"no_agenda" : no_agenda,
			"tanggal_surat" : new Date(tanggal_surat),
			"tanggal_diterima" : new Date(tanggal_diterima),
			"pengirim" : pengirim,
			"perihal" : perihal,
			"penerima" : penerima,
			"jenis_surat" : jenis_surat,
			"lampiran" : lampiran,
			"status" : status,
			"createdAt": new Date(),
			"updatedAt": new Date(),
			"is_delete" : is_delete
			}, function (err, doc) {
				if (err) {
					res.json({
					  "results": {
					    "success": false,
					    "message": "Gagal menambahkan data agenda,"+ err
					  }
					});
				}
				else {
					res.json({
					  "results": {
					    "success": true,
					    "message": "Data agenda berhasil ditambahkan"
					  }
					});
				}
		});
  	});
});

//select agenda by ID Done
router.get('/:agenda_id', function(req, res, next) {
  	var db = req.db;
  	var collection = db.get('agenda');
  	collection.findById(req.params.agenda_id, function(err,docs){
  		if (err) {
			res.json({
				"results": {
	    			"success": false,
	    			"message": "Data Agenda dengan ObjectID" + req.params.agenda_id +"  tidak ditemukan"
  				}
			});
		}
		else {
			if(docs.is_delete == "1"){
				res.json({
			 	 	"results": {
						"success": false
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
		}
  	});  
});

//update agenda by ID Done?Status dan Lampiran
router.put('/:agenda_id', function(req, res, next) {
	var storage = multer.diskStorage({
	destination: '../uploads/',
	filename: function (req, file, cb) {
	    crypto.pseudoRandomBytes(16, function (err, raw) {
	      if (err) return cb(err)

	      cb(null, raw.toString('hex') + path.extname(file.originalname))
	    })
  	}
	});
	var upload = multer({ storage: storage }).single('lampiran');
	var db = req.db;
	var status = "Belum dibaca";
	var is_delete = "0";
	var collection = db.get('agenda');	
	
	upload(req, res, function(err){
		var no_surat = req.body.no_surat;
		var no_agenda = req.body.no_agenda;
		var tanggal_surat = req.body.tanggal_surat;
		var tanggal_diterima = req.body.tanggal_diterima;
		var pengirim = req.body.pengirim;
		var perihal = req.body.perihal;
		var penerima = req.body.penerima;
		var jenis_surat = req.body.jenis_surat;
		var lampiran = "";
		if(err){
		    res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal menambahkan data agenda,"+ err
			  }
			}); 
	    }
		collection.find({_id: req.params.agenda_id},{},function(err, docs){
		if (err) {
			res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal mengubah data Agenda dengan id"+ req.params.agenda_id +","+ err
			  }
			});
		}
		else {
			lampiran = docs[0].lampiran;
			if(typeof(req.file)!='undefined') {
				fs.unlinkSync('..'+lampiran);
				console.log('successfully deleted ..'+lampiran);
				lampiran = "/uploads/"+req.file.filename;
			}
			collection.update(req.params.agenda_id, {
				"no_surat" : no_surat,
				"no_agenda" : no_agenda,
				"tanggal_surat" : new Date(tanggal_surat),
				"tanggal_diterima" : new Date(tanggal_diterima),
				"pengirim" : pengirim,
				"perihal" : perihal,
				"penerima" : penerima,
				"jenis_surat" : jenis_surat,
				"lampiran" : lampiran,
				"status" : status,
				"updatedAt": new Date(),
				"is_delete" : is_delete
			}, function (err, doc) {
				if (err) {
					res.json({
					  "results": {
					    "success": false,
					    "message": "Gagal mengubah data Agenda dengan id"+ req.params.agenda_id +","+ err
					  }
					});
				}
				else {
					res.json({
					  "results": {
					    "success": true,
					    "message": "Data agenda berhasil diubah"
					  }
					});
				}
			});
		}	
	}
);



	    
  	});
});

//soft Delete Agenda
router.delete('/:agenda_id', function(req, res ,next) {
	var db = req.db;
	var is_delete = "1";

  	var collection = db.get('agenda');
  	collection.update(
  	{"_id" : req.params.agenda_id}, 
  	{$set:{"is_delete" : is_delete}}, 
  	function(err,docs){
  		if (err) {
			res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal menghapus data Agenda dengan id " +req.params.agenda_id +" , "+ err
			  }
			});
		}
		else {
			res.json({
			  "results": {
			    "success": true,
			    "message": "Berhasil menghapus data Agenda dengan id "+req.params.agenda_id
			  }
			});
		}
  	});  
});

// router.get('/upload', function(req, res){
// 	res.render('index');
// });

// router.post('/upload', multer({ dest: upload}).single('upl'), 
// 	function(req, res){
// 		console.log(req.body);

// 		console.log(req.file);

// 		req.status(204).end();
// 	});

module.exports = router;
