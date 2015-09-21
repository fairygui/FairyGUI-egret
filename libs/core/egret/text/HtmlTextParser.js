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
     * @class egret.HtmlTextParser
     * @classdesc 将html格式文本转换为可赋值给 egret.TextField#textFlow 属性的对象
     * @link http://docs.egret-labs.org/jkdoc/manual-text-multiformat.html 多种样式文本混合
     */
    var HtmlTextParser = (function () {
        function HtmlTextParser() {
            this.resutlArr = [];
        }
        var __egretProto__ = HtmlTextParser.prototype;
        /**
         * 将html格式文本转换为可赋值给 egret.TextField#textFlow 属性的对象
         * @param htmltext {string} html文本
         * @method egret.HtmlTextParser#parser
         * @returns {Array<egret.ITextElement>} 可赋值给 egret.TextField#textFlow 属性的对象
         */
        __egretProto__.parser = function (htmltext) {
            this.stackArray = [];
            this.resutlArr = [];
            var firstIdx = 0; //文本段开始位置
            var length = htmltext.length;
            while (firstIdx < length) {
                var starIdx = htmltext.indexOf("<", firstIdx);
                if (starIdx < 0) {
                    this.addToResultArr(htmltext.substring(firstIdx));
                    firstIdx = length;
                }
                else {
                    this.addToResultArr(htmltext.substring(firstIdx, starIdx));
                    var fontEnd = htmltext.indexOf(">", starIdx);
                    if (htmltext.charAt(starIdx + 1) == "\/") {
                        this.stackArray.pop();
                    }
                    else {
                        this.addToArray(htmltext.substring(starIdx + 1, fontEnd));
                    }
                    firstIdx = fontEnd + 1;
                }
            }
            return this.resutlArr;
        };
        __egretProto__.addToResultArr = function (value) {
            if (value == "") {
                return;
            }
            var resutlArr = [];
            resutlArr.push(["&lt;", "<"]);
            resutlArr.push(["&gt;", ">"]);
            resutlArr.push(["&amp;", "&"]);
            resutlArr.push(["&quot;", "\""]);
            resutlArr.push(["&apos;;", "\'"]);
            for (var i = 0; i < resutlArr.length; i++) {
                var k = resutlArr[i][0];
                var v = resutlArr[i][1];
                var reg = new RegExp(k, "g");
                value.replace(reg, v);
            }
            if (this.stackArray.length > 0) {
                this.resutlArr.push({ text: value, style: this.stackArray[this.stackArray.length - 1] });
            }
            else {
                this.resutlArr.push({ text: value });
            }
        };
        //将字符数据转成Json数据
        __egretProto__.changeStringToObject = function (str) {
            var info = {};
            var array = str.replace(/( )+/g, " ").split(" ");
            for (var i = 0; i < array.length; i++) {
                this.addProperty(info, array[i]);
            }
            return info;
        };
        __egretProto__.addProperty = function (info, prV) {
            var valueArr = prV.replace(/( )*=( )*/g, "=").split("=");
            if (valueArr[1]) {
                valueArr[1] = valueArr[1].replace(/(\"|\')/g, "");
            }
            switch (valueArr[0].toLowerCase()) {
                case "color":
                case "textcolor":
                    valueArr[1] = valueArr[1].replace(/#/, "0x");
                    info.textColor = parseInt(valueArr[1]);
                    break;
                case "strokecolor":
                    valueArr[1] = valueArr[1].replace(/#/, "0x");
                    info.strokeColor = parseInt(valueArr[1]);
                    break;
                case "stroke":
                    info.stroke = parseInt(valueArr[1]);
                    break;
                case "b":
                    info.bold = (valueArr[1] || "true") == "true";
                    break;
                case "i":
                    info.italic = (valueArr[1] || "true") == "true";
                    break;
                case "size":
                    info.size = parseInt(valueArr[1]);
                    break;
                case "fontfamily":
                    info.fontFamily = valueArr[1];
                    break;
                case "href":
                    info.href = valueArr[1];
                    break;
            }
        };
        __egretProto__.addToArray = function (infoStr) {
            var info = this.changeStringToObject(infoStr);
            if (this.stackArray.length == 0) {
                this.stackArray.push(info);
            }
            else {
                var lastInfo = this.stackArray[this.stackArray.length - 1];
                for (var key in lastInfo) {
                    if (info[key] == null) {
                        info[key] = lastInfo[key];
                    }
                }
                this.stackArray.push(info);
            }
        };
        return HtmlTextParser;
    })();
    egret.HtmlTextParser = HtmlTextParser;
    HtmlTextParser.prototype.__class__ = "egret.HtmlTextParser";
})(egret || (egret = {}));
