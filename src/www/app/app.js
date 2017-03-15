class App {
	constructor() {
		this.socket = null;
		this.name = null;
	}
	init () {
		const _this = this;
		const wrapper = document.getElementsByClassName('emoji_wrapper')[0];
		wrapper.style.display = 'none';
		this.createEmoji();
		this.socket = io.connect();
		this.socket.on('connect', ()=> {
			document.getElementsByClassName('nickname')[0].style.display = 'inline-block';
			document.getElementsByClassName('connecting')[0].style.display = 'none';
			document.getElementsByClassName('name')[0].focus();
			document.getElementsByClassName('submit')[0].onclick = () => {
				let name = document.getElementsByClassName('name')[0].value;
				if(name.length == 0) {
					document.getElementsByClassName('name')[0].focus();
				}else {
					_this.socket.emit('login',name);
					this.name = name;
				}
			}
			document.getElementById('submit').onclick = () => {
				let text = document.getElementsByTagName('textarea')[0].value;
				if(text.length > 0) {
					_this.socket.emit('sendMsg',text);
					_this.showMessage(_this.name,text);
					document.getElementsByTagName('textarea')[0].value = '';
				}
			}
			document.getElementsByClassName('emoji_btn')[0].onclick = () => {
				if(wrapper.style.display=='none') {
					wrapper.style.display = 'block';
				}else {
					wrapper.style.display = 'none';
				}
			}
			document.getElementsByClassName('emoji_wrapper')[0].addEventListener('click', (e) => {
				let event = e || window.event;
				let src = event.target || event.srcElement;
				let text = `[emoji::${src.getAttribute('data')}]`;
				_this.socket.emit('sendMsg',text);
				_this.showMessage(_this.name,text);
				
			}, false);
		})
		this.socket.on('nameExits', () => {
			document.getElementsByClassName('info')[0].innerHTML = '昵称已被占用';
		})
		this.socket.on('success', () => {
			document.getElementsByClassName('layer')[0].style.display = 'none';
			document.getElementsByClassName('title')[0].innerHTML = `Hi ${_this.name} Welcome :)`;
			document.getElementById('messageInp').focus();
		})
		this.socket.on('system', (name, count, type) => {
			console.log(name,type);
			let msg = `${name} ${(type=="login") ? '进入了聊天室' : '离开了聊天室'}`;
			 _this.showMessage('system',msg,'red');
			 document.getElementById('online_people').innerHTML = `当前有${count}人在线`;
		})
		this.socket.on('newMsg', (user,msg) => {
			_this.showMessage(user,msg);
		})


	}
	showMessage (user, msg, color) {
		const _this = this;
		
		if(user == 'system') {
			user = '系统消息';
		}
		const $container = document.getElementById('historyMessage');
		const time = new Date().toTimeString().substr(0,8);
		let p = null;
		if(/emoji::\d+/.test(msg)) {
			p = document.createElement('p');
			p.innerHTML =  `${user}<span class="time">(${time})：</span><img src="http://hichat.herokuapp.com/content/emoji/${msg.match(/\d+/)[0]}.gif">`;
			$container.appendChild(p);
		}else {
			p = document.createElement('p');
			p.style.color = color || '#000';
			p.innerHTML = `${user}<span class="time">(${time})：</span>${msg}`;
			$container.appendChild(p);
		}
		$container.scrollTop = $container.scrollHeight;
	}
	createEmoji () {
		for(let i = 1; i < 69; i++) {
			const $img = new Image();
			$img.src = `http://hichat.herokuapp.com/content/emoji/${i}.gif`;
			$img.setAttribute('data',i);
			document.getElementsByClassName('emoji_wrapper')[0].appendChild($img);
		}
	}
}

window.onload = () => {
	const app = new App();
	app.init();
}