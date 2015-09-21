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
    var NativeNetContext = (function (_super) {
        __extends(NativeNetContext, _super);
        function NativeNetContext() {
            _super.call(this);
            this.urlData = {};
            egret.Texture.createBitmapData = egret.Texture._createBitmapDataForNative;
        }
        var __egretProto__ = NativeNetContext.prototype;
        __egretProto__.initVersion = function (versionCtr) {
            this._versionCtr = versionCtr;
        };
        /**
         * @method egret.HTML5NetContext#proceed
         * @param loader {URLLoader}
         */
        __egretProto__.proceed = function (loader) {
            var self = this;
            if (loader.dataFormat == egret.URLLoaderDataFormat.TEXTURE) {
                self.loadTexture(loader);
                return;
            }
            if (loader.dataFormat == egret.URLLoaderDataFormat.SOUND) {
                self.loadSound(loader);
                return;
            }
            var request = loader._request;
            var virtualUrl = self.getVirtualUrl(egret.NetContext._getUrl(request));
            if (self.isNetUrl(virtualUrl)) {
                self.urlData.type = request.method;
                //写入POST数据
                if (request.method == egret.URLRequestMethod.POST && request.data) {
                    var urlVars = request.data;
                    self.urlData.data = urlVars.toString();
                }
                else {
                    delete self.urlData["data"];
                }
                //写入header信息
                if (request.requestHeaders) {
                    self.urlData.header = self.getHeaderString(request);
                }
                else {
                    delete self.urlData.header;
                }
                var promise = egret.PromiseObject.create();
                promise.onSuccessFunc = function (getted_str) {
                    loader.data = getted_str;
                    egret.callLater(egret.Event.dispatchEvent, egret.Event, loader, egret.Event.COMPLETE);
                };
                promise.onErrorFunc = function (error_code) {
                    egret.Logger.infoWithErrorId(1019, error_code);
                    egret.IOErrorEvent.dispatchIOErrorEvent(loader);
                };
                egret_native.requireHttp(virtualUrl, self.urlData, promise);
            }
            else if (!egret_native.isFileExists(virtualUrl)) {
                download();
            }
            else if (!self.checkIsNewVersion(virtualUrl)) {
                download();
            }
            else {
                if (NativeNetContext.__use_asyn) {
                    //异步读取
                    readFileAsync();
                }
                else {
                    //同步读取
                    egret.__callAsync(onLoadComplete, self);
                }
            }
            function readFileAsync() {
                var promise = new egret.PromiseObject();
                promise.onSuccessFunc = function (content) {
                    self.saveVersion(virtualUrl);
                    loader.data = content;
                    egret.Event.dispatchEvent(loader, egret.Event.COMPLETE);
                };
                egret_native.readFileAsync(virtualUrl, promise);
            }
            function download() {
                var promise = egret.PromiseObject.create();
                promise.onSuccessFunc = onLoadComplete;
                promise.onErrorFunc = function () {
                    egret.Event.dispatchEvent(loader, egret.IOErrorEvent.IO_ERROR);
                };
                egret_native.download(virtualUrl, virtualUrl, promise);
            }
            function onLoadComplete() {
                self.saveVersion(virtualUrl);
                var content = egret_native.readFileSync(virtualUrl);
                loader.data = content;
                egret.Event.dispatchEvent(loader, egret.Event.COMPLETE);
            }
        };
        __egretProto__.getHeaderString = function (request) {
            var headerObj = {};
            var length = request.requestHeaders.length;
            for (var i = 0; i < length; i++) {
                var urlRequestHeader = request.requestHeaders[i];
                headerObj[urlRequestHeader.name] = urlRequestHeader.value;
            }
            return JSON.stringify(headerObj);
        };
        __egretProto__.loadSound = function (loader) {
            var self = this;
            var request = loader._request;
            var virtualUrl = self.getVirtualUrl(request.url);
            if (self.isNetUrl(virtualUrl)) {
                download();
            }
            else if (!egret_native.isFileExists(virtualUrl)) {
                download();
            }
            else if (!self.checkIsNewVersion(virtualUrl)) {
                download();
            }
            else {
                egret.__callAsync(onLoadComplete, self);
            }
            function download() {
                var promise = egret.PromiseObject.create();
                promise.onSuccessFunc = onLoadComplete;
                promise.onErrorFunc = function () {
                    egret.IOErrorEvent.dispatchIOErrorEvent(loader);
                };
                egret_native.download(virtualUrl, virtualUrl, promise);
            }
            function onLoadComplete() {
                self.saveVersion(virtualUrl);
                var nativeAudio = new egret.NativeAudio();
                nativeAudio._setAudio(virtualUrl);
                var sound = new egret.Sound();
                sound._setAudio(nativeAudio);
                loader.data = sound;
                egret.Event.dispatchEvent(loader, egret.Event.COMPLETE);
            }
        };
        __egretProto__.loadTexture = function (loader) {
            var self = this;
            var request = loader._request;
            var virtualUrl = self.getVirtualUrl(request.url);
            if (self.isNetUrl(virtualUrl)) {
                download();
            }
            else if (!egret_native.isFileExists(virtualUrl)) {
                download();
            }
            else if (!self.checkIsNewVersion(virtualUrl)) {
                download();
            }
            else {
                //todo
                //if (NativeNetContext.__use_asyn) {
                //    createBitmapData();
                //}
                //else {
                egret.__callAsync(createBitmapData, self);
            }
            function createBitmapData() {
                egret.Texture.createBitmapData(virtualUrl, function (code, bitmapData) {
                    if (code == 0) {
                        onComplete(bitmapData);
                    }
                    else {
                        egret.IOErrorEvent.dispatchIOErrorEvent(loader);
                    }
                });
            }
            function onComplete(bitmapData) {
                self.saveVersion(virtualUrl);
                var texture = new egret.Texture();
                texture._setBitmapData(bitmapData);
                loader.data = texture;
                egret.Event.dispatchEvent(loader, egret.Event.COMPLETE);
            }
            function download() {
                var promise = egret.PromiseObject.create();
                promise.onSuccessFunc = createBitmapData;
                promise.onErrorFunc = function () {
                    egret.IOErrorEvent.dispatchIOErrorEvent(loader);
                };
                egret_native.download(virtualUrl, virtualUrl, promise);
            }
        };
        /**
         * 是否是网络地址
         * @param url
         * @returns {boolean}
         */
        __egretProto__.isNetUrl = function (url) {
            return url.indexOf("http://") != -1;
        };
        /**
         * 获取虚拟url
         * @param url
         * @returns {string}
         */
        __egretProto__.getVirtualUrl = function (url) {
            if (this._versionCtr) {
                return this._versionCtr.getVirtualUrl(url);
            }
            return url;
        };
        /**
         * 检查文件是否是最新版本
         */
        __egretProto__.checkIsNewVersion = function (virtualUrl) {
            if (this._versionCtr) {
                return this._versionCtr.checkIsNewVersion(virtualUrl);
            }
            return true;
        };
        /**
         * 保存本地版本信息文件
         */
        __egretProto__.saveVersion = function (virtualUrl) {
            if (this._versionCtr) {
                this._versionCtr.saveVersion(virtualUrl);
            }
        };
        /**
         * 获取变化列表
         * @deprecated
         * @returns {any}
         */
        __egretProto__.getChangeList = function () {
            if (this._versionCtr) {
                return this._versionCtr.getChangeList();
            }
            return [];
        };
        NativeNetContext.__use_asyn = egret_native.readFileAsync == null ? false : true;
        return NativeNetContext;
    })(egret.NetContext);
    egret.NativeNetContext = NativeNetContext;
    NativeNetContext.prototype.__class__ = "egret.NativeNetContext";
})(egret || (egret = {}));
