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
     * @class egret.Graphics
     * @classdesc
     * Graphics 类包含一组可用来创建矢量形状的方法。支持绘制的显示对象包括 Sprite 和 Shape 对象。这些类中的每一个类都包括 graphics 属性，该属性是一个 Graphics 对象。
     * 以下是为便于使用而提供的一些辅助函数：drawRect()、drawRoundRect()、drawCircle() 和 drawEllipse()。
     * @link http://docs.egret-labs.org/post/manual/graphics/drawrect.html  绘制矩形
     */
    var Graphics = (function () {
        function Graphics() {
            this._renderContext = null;
            this.commandQueue = null;
            this.strokeStyleColor = null;
            this.fillStyleColor = null;
            this._dirty = false;
            this.lineX = 0;
            this.lineY = 0;
            this._firstCheck = true;
            this._minX = 0;
            this._minY = 0;
            this._maxX = 0;
            this._maxY = 0;
            this._lastX = 0;
            this._lastY = 0;
            this.commandQueue = [];
        }
        var __egretProto__ = Graphics.prototype;
        /**
         * 指定一种简单的单一颜色填充，在绘制时该填充将在随后对其他 Graphics 方法（如 lineTo() 或 drawCircle()）的调用中使用。
         * 调用 clear() 方法会清除填充。
         * @method egret.Graphics#beginFill
         * @param color {number} 填充的颜色
         * @param alpha {number} 填充的 Alpha 值
         */
        __egretProto__.beginFill = function (color, alpha) {
            if (alpha === void 0) { alpha = 1; }
            this.fillStyleColor = this._parseColor(color, alpha);
            this._pushCommand(new Command(this._setStyle, this, [this.fillStyleColor]));
        };
        __egretProto__._parseColor = function (color, alpha) {
            var _colorBlue = color & 0x0000FF;
            var _colorGreen = (color & 0x00ff00) >> 8;
            var _colorRed = color >> 16;
            return "rgba(" + _colorRed + "," + _colorGreen + "," + _colorBlue + "," + alpha + ")";
        };
        __egretProto__._setStyle = function (colorStr) {
            this._renderContext.fillStyle = colorStr;
            this._renderContext.beginPath();
        };
        /**
         * 绘制一个矩形
         * @method egret.Graphics#drawRect
         * @param x {number} 圆心相对于父显示对象注册点的 x 位置（以像素为单位）。
         * @param y {number} 相对于父显示对象注册点的圆心的 y 位置（以像素为单位）。
         * @param width {number} 矩形的宽度（以像素为单位）。
         * @param height {number} 矩形的高度（以像素为单位）。
         */
        __egretProto__.drawRect = function (x, y, width, height) {
            this._pushCommand(new Command(function (x, y, width, height) {
                this._renderContext.beginPath();
                this._renderContext.rect(x, y, width, height);
                this._renderContext.closePath();
            }, this, [x, y, width, height]));
            //this._fill();
            this._checkRect(x, y, width, height);
        };
        /**
         * 绘制一个圆。
         * @method egret.Graphics#drawCircle
         * @param x {number} 圆心相对于父显示对象注册点的 x 位置（以像素为单位）。
         * @param y {number} 相对于父显示对象注册点的圆心的 y 位置（以像素为单位）。
         * @param r {number} 圆的半径（以像素为单位）。
         */
        __egretProto__.drawCircle = function (x, y, r) {
            this._pushCommand(new Command(function (x, y, r) {
                this._renderContext.beginPath();
                this._renderContext.arc(x, y, r, 0, Math.PI * 2);
                this._renderContext.closePath();
            }, this, [x, y, r]));
            //this._fill();
            this._checkRect(x - r, y - r, 2 * r, 2 * r);
        };
        /**
         * 绘制一个圆角矩形
         * @method egret.Graphics#drawRoundRect
         * @param x {number} 圆心相对于父显示对象注册点的 x 位置（以像素为单位）。
         * @param y {number} 相对于父显示对象注册点的圆心的 y 位置（以像素为单位）。
         * @param width {number} 矩形的宽度（以像素为单位）。
         * @param height {number} 矩形的高度（以像素为单位）。
         * @param ellipseWidth {number} 用于绘制圆角的椭圆的宽度（以像素为单位）。
         * @param ellipseHeight {number} 用于绘制圆角的椭圆的高度（以像素为单位）。 （可选）如果未指定值，则默认值与为 ellipseWidth 参数提供的值相匹配。
         */
        __egretProto__.drawRoundRect = function (x, y, width, height, ellipseWidth, ellipseHeight) {
            //非等值椭圆角实现
            this._pushCommand(new Command(function (x, y, width, height, ellipseWidth, ellipseHeight) {
                var _x = x; //控制X偏移
                var _y = y; //控制Y偏移
                var _w = width;
                var _h = height;
                var _ew = ellipseWidth / 2;
                var _eh = ellipseHeight ? ellipseHeight / 2 : _ew;
                var right = _x + _w;
                var bottom = _y + _h;
                var ax = right;
                var ay = bottom - _eh;
                this._renderContext.beginPath();
                this._renderContext.moveTo(ax, ay);
                this._renderContext.quadraticCurveTo(right, bottom, right - _ew, bottom);
                this._renderContext.lineTo(_x + _ew, bottom);
                this._renderContext.quadraticCurveTo(_x, bottom, _x, bottom - _eh);
                this._renderContext.lineTo(_x, _y + _eh);
                this._renderContext.quadraticCurveTo(_x, _y, _x + _ew, _y);
                this._renderContext.lineTo(right - _ew, _y);
                this._renderContext.quadraticCurveTo(right, _y, right, _y + _eh);
                this._renderContext.lineTo(ax, ay);
                this._renderContext.closePath();
            }, this, [x, y, width, height, ellipseWidth, ellipseHeight]));
            //this._fill();
            this._checkRect(x, y, width, height);
        };
        /**
         * 绘制一个椭圆。
         * @method egret.Graphics#drawEllipse
         * @param x {number} 一个表示相对于父显示对象注册点的水平位置的数字（以像素为单位）。
         * @param y {number} 一个表示相对于父显示对象注册点的垂直位置的数字（以像素为单位）。
         * @param width {number} 矩形的宽度（以像素为单位）。
         * @param height {number} 矩形的高度（以像素为单位）。
         */
        __egretProto__.drawEllipse = function (x, y, width, height) {
            //基于均匀压缩算法
            this._pushCommand(new Command(function (x, y, width, height) {
                var _x = x + width / 2; //控制X偏移
                var _y = y + height / 2; //控制Y偏移
                var r = (width > height) ? width : height; //选宽高较大者做为arc半径参数
                var ratioX = width / r; //横轴缩放比率
                var ratioY = height / r; //纵轴缩放比率
                r /= 2;
                this._renderContext.scale(ratioX, ratioY); //进行缩放(均匀压缩)
                this._renderContext.beginPath();
                this._renderContext.arc(_x / ratioX, _y / ratioY, r, 0, 2 * Math.PI);
                this._renderContext.closePath();
                this._renderContext.scale(1 / ratioX, 1 / ratioY); //缩放回去
            }, this, [x, y, width, height]));
            //this._fill();
            this._checkRect(x, y, width, height);
        };
        /**
         * 指定一种线条样式以用于随后对 lineTo() 或 drawCircle() 等 Graphics 方法的调用。
         * @method egret.Graphics#lineStyle
         * @param thickness {number} 一个整数，以点为单位表示线条的粗细，有效值为 0 到 255。如果未指定数字，或者未定义该参数，则不绘制线条。如果传递的值小于 0，则默认值为 0。值 0 表示极细的粗细；最大粗细为 255。如果传递的值大于 255，则默认值为 255。
         * @param color {number} 线条的十六进制颜色值（例如，红色为 0xFF0000，蓝色为 0x0000FF 等）。如果未指明值，则默认值为 0x000000（黑色）。可选。
         * @param alpha {number} 表示线条颜色的 Alpha 值的数字；有效值为 0 到 1。如果未指明值，则默认值为 1（纯色）。如果值小于 0，则默认值为 0。如果值大于 1，则默认值为 1。
         * @param pixelHinting {boolean} 布尔型值，指定是否提示笔触采用完整像素。它同时影响曲线锚点的位置以及线条笔触大小本身。在 pixelHinting 设置为 true 的情况下，线条宽度会调整到完整像素宽度。在 pixelHinting 设置为 false 的情况下，对于曲线和直线可能会出现脱节。
         * @param scaleMode {string} 用于指定要使用的比例模式
         * @param caps {string} 用于指定线条末端处端点类型的 CapsStyle 类的值。
         * @param joints {string} 指定用于拐角的连接外观的类型。
         * @param miterLimit {number} 用于表示剪切斜接的极限值的数字。
         */
        __egretProto__.lineStyle = function (thickness, color, alpha, pixelHinting, scaleMode, caps, joints, miterLimit) {
            if (thickness === void 0) { thickness = NaN; }
            if (color === void 0) { color = 0; }
            if (alpha === void 0) { alpha = 1.0; }
            if (pixelHinting === void 0) { pixelHinting = false; }
            if (scaleMode === void 0) { scaleMode = "normal"; }
            if (caps === void 0) { caps = null; }
            if (joints === void 0) { joints = null; }
            if (miterLimit === void 0) { miterLimit = 3; }
            if (this.strokeStyleColor) {
                this._createEndLineCommand();
                this._pushCommand(this._endLineCommand);
            }
            this.strokeStyleColor = this._parseColor(color, alpha);
            this._pushCommand(new Command(function (lineWidth, strokeStyle) {
                this._renderContext.lineWidth = lineWidth;
                this._renderContext.strokeStyle = strokeStyle;
                this._renderContext.beginPath();
            }, this, [thickness, this.strokeStyleColor]));
            this.moveTo(this.lineX, this.lineY);
        };
        /**
         * 使用当前线条样式绘制一条从当前绘图位置开始到 (x, y) 结束的直线；当前绘图位置随后会设置为 (x, y)。
         * @method egret.Graphics#lineTo
         * @param x {number} 一个表示相对于父显示对象注册点的水平位置的数字（以像素为单位）。
         * @param y {number} 一个表示相对于父显示对象注册点的垂直位置的数字（以像素为单位）。
         */
        __egretProto__.lineTo = function (x, y) {
            this._pushCommand(new Command(function (x, y) {
                this._renderContext.lineTo(x, y);
            }, this, [x, y]));
            this._checkPoint(this.lineX, this.lineY);
            this.lineX = x;
            this.lineY = y;
            this._checkPoint(x, y);
        };
        /**
         * 使用当前线条样式和由 (controlX, controlY) 指定的控制点绘制一条从当前绘图位置开始到 (anchorX, anchorY) 结束的二次贝塞尔曲线。当前绘图位置随后设置为 (anchorX, anchorY)。
         * 如果在调用 moveTo() 方法之前调用了 curveTo() 方法，则当前绘图位置的默认值为 (0, 0)。如果缺少任何一个参数，则此方法将失败，并且当前绘图位置不改变。
         * 绘制的曲线是二次贝塞尔曲线。二次贝塞尔曲线包含两个锚点和一个控制点。该曲线内插这两个锚点，并向控制点弯曲。
         * @method egret.Graphics#curveTo
         * @param controlX {number} 一个数字，指定控制点相对于父显示对象注册点的水平位置。
         * @param controlY {number} 一个数字，指定控制点相对于父显示对象注册点的垂直位置。
         * @param anchorX {number} 一个数字，指定下一个锚点相对于父显示对象注册点的水平位置。
         * @param anchorY {number} 一个数字，指定下一个锚点相对于父显示对象注册点的垂直位置。
         */
        __egretProto__.curveTo = function (controlX, controlY, anchorX, anchorY) {
            this._pushCommand(new Command(function (x, y, ax, ay) {
                this._renderContext.quadraticCurveTo(x, y, ax, ay);
            }, this, [controlX, controlY, anchorX, anchorY]));
            this._checkPoint(this.lineX, this.lineY);
            this.lineX = anchorX;
            this.lineY = anchorY;
            this._checkPoint(controlX, controlY);
            this._checkPoint(anchorX, anchorY);
        };
        /**
         * 从当前绘图位置到指定的锚点绘制一条三次贝塞尔曲线。三次贝塞尔曲线由两个锚点和两个控制点组成。该曲线内插这两个锚点，并向两个控制点弯曲。
         * @method egret.Graphics#curveTo
         * @param controlX1 {number} 指定首个控制点相对于父显示对象的注册点的水平位置。
         * @param controlY1 {number} 指定首个控制点相对于父显示对象的注册点的垂直位置。
         * @param controlX2 {number} 指定第二个控制点相对于父显示对象的注册点的水平位置。
         * @param controlY2 {number} 指定第二个控制点相对于父显示对象的注册点的垂直位置。
         * @param anchorX {number} 指定锚点相对于父显示对象的注册点的水平位置。
         * @param anchorY {number} 指定锚点相对于父显示对象的注册点的垂直位置。
         */
        __egretProto__.cubicCurveTo = function (controlX1, controlY1, controlX2, controlY2, anchorX, anchorY) {
            this._pushCommand(new Command(function (x1, y1, x2, y2, ax, ay) {
                this._renderContext.bezierCurveTo(x1, y1, x2, y2, ax, ay);
            }, this, [controlX1, controlY1, controlX2, controlY2, anchorX, anchorY]));
            this._checkPoint(this.lineX, this.lineY);
            this.lineX = anchorX;
            this.lineY = anchorY;
            this._checkPoint(controlX1, controlY1);
            this._checkPoint(controlX2, controlY2);
            this._checkPoint(anchorX, anchorY);
        };
        /**
         * 将当前绘图位置移动到 (x, y)。如果缺少任何一个参数，则此方法将失败，并且当前绘图位置不改变。
         * @method egret.Graphics#moveTo
         * @param x {number} 一个表示相对于父显示对象注册点的水平位置的数字（以像素为单位）。
         * @param y {number} 一个表示相对于父显示对象注册点的垂直位置的数字（以像素为单位）。
         */
        __egretProto__.moveTo = function (x, y) {
            this._pushCommand(new Command(function (x, y) {
                this._renderContext.moveTo(x, y);
            }, this, [x, y]));
            this.lineX = x;
            this.lineY = y;
        };
        /**
         * 清除绘制到此 Graphics 对象的图形，并重置填充和线条样式设置。
         * @method egret.Graphics#clear
         */
        __egretProto__.clear = function () {
            this.commandQueue.length = 0;
            this.lineX = 0;
            this.lineY = 0;
            this.strokeStyleColor = null;
            this.fillStyleColor = null;
            this._minX = 0;
            this._minY = 0;
            this._maxX = 0;
            this._maxY = 0;
            this._firstCheck = true;
            this._dirty = true;
        };
        /**
         * 对从上一次调用 beginFill()方法之后添加的直线和曲线应用填充。
         * @method egret.Graphics#endFill
         */
        __egretProto__.endFill = function () {
            if (this.fillStyleColor != null) {
                this._fill();
                this.fillStyleColor = null;
            }
        };
        __egretProto__._beginDraw = function (renderContext) {
        };
        __egretProto__._endDraw = function (renderContext) {
        };
        __egretProto__._draw = function (renderContext) {
            var length = this.commandQueue.length;
            if (length == 0) {
                return;
            }
            this._beginDraw(renderContext);
            for (var i = 0; i < length; i++) {
                var command = this.commandQueue[i];
                command.method.apply(command.thisObject, command.args);
            }
            if (this.fillStyleColor) {
                this._createEndFillCommand();
                command = this._endFillCommand;
                command.method.apply(command.thisObject, command.args);
            }
            if (this.strokeStyleColor) {
                this._createEndLineCommand();
                command = this._endLineCommand;
                command.method.apply(command.thisObject, command.args);
            }
            this._endDraw(renderContext);
            this._dirty = false;
        };
        __egretProto__._checkRect = function (x, y, w, h) {
            if (this._firstCheck) {
                this._firstCheck = false;
                this._minX = x;
                this._minY = y;
                this._maxX = x + w;
                this._maxY = y + h;
            }
            else {
                this._minX = Math.min(this._minX, x);
                this._minY = Math.min(this._minY, y);
                this._maxX = Math.max(this._maxX, x + w);
                this._maxY = Math.max(this._maxY, y + h);
            }
            this._dirty = true;
        };
        __egretProto__._checkPoint = function (x, y) {
            if (this._firstCheck) {
                this._firstCheck = false;
                this._minX = x;
                this._minY = y;
                this._maxX = x;
                this._maxY = y;
            }
            else {
                this._minX = Math.min(this._minX, x);
                this._minY = Math.min(this._minY, y);
                this._maxX = Math.max(this._maxX, x);
                this._maxY = Math.max(this._maxY, y);
            }
            this._lastX = x;
            this._lastY = y;
            this._dirty = true;
        };
        __egretProto__._measureBounds = function () {
            return egret.Rectangle.identity.initialize(this._minX, this._minY, this._maxX - this._minX, this._maxY - this._minY);
        };
        __egretProto__._createEndFillCommand = function () {
            if (!this._endFillCommand) {
                this._endFillCommand = new Command(function () {
                    this._renderContext.fill();
                    this._renderContext.closePath();
                }, this, null);
            }
        };
        __egretProto__._fill = function () {
            if (this.fillStyleColor) {
                this._createEndFillCommand();
                this._pushCommand(this._endFillCommand);
            }
            if (this.strokeStyleColor) {
                this._createEndLineCommand();
                this._pushCommand(this._endLineCommand);
            }
        };
        __egretProto__._createEndLineCommand = function () {
            if (!this._endLineCommand) {
                this._endLineCommand = new Command(function () {
                    this._renderContext.stroke();
                    this._renderContext.closePath();
                }, this, null);
            }
        };
        __egretProto__._pushCommand = function (cmd) {
            this.commandQueue.push(cmd);
            this._dirty = true;
        };
        return Graphics;
    })();
    egret.Graphics = Graphics;
    Graphics.prototype.__class__ = "egret.Graphics";
    var Command = (function () {
        function Command(method, thisObject, args) {
            this.method = method;
            this.thisObject = thisObject;
            this.args = args;
        }
        var __egretProto__ = Command.prototype;
        return Command;
    })();
    Command.prototype.__class__ = "egret.Command";
})(egret || (egret = {}));
