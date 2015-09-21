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
    var PromiseObject = (function () {
        function PromiseObject() {
            this.onSuccessFunc = null;
            this.onSuccessThisObject = null;
            this.onErrorFunc = null;
            this.onErrorThisObject = null;
            this.downloadingSizeFunc = null;
            this.downloadingSizeThisObject = null;
        }
        var __egretProto__ = PromiseObject.prototype;
        PromiseObject.create = function () {
            if (PromiseObject.promiseObjectList.length) {
                return PromiseObject.promiseObjectList.pop();
            }
            else {
                return new egret.PromiseObject();
            }
        };
        __egretProto__.onSuccess = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (this.onSuccessFunc) {
                this.onSuccessFunc.apply(this.onSuccessThisObject, args);
            }
            this.destroy();
        };
        __egretProto__.onError = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (this.onErrorFunc) {
                this.onErrorFunc.apply(this.onErrorThisObject, args);
            }
            this.destroy();
        };
        __egretProto__.downloadingSize = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (this.downloadingSizeFunc) {
                this.downloadingSizeFunc.apply(this.downloadingSizeThisObject, args);
            }
        };
        __egretProto__.destroy = function () {
            this.onSuccessFunc = undefined;
            this.onSuccessThisObject = undefined;
            this.onErrorFunc = undefined;
            this.onErrorThisObject = undefined;
            this.downloadingSizeFunc = undefined;
            this.downloadingSizeThisObject = undefined;
            PromiseObject.promiseObjectList.push(this);
        };
        PromiseObject.promiseObjectList = [];
        return PromiseObject;
    })();
    egret.PromiseObject = PromiseObject;
    PromiseObject.prototype.__class__ = "egret.PromiseObject";
})(egret || (egret = {}));
