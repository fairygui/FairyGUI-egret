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
     * @class egret.TouchEvent
     * @classdesc
     * 使用 TouchEvent 类，您可以处理设备上那些检测用户与设备之间的接触的事件。
     * 当用户与带有触摸屏的移动电话或平板电脑等设备交互时，用户通常使用手指或指针设备接触屏幕。可使用 TouchEvent 类开发响应基本触摸事件（如单个手指点击）的应用程序。
     * 使用此类中定义的事件类型创建事件侦听器。
     * 注意：当对象嵌套在显示列表中时，触摸事件的目标将是显示列表中可见的最深的可能嵌套对象。此对象称为目标节点。要使目标节点的祖代（祖代是一个包含显示列表中所有目标节点的对象，从舞台到目标节点的父节点均包括在内）接收触摸事件的通知，请对祖代节点使用 EventDispatcher.addEventListener() 并将 type 参数设置为要检测的特定触摸事件。
     * @link http://docs.egret-labs.org/post/manual/event/touchevent.html 触摸事件
     */
    var TouchEvent = (function (_super) {
        __extends(TouchEvent, _super);
        /**
         * 创建一个 egret.TouchEvent 对象，其中包含有关Touch事件的信息
         * @constructor egret.TouchEvent
         * @param type {string} 事件的类型，可以作为 Event.type 访问。
         * @param bubbles {boolean} 确定 Event 对象是否参与事件流的冒泡阶段。默认值为 false。
         * @param cancelable {boolean} 确定是否可以取消 Event 对象。默认值为 false。
         * @param touchPointID {number} 分配给触摸点的唯一标识号
         * @param stageX {number} 事件发生点在全局舞台坐标中的水平坐标
         * @param stageY {number} 事件发生点在全局舞台坐标中的垂直坐标
         * @param ctrlKey {boolean}
         * @param altKey {boolean}
         * @param shiftKey {boolean}
         * @param touchDown {boolean}
         */
        function TouchEvent(type, bubbles, cancelable, touchPointID, stageX, stageY, ctrlKey, altKey, shiftKey, touchDown) {
            if (bubbles === void 0) { bubbles = true; }
            if (cancelable === void 0) { cancelable = true; }
            if (touchPointID === void 0) { touchPointID = 0; }
            if (stageX === void 0) { stageX = 0; }
            if (stageY === void 0) { stageY = 0; }
            if (ctrlKey === void 0) { ctrlKey = false; }
            if (altKey === void 0) { altKey = false; }
            if (shiftKey === void 0) { shiftKey = false; }
            if (touchDown === void 0) { touchDown = false; }
            _super.call(this, type, bubbles, cancelable);
            this._stageX = 0;
            this._stageY = 0;
            /**
             * 分配给触摸点的唯一标识号
             * @member {number} egret.TouchEvent#touchPointID
             */
            this.touchPointID = NaN;
            /**
             * 事件发生时ctrl键是否被按下。 (Mac OS下为 Cmd 或 Ctrl)
             * @deprecated
             * @member {boolean} egret.TouchEvent#ctrlKey
             */
            this.ctrlKey = false;
            /**
             * 事件发生时shift键是否被按下。
             * @deprecated
             * @member {boolean} egret.TouchEvent#shiftKey
             */
            this.shiftKey = false;
            /**
             * 事件发生时alt键是否被按下。
             * @deprecated
             * @member {boolean} egret.TouchEvent#altKey
             */
            this.altKey = false;
            /**
             * 表示触摸已按下 (true) 还是未按下 (false)。
             * @member {boolean} egret.TouchEvent#touchDown
             */
            this.touchDown = false;
            this.touchPointID = touchPointID;
            this._stageX = stageX;
            this._stageY = stageY;
            this.ctrlKey = ctrlKey;
            this.altKey = altKey;
            this.touchDown = touchDown;
        }
        var __egretProto__ = TouchEvent.prototype;
        Object.defineProperty(__egretProto__, "stageX", {
            /**
             * 事件发生点在全局舞台坐标中的水平坐标。
             * @member {number} egret.TouchEvent#stageX
             */
            get: function () {
                return this._stageX;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "stageY", {
            /**
             * 事件发生点在全局舞台坐标中的垂直坐标。
             * @member {number} egret.TouchEvent#stageY
             */
            get: function () {
                return this._stageY;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "localX", {
            /**
             * 事件发生点相对于currentTarget的水平坐标。
             * @member {number} egret.TouchEvent#localX
             */
            get: function () {
                var dp = this._currentTarget;
                var point = dp.globalToLocal(this._stageX, this._stageY, egret.Point.identity);
                return point.x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "localY", {
            /**
             * 事件发生点相对于currentTarget的垂直坐标。
             * @member {number} egret.TouchEvent#localY
             */
            get: function () {
                var dp = this._currentTarget;
                var point = dp.globalToLocal(this._stageX, this._stageY, egret.Point.identity);
                return point.y;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 使用指定的EventDispatcher对象来抛出Event事件对象。抛出的对象将会缓存在对象池上，供下次循环复用。
         * @method egret.TouchEvent.dispatchTouchEvent
         * @param target {egret.IEventDispatcher} 派发事件目标
         * @param type {string} 事件类型
         * @param touchPointID {number} 分配给触摸点的唯一标识号
         * @param stageX {number} 事件发生点在全局舞台坐标中的水平坐标
         * @param stageY {number} 事件发生点在全局舞台坐标中的垂直坐标
         * @param ctrlKey {boolean}
         * @param altKey {boolean}
         * @param shiftKey {boolean}
         * @param touchDown {boolean}
         */
        TouchEvent.dispatchTouchEvent = function (target, type, touchPointID, stageX, stageY, ctrlKey, altKey, shiftKey, touchDown) {
            if (touchPointID === void 0) { touchPointID = 0; }
            if (stageX === void 0) { stageX = 0; }
            if (stageY === void 0) { stageY = 0; }
            if (ctrlKey === void 0) { ctrlKey = false; }
            if (altKey === void 0) { altKey = false; }
            if (shiftKey === void 0) { shiftKey = false; }
            if (touchDown === void 0) { touchDown = false; }
            var eventClass = TouchEvent;
            var props = egret.Event._getPropertyData(eventClass);
            props.touchPointID = touchPointID;
            props._stageX = stageX;
            props._stageY = stageY;
            props.ctrlKey = ctrlKey;
            props.altKey = altKey;
            props.shiftKey = shiftKey;
            props.touchDown = touchDown;
            egret.Event._dispatchByTarget(eventClass, target, type, props, true, true);
        };
        /**
         * 轻触
         * @constant {string} egret.TouchEvent.TOUCH_TAP
         */
        TouchEvent.TOUCH_TAP = "touchTap";
        /**
         * 移动
         * @constant {string} egret.TouchEvent.TOUCH_MOVE
         */
        TouchEvent.TOUCH_MOVE = "touchMove";
        /**
         * 开始触摸
         * @constant {string} egret.TouchEvent.TOUCH_BEGIN
         */
        TouchEvent.TOUCH_BEGIN = "touchBegin";
        /**
         * 在同一对象上结束触摸
         * @constant {string} egret.TouchEvent.TOUCH_END
         */
        TouchEvent.TOUCH_END = "touchEnd";
        /**
         * 在对象外部结束触摸
         * @constant {string} egret.TouchEvent.TOUCH_RELEASE_OUTSIDE
         */
        TouchEvent.TOUCH_RELEASE_OUTSIDE = "touchReleaseOutside";
        /**
         * @deprecated
         */
        TouchEvent.TOUCH_ROLL_OUT = "touchRollOut";
        /**
         * @deprecated
         */
        TouchEvent.TOUCH_ROLL_OVER = "touchRollOver";
        /**
         * @deprecated
         */
        TouchEvent.TOUCH_OUT = "touchOut";
        /**
         * @deprecated
         */
        TouchEvent.TOUCH_OVER = "touchOver";
        return TouchEvent;
    })(egret.Event);
    egret.TouchEvent = TouchEvent;
    TouchEvent.prototype.__class__ = "egret.TouchEvent";
})(egret || (egret = {}));
