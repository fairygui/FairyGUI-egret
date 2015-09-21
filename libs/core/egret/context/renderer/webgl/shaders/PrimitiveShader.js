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
    var PrimitiveShader = (function () {
        function PrimitiveShader(gl) {
            this.gl = null;
            this.program = null;
            this.projectionVector = null;
            this.offsetVector = null;
            this.tintColor = null;
            this.aVertexPosition = null;
            this.colorAttribute = null;
            this.attributes = null;
            this.translationMatrix = null;
            this.alpha = null;
            this.fragmentSrc = "precision mediump float;\n" + "varying vec4 vColor;\n" + "void main(void) {\n" + "   gl_FragColor = vColor;\n" + "}";
            this.vertexSrc = "attribute vec2 aVertexPosition;\n" + "attribute vec4 aColor;\n" + "uniform mat3 translationMatrix;\n" + "uniform vec2 projectionVector;\n" + "uniform vec2 offsetVector;\n" + "uniform float alpha;\n" + "uniform vec3 tint;\n" + "varying vec4 vColor;\n" + "void main(void) {\n" + "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);\n" + "   v -= offsetVector.xyx;\n" + "   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);\n" + "   vColor = aColor * vec4(tint * alpha, alpha);\n" + "}";
            this.gl = gl;
            this.init();
        }
        var __egretProto__ = PrimitiveShader.prototype;
        __egretProto__.init = function () {
            var gl = this.gl;
            var program = egret.WebGLUtils.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
            gl.useProgram(program);
            this.projectionVector = gl.getUniformLocation(program, "projectionVector");
            this.offsetVector = gl.getUniformLocation(program, "offsetVector");
            this.tintColor = gl.getUniformLocation(program, "tint");
            this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
            this.colorAttribute = gl.getAttribLocation(program, "aColor");
            this.attributes = [this.aVertexPosition, this.colorAttribute];
            this.translationMatrix = gl.getUniformLocation(program, "translationMatrix");
            this.alpha = gl.getUniformLocation(program, "alpha");
            this.program = program;
        };
        return PrimitiveShader;
    })();
    egret.PrimitiveShader = PrimitiveShader;
    PrimitiveShader.prototype.__class__ = "egret.PrimitiveShader";
})(egret || (egret = {}));
