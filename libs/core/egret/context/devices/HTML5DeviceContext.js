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
     * @class egret.HTML5DeviceContext
     * @classdesc
     * @extends egret.DeviceContext
     * @private
     */
    var HTML5DeviceContext = (function (_super) {
        __extends(HTML5DeviceContext, _super);
        /**
         * @method egret.HTML5DeviceContext#constructor
         */
        function HTML5DeviceContext(frameRate) {
            if (frameRate === void 0) { frameRate = 60; }
            _super.call(this);
            this.frameRate = frameRate;
            this._time = 0;
            this._requestAnimationId = NaN;
            this._isActivate = true;
            HTML5DeviceContext.countTime = 0;
            if ((60 % frameRate) == 0) {
                HTML5DeviceContext.countTime = 60 / frameRate - 1;
                HTML5DeviceContext.requestAnimationFrame = window["requestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["mozRequestAnimationFrame"] || window["oRequestAnimationFrame"] || window["msRequestAnimationFrame"];
                HTML5DeviceContext.cancelAnimationFrame = window["cancelAnimationFrame"] || window["msCancelAnimationFrame"] || window["mozCancelAnimationFrame"] || window["webkitCancelAnimationFrame"] || window["oCancelAnimationFrame"] || window["cancelRequestAnimationFrame"] || window["msCancelRequestAnimationFrame"] || window["mozCancelRequestAnimationFrame"] || window["oCancelRequestAnimationFrame"] || window["webkitCancelRequestAnimationFrame"];
            }
            if (!HTML5DeviceContext.requestAnimationFrame) {
                HTML5DeviceContext.requestAnimationFrame = function (callback) {
                    return window.setTimeout(callback, 1000 / frameRate);
                };
            }
            if (!HTML5DeviceContext.cancelAnimationFrame) {
                HTML5DeviceContext.cancelAnimationFrame = function (id) {
                    return window.clearTimeout(id);
                };
            }
            HTML5DeviceContext.instance = this;
            this.registerListener();
        }
        var __egretProto__ = HTML5DeviceContext.prototype;
        __egretProto__.enterFrame = function () {
            var context = HTML5DeviceContext.instance;
            var thisObject = HTML5DeviceContext._thisObject;
            var callback = HTML5DeviceContext._callback;
            var thisTime = egret.getTimer();
            var advancedTime = thisTime - context._time;
            context._requestAnimationId = HTML5DeviceContext.requestAnimationFrame.call(window, HTML5DeviceContext.prototype.enterFrame);
            if (HTML5DeviceContext.count < HTML5DeviceContext.countTime) {
                HTML5DeviceContext.count++;
                return;
            }
            HTML5DeviceContext.count = 0;
            callback.call(thisObject, advancedTime);
            context._time = thisTime;
        };
        /**
         * @method egret.HTML5DeviceContext#executeMainLoop
         * @param callback {Function}
         * @param thisObject {any}
         */
        __egretProto__.executeMainLoop = function (callback, thisObject) {
            HTML5DeviceContext._callback = callback;
            HTML5DeviceContext._thisObject = thisObject;
            this.enterFrame();
        };
        __egretProto__.reset = function () {
            var context = HTML5DeviceContext.instance;
            if (context._requestAnimationId) {
                context._time = egret.getTimer();
                HTML5DeviceContext.cancelAnimationFrame.call(window, context._requestAnimationId);
                context.enterFrame();
            }
        };
        __egretProto__.registerListener = function () {
            var self = this;
            //失去焦点
            var onBlurHandler = function () {
                if (!self._isActivate) {
                    return;
                }
                self._isActivate = false;
                egret.MainContext.instance.stage.dispatchEvent(new egret.Event(egret.Event.DEACTIVATE));
            };
            //激活
            var onFocusHandler = function () {
                if (self._isActivate) {
                    return;
                }
                self._isActivate = true;
                var context = HTML5DeviceContext.instance;
                context.reset();
                egret.MainContext.instance.stage.dispatchEvent(new egret.Event(egret.Event.ACTIVATE));
            };
            var handleVisibilityChange = function () {
                if (!document[hidden]) {
                    onFocusHandler();
                }
                else {
                    onBlurHandler();
                }
            };
            //            window.onfocus = onFocusHandler;
            //            window.onblur = onBlurHandler;
            window.addEventListener("focus", onFocusHandler, false);
            window.addEventListener("blur", onBlurHandler, false);
            var hidden, visibilityChange;
            if (typeof document.hidden !== "undefined") {
                hidden = "hidden";
                visibilityChange = "visibilitychange";
            }
            else if (typeof document["mozHidden"] !== "undefined") {
                hidden = "mozHidden";
                visibilityChange = "mozvisibilitychange";
            }
            else if (typeof document["msHidden"] !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
            }
            else if (typeof document["webkitHidden"] !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
            }
            else if (typeof document["oHidden"] !== "undefined") {
                hidden = "oHidden";
                visibilityChange = "ovisibilitychange";
            }
            if ("onpageshow" in window && "onpagehide" in window) {
                window.addEventListener("pageshow", onFocusHandler, false);
                window.addEventListener("pagehide", onBlurHandler, false);
            }
            if (hidden && visibilityChange) {
                document.addEventListener(visibilityChange, handleVisibilityChange, false);
            }
            var ua = navigator.userAgent;
            var isWX = /micromessenger/gi.test(ua);
            var isQQBrowser = /mqq/ig.test(ua);
            var isQQ = /mobile.*qq/gi.test(ua);
            if (isQQ || isWX) {
                isQQBrowser = false;
            }
            if (isQQBrowser) {
                var browser = window["browser"] || {};
                browser.execWebFn = browser.execWebFn || {};
                browser.execWebFn.postX5GamePlayerMessage = function (event) {
                    var eventType = event.type;
                    if (eventType == "app_enter_background") {
                        onBlurHandler();
                    }
                    else if (eventType == "app_enter_foreground") {
                        onFocusHandler();
                    }
                };
                window["browser"] = browser;
            }
        };
        HTML5DeviceContext.instance = null;
        HTML5DeviceContext.countTime = 0;
        HTML5DeviceContext.requestAnimationFrame = null;
        HTML5DeviceContext.cancelAnimationFrame = null;
        HTML5DeviceContext._thisObject = null;
        HTML5DeviceContext._callback = null;
        HTML5DeviceContext.count = 0;
        return HTML5DeviceContext;
    })(egret.DeviceContext);
    egret.HTML5DeviceContext = HTML5DeviceContext;
    HTML5DeviceContext.prototype.__class__ = "egret.HTML5DeviceContext";
})(egret || (egret = {}));
var egret_html5_localStorage;
(function (egret_html5_localStorage) {
    //todo 有可能没有window.localStorage对象
    function getItem(key) {
        return window.localStorage.getItem(key);
    }
    egret_html5_localStorage.getItem = getItem;
    function setItem(key, value) {
        try {
            window.localStorage.setItem(key, value);
            return true;
        }
        catch (e) {
            egret.Logger.infoWithErrorId(1018, key, value);
            return false;
        }
    }
    egret_html5_localStorage.setItem = setItem;
    function removeItem(key) {
        window.localStorage.removeItem(key);
    }
    egret_html5_localStorage.removeItem = removeItem;
    function clear() {
        window.localStorage.clear();
    }
    egret_html5_localStorage.clear = clear;
    function init() {
        for (var key in egret_html5_localStorage) {
            egret.localStorage[key] = egret_html5_localStorage[key];
        }
    }
    egret_html5_localStorage.init = init;
})(egret_html5_localStorage || (egret_html5_localStorage = {}));
egret_html5_localStorage.init();
