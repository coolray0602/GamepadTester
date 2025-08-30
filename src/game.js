var gamepads = navigator.getGamepads();;
var focusGamepad = 0; //目前測試中的手柄編號
var t;	//定時器左搖桿
var joystick1;
var originalTimeStamp = [-1,-1,-1,-1,-1];
var isSwitch = false;
var fps = 0;
var joystickConnected = false;
var joystickBtnCanvas = document.getElementById("joystickBtns");
var jbctx = joystickBtnCanvas.getContext("2d");
const circleRadius = 450;
const ctxCenter=500;
const ctxWidth=1000;
var gaming=false;
var startTime=Date.now();
var lastPixel;
var usedTime;

const isMacChrome = navigator.platform.toUpperCase().includes('MAC') && 
                    navigator.userAgent.includes('Chrome');
jbctx.fillStyle = '#ffffff';
jbctx.strokeStyle = '#ffffff';
letter=["A","B","X","Y","L1","R1","L2","R2","⿻","≡","L3","R3","↑","↓","←","→"];
letterPos=[19,19,19,19,15,14,15,13,15,19,15,13,20,20,16,17];
pushBtnColor = "0,0,0";
btnColor=["156,217,94","229,47,45","42,147,205","234,214,41",pushBtnColor,pushBtnColor,pushBtnColor,pushBtnColor,pushBtnColor,pushBtnColor,pushBtnColor,pushBtnColor,pushBtnColor,pushBtnColor,pushBtnColor,pushBtnColor];
for(i=0;i<=1;i++){
	for(j=0;j<=7;j++){
		jbctx.beginPath();
		jbctx.arc(25+50*j, 25+80*i, 15, 0, Math.PI * 2, true);
		jbctx.font="18px Arial";
		jbctx.fillText(letter[i*8+j],letterPos[i*8+j]+50*j,32+80*i,40);
		jbctx.stroke();
		jbctx.font="16px Arial";
		jbctx.fillText("0.00",10+50*j,62+i*80,40);
		jbctx.stroke();
	}
}

window.addEventListener("gamepadconnected", (event) => {
	console.log("A gamepad connected: "+event.gamepad.id);
	
	gamepads = navigator.getGamepads();
	document.getElementById("joystickConnection"+event.gamepad.index).style.color = "green";
	document.getElementById("joystickConnection"+event.gamepad.index).innerHTML = event.gamepad.id;
	if(typeof(joystick1)=="undefined"){
		
		joystickConnected=true;
		if(event.gamepad.id.toLowerCase().indexOf("switch")!=-1){
			isSwitch=true;
			console.log("Connected a Nintendo Switch Gamepad");
		}else{
			isSwitch=false;
		}

		joystick1=new myJoystick("left-joystick","left-x-axes","left-y-axes",0,1,"curveCanvas1");
		
		gameLoop();
		var timestampTimer = setInterval("updateTimestamp()",1000);
	}
	originalTimeStamp[event.gamepad.index]=Date.parse(new Date());
	
});

function gameLoop() {
  joystick1.changeState();
  requestAnimationFrame(gameLoop);
}

// 检查当前是否有任何手柄连接
function checkGamepadsConnected() {
    if (gamepads[focusGamepad]) {
		return true; // 至少有一个手柄连接且該手柄現在被選中
    }
    return false; // 没有手柄连接
}

function getTimeFormat(timestamp) {
	let usedTime = Date.now()-timestamp; // 相差的微秒数
	let days = Math.floor(usedTime / (24 * 3600000)); // 计算出天数
	let leavel = usedTime % (24 * 3600000); // 计算天数后剩余的时间
	let hours = Math.floor(leavel / (3600000)); // 计算剩余的小时数
	let leavel2 = leavel % (3600000); // 计算剩余小时后剩余的秒数
	let minutes = Math.floor(leavel2 / 60000); // 计算剩余的分钟数
	let leavel3 = leavel2 % (60000); // 计算剩余分鐘后剩余的秒数
	let seconds = Math.floor(leavel3 / 1000);// 计算剩余的秒数
	let mseconds = Math.floor(leavel3 % 1000);// 计算剩余的毫秒数
	
	let total = "";
	if(days>0)	total=days+" day ";
	if(hours>0)	{
		if(hours<10) total+="0"+hours+":";
		else total+=(hours+":");
	}else total+="00:";
	if(minutes>0) {
		if(minutes<10) total+="0"+minutes+":";
		else total+=(minutes+":");
	}else total+="00:";
	if(seconds>0) {
		if(seconds<10) total+="0"+seconds;
		else total+=(seconds+"");
	}else total+="00";
	if(mseconds>0) {
		if(mseconds<10) total+=".00"+mseconds;
		else if(mseconds<100) total+=".0"+mseconds;
		else total+="."+mseconds;
	}else total+=".000";
	return total;
}
function updateTimestamp(){	//每秒執行一次

	document.getElementById("fps").innerHTML=fps;
	fps=0;
	
	gamepads = navigator.getGamepads();
	for(i=0;i<=3;i++){
		if(originalTimeStamp[i]>0){
			let usedTime = (Date.parse(new Date())-originalTimeStamp[i])/1000; // 相差的秒数
			let days = Math.floor(usedTime / (24 * 3600)); // 计算出天数
			let leavel = usedTime % (24 * 3600); // 计算天数后剩余的时间
			let hours = Math.floor(leavel / (3600)); // 计算剩余的小时数
			let leavel2 = leavel % (3600); // 计算剩余小时后剩余的秒数
			let minutes = Math.floor(leavel2 / 60); // 计算剩余的分钟数
			let seconds = Math.floor(leavel2 % 60);// 计算剩余的秒数
			let total = "";
			if(days>0)	total=days+" day ";
			if(hours>0)	{
				if(hours<10) total+="0"+hours+":";
				else total+=(hours+":");
			}else total+="00:";
			if(minutes>0) {
				if(minutes<10) total+="0"+minutes+":";
				else total+=(minutes+":");
			}else total+="00:";
			if(seconds>0) {
				if(seconds<10) total+="0"+seconds;
				else total+=(seconds+"");
			}else total+="00";
			document.getElementById("joystickConnectionTime"+i).innerHTML = total;
		}else{
			document.getElementById("joystickConnectionTime"+i).innerHTML = "";
		}
	}
}

window.addEventListener("gamepaddisconnected", (event) => {
	console.log("Joystick"+(event.gamepad.index+1)+" disconnected");
	console.log(event.gamepad);
	document.getElementById("joystickConnection"+event.gamepad.index).style.color = "red";
	document.getElementById("joystickConnection"+event.gamepad.index).textContent = "Disconnected";
	originalTimeStamp[event.gamepad.index]=-1;
});
for(a=0;a<=3;a++){
	document.getElementById("joystickConnection"+a).style.color = "red";
	document.getElementById("joystickConnection"+a).textContent = "Disconnected";
}

function setBtnColor(btn){
	vibeBtn1.style.backgroundColor="";
	vibeBtn2.style.backgroundColor="";
	vibeBtn3.style.backgroundColor="";
	vibeBtn4.style.backgroundColor="";
	btn.style.backgroundColor="lightyellow";
}
var vibeBtn1=document.getElementById("vibe1");
vibeBtn1.onclick = function(){
	if(gamepads[0]){
		gamepads[0].vibrationActuator.playEffect("dual-rumble", {
		  startDelay: 0,
		  duration: 1000,
		  weakMagnitude: 1.0,
		  strongMagnitude: 1.0,
		});
		focusGamepad=0;
		setBtnColor(vibeBtn1);
	}else{
		alert("此手柄未連接");
	}
}
var vibeBtn2=document.getElementById("vibe2");
vibeBtn2.onclick = function(){
	if(gamepads[1]){
		gamepads[1].vibrationActuator.playEffect("dual-rumble", {
		  startDelay: 0,
		  duration: 1000,
		  weakMagnitude: 1.0,
		  strongMagnitude: 1.0,
		});
		focusGamepad=1;
		setBtnColor(vibeBtn2);
	}else{
		alert("此手柄未連接");
	}
}
var vibeBtn3=document.getElementById("vibe3");
vibeBtn3.onclick = function(){
	if(gamepads[2]){
		gamepads[2].vibrationActuator.playEffect("dual-rumble", {
		  startDelay: 0,
		  duration: 1000,
		  weakMagnitude: 1.0,
		  strongMagnitude: 1.0,
		});
		focusGamepad=2;
		setBtnColor(vibeBtn3);
	}else{
		alert("此手柄未連接");
	}
}
var vibeBtn4=document.getElementById("vibe4");
vibeBtn4.onclick = function(){
	if(gamepads[3]){
		gamepads[3].vibrationActuator.playEffect("dual-rumble", {
		  startDelay: 0,
		  duration: 1000,
		  weakMagnitude: 1.0,
		  strongMagnitude: 1.0,
		});
		focusGamepad=3;
		setBtnColor(vibeBtn4);
	}else{
		alert("此手柄未連接");
	}	
}

var gamepadCanvas = document.getElementById('gamepadImg');
gamepadContext = gamepadCanvas.getContext('2d');

base_image = new Image();
base_image.src = 'images/gamepad.png';
base_image.onload = function(){
	gamepadContext.drawImage(base_image, 0, 0);
}
var logo_image = new Image();
logo_image.src='images/favorlogo.png';

logo_image.onload=function(){
	gamepadContext.drawImage(logo_image, 135, 130,30,30);
}
var joystickCanvas = document.getElementById("left-joystick");
var ctx = joystickCanvas.getContext("2d");
var trackCanvas = document.getElementById("left-joystick-track");
var trackCtx = trackCanvas.getContext("2d");
var mapCanvas = document.getElementById("map");
var mapCtx = mapCanvas.getContext("2d", { willReadFrequently: true });
const img = new Image();
img.src = 'images/map.png';

img.onload = function() {
  // 繪製圖片
  mapCtx.drawImage(img, 0, 0);
};

class myJoystick{	//左搖桿控制五支手柄的左搖桿，右搖桿亦然

	constructor(pid,xv,yv,xn,yn,cid){
		this.curveCanvasID;	//畫波形圖用的element id
		this.positionId=pid;	//畫圖及位置
		this.xValue=xv; //x值顯示用的element id
		this.yValue=yv; //y值顯示用的element id
		this.xAxesNumber=xn; //x軸在手柄裡的編號
		this.yAxesNumber=yn; //y軸在手柄裡的編號
		this.curveCanvasID=cid;
		this.x=gamepads[focusGamepad].axes[this.xAxesNumber];
		this.y=gamepads[focusGamepad].axes[this.yAxesNumber];
	}
	
	changeState(){ 
		gamepads = navigator.getGamepads();
		if(checkGamepadsConnected()){		
			this.x=gamepads[focusGamepad].axes[this.xAxesNumber];
			this.y=gamepads[focusGamepad].axes[this.yAxesNumber];
			if(document.getElementById("xOpposite").checked){
				this.x*=-1;
			}
			if(document.getElementById("yOpposite").checked){
				this.y*=-1;
			}
			if(isMacChrome)	this.y*=-1;	
			fps++;

			jbctx.clearRect(0,0,joystickBtnCanvas.width,joystickBtnCanvas.height);
			jbctx.fillStyle = '#ffffff';
			jbctx.strokeStyle = '#ffffff';
			gamepadContext.clearRect(0,0,gamepadCanvas.width,gamepadCanvas.height);
			gamepadContext.drawImage(base_image, 0, 0);
			gamepadContext.drawImage(logo_image, 135, 125,30,30);
			var myBtn=new Array(16);
			var btnNumber=16;
			if(isSwitch)btnNumber=12;
			for (var m=0;m<btnNumber;m++){
				myBtn[m]=gamepads[focusGamepad].buttons[m].value;
			}
			if(isSwitch) {
				if(gamepads[focusGamepad].axes[9]>1){
					myBtn[12]=0;
					myBtn[13]=0;
					myBtn[14]=0;
					myBtn[15]=0;
				}else if(gamepads[focusGamepad].axes[9]<-0.5){
					myBtn[12]=1;
					myBtn[13]=0;
					myBtn[14]=0;
					myBtn[15]=0;
				}else if(gamepads[focusGamepad].axes[9]<0){
					myBtn[12]=0;
					myBtn[13]=0;
					myBtn[14]=0;
					myBtn[15]=1;
				}else if(gamepads[focusGamepad].axes[9]<0.5){
					myBtn[12]=0;
					myBtn[13]=1;
					myBtn[14]=0;
					myBtn[15]=0;
				}else if(gamepads[focusGamepad].axes[9]<1){
					myBtn[12]=0;
					myBtn[13]=0;
					myBtn[14]=1;
					myBtn[15]=0;
				}
			}
			for(var btnIndex=0;btnIndex<16;btnIndex++){
					this.drawGamepadBtn(btnIndex,myBtn[btnIndex]);			
					gamepadContext.stroke();
					gamepadContext.fill();
			}		

			//畫軌跡
			if(document.getElementById("track"+this.xAxesNumber).checked){
				if(this.lastTrackx==-100) this.lastTrackx=this.x;
				if(this.lastTracky==-100) this.lastTracky=this.y;
				//畫搖桿XY位置點
				trackCtx.beginPath();
				trackCtx.strokeStyle = 'rgba(0, 0, 255, 0.6)';
				trackCtx.lineWidth=3;
				trackCtx.moveTo(ctxCenter+this.lastTrackx*circleRadius, ctxCenter+this.lastTracky*circleRadius);
				trackCtx.lineTo(ctxCenter+this.x*circleRadius, ctxCenter+this.y*circleRadius);
				trackCtx.stroke();
				this.lastTrackx=this.x;
				this.lastTracky=this.y;
			}else{
				trackCtx.clearRect(0,0,ctxWidth,ctxWidth);
			}
			ctx.clearRect(0, 0, ctxWidth, ctxWidth);
			//畫十字線
			ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
			ctx.moveTo(ctxCenter,0);
			ctx.lineTo(ctxCenter,ctxWidth);
			ctx.moveTo(0,ctxCenter);
			ctx.lineTo(ctxWidth,ctxCenter);
			ctx.stroke();
			
			//畫搖桿XY位置點
			ctx.beginPath();
			ctx.fillStyle = "black";
			ctx.arc(ctxCenter+this.x*circleRadius, ctxCenter+this.y*circleRadius, 3, 0, Math.PI * 2, true);
			
			ctx.fill();
			const pixel = mapCtx.getImageData(ctxCenter+this.x*circleRadius, ctxCenter+this.y*circleRadius, 1, 1).data;
			
  			// 轉換為十六進制顏色碼
  			const toHex = (v) => v.toString(16).padStart(2, '0');
  			const hexColor = `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`;
			//console.log(`位置 (${this.x},${this.y}) 顏色: ${hexColor}, 透明度: ${pixel[3]/255}`);
			ctx.fillStyle = '#ffffff';
			ctx.font="50px Arial";
			if(hexColor=="#1a91e5"){
				startTime=Date.now();
				gaming=true;
				trackCtx.clearRect(0,0,ctxWidth,ctxWidth);
			}else if(hexColor=="#ffffff" && gaming){
				ctx.fillText(getTimeFormat(startTime),700,50);
			}else if(hexColor=="#ff0000" && gaming){
				gaming=false;
				usedTime=(Date.now()-startTime);
				document.getElementById("usedTime").innerHTML=usedTime/1000.0;
				trackCtx.clearRect(0,0,ctxWidth,ctxWidth); 
			    document.getElementById('formPopup').style.display = 'block';
      			document.getElementById('overlay').style.display = 'block';
				document.getElementById("submitBtn").disabled = false;
				document.getElementById("submitBtn").innerText = '送出';
				document.getElementById('resultMsg').innerText = '';
			}else if(gaming){
				alert("失敗了，請將搖桿放回到中心藍色區域");
				trackCtx.clearRect(0,0,ctxWidth,ctxWidth);
				gaming=false;
			}
		}
	}

	drawGamepadBtn(btnIndex,btnValue){
		var i=0;
		var j=btnIndex%8;
		if(btnIndex>=8) i=1;
		
		jbctx.beginPath();
		jbctx.fillStyle="rgba("+btnColor[btnIndex]+","+btnValue+")";
		jbctx.arc(25+50*j, 25+i*80, 15, 0, Math.PI * 2, true);
		jbctx.fill();
		jbctx.font="18px Arial";
		
		jbctx.fillStyle="#ffffff";
		
		jbctx.fillText(letter[btnIndex],letterPos[btnIndex]+50*j,32+i*80,40);
		jbctx.stroke();
		
		jbctx.font="16px Arial";
		jbctx.fillText(btnValue.toFixed(2),10+50*j,62+i*80,40);
		jbctx.stroke();
		
		gamepadContext.beginPath();
		gamepadContext.fillStyle="rgba("+btnColor[btnIndex]+","+btnValue+")";

		switch (btnIndex){
			case 0:
				gamepadContext.arc(216, 134, 9, 0, Math.PI * 2, true);
				break;
			case 1:
				gamepadContext.arc(236, 114, 9, 0, Math.PI * 2, true);
				break;
			case 2:
				gamepadContext.arc(196, 114, 9, 0, Math.PI * 2, true);
				break;
			case 3:
				gamepadContext.arc(216, 94, 9, 0, Math.PI * 2, true);
				break;
			case 4:
				gamepadContext.rect(67, 40, 37, 14);
				break;
			case 5:
				gamepadContext.rect(197, 40, 37, 14);
				break;
			case 6:
				gamepadContext.rect(77, 8, 20, 22);
				break;
			case 7:
				gamepadContext.rect(206, 8, 20, 22);
				break;
			case 8:
				gamepadContext.arc(133, 71, 9, 0, Math.PI * 2, true);
				break;
			case 9:
				gamepadContext.arc(173, 71, 9, 0, Math.PI * 2, true);
				break;
			case 10:
				gamepadContext.arc(109+joystick1.x*7, 187+joystick1.y*7, 18, 0, Math.PI * 2, true);
				break;
			case 11:
				break;
			case 12:
				gamepadContext.moveTo(75,88);
				gamepadContext.lineTo(92,88);
				gamepadContext.lineTo(92,101);
				gamepadContext.lineTo(83.5,110);
				gamepadContext.lineTo(75,101);
				gamepadContext.closePath()
				break;
			case 13:
				gamepadContext.moveTo(83.5,120);
				gamepadContext.lineTo(92,128);
				gamepadContext.lineTo(92,141);
				gamepadContext.lineTo(75,141);
				gamepadContext.lineTo(75,128);
				gamepadContext.closePath()
				break;
			case 14:
				gamepadContext.moveTo(57,106);
				gamepadContext.lineTo(70,106);
				gamepadContext.lineTo(79,114.5);
				gamepadContext.lineTo(70,123);
				gamepadContext.lineTo(57,123);
				gamepadContext.closePath()
				break;
			case 15:
				gamepadContext.moveTo(88,114.5);
				gamepadContext.lineTo(97,106);
				gamepadContext.lineTo(110,106);
				gamepadContext.lineTo(110,123);
				gamepadContext.lineTo(97,123);
				gamepadContext.closePath()
				break;
		}
	}
}
function closeForm() {
	document.getElementById('formPopup').style.display = 'none';
	document.getElementById('overlay').style.display = 'none';
}

// 提交分數
function submitScore() {
	const name = document.getElementById('name').value.trim();
	const comment = document.getElementById('comment').value.trim();
	if (!name) {
		alert("請輸入姓名");
		return;
	}
	
	if (!isValidInput(name) || !isValidInput(comment)) {
		alert("請勿輸入非法字元");
		return;
	}

	const submitBtn = document.getElementById('submitBtn');
	document.getElementById("submitBtn").disabled = true;
	document.getElementById("submitBtn").innerText = '送出中...';

	const formData = new URLSearchParams();
	formData.append('name', name);
	formData.append('score', usedTime);
	formData.append('comment', comment);

	fetch('submit.asp', {
	method: 'POST',
	headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	body: formData.toString()
	})
	.then(response => response.text())
	.then(text => {
	document.getElementById('resultMsg').innerText = text.includes("成功") ? "✅ 成功送出" : "❌ 送出失敗";
	if (text.includes("成功")) {
		setTimeout(() => {
		closeForm();
		}, 2000);
		updateScoreTable();
	}
	})
	.catch(error => {
	document.getElementById('resultMsg').innerText = "❌ 錯誤：" + error;
	});
}
function isValidInput(str) {
	// 只允許中英文、數字、空白、常見標點符號
	const pattern = /^[\u4e00-\u9fa5a-zA-Z0-9\s.,!?（）()「」:：;'"-]*$/;
	return pattern.test(str);
}

// 更新分數表格
function updateScoreTable() {
    fetch("get_scores.asp")
        .then(response => response.json())
        .then(data => {
            // 按分數（越小越前）排序
            data.sort((a, b) => Number(a.score) - Number(b.score));

            const tbody = document.querySelector("#scoreTable tbody");
            tbody.innerHTML = ""; // 清除舊資料

            // 顯示前 20 名
            data.slice(0, 20).forEach((row, index) => {
                // 壓縮時間格式
                let shortTime = row.playtime;
                try {
                    const date = new Date(row.playtime);
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const dd = String(date.getDate()).padStart(2, '0');
                    const hh = String(date.getHours()).padStart(2, '0');
                    const mi = String(date.getMinutes()).padStart(2, '0');
                    shortTime = `${mm}-${dd} ${hh}:${mi}`;
                } catch (e) {}

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="text-align: center;">${index + 1}</td>
                    <td style="word-break: break-word; white-space: normal; text-align: center;">${row.name}</td>
                    <td style="text-align: center;">${row.score/1000.0}</td>
                    <td style="text-align: center;">${shortTime}</td>
                    <td style="word-break: break-word; white-space: normal;" title="${row.comment}">${row.comment}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            alert("讀取資料失敗：" + error);
        });
}
window.addEventListener('DOMContentLoaded', updateScoreTable);