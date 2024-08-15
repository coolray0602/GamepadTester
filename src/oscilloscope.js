var gamepads;
var focusGamepad = 0; //目前測試中的手柄編號
var t;	//定時器左搖桿
var t2;	//定時器右搖桿
var joystick1;
var joystick2;
var originalTimeStamp = [-1,-1,-1,-1,-1];
var cycleCount = [[0,0],[0,0],[0,0],[0,0],[0,0]];
var cycleStates = new Array(5);
var isSwitch = false;
var isRoundLock = false;
var isRoundLock2 = false;
var fps = 0;
var linearityTesting = false;
var noiseCount=new Array(5); 	//五支手柄的雜音計數
var last2signal=new Array(5);	//五支手柄的每個搖桿的每個軸的前二信號
var curveCanvasWidth = 500;
var curveCanvasHeight =500;
var linearityCanvasSize = 500;

var returnAccuracy=0.15;		//測試線性時用的復歸精度，中間範圍不測，作為回中的依據
var xLinearityArray = new Array(); 

var yLinearityArray = new Array(); 

var xCenter;
var yCenter;
var joystickConnected = false;
var checkingResponseRate1 = false;
var checkingResponseRate2 = false;
var checkingresolution1=false;
var checkingresolution2=false;
var resolutionArr1=new Array();
var resolutionArr2=new Array();

var responseArr1 = new Array();
var responseArr2 = new Array();


//document.getElementById("noiseCriteria").innerHTML=noiseCriteria;

var joystickBtnCanvas = document.getElementById("joystickBtns");
var jbctx = joystickBtnCanvas.getContext("2d");

//jbctx.fillStyle = '#ffffff';
//jbctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // 最后一位 0.5 表示半透明度为 50%
//jbctx.fillRect(0, 0, joystickBtnCanvas.width, joystickBtnCanvas.height);
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

for(i=0;i<=4;i++){
	cycleStates[i]=new Array(2);
	last2signal[i]=new Array(2);	//每支手柄的左右搖桿
	noiseCount[i]=new Array(2);		//每支手柄的左右搖桿
	
	for(j=0;j<=1;j++){
		cycleStates[i][j]=new Array(4);
		noiseCount[i][j]=[0,0];		//每個搖桿的兩個軸的雜音計數，預設為0
		for(k=0;k<=3;k++){
			cycleStates[i][j][k]=false;
		}
		last2signal[i][j]=new Array(2);	//每支搖桿的兩個軸
		for(m=0;m<=1;m++){
			last2signal[i][j][m]=new Array(2);//每個軸的前兩個信號
		}
	}
}

//var cycleCount=[0,0];

window.addEventListener("gamepadconnected", (event) => {
	console.log("A gamepad connected: "+event.gamepad.id);
	
	gamepads = navigator.getGamepads();
	document.getElementById("joystickConnection"+event.gamepad.index).style.color = "green";
	document.getElementById("joystickConnection"+event.gamepad.index).innerHTML = event.gamepad.id;
	//if(event.gamepad.index==0){
		if(typeof(joystick1)=="undefined"){
			
			joystickConnected=true;
			if(event.gamepad.id.toLowerCase().indexOf("switch")!=-1){
				isSwitch=true;
				//switchBtn.checked=true;
				console.log("Connected a Nintendo Switch Gamepad");
			}else{
				isSwitch=false;
				//switchBtn.checked=false;
			}
			//console.log("joystick初始化");
			//左搖桿初始化
			joystick1=new myJoystick(gamepads,"left-joystick","left-x-axes","left-y-axes",0,1,"curveCanvas1");
			t=setInterval("joystick1.changeState()",1);  
			//右搖桿初始化
			if(isSwitch){
				joystick2=new myJoystick(gamepads,"right-joystick","right-x-axes","right-y-axes",2,5,"curveCanvas2");
			}else{
				joystick2=new myJoystick(gamepads,"right-joystick","right-x-axes","right-y-axes",2,3,"curveCanvas2");
			}
			t2=setInterval("joystick2.changeState()",1); 
			
			var timestampTimer = setInterval("updateTimestamp()",1000);
		}
	//}
	originalTimeStamp[event.gamepad.index]=Date.parse(new Date());
	
});



function updateTimestamp(){

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
	gamepads[0].vibrationActuator.playEffect("dual-rumble", {
	  startDelay: 0,
	  duration: 1000,
	  weakMagnitude: 1.0,
	  strongMagnitude: 1.0,
	});
	focusGamepad=0;
	setBtnColor(vibeBtn1);
}
var vibeBtn2=document.getElementById("vibe2");
vibeBtn2.onclick = function(){
	gamepads[1].vibrationActuator.playEffect("dual-rumble", {
	  startDelay: 0,
	  duration: 1000,
	  weakMagnitude: 1.0,
	  strongMagnitude: 1.0,
	});
	focusGamepad=1;
	setBtnColor(vibeBtn2);
}
var vibeBtn3=document.getElementById("vibe3");
vibeBtn3.onclick = function(){
	gamepads[2].vibrationActuator.playEffect("dual-rumble", {
	  startDelay: 0,
	  duration: 1000,
	  weakMagnitude: 1.0,
	  strongMagnitude: 1.0,
	});
	focusGamepad=2;
	setBtnColor(vibeBtn3);
}
var vibeBtn4=document.getElementById("vibe4");
vibeBtn4.onclick = function(){
	gamepads[3].vibrationActuator.playEffect("dual-rumble", {
	  startDelay: 0,
	  duration: 1000,
	  weakMagnitude: 1.0,
	  strongMagnitude: 1.0,
	});
	focusGamepad=3;
	setBtnColor(vibeBtn4);
}

var btn1 = document.getElementById("btn1");
var btn2 = document.getElementById("btn2");
btn1.onclick = function () {
	timerSwitch(btn1);
}
btn2.onclick = function () {
	timerSwitch(btn2);
}
var gamepadCanvas = document.getElementById('gamepadImg'),
gamepadContext = gamepadCanvas.getContext('2d');

base_image = new Image();
base_image.src = 'images/gamepad.png';
base_image.onload = function(){
	gamepadContext.drawImage(base_image, 0, 0);
}


bgBlack1.onclick=function(){
	joystick1.bgColor="black";
}
bgWhite1.onclick=function(){
	joystick1.bgColor="white";
}
bgBlack2.onclick=function(){
	joystick2.bgColor="black";
}
bgWhite2.onclick=function(){
	joystick2.bgColor="white";
}



function timerSwitch(btn){
	if(btn.value=="STOP"){
		if(btn.id=="btn1"){
			joystick1.testing=false;
			//clearInterval(t);
		}else if(btn.id=="btn2"){
			joystick2.testing=false;
			//clearInterval(t2);
		}
		btn.value="START";
	}else if(btn.value=="START"){
		if(btn.id=="btn1"){
			joystick1.testing=true;
			//t=setInterval("joystick1.changeState()",5);
		}else if(btn.id=="btn2"){
			joystick2.testing=true;
			//t2=setInterval("joystick2.changeState()",5);
		}
		btn.value="STOP";
	}
}
class myJoystick{	//左搖桿控制五支手柄的左搖桿，右搖桿亦然
	
	constructor(gamepad,pid,xv,yv,xn,yn,cid){
		this.testing=true;	//只控制一號搖桿的波形圖的測試暫停與繼續
		this.roundnessTest=false;
		this.roundArray = new Array();
		for (var i=0;i<=31;i++){
			this.roundArray[i]=0;
		}
		
		this.xPos=0;	//填進x軸陣列的位置
		this.xArray = new Array(); //x軸數組陣列
		this.xNoiseArray = new Array();
		this.yPos=0;	//填進y軸陣列的位置
		this.yArray = new Array(); //y軸數組陣列
		this.yNoiseArray = new Array();
//		this.maxNoise=0; //已測到最大雜音
//		this.noiseLimit=1;	//雜音警告上限百分比

		this.curveCanvasID;	//畫波形圖用的element id
		
		this.gamepads=gamepad;
		this.positionId=pid;	//畫圖及位置
		this.xValue=xv; //x值顯示用的element id
		this.yValue=yv; //y值顯示用的element id
		this.xAxesNumber=xn; //x軸在手柄裡的編號
		this.yAxesNumber=yn; //y軸在手柄裡的編號
		this.curveCanvasID=cid;
		this.checkStaticNoise=false;
		this.xStaticNoiseMax=0;
		this.yStaticNoiseMax=0;
		this.staticX=0;
		this.staticY=0;
		
		this.leftx=0;
		this.rightx=0;
		this.lefty=0;
		this.righty=0;
		
		this.bgColor="white";

	}
	
	changeState(){  
		if(this.xAxesNumber==0)	{	//只在左搖桿時作的事
			fps++;

			if(gamepads[focusGamepad]!=null && gamepads[focusGamepad].connected){
				jbctx.clearRect(0,0,joystickBtnCanvas.width,joystickBtnCanvas.height);
				//jbctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // 最后一位 0.5 表示半透明度为 50%
				//jbctx.fillRect(0, 0, joystickBtnCanvas.width, joystickBtnCanvas.height);
				jbctx.fillStyle = '#ffffff';
				jbctx.strokeStyle = '#ffffff';
				gamepadContext.clearRect(0,0,gamepadCanvas.width,gamepadCanvas.height);
				gamepadContext.drawImage(base_image, 0, 0);
				var myBtn=new Array(16);
				var btnNumber=16;
				if(isSwitch)btnNumber=12;
				
				
				for (m=0;m<btnNumber;m++){
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
					/*var temp=myBtn[0];
					myBtn[0]=myBtn[1];
					myBtn[1]=temp;*/
				}
				for(var btnIndex=0;btnIndex<16;btnIndex++){

						this.drawGamepadBtn(btnIndex,myBtn[btnIndex]);
						
						gamepadContext.stroke();
						gamepadContext.fill();

				}
				
			}
			
		}
		gamepads = navigator.getGamepads();
		if(gamepads[focusGamepad]!==null && gamepads[focusGamepad].connected){

			var x=gamepads[focusGamepad].axes[this.xAxesNumber];
			var y=gamepads[focusGamepad].axes[this.yAxesNumber];

			

			if(this.testing){
				var c = document.getElementById(this.curveCanvasID);
				var context = c.getContext("2d");
				context.clearRect(0,0,curveCanvasWidth,curveCanvasHeight);
				
				
				context.fillStyle = this.bgColor;
				context.fillRect(0,0,curveCanvasWidth,curveCanvasHeight);
				
				context.strokeStyle="rgba(185,177,168,0.2)";
				for(var i=10;i<curveCanvasHeight;i+=10){
					context.moveTo(i,0);
					context.lineTo(i,curveCanvasHeight);
				}
				for(var j=10;j<curveCanvasWidth;j+=10){
					context.moveTo(0,j);
					context.lineTo(curveCanvasWidth,j);
				}
				if(this.bgColor=="black"){
					context.fillStyle = "white";
				}else{
					context.fillStyle = "black";
				}
				context.font="15px Arial ";
				context.textAlign="left";
				context.fillText("←Time",curveCanvasWidth/2,curveCanvasHeight-10);
				context.fillText("Output%",10,20);
				context.fillStyle="green";
				context.fillText("X",5,170);
				for(var i=0;i<=4;i++){
					context.fillText(i*25+"%",5,50+i*50);
				}
				context.fillStyle="blue";
				
				context.textAlign="right";
				context.fillText("Y",curveCanvasWidth-5,curveCanvasHeight-130);
				for(var i=0;i<=4;i++){
					context.fillText(i*25+"%",curveCanvasWidth-5,curveCanvasHeight-250+i*50);
				}
				context.stroke();
				
				
				var xInfo=this.drawCurve(this.xPos,this.xArray,this.curveCanvasID,"green",150,this.xAxesNumber,this.xNoiseArray);
				this.xPos=xInfo[0];
				this.xArray=xInfo[1];
				this.xNoiseArray=xInfo[2];
				
				var yInfo=this.drawCurve(this.yPos,this.yArray,this.curveCanvasID,"blue",curveCanvasHeight-150,this.yAxesNumber,this.yNoiseArray);
				this.yPos=yInfo[0];
				this.yArray=yInfo[1];
				this.yNoiseArray=yInfo[2];
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
		var x1=gamepads[focusGamepad].axes[0];
		var y1=gamepads[focusGamepad].axes[1];
		var x2=gamepads[focusGamepad].axes[2];
		var y2=gamepads[focusGamepad].axes[3];
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
				gamepadContext.arc(109+x1*7, 187+y1*7, 18, 0, Math.PI * 2, true);
				break;
			case 11:
				gamepadContext.arc(188+x2*7, 187+y2*7, 18, 0, Math.PI * 2, true);
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
	//畫波形圖
	drawCurve(pos,arr,id,color,center,axesNumber,noiseArray){ //pos:全域變數波型陣列此次填入的位置，arr:全域變數波型暫存陣列，id: 波型圖element id，color：波形顏色，center：波型居中位置，axesNumber：搖桿軸編號
		
		if(gamepads[focusGamepad].connected){
			//if (this.maxNoise>5)console.log("最大雜波："+this.maxNoise);
			//寫入曲線點
			arr[pos]=gamepads[focusGamepad].axes[axesNumber];
			
			var c = document.getElementById(id);
			var context = c.getContext("2d");
			//context.fillStyle = "red";


			var startPos=pos+1;	//陣列中開始讀取曲線數據的位置，是這次寫入點的下一格，所以這次的寫入點永遠在波型圖的最後
			if(startPos>=curveCanvasWidth) startPos=0;
			
			var lastPos=pos-1;	//前一個曲線點的位置
			var last2Pos=pos-2;	//前二個曲線點的位置
			if(lastPos<0) lastPos=curveCanvasWidth-1;
			if(last2Pos==-1){
				last2Pos=curveCanvasWidth-1;
			}else if(last2Pos==-2){
				last2Pos=curveCanvasWidth-2;
			}
			
			if(!isNaN(arr[lastPos]) && !isNaN(arr[pos]) && !isNaN(arr[last2Pos])) {	
			/*
				if(arr[lastPos]>arr[pos] && arr[lastPos]>arr[last2Pos]){
				
					var noise = Math.abs((arr[lastPos]-(arr[pos]>arr[last2Pos]?arr[pos]:arr[last2Pos]))*50);
					if (noise>noiseCriteria) {	
						//if(noise>this.maxNoise) this.maxNoise=noise;
						
						//console.log("雜波："+noise.toFixed(1)+"%，前2："+(arr[last2Pos]*100).toFixed(1)+"% 前1："+(arr[lastPos]*100).toFixed(1)+"% 現在："+(arr[pos]*100).toFixed(1)+"%");
						noiseArray[pos]=1;
					}
				}else{
					noiseArray[pos]=0;
				}
				*/
				//測靜態雜波
				var noise;
				if(this.checkStaticNoise){
					
					if(axesNumber%2==0){ //x軸
						noise = Math.abs((arr[pos]-this.staticX)*50);
						if(noise > this.xStaticNoiseMax) {
							this.xStaticNoiseMax=noise;
						}
						
						document.getElementById("staticResult"+axesNumber%4).innerHTML=this.xStaticNoiseMax.toFixed(1)+"%";

					}else if (axesNumber%2==1){ //y軸
						noise = Math.abs((arr[pos]-this.staticY)*50);
						if(noise>this.yStaticNoiseMax) {
							this.yStaticNoiseMax=noise;
						}
						document.getElementById("staticResult"+axesNumber%4).innerHTML=this.yStaticNoiseMax.toFixed(1)+"%";
					}
					
				}
			}
			
			//畫波形圖及雜音點
			for(var i=1;i<curveCanvasWidth;i++){
				
				lastPos=startPos-1;	//前一個曲線點的位置
				if(lastPos<0) lastPos=curveCanvasWidth-1;
				if(!isNaN(arr[lastPos]) && !isNaN(arr[startPos])){	
					/*
					if(noiseArray[lastPos]){
						context.strokeStyle = "red";
						context.strokeRect(i-10, center+arr[lastPos]*200-10, 20, 20);
					}*/
					//畫曲線
					context.strokeStyle = color;
					context.beginPath();
					
					context.moveTo(i-1,center+arr[lastPos]*100);
					context.lineTo(i,center+arr[startPos]*100);
					context.stroke();
					context.closePath();
				}
				startPos++;
				if(startPos>=curveCanvasWidth) startPos=0;
			}
			pos++; //回傳下一次要填入陣列的數據位置
			if(pos>=curveCanvasWidth) pos=0;
			return [pos,arr,noiseArray];
		}
	}
}
