var crypto = require('crypto');
var net = require('net');

var smsUrl = 'http://sslsms.cafe24.com/sms_sender.php'; // 전송요청 URL
var hostInfo = smsUrl.split('/');
var host = hostInfo[2];
var path = hostInfo[3];

exports.userid='';
exports.secure='';

function send(message) {
	var req = makeSMSRequest(message);

	console.log('sending message : ' + JSON.stringify(req));
	var sms = {};

	sms.user_id = new Buffer(exports.userid).toString('base64'); // SMS 아이디.
	sms.secure = new Buffer(exports.secure).toString('base64');// 인증키
	if (req.url != undefined) {
		sms.msg = new Buffer(req.msg + ' 확인> ' + req.url).toString('base64');
	} else {
		sms.msg = new Buffer(req.msg).toString('base64');
	}

	sms.rphone = new Buffer(req.rphone).toString('base64');
	sms.sphone1 = new Buffer(req.sphone1).toString('base64');
	sms.sphone2 = new Buffer(req.sphone2).toString('base64');
	sms.sphone3 = new Buffer(req.sphone3).toString('base64');
	sms.rdate = new Buffer(req.rdate).toString('base64');
	sms.rtime = new Buffer(req.rtime).toString('base64');
	sms.mode = new Buffer('1').toString('base64'); // base64 사용시 반드시 모드값을 1로 주셔야 합니다.
	sms.returnurl = new Buffer(req.returnurl).toString('base64');
	sms.testflag = new Buffer(req.testflag).toString('base64');
	sms.destination = new Buffer(req.destination).toString('base64');
	sms.repeatFlag = new Buffer(req.repeatFlag).toString('base64');
	sms.repeatNum = new Buffer(req.repeatNum).toString('base64');
	sms.repeatTime = new Buffer(req.repeatTime).toString('base64');

	console.log('sms : ' + sms);

	var hash = crypto.createHash('md5').update(Math.floor(Math.random() * 3200) + '').digest("hex");
	var boundary = '---------------------' + hash.substr(0, 10);

	console.log('hash : ' + hash);
	console.log('boundary : ' + boundary);

	// 헤더 생성
	var header = 'POST /' + path + ' HTTP/1.0\r\n';
	header += 'Host: ' + host + '\r\n';
	header += 'Content-type: multipart/form-data, boundary=' + boundary + '\r\n';

	var data = '';
	// 본문 생성
	for ( var i in sms) {
		data += '--' + boundary + '\r\n';
		data += 'Content-Disposition: form-data; name=\'' + i + '\'\r\n';
		data += '\r\n' + sms[i] + '\r\n';
		data += '--' + boundary + '\r\n';
	}
	header += 'Content-length: ' + data.length + '\r\n\r\n';
	console.log('header : ' + header);
	console.log('data : ' + data);

	var client = new net.Socket();
	client.connect(80, host, function() {

		console.log('CONNECTED TO: ' + host + ':' + 80 + ', local=' + client.localPort);
		// Write a message to the socket as soon as the client is connected, the
		// server will receive it as message from the client
		client.write(header + data);
	});

	client.on('data', function(msg) {
		return function(rsp) {
			console.log('msg :' + JSON.stringify(msg));
			// console.log(rsp.toString());
			rsp = rsp.toString();

			var tmp0 = rsp.split('\r\n\r\n');
			var tmp1 = tmp0[1].split(',');
			var result = tmp1[0]; // 발송결과
			var count = tmp1[1]; // 잔여건수

			// 발송결과 알림
			if (result == 'success') {
				console.log('[' + result + ']' + '성공. 잔여건수 ' + count + '건 입니다.');
			} else if (result == 'reserved') {
				console.log('[' + result + ']' + '예약성공. 잔여건수 ' + count + '건 입니다.');
			} else if (result == '3205') {
				console.log('[' + result + ']' + '잘못된 번호형식입니다.');
				msg.error = result;
			} else if (result == '0044') {
				console.log('[' + result + ']' + '스팸문자는발송되지 않습니다.');
				msg.error = result;
			} else {
				console.log('[' + result + ']');
				msg.error = result;
			}

			client.destroy();
		}
	}(message));

	client.on('close', function() {
		console.log('client disconnected');
	});

	client.on('error', function(e) {
		console.log('error.' + e);
	});

}

exports.send = send;

function makeSMSRequest(message) {
	var r = {};
	r.msg = message.msg;
	r.url = message.url;
	r.rphone = message.rphone;
	r.sphone1 = message.sphone1;
	r.sphone2 = message.sphone2;
	r.sphone3 = message.sphone3;
	r.rdate = '';
	r.rtime = '';
	r.mode = '1';
	// 1로 주셔야 합니다.
	r.returnurl = '';
	r.testflag = '';
	r.destination = '';
	r.repeatFlag = '';
	r.repeatNum = '';
	r.repeatTime = '';
	r.nointeractive = '';

	return r;
}