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
    var HTML5TouchContext = (function (_super) {
        __extends(HTML5TouchContext, _super);
        function HTML5TouchContext() {
            _super.call(this);
            this._isTouchDown = false;
            this.rootDiv = null;
            this.rootDiv = document.getElementById(egret.StageDelegate.canvas_div_name);
            if (!this.rootDiv) {
                var container = document.getElementById(egret.StageDelegate.egret_root_div);
                this.rootDiv = egret.Browser.getInstance().$new("div");
                this.rootDiv.id = egret.StageDelegate.canvas_div_name;
                container.appendChild(this.rootDiv);
            }
        }
        var __egretProto__ = HTML5TouchContext.prototype;
        __egretProto__.prevent = function (event) {
            event.stopPropagation();
            if (event["isScroll"] != true && !egret.HTMLInput.getInstance().isInputOn()) {
                event.preventDefault();
            }
        };
        __egretProto__.run = function () {
            var that = this;
            if (window.navigator.msPointerEnabled) {
                this.rootDiv.addEventListener("MSPointerDown", function (event) {
                    that._onTouchBegin(event);
                    that.prevent(event);
                }, false);
                this.rootDiv.addEventListener("MSPointerMove", function (event) {
                    that._onTouchMove(event);
                    that.prevent(event);
                }, false);
                this.rootDiv.addEventListener("MSPointerUp", function (event) {
                    that._onTouchEnd(event);
                    that.prevent(event);
                }, false);
            }
            else if (egret.MainContext.deviceType == egret.MainContext.DEVICE_MOBILE) {
                this.addTouchListener();
            }
            else if (egret.MainContext.deviceType == egret.MainContext.DEVICE_PC) {
                this.addTouchListener();
                this.addMouseListener();
            }
            window.addEventListener("mousedown", function (event) {
                if (!that.inOutOfCanvas(event)) {
                    that._isTouchDown = true;
                }
                else {
                    that.dispatchLeaveStageEvent();
                }
            });
            window.addEventListener("mouseup", function (event) {
                if (that._isTouchDown) {
                    if (that.inOutOfCanvas(event))
                        that.dispatchLeaveStageEvent();
                    else
                        that._onTouchEnd(event);
                }
                that._isTouchDown = false;
            });
        };
        __egretProto__.addMouseListener = function () {
            var that = this;
            this.rootDiv.addEventListener("mousedown", function (event) {
                that._onTouchBegin(event);
            });
            this.rootDiv.addEventListener("mousemove", function (event) {
                that._onTouchMove(event);
            });
            this.rootDiv.addEventListener("mouseup", function (event) {
                that._onTouchEnd(event);
            });
        };
        __egretProto__.addTouchListener = function () {
            var that = this;
            this.rootDiv.addEventListener("touchstart", function (event) {
                var l = event.changedTouches.length;
                for (var i = 0; i < l; i++) {
                    that._onTouchBegin(event.changedTouches[i]);
                }
                that.prevent(event);
            }, false);
            this.rootDiv.addEventListener("touchmove", function (event) {
                var l = event.changedTouches.length;
                for (var i = 0; i < l; i++) {
                    that._onTouchMove(event.changedTouches[i]);
                }
                that.prevent(event);
            }, false);
            this.rootDiv.addEventListener("touchend", function (event) {
                var l = event.changedTouches.length;
                for (var i = 0; i < l; i++) {
                    that._onTouchEnd(event.changedTouches[i]);
                }
                that.prevent(event);
            }, false);
            this.rootDiv.addEventListener("touchcancel", function (event) {
                var l = event.changedTouches.length;
                for (var i = 0; i < l; i++) {
                    that._onTouchEnd(event.changedTouches[i]);
                }
                that.prevent(event);
            }, false);
        };
        __egretProto__.inOutOfCanvas = function (event) {
            var location = this.getLocation(this.rootDiv, event);
            var x = location.x, y = location.y;
            var stage = egret.MainContext.instance.stage;
            if (x < 0 || y < 0 || x > stage.stageWidth || y > stage.stageHeight) {
                return true;
            }
            return false;
        };
        __egretProto__.dispatchLeaveStageEvent = function () {
            this.touchingIdentifiers.length = 0;
            egret.MainContext.instance.stage.dispatchEventWith(egret.Event.LEAVE_STAGE);
        };
        __egretProto__._onTouchBegin = function (event) {
            var location = this.getLocation(this.rootDiv, event);
            var identifier = -1;
            if (event.hasOwnProperty("identifier")) {
                identifier = event.identifier;
            }
            this.onTouchBegan(location.x, location.y, identifier);
        };
        __egretProto__._onTouchMove = function (event) {
            var location = this.getLocation(this.rootDiv, event);
            var identifier = -1;
            if (event.hasOwnProperty("identifier")) {
                identifier = event.identifier;
            }
            this.onTouchMove(location.x, location.y, identifier);
        };
        __egretProto__._onTouchEnd = function (event) {
            var location = this.getLocation(this.rootDiv, event);
            var identifier = -1;
            if (event.hasOwnProperty("identifier")) {
                identifier = event.identifier;
            }
            this.onTouchEnd(location.x, location.y, identifier);
        };
        __egretProto__.getLocation = function (rootDiv, event) {
            var doc = document.documentElement;
            var win = window;
            var left, top, tx, ty;
            if (typeof rootDiv.getBoundingClientRect === 'function') {
                var box = rootDiv.getBoundingClientRect();
                left = box.left;
                top = box.top;
            }
            else {
                left = 0;
                top = 0;
            }
            left += win.pageXOffset - doc.clientLeft;
            top += win.pageYOffset - doc.clientTop;
            if (event.pageX != null) {
                tx = event.pageX;
                ty = event.pageY;
            }
            else {
                left -= document.body.scrollLeft;
                top -= document.body.scrollTop;
                tx = event.clientX;
                ty = event.clientY;
            }
            var result = egret.Point.identity;
            result.x = (tx - left) / egret.StageDelegate.getInstance().getScaleX();
            result.y = (ty - top) / egret.StageDelegate.getInstance().getScaleY();
            return result;
        };
        return HTML5TouchContext;
    })(egret.TouchContext);
    egret.HTML5TouchContext = HTML5TouchContext;
    HTML5TouchContext.prototype.__class__ = "egret.HTML5TouchContext";
})(egret || (egret = {}));
