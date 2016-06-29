var express = require('express');
var router = express.Router();

/* GET users listing. */
//select all user Done
router.get('/', function(req, res, next) {
  	var db = req.db;
  	var collection = db.get('jabatan');
  	collection.col.aggregate(
  		[
  			{"$group": { 
  				"_id" : {
  					"level_jabatan": "$level_jabatan",
  					// "nama_jabatan": "$nama_jabatan",
  					"parent_id": "$parent_id"
  				},
  				"nama_jabatan" : { "$push": "$nama_jabatan"},
				"id" : { "$push": "$_id"}  				
  			}}
  		]
  	,function(err,docs){
  		if (err) {
			res.json({
				"results": {
	    			"success": false,
	    			"message": err
  				}
			});
		}
		else {
			var arr=[];
			for(var i=0; i<(docs.length);i++)
				{arr.push({
					"level_jabatan" : docs[i]._id.level_jabatan,
			 	 	// "nama_jabatan" : docs[i]._id.nama_jabatan,
			 	 	"id_jabatan" : docs[i].id

				});
			}
			res.json({
		 	 	"results": arr
			});
		}
  	});  
});



module.exports = router;
