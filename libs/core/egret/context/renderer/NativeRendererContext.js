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
     * @class egret.NativeRendererContext
     * @classdesc
     * NativeRendererContext 是引擎在Native上的渲染上下文。
     * @extends egret.HashObject
     * @private
     */
    var NativeRendererContext = (function (_super) {
        __extends(NativeRendererContext, _super);
        /**
         * @method egret.NativeRendererContext#constructor
         */
        function NativeRendererContext() {
            _super.call(this);
            this.currentAlpha = NaN;
            this.currentBlendMode = null;
            //public setGlobalColorTransform(colorTransformMatrix:Array<any>):void {
            //    if (colorTransformMatrix) {
            //        egret_native.Graphics.setGlobalColorTransformEnabled(true);
            //        egret_native.Graphics.setGlobalColorTransform(colorTransformMatrix);
            //    }
            //    else {
            //        egret_native.Graphics.setGlobalColorTransformEnabled(false);
            //    }
            //}
            this.globalColorTransformEnabled = false;
            egret.Texture.prototype.draw = egret.Texture.prototype._drawForNative;
            egret.Texture.prototype.dispose = egret.Texture.prototype._disposeForNative;
        }
        var __egretProto__ = NativeRendererContext.prototype;
        __egretProto__._setTextureScaleFactor = function (value) {
            _super.prototype._setTextureScaleFactor.call(this, value);
            if (egret_native.Graphics.setTextureScaleFactor != null) {
                egret_native.Graphics.setTextureScaleFactor(value);
            }
        };
        /**
         * @method egret.NativeRendererContext#clearScreen
         * @private
         */
        __egretProto__.clearScreen = function () {
            egret_native.Graphics.clearScreen(0, 0, 0);
        };
        /**
         * 清除Context的渲染区域
         * @method egret.NativeRendererContext#clearRect
         * @param x {number}
         * @param y {number}
         * @param w {number}
         * @param h {numbe}
         */
        __egretProto__.clearRect = function (x, y, w, h) {
        };
        /**
         * 绘制图片
         * @method egret.NativeRendererContext#drawImage
         * @param texture {Texture}
         * @param sourceX {any}
         * @param sourceY {any}
         * @param sourceWidth {any}
         * @param sourceHeight {any}
         * @param destX {any}
         * @param destY {any}
         * @param destWidth {any}
         * @param destHeigh {any}
         * @param repeat {string}
         */
        __egretProto__.drawImage = function (texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat) {
            if (repeat === void 0) { repeat = undefined; }
            if (this.filters) {
                for (var i = 0; i < 1; i++) {
                    var filter = this.filters[0];
                    if (filter.type == "glow") {
                        this.useGlow(texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
                        return;
                    }
                }
            }
            texture.draw(egret_native.Graphics, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat);
            _super.prototype.drawImage.call(this, texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat);
        };
        __egretProto__.useGlow = function (texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight) {
            var filter = this.filters[0];
            var distance = filter.distance || 0;
            var angle = filter.angle || 0;
            var distanceX = 0;
            var distanceY = 0;
            if (distance != 0 && angle != 0) {
                distanceX = Math.ceil(distance * egret.NumberUtils.cos(angle));
                distanceY = Math.ceil(distance * egret.NumberUtils.sin(angle));
            }
            var quality = filter.quality;
            var strength = filter.strength;
            var blurX = filter.blurX / 10;
            var blurY = filter.blurY / 10;
            var offset = 10;
            var textureWidth = destWidth + blurX * 2 + offset * 2 + Math.abs(distanceX);
            var textureHeight = destHeight + blurY * 2 + offset * 2 + Math.abs(distanceY);
            var renderTextureA = new egret.RenderTexture();
            renderTextureA.setSize(textureWidth, textureHeight);
            var renderContextA = renderTextureA.renderContext;
            var renderTextureB = new egret.RenderTexture();
            renderTextureB.setSize(textureWidth, textureHeight);
            var renderContextB = renderTextureB.renderContext;
            //绘制纯色图
            renderTextureA.begin();
            renderContextA.clearScreen();
            //egret_native.Graphics.clearScreen(0, 255, 0);
            egret_native.Graphics.setGlobalColorTransformEnabled(true);
            egret_native.Graphics.setGlobalColorTransform([
                0,
                0,
                0,
                0,
                filter._red,
                0,
                0,
                0,
                0,
                filter._green,
                0,
                0,
                0,
                0,
                filter._blue,
                0,
                0,
                0,
                0,
                filter.alpha * 255
            ]);
            renderContextA.setAlpha(1, egret.BlendMode.NORMAL);
            renderContextA.setTransform(new egret.Matrix(1, 0, 0, 1, 0, 0));
            renderContextA.drawImage(texture, sourceX, sourceY, sourceWidth, sourceHeight, blurX + offset, blurY + offset, destWidth, destHeight);
            egret_native.Graphics.setGlobalColorTransformEnabled(false);
            renderTextureA.end();
            //blur x
            renderTextureB.begin();
            renderContextB.clearScreen();
            renderContextB.setAlpha(1, egret.BlendMode.NORMAL);
            renderContextB.setTransform(new egret.Matrix(1, 0, 0, 1, 0, 0));
            egret_native.Graphics.setGlobalShader({ type: "blur", blurX: blurX, blurY: 0 });
            renderContextB.drawImage(renderTextureA, blurX, blurY, textureWidth - blurX * 2, textureHeight - blurY * 2, blurX, blurY, textureWidth - blurX * 2, textureHeight - blurY * 2);
            renderTextureB.end();
            ////blur y
            renderTextureA.begin();
            renderContextA.clearScreen();
            renderContextA.setAlpha(1, egret.BlendMode.NORMAL);
            renderContextA.setTransform(new egret.Matrix(1, 0, 0, 1, 0, 0));
            egret_native.Graphics.setGlobalShader({ type: "blur", blurX: 0, blurY: blurY });
            renderContextA.drawImage(renderTextureB, 0, blurY, textureWidth, textureHeight - blurY * 2, 0, blurY + offset / 2, textureWidth, textureHeight - blurY * 2);
            egret_native.Graphics.setGlobalShader(null);
            renderTextureA.end();
            //画回B 应用强度
            renderTextureB.begin();
            renderContextB.clearScreen();
            renderContextB.setAlpha(1, egret.BlendMode.NORMAL);
            renderContextB.setTransform(new egret.Matrix(1, 0, 0, 1, 0, 0));
            for (var i = 0; i < quality; i++) {
                renderContextB.drawImage(renderTextureA, 0, 0, textureWidth, textureHeight, distanceX, distanceY, textureWidth, textureHeight);
            }
            //原图
            egret_native.Graphics.setBlendArg(770, 771);
            renderContextB.drawImage(texture, sourceX, sourceY, sourceWidth, sourceHeight, destX + blurX + offset, destY + blurY + offset * 1.5, destWidth, destHeight);
            renderTextureB.end();
            egret_native.Graphics.drawImage(renderTextureB._bitmapData, 0, 0, textureWidth, textureHeight, destX - blurX - offset, destY - blurY - offset * 1.5, textureWidth, textureHeight);
            renderTextureA.dispose();
            renderTextureB.dispose();
            egret_native.Graphics.setGlobalShader(null);
        };
        /**
         * 绘制9宫图片
         * @method egret.RendererContext#drawImageScale9
         * @param texture {Texture}
         * @param sourceX {any}
         * @param sourceY {any}
         * @param sourceWidth {any}
         * @param sourceHeight {any}
         * @param destX {any}
         * @param destY {any}
         * @param destWidth {any}
         * @param destHeigh {any}
         */
        __egretProto__.drawImageScale9 = function (texture, sourceX, sourceY, sourceWidth, sourceHeight, offX, offY, destWidth, destHeight, rect) {
            if (egret_native.Graphics.drawImageScale9 != null) {
                egret_native.Graphics.drawImageScale9(texture._bitmapData, sourceX, sourceY, sourceWidth, sourceHeight, offX, offY, destWidth, destHeight, rect.x, rect.y, rect.width, rect.height);
                this._addOneDraw();
                return true;
            }
            return false;
        };
        __egretProto__.drawRepeatImage = function (texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat) {
            var texture_scale_factor = egret.MainContext.instance.rendererContext._texture_scale_factor;
            sourceWidth = sourceWidth * texture_scale_factor;
            sourceHeight = sourceHeight * texture_scale_factor;
            for (var x = destX; x < destWidth; x += sourceWidth) {
                for (var y = destY; y < destHeight; y += sourceHeight) {
                    var destW = Math.min(sourceWidth, destWidth - x);
                    var destH = Math.min(sourceHeight, destHeight - y);
                    this.drawImage(texture, sourceX, sourceY, destW / texture_scale_factor, destH / texture_scale_factor, x, y, destW, destH);
                }
            }
        };
        /**
         * 变换Context的当前渲染矩阵
         * @method egret.NativeRendererContext#setTransform
         * @param matrix {egret.Matrix}
         * @stable A
         */
        __egretProto__.setTransform = function (matrix) {
            egret_native.Graphics.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
        };
        /**
         * 设置渲染alpha
         * @method egret.NativeRendererContext#setAlpha
         * @param value {number}
         * @stable A
         * @param blendMode {egret.BlendMode}
         */
        __egretProto__.setAlpha = function (value, blendMode) {
            //if (this.currentAlpha != value) {
            egret_native.Graphics.setGlobalAlpha(value);
            //this.currentAlpha = value;
            //}
            this.setBlendMode(blendMode);
        };
        __egretProto__.setBlendMode = function (blendMode) {
            if (!blendMode) {
                blendMode = egret.BlendMode.NORMAL;
            }
            //if (this.currentBlendMode != blendMode) {
            var blendModeArg = egret.RendererContext.blendModesForGL[blendMode];
            if (blendModeArg) {
                egret_native.Graphics.setBlendArg(blendModeArg[0], blendModeArg[1]);
                this.currentBlendMode = blendMode;
            }
            //}
        };
        /**
         * 设置渲染文本参数
         * @method egret.NativeRendererContext#setupFont
         * @param textField {TextField}
         */
        __egretProto__.setupFont = function (textField, style) {
            if (style === void 0) { style = null; }
            style = style || {};
            var properties = textField._TF_Props_;
            var size = style.size == null ? properties._size : style.size;
            var outline;
            if (style.stroke != null) {
                outline = style.stroke;
            }
            else {
                outline = properties._stroke;
            }
            egret_native.Label.createLabel(egret.TextField.default_fontFamily, size, "", outline);
        };
        /**
         * 测量文本
         * @method egret.NativeRendererContext#measureText
         * @param text {string}
         * @returns {number}
         */
        __egretProto__.measureText = function (text) {
            return egret_native.Label.getTextSize(text)[0];
        };
        /**
         * 绘制文本
         * @method egret.NativeRendererContext#drawText
         * @param textField {egret.TextField}
         * @param text {string}
         * @param x {number}
         * @param y {number}
         * @param maxWidth {numbe}
         */
        __egretProto__.drawText = function (textField, text, x, y, maxWidth, style) {
            if (style === void 0) { style = null; }
            this.setupFont(textField, style);
            style = style || {};
            var properties = textField._TF_Props_;
            var textColor;
            if (style.textColor != null) {
                textColor = style.textColor;
            }
            else {
                textColor = properties._textColor;
            }
            var strokeColor;
            if (style.strokeColor != null) {
                strokeColor = style.strokeColor;
            }
            else {
                strokeColor = properties._strokeColor;
            }
            egret_native.Label.setTextColor(textColor);
            egret_native.Label.setStrokeColor(strokeColor);
            egret_native.Label.drawText(text, x, y - 2);
            _super.prototype.drawText.call(this, textField, text, x, y, maxWidth, style);
        };
        __egretProto__.pushMask = function (mask) {
            egret_native.Graphics.pushClip(mask.x, mask.y, mask.width, mask.height);
        };
        __egretProto__.popMask = function () {
            egret_native.Graphics.popClip();
        };
        __egretProto__.setGlobalFilters = function (filtersData) {
            this.filters = filtersData;
            if (filtersData && filtersData.length) {
                for (var i = 0; i < 1; i++) {
                    var filter = filtersData[0];
                    if (filter.type == "colorTransform") {
                        var colorTransformMatrix = filter._matrix;
                        if (colorTransformMatrix) {
                            egret_native.Graphics.setGlobalColorTransformEnabled(true);
                            egret_native.Graphics.setGlobalColorTransform(colorTransformMatrix);
                            this.globalColorTransformEnabled = true;
                        }
                    }
                    else if (filter.type == "blur") {
                        egret_native.Graphics.setGlobalShader(filter);
                    }
                }
            }
            else {
                if (this.globalColorTransformEnabled) {
                    egret_native.Graphics.setGlobalColorTransformEnabled(false);
                    this.globalColorTransformEnabled = false;
                }
                egret_native.Graphics.setGlobalShader(null);
            }
        };
        return NativeRendererContext;
    })(egret.RendererContext);
    egret.NativeRendererContext = NativeRendererContext;
    NativeRendererContext.prototype.__class__ = "egret.NativeRendererContext";
})(egret || (egret = {}));
//egret.Graphics.prototype._draw = function () {
//    return;
//}
var egret_native_graphics;
(function (egret_native_graphics) {
    function beginFill(color, alpha) {
        this.commandQueue.push(new Command(function (color, alpha) {
            if (!alpha && alpha != 0) {
                alpha = 1;
            }
            egret_native.Graphics.beginFill(color, alpha);
        }, this, arguments));
    }
    egret_native_graphics.beginFill = beginFill;
    function drawRect(x, y, width, height) {
        this.commandQueue.push(new Command(function (x, y) {
            egret_native.Graphics.moveTo(x, y);
            egret_native.Graphics.lineTo(x + width, y);
            egret_native.Graphics.lineTo(x + width, y + height);
            egret_native.Graphics.lineTo(x, y + height);
            egret_native.Graphics.lineTo(x, y);
        }, this, arguments));
        this._checkRect(x, y, width, height);
    }
    egret_native_graphics.drawRect = drawRect;
    function drawCircle(x, y, r) {
    }
    egret_native_graphics.drawCircle = drawCircle;
    function lineStyle(thickness, color, alpha, pixelHinting, scaleMode, caps, joints, miterLimit) {
        this.commandQueue.push(new Command(function (thickness, color) {
            egret_native.Graphics.lineStyle(thickness, color);
        }, this, arguments));
    }
    egret_native_graphics.lineStyle = lineStyle;
    function lineTo(x, y) {
        this.commandQueue.push(new Command(function (x, y) {
            egret_native.Graphics.lineTo(x, y);
        }, this, arguments));
        this._checkPoint(this.lineX, this.lineY);
        this.lineX = x;
        this.lineY = y;
        this._checkPoint(x, y);
    }
    egret_native_graphics.lineTo = lineTo;
    function curveTo(controlX, controlY, anchorX, anchorY) {
    }
    function cubicCurveTo(controlX1, controlY1, controlX2, controlY2, anchorX, anchorY) {
    }
    egret_native_graphics.curveTo = curveTo;
    function moveTo(x, y) {
        this.commandQueue.push(new Command(function (x, y) {
            egret_native.Graphics.moveTo(x, y);
        }, this, arguments));
    }
    egret_native_graphics.moveTo = moveTo;
    function clear() {
        this.commandQueue.splice(0, this.commandQueue.length);
        this.lineX = 0;
        this.lineY = 0;
        egret_native.Graphics.lineStyle(0, 0);
        this._minX = 0;
        this._minY = 0;
        this._maxX = 0;
        this._maxY = 0;
        this._firstCheck = true;
        this._dirty = true;
    }
    egret_native_graphics.clear = clear;
    function endFill() {
        this.commandQueue.push(new Command(function () {
            egret_native.Graphics.endFill();
        }, this, arguments));
    }
    egret_native_graphics.endFill = endFill;
    function _draw(renderContext) {
        var length = this.commandQueue.length;
        for (var i = 0; i < length; i++) {
            var command = this.commandQueue[i];
            command.method.apply(command.thisObject, command.args);
        }
        egret_native.Graphics.lineStyle(0, 0);
    }
    egret_native_graphics._draw = _draw;
    var Command = (function () {
        function Command(method, thisObject, args) {
            this.method = method;
            this.thisObject = thisObject;
            this.args = args;
        }
        return Command;
    })();
    function init() {
        for (var key in egret_native_graphics) {
            egret.Graphics.prototype[key] = egret_native_graphics[key];
        }
    }
    egret_native_graphics.init = init;
})(egret_native_graphics || (egret_native_graphics = {}));
if (egret_native.rastergl) {
    egret.Graphics.prototype._beginDraw = function (renderContext) {
        var self = this;
        self._renderContext = egret_native.rastergl;
    };
    egret.Graphics.prototype._parseColor = function (color, alpha) {
        var fill = function (s) {
            if (s.length < 2) {
                s = "0" + s;
            }
            return s;
        };
        var _colorBlue = color & 0x0000FF;
        var _colorGreen = (color & 0x00ff00) >> 8;
        var _colorRed = color >> 16;
        var a = parseInt((alpha * 255)).toString(16);
        var r = _colorRed.toString(16);
        var g = _colorGreen.toString(16);
        var b = _colorBlue.toString(16);
        return "#" + fill(a) + fill(r) + fill(g) + fill(b);
    };
}
else {
    egret_native_graphics.init();
}
