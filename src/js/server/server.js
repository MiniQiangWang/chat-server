const http = require('http');
const express = require('express');

let app = express();
let usersname = [];
const server = http.createServer(app);
app.use('/', express.static('../../www'));
server.listen(3000);
const io = require('socket.io').listen(server);
console.log('server is runing...')

io.on('connection', (socket) => {
	socket.on('login', (name) => {
		if(usersname.includes(name)) {
			socket.emit('nameExits');
		}else {
			socket.userIndex = usersname.length;
			socket.name = name;
			socket.emit('success');
			usersname.push(name);
			io.sockets.emit('system',name,usersname.length,'login');

		}
	})
	socket.on('disconnect', () => {
		usersname.splice(socket.userIndex,1)
		if(socket.name) {
			socket.broadcast.emit('system',socket.name,usersname.length,'logout');	
		}
		
	})
	socket.on('sendMsg', (msg) => {
		socket.broadcast.emit('newMsg',socket.name,msg);
	})
})