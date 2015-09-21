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
    var NativeVersionController = (function (_super) {
        __extends(NativeVersionController, _super);
        function NativeVersionController() {
            _super.call(this);
            /**
             * 本地版本信息文件存储路径
             */
            this.localVersionDataPath = "localVersion.manifest";
            /**
             * 本地版本信息文件，记录了本地文件版本信息
             */
            this.localVersionData = null;
            /**
             * 本地版本信息文件存储路径
             */
            this.changeVersionDataPath = "version.manifest";
            /**
             * 当前版本信息文件，记录了当前版本中相对于基础版本变化的文件
             */
            this.changeVersionData = null;
            /**
             * 本地版本信息文件存储路径
             */
            this.baseVersionDataPath = "base.manifest";
            /**
             * 基础版本信息文件
             */
            this.baseVersionData = null;
            this.localVersionCodePath = "localCode.manifest";
            this.serverVersionCodePath = "code.manifest";
            this._load = null;
            this._call = null;
        }
        var __egretProto__ = NativeVersionController.prototype;
        //获取当前版本号
        __egretProto__.fetchVersion = function () {
            this._load = new egret.NativeResourceLoader();
            this._load.addEventListener(egret.IOErrorEvent.IO_ERROR, this.loadError, this);
            this._load.addEventListener(egret.Event.COMPLETE, this.fileLoadComplete, this);
            this.initLocalVersionData();
        };
        //初始化本地数据配置
        __egretProto__.initLocalVersionData = function () {
            var self = this;
            //根据appVersion来判断是否是替换过apk或者刚装的apk////////////////////
            var versionPath = "appVersion.manifest";
            //获取安装包内版本号
            var appVersionJson = self.getData(versionPath, true);
            if (appVersionJson) {
                //安装包内有预存文件
                //获取存储空间内版本号信息
                if (appVersionJson["debug"] == 1) {
                    self.baseVersionData = null;
                    //需要清理上个版本与当前版本不同的素材
                    var lastLocalVersionData = self.getData(self.localVersionDataPath, false);
                    if (lastLocalVersionData) {
                        for (var key in lastLocalVersionData) {
                            self.deleteFile(key);
                        }
                    }
                    self.deleteFile(self.localVersionDataPath);
                    self.deleteFile(self.localVersionCodePath);
                    self.loadOver();
                    return;
                }
                else {
                    var sdVersionJson = self.getData(versionPath, false);
                    if (sdVersionJson == null || sdVersionJson["version"] != appVersionJson["version"]) {
                        self.localVersionData = self.getData(self.localVersionDataPath, true);
                        if (self.localVersionData == null) {
                            self.localVersionData = {};
                        }
                        //删除版本号对比
                        self.deleteFile(self.localVersionCodePath);
                        self.save(versionPath, JSON.stringify(appVersionJson));
                        //需要清理上个版本与当前版本不同的素材
                        var lastLocalVersionData = self.getData(self.localVersionCodePath, false);
                        if (lastLocalVersionData) {
                            for (var key in lastLocalVersionData) {
                                if (lastLocalVersionData[key] != self.localVersionData[key]) {
                                    self.deleteFile(key);
                                }
                            }
                        }
                        else {
                            lastLocalVersionData = {};
                        }
                        for (var key in self.localVersionData) {
                            if (lastLocalVersionData[key] != self.localVersionData[key]) {
                                self.deleteFile(key);
                            }
                        }
                        self.save(self.localVersionDataPath, JSON.stringify(self.localVersionData));
                        self.loadCodeVersion();
                        return;
                    }
                }
            }
            /////////////////////////////////////////////////////////
            //初始化localVersonData
            self.localVersionData = self.getLocalData(self.localVersionDataPath);
            if (self.localVersionData == null) {
                self.localVersionData = self.getLocalData(self.baseVersionDataPath);
                if (self.localVersionData == null) {
                    self.localVersionData = {};
                }
                self.save(self.localVersionDataPath, JSON.stringify(self.localVersionData));
            }
            self.loadCodeVersion();
        };
        __egretProto__.deleteFile = function (file) {
            if (egret_native.deleteUpdateFile) {
                egret_native.deleteUpdateFile(file);
            }
        };
        //初始化本地版本控制号数据
        __egretProto__.loadCodeVersion = function () {
            var localCode = 1;
            this.newCode = 1;
            var localVersionCode = this.getLocalData(this.localVersionCodePath);
            if (localVersionCode != null) {
                localCode = localVersionCode["code"];
            }
            var serverVersionCode = this.getLocalData(this.serverVersionCodePath);
            if (serverVersionCode != null) {
                this.newCode = serverVersionCode["code"];
            }
            this.loadBaseVersion(localCode != this.newCode);
        };
        __egretProto__.loadBaseVersion = function (neesUpdate) {
            this.baseVersionData = this.getLocalData(this.baseVersionDataPath);
            this.changeVersionData = this.getLocalData(this.changeVersionDataPath);
            //加载baseVersionData
            var self = this;
            if (self.baseVersionData == null || neesUpdate) {
                self.loadFile(self.baseVersionDataPath, function () {
                    self.baseVersionData = self.getLocalData(self.baseVersionDataPath);
                    self.loadBaseOver();
                });
            }
            else {
                self.loadBaseOver();
            }
        };
        __egretProto__.loadBaseOver = function () {
            //保存localCode文件
            this.save(this.localVersionCodePath, JSON.stringify({ "code": this.newCode }));
            this.loadOver();
        };
        __egretProto__.loadFile = function (file, call) {
            if (call === void 0) { call = null; }
            this._call = call;
            this._load.load(file, 1000);
        };
        __egretProto__.fileLoadComplete = function (e) {
            if (this._call) {
                this._call();
            }
        };
        __egretProto__.loadError = function (e) {
            this._load.removeEventListener(egret.IOErrorEvent.IO_ERROR, this.loadError, this);
            this._load.removeEventListener(egret.Event.COMPLETE, this.fileLoadComplete, this);
            this.dispatchEvent(e);
        };
        __egretProto__.loadOver = function () {
            this._load.removeEventListener(egret.IOErrorEvent.IO_ERROR, this.loadError, this);
            this._load.removeEventListener(egret.Event.COMPLETE, this.fileLoadComplete, this);
            this.dispatchEvent(new egret.Event(egret.Event.COMPLETE));
        };
        __egretProto__.save = function (path, value) {
            if (egret_native.writeFileSync) {
                egret_native.writeFileSync(path, value);
            }
            else if (egret_native.saveRecord) {
                egret_native.saveRecord(path, value);
            }
        };
        __egretProto__.getData = function (filePath, isApp) {
            if (egret_native.readUpdateFileSync && egret_native.readResourceFileSync) {
                if (isApp) {
                    var str = egret_native.readResourceFileSync(filePath);
                    return str != null ? JSON.parse(str) : null;
                }
                else {
                    var str = egret_native.readUpdateFileSync(filePath);
                    return str != null ? JSON.parse(str) : null;
                }
            }
            else {
                return this.getLocalDataByOld(filePath);
            }
        };
        __egretProto__.getLocalData = function (filePath) {
            if (egret_native.readUpdateFileSync && egret_native.readResourceFileSync) {
                //先取更新目录
                var content = egret_native.readUpdateFileSync(filePath);
                if (content != null) {
                    return JSON.parse(content);
                }
                //再取资源目录
                content = egret_native.readResourceFileSync(filePath);
                if (content != null) {
                    return JSON.parse(content);
                }
                return null;
            }
            else {
                return this.getLocalDataByOld(filePath);
            }
        };
        //todo 旧方式
        __egretProto__.getLocalDataByOld = function (filePath) {
            var data = null;
            if (egret_native.isRecordExists(filePath)) {
                var str = egret_native.loadRecord(filePath);
                data = JSON.parse(str);
            }
            else if (egret_native.isFileExists(filePath)) {
                var str = egret_native.readFileSync(filePath);
                data = JSON.parse(str);
            }
            return data;
        };
        /**
         * 获取所有有变化的文件
         * @returns {Array<string>}
         */
        __egretProto__.getChangeList = function () {
            if (!this.baseVersionData) {
                return [];
            }
            var changeDatas = {};
            for (var key in this.changeVersionData) {
                if (this.changeVersionData[key]["d"] == 1) {
                    delete this.baseVersionData[key];
                }
                else {
                    this.baseVersionData[key] = this.changeVersionData[key];
                }
            }
            for (var key in this.baseVersionData) {
                if (this.localVersionData[key] == null || !this.compareVersion(this.localVersionData, this.baseVersionData, key)) {
                    changeDatas[key] = { "url": key, "size": this.baseVersionData[key]["s"] };
                }
            }
            var list = [];
            for (var key in changeDatas) {
                list.push(changeDatas[key]);
            }
            return list;
        };
        __egretProto__.compareVersion = function (oldVersion, newVersion, url) {
            if (oldVersion[url] == null || newVersion[url] == null) {
                return false;
            }
            return oldVersion[url]["v"] == newVersion[url]["v"];
        };
        /**
         * 检查文件是否是最新版本
         */
        __egretProto__.checkIsNewVersion = function (url) {
            if (!this.baseVersionData) {
                return true;
            }
            if (this.changeVersionData[url] != null) {
                return this.compareVersion(this.changeVersionData, this.localVersionData, url);
            }
            else if (this.baseVersionData[url] != null) {
                return this.compareVersion(this.baseVersionData, this.localVersionData, url);
            }
            return true;
        };
        /**
         * 保存本地版本信息文件
         */
        __egretProto__.saveVersion = function (url) {
            if (!this.baseVersionData) {
                return;
            }
            var change = false;
            if (this.changeVersionData[url] != null) {
                if (!this.compareVersion(this.changeVersionData, this.localVersionData, url)) {
                    change = true;
                    this.localVersionData[url] = this.changeVersionData[url];
                }
            }
            else if (this.baseVersionData[url] != null) {
                if (!this.compareVersion(this.baseVersionData, this.localVersionData, url)) {
                    change = true;
                    this.localVersionData[url] = this.baseVersionData[url];
                }
            }
            if (change) {
                this.save(this.localVersionDataPath, JSON.stringify(this.localVersionData));
            }
        };
        __egretProto__.getVirtualUrl = function (url) {
            return url;
        };
        return NativeVersionController;
    })(egret.EventDispatcher);
    egret.NativeVersionController = NativeVersionController;
    NativeVersionController.prototype.__class__ = "egret.NativeVersionController";
})(egret || (egret = {}));
