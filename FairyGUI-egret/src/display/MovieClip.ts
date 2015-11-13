
module fairygui {

    export class MovieClip extends egret.DisplayObject {
        public interval: number = 0;
        public swing: boolean;
        public repeatDelay: number = 0;

        private _texture: egret.Texture;
        private _needRebuild: boolean;
        private _frameRect: egret.Rectangle;

        private _playing: boolean;
        private _playState: PlayState;
        private _frameCount: number = 0;
        private _frames: Array<Frame>;
        private _currentFrame: number = 0;
        private _boundsRect: egret.Rectangle;
        private _start: number = 0;
        private _end: number = 0;
        private _times: number = 0;
        private _endAt: number = 0;
        private _status: number = 0; //0-none, 1-next loop, 2-ending, 3-ended
        private _callback: Function;
        private _callbackObj: any;

        public constructor() {
            super();
            this.$renderRegion = new egret.sys.Region();
            
            this._playState = new PlayState();
            this._playing = true;
            this.touchEnabled = false;
        }

        public get frames(): Array<Frame> {
            return this._frames;
        }

        public set frames(value: Array<Frame>) {
            this._frames = value;
            if (this._frames != null)
                this._frameCount = this._frames.length;
            else
                this._frameCount = 0;
            this._currentFrame = -1;
            this.setPlaySettings();
        }

        public get frameCount(): number {
            return this._frameCount;
        }

        public get boundsRect(): egret.Rectangle {
            return this._boundsRect;
        }

        public set boundsRect(value: egret.Rectangle) {
            this._boundsRect = value;
        }

        public get currentFrame(): number {
            return this._currentFrame;
        }

        public set currentFrame(value: number) {
            if (this._currentFrame != value) {
                this._currentFrame = value;
                this._playState.currentFrame = value;
                this.setFrame(this._currentFrame < this.frameCount ? this._frames[this._currentFrame] : null);
            }
        }

        public get playing(): boolean {
            return this._playing;
        }

        public set playing(value: boolean) {
            this._playing = value;

            if (this.playing && this.frameCount != 0 && this._status != 3)
                GTimers.inst.callBy24Fps(this.update, this);
            else
                GTimers.inst.remove(this.update, this);
        }

        //从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
        public setPlaySettings(start: number = 0, end: number = -1,
            times: number = 0, endAt: number = -1,
            endCallback: Function = null, callbackObj:any = null): void {
            this._start = start;
            this._end = end;
            if (this._end == -1)
                this._end = this.frameCount - 1;
            this._times = times;
            this._endAt = endAt;
            if (this._endAt == -1)
                this._endAt = this._end;
            this._status = 0;
            this._callback = endCallback;
            this._callbackObj = callbackObj;

            this.currentFrame = start;
            if (this.playing && this.frameCount != 0)
                GTimers.inst.callBy24Fps(this.update, this);
            else
                GTimers.inst.remove(this.update, this);
        }

        private update(): void {
            if (this.playing && this.frameCount != 0 && this._status != 3) {
                this._playState.update(this);
                if (this._currentFrame != this._playState.currentFrame) {
                    if (this._status == 1) {
                        this._currentFrame = this._start;
                        this._playState.currentFrame = this._currentFrame;
                        this._status = 0;
                    }
                    else if (this._status == 2) {
                        this._currentFrame = this._endAt;
                        this._playState.currentFrame = this._currentFrame;
                        this._status = 3;

                        //play end
                        GTimers.inst.remove(this.update, this);
                        if (this._callback != null) {
                            var f: Function = this._callback;
                            var fObj: any = this._callbackObj;
                            this._callback = null;
                            this._callbackObj = null;                            
                            if (f.length == 1)
                                f.call(fObj,this);
                            else
                                f.call(fObj);
                        }
                    }
                    else {
                        this._currentFrame = this._playState.currentFrame;
                        if (this._currentFrame == this._end) {
                            if (this._times > 0) {
                                this._times--;
                                if (this._times == 0)
                                    this._status = 2;
                                else
                                    this._status = 1;
                            }
                        }
                    }

                    //draw
                    this.setFrame(this._frames[this._currentFrame]);
                }
            }
            else
                this.setFrame(null);
        }

        private setFrame(frame: Frame): void {
            if (frame == null) {
                this._texture = null;
            }
            else {
                this._texture = frame.texture;
                this._frameRect = frame.rect;
            }
            this.$invalidateContentBounds();
        }

        $render(context: egret.sys.RenderContext): void {
            var texture = this._texture;
            if (texture) {
                var offsetX: number = Math.round(texture._offsetX) + this._frameRect.x;
                var offsetY: number = Math.round(texture._offsetY) + this._frameRect.y;
                var bitmapWidth: number = texture._bitmapWidth;
                var bitmapHeight: number = texture._bitmapHeight;
                var destW:number = Math.round(texture.$getScaleBitmapWidth());
                var destH:number = Math.round(texture.$getScaleBitmapHeight());
                
                context.drawImage(texture._bitmapData,  texture._bitmapX, texture._bitmapY,
                    bitmapWidth, bitmapHeight, offsetX, offsetY, destW, destH);
            }
        }
        
        $measureContentBounds(bounds:egret.Rectangle):void {
            if (this._texture) {
                var x:number = Math.round(this._texture._offsetX) + this._frameRect.x;
                var y:number = Math.round(this._texture._offsetY) + this._frameRect.y;
                var w:number = this._texture.$getTextureWidth();
                var h:number = this._texture.$getTextureHeight();
                
                bounds.setTo(x, y, w, h);
            }
            else {
                bounds.setEmpty();
            }
        }
    }
}