var express = require('express');
var router = express.Router();
var request = require('request');
var Config = require('../../config/globalconfig.js');
var config = new Config();

router.get('',function(req,res,next){
    var url = config.getBackendUrlPrefix() + "operation/get-records";
    request(url,function(error,response,body){
        if(!error){
            var returnData = JSON.parse(body);

            if(returnData.statusCode != 0){
                console.log('request for operation/get-records fail,returnData.statusCode = ' + returnData.statusCode);
            } else {
                res.render('admin/operation/operIndex',{'records':returnData.data.records});
            }
        } else {
            console.log('request for operation/get-records fail!!');
        }
    });
});

module.exports = router;

