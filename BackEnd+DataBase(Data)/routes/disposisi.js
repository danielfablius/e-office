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
	    			"message": "Disposisi tidak ditemukan"
  				}
			});
		}
		else {
			var iddisposisi = docs[0].id_disposisi_masuk; 
			
			var statusDisposisi = {};
			var id = [];
			for(var i = 0; i<iddisposisi.length;i++){
				statusDisposisi[iddisposisi[i].id_disposisi_masuk] = iddisposisi[i].status;
				iddisposisi[i]= new ObjectID(iddisposisi[i].id_disposisi_masuk);
				{
					id.push(iddisposisi[i]);			
				}
			}
			collection = db.get('agenda');
			collection.find({"_id": {"$in": id}}, function(err, doc){
				if (err) {
					res.json({
						"results": {
			    			"success": false,
			    			"message": "Pesan tidak ditemukan"
		  				}
					});
				}
				else {
					newDoc = [];

					for(i=doc.length-1;i>=0;i--) {
						doc[i]['status_disposisi'] = statusDisposisi[doc[i]._id];
						newDoc.push(doc[i]);
					}
					res.json({
				 	 	"results": newDoc
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
	    			"message": "Disposisi keluar tidak ditemukan"
  				}
			});
		}
		else {
			var iddisposisi = docs[0].id_disposisi_keluar; 
			// console.log(iddisposisi);
			var id = [];
			for(var i = 0; i<iddisposisi.length;i++){
				iddisposisi[i]= new ObjectID(iddisposisi[i].id_disposisi_keluar);
				{
					id.unshift({
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
			    			"message": "Pesan tidak ditemukan"
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
			    "message": "Gagal menambahkan data disposisi, " + err
			  }
			});
		}
		else {
			collection = db.get('pengguna');
			$out_disposition = {
				"id_disposisi_keluar": new ObjectID(req.params.agenda_id),
				"createdAt": new Date()
			}
			collection.update(
			{"_id" : user_id},
			{$push: {"id_disposisi_keluar" : $out_disposition}},
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
					$in_disposition = {
						"id_disposisi_masuk": new ObjectID(req.params.agenda_id),
						"status": "belum dibaca",
						"createdAt": new Date()
					}
					collection.update(
					{$or: id},
					{$push: {"id_disposisi_masuk" : $in_disposition}},
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
							    "success": true,
							    "message": "Instruksi untuk surat berkaitan berhasil ditambahkan"
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
		"status" : "sudah dibaca",
		"disposisi.diteruskan_kepada" : arr,
		"disposisi.isi_disposisi" : isi_disposisi,
		"disposisi.tanggal_disposisi" : tanggal_disposisi
	}
	}, function (err, doc) {
		if (err) {
			res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal menambahkan data disposisi, " + err
			  }
			});
		}
		else {
			collection = db.get('pengguna');
			$out_disposition = {
				"id_disposisi_keluar": new ObjectID(req.params.agenda_id),
				"createdAt": new Date()
			}
			collection.update(
			{"_id" : user_id},
			{$push: {"id_disposisi_keluar" : $out_disposition}},
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
					$in_disposition = {
						"id_disposisi_masuk": new ObjectID(req.params.agenda_id),
						"status": "belum dibaca",
						"createdAt": new Date()
					}
					collection.update(
					{$or: id},
					{$push: {"id_disposisi_masuk" : $in_disposition}},
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
							    "success": true,
							    "message": "Disposisi berhasil dibuat"
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
	var user_id = req.body.user_id;
	var ids = req.body.tambahan_kepada;
	var isi_tambahan = req.body.isi_tambahan; 
	var tambahan_kepada = ids.split(",");
	var arr=[];
	var id=[];
	for(var i = 0; i<tambahan_kepada.length;i++){
		tambahan_kepada[i]= new ObjectID(tambahan_kepada[i]);
		{
			arr.push({
				"tambahan_kepada" : tambahan_kepada[i],
				"status" : "belum dibaca"
			});
			id.push({
				"_id" : tambahan_kepada[i]
			});	
		}
	}
	disposisi_tambahan = {
		"tambahan_kepada": arr,
		"isi_tambahan": isi_tambahan,
		"tambahan_oleh": new ObjectID(user_id)
	}
	var collection = db.get('agenda');
	collection.update(
	{"_id": req.params.agenda_id},
	{$push:{
		"disposisi.instruksi_tambahan" : disposisi_tambahan
		}
	}
	,function (err, doc) {
		if (err) {
			res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal menambahkan data disposisi, " + err
			  }
			});
		}
		else {
			collection = db.get('pengguna');
			$out_disposition = {
				"id_disposisi_keluar": new ObjectID(req.params.agenda_id),
				"createdAt": new Date()
			}
			collection.update(
			{"_id" : user_id},
			{$push: {"id_disposisi_keluar" : $out_disposition}},
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
					$in_disposition = {
						"id_disposisi_masuk": new ObjectID(req.params.agenda_id),
						"status": "belum dibaca",
						"createdAt": new Date()
					}
					collection.update(
					{$or: id},
					{$push: {"id_disposisi_masuk" : $in_disposition}},
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
							    "success": true,
							    "message": "Instruksi tambahan berhasil dibuat"
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
    "disposisi.instruksi_kepada.instruksi_kepada" : new ObjectID(id_user)},
    function(err,docs){
		collection.update({
	    "_id" : agenda_id,"disposisi.instruksi_kepada.instruksi_kepada" : new ObjectID(id_user)},
	    {"$set":{"disposisi.instruksi_kepada.$.status":"sudah dibaca"}})
    });

    collection.find({
	"_id" : agenda_id,
    "disposisi.diteruskan_kepada.diteruskan_kepada" :  new ObjectID(id_user)},
    function(err,docs){
		collection.update({
	    "_id" : agenda_id,"disposisi.diteruskan_kepada.diteruskan_kepada" :  new ObjectID(id_user)},
	    {"$set":{"disposisi.diteruskan_kepada.$.status":"sudah dibaca"}});
    });

    var col_pengguna = db.get('pengguna');
    col_pengguna.find({
	"_id" : id_user,
    "id_disposisi_masuk.id_disposisi_masuk" :  new ObjectID(agenda_id)},
    function(err,docs){
		col_pengguna.update({
	    "_id" : id_user	,"id_disposisi_masuk.id_disposisi_masuk" :  new ObjectID(agenda_id)},
	    {"$set":{"id_disposisi_masuk.$.status":"sudah dibaca"}});
    });

    collection.find({
		"_id" : agenda_id
	},
    function(err,docs){
    	pos1 = null;
    	pos2 = null;
    	if (typeof(docs[0].disposisi) != 'undefined') {
    		if (typeof(docs[0].disposisi.instruksi_tambahan) != 'undefined') {
    	    	for(i=0;i<docs[0].disposisi.instruksi_tambahan.length;i++) {
		    		for(j=0;j<docs[0].disposisi.instruksi_tambahan[i].tambahan_kepada.length;j++) {
		    			if (id_user == docs[0].disposisi.instruksi_tambahan[i].tambahan_kepada[j].tambahan_kepada) {
		    				pos1 = i;
		    				pos2 = j;
		    			}
		    		}
		    	}
		    	if (pos1 != null && pos2 != null) {
		    		updateQuery = {};
		    		loc = "disposisi.instruksi_tambahan." + pos1 + ".tambahan_kepada." + pos2 + ".status";
		    		updateQuery[loc] = "sudah dibaca";

					collection.update({ "_id" : new ObjectID(agenda_id)}, {"$set": updateQuery});
		    	}
			}
    	}

    });
    res.json({
    	"results": {
    		"success": true,
    		"message": ""
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
