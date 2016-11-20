
module fairygui {

    export class GImage extends GObject implements IColorGear {
        private _content: egret.Bitmap;
        private _color: number;
        private _flip: FlipType;
        
        public constructor() {
            super();
            this._color = 0xFFFFFF;
        }
        
        public get color(): number {
            return this._color;
        }
        
        public set color(value: number) {
            if(this._color != value) {
                this._color = value;
                this.updateGear(4);
                this.applyColor();
            }
        }
        
        private applyColor():void {
            /*然而下面的代码egret还不支持
            var ct:egret.ColorTransform = this._content.transform.colorTransform;
            ct.redMultiplier = ((this._color>>16)&0xFF)/255;
            ct.greenMultiplier =  ((this._color>>8)&0xFF)/255;
            ct.blueMultiplier = (this._color&0xFF)/255;
            this._content.transform.colorTransform = ct;
            */
        }
        
        public get flip():FlipType {
            return this._flip;
        }
        
        public set flip(value:FlipType) {
            if(this._flip!=value) {
                this._flip = value;
                this._content.scaleX = this._content.scaleY = 1;  
                if(this._flip == FlipType.Horizontal || this._flip == FlipType.Both)
                    this._content.scaleX = -1;
                if(this._flip == FlipType.Vertical || this._flip == FlipType.Both)
                    this._content.scaleY = -1;
                this.handleXYChanged();
            }
        }

        public get texture():egret.Texture {
            return this._content.texture;
        }

        public set texture(value:egret.Texture) {
            if (value != null)
            {
                this._sourceWidth = value.textureWidth;
                this._sourceHeight = value.textureHeight;
            }
            else
            {
                this._sourceWidth = 0;
                this._sourceHeight = 0;
            }
            this._initWidth =  this._sourceWidth;
            this._initHeight = this._sourceHeight;
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

        public dispose(): void {
            super.dispose();
        }

        public constructFromResource(): void {
            this._sourceWidth = this.packageItem.width;
            this._sourceHeight = this.packageItem.height;
            this._initWidth = this._sourceWidth;
            this._initHeight = this._sourceHeight;
            this._content.scale9Grid = this.packageItem.scale9Grid;
            this._content.smoothing = this.packageItem.smoothing;
            if (this.packageItem.scaleByTile)
                this._content.fillMode = egret.BitmapFillMode.REPEAT;

            this.setSize(this._sourceWidth, this._sourceHeight);

            this.packageItem.load();
            this._content.texture = this.packageItem.texture;
        }
        
        protected handleXYChanged(): void {
            super.handleXYChanged();
            if(this._content.scaleX==-1)
                this._content.x += this.width;
            if(this._content.scaleY==-1)
                this._content.y += this.height;
        }

        protected handleSizeChanged(): void {
            this._content.width = this.width;
            this._content.height = this.height;
        }
        
        public setup_beforeAdd(xml: any): void {
            super.setup_beforeAdd(xml);

            var str: string;
            str = xml.attributes.color;
            if(str)
                this.color = ToolSet.convertFromHtmlColor(str);
                
            str = xml.attributes.flip;
            if(str)
                this.flip = parseFlipType(str);	
        }
    }
}