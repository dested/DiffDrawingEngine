var DD={};

DD.Layer = function(width,height) {
	this.width=width;
	this.height=height;
	this.currentContext=new DD.Context();
	this.state={};

	this.init();
};

DD.Layer.prototype.init=function(){
	this.actualCanvas=document.createElement('canvas');
	this.actualCanvas.width=this.width;
	this.actualCanvas.height=this.height;
	this.actualContext=this.actualCanvas.getContext('2d');

	this.visibleCanvas=document.createElement('canvas');
	this.visibleContext=this.visibleCanvas.getContext('2d');
};
DD.Layer.prototype.render=function(){};
DD.Layer.prototype.initState=function(){};
DD.Layer.prototype.shouldRender=function(){return true;};
DD.Layer.prototype.draw=function(ddWindow){
	var windowBounds=ddWindow.bounds;

	this.lastWindowBounds=windowBounds;
	this.visibleContext.clearRect(0,0,windowBounds.width,windowBounds.height);
	this.visibleContext.drawImage(this.actualCanvas, 
		windowBounds.x,windowBounds.y,windowBounds.width,windowBounds.height,
		0,0,windowBounds.width,windowBounds.height);

};
DD.Image=function(imgUrl){
	var img=new Image();
	img.src=imgUrl;
	this.url=imgUrl;
	this.ready=false;
	this.img=img;

	img.onload=(function(){
		this.width=img.width;
		this.height=img.height;

		this.ready=true;
	}).bind(this);
};


DD.ContextPiece={};

DD.ContextPiece.Image=function(img,x,y){
	this.type='image';
	this.image=img;
	this.x=x;
	this.y=y;
	this.bounds=new DD.Bounds(x,y,img.width,img.height);
};
DD.ContextPiece.Image.prototype.hash=function(){
	return 'img'+this.x+'.'+this.y+'.'+this.image.url;
}

DD.Context = function() {
	this.pieces=[];
};

DD.Context.prototype.drawImage=function(img,x,y){
	this.pieces.push(new DD.ContextPiece.Image(img,x,y));
};

DD.Context.prototype.hash=function(){
	var hash="";
	for (var i = 0; i < this.pieces.length; i++) {
		hash+=this.pieces[i].hash()+'`';
	};
	return hash;
}

DD.Window = function(width,height,element) {
	this.layers=[];
	this.images=[];
	this.width=width;
	this.height=height;
	this.element=element;
	this.bounds=new DD.Bounds(0,0,width,height);
};

DD.Window.prototype.addImage=function(image){
	this.images.push(image);
};

DD.Window.prototype.addLayer=function(layer){

	layer.initState();
	layer.visibleCanvas.width=this.width;
	layer.visibleCanvas.height=this.height;
	this.element.appendChild(layer.visibleCanvas);
	this.layers.push(layer);
};

DD.Window.prototype.init=function(done){
	setTimeout(done,1000);
};

DD.Window.prototype.setPosition=function(x,y){
	this.bounds=this.bounds.setXY(x,y);
};

DD.Bounds=function(x,y,width,height){
	this.x=x;
	this.y=y;
	this.width=width;
	this.height=height;
}

DD.Bounds.prototype.intersects=function(b){
	var a=this;
	var x = Math.max(a.x, b.x);
	var num1 = Math.min(a.x + a.width, b.x + b.width);
	var y = Math.max(a.y, b.y);
	var num2 = Math.min(a.y + a.height, b.y + b.height);
	if (num1 >= x && num2 >= y)
		return true
	else
		return false;
}
DD.Bounds.prototype.setXY=function(x,y){
	return new DD.Bounds(x,y,this.width,this.height);
}


DD.Window.prototype.render=function(){

	for (var i = 0; i < this.layers.length; i++) {
		var layer=this.layers[i];
		if(!layer.shouldRender())continue;

		var freshContext=new DD.Context();
		layer.render(freshContext);
		layer._changed=false;
		if(layer.currentContext.hash()===freshContext.hash()){
			continue;
		}
		else {
			layer._changed=true;
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
	var windowBounds=this.bounds;
	for (var i = 0; i < this.layers.length; i++) {
		var layer=this.layers[i];
		
		if(layer._changed){
			layer.draw(this);

		} else{
			if(layer.static)continue;

			if(layer.lastWindowBounds===windowBounds){
				continue;
			}
			layer.draw(this);
		}

	}
}


function removePieces(canvasContext2d, freshContext, pieces){
	for (var a = 0; a < pieces.length; a++) {
		var removedPiece=pieces[a];
		var removedBounds=removedPiece.bounds;
		var forceRedraw=[];

		for (var i = 0; i < freshContext.pieces.length; i++) {
			var bounds=freshContext.pieces[i].bounds;
			if(removedBounds.intersects(bounds)){
				forceRedraw.push(freshContext.pieces[i]);
			}
		}

		canvasContext2d.clearRect(removedBounds.x,removedBounds.y,removedBounds.width,removedBounds.height);
		for (var i = 0; i < forceRedraw.length; i++) {
			drawPiece(canvasContext2d,forceRedraw[i]);
		}
	}
}

function addPieces(canvasContext2d, freshContext, pieces){
	for (var a = 0; a < pieces.length; a++) {
		var addedPiece=pieces[a];
		drawPiece(canvasContext2d,addedPiece);
	}
}

function drawPiece(canvasContext2d,piece){
	console.log('drawing '+piece.type)
	switch(piece.type){
		case 'image':
		{
			canvasContext2d.drawImage(piece.image.img,piece.x,piece.y);
		}
		break;
	}
}

function diffContext(leftContext,rightContext){
	var removePieces=[];
	var addPieces=[];
	for (var i = 0; i < leftContext.pieces.length; i++) {
		var lHash=leftContext.pieces[i].hash();
		var found=false;
		for (var a = 0; a < rightContext.pieces.length; a++) {
			var rHash=rightContext.pieces[a].hash();
			if(rHash===lHash){
				found=true;
				break;
			}
		}
		if(!found){
			removePieces.push(leftContext.pieces[i]);
		}
	}

	for (var i = 0; i < rightContext.pieces.length; i++) {
		var rHash=rightContext.pieces[i].hash();
		var found=false;
		for (var a = 0; a < leftContext.pieces.length; a++) {
			var lHash=leftContext.pieces[a].hash();
			if(lHash===rHash){
				found=true;
				break;
			}
		}
		if(!found){
			addPieces.push(rightContext.pieces[i]);
		}
	}
	return {removePieces:removePieces,addPieces:addPieces};
} 