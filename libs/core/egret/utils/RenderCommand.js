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
    var RenderCommand = (function () {
        function RenderCommand() {
        }
        var __egretProto__ = RenderCommand.prototype;
        __egretProto__.call = function (renderContext) {
            var o = this;
            if (o.callback) {
                o.callback.call(o.thisObject, renderContext);
            }
        };
        __egretProto__.dispose = function () {
            this.callback = null;
            this.thisObject = null;
            RenderCommand.__freeList.push(this);
        };
        RenderCommand.push = function (callback, thisObject) {
            var cmd;
            if (RenderCommand.__freeList.length) {
                cmd = RenderCommand.__freeList.pop();
            }
            else {
                cmd = new egret.RenderCommand();
            }
            cmd.callback = callback;
            cmd.thisObject = thisObject;
            egret.MainContext.__DRAW_COMMAND_LIST.push(cmd);
        };
        RenderCommand.__freeList = [];
        return RenderCommand;
    })();
    egret.RenderCommand = RenderCommand;
    RenderCommand.prototype.__class__ = "egret.RenderCommand";
})(egret || (egret = {}));
