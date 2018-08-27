
module fairygui {

    export class MovieClip extends egret.DisplayObject {
        public interval: number = 0;
        public swing: boolean;
        public repeatDelay: number = 0;
        public timeScale: number = 1;

        private _texture: egret.Texture;
        private _needRebuild: boolean;
        private _frameRect: egret.Rectangle;

        private _playing: boolean = true;
        private _frameCount: number = 0;
        private _frames: Array<Frame>;
        private _frame: number = 0;
        private _start: number = 0;
        private _end: number = 0;
        private _times: number = 0;
        private _endAt: number = 0;
        private _status: number = 0; //0-none, 1-next loop, 2-ending, 3-ended
        private _callback: Function;
        private _callbackObj: any;
        private _smoothing: boolean = true;

        private _frameElapsed: number = 0; //当前帧延迟
        private _reversed: boolean = false;
        private _repeatedCount: number = 0;

        public constructor() {
            super();

            //comment out below line before 5.1.0
             if (!egret.nativeRender) {
                this.$renderNode = new egret.sys.NormalBitmapNode();
             }
            //comment out below line after 5.1.0
            //this.$renderNode = new egret.sys.BitmapNode();

            this.touchEnabled = false;

            this.setPlaySettings();
        }

        protected createNativeDisplayObject(): void {
            this.$nativeDisplayObject = new egret_native.NativeDisplayObject(egret_native.NativeObjectType.BITMAP_TEXT);
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

            if (this._frame < 0 || this._frame > this._frameCount - 1)
                this._frame = this._frameCount - 1;

            this.drawFrame();

            this._frameElapsed = 0;
            this._repeatedCount = 0;
            this._reversed = false;

            this.checkTimer();
        }

        public get frameCount(): number {
            return this._frameCount;
        }

        public get frame(): number {
            return this._frame;
        }

        public set frame(value: number) {
            if (this._frame != value) {
                if (this._frames != null && value >= this._frameCount)
                    value = this._frameCount - 1;

                this._frame = value;
                this._frameElapsed = 0;
                this.drawFrame();
            }
        }

        public get playing(): boolean {
            return this._playing;
        }

        public set playing(value: boolean) {
            if (this._playing != value) {
                this._playing = value;
                this.checkTimer();
            }
        }

        public get smoothing(): boolean {
            return this._smoothing;
        }

        public set smoothing(value: boolean) {
            this._smoothing = value;
        }

        public rewind(): void {
            this._frame = 0;
            this._frameElapsed = 0;
            this._reversed = false;
            this._repeatedCount = 0;

            this.drawFrame();
        }

        public syncStatus(anotherMc: MovieClip): void {
            this._frame = anotherMc._frame;
            this._frameElapsed = anotherMc._frameElapsed;
            this._reversed = anotherMc._reversed;
            this._repeatedCount = anotherMc._repeatedCount;

            this.drawFrame();
        }

        public advance(timeInMiniseconds: number): void {
            var beginFrame: number = this._frame;
            var beginReversed: boolean = this._reversed;
            var backupTime: number = timeInMiniseconds;

            while (true) {
                var tt: number = this.interval + this._frames[this._frame].addDelay;
                if (this._frame == 0 && this._repeatedCount > 0)
                    tt += this.repeatDelay;
                if (timeInMiniseconds < tt) {
                    this._frameElapsed = 0;
                    break;
                }

                timeInMiniseconds -= tt;

                if (this.swing) {
                    if (this._reversed) {
                        this._frame--;
                        if (this._frame <= 0) {
                            this._frame = 0;
                            this._repeatedCount++;
                            this._reversed = !this._reversed;
                        }
                    }
                    else {
                        this._frame++;
                        if (this._frame > this._frameCount - 1) {
                            this._frame = Math.max(0, this._frameCount - 2);
                            this._repeatedCount++;
                            this._reversed = !this._reversed;
                        }
                    }
                }
                else {
                    this._frame++;
                    if (this._frame > this._frameCount - 1) {
                        this._frame = 0;
                        this._repeatedCount++;
                    }
                }

                if (this._frame == beginFrame && this._reversed == beginReversed) //走了一轮了
                {
                    var roundTime: number = backupTime - timeInMiniseconds; //这就是一轮需要的时间
                    timeInMiniseconds -= Math.floor(timeInMiniseconds / roundTime) * roundTime; //跳过
                }
            }

            this.drawFrame();
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

            this.frame = start;
        }

        private update(): void {
            if (!this._playing || this._frameCount == 0 || this._status == 3)
                return;

            var dt: number = GTimers.deltaTime;
            if (this.timeScale != 1)
                dt *= this.timeScale;

            this._frameElapsed += dt;
            var tt: number = this.interval + this._frames[this._frame].addDelay;
            if (this._frame == 0 && this._repeatedCount > 0)
                tt += this.repeatDelay;
            if (this._frameElapsed < tt)
                return;

            this._frameElapsed -= tt;
            if (this._frameElapsed > this.interval)
                this._frameElapsed = this.interval;

            if (this.swing) {
                if (this._reversed) {
                    this._frame--;
                    if (this._frame <= 0) {
                        this._frame = 0;
                        this._repeatedCount++;
                        this._reversed = !this._reversed;
                    }
                }
                else {
                    this._frame++;
                    if (this._frame > this._frameCount - 1) {
                        this._frame = Math.max(0, this._frameCount - 2);
                        this._repeatedCount++;
                        this._reversed = !this._reversed;
                    }
                }
            }
            else {
                this._frame++;
                if (this._frame > this._frameCount - 1) {
                    this._frame = 0;
                    this._repeatedCount++;
                }
            }

            if (this._status == 1) //new loop
            {
                this._frame = this._start;
                this._frameElapsed = 0;
                this._status = 0;
            }
            else if (this._status == 2) //ending
            {
                this._frame = this._endAt;
                this._frameElapsed = 0;
                this._status = 3; //ended

                //play end
                if (this._callback != null) {
                    var callback: Function = this._callback;
                    var caller: any = this._callbackObj;
                    this._callback = null;
                    this._callbackObj = null;
                    callback.call(caller);
                }
            }
            else {
                if (this._frame == this._end) {
                    if (this._times > 0) {
                        this._times--;
                        if (this._times == 0)
                            this._status = 2;  //ending
                        else
                            this._status = 1; //new loop
                    }
                    else if (this._start != 0)
                        this._status = 1; //new loop
                }
            }

            this.drawFrame();
        }

        private drawFrame(): void {
            if (this._frameCount > 0 && this._frame < this._frames.length) {
                var frame: Frame = this._frames[this._frame];
                this._texture = frame.texture;
                this._frameRect = frame.rect;
            }
            else
                this._texture = null;

            if (this["$updateRenderNode"]) {
                let self = <any>this;
                self.$renderDirty = true;
                let p = self.$parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = self.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }
            else {
                let self = <any>this;
                self.$invalidateContentBounds();
            }
        }

        private checkTimer(): void {
            if (this._playing && this._frameCount > 0 && this.stage != null)
                GTimers.inst.add(1, 0, this.update, this);
            else
                GTimers.inst.remove(this.update, this);
        }

        //comment this function before 5.1.0
        $updateRenderNode(): void {
            var texture = this._texture;
            if (texture) {
                var offsetX: number = Math.round(texture.$offsetX) + this._frameRect.x;
                var offsetY: number = Math.round(texture.$offsetY) + this._frameRect.y;
                var bitmapWidth: number = texture.$bitmapWidth;
                var bitmapHeight: number = texture.$bitmapHeight;
                var textureWidth: number = texture.$getTextureWidth();
                var textureHeight: number = texture.$getTextureHeight();
                var destW: number = Math.round(texture.$getScaleBitmapWidth());
                var destH: number = Math.round(texture.$getScaleBitmapHeight());
                var sourceWidth: number = texture.$sourceWidth;
                var sourceHeight: number = texture.$sourceHeight;

                egret.sys.BitmapNode.$updateTextureData(<egret.sys.NormalBitmapNode>this.$renderNode, texture.$bitmapData, texture.$bitmapX, texture.$bitmapY,
                    bitmapWidth, bitmapHeight, offsetX, offsetY, textureWidth, textureHeight, destW, destH, sourceWidth, sourceHeight, egret.BitmapFillMode.SCALE, this._smoothing);
            }
        }

        //comment out this function after 5.1.0
        /*
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
        }*/

        $measureContentBounds(bounds: egret.Rectangle): void {
            if (this._texture) {
                var x: number = this._frameRect.x;
                var y: number = this._frameRect.y;
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

            if (this._playing && this._frameCount > 0)
                GTimers.inst.add(1, 0, this.update, this);
        }

        $onRemoveFromStage(): void {
            super.$onRemoveFromStage();

            GTimers.inst.remove(this.update, this);
        }
    }
}