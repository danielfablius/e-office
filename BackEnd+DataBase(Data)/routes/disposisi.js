var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
/* GET disposisis listing. */
//select all disposisi Done
// router.get('/', function(req, res, next) {
//   	var db = req.db;
//   	var collection = db.get('disposisi');
//   	collection.find({},{},function(err,docs){
//   		if (err) {
// 			res.json({
// 				"results": {
// 	    			"success": false,
// 	    			"message": "Data {collection name} dengan ObjectID {ObjectID} tidak ditemukan"
//   				}
// 			});
// 		}
// 		else {
// 			res.json({
// 		 	 	"results": docs
// 			});
// 		}
//   	});  
// });
// //select disposisi by ID Done
// router.get('/:disposisi_id', function(req, res, next) {
//   	var db = req.db;
//   	var collection = db.get('disposisi');
//   	collection.findById(req.params.disposisi_id, function(err,docs){
//   		res.json({"disposisi" : docs});
//   });  
// });

//insert disposisi by kadis
router.post('/make/:agenda_id', function(req, res) {
	var db = req.db;
	var ids = req.body.instruksi_kepada;
	var isi_instruksi = req.body.isi_instruksi; 
	var tanggal_instruksi = new Date();
	var tanggal_penyelesaian = req.body.tanggal_penyelesaian;
	var is_delete = "0";
	var status = "Sudah dibaca";
	var instruksi_kepada = ids.split(",");
	var arr=[];
	for(var i = 0; i<instruksi_kepada.length;i++){
		instruksi_kepada[i]= new ObjectID(instruksi_kepada[i]);
		{
			arr.push({
				"instruksi_kepada" : instruksi_kepada[i],
				"status" : "belum dibaca"
			});
			
		}
	}
	
	var collection = db.get('agenda');
	collection.update(
	{"_id": req.params.agenda_id},
	{$set: {
		"status" : status;
		"disposisi" :
		{
			"instruksi_kepada" : arr,
			"isi_instruksi" : isi_instruksi,
			"tanggal_instruksi" : tanggal_instruksi,
			"tanggal_penyelesaian" : new Date(tanggal_penyelesaian),
			"is_delete" : is_delete
		}
	}}, function (err, doc) {
		if (err) {
			res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal menambahkan data {nama collectionnya}, {Errornya karena apa}"
			  }
			});
		}
		else {
			res.json({
			  "results": {
			    "success": doc,
			    "message": "Data {nama collection} - {deskripsi collection, misalnya nama jabatan} berhasil ditambahkan"
			  }
			});
		}
	});
});



//insert disposisi by sesdin
router.post('/forward/:agenda_id', function(req, res) {
	var db = req.db;
	var ids = req.body.diteruskan_kepada;
	var isi_disposisi = req.body.isi_disposisi; 
	var tanggal_disposisi = new Date();
	var diteruskan_kepada = ids.split(",");
	var arr=[];
	for(var i = 0; i<diteruskan_kepada.length;i++){
		diteruskan_kepada[i]= new ObjectID(diteruskan_kepada[i]);
		{
			arr.push({
				"diteruskan_kepada" : diteruskan_kepada[i],
				"status" : "belum dibaca"
			});
		}
	}
	var collection = db.get('agenda');
	collection.update(
	{"_id": req.params.agenda_id},
	{$set: {
		"disposisi.diteruskan_kepada" : arr,
		"disposisi.isi_disposisi" : isi_disposisi,
		"disposisi.tanggal_disposisi" : tanggal_disposisi
	}
	}, function (err, doc) {
		if (err) {
			res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal menambahkan data {nama collectionnya}, {Errornya karena apa}"
			  }
			});
		}
		else {
			res.json({
			  "results": {
			    "success": doc,
			    "message": "Data {nama collection} - {deskripsi collection, misalnya nama jabatan} berhasil ditambahkan"
			  }
			});
		}
	});
});

//teruskan disposisi dibawha sesdin
router.post('/forwardplus/:agenda_id', function(req, res) {
	var db = req.db;
	var ids = req.body.diteruskan_kepada;
	var isi_disposisi = req.body.isi_disposisi; 
	var diteruskan_kepada = ids.split(",");
	var arr=[];
	for(var i = 0; i<diteruskan_kepada.length;i++){
		diteruskan_kepada[i]= new ObjectID(diteruskan_kepada[i]);
		{
			arr.push({
				"diteruskan_kepada" : diteruskan_kepada[i],
				"status" : "belum dibaca"
			});
		}
	}
	var collection = db.get('agenda');
	collection.update(
	{"_id": req.params.agenda_id},
	{$push:{
		"disposisi.instruksi_tambahan" : 
			{
				"id_user" : arr,
				"isi" : isi_disposisi
			}
		}
	}
	, function (err, doc) {
		if (err) {
			res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal menambahkan data {nama collectionnya}, {Errornya karena apa}"
			  }
			});
		}
		else {
			res.json({
			  "results": {
			    "success": doc,
			    "message": "Data {nama collection} - {deskripsi collection, misalnya nama jabatan} berhasil ditambahkan"
			  }
			});
		}
	});
});

//soft Delete disposisi
router.delete('/:disposisi_id', function(req, res ,next) {
	var db = req.db;
	var is_delete = "1";

  	var collection = db.get('disposisi');
  	collection.update(
  	{"_id" : req.params.disposisi_id}, 
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
