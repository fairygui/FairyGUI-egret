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
     * @class egret.ProgressEvent
     * @classdesc
     * 当加载操作已开始或套接字已接收到数据时，将调度 ProgressEvent 对象。
     * 有两种类型的进程事件：ProgressEvent.PROGRESS 和 ProgressEvent.SOCKET_DATA。
     */
    var ProgressEvent = (function (_super) {
        __extends(ProgressEvent, _super);
        /**
         * 创建一个 egret.ProgressEvent 对象
         * @method egret.ProgressEvent#constructor
         * @param type {string} 事件类型
         * @param bubbles {boolean}
         * @param cancelable {boolean}
         * @param bytesLoaded {number}
         * @param bytesTotal {number}
         */
        function ProgressEvent(type, bubbles, cancelable, bytesLoaded, bytesTotal) {
            if (bubbles === void 0) { bubbles = false; }
            if (cancelable === void 0) { cancelable = false; }
            if (bytesLoaded === void 0) { bytesLoaded = 0; }
            if (bytesTotal === void 0) { bytesTotal = 0; }
            _super.call(this, type, bubbles, cancelable);
            /**
             * 在侦听器处理事件时加载的项数或字节数。
             * @member {number} egret.ProgressEvent#bytesLoaded
             */
            this.bytesLoaded = 0;
            /**
             * 如果加载过程成功，将加载的总项数或总字节数。
             * @member {number} egret.ProgressEvent#bytesTotal
             */
            this.bytesTotal = 0;
            this.bytesLoaded = bytesLoaded;
            this.bytesTotal = bytesTotal;
        }
        var __egretProto__ = ProgressEvent.prototype;
        /**
         * 使用指定的EventDispatcher对象来抛出Event事件对象。抛出的对象将会缓存在对象池上，供下次循环复用。
         * @method egret.ProgressEvent.dispatchIOErrorEvent
         * @param target {egret.IEventDispatcher} 派发事件目标
         * @param type {string} 事件类型
         * @param bytesLoaded {number} 加载的项数或字节数
         * @param bytesTotal {number} 加载的总项数或总字节数
         */
        ProgressEvent.dispatchProgressEvent = function (target, type, bytesLoaded, bytesTotal) {
            if (bytesLoaded === void 0) { bytesLoaded = 0; }
            if (bytesTotal === void 0) { bytesTotal = 0; }
            egret.Event._dispatchByTarget(ProgressEvent, target, type, { "bytesLoaded": bytesLoaded, "bytesTotal": bytesTotal });
        };
        /**
         * @constant {string} egret.ProgressEvent.PROGRESS
         */
        ProgressEvent.PROGRESS = "progress";
        /**
         * @constant {string} egret.ProgressEvent.SOCKET_DATA
         */
        ProgressEvent.SOCKET_DATA = "socketData";
        return ProgressEvent;
    })(egret.Event);
    egret.ProgressEvent = ProgressEvent;
    ProgressEvent.prototype.__class__ = "egret.ProgressEvent";
})(egret || (egret = {}));
