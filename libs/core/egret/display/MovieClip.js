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
     * @class egret.MovieClip
     * @classdesc 影片剪辑，可以通过影片剪辑播放序列帧动画。MovieClip 类从以下类继承而来：DisplayObject 和 EventDispatcher。不同于 DisplayObject 对象，MovieClip 对象拥有一个时间轴。
     * @extends egret.DisplayObject
     * @link http://docs.egret-labs.org/post/manual/displaycon/movieclip.html  MovieClip序列帧动画
     */
    var MovieClip = (function (_super) {
        __extends(MovieClip, _super);
        //Construct Function
        /**
         * 创建新的 MovieClip 实例。创建 MovieClip 之后，调用舞台上的显示对象容器的addElement方法。
         * @method egret.MovieClip#constructor
         * @param movieClipData {MovieClipData} 被引用的 MovieClipData 对象
         */
        function MovieClip(movieClipData) {
            _super.call(this);
            this._isAddedToStage = false;
            this._textureToRender = null;
            //Data Property
            this._movieClipData = null;
            this._frames = null;
            this._totalFrames = 0;
            this._frameLabels = null;
            this._frameIntervalTime = 0;
            this._eventPool = null;
            //Animation Property
            this._isPlaying = false;
            this._isStopped = true;
            this._playTimes = 0;
            this._currentFrameNum = 0;
            this._nextFrameNum = 0;
            this._displayedKeyFrameNum = 0;
            this._passedTime = 0;
            this._setMovieClipData(movieClipData);
            this.needDraw = true;
        }
        var __egretProto__ = MovieClip.prototype;
        __egretProto__._init = function () {
            this._reset();
            var movieClipData = this._movieClipData;
            if (movieClipData && movieClipData._isDataValid()) {
                this._frames = movieClipData.frames;
                this._totalFrames = movieClipData.numFrames;
                this._frameLabels = movieClipData.labels;
                this._frameIntervalTime = 1000 / movieClipData.frameRate;
                this._initFrame();
            }
        };
        __egretProto__._reset = function () {
            this._frames = null;
            this._playTimes = 0;
            this._isPlaying = false;
            this.setIsStopped(true);
            this._currentFrameNum = 0;
            this._nextFrameNum = 1;
            this._displayedKeyFrameNum = 0;
            this._passedTime = 0;
            this._eventPool = [];
        };
        __egretProto__._initFrame = function () {
            if (this._movieClipData._isTextureValid()) {
                this._advanceFrame();
                this._constructFrame();
            }
        };
        __egretProto__._render = function (renderContext) {
            var texture = this._textureToRender;
            this._texture_to_render = texture;
            if (texture) {
                var offsetX = Math.round(texture._offsetX);
                var offsetY = Math.round(texture._offsetY);
                var bitmapWidth = texture._bitmapWidth || texture._textureWidth;
                var bitmapHeight = texture._bitmapHeight || texture._textureHeight;
                var destW = Math.round(bitmapWidth);
                var destH = Math.round(bitmapHeight);
                MovieClip.renderFilter.drawImage(renderContext, this, texture._bitmapX, texture._bitmapY, bitmapWidth, bitmapHeight, offsetX, offsetY, destW, destH);
            }
        };
        __egretProto__._measureBounds = function () {
            var texture = this._textureToRender;
            if (!texture) {
                return _super.prototype._measureBounds.call(this);
            }
            var x = texture._offsetX;
            var y = texture._offsetY;
            var w = texture._textureWidth;
            var h = texture._textureHeight;
            return egret.Rectangle.identity.initialize(x, y, w, h);
        };
        __egretProto__._onAddToStage = function () {
            _super.prototype._onAddToStage.call(this);
            this._isAddedToStage = true;
            if (this._isPlaying && this._totalFrames > 1) {
                this.setIsStopped(false);
            }
        };
        __egretProto__._onRemoveFromStage = function () {
            _super.prototype._onRemoveFromStage.call(this);
            this._isAddedToStage = false;
            this.setIsStopped(true);
        };
        //Data Function
        /**
         * 返回帧标签为指定字符串的FrameLabel对象
         * @method egret.MovieClip#getFrameLabelByName
         * @param labelName {string} 帧标签名
         * @param ignoreCase {boolean} 是否忽略大小写，可选参数，默认false
         * @returns {egret.FrameLabel} FrameLabel对象
         */
        __egretProto__._getFrameLabelByName = function (labelName, ignoreCase) {
            if (ignoreCase === void 0) { ignoreCase = false; }
            if (ignoreCase) {
                labelName = labelName.toLowerCase();
            }
            var frameLabels = this._frameLabels;
            if (frameLabels) {
                var outputFramelabel = null;
                for (var i = 0; i < frameLabels.length; i++) {
                    outputFramelabel = frameLabels[i];
                    if (ignoreCase ? outputFramelabel.name.toLowerCase() === labelName : outputFramelabel.name === labelName) {
                        return outputFramelabel;
                    }
                }
            }
            return null;
        };
        /**
         * 返回指定序号的帧的FrameLabel对象
         * @method egret.MovieClip#getFrameLabelByFrame
         * @param frame {number} 帧序号
         * @returns {egret.FrameLabel} FrameLabel对象
         */
        __egretProto__._getFrameLabelByFrame = function (frame) {
            var frameLabels = this._frameLabels;
            if (frameLabels) {
                var outputFramelabel = null;
                for (var i = 0; i < frameLabels.length; i++) {
                    outputFramelabel = frameLabels[i];
                    if (outputFramelabel.frame === frame) {
                        return outputFramelabel;
                    }
                }
            }
            return null;
        };
        /**
         * 返回指定序号的帧对应的FrameLabel对象，如果当前帧没有标签，则返回前面最近的有标签的帧的FrameLabel对象
         * @method egret.MovieClip#getFrameLabelForFrame
         * @param frame {number} 帧序号
         * @returns {egret.FrameLabel} FrameLabel对象
         */
        __egretProto__._getFrameLabelForFrame = function (frame) {
            var outputFrameLabel = null;
            var tempFrameLabel = null;
            var frameLabels = this._frameLabels;
            if (frameLabels) {
                for (var i = 0; i < frameLabels.length; i++) {
                    tempFrameLabel = frameLabels[i];
                    if (tempFrameLabel.frame > frame) {
                        return outputFrameLabel;
                    }
                    outputFrameLabel = tempFrameLabel;
                }
            }
            return outputFrameLabel;
        };
        //Animation Function
        /**
         * 继续播放当前动画
         * @method egret.MovieClip#play
         * @param playTimes {number} 播放次数。 参数为整数，可选参数，>=1：设定播放次数，<0：循环播放，默认值 0：不改变播放次数(MovieClip初始播放次数设置为1)，
         */
        __egretProto__.play = function (playTimes) {
            if (playTimes === void 0) { playTimes = 0; }
            this._isPlaying = true;
            this.setPlayTimes(playTimes);
            if (this._totalFrames > 1 && this._isAddedToStage) {
                this.setIsStopped(false);
            }
        };
        /**
         * 暂停播放动画
         * @method egret.MovieClip#stop
         */
        __egretProto__.stop = function () {
            this._isPlaying = false;
            this.setIsStopped(true);
        };
        /**
         * 将播放头移到前一帧并停止
         * @method egret.MovieClip#prevFrame
         */
        __egretProto__.prevFrame = function () {
            this.gotoAndStop(this._currentFrameNum - 1);
        };
        /**
         * 跳到后一帧并停止
         * @method egret.MovieClip#prevFrame
         */
        __egretProto__.nextFrame = function () {
            this.gotoAndStop(this._currentFrameNum + 1);
        };
        /**
         * 将播放头移到指定帧并播放
         * @method egret.MovieClip#gotoAndPlay
         * @param frame {any} 指定帧的帧号或帧标签
         * @param playTimes {number} 播放次数。 参数为整数，可选参数，>=1：设定播放次数，<0：循环播放，默认值 0：不改变播放次数，
         */
        __egretProto__.gotoAndPlay = function (frame, playTimes) {
            if (playTimes === void 0) { playTimes = 0; }
            if (arguments.length === 0 || arguments.length > 2) {
                throw new Error(egret.getString(1022, "MovieClip.gotoAndPlay()"));
            }
            this.play(playTimes);
            this._gotoFrame(frame);
        };
        /**
         * 将播放头移到指定帧并停止
         * @method egret.MovieClip#gotoAndPlay
         * @param frame {any} 指定帧的帧号或帧标签
         */
        __egretProto__.gotoAndStop = function (frame) {
            if (arguments.length != 1) {
                throw new Error(egret.getString(1022, "MovieClip.gotoAndStop()"));
            }
            this.stop();
            this._gotoFrame(frame);
        };
        __egretProto__._gotoFrame = function (frame) {
            var frameNum;
            if (typeof frame === "string") {
                frameNum = this._getFrameLabelByName(frame).frame;
            }
            else {
                frameNum = parseInt(frame + '', 10);
                if (frameNum != frame) {
                    throw new Error(egret.getString(1022, "Frame Label Not Found"));
                }
            }
            if (frameNum < 1) {
                frameNum = 1;
            }
            else if (frameNum > this._totalFrames) {
                frameNum = this._totalFrames;
            }
            if (frameNum === this._nextFrameNum) {
                return;
            }
            this._nextFrameNum = frameNum;
            this._advanceFrame();
            this._constructFrame();
            this._handlePendingEvent();
        };
        __egretProto__._advanceTime = function (advancedTime) {
            var self = this;
            var frameIntervalTime = self._frameIntervalTime;
            var currentTime = self._passedTime + advancedTime;
            self._passedTime = currentTime % frameIntervalTime;
            var num = currentTime / frameIntervalTime;
            if (num < 1) {
                return;
            }
            while (num >= 1) {
                num--;
                self._nextFrameNum++;
                if (self._nextFrameNum > self._totalFrames) {
                    if (self._playTimes == -1) {
                        self._eventPool.push(egret.Event.LOOP_COMPLETE);
                        self._nextFrameNum = 1;
                    }
                    else {
                        self._playTimes--;
                        if (self._playTimes > 0) {
                            self._eventPool.push(egret.Event.LOOP_COMPLETE);
                            self._nextFrameNum = 1;
                        }
                        else {
                            self._nextFrameNum = self._totalFrames;
                            self._eventPool.push(egret.Event.COMPLETE);
                            self.stop();
                            break;
                        }
                    }
                }
                self._advanceFrame();
            }
            self._constructFrame();
            self._handlePendingEvent();
            self._setDirty();
        };
        __egretProto__._advanceFrame = function () {
            this._currentFrameNum = this._nextFrameNum;
        };
        __egretProto__._constructFrame = function () {
            var currentFrameNum = this._currentFrameNum;
            if (this._displayedKeyFrameNum == currentFrameNum) {
                return;
            }
            this._textureToRender = this._movieClipData.getTextureByFrame(currentFrameNum);
            this._DO_Props_._sizeDirty = true;
            this._displayedKeyFrameNum = currentFrameNum;
        };
        __egretProto__._handlePendingEvent = function () {
            if (this._eventPool.length != 0) {
                this._eventPool.reverse();
                var eventPool = this._eventPool;
                var length = eventPool.length;
                var isComplete = false;
                var isLoopComplete = false;
                for (var i = 0; i < length; i++) {
                    var event = eventPool.pop();
                    if (event == egret.Event.LOOP_COMPLETE) {
                        isLoopComplete = true;
                    }
                    else if (event == egret.Event.COMPLETE) {
                        isComplete = true;
                    }
                    else {
                        this.dispatchEventWith(event);
                    }
                }
                if (isLoopComplete) {
                    this.dispatchEventWith(egret.Event.LOOP_COMPLETE);
                }
                if (isComplete) {
                    this.dispatchEventWith(egret.Event.COMPLETE);
                }
            }
        };
        Object.defineProperty(__egretProto__, "totalFrames", {
            //Properties
            /**
             * MovieClip 实例中帧的总数
             * @member {number} egret.MovieClip#totalFrames
             */
            get: function () {
                return this._totalFrames;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "currentFrame", {
            /**
             * MovieClip 实例当前播放的帧的序号
             * @member {number} egret.MovieClip#currentFrame
             */
            get: function () {
                return this._currentFrameNum;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "currentFrameLabel", {
            /**
             * MovieClip 实例当前播放的帧的标签。如果当前帧没有标签，则 currentFrameLabel返回null。
             * @member {number} egret.MovieClip#currentFrame
             */
            get: function () {
                var label = this._getFrameLabelByFrame(this._currentFrameNum);
                return label && label.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "currentLabel", {
            /**
             * 当前播放的帧对应的标签，如果当前帧没有标签，则currentLabel返回包含标签的先前帧的标签。如果当前帧和先前帧都不包含标签，currentLabel返回null。
             * @member {number} egret.MovieClip#currentFrame
             */
            get: function () {
                var label = this._getFrameLabelForFrame(this._currentFrameNum);
                return label ? label.name : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "frameRate", {
            /**
             * MovieClip 实例的帧频
             * @member {number} egret.MovieClip#frameRate
             */
            get: function () {
                return this.movieClipData.frameRate;
            },
            set: function (value) {
                if (value == this._movieClipData.frameRate) {
                    return;
                }
                this._movieClipData.frameRate = value;
                this._frameIntervalTime = 1000 / this._movieClipData.frameRate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "isPlaying", {
            /**
             * MovieClip 实例当前是否正在播放
             * @member {boolean} egret.MovieClip#isPlaying
             */
            get: function () {
                return this._isPlaying;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "movieClipData", {
            get: function () {
                return this._movieClipData;
            },
            /**
             * MovieClip数据源
             * @member {any} egret.MovieClip#movieClipData
             */
            set: function (value) {
                this._setMovieClipData(value);
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._setMovieClipData = function (value) {
            if (this._movieClipData == value) {
                return;
            }
            this._movieClipData = value;
            this._init();
        };
        __egretProto__.setPlayTimes = function (value) {
            if (value < 0 || value >= 1) {
                this._playTimes = value < 0 ? -1 : Math.floor(value);
            }
        };
        __egretProto__.setIsStopped = function (value) {
            if (this._isStopped == value) {
                return;
            }
            this._isStopped = value;
            if (value) {
                this._playTimes = 0;
                egret.Ticker.getInstance().unregister(this._advanceTime, this);
            }
            else {
                this._playTimes = this._playTimes == 0 ? 1 : this._playTimes;
                egret.Ticker.getInstance().register(this._advanceTime, this);
            }
        };
        //Render Property
        MovieClip.renderFilter = egret.RenderFilter.getInstance();
        return MovieClip;
    })(egret.DisplayObject);
    egret.MovieClip = MovieClip;
    MovieClip.prototype.__class__ = "egret.MovieClip";
})(egret || (egret = {}));
