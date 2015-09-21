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
     * @class RES.ResourceItem
     * @classdesc
     */
    var ResourceItem = (function () {
        /**
         * 构造函数
         * @method RES.ResourceItem#constructor
         * @param name {string} 加载项名称
         * @param url {string} 要加载的文件地址
         * @param type {string} 加载项文件类型
         */
        function ResourceItem(name, url, type) {
            /**
             * 所属组名
             * @member {string} RES.ResourceItem#groupName
             */
            this.groupName = "";
            /**
             * 被引用的原始数据对象
             * @member {any} RES.ResourceItem#data
             */
            this.data = null;
            this._loaded = false;
            this.name = name;
            this.url = url;
            this.type = type;
        }
        var __egretProto__ = ResourceItem.prototype;
        Object.defineProperty(__egretProto__, "loaded", {
            /**
             * 加载完成的标志
             * @member {boolean} RES.ResourceItem#loaded
             */
            get: function () {
                return this.data ? this.data.loaded : this._loaded;
            },
            set: function (value) {
                if (this.data)
                    this.data.loaded = value;
                this._loaded = value;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 转成字符串
         * @method RES.ResourceItem#toString
         * @returns {string}
         */
        __egretProto__.toString = function () {
            return "[ResourceItem name=\"" + this.name + "\" url=\"" + this.url + "\" type=\"" + this.type + "\"]";
        };
        /**
         * XML文件
         * @constant {string} RES.ResourceItem.TYPE_XML
         */
        ResourceItem.TYPE_XML = "xml";
        /**
         * 图片文件
         * @constant {string} RES.ResourceItem.TYPE_IMAGE
         */
        ResourceItem.TYPE_IMAGE = "image";
        /**
         * 二进制流文件
         * @constant {string} RES.ResourceItem.TYPE_BIN
         */
        ResourceItem.TYPE_BIN = "bin";
        /**
         * 文本文件(解析为字符串)
         * @constant {string} RES.ResourceItem.TYPE_TEXT
         */
        ResourceItem.TYPE_TEXT = "text";
        /**
         * JSON文件
         * @constant {string} RES.ResourceItem.TYPE_JSON
         */
        ResourceItem.TYPE_JSON = "json";
        /**
         * SpriteSheet文件
         * @constant {string} RES.ResourceItem.TYPE_SHEET
         */
        ResourceItem.TYPE_SHEET = "sheet";
        /**
         * BitmapTextSpriteSheet文件
         * @constant {string} RES.ResourceItem.TYPE_FONT
         */
        ResourceItem.TYPE_FONT = "font";
        /**
         * 声音文件
         * @constant {string} RES.ResourceItem.TYPE_SOUND
         */
        ResourceItem.TYPE_SOUND = "sound";
        return ResourceItem;
    })();
    RES.ResourceItem = ResourceItem;
    ResourceItem.prototype.__class__ = "RES.ResourceItem";
})(RES || (RES = {}));
