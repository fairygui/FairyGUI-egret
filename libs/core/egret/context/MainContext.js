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
     * @class egret.MainContext
     * @classdesc
     * MainContext是游戏的核心跨平台接口，组合了多个功能Context，并是游戏启动的主入口
     * @extends egret.EventDispatcher
     * @private
     */
    var MainContext = (function (_super) {
        __extends(MainContext, _super);
        function MainContext() {
            _super.call(this);
            /**
             * 渲染Context
             * @member egret.MainContext#rendererContext
             */
            this.rendererContext = null;
            /**
             * 触摸Context
             * @member egret.MainContext#touchContext
             */
            this.touchContext = null;
            /**
             * 网络Context
             * @member egret.MainContext#netContext
             */
            this.netContext = null;
            /**
             * 设备divice
             * @member egret.MainContext#deviceContext
             */
            this.deviceContext = null;
            /**
             * 舞台
             * @member egret.MainContext#stage
             */
            this.stage = null;
            this.reuseEvent = new egret.Event("");
        }
        var __egretProto__ = MainContext.prototype;
        /**
         * 游戏启动，开启主循环，参考Flash的滑动跑道模型
         * @method egret.MainContext#run
         */
        __egretProto__.run = function () {
            egret.Ticker.getInstance().run();
            egret.Ticker.getInstance().register(this.renderLoop, this, Number.NEGATIVE_INFINITY);
            egret.Ticker.getInstance().register(this.broadcastEnterFrame, this, Number.POSITIVE_INFINITY);
            this.touchContext.run();
            this._profileInstance = egret.Profiler.getInstance();
        };
        /**
         * 滑动跑道模型，渲染部分
         */
        __egretProto__.renderLoop = function (frameTime) {
            if (egret.__callLaterFunctionList.length > 0) {
                var functionList = egret.__callLaterFunctionList;
                egret.__callLaterFunctionList = [];
                var thisList = egret.__callLaterThisList;
                egret.__callLaterThisList = [];
                var argsList = egret.__callLaterArgsList;
                egret.__callLaterArgsList = [];
            }
            var stage = this.stage;
            var event = MainContext.cachedEvent;
            event._type = egret.Event.RENDER;
            this.dispatchEvent(event);
            if (egret.Stage._invalidateRenderFlag) {
                this.broadcastRender();
                egret.Stage._invalidateRenderFlag = false;
            }
            if (functionList) {
                this.doCallLaterList(functionList, thisList, argsList);
            }
            if (egret.__callAsyncFunctionList.length > 0) {
                this.doCallAsyncList();
            }
            var context = this.rendererContext;
            context.onRenderStart();
            context.clearScreen();
            MainContext.__DRAW_COMMAND_LIST = [];
            MainContext._renderLoopPhase = "updateTransform";
            stage._updateTransform();
            MainContext._renderLoopPhase = "draw";
            event._type = egret.Event.FINISH_UPDATE_TRANSFORM;
            this.dispatchEvent(event);
            if (MainContext.__use_new_draw) {
                this._draw(context);
            }
            else {
                stage._draw(context);
            }
            event._type = egret.Event.FINISH_RENDER;
            this.dispatchEvent(event);
            if (this._profileInstance._isRunning) {
                this._profileInstance._drawProfiler(context);
            }
            context.onRenderFinish();
        };
        __egretProto__._draw = function (context) {
            var list = MainContext.__DRAW_COMMAND_LIST;
            var length = list.length;
            for (var i = 0; i < length; i++) {
                var cmd = list[i];
                cmd.call(context);
                cmd.dispose();
            }
        };
        /**
         * 广播EnterFrame事件。
         */
        __egretProto__.broadcastEnterFrame = function (frameTime) {
            var event = this.reuseEvent;
            event._type = egret.Event.ENTER_FRAME;
            this.dispatchEvent(event);
            var list = egret.DisplayObject._enterFrameCallBackList.concat();
            var length = list.length;
            for (var i = 0; i < length; i++) {
                var eventBin = list[i];
                event._target = eventBin.display;
                event._currentTarget = eventBin.display;
                eventBin.listener.call(eventBin.thisObject, event);
            }
            list = egret.Recycler._callBackList;
            for (i = list.length - 1; i >= 0; i--) {
                list[i]._checkFrame();
            }
        };
        /**
         * 广播Render事件。
         */
        __egretProto__.broadcastRender = function () {
            var event = this.reuseEvent;
            event._type = egret.Event.RENDER;
            var list = egret.DisplayObject._renderCallBackList.concat();
            var length = list.length;
            for (var i = 0; i < length; i++) {
                var eventBin = list[i];
                var target = eventBin.display;
                event._target = target;
                event._currentTarget = target;
                eventBin.listener.call(eventBin.thisObject, event);
            }
        };
        /**
         * 执行callLater回调函数列表
         */
        __egretProto__.doCallLaterList = function (funcList, thisList, argsList) {
            var length = funcList.length;
            for (var i = 0; i < length; i++) {
                var func = funcList[i];
                if (func != null) {
                    func.apply(thisList[i], argsList[i]);
                }
            }
        };
        /**
         * 执行callAsync回调函数列表
         */
        __egretProto__.doCallAsyncList = function () {
            var locCallAsyncFunctionList = egret.__callAsyncFunctionList.concat();
            var locCallAsyncThisList = egret.__callAsyncThisList.concat();
            var locCallAsyncArgsList = egret.__callAsyncArgsList.concat();
            egret.__callAsyncFunctionList.length = 0;
            egret.__callAsyncThisList.length = 0;
            egret.__callAsyncArgsList.length = 0;
            for (var i = 0; i < locCallAsyncFunctionList.length; i++) {
                var func = locCallAsyncFunctionList[i];
                if (func != null) {
                    func.apply(locCallAsyncThisList[i], locCallAsyncArgsList[i]);
                }
            }
        };
        MainContext.deviceType = null;
        MainContext.DEVICE_PC = "web";
        MainContext.DEVICE_MOBILE = "native";
        MainContext.RUNTIME_HTML5 = "runtimeHtml5";
        MainContext.RUNTIME_NATIVE = "runtimeNative";
        MainContext.__DRAW_COMMAND_LIST = [];
        //是否使用新的draw机制
        MainContext.__use_new_draw = true;
        MainContext.cachedEvent = new egret.Event("");
        return MainContext;
    })(egret.EventDispatcher);
    egret.MainContext = MainContext;
    MainContext.prototype.__class__ = "egret.MainContext";
})(egret || (egret = {}));
var testDeviceType = function () {
    if (!this["navigator"]) {
        return true;
    }
    var ua = navigator.userAgent.toLowerCase();
    return (ua.indexOf('mobile') != -1 || ua.indexOf('android') != -1);
};
var testRuntimeType = function () {
    if (this["navigator"]) {
        return true;
    }
    return false;
};
egret.MainContext.instance = new egret.MainContext();
egret.MainContext.deviceType = testDeviceType() ? egret.MainContext.DEVICE_MOBILE : egret.MainContext.DEVICE_PC;
egret.MainContext.runtimeType = testRuntimeType() ? egret.MainContext.RUNTIME_HTML5 : egret.MainContext.RUNTIME_NATIVE;
delete testDeviceType;
delete testRuntimeType;
