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
    var Html5Audio = (function () {
        /**
         * audio音频对象
         * @member {any} egret.Sound#audio
         */
        function Html5Audio() {
            this._loop = false;
            this.paused = true;
            this._listeners = [];
            this._onEndedCall = null;
            this._volume = 1;
            this._startTime = 0;
        }
        var __egretProto__ = Html5Audio.prototype;
        /**
         * 播放声音
         * @method egret.Sound#play
         * @param loop {boolean} 是否循环播放，默认为false
         */
        __egretProto__._play = function (type) {
            this.removeListeners();
            if (egret.Html5Capatibility._System_OS != egret.SystemOSType.WPHONE) {
                this._audio = this._audio.cloneNode();
            }
            this.paused = false;
            this._audio.autoplay = true;
            this._audio.volume = this._volume;
            //this._audio.load();
            var self = this;
            var func = function (e) {
                self._audio.removeEventListener("ended", func);
                if (self._onEndedCall) {
                    self._onEndedCall.call(null, e);
                }
                self.clear();
            };
            this._audio.addEventListener("ended", func);
            this.initStart();
            try {
                this._audio.currentTime = this._startTime;
            }
            catch (e) {
            }
            finally {
                this._audio.play();
            }
        };
        __egretProto__.clear = function () {
            try {
                this._audio.pause();
            }
            catch (e) {
            }
            finally {
                this.removeListeners();
                if (this._loop && !this.paused)
                    this._play();
            }
        };
        /**
         * 暂停声音
         * @method egret.Sound#pause
         */
        __egretProto__._pause = function () {
            this.paused = true;
            this._audio.pause();
        };
        /**
         * 重新加载声音
         * @method egret.Sound#load
         */
        __egretProto__._load = function () {
            this._audio.load();
        };
        __egretProto__._setAudio = function (audio) {
            this._audio = audio;
        };
        __egretProto__.initStart = function () {
            var self = this;
            for (var i = 0; i < self._listeners.length; i++) {
                var bin = self._listeners[i];
                this._audio.addEventListener(bin.type, bin.listener, bin.useCapture);
            }
        };
        /**
         * 添加事件监听
         * @param type 事件类型
         * @param listener 监听函数
         */
        __egretProto__._addEventListener = function (type, listener, useCapture) {
            if (useCapture === void 0) { useCapture = false; }
            if (type == "ended") {
                this._onEndedCall = listener;
                return;
            }
            this._listeners.push({ type: type, listener: listener, useCapture: useCapture });
            if (this._audio) {
                this._audio.addEventListener(type, listener, useCapture);
            }
        };
        __egretProto__.removeListeners = function () {
            var self = this;
            for (var i = 0; i < self._listeners.length; i++) {
                var bin = self._listeners[i];
                if (this._audio) {
                    this._audio.removeEventListener(bin.type, bin.listener, bin.useCapture);
                }
            }
        };
        /**
         * 移除事件监听
         * @param type 事件类型
         * @param listener 监听函数
         */
        __egretProto__._removeEventListener = function (type, listener, useCapture) {
            if (useCapture === void 0) { useCapture = false; }
            if (type == "ended") {
                this._onEndedCall = null;
                return;
            }
            var self = this;
            for (var i = 0; i < self._listeners.length; i++) {
                var bin = self._listeners[i];
                if (bin.listener == listener && bin.useCapture == useCapture && bin.type == type) {
                    self._listeners.splice(i, 1);
                    if (this._audio) {
                        this._audio.removeEventListener(type, listener, useCapture);
                    }
                    break;
                }
            }
        };
        __egretProto__._preload = function (type, callback, thisObj) {
            if (callback === void 0) { callback = null; }
            if (thisObj === void 0) { thisObj = null; }
            egret.callLater(callback, thisObj);
        };
        __egretProto__._destroy = function () {
        };
        /**
         * 获取当前音量值
         * @returns number
         */
        __egretProto__._getVolume = function () {
            return this._volume;
        };
        __egretProto__._setVolume = function (value) {
            this._volume = Math.max(0, Math.min(value, 1));
            this._audio.volume = this._volume;
        };
        __egretProto__._setLoop = function (value) {
            this._loop = value;
        };
        __egretProto__._getCurrentTime = function () {
            return this._audio.currentTime;
        };
        __egretProto__._setCurrentTime = function (value) {
            this._startTime = value;
        };
        return Html5Audio;
    })();
    egret.Html5Audio = Html5Audio;
    Html5Audio.prototype.__class__ = "egret.Html5Audio";
})(egret || (egret = {}));
