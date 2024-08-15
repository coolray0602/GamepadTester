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

var phase = 0;	//線性測試的階段，共1到4
var phaseDone =0; //已完成線性測試的方向，共4個
var x1LinearityCanvas = document.getElementById("linearityCanvasX1");
var x1linearityCtx = x1LinearityCanvas.getContext("2d");
var x2LinearityCanvas = document.getElementById("linearityCanvasX2");
var x2linearityCtx = x2LinearityCanvas.getContext("2d");
var y1LinearityCanvas = document.getElementById("linearityCanvasY1");
var y1linearityCtx = y1LinearityCanvas.getContext("2d");
var y2LinearityCanvas = document.getElementById("linearityCanvasY2");
var y2linearityCtx = y2LinearityCanvas.getContext("2d");

var outDeadzone=1.5; //outer deadzone limitation setup for linearity test
//var noiseCriteria=3;

//document.getElementById("noiseCriteria").innerHTML=noiseCriteria;

var joystickBtnCanvas = document.getElementById("joystickBtns");
var jbctx = joystickBtnCanvas.getContext("2d");


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
//====================線性測試前置==============
var linearityX=2;
var linearityY=3;
rbRJ = document.getElementById("RJ");
rbRJ.addEventListener('change', function() {
	if (this.checked) {
		linearityX=2;
		linearityY=3;
	}
});
rbLJ = document.getElementById("LJ");
rbLJ.addEventListener('change', function() {
	if (this.checked) {
		linearityX=0;
		linearityY=1;
	}
});
var maxErrX1;
var maxErrX2;
var maxErrY1;
var maxErrY2;
var linearityStd;
var linearityTestBtn = document.getElementById("linearityTestBtn");
linearityTestBtn.onclick = function(){
	if(joystickConnected){

		if(linearityTestBtn.value=="START"){
			linearityTesting=true;
			linearityTestBtn.value="STOP";
			xCenter=gamepads[focusGamepad].axes[linearityX];	//設定0，1時為左搖桿，2，3時為右搖桿
			yCenter=gamepads[focusGamepad].axes[linearityY];
			linearityStd=parseFloat(document.getElementById("linearityStd").value);
			//console.log("std="+linearityStd);
			clearCtx(x1linearityCtx,linearityStd);
			clearCtx(x2linearityCtx,linearityStd);
			clearCtx(y1linearityCtx,linearityStd);
			clearCtx(y2linearityCtx,linearityStd);
			phase=1;
			xLinearityArray=[];
			yLinearityArray=[];
			phaseDone=0;
			maxErrX1=0;
			maxErrX2=0;
			maxErrY1=0;
			maxErrY2=0;
			document.getElementById("resultX1").innerHTML="";
			document.getElementById("resultX2").innerHTML="";
			document.getElementById("resultY1").innerHTML="";
			document.getElementById("resultY2").innerHTML="";
			document.getElementById("xGo").style.backgroundColor="white";
			document.getElementById("xBack").style.backgroundColor="white";
			document.getElementById("yGo").style.backgroundColor="white";
			document.getElementById("yBack").style.backgroundColor="white";
			xGoPass=true;
			xBackPass=true;
			yGoPass=true;
			yBackPass=true;
		}else{
			linearityTesting=false;
			linearityTestBtn.value="START";
			phase=0;
		}
		
	}
}

function clearCtx(ctx,std){
	
	ctx.clearRect(0, 0, linearityCanvasSize, linearityCanvasSize);
	
	ctx.strokeStyle="rgba(50,120,255,0.3)";
	ctx.beginPath();
	ctx.moveTo(0,linearityCanvasSize-std*linearityCanvasSize/100);
	ctx.lineTo(linearityCanvasSize-std*linearityCanvasSize/100,0);
	ctx.moveTo(std*linearityCanvasSize/100,linearityCanvasSize);
	ctx.lineTo(linearityCanvasSize,std*linearityCanvasSize/100);
	ctx.stroke();
	ctx.strokeStyle="rgba(185,177,168,0.4)";
	ctx.beginPath();
	ctx.font="15px Arial";
	for(i=1;i<10;i++){
		ctx.moveTo(i*linearityCanvasSize/10,0);
		ctx.lineTo(i*linearityCanvasSize/10,linearityCanvasSize);
		ctx.moveTo(0,i*linearityCanvasSize/10);
		ctx.lineTo(linearityCanvasSize,i*linearityCanvasSize/10);
		ctx.fillText(i*5-25+"°",i*linearityCanvasSize/10-10,linearityCanvasSize-10);
		ctx.fillText(100-i*10+"%",5,i*linearityCanvasSize/10);
	}
	
	ctx.fillText("傾斜角度",linearityCanvasSize/2-30,linearityCanvasSize-40)
	ctx.fillText("輸出信號",5,20)
	ctx.stroke();
	
}
var xReturn1,xReturn2,yReturn1,yReturn2;
function checkReturnAccuracy(){
	//console.log("xReturn1="+xReturn1+"  xReturn2="+xReturn2);
	//console.log("xreturn1="+xreturn1);
	console.log("X軸復歸精度："+(Math.abs(xReturn1-xReturn2)*100/2).toFixed(2)+"%");
	console.log("Y軸復歸精度："+(Math.abs(yReturn1-yReturn2)*100/2).toFixed(2)+"%");
}

function drawLinearityLine(adding,linearityArray, returnAxis, ctx1,ctx2,axes,result1,result2){
	setTimeout(returnAxis,2000);
	//畫去向
	console.log("開始畫去向");
	var end;
	if(adding){
		end=linearityArray.indexOf(Math.max.apply(Math, linearityArray))-1;
	}else{
		end=linearityArray.indexOf(Math.min.apply(Math, linearityArray))-1;
	}
	var shift=linearityArray[0];
	var tilt=1.0/(linearityArray[end]-shift);
	var interval=end/(linearityCanvasSize/2);
	ctx1.beginPath();
	ctx1.moveTo(linearityCanvasSize/2,linearityCanvasSize/2);

	for (i=0;i<linearityCanvasSize/2;i++){
		ctx1.beginPath();
		if(adding){
			ctx1.moveTo(linearityCanvasSize/2+i,linearityCanvasSize/2-((linearityArray[Math.round(i*interval)]-shift)*tilt*linearityCanvasSize/2));
		}else{
			ctx1.moveTo(linearityCanvasSize/2-i-1,linearityCanvasSize/2+((linearityArray[Math.round(i*interval)]-shift)*tilt*linearityCanvasSize/2));
		}
		outputErr=(linearityArray[Math.round(i*interval)]-shift)*tilt*linearityCanvasSize/2-i;
		if(axes=="x"){
			if(Math.abs(outputErr)> maxErrX1) maxErrX1=Math.abs(outputErr);
		}else{
			if(Math.abs(outputErr)> maxErrY1) maxErrY1=Math.abs(outputErr);
		}
		if(outputErr>(linearityStd*linearityCanvasSize/100) || outputErr<(1-linearityStd*linearityCanvasSize/100)){
			ctx1.strokeStyle="red";				
		}else {
			ctx1.strokeStyle="green";
		}	
		if(adding){
			ctx1.lineTo(linearityCanvasSize/2+i+1,linearityCanvasSize/2-((linearityArray[Math.round((i+1)*interval)]-shift)*tilt*linearityCanvasSize/2));
		}else{
			ctx1.lineTo(linearityCanvasSize/2-i,linearityCanvasSize/2+((linearityArray[Math.round((i+1)*interval)]-shift)*tilt*linearityCanvasSize/2));
			
		}
		ctx1.stroke();
	}
	if(axes=="x") document.getElementById(result1).innerHTML="線性誤差："+(maxErrX1/(linearityCanvasSize/100)).toFixed(2)+"%";
	else document.getElementById(result1).innerHTML="線性誤差："+(maxErrY1/(linearityCanvasSize/100)).toFixed(2)+"%";
	//畫返回
	console.log("開始畫返向");
	linearityArray.reverse();
	if(adding){
		end=linearityArray.indexOf(Math.max.apply(Math, linearityArray))-1;
	}else{
		end=linearityArray.indexOf(Math.min.apply(Math, linearityArray))-1;
	}
	//console.log("end="+end);
	shift=linearityArray[0];
	tilt=1.0/(linearityArray[end]-shift);
	interval=end/(linearityCanvasSize/2);
	ctx2.moveTo(linearityCanvasSize/2,linearityCanvasSize/2);
	ctx2.beginPath();
	ctx2.strokeStyle = "green";
	for (i=0;i<=linearityCanvasSize/2;i++){
		ctx2.beginPath();
		if(adding){
			ctx2.moveTo(linearityCanvasSize/2+i-1,linearityCanvasSize/2-((linearityArray[Math.round((i-1)*interval)]-shift)*tilt*linearityCanvasSize/2));
		}else{
			ctx2.moveTo(linearityCanvasSize/2-i-1,linearityCanvasSize/2+((linearityArray[Math.round((i-1)*interval)]-shift)*tilt*linearityCanvasSize/2));
		}
//x1linearityCtx.moveTo(300-i-1,300+((xLinearityArray[Math.round((i-1)*interval)]-shift)*tilt*300));

		outputErr=(linearityArray[Math.round(i*interval)]-shift)*tilt*linearityCanvasSize/2-i;
		if(axes=="x"){
			if(Math.abs(outputErr)> maxErrX2) maxErrX2=Math.abs(outputErr);
		}else{
			if(Math.abs(outputErr)> maxErrY2) maxErrY2=Math.abs(outputErr);
		}
		if(outputErr>(linearityStd*linearityCanvasSize/100) || outputErr<(1-linearityStd*linearityCanvasSize/100)){
			ctx2.strokeStyle="red";
		}else {
			ctx2.strokeStyle="green";
		}
		if(adding){
			ctx2.lineTo(linearityCanvasSize/2+i,linearityCanvasSize/2-((linearityArray[Math.round(i*interval)]-shift)*tilt*linearityCanvasSize/2));
		}else{
			ctx2.lineTo(linearityCanvasSize/2-i,linearityCanvasSize/2+((linearityArray[Math.round(i*interval)]-shift)*tilt*linearityCanvasSize/2));			
		}
		ctx2.stroke();
	}
	if(axes=="x")document.getElementById(result2).innerHTML="線性誤差："+(maxErrX2/(linearityCanvasSize/100)).toFixed(2)+"%";
	else document.getElementById(result2).innerHTML="線性誤差："+(maxErrY2/(linearityCanvasSize/100)).toFixed(2)+"%";
}

function drawLinearity(){
	
	var xRight=Math.abs(Math.max.apply(null,xLinearityArray));
	var xLeft=Math.abs(Math.min.apply(null,xLinearityArray));
	var yUp=Math.abs(Math.min.apply(null,yLinearityArray));
	var yDown=Math.abs(Math.max.apply(null,yLinearityArray));
	if(xRight>2) xRight=0;
	if(xLeft>2) xLeft=0;
	if(yUp>2) yUp=0;
	if(yDown>2) yDown=0;
	if(xRight==Math.max(xRight,xLeft,yUp,yDown)){
		phase=3;
		drawLinearityLine(true,xLinearityArray, "xReturn1=gamepads[focusGamepad].axes[2]",x1linearityCtx,x2linearityCtx,"x","resultX1","resultX2");
		phaseDone++;
		console.log("完成x向右線性測試");
	}else if(xLeft==Math.max(xRight,xLeft,yUp,yDown)){
		phase=4;
		drawLinearityLine(false,xLinearityArray, "xReturn2=gamepads[focusGamepad].axes[2]",x1linearityCtx,x2linearityCtx,"x","resultX1","resultX2");
		phaseDone++;
		console.log("完成x向左線性測試");
	}else if(yUp==Math.max(xRight,xLeft,yUp,yDown)){
		phase=2;
		drawLinearityLine(false,yLinearityArray, "yReturn1=gamepads[focusGamepad].axes[3]",y1linearityCtx,y2linearityCtx,"y","resultY1","resultY2");
		phaseDone++;
		console.log("完成y向上線性測試");
	}else if(yDown==Math.max(xRight,xLeft,yUp,yDown)){
		phase=1;
		drawLinearityLine(true,yLinearityArray, "yReturn2=gamepads[focusGamepad].axes[3]",y1linearityCtx,y2linearityCtx,"y","resultY1","resultY2");
		phaseDone++;
		console.log("完成y向下線性測試");
	}

	var outputErr=0;

	if(phaseDone>=4){
		linearityTesting=false;
		linearityTestBtn.value="START";
		console.log("測完4個線性，phaseDone="+phaseDone);
		document.getElementById("xGo").style.backgroundColor="green";
		document.getElementById("xBack").style.backgroundColor="green";
		document.getElementById("yGo").style.backgroundColor="green";
		document.getElementById("yBack").style.backgroundColor="green";
		console.log("(maxErrX1/linearityCanvasSize/100).toFixed(2)="+(maxErrX1/linearityCanvasSize/100).toFixed(2)+"  linearityStd="+linearityStd);
		if((maxErrX1/(linearityCanvasSize/100)).toFixed(2)>linearityStd) document.getElementById("xGo").style.backgroundColor="red";
		if((maxErrX2/(linearityCanvasSize/100)).toFixed(2)>linearityStd) document.getElementById("xBack").style.backgroundColor="red";
		if((maxErrY1/(linearityCanvasSize/100)).toFixed(2)>linearityStd) document.getElementById("yGo").style.backgroundColor="red";
		if((maxErrY2/(linearityCanvasSize/100)).toFixed(2)>linearityStd) document.getElementById("yBack").style.backgroundColor="red";

		setTimeout("checkReturnAccuracy()",2000);
	}
	xLinearityArray=[];
	yLinearityArray=[];
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
			
			//=================作線性測試===============
			
			if(linearityTesting){
				var x=gamepads[focusGamepad].axes[linearityX];	//設為0，1時是左搖桿，2，3時是右搖桿
				var y=gamepads[focusGamepad].axes[linearityY];
				if(x>xCenter+returnAccuracy || x<xCenter-returnAccuracy){
					xLinearityArray.push(x);
					
				}
				if(y>yCenter+returnAccuracy || y<yCenter-returnAccuracy){
					yLinearityArray.push(y);
				}
				if(xLinearityArray.length>50 || yLinearityArray.length>50){ //採樣數量要求
					//console.log("xarrayL="+xLinearityArray.length+"  yL="+yLinearityArray.length);
					if(x<xCenter+returnAccuracy && x>xCenter-returnAccuracy && y<yCenter+returnAccuracy && y>yCenter-returnAccuracy){
						console.log(xLinearityArray);
						console.log(yLinearityArray);
						drawLinearity();
					}
				}
			}
			
			//=================作完線性測試===============
			
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
