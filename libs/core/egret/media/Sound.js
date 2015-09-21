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
     * @class egret.Sound
     * @classdesc Sound 类允许您在应用程序中使用声音。
     * @link http://docs.egret-labs.org/post/manual/sound/playsound.html 播放音频
     *
     * @event egret.SoundEvent.SOUND_COMPLETE 在声音完成播放后调度。
     */
    var Sound = (function (_super) {
        __extends(Sound, _super);
        /**
         * 创建 egret.Sound 对象
         */
        function Sound() {
            _super.call(this);
            /**
             * @deprecated
             * @type {string}
             */
            this.path = "";
            /**
             * audio音频对象
             * @member {any} egret.Sound#audio
             */
            this.audio = null;
            /**
             * 类型，默认为 egret.Sound.EFFECT。
             * 在 native 和 runtime 环境下，背景音乐同时只能播放一个，音效长度尽量不要太长。
             * @member {any} egret.Sound#audio
             */
            this.type = Sound.EFFECT;
            this._pauseTime = 0;
            this._listeners = [];
        }
        var __egretProto__ = Sound.prototype;
        Object.defineProperty(__egretProto__, "position", {
            /**
             * 当播放声音时，position 属性表示声音文件中当前播放的位置（以毫秒为单位）。
             * h5支持，native不支持
             * @returns {number}
             */
            get: function () {
                return this.audio ? Math.floor(this.audio._getCurrentTime() * 1000) : 0;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 播放声音
         * @param loop  是否循环播放，默认为false
         * @param position  是否从刚开始播放 h5支持，native不支持
         */
        __egretProto__.play = function (loop, position) {
            if (loop === void 0) { loop = false; }
            if (position === void 0) { position = 0; }
            var sound = this.audio;
            if (!sound) {
                return;
            }
            sound._setCurrentTime(position / 1000);
            sound._setLoop(loop);
            sound._play(this.type);
        };
        /**
         * 声音停止播放
         */
        __egretProto__.stop = function () {
            var sound = this.audio;
            if (!sound) {
                return;
            }
            this._pauseTime = 0;
            sound._setCurrentTime(0);
            sound._pause();
        };
        /**
         * 暂停声音
         */
        __egretProto__.pause = function () {
            var sound = this.audio;
            if (!sound) {
                return;
            }
            this._pauseTime = sound._getCurrentTime();
            sound._pause();
        };
        /**
         * 继续从上次暂停的位置播放
         * h5支持，native不支持
         */
        __egretProto__.resume = function () {
            var sound = this.audio;
            if (!sound) {
                return;
            }
            sound._setCurrentTime(this._pauseTime);
            this._pauseTime = 0;
            sound._play(this.type);
        };
        /**
         * 重新加载声音
         */
        __egretProto__.load = function () {
            var sound = this.audio;
            if (!sound) {
                return;
            }
            sound._load();
        };
        /**
         * 添加事件监听
         * h5支持，native不支持
         * @param type 事件类型
         * @param listener 监听函数
         * @param thisObj 侦听函数绑定的this对象
         */
        __egretProto__.addEventListener = function (type, listener, thisObject) {
            _super.prototype.addEventListener.call(this, type, listener, thisObject);
            var self = this;
            var sound = this.audio;
            if (!sound) {
                return;
            }
            if (this._eventsMap[type].length == 1) {
                var func;
                if (type == egret.SoundEvent.SOUND_COMPLETE) {
                    func = function (e) {
                        egret.Event._dispatchByTarget(egret.SoundEvent, self, egret.SoundEvent.SOUND_COMPLETE);
                    };
                }
                else {
                    func = function (e) {
                        egret.Event._dispatchByTarget(egret.Event, self, e.type);
                    };
                }
                this._listeners.push({ type: type, func: func });
                var virtualType = self.getVirtualType(type);
                this.audio._addEventListener(virtualType, func, false);
            }
        };
        /**
         * 移除事件监听
         * h5支持，native不支持
         * @param type 事件类型
         * @param listener 监听函数
         * @param thisObj 侦听函数绑定的this对象
         */
        __egretProto__.removeEventListener = function (type, listener, thisObject) {
            _super.prototype.removeEventListener.call(this, type, listener, thisObject);
            var self = this;
            var sound = this.audio;
            if (!sound) {
                return;
            }
            if (!this._eventsMap || !this._eventsMap[type] || this._eventsMap[type].length == 0) {
                for (var i = 0; i < self._listeners.length; i++) {
                    var bin = self._listeners[i];
                    if (bin.type == type) {
                        self._listeners.splice(i, 1);
                        var virtualType = self.getVirtualType(type);
                        self.audio._removeEventListener(virtualType, bin.func, false);
                        break;
                    }
                }
            }
        };
        __egretProto__.getVirtualType = function (type) {
            switch (type) {
                case egret.SoundEvent.SOUND_COMPLETE:
                    return "ended";
                default:
                    return type;
            }
        };
        Object.defineProperty(__egretProto__, "volume", {
            get: function () {
                return this.audio ? this.audio._getVolume() : 0;
            },
            /**
             * 音量范围从 0（静音）至 1（最大音量）。
             * h5支持，native不支持
             * @returns number
             */
            set: function (value) {
                var sound = this.audio;
                if (!sound) {
                    return;
                }
                sound._setVolume(Math.max(0, Math.min(value, 1)));
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @deprecated
         * 设置音量
         * @param value 值需大于0 小于等于 1
         */
        __egretProto__.setVolume = function (value) {
            egret.Logger.warningWithErrorId(1031);
            this.volume = value;
        };
        /**
         * @deprecated
         * 获取当前音量值
         * @returns number
         */
        __egretProto__.getVolume = function () {
            egret.Logger.warningWithErrorId(1032);
            return this.volume;
        };
        /**
         * 将声音文件加载到内存，
         * native中使用，html5里为空实现
         * @param type 声音类型
         * @param callback 回调函数
         * @param thisObj 侦听函数绑定的this对象
         */
        __egretProto__.preload = function (type, callback, thisObj) {
            if (callback === void 0) { callback = null; }
            if (thisObj === void 0) { thisObj = null; }
            this.type = type;
            this.audio._preload(type, callback, thisObj);
        };
        __egretProto__._setAudio = function (value) {
            this.audio = value;
        };
        /**
         * 释放当前音频
         * native中使用，html5里为空实现
         */
        __egretProto__.destroy = function () {
            this.audio._destroy();
        };
        /**
         * 背景音乐
         * @constant egret.Sound.MUSIC
         */
        Sound.MUSIC = "music";
        /**
         * 音效
         * @constant egret.Sound.EFFECT
         */
        Sound.EFFECT = "effect";
        return Sound;
    })(egret.EventDispatcher);
    egret.Sound = Sound;
    Sound.prototype.__class__ = "egret.Sound";
})(egret || (egret = {}));
