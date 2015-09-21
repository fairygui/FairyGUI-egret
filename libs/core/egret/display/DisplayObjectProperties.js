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
     * @private
     */
    var DisplayObjectProperties = (function () {
        function DisplayObjectProperties() {
            this._name = null;
            this._explicitWidth = NaN;
            this._explicitHeight = NaN;
            this._x = 0;
            this._y = 0;
            this._scaleX = 1;
            this._scaleY = 1;
            this._anchorOffsetX = 0;
            this._anchorOffsetY = 0;
            this._anchorX = 0;
            this._anchorY = 0;
            this._rotation = 0;
            this._alpha = 1;
            this._skewX = 0;
            this._skewY = 0;
            this._blendMode = null;
            this._touchEnabled = DisplayObjectProperties.defaultTouchEnabled;
            this._visible = true;
            this._worldAlpha = 1;
            this._scrollRect = null;
            this._cacheAsBitmap = false;
            this._parent = null;
            this._stage = null;
            this._needDraw = false;
            /**
             * beta功能，请勿调用此方法
             */
            this._filters = null;
            this._hasWidthSet = false;
            this._hasHeightSet = false;
            this._normalDirty = true;
            //对宽高有影响
            this._sizeDirty = true;
            this._isContainer = false;
        }
        var __egretProto__ = DisplayObjectProperties.prototype;
        /**
         * 每个显示对象初始化时默认的 touchEnabled 属性值
         * @default false
         */
        DisplayObjectProperties.defaultTouchEnabled = false;
        return DisplayObjectProperties;
    })();
    egret.DisplayObjectProperties = DisplayObjectProperties;
    DisplayObjectProperties.prototype.__class__ = "egret.DisplayObjectProperties";
})(egret || (egret = {}));
