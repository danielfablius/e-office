var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
/* GET disposisis listing. */

//select all disposisi masuk on user Done
router.get('/masuk/:user_id', function(req, res, next) {
  	var db = req.db;
  	var collection = db.get('pengguna');
  	collection.find({"_id":req.params.user_id},function(err,docs){
  		if (err) {
			res.json({
				"results": {
	    			"success": false,
	    			"message": "Data {collection name} dengan ObjectID {ObjectID} tidak ditemukan"
  				}
			});
		}
		else {
			var iddisposisi = docs[0].id_disposisi_masuk; 
			// console.log(iddisposisi);
			var id = [];
			for(var i = 0; i<iddisposisi.length;i++){
				iddisposisi[i]= new ObjectID(iddisposisi[i]);
				{
					id.push({
						"_id" : iddisposisi[i]
					});			
				}
			}		
			collection = db.get('agenda');
			collection.find({"$or": id}, function(err, doc){
				if (err) {
					res.json({
						"results": {
			    			"success": false,
			    			"message": "Data {collection name} dengan ObjectID {ObjectID} tidak ditemukan"
		  				}
					});
				}
				else {
					res.json({
				 	 	"results": doc
					});
				}		
			});
		}
  	});  
});
//select all disposisi keluar on user Done
router.get('/keluar/:user_id', function(req, res, next) {
  	var db = req.db;
  	var collection = db.get('pengguna');
  	collection.find({"_id":req.params.user_id},function(err,docs){
  		if (err) {
			res.json({
				"results": {
	    			"success": false,
	    			"message": "Data {collection name} dengan ObjectID {ObjectID} tidak ditemukan"
  				}
			});
		}
		else {
			var iddisposisi = docs[0].id_disposisi_keluar; 
			// console.log(iddisposisi);
			var id = [];
			for(var i = 0; i<iddisposisi.length;i++){
				iddisposisi[i]= new ObjectID(iddisposisi[i]);
				{
					id.push({
						"_id" : iddisposisi[i]
					});			
				}
			}		
			collection = db.get('agenda');
			collection.find({"$or": id}, function(err, doc){
				if (err) {
					res.json({
						"results": {
			    			"success": false,
			    			"message": "Data {collection name} dengan ObjectID {ObjectID} tidak ditemukan"
		  				}
					});
				}
				else {
					res.json({
				 	 	"results": doc
					});
				}		
			});
		}
  	});  
});

//insert disposisi by kadis (insert diposisi masuk & keluar to user)
router.post('/make/:agenda_id', function(req, res) {
	var db = req.db;
	var user_id = req.body.user_id;
	var ids = req.body.instruksi_kepada;
	var isi_instruksi = req.body.isi_instruksi; 
	var tanggal_instruksi = new Date();
	var tanggal_penyelesaian = req.body.tanggal_penyelesaian;
	var is_delete = "0";
	var status = "Sudah dibaca";
	var instruksi_kepada = ids.split(",");
	var arr=[];
	var id =[];
	for(var i = 0; i<instruksi_kepada.length;i++){
		instruksi_kepada[i]= new ObjectID(instruksi_kepada[i]);
		{
			arr.push({
				"instruksi_kepada" : instruksi_kepada[i],
				"status" : "belum dibaca"
			});
			id.push({
				"_id" : instruksi_kepada[i]
			});			
		}
	}
	
	var collection = db.get('agenda');
	collection.update(
	{"_id": req.params.agenda_id},
	{$set: {
		"status" : status,
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
			collection = db.get('pengguna');
			collection.update(
			{"_id" : user_id},
			{$push: {"id_disposisi_keluar" : new ObjectID(req.params.agenda_id)}},
			function(err, doc){
				if (err) {
					res.json({
					  	"results": {
					    "success": false,
					    "message": "Gagal menambahkan data disposisi, user tidak ditemukan"
					  	}
					});
				}
				else {
					collection = db.get('pengguna');
					collection.update(
					{$or: id},
					{$push: {"id_disposisi_masuk" : new ObjectID(req.params.agenda_id)}},
					{multi: true},
					function(error, results){
						if (error) {
							res.json({
							  	"results": {
							    "success": false,
							    "message": "Gagal menambahkan data disposisi, user tidak ditemukan"
							  	}
							});
						}
						else {
							res.json({
							  "results": {
							    "success": results+"hello",
							    "message": "Data {nama collection} - {deskripsi collection, misalnya nama jabatan} berhasil ditambahkan"
							  }
							});
						}
					});					
				}
			});
		}
	});
});



//insert disposisi by sesdin
router.post('/forward/:agenda_id', function(req, res) {
	var db = req.db;
	var user_id = req.body.user_id;
	var ids = req.body.diteruskan_kepada;
	var isi_disposisi = req.body.isi_disposisi; 
	var tanggal_disposisi = new Date();
	var diteruskan_kepada = ids.split(",");
	var arr=[];
	var id=[];
	for(var i = 0; i<diteruskan_kepada.length;i++){
		diteruskan_kepada[i]= new ObjectID(diteruskan_kepada[i]);
		{
			arr.push({
				"diteruskan_kepada" : diteruskan_kepada[i],
				"status" : "belum dibaca"
			});
			id.push({
				"_id" : diteruskan_kepada[i]
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
			collection = db.get('pengguna');
			collection.update(
			{"_id" : user_id},
			{$push: {"id_disposisi_keluar" : new ObjectID(req.params.agenda_id)}},
			function(err, doc){
				if (err) {
					res.json({
					  	"results": {
					    "success": false,
					    "message": "Gagal menambahkan data disposisi, user tidak ditemukan"
					  	}
					});
				}
				else{
					collection = db.get('pengguna');
					collection.update(
					{$or: id},
					{$push: {"id_disposisi_masuk" : new ObjectID(req.params.agenda_id)}},
					{multi: true},
					function(err, doc){
						if (err) {
							res.json({
							  	"results": {
							    "success": false,
							    "message": "Gagal menambahkan data disposisi, user tidak ditemukan"
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
	var id=[];
	for(var i = 0; i<diteruskan_kepada.length;i++){
		diteruskan_kepada[i]= new ObjectID(diteruskan_kepada[i]);
		{
			arr.push({
				"diteruskan_kepada" : diteruskan_kepada[i],
				"isi" : isi_disposisi,
				"status" : "belum dibaca"
			});
			id.push({
				"_id" : diteruskan_kepada[i]
			});	
		}
	}
	var collection = db.get('agenda');
	collection.update(
	{"_id": req.params.agenda_id},
	{$set:{
		"disposisi.instruksi_tambahan" : arr
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
			collection = db.get('pengguna');
			collection.update(
			{"_id" : user_id},
			{$push: {"id_disposisi_keluar" : new ObjectID(req.params.agenda_id)}},
			function(err, doc){
				if (err) {
					res.json({
					  	"results": {
					    "success": false,
					    "message": "Gagal menambahkan data disposisi, user tidak ditemukan"
					  	}
					});
				}
				else {
					collection = db.get('pengguna');
					collection.update(
					{$or: id},
					{$push: {"id_disposisi_masuk" : new ObjectID(req.params.agenda_id)}},
					{multi: true},
					function(err, doc){
						if (err) {
							res.json({
							  	"results": {
							    "success": false,
							    "message": "Gagal menambahkan data disposisi, user tidak ditemukan"
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
				}
			});
		}
	});
});

//UBAH STATUS
router.post('/read', function(req,res){
	var agenda_id = req.body.agenda_id;
	var id_user = req.body.id_user;
	var db = req.db;
	var collection = db.get("agenda");

	collection.find({
	"_id" : agenda_id,
    "disposisi.instruksi_kepada.instruksi_kepada" : id_user},
    function(err,docs){
    	if (err){
    		res.json({
				"results": {
	    			"success": false,
	    			"message": "Data Agenda tidak ditemukan"
  				}
			});
    	}
    	else {
    		collection.update({
		    "_id" : agenda_id,"disposisi.instruksi_kepada.instruksi_kepada" : id_user},
		    {"$set":{"disposisi.instruksi_kepada.$.status":"sudah dibaca"}})
    	}
    });

    collection.find({
	"_id" : agenda_id,
    "disposisi.diteruskan_kepada.diteruskan_kepada" : id_user},
    function(err,docs){
    	if (err){
    		res.json({
				"results": {
	    			"success": false,
	    			"message": "Data Agenda tidak ditemukan"
  				}
			});
    	}
    	else {
    		collection.update({
		    "_id" : agenda_id,"disposisi.diteruskan_kepada.diteruskan_kepada" : id_user},
		    {"$set":{"disposisi.diteruskan_kepada.$.status":"sudah dibaca"}})
    	}
    });

    collection.find({
	"_id" : agenda_id,
    "disposisi.instruksi_tambahan.diteruskan_kepada" : id_user},
    function(err,docs){
    	if (err){
    		res.json({
				"results": {
	    			"success": false,
	    			"message": "Data Agenda tidak ditemukan"
  				}
			});
    	}
    	else {
    		collection.update({
		    "_id" : agenda_id,"disposisi.instruksi_tambahan.diteruskan_kepada" : id_user},
		    {"$set":{"disposisi.instruksi_tambahan.$.status":"sudah dibaca"}})
    	}
    });
});

//soft Delete disposisi
// router.delete('/:agenda_id', function(req, res ,next) {
// 	var db = req.db;
// 	var is_delete = "1";

//   	var collection = db.get('disposisi');
//   	collection.update(
//   	{"_id" : req.params.disposisi_id}, 
//   	{$set:{"is_delete" : is_delete}}, 
//   	function(err,docs){
//   		if (err) {
// 			res.json({message: 'delete failed'});
// 		}
// 		else {
// 			res.json({message: 'delete success'});
// 		}
//   });  
// });


module.exports = router;
