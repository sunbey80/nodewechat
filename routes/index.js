var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const jssdk = require('../libs/jssdk');

/* GET home page. */
router.get('/wechat/hello', function(req, res, next) {
	jssdk.getSignPackage(`http://101.132.79.91${req.url}`, function(err, signPackage){
		if(err){
			return next(err);
		}
		
		// Jade Template
		res.render('index', {
			title: 'Hello Wechat from Aliyun ECS ---> Express',
			signPackage: signPackage,
			pretty: true,
		});
	});
});

const token = '5xfoRDWGMggLqH5OmpPu';
const fnMiddleWare = function(req, res, next){        
	const { signature, timestamp, nonce, echostr } = req.query;
	if(!signature || !timestamp || !nonce ){
                return res.send('invalid request');
        }
	if(req.method === 'POST'){
                console.log('---handleWechatRequest.post:', { body: req.body, query: req.query });
		console.log('==================');
		console.log('tousername', req.body.xml.tousername[0]);
		console.log('fromusername', req.body.xml.fromusername[0]);
		console.log('createtime', req.body.xml.createtime[0]);
		console.log('msgtype', req.body.xml.msgtype[0]);
		console.log('content', req.body.xml.content[0]);
		console.log('msgid', req.body.xml.msgid[0]);
		console.log('==================');
	}
        if(req.method === 'GET'){
                console.log('handleWechatRequest.get:', { get: req.body });
		if(!echostr){
			return res.send('invalid request');
		}
        }

        const params = [token, timestamp, nonce];
        params.sort();

        const hash = crypto.createHash('sha1');
        const sign = hash.update(params.join('')).digest('hex');

        if(signature === sign){
		if(req.method === 'GET') {
			res.send(echostr ? echostr : 'invalid request');
	        }else{
			const tousername = req.body.xml.tousername[0].toString();
			const fromusername = req.body.xml.fromusername[0].toString();
			const createtime = req.body.xml.createtime[0].toString();
			const msgtype = req.body.xml.msgtype[0].toString();
			const content = req.body.xml.content[0].toString();
			const msgid = req.body.xml.msgid[0].toString();

			const response = `<xml>
 <ToUserName><![CDATA[${fromusername}]]></ToUserName>
 <FromUserName><![CDATA[${tousername}]]></FromUserName>
 <CreateTime>${createtime}</CreateTime>
 <MsgType><![CDATA[${msgtype}]]></MsgType>
 <Content><![CDATA[${content}]]></Content>
 <MsgId>1234567890123456</MsgId>
 </xml>`;
			res.set('Content-Type', 'text/xml');
			res.send(response);
		}
        }else{
                res.send('invalid sign');
        }
}

router.get('/api/wechat', fnMiddleWare);
router.post('/api/wechat', fnMiddleWare);

module.exports = router;
