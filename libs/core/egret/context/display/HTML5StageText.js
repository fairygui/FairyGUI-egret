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
     * @extends egret.StageText
     * @private
     */
    var HTML5StageText = (function (_super) {
        __extends(HTML5StageText, _super);
        function HTML5StageText() {
            _super.call(this);
            this._isNeedShow = false;
            this.inputElement = null;
            this.inputDiv = null;
            this._gscaleX = 0;
            this._gscaleY = 0;
            this._isNeesHide = false;
            this.textValue = "";
            this._styleInfoes = {};
            HTMLInput.getInstance();
        }
        var __egretProto__ = HTML5StageText.prototype;
        __egretProto__._initElement = function (x, y, cX, cY) {
            var scaleX = egret.StageDelegate.getInstance().getScaleX();
            var scaleY = egret.StageDelegate.getInstance().getScaleY();
            this.inputDiv.style.left = x * scaleX + "px";
            this.inputDiv.style.top = y * scaleY + "px";
            this._gscaleX = scaleX * cX;
            this._gscaleY = scaleY * cY;
        };
        __egretProto__._show = function (multiline, size, width, height) {
            this._multiline = multiline;
            if (!HTMLInput.getInstance().isCurrentStageText(this)) {
                this.inputElement = HTMLInput.getInstance().getInputElement(this);
                this.inputDiv = HTMLInput.getInstance()._inputDIV;
            }
            else {
                this.inputElement.onblur = null;
            }
            HTMLInput.getInstance()._needShow = true;
            //标记当前文本被选中
            this._isNeedShow = true;
        };
        __egretProto__.onBlurHandler = function () {
            HTMLInput.getInstance().clearInputElement();
            window.scrollTo(0, 0);
        };
        __egretProto__.executeShow = function () {
            var self = this;
            //打开
            this.inputElement.value = this._getText();
            if (this.inputElement.onblur == null) {
                this.inputElement.onblur = this.onBlurHandler;
            }
            this._resetStageText();
            if (this._textfield._TF_Props_._maxChars > 0) {
                this.inputElement.setAttribute("maxlength", this._textfield._TF_Props_._maxChars);
            }
            else {
                this.inputElement.removeAttribute("maxlength");
            }
            this.inputElement.selectionStart = this.inputElement.value.length;
            this.inputElement.selectionEnd = this.inputElement.value.length;
            this.inputElement.focus();
        };
        __egretProto__._hide = function () {
            //标记当前点击其他地方关闭
            this._isNeesHide = true;
            if (egret.Browser.getInstance().getUserAgent().indexOf("ios") >= 0) {
                HTMLInput.getInstance().disconnectStageText(this);
            }
        };
        __egretProto__._getText = function () {
            if (!this.textValue) {
                this.textValue = "";
            }
            return this.textValue;
        };
        __egretProto__._setText = function (value) {
            this.textValue = value;
            this.resetText();
        };
        __egretProto__.resetText = function () {
            if (this.inputElement) {
                this.inputElement.value = this.textValue;
            }
        };
        __egretProto__._onInput = function () {
            var self = this;
            self.textValue = self.inputElement.value;
            egret.Event.dispatchEvent(self, "updateText", false);
        };
        __egretProto__._onClickHandler = function (e) {
            if (this._isNeedShow) {
                e.stopImmediatePropagation();
                //e.preventDefault();
                this._isNeedShow = false;
                this.executeShow();
                this.dispatchEvent(new egret.Event("focus"));
            }
        };
        __egretProto__._onDisconnect = function () {
            this.inputElement = null;
            this.dispatchEvent(new egret.Event("blur"));
        };
        __egretProto__.setElementStyle = function (style, value) {
            if (this.inputElement) {
                if (this._styleInfoes[style] != value) {
                    this.inputElement.style[style] = value;
                }
            }
        };
        __egretProto__._removeInput = function () {
            if (this.inputElement) {
                HTMLInput.getInstance().disconnectStageText(this);
            }
        };
        /**
         * 修改位置
         * @private
         */
        __egretProto__._resetStageText = function () {
            if (this.inputElement) {
                var textfield = this._textfield;
                var propertie = textfield._TF_Props_;
                this.setElementStyle("fontFamily", propertie._fontFamily);
                this.setElementStyle("fontStyle", propertie._italic ? "italic" : "normal");
                this.setElementStyle("fontWeight", propertie._bold ? "bold" : "normal");
                this.setElementStyle("textAlign", propertie._textAlign);
                this.setElementStyle("fontSize", propertie._size * this._gscaleY + "px");
                this.setElementStyle("lineHeight", propertie._size * this._gscaleY + "px");
                this.setElementStyle("color", propertie._textColorString);
                this.setElementStyle("width", textfield._getSize(egret.Rectangle.identity).width * this._gscaleX + "px");
                this.setElementStyle("height", textfield._getSize(egret.Rectangle.identity).height * this._gscaleY + "px");
                this.setElementStyle("verticalAlign", propertie._verticalAlign);
            }
        };
        return HTML5StageText;
    })(egret.StageText);
    egret.HTML5StageText = HTML5StageText;
    HTML5StageText.prototype.__class__ = "egret.HTML5StageText";
    var HTMLInput = (function () {
        function HTMLInput() {
            this._needShow = false;
        }
        var __egretProto__ = HTMLInput.prototype;
        __egretProto__.isInputOn = function () {
            return this._stageText != null;
        };
        __egretProto__.isCurrentStageText = function (stageText) {
            return this._stageText == stageText;
        };
        __egretProto__.initValue = function (dom) {
            dom.style.position = "absolute";
            dom.style.left = "0px";
            dom.style.top = "0px";
            dom.style.border = "none";
            dom.style.padding = "0";
        };
        __egretProto__._initStageDelegateDiv = function () {
            var self = this;
            var stageDelegateDiv = egret.Browser.getInstance().$("#StageDelegateDiv");
            if (!stageDelegateDiv) {
                stageDelegateDiv = egret.Browser.getInstance().$new("div");
                stageDelegateDiv.id = "StageDelegateDiv";
                var container = document.getElementById(egret.StageDelegate.egret_root_div);
                container.appendChild(stageDelegateDiv);
                self.initValue(stageDelegateDiv);
                stageDelegateDiv.style.width = "0px";
                stageDelegateDiv.style.height = "0px";
                self._inputDIV = egret.Browser.getInstance().$new("div");
                self.initValue(self._inputDIV);
                self._inputDIV.style.width = "0px";
                self._inputDIV.style.height = "0px";
                self._inputDIV.style.left = 0 + "px";
                self._inputDIV.style.top = "-100px";
                self._inputDIV.style[egret.Browser.getInstance().getTrans("transformOrigin")] = "0% 0% 0px";
                stageDelegateDiv.appendChild(self._inputDIV);
                var canvasDiv = document.getElementById(egret.StageDelegate.canvas_div_name);
                canvasDiv.addEventListener("click", function (e) {
                    if (self._needShow) {
                        self._needShow = false;
                        egret.MainContext.instance.stage._changeSizeDispatchFlag = false;
                        self._stageText._onClickHandler(e);
                        HTMLInput.getInstance().show();
                    }
                    else {
                        if (self._inputElement) {
                            self.clearInputElement();
                            self._inputElement.blur();
                            self._inputElement = null;
                        }
                    }
                });
                self.initInputElement(true);
                self.initInputElement(false);
            }
        };
        //初始化输入框
        __egretProto__.initInputElement = function (multiline) {
            var self = this;
            //增加1个空的textarea
            var inputElement;
            if (multiline) {
                inputElement = document.createElement("textarea");
                inputElement.style["resize"] = "none";
                self._multiElement = inputElement;
                inputElement.id = "egretTextarea";
            }
            else {
                inputElement = document.createElement("input");
                self._simpleElement = inputElement;
                inputElement.id = "egretInput";
            }
            inputElement.type = "text";
            self._inputDIV.appendChild(inputElement);
            inputElement.setAttribute("tabindex", "-1");
            inputElement.style.width = "1px";
            inputElement.style.height = "12px";
            self.initValue(inputElement);
            inputElement.style.outline = "thin";
            inputElement.style.background = "none";
            inputElement.style.overflow = "hidden";
            inputElement.style.wordBreak = "break-all";
            //隐藏输入框
            inputElement.style.opacity = 0;
            inputElement.oninput = function () {
                if (self._stageText) {
                    self._stageText._onInput();
                }
            };
        };
        __egretProto__.show = function () {
            var self = this;
            var inputElement = self._inputElement;
            //隐藏输入框
            egret.__callAsync(function () {
                inputElement.style.opacity = 1;
            }, self);
        };
        __egretProto__.disconnectStageText = function (stageText) {
            if (this._stageText == null || this._stageText == stageText) {
                this.clearInputElement();
                if (this._inputElement) {
                    this._inputElement.blur();
                }
            }
        };
        __egretProto__.clearInputElement = function () {
            var self = this;
            if (self._inputElement) {
                self._inputElement.value = "";
                self._inputElement.onblur = null;
                self._inputElement.style.width = "1px";
                self._inputElement.style.height = "12px";
                self._inputElement.style.left = "0px";
                self._inputElement.style.top = "0px";
                self._inputElement.style.opacity = 0;
                var otherElement;
                if (self._simpleElement == self._inputElement) {
                    otherElement = self._multiElement;
                }
                else {
                    otherElement = self._simpleElement;
                }
                otherElement.style.display = "block";
                self._inputDIV.style.left = 0 + "px";
                self._inputDIV.style.top = "-100px";
            }
            if (self._stageText) {
                self._stageText._onDisconnect();
                self._stageText = null;
            }
            egret.MainContext.instance.stage._changeSizeDispatchFlag = true;
        };
        __egretProto__.getInputElement = function (stageText) {
            var self = this;
            self.clearInputElement();
            self._stageText = stageText;
            if (self._stageText._multiline) {
                self._inputElement = self._multiElement;
            }
            else {
                self._inputElement = self._simpleElement;
            }
            var otherElement;
            if (self._simpleElement == self._inputElement) {
                otherElement = self._multiElement;
            }
            else {
                otherElement = self._simpleElement;
            }
            otherElement.style.display = "none";
            return self._inputElement;
        };
        HTMLInput.getInstance = function () {
            if (HTMLInput._instance == null) {
                HTMLInput._instance = new egret.HTMLInput();
            }
            return HTMLInput._instance;
        };
        return HTMLInput;
    })();
    egret.HTMLInput = HTMLInput;
    HTMLInput.prototype.__class__ = "egret.HTMLInput";
})(egret || (egret = {}));
egret.StageText.create = function () {
    egret.HTMLInput.getInstance()._initStageDelegateDiv();
    return new egret.HTML5StageText();
};
