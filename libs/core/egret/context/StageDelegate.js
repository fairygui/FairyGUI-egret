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
     * @class egret.StageDelegate
     * @classdesc
     * StageDelegate负责处理屏幕适配策略
     * @extends egret.HashObject
     * @private
     */
    var StageDelegate = (function (_super) {
        __extends(StageDelegate, _super);
        /**
         * @method egret.StageDelegate#constructor
         */
        function StageDelegate() {
            _super.call(this);
            this._designWidth = 0;
            this._designHeight = 0;
            this._scaleX = 1;
            this._scaleY = 1;
            this._offSetY = 0;
            this._stageWidth = 0;
            this._stageHeight = 0;
        }
        var __egretProto__ = StageDelegate.prototype;
        /**
         * @method egret.StageDelegate.getInstance
         * @returns {StageDelegate}
         */
        StageDelegate.getInstance = function () {
            if (StageDelegate.instance == null) {
                ContainerStrategy.initialize();
                StageDelegate.instance = new StageDelegate();
            }
            return StageDelegate.instance;
        };
        /**
         * 设置舞台的宽高
         * @method egret.StageDelegate#setDesignSize
         * @param width {number}
         * @param height {number}
         */
        __egretProto__.setDesignSize = function (width, height) {
            this._designWidth = width;
            this._designHeight = height;
            if (arguments[2]) {
                egret.Logger.warningWithErrorId(1001);
                var resolutionPolicy = arguments[2];
                this._setResolutionPolicy(resolutionPolicy);
            }
        };
        /**
         * @param resolutionPolic {any}
         */
        __egretProto__._setResolutionPolicy = function (resolutionPolicy) {
            this._resolutionPolicy = resolutionPolicy;
            resolutionPolicy.init(this);
            resolutionPolicy._apply(this, this._designWidth, this._designHeight);
        };
        /**
         * @method egret.StageDelegate#getScaleX
         */
        __egretProto__.getScaleX = function () {
            return this._scaleX;
        };
        /**
         * @method egret.StageDelegate#getScaleY
         */
        __egretProto__.getScaleY = function () {
            return this._scaleY;
        };
        /**
         * @method egret.StageDelegate#getOffSetY
         */
        __egretProto__.getOffSetY = function () {
            return this._offSetY;
        };
        /**
         * @deprecated
         */
        StageDelegate.canvas_name = "egretCanvas";
        /**
         */
        StageDelegate.egret_root_div = "gameDiv";
        StageDelegate.canvas_div_name = "canvasDiv";
        return StageDelegate;
    })(egret.HashObject);
    egret.StageDelegate = StageDelegate;
    StageDelegate.prototype.__class__ = "egret.StageDelegate";
    /**
     * @private
     */
    var ResolutionPolicy = (function () {
        function ResolutionPolicy(containerStg, contentStg) {
            this._containerStrategy = containerStg;
            this._contentStrategy = contentStg;
        }
        var __egretProto__ = ResolutionPolicy.prototype;
        /**
         * @method egret.ResolutionPolicy#init
         * @param view {egret.StageDelegate}
         */
        __egretProto__.init = function (view) {
            this._containerStrategy.init(view);
            this._contentStrategy.init(view);
        };
        /**
         * @method egret.ResolutionPolicy#_apply
         * @param view {any}
         * @param designedResolutionWidth {any}
         * @param designedResolutionHeigh {any}
         */
        __egretProto__._apply = function (view, designedResolutionWidth, designedResolutionHeight) {
            this._containerStrategy._apply(view, designedResolutionWidth, designedResolutionHeight);
            this._contentStrategy._apply(view, designedResolutionWidth, designedResolutionHeight);
        };
        return ResolutionPolicy;
    })();
    egret.ResolutionPolicy = ResolutionPolicy;
    ResolutionPolicy.prototype.__class__ = "egret.ResolutionPolicy";
    /**
     * @private
     */
    var ContainerStrategy = (function () {
        function ContainerStrategy() {
        }
        var __egretProto__ = ContainerStrategy.prototype;
        /**
         * @method egret.ContainerStrategy.initialize
         */
        ContainerStrategy.initialize = function () {
            ContainerStrategy.EQUAL_TO_FRAME = new EqualToFrame();
        };
        /**
         * @method egret.ContainerStrategy#init
         * @param vie {any}
         */
        __egretProto__.init = function (view) {
        };
        /**
         * @method egret.ContainerStrategy#_apply
         * @param view {any}
         * @param designedWidth {any}
         * @param designedHeigh {any}
         */
        __egretProto__._apply = function (view, designedWidth, designedHeight) {
        };
        __egretProto__._setupContainer = function () {
            var body = document.body, style;
            if (body && (style = body.style)) {
                style.paddingTop = style.paddingTop || "0px";
                style.paddingRight = style.paddingRight || "0px";
                style.paddingBottom = style.paddingBottom || "0px";
                style.paddingLeft = style.paddingLeft || "0px";
                style.borderTop = style.borderTop || "0px";
                style.borderRight = style.borderRight || "0px";
                style.borderBottom = style.borderBottom || "0px";
                style.borderLeft = style.borderLeft || "0px";
                style.marginTop = style.marginTop || "0px";
                style.marginRight = style.marginRight || "0px";
                style.marginBottom = style.marginBottom || "0px";
                style.marginLeft = style.marginLeft || "0px";
            }
        };
        return ContainerStrategy;
    })();
    egret.ContainerStrategy = ContainerStrategy;
    ContainerStrategy.prototype.__class__ = "egret.ContainerStrategy";
    /**
     * @classdesc
     * @extends egret.ContainerStrategy
     * @private
     */
    var EqualToFrame = (function (_super) {
        __extends(EqualToFrame, _super);
        function EqualToFrame() {
            _super.apply(this, arguments);
        }
        var __egretProto__ = EqualToFrame.prototype;
        __egretProto__._apply = function (view) {
            this._setupContainer();
        };
        return EqualToFrame;
    })(ContainerStrategy);
    egret.EqualToFrame = EqualToFrame;
    EqualToFrame.prototype.__class__ = "egret.EqualToFrame";
    /**
     * @private
     */
    var ContentStrategy = (function () {
        function ContentStrategy() {
        }
        var __egretProto__ = ContentStrategy.prototype;
        /**
         * @method egret.ContentStrategy#init
         * @param vie {any}
         */
        __egretProto__.init = function (view) {
        };
        /**
         * @method egret.ContentStrategy#_apply
         * @param delegate {egret.StageDelegate}
         * @param designedResolutionWidth {number}
         * @param designedResolutionHeight {number}
         */
        __egretProto__._apply = function (delegate, designedResolutionWidth, designedResolutionHeight) {
        };
        __egretProto__.setEgretSize = function (w, h, styleW, styleH, left, top) {
            if (left === void 0) { left = 0; }
            if (top === void 0) { top = 0; }
            egret.StageDelegate.getInstance()._stageWidth = Math.round(w);
            egret.StageDelegate.getInstance()._stageHeight = Math.round(h);
            var canvasDiv = document.getElementById(StageDelegate.canvas_div_name);
            var container = document.getElementById(StageDelegate.egret_root_div);
            if (!canvasDiv) {
                canvasDiv = egret.Browser.getInstance().$new("div");
                canvasDiv.id = StageDelegate.canvas_div_name;
                container.appendChild(canvasDiv);
            }
            canvasDiv.style.width = styleW + "px";
            canvasDiv.style.height = styleH + "px";
            container.style.width = styleW + "px";
            container.style.height = styleH + "px";
            container.style.top = top + "px";
        };
        /**
         * 显示区域分辨率宽
         * @returns {number}
         */
        __egretProto__._getClientWidth = function () {
            return document.documentElement.clientWidth;
        };
        /**
         * 显示区域分辨率高
         * @returns {number}
         */
        __egretProto__._getClientHeight = function () {
            return document.documentElement.clientHeight;
        };
        return ContentStrategy;
    })();
    egret.ContentStrategy = ContentStrategy;
    ContentStrategy.prototype.__class__ = "egret.ContentStrategy";
    /**
     * @class egret.FixedHeight
     * @classdesc
     * @extends egret.ContentStrategy
     * @private
     */
    var FixedHeight = (function (_super) {
        __extends(FixedHeight, _super);
        /**
         * 构造函数
         * @param minWidth 最终游戏内适配的最小stageWidth，默认没有最小宽度
         */
        function FixedHeight(minWidth) {
            if (minWidth === void 0) { minWidth = 0; }
            _super.call(this);
            this.minWidth = NaN;
            this.minWidth = minWidth;
        }
        var __egretProto__ = FixedHeight.prototype;
        /**
         * @method egret.FixedHeight#_apply
         * @param delegate {any}
         * @param designedResolutionWidth {any}
         * @param designedResolutionHeight {any}
         */
        __egretProto__._apply = function (delegate, designedResolutionWidth, designedResolutionHeight) {
            var viewPortWidth = this._getClientWidth(); //分辨率宽
            var viewPortHeight = this._getClientHeight(); //分辨率高
            var scale = viewPortHeight / designedResolutionHeight;
            var designW = viewPortWidth / scale;
            var designH = designedResolutionHeight;
            var scale2 = 1;
            if (this.minWidth != 0) {
                scale2 = Math.min(1, designW / this.minWidth);
            }
            this.setEgretSize(designW / scale2, designH, viewPortWidth, viewPortHeight * scale2);
            delegate._scaleX = scale * scale2;
            delegate._scaleY = scale * scale2;
        };
        return FixedHeight;
    })(ContentStrategy);
    egret.FixedHeight = FixedHeight;
    FixedHeight.prototype.__class__ = "egret.FixedHeight";
    /**
     * @class egret.FixedWidth
     * @classdesc
     * @extends egret.ContentStrategy
     * @private
     */
    var FixedWidth = (function (_super) {
        __extends(FixedWidth, _super);
        /**
         * 构造函数
         * @param minHeight 最终游戏内适配的最小stageHeight，默认没有最小高度
         */
        function FixedWidth(minHeight) {
            if (minHeight === void 0) { minHeight = 0; }
            _super.call(this);
            this.minHeight = NaN;
            this.minHeight = minHeight;
        }
        var __egretProto__ = FixedWidth.prototype;
        __egretProto__._apply = function (delegate, designedResolutionWidth, designedResolutionHeight) {
            var viewPortWidth = this._getClientWidth(); //分辨率宽
            var viewPortHeight = this._getClientHeight(); //分辨率高
            var scale = viewPortWidth / designedResolutionWidth;
            var designW = designedResolutionWidth;
            var designH = viewPortHeight / scale;
            var scale2 = 1;
            if (this.minHeight != 0) {
                scale2 = Math.min(1, designH / this.minHeight);
            }
            var offsetX = viewPortWidth * (1 - scale2) / 2;
            this.setEgretSize(designW, designH / scale2, viewPortWidth * scale2, viewPortHeight, offsetX);
            delegate._scaleX = scale * scale2;
            delegate._scaleY = scale * scale2;
        };
        return FixedWidth;
    })(ContentStrategy);
    egret.FixedWidth = FixedWidth;
    FixedWidth.prototype.__class__ = "egret.FixedWidth";
    /**
     * @class egret.FixedSize
     * @classdesc
     * @extends egret.ContentStrategy
     * @private
     */
    var FixedSize = (function (_super) {
        __extends(FixedSize, _super);
        function FixedSize(width, height) {
            _super.call(this);
            this.width = width;
            this.height = height;
        }
        var __egretProto__ = FixedSize.prototype;
        /**
         * @method egret.FixedSize#_apply
         * @param delegate {egret.StageDelegate}
         * @param designedResolutionWidth {number}
         * @param designedResolutionHeight {number}
         */
        __egretProto__._apply = function (delegate, designedResolutionWidth, designedResolutionHeight) {
            var viewPortWidth = this.width;
            var viewPortHeight = this.height;
            var scale = viewPortWidth / designedResolutionWidth;
            this.setEgretSize(designedResolutionWidth, viewPortHeight / scale, viewPortWidth, viewPortHeight);
            delegate._scaleX = scale;
            delegate._scaleY = scale;
        };
        return FixedSize;
    })(ContentStrategy);
    egret.FixedSize = FixedSize;
    FixedSize.prototype.__class__ = "egret.FixedSize";
    /**
     * @class egret.NoScale
     * @classdesc
     * @extends egret.ContentStrategy
     * @private
     */
    var NoScale = (function (_super) {
        __extends(NoScale, _super);
        function NoScale() {
            _super.call(this);
        }
        var __egretProto__ = NoScale.prototype;
        /**
         * @method egret.NoScale#_apply
         * @param delegate {egret.StageDelegate}
         * @param designedResolutionWidth {number}
         * @param designedResolutionHeight {number}
         */
        __egretProto__._apply = function (delegate, designedResolutionWidth, designedResolutionHeight) {
            var offsetX = Math.floor((designedResolutionWidth - designedResolutionWidth) / 2);
            this.setEgretSize(designedResolutionWidth, designedResolutionHeight, designedResolutionWidth, designedResolutionHeight, offsetX);
            delegate._scaleX = 1;
            delegate._scaleY = 1;
        };
        return NoScale;
    })(ContentStrategy);
    egret.NoScale = NoScale;
    NoScale.prototype.__class__ = "egret.NoScale";
    /**
     * @private
     */
    var ShowAll = (function (_super) {
        __extends(ShowAll, _super);
        function ShowAll() {
            _super.call(this);
        }
        var __egretProto__ = ShowAll.prototype;
        /**
         * @method egret.NoScale#_apply
         * @param delegate {egret.StageDelegate}
         * @param designedResolutionWidth {number}
         * @param designedResolutionHeight {number}
         */
        __egretProto__._apply = function (delegate, designedResolutionWidth, designedResolutionHeight) {
            var clientWidth = this._getClientWidth(); //分辨率宽
            var clientHeight = this._getClientHeight(); //分辨率宽
            var viewPortWidth = clientWidth;
            var viewPortHeight = clientHeight;
            var scale = (viewPortWidth / designedResolutionWidth < viewPortHeight / designedResolutionHeight) ? viewPortWidth / designedResolutionWidth : viewPortHeight / designedResolutionHeight;
            var designW = designedResolutionWidth;
            var designH = designedResolutionHeight;
            var viewPortWidth = designW * scale;
            var viewPortHeight = designH * scale;
            var scale2 = 1;
            var offsetX = Math.floor((clientWidth - viewPortWidth) / 2);
            delegate._offSetY = Math.floor((clientHeight - viewPortHeight) / 2);
            this.setEgretSize(designW, designH / scale2, viewPortWidth * scale2, viewPortHeight, offsetX, delegate._offSetY);
            delegate._scaleX = scale * scale2;
            delegate._scaleY = scale * scale2;
        };
        return ShowAll;
    })(ContentStrategy);
    egret.ShowAll = ShowAll;
    ShowAll.prototype.__class__ = "egret.ShowAll";
    /**
     * @private
     */
    var FullScreen = (function (_super) {
        __extends(FullScreen, _super);
        function FullScreen() {
            _super.call(this);
        }
        var __egretProto__ = FullScreen.prototype;
        /**
         * @method egret.NoScale#_apply
         * @param delegate {egret.StageDelegate}
         * @param designedResolutionWidth {number}
         * @param designedResolutionHeight {number}
         */
        __egretProto__._apply = function (delegate, designedResolutionWidth, designedResolutionHeight) {
            var viewPortWidth = this._getClientWidth(); //分辨率宽
            var viewPortHeight = this._getClientHeight(); //分辨率高
            var designW = designedResolutionWidth;
            var designH = designedResolutionHeight;
            var scalex = viewPortWidth / designedResolutionWidth;
            var scaley = viewPortHeight / designedResolutionHeight;
            viewPortWidth = designW * scalex;
            viewPortHeight = designH * scaley;
            this.setEgretSize(designW, designH, viewPortWidth, viewPortHeight);
            delegate._scaleX = scalex;
            delegate._scaleY = scaley;
        };
        return FullScreen;
    })(ContentStrategy);
    egret.FullScreen = FullScreen;
    FullScreen.prototype.__class__ = "egret.FullScreen";
})(egret || (egret = {}));
