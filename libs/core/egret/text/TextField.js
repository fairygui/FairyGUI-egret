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
     * @class egret.TextField
     * @classdesc
     * TextField是egret的文本渲染类，采用浏览器/设备的API进行渲染，在不同的浏览器/设备中由于字体渲染方式不一，可能会有渲染差异
     * 如果开发者希望所有平台完全无差异，请使用BitmapText
     * @extends egret.DisplayObject
     * @link http://docs.egret-labs.org/post/manual/text/createtext.html 创建文本
     */
    var TextField = (function (_super) {
        __extends(TextField, _super);
        function TextField() {
            _super.call(this);
            this._inputEnabled = false;
            this._inputUtils = null;
            this._bgGraphics = null;
            this._isFlow = false;
            this._textArr = [];
            this._isArrayChanged = false;
            this._linesArr = [];
            this._isTyping = false;
            this.needDraw = true;
            this._TF_Props_ = new egret.TextFieldProperties();
        }
        var __egretProto__ = TextField.prototype;
        __egretProto__.isInput = function () {
            return this._TF_Props_._type == egret.TextFieldType.INPUT;
        };
        __egretProto__._setTouchEnabled = function (value) {
            _super.prototype._setTouchEnabled.call(this, value);
            if (this.isInput()) {
                this._inputEnabled = true;
            }
        };
        Object.defineProperty(__egretProto__, "type", {
            get: function () {
                return this._TF_Props_._type;
            },
            /**
             * 文本字段的类型。
             * 以下 TextFieldType 常量中的任一个：TextFieldType.DYNAMIC（指定用户无法编辑的动态文本字段），或 TextFieldType.INPUT（指定用户可以编辑的输入文本字段）。
             * 默认值为 dynamic。
             * @member {string} egret.TextField#type
             */
            set: function (value) {
                this._setType(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setType = function (value) {
            var self = this;
            var properties = self._TF_Props_;
            if (properties._type != value) {
                properties._type = value;
                if (properties._type == egret.TextFieldType.INPUT) {
                    if (!this._DO_Props_._hasWidthSet) {
                        this._setWidth(100);
                    }
                    if (!this._DO_Props_._hasHeightSet) {
                        this._setHeight(30);
                    }
                    //创建stageText
                    if (this._inputUtils == null) {
                        this._inputUtils = new egret.InputController();
                    }
                    this._inputUtils.init(this);
                    this._setDirty();
                    if (this._DO_Props_._stage) {
                        this._inputUtils._addStageText();
                    }
                }
                else {
                    if (this._inputUtils) {
                        this._inputUtils._removeStageText();
                        this._inputUtils = null;
                    }
                }
            }
        };
        Object.defineProperty(__egretProto__, "text", {
            get: function () {
                return this._getText();
            },
            /**
             * 作为文本字段中当前文本的字符串
             * @member {string} egret.TextField#text
             */
            set: function (value) {
                this._setText(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._getText = function () {
            if (this._TF_Props_._type == egret.TextFieldType.INPUT) {
                return this._inputUtils._getText();
            }
            return this._TF_Props_._text;
        };
        __egretProto__._setSizeDirty = function () {
            _super.prototype._setSizeDirty.call(this);
            this._isArrayChanged = true;
        };
        __egretProto__._setTextDirty = function () {
            this._setSizeDirty();
        };
        __egretProto__._setBaseText = function (value) {
            if (value == null) {
                value = "";
            }
            var self = this;
            var properties = self._TF_Props_;
            this._isFlow = false;
            if (properties._text != value) {
                this._setTextDirty();
                properties._text = value;
                var text = "";
                if (properties._displayAsPassword) {
                    text = this.changeToPassText(properties._text);
                }
                else {
                    text = properties._text;
                }
                this.setMiddleStyle([{ text: text }]);
            }
        };
        __egretProto__._setText = function (value) {
            if (value == null) {
                value = "";
            }
            this._setBaseText(value);
            if (this._inputUtils) {
                this._inputUtils._setText(this._TF_Props_._text);
            }
        };
        Object.defineProperty(__egretProto__, "displayAsPassword", {
            get: function () {
                return this._TF_Props_._displayAsPassword;
            },
            /**
             * 指定文本字段是否是密码文本字段。
             * 如果此属性的值为 true，则文本字段被视为密码文本字段，并使用星号而不是实际字符来隐藏输入的字符。如果为 false，则不会将文本字段视为密码文本字段。
             * 默认值为 false。
             * @member {boolean} egret.TextInput#displayAsPassword
             */
            set: function (value) {
                this._setDisplayAsPassword(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setDisplayAsPassword = function (value) {
            var self = this;
            var properties = self._TF_Props_;
            if (properties._displayAsPassword != value) {
                properties._displayAsPassword = value;
                this._setTextDirty();
                var text = "";
                if (properties._displayAsPassword) {
                    text = this.changeToPassText(properties._text);
                }
                else {
                    text = properties._text;
                }
                this.setMiddleStyle([{ text: text }]);
            }
        };
        Object.defineProperty(__egretProto__, "fontFamily", {
            get: function () {
                return this._TF_Props_._fontFamily;
            },
            /**
             * 使用此文本格式的文本的字体名称，以字符串形式表示。
             * 默认值 Arial。
             * @member {any} egret.TextField#fontFamily
             */
            set: function (value) {
                this._setFontFamily(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setFontFamily = function (value) {
            if (this._TF_Props_._fontFamily != value) {
                this._setTextDirty();
                this._TF_Props_._fontFamily = value;
            }
        };
        Object.defineProperty(__egretProto__, "size", {
            get: function () {
                return this._TF_Props_._size;
            },
            /**
             * 使用此文本格式的文本的大小（以像素为单位）。
             * 默认值为 30。
             * @member {number} egret.TextField#size
             */
            set: function (value) {
                this._setSize(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setSize = function (value) {
            if (this._TF_Props_._size != value) {
                this._setTextDirty();
                this._TF_Props_._size = value;
            }
        };
        Object.defineProperty(__egretProto__, "italic", {
            get: function () {
                return this._TF_Props_._italic;
            },
            /**
             * 表示使用此文本格式的文本是否为斜体。
             * 如果值为 true，则文本为斜体；false，则为不使用斜体。
             * 默认值为 false。
             * @member {boolean} egret.TextField#italic
             */
            set: function (value) {
                this._setItalic(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setItalic = function (value) {
            if (this._TF_Props_._italic != value) {
                this._setTextDirty();
                this._TF_Props_._italic = value;
            }
        };
        Object.defineProperty(__egretProto__, "bold", {
            get: function () {
                return this._TF_Props_._bold;
            },
            /**
             * 指定文本是否为粗体字。
             * 如果值为 true，则文本为粗体字；false，则为非粗体字。
             * 默认值为 false。
             * @member {boolean} egret.TextField#bold
             */
            set: function (value) {
                this._setBold(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setBold = function (value) {
            if (this._TF_Props_._bold != value) {
                this._setTextDirty();
                this._TF_Props_._bold = value;
            }
        };
        Object.defineProperty(__egretProto__, "textColor", {
            get: function () {
                return this._TF_Props_._textColor;
            },
            /**
             * 表示文本的颜色。
             * 包含三个 8 位 RGB 颜色成分的数字；例如，0xFF0000 为红色，0x00FF00 为绿色。
             * 默认值为 0xFFFFFF。
             * @member {number} egret.TextField#textColor
             */
            set: function (value) {
                this._setTextColor(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setTextColor = function (value) {
            if (this._TF_Props_._textColor != value) {
                this._setTextDirty();
                this._TF_Props_._textColor = value;
                this._TF_Props_._textColorString = egret.toColorString(value);
            }
        };
        Object.defineProperty(__egretProto__, "strokeColor", {
            get: function () {
                return this._TF_Props_._strokeColor;
            },
            /**
             * 表示文本的描边颜色。
             * 包含三个 8 位 RGB 颜色成分的数字；例如，0xFF0000 为红色，0x00FF00 为绿色。
             * 默认值为 0x000000。
             * @member {number} egret.TextField#strokeColor
             */
            set: function (value) {
                this._setStrokeColor(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setStrokeColor = function (value) {
            if (this._TF_Props_._strokeColor != value) {
                this._setTextDirty();
                this._TF_Props_._strokeColor = value;
                this._TF_Props_._strokeColorString = egret.toColorString(value);
            }
        };
        Object.defineProperty(__egretProto__, "stroke", {
            get: function () {
                return this._TF_Props_._stroke;
            },
            /**
             * 表示描边宽度。
             * 0为没有描边。
             * 默认值为 0。
             * @member {number} egret.TextField#stroke
             */
            set: function (value) {
                this._setStroke(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setStroke = function (value) {
            if (this._TF_Props_._stroke != value) {
                this._setTextDirty();
                this._TF_Props_._stroke = value;
            }
        };
        Object.defineProperty(__egretProto__, "textAlign", {
            get: function () {
                return this._TF_Props_._textAlign;
            },
            /**
             * 文本水平对齐方式
             * 使用HorizontalAlign定义的常量。
             * 默认值为 HorizontalAlign.LEFT。
             * @member {string} egret.TextField#textAlign
             */
            set: function (value) {
                this._setTextAlign(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setTextAlign = function (value) {
            if (this._TF_Props_._textAlign != value) {
                this._setTextDirty();
                this._TF_Props_._textAlign = value;
            }
        };
        Object.defineProperty(__egretProto__, "verticalAlign", {
            get: function () {
                return this._TF_Props_._verticalAlign;
            },
            /**
             * 文本垂直对齐方式。
             * 使用VerticalAlign定义的常量。
             * 默认值为 VerticalAlign.TOP。
             * @member {string} egret.TextField#verticalAlign
             */
            set: function (value) {
                this._setVerticalAlign(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setVerticalAlign = function (value) {
            if (this._TF_Props_._verticalAlign != value) {
                this._setTextDirty();
                this._TF_Props_._verticalAlign = value;
            }
        };
        Object.defineProperty(__egretProto__, "maxChars", {
            get: function () {
                return this._TF_Props_._maxChars;
            },
            /**
             * 文本字段中最多可包含的字符数（即用户输入的字符数）。
             * 脚本可以插入比 maxChars 允许的字符数更多的文本；maxChars 属性仅表示用户可以输入多少文本。如果此属性的值为 0，则用户可以输入无限数量的文本。
             * 默认值为 0。
             */
            set: function (value) {
                this._setMaxChars(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setMaxChars = function (value) {
            if (this._TF_Props_._maxChars != value) {
                this._TF_Props_._maxChars = value;
            }
        };
        Object.defineProperty(__egretProto__, "scrollV", {
            get: function () {
                return Math.min(Math.max(this._TF_Props_._scrollV, 1), this.maxScrollV);
            },
            /**
             * 文本在文本字段中的垂直位置。scrollV 属性可帮助用户定位到长篇文章的特定段落，还可用于创建滚动文本字段。
             * 垂直滚动的单位是行，而水平滚动的单位是像素。
             * 如果显示的第一行是文本字段中的第一行，则 scrollV 设置为 1（而非 0）。
             * @param value
             */
            set: function (value) {
                this._TF_Props_._scrollV = Math.max(value, 1);
                this._setDirty();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "maxScrollV", {
            /**
             * scrollV 的最大值
             * @returns {number}
             */
            get: function () {
                this._getLinesArr();
                return Math.max(this._TF_Props_._numLines - egret.TextFieldUtils._getScrollNum(this) + 1, 1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "selectionBeginIndex", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "selectionEndIndex", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "caretIndex", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setSelection = function (beginIndex, endIndex) {
        };
        Object.defineProperty(__egretProto__, "lineSpacing", {
            get: function () {
                return this._TF_Props_._lineSpacing;
            },
            /**
             * 行间距
             * 一个整数，表示行与行之间的垂直间距量。
             * 默认值为 0。
             * @member {number} egret.TextField#lineSpacing
             */
            set: function (value) {
                this._setLineSpacing(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setLineSpacing = function (value) {
            if (this._TF_Props_._lineSpacing != value) {
                this._setTextDirty();
                this._TF_Props_._lineSpacing = value;
            }
        };
        __egretProto__._getLineHeight = function () {
            return this._TF_Props_._lineSpacing + this._TF_Props_._size;
        };
        Object.defineProperty(__egretProto__, "numLines", {
            /**
             * 文本行数。
             * @member {number} egret.TextField#numLines
             */
            get: function () {
                return this._TF_Props_._numLines;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "multiline", {
            get: function () {
                return this._TF_Props_._multiline;
            },
            /**
             * 表示字段是否为多行文本字段。注意，此属性仅在type为TextFieldType.INPUT时才有效。
             * 如果值为 true，则文本字段为多行文本字段；如果值为 false，则文本字段为单行文本字段。在类型为 TextFieldType.INPUT 的字段中，multiline 值将确定 Enter 键是否创建新行（如果值为 false，则将忽略 Enter 键）。
             * 默认值为 false。
             * @member {boolean} egret.TextField#multiline
             */
            set: function (value) {
                this._setMultiline(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setMultiline = function (value) {
            this._TF_Props_._multiline = value;
            this._setDirty();
        };
        __egretProto__._setWidth = function (value) {
            _super.prototype._setWidth.call(this, value);
            this.fillBackground();
        };
        __egretProto__._setHeight = function (value) {
            _super.prototype._setHeight.call(this, value);
            this.fillBackground();
        };
        Object.defineProperty(__egretProto__, "border", {
            get: function () {
                return this._TF_Props_._border;
            },
            /**
             * 指定文本字段是否具有边框。
             * 如果为 true，则文本字段具有边框。如果为 false，则文本字段没有边框。
             * 使用 borderColor 属性来设置边框颜色。
             * 默认值为 false。
             * @member {boolean} egret.TextField#border
             */
            set: function (value) {
                this._TF_Props_._border = value;
                this.fillBackground();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "borderColor", {
            get: function () {
                return this._TF_Props_._borderColor;
            },
            /**
             * 文本字段边框的颜色。默认值为 0x000000（黑色）。
             * 即使当前没有边框，也可检索或设置此属性，但只有当文本字段已将 border 属性设置为 true 时，才可以看到颜色。
             * @member {number} egret.TextField#borderColor
             */
            set: function (value) {
                this._TF_Props_._borderColor = value;
                this.fillBackground();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "background", {
            get: function () {
                return this._TF_Props_._background;
            },
            /**
             * 指定文本字段是否具有背景填充。
             * 如果为 true，则文本字段具有背景填充。如果为 false，则文本字段没有背景填充。
             * 使用 backgroundColor 属性来设置文本字段的背景颜色。
             * 默认值为 false。
             * @member {boolean} egret.TextField#background
             */
            set: function (value) {
                this._TF_Props_._background = value;
                this.fillBackground();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "backgroundColor", {
            get: function () {
                return this._TF_Props_._backgroundColor;
            },
            /**
             * 文本字段背景的颜色。默认值为 0xFFFFFF（白色）。
             * 即使当前没有背景，也可检索或设置此属性，但只有当文本字段已将 background 属性设置为 true 时，才可以看到颜色。
             * @member {number} egret.TextField#backgroundColor
             */
            set: function (value) {
                this._TF_Props_._backgroundColor = value;
                this.fillBackground();
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__.fillBackground = function () {
            var self = this;
            var graphics = self._bgGraphics;
            var properties = self._TF_Props_;
            if (graphics) {
                graphics.clear();
            }
            if (properties._background || properties._border) {
                if (graphics == null) {
                    graphics = self._bgGraphics = new egret.Graphics();
                }
                if (properties._background) {
                    graphics.beginFill(properties._backgroundColor, 1);
                }
                if (properties._border) {
                    graphics.lineStyle(1, properties._borderColor);
                }
                graphics.drawRect(0, 0, self._getWidth(), self._getHeight());
                graphics.endFill();
            }
        };
        __egretProto__.setFocus = function () {
            //todo:
            egret.Logger.warningWithErrorId(1013);
        };
        __egretProto__._onRemoveFromStage = function () {
            _super.prototype._onRemoveFromStage.call(this);
            this._removeEvent();
            if (this._TF_Props_._type == egret.TextFieldType.INPUT) {
                this._inputUtils._removeStageText();
            }
        };
        __egretProto__._onAddToStage = function () {
            _super.prototype._onAddToStage.call(this);
            this._addEvent();
            if (this._TF_Props_._type == egret.TextFieldType.INPUT) {
                this._inputUtils._addStageText();
            }
        };
        __egretProto__._updateBaseTransform = function () {
            this._getLinesArr();
            if (this._TF_Props_._textMaxWidth == 0 && this._TF_Props_._type != egret.TextFieldType.INPUT) {
                return;
            }
            _super.prototype._updateTransform.call(this);
            var matrix = this._worldTransform;
        };
        __egretProto__._updateTransform = function () {
            if (this._TF_Props_._type == egret.TextFieldType.INPUT) {
                if (this._DO_Props_._normalDirty) {
                    //this._clearDirty();
                    this._inputUtils._updateProperties();
                }
                else {
                    this._inputUtils._updateTransform();
                }
            }
            else {
                this._updateBaseTransform();
            }
        };
        __egretProto__._draw = function (renderContext) {
            var self = this;
            var properties = self._TF_Props_;
            if (properties._type == egret.TextFieldType.INPUT) {
                if (self._isTyping) {
                    return;
                }
            }
            else if (properties._textMaxWidth == 0) {
                return;
            }
            _super.prototype._draw.call(this, renderContext);
        };
        /**
         * @see egret.DisplayObject._render
         * @param renderContext
         */
        __egretProto__._render = function (renderContext) {
            if (this._bgGraphics)
                this._bgGraphics._draw(renderContext);
            this.drawText(renderContext);
            this._clearDirty();
        };
        /**
         * 测量显示对象坐标与大小
         */
        __egretProto__._measureBounds = function () {
            var self = this;
            var properties = self._TF_Props_;
            this._getLinesArr();
            if (properties._textMaxWidth == 0) {
                return egret.Rectangle.identity.initialize(0, 0, 0, 0);
            }
            return egret.Rectangle.identity.initialize(0, 0, properties._textMaxWidth, egret.TextFieldUtils._getTextHeight(self));
        };
        Object.defineProperty(__egretProto__, "textFlow", {
            get: function () {
                return this._textArr;
            },
            /**
             * 设置富文本
             * @param textArr 富文本数据
             */
            set: function (textArr) {
                var self = this;
                var properties = self._TF_Props_;
                this._isFlow = true;
                var text = "";
                if (textArr == null)
                    textArr = [];
                for (var i = 0; i < textArr.length; i++) {
                    var element = textArr[i];
                    text += element.text;
                }
                if (properties._displayAsPassword) {
                    this._setBaseText(text);
                }
                else {
                    properties._text = text;
                    this.setMiddleStyle(textArr);
                }
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__.changeToPassText = function (text) {
            if (this._TF_Props_._displayAsPassword) {
                var passText = "";
                for (var i = 0, num = text.length; i < num; i++) {
                    switch (text.charAt(i)) {
                        case '\n':
                            passText += "\n";
                            break;
                        case '\r':
                            break;
                        default:
                            passText += '*';
                    }
                }
                return passText;
            }
            return text;
        };
        __egretProto__.setMiddleStyle = function (textArr) {
            this._isArrayChanged = true;
            this._textArr = textArr;
            this._setSizeDirty();
        };
        Object.defineProperty(__egretProto__, "textWidth", {
            get: function () {
                return this._TF_Props_._textMaxWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "textHeight", {
            get: function () {
                return egret.TextFieldUtils._getTextHeight(this);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__.appendText = function (text) {
            this.appendElement({ text: text });
        };
        __egretProto__.appendElement = function (element) {
            this._textArr.push(element);
            this.setMiddleStyle(this._textArr);
        };
        __egretProto__._getLinesArr = function () {
            var self = this;
            var properties = self._TF_Props_;
            if (!self._isArrayChanged) {
                return self._linesArr;
            }
            self._isArrayChanged = false;
            var text2Arr = self._textArr;
            var renderContext = egret.MainContext.instance.rendererContext;
            self._linesArr.length = 0;
            properties._textMaxHeight = 0;
            properties._textMaxWidth = 0;
            //宽度被设置为0
            if (self._DO_Props_._hasWidthSet && self._DO_Props_._explicitWidth == 0) {
                properties._numLines = 0;
                return [{ width: 0, height: 0, charNum: 0, elements: [], hasNextLine: false }];
            }
            if (!self._isFlow) {
                renderContext.setupFont(self);
            }
            var linesArr = self._linesArr;
            var lineW = 0;
            var lineCharNum = 0;
            var lineH = 0;
            var lineCount = 0;
            var lineElement;
            for (var i = 0, text2ArrLength = text2Arr.length; i < text2ArrLength; i++) {
                var element = text2Arr[i];
                element.style = element.style || {};
                var text = element.text.toString();
                var textArr = text.split(/(?:\r\n|\r|\n)/);
                for (var j = 0, textArrLength = textArr.length; j < textArrLength; j++) {
                    if (linesArr[lineCount] == null) {
                        lineElement = { width: 0, height: 0, elements: [], charNum: 0, hasNextLine: false };
                        linesArr[lineCount] = lineElement;
                        lineW = 0;
                        lineH = 0;
                        lineCharNum = 0;
                    }
                    if (properties._type == egret.TextFieldType.INPUT) {
                        lineH = properties._size;
                    }
                    else {
                        lineH = Math.max(lineH, element.style.size || properties._size);
                    }
                    var isNextLine = true;
                    if (textArr[j] == "") {
                        if (j == textArrLength - 1) {
                            isNextLine = false;
                        }
                    }
                    else {
                        if (self._isFlow) {
                            renderContext.setupFont(self, element.style);
                        }
                        var w = renderContext.measureText(textArr[j]);
                        if (!self._DO_Props_._hasWidthSet) {
                            lineW += w;
                            lineCharNum += textArr[j].length;
                            lineElement.elements.push({ width: w, text: textArr[j], style: element.style });
                            if (j == textArrLength - 1) {
                                isNextLine = false;
                            }
                        }
                        else {
                            if (lineW + w <= self._DO_Props_._explicitWidth) {
                                lineElement.elements.push({ width: w, text: textArr[j], style: element.style });
                                lineW += w;
                                lineCharNum += textArr[j].length;
                                if (j == textArrLength - 1) {
                                    isNextLine = false;
                                }
                            }
                            else {
                                var k = 0;
                                var ww = 0;
                                var word = textArr[j];
                                var wl = word.length;
                                for (; k < wl; k++) {
                                    w = renderContext.measureText(word.charAt(k));
                                    if (lineW + w > self._DO_Props_._explicitWidth && lineW + k != 0) {
                                        break;
                                    }
                                    ww += w;
                                    lineW += w;
                                    lineCharNum += 1;
                                }
                                if (k > 0) {
                                    lineElement.elements.push({ width: ww, text: word.substring(0, k), style: element.style });
                                    textArr[j] = word.substring(k);
                                }
                                j--;
                                isNextLine = false;
                            }
                        }
                    }
                    if (isNextLine) {
                        lineCharNum++;
                        lineElement.hasNextLine = true;
                    }
                    if (j < textArr.length - 1) {
                        lineElement.width = lineW;
                        lineElement.height = lineH;
                        lineElement.charNum = lineCharNum;
                        properties._textMaxWidth = Math.max(properties._textMaxWidth, lineW);
                        properties._textMaxHeight += lineH;
                        //if (self._type == TextFieldType.INPUT && !self._multiline) {
                        //    self._numLines = linesArr.length;
                        //    return linesArr;
                        //}
                        lineCount++;
                    }
                }
                if (i == text2Arr.length - 1 && lineElement) {
                    lineElement.width = lineW;
                    lineElement.height = lineH;
                    lineElement.charNum = lineCharNum;
                    properties._textMaxWidth = Math.max(properties._textMaxWidth, lineW);
                    properties._textMaxHeight += lineH;
                }
            }
            properties._numLines = linesArr.length;
            return linesArr;
        };
        /**
         * @private
         * @param renderContext
         * @returns {Rectangle}
         */
        __egretProto__.drawText = function (renderContext) {
            var self = this;
            var properties = self._TF_Props_;
            //先算出需要的数值
            var lines = self._getLinesArr();
            if (properties._textMaxWidth == 0) {
                return;
            }
            var maxWidth = self._DO_Props_._hasWidthSet ? self._DO_Props_._explicitWidth : properties._textMaxWidth;
            var textHeight = egret.TextFieldUtils._getTextHeight(self);
            var drawY = 0;
            var startLine = egret.TextFieldUtils._getStartLine(self);
            if (self._DO_Props_._hasHeightSet && self._DO_Props_._explicitHeight > textHeight) {
                var valign = egret.TextFieldUtils._getValign(self);
                drawY += valign * (self._DO_Props_._explicitHeight - textHeight);
            }
            drawY = Math.round(drawY);
            var halign = egret.TextFieldUtils._getHalign(self);
            var drawX = 0;
            for (var i = startLine, numLinesLength = properties._numLines; i < numLinesLength; i++) {
                var line = lines[i];
                var h = line.height;
                drawY += h / 2;
                if (i != startLine) {
                    if (properties._type == egret.TextFieldType.INPUT && !properties._multiline) {
                        break;
                    }
                    if (self._DO_Props_._hasHeightSet && drawY > self._DO_Props_._explicitHeight) {
                        break;
                    }
                }
                drawX = Math.round((maxWidth - line.width) * halign);
                for (var j = 0, elementsLength = line.elements.length; j < elementsLength; j++) {
                    var element = line.elements[j];
                    var size = element.style.size || properties._size;
                    renderContext.drawText(self, element.text, drawX, drawY + (h - size) / 2, element.width, element.style);
                    drawX += element.width;
                }
                drawY += h / 2 + properties._lineSpacing;
            }
        };
        //增加点击事件
        __egretProto__._addEvent = function () {
            this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTapHandler, this);
        };
        //释放点击事件
        __egretProto__._removeEvent = function () {
            this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTapHandler, this);
        };
        //处理富文本中有href的
        __egretProto__.onTapHandler = function (e) {
            if (this._TF_Props_._type == egret.TextFieldType.INPUT) {
                return;
            }
            var ele = egret.TextFieldUtils._getTextElement(this, e.localX, e.localY);
            if (ele == null) {
                return;
            }
            var style = ele.style;
            if (style && style.href) {
                if (style.href.match(/^event:/)) {
                    var type = style.href.match(/^event:/)[0];
                    egret.TextEvent.dispatchTextEvent(this, egret.TextEvent.LINK, style.href.substring(type.length));
                }
                else {
                }
            }
        };
        TextField.default_fontFamily = "Arial";
        return TextField;
    })(egret.DisplayObject);
    egret.TextField = TextField;
    TextField.prototype.__class__ = "egret.TextField";
})(egret || (egret = {}));
