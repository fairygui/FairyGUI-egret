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
     * @classdesc
     * @class egret.BitmapFont
     * 位图字体,是一个字体的纹理集，通常作为BitmapText.font属性的值。
     * @link
     * http://bbs.egret-labs.org/thread-918-1-1.html TextureMerger
     * http://bbs.egret-labs.org/forum.php?mod=viewthread&tid=251 文本(含位图字体具体用法)
     * @extends egret.SpriteSheet
     */
    var BitmapFont = (function (_super) {
        __extends(BitmapFont, _super);
        /**
         * 创建一个 egret.BitmapFont 对象
         * @param texture {egret.Texture} 纹理集
         * @param config {any} 配置数据
         */
        function BitmapFont(texture, config) {
            _super.call(this, texture);
            this.firstCharHeight = 0;
            if (typeof (config) == "string") {
                this.charList = this.parseConfig(config);
            }
            else if (config && config.hasOwnProperty("frames")) {
                this.charList = config.frames;
            }
            else {
                this.charList = {};
            }
        }
        var __egretProto__ = BitmapFont.prototype;
        /**
         * 通过 name 属性获取对应纹理
         * @param name {string} name属性
         * @method egret.BitmapFont#getTexture
         * @returns {egret.Texture}
         */
        __egretProto__.getTexture = function (name) {
            var texture = this._textureMap[name];
            if (!texture) {
                var c = this.charList[name];
                if (!c) {
                    return null;
                }
                texture = this.createTexture(name, c.x, c.y, c.w, c.h, c.offX, c.offY, c.sourceW, c.sourceH);
                this._textureMap[name] = texture;
            }
            return texture;
        };
        __egretProto__._getFirstCharHeight = function () {
            if (this.firstCharHeight == 0) {
                for (var str in this.charList) {
                    var c = this.charList[str];
                    if (c) {
                        var sourceH = c.sourceH;
                        if (sourceH === undefined) {
                            var h = c.h;
                            if (h === undefined) {
                                h = 0;
                            }
                            var offY = c.offY;
                            if (offY === undefined) {
                                offY = 0;
                            }
                            sourceH = h + offY;
                        }
                        if (sourceH <= 0) {
                            continue;
                        }
                        this.firstCharHeight = sourceH;
                        break;
                    }
                }
            }
            return this.firstCharHeight;
        };
        __egretProto__.parseConfig = function (fntText) {
            fntText = fntText.split("\r\n").join("\n");
            var lines = fntText.split("\n");
            var charsCount = this.getConfigByKey(lines[3], "count");
            var chars = {};
            for (var i = 4; i < 4 + charsCount; i++) {
                var charText = lines[i];
                var letter = String.fromCharCode(this.getConfigByKey(charText, "id"));
                var c = {};
                chars[letter] = c;
                c["x"] = this.getConfigByKey(charText, "x");
                c["y"] = this.getConfigByKey(charText, "y");
                c["w"] = this.getConfigByKey(charText, "width");
                c["h"] = this.getConfigByKey(charText, "height");
                c["offX"] = this.getConfigByKey(charText, "xoffset");
                c["offY"] = this.getConfigByKey(charText, "yoffset");
            }
            return chars;
        };
        __egretProto__.getConfigByKey = function (configText, key) {
            var itemConfigTextList = configText.split(" ");
            for (var i = 0, length = itemConfigTextList.length; i < length; i++) {
                var itemConfigText = itemConfigTextList[i];
                if (key == itemConfigText.substring(0, key.length)) {
                    var value = itemConfigText.substring(key.length + 1);
                    return parseInt(value);
                }
            }
            return 0;
        };
        return BitmapFont;
    })(egret.SpriteSheet);
    egret.BitmapFont = BitmapFont;
    BitmapFont.prototype.__class__ = "egret.BitmapFont";
})(egret || (egret = {}));
