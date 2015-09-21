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
    var QQAudio = (function () {
        function QQAudio() {
            this._loop = false;
            this._currentTime = 0;
        }
        var __egretProto__ = QQAudio.prototype;
        /**
         * 播放声音
         * @method egret.Sound#play
         * @param loop {boolean} 是否循环播放，默认为false
         */
        __egretProto__._play = function (type) {
            this._type = type;
            if (type == egret.Sound.EFFECT) {
                QZAppExternal.playLocalSound(function (data) {
                    alert(JSON.stringify(data));
                }, {
                    bid: -1,
                    url: this._path,
                    loop: this._loop ? -1 : 0
                });
            }
            else {
                QZAppExternal.playLocalBackSound({
                    bid: -1,
                    url: this._path,
                    loop: this._loop ? -1 : 0
                });
            }
        };
        /**
         * 暂停声音
         * @method egret.Sound#pause
         */
        __egretProto__._pause = function () {
            if (this._type == egret.Sound.EFFECT) {
                QZAppExternal.stopSound();
            }
            else {
                QZAppExternal.stopBackSound();
            }
        };
        /**
         * 添加事件监听
         * @param type 事件类型
         * @param listener 监听函数
         */
        __egretProto__._addEventListener = function (type, listener, useCapture) {
            if (useCapture === void 0) { useCapture = false; }
        };
        /**s
         * 移除事件监听
         * @param type 事件类型
         * @param listener 监听函数
         */
        __egretProto__._removeEventListener = function (type, listener, useCapture) {
            if (useCapture === void 0) { useCapture = false; }
        };
        /**
         * 重新加载声音
         * @method egret.Sound#load
         */
        __egretProto__._load = function () {
        };
        __egretProto__._preload = function (type, callback, thisObj) {
            if (callback === void 0) { callback = null; }
            if (thisObj === void 0) { thisObj = null; }
            egret.callLater(callback, thisObj);
        };
        __egretProto__._setPath = function (path) {
            this._path = path;
        };
        /**
         * 获取当前音量值
         * @returns number
         */
        __egretProto__._getVolume = function () {
            return 1;
        };
        __egretProto__._setVolume = function (value) {
        };
        __egretProto__._setLoop = function (value) {
            this._loop = value;
        };
        __egretProto__._getCurrentTime = function () {
            return 0;
        };
        __egretProto__._setCurrentTime = function (value) {
            this._currentTime = value;
        };
        __egretProto__._destroy = function () {
        };
        return QQAudio;
    })();
    egret.QQAudio = QQAudio;
    QQAudio.prototype.__class__ = "egret.QQAudio";
})(egret || (egret = {}));
