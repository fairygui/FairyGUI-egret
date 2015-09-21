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
    var ColorMatrixFilter = (function (_super) {
        __extends(ColorMatrixFilter, _super);
        function ColorMatrixFilter(matrix) {
            if (matrix === void 0) { matrix = null; }
            _super.call(this);
            /**
             * @private
             */
            this._matrix = [];
            this._matrix2 = [];
            this.type = "colorTransform";
            this._setMatrix(matrix);
        }
        var __egretProto__ = ColorMatrixFilter.prototype;
        Object.defineProperty(__egretProto__, "matrix", {
            get: function () {
                for (var i = 0; i < 20; i++) {
                    this._matrix2[i] = this._matrix[i];
                }
                return this._matrix2;
            },
            set: function (value) {
                this._setMatrix(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setMatrix = function (value) {
            for (var i = 0; i < 20; i++) {
                this._matrix[i] = (value && value[i]) || 0;
            }
        };
        return ColorMatrixFilter;
    })(egret.Filter);
    egret.ColorMatrixFilter = ColorMatrixFilter;
    ColorMatrixFilter.prototype.__class__ = "egret.ColorMatrixFilter";
})(egret || (egret = {}));
