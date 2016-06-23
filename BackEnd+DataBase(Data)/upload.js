express = require('express');
router = express.router();

//upload file
app.post('/file-upload' function(req,res,next){
	console.log(req.body);
	console.log(req.files);
});

//move file from temp to directory
var fs = require('fs');
app.post('/file-upload', function(req,res){
	var tmp_path = req.files.thumbnail.path;
	var target_path = './public/images/'+ req.files.thumbnail.name;
	fs.rename(tmp_path, target_path, function(err){
		if(err) throw err;
		//remove file from tmp
		fs.unlink(tmp_path, function(){
			if(err) throw err;
			res.send('file upload to:' + target_path + '-' + req.files.thumbnail.size + ' bytes ');
		});
	});
});