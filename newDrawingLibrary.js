function createLayer(width,height) {

}

function createContext() {
	this.pieces=[];
}


function windowLayerRender(){
	for (var i = 0; i < this.layers.length; i++) {
		var layer=this.layer[i];
		if(!layer.shouldRender())continue;

		var freshContext=createContext();
		layer.render(freshContext);

		if(layer.currentContext.hash()===freshContext.hash()){
			continue;
		}
		else {
			var diff=diffContext(layer.currentContext,freshContext);

			if(diff.removePieces.length)
			{
				removePieces(layer.actualContext,freshContext,diff.removePieces)
			}
			if(diff.addPieces.length)
			{
				addPieces(layer.actualContext,freshContext,diff.addPieces)
			}

			layer.currentContext=freshContext;
		}
	}
	var windowBounds=this.bounds();
	for (var i = 0; i < this.layers.length; i++) {
		var layer=this.layer[i];
		if(layer.static)continue;
		if(layer.lastWindowBounds===windowBounds){
			continue;
		}
		layer.visibleContext.clearRect(0,0,layer.visibleContext.width,layer.visibleContext.height);
		layer.visibleContext.drawImage(layer.actualContext, 
			windowBounds.x,windowBounds.y,windowBounds.width,windowBounds.height,
			0,0,windowBounds.width,windowBounds.height);
	}
}

function removePieces(canvasContext2d, freshContext, pieces){
	for (var a = 0; a < pieces.length; a++) {
		var removedPiece=pieces[i];
		var removedBounds=removedPiece.bounds();
		var forceRedraw=[];

		for (var i = 0; i < freshContext.pieces.length; i++) {
			var bounds=freshContext.pieces[i].bounds();
			if(removedBounds.intersects(bounds)){
				forceRedraw.push(freshContext.pieces[i]);
			}
		}

		canvasContext2d.clearRect(removedBounds.x,removedBounds.y,removedBounds.width,removedBounds.height);
		for (var i = 0; i < forceRedraw.length; i++) {
			drawPiece(forceRedraw[i]);
		}
	}
}

function addPieces(canvasContext2d, freshContext, pieces){
	for (var a = 0; a < pieces.length; a++) {
		var addedPiece=pieces[i];
		drawPiece(addedPiece);
	}
}

function diffContext(leftContext,rightContext){
	var removePieces=[];
	var addPieces=[];
	for (var i = 0; i < leftContext.pieces.length; i++) {
		var lHash=leftContext.piece[i].hash();
		var found=false;
		for (var a = 0; a < rightContext.pieces.length; a++) {
			var rHash=rightContext.pieces[a].hash();
			if(rHash===lHash){
				found=true;
				break;
			}
		}
		if(!found){
			removePieces.push(leftContext.piece[i]);
		}
	}

	for (var i = 0; i < rightContext.pieces.length; i++) {
		var rHash=rightContext.piece[i].hash();
		var found=false;
		for (var a = 0; a < leftContext.pieces.length; a++) {
			var lHash=leftContext.pieces[a].hash();
			if(lHash===rHash){
				found=true;
				break;
			}
		}
		if(!found){
			addPieces.push(rightContext.piece[i]);
		}
	}
	return {removePieces:removePieces,addPieces:addPieces};
}




var imgHighlightBall=createImage("/ball/highlight.png");
var imgBall=createImage("/ball/regular.png");
var imgSonicRunning=createImage("/sonic/running.png");
var imgSonic=createImage("/sonic/regular.png");


var ballLayer=createLayer(40000,40000);
ballLayer.render=function(context){
	if(ballLayer.state.highlightBall){
		context.drawImage(imgHighlightBall,2000,2000);
	}
	else{
		context.drawImage(imgBall,2000,2000);
	}
};

var sonicLayer=createLayer(150,150);
sonicLayer.static=true;
sonicLayer.render=function(context){
	if(sonicLayer.state.running){
		context.drawImageCentered(imgSonicRunning,0,0);
	}
	else{
		context.drawImageCentered(imgSonic,0,0);
	}
};


var window=createWindow(1024,768);
window.addLayer(ballLayer);
window.addLayer(sonicLayer);
window.setPosition(100,100);


setInterval(function(){
	window.render();
},1000/60)