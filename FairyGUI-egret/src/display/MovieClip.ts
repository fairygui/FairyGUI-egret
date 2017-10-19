
module fairygui {

    export class MovieClip extends egret.DisplayObject {
        public interval: number = 0;
        public swing: boolean;
        public repeatDelay: number = 0;
        private playState: PlayState;

        private _texture: egret.Texture;
        private _needRebuild: boolean;
        private _frameRect: egret.Rectangle;

        private _playing: boolean;
        private _frameCount: number = 0;
        private _frames: Array<Frame>;
        private _currentFrame: number = 0;
        private _start: number = 0;
        private _end: number = 0;
        private _times: number = 0;
        private _endAt: number = 0;
        private _status: number = 0; //0-none, 1-next loop, 2-ending, 3-ended
        private _callback: Function;
        private _callbackObj: any;
        private _smoothing: boolean = true;

        public constructor() {
            super();
            this.$renderNode = new egret.sys.BitmapNode();

            this.playState = new PlayState();
            this._playing = true;
            this.touchEnabled = false;

            this.setPlaySettings();
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

            if (this._end == -1 || this._end > this._frameCount - 1)
                this._end = this._frameCount - 1;
            if (this._endAt == -1 || this._endAt > this._frameCount - 1)
                this._endAt = this._frameCount - 1;

            if (this._currentFrame < 0 || this._currentFrame > this._frameCount - 1)
                this._currentFrame = this._frameCount - 1;

            if (this._frameCount > 0)
                this.setFrame(this._frames[this._currentFrame]);
            else
                this.setFrame(null);
            this.playState.rewind();
        }

        public get frameCount(): number {
            return this._frameCount;
        }

        public get currentFrame(): number {
            return this._currentFrame;
        }

        public set currentFrame(value: number) {
            if (this._currentFrame != value) {
                this._currentFrame = value;
                this.playState.currentFrame = value;
                this.setFrame(this._currentFrame < this._frameCount ? this._frames[this._currentFrame] : null);
            }
        }

        public get playing(): boolean {
            return this._playing;
        }

        public set playing(value: boolean) {
            this._playing = value;

            if (value && this.stage != null) {
                GTimers.inst.add(0, 0, this.update, this);
            } else {
                GTimers.inst.remove(this.update, this);
            }
        }

        public get smoothing(): boolean {
            return this._smoothing;
        }

        public set smoothing(value: boolean) {
            this._smoothing = value;
        }

        //从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
        public setPlaySettings(start: number = 0, end: number = -1,
            times: number = 0, endAt: number = -1,
            endCallback: Function = null, callbackObj: any = null): void {
            this._start = start;
            this._end = end;
            if (this._end == -1 || this._end > this._frameCount - 1)
                this._end = this._frameCount - 1;
            this._times = times;
            this._endAt = endAt;
            if (this._endAt == -1)
                this._endAt = this._end;
            this._status = 0;
            this._callback = endCallback;
            this._callbackObj = callbackObj;

            this.currentFrame = start;
        }

        private update(): void {
            if (this._playing && this._frameCount != 0 && this._status != 3) {
                this.playState.update(this);
                if (this._currentFrame != this.playState.currentFrame) {
                    if (this._status == 1) {
                        this._currentFrame = this._start;
                        this.playState.currentFrame = this._currentFrame;
                        this._status = 0;
                    }
                    else if (this._status == 2) {
                        this._currentFrame = this._endAt;
                        this.playState.currentFrame = this._currentFrame;
                        this._status = 3;

                        //play end
                        if (this._callback != null) {
                            GTimers.inst.callLater(this.__playEnd, this);
                        }
                    }
                    else {
                        this._currentFrame = this.playState.currentFrame;
                        if (this._currentFrame == this._end) {
                            if (this._times > 0) {
                                this._times--;
                                if (this._times == 0)
                                    this._status = 2;
                                else
                                    this._status = 1;
                            }
                            else if (this._start != 0)
                                this._status = 1;
                        }
                    }

                    //draw
                    this.setFrame(this._frames[this._currentFrame]);
                }
            }
        }

        private __playEnd(): void {
            if (this._callback != null) {
                var f: Function = this._callback;
                var fObj: any = this._callbackObj;
                this._callback = null;
                this._callbackObj = null;
                if (f.length == 1)
                    f.call(fObj, this);
                else
                    f.call(fObj);
            }
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

        $render(): void {
            var texture = this._texture;
            if (texture) {
                var offsetX: number = Math.round(texture._offsetX) + this._frameRect.x;
                var offsetY: number = Math.round(texture._offsetY) + this._frameRect.y;
                var bitmapWidth: number = texture._bitmapWidth;
                var bitmapHeight: number = texture._bitmapHeight;
                var textureWidth: number = texture.$getTextureWidth();
                var textureHeight: number = texture.$getTextureHeight();
                var destW: number = Math.round(texture.$getScaleBitmapWidth());
                var destH: number = Math.round(texture.$getScaleBitmapHeight());
                var sourceWidth: number = texture._sourceWidth;
                var sourceHeight: number = texture._sourceHeight;

                egret.sys.BitmapNode.$updateTextureData
                    //before 3.1.7 egret.Bitmap.$drawImage
                    (<egret.sys.BitmapNode>this.$renderNode, texture._bitmapData,
                    texture._bitmapX, texture._bitmapY,
                    bitmapWidth, bitmapHeight,
                    offsetX, offsetY,
                    textureWidth, textureHeight,
                    destW, destH,
                    sourceWidth, sourceHeight,
                    null, egret.BitmapFillMode.SCALE, this._smoothing);
            }
        }

        $measureContentBounds(bounds: egret.Rectangle): void {
            if (this._texture) {
                var x: number = Math.round(this._texture._offsetX) + this._frameRect.x;
                var y: number = Math.round(this._texture._offsetY) + this._frameRect.y;
                var w: number = this._texture.$getTextureWidth();
                var h: number = this._texture.$getTextureHeight();

                bounds.setTo(x, y, w, h);
            }
            else {
                bounds.setEmpty();
            }
        }

        $onAddToStage(stage: egret.Stage, nestLevel: number): void {
            super.$onAddToStage(stage, nestLevel);

            if (this._playing)
                GTimers.inst.add(0, 0, this.update, this);
        }

        $onRemoveFromStage(): void {
            super.$onRemoveFromStage();

            if (this._playing)
                GTimers.inst.remove(this.update, this);
        }
    }
}