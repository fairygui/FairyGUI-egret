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
     * 这个类是HTML5的WebWrapper的第一个版本
     * @private
     */
    var Browser = (function (_super) {
        __extends(Browser, _super);
        function Browser() {
            _super.call(this);
            this.trans = null;
            this.header = null;
            this.ua = navigator.userAgent.toLowerCase();
            this.trans = this.getTrans("transform");
        }
        var __egretProto__ = Browser.prototype;
        Browser.getInstance = function () {
            if (Browser.instance == null) {
                Browser.instance = new Browser();
            }
            return Browser.instance;
        };
        Object.defineProperty(__egretProto__, "isMobile", {
            /**
             * @deprecated
             * @returns {boolean}
             */
            get: function () {
                egret.Logger.warningWithErrorId(1000);
                return egret.MainContext.deviceType == egret.MainContext.DEVICE_MOBILE;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 判断是否是ios
         * @returns {boolean}
         */
        __egretProto__.isIOS = function () {
            return this.ua.indexOf("windows") < 0 && (this.ua.indexOf("iphone") >= 0 || this.ua.indexOf("ipad") >= 0 || this.ua.indexOf("ipod") >= 0);
        };
        /**
         * 获取ios版本
         * @returns {string}
         */
        __egretProto__.getIOSVersion = function () {
            var value = this.ua.toLowerCase().match(/cpu [^\d]*\d.*like mac os x/)[0];
            return value.match(/\d(_\d)*/)[0];
        };
        __egretProto__.getUserAgent = function () {
            return this.ua;
        };
        /**
         * 获取当前浏览器对应style类型
         * @type {string}
         */
        __egretProto__.getTrans = function (style, judge) {
            if (judge === void 0) { judge = false; }
            var header = "";
            if (judge) {
                header = this.getHeader(style);
            }
            else {
                if (this.header == null) {
                    this.header = this.getHeader("transform");
                }
                header = this.header;
            }
            if (header == "") {
                return style;
            }
            return header + style.charAt(0).toUpperCase() + style.substring(1, style.length);
        };
        /**
         * 获取当前浏览器的类型
         * @returns {string}
         */
        __egretProto__.getHeader = function (style) {
            var divStyles = document.createElement('div').style;
            if (style in divStyles) {
                return "";
            }
            style = style.charAt(0).toUpperCase() + style.substring(1, style.length);
            var transArr = ["webkit", "ms", "Moz", "O"];
            for (var i = 0; i < transArr.length; i++) {
                var tempStyle = transArr[i] + style;
                if (tempStyle in divStyles) {
                    return transArr[i];
                }
            }
            return "";
        };
        __egretProto__.$new = function (x) {
            return this.$(document.createElement(x));
        };
        __egretProto__.$ = function (x) {
            var parent = document;
            var el = (x instanceof HTMLElement) ? x : parent.querySelector(x);
            if (el) {
                el.find = el.find || this.$;
                el.hasClass = el.hasClass || function (cls) {
                    return this.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
                };
                el.addClass = el.addClass || function (cls) {
                    if (!this.hasClass(cls)) {
                        if (this.className) {
                            this.className += " ";
                        }
                        this.className += cls;
                    }
                    return this;
                };
                el.removeClass = el.removeClass || function (cls) {
                    if (this.hasClass(cls)) {
                        this.className = this.className.replace(cls, '');
                    }
                    return this;
                };
                el.remove = el.remove || function () {
                    //                    if (this.parentNode)
                    //                        this.parentNode.removeChild(this);
                    //                        return this;
                };
                el.appendTo = el.appendTo || function (x) {
                    x.appendChild(this);
                    return this;
                };
                el.prependTo = el.prependTo || function (x) {
                    (x.childNodes[0]) ? x.insertBefore(this, x.childNodes[0]) : x.appendChild(this);
                    return this;
                };
                el.transforms = el.transforms || function () {
                    this.style[Browser.getInstance().trans] = Browser.getInstance().translate(this.position) + Browser.getInstance().rotate(this.rotation) + Browser.getInstance().scale(this.scale) + Browser.getInstance().skew(this.skew);
                    return this;
                };
                el.position = el.position || { x: 0, y: 0 };
                el.rotation = el.rotation || 0;
                el.scale = el.scale || { x: 1, y: 1 };
                el.skew = el.skew || { x: 0, y: 0 };
                el.translates = function (x, y) {
                    this.position.x = x;
                    this.position.y = y - egret.MainContext.instance.stage.stageHeight;
                    this.transforms();
                    return this;
                };
                el.rotate = function (x) {
                    this.rotation = x;
                    this.transforms();
                    return this;
                };
                el.resize = function (x, y) {
                    this.scale.x = x;
                    this.scale.y = y;
                    this.transforms();
                    return this;
                };
                el.setSkew = function (x, y) {
                    this.skew.x = x;
                    this.skew.y = y;
                    this.transforms();
                    return this;
                };
            }
            return el;
        };
        __egretProto__.translate = function (a) {
            return "translate(" + a.x + "px, " + a.y + "px) ";
        };
        __egretProto__.rotate = function (a) {
            return "rotate(" + a + "deg) ";
        };
        __egretProto__.scale = function (a) {
            return "scale(" + a.x + ", " + a.y + ") ";
        };
        __egretProto__.skew = function (a) {
            return "skewX(" + -a.x + "deg) skewY(" + a.y + "deg)";
        };
        return Browser;
    })(egret.HashObject);
    egret.Browser = Browser;
    Browser.prototype.__class__ = "egret.Browser";
})(egret || (egret = {}));
