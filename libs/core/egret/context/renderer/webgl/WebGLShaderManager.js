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
     *
     * @private
     */
    var WebGLShaderManager = (function () {
        function WebGLShaderManager(gl) {
            this.gl = null;
            this.maxAttibs = 10;
            this.attribState = [];
            this.tempAttribState = [];
            this.currentShader = null;
            this.defaultShader = null;
            this.primitiveShader = null;
            this.colorTransformShader = null;
            this.blurShader = null;
            for (var i = 0; i < this.maxAttibs; i++) {
                this.attribState[i] = false;
            }
            this.setContext(gl);
        }
        var __egretProto__ = WebGLShaderManager.prototype;
        __egretProto__.setContext = function (gl) {
            this.gl = gl;
            this.primitiveShader = new egret.PrimitiveShader(gl);
            this.defaultShader = new egret.EgretShader(gl);
            this.colorTransformShader = new egret.ColorTransformShader(gl);
            this.blurShader = new egret.BlurShader(gl);
            this.activateShader(this.defaultShader);
        };
        __egretProto__.activateShader = function (shader) {
            if (this.currentShader != shader) {
                this.gl.useProgram(shader.program);
                this.setAttribs(shader.attributes);
                this.currentShader = shader;
            }
        };
        __egretProto__.setAttribs = function (attribs) {
            var i;
            var l;
            l = this.tempAttribState.length;
            for (i = 0; i < l; i++) {
                this.tempAttribState[i] = false;
            }
            l = attribs.length;
            for (i = 0; i < l; i++) {
                var attribId = attribs[i];
                this.tempAttribState[attribId] = true;
            }
            var gl = this.gl;
            l = this.attribState.length;
            for (i = 0; i < l; i++) {
                if (this.attribState[i] !== this.tempAttribState[i]) {
                    this.attribState[i] = this.tempAttribState[i];
                    if (this.tempAttribState[i]) {
                        gl.enableVertexAttribArray(i);
                    }
                    else {
                        gl.disableVertexAttribArray(i);
                    }
                }
            }
        };
        return WebGLShaderManager;
    })();
    egret.WebGLShaderManager = WebGLShaderManager;
    WebGLShaderManager.prototype.__class__ = "egret.WebGLShaderManager";
})(egret || (egret = {}));
