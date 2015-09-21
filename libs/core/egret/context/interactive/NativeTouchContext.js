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
    var NativeTouchContext = (function (_super) {
        __extends(NativeTouchContext, _super);
        function NativeTouchContext() {
            _super.call(this);
        }
        var __egretProto__ = NativeTouchContext.prototype;
        __egretProto__.run = function () {
        };
        return NativeTouchContext;
    })(egret.TouchContext);
    egret.NativeTouchContext = NativeTouchContext;
    NativeTouchContext.prototype.__class__ = "egret.NativeTouchContext";
})(egret || (egret = {}));
var egret_native;
(function (egret_native) {
    function onTouchesBegin(num, ids, xs_array, ys_array) {
        this.executeTouchCallback(num, ids, xs_array, ys_array, egret.MainContext.instance.touchContext.onTouchBegan);
    }
    egret_native.onTouchesBegin = onTouchesBegin;
    function onTouchesMove(num, ids, xs_array, ys_array) {
        this.executeTouchCallback(num, ids, xs_array, ys_array, egret.MainContext.instance.touchContext.onTouchMove);
    }
    egret_native.onTouchesMove = onTouchesMove;
    function onTouchesEnd(num, ids, xs_array, ys_array) {
        this.executeTouchCallback(num, ids, xs_array, ys_array, egret.MainContext.instance.touchContext.onTouchEnd);
    }
    egret_native.onTouchesEnd = onTouchesEnd;
    function onTouchesCancel(num, ids, xs_array, ys_array) {
    }
    egret_native.onTouchesCancel = onTouchesCancel;
    function executeTouchCallback(num, ids, xs_array, ys_array, callback) {
        for (var i = 0; i < num; i++) {
            var id = ids[i];
            var x = xs_array[i];
            var y = ys_array[i];
            callback.call(egret.MainContext.instance.touchContext, x, y, id);
        }
    }
    egret_native.executeTouchCallback = executeTouchCallback;
})(egret_native || (egret_native = {}));
