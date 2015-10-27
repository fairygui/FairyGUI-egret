
module fairygui {

    export class PlayState {
        public reachEnding: boolean;
        public frameStarting: boolean;
        public reversed: boolean;
        public repeatedCount: number = 0;

        private _curFrame: number = 0;
        private _lastTime: number;
        private _curFrameDelay: number = 0;

        public constructor() {
        }

        public update(mc: MovieClip): void {
            var t: number = egret.getTimer();
            var elapsed: number = t - this._lastTime;
            this._lastTime = t;

            this.reachEnding = false;
            this.frameStarting = false;
            this._curFrameDelay += elapsed;
            var realFrame: number = this.reversed ? mc.frameCount - this._curFrame - 1 : this._curFrame;
            var interval: number = mc.interval + mc.frames[realFrame].addDelay + ((realFrame == 0 && this.repeatedCount > 0) ? mc.repeatDelay : 0);
            if (this._curFrameDelay < interval)
                return;

            this._curFrameDelay = 0;
            this._curFrame++;
            this.frameStarting = true;

            if (this._curFrame > mc.frameCount - 1) {
                this._curFrame = 0;
                this.repeatedCount++;
                this.reachEnding = true;
                if (mc.swing) {
                    this.reversed = !this.reversed;
                    this._curFrame++;
                }
            }
        }

        public get currentFrame(): number {
            return this._curFrame;
        }

        public set currentFrame(value: number) {
            this._curFrame = value;
            this._curFrameDelay = 0;
        }

        public rewind(): void {
            this._curFrame = 0;
            this._curFrameDelay = 0;
            this.reversed = false;
            this.reachEnding = false;
        }

        public reset(): void {
            this._curFrame = 0;
            this._curFrameDelay = 0;
            this.repeatedCount = 0;
            this.reachEnding = false;
            this.reversed = false;
        }

        public copy(src: PlayState): void {
            this._curFrame = src._curFrame;
            this._curFrameDelay = src._curFrameDelay;
            this.repeatedCount = src.repeatedCount;
            this.reachEnding = src.reachEnding;
            this.reversed = src.reversed;
        }
    }
}