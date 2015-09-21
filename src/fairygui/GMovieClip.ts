
module fairygui {

    export class GMovieClip extends GObject implements IAnimationGear, IColorGear {
        private _gearAnimation: GearAnimation;
        private _gearColor:GearColor;
        
        private _movieClip: MovieClip;

        public constructor() {
            super();
            this._gearAnimation = new GearAnimation(this);
            this._gearColor = new GearColor(this);
        }
        
        public get color(): number {
            return 0
        }
        
        public set color(value: number) {
        }

        protected createDisplayObject(): void {
            this._movieClip = new UIMovieClip(this);
            this.setDisplayObject(this._movieClip);
        }

        public get playing(): boolean {
            return this._movieClip.playing;
        }

        public set playing(value: boolean) {
            if (this._movieClip.playing != value) {
                this._movieClip.playing = value;
                if (this._gearAnimation.controller)
                    this._gearAnimation.updateState();
            }
        }

        public get frame(): number {
            return this._movieClip.currentFrame;
        }

        public set frame(value: number) {
            if (this._movieClip.currentFrame != value) {
                this._movieClip.currentFrame = value;
                if (this._gearAnimation.controller)
                    this._gearAnimation.updateState();
            }
        }

        public get gearAnimation(): GearAnimation {
            return this._gearAnimation;
        }
        
        public get gearColor(): GearColor {
            return this._gearColor;
        }

        public handleControllerChanged(c: Controller): void {
            super.handleControllerChanged(c);
            if(this._gearAnimation.controller == c)
                this._gearAnimation.apply();
            if(this._gearColor.controller == c)
                this._gearColor.apply();
        }

        protected handleSizeChanged(): void {
            this.displayObject.scaleX = this.width / this._sourceWidth * this.scaleX * GRoot.contentScaleFactor;
            this.displayObject.scaleY = this.height / this._sourceHeight * this.scaleY * GRoot.contentScaleFactor;
        }

        public constructFromResource(pkgItem: PackageItem): void {
            this._packageItem = pkgItem;

            this._sourceWidth = this._packageItem.width;
            this._sourceHeight = this._packageItem.height;
            this._initWidth = this._sourceWidth;
            this._initHeight = this._sourceHeight;

            this.setSize(this._sourceWidth, this._sourceHeight);

            pkgItem.load();

            this._movieClip.interval = this._packageItem.interval;
            this._movieClip.frames = this._packageItem.frames;
            this._movieClip.boundsRect = new egret.Rectangle(0, 0, this.sourceWidth, this.sourceHeight);
        }

        public setup_beforeAdd(xml: any): void {
            super.setup_beforeAdd(xml);

            var str: string;
            str = xml.$frame;
            if (str)
                this._movieClip.currentFrame = parseInt(str);
            str = xml.$playing;
            this._movieClip.playing = str != "false";
            
            str = xml.$color;
            if(str)
                this.color = ToolSet.convertFromHtmlColor(str);
        }

        public setup_afterAdd(xml: any): void {
            super.setup_afterAdd(xml);

            var col: any = xml.children;
            if (col) {
                var length1: number = col.length;
                for (var i1: number = 0; i1 < length1; i1++) {
                    var cxml: any = col[i1];
                    if (cxml.name == "gearAni") {
                        this._gearAnimation.setup(cxml);
                        break;
                    }
                    else if (cxml.name == "gearColor") {
                        this._gearColor.setup(cxml);
                        break;
                    }
                }
            }
        }
    }
}