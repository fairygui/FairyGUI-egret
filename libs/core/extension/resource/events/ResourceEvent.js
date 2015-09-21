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
     * @class RES.ResourceEvent
     * @classdesc
     * @extends egret.Event
     */
    var ResourceEvent = (function (_super) {
        __extends(ResourceEvent, _super);
        /**
         * 构造函数
         * @method RES.ResourceEvent#constructor
         * @param type {string}
         * @param bubbles {boolean}
         * @param cancelable {boolean}
         */
        function ResourceEvent(type, bubbles, cancelable) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            _super.call(this, type, bubbles, cancelable);
            /**
             * 已经加载的文件数
             * @member {number} RES.ResourceEvent#itemsLoaded
             */
            this.itemsLoaded = 0;
            /**
             * 要加载的总文件数
             * @member {number} RES.ResourceEvent#itemsTotal
             */
            this.itemsTotal = 0;
            /**
             * 资源组名
             * @member {string} RES.ResourceEvent#groupName
             */
            this.groupName = "";
            /**
             * 一次加载项加载结束的项信息对象
             * @member {egret.ResourceItem} RES.ResourceEvent#resItem
             */
            this.resItem = null;
        }
        var __egretProto__ = ResourceEvent.prototype;
        /**
         * 使用指定的EventDispatcher对象来抛出事件对象。抛出的对象将会缓存在对象池上，供下次循环复用。
         * @method RES.ResourceEvent.dispatchResourceEvent
         * @param target {egret.IEventDispatcher}
         * @param type {string}
         * @param groupName {string}
         * @param resItem {egret.ResourceItem}
         * @param itemsLoaded {number}
         * @param itemsTotal {number}
         */
        ResourceEvent.dispatchResourceEvent = function (target, type, groupName, resItem, itemsLoaded, itemsTotal) {
            if (groupName === void 0) { groupName = ""; }
            if (resItem === void 0) { resItem = null; }
            if (itemsLoaded === void 0) { itemsLoaded = 0; }
            if (itemsTotal === void 0) { itemsTotal = 0; }
            var eventClass = ResourceEvent;
            var props = egret.Event._getPropertyData(eventClass);
            props.groupName = groupName;
            props.resItem = resItem;
            props.itemsLoaded = itemsLoaded;
            props.itemsTotal = itemsTotal;
            egret.Event._dispatchByTarget(eventClass, target, type, props);
        };
        /**
         * 一个加载项加载失败事件。
         * @constant {string} RES.ResourceEvent.ITEM_LOAD_ERROR
         */
        ResourceEvent.ITEM_LOAD_ERROR = "itemLoadError";
        /**
         * 配置文件加载并解析完成事件。注意：若有配置文件加载失败，将不会抛出此事件，若要处理配置加载失败，请同时监听CONFIG_LOAD_ERROR事件。
         * @constant {string} RES.ResourceEvent.CONFIG_COMPLETE
         */
        ResourceEvent.CONFIG_COMPLETE = "configComplete";
        /**
         * 配置文件加载失败事件
         * @constant {string} RES.ResourceEvent.CONFIG_COMPLETE
         */
        ResourceEvent.CONFIG_LOAD_ERROR = "configLoadError";
        /**
         * 延迟加载组资源加载进度事件
         * @constant {string} RES.ResourceEvent.GROUP_PROGRESS
         */
        ResourceEvent.GROUP_PROGRESS = "groupProgress";
        /**
         * 延迟加载组资源加载完成事件。注意：若组内有资源项加载失败，将不会抛出此事件，若要处理组加载失败，请同时监听GROUP_LOAD_ERROR事件。
         * @constant {string} RES.ResourceEvent.GROUP_COMPLETE
         */
        ResourceEvent.GROUP_COMPLETE = "groupComplete";
        /**
         * 延迟加载组资源加载失败事件
         * @constant {string} RES.ResourceEvent.GROUP_LOAD_ERROR
         */
        ResourceEvent.GROUP_LOAD_ERROR = "groupLoadError";
        return ResourceEvent;
    })(egret.Event);
    RES.ResourceEvent = ResourceEvent;
    ResourceEvent.prototype.__class__ = "RES.ResourceEvent";
})(RES || (RES = {}));
