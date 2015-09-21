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
     * @class egret.ScrollView
     * @classdesc
     * ScrollView 是用于滑动的辅助类，将一个显示对象传入构造函数即可。可以在指定的尺寸范围内显示超过该范围的显示对象。并可以在此范围内随意拖动。
     * @extends egret.DisplayObjectContainer
     */
    var ScrollView = (function (_super) {
        __extends(ScrollView, _super);
        /**
         * 创建一个 egret.ScrollView 对象
         * @method egret.ScrollView#constructor
         * @param content {egret.DisplayObject} 需要滚动的对象
         */
        function ScrollView(content) {
            if (content === void 0) { content = null; }
            _super.call(this);
            /**
             * 开始滚动的阈值，当触摸点偏离初始触摸点的距离超过这个值时才会触发滚动
             * @member {number} egret.ScrollView#scrollBeginThreshold
             */
            this.scrollBeginThreshold = 10;
            /**
             * 滚动速度，这个值为需要的速度与默认速度的比值。
             * 取值范围为 scrollSpeed > 0 赋值为 2 时，速度是默认速度的 2 倍
             * @member {number} egret.ScrollView#scrollSpeed
             */
            this.scrollSpeed = 1;
            this._content = null;
            this.delayTouchBeginEvent = null;
            this.touchBeginTimer = null;
            this.touchEnabled = true;
            this._ScrV_Props_ = new egret.ScrollViewProperties();
            if (content) {
                this.setContent(content);
            }
        }
        var __egretProto__ = ScrollView.prototype;
        /**
         * 设置需要滚动的对象
         * @method egret.ScrollView#setContent
         * @param content {egret.DisplayObject} 需要滚动的对象
         */
        __egretProto__.setContent = function (content) {
            if (this._content === content)
                return;
            this.removeContent();
            if (content) {
                this._content = content;
                _super.prototype.addChild.call(this, content);
                this._addEvents();
            }
        };
        /**
         * 移除滚动的对象
         * @method egret.ScrollView#removeContent
         */
        __egretProto__.removeContent = function () {
            if (this._content) {
                this._removeEvents();
                _super.prototype.removeChildAt.call(this, 0);
            }
            this._content = null;
        };
        Object.defineProperty(__egretProto__, "verticalScrollPolicy", {
            /**
             * 垂直滚动条显示策略，on/off/auto。
             * @member egret.ScrollView#verticalScrollPolicy
             */
            get: function () {
                return this._ScrV_Props_._verticalScrollPolicy;
            },
            set: function (value) {
                if (value == this._ScrV_Props_._verticalScrollPolicy)
                    return;
                this._ScrV_Props_._verticalScrollPolicy = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "horizontalScrollPolicy", {
            /**
             * 水平滚动条显示策略，on/off/auto。
             * @member egret.ScrollView#horizontalScrollPolicy
             */
            get: function () {
                return this._ScrV_Props_._horizontalScrollPolicy;
            },
            set: function (value) {
                if (value == this._ScrV_Props_._horizontalScrollPolicy)
                    return;
                this._ScrV_Props_._horizontalScrollPolicy = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "scrollLeft", {
            /**
             * 获取或设置水平滚动位置,
             * @member {number} egret.ScrollView#scrollLeft
             * @returns {number}
             */
            get: function () {
                return this._ScrV_Props_._scrollLeft;
            },
            set: function (value) {
                if (value == this._ScrV_Props_._scrollLeft)
                    return;
                this._ScrV_Props_._scrollLeft = value;
                this._validatePosition(false, true);
                this._updateContentPosition();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "scrollTop", {
            /**
             * 获取或设置垂直滚动位置,
             * @member {number} egret.ScrollView#scrollTop
             * @returns {number}
             */
            get: function () {
                return this._ScrV_Props_._scrollTop;
            },
            set: function (value) {
                if (value == this._ScrV_Props_._scrollTop)
                    return;
                this._ScrV_Props_._scrollTop = value;
                this._validatePosition(true, false);
                this._updateContentPosition();
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 设置滚动位置
         * @method egret.ScrollView#setScrollPosition
         * @param top {number} 垂直滚动位置
         * @param left {number} 水平滚动位置
         * @param isOffset {boolean} 可选参数，默认是false，是否是滚动增加量，如 top=1 代表往上滚动1像素
         */
        __egretProto__.setScrollPosition = function (top, left, isOffset) {
            if (isOffset === void 0) { isOffset = false; }
            if (isOffset && top == 0 && left == 0)
                return;
            if (!isOffset && this._ScrV_Props_._scrollTop == top && this._ScrV_Props_._scrollLeft == left)
                return;
            if (isOffset) {
                var isEdgeV = this._isOnTheEdge(true);
                var isEdgeH = this._isOnTheEdge(false);
                this._ScrV_Props_._scrollTop += isEdgeV ? top / 2 : top;
                this._ScrV_Props_._scrollLeft += isEdgeH ? left / 2 : left;
            }
            else {
                this._ScrV_Props_._scrollTop = top;
                this._ScrV_Props_._scrollLeft = left;
            }
            this._validatePosition(true, true);
            this._updateContentPosition();
        };
        __egretProto__._isOnTheEdge = function (isVertical) {
            if (isVertical === void 0) { isVertical = true; }
            var top = this._ScrV_Props_._scrollTop, left = this._ScrV_Props_._scrollLeft;
            if (isVertical)
                return top < 0 || top > this.getMaxScrollTop();
            else
                return left < 0 || left > this.getMaxScrollLeft();
        };
        __egretProto__._validatePosition = function (top, left) {
            if (top === void 0) { top = false; }
            if (left === void 0) { left = false; }
            if (top) {
                var height = this.height;
                var contentHeight = this._getContentHeight();
                this._ScrV_Props_._scrollTop = Math.max(this._ScrV_Props_._scrollTop, (0 - height) / 2);
                this._ScrV_Props_._scrollTop = Math.min(this._ScrV_Props_._scrollTop, contentHeight > height ? (contentHeight - height / 2) : height / 2);
            }
            if (left) {
                var width = this.width;
                var contentWidth = this._getContentWidth();
                this._ScrV_Props_._scrollLeft = Math.max(this._ScrV_Props_._scrollLeft, (0 - width) / 2);
                this._ScrV_Props_._scrollLeft = Math.min(this._ScrV_Props_._scrollLeft, contentWidth > width ? (contentWidth - width / 2) : width / 2);
            }
        };
        /**
         * @inheritDoc
         */
        __egretProto__._setWidth = function (value) {
            if (this._DO_Props_._explicitWidth == value)
                return;
            _super.prototype._setWidth.call(this, value);
            this._updateContentPosition();
        };
        /**
         * @inheritDoc
         */
        __egretProto__._setHeight = function (value) {
            if (this._DO_Props_._explicitHeight == value)
                return;
            _super.prototype._setHeight.call(this, value);
            this._updateContentPosition();
        };
        __egretProto__._updateContentPosition = function () {
            var size = this.getBounds(egret.Rectangle.identity);
            var height = size.height;
            var width = size.width;
            this.scrollRect = new egret.Rectangle(this._ScrV_Props_._scrollLeft, this._ScrV_Props_._scrollTop, width, height);
            this.dispatchEvent(new egret.Event(egret.Event.CHANGE));
        };
        __egretProto__._checkScrollPolicy = function () {
            var hpolicy = this._ScrV_Props_._horizontalScrollPolicy;
            var hCanScroll = this.__checkScrollPolicy(hpolicy, this._getContentWidth(), this.width);
            this._ScrV_Props_._hCanScroll = hCanScroll;
            var vpolicy = this._ScrV_Props_._verticalScrollPolicy;
            var vCanScroll = this.__checkScrollPolicy(vpolicy, this._getContentHeight(), this.height);
            this._ScrV_Props_._vCanScroll = vCanScroll;
            return hCanScroll || vCanScroll;
        };
        __egretProto__.__checkScrollPolicy = function (policy, contentLength, viewLength) {
            if (policy == "on")
                return true;
            if (policy == "off")
                return false;
            return contentLength > viewLength;
        };
        __egretProto__._addEvents = function () {
            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this._onTouchBegin, this);
            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this._onTouchBeginCapture, this, true);
            this.addEventListener(egret.TouchEvent.TOUCH_END, this._onTouchEndCapture, this, true);
        };
        __egretProto__._removeEvents = function () {
            this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this._onTouchBegin, this);
            this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this._onTouchBeginCapture, this, true);
            this.removeEventListener(egret.TouchEvent.TOUCH_END, this._onTouchEndCapture, this, true);
        };
        __egretProto__._onTouchBegin = function (e) {
            if (e._isDefaultPrevented)
                return;
            var canScroll = this._checkScrollPolicy();
            if (!canScroll) {
                return;
            }
            this._ScrV_Props_._touchStartPosition.x = e.stageX;
            this._ScrV_Props_._touchStartPosition.y = e.stageY;
            if (this._ScrV_Props_._isHTweenPlaying || this._ScrV_Props_._isVTweenPlaying) {
                this._onScrollFinished();
            }
            this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this._onTouchMove, this);
            this.stage.addEventListener(egret.TouchEvent.TOUCH_END, this._onTouchEnd, this);
            this.stage.addEventListener(egret.TouchEvent.LEAVE_STAGE, this._onTouchEnd, this);
            this.addEventListener(egret.Event.ENTER_FRAME, this._onEnterFrame, this);
            this._logTouchEvent(e);
            e.preventDefault();
        };
        __egretProto__._onTouchBeginCapture = function (event) {
            var canScroll = this._checkScrollPolicy();
            if (!canScroll) {
                return;
            }
            var target = event.target;
            while (target != this) {
                if ("_checkScrollPolicy" in target) {
                    canScroll = target._checkScrollPolicy();
                    if (canScroll) {
                        return;
                    }
                }
                target = target.parent;
            }
            event.stopPropagation();
            var evt = this.cloneTouchEvent(event);
            this.delayTouchBeginEvent = evt;
            if (!this.touchBeginTimer) {
                this.touchBeginTimer = new egret.Timer(100, 1);
                this.touchBeginTimer.addEventListener(egret.TimerEvent.TIMER_COMPLETE, this._onTouchBeginTimer, this);
            }
            this.touchBeginTimer.start();
            this._onTouchBegin(event);
        };
        __egretProto__._onTouchEndCapture = function (event) {
            if (!this.delayTouchBeginEvent) {
                return;
            }
            this._onTouchBeginTimer();
        };
        __egretProto__._onTouchBeginTimer = function () {
            this.touchBeginTimer.stop();
            var event = this.delayTouchBeginEvent;
            this.delayTouchBeginEvent = null;
            //Dispatch event only if the scroll view is still on the stage
            if (this.stage)
                this.dispatchPropagationEvent(event);
        };
        __egretProto__.dispatchPropagationEvent = function (event) {
            var list = [];
            var target = event._target;
            var scrollerIndex = 0;
            while (target) {
                if (target == this)
                    scrollerIndex = list.length;
                list.push(target);
                target = target.parent;
            }
            var captureList = list.slice(0, scrollerIndex);
            captureList = captureList.reverse();
            list = captureList.concat(list);
            var targetIndex = scrollerIndex;
            this._dispatchPropagationEvent(event, list, targetIndex);
        };
        __egretProto__._dispatchPropagationEvent = function (event, list, targetIndex) {
            var length = list.length;
            for (var i = 0; i < length; i++) {
                var currentTarget = list[i];
                event._currentTarget = currentTarget;
                if (i < targetIndex)
                    event._eventPhase = 1;
                else if (i == targetIndex)
                    event._eventPhase = 2;
                else
                    event._eventPhase = 3;
                currentTarget._notifyListener(event);
                if (event._isPropagationStopped || event._isPropagationImmediateStopped) {
                    break;
                }
            }
        };
        __egretProto__._onTouchMove = function (event) {
            if (this._ScrV_Props_._lastTouchPosition.x == event.stageX && this._ScrV_Props_._lastTouchPosition.y == event.stageY)
                return;
            if (!this._ScrV_Props_._scrollStarted) {
                var x = event.stageX - this._ScrV_Props_._touchStartPosition.x, y = event.stageY - this._ScrV_Props_._touchStartPosition.y;
                var distance = Math.sqrt(x * x + y * y);
                if (distance < this.scrollBeginThreshold) {
                    this._logTouchEvent(event);
                    return;
                }
            }
            this._ScrV_Props_._scrollStarted = true;
            if (this.delayTouchBeginEvent) {
                this.delayTouchBeginEvent = null;
                this.touchBeginTimer.stop();
            }
            this.touchChildren = false;
            var offset = this._getPointChange(event);
            this.setScrollPosition(offset.y, offset.x, true);
            this._calcVelocitys(event);
            this._logTouchEvent(event);
        };
        __egretProto__._onTouchEnd = function (event) {
            this.touchChildren = true;
            this._ScrV_Props_._scrollStarted = false;
            egret.MainContext.instance.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this._onTouchMove, this);
            egret.MainContext.instance.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this._onTouchEnd, this);
            egret.MainContext.instance.stage.removeEventListener(egret.TouchEvent.LEAVE_STAGE, this._onTouchEnd, this);
            this.removeEventListener(egret.Event.ENTER_FRAME, this._onEnterFrame, this);
            this._moveAfterTouchEnd();
        };
        __egretProto__._onEnterFrame = function (event) {
            var time = egret.getTimer();
            if (time - this._ScrV_Props_._lastTouchTime > 100 && time - this._ScrV_Props_._lastTouchTime < 300) {
                this._calcVelocitys(this._ScrV_Props_._lastTouchEvent);
            }
        };
        __egretProto__._logTouchEvent = function (e) {
            this._ScrV_Props_._lastTouchPosition.x = e.stageX;
            this._ScrV_Props_._lastTouchPosition.y = e.stageY;
            this._ScrV_Props_._lastTouchEvent = this.cloneTouchEvent(e);
            this._ScrV_Props_._lastTouchTime = egret.getTimer();
        };
        __egretProto__._getPointChange = function (e) {
            return {
                x: this._ScrV_Props_._hCanScroll === false ? 0 : (this._ScrV_Props_._lastTouchPosition.x - e.stageX),
                y: this._ScrV_Props_._vCanScroll === false ? 0 : (this._ScrV_Props_._lastTouchPosition.y - e.stageY)
            };
        };
        __egretProto__._calcVelocitys = function (e) {
            var time = egret.getTimer();
            if (this._ScrV_Props_._lastTouchTime == 0) {
                this._ScrV_Props_._lastTouchTime = time;
                return;
            }
            var change = this._getPointChange(e);
            var timeoffset = time - this._ScrV_Props_._lastTouchTime;
            change.x /= timeoffset;
            change.y /= timeoffset;
            this._ScrV_Props_._velocitys.push(change);
            if (this._ScrV_Props_._velocitys.length > 5)
                this._ScrV_Props_._velocitys.shift();
            this._ScrV_Props_._lastTouchPosition.x = e.stageX;
            this._ScrV_Props_._lastTouchPosition.y = e.stageY;
        };
        __egretProto__._getContentWidth = function () {
            return this._content.explicitWidth || this._content.width;
        };
        __egretProto__._getContentHeight = function () {
            return this._content.explicitHeight || this._content.height;
        };
        __egretProto__.getMaxScrollLeft = function () {
            var max = this._getContentWidth() - this.width;
            return Math.max(0, max);
        };
        __egretProto__.getMaxScrollTop = function () {
            var max = this._getContentHeight() - this.height;
            return Math.max(0, max);
        };
        __egretProto__._moveAfterTouchEnd = function () {
            if (this._ScrV_Props_._velocitys.length == 0)
                return;
            var sum = { x: 0, y: 0 }, totalW = 0;
            for (var i = 0; i < this._ScrV_Props_._velocitys.length; i++) {
                var v = this._ScrV_Props_._velocitys[i];
                var w = ScrollView.weight[i];
                sum.x += v.x * w;
                sum.y += v.y * w;
                totalW += w;
            }
            this._ScrV_Props_._velocitys.length = 0;
            if (this.scrollSpeed <= 0)
                this.scrollSpeed = 1;
            var x = sum.x / totalW * this.scrollSpeed, y = sum.y / totalW * this.scrollSpeed;
            var pixelsPerMSX = Math.abs(x), pixelsPerMSY = Math.abs(y);
            var maxLeft = this.getMaxScrollLeft();
            var maxTop = this.getMaxScrollTop();
            var datax = pixelsPerMSX > 0.02 ? this.getAnimationDatas(x, this._ScrV_Props_._scrollLeft, maxLeft) : { position: this._ScrV_Props_._scrollLeft, duration: 1 };
            var datay = pixelsPerMSY > 0.02 ? this.getAnimationDatas(y, this._ScrV_Props_._scrollTop, maxTop) : { position: this._ScrV_Props_._scrollTop, duration: 1 };
            this.setScrollLeft(datax.position, datax.duration);
            this.setScrollTop(datay.position, datay.duration);
        };
        __egretProto__._onTweenFinished = function (tw) {
            if (tw == this._ScrV_Props_._vScrollTween)
                this._ScrV_Props_._isVTweenPlaying = false;
            if (tw == this._ScrV_Props_._hScrollTween)
                this._ScrV_Props_._isHTweenPlaying = false;
            if (this._ScrV_Props_._isHTweenPlaying == false && this._ScrV_Props_._isVTweenPlaying == false) {
                this._onScrollFinished();
            }
        };
        __egretProto__._onScrollStarted = function () {
        };
        __egretProto__._onScrollFinished = function () {
            egret.Tween.removeTweens(this);
            this._ScrV_Props_._hScrollTween = null;
            this._ScrV_Props_._vScrollTween = null;
            this._ScrV_Props_._isHTweenPlaying = false;
            this._ScrV_Props_._isVTweenPlaying = false;
            this.dispatchEvent(new egret.Event(egret.Event.COMPLETE));
        };
        __egretProto__.setScrollTop = function (scrollTop, duration) {
            if (duration === void 0) { duration = 0; }
            var finalPosition = Math.min(this.getMaxScrollTop(), Math.max(scrollTop, 0));
            if (duration == 0) {
                this.scrollTop = finalPosition;
                return null;
            }
            var vtween = egret.Tween.get(this).to({ scrollTop: scrollTop }, duration, egret.Ease.quartOut);
            if (finalPosition != scrollTop) {
                vtween.to({ scrollTop: finalPosition }, 300, egret.Ease.quintOut);
            }
            this._ScrV_Props_._isVTweenPlaying = true;
            this._ScrV_Props_._vScrollTween = vtween;
            vtween.call(this._onTweenFinished, this, [vtween]);
            if (!this._ScrV_Props_._isHTweenPlaying)
                this._onScrollStarted();
            return vtween;
        };
        __egretProto__.setScrollLeft = function (scrollLeft, duration) {
            if (duration === void 0) { duration = 0; }
            var finalPosition = Math.min(this.getMaxScrollLeft(), Math.max(scrollLeft, 0));
            if (duration == 0) {
                this.scrollLeft = finalPosition;
                return null;
            }
            var htween = egret.Tween.get(this).to({ scrollLeft: scrollLeft }, duration, egret.Ease.quartOut);
            if (finalPosition != scrollLeft) {
                htween.to({ scrollLeft: finalPosition }, 300, egret.Ease.quintOut);
            }
            this._ScrV_Props_._isHTweenPlaying = true;
            this._ScrV_Props_._hScrollTween = htween;
            htween.call(this._onTweenFinished, this, [htween]);
            if (!this._ScrV_Props_._isVTweenPlaying)
                this._onScrollStarted();
            return htween;
        };
        __egretProto__.getAnimationDatas = function (pixelsPerMS, curPos, maxPos) {
            var absPixelsPerMS = Math.abs(pixelsPerMS);
            var extraFricition = 0.95;
            var duration = 0;
            var friction = 0.998;
            var minVelocity = 0.02;
            var posTo = curPos + pixelsPerMS * 500;
            if (posTo < 0 || posTo > maxPos) {
                posTo = curPos;
                while (Math.abs(pixelsPerMS) != Infinity && Math.abs(pixelsPerMS) > minVelocity) {
                    posTo += pixelsPerMS;
                    if (posTo < 0 || posTo > maxPos) {
                        pixelsPerMS *= friction * extraFricition;
                    }
                    else {
                        pixelsPerMS *= friction;
                    }
                    duration++;
                }
            }
            else {
                duration = -Math.log(minVelocity / absPixelsPerMS) * 500;
            }
            var result = {
                position: Math.min(maxPos + 50, Math.max(posTo, -50)),
                duration: duration
            };
            return result;
        };
        __egretProto__.cloneTouchEvent = function (event) {
            var evt = new egret.TouchEvent(event._type, event._bubbles, event.cancelable);
            evt.touchPointID = event.touchPointID;
            evt._stageX = event._stageX;
            evt._stageY = event._stageY;
            evt.ctrlKey = event.ctrlKey;
            evt.altKey = event.altKey;
            evt.shiftKey = event.shiftKey;
            evt.touchDown = event.touchDown;
            evt._isDefaultPrevented = false;
            evt._target = event._target;
            return evt;
        };
        __egretProto__.throwNotSupportedError = function () {
            throw new Error(egret.getString(1023));
        };
        /**
         * @method egret.ScrollView#addChild
         * @deprecated
         * @param child {DisplayObject}
         * @returns {DisplayObject}
         */
        __egretProto__.addChild = function (child) {
            this.throwNotSupportedError();
            return null;
        };
        /**
         * @method egret.ScrollView#addChildAt
         * @deprecated
         * @param child {DisplayObject}
         * @param index {number}
         * @returns {DisplayObject}
         */
        __egretProto__.addChildAt = function (child, index) {
            this.throwNotSupportedError();
            return null;
        };
        /**
         * @method egret.ScrollView#removeChild
         * @deprecated
         * @param child {DisplayObject}
         * @returns {DisplayObject}
         */
        __egretProto__.removeChild = function (child) {
            this.throwNotSupportedError();
            return null;
        };
        /**
         * @method egret.ScrollView#removeChildAt
         * @deprecated
         * @param index {number}
         * @returns {DisplayObject}
         */
        __egretProto__.removeChildAt = function (index) {
            this.throwNotSupportedError();
            return null;
        };
        /**
         * @method egret.ScrollView#setChildIndex
         * @deprecated
         * @param child {DisplayObject}
         * @param index {number}
         */
        __egretProto__.setChildIndex = function (child, index) {
            this.throwNotSupportedError();
        };
        /**
         * @method egret.ScrollView#swapChildren
         * @deprecated
         * @param child1 {DisplayObject}
         * @param child2 {DisplayObject}
         */
        __egretProto__.swapChildren = function (child1, child2) {
            this.throwNotSupportedError();
        };
        /**
         * @method egret.ScrollView#swapChildrenAt
         * @deprecated
         * @param index1 {number}
         * @param index2 {number}
         */
        __egretProto__.swapChildrenAt = function (index1, index2) {
            this.throwNotSupportedError();
        };
        __egretProto__.hitTest = function (x, y, ignoreTouchEnabled) {
            if (ignoreTouchEnabled === void 0) { ignoreTouchEnabled = false; }
            var childTouched = _super.prototype.hitTest.call(this, x, y, ignoreTouchEnabled);
            if (childTouched)
                return childTouched;
            return egret.DisplayObject.prototype.hitTest.call(this, x, y, ignoreTouchEnabled);
        };
        ScrollView.weight = [1, 1.33, 1.66, 2, 2.33];
        return ScrollView;
    })(egret.DisplayObjectContainer);
    egret.ScrollView = ScrollView;
    ScrollView.prototype.__class__ = "egret.ScrollView";
})(egret || (egret = {}));
