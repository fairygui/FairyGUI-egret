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
     * @class RES.ResourceLoader
     * @classdesc
     * @extends egret.EventDispatcher
     */
    var ResourceLoader = (function (_super) {
        __extends(ResourceLoader, _super);
        /**
         * 构造函数
         * @method RES.ResourceLoader#constructor
         */
        function ResourceLoader() {
            _super.call(this);
            /**
             * 最大并发加载数
             */
            this.thread = 2;
            /**
             * 正在加载的线程计数
             */
            this.loadingCount = 0;
            /**
             * 一项加载结束回调函数。无论加载成功或者出错都将执行回调函数。示例：callBack(resItem:ResourceItem):void;
             * @member {Function} RES.ResourceLoader#callBack
             */
            this.callBack = null;
            /**
             * RES单例的引用
             * @member {any} RES.ResourceLoader#resInstance
             */
            this.resInstance = null;
            /**
             * 当前组加载的项总个数,key为groupName
             */
            this.groupTotalDic = {};
            /**
             * 已经加载的项个数,key为groupName
             */
            this.numLoadedDic = {};
            /**
             * 正在加载的组列表,key为groupName
             */
            this.itemListDic = {};
            /**
             * 加载失败的组,key为groupName
             */
            this.groupErrorDic = {};
            this.retryTimesDic = {};
            this.maxRetryTimes = 3;
            this.failedList = new Array();
            /**
             * 优先级队列,key为priority，value为groupName列表
             */
            this.priorityQueue = {};
            /**
             * 延迟加载队列
             */
            this.lazyLoadList = new Array();
            /**
             * 资源解析库字典类
             */
            this.analyzerDic = {};
            /**
             * 当前应该加载同优先级队列的第几列
             */
            this.queueIndex = 0;
        }
        var __egretProto__ = ResourceLoader.prototype;
        /**
         * 检查指定的组是否正在加载中
         * @method RES.ResourceLoader#isGroupInLoading
         * @param groupName {string}
         * @returns {boolean}
         */
        __egretProto__.isGroupInLoading = function (groupName) {
            return this.itemListDic[groupName] !== undefined;
        };
        /**
         * 开始加载一组文件
         * @method RES.ResourceLoader#loadGroup
         * @param list {egret.Array<ResourceItem>} 加载项列表
         * @param groupName {string} 组名
         * @param priority {number} 加载优先级
         */
        __egretProto__.loadGroup = function (list, groupName, priority) {
            if (priority === void 0) { priority = 0; }
            if (this.itemListDic[groupName] || !groupName)
                return;
            if (!list || list.length == 0) {
                egret.Logger.warningWithErrorId(2001, groupName);
                var event = new RES.ResourceEvent(RES.ResourceEvent.GROUP_LOAD_ERROR);
                event.groupName = groupName;
                this.dispatchEvent(event);
                return;
            }
            if (this.priorityQueue[priority])
                this.priorityQueue[priority].push(groupName);
            else
                this.priorityQueue[priority] = [groupName];
            this.itemListDic[groupName] = list;
            var length = list.length;
            for (var i = 0; i < length; i++) {
                var resItem = list[i];
                resItem.groupName = groupName;
            }
            this.groupTotalDic[groupName] = list.length;
            this.numLoadedDic[groupName] = 0;
            this.next();
        };
        /**
         * 加载一个文件
         * @method RES.ResourceLoader#loadItem
         * @param resItem {egret.ResourceItem} 要加载的项
         */
        __egretProto__.loadItem = function (resItem) {
            this.lazyLoadList.push(resItem);
            resItem.groupName = "";
            this.next();
        };
        /**
         * 加载下一项
         */
        __egretProto__.next = function () {
            while (this.loadingCount < this.thread) {
                var resItem = this.getOneResourceItem();
                if (!resItem)
                    break;
                this.loadingCount++;
                if (resItem.loaded) {
                    this.onItemComplete(resItem);
                }
                else {
                    var analyzer = this.analyzerDic[resItem.type];
                    if (!analyzer) {
                        analyzer = this.analyzerDic[resItem.type] = egret.Injector.getInstance(RES.AnalyzerBase, resItem.type);
                    }
                    analyzer.loadFile(resItem, this.onItemComplete, this);
                }
            }
        };
        /**
         * 获取下一个待加载项
         */
        __egretProto__.getOneResourceItem = function () {
            if (this.failedList.length > 0)
                return this.failedList.shift();
            var maxPriority = Number.NEGATIVE_INFINITY;
            for (var p in this.priorityQueue) {
                maxPriority = Math.max(maxPriority, p);
            }
            var queue = this.priorityQueue[maxPriority];
            if (!queue || queue.length == 0) {
                if (this.lazyLoadList.length == 0)
                    return null;
                //后请求的先加载，以便更快获取当前需要的资源
                return this.lazyLoadList.pop();
            }
            var length = queue.length;
            var list;
            for (var i = 0; i < length; i++) {
                if (this.queueIndex >= length)
                    this.queueIndex = 0;
                list = this.itemListDic[queue[this.queueIndex]];
                if (list.length > 0)
                    break;
                this.queueIndex++;
            }
            if (list.length == 0)
                return null;
            return list.shift();
        };
        /**
         * 加载结束
         */
        __egretProto__.onItemComplete = function (resItem) {
            this.loadingCount--;
            var groupName = resItem.groupName;
            if (!resItem.loaded) {
                var times = this.retryTimesDic[resItem.name] || 1;
                if (times > this.maxRetryTimes) {
                    delete this.retryTimesDic[resItem.name];
                    RES.ResourceEvent.dispatchResourceEvent(this.resInstance, RES.ResourceEvent.ITEM_LOAD_ERROR, groupName, resItem);
                }
                else {
                    this.retryTimesDic[resItem.name] = times + 1;
                    this.failedList.push(resItem);
                    this.next();
                    return;
                }
            }
            if (groupName) {
                this.numLoadedDic[groupName]++;
                var itemsLoaded = this.numLoadedDic[groupName];
                var itemsTotal = this.groupTotalDic[groupName];
                if (!resItem.loaded) {
                    this.groupErrorDic[groupName] = true;
                }
                RES.ResourceEvent.dispatchResourceEvent(this.resInstance, RES.ResourceEvent.GROUP_PROGRESS, groupName, resItem, itemsLoaded, itemsTotal);
                if (itemsLoaded == itemsTotal) {
                    var groupError = this.groupErrorDic[groupName];
                    this.removeGroupName(groupName);
                    delete this.groupTotalDic[groupName];
                    delete this.numLoadedDic[groupName];
                    delete this.itemListDic[groupName];
                    delete this.groupErrorDic[groupName];
                    if (groupError) {
                        RES.ResourceEvent.dispatchResourceEvent(this, RES.ResourceEvent.GROUP_LOAD_ERROR, groupName);
                    }
                    else {
                        RES.ResourceEvent.dispatchResourceEvent(this, RES.ResourceEvent.GROUP_COMPLETE, groupName);
                    }
                }
            }
            else {
                this.callBack.call(this.resInstance, resItem);
            }
            this.next();
        };
        /**
         * 从优先级队列中移除指定的组名
         */
        __egretProto__.removeGroupName = function (groupName) {
            for (var p in this.priorityQueue) {
                var queue = this.priorityQueue[p];
                var length = queue.length;
                var index = 0;
                var found = false;
                var length = queue.length;
                for (var i = 0; i < length; i++) {
                    var name = queue[i];
                    if (name == groupName) {
                        queue.splice(index, 1);
                        found = true;
                        break;
                    }
                    index++;
                }
                if (found) {
                    if (queue.length == 0) {
                        delete this.priorityQueue[p];
                    }
                    break;
                }
            }
        };
        return ResourceLoader;
    })(egret.EventDispatcher);
    RES.ResourceLoader = ResourceLoader;
    ResourceLoader.prototype.__class__ = "RES.ResourceLoader";
})(RES || (RES = {}));
