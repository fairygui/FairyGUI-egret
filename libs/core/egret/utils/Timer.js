//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var egret;
(function (egret) {
    /**
     * @class egret.Timer
     * @classdesc
     * Timer 类是计时器的接口，它使您能按指定的时间序列运行代码。
     * 使用 start() 方法来启动计时器。为 timer 事件添加事件侦听器，以便将代码设置为按计时器间隔运行。
     * 可以创建 Timer 对象以运行一次或按指定间隔重复运行，从而按计划执行代码。
     * 根据 Egret 的帧速率或运行时环境（可用内存和其他因素），运行时调度事件的间隔可能稍有不同。
     * @extends egret.EventDispatcher
     * @link http://docs.egret-labs.org/post/manual/timer/timer.html Timer计时器
     */
    var Timer = (function (_super) {
        __extends(Timer, _super);
        /**
         * 创建一个 egret.Timer 对象
         * @param delay {number} 计时器事件间的延迟（以毫秒为单位）。
         * @param repeatCount {number} 设置的计时器运行总次数。
         */
        function Timer(delay, repeatCount) {
            if (repeatCount === void 0) { repeatCount = 0; }
            _super.call(this);
            this._currentCount = 0;
            this._running = false;
            this.lastTime = 0;
            this.delay = delay;
            this.repeatCount = repeatCount;
        }
        var __egretProto__ = Timer.prototype;
        Object.defineProperty(__egretProto__, "currentCount", {
            /**
             * 计时器从 0 开始后触发的总次数。如果已重置了计时器，则只会计入重置后的触发次数。
             * @method egret.Timer#currentCount
             */
            get: function () {
                return this._currentCount;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "running", {
            /**
             * 计时器的当前状态；如果计时器正在运行，则为 true，否则为 false。
             * @member {boolean} egret.Timer#running
             */
            get: function () {
                return this._running;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 如果计时器正在运行，则停止计时器，并将 currentCount 属性设回为 0，这类似于秒表的重置按钮。然后，在调用 start() 后，将运行计时器实例，运行次数为指定的重复次数（由 repeatCount 值设置）。
         * @method egret.Timer#reset
         */
        __egretProto__.reset = function () {
            this.stop();
            this._currentCount = 0;
        };
        /**
         * 如果计时器尚未运行，则启动计时器。
         * @method egret.Timer#start
         */
        __egretProto__.start = function () {
            if (this._running)
                return;
            this.lastTime = egret.getTimer();
            egret.Ticker.getInstance().register(this.onEnterFrame, this);
            this._running = true;
        };
        /**
         * 停止计时器。如果在调用 stop() 后调用 start()，则将继续运行计时器实例，运行次数为剩余的 重复次数（由 repeatCount 属性设置）。
         * @method egret.Timer#stop
         */
        __egretProto__.stop = function () {
            if (!this._running)
                return;
            egret.Ticker.getInstance().unregister(this.onEnterFrame, this);
            this._running = false;
        };
        __egretProto__.onEnterFrame = function (frameTime) {
            var now = egret.getTimer();
            var passTime = now - this.lastTime;
            if (passTime > this.delay) {
                this.lastTime = now;
                this._currentCount++;
                egret.TimerEvent.dispatchTimerEvent(this, egret.TimerEvent.TIMER);
                if (this.repeatCount > 0 && this._currentCount >= this.repeatCount) {
                    this.stop();
                    egret.TimerEvent.dispatchTimerEvent(this, egret.TimerEvent.TIMER_COMPLETE);
                }
            }
        };
        return Timer;
    })(egret.EventDispatcher);
    egret.Timer = Timer;
    Timer.prototype.__class__ = "egret.Timer";
})(egret || (egret = {}));
