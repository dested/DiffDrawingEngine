var imgHighlightBall=new DD.Image("/images/ball/highlight.png");
var imgBall=new  DD.Image("/images/ball/regular.png");
var imgSonicRunning=new  DD.Image("/images/sonic/running.png");
var imgSonic=new  DD.Image("/images/sonic/regular.png");


var ballLayer=new DD.Layer(500,500);
ballLayer.initState=function(){
	this.state.balls=[];
	this.state.updateIndex=0;
	for (var i = 0; i < 11 ;i++) {
		this.state.balls.push({highlight:false,x:(i % 10)*25+50,y:((i/10)|0)*25+50});
	};
};

ballLayer.render=function(context){

	for (var i = 0; i < this.state.balls.length; i++) {
		var ball=this.state.balls[i]

		if(ball.highlight){
			context.drawImage(imgHighlightBall,ball.x-19,ball.y-20);
		}
		else{
			context.drawImage(imgBall,ball.x-14,ball.y-9);
		}
	};

};

var sonicLayer=new DD.Layer(150,150);
sonicLayer.static=true;
sonicLayer.initState=function(){
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
	var ball=ballLayer.state.balls[ballLayer.state.updateIndex++%ballLayer.state.balls.length];
	ball.highlight=!ball.highlight;
},300);

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

