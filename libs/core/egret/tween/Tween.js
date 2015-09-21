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
     * @class egret.Tween
     * @classdesc
     * Tween是Egret的动画缓动类
     * @extends egret.EventDispatcher
     * @link http://docs.egret-labs.org/post/manual/anim/tween.html Tween缓动动画
     */
    var Tween = (function (_super) {
        __extends(Tween, _super);
        /**
         * 创建一个 egret.Tween 对象
         * @private
         */
        function Tween(target, props, pluginData) {
            _super.call(this);
            this._target = null;
            this._useTicks = false;
            this.ignoreGlobalPause = false;
            this.loop = false;
            this.pluginData = null;
            this._steps = null;
            this._actions = null;
            this.paused = false;
            this.duration = 0;
            this._prevPos = -1;
            this.position = null;
            this._prevPosition = 0;
            this._stepPosition = 0;
            this.passive = false;
            this.initialize(target, props, pluginData);
        }
        var __egretProto__ = Tween.prototype;
        /**
         * 激活一个对象，对其添加 Tween 动画
         * @param target {any} 要激活 Tween 的对象
         * @param props {any} 参数，例如：{loop:true}
         * @param pluginData {any} 暂未实现
         * @param override {boolean} 是否移除对象之前添加的tween，默认值false
         */
        Tween.get = function (target, props, pluginData, override) {
            if (props === void 0) { props = null; }
            if (pluginData === void 0) { pluginData = null; }
            if (override === void 0) { override = false; }
            if (override) {
                Tween.removeTweens(target);
            }
            return new Tween(target, props, pluginData);
        };
        /**
         * 删除一个对象上的全部 Tween 动画
         * @method egret.Tween.removeTweens
         * @param target  需要移除 Tween 的对象
         */
        Tween.removeTweens = function (target) {
            if (!target.tween_count) {
                return;
            }
            var tweens = Tween._tweens;
            for (var i = tweens.length - 1; i >= 0; i--) {
                if (tweens[i]._target == target) {
                    tweens[i].paused = true;
                    tweens.splice(i, 1);
                }
            }
            target.tween_count = 0;
        };
        /**
         * 暂停某个对象的所有 Tween
         * @param target 要暂停 Tween 的对象
         */
        Tween.pauseTweens = function (target) {
            if (!target.tween_count) {
                return;
            }
            var tweens = egret.Tween._tweens;
            for (var i = tweens.length - 1; i >= 0; i--) {
                if (tweens[i]._target == target) {
                    tweens[i].paused = true;
                }
            }
        };
        /**
         * 继续播放某个对象的所有缓动
         * @param target 要继续播放 Tween 的对象
         */
        Tween.resumeTweens = function (target) {
            if (!target.tween_count) {
                return;
            }
            var tweens = egret.Tween._tweens;
            for (var i = tweens.length - 1; i >= 0; i--) {
                if (tweens[i]._target == target) {
                    tweens[i].paused = false;
                }
            }
        };
        Tween.tick = function (delta, paused) {
            if (paused === void 0) { paused = false; }
            var tweens = Tween._tweens.concat();
            for (var i = tweens.length - 1; i >= 0; i--) {
                var tween = tweens[i];
                if ((paused && !tween.ignoreGlobalPause) || tween.paused) {
                    continue;
                }
                tween.tick(tween._useTicks ? 1 : delta);
            }
        };
        Tween._register = function (tween, value) {
            var target = tween._target;
            var tweens = Tween._tweens;
            if (value) {
                if (target) {
                    target.tween_count = target.tween_count > 0 ? target.tween_count + 1 : 1;
                }
                tweens.push(tween);
                if (!Tween._inited) {
                    egret.Ticker.getInstance().register(Tween.tick, null);
                    Tween._inited = true;
                }
            }
            else {
                if (target) {
                    target.tween_count--;
                }
                var i = tweens.length;
                while (i--) {
                    if (tweens[i] == tween) {
                        tweens.splice(i, 1);
                        return;
                    }
                }
            }
        };
        /**
         * 删除所有 Tween
         */
        Tween.removeAllTweens = function () {
            var tweens = Tween._tweens;
            for (var i = 0, l = tweens.length; i < l; i++) {
                var tween = tweens[i];
                tween.paused = true;
                tween._target.tweenjs_count = 0;
            }
            tweens.length = 0;
        };
        __egretProto__.initialize = function (target, props, pluginData) {
            this._target = target;
            if (props) {
                this._useTicks = props.useTicks;
                this.ignoreGlobalPause = props.ignoreGlobalPause;
                this.loop = props.loop;
                props.onChange && this.addEventListener("change", props.onChange, props.onChangeObj);
                if (props.override) {
                    Tween.removeTweens(target);
                }
            }
            this.pluginData = pluginData || {};
            this._curQueueProps = {};
            this._initQueueProps = {};
            this._steps = [];
            this._actions = [];
            if (props && props.paused) {
                this.paused = true;
            }
            else {
                Tween._register(this, true);
            }
            if (props && props.position != null) {
                this.setPosition(props.position, Tween.NONE);
            }
        };
        __egretProto__.setPosition = function (value, actionsMode) {
            if (actionsMode === void 0) { actionsMode = 1; }
            if (value < 0) {
                value = 0;
            }
            //正常化位置
            var t = value;
            var end = false;
            if (t >= this.duration) {
                if (this.loop) {
                    t = t % this.duration;
                }
                else {
                    t = this.duration;
                    end = true;
                }
            }
            if (t == this._prevPos) {
                return end;
            }
            var prevPos = this._prevPos;
            this.position = this._prevPos = t;
            this._prevPosition = value;
            if (this._target) {
                if (end) {
                    //结束
                    this._updateTargetProps(null, 1);
                }
                else if (this._steps.length > 0) {
                    for (var i = 0, l = this._steps.length; i < l; i++) {
                        if (this._steps[i].t > t) {
                            break;
                        }
                    }
                    var step = this._steps[i - 1];
                    this._updateTargetProps(step, (this._stepPosition = t - step.t) / step.d);
                }
            }
            //执行actions
            if (actionsMode != 0 && this._actions.length > 0) {
                if (this._useTicks) {
                    this._runActions(t, t);
                }
                else if (actionsMode == 1 && t < prevPos) {
                    if (prevPos != this.duration) {
                        this._runActions(prevPos, this.duration);
                    }
                    this._runActions(0, t, true);
                }
                else {
                    this._runActions(prevPos, t);
                }
            }
            if (end) {
                this.setPaused(true);
            }
            this.dispatchEventWith("change");
            return end;
        };
        __egretProto__._runActions = function (startPos, endPos, includeStart) {
            if (includeStart === void 0) { includeStart = false; }
            var sPos = startPos;
            var ePos = endPos;
            var i = -1;
            var j = this._actions.length;
            var k = 1;
            if (startPos > endPos) {
                //把所有的倒置
                sPos = endPos;
                ePos = startPos;
                i = j;
                j = k = -1;
            }
            while ((i += k) != j) {
                var action = this._actions[i];
                var pos = action.t;
                if (pos == ePos || (pos > sPos && pos < ePos) || (includeStart && pos == startPos)) {
                    action.f.apply(action.o, action.p);
                }
            }
        };
        __egretProto__._updateTargetProps = function (step, ratio) {
            var p0, p1, v, v0, v1, arr;
            if (!step && ratio == 1) {
                this.passive = false;
                p0 = p1 = this._curQueueProps;
            }
            else {
                this.passive = !!step.v;
                //不更新props.
                if (this.passive) {
                    return;
                }
                //使用ease
                if (step.e) {
                    ratio = step.e(ratio, 0, 1, 1);
                }
                p0 = step.p0;
                p1 = step.p1;
            }
            for (var n in this._initQueueProps) {
                if ((v0 = p0[n]) == null) {
                    p0[n] = v0 = this._initQueueProps[n];
                }
                if ((v1 = p1[n]) == null) {
                    p1[n] = v1 = v0;
                }
                if (v0 == v1 || ratio == 0 || ratio == 1 || (typeof (v0) != "number")) {
                    v = ratio == 1 ? v1 : v0;
                }
                else {
                    v = v0 + (v1 - v0) * ratio;
                }
                var ignore = false;
                if (arr = Tween._plugins[n]) {
                    for (var i = 0, l = arr.length; i < l; i++) {
                        var v2 = arr[i].tween(this, n, v, p0, p1, ratio, !!step && p0 == p1, !step);
                        if (v2 == Tween.IGNORE) {
                            ignore = true;
                        }
                        else {
                            v = v2;
                        }
                    }
                }
                if (!ignore) {
                    this._target[n] = v;
                }
            }
        };
        /**
         * 设置是否暂停
         * @method egret.Tween#setPaused
         * @param value {boolean} 是否暂停
         * @returns Tween对象本身
         */
        __egretProto__.setPaused = function (value) {
            this.paused = value;
            Tween._register(this, !value);
            return this;
        };
        __egretProto__._cloneProps = function (props) {
            var o = {};
            for (var n in props) {
                o[n] = props[n];
            }
            return o;
        };
        __egretProto__._addStep = function (o) {
            if (o.d > 0) {
                this._steps.push(o);
                o.t = this.duration;
                this.duration += o.d;
            }
            return this;
        };
        __egretProto__._appendQueueProps = function (o) {
            var arr, oldValue, i, l, injectProps;
            for (var n in o) {
                if (this._initQueueProps[n] === undefined) {
                    oldValue = this._target[n];
                    //设置plugins
                    if (arr = Tween._plugins[n]) {
                        for (i = 0, l = arr.length; i < l; i++) {
                            oldValue = arr[i].init(this, n, oldValue);
                        }
                    }
                    this._initQueueProps[n] = this._curQueueProps[n] = (oldValue === undefined) ? null : oldValue;
                }
                else {
                    oldValue = this._curQueueProps[n];
                }
            }
            for (var n in o) {
                oldValue = this._curQueueProps[n];
                if (arr = Tween._plugins[n]) {
                    injectProps = injectProps || {};
                    for (i = 0, l = arr.length; i < l; i++) {
                        if (arr[i].step) {
                            arr[i].step(this, n, oldValue, o[n], injectProps);
                        }
                    }
                }
                this._curQueueProps[n] = o[n];
            }
            if (injectProps) {
                this._appendQueueProps(injectProps);
            }
            return this._curQueueProps;
        };
        __egretProto__._addAction = function (o) {
            o.t = this.duration;
            this._actions.push(o);
            return this;
        };
        __egretProto__._set = function (props, o) {
            for (var n in props) {
                o[n] = props[n];
            }
        };
        /**
         * 等待指定毫秒后执行下一个动画
         * @method egret.Tween#wait
         * @param duration {number} 要等待的时间，以毫秒为单位
         * @param passive {boolean} 等待期间属性是否会更新
         * @returns Tween对象本身
         */
        __egretProto__.wait = function (duration, passive) {
            if (duration == null || duration <= 0) {
                return this;
            }
            var o = this._cloneProps(this._curQueueProps);
            return this._addStep({ d: duration, p0: o, p1: o, v: passive });
        };
        /**
         * 将指定显示对象的属性修改为指定值
         * @method egret.Tween#to
         * @param props {Object} 对象的属性集合
         * @param duration {number} 持续时间
         * @param ease {egret.Ease} 缓动算法
         * @returns {egret.Tween} Tween对象本身
         */
        __egretProto__.to = function (props, duration, ease) {
            if (ease === void 0) { ease = undefined; }
            if (isNaN(duration) || duration < 0) {
                duration = 0;
            }
            return this._addStep({ d: duration || 0, p0: this._cloneProps(this._curQueueProps), e: ease, p1: this._cloneProps(this._appendQueueProps(props)) });
        };
        /**
         * 执行回调函数
         * @method egret.Tween#call
         * @param callback {Function} 回调方法
         * @param thisObj {any} 回调方法this作用域
         * @param params {Array<any>} 回调方法参数
         * @returns {egret.Tween} Tween对象本身
         */
        __egretProto__.call = function (callback, thisObj, params) {
            if (thisObj === void 0) { thisObj = undefined; }
            if (params === void 0) { params = undefined; }
            return this._addAction({ f: callback, p: params ? params : [], o: thisObj ? thisObj : this._target });
        };
        __egretProto__.set = function (props, target) {
            if (target === void 0) { target = null; }
            return this._addAction({ f: this._set, o: this, p: [props, target ? target : this._target] });
        };
        /**
         * 执行
         * @method egret.Tween#play
         * @param tween {egret.Tween} 需要操作的 Tween 对象，默认this
         * @returns {egret.Tween} Tween对象本身
         */
        __egretProto__.play = function (tween) {
            if (!tween) {
                tween = this;
            }
            return this.call(tween.setPaused, tween, [false]);
        };
        /**
         * 暂停
         * @method egret.Tween#pause
         * @param tween {egret.Tween} 需要操作的 Tween 对象，默认this
         * @returns {egret.Tween} Tween对象本身
         */
        __egretProto__.pause = function (tween) {
            if (!tween) {
                tween = this;
            }
            return this.call(tween.setPaused, tween, [true]);
        };
        /**
         * @method egret.Tween#tick
         * @param delta {number}
         * @private
         */
        __egretProto__.tick = function (delta) {
            if (this.paused) {
                return;
            }
            this.setPosition(this._prevPosition + delta);
        };
        /**
         * 不做特殊处理
         * @constant {number} egret.Tween.NONE
         * @private
         */
        Tween.NONE = 0;
        /**
         * 循环
         * @constant {number} egret.Tween.LOOP
         * @private
         */
        Tween.LOOP = 1;
        /**
         * 倒序
         * @constant {number} egret.Tween.REVERSE
         * @private
         */
        Tween.REVERSE = 2;
        Tween._tweens = [];
        Tween.IGNORE = {};
        Tween._plugins = {};
        Tween._inited = false;
        return Tween;
    })(egret.EventDispatcher);
    egret.Tween = Tween;
    Tween.prototype.__class__ = "egret.Tween";
})(egret || (egret = {}));
