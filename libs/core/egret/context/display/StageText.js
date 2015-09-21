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
     * @classdesc
     * @extends egret.EventDispatcher
     * @private
     */
    var StageText = (function (_super) {
        __extends(StageText, _super);
        function StageText() {
            _super.call(this);
            this._scaleX = 1;
            this._scaleY = 1;
            this._size = 30;
            this._color = "#FFFFFF";
            this._fontFamily = "Arial";
            this._bold = false;
            this._italic = false;
            this._textAlign = "left";
            this._verticalAlign = "top";
            this._visible = false;
            this._width = 0;
            this._height = 0;
            this._multiline = false;
            this._maxChars = 0;
        }
        var __egretProto__ = StageText.prototype;
        __egretProto__._setTextField = function (textfield) {
            this._textfield = textfield;
        };
        /**
         * @returns {string}
         */
        __egretProto__._getText = function () {
            return null;
        };
        /**
         * @param value {string}
         */
        __egretProto__._setText = function (value) {
        };
        /**
         * @param type {string}
         */
        __egretProto__._setTextType = function (type) {
        };
        /**
         * @returns {string}
         */
        __egretProto__._getTextType = function () {
            return null;
        };
        __egretProto__._show = function (multiline, size, width, height) {
        };
        __egretProto__._add = function () {
        };
        __egretProto__._remove = function () {
        };
        __egretProto__._hide = function () {
        };
        __egretProto__._addListeners = function () {
        };
        __egretProto__._removeListeners = function () {
        };
        __egretProto__._setScale = function (x, y) {
            this._scaleX = x;
            this._scaleY = y;
        };
        __egretProto__.changePosition = function (x, y) {
        };
        __egretProto__._setSize = function (value) {
            this._size = value;
        };
        __egretProto__._setTextColor = function (value) {
            this._color = value;
        };
        __egretProto__._setTextFontFamily = function (value) {
            this._fontFamily = value;
        };
        __egretProto__._setBold = function (value) {
            this._bold = value;
        };
        __egretProto__._setItalic = function (value) {
            this._italic = value;
        };
        __egretProto__._setTextAlign = function (value) {
            this._textAlign = value;
        };
        __egretProto__._setVerticalAlign = function (value) {
            this._verticalAlign = value;
        };
        __egretProto__._setVisible = function (value) {
            this._visible = value;
        };
        __egretProto__._setWidth = function (value) {
            this._width = value;
        };
        __egretProto__._setHeight = function (value) {
            this._height = value;
        };
        __egretProto__._setMultiline = function (value) {
            this._multiline = value;
        };
        __egretProto__._setMaxChars = function (value) {
            this._maxChars = value;
        };
        __egretProto__._resetStageText = function () {
        };
        __egretProto__._initElement = function (x, y, cX, cY) {
        };
        __egretProto__._removeInput = function () {
        };
        StageText.create = function () {
            return null;
        };
        return StageText;
    })(egret.EventDispatcher);
    egret.StageText = StageText;
    StageText.prototype.__class__ = "egret.StageText";
})(egret || (egret = {}));
