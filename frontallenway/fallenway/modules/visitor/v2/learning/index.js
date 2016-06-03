var express = require('express');
var router = express.Router();
var request = require('request');

var async = require('async');
var async1 = require('async');

var Config = require('../../../../config/globalconfig.js');
var config = new Config();

var Logger = require('../../../../config/logconfig.js');
var logger = new Logger().getLogger();

router.get('', function(req, res, next) {

    logger.debug("visitor/v2/visitor_learning/index.js -- /visitor/learning/index ...");

    async.waterfall([
        //请求 全部的 module
        function(callback){
            request(config.getBackendUrlPrefix() + "module/find-all-modules",function(error,response,body){
                if(!error && response.statusCode == 200){
                    var returnData = JSON.parse(body);

                    if(returnData.statusCode != 0){
                        logger.error("visitor/v2/visitor_learning/index.js -- module/find-all-modules fail ..." +
                            "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                        res.render('error/unknowerror');
                    } else {
                        callback(null,returnData.data);
                    }
                } else {
                    logger.error("visitor/v2/visitor_learning/index.js -- module/find-all-modules fail ..." +
                            "error = " + error);
                    if(response != null){
                        logger.error("visitor/v2/visitor_learning/index.js -- module/find-all-modules fail ..." +
                            "response.statuCode = " + response.statusCode + "..." +
                            "response.body = " + response.body);
                    }
                    res.render('error/unknowerror');
                }
            });
        },function(data,callback){
            var modules = data.modules;

            var moduleid;
            modules.forEach(function(entry){
                if(entry.name == "Learning"){
                    moduleid = entry.id;
                }
            })

            var results = {};
            async1.parallel({
                //默认取 第一个module learning 的标签
                tags:function(subcallback){
                    request(config.getBackendUrlPrefix() + "tag/find-tags-by-moduleid?moduleid=" + moduleid,function(error,response,body){
                        if(!error && response.statusCode == 200){
                            var returnData = JSON.parse(body);
                            if(returnData.statusCode != 0){
                                logger.error("visitor/v2/visitor_learning/index.js -- tag/find-tags-by-moduleid?moduleid= fail ..." +
                                   "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                                res.render('error/unknowerror');
                            } else {
                                subcallback(null,returnData.data.tags);
                            }
                        } else {
                            logger.error("visitor/v2/visitor_learning/index.js -- tag/find-tags-by-moduleid?moduleid= fail ..." +
                                "error = " + error);
                            if(response != null){
                                logger.error("visitor/v2/visitor_learning/index.js -- tag/find-tags-by-moduleid?moduleid= fail ..." +
                                   "response.statuCode = " + response.statusCode + "..." +
                                   "response.body = " + response.body);
                            }
                            res.render('error/unknowerror');
                        }
                    });
                //默认取 第一个module 的文章
                },
                articles_totalPage:function(subcallback){
                    var pageSize = config.getPageSize();
                    var url = config.getBackendUrlPrefix() + "article/find-articles-by-moduleid?moduleid=" +
                                    moduleid + "&page=1&size=" + pageSize;

                    request(url,function(error,response,body){
                        if(!error && response.statusCode == 200){
                            var returnData = JSON.parse(body);

                            if(returnData.statusCode != 0){
                                logger.error("visitor/v2/visitor_learning/index.js -- article/find-articles-by-moduleid?moduleid fail ..." +
                                   "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                                res.render('error/unknowerror');
                            } else {
                                subcallback(null,returnData.data);
                            }
                        } else {
                            logger.error("visitor/v2/visitor_learning/index.js -- article/find-articles-by-moduleid?moduleid fail ..." +
                                "error = " + error);
                            if(response != null){
                                logger.error("visitor/v2/visitor_learning/index.js -- article/find-articles-by-moduleid?moduleid fail ..." +
                                   "response.statuCode = " + response.statusCode + "..." +
                                   "response.body = " + response.body);
                            }
                            res.render('error/unknowerror');
                        }
                    });
                }
            },function(err,results){
                data.tags = results.tags;
                data.articles = results.articles_totalPage.articles;
                data.nowPageLeft = 0;
                data.nowPage = 1;
                data.nowPageRight = 2;
                data.moduleid = moduleid;

                data.totalPage = new Array();

                for(var i = 1; i <= results.articles_totalPage.totalPage;i++){
                    data.totalPage[i-1] = i;
                }

                callback(null,data);
            })
        }],function(err,result){
            res.render('visitor/v3/learning/index',{'data':result});
        })
});

module.exports = router;
