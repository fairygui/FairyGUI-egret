module fairygui {
	export class GraphicsHelper {
		public static fillImage(method:FillMethod, amount:number, origin:FillOrigin|FillOrigin90, clockwise:boolean, graphics:egret.Graphics, width:number,height:number):void{
				graphics.clear();
				if(amount<100){
					graphics.lineStyle(0);
					graphics.beginFill(0);
					amount =  amount/100
					let startAngle = 0;
					let endAngle = 0;
					let radius = Math.ceil(Math.sqrt(width*width+height*height));
					let cx = width/2;
					let cy = height/2;
					switch(method){
						case FillMethod.Radial90:
							if(origin == FillOrigin90.TopRight ){
								cx = width;
								cy = 0;
								graphics.moveTo(cx,cy);
								if(clockwise){
									startAngle =  Math.PI/2;
									graphics.lineTo(cx-radius,cy);
								}else{
									startAngle =  Math.PI;
									graphics.lineTo(cx,cy+radius);
								}
								
							}else if(origin == FillOrigin90.TopLeft){
								cx = 0;
								cy = 0;
								graphics.moveTo(cx,cy);
								if(clockwise){
									startAngle = 0;
									graphics.lineTo(cx,cy+radius);
								}else{
									startAngle = Math.PI/2;
									graphics.lineTo(cx+radius,cy);
								}
							}else if(origin == FillOrigin90.BottomRight){ 
								cx = width;
								cy = height;
								graphics.moveTo(cx,cy);
								if(clockwise){
									startAngle =  Math.PI;
									graphics.lineTo(cx-radius,cy);
								}else{
									startAngle =  Math.PI*3/2;
									graphics.lineTo(cx,cy-radius);
								}
							}else{ 
								cx = 0;
								cy = height;
								graphics.moveTo(cx,cy);
								if(clockwise){
									startAngle =  Math.PI*3/2;
									graphics.lineTo(cx,cy-radius);
								}else{
									startAngle =  0;
									graphics.lineTo(cx+radius,cy);
								}
							}
							
							if(clockwise){
								endAngle=startAngle+amount*Math.PI/2;
							}else{
								endAngle=startAngle-amount*Math.PI/2;
							}
							graphics.drawArc(cx,cy,radius,startAngle,endAngle,!clockwise);
							graphics.lineTo(cx,cy);
							break;
						case FillMethod.Radial180:
							if(origin ==FillOrigin.Right ){
								cx=width;
								graphics.moveTo(cx,cy);
								graphics.lineTo(cx,cy-radius);
								if(clockwise){
									startAngle = Math.PI/2;
								}else{
									startAngle = Math.PI*3/2;
								}
							}else if(origin ==FillOrigin.Bottom ){
								startAngle=Math.PI;
								cy = height;
								graphics.moveTo(cx,cy);
								graphics.lineTo(cx-radius,cy)
								if(clockwise){
									startAngle = Math.PI;
								}else{
									startAngle = 0;
								}
							}else if(origin ==FillOrigin.Left ){
								cx=0;
								graphics.moveTo(cx,cy);
								graphics.lineTo(cx-radius,cy);
								if(clockwise){
									startAngle = Math.PI*3/2;
								}else{
									startAngle = Math.PI/2;
								}
							}else{
								cy = 0;
								graphics.moveTo(cx,cy);
								graphics.lineTo(cx+radius,cy);
								if(clockwise){
									startAngle = 0;
								}else{
									startAngle = Math.PI;
								}
							}
							if(clockwise){
								endAngle=startAngle+amount*Math.PI;
							}else{
								endAngle=startAngle-amount*Math.PI;
							}
							graphics.drawArc(cx,cy,radius,startAngle,endAngle,!clockwise);
							graphics.lineTo(cx,cy);
							break;
						case FillMethod.Radial360:
							startAngle = 0;
							if(amount>=1){
								graphics.drawCircle(cx,cy,radius);
							}else{
								graphics.moveTo(cx,cy);
								if(origin ==FillOrigin.Right ){
									startAngle = 0;
									graphics.lineTo(cx+radius,cy);
								}else if(origin ==FillOrigin.Bottom ){
									startAngle = Math.PI/2;
									graphics.lineTo(cx,cy+radius);
								}else if(origin ==FillOrigin.Left ){
									startAngle = Math.PI;
									graphics.lineTo(cx-radius,cy);
								}else {
									startAngle = Math.PI*3/2;
									graphics.lineTo(cx,cy-radius);
								}
								if(clockwise){
									endAngle = startAngle + amount*Math.PI*2;
								}else{
									endAngle = startAngle - amount*Math.PI*2;
								}
								graphics.drawArc(cx,cy,radius,startAngle,endAngle,!clockwise);
								graphics.lineTo(cx,cy);
							}
							break;
					}
					graphics.endFill();
			}
		}
	}
}