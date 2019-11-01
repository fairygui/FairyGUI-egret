
module fgui {

    export class GTimers {
        private _items: any;
        private _itemPool: any;

        private _enumI: number = 0;
        private _enumCount: number = 0;
        private _lastTime: number = 0;

        public static deltaTime: number = 0;
        public static time: number = 0;

        public static inst: GTimers = new GTimers();

        private static FPS24: number = 1000 / 24;

        public constructor() {
            this._items = new Array<TimerItem>();
            this._itemPool = new Array<TimerItem>();

            this._lastTime = egret.getTimer();
            GTimers.time = this._lastTime;
            egret.startTick(this.__timer, this);
        }

        private getItem(): TimerItem {
            if (this._itemPool.length)
                return this._itemPool.pop();
            else
                return new TimerItem();
        }

        private findItem(callback: Function, thisObj: any): TimerItem {
            var len: number = this._items.length;
            for (var i: number = 0; i < len; i++) {
                var item: TimerItem = this._items[i];
                if (item.callback == callback && item.thisObj == thisObj)
                    return item;
            }
            return null;
        }

        public add(delayInMiniseconds: number, repeat: number, callback: Function, thisObj: any, callbackParam: any = null): void {
            var item: TimerItem = this.findItem(callback, thisObj);
            if (!item) {
                item = this.getItem();
                item.callback = callback;
                item.hasParam = callback.length == 1;
                item.thisObj = thisObj;
                this._items.push(item);
            }
            item.delay = delayInMiniseconds;
            item.counter = 0;
            item.repeat = repeat;
            item.param = callbackParam;
            item.end = false;
        }

        public callLater(callback: Function, thisObj: any, callbackParam: any = null): void {
            this.add(1, 1, callback, thisObj, callbackParam);
        }

        public callDelay(delay: number, callback: Function, thisObj: any, callbackParam: any = null): void {
            this.add(delay, 1, callback, thisObj, callbackParam);
        }

        public callBy24Fps(callback: Function, thisObj: any, callbackParam: any = null): void {
            this.add(GTimers.FPS24, 0, callback, thisObj, callbackParam);
        }

        public exists(callback: Function, thisObj: any): boolean {
            var item: TimerItem = this.findItem(callback, thisObj);
            return item != null;
        }

        public remove(callback: Function, thisObj: any): void {
            var item: TimerItem = this.findItem(callback, thisObj);
            if (item) {
                var i: number = this._items.indexOf(item);
                this._items.splice(i, 1);
                if (i < this._enumI)
                    this._enumI--;
                this._enumCount--;

                item.reset();
                this._itemPool.push(item);
            }
        }

        private __timer(timeStamp: number): boolean {
            GTimers.time = timeStamp;
            GTimers.deltaTime = timeStamp - this._lastTime;
            this._lastTime = timeStamp;
            
            this._enumI = 0;
            this._enumCount = this._items.length;

            while (this._enumI < this._enumCount) {
                var item: TimerItem = this._items[this._enumI];
                this._enumI++;

                if (item.advance(GTimers.deltaTime)) {
                    if (item.end) {
                        this._enumI--;
                        this._enumCount--;
                        this._items.splice(this._enumI, 1);
                    }

                    if (item.hasParam)
                        item.callback.call(item.thisObj, item.param);
                    else
                        item.callback.call(item.thisObj);

                    if (item.end) {
                        item.reset();
                        this._itemPool.push(item);
                    }
                }
            }

            return false;
        }
    }


    class TimerItem {
        public delay: number = 0;
        public counter: number = 0;
        public repeat: number = 0;
        public callback: Function;
        public thisObj: any;
        public param: any;

        public hasParam: boolean;
        public end: boolean;

        public constructor() {
        }

        public advance(elapsed: number = 0): boolean {
            this.counter += elapsed;
            if (this.counter >= this.delay) {
                this.counter -= this.delay;
                if (this.counter > this.delay)
                    this.counter = this.delay;

                if (this.repeat > 0) {
                    this.repeat--;
                    if (this.repeat == 0)
                        this.end = true;
                }

                return true;
            }
            else
                return false;
        }

        public reset(): void {
            this.callback = null;
            this.thisObj = null;
            this.param = null;
        }
    }
}