var imgHighlightBall=new DD.Image("/images/ball/highlight.png");
var imgBall=new  DD.Image("/images/ball/regular.png");
var imgSonicRunning=new  DD.Image("/images/sonic/running.png");
var imgSonic=new  DD.Image("/images/sonic/regular.png");


var ballLayer=new DD.Layer(500,500);
ballLayer.initState=function(){
	this.state.highlightBall=false;
};
ballLayer.render=function(context){
	if(this.state.highlightBall){
		context.drawImage(imgHighlightBall,200,200);
	}
	else{
		context.drawImage(imgBall,200,200);
	}
};

var sonicLayer=new DD.Layer(150,150);
sonicLayer.static=true;
ballLayer.initState=function(){
	this.state.running=false;
};
sonicLayer.render=function(context){
	if(this.state.running){
		context.drawImage(imgSonicRunning,60,60);
	}
	else{
		context.drawImage(imgSonic,60,60);
	}
};

setInterval(function(){
	sonicLayer.state.running=!sonicLayer.state.running;
},1000);

var ddWindow=new DD.Window(1024,768,document.getElementById("main"));
ddWindow.addImage(imgHighlightBall);
ddWindow.addImage(imgBall);
ddWindow.addImage(imgSonicRunning);
ddWindow.addImage(imgSonic);

ddWindow.addLayer(ballLayer);
ddWindow.addLayer(sonicLayer);
ddWindow.setPosition(10,10);

ddWindow.init(function(){
	setInterval(function(){
		ddWindow.render();
	},1000/60);
});

