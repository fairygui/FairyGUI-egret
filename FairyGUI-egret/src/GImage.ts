
module fairygui {

    export class GImage extends GObject implements IColorGear {
        private _content: egret.Bitmap;
        private _color: number;
        
        private _gearColor: GearColor;

        public constructor() {
            super();
            this._color = 0xFFFFFF;
            this._gearColor = new GearColor(this);
        }
        
        public get color(): number {
            return this._color;
        }
        
        public set color(value: number) {
            if(this._color != value) {
                this._color = value;
                if(this._gearColor.controller != null)
                    this._gearColor.updateState();

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
        
        public get gearColor(): GearColor {
            return this._gearColor;
        }

        public handleControllerChanged(c: Controller): void {
            super.handleControllerChanged(c);

            if(this._gearColor.controller == c)
                this._gearColor.apply();
        }
        
        protected createDisplayObject(): void {
            this._content = new UIImage(this);
            this.setDisplayObject(this._content);
        }

        public dispose(): void {
            super.dispose();
        }

        public constructFromResource(pkgItem: PackageItem): void {
            this._packageItem = pkgItem;

            this._sourceWidth = this._packageItem.width;
            this._sourceHeight = this._packageItem.height;
            this._initWidth = this._sourceWidth;
            this._initHeight = this._sourceHeight;
            this._content.scale9Grid = pkgItem.scale9Grid;
            this._content.smoothing = pkgItem.smoothing;
            if (pkgItem.scaleByTile)
                this._content.fillMode = egret.BitmapFillMode.REPEAT;

            this.setSize(this._sourceWidth, this._sourceHeight);

            pkgItem.load();
            this._content.texture = pkgItem.texture;
        }

        protected handleSizeChanged(): void {
            this._content.width = this.width * this.scaleX;
            this._content.height = this.height * this.scaleY;
        }
        
        public setup_beforeAdd(xml: any): void {
            super.setup_beforeAdd(xml);

            var str: string;
            str = xml.attributes.color;
            if(str)
                this.color = ToolSet.convertFromHtmlColor(str);
        }
        
        public setup_afterAdd(xml: any): void {
            super.setup_afterAdd(xml);

            var col: any = xml.children;
            if(col) {
                var length1: number = col.length;
                for(var i1: number = 0;i1 < length1;i1++) {
                    var cxml: any = col[i1];
                    if(cxml.name == "gearColor") {
                        this._gearColor.setup(cxml);
                        break;
                    }
                }
            }
        }
    }
}