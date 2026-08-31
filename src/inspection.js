var gamepads = navigator.getGamepads();
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
var returnCheck = [[false,false,false,false],[false,false,false,false]];
var outDeadzone=1.5; //outer deadzone limitation setup for linearity test
var joystickBtnCanvas = document.getElementById("joystickBtns");
var jbctx = joystickBtnCanvas.getContext("2d");
var indXY=[[0,0],[0,0]];
var indEdgs=[new Array(32),new Array(32)];
indEdgs[0].fill(0);
indEdgs[1].fill(0);
var circleCheck=[[false,false,false,false],[false,false,false,false]]
var circleCount=[0,0];
var findingEdge=[false,false];
const circleRadius = 130;
const ctxCenter=150;
const ctxWidth=300;
var outerRadius=circleRadius*0.3;
var innerRadius=circleRadius*0.1;
const sampleNum=50;
var samples=new Array(sampleNum);
var sampleIndex=0;
var replaced = false;
var returnSample= new Array(10);
var returnIndex=0;
var roundnessTest=false;
var checkStaticNoise=false;
var checkSlideNoise=false;
var slideNoiseStd=parseFloat(document.getElementById("slideNoiseStd").value);
var directionChecking=false;
var checkBalance=false;

const isMacChrome = navigator.platform.toUpperCase().includes('MAC') && 
                    navigator.userAgent.includes('Chrome');

minOutput = parseFloat(document.getElementById("output1").value)/100;
maxOutput = parseFloat(document.getElementById("outputLow1").value)/100;
document.getElementById("dvMaxUp1").innerHTML=(maxOutput*50+50)<=100?(maxOutput*50+50):100;
document.getElementById("dvMaxDown1").innerHTML=(minOutput*50+50)<=100?(minOutput*50+50):100;
document.getElementById("dvMinUp1").innerHTML=(50-minOutput*50)>=0?(50-minOutput*50):0;
document.getElementById("dvMinDown1").innerHTML=(50-maxOutput*50)>=0?(50-maxOutput*50):0;

document.getElementById("edgeValueL").style.color="red";
document.getElementById("edgeValueR").style.color="red";

const checkboxLeft = document.getElementById("showLeft");
const leftDraw = document.getElementById("leftDraw");
const leftInfo = document.getElementById("leftInfo");
const leftResult = document.getElementById("leftResult");

checkboxLeft.addEventListener("change", function() {
	if (!this.checked) {
		leftDraw.style.display = "none";  // 隐藏 div
		leftInfo.style.display = "none";  // 隐藏 div
		leftResult.style.display = "none";  // 隐藏 div
	} else {
		leftDraw.style.display = ""; 
		leftInfo.style.display = "";  
		leftResult.style.display = "";  
	}
});
const checkboxRight = document.getElementById("showRight");
const rightDraw = document.getElementById("rightDraw");
const rightInfo = document.getElementById("rightInfo");
const rightResult = document.getElementById("rightResult");

checkboxRight.addEventListener("change", function() {
	if (!this.checked) {
		rightDraw.style.display = "none";  // 隐藏 div
		rightInfo.style.display = "none";  // 隐藏 div
		rightResult.style.display = "none";  // 隐藏 div
	} else {
		rightDraw.style.display = ""; 
		rightInfo.style.display = "";  
		rightResult.style.display = "";  
	}
});

centerLXY=document.getElementById("centerLXY");
centerRXY=document.getElementById("centerRXY");
individualCenter=document.getElementById("individualCenter");
individualCenter.onclick = function(){
	getIndCenter();
}
function getIndCenter(){
	indXY[0][0]=joystick1.x;
	indXY[0][1]=joystick1.y;
	indXY[1][0]=joystick2.x;
	indXY[1][1]=joystick2.y;
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
		joystick1=new myJoystick("left-joystick","left-x-axes","left-y-axes",0,1,"curveCanvas1");
		//t=setInterval("joystick1.changeState()",16);  
		//右搖桿初始化
		if(isSwitch){
			joystick2=new myJoystick("right-joystick","right-x-axes","right-y-axes",2,5,"curveCanvas2");
		}else{
			joystick2=new myJoystick("right-joystick","right-x-axes","right-y-axes",2,3,"curveCanvas2");
		}
		//t2=setInterval("joystick2.changeState()",16); 
		// 啟動遊戲循環
		joystick1.loadStats();
		joystick2.loadStats();
		
		gameLoop();
		var timestampTimer = setInterval("updateTimestamp()",1000);
		//var replaceCheck=setInterval("checkReplace()",500);
	}

	originalTimeStamp[event.gamepad.index]=Date.parse(new Date());
	
});

function gameLoop() {
  joystick1.changeState();
  joystick2.changeState();
  requestAnimationFrame(gameLoop);
}

let audioContext;

// 用戶點擊頁面時初始化音頻（解決瀏覽器自動播放限制）
document.addEventListener('click', function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}, { once: true });

/**
 * 播放 OK 音效（高頻正弦波 + 淡出，類似「叮」）
 */
function playOKSound() {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";       // 正弦波（最柔和）
  oscillator.frequency.value = 1046.5; // 高頻 (C6 音高，更清脆)
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // 初始音量較小
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5); // 淡出效果

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5); // 持續 0.5 秒
}

// 检查当前是否有任何手柄连接
function checkGamepadsConnected() {
    if (gamepads[focusGamepad]) {
		return true; // 至少有一个手柄连接且該手柄現在被選中
    }
    return false; // 没有手柄连接
}

/**
 * 播放 NG 音效（低頻、刺耳）
 */
function playNGSound() {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "square";    // 方波（刺耳）
  oscillator.frequency.value = 220; // 低頻（220Hz，A3 音高）

  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

  // 添加音量漸變（模擬 "錯誤" 感覺）
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5); // 持續 0.5 秒
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
const balanceTestDivL=document.getElementById("balanceTestDivL");
const balanceTestDivR=document.getElementById("balanceTestDivR");
var balanceTestCB0 = document.getElementById("balanceTestCB0");
if(balanceTestCB0.checked){
	balanceTestDivL.style.display = 'block';
	balanceTestDivR.style.display = 'block';
}else{
	balanceTestDivL.style.display = 'none';
	balanceTestDivR.style.display = 'none';
}
balanceTestCB0.addEventListener('change', (event) => {
	if (event.currentTarget.checked) {
		checkBalance=true;
		balanceTestDivL.style.display = 'block';
		balanceTestDivR.style.display = 'block';
	}else{
		checkBalance=false;
		balanceTestDivL.style.display = 'none';
		balanceTestDivR.style.display = 'none';
	}
})
const wobbleDivL=document.getElementById("wobbleTestDivL");
const wobbleDivR=document.getElementById("wobbleTestDivR");
var wobbleCB0 = document.getElementById("wobbleCB0");
if(wobbleCB0.checked){
	wobbleDivL.style.display = 'block';
	wobbleDivR.style.display = 'block';
}else{
	wobbleDivL.style.display = 'none';
	wobbleDivR.style.display = 'none';
}
wobbleCB0.addEventListener('change', (event) => {
	if (event.currentTarget.checked) {
		wobbleDivL.style.display = 'block';
		wobbleDivR.style.display = 'block';
	}else{
		wobbleDivL.style.display = 'none';
		wobbleDivR.style.display = 'none';
	}
	if(checkGamepadsConnected()){
		joystick1.originX=joystick1.x;
		joystick1.originY=joystick1.y;
		joystick1.leftx=0;
		joystick1.rightx=0;
		joystick1.lefty=0;
		joystick1.righty=0;
		returnBtn[0][3].value="→";
		returnBtn[0][2].value="←";
		returnBtn[0][1].value="↓";
		returnBtn[0][0].value="↑";
		joystick2.originX=joystick2.x;
		joystick2.originY=joystick2.y;
		joystick2.leftx=0;
		joystick2.rightx=0;
		joystick2.lefty=0;
		joystick2.righty=0;
		returnBtn[1][3].value="→";
		returnBtn[1][2].value="←";
		returnBtn[1][1].value="↓";
		returnBtn[1][0].value="↑";
	}
})
var returnRingCB = document.getElementById("autoRing");

const slideNoiseDivL = document.getElementById("slideNoiseTestDivL");
const slideNoiseDivR = document.getElementById("slideNoiseTestDivR");
var slideNoiseCB1 = document.getElementById("slideNoiseCB1");
if(slideNoiseCB1.checked){
	slideNoiseDivL.style.display = 'block';
	slideNoiseDivR.style.display = 'block';
}else{
	slideNoiseDivL.style.display = 'none';
	slideNoiseDivR.style.display = 'none';	
}
slideNoiseCB1.addEventListener('change', (event) => {
	if(checkGamepadsConnected()){
		joystick1.xMaxSlideNoise=0;
		joystick1.yMaxSlideNoise=0;
		joystick1.lastPeakx=joystick1.x;
		joystick1.lastPeaky=joystick1.y;
		joystick2.xMaxSlideNoise=0;
		joystick2.yMaxSlideNoise=0;
		joystick2.lastPeakx=joystick1.x;
		joystick2.lastPeaky=joystick1.y;
	}
	if (event.currentTarget.checked) {
		checkSlideNoise=true;
		slideNoiseDivL.style.display = 'block';
		slideNoiseDivR.style.display = 'block';
	}else{
		checkSlideNoise=false;
		slideNoiseDivL.style.display = 'none';
		slideNoiseDivR.style.display = 'none';
	}
})

var clearBtn0=document.getElementById("clearTable0");
clearBtn0.onclick=function(){
	joystick1.lifeCycleCount=[0,0,0,0,0];
	joystick1.lifeNoiseCount=[0,0,0,0,0];
	joystick1.lifeMaxNoise=[0,0,0,0,0];
	joystick1.lifeMaxAffected=[0,0,0,0,0];
	joystick1.lifeAffectCount=[0,0,0,0,0];
	joystick1.swLife=0;
	document.getElementById("lifeSW0").innerHTML=0;
	for(let i=1;i<=4;i++){
		document.getElementById("life0"+i).innerHTML=0;
		document.getElementById("noiseCount0"+i).innerHTML=0;
		document.getElementById("noise0"+i).innerHTML=0;
		document.getElementById("maxNoise0"+i).innerHTML=0;
		
	}
	localStorage.removeItem('noiseLogs0');
	joystick1.clearStats();
	alert('此搖桿壽命測試數據已清空。');
}

var clearBtn2=document.getElementById("clearTable2");
clearBtn2.onclick=function(){
	joystick2.lifeCycleCount=[0,0,0,0,0];
	joystick2.lifeNoiseCount=[0,0,0,0,0];
	joystick2.lifeMaxNoise=[0,0,0,0,0];
	joystick2.lifeMaxAffected=[0,0,0,0,0];
	joystick2.lifeAffectCount=[0,0,0,0,0];
	joystick2.swLife=0;
	document.getElementById("lifeSW2").innerHTML=0;
	joystick2.swLife=0;
	document.getElementById("lifeSW2").innerHTML=0;
	for(let i=1;i<=4;i++){
		document.getElementById("life2"+i).innerHTML=0;
		document.getElementById("noiseCount2"+i).innerHTML=0;
		document.getElementById("noise2"+i).innerHTML=0;
		document.getElementById("maxNoise2"+i).innerHTML=0;
	}
	localStorage.removeItem('noiseLogs2');
	joystick2.clearStats();
	alert('此搖桿壽命測試數據已清空。');
}

var lifeTestCB0=document.getElementById("lifeTest0");
const lifeTestDiv0=document.getElementById("table0");
lifeTestDiv0.style.display = 'none';
lifeTestCB0.addEventListener('change', (event) => {
	if (event.currentTarget.checked) {	
		lifeTestDiv0.style.display = 'block';
	}else{
		lifeTestDiv0.style.display = 'none';
	}
})

var lifeTestCB2=document.getElementById("lifeTest2");
const lifeTestDiv2=document.getElementById("table2");
lifeTestDiv2.style.display = 'none';
lifeTestCB2.addEventListener('change', (event) => {
	if (event.currentTarget.checked) {	
		lifeTestDiv2.style.display = 'block';
	}else{
		lifeTestDiv2.style.display = 'none';
	}
})

var staticTestCB=document.getElementById("staticNoiseTest");
const staticTestDivL = document.getElementById("staticTestDivL");
const staticTestDivR = document.getElementById("staticTestDivR");
if(staticTestCB.checked){
	staticTestDivL.style.display = 'block';
	staticTestDivR.style.display = 'block';
}else{
	staticTestDivL.style.display = 'none';
	staticTestDivR.style.display = 'none';	
}

staticTestCB.addEventListener('change', (event) => {
	if (event.currentTarget.checked) {	
		staticTestDivL.style.display = 'block';
		staticTestDivR.style.display = 'block';
	}else{
		staticTestDivL.style.display = 'none';
		staticTestDivR.style.display = 'none';
	}
})
var staticNoiseCB1 = document.getElementById("staticNoiseCB1");
staticNoiseCB1.addEventListener('change', (event) => {
	if (event.currentTarget.checked) {
		if(checkGamepadsConnected()){
			joystick1.xStaticNoiseMax=0;
			joystick1.yStaticNoiseMax=0;
			joystick2.xStaticNoiseMax=0;
			joystick2.yStaticNoiseMax=0;
			joystick1.staticX=joystick1.x;
			joystick1.staticY=joystick1.y;
			joystick2.staticX=joystick2.x;
			joystick2.staticY=joystick2.y;
		}
		checkStaticNoise=true;
	}else{
		checkStaticNoise=false;
	}
})

var returnBtn=[
	[document.getElementById("returnUp0"),document.getElementById("returnDown0"),document.getElementById("returnLeft0"),document.getElementById("returnRight0")],
	[document.getElementById("returnUp1"),document.getElementById("returnDown1"),document.getElementById("returnLeft1"),document.getElementById("returnRight1")]
];
function checkReturnDVFail(jID){
	var ctx;
	var deadzoneSTD=parseFloat(document.getElementById("centerStd").value);
	if(jID==0){
		var maxDv = Math.max(Math.abs(joystick1.leftx),Math.abs(joystick1.lefty),Math.abs(joystick1.rightx),Math.abs(joystick1.righty))*50;
		if(maxDv>deadzoneSTD){
			testDone("L",0,2);
		}else{
			testDone("L",0,1);
		}
		joystick1.centerDV=maxDv;
		ctx = canvasL[0].getContext("2d");
		ctx.fillStyle = 'white';
		ctx.font = 'bold 15px Arial'; // 字體大小和字型
		ctx.textAlign = 'center';
		ctx.fillText(maxDv.toFixed(1)+"%",canvasL[0].width/2,canvasL[0].height/2,80);
	}else{
		var maxDv = Math.max(Math.abs(joystick2.leftx),Math.abs(joystick2.lefty),Math.abs(joystick2.rightx),Math.abs(joystick2.righty))*50;
		if(maxDv>deadzoneSTD){
			testDone("R",0,2);
		}else{
			testDone("R",0,1);
		}
		ctx = canvasR[0].getContext("2d");
		ctx.fillStyle = 'white';
		ctx.font = 'bold 15px Arial'; // 字體大小和字型
		ctx.textAlign = 'center';
		ctx.fillText(maxDv.toFixed(1)+"%",canvasR[0].width/2,canvasR[0].height/2,80);
	}
}
returnBtn[0][0].onclick = function(){
	if(checkGamepadsConnected()){
		returnCheck[0][0]=true;
		joystick1.lefty = joystick1.y;
		returnBtn[0][0].value=(joystick1.lefty*50+50).toFixed(1);
		returnBtn[0][0].style.backgroundColor = "green";
		document.getElementById("yUp1").innerHTML=(joystick1.lefty*50+50).toFixed(1)+"%";
		document.getElementById("yUD1").innerHTML=(Math.abs(joystick1.lefty-joystick1.righty)*50).toFixed(1)+"%";
		checkReturnDVFail(0);
	}
}
returnBtn[0][1].onclick = function(){
	if(checkGamepadsConnected()){
		returnCheck[0][1]=true;
		joystick1.righty = joystick1.y;
		returnBtn[0][1].value=(joystick1.righty*50+50).toFixed(1);
		returnBtn[0][1].style.backgroundColor = "green";
		document.getElementById("yDown1").innerHTML=(joystick1.righty*50+50).toFixed(1)+"%";
		document.getElementById("yUD1").innerHTML=(Math.abs(joystick1.lefty-joystick1.righty)*50).toFixed(1)+"%";
		checkReturnDVFail(0);
	}
}
returnBtn[0][2].onclick = function(){
	if(checkGamepadsConnected()){
		returnCheck[0][2]=true;
		joystick1.leftx = joystick1.x;
		returnBtn[0][2].value=(joystick1.leftx*50+50).toFixed(1);
		returnBtn[0][2].style.backgroundColor = "green";
		document.getElementById("xLeft1").innerHTML=(joystick1.leftx*50+50).toFixed(1)+"%";
		document.getElementById("xLR1").innerHTML=(Math.abs(joystick1.leftx-joystick1.rightx)*50).toFixed(1)+"%";
		checkReturnDVFail(0);
	}
}
returnBtn[0][3].onclick = function(){
	if(checkGamepadsConnected()){
		returnCheck[0][3]=true;
		joystick1.rightx = joystick1.x;
		returnBtn[0][3].value=(joystick1.rightx*50+50).toFixed(1);
		returnBtn[0][3].style.backgroundColor = "green";
		document.getElementById("xRight1").innerHTML=(joystick1.rightx*50+50).toFixed(1)+"%";
		document.getElementById("xLR1").innerHTML=(Math.abs(joystick1.leftx-joystick1.rightx)*50).toFixed(1)+"%";
		checkReturnDVFail(0);
	}
}
returnBtn[1][0].onclick = function(){
	if(checkGamepadsConnected()){
		returnCheck[1][0]=true;
		joystick2.lefty = joystick2.y;
		returnBtn[1][0].value=(joystick2.lefty*50+50).toFixed(1);
		returnBtn[1][0].style.backgroundColor = "green";
		document.getElementById("yUp2").innerHTML=(joystick2.lefty*50+50).toFixed(1)+"%";
		document.getElementById("yUD2").innerHTML=(Math.abs(joystick2.lefty-joystick2.righty)*50).toFixed(1)+"%";
		checkReturnDVFail(1);
	}
}
returnBtn[1][1].onclick = function(){
	if(checkGamepadsConnected()){
		returnCheck[1][1]=true;
		joystick2.righty = joystick2.y;
		returnBtn[1][1].value=(joystick2.righty*50+50).toFixed(1);
		returnBtn[1][1].style.backgroundColor = "green";
		document.getElementById("yDown2").innerHTML=(joystick2.righty*50+50).toFixed(1)+"%";
		document.getElementById("yUD2").innerHTML=(Math.abs(joystick2.lefty-joystick2.righty)*50).toFixed(1)+"%";
		checkReturnDVFail(1);
	}
}
returnBtn[1][2].onclick = function(){
	if(checkGamepadsConnected()){
		returnCheck[1][2]=true;
		joystick2.leftx = joystick2.x;
		returnBtn[1][2].value=(joystick2.leftx*50+50).toFixed(1);
		returnBtn[1][2].style.backgroundColor = "green";
		document.getElementById("xLeft2").innerHTML=(joystick2.leftx*50+50).toFixed(1)+"%";
		document.getElementById("xLR2").innerHTML=(Math.abs(joystick2.leftx-joystick2.rightx)*50).toFixed(1)+"%";
		checkReturnDVFail(1);
	}
}
returnBtn[1][3].onclick = function(){
	if(checkGamepadsConnected()){
		returnCheck[1][3]=true;
		joystick2.rightx = joystick2.x;
		returnBtn[1][3].value=(joystick2.rightx*50+50).toFixed(1);
		returnBtn[1][3].style.backgroundColor = "green";
		document.getElementById("xRight2").innerHTML=(joystick2.rightx*50+50).toFixed(1)+"%";
		document.getElementById("xLR2").innerHTML=(Math.abs(joystick2.leftx-joystick2.rightx)*50).toFixed(1)+"%";
		checkReturnDVFail(1);
	}
}


const roundnessCB1=document.getElementById("roundnessTestCB1");
const roundnessTestDivL = document.getElementById("roundnessTestDivL");
const roundnessTestDivR = document.getElementById("roundnessTestDivR");
if(roundnessCB1.checked){
	roundnessTestDivL.style.display = 'block';
	roundnessTestDivR.style.display = 'block';
}else{
	roundnessTestDivL.style.display = 'none';
	roundnessTestDivR.style.display = 'none';
}
roundnessCB1.addEventListener('change', (event) => {
	if (event.currentTarget.checked) {
		roundnessTest=true;
		if(checkGamepadsConnected()){
			for (var i=0;i<=31;i++){
				joystick1.roundArray[i]=0;
				joystick2.roundArray[i]=0;
			}
		}
		roundnessTestDivL.style.display = 'block';
		roundnessTestDivR.style.display = 'block';
	} else {
		roundnessTest=false;
		roundnessTestDivL.style.display = 'none';
		roundnessTestDivR.style.display = 'none';
	}
})
var switchTestCB=document.getElementById("switchTestCB");
const switchTestDivL = document.getElementById("switchTestDivL");
const switchTestDivR = document.getElementById("switchTestDivR");
if(switchTestCB.checked){
	switchTestDivL.style.display = 'block';
	switchTestDivR.style.display = 'block';
}else{
	switchTestDivL.style.display = 'none';
	switchTestDivR.style.display = 'none';
}
switchTestCB.addEventListener('change', (event) => {
	if (event.currentTarget.checked) {
		switchTestDivL.style.display = 'block';
		switchTestDivR.style.display = 'block';
	}else{
		switchTestDivL.style.display = 'none';
		switchTestDivR.style.display = 'none';
	}
})

var directionCheck = document.getElementById("directionCheck");
const directionTestDivL = document.getElementById("directionTestDivL");
const directionTestDivR = document.getElementById("directionTestDivR");
if(directionCheck.checked){
	directionTestDivL.style.display = 'block';
	directionTestDivR.style.display = 'block';
}else{
	directionTestDivL.style.display = 'none';
	directionTestDivR.style.display = 'none';
}
directionCheck.addEventListener('change', (event) => {
	if(checkGamepadsConnected()){
		joystick1.prevZone=0;
		joystick1.directionCycle=0;
		joystick2.prevZone=0;
		joystick2.directionCycle=0;
	}
	if (event.currentTarget.checked) {
		directionChecking = true;
		directionTestDivL.style.display = 'block';
		directionTestDivR.style.display = 'block';
	}else{
		directionChecking=false;
		directionTestDivL.style.display = 'none';
		directionTestDivR.style.display = 'none';
	}
})

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

	constructor(pid,xv,yv,xn,yn,cid){
		this.centerDV=0;
		this.xVolt=3;
		this.yVolt=3;
		this.directionCycle=0;
		this.prevZone=0;
		this.testing=true;	//只控制一號搖桿的波形圖的測試暫停與繼續
		this.roundnessPass=false;
		this.roundArray = new Array();
		for (var i=0;i<=31;i++){
			this.roundArray[i]=0;
		}
		this.xNoiseArray = new Array();
		this.yNoiseArray = new Array();
		this.curveCanvasID;	//畫波形圖用的element id
		this.positionId=pid;	//畫圖及位置
		this.xValue=xv; //x值顯示用的element id
		this.yValue=yv; //y值顯示用的element id
		this.xAxesNumber=xn; //x軸在手柄裡的編號
		this.yAxesNumber=yn; //y軸在手柄裡的編號
		this.curveCanvasID=cid;
		this.xStaticNoiseMax=0;
		this.yStaticNoiseMax=0;		
		this.staticX=0;	//測靜態雜波時的中心點
		this.staticY=0;		
		this.originX=0;	//測複歸精度的中心點
		this.originY=0;		
		this.leftx=0;	//回中按鍵記錄值
		this.rightx=0;
		this.lefty=0;
		this.righty=0;		
		this.bgColor="white";
		this.directionPass=0;
		this.xMax=0;	//記錄最大值
		this.xMin=0;
		this.yMax=0;
		this.yMin=0;

		this.x=gamepads[focusGamepad].axes[this.xAxesNumber];
		this.y=gamepads[focusGamepad].axes[this.yAxesNumber];
		this.lastTrackx=-100;
		this.lastTracky=-100;
		this.lastSection=-1;					
		this.sectionTimer=0;
		this.sectionBtn=returnBtn[0][2];
		this.readyToCheckReturn= false;
		this.lastx=[this.x,this.x];	//檢查峰到峰的滑動雜音
		this.lasty=[this.y,this.y];
		this.xMaxSlideNoise=0;	//記錄最大雜音值
		this.yMaxSlideNoise=0;
		this.balancePass=true;
		this.cleanTime=new Date();
		this.points = []; // 存储点数据：{x, y, timestamp}
		this.lifeDirection=0; //測試中方向，0：歸中，1：上，2：右，3：下，4：左
		this.lifePoints = []; //測試中採集樣品點
		this.lifeCycleCount = [0,0,0,0,0];
		this.lifeNoiseCount = [0,0,0,0,0];
		this.lifeMaxNoise = [0,0,0,0,0];
		this.lifeMaxAffect = [0,0,0,0,0];
		this.lifeAffectCount = [0,0,0,0,0];
		this.lifeXMax=0;
		this.lifeYMax=0;
		this.swLife = 0;
		this.swLastStatus=false;
	}
	
	changeState(){ 
		if(checkGamepadsConnected()){
			//console.log("x="+gamepads[0].axes[0]);
			//根據不同搖桿配置，調整上下左右對調的需求
			if(this.xVolt==1){
				this.x=gamepads[focusGamepad].axes[this.xAxesNumber]*-1;
			}else if(this.xVolt==3){
				this.x=gamepads[focusGamepad].axes[this.xAxesNumber];
			}
			if(this.yVolt==1){
				this.y=gamepads[focusGamepad].axes[this.yAxesNumber]*-1;
			}else if(this.yVolt==3){
				this.y=gamepads[focusGamepad].axes[this.yAxesNumber];
			}
			if(isMacChrome)	this.y*=-1;
			
			if(document.getElementById("xReverse").checked){
				this.x*=-1;
			}
			if(document.getElementById("yReverse").checked){
				this.y*=-1;
			}

			if(!document.getElementById("xAxis").checked){
				this.x=0;
			}
			if(!document.getElementById("yAxis").checked){
				this.y=0;
			}

			if(this.xAxesNumber==0)	{	//只在左搖桿時作的事
				//console.log("x= "+this.x.toFixed(5)+" , y= "+this.y.toFixed(5));
				
				if(document.getElementById("autoRetest").checked){			
					samples[sampleIndex]=this.x;
					sampleIndex++;	
					if(!replaced){
						if(sampleIndex>=sampleNum) {
							sampleIndex=0;
							checkRemove(samples);
						}
					}else{
						returnSample[returnIndex]=this.x;
						returnIndex++;
						if(returnIndex>=10){
							if(calculateStandardDeviation(returnSample)<0.05){
								button.click();
								replaced=false;
							}
							returnIndex=0;
						}
					}
				}	
				fps++;
				if(gamepads[focusGamepad]!=null && gamepads[focusGamepad].connected){
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
					if (myBtn[10]) {
						if(joystick1.swLastStatus==false && document.getElementById("lifeTest0").checked){
							joystick1.swLife++;
							joystick1.swLastStatus=true;
							document.getElementById("lifeSW0").innerHTML=joystick1.swLife;
							joystick1.saveStats();
						}
						
						if(testL[5]!=1 && document.getElementById("swSave").checked){

							var data1 = (joystick1.x*50+50).toFixed(2);
							var data2 = (joystick1.xMax*50+50).toFixed(2);
							var data3 = (joystick1.xMin*50+50).toFixed(2);
							var data4 = (joystick1.leftx*50+50).toFixed(2);
							var data5 = (joystick1.rightx*50+50).toFixed(2);
							var data6 = (Math.abs(joystick1.leftx-joystick1.rightx)*50).toFixed(2);
							var data7 = (joystick1.xMaxSlideNoise/2*3300).toFixed(2);
							var data8 = (joystick1.y*50+50).toFixed(2);
							var data9 = (joystick1.yMax*50+50).toFixed(2);
							var data10 = (joystick1.yMin*50+50).toFixed(2);
							var data11 = (joystick1.lefty*50+50).toFixed(2);
							var data12 = (joystick1.righty*50+50).toFixed(2);
							var data13 = (Math.abs(joystick1.lefty-joystick1.righty)*50).toFixed(2);
							var data14 = (joystick1.yMaxSlideNoise/2*3300).toFixed(2);
							
							const testResult = {
								//左搖桿
								timestamp: new Date().toLocaleString(),	//現在時間
								data1,	//x分壓
								data2,	//x最大
								data3,	//x最小
								data4,	//左複歸
								data5,	//右複歸
								data6,	//左右複歸
								data7,	//x滑動雜訊
								data8,	//y分壓
								data9,	//y最大
								data10,	//y最小
								data11,	//上複歸
								data12,	//下複歸
								data13,	//上下複歸
								data14	//y滑動雜訊
							};
							
							// 從localStorage獲取現有數據或初始化空數組
							let savedResults = JSON.parse(localStorage.getItem('testResults')) || [];
							
							// 添加新結果
							savedResults.push(testResult);
							
							// 保存回localStorage
							localStorage.setItem('testResults', JSON.stringify(savedResults));
							const toast = document.getElementById('toast');
							// 顯示toast
							toast.classList.add('show');
							// 3秒後自動隱藏
							setTimeout(() => {
								toast.classList.remove('show');
							}, 3000);
							unsavedTest = false;	//開關測試已自動保存，解除「必須保存才能重測」限制
						}
						testDone("L",5,1);
					}else{
						joystick1.swLastStatus=false;
					}
					if (myBtn[11]) {
						if(joystick2.swLastStatus==false && document.getElementById("lifeTest2").checked){
							joystick2.swLife++;
							joystick2.swLastStatus=true;
							document.getElementById("lifeSW2").innerHTML=joystick2.swLife;
							joystick2.saveStats();
						}

						if(testR[5]!=1 && document.getElementById("swSave").checked){
							var data1 = (joystick2.x*50+50).toFixed(2);
							var data2 = (joystick2.xMax*50+50).toFixed(2);
							var data3 = (joystick2.xMin*50+50).toFixed(2);
							var data4 = (joystick2.leftx*50+50).toFixed(2);
							var data5 = (joystick2.rightx*50+50).toFixed(2);
							var data6 = (Math.abs(joystick2.leftx-joystick2.rightx)*50).toFixed(2);
							var data7 = (joystick2.xMaxSlideNoise/2*3300).toFixed(2);
							var data8 = (joystick2.y*50+50).toFixed(2);
							var data9 = (joystick2.yMax*50+50).toFixed(2);
							var data10 = (joystick2.yMin*50+50).toFixed(2);
							var data11 = (joystick2.lefty*50+50).toFixed(2);
							var data12 = (joystick2.righty*50+50).toFixed(2);
							var data13 = (Math.abs(joystick2.lefty-joystick2.righty)*50).toFixed(2);
							var data14 = (joystick2.yMaxSlideNoise/2*3300).toFixed(2);
							
							const testResult2 = {
								//右搖桿
								timestamp: new Date().toLocaleString(),	//現在時間
								data1,	//x分壓
								data2,	//x最大
								data3,	//x最小
								data4,	//左複歸
								data5,	//右複歸
								data6,	//左右複歸
								data7,	//x滑動雜訊
								data8,	//y分壓
								data9,	//y最大
								data10,	//y最小
								data11,	//上複歸
								data12,	//下複歸
								data13,	//上下複歸
								data14	//y滑動雜訊
							};
							
							// 從localStorage獲取現有數據或初始化空數組
							let savedResults2 = JSON.parse(localStorage.getItem('testResults2')) || [];
							
							// 添加新結果
							savedResults2.push(testResult2);
							
							// 保存回localStorage
							localStorage.setItem('testResults2', JSON.stringify(savedResults2));
							const toast = document.getElementById('toast');
							// 顯示toast
							toast.classList.add('show');
							// 3秒後自動隱藏
							setTimeout(() => {
								toast.classList.remove('show');
							}, 3000);
							unsavedTest = false;	//開關測試已自動保存，解除「必須保存才能重測」限制
						}
						testDone("R",5,1);
					}else{
						joystick2.swLastStatus=false;
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
				}
			}
			
			//毎個揺桿都要做的事
			
			gamepads = navigator.getGamepads();
			if(gamepads[focusGamepad]!==null && gamepads[focusGamepad].connected){
				//校正方案實施
				var outputAmp=parseFloat(document.getElementById("outputAmplify").value);
				var deadzone=parseFloat(document.getElementById("deadzone").value);
				deadzone/=50;
				var deadzone2=parseFloat(document.getElementById("deadzone2").value);
				deadzone2/=50;	//設定死區			
				if(rbGeneral.checked){
					this.x=this.x*(1+deadzone*2+outputAmp/100);
					this.y=this.y*(1+deadzone*2+outputAmp/100);
					if(deadzone>0){		
						var len=Math.sqrt(this.x*this.x+this.y*this.y);
						if(len<deadzone ){
							this.x=0;
							this.y=0;
						}else{
							this.x=(this.x*len-deadzone*this.x)/len;
							this.y=(this.y*len-deadzone*this.y)/len;
						}			
					}
					if(this.x>1)this.x=1;
					if(this.x<-1)this.x=-1;
					if(this.y>1)this.y=1;
					if(this.y<-1)this.y=-1;

					if (isRoundLock) {
						if(Math.sqrt(this.x*this.x+this.y*this.y)>1){
							this.x=this.x/Math.sqrt(this.x*this.x+this.y*this.y);
							this.y=this.y/Math.sqrt(this.x*this.x+this.y*this.y);
						}
					} 
				}else if(rbIndividual.checked){
					this.x=this.x-indXY[this.xAxesNumber/2][0];
					this.y=this.y-indXY[this.xAxesNumber/2][1];

					if(findingEdge[this.xAxesNumber/2]){
						
						if(this.xAxesNumber/2==0){
							document.getElementById("edgeValueL").innerHTML="Testing";
						}else document.getElementById("edgeValueR").innerHTML="Testing";
						var areacode;
						if(this.x!=0){
							areacode = Math.round(Math.atan(this.y/this.x)*180/Math.PI/11.25);
							
							if(this.x<0) {
								areacode+=16;
							}else if(this.y<0 && areacode!=0){
								areacode+=32;
							}
						}else{
							if(this.y<0){
								areacode=24;
							}else{
								areacode=8;
							}
						}

						if(areacode==4 && indEdgs[this.xAxesNumber/2][areacode]<(this.x*this.x+this.y*this.y)){ 
							indEdgs[this.xAxesNumber/2][areacode]=(this.x*this.x+this.y*this.y)
							indEdgs[this.xAxesNumber/2][areacode+1]= this.x;
							indEdgs[this.xAxesNumber/2][areacode+2]= this.y;
						}
						if(areacode==20 && indEdgs[this.xAxesNumber/2][areacode]<(this.x*this.x+this.y*this.y)) {
							indEdgs[this.xAxesNumber/2][areacode]=(this.x*this.x+this.y*this.y)
							indEdgs[this.xAxesNumber/2][areacode+1]= this.x;
							indEdgs[this.xAxesNumber/2][areacode+2]= this.y;
						}
						if(this.x>indEdgs[this.xAxesNumber/2][0])
							indEdgs[this.xAxesNumber/2][0]=this.x;
						if(this.x<indEdgs[this.xAxesNumber/2][1])
							indEdgs[this.xAxesNumber/2][1]=this.x;
						if(this.y>indEdgs[this.xAxesNumber/2][2])
							indEdgs[this.xAxesNumber/2][2]=this.y;
						if(this.y<indEdgs[this.xAxesNumber/2][3])
							indEdgs[this.xAxesNumber/2][3]=this.y;
						
						if(this.x<0 && this.y<0){
							circleCheck[this.xAxesNumber/2][0]=true;
						}else if(this.x<0 && this.y>0){
							circleCheck[this.xAxesNumber/2][1]=true;
						}else if(this.x>0 && this.y<0){
							circleCheck[this.xAxesNumber/2][2]=true;
						}else if(this.x>0 && this.y>0){
							circleCheck[this.xAxesNumber/2][3]=true;
						}
						if(circleCheck[this.xAxesNumber/2][0]&&circleCheck[this.xAxesNumber/2][1]&&circleCheck[this.xAxesNumber/2][2]&&circleCheck[this.xAxesNumber/2][3]&&this.x<0&&this.y<0){
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
						//console.log(indEdgs[this.xAxesNumber/2][5]*(1/Math.abs(indEdgs[this.xAxesNumber/2][0]))+", "+indEdgs[this.xAxesNumber/2][6]*(1/Math.abs(indEdgs[this.xAxesNumber/2][2]))+", "+indEdgs[this.xAxesNumber/2][21]*(1/Math.abs(indEdgs[this.xAxesNumber/2][1]))+", "+indEdgs[this.xAxesNumber/2][22]*(1/Math.abs(indEdgs[this.xAxesNumber/2][3])));
						var comx=0.396/(0.707-indEdgs[this.xAxesNumber/2][5]*(1/Math.abs(indEdgs[this.xAxesNumber/2][0]))+0.055);
						var comy=0.396/(0.707-indEdgs[this.xAxesNumber/2][6]*(1/Math.abs(indEdgs[this.xAxesNumber/2][0]))+0.055);
						//console.log("comx="+comx+" , comy="+comy);
						if(this.x>0){
							this.x=this.x*(1/Math.abs(indEdgs[this.xAxesNumber/2][0]));
							this.x=this.x+(this.x-this.x*this.x)/comx;
						}else{
							this.x=this.x*(1/Math.abs(indEdgs[this.xAxesNumber/2][1]));
							var x1=this.x;
							this.x=1+this.x;
							this.x=x1-(this.x-this.x*this.x)/comx;
							
						}
						if(this.y>0){
							this.y=this.y*(1/Math.abs(indEdgs[this.xAxesNumber/2][2]));
							this.y=this.y+(this.y-this.y*this.y)/comy;
						}else{
							this.y=this.y*(1/Math.abs(indEdgs[this.xAxesNumber/2][3]));
							var y1=this.y;
							this.y++;
							this.y=y1-(this.y-this.y*this.y)/comy;
							
						}
						
						this.x=this.x*(deadzone2+1.1);
						this.y=this.y*(deadzone2+1.1);

					}
					if(deadzone2>0){
						var len=Math.sqrt(this.x*this.x+this.y*this.y);
						if(len<deadzone2 ){
							this.x=0;
							this.y=0;
						}else{
							this.x=(this.x*len-deadzone2*this.x)/len;
							this.y=(this.y*len-deadzone2*this.y)/len;
						}
					}
					if (isRoundLock2) {
						if(Math.sqrt(this.x*this.x+this.y*this.y)>1){
							this.x=this.x/Math.sqrt(this.x*this.x+this.y*this.y);
							this.y=this.y/Math.sqrt(this.x*this.x+this.y*this.y);
						}
					} 
					if(this.x>1)this.x=1;
					if(this.x<-1)this.x=-1;
					if(this.y>1)this.y=1;
					if(this.y<-1)this.y=-1;
				}
				
				document.getElementById(this.xValue).innerHTML = "x軸: "+this.x.toFixed(5)+"<br>("+(this.x*50+50).toFixed(2)+"%)";
				document.getElementById(this.yValue).innerHTML = "y軸: "+this.y.toFixed(5)+"<br>("+(this.y*50+50).toFixed(2)+"%)";
				document.getElementById("returnResult"+this.xAxesNumber%4).innerHTML=Math.abs((this.leftx-this.rightx)*100/2).toFixed(1)+"%";
				if(this.yAxesNumber==5){
					document.getElementById("returnResult3").innerHTML=Math.abs((this.lefty-this.righty)*100/2).toFixed(1)+"%";
				}else{
					document.getElementById("returnResult"+this.yAxesNumber%4).innerHTML=Math.abs((this.lefty-this.righty)*100/2).toFixed(1)+"%";
				}
				//畫搖桿圓
				var joystickCanvas = document.getElementById(this.positionId);
				var ctx = joystickCanvas.getContext("2d");

				var trackCanvas = document.getElementById(this.positionId+"-track");
				var trackCtx = trackCanvas.getContext("2d");
				if(document.getElementById("track"+this.xAxesNumber).checked){
					var cleanInterval = document.getElementById("cleanTrack"+this.xAxesNumber).value;
					const now = Date.now();
					if(cleanInterval>0){
						this.addPoint(this.x,this.y);
						trackCtx.clearRect(0, 0, ctxWidth, ctxWidth);
						this.removeOldPoints(cleanInterval);
						 // 3. 绘制当前所有点（作为轨迹）
						if (this.points.length > 0) {
							trackCtx.beginPath();
							//trackCtx.strokeStyle = 'rgba(0, 0, 255, 0.6)';
							trackCtx.lineWidth=3;
							trackCtx.moveTo(ctxCenter+this.points[0].x*circleRadius, ctxCenter+this.points[0].y*circleRadius);

							for (let i = 1; i < this.points.length; i++) {
								const age = (now - this.points[i].timestamp) / (cleanInterval*1000);
								// 根据年龄设置透明度（越老越透明）
								trackCtx.strokeStyle = `rgba(0, 0, 255, ${1 - age})`;
								trackCtx.lineTo(ctxCenter+this.points[i].x*circleRadius, ctxCenter+this.points[i].y*circleRadius);
								trackCtx.stroke();
								trackCtx.beginPath();
								trackCtx.moveTo(ctxCenter+this.points[i].x*circleRadius, ctxCenter+this.points[i].y*circleRadius);
							}
						}
					}else{
					
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
					}
				}else{
					trackCtx.clearRect(0,0,ctxWidth,ctxWidth);
				}
				
				var wobbleCanvas = document.getElementById(this.positionId+"-wobble");
				if(!returnRingCB.checked){
					wobbleCanvas.style.display = 'none';
				}else{
					wobbleCanvas.style.display = 'block';
				
					var wobbleCtx = wobbleCanvas.getContext("2d");
					if(document.getElementById("wobbleCB0").checked){	//進行複歸測試

						var cx=ctxCenter+this.originX*circleRadius;
						var cy=ctxCenter+this.originY*circleRadius;
						var section=this.getSection();
						wobbleCtx.clearRect(0,0,ctxWidth,ctxWidth);
						var color='rgba(255, 255, 0, 0.3)';
						if(this.lastSection!=section && section!=10){
							this.sectionTimer=new Date();
							if(section==-1 && this.readyToCheckReturn){
								setTimeout(() => {
									this.sectionBtn.click();	
								}, 300); // 300毫秒 = 0.3秒
								this.readyToCheckReturn=false;
							}
						}else if(section!=-1 && section!=10){
							const nowDate=new Date();
							if(nowDate-this.sectionTimer>300){
								this.readyToCheckReturn=true;
								color='rgba(0, 128, 0, 0.3)';
								if(section==0){
									if(this.xAxesNumber==0){
										this.sectionBtn=returnBtn[0][3];
									}else if(this.xAxesNumber==2){
										this.sectionBtn=returnBtn[1][3];
									}
								}else if(section==1){
									if(this.xAxesNumber==0){
										this.sectionBtn=returnBtn[0][1];
									}else if(this.xAxesNumber==2){
										this.sectionBtn=returnBtn[1][1];
									}
								}else if(section==2){
									if(this.xAxesNumber==0){
										this.sectionBtn=returnBtn[0][2];
									}else if(this.xAxesNumber==2){
										this.sectionBtn=returnBtn[1][2];
									}
								}else if(section==3){
									if(this.xAxesNumber==0){
										this.sectionBtn=returnBtn[0][0];
									}else if(this.xAxesNumber==2){
										this.sectionBtn=returnBtn[1][0];
									}
								}

							}
						}
						outerRadius=circleRadius*parseFloat(document.getElementById("ringUp").value)/100;
						innerRadius=circleRadius*parseFloat(document.getElementById("ringLow").value)/100;
						for(var i=0;i<=3;i++){
							var startAngle=(i*90-45)*(Math.PI/180);
							var endAngle=(i*90+45)*(Math.PI/180);
							// 开始绘制路径
							wobbleCtx.beginPath();
							// 绘制外圆弧（顺时针）
							wobbleCtx.arc(cx, cy, outerRadius, startAngle, endAngle);
							// 绘制连接到内圆弧的直线
							wobbleCtx.lineTo(
							cx + innerRadius * Math.cos(endAngle),
							cy + innerRadius * Math.sin(endAngle)
							);
							// 绘制内圆弧（逆时针）
							wobbleCtx.arc(cx, cy, innerRadius, endAngle, startAngle, true);
							// 闭合路径
							wobbleCtx.closePath();
							// 设置填充颜色
							if(i==section){
								wobbleCtx.fillStyle = color; 
							}else{
								wobbleCtx.fillStyle = 'rgba(128, 0, 0, 0.3)'; 
							}
							wobbleCtx.fill();
							// 设置边框样式并描边
							wobbleCtx.lineWidth = 1;      // 边框线宽
							wobbleCtx.setLineDash([5, 5]);
							wobbleCtx.strokeStyle = '#000'; // 边框颜色（黑色）
							wobbleCtx.stroke();
						}
						this.lastSection=section;
					}else{
						wobbleCtx.clearRect(0,0,ctxWidth,ctxWidth);
					}
				}
				ctx.beginPath();
				ctx.strokeStyle = "black";
				ctx.lineWidth = 1;
				ctx.clearRect(0, 0, ctxWidth, ctxWidth);
				ctx.fillStyle = '#d0cabf';
				ctx.fillRect(0 , 0 , ctxWidth , ctxWidth); //畫方框
				ctx.fillStyle = '#ffffff';
				ctx.arc(ctxCenter, ctxCenter, circleRadius, 0, Math.PI * 2, true);	//畫圓
				ctx.fill();
				
				//單向壽命測試
				if(document.getElementById("lifeTest"+this.xAxesNumber).checked){
					var minBound=document.getElementById("lifeRangeBegin").value/100.0;
					var maxBound=document.getElementById("lifeRangeEnd").value/100.0;
					var lifeNoiseStd=document.getElementById("lifeNoiseStd").value;
					if(this.x>maxBound){
						this.lifeDirection=2;
					}else if(this.x<-maxBound){
						this.lifeDirection=4;
					}else if(this.y>maxBound){
						this.lifeDirection=3;
					}else if(this.y<-maxBound){
						this.lifeDirection=1;
					}else if(this.x<minBound && this.x>-minBound && this.y<minBound && this.y>-minBound){
						if(this.lifeDirection>0){
							var affectStd=parseFloat(document.getElementById("affectStd").value);
							if(this.lifeDirection==1 || this.lifeDirection==3){
								document.getElementById("affect"+this.xAxesNumber+""+this.lifeDirection).innerHTML=(this.lifeXMax*50).toFixed(2);
								if(this.lifeXMax*50>this.lifeMaxAffect[this.lifeDirection]){
									this.lifeMaxAffect[this.lifeDirection]=this.lifeXMax*50;
									document.getElementById("maxAffect"+this.xAxesNumber+""+this.lifeDirection).innerHTML=(this.lifeXMax*50).toFixed(2);
								}
								if(this.lifeXMax*50>affectStd){
									this.lifeAffectCount[this.lifeDirection]++;
									document.getElementById("affectCount"+this.xAxesNumber+""+this.lifeDirection).innerHTML=this.lifeAffectCount[this.lifeDirection];
								}
							}else if(this.lifeDirection==2 || this.lifeDirection==4){
								document.getElementById("affect"+this.xAxesNumber+""+this.lifeDirection).innerHTML=(this.lifeYMax*50).toFixed(2);
								if(this.lifeYMax*50>this.lifeMaxAffect[this.lifeDirection]){
									this.lifeMaxAffect[this.lifeDirection]=this.lifeYMax*50;
									document.getElementById("maxAffect"+this.xAxesNumber+""+this.lifeDirection).innerHTML=(this.lifeYMax*50).toFixed(2);
								}
								if(this.lifeYMax*50>affectStd){
									this.lifeAffectCount[this.lifeDirection]++;
									document.getElementById("affectCount"+this.xAxesNumber+""+this.lifeDirection).innerHTML=this.lifeAffectCount[this.lifeDirection];
								}
							}
							
							var maxNoise=0;	
							for (var i=2;i<this.lifePoints.length;i++){
								var noise1=(Math.abs((this.lifePoints[i].x+this.lifePoints[i-2].x)/2-this.lifePoints[i-1].x)/3)/2*3300;
								var	noise2=(Math.abs((this.lifePoints[i].y+this.lifePoints[i-2].y)/2-this.lifePoints[i-1].y)/3)/2*3300;
								maxNoise= noise1>maxNoise? noise1:maxNoise;
								maxNoise= noise2>maxNoise? noise2:maxNoise;
							}
							document.getElementById("noise"+this.xAxesNumber+""+this.lifeDirection).innerHTML=maxNoise.toFixed(1);
							this.lifeCycleCount[this.lifeDirection]++;
							document.getElementById("life"+this.xAxesNumber+""+this.lifeDirection).innerHTML=this.lifeCycleCount[this.lifeDirection];

							if(maxNoise>document.getElementById("lifeNoiseStd").value){
								this.lifeNoiseCount[this.lifeDirection]++;
								document.getElementById("noiseCount"+this.xAxesNumber+""+this.lifeDirection).innerHTML=this.lifeNoiseCount[this.lifeDirection];
								
								// 🔹 儲存紀錄
								const record = {
								  timestamp: new Date().toISOString(),         // 記錄時間
								  cycle: this.lifeCycleCount[this.lifeDirection], // 當前 cycle
								  direction: this.lifeDirection,              // 方向 1~4
								  maxNoise: maxNoise.toFixed(2),               // 最大雜訊
								  points: this.lifePoints.map(p => ({          // 複製所有點
									x: p.x,
									y: p.y,
									t: p.timestamp
								  }))
								};

								// 取出既有紀錄
								let logs = JSON.parse(localStorage.getItem("noiseLogs" + this.xAxesNumber) || "[]");
								logs.push(record);
								localStorage.setItem("noiseLogs" + this.xAxesNumber, JSON.stringify(logs));
							}
							if(maxNoise>this.lifeMaxNoise[this.lifeDirection]){
								this.lifeMaxNoise[this.lifeDirection]=maxNoise;
								document.getElementById("maxNoise"+this.xAxesNumber+""+this.lifeDirection).innerHTML=maxNoise.toFixed(1);
							}
							
							this.saveStats();

							//console.log("最大雜訊："+maxNoise.toFixed(1)+" , 樣本數："+this.lifePoints.length);
						}
						this.lifeDirection=0;
						this.lifePoints=[];

						this.lifeXMax=0;
						this.lifeYMax=0;
					}else{
						if(Math.abs(this.x)>this.lifeXMax)this.lifeXMax=Math.abs(this.x);
						if(Math.abs(this.y)>this.lifeYMax)this.lifeYMax=Math.abs(this.y);
					}
					if(this.lifeDirection>0 || (this.lifeDirection==0 && (Math.abs(this.x)>minBound ||Math.abs(this.y)>minBound ))){
						this.lifePoints.push({
							x: this.x,
							y: this.y,
							timestamp: Date.now() // 记录当前时间戳
						});
					}
				}
				
				if(checkBalance){
					var xbalance;
					var ybalance
					var balanceErr=parseFloat(document.getElementById("balanceErr").value);
					if(document.getElementById("useReturnCenter").checked){	
						xbalance=Math.abs((this.xMax-this.rightx)-(this.leftx-this.xMin))*50;
						ybalance=Math.abs((this.yMax-this.righty)-(this.lefty-this.yMin))*50;
					}else{
						xbalance=Math.abs(this.xMax+this.xMin)*50;
						ybalance=Math.abs(this.yMax+this.yMin)*50;
					}


					document.getElementById("balanceResult"+this.xAxesNumber).innerHTML=xbalance.toFixed(2)+"%";
					document.getElementById("balanceResult"+this.yAxesNumber).innerHTML=ybalance.toFixed(2)+"%";
					if(xbalance>balanceErr || ybalance>balanceErr){
						this.balancePass=false;
						document.getElementById("balanceCheck"+this.xAxesNumber).innerHTML="NG";
						document.getElementById("balanceCheck"+this.xAxesNumber).style.color="red";
					}else{
						this.balancePass=true;
						document.getElementById("balanceCheck"+this.xAxesNumber).innerHTML="OK";
						document.getElementById("balanceCheck"+this.xAxesNumber).style.color="green";
					}
				}
				if(!roundnessTest){
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
				}else{
					//確認光標點在真圓內的區域所在
					var areacode;
					if(this.x!=0){
						areacode = Math.round(Math.atan(this.y/this.x)*180/Math.PI/11.25);
						
						if(this.x<0) {
							areacode+=16;
						}else if(this.y<0 && areacode!=0){
							areacode+=32;
						}
					}else{
						if(this.y<0){
							areacode=24;
						}else{
							areacode=8;
						}
					}
					if(this.roundArray[areacode]<Math.sqrt(this.x*this.x+this.y*this.y))
						this.roundArray[areacode]= Math.sqrt(this.x*this.x+this.y*this.y).toFixed(2);
					var totalRoundness=0;
					for(var i=0;i<=31;i++){
						totalRoundness+=Math.abs(this.roundArray[i]-1);
					}
					var roundness=Math.abs(1-totalRoundness/32)*100;

					var minOutput;
					var maxOutput;

					minOutput = parseFloat(document.getElementById("output1").value)/100;
					maxOutput = parseFloat(document.getElementById("outputLow1").value)/100;
					document.getElementById("dvMaxUp1").innerHTML=(maxOutput*50+50)<=100?(maxOutput*50+50):100;
					document.getElementById("dvMaxDown1").innerHTML=(minOutput*50+50)<=100?(minOutput*50+50):100;
					document.getElementById("dvMinUp1").innerHTML=(50-minOutput*50)>=0?(50-minOutput*50):0;
					document.getElementById("dvMinDown1").innerHTML=(50-maxOutput*50)>=0?(50-maxOutput*50):0;
					
					if(document.getElementById("noColor").checked==false){
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
							//ctx.arc(ctxCenter+x*circleRadius, ctxCenter+y*circleRadius, 10, 0, Math.PI * 2, true);
							ctx.moveTo(ctxCenter,ctxCenter);
							ctx.lineTo(ctxCenter+myx1*circleRadius,ctxCenter+myy1*circleRadius);
							ctx.lineTo(ctxCenter+myx2*circleRadius,ctxCenter+myy2*circleRadius);
							
							ctx.closePath();
							ctx.fill();
						} 
					}
					//畫圓及方框
					ctx.beginPath();
					ctx.fillStyle = "black";
					ctx.strokeStyle = "black";
					ctx.arc(ctxCenter, ctxCenter, circleRadius, 0, Math.PI * 2, true);
					ctx.moveTo(ctxCenter,0);
					ctx.lineTo(ctxCenter,ctxWidth);
					ctx.moveTo(0,ctxCenter);
					ctx.lineTo(ctxWidth,ctxCenter);
					ctx.stroke();
					//畫搖桿XY位置點
					ctx.beginPath();
					ctx.fillStyle = "black";
					ctx.arc(ctxCenter+this.x*circleRadius, ctxCenter+this.y*circleRadius, 3, 0, Math.PI * 2, true);
					ctx.closePath();
					ctx.fill();

					ctx.beginPath();
					ctx.font = "10px Microsoft YaHei"
					this.roundnessPass=true;
					for(var j=0;j<=31;j++){
						var myx=Math.cos(11.25*j*Math.PI/180)*1.05;
						var myy=Math.sin(11.25*j*Math.PI/180)*1.05;
						
						if(this.roundArray[j]<minOutput || this.roundArray[j]>maxOutput){
							ctx.fillStyle="red";
							this.roundnessPass=false;
						}else {
							ctx.fillStyle="green";
						}
						ctx.fillText(Math.round(this.roundArray[j]*100)+"%",ctxCenter-10+myx*circleRadius,ctxCenter+myy*circleRadius);
					}
					if(document.getElementById("only4").checked){
						if(this.xMax<maxOutput && this.xMax>minOutput 
							&& this.xMin>(maxOutput*-1) && this.xMin<(minOutput*-1) 
							&& this.yMax<maxOutput && this.yMax>minOutput 
							&& this.yMin>(maxOutput*-1)&& this.yMin<(minOutput*-1)){
							this.roundnessPass=true;
						}else{
							this.roundnessPass=false;
							//console.log("xmax="+this.xMax+" , maxoutput="+maxOutput+" , xmin="+this.xMin+" , minoutput="+minOutput);
						}
					}
					if(this.xAxesNumber==0){
						if(!this.roundnessPass){
							document.querySelector('[data-key="range"]').style.color = "red";
						}else{
							document.querySelector('[data-key="range"]').style.color = "#555";
					}
					}
					if(this.roundnessPass){
						var rangeDV1 = document.getElementById("rangeDV1").value;
						var rangeDV2 = document.getElementById("rangeDV2").value;
						if((this.xMax-this.xMin)/2<(rangeDV1/100) || (this.yMax-this.yMin)/2<(rangeDV1/100) || (this.xMax-this.xMin)/2>(rangeDV2/100) || (this.yMax-this.yMin)/2>(rangeDV2/100)){
							this.roundnessPass=false;
						}
						if(this.xAxesNumber==0){
							if(!this.roundnessPass){
								document.querySelector('[data-key="rangeDV"]').style.color = "red";
							}else{
								document.querySelector('[data-key="rangeDV"]').style.color = "#555";
							}
						} 
					}
					ctx.fill();
					ctx.font = "32px Microsoft YaHei"
					ctx.fillStyle="orange";
					ctx.strokeStyle = 'white'; // 外框顏色
					ctx.lineWidth = 2;         // 外框寬度
					ctx.strokeText(roundness.toFixed(2)+"%",100,230,170); // 先畫外框
					ctx.fillText(roundness.toFixed(2)+"%",100,230,170);
					
					if(this.roundnessPass){
						ctx.fillStyle="green";
						//ctx.fillText("PASS",100,120,100);
					}else{
						ctx.fillStyle="red";
						//ctx.fillText("NG",110,120,100);
					}
					
					ctx.fill();
				}
				
				//測靜態雜波
				var noise;
				if(checkStaticNoise){		
					//console.log("noise="+noise);
					noise = Math.abs((this.x-this.staticX)*50);
					if(noise > this.xStaticNoiseMax) {
						this.xStaticNoiseMax=noise;
					}
					//console.log("noise="+noise+", x="+x+", staticX="+this.staticX);
					document.getElementById("staticResult"+this.xAxesNumber).innerHTML=this.xStaticNoiseMax.toFixed(1)+"%";

					noise = Math.abs((this.y-this.staticY)*50);
					if(noise>this.yStaticNoiseMax) {
						this.yStaticNoiseMax=noise;
					}
					document.getElementById("staticResult"+this.yAxesNumber).innerHTML=this.yStaticNoiseMax.toFixed(1)+"%";
				}
				
				//測滑動雜音
				if(checkSlideNoise){
					var slideNoise=0;
					if(Math.abs(this.x)>0.2 && Math.abs(this.lastx[0])>0.2 && Math.abs(this.lastx[1])>0.2){
						slideNoise=Math.abs((this.x+this.lastx[0])/2-this.lastx[1])/3;
						if(slideNoise>this.xMaxSlideNoise) this.xMaxSlideNoise=slideNoise;
					}
					if(Math.abs(this.y)>0.2 && Math.abs(this.lasty[0])>0.2 && Math.abs(this.lasty[1])>0.2){
						slideNoise=Math.abs((this.y+this.lasty[0])/2-this.lasty[1])/3;
						if(slideNoise>this.yMaxSlideNoise) this.yMaxSlideNoise=slideNoise;
					}
					this.lastx[0]=this.lastx[1];
					this.lastx[1]=this.x;
					this.lasty[0]=this.lasty[1];
					this.lasty[1]=this.y;

					document.getElementById("slideResult"+this.xAxesNumber).innerHTML=(this.xMaxSlideNoise/2*3300).toFixed(1)+"mV";
					document.getElementById("slideResult"+this.yAxesNumber).innerHTML=(this.yMaxSlideNoise/2*3300).toFixed(1)+"mV";
				}
				
				//順逆時針方向測試
				if(directionChecking){ 
					var zone;
					if(this.x>0.2 && this.y<-0.2){
						zone=1;
					}else if(this.x>0.2 && this.y>0.2){
						zone=2;
					}else if(this.x<-0.2 && this.y>0.2){
						zone=3;
					}else if(this.x<-0.2 && this.y<-0.2){
						zone=4;
					}else{
						zone=0;
					}
					if(this.directionPass==0){
						if (this.directionCycle==0){
							if(zone==1){
								this.directionCycle++;
							}else if(zone!=0){
								this.directionPass=2;
								
							}
						}else if(this.directionCycle==1){
							if(zone==2){
								this.directionCycle++;
							}else if(zone!=0 && zone!=1){
								this.directionPass=2;
							
							}
						}else if(this.directionCycle==2){
							if(zone==3){
								this.directionCycle++;
							}else if(zone!=0 && zone!=2){
								this.directionPass=2;
							
							}
						}else if(this.directionCycle==3){
							if(zone==4){
								this.directionPass=1;
							}else if(zone!=0 && zone!=3){
								this.directionPass=2;
							
							}
						}
					}

				}
				//更新最大最小和現在電壓
				document.getElementById("now"+this.xAxesNumber).innerHTML=(this.x*50+50).toFixed(2)+"%";
				document.getElementById("now"+this.yAxesNumber).innerHTML=(this.y*50+50).toFixed(2)+"%";
				if(this.x>this.xMax)	this.xMax=this.x;
				if(this.x<this.xMin) this.xMin=this.x;
				if(this.y>this.yMax) this.yMax=this.y;
				if(this.y<this.yMin) this.yMin=this.y;
				document.getElementById("max"+this.xAxesNumber).innerHTML=(this.xMax*50+50).toFixed(2)+"%";
				document.getElementById("min"+this.xAxesNumber).innerHTML=(this.xMin*50+50).toFixed(2)+"%";
				document.getElementById("max"+this.yAxesNumber).innerHTML=(this.yMax*50+50).toFixed(2)+"%";
				document.getElementById("min"+this.yAxesNumber).innerHTML=(this.yMin*50+50).toFixed(2)+"%";
			}
		}
	}
	saveStats() {
		const stats = {
			lifeCycleCount: this.lifeCycleCount,
			lifeNoiseCount: this.lifeNoiseCount,
			lifeMaxNoise: this.lifeMaxNoise,
			lifeMaxAffect: this.lifeMaxAffect,
			lifeAffectCount: this.lifeAffectCount,
			swLife: this.swLife
		};
		localStorage.setItem("noiseStats" + this.xAxesNumber, JSON.stringify(stats));
	}
	loadStats() {
		const data = JSON.parse(localStorage.getItem("noiseStats" + this.xAxesNumber) || "null");
		if (data) {
			this.lifeCycleCount = data.lifeCycleCount;
			this.lifeNoiseCount = data.lifeNoiseCount;
			this.lifeMaxNoise = data.lifeMaxNoise;
			this.lifeMaxAffect = data.lifeMaxAffect;
			this.lifeAffectCount = data.lifeAffectCount;
			this.swLife = data.swLife;
		}
		this.renderStats();
	}
	renderStats() {
		const prefix = this.xAxesNumber; // 0 或 2

		// 上 = 1
		document.getElementById("life" + prefix + "1").innerText = this.lifeCycleCount[1];
		document.getElementById("maxNoise" + prefix + "1").innerText = this.lifeMaxNoise[1].toFixed(1);
		document.getElementById("noiseCount" + prefix + "1").innerText = this.lifeNoiseCount[1];
		document.getElementById("maxAffect" + prefix + "1").innerText = this.lifeMaxAffect[1].toFixed(2);
		document.getElementById("affectCount" + prefix + "1").innerText = this.lifeAffectCount[1];

		// 下 = 3
		document.getElementById("life" + prefix + "3").innerText = this.lifeCycleCount[3];
		document.getElementById("maxNoise" + prefix + "3").innerText = this.lifeMaxNoise[3].toFixed(1);
		document.getElementById("noiseCount" + prefix + "3").innerText = this.lifeNoiseCount[3];
		document.getElementById("maxAffect" + prefix + "3").innerText = this.lifeMaxAffect[3].toFixed(2);
		document.getElementById("affectCount" + prefix + "3").innerText = this.lifeAffectCount[3];

		// 左 = 4
		document.getElementById("life" + prefix + "4").innerText = this.lifeCycleCount[4];
		document.getElementById("maxNoise" + prefix + "4").innerText = this.lifeMaxNoise[4].toFixed(1);
		document.getElementById("noiseCount" + prefix + "4").innerText = this.lifeNoiseCount[4];
		document.getElementById("maxAffect" + prefix + "4").innerText = this.lifeMaxAffect[4].toFixed(2);
		document.getElementById("affectCount" + prefix + "4").innerText = this.lifeAffectCount[4];

		// 右 = 2
		document.getElementById("life" + prefix + "2").innerText = this.lifeCycleCount[2];
		document.getElementById("maxNoise" + prefix + "2").innerText = this.lifeMaxNoise[2].toFixed(1);
		document.getElementById("noiseCount" + prefix + "2").innerText = this.lifeNoiseCount[2];
		document.getElementById("maxAffect" + prefix + "2").innerText = this.lifeMaxAffect[2].toFixed(2);
		document.getElementById("affectCount" + prefix + "2").innerText = this.lifeAffectCount[2];

		// 開關
		document.getElementById("lifeSW" + prefix).innerText = this.swLife;
	}
	clearStats() {
		this.lifeCycleCount = [0,0,0,0,0];
		this.lifeNoiseCount = [0,0,0,0,0];
		this.lifeMaxNoise = [0,0,0,0,0];
		this.lifeMaxAffect = [0,0,0,0,0];
		this.lifeAffectCount = [0,0,0,0,0];
		this.swLife = 0;

		localStorage.removeItem("noiseStats" + this.xAxesNumber);
		this.renderStats();
	}

	addPoint(x, y) {
		this.points.push({
			x: x,
			y: y,
			timestamp: Date.now() // 记录当前时间戳
		});
	}
	removeOldPoints(sec) {
		const now = Date.now();
		
		const oneSecondAgo = now - sec*1000; // 1秒前的时间戳
		
		// 移除所有时间戳早于1秒前的点
		while (this.points.length > 0 && this.points[0].timestamp < oneSecondAgo) {
			this.points.shift(); // 从数组开头移除
		}
	}
	getSection(){
		var cx=ctxCenter+this.originX*circleRadius;
		var cy=ctxCenter+this.originY*circleRadius;
		
		const dx = (ctxCenter+this.x*circleRadius) - cx;
		const dy = (ctxCenter+this.y*circleRadius) - cy;
		// 计算到圆心的距离
		const distance = Math.sqrt(dx * dx + dy * dy);
		// 检查是否在圆环范围内
		if (distance < innerRadius ) {
			return -1; // 不在任何扇形内，在內圓之內
		}else if(distance > outerRadius){
			return 10; // 不在任何扇形内，在外圓之外
		}
		// 计算角度 (0到2π)
		let angle = Math.atan2(dy, dx);
		angle+= (45*(Math.PI/180));
		if (angle < 0) angle += 2 * Math.PI;
		// 确定扇形索引 (0-3)
		return Math.floor(angle / (Math.PI / 2));

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
				gamepadContext.arc(188+joystick2.x*7, 187+joystick2.y*7, 18, 0, Math.PI * 2, true);
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
var canvasL=new Array(8);
var testL=new Array(8);
var canvasR=new Array(8);
var testR=new Array(8);
for(var i=0;i<=7;i++){
	canvasL[i]=document.getElementById('testL'+i);
	canvasR[i]=document.getElementById('testR'+i);
	testDone("L",i,0);
	testDone("R",i,0);
}

function testDone(side, num, result){
	var resultColor;
	if(result==0) resultColor="gray";
	else if(result==1) resultColor="green";
	else if(result==2) resultColor="red";
	if(side=="L"){
		draw3DBall(canvasL[num],resultColor);
		testL[num]=result;
		//if(num==4)
		//	console.log("testDone called, side="+side+" , num="+num+" , color="+resultColor);
	}else{
		draw3DBall(canvasR[num],resultColor);
		testR[num]=result;
	}
}
function draw3DBall(canvas, mainColor) {
  const ctx = canvas.getContext("2d");

  // 計算畫布中心座標
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) / 2.5; // 確保圓適合畫布

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = mainColor;
  ctx.strokeStyle="black";
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

}

const resetBtn=document.getElementById("resetButton");
resetBtn.addEventListener('click', function(){
	if(checkGamepadsConnected()){
		joystick1.xMax=joystick1.x;
		joystick1.xMin=joystick1.x;
		joystick1.yMax=joystick1.y;
		joystick1.yMin=joystick1.y;
		joystick2.xMax=joystick2.x;
		joystick2.xMin=joystick2.x;
		joystick2.yMax=joystick2.y;
		joystick2.yMin=joystick2.y;
		returnBtn[0][2].style.backgroundColor = "#F2CC8F";
		returnBtn[0][3].style.backgroundColor = "#F2CC8F";
		returnBtn[0][0].style.backgroundColor = "#F2CC8F";
		returnBtn[0][1].style.backgroundColor = "#F2CC8F";
		returnBtn[1][2].style.backgroundColor = "#F2CC8F";
		returnBtn[1][3].style.backgroundColor = "#F2CC8F";
		returnBtn[1][0].style.backgroundColor = "#F2CC8F";
		returnBtn[1][1].style.backgroundColor = "#F2CC8F";
		
		document.getElementById("xLeft1").innerHTML="";
		document.getElementById("xRight1").innerHTML="";
		document.getElementById("xLR1").innerHTML="";
		document.getElementById("yUp1").innerHTML="";
		document.getElementById("yDown1").innerHTML="";
		document.getElementById("yUD1").innerHTML="";
		document.getElementById("xLeft2").innerHTML="";
		document.getElementById("xRight2").innerHTML="";
		document.getElementById("xLR2").innerHTML="";
		document.getElementById("yUp2").innerHTML="";
		document.getElementById("yDown2").innerHTML="";
		document.getElementById("yUD2").innerHTML="";
	}else{
		alert("請先連接上手柄再操作。");
	}
});
const saveButton = document.getElementById('saveButton');
var unsavedTest = false;	//本筆測試是否尚未保存(用於「必須保存才能重測」檢查)

//播放警告音(Web Audio API，不需要音檔)
function playWarnSound(){
	try{
		var ctx = new (window.AudioContext || window.webkitAudioContext)();
		var osc = ctx.createOscillator();
		var gain = ctx.createGain();
		osc.type = 'square';
		osc.frequency.setValueAtTime(880, ctx.currentTime);
		osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
		gain.gain.setValueAtTime(0.25, ctx.currentTime);
		gain.gain.setValueAtTime(0, ctx.currentTime + 0.3);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + 0.3);
		osc.onended = function(){ ctx.close(); };
	}catch(e){
		//忽略音效播放失敗
	}
}

//顯示「必須保存才能重測」警告：置中、有警示音、需點擊(或按鈕/空白鍵)才消失
function showSaveWarning(){
	var warnToast = document.getElementById('warnToast');
	if(warnToast.classList.contains('show')){
		return;	//已在顯示中，不重複跳出
	}
	warnToast.classList.add('show');
	playWarnSound();
}
//點擊警告框或「確定」按鈕關閉
document.getElementById('warnToast').addEventListener('click', function(){
	this.classList.remove('show');
});
saveButton.addEventListener('click', function() {
	if(checkGamepadsConnected()){
		const toast = document.getElementById('toast');
		// 顯示toast
		toast.classList.add('show');
		// 3秒後自動隱藏
		setTimeout(() => {
			toast.classList.remove('show');
		}, 3000);

		var data1 = (joystick1.x*50+50).toFixed(2);
		var data2 = (joystick1.xMax*50+50).toFixed(2);
		var data3 = (joystick1.xMin*50+50).toFixed(2);
		var data4 = (joystick1.leftx*50+50).toFixed(2);
		var data5 = (joystick1.rightx*50+50).toFixed(2);
		var data6 = (Math.abs(joystick1.leftx-joystick1.rightx)*50).toFixed(2);
		var data7 = (joystick1.xMaxSlideNoise/2*3300).toFixed(2);
		var data8 = (joystick1.y*50+50).toFixed(2);
		var data9 = (joystick1.yMax*50+50).toFixed(2);
		var data10 = (joystick1.yMin*50+50).toFixed(2);
		var data11 = (joystick1.lefty*50+50).toFixed(2);
		var data12 = (joystick1.righty*50+50).toFixed(2);
		var data13 = (Math.abs(joystick1.lefty-joystick1.righty)*50).toFixed(2);
		var data14 = (joystick1.yMaxSlideNoise/2*3300).toFixed(2);
		
		const testResult = {
			//左搖桿
			timestamp: new Date().toLocaleString(),	//現在時間
			data1,	//x分壓
			data2,	//x最大
			data3,	//x最小
			data4,	//左複歸
			data5,	//右複歸
			data6,	//左右複歸
			data7,	//x滑動雜訊
			data8,	//y分壓
			data9,	//y最大
			data10,	//y最小
			data11,	//上複歸
			data12,	//下複歸
			data13,	//上下複歸
			data14	//y滑動雜訊
		};
		// 從localStorage獲取現有數據或初始化空數組
		let savedResults = JSON.parse(localStorage.getItem('testResults')) || [];
		// 添加新結果
		savedResults.push(testResult);
		// 保存回localStorage
		localStorage.setItem('testResults', JSON.stringify(savedResults));
		data1 = (joystick2.x*50+50).toFixed(2);
		data2 = (joystick2.xMax*50+50).toFixed(2);
		data3 = (joystick2.xMin*50+50).toFixed(2);
		data4 = (joystick2.leftx*50+50).toFixed(2);
		data5 = (joystick2.rightx*50+50).toFixed(2);
		data6 = (Math.abs(joystick2.leftx-joystick2.rightx)*50).toFixed(2);
		data7 = (joystick2.xMaxSlideNoise/2*3300).toFixed(2);
		data8 = (joystick2.y*50+50).toFixed(2);
		data9 = (joystick2.yMax*50+50).toFixed(2);
		data10 = (joystick2.yMin*50+50).toFixed(2);
		data11 = (joystick2.lefty*50+50).toFixed(2);
		data12 = (joystick2.righty*50+50).toFixed(2);
		data13 = (Math.abs(joystick2.lefty-joystick2.righty)*50).toFixed(2);
		data14 = (joystick2.yMaxSlideNoise/2*3300).toFixed(2);
		
		const testResult2 = {
			//右搖桿
			timestamp: new Date().toLocaleString(),	//現在時間
			data1,	//x分壓
			data2,	//x最大
			data3,	//x最小
			data4,	//左複歸
			data5,	//右複歸
			data6,	//左右複歸
			data7,	//x滑動雜訊
			data8,	//y分壓
			data9,	//y最大
			data10,	//y最小
			data11,	//上複歸
			data12,	//下複歸
			data13,	//上下複歸
			data14	//y滑動雜訊
		};
		
		// 從localStorage獲取現有數據或初始化空數組
		let savedResults2 = JSON.parse(localStorage.getItem('testResults2')) || [];
		
		// 添加新結果
		savedResults2.push(testResult2);
		
		// 保存回localStorage
		localStorage.setItem('testResults2', JSON.stringify(savedResults2));
		unsavedTest = false;	//已保存，解除「必須保存才能重測」限制
	}else{
		alert("請先連接上手柄再作保存！");
	}
});
var deadzoneSTD=parseFloat(document.getElementById("centerStd").value);
var noiseSTD=parseFloat(document.getElementById("noiseStd").value);
var returnSTD=parseFloat(document.getElementById("returnStd").value);
const button = document.getElementById('testButton');
let intervalId;
// 为按钮添加点击事件
button.addEventListener('click', function() {

	//「必須保存才能重測」：上一筆測試尚未保存時，阻止開始新測試
	if(document.getElementById("mustSaveCB").checked && unsavedTest){
		showSaveWarning();
		return;
	}

	document.querySelector('[data-key="tolerance"]').style.color = "#555";
	document.querySelector('[data-key="staticNoiseMax"]').style.color = "#555";
	document.querySelector('[data-key="slideNoiseMax"]').style.color = "#555";
	document.querySelector('[data-key="balanceErr"]').style.color = "#555";
	document.querySelector('[data-key="onesideDV"]').style.color = "#555";
	document.querySelector('[data-key="rotateUL"]').style.color = "#555";
	document.querySelector('[data-key="rangeMax"]').style.color = "#555";	
	document.querySelector('[data-key="returnErr"]').style.color = "#555";
	document.querySelector('[data-key="range"]').style.color = "#555";
	document.querySelector('[data-key="rangeDV"]').style.color = "#555";


	if(gamepads[focusGamepad]){
		clearInterval(intervalId); // 停止定时任务
		unsavedTest = true;	//本筆測試開始，標記為未保存
		document.getElementById("track0").checked=true;
		document.getElementById("left-joystick-track").getContext("2d").clearRect(0,0,ctxWidth,ctxWidth);
		document.getElementById("track2").checked=true;
		document.getElementById("right-joystick-track").getContext("2d").clearRect(0,0,ctxWidth,ctxWidth);
		
		resetBtn.click();
		for(var k=0;k<=3;k++){
			returnCheck[0][k]=false;
			returnCheck[1][k]=false;
		}
		joystick1.leftx=0;
		joystick1.rightx=0;
		joystick2.lefty=0;
		joystick2.righty=0;
		joystick1.directionPass=0;
		joystick2.directionPass=0;
		for(var i=0;i<=7;i++){
			canvasL[i]=document.getElementById('testL'+i);
			canvasR[i]=document.getElementById('testR'+i);
			testDone("L",i,0);
			testDone("R",i,0);
		}
		var x1,y1,x2,y2;
		x1=joystick1.x*50;
		y1=joystick1.y*50;
		x2=joystick2.x*50;
		y2=joystick2.y*50;

		deadzoneSTD=parseFloat(document.getElementById("centerStd").value);
		noiseSTD=parseFloat(document.getElementById("noiseStd").value);
		returnSTD=parseFloat(document.getElementById("returnStd").value);

		if(Math.abs(x1)>deadzoneSTD ||Math.abs(y1)>deadzoneSTD){	
			testDone("L",0,2);	
			document.querySelector('[data-key="tolerance"]').style.color = "red";
		}else{
			testDone("L",0,1);
			document.querySelector('[data-key="tolerance"]').style.color = "#555";
		}
		var ctx = canvasL[0].getContext("2d");
		ctx.fillStyle = 'white';
		ctx.font = 'bold 15px Arial'; // 字體大小和字型
		ctx.textAlign = 'center';
		joystick1.centerDV=Math.abs(x1)>Math.abs(y1)?Math.abs(x1).toFixed(1):Math.abs(y1).toFixed(1);
		ctx.fillText(joystick1.centerDV+"%",canvasL[0].width/2,canvasL[0].height/2,80);
		
		if(Math.abs(x2)>deadzoneSTD ||Math.abs(y2)>deadzoneSTD){
			testDone("R",0,2);
		}else{
			testDone("R",0,1);
		}
		ctx = canvasR[0].getContext("2d");
		ctx.fillStyle = 'white';
		ctx.font = 'bold 15px Arial'; // 字體大小和字型
		ctx.textAlign = 'center';
		joystick2.centerDV=Math.abs(x2)>Math.abs(y2)?Math.abs(x2).toFixed(1):Math.abs(y2).toFixed(1);
		ctx.fillText(joystick2.centerDV+"%",canvasR[0].width/2,canvasR[0].height/2,80)
		joystick1.xMaxSlideNoise=0;
		joystick1.yMaxSlideNoise=0;
		joystick2.xMaxSlideNoise=0;
		joystick2.yMaxSlideNoise=0;
		if(document.getElementById("slideNoiseCB1").checked){
			slideNoiseStd=parseFloat(document.getElementById("slideNoiseStd").value);
		}
		
		if(document.getElementById("staticNoiseTest").checked){
			staticNoiseCB1.checked=false;
			staticNoiseCB1.dispatchEvent(new Event("change"));
			staticNoiseCB1.checked=true;
			staticNoiseCB1.dispatchEvent(new Event("change"));
			setTimeout(() => {
				if(joystick1.xStaticNoiseMax>noiseSTD || joystick1.yStaticNoiseMax>noiseSTD ){
					testDone("L",1,2);
					document.querySelector('[data-key="staticNoiseMax"]').style.color = "red";
				}else{
					testDone("L",1,1);
					document.querySelector('[data-key="staticNoiseMax"]').style.color = "#555";
				}
				
				ctx = canvasL[1].getContext("2d");
				ctx.fillStyle = 'white';
				ctx.font = 'bold 15px Arial'; // 字體大小和字型
				ctx.textAlign = 'center';
				ctx.fillText((joystick1.xStaticNoiseMax>joystick1.yStaticNoiseMax?joystick1.xStaticNoiseMax.toFixed(1):joystick1.yStaticNoiseMax.toFixed(1))+"%",canvasL[1].width/2,canvasL[1].height/2,80)

				
				if(joystick2.xStaticNoiseMax>noiseSTD || joystick2.yStaticNoiseMax>noiseSTD ){
					testDone("R",1,2);
				}else{
					testDone("R",1,1);
				}
				ctx = canvasR[1].getContext("2d");
				ctx.fillStyle = 'white';
				ctx.font = 'bold 15px Arial'; // 字體大小和字型
				ctx.textAlign = 'center';
				ctx.fillText((joystick2.xStaticNoiseMax>joystick2.yStaticNoiseMax?joystick2.xStaticNoiseMax.toFixed(1):joystick2.yStaticNoiseMax.toFixed(1))+"%",canvasR[1].width/2,canvasR[1].height/2,80)

				//console.log("xStaticNoiseMax="+joystick1.xStaticNoiseMax+", noiseSTD="+noiseSTD);
				staticNoiseCB1.checked=false;
				staticNoiseCB1.dispatchEvent(new Event("change"));		
			}, 1000);
		}
		//wobbleCB0.checked=true;
		wobbleCB0.dispatchEvent(new Event("change"));

		//roundnessTestCB1.checked=true;
		roundnessTestCB1.dispatchEvent(new Event("change"));
		slideNoiseCB1.dispatchEvent(new Event("change"));

		intervalId = setInterval(() => {
			if (joystick1.roundnessPass) {
				var onesideDV = document.getElementById("onesideDV").value;
				if(Math.abs(joystick1.xMax-joystick1.rightx)*50<onesideDV || Math.abs(joystick1.xMin-joystick1.leftx)*50<onesideDV || Math.abs(joystick1.yMax-joystick1.righty)*50<onesideDV || Math.abs(joystick1.yMin-joystick1.lefty)*50<onesideDV){
					testDone("L",2,2);
					document.querySelector('[data-key="onesideDV"]').style.color = "red";
				}else{
					testDone("L",2,1);
					document.querySelector('[data-key="onesideDV"]').style.color = "#555";
				}
			}else{
				testDone("L",2,2);

			}
			if (joystick2.roundnessPass) {
				testDone("R",2,1);
			}else{
				testDone("R",2,2);
			}
			if(joystick1.directionPass==1){
				testDone("L",3,1);
				document.querySelector('[data-key="rotateUL"]').style.color = "#555";

			}else if(joystick1.directionPass==2){
				testDone("L",3,2);
				document.querySelector('[data-key="rotateUL"]').style.color = "red";
			}
			if(joystick2.directionPass==1){
				testDone("R",3,1);
			}else if(joystick2.directionPass==2){
				testDone("R",3,2);
			}
			var maxReturn=0;
			if(returnCheck[0][0]&&returnCheck[0][1]&&returnCheck[0][2]&&returnCheck[0][3]){
				maxReturn=Math.max(Math.abs((joystick1.leftx-joystick1.rightx)*100/2),Math.abs((joystick1.lefty-joystick1.righty)*100/2));
				if(maxReturn>returnSTD){
					testDone("L",4,2);
					document.querySelector('[data-key="rangeMax"]').style.color = "red";
				}else{
					document.querySelector('[data-key="rangeMax"]').style.color = "#555";				
					var returnErr=document.getElementById("returnErr").value;
					if(Math.abs(joystick1.leftx*50)>returnErr || Math.abs(joystick1.rightx*50)>returnErr || Math.abs(joystick1.lefty*50)>returnErr || Math.abs(joystick1.righty*50)>returnErr){
						testDone("L",4,2);
						document.querySelector('[data-key="returnErr"]').style.color = "red";
					}else{
						testDone("L",4,1);
						document.querySelector('[data-key="returnErr"]').style.color = "#555";
					}
				}
				ctx = canvasL[4].getContext("2d");
				ctx.fillStyle = 'white';
				ctx.font = 'bold 15px Arial'; // 字體大小和字型
				ctx.textAlign = 'center';
				ctx.fillText(maxReturn.toFixed(1)+"%",canvasL[4].width/2,canvasL[4].height/2,80)
			}
			if(returnCheck[1][0]&&returnCheck[1][1]&&returnCheck[1][2]&&returnCheck[1][3]){
				maxReturn=Math.max(Math.abs((joystick2.leftx-joystick2.rightx)*100/2),Math.abs((joystick2.lefty-joystick2.righty)*100/2));
				if(maxReturn>returnSTD){
					testDone("R",4,2);
				}else{
					var returnErr=document.getElementById("returnErr").value;
					if(Math.abs(joystick2.leftx*50)>returnErr || Math.abs(joystick2.rightx*50)>returnErr || Math.abs(joystick2.lefty*50)>returnErr || Math.abs(joystick2.righty*50)>returnErr){
						testDone("R",4,2);
					}else{
						testDone("R",4,1);
					}
				}
				ctx = canvasR[4].getContext("2d");
				ctx.fillStyle = 'white';
				ctx.font = 'bold 15px Arial'; // 字體大小和字型
				ctx.textAlign = 'center';
				ctx.fillText(maxReturn.toFixed(1)+"%",canvasR[4].width/2,canvasR[4].height/2,80)
			}
			if(joystick1.xMaxSlideNoise/2*3300>slideNoiseStd || joystick1.yMaxSlideNoise/2*3300>slideNoiseStd){
				testDone("L",6,2);
				document.querySelector('[data-key="slideNoiseMax"]').style.color = "red";
			}else{
				testDone("L",6,1);
				document.querySelector('[data-key="slideNoiseMax"]').style.color = "#555";
			}
			if(joystick2.xMaxSlideNoise/2*3300>slideNoiseStd || joystick2.yMaxSlideNoise/2*3300>slideNoiseStd){
				testDone("R",6,2);
			}else{
				testDone("R",6,1);
			}
			if(joystick1.balancePass){
				testDone("L",7,1);
				document.querySelector('[data-key="balanceErr"]').style.color = "#555";
			}else{
				testDone("L",7,2);
				document.querySelector('[data-key="balanceErr"]').style.color = "red";
			}
			if(joystick2.balancePass){
				testDone("R",7,1);
			}else{
				testDone("R",7,2);
			}
		}, 10);

		directionCheck.dispatchEvent(new Event("change"));
	}else{
		alert("未連接手柄，請操作一下搖桿來和系統連線，再開始測試");
	}
});
document.addEventListener('keydown', function(event) {
	if (event.key === ' ') {  // 空白键
		event.preventDefault();  // 防止空白键滚动页面
	}else if (event.key === 'ArrowUp') {  // 上
		event.preventDefault();  // 防止滚动页面
	}else if (event.key === 'ArrowDown') {  // 下
		event.preventDefault();  // 防止滚动页面
	}else if (event.key === 'ArrowLeft') {  // 左
		event.preventDefault();  // 防止滚动页面
	}else if (event.key === 'ArrowRight') {  // 右
		event.preventDefault();  // 防止滚动页面
	}else if(event.key==='Enter'){
		event.preventDefault();  // 防止空白键滚动页面
	}
});
document.addEventListener('keyup', function(event) {
	if (event.key === ' ') {  // 空白键
		event.preventDefault();  // 防止空白键滚动页面
		button.click();  // 模拟点击按钮
	}else if (event.key === 'ArrowUp') {  // 上
		event.preventDefault();  // 防止滚动页面
		returnBtn[0][0].click();  // 模拟点击按钮		
		returnBtn[1][0].click(); 
		returnCheck[0][0]=true;
		returnCheck[1][0]=true;
	}else if (event.key === 'ArrowDown') {  // 下
		event.preventDefault();  // 防止滚动页面
		returnBtn[0][1].click();
		returnBtn[1][1].click();
		returnCheck[0][1]=true;
		returnCheck[1][1]=true;
	}else if (event.key === 'ArrowLeft') {  // 左
		event.preventDefault();  // 防止滚动页面
		returnBtn[1][2].click();  // 模拟点击按钮
		returnBtn[0][2].click();  // 模拟点击按钮
		returnCheck[0][2]=true;
		returnCheck[1][2]=true;
	}else if (event.key === 'ArrowRight') {  // 右
		event.preventDefault();  // 防止滚动页面
		
		returnBtn[0][3].click();
		returnBtn[1][3].click();
		returnCheck[0][3]=true;
		returnCheck[1][3]=true;
	}else if(event.key==='Enter'){
		event.preventDefault();  // 防止空白键滚动页面
		saveButton.click();
	}
});

// 取得下拉選單元素
const modelSelect = document.getElementById('models');

// 添加預設選項
const defaultOption = document.createElement('option');
defaultOption.value = '';
defaultOption.textContent = '-- Model --';
defaultOption.selected = true;
defaultOption.disabled = true;
modelSelect.appendChild(defaultOption);

// 取得下拉選單元素
const terminalSelect = document.getElementById('terminalOptions');

// 添加預設選項
const terminalOption = document.createElement('option');

// 動態添加型號選項
models.forEach(model => {
    const option = document.createElement('option');
    option.value = model.name;
    option.textContent = model.name;
    modelSelect.appendChild(option);
});

// 添加事件監聽器
modelSelect.addEventListener('change', function() {
    const selectedValue = this.value;
    if (selectedValue) {
        const selectedModel = models.find(model => model.name === selectedValue);
        console.log('已選擇:', selectedModel.name);
		roundnessTestCB1.checked=true;
		roundnessTestCB1.dispatchEvent(new Event("change"));
		document.getElementById("outputLow1").value=selectedModel.rangeUp;
		document.getElementById("output1").value=selectedModel.rangeDown;
		document.getElementById("balanceErr").value=selectedModel.balanceStd;
		document.getElementById("ringUp").value=selectedModel.ringUp;
		document.getElementById("ringLow").value=selectedModel.ringLow;

		if(selectedModel.roundnessTest){
			roundnessCB1.checked=true;
		}else{
			roundnessCB1.checked=false;
		}
		if(selectedModel.only4D) {
			document.getElementById("only4").checked=true;
		}else{
			document.getElementById("only4").checked=false;
		} 
		if(selectedModel.staticTest){
			staticTestCB.checked=true;
		}else{
			staticTestCB.checked=false;
		}
		if(selectedModel.slideTest){
			slideNoiseCB1.checked=true;
		}else{
			slideNoiseCB1.checked=false;
		}
		if(selectedModel.directionTest){
			directionCheck.checked=true;
		}else{
			directionCheck.checked=false;
		}
		if(selectedModel.returnTest){
			wobbleCB0.checked=true;
		}else{
			wobbleCB0.checked=false;
		}
		if(selectedModel.returnRing){
			returnRingCB.checked=true;
		}else{
			returnRingCB.checked=false;
		}
		if(selectedModel.balanceTest){
			balanceTestCB0.checked=true;
		}else{
			balanceTestCB0.checked=false;
		}
		if(selectedModel.switchTest){
			switchTestCB.checked=true;
		}else{
			switchTestCB.checked=false;
		}
		balanceTestCB0.dispatchEvent(new Event("change"));
		wobbleCB0.dispatchEvent(new Event("change"));
		roundnessCB1.dispatchEvent(new Event("change"));
		directionCheck.dispatchEvent(new Event("change"));
		slideNoiseCB1.dispatchEvent(new Event("change"));
		staticTestCB.dispatchEvent(new Event("change"));
		switchTestCB.dispatchEvent(new Event("change"));
		document.getElementById("centerStd").value=selectedModel.centerV;
		document.getElementById("noiseStd").value=selectedModel.noise;
		document.getElementById("returnStd").value=selectedModel.returnAccuracy;
		document.getElementById("note").innerHTML=selectedModel.note;
		document.getElementById("slideNoiseStd").value=selectedModel.slideNoise;
		
		terminalSelect.innerHTML="";

		var terminals=selectedModel.options;
		for(i=0;i<terminals.length;i++){
			var option = document.createElement('option');
			option.value = terminals[i];
			option.textContent = terminals[i];
			terminalSelect.appendChild(option);
		}
		changeTerminal(terminals[0]);
    }
});

// 添加事件監聽器
terminalSelect.addEventListener('change', function() {
    const selectedValue = this.value;
    if (selectedValue) {
        console.log('已選擇:', selectedValue);
		changeTerminal(selectedValue);
    }
});

function changeTerminal(selectedValue){
	if(selectedValue==2){
		joystick1.xVolt=1;
		joystick1.yVolt=1;
		joystick2.xVolt=1;
		joystick2.yVolt=1;			
	}else if(selectedValue==3){
		joystick1.xVolt=3;
		joystick1.yVolt=3;
		joystick2.xVolt=3;
		joystick2.yVolt=3;	
	}else if(selectedValue==4){
		joystick1.xVolt=1;
		joystick1.yVolt=3;
		joystick2.xVolt=1;
		joystick2.yVolt=3;	
	}else if(selectedValue==5){
		joystick1.xVolt=3;
		joystick1.yVolt=1;
		joystick2.xVolt=3;
		joystick2.yVolt=1;	
	}
}
function checkRemove(data) {
	var sum=0;
	var range=0;
	if(data.length>=sampleNum){
		var adding;
		
		if(data[1]>data[0]){ 
			adding=true;
			range+=(data[1]-data[0]);
		}else{ 
			adding=false;
			range+=(data[0]-data[1]);
		}
		for(i=2;i<=sampleNum-1;i++){
			if(adding){
				if(data[i]<data[i-1]){
					if(range>0.2){
						sum++;
					}
					adding=false;
					range=0;
				}else{
					range+=(data[i]-data[i-1]);
				}
			}else{
				if(data[i]>data[i-1]){
					if(range>0.2){
						sum++;
					}
					adding=true;
					range=0;
				}else{
					range+=(data[i-1]-data[i]);
				}
			}
		}
	}
	//console.log("sum="+sum);
	if(sum>10){
		replaced=true;
	}
}

function calculateStandardDeviation(numbers) {
  // 1. 計算平均值
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  
  // 2. 計算每個數與平均值的差的平方
  const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));
  
  // 3. 計算方差（平方差的平均值）
  const variance = squaredDifferences.reduce((sum, num) => sum + num, 0) / numbers.length;
  
  // 4. 取平方根得到標準差
  const standardDeviation = Math.sqrt(variance);
  
  return standardDeviation;
}