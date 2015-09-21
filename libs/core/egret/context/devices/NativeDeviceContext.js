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
     * @class egret.NativeDeviceContext
     * @classdesc
     * @extends egret.HashObject
     * @private
     */
    var NativeDeviceContext = (function (_super) {
        __extends(NativeDeviceContext, _super);
        /**
         * @method egret.NativeDeviceContext#constructor
         */
        function NativeDeviceContext() {
            _super.call(this);
            this.callback = null;
            this.thisObject = null;
            egret.TextField.default_fontFamily = "/system/fonts/DroidSansFallback.ttf";
        }
        var __egretProto__ = NativeDeviceContext.prototype;
        /**
         * @method egret.NativeDeviceContext#executeMainLoop
         * @param callback {Function}
         * @param thisObject {any}
         */
        __egretProto__.executeMainLoop = function (callback, thisObject) {
            this.callback = callback;
            this.thisObject = thisObject;
            egret_native.executeMainLoop(this.onEnterFrame, this);
        };
        __egretProto__.onEnterFrame = function (advancedTime) {
            this.callback.call(this.thisObject, advancedTime);
        };
        return NativeDeviceContext;
    })(egret.HashObject);
    egret.NativeDeviceContext = NativeDeviceContext;
    NativeDeviceContext.prototype.__class__ = "egret.NativeDeviceContext";
})(egret || (egret = {}));
var egret_native_external_interface;
(function (egret_native_external_interface) {
    egret_native_external_interface.callBackDic = {};
    function call(functionName, value) {
        var data = {};
        data.functionName = functionName;
        data.value = value;
        egret_native.sendInfoToPlugin(JSON.stringify(data));
    }
    egret_native_external_interface.call = call;
    function addCallback(functionName, listener) {
        egret_native_external_interface.callBackDic[functionName] = listener;
    }
    egret_native_external_interface.addCallback = addCallback;
    function onReceivedPluginInfo(info) {
        var data = JSON.parse(info);
        var functionName = data.functionName;
        var listener = egret_native_external_interface.callBackDic[functionName];
        if (listener) {
            var value = data.value;
            listener.call(null, value);
        }
        else {
            egret.Logger.warningWithErrorId(1004, functionName);
        }
    }
    egret_native_external_interface.onReceivedPluginInfo = onReceivedPluginInfo;
    function init() {
        for (var key in egret_native_external_interface) {
            egret.ExternalInterface[key] = egret_native_external_interface[key];
        }
        egret_native.receivedPluginInfo = egret_native_external_interface.onReceivedPluginInfo;
    }
    egret_native_external_interface.init = init;
})(egret_native_external_interface || (egret_native_external_interface = {}));
egret_native_external_interface.init();
var egret_native_localStorage;
(function (egret_native_localStorage) {
    egret_native_localStorage.filePath = "LocalStorage.local";
    function getItem(key) {
        return this.data[key];
    }
    egret_native_localStorage.getItem = getItem;
    function setItem(key, value) {
        this.data[key] = value;
        try {
            this.save();
            return true;
        }
        catch (e) {
            egret.Logger.infoWithErrorId(1018, key, value);
            return false;
        }
    }
    egret_native_localStorage.setItem = setItem;
    function removeItem(key) {
        delete this.data[key];
        this.save();
    }
    egret_native_localStorage.removeItem = removeItem;
    function clear() {
        for (var key in this.data) {
            delete this.data[key];
        }
        this.save();
    }
    egret_native_localStorage.clear = clear;
    function save() {
        egret_native.saveRecord(egret_native_localStorage.filePath, JSON.stringify(this.data));
    }
    egret_native_localStorage.save = save;
    function init() {
        if (egret_native.isRecordExists(egret_native_localStorage.filePath)) {
            var str = egret_native.loadRecord(egret_native_localStorage.filePath);
            this.data = JSON.parse(str);
        }
        else {
            this.data = {};
        }
        for (var key in egret_native_localStorage) {
            egret.localStorage[key] = egret_native_localStorage[key];
        }
    }
    egret_native_localStorage.init = init;
})(egret_native_localStorage || (egret_native_localStorage = {}));
egret_native_localStorage.init();
egret.ContainerStrategy.prototype._setupContainer = function () {
};
egret.ContentStrategy.prototype._getClientWidth = function () {
    var result = egret_native.EGTView.getFrameWidth();
    return result;
};
egret.ContentStrategy.prototype._getClientHeight = function () {
    var result = egret_native.EGTView.getFrameHeight();
    return result;
};
egret.ContentStrategy.prototype.setEgretSize = function (w, h, styleW, styleH, left, top) {
    if (left === void 0) { left = 0; }
    if (top === void 0) { top = 0; }
    egret.StageDelegate.getInstance()._stageWidth = w;
    egret.StageDelegate.getInstance()._stageHeight = h;
    //    console.log("setVisibleRect:" + left + "|" + top + "|" + styleW + "|" + styleH);
    egret_native.EGTView.setVisibleRect(left, top, styleW, styleH);
    egret_native.EGTView.setDesignSize(w, h);
};
egret.Logger.openLogByType = function (logType) {
    egret_native.loglevel(logType);
};
egret_native.pauseApp = function () {
    egret.MainContext.instance.stage.dispatchEvent(new egret.Event(egret.Event.DEACTIVATE));
};
egret_native.resumeApp = function () {
    egret.MainContext.instance.stage.dispatchEvent(new egret.Event(egret.Event.ACTIVATE));
};
egret.RenderTexture.prototype.init = function () {
};
egret.RenderTexture.prototype.setSize = function (width, height) {
    //todo 复用
    this.dispose();
    this._bitmapData = new egret_native.RenderTexture(width, height);
    this._bitmapData["avaliable"] = true;
    this.renderContext = new egret.NativeRendererContext();
};
egret.RenderTexture.prototype.begin = function () {
    this._bitmapData.begin();
};
egret.RenderTexture.prototype.end = function () {
    this._bitmapData.end();
};
egret.RenderTexture.prototype.dispose = function () {
    if (this._bitmapData) {
        this._bitmapData.dispose();
        this.renderContext = null;
        this._bitmapData = null;
    }
};
egret.getOption = function (key) {
    console.log("egret_native.getOption");
    return egret_native.getOption(key);
};
