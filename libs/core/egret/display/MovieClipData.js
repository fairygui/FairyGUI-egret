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
     * @class egret.MovieClipData
     * @classdesc 使用 MovieClipData 类，您可以创建 MovieClip 对象和处理 MovieClip 对象的数据。MovieClipData 一般由MovieClipDataFactory生成
     * @extends egret.HashObject
     * @link http://docs.egret-labs.org/post/manual/displaycon/movieclip.html MovieClip序列帧动画
     */
    var MovieClipData = (function (_super) {
        __extends(MovieClipData, _super);
        /**
         * 创建一个 egret.MovieClipData 对象
         */
        function MovieClipData() {
            _super.call(this);
            /**
             * MovieClip数据
             */
            this._mcData = null;
            /**
             * 总帧数
             */
            this.numFrames = 1;
            /**
             * 帧数据列表
             */
            this.frames = [];
            /**
             * 帧标签列表
             */
            this.labels = null;
            /**
             * 帧率
             */
            this.frameRate = 0;
            /**
             * 纹理数据
             */
            this.textureData = null;
            /**
             * 纹理集
             */
            this.spriteSheet = null;
        }
        var __egretProto__ = MovieClipData.prototype;
        __egretProto__._init = function (mcData, textureData, spriteSheet) {
            this.textureData = textureData;
            this.spriteSheet = spriteSheet;
            this._setMCData(mcData);
        };
        /**
         * 根据指定帧序号获取该帧对应的关键帧数据
         * @method egret.MovieClipData#getKeyFrameData
         * @param frame {number} 帧序号
         * @returns {any} 帧数据对象
         */
        __egretProto__.getKeyFrameData = function (frame) {
            var outputFrameData = this.frames[frame - 1];
            if (outputFrameData.frame) {
                outputFrameData = this.frames[outputFrameData.frame - 1];
            }
            return outputFrameData;
        };
        /**
         * 根据指定帧序号获取该帧对应的Texture对象
         * @method egret.MovieClipData#getTextureByFrame
         * @param frame {number} 帧序号
         * @returns {egret.Texture} Texture对象
         */
        __egretProto__.getTextureByFrame = function (frame) {
            var frameData = this.getKeyFrameData(frame);
            if (frameData.res) {
                var outputTexture = this.getTextureByResName(frameData.res);
                outputTexture._offsetX = frameData.x | 0;
                outputTexture._offsetY = frameData.y | 0;
                return outputTexture;
            }
            return null;
        };
        __egretProto__.getTextureByResName = function (resName) {
            var texture = this.spriteSheet.getTexture(resName);
            if (!texture) {
                var textureData = this.textureData[resName];
                texture = this.spriteSheet.createTexture(resName, textureData.x, textureData.y, textureData.w, textureData.h);
            }
            return texture;
        };
        __egretProto__._isDataValid = function () {
            return this.frames.length > 0;
        };
        __egretProto__._isTextureValid = function () {
            return this.textureData != null && this.spriteSheet != null;
        };
        __egretProto__._fillMCData = function (mcData) {
            this.frameRate = mcData["frameRate"] || 24;
            this._fillFramesData(mcData.frames);
            this._fillFrameLabelsData(mcData.labels);
        };
        __egretProto__._fillFramesData = function (framesData) {
            var frames = this.frames;
            var length = framesData ? framesData.length : 0;
            var keyFramePosition;
            for (var i = 0; i < length; i++) {
                var frameData = framesData[i];
                frames.push(frameData);
                if (frameData.duration) {
                    var duration = parseInt(frameData.duration);
                    if (duration > 1) {
                        keyFramePosition = frames.length;
                        for (var j = 1; j < duration; j++) {
                            frames.push({ "frame": keyFramePosition });
                        }
                    }
                }
            }
            this.numFrames = frames.length;
        };
        __egretProto__._fillFrameLabelsData = function (frameLabelsData) {
            if (frameLabelsData) {
                var length = frameLabelsData.length;
                if (length > 0) {
                    this.labels = [];
                    for (var i = 0; i < length; i++) {
                        var label = frameLabelsData[i];
                        this.labels.push(new egret.FrameLabel(label.name, label.frame));
                    }
                }
            }
        };
        Object.defineProperty(__egretProto__, "mcData", {
            get: function () {
                return this._mcData;
            },
            /**
             * MovieClip数据源
             * @member {any} egret.MovieClip#dataSource
             */
            set: function (value) {
                this._setMCData(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setMCData = function (value) {
            if (this._mcData == value) {
                return;
            }
            this._mcData = value;
            if (value) {
                this._fillMCData(value);
            }
        };
        return MovieClipData;
    })(egret.HashObject);
    egret.MovieClipData = MovieClipData;
    MovieClipData.prototype.__class__ = "egret.MovieClipData";
})(egret || (egret = {}));
