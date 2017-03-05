
module fairygui {

    export class PlayState {
        public reachEnding: boolean;
        public reversed: boolean;
        public repeatedCount: number = 0;

        private _curFrame: number = 0;
        private _curFrameDelay: number = 0;
        private _lastUpdateSeq: number = 0;

        public constructor() {
        }

        public update(mc: MovieClip): void {
            var elapsed:number;
			var frameId:number = GTimers.workCount;
			if (frameId - this._lastUpdateSeq != 1) 
				//1、如果>1，表示不是连续帧了，说明刚启动（或者停止过），这里不能用流逝的时间了，不然会跳过很多帧
				//2、如果==0，表示在本帧已经处理过了，这通常是因为一个PlayState用于多个MovieClip共享，目的是多个MovieClip同步播放
				elapsed = 0;
			else
				elapsed = GTimers.deltaTime;
			this._lastUpdateSeq = frameId;

            var cur:number = this._curFrame;
            if(cur>=mc.frameCount)
                cur = mc.frameCount-1;

            this.reachEnding = false;
            this._curFrameDelay += elapsed;
            var interval: number = mc.interval + mc.frames[cur].addDelay 
                + ((cur == 0 && this.repeatedCount > 0) ? mc.repeatDelay : 0);
            if (this._curFrameDelay < interval)
                return;

            this._curFrameDelay -= interval;
            if(this._curFrameDelay>mc.interval)
                this._curFrameDelay = mc.interval;
                			
			if (mc.swing)
			{
				if(this.reversed)
				{
					this._curFrame--;
					if(this._curFrame<0)
					{
						this._curFrame = Math.min(1, mc.frameCount-1);
						this.repeatedCount++;
						this.reversed = !this.reversed;
					}
				}
				else
				{
					this._curFrame++;
					if (this._curFrame > mc.frameCount - 1)
					{
						this._curFrame = Math.max(0, mc.frameCount-2);
						this.repeatedCount++;
						this.reachEnding = true;
						this.reversed = !this.reversed;
					}
				}				
			}
			else
			{
				this._curFrame++;
				if (this._curFrame > mc.frameCount - 1)
				{
					this._curFrame = 0;
					this.repeatedCount++;
					this.reachEnding = true;
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