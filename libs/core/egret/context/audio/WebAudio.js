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
    var WebAudio = (function () {
        function WebAudio() {
            this.context = WebAudio.ctx;
            this.bufferSource = null;
            this.paused = true;
            this._loop = false;
            this._listeners = [];
            this._onEndedCall = null;
            this._volume = 1;
            this._startTime = 0;
            this._currentTime = 0;
            if (WebAudio.ctx["createGain"]) {
                this.gain = WebAudio.ctx["createGain"]();
            }
            else {
                this.gain = WebAudio.ctx["createGainNode"]();
            }
        }
        var __egretProto__ = WebAudio.prototype;
        WebAudio.decodeAudios = function () {
            if (WebAudio.decodeArr.length <= 0) {
                return;
            }
            if (WebAudio.isDecoding) {
                return;
            }
            WebAudio.isDecoding = true;
            var decodeInfo = WebAudio.decodeArr.shift();
            WebAudio.ctx.decodeAudioData(decodeInfo["buffer"], function (audioBuffer) {
                decodeInfo["self"].audioBuffer = audioBuffer;
                if (decodeInfo["callback"]) {
                    decodeInfo["callback"]();
                }
                WebAudio.isDecoding = false;
                WebAudio.decodeAudios();
            });
        };
        /**
         * 播放声音
         * @method egret.Sound#play
         * @param loop {boolean} 是否循环播放，默认为false
         */
        __egretProto__._play = function (type) {
            var _this = this;
            if (this.bufferSource) {
                //this.clear();
                this.bufferSource.onended = null;
                this.removeListeners();
                this.bufferSource = null;
            }
            var context = this.context;
            var gain = this.gain;
            var bufferSource = context.createBufferSource();
            this.bufferSource = bufferSource;
            this.addListeners();
            bufferSource.buffer = this.audioBuffer;
            bufferSource.connect(gain);
            gain.connect(context.destination);
            bufferSource.onended = function (e) {
                _this.clear();
                if (_this._onEndedCall) {
                    _this._onEndedCall.call(null, e);
                }
                if (_this._loop && !_this.paused)
                    _this._play();
            };
            this.paused = false;
            this._startTime = Date.now();
            this.gain.gain.value = this._volume;
            bufferSource.start(0, this._currentTime);
            this._currentTime = 0;
        };
        __egretProto__.clear = function () {
            if (this.bufferSource) {
                this.removeListeners();
                var sourceNode = this.bufferSource;
                if (sourceNode.stop) {
                    sourceNode.stop(0);
                }
                else {
                    sourceNode.noteOff(0);
                }
                this.bufferSource.disconnect();
                this.bufferSource = null;
            }
        };
        __egretProto__.addListeners = function () {
            var self = this;
            for (var i = 0; i < self._listeners.length; i++) {
                var bin = self._listeners[i];
                this.bufferSource.addEventListener(bin.type, bin.listener, bin.useCapture);
            }
        };
        __egretProto__.removeListeners = function () {
            var self = this;
            for (var i = 0; i < self._listeners.length; i++) {
                var bin = self._listeners[i];
                this.bufferSource.removeEventListener(bin.type, bin.listener, bin.useCapture);
            }
        };
        /**
         * 暂停声音
         * @method egret.Sound#pause
         */
        __egretProto__._pause = function () {
            this.paused = true;
            this.clear();
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
            if (this.bufferSource) {
                this.bufferSource.addEventListener(type, listener, useCapture);
            }
        };
        /**s
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
                    if (this.bufferSource) {
                        this.bufferSource.removeEventListener(type, listener, useCapture);
                    }
                    break;
                }
            }
        };
        /**
         * 重新加载声音
         * @method egret.Sound#load
         */
        __egretProto__._load = function () {
            this._setArrayBuffer(this._arrayBuffer, null);
        };
        __egretProto__._setArrayBuffer = function (buffer, callback) {
            var self = this;
            this._arrayBuffer = buffer;
            WebAudio.decodeArr.push({ "buffer": buffer, "callback": callback, "self": self });
            WebAudio.decodeAudios();
        };
        __egretProto__._preload = function (type, callback, thisObj) {
            if (callback === void 0) { callback = null; }
            if (thisObj === void 0) { thisObj = null; }
            egret.callLater(callback, thisObj);
        };
        /**
         * 获取当前音量值
         * @returns number
         */
        __egretProto__._getVolume = function () {
            return this._volume;
        };
        __egretProto__._setVolume = function (value) {
            this._volume = value;
            this.gain.gain.value = value;
        };
        __egretProto__._setLoop = function (value) {
            this._loop = value;
        };
        __egretProto__._getCurrentTime = function () {
            if (this.bufferSource) {
                return (Date.now() - this._startTime) / 1000;
            }
            return 0;
        };
        __egretProto__._setCurrentTime = function (value) {
            this._currentTime = value;
        };
        __egretProto__._destroy = function () {
        };
        WebAudio.canUseWebAudio = window["AudioContext"] || window["webkitAudioContext"] || window["mozAudioContext"];
        WebAudio.ctx = WebAudio.canUseWebAudio ? new (window["AudioContext"] || window["webkitAudioContext"] || window["mozAudioContext"])() : undefined;
        WebAudio.decodeArr = [];
        WebAudio.isDecoding = false;
        return WebAudio;
    })();
    egret.WebAudio = WebAudio;
    WebAudio.prototype.__class__ = "egret.WebAudio";
})(egret || (egret = {}));
