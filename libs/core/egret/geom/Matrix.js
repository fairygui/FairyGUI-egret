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
     * @class egret.Matrix
     * @classdesc
     * Matrix 类表示一个转换矩阵，它确定如何将点从一个坐标空间映射到另一个坐标空间。
     * 您可以对一个显示对象执行不同的图形转换，方法是设置 Matrix 对象的属性，将该 Matrix 对象应用于 Transform 对象的 matrix 属性，然后应用该 Transform 对象作为显示对象的 transform 属性。这些转换函数包括平移（x 和 y 重新定位）、旋转、缩放和倾斜。
     * @extends egret.HashObject
     */
    var Matrix = (function (_super) {
        __extends(Matrix, _super);
        /**
         * 创建一个 egret.Matrix 对象
         * @method egret.Matrix#constructor
         * @param a {number} 缩放或旋转图像时影响像素沿 x 轴定位的值。
         * @param b {number} 旋转或倾斜图像时影响像素沿 y 轴定位的值。
         * @param c {number} 旋转或倾斜图像时影响像素沿 x 轴定位的值。
         * @param d {number} 缩放或旋转图像时影响像素沿 y 轴定位的值。
         * @param tx {number} 沿 x 轴平移每个点的距离。
         * @param ty {number} 沿 y 轴平移每个点的距离。
         */
        function Matrix(a, b, c, d, tx, ty) {
            if (a === void 0) { a = 1; }
            if (b === void 0) { b = 0; }
            if (c === void 0) { c = 0; }
            if (d === void 0) { d = 1; }
            if (tx === void 0) { tx = 0; }
            if (ty === void 0) { ty = 0; }
            _super.call(this);
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
        }
        var __egretProto__ = Matrix.prototype;
        /**
         * 前置矩阵
         * @method egret.Matrix#prepend
         * @param a {number} 缩放或旋转图像时影响像素沿 x 轴定位的值
         * @param b {number} 缩放或旋转图像时影响像素沿 y 轴定位的值
         * @param c {number} 缩放或旋转图像时影响像素沿 x 轴定位的值
         * @param d {number} 缩放或旋转图像时影响像素沿 y 轴定位的值
         * @param tx {number} 沿 x 轴平移每个点的距离
         * @param ty {number} 沿 y 轴平移每个点的距离
         * @returns {egret.Matrix}
         */
        __egretProto__.prepend = function (a, b, c, d, tx, ty) {
            var tx1 = this.tx;
            if (a != 1 || b != 0 || c != 0 || d != 1) {
                var a1 = this.a;
                var c1 = this.c;
                this.a = a1 * a + this.b * c;
                this.b = a1 * b + this.b * d;
                this.c = c1 * a + this.d * c;
                this.d = c1 * b + this.d * d;
            }
            this.tx = tx1 * a + this.ty * c + tx;
            this.ty = tx1 * b + this.ty * d + ty;
            return this;
        };
        /**
         * 后置矩阵
         * @method egret.Matrix#append
         * @param a {number} 缩放或旋转图像时影响像素沿 x 轴定位的值
         * @param b {number} 缩放或旋转图像时影响像素沿 y 轴定位的值
         * @param c {number} 缩放或旋转图像时影响像素沿 x 轴定位的值
         * @param d {number} 缩放或旋转图像时影响像素沿 y 轴定位的值
         * @param tx {number} 沿 x 轴平移每个点的距离
         * @param ty {number} 沿 y 轴平移每个点的距离
         * @returns {egret.Matrix}
         */
        __egretProto__.append = function (a, b, c, d, tx, ty) {
            var a1 = this.a;
            var b1 = this.b;
            var c1 = this.c;
            var d1 = this.d;
            if (a != 1 || b != 0 || c != 0 || d != 1) {
                this.a = a * a1 + b * c1;
                this.b = a * b1 + b * d1;
                this.c = c * a1 + d * c1;
                this.d = c * b1 + d * d1;
            }
            this.tx = tx * a1 + ty * c1 + this.tx;
            this.ty = tx * b1 + ty * d1 + this.ty;
            return this;
        };
        /**
         * 前置矩阵
         * @method egret.Matrix#prependTransform
         * @param x {number} x值
         * @param y {number} y值
         * @param scaleX {number} 水平缩放
         * @param scaleY {number} 垂直缩放
         * @param rotation {number} 旋转
         * @param skewX {number} x方向斜切
         * @param skewY {number} y方向斜切
         * @param regX {number} x值偏移
         * @param regY {number} y值偏移
         * @returns {egret.Matrix}
         */
        __egretProto__.prependTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
            if (rotation % 360) {
                var r = rotation; // * Matrix.DEG_TO_RAD;
                var cos = egret.NumberUtils.cos(r);
                var sin = egret.NumberUtils.sin(r);
            }
            else {
                cos = 1;
                sin = 0;
            }
            if (regX || regY) {
                // append the registration offset:
                this.tx -= regX;
                this.ty -= regY;
            }
            if (skewX || skewY) {
                // TODO: can this be combined into a single prepend operation?
                //                skewX *= Matrix.DEG_TO_RAD;
                //                skewY *= Matrix.DEG_TO_RAD;
                this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
                this.prepend(egret.NumberUtils.cos(skewY), egret.NumberUtils.sin(skewY), -egret.NumberUtils.sin(skewX), egret.NumberUtils.cos(skewX), x, y);
            }
            else {
                this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
            }
            return this;
        };
        /**
         * 后置矩阵
         * @method egret.Matrix#appendTransform
         * @param x {number} x值
         * @param y {number} y值
         * @param scaleX {number} 水平缩放
         * @param scaleY {number} 垂直缩放
         * @param rotation {number} 旋转
         * @param skewX {number} x方向斜切
         * @param skewY {number} y方向斜切
         * @param regX {number} x值偏移
         * @param regY {number} y值偏移
         * @returns {egret.Matrix}
         */
        __egretProto__.appendTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
            if (rotation % 360) {
                var r = rotation; // * Matrix.DEG_TO_RAD;
                var cos = egret.NumberUtils.cos(r);
                var sin = egret.NumberUtils.sin(r);
            }
            else {
                cos = 1;
                sin = 0;
            }
            if (skewX || skewY) {
                // TODO: can this be combined into a single append?
                //                skewX *= Matrix.DEG_TO_RAD;
                //                skewY *= Matrix.DEG_TO_RAD;
                this.append(egret.NumberUtils.cos(skewY), egret.NumberUtils.sin(skewY), -egret.NumberUtils.sin(skewX), egret.NumberUtils.cos(skewX), x, y);
                this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
            }
            else {
                this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
            }
            if (regX || regY) {
                // prepend the registration offset:
                this.tx -= regX * this.a + regY * this.c;
                this.ty -= regX * this.b + regY * this.d;
            }
            return this;
        };
        /**
         * 对 Matrix 对象应用旋转转换。
         * 矩阵旋转，以角度制为单位
         * @method egret.Matrix#rotate
         * @param angle {number} 角度
         * @returns {egret.Matrix}
         */
        __egretProto__.rotate = function (angle) {
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            var a1 = this.a;
            var c1 = this.c;
            var tx1 = this.tx;
            this.a = a1 * cos - this.b * sin;
            this.b = a1 * sin + this.b * cos;
            this.c = c1 * cos - this.d * sin;
            this.d = c1 * sin + this.d * cos;
            this.tx = tx1 * cos - this.ty * sin;
            this.ty = tx1 * sin + this.ty * cos;
            return this;
        };
        /**
         * 矩阵斜切，以角度值为单位
         * @method egret.Matrix#skew
         * @param skewX {number} x方向斜切
         * @param skewY {number} y方向斜切
         * @returns {egret.Matrix}
         */
        __egretProto__.skew = function (skewX, skewY) {
            //            skewX = skewX * Matrix.DEG_TO_RAD;
            //            skewY = skewY * Matrix.DEG_TO_RAD;
            this.append(egret.NumberUtils.cos(skewY), egret.NumberUtils.sin(skewY), -egret.NumberUtils.sin(skewX), egret.NumberUtils.cos(skewX), 0, 0);
            return this;
        };
        /**
         * 矩阵缩放
         * @method egret.Matrix#scale
         * @param x {number} 水平缩放
         * @param y {number} 垂直缩放
         * @returns {egret.Matrix}
         */
        __egretProto__.scale = function (x, y) {
            this.a *= x;
            this.d *= y;
            this.c *= x;
            this.b *= y;
            this.tx *= x;
            this.ty *= y;
            return this;
        };
        /**
         * 沿 x 和 y 轴平移矩阵，由 x 和 y 参数指定。
         * @method egret.Matrix#translate
         * @param x {number} 沿 x 轴向右移动的量（以像素为单位）。
         * @param y {number} 沿 y 轴向下移动的量（以像素为单位）。
         * @returns {egret.Matrix}
         */
        __egretProto__.translate = function (x, y) {
            this.tx += x;
            this.ty += y;
            return this;
        };
        /**
         * 为每个矩阵属性设置一个值，该值将导致 null 转换。
         * 通过应用恒等矩阵转换的对象将与原始对象完全相同。
         * 调用 identity() 方法后，生成的矩阵具有以下属性：a=1、b=0、c=0、d=1、tx=0 和 ty=0。
         * @method egret.Matrix#identity
         * @returns {egret.Matrix}
         */
        __egretProto__.identity = function () {
            this.a = this.d = 1;
            this.b = this.c = this.tx = this.ty = 0;
            return this;
        };
        /**
         * 矩阵重置为目标矩阵
         * @method egret.Matrix#identityMatrix
         * @param matrix {egret.Matrix} 重置的目标矩阵
         * @returns {egret.Matrix}
         */
        __egretProto__.identityMatrix = function (matrix) {
            this.a = matrix.a;
            this.b = matrix.b;
            this.c = matrix.c;
            this.d = matrix.d;
            this.tx = matrix.tx;
            this.ty = matrix.ty;
            return this;
        };
        /**
         * 执行原始矩阵的逆转换。
         * 您可以将一个逆矩阵应用于对象来撤消在应用原始矩阵时执行的转换。
         * @method egret.Matrix#invert
         * @returns {egret.Matrix}
         */
        __egretProto__.invert = function () {
            var a1 = this.a;
            var b1 = this.b;
            var c1 = this.c;
            var d1 = this.d;
            var tx1 = this.tx;
            var n = a1 * d1 - b1 * c1;
            this.a = d1 / n;
            this.b = -b1 / n;
            this.c = -c1 / n;
            this.d = a1 / n;
            this.tx = (c1 * this.ty - d1 * tx1) / n;
            this.ty = -(a1 * this.ty - b1 * tx1) / n;
            return this;
        };
        /**
         * 根据一个矩阵，返回某个点在该矩阵上的坐标
         * @method egret.Matrix.transformCoords
         * @param matrix {egret.Matrix}
         * @param x {number}
         * @param y {number}
         * @returns {numberPoint}
         * @stable C 该方法以后可能删除
         */
        Matrix.transformCoords = function (matrix, x, y) {
            var resultPoint = egret.Point.identity;
            resultPoint.x = matrix.a * x + matrix.c * y + matrix.tx;
            resultPoint.y = matrix.d * y + matrix.b * x + matrix.ty;
            //        resultPoint.x = matrix.a * x + matrix.c * y - matrix.tx;
            //        resultPoint.y = matrix.d * y + matrix.b * x - matrix.ty;
            return resultPoint;
        };
        __egretProto__.toArray = function (transpose) {
            if (!this.array) {
                this.array = new Float32Array(9);
            }
            if (transpose) {
                this.array[0] = this.a;
                this.array[1] = this.b;
                this.array[2] = 0;
                this.array[3] = this.c;
                this.array[4] = this.d;
                this.array[5] = 0;
                this.array[6] = this.tx;
                this.array[7] = this.ty;
                this.array[8] = 1;
            }
            else {
                this.array[0] = this.a;
                this.array[1] = this.b;
                this.array[2] = this.tx;
                this.array[3] = this.c;
                this.array[4] = this.d;
                this.array[5] = this.ty;
                this.array[6] = 0;
                this.array[7] = 0;
                this.array[8] = 1;
            }
            return this.array;
        };
        /**
         * 将 Matrix 的成员设置为指定值
         * @method egret.Matrix#setTo
         * @param aa {number} 要将 Matrix 设置为的值
         * @param ba {number} 要将 Matrix 设置为的值
         * @param ca {number} 要将 Matrix 设置为的值
         * @param da {number} 要将 Matrix 设置为的值
         * @param txa {number} 要将 Matrix 设置为的值
         * @param tya {number} 要将 Matrix 设置为的值
         */
        __egretProto__.setTo = function (aa, ba, ca, da, txa, tya) {
            this.a = aa;
            this.b = ba;
            this.c = ca;
            this.d = da;
            this.tx = txa;
            this.ty = tya;
        };
        /**
         * 将源 Matrix 对象中的所有矩阵数据复制到调用方 Matrix 对象中。
         * @method egret.Matrix#copyForm
         * @param sourceMatrix {egret.Matrix} 要从中复制数据的 Matrix 对象
         */
        __egretProto__.copyForm = function (sourceMatrix) {
            this.identityMatrix(sourceMatrix);
        };
        Matrix.identity = new Matrix();
        Matrix.DEG_TO_RAD = Math.PI / 180;
        return Matrix;
    })(egret.HashObject);
    egret.Matrix = Matrix;
    Matrix.prototype.__class__ = "egret.Matrix";
})(egret || (egret = {}));
