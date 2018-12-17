
module fairygui {

    export class GImage extends GObject {
        private _content: egret.Bitmap;
        private _color: number;
        private _flip: FlipType;
        private _matrix: egret.ColorMatrixFilter;
        private _fillMethod: FillMethod = FillMethod.None;
        private _fillOrigin: FillOrigin|FillOrigin90 = FillOrigin.Left;
        private _fillAmount: number = 100;
        private _fillClockwise: boolean = false;
        protected fillStart:number =0;
        public constructor() {
            super();
            this._color = 0xFFFFFF;
            this._flip = FlipType.None;
        }

        private getColorMatrix(): egret.ColorMatrixFilter {
            if (this._matrix)
                return this._matrix;
            var filters: egret.Filter[] = this.filters;
            if (filters) {
                for (var i: number = 0; i < filters.length; i++) {
                    if (egret.is(filters[i], "egret.ColorMatrixFilter")) {
                        this._matrix = <egret.ColorMatrixFilter>filters[i];
                        return this._matrix;
                    }
                }
            }
            var cmf: egret.ColorMatrixFilter = new egret.ColorMatrixFilter();
            this._matrix = cmf;
            filters = filters || [];
            filters.push(cmf);
            this.filters = filters;
            return cmf;
        }

        public get color(): number {
            return this._color;
        }

        public set color(value: number) {
            if (this._color != value) {
                this._color = value;
                this.updateGear(4);
                this.applyColor();
            }
        }

        private applyColor(): void {
            var cfm: egret.ColorMatrixFilter = this.getColorMatrix();
            var matrix: number[] = cfm.matrix;
            matrix[0] = ((this._color >> 16) & 0xFF) / 255;
            matrix[6] = ((this._color >> 8) & 0xFF) / 255;
            matrix[12] = (this._color & 0xFF) / 255;
            cfm.matrix = matrix;
        }

        public get flip(): FlipType {
            return this._flip;
        }

        public set flip(value: FlipType) {
            if (this._flip != value) {
                this._flip = value;
                this._content.scaleX = this._content.scaleY = 1;
                if (this._flip == FlipType.Horizontal || this._flip == FlipType.Both)
                    this._content.scaleX = -1;
                if (this._flip == FlipType.Vertical || this._flip == FlipType.Both)
                    this._content.scaleY = -1;
                this.handleXYChanged();
            }
        }

        public get fillMethod(): FillMethod {
            return this._fillMethod;
        }

        public set fillMethod(value: FillMethod) {
            if(this._fillMethod!= value){
                this._fillMethod = value;
                if (this._fillMethod != 0){
                    this.setupFill();
                }else{
                    let mask = this._content.mask;
                    this._content.mask = null;
                    if(mask instanceof egret.Shape){
                        if(mask.parent){
                            mask.parent.removeChild(mask);
                        }
                    }
                }
            }
        }

        public get fillOrigin(): FillOrigin|FillOrigin90  {
            return this._fillOrigin;
        }

        public set fillOrigin(value: FillOrigin|FillOrigin90 ) {
            if(this._fillOrigin!= value){
                this._fillOrigin = value;
                if (this._fillMethod != 0){
                    this.setupFill();
                }  
            }
            
        }
        public get fillClockwise(): boolean {
            return this._fillClockwise;
        }

        public set fillClockwise(value: boolean) {
            if (this._fillClockwise != value) {
                this._fillClockwise = value;
                if (this._fillMethod != 0){
                    this.setupFill();
                }  
            }
        }
         public get fillAmount(): number {
            return this._fillAmount;
        }

        public set fillAmount(value: number) {
            if (this._fillAmount != value) {
                this._fillAmount = ToolSet.clamp(value,0,100);
                if (this._fillMethod != 0) {
                   this.setupFill();
                }
            }
        }
        public get texture(): egret.Texture {
            return this._content.texture;
        }

        public set texture(value: egret.Texture) {
            if (value != null) {
                this.sourceWidth = value.textureWidth;
                this.sourceHeight = value.textureHeight;
            }
            else {
                this.sourceWidth = 0;
                this.sourceHeight = 0;
            }
            this.initWidth = this.sourceWidth;
            this.initHeight = this.sourceHeight;
            this._content.scale9Grid = null;
            this._content.fillMode = egret.BitmapFillMode.SCALE;
            this._content.texture = value;
        }

        protected createDisplayObject(): void {
            this._content = new egret.Bitmap();
            this._content["$owner"] = this;
            this._content.touchEnabled = false;
            this.setDisplayObject(this._content);
        }
        
        protected setupFill():void{
            let mask = this._content.mask;
            let width = this._content.width;
            let height = this._content.height;
            if (this._fillMethod == FillMethod.Horizontal || this._fillMethod == FillMethod.Vertical) {
                if(!mask || mask instanceof egret.DisplayObject){
                    mask = new egret.Rectangle(0,0,width,height);
                }
                if(this._fillMethod == FillMethod.Horizontal){
                    mask.y = 0;
                    if(this._fillOrigin == FillOrigin.Top ){
                        mask.x = width*(this._fillAmount/100-1);
                    }else{
                        mask.x = width*(1-this._fillAmount/100);
                    }
                }else{
                    mask.x = 0;
                    if(this._fillOrigin == FillOrigin.Top){
                        mask.y = height*(this._fillAmount/100-1);
                    }else{
                        mask.y = height*(1-this._fillAmount/100);
                    }
                } 
            } else if(this._fillMethod != FillMethod.None && this._content.parent) {
                if(!mask || mask instanceof egret.Rectangle){
                    mask = new egret.Shape();
                    this._content.parent.addChild(mask);
                    mask.x = this.x;
                    mask.y = this.y;
                }
                width  = this.scaleX*width;
                height = this.scaleY*height;
                GraphicsHelper.fillImage(this._fillMethod,this._fillAmount,this._fillOrigin,this._fillClockwise,(<egret.Shape >mask).graphics,width,height);
            }
            this._content.mask = mask;
        }
        public removeFromParent(): void {
            if(this._fillMethod!=FillMethod.None){
                let mask = this._content.mask;
                if(mask instanceof egret.Shape){
                    if(mask.parent){
                        mask.parent.removeChild(mask);
                    }
                }
            }
            super.removeFromParent();

        }
        public dispose(): void {
            super.dispose();
        }

        public constructFromResource(): void {
            this.sourceWidth = this.packageItem.width;
            this.sourceHeight = this.packageItem.height;
            this.initWidth = this.sourceWidth;
            this.initHeight = this.sourceHeight;
            this._content.scale9Grid = this.packageItem.scale9Grid;
            this._content.smoothing = this.packageItem.smoothing;
            if (this.packageItem.scaleByTile)
                this._content.fillMode = egret.BitmapFillMode.REPEAT;

            this.setSize(this.sourceWidth, this.sourceHeight);

            this.packageItem.load();
            this._content.texture = this.packageItem.texture;
        }

        protected handleXYChanged(): void {
            super.handleXYChanged();
            if(this._fillMethod!=FillMethod.None){
                let mask = this._content.mask;
                if(mask instanceof egret.Shape){
                    mask.x = this._content.x;
                    mask.y = this._content.y;
                }
            }
            if (this._flip != FlipType.None) {
                if (this._content.scaleX == -1)
                    this._content.x += this.width;
                if (this._content.scaleY == -1)
                    this._content.y += this.height;
            }
            
        }

        protected handleSizeChanged(): void {
            this._content.width = this.width;
            this._content.height = this.height;
        }

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_beforeAdd(buffer, beginPos);

            buffer.seek(beginPos, 5);

            if (buffer.readBool())
                this.color = buffer.readColor();
            this.flip = buffer.readByte();
            this._fillMethod = buffer.readByte();
			if (this._fillMethod != 0)
			{
				this._fillOrigin = buffer.readByte();
				this._fillClockwise = buffer.readBool();
				this.fillAmount = buffer.readFloat();
			}
        }
    }
}
