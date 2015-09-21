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
    var TextFieldProperties = (function () {
        function TextFieldProperties() {
            //文本类型
            this._type = "";
            //文本内容
            this._text = "";
            //是否加密
            this._displayAsPassword = false;
            //文本字体
            this._fontFamily = egret.TextField.default_fontFamily;
            //文本字号
            this._size = 30;
            //是否斜体
            this._italic = false;
            //是否加粗
            this._bold = false;
            //文本颜色
            this._textColorString = "#FFFFFF";
            this._textColor = 0xFFFFFF;
            //文本描边颜色
            this._strokeColorString = "#000000";
            this._strokeColor = 0x000000;
            //描边细度
            this._stroke = 0;
            //是否需要背景框
            this._border = false;
            //背景框颜色
            this._borderColor = 0x000000;
            //是否需要背景
            this._background = false;
            //背景颜色
            this._backgroundColor = 0xFFFFFF;
            //水平对齐方式
            this._textAlign = "left";
            //垂直对齐方式
            this._verticalAlign = "top";
            //文本全部显示时宽
            this._textMaxWidth = 0;
            //文本全部显示时高（无行间距）
            this._textMaxHeight = 0;
            //最多可包含的字符数
            this._maxChars = 0;
            //文本在文本字段中的垂直位置
            this._scrollV = -1;
            //行间距
            this._lineSpacing = 0;
            //行数
            this._numLines = 0;
            //输入文本是否是多行
            this._multiline = false;
        }
        var __egretProto__ = TextFieldProperties.prototype;
        return TextFieldProperties;
    })();
    egret.TextFieldProperties = TextFieldProperties;
    TextFieldProperties.prototype.__class__ = "egret.TextFieldProperties";
})(egret || (egret = {}));
