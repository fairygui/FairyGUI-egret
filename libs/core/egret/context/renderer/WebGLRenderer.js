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
     * @class egret.WebGLRenderer
     * @classdesc
     * WebGL的渲染类
     * @extends egret.RendererContext
     * @private
     */
    var WebGLRenderer = (function (_super) {
        __extends(WebGLRenderer, _super);
        function WebGLRenderer(canvas) {
            _super.call(this);
            this.canvas = null;
            this.gl = null;
            this.glID = null;
            this.size = 2000;
            this.vertices = null;
            this.vertSize = 5;
            this.indices = null;
            this.projectionX = NaN;
            this.projectionY = NaN;
            this.shaderManager = null;
            this.contextLost = false;
            this.glContextId = 0;
            this.currentBlendMode = "";
            this.currentBaseTexture = null;
            this.currentBatchSize = 0;
            this.worldTransform = null;
            this.worldAlpha = 1;
            this.maskList = [];
            this.maskDataFreeList = [];
            this.colorTransformMatrix = null;
            this.filterType = null;
            this.graphicsPoints = null;
            this.graphicsIndices = null;
            this.graphicsBuffer = null;
            this.graphicsIndexBuffer = null;
            this.graphicsStyle = {};
            egret.Texture.prototype.dispose = egret.Texture.prototype._disposeForCanvas;
            this.canvas = canvas || this.createCanvas();
            this.canvas.addEventListener("webglcontextlost", this.handleContextLost.bind(this), false);
            this.canvas.addEventListener("webglcontextrestored", this.handleContextRestored.bind(this), false);
            this.html5Canvas = document.createElement("canvas");
            this.canvasContext = new egret.HTML5CanvasRenderer(this.html5Canvas);
            this.onResize();
            this.projectionX = this.canvas.width / 2;
            this.projectionY = -this.canvas.height / 2;
            var numVerts = this.size * 4 * this.vertSize;
            var numIndices = this.size * 6;
            this.vertices = new Float32Array(numVerts);
            this.indices = new Uint16Array(numIndices);
            for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
                this.indices[i + 0] = j + 0;
                this.indices[i + 1] = j + 1;
                this.indices[i + 2] = j + 2;
                this.indices[i + 3] = j + 0;
                this.indices[i + 4] = j + 2;
                this.indices[i + 5] = j + 3;
            }
            this.initWebGL();
            this.shaderManager = new egret.WebGLShaderManager(this.gl);
            this.worldTransform = new egret.Matrix();
            this.initAll();
        }
        var __egretProto__ = WebGLRenderer.prototype;
        __egretProto__.onRenderFinish = function () {
            this._drawWebGL();
        };
        WebGLRenderer.initWebGLCanvas = function () {
            if (!egret.RenderTexture["WebGLCanvas"]) {
                egret.RenderTexture["WebGLCanvas"] = document.createElement("canvas");
                egret.RenderTexture["WebGLCanvas"]["avaliable"] = true;
                egret.RenderTexture["WebGLRenderer"] = new egret.WebGLRenderer(egret.RenderTexture["WebGLCanvas"]);
                egret.RenderTexture["WebGLRenderer"].setAlpha(1);
            }
        };
        __egretProto__.initAll = function () {
            if (WebGLRenderer.isInit) {
                return;
            }
            WebGLRenderer.isInit = true;
            egret_webgl_graphics.init();
            egret.TextField.prototype._makeBitmapCache = function () {
                var self = this;
                if (!self.renderTexture) {
                    self.renderTexture = new egret.RenderTexture();
                }
                var bounds = self.getBounds(egret.Rectangle.identity);
                if (bounds.width == 0 || bounds.height == 0) {
                    self._texture_to_render = null;
                    return false;
                }
                if (!self._bitmapData) {
                    self._bitmapData = document.createElement("canvas");
                    self._bitmapData["avaliable"] = true;
                    self.renderContext = egret.RendererContext.createRendererContext(self._bitmapData);
                }
                var cacheCanvas = self._bitmapData;
                var originalWidth = bounds.width;
                var originalHeight = bounds.height;
                var width = originalWidth;
                var height = originalHeight;
                var texture_scale_factor = egret.MainContext.instance.rendererContext._texture_scale_factor;
                width /= texture_scale_factor;
                height /= texture_scale_factor;
                width = Math.round(width);
                height = Math.round(height);
                cacheCanvas.width = width;
                cacheCanvas.height = height;
                cacheCanvas.style.width = width + "px";
                cacheCanvas.style.height = height + "px";
                if (self.renderContext._cacheCanvas) {
                    self.renderContext._cacheCanvas.width = width;
                    self.renderContext._cacheCanvas.height = height;
                }
                self._worldTransform.identity();
                self._worldTransform.a = 1 / texture_scale_factor;
                self._worldTransform.d = 1 / texture_scale_factor;
                self.renderContext.setTransform(self._worldTransform);
                self.worldAlpha = 1;
                var renderFilter = egret.RenderFilter.getInstance();
                var drawAreaList = renderFilter._drawAreaList.concat();
                renderFilter._drawAreaList.length = 0;
                self.renderContext.clearScreen();
                self.renderContext.onRenderStart();
                egret.Texture.deleteWebGLTexture(self.renderTexture);
                this.renderTexture.dispose();
                if (self._hasFilters()) {
                    self._setGlobalFilters(self.renderContext);
                }
                var mask = self.mask || self._DO_Props_._scrollRect;
                if (mask) {
                    self.renderContext.pushMask(mask);
                }
                self._render(self.renderContext);
                if (mask) {
                    self.renderContext.popMask();
                }
                if (self._hasFilters()) {
                    self._removeGlobalFilters(self.renderContext);
                }
                egret.RenderTexture.identityRectangle.width = width;
                egret.RenderTexture.identityRectangle.height = height;
                renderFilter.addDrawArea(egret.RenderTexture.identityRectangle);
                self.renderContext.onRenderFinish();
                renderFilter._drawAreaList = drawAreaList;
                self.renderTexture._bitmapData = self._bitmapData;
                self.renderTexture._sourceWidth = width;
                self.renderTexture._sourceHeight = height;
                self.renderTexture._textureWidth = originalWidth;
                self.renderTexture._textureHeight = originalHeight;
                self._texture_to_render = self.renderTexture;
                return true;
            };
            egret.TextField.prototype._draw = function (renderContext) {
                var self = this;
                var properties = self._TF_Props_;
                if (properties._type == egret.TextFieldType.INPUT) {
                    if (self._isTyping) {
                        return;
                    }
                }
                if (self.getDirty()) {
                    self._texture_to_render = self.renderTexture;
                    self._DO_Props_._cacheAsBitmap = true;
                }
                egret.DisplayObject.prototype._draw.call(self, renderContext);
            };
            egret.RenderTexture.prototype.init = function () {
                var self = this;
                self._bitmapData = document.createElement("canvas");
                self._bitmapData["avaliable"] = true;
                self.canvasContext = self._bitmapData.getContext("2d");
                //todo 多层嵌套会有隐患
                WebGLRenderer.initWebGLCanvas();
                self._webglBitmapData = egret.RenderTexture["WebGLCanvas"];
                self.renderContext = egret.RenderTexture["WebGLRenderer"];
            };
            egret.RenderTexture.prototype.setSize = function (width, height) {
                var o = this;
                if (o._webglBitmapData) {
                    o.renderContext.setSize(width, height);
                }
                if (o._bitmapData) {
                    var canvas = o._bitmapData;
                    canvas.width = width;
                    canvas.height = height;
                    canvas.style.width = width + "px";
                    canvas.style.height = height + "px";
                }
            };
            egret.RenderTexture.prototype.end = function () {
            };
            //todo 如果是文本会有问题
            egret.RenderTexture.prototype.drawToTexture = function (displayObject, clipBounds, scale) {
                var self = this;
                var bounds = clipBounds || displayObject.getBounds(egret.Rectangle.identity);
                if (bounds.width == 0 || bounds.height == 0) {
                    return false;
                }
                if (typeof scale == "undefined") {
                    scale = 1;
                }
                if (!self._bitmapData) {
                    self.init();
                }
                var x = bounds.x;
                var y = bounds.y;
                var width = bounds.width;
                var height = bounds.height;
                width /= scale;
                height /= scale;
                var texture_scale_factor = egret.MainContext.instance.rendererContext._texture_scale_factor;
                width = Math.round(width);
                height = Math.round(height);
                self.setSize(width, height);
                var cacheCanvas = self._bitmapData;
                var cacheCanvasWidth = width / texture_scale_factor * scale;
                var cacheCanvasHeight = height / texture_scale_factor * scale;
                cacheCanvas.width = cacheCanvasWidth;
                cacheCanvas.height = cacheCanvasHeight;
                cacheCanvas.style.width = cacheCanvasWidth + "px";
                cacheCanvas.style.height = cacheCanvasHeight + "px";
                self.begin();
                displayObject._worldTransform.identity();
                var anchorOffsetX = displayObject._DO_Props_._anchorOffsetX;
                var anchorOffsetY = displayObject._DO_Props_._anchorOffsetY;
                if (displayObject._DO_Props_._anchorX != 0 || displayObject._DO_Props_._anchorY != 0) {
                    anchorOffsetX = displayObject._DO_Props_._anchorX * width;
                    anchorOffsetY = displayObject._DO_Props_._anchorY * height;
                }
                self._offsetX = x + anchorOffsetX;
                self._offsetY = y + anchorOffsetY;
                displayObject._worldTransform.append(1, 0, 0, 1, -self._offsetX, -self._offsetY);
                if (clipBounds) {
                    self._offsetX -= x;
                    self._offsetY -= y;
                }
                displayObject.worldAlpha = 1;
                var __use_new_draw = egret.MainContext.__use_new_draw;
                egret.MainContext.__use_new_draw = false;
                if (displayObject instanceof egret.DisplayObjectContainer) {
                    var list = displayObject._children;
                    for (var i = 0, length = list.length; i < length; i++) {
                        var child = list[i];
                        child._updateTransform();
                    }
                }
                self.renderContext.setTransform(displayObject._worldTransform);
                var renderFilter = egret.RenderFilter.getInstance();
                var drawAreaList = renderFilter._drawAreaList.concat();
                renderFilter._drawAreaList.length = 0;
                var gl = self.renderContext.gl;
                gl.viewport(0, 0, width, height);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                self.renderContext.onRenderStart();
                egret.Texture.deleteWebGLTexture(self);
                if (displayObject._hasFilters()) {
                    displayObject._setGlobalFilters(self.renderContext);
                }
                var mask = displayObject.mask || displayObject._DO_Props_._scrollRect;
                if (mask) {
                    self.renderContext.pushMask(mask);
                }
                displayObject._render(self.renderContext);
                self.renderContext["_drawWebGL"]();
                egret.MainContext.__use_new_draw = __use_new_draw;
                if (mask) {
                    self.renderContext.popMask();
                }
                if (displayObject._hasFilters()) {
                    displayObject._removeGlobalFilters(self.renderContext);
                }
                egret.RenderTexture.identityRectangle.width = width;
                egret.RenderTexture.identityRectangle.height = height;
                renderFilter.addDrawArea(egret.RenderTexture.identityRectangle);
                self.renderContext.onRenderFinish();
                renderFilter._drawAreaList = drawAreaList;
                self._sourceWidth = width / texture_scale_factor * scale;
                self._sourceHeight = height / texture_scale_factor * scale;
                self._textureWidth = width * scale;
                self._textureHeight = height * scale;
                self.canvasContext.drawImage(self._webglBitmapData, 0, 0, width, height, 0, 0, self._sourceWidth, self._sourceHeight);
                //测试代码
                //document.documentElement.appendChild(self._bitmapData);
                return true;
            };
            //egret.Graphics.prototype._draw = function (renderContext:WebGLRenderer) {
            //    //todo dirty
            //    var commandQueue = this["commandQueue"];
            //    var length:number = commandQueue.length;
            //    if (length == 0) {
            //        return;
            //    }
            //    var stage:Stage = egret.MainContext.instance.stage;
            //    var stageW:number = stage.stageWidth;
            //    var stageH:number = stage.stageHeight;
            //
            //    this.renderContext = renderContext.canvasContext;
            //    this.canvasContext = this.renderContext._cacheCanvasContext || this.renderContext.canvasContext;
            //    this.canvasContext.clearRect(0, 0, stageW, stageH);
            //    this.canvasContext.save();
            //    var worldTransform:Matrix = renderContext.worldTransform;
            //    this.canvasContext.setTransform(worldTransform.a, worldTransform.b, worldTransform.c, worldTransform.d, worldTransform.tx, worldTransform.ty);
            //    var worldAlpha:number = renderContext.worldAlpha;
            //    renderContext.canvasContext.setAlpha(worldAlpha, null);
            //    if (this.strokeStyleColor && length > 0 && commandQueue[length - 1] != this.endLineCommand) {
            //        this.createEndLineCommand();
            //        commandQueue.push(this.endLineCommand);
            //        length = commandQueue.length;
            //    }
            //    for (var i:number = 0; i < length; i++) {
            //        var command = commandQueue[i];
            //        command.method.apply(command.thisObject, command.args);
            //    }
            //    this.renderContext.canvasContext.clearRect(0, 0, stageW, stageH);
            //    this.renderContext.canvasContext.drawImage(this.renderContext._cacheCanvas, 0, 0, stageW, stageH, 0, 0, stageW, stageH);
            //
            //    if (!this["graphics_webgl_texture"]) {
            //        this["graphics_webgl_texture"] = new egret.Texture();
            //    }
            //    this["graphics_webgl_texture"]._setBitmapData(renderContext.html5Canvas);
            //    RendererContext.deleteTexture(this);
            //    renderContext.setTransform(egret.Matrix.identity.identity());
            //    renderContext.drawImage(this["graphics_webgl_texture"], 0, 0, stageW, stageH, 0, 0, stageW, stageH);
            //    this.canvasContext.restore();
            //    this._dirty = false;
            //}
        };
        __egretProto__.createCanvas = function () {
            var canvas = egret.Browser.getInstance().$("#egretCanvas");
            if (!canvas) {
                var container = document.getElementById(egret.StageDelegate.canvas_div_name);
                canvas = egret.Browser.getInstance().$new("canvas");
                canvas.id = "egretCanvas";
                container.appendChild(canvas);
            }
            egret.MainContext.instance.stage.addEventListener(egret.Event.RESIZE, this.onResize, this);
            return canvas;
        };
        __egretProto__.onResize = function () {
            //设置canvas宽高
            var stageWidth = egret.MainContext.instance.stage.stageWidth;
            var stageHeight = egret.MainContext.instance.stage.stageHeight;
            this.setSize(stageWidth, stageHeight);
        };
        __egretProto__.setSize = function (width, height) {
            var container = document.getElementById(egret.StageDelegate.canvas_div_name);
            if (this.canvas) {
                this.canvas.width = width;
                this.canvas.height = height;
                this.canvas.style.width = container.style.width;
                this.canvas.style.height = container.style.height;
                //              this.canvas.style.position = "absolute";
                this.projectionX = this.canvas.width / 2;
                this.projectionY = -this.canvas.height / 2;
            }
            if (this.html5Canvas) {
                this.html5Canvas.width = width;
                this.html5Canvas.height = height;
                this.html5Canvas.style.width = container.style.width;
                this.html5Canvas.style.height = container.style.height;
            }
            this.width = width;
            this.height = height;
        };
        __egretProto__.handleContextLost = function () {
            this.contextLost = true;
        };
        __egretProto__.handleContextRestored = function () {
            this.initWebGL();
            this.shaderManager.setContext(this.gl);
            this.contextLost = false;
        };
        __egretProto__.initWebGL = function () {
            var options = {};
            var gl;
            var names = ["experimental-webgl", "webgl"];
            for (var i = 0; i < names.length; i++) {
                try {
                    gl = this.canvas.getContext(names[i], options);
                }
                catch (e) {
                }
                if (gl) {
                    break;
                }
            }
            if (!gl) {
                throw new Error(egret.getString(1021));
            }
            WebGLRenderer.glID++;
            this.glID = WebGLRenderer.glID;
            this.setContext(gl);
        };
        __egretProto__.setContext = function (gl) {
            this.gl = gl;
            gl.id = this.glContextId++;
            this.vertexBuffer = gl.createBuffer();
            this.indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
            gl.disable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);
            gl.enable(gl.BLEND);
            gl.colorMask(true, true, true, true);
        };
        __egretProto__.start = function () {
            if (this.contextLost) {
                return;
            }
            var gl = this.gl;
            gl.activeTexture(gl.TEXTURE0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            var shader;
            if (this.filterType == "colorTransform") {
                shader = this.shaderManager.colorTransformShader;
            }
            else if (this.filterType == "blur") {
                shader = this.shaderManager.blurShader;
            }
            else {
                shader = this.shaderManager.defaultShader;
            }
            this.shaderManager.activateShader(shader);
            shader.syncUniforms();
            gl.uniform2f(shader.projectionVector, this.projectionX, this.projectionY);
            var stride = this.vertSize * 4;
            gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
            gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, false, stride, 2 * 4);
            gl.vertexAttribPointer(shader.colorAttribute, 2, gl.FLOAT, false, stride, 4 * 4);
        };
        __egretProto__.clearScreen = function () {
            var gl = this.gl;
            gl.colorMask(true, true, true, true);
            var list = egret.RenderFilter.getInstance().getDrawAreaList();
            for (var i = 0, l = list.length; i < l; i++) {
                var area = list[i];
                gl.viewport(area.x, area.y, area.width, area.height);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
            var stage = egret.MainContext.instance.stage;
            gl.viewport(0, 0, this.width, this.height);
            this.renderCost = 0;
        };
        __egretProto__.setBlendMode = function (blendMode) {
            if (!blendMode) {
                blendMode = egret.BlendMode.NORMAL;
            }
            if (this.currentBlendMode != blendMode) {
                var blendModeWebGL = egret.RendererContext.blendModesForGL[blendMode];
                if (blendModeWebGL) {
                    this._drawWebGL();
                    this.gl.blendFunc(blendModeWebGL[0], blendModeWebGL[1]);
                    this.currentBlendMode = blendMode;
                }
            }
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
        __egretProto__.drawImage = function (texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat) {
            if (repeat === void 0) { repeat = undefined; }
            if (this.contextLost) {
                return;
            }
            var bitmapData = texture._bitmapData;
            if (!bitmapData || !bitmapData["avaliable"]) {
                return;
            }
            if (repeat !== undefined) {
                this.drawRepeatImage(texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, repeat);
                return;
            }
            if (this.filters) {
                for (var i = 0; i < 1; i++) {
                    var filter = this.filters[0];
                    if (filter.type == "glow") {
                        this.useGlow(texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
                        return;
                    }
                }
            }
            this._drawImage(texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
        };
        __egretProto__._drawImage = function (texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight) {
            this.createWebGLTexture(texture);
            var webGLTexture = texture._bitmapData.webGLTexture[this.glID];
            if (webGLTexture !== this.currentBaseTexture || this.currentBatchSize >= this.size - 1) {
                this._drawWebGL();
                this.currentBaseTexture = webGLTexture;
            }
            //计算出绘制矩阵，之后把矩阵还原回之前的
            var locWorldTransform = this.worldTransform;
            var originalA = locWorldTransform.a;
            var originalB = locWorldTransform.b;
            var originalC = locWorldTransform.c;
            var originalD = locWorldTransform.d;
            var originalTx = locWorldTransform.tx;
            var originalTy = locWorldTransform.ty;
            if (destX != 0 || destY != 0) {
                locWorldTransform.append(1, 0, 0, 1, destX, destY);
            }
            if (sourceWidth / destWidth != 1 || sourceHeight / destHeight != 1) {
                locWorldTransform.append(destWidth / sourceWidth, 0, 0, destHeight / sourceHeight, 0, 0);
            }
            var a = locWorldTransform.a;
            var b = locWorldTransform.b;
            var c = locWorldTransform.c;
            var d = locWorldTransform.d;
            var tx = locWorldTransform.tx;
            var ty = locWorldTransform.ty;
            locWorldTransform.a = originalA;
            locWorldTransform.b = originalB;
            locWorldTransform.c = originalC;
            locWorldTransform.d = originalD;
            locWorldTransform.tx = originalTx;
            locWorldTransform.ty = originalTy;
            var width = texture._sourceWidth;
            var height = texture._sourceHeight;
            var w = sourceWidth;
            var h = sourceHeight;
            sourceX = sourceX / width;
            sourceY = sourceY / height;
            sourceWidth = sourceWidth / width;
            sourceHeight = sourceHeight / height;
            var vertices = this.vertices;
            var index = this.currentBatchSize * 4 * this.vertSize;
            var alpha = this.worldAlpha;
            // xy
            vertices[index++] = tx;
            vertices[index++] = ty;
            // uv
            vertices[index++] = sourceX;
            vertices[index++] = sourceY;
            // alpha
            vertices[index++] = alpha;
            // xy
            vertices[index++] = a * w + tx;
            vertices[index++] = b * w + ty;
            // uv
            vertices[index++] = sourceWidth + sourceX;
            vertices[index++] = sourceY;
            // alpha
            vertices[index++] = alpha;
            // xy
            vertices[index++] = a * w + c * h + tx;
            vertices[index++] = d * h + b * w + ty;
            // uv
            vertices[index++] = sourceWidth + sourceX;
            vertices[index++] = sourceHeight + sourceY;
            // alpha
            vertices[index++] = alpha;
            // xy
            vertices[index++] = c * h + tx;
            vertices[index++] = d * h + ty;
            // uv
            vertices[index++] = sourceX;
            vertices[index++] = sourceHeight + sourceY;
            // alpha
            vertices[index++] = alpha;
            this.currentBatchSize++;
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
            WebGLRenderer.initWebGLCanvas();
            var renderContext = egret.RenderTexture["WebGLRenderer"];
            var webGLBitmapData = egret.RenderTexture["WebGLCanvas"];
            var renderTextureA = egret.RenderTexture.create();
            if (!renderTextureA._bitmapData) {
                renderTextureA.init();
            }
            renderTextureA.setSize(textureWidth, textureHeight);
            renderTextureA._sourceWidth = textureWidth;
            renderTextureA._sourceHeight = textureHeight;
            var renderTextureB = egret.RenderTexture.create();
            if (!renderTextureB._bitmapData) {
                renderTextureB.init();
            }
            renderTextureB.setSize(textureWidth, textureHeight);
            renderTextureB._sourceWidth = textureWidth;
            renderTextureB._sourceHeight = textureHeight;
            //绘制纯色图
            renderContext.clearScreen();
            renderContext.filterType = "colorTransform";
            renderContext.setGlobalColorTransform([
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
            renderContext.setAlpha(1, egret.BlendMode.NORMAL);
            renderContext.setTransform(new egret.Matrix(1, 0, 0, 1, 0, 0));
            renderContext.drawImage(texture, sourceX, sourceY, sourceWidth, sourceHeight, blurX + offset, blurY + offset, destWidth, destHeight);
            renderContext._drawWebGL();
            renderContext.filterType = null;
            renderTextureA["canvasContext"].clearRect(0, 0, textureWidth, textureHeight);
            renderTextureA["canvasContext"].drawImage(webGLBitmapData, 0, 0, textureWidth, textureHeight, 0, 0, textureWidth, textureHeight);
            //blur x
            renderContext.clearScreen();
            renderContext.setAlpha(1, egret.BlendMode.NORMAL);
            renderContext.setTransform(new egret.Matrix(1, 0, 0, 1, 0, 0));
            renderContext.filterType = "blur";
            renderContext.setBlurData(blurX, 0);
            egret.Texture.deleteWebGLTexture(renderTextureA);
            renderContext.drawImage(renderTextureA, blurX, blurY, textureWidth - blurX * 2, textureHeight - blurY * 2, blurX, blurY, textureWidth - blurX * 2, textureHeight - blurY * 2);
            renderContext._drawWebGL();
            renderContext.filterType = null;
            renderTextureB["canvasContext"].clearRect(0, 0, textureWidth, textureHeight);
            renderTextureB["canvasContext"].drawImage(webGLBitmapData, 0, 0, textureWidth, textureHeight, 0, 0, textureWidth, textureHeight);
            //blur y
            renderContext.clearScreen();
            renderContext.setAlpha(1, egret.BlendMode.NORMAL);
            renderContext.setTransform(new egret.Matrix(1, 0, 0, 1, 0, 0));
            renderContext.filterType = "blur";
            renderContext.setBlurData(0, blurY);
            egret.Texture.deleteWebGLTexture(renderTextureB);
            renderContext.drawImage(renderTextureB, 0, blurY, textureWidth, textureHeight - blurY * 2, 0, blurY + offset / 2, textureWidth, textureHeight - blurY * 2);
            renderContext._drawWebGL();
            renderContext.filterType = null;
            renderTextureA["canvasContext"].clearRect(0, 0, textureWidth, textureHeight);
            renderTextureA["canvasContext"].drawImage(webGLBitmapData, 0, 0, textureWidth, textureHeight, 0, 0, textureWidth, textureHeight);
            //画回B 应用强度
            renderContext.clearScreen();
            renderContext.setAlpha(1, egret.BlendMode.NORMAL);
            renderContext.setTransform(new egret.Matrix(1, 0, 0, 1, 0, 0));
            egret.Texture.deleteWebGLTexture(renderTextureA);
            for (var i = 0; i < quality; i++) {
                renderContext.drawImage(renderTextureA, 0, 0, textureWidth, textureHeight, distanceX, distanceY, textureWidth, textureHeight);
            }
            renderContext._drawWebGL();
            //原图
            renderContext.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
            renderContext.currentBlendMode = null;
            renderContext.drawImage(texture, sourceX, sourceY, sourceWidth, sourceHeight, destX + blurX + offset, destY + blurY + offset * 1.5, destWidth, destHeight);
            renderContext._drawWebGL();
            renderTextureB["canvasContext"].clearRect(0, 0, textureWidth, textureHeight);
            renderTextureB["canvasContext"].drawImage(webGLBitmapData, 0, 0, textureWidth, textureHeight, 0, 0, textureWidth, textureHeight);
            egret.Texture.deleteWebGLTexture(renderTextureB);
            this._drawImage(renderTextureB, 0, 0, textureWidth, textureHeight, destX - blurX - offset, destY - blurY - offset * 1.5, textureWidth, textureHeight);
            this._drawWebGL();
            egret.RenderTexture.release(renderTextureA);
            egret.RenderTexture.release(renderTextureB);
        };
        __egretProto__._drawWebGL = function () {
            if (this.currentBatchSize == 0 || this.contextLost) {
                return;
            }
            var beforeDraw = egret.getTimer();
            this.start();
            var gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, this.currentBaseTexture);
            var view = this.vertices.subarray(0, this.currentBatchSize * 4 * this.vertSize);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
            gl.drawElements(gl.TRIANGLES, this.currentBatchSize * 6, gl.UNSIGNED_SHORT, 0);
            this.currentBatchSize = 0;
            this.renderCost += egret.getTimer() - beforeDraw;
            egret.Profiler.getInstance().onDrawImage();
        };
        __egretProto__.setTransform = function (matrix) {
            var locWorldTransform = this.worldTransform;
            locWorldTransform.a = matrix.a;
            locWorldTransform.b = matrix.b;
            locWorldTransform.c = matrix.c;
            locWorldTransform.d = matrix.d;
            locWorldTransform.tx = matrix.tx;
            locWorldTransform.ty = matrix.ty;
        };
        __egretProto__.setAlpha = function (value, blendMode) {
            this.worldAlpha = value;
            this.setBlendMode(blendMode);
        };
        __egretProto__.createWebGLTexture = function (texture) {
            var bitmapData = texture._bitmapData;
            if (!bitmapData.webGLTexture) {
                bitmapData.webGLTexture = {};
            }
            if (!bitmapData.webGLTexture[this.glID]) {
                var gl = this.gl;
                bitmapData.webGLTexture[this.glID] = gl.createTexture();
                bitmapData.webGLTexture[this.glID].glContext = gl;
                gl.bindTexture(gl.TEXTURE_2D, bitmapData.webGLTexture[this.glID]);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmapData);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
        };
        __egretProto__.pushMask = function (mask) {
            this._drawWebGL();
            var gl = this.gl;
            if (this.maskList.length == 0) {
                gl.enable(gl.SCISSOR_TEST);
            }
            var maskData = this.getScissorRect(mask);
            this.maskList.push(maskData);
            this.scissor(maskData.x, maskData.y, maskData.width, maskData.height);
        };
        __egretProto__.getScissorRect = function (mask) {
            var prevMask = this.maskList[this.maskList.length - 1];
            var x;
            var y;
            var w;
            var h;
            if (prevMask) {
                if (prevMask.intersects(prevMask)) {
                    x = Math.max(mask.x + this.worldTransform.tx, prevMask.x);
                    y = Math.max(mask.y + this.worldTransform.ty, prevMask.y);
                    w = Math.min(mask.x + this.worldTransform.tx + mask.width, prevMask.x + prevMask.width) - x;
                    h = Math.min(mask.y + this.worldTransform.ty + mask.height, prevMask.y + prevMask.height) - y;
                }
                else {
                    x = 0;
                    y = 0;
                    w = 0;
                    h = 0;
                }
            }
            else {
                x = mask.x + this.worldTransform.tx;
                y = mask.y + this.worldTransform.ty;
                w = mask.width;
                h = mask.height;
            }
            var maskData = this.maskDataFreeList.pop();
            if (!maskData) {
                maskData = new egret.Rectangle(x, y, w, h);
            }
            else {
                maskData.x = x;
                maskData.y = y;
                maskData.width = w;
                maskData.height = h;
            }
            return maskData;
        };
        __egretProto__.popMask = function () {
            this._drawWebGL();
            var gl = this.gl;
            var maskData = this.maskList.pop();
            this.maskDataFreeList.push(maskData);
            var length = this.maskList.length;
            if (length != 0) {
                maskData = this.maskList[length - 1];
                if (maskData.width > 0 || maskData.height > 0) {
                    this.scissor(maskData.x, maskData.y, maskData.width, maskData.height);
                }
            }
            else {
                gl.disable(gl.SCISSOR_TEST);
            }
        };
        __egretProto__.scissor = function (x, y, w, h) {
            var gl = this.gl;
            if (w < 0) {
                w = 0;
            }
            if (h < 0) {
                h = 0;
            }
            gl.scissor(x, -y + egret.MainContext.instance.stage.stageHeight - h, w, h);
        };
        __egretProto__.setGlobalColorTransform = function (colorTransformMatrix) {
            if (this.colorTransformMatrix != colorTransformMatrix) {
                this._drawWebGL();
                this.colorTransformMatrix = colorTransformMatrix;
                if (colorTransformMatrix) {
                    var colorTransformMatrix = colorTransformMatrix.concat();
                    var shader = this.shaderManager.colorTransformShader;
                    shader.uniforms.colorAdd.value.w = colorTransformMatrix.splice(19, 1)[0] / 255.0;
                    shader.uniforms.colorAdd.value.z = colorTransformMatrix.splice(14, 1)[0] / 255.0;
                    shader.uniforms.colorAdd.value.y = colorTransformMatrix.splice(9, 1)[0] / 255.0;
                    shader.uniforms.colorAdd.value.x = colorTransformMatrix.splice(4, 1)[0] / 255.0;
                    shader.uniforms.matrix.value = colorTransformMatrix;
                }
            }
        };
        __egretProto__.setBlurData = function (blurX, blurY) {
            var shader = this.shaderManager.blurShader;
            shader.uniforms.blur.value.x = blurX;
            shader.uniforms.blur.value.y = blurY;
        };
        __egretProto__.setGlobalFilters = function (filtersData) {
            this._drawWebGL();
            this.setFilterProperties(filtersData);
        };
        __egretProto__.setFilterProperties = function (filtersData) {
            this.filters = filtersData;
            if (filtersData && filtersData.length) {
                for (var i = 0; i < 1; i++) {
                    var filterData = filtersData[i];
                    this.filterType = filterData.type;
                    switch (filterData.type) {
                        case "blur":
                            this.setBlurData(filterData.blurX, filterData.blurY);
                            break;
                        case "colorTransform":
                            this.setGlobalColorTransform(filterData._matrix);
                            break;
                    }
                }
            }
            else {
                this.filterType = null;
            }
        };
        __egretProto__.setupFont = function (textField, style) {
            if (style === void 0) { style = null; }
            this.canvasContext.setupFont(textField, style);
        };
        __egretProto__.measureText = function (text) {
            return this.canvasContext.measureText(text);
        };
        __egretProto__.renderGraphics = function (graphics) {
            this._drawWebGL();
            var gl = this.gl;
            var shader = this.shaderManager.primitiveShader;
            if (!this.graphicsPoints) {
                this.graphicsPoints = [];
                this.graphicsIndices = [];
                this.graphicsBuffer = gl.createBuffer();
                this.graphicsIndexBuffer = gl.createBuffer();
            }
            else {
                this.graphicsPoints.length = 0;
                this.graphicsIndices.length = 0;
            }
            this.updateGraphics(graphics);
            this.shaderManager.activateShader(shader);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.uniformMatrix3fv(shader.translationMatrix, false, this.worldTransform.toArray(true));
            gl.uniform2f(shader.projectionVector, this.projectionX, -this.projectionY);
            gl.uniform2f(shader.offsetVector, 0, 0);
            gl.uniform3fv(shader.tintColor, [1, 1, 1]);
            gl.uniform1f(shader.alpha, this.worldAlpha);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.graphicsBuffer);
            gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
            gl.vertexAttribPointer(shader.colorAttribute, 4, gl.FLOAT, false, 4 * 6, 2 * 4);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.graphicsIndexBuffer);
            gl.drawElements(gl.TRIANGLE_STRIP, this.graphicsIndices.length, gl.UNSIGNED_SHORT, 0);
            this.shaderManager.activateShader(this.shaderManager.defaultShader);
        };
        __egretProto__.updateGraphics = function (graphics) {
            var gl = this.gl;
            this.buildRectangle(graphics);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.graphicsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.graphicsPoints), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.graphicsIndexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.graphicsIndices), gl.STATIC_DRAW);
        };
        __egretProto__.buildRectangle = function (graphicsData) {
            var x = graphicsData.x;
            var y = graphicsData.y;
            var width = graphicsData.w;
            var height = graphicsData.h;
            var alpha = this.graphicsStyle.a;
            var r = this.graphicsStyle.r * alpha;
            var g = this.graphicsStyle.g * alpha;
            var b = this.graphicsStyle.b * alpha;
            var verts = this.graphicsPoints;
            var indices = this.graphicsIndices;
            var vertPos = verts.length / 6;
            verts.push(x, y);
            verts.push(r, g, b, alpha);
            verts.push(x + width, y);
            verts.push(r, g, b, alpha);
            verts.push(x, y + height);
            verts.push(r, g, b, alpha);
            verts.push(x + width, y + height);
            verts.push(r, g, b, alpha);
            indices.push(vertPos, vertPos, vertPos + 1, vertPos + 2, vertPos + 3, vertPos + 3);
        };
        __egretProto__.setGraphicsStyle = function (r, g, b, a) {
            this.graphicsStyle.r = r;
            this.graphicsStyle.g = g;
            this.graphicsStyle.b = b;
            this.graphicsStyle.a = a;
        };
        WebGLRenderer.glID = 0;
        WebGLRenderer.isInit = false;
        return WebGLRenderer;
    })(egret.RendererContext);
    egret.WebGLRenderer = WebGLRenderer;
    WebGLRenderer.prototype.__class__ = "egret.WebGLRenderer";
})(egret || (egret = {}));
var egret_webgl_graphics;
(function (egret_webgl_graphics) {
    function beginFill(color, alpha) {
        if (alpha === void 0) { alpha = 1; }
        var _colorBlue = (color & 0x0000FF) / 255;
        var _colorGreen = ((color & 0x00ff00) >> 8) / 255;
        var _colorRed = (color >> 16) / 255;
        this._pushCommand(new Command(this._setStyle, this, [_colorRed, _colorGreen, _colorBlue, alpha]));
    }
    egret_webgl_graphics.beginFill = beginFill;
    function drawRect(x, y, width, height) {
        this._pushCommand(new Command(function (data) {
            var rendererContext = this.renderContext;
            rendererContext.renderGraphics(data);
        }, this, [{ x: x, y: y, w: width, h: height }]));
        this._checkRect(x, y, width, height);
    }
    egret_webgl_graphics.drawRect = drawRect;
    function drawCircle(x, y, r) {
    }
    egret_webgl_graphics.drawCircle = drawCircle;
    function drawRoundRect(x, y, width, height, ellipseWidth, ellipseHeight) {
    }
    egret_webgl_graphics.drawRoundRect = drawRoundRect;
    function drawEllipse(x, y, width, height) {
    }
    egret_webgl_graphics.drawEllipse = drawEllipse;
    function lineStyle(thickness, color, alpha, pixelHinting, scaleMode, caps, joints, miterLimit) {
        if (thickness === void 0) { thickness = NaN; }
        if (color === void 0) { color = 0; }
        if (alpha === void 0) { alpha = 1.0; }
        if (pixelHinting === void 0) { pixelHinting = false; }
        if (scaleMode === void 0) { scaleMode = "normal"; }
        if (caps === void 0) { caps = null; }
        if (joints === void 0) { joints = null; }
        if (miterLimit === void 0) { miterLimit = 3; }
    }
    egret_webgl_graphics.lineStyle = lineStyle;
    function lineTo(x, y) {
    }
    egret_webgl_graphics.lineTo = lineTo;
    function curveTo(controlX, controlY, anchorX, anchorY) {
    }
    egret_webgl_graphics.curveTo = curveTo;
    function cubicCurveTo(controlX1, controlY1, controlX2, controlY2, anchorX, anchorY) {
    }
    egret_webgl_graphics.cubicCurveTo = cubicCurveTo;
    function moveTo(x, y) {
    }
    egret_webgl_graphics.moveTo = moveTo;
    function clear() {
        this.commandQueue.length = 0;
        this._minX = 0;
        this._minY = 0;
        this._maxX = 0;
        this._maxY = 0;
    }
    egret_webgl_graphics.clear = clear;
    function endFill() {
    }
    egret_webgl_graphics.endFill = endFill;
    function _pushCommand(cmd) {
        this.commandQueue.push(cmd);
    }
    egret_webgl_graphics._pushCommand = _pushCommand;
    function _draw(renderContext) {
        var length = this.commandQueue.length;
        if (length == 0) {
            return;
        }
        this.renderContext = renderContext;
        for (var i = 0; i < length; i++) {
            var command = this.commandQueue[i];
            command.method.apply(command.thisObject, command.args);
        }
    }
    egret_webgl_graphics._draw = _draw;
    var Command = (function () {
        function Command(method, thisObject, args) {
            this.method = method;
            this.thisObject = thisObject;
            this.args = args;
        }
        var __egretProto__ = Command.prototype;
        return Command;
    })();
    Command.prototype.__class__ = "egret_webgl_graphics.Command";
    function _setStyle(r, g, b, a) {
        this.renderContext.setGraphicsStyle(r, g, b, a);
    }
    egret_webgl_graphics._setStyle = _setStyle;
    function init() {
        for (var key in egret_webgl_graphics) {
            egret.Graphics.prototype[key] = egret_webgl_graphics[key];
        }
    }
    egret_webgl_graphics.init = init;
})(egret_webgl_graphics || (egret_webgl_graphics = {}));
