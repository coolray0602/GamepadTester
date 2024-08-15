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

var outDeadzone=1.5; //outer deadzone limitation setup for linearity test

var joystickBtnCanvas = document.getElementById("joystickBtns");
var jbctx = joystickBtnCanvas.getContext("2d");
/*
var switchBtn = document.getElementById("nds");
switchBtn.onclick = function(){
	if(switchBtn.checked){
		isSwitch=true;
		console.log("isswitch:"+isSwitch);
	}else isSwitch=false;
}*/



var indXY=[[0,0],[0,0]];
var indEdgs=[new Array(32),new Array(32)];
indEdgs[0].fill(0);
indEdgs[1].fill(0);
var circleCheck=[[false,false,false,false],[false,false,false,false]]
var circleCount=[0,0];
var findingEdge=[false,false];

document.getElementById("edgeValueL").style.color="red";
document.getElementById("edgeValueR").style.color="red";

centerLXY=document.getElementById("centerLXY");
centerRXY=document.getElementById("centerRXY");
individualCenter=document.getElementById("individualCenter");
individualCenter.onclick = function(){
		getIndCenter();
}
function getIndCenter(){
	indXY[0][0]=gamepads[focusGamepad].axes[0];
	indXY[0][1]=gamepads[focusGamepad].axes[1];
	indXY[1][0]=gamepads[focusGamepad].axes[2];
	indXY[1][1]=gamepads[focusGamepad].axes[3];
	centerLXY.innerHTML="("+indXY[0][0].toFixed(2)+","+indXY[0][1].toFixed(2)+")";
	centerRXY.innerHTML="("+indXY[1][0].toFixed(2)+","+indXY[1][1].toFixed(2)+")";
}

function getEdges(side){
	circleCount[side]=0;
	findingEdge[side]=true;
	indEdgs[side].fill(0);
	if(side==0){
		document.getElementById("edgeValueL").innerHTML="No Data";
		document.getElementById("edgeValueL").style.color="red";
	}else{
		document.getElementById("edgeValueR").innerHTML="No Data";
		document.getElementById("edgeValueR").style.color="red";
	}
}

generalOption=document.getElementById("generalOption");
individualOption=document.getElementById("individualOption");
noneOption=document.getElementById("noneOption");
rbnone = document.getElementById("RBnone");
noneOption.style.opacity=1;
generalOption.style.opacity=0.2;
individualOption.style.opacity=0.2;	
rbnone.addEventListener('change', function() {
	// 当单选按钮被选中时，执行相应的动作
	if (this.checked) {
		//console.log(`选中的单选按钮是：${this.id}`);
		// 这里可以添加其他你想要执行的动作
		noneOption.style.opacity=1;
		generalOption.style.opacity=0.2;
		individualOption.style.opacity=0.2;	
		
	}
});
rbGeneral = document.getElementById("RBgeneral");
rbGeneral.addEventListener('change', function() {
	// 当单选按钮被选中时，执行相应的动作
	if (this.checked) {
		//console.log(`选中的单选按钮是：${this.id}`);
		// 这里可以添加其他你想要执行的动作
		noneOption.style.opacity=0.2;
		generalOption.style.opacity=1;
		individualOption.style.opacity=0.2;	
		
	}
});
rbIndividual = document.getElementById("RBindividual");
rbIndividual.addEventListener('change', function() {
	// 当单选按钮被选中时，执行相应的动作
	if (this.checked) {
		//console.log(`选中的单选按钮是：${this.id}`);
		// 这里可以添加其他你想要执行的动作
		noneOption.style.opacity=0.2;
		generalOption.style.opacity=0.2;
		individualOption.style.opacity=1;	
		getIndCenter();
		getEdges(0);
		getEdges(1);
	}
});

edgeBtnL=document.getElementById("edgeBtnL");
edgeBtnL.onclick=function(){
	getEdges(0);
}

edgeBtnR=document.getElementById("edgeBtnR");
edgeBtnR.onclick=function(){
	getEdges(1);
}

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

var gamepadCanvas = document.getElementById('gamepadImg'),
gamepadContext = gamepadCanvas.getContext('2d');

base_image = new Image();
base_image.src = 'images/gamepad.png';
base_image.onload = function(){
	gamepadContext.drawImage(base_image, 0, 0);
}

var staticNoiseCB1 = document.getElementById("staticNoiseCB1");
staticNoiseCB1.addEventListener('change', (event) => {
	if (event.currentTarget.checked) {
		joystick1.xStaticNoiseMax=0;
		joystick1.yStaticNoiseMax=0;
		var nowX=joystick1.xPos-1;
		if (nowX<0) nowX=999;
		var nowY=joystick1.yPos-1;
		if (nowY<0) nowY=999;
		joystick1.staticX=gamepads[focusGamepad].axes[0];
		joystick1.staticY=gamepads[focusGamepad].axes[1];
		joystick1.checkStaticNoise=true;
	}
})
var staticNoiseCB2 = document.getElementById("staticNoiseCB2");
staticNoiseCB2.addEventListener('change', (event) => {
	if (event.currentTarget.checked) {
		joystick2.xStaticNoiseMax=0;
		joystick2.yStaticNoiseMax=0;
		var nowX=joystick2.xPos-1;
		if (nowX<0) nowX=999;
		var nowY=joystick2.yPos-1;
		if (nowY<0) nowY=999;
		joystick2.staticX=gamepads[focusGamepad].axes[2];
		joystick2.staticY=gamepads[focusGamepad].axes[3];
		joystick2.checkStaticNoise=true;
	}
})

var leftxbtn1 = document.getElementById("leftReturnBtn0");
var rightxbtn1 = document.getElementById("rightReturnBtn0");
var leftybtn1 = document.getElementById("leftReturnBtn1");
var rightybtn1 = document.getElementById("rightReturnBtn1");
var leftxbtn2 = document.getElementById("leftReturnBtn2");
var rightxbtn2 = document.getElementById("rightReturnBtn2");
var leftybtn2 = document.getElementById("leftReturnBtn3");
var rightybtn2 = document.getElementById("rightReturnBtn3");

leftxbtn1.onclick = function(){
	
	var nowX=joystick1.xPos-1;
	if (nowX<0) nowX=999;
	joystick1.leftx = gamepads[focusGamepad].axes[0];
	leftxbtn1.value="←\n"+joystick1.leftx.toFixed(2);
	//document.getElementById("leftReturnResult0").innerHTML=
}
rightxbtn1.onclick = function(){
	var nowX=joystick1.xPos-1;
	if (nowX<0) nowX=999;
	joystick1.rightx = gamepads[focusGamepad].axes[0];
	rightxbtn1.value="→\n"+joystick1.rightx.toFixed(2);
	//document.getElementById("rightReturnResult0").innerHTML=joystick1.rightx.toFixed(2);
}
leftybtn1.onclick = function(){
	var nowY=joystick1.yPos-1;
	if (nowY<0) nowY=999;
	joystick1.lefty = gamepads[focusGamepad].axes[1];
	leftybtn1.value="↑\n"+joystick1.lefty.toFixed(2);
	//document.getElementById("leftReturnResult1").innerHTML=joystick1.lefty.toFixed(2);
}
rightybtn1.onclick = function(){
	var nowY=joystick1.yPos-1;
	if (nowY<0) nowY=999;
	joystick1.righty = gamepads[focusGamepad].axes[1];
	rightybtn1.value="↓\n"+joystick1.righty.toFixed(2);
	//document.getElementById("rightReturnResult1").innerHTML=joystick1.righty.toFixed(2);
}
leftxbtn2.onclick = function(){
	var nowX=joystick2.xPos-1;
	if (nowX<0) nowX=999;
	joystick2.leftx = gamepads[focusGamepad].axes[2];
	leftxbtn2.value="←\n"+joystick2.leftx.toFixed(2);
	//document.getElementById("leftReturnResult2").innerHTML=joystick2.leftx.toFixed(2);
}
rightxbtn2.onclick = function(){
	var nowX=joystick2.xPos-1;
	if (nowX<0) nowX=999;
	joystick2.rightx = gamepads[focusGamepad].axes[2];
	rightxbtn2.value="→\n"+joystick2.rightx.toFixed(2);
	//document.getElementById("rightReturnResult2").innerHTML=joystick2.rightx.toFixed(2);
}
leftybtn2.onclick = function(){
	var nowY=joystick2.yPos-1;
	if (nowY<0) nowY=999;
	joystick2.lefty = gamepads[focusGamepad].axes[3];
	leftybtn2.value="↑\n"+joystick2.lefty.toFixed(2);
	//document.getElementById("leftReturnResult3").innerHTML=joystick2.lefty.toFixed(2);
}
rightybtn2.onclick = function(){
	var nowY=joystick2.yPos-1;
	if (nowY<0) nowY=999;
	joystick2.righty = gamepads[focusGamepad].axes[3];
	rightybtn2.value="↓\n"+joystick2.righty.toFixed(2);
	//document.getElementById("rightReturnResult3").innerHTML=joystick2.righty.toFixed(2);
}

const roundnessCB1=document.getElementById("roundnessTestCB1");
roundnessCB1.addEventListener('change', (event) => {
	if (event.currentTarget.checked) {
		joystick1.roundnessTest=true;
		for (var i=0;i<=31;i++){
			joystick1.roundArray[i]=0;
		}
	} else {
		joystick1.roundnessTest=false;
	}
})

const roundnessCB2=document.getElementById("roundnessTestCB2");
roundnessCB2.addEventListener('change', (event) => {
	if (event.currentTarget.checked) {
		joystick2.roundnessTest=true;
		for (var i=0;i<=31;i++){
			joystick2.roundArray[i]=0;
		}
	} else {
		joystick2.roundnessTest=false;
	}
})

var directionLGroup=document.getElementById("directionLGroup");
var directionRGroup=document.getElementById("directionRGroup");
directionLGroup.style.opacity=0.2;
directionRGroup.style.opacity=0.2;

var directionCheckL = document.getElementById("directionCheckL");
directionCheckL.addEventListener('change', (event) => {
	joystick1.prevZone=0;
	joystick1.directionCycle=0;
	document.getElementById("directionResultL").innerHTML="";
	if (event.currentTarget.checked) {
		joystick1.directionChecking = true;
		directionLGroup.style.opacity=1;

	}else{
		joystick1.directionChecking=false;
		directionLGroup.style.opacity=0.2;

	}
})

var directionCheckR = document.getElementById("directionCheckR");
directionCheckR.addEventListener('change', (event) => {
	joystick2.prevZone=0;
	joystick2.directionCycle=0;
	document.getElementById("directionResultR").innerHTML="";
	if (event.currentTarget.checked) {
		joystick2.directionChecking=true;
		directionRGroup.style.opacity=1;

	}else{
		joystick2.directionChecking=false;
		directionRGroup.style.opacity=0.2;

	}
})

var clockwiseL = document.getElementById("clockwiseL");
clockwiseL.addEventListener('change', function() {
	if (this.checked) {
		joystick1.direction=0;
		joystick1.prevZone=0;
		joystick1.directionCycle=0;
		document.getElementById("directionResultL").innerHTML="";
	}
});
var counterclockwiseL = document.getElementById("counterclockwiseL");
counterclockwiseL.addEventListener('change', function() {
	if (this.checked) {
		joystick1.direction=1;
		joystick1.prevZone=0;
		joystick1.directionCycle=0;
		document.getElementById("directionResultL").innerHTML="";
	}
});
var clockwiseR = document.getElementById("clockwiseR");
clockwiseR.addEventListener('change', function() {
	if (this.checked) {
		joystick2.direction=0;
		joystick2.prevZone=0;
		joystick2.directionCycle=0;
		document.getElementById("directionResultR").innerHTML="";
	}
});
var counterclockwiseR = document.getElementById("counterclockwiseR");
counterclockwiseR.addEventListener('change', function() {
	if (this.checked) {
		joystick2.direction=1;
		joystick2.prevZone=0;
		joystick2.directionCycle=0;
		document.getElementById("directionResultR").innerHTML="";
	}
});
const roundLock=document.getElementById("roundLock");
	roundLock.addEventListener('change', (event) => {
	if (event.currentTarget.checked) {
		isRoundLock=true;
	} else isRoundLock = false;
})
const roundLock2=document.getElementById("roundLock2");
	roundLock2.addEventListener('change', (event) => {
	if (event.currentTarget.checked) {
		isRoundLock2=true;
	} else isRoundLock2 = false;
})
class myJoystick{	//左搖桿控制五支手柄的左搖桿，右搖桿亦然
	
	constructor(gamepad,pid,xv,yv,xn,yn,cid){
		this.directionChecking=false;
		this.direction=0; //要測試的方向，0是順時針，1是逆時針
		this.directionCycle=0;
		this.prevZone=0;
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
			
			
			var outputAmp=parseFloat(document.getElementById("outputAmplify").value);
			var deadzone=parseFloat(document.getElementById("deadzone").value);
			deadzone/=50;
			var deadzone2=parseFloat(document.getElementById("deadzone2").value);
			deadzone2/=50;
			var x=gamepads[focusGamepad].axes[this.xAxesNumber];
			var y=gamepads[focusGamepad].axes[this.yAxesNumber];

			//設定死區			
			
			if(rbGeneral.checked){
				x=gamepads[focusGamepad].axes[this.xAxesNumber]*(1+deadzone*2+outputAmp/100);
				y=gamepads[focusGamepad].axes[this.yAxesNumber]*(1+deadzone*2+outputAmp/100);
				if(deadzone>0){
					
					var len=Math.sqrt(x*x+y*y);
					if(len<deadzone ){
						x=0;
						y=0;
					}else{
						x=(x*len-deadzone*x)/len;
						y=(y*len-deadzone*y)/len;
					}
				
				}
				/*
				//十字吸附
				if(Math.abs(x)<=deadzone) {
					x=0;
				}else{
					if(x>deadzone){
						x-=deadzone;
					}else{
						x+=deadzone;
					}
				}
				
				if(Math.abs(y)<=deadzone) {
					y=0;
				}else{
					if(y>deadzone){
						y-=deadzone;
					}else{
						y+=deadzone;
					}
				}
				*/
				if(x>1)x=1;
				if(x<-1)x=-1;
				if(y>1)y=1;
				if(y<-1)y=-1;

				if (isRoundLock) {
					if(Math.sqrt(x*x+y*y)>1){
						x=x/Math.sqrt(x*x+y*y);
						y=y/Math.sqrt(x*x+y*y);
					}
				} 
			}else if(rbIndividual.checked){
				
				
				x=x-indXY[this.xAxesNumber/2][0];
				y=y-indXY[this.xAxesNumber/2][1];

				if(findingEdge[this.xAxesNumber/2]){
					
					if(this.xAxesNumber/2==0){
						document.getElementById("edgeValueL").innerHTML="Testing";
					}else document.getElementById("edgeValueR").innerHTML="Testing";
					var areacode;
					if(x!=0){
						areacode = Math.round(Math.atan(y/x)*180/Math.PI/11.25);
						
						if(x<0) {
							areacode+=16;
						}else if(y<0 && areacode!=0){
							areacode+=32;
						}
					}else{
						if(y<0){
							areacode=24;
						}else{
							areacode=8;
						}
					}

					if(areacode==4 && indEdgs[this.xAxesNumber/2][areacode]<(x*x+y*y)){ 
						indEdgs[this.xAxesNumber/2][areacode]=(x*x+y*y)
						indEdgs[this.xAxesNumber/2][areacode+1]= x;
						indEdgs[this.xAxesNumber/2][areacode+2]= y;
					}
					if(areacode==20 && indEdgs[this.xAxesNumber/2][areacode]<(x*x+y*y)) {
						indEdgs[this.xAxesNumber/2][areacode]=(x*x+y*y)
						indEdgs[this.xAxesNumber/2][areacode+1]= x;
						indEdgs[this.xAxesNumber/2][areacode+2]= y;
					}
					//if(areacode==20 && indEdgs[this.xAxesNumber/2][areacode+1]>y) 
					
					//console.log(this.xAxesNumber/2+": "+indEdgs[this.xAxesNumber/2]);
					
					
					if(x>indEdgs[this.xAxesNumber/2][0])
						indEdgs[this.xAxesNumber/2][0]=x;
					if(x<indEdgs[this.xAxesNumber/2][1])
						indEdgs[this.xAxesNumber/2][1]=x;
					if(y>indEdgs[this.xAxesNumber/2][2])
						indEdgs[this.xAxesNumber/2][2]=y;
					if(y<indEdgs[this.xAxesNumber/2][3])
						indEdgs[this.xAxesNumber/2][3]=y;
					
					if(x<0 && y<0){
						circleCheck[this.xAxesNumber/2][0]=true;
					}else if(x<0 && y>0){
						circleCheck[this.xAxesNumber/2][1]=true;
					}else if(x>0 && y<0){
						circleCheck[this.xAxesNumber/2][2]=true;
					}else if(x>0 && y>0){
						circleCheck[this.xAxesNumber/2][3]=true;
					}
					if(circleCheck[this.xAxesNumber/2][0]&&circleCheck[this.xAxesNumber/2][1]&&circleCheck[this.xAxesNumber/2][2]&&circleCheck[this.xAxesNumber/2][3]&&x<0&&y<0){
						for(let j=0;j<=3;j++){
							circleCheck[this.xAxesNumber/2][j]=false;
						}
						circleCount[this.xAxesNumber/2]++;
						if(circleCount[this.xAxesNumber/2]>=3){
							circleCount[this.xAxesNumber/2]=0;
							findingEdge[this.xAxesNumber/2]=false;
							if(this.xAxesNumber/2==0){
								
								//document.getElementById("edgeValueL").innerHTML="("+indEdgs[0][0].toFixed(2)+" "+indEdgs[0][1].toFixed(2)+" "+indEdgs[0][2].toFixed(2)+" "+indEdgs[0][3].toFixed(2)+" "+indEdgs[0][4].toFixed(2)+" "+indEdgs[0][5].toFixed(2)+" "+indEdgs[0][6].toFixed(2)+" "+indEdgs[0][7].toFixed(2)+")"
								document.getElementById("edgeValueL").innerHTML="OK";
								document.getElementById("edgeValueL").style.color="green";
							}else{
								//document.getElementById("edgeValueR").innerHTML="("+indEdgs[1][0].toFixed(2)+" "+indEdgs[1][1].toFixed(2)+" "+indEdgs[1][2].toFixed(2)+" "+indEdgs[1][3].toFixed(2)+" "+indEdgs[1][4].toFixed(2)+" "+indEdgs[1][5].toFixed(2)+" "+indEdgs[1][6].toFixed(2)+" "+indEdgs[1][7].toFixed(2)+")"
								document.getElementById("edgeValueR").innerHTML="OK";
								document.getElementById("edgeValueR").style.color="green";
							}
						}
					}
				
				}else{
					/*
					var areacode;
					if(x!=0){
						areacode = Math.round(Math.atan(y/x)*180/Math.PI/11.25);
						
						if(x<0) {
							areacode+=16;
						}else if(y<0 && areacode!=0){
							areacode+=32;
						}
					}else{
						if(y<0){
							areacode=24;
						}else{
							areacode=8;
						}
					}
					*/
					//console.log(indEdgs[this.xAxesNumber/2][5]*(1/Math.abs(indEdgs[this.xAxesNumber/2][0]))+", "+indEdgs[this.xAxesNumber/2][6]*(1/Math.abs(indEdgs[this.xAxesNumber/2][2]))+", "+indEdgs[this.xAxesNumber/2][21]*(1/Math.abs(indEdgs[this.xAxesNumber/2][1]))+", "+indEdgs[this.xAxesNumber/2][22]*(1/Math.abs(indEdgs[this.xAxesNumber/2][3])));
					var comx=0.396/(0.707-indEdgs[this.xAxesNumber/2][5]*(1/Math.abs(indEdgs[this.xAxesNumber/2][0]))+0.055);
					var comy=0.396/(0.707-indEdgs[this.xAxesNumber/2][6]*(1/Math.abs(indEdgs[this.xAxesNumber/2][0]))+0.055);
					//console.log("comx="+comx+" , comy="+comy);
					if(x>0){
						x=x*(1/Math.abs(indEdgs[this.xAxesNumber/2][0]));
						x=x+(x-x*x)/comx;
					}else{
						x=x*(1/Math.abs(indEdgs[this.xAxesNumber/2][1]));
						var x1=x;
						x=1+x;
						x=x1-(x-x*x)/comx;
						
					}
					if(y>0){
						y=y*(1/Math.abs(indEdgs[this.xAxesNumber/2][2]));
						y=y+(y-y*y)/comy;
					}else{
						y=y*(1/Math.abs(indEdgs[this.xAxesNumber/2][3]));
						var y1=y;
						y++;
						y=y1-(y-y*y)/comy;
						
					}
					
					x=x*(deadzone2+1.1);
					y=y*(deadzone2+1.1);
					/*
					x=x*(1/indEdgs[this.xAxesNumber/2][areacode])*1.1;
					y=y*(1/indEdgs[this.xAxesNumber/2][areacode])*1.1;
					*/
				}
				if(deadzone2>0){
					var len=Math.sqrt(x*x+y*y);
					if(len<deadzone2 ){
						x=0;
						y=0;
					}else{
						x=(x*len-deadzone2*x)/len;
						y=(y*len-deadzone2*y)/len;
					}
				}
				/*
				//十字吸附
				if(Math.abs(x)<=deadzone2) {
					x=0;
				}else{
					if(x>deadzone2){
						x-=deadzone2;
					}else{
						x+=deadzone2;
					}
				}
				if(Math.abs(y)<=deadzone2) {
					y=0;
				}else{
					if(y>deadzone2){
						y-=deadzone2;
					}else{
						y+=deadzone2;
					}
				}
				*/
				
				if (isRoundLock2) {
					if(Math.sqrt(x*x+y*y)>1){
						x=x/Math.sqrt(x*x+y*y);
						y=y/Math.sqrt(x*x+y*y);
					}
				} 
				if(x>1)x=1;
				if(x<-1)x=-1;
				if(y>1)y=1;
				if(y<-1)y=-1;
			}
			
			document.getElementById(this.xValue).innerHTML = "x: "+x.toFixed(5)+" ("+(x*50+50).toFixed(2)+"%)";
			document.getElementById(this.yValue).innerHTML = "y: "+y.toFixed(5)+" ("+(y*50+50).toFixed(2)+"%)";
			document.getElementById("returnResult"+this.xAxesNumber%4).innerHTML=Math.abs((this.leftx-this.rightx)*100/2).toFixed(1)+"%";
			if(this.yAxesNumber==5){
				document.getElementById("returnResult3").innerHTML=Math.abs((this.lefty-this.righty)*100/2).toFixed(1)+"%";
			}else{
				document.getElementById("returnResult"+this.yAxesNumber%4).innerHTML=Math.abs((this.lefty-this.righty)*100/2).toFixed(1)+"%";
			}
			//畫搖桿圓
			var joystickCanvas = document.getElementById(this.positionId);
			var ctx = joystickCanvas.getContext("2d");
			
			
			
			if(!this.roundnessTest){
				ctx.clearRect(0, 0, 300, 300);
		
				ctx.fillStyle = '#d0cabf';
				ctx.fillRect(0 , 0 , 300 , 300);
				//畫圓及方框
				ctx.beginPath();

				ctx.fillStyle = '#ffffff';
				ctx.arc(150, 150, 130, 0, Math.PI * 2, true);
				ctx.fill();
				
				ctx.moveTo(150,0);
				ctx.lineTo(150,300);
				ctx.moveTo(0,150);
				ctx.lineTo(300,150);
				ctx.stroke();
				
				//畫搖桿XY位置點
				ctx.beginPath();
				ctx.fillStyle = "black";
				ctx.arc(150+x*130, 150+y*130, 3, 0, Math.PI * 2, true);
				
				ctx.fill();
			}else{
			
				//確認光標點在真圓內的區域所在
				var areacode;
				if(x!=0){
					areacode = Math.round(Math.atan(y/x)*180/Math.PI/11.25);
					
					if(x<0) {
						areacode+=16;
					}else if(y<0 && areacode!=0){
						areacode+=32;
					}
				}else{
					if(y<0){
						areacode=24;
					}else{
						areacode=8;
					}
				}
				
				//console.log("area code is "+areacode);
				
				//console.log("myx1 = "+ myx1 + ", myy1 = "+myy1);
				
				
				if(this.roundArray[areacode]<Math.sqrt(x*x+y*y))
					this.roundArray[areacode]= Math.sqrt(x*x+y*y);
				var totalRoundness=0;
				for(var i=0;i<=31;i++){
					totalRoundness+=Math.abs(this.roundArray[i]-1);
				}
				var roundness=Math.abs(1-totalRoundness/32)*100;
				
				ctx.beginPath();
				
				
				ctx.clearRect(0, 0, 300, 300);
		
				ctx.fillStyle = '#d0cabf';
				ctx.fillRect(0 , 0 , 300 , 300);
				ctx.fillStyle = '#ffffff';
				ctx.arc(150, 150, 130, 0, Math.PI * 2, true);
				ctx.fill();
				var minOutput;
				var maxOutput;
				if(this.xAxesNumber/2){
					minOutput = parseFloat(document.getElementById("output2").value)/100;
					maxOutput = parseFloat(document.getElementById("outputLow2").value)/100;
				}else {
					minOutput = parseFloat(document.getElementById("output1").value)/100;
					maxOutput = parseFloat(document.getElementById("outputLow1").value)/100;
				}
					
				for(var j=0;j<=31;j++){
					var shiftDegree=(this.roundArray[j]-0.8)*5-1;
					var myx1=Math.cos((5.625+(11.25*(j-1)))*Math.PI/180)*this.roundArray[j];
					var myy1=Math.sin((5.625+(11.25*(j-1)))*Math.PI/180)*this.roundArray[j];
					var myx2=Math.cos((5.625+(11.25*(j)))*Math.PI/180)*this.roundArray[j];
					var myy2=Math.sin((5.625+(11.25*(j)))*Math.PI/180)*this.roundArray[j];
					ctx.beginPath();
					if(this.roundArray[j]<minOutput){
						ctx.fillStyle = "rgba("+600*(minOutput-this.roundArray[j])+", "+5*this.roundArray[j]+", "+10*(this.roundArray[j]-1)+", 0.5)";
					}else if(this.roundArray[j]>maxOutput){	//outer round limitation
						ctx.fillStyle = "rgba("+10*(minOutput-this.roundArray[j])+", "+5*this.roundArray[j]+", "+200*(this.roundArray[j])+", 0.5)";
					}else{
						ctx.fillStyle = "rgba("+600*(minOutput-this.roundArray[j])+", "+200*this.roundArray[j]+", "+1000*(this.roundArray[j]-1)+", 0.5)";
					}
					//ctx.arc(150+x*130, 150+y*130, 10, 0, Math.PI * 2, true);
					ctx.moveTo(150,150);
					ctx.lineTo(150+myx1*130,150+myy1*130);
					ctx.lineTo(150+myx2*130,150+myy2*130);
					
					ctx.closePath();
					ctx.fill();
				} 
				//畫圓及方框
				ctx.beginPath();
				ctx.fillStyle = "black";
				ctx.strokeStyle = "black";
				ctx.arc(150, 150, 130, 0, Math.PI * 2, true);
				ctx.moveTo(150,0);
				ctx.lineTo(150,300);
				ctx.moveTo(0,150);
				ctx.lineTo(300,150);
				ctx.stroke();
				//畫搖桿XY位置點
				ctx.beginPath();
				ctx.fillStyle = "black";
				ctx.arc(150+x*130, 150+y*130, 3, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.fill();
				//ctx.stroke();
				ctx.beginPath();
				ctx.font = "10px Microsoft YaHei"
				var roundPass=true;
				for(var j=0;j<=31;j++){
					var myx=Math.cos(11.25*j*Math.PI/180)*1.05;
					var myy=Math.sin(11.25*j*Math.PI/180)*1.05;
					
					
					if(this.roundArray[j]<minOutput || this.roundArray[j]>maxOutput){
						ctx.fillStyle="red";
						roundPass=false;
					}else {
						ctx.fillStyle="green";
					}
					ctx.fillText(Math.round(this.roundArray[j]*100)+"%",140+myx*130,150+myy*130);
				}
				ctx.fill();
				ctx.font = "48px Microsoft YaHei"
				ctx.fillStyle="yellow";
				if(this.xAxesNumber%4==0) {
					ctx.fillText(roundness.toFixed(2)+"%",80,200,170);
					//document.getElementById("roundnessTestResult1").value=roundness.toFixed(2)+"%";
				}else if(this.xAxesNumber%4==2) ctx.fillText(roundness.toFixed(2)+"%",80,200,170);
				
				if(roundPass){
					ctx.fillStyle="green";
					ctx.fillText("PASS",100,120,100);
				}else{
					ctx.fillStyle="red";
					ctx.fillText("NG",110,120,100);
				}
				
				ctx.fill();
			}
			
			//測靜態雜波
			var noise;
			if(this.checkStaticNoise){		
				//console.log("noise="+noise);
				noise = Math.abs((x-this.staticX)*50);
				if(noise > this.xStaticNoiseMax) {
					this.xStaticNoiseMax=noise;
				}
				//console.log("noise="+noise+", x="+x+", staticX="+this.staticX);
				document.getElementById("staticResult"+this.xAxesNumber).innerHTML=this.xStaticNoiseMax.toFixed(1)+"%";

				noise = Math.abs((y-this.staticY)*50);
				if(noise>this.yStaticNoiseMax) {
					this.yStaticNoiseMax=noise;
				}
				document.getElementById("staticResult"+this.yAxesNumber).innerHTML=this.yStaticNoiseMax.toFixed(1)+"%";
			}
			//順逆時針方向測試
			if(this.directionChecking){ 
				var zone;
				if(x>0.2 && y>0.2){
					zone=1;
				}else if(x<-0.2 && y>0.2){
					zone=2;
				}else if(x<-0.2 && y<-0.2){
					zone=3;
				}else if(x>0.2 && y<-0.2){
					zone=4;
				}else{
					zone=this.prevZone;
				}
				var directionResult;
				if(this.xAxesNumber/2==0 ){//左搖桿
					directionResult=document.getElementById("directionResultL");
				}else {	//右搖桿
					directionResult=document.getElementById("directionResultR");
				}
				if (this.prevZone!=0){
					if ((this.direction==0 && (zone==this.prevZone+1 || zone==this.prevZone-3))|| (this.direction==1 && (zone==this.prevZone-1 || zone==this.prevZone+3))){
						this.directionCycle++;
						
						if(this.directionCycle>4) {
							
							directionResult.innerHTML="PASS";
							directionResult.style.color="green";
							
						}
					}else if(zone!=this.prevZone){
						directionResult.innerHTML="NG";
						directionResult.style.color="red";
						this.directionCycle=0;
						//console.log("prevZone="+this.prevZone+" , zone="+zone);
					}
				}
		
				this.prevZone=zone;
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
	
}