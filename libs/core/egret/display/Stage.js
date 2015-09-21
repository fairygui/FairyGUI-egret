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
     * @class egret.Stage
     * @classdesc
     * * Stage 类代表主绘图区，表示显示 Egret 内容的整个区域。
     * 可以以全局方式访问 Stage 对象(egret.MainContext.instance.stage)。也可以利用 DisplayObject 实例的 stage 属性进行访问。
     * Stage 类具有多个祖代类 -- DisplayObjectContainer、DisplayObject 和 EventDispatcher，属性和方法便是从这些类继承而来的。从这些继承的许多属性和方法不适用于 Stage 对象。
     * @link http://docs.egret-labs.org/jksubj/scalemode.html 理解Egret中的各种屏幕适配策略并做出选择
     */
    var Stage = (function (_super) {
        __extends(Stage, _super);
        /**
         * 创建一个 egret.Stage 对象
         * @param width {number} 舞台宽度
         * @param height {number} 舞台高度
         */
        function Stage(width, height) {
            if (width === void 0) { width = 480; }
            if (height === void 0) { height = 800; }
            _super.call(this);
            /**
             * 是否会派发 RESIZE 事件
             */
            this._changeSizeDispatchFlag = true;
            this._scaleMode = "";
            this._stageWidth = NaN;
            this._stageHeight = NaN;
            this.touchEnabled = true;
            this._DO_Props_._stage = this;
            this._stageWidth = width;
            this._stageHeight = height;
        }
        var __egretProto__ = Stage.prototype;
        /**
         * 调用 invalidate() 方法后，在显示列表下次呈现时，Egret 会向每个已注册侦听 render 事件的显示对象发送一个 render 事件。
         * 每次您希望 Egret 发送 render 事件时，都必须调用 invalidate() 方法。
         * @method egret.Stage#invalidate
         */
        __egretProto__.invalidate = function () {
            Stage._invalidateRenderFlag = true;
        };
        Object.defineProperty(__egretProto__, "scaleMode", {
            /**
             * 屏幕适配策略，可以通过 egret.Stage.registerScaleMode 方法扩展
             * 一个 StageScaleMode 类中指定要使用哪种缩放模式的值。以下是有效值：
             * StageScaleMode.EXACT_FIT -- 整个应用程序在指定区域中可见，但不尝试保持原始高宽比。可能会发生扭曲，应用程序可能会拉伸或压缩显示。
             * StageScaleMode.SHOW_ALL -- 整个应用程序在指定区域中可见，且不发生扭曲，同时保持应用程序的原始高宽比。应用程序的可能会显示边框。
             * StageScaleMode.NO_BORDER -- 整个应用程序填满指定区域，不发生扭曲，但有可能进行一些裁切，同时保持应用程序的原始高宽比。
             * StageScaleMode.NO_SCALE -- 整个应用程序的大小固定，因此，即使播放器窗口的大小更改，它也会保持不变。如果播放器窗口比内容小，则可能进行一些裁切。
             * @member {number} egret.Stage#scaleMode
             */
            get: function () {
                return this._scaleMode;
            },
            set: function (value) {
                if (this._scaleMode != value) {
                    this._scaleMode = value;
                    this.setResolutionPolicy();
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 当屏幕尺寸改变时调用
         * @method egret.Stage#changeSize
         */
        __egretProto__.changeSize = function () {
            if (!this._changeSizeDispatchFlag) {
                return;
            }
            //重新设置屏幕适配策略
            this.setResolutionPolicy();
            //触发Event.RESIZE事件
            this.dispatchEventWith(egret.Event.RESIZE);
        };
        /**
         * 设置屏幕适配策略
         */
        __egretProto__.setResolutionPolicy = function () {
            var content = Stage.SCALE_MODE_ENUM[this._scaleMode];
            if (!content) {
                throw new Error(egret.getString(1024));
            }
            var container = new egret.EqualToFrame();
            var policy = new egret.ResolutionPolicy(container, content);
            egret.StageDelegate.getInstance()._setResolutionPolicy(policy);
            this._stageWidth = egret.StageDelegate.getInstance()._stageWidth;
            this._stageHeight = egret.StageDelegate.getInstance()._stageHeight;
        };
        Object.defineProperty(__egretProto__, "stageWidth", {
            /**
             * 舞台宽度（坐标系宽度，非设备宽度）
             * @member {number} egret.Stage#stageWidth
             */
            get: function () {
                return this._stageWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "stageHeight", {
            /**
             * 舞台高度（坐标系高度，非设备高度）
             * @member {number} egret.Stage#stageHeight
             */
            get: function () {
                return this._stageHeight;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @member egret.Stage#hitTest
         * @see egret.DisplayObject#hitTest
         * @param x
         * @param y
         * @returns {egret.DisplayObject}
         */
        __egretProto__.hitTest = function (x, y, ignoreTouchEnabled) {
            if (ignoreTouchEnabled === void 0) { ignoreTouchEnabled = false; }
            if (!this._DO_Props_._touchEnabled) {
                return null;
            }
            var result;
            if (!this._touchChildren) {
                return this;
            }
            var children = this._children;
            var l = children.length;
            for (var i = l - 1; i >= 0; i--) {
                var child = children[i];
                var mtx = child._getMatrix();
                var scrollRect = child.scrollRect;
                if (scrollRect) {
                    mtx.append(1, 0, 0, 1, -scrollRect.x, -scrollRect.y);
                }
                mtx.invert();
                var point = egret.Matrix.transformCoords(mtx, x, y);
                result = child.hitTest(point.x, point.y, true);
                if (result) {
                    if (result.touchEnabled) {
                        return result;
                    }
                }
            }
            return this;
        };
        /**
         * 返回舞台尺寸范围
         * @member egret.Stage#getBounds
         * @see egret.DisplayObject#getBounds
         * @param resultRect {egret.Rectangle} 可选参数，传入用于保存结果的Rectangle对象，避免重复创建对象。
         * @returns {egret.Rectangle}
         */
        __egretProto__.getBounds = function (resultRect) {
            if (!resultRect) {
                resultRect = new egret.Rectangle();
            }
            return resultRect.initialize(0, 0, this._stageWidth, this._stageHeight);
        };
        __egretProto__._updateTransform = function () {
            for (var i = 0, length = this._children.length; i < length; i++) {
                var child = this._children[i];
                child._updateTransform();
            }
        };
        Object.defineProperty(__egretProto__, "focus", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 设置屏幕适配模式
         * @param key {string} 键值
         * @param value {egret.ContentStrategy} 适配模式
         * @param override {boolean} 是否覆盖
         * @method egret.Stage#registerScaleMode
         * @private
         */
        Stage.registerScaleMode = function (key, value, override) {
            if (Stage.SCALE_MODE_ENUM[key] && !override) {
                egret.Logger.warningWithErrorId(1009, key);
            }
            else {
                Stage.SCALE_MODE_ENUM[key] = value;
            }
        };
        Stage._invalidateRenderFlag = false;
        Stage.SCALE_MODE_ENUM = {};
        return Stage;
    })(egret.DisplayObjectContainer);
    egret.Stage = Stage;
    Stage.prototype.__class__ = "egret.Stage";
})(egret || (egret = {}));
egret.Stage.SCALE_MODE_ENUM[egret.StageScaleMode.NO_SCALE] = new egret.NoScale();
egret.Stage.SCALE_MODE_ENUM[egret.StageScaleMode.SHOW_ALL] = new egret.ShowAll();
egret.Stage.SCALE_MODE_ENUM[egret.StageScaleMode.NO_BORDER] = new egret.FixedWidth();
egret.Stage.SCALE_MODE_ENUM[egret.StageScaleMode.EXACT_FIT] = new egret.FullScreen();
