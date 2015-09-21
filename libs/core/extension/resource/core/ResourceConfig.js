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
var RES;
(function (RES) {
    /**
     * @class RES.ResourceConfig
     * @classdesc
     */
    var ResourceConfig = (function () {
        function ResourceConfig() {
            /**
             * 一级键名字典
             */
            this.keyMap = {};
            /**
             * 加载组字典
             */
            this.groupDic = {};
            RES["configInstance"] = this;
        }
        var __egretProto__ = ResourceConfig.prototype;
        /**
         * 根据组名获取组加载项列表
         * @method RES.ResourceConfig#getGroupByName
         * @param name {string} 组名
         * @returns {Array<egret.ResourceItem>}
         */
        __egretProto__.getGroupByName = function (name) {
            var group = new Array();
            if (!this.groupDic[name])
                return group;
            var list = this.groupDic[name];
            var length = list.length;
            for (var i = 0; i < length; i++) {
                var obj = list[i];
                group.push(this.parseResourceItem(obj));
            }
            return group;
        };
        /**
         * 根据组名获取原始的组加载项列表
         * @method RES.ResourceConfig#getRawGroupByName
         * @param name {string} 组名
         * @returns {Array<any>}
         */
        __egretProto__.getRawGroupByName = function (name) {
            if (this.groupDic[name])
                return this.groupDic[name];
            return [];
        };
        /**
         * 创建自定义的加载资源组,注意：此方法仅在资源配置文件加载完成后执行才有效。
         * 可以监听ResourceEvent.CONFIG_COMPLETE事件来确认配置加载完成。
         * @method RES.ResourceConfig#createGroup
         * @param name {string} 要创建的加载资源组的组名
         * @param keys {egret.Array<string>} 要包含的键名列表，key对应配置文件里的name属性或sbuKeys属性的一项或一个资源组名。
         * @param override {boolean} 是否覆盖已经存在的同名资源组,默认false。
         * @returns {boolean}
         */
        __egretProto__.createGroup = function (name, keys, override) {
            if (override === void 0) { override = false; }
            if ((!override && this.groupDic[name]) || !keys || keys.length == 0)
                return false;
            var groupDic = this.groupDic;
            var group = [];
            var length = keys.length;
            for (var i = 0; i < length; i++) {
                var key = keys[i];
                var g = groupDic[key];
                if (g) {
                    var len = g.length;
                    for (var j = 0; j < len; j++) {
                        var item = g[j];
                        if (group.indexOf(item) == -1)
                            group.push(item);
                    }
                }
                else {
                    item = this.keyMap[key];
                    if (item) {
                        if (group.indexOf(item) == -1)
                            group.push(item);
                    }
                    else {
                        egret.Logger.warningWithErrorId(2000, key);
                    }
                }
            }
            if (group.length == 0)
                return false;
            this.groupDic[name] = group;
            return true;
        };
        /**
         * 解析一个配置文件
         * @method RES.ResourceConfig#parseConfig
         * @param data {any} 配置文件数据
         * @param folder {string} 加载项的路径前缀。
         */
        __egretProto__.parseConfig = function (data, folder) {
            if (!data)
                return;
            var resources = data["resources"];
            if (resources) {
                var length = resources.length;
                for (var i = 0; i < length; i++) {
                    var item = resources[i];
                    var url = item.url;
                    if (url && url.indexOf("://") == -1)
                        item.url = folder + url;
                    this.addItemToKeyMap(item);
                }
            }
            var groups = data["groups"];
            if (groups) {
                length = groups.length;
                for (i = 0; i < length; i++) {
                    var group = groups[i];
                    var list = [];
                    var keys = group.keys.split(",");
                    var l = keys.length;
                    for (var j = 0; j < l; j++) {
                        var name = keys[j].trim();
                        item = this.keyMap[name];
                        if (item && list.indexOf(item) == -1) {
                            list.push(item);
                        }
                    }
                    this.groupDic[group.name] = list;
                }
            }
        };
        /**
         * 添加一个二级键名到配置列表。
         * @method RES.ResourceConfig#addSubkey
         * @param subkey {string} 要添加的二级键名
         * @param name {string} 二级键名所属的资源name属性
         */
        __egretProto__.addSubkey = function (subkey, name) {
            var item = this.keyMap[name];
            if (item && !this.keyMap[subkey]) {
                this.keyMap[subkey] = item;
            }
        };
        /**
         * 添加一个加载项数据到列表
         */
        __egretProto__.addItemToKeyMap = function (item) {
            if (!this.keyMap[item.name])
                this.keyMap[item.name] = item;
            if (item.hasOwnProperty("subkeys")) {
                var subkeys = (item.subkeys).split(",");
                item.subkeys = subkeys;
                var length = subkeys.length;
                for (var i = 0; i < length; i++) {
                    var key = subkeys[i];
                    if (this.keyMap[key] != null)
                        continue;
                    this.keyMap[key] = item;
                }
            }
        };
        /**
         * 获取加载项的name属性
         * @method RES.ResourceConfig#getType
         * @param key {string} 对应配置文件里的name属性或sbuKeys属性的一项。
         * @returns {string}
         */
        __egretProto__.getName = function (key) {
            var data = this.keyMap[key];
            return data ? data.name : "";
        };
        /**
         * 获取加载项类型。
         * @method RES.ResourceConfig#getType
         * @param key {string} 对应配置文件里的name属性或sbuKeys属性的一项。
         * @returns {string}
         */
        __egretProto__.getType = function (key) {
            var data = this.keyMap[key];
            return data ? data.type : "";
        };
        __egretProto__.getRawResourceItem = function (key) {
            return this.keyMap[key];
        };
        /**
         * 获取加载项信息对象
         * @method RES.ResourceConfig#getResourceItem
         * @param key {string} 对应配置文件里的key属性或sbuKeys属性的一项。
         * @returns {egret.ResourceItem}
         */
        __egretProto__.getResourceItem = function (key) {
            var data = this.keyMap[key];
            if (data)
                return this.parseResourceItem(data);
            return null;
        };
        /**
         * 转换Object数据为ResourceItem对象
         */
        __egretProto__.parseResourceItem = function (data) {
            var resItem = new RES.ResourceItem(data.name, data.url, data.type);
            resItem.data = data;
            return resItem;
        };
        return ResourceConfig;
    })();
    RES.ResourceConfig = ResourceConfig;
    ResourceConfig.prototype.__class__ = "RES.ResourceConfig";
})(RES || (RES = {}));
