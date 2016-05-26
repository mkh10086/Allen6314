var request = require('request');
var async = require('async');
var express = require('express');
var md = require('node-markdown').Markdown;
//var md = require("markdown").markdown;

var Config = require('../../config/globalconfig.js');
var config = new Config();

var MyCookies = require('../../config/mycookies.js');
var mycookies = new MyCookies();

var Logger = require('../../config/logconfig.js');
var logger = new Logger().getLogger();

var router = express.Router();


//添加文章 -- 跳到添加文章首页
router.get('/addArticle',function(req,res,next){

    logger.debug("admin/article.js -- /admin/addArticle ...");

    var cookies = mycookies.getMyCookies(req);
	if(cookies['Authorization'] == 'undefined'){
 		logger.info("cookies[Authorization] == undefined......");
		res.render('admin/login');
	} else {
        	doSendRequestGetAddArticleRequiredParams(res,cookies);
    }
});


//添加文章 -- 获得添加文章的一些参数
function doSendRequestGetAddArticleRequiredParams(res,cookies){

	var urlClassifies = config.getBackendUrlPrefix() + "auth/classify/find-all-first-level-classifies";
	var optionsClassify = {
        url:urlClassifies,
        headers:{
            'Authorization': "Bearer " + cookies['Authorization']
        }
    }

	var urlTags = config.getBackendUrlPrefix() + "auth/tag/find-all-tags";
	var optionsTags = {
        url:urlTags,
        headers:{
            'Authorization': "Bearer " + cookies['Authorization']
        }
    }

    async.waterfall([
        //请求文章分类
        function(callback){
            request(optionsClassify,function(error,response,body){
                if(!error && response.statusCode == 200 ){
                    var returnData = JSON.parse(body);
                    if(returnData.statusCode == 0){
                        callback(null,returnData.data);
                    } else {
                        logger.error("admin/article.js -- auth/classify/find-all-first-level-classifies fail ..." +
                                "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                        res.render('error/unknowerror');
                    }
                } else {
                    logger.error("admin/article.js -- auth/classify/find-all-first-level-classifies fail ..." +
                                "error = " + error);
                    if(response != null){
                        logger.error("admin/article.js -- auth/classify/find-all-first-level-classifies fail ..." +
                                "response.statuCode = " + response.statusCode + "..." +
                                "response.body = " + response.body);
                    }
                    res.render('error/unknowerror');
                }
            });
            //请求tags
        },function(data,callback){
            request(optionsTags,function(error,response,body){
                if(!error && response.statusCode == 200 ){
                    var returnData = JSON.parse(body);
                    if(returnData.statusCode == 0){
                        data.tags = returnData.data.tags;
                        callback(null,data);
                    } else {
                        logger.error("admin/article.js -- auth/tag/find-all-tags fail ..." +
                                "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                        res.render('error/unknowerror');
                    }
                } else {
                    logger.error("admin/article.js -- auth/tag/find-all-tags fail ..." +
                            "error = " + error);
                    if(response != null){
                        logger.error("admin/article.js -- auth/tag/find-all-tags fail ..." +
                                "response.statuCode = " + response.statusCode + "..." +
                                "response.body = " + response.body);
                    }
                    res.render('error/unknowerror');
                }
            });
        }
    ],function(err,result){
        var path = "<li><a href = \"/admin/index\">Index</a></li>" +
                "<li><a href = \"/admin/article/articleManage\">Article Manage</a></li>" +
                "<li><a href = \"#\" class = \"active\">Add Article</a></li>";
        result.path = path;
        res.render('admin/article/add_updateArticle',{'data':result});
    })
}



//添加文章 -- 获得添加文章的一些参数
router.post('/addArticle/doAdd',function(req,res,next){

    logger.debug("admin/article.js -- /admin/addArticle/doAdd ...");

    var cookies = mycookies.getMyCookies(req);
    	if(cookies['Authorization'] == 'undefined'){
 		logger.info("cookies[Authorization] == undefined......");
		res.render('admin/login');
	} else {
		doSendRequestDoAdd(res,req,cookies);
	}
});




//添加文章 -- 获得添加文章的一些参数
function doSendRequestDoAdd(res,req,cookies){
    var url = config.getBackendUrlPrefix() + "auth/article/save-article";
	var data = {
            'id': req.body.id,
        	'title': req.body.title,
         	'content': req.body.mdData,
         	'classifyId': req.body.classifyId,
         	'tagId1': req.body.tagId1,
         	'tagId2': req.body.tagId2,
         	'tagId3': req.body.tagId3
    	}

    var cookies = mycookies.getMyCookies(req);
    var options = {
    	url:url,
    	headers:{
            'Authorization': "Bearer " + cookies['Authorization']
		},
	    form:data
    }

    request.post(options,function(error,response,body){
        if(!error && response.statusCode == 200 ){
            var returnData = JSON.parse(body);
            if(returnData.statusCode == 0){
                res.redirect('/admin/article/articleManage');
            } else {
			    console.log("unknow error in kong or java,because response.statusCode = 200, returnData.statusCode != 0 ");
            }
        } else {
            logger.error("admin/article.js -- auth/article/save-article ..." +
                "error = " + error);
            if(response != null){
                logger.error("admin/article.js -- auth/article/save-article fail ..." +
                    "response.statuCode = " + response.statusCode + "..." +
                    "response.body = " + response.body);
            }
        	if(response.statusCode == 401){
			    res.render('admin/login');
		    } else {
                res.render('error/unknowerror');
			}
		}
   	});
}





//删除文章
router.get('/deleteArticle',function(req,res,next){

    logger.debug("admin/article.js -- /admin/deleteArticle ...");

    var cookies = mycookies.getMyCookies(req);
    if(cookies['Authorization'] == 'undefined'){
 		logger.info("cookies[Authorization] == undefined......");
		res.render('admin/login');
	} else {
		var url = config.getBackendUrlPrefix() + "auth/article/delete-article-by-id";
    	var data = {id:req.query.id};

		var options = {
        		url:url,
        		headers:{
                		'Authorization': "Bearer " + cookies['Authorization']
        		},
			    form:data
    	    }
    	request.post(options,function(error,response,body){
        	if(!error && response.statusCode == 200 ){
                var returnData = JSON.parse(body);
                if(returnData.statusCode == 0){
					res.redirect('/admin/article/articleManage');
				} else {
                    logger.error("admin/article.js -- auth/admin/deleteArticle fail ..." +
                            "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                    res.render('error/unknowerror');
                }
            } else {
                logger.error("admin/article.js -- auth/admin/deleteArticle fail ..." +
                    "error = " + error);
                if(response != null){
                    logger.error("admin/article.js -- auth/admin/deleteArticle fail ..." +
                        "response.statuCode = " + response.statusCode + "..." +
                        "response.body = " + response.body);
                }
                res.render('error/unknowerror');
            }
    	});
	}
});




//修改文章 -- 跳到修改文章页面
router.get('/modifyArticle',function(req,res,next){

    logger.debug("admin/article.js -- auth/admin/modifyArticle ...");

    var cookies = mycookies.getMyCookies(req);
    if(cookies['Authorization'] == 'undefined'){
 		logger.info("cookies[Authorization] == undefined......");
        res.render('admin/login');
    } else {
        doSendRequestGetModifyArticleRequiredParams(req,res,cookies);
	}
});





//修改文章 -- 获得修改文章的一些参数
function doSendRequestGetModifyArticleRequiredParams(req,res,cookies){

    var urlClassifies = config.getBackendUrlPrefix() + "auth/classify/find-all-first-level-classifies";
	var optionsClassify = {
        url:urlClassifies,
        headers:{
            'Authorization': "Bearer " + cookies['Authorization']
        }
    }

	var urlClassifies = config.getBackendUrlPrefix() + "auth/classify/find-all-first-level-classifies";
	var optionsClassify = {
        url:urlClassifies,
        headers:{
            'Authorization': "Bearer " + cookies['Authorization']
        }
    }

	var urlTags = config.getBackendUrlPrefix() + "auth/tag/find-all-tags";
	var optionsTags = {
        url:urlTags,
        headers:{
            'Authorization': "Bearer " + cookies['Authorization']
        }
    }


	var urlFindArticle = config.getBackendUrlPrefix() + "auth/article/find-article-by-id?id=" + req.query.id;
	var optionFindArticle = {
        url:urlFindArticle,
        headers:{
            'Authorization': "Bearer " + cookies['Authorization']
        }
    }

    async.waterfall([
        //请求文章分类
        function(callback){
            request(optionsClassify,function(error,response,body){
                if(!error && response.statusCode == 200 ){
                    var returnData = JSON.parse(body);
                    if(returnData.statusCode == 0){
                        callback(null,returnData.data);
                    } else {
                        logger.error("admin/article.js -- auth/classify/find-all-first-level-classifies fail ..." +
                                "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                        res.render('error/unknowerror');
                    }
                } else {
                    logger.error("admin/article.js -- auth/classify/find-all-first-level-classifies fail ..." +
                            "error = " + error);
                    if(response != null){
                        logger.error("admin/article.js -- auth/classify/find-all-first-level-classifies fail ..." +
                            "response.statuCode = " + response.statusCode + "..." +
                            "response.body = " + response.body);
                    }
                    res.render('error/unknowerror');
                }
            });

            //请求tags
        },function(data,callback){
            request(optionsTags,function(error,response,body){
                if(!error && response.statusCode == 200 ){
                    var returnData = JSON.parse(body);
                    if(returnData.statusCode == 0){
                        data.tags = returnData.data.tags;
                        callback(null,data);
                    } else {
                        logger.error("admin/article.js -- auth/tag/find-all-tags fail ..." +
                            "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                        res.render('error/unknowerror');
                    }
                } else {
                    logger.error("admin/article.js -- auth/tag/find-all-tags fail ..." +
                        "error = " + error);
                    if(response != null){
                        logger.error("admin/article.js -- auth/tag/find-all-tags fail ..." +
                            "response.statuCode = " + response.statusCode + "..." +
                            "response.body = " + response.body);
                    }
                    res.render('error/unknowerror');
                }
            });
        },function(data,callback){
            request(optionFindArticle,function(error,response,body){
                if(!error && response.statusCode == 200 ){
                    var returnData = JSON.parse(body);
                    if(returnData.statusCode == 0){
                        data.article = returnData.data.article;
                        callback(null,data);
                    } else {
                        logger.error("admin/article.js -- auth/article/find-article-by-id?id=xx fail ..." +
                            "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                        res.render('error/unknowerror');
                    }
                } else {
                    logger.error("admin/article.js -- auth/article/find-article-by-id?id=xx ..." +
                        "error = " + error);
                    if(response != null){
                        logger.error("admin/article.js --auth/article/find-article-by-id?id=xx fail ..." +
                            "response.statuCode = " + response.statusCode + "..." +
                            "response.body = " + response.body);
                    }
                    res.render('error/unknowerror');
                }
            });
        }
    	],function(err,result){
        	res.render('admin/article/add_updateArticle',{'data':result});
	})
}




//文章管理首页
router.get('/articleManage',function(req,res,next){
    logger.debug("admin/article.js -- /admin/articleManage ...");


    var cookies = mycookies.getMyCookies(req);
    if(cookies['Authorization'] == 'undefined'){
 		logger.info("cookies[Authorization] == undefined......");
        res.render('admin/login');
    } else {
        var url = config.getBackendUrlPrefix() + "auth/article/get-all-articles";
	    var options = {
            url:url,
            headers:{
                'Authorization': "Bearer " + cookies['Authorization']
            }
        }

        request(options,function(error,response,body){
            if(!error && response.statusCode == 200 ){
                var returnData = JSON.parse(body);
                if(returnData.statusCode == 0){
                    var articles = returnData.data.articles;

                    articles.forEach(function(item){
                        var html = md(item.content);
                        //var html = md.toHTML(item.content);
                        item.content = html;
                    });

                    var path = "<li><a href = \"/admin/index\">Index</a></li>" +
                        "<li>Article Manage</li>";

                    var data = {
                        'articles':articles,
                        'path':path
                    }
                    res.render('admin/article/articleManageIndex',{'data':data});
                } else {
                    logger.error("admin/article.js -- auth/article/get-all-articles fail ..." +
                        "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                    res.render('error/unknowerror');
                }
            } else {
                logger.error("admin/article.js -- auth/article/get-all-articles ..." +
                    "error = " + error);
                if(response != null){
                    logger.error("admin/article.js -- auth/article/get-all-articles fail ..." +
                        "response.statuCode = " + response.statusCode + "..." +
                        "response.body = " + response.body);
                }
                res.render('error/unknowerror');
            }
        });
    }
});



module.exports = router;
