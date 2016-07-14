var express = require('express');
var router = express.Router();


//select all agenda as suratmasuk Done(that is_delete not 1)
router.get('/', function(req, res, next) {
  	var db = req.db;
  	var collection = db.get('agenda');
  	collection.find({
  		"is_delete" : "0",
  		"status" : "Belum dibaca"
  	},{sort: {updatedAt: -1}},function(err,docs){
  		if (err) {
			res.json({
				"results": {
	    			"success": false,
	    			"message": "suratmasuk tidak ditemukan"
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

//tolak suratmasuk?
router.post('/tolak/:surat_id', function(req, res ,next) {
	var db = req.db;
	var status = "Ditolak";

  	var collection = db.get('agenda');
  	collection.update(
  	{"_id" : req.params.surat_id}, 
  	{$set:{"status" : status}}, 
  	function(err,docs){
  		if (err) {
			res.json({
			  "results": {
			    "success": false,
			    "message": "Gagal Menolak data Surat dengan id"+ req.params.surat_id +","+ err
			  }
			});
		}
		else {
			res.json({
			  "results": {
			    "success": true,
			    "message": "Surat dengan id "+req.params.surat_id+" telah Ditolak"
			  }
			});
		}
  	});  
});

module.exports = router;
