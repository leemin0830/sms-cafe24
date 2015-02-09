var smscafe24 = require('./smscafe24');

smscafe24.userid=''	//cafe24 userid
smscafe24.secure=''	//secure key given by cafe24.com
	
var message = {};
message.msg = 'this is message';	//message
message.rphone = '000-0000-0000';	//receiver phone number
message.sphone1 = '000';	//sender phone number
message.sphone2 = '0000';
message.sphone3 = '0000';

smscafe24.send(message);