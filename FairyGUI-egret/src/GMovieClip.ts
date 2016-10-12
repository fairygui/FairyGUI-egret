
module fairygui {

    export class GMovieClip extends GObject implements IAnimationGear, IColorGear {
        private _movieClip: MovieClip;

        public constructor() {
            super();
            this._sizeImplType = 1;
        }
        
        public get color(): number {
            return 0
        }
        
        public set color(value: number) {
        }

        protected createDisplayObject(): void {
            this._movieClip = new MovieClip();
            this._movieClip["$owner"] = this;
            this._movieClip.touchEnabled = false;
            this.setDisplayObject(this._movieClip);
        }

        public get playing(): boolean {
            return this._movieClip.playing;
        }

        public set playing(value: boolean) {
            if (this._movieClip.playing != value) {
                this._movieClip.playing = value;
                this.updateGear(5);
            }
        }

        public get frame(): number {
            return this._movieClip.currentFrame;
        }

        public set frame(value: number) {
            if (this._movieClip.currentFrame != value) {
                this._movieClip.currentFrame = value;
                this.updateGear(5);
            }
        }
        
        //从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
        public setPlaySettings(start: number = 0,end: number = -1,
            times: number = 0,endAt: number = -1,
            endCallback: Function = null,callbackObj: any = null): void {
            this._movieClip.setPlaySettings(start, end, times, endAt, endCallback, callbackObj);
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
            this._movieClip.swing = this._packageItem.swing;
            this._movieClip.repeatDelay = this._packageItem.repeatDelay;
            this._movieClip.frames = this._packageItem.frames;
            this._movieClip.boundsRect = new egret.Rectangle(0, 0, this.sourceWidth, this.sourceHeight);
        }

        public setup_beforeAdd(xml: any): void {
            super.setup_beforeAdd(xml);

            var str: string;
            str = xml.attributes.frame;
            if (str)
                this._movieClip.currentFrame = parseInt(str);
            str = xml.attributes.playing;
            this._movieClip.playing = str != "false";
            
            str = xml.attributes.color;
            if(str)
                this.color = ToolSet.convertFromHtmlColor(str);
        }
    }
}