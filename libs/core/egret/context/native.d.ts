declare module egret {
    /**
     * @class egret.NativeDeviceContext
     * @classdesc
     * @extends egret.HashObject
     * @private
     */
    class NativeDeviceContext extends HashObject {
        private callback;
        private thisObject;
        /**
         * @method egret.NativeDeviceContext#constructor
         */
        constructor();
        /**
         * @method egret.NativeDeviceContext#executeMainLoop
         * @param callback {Function}
         * @param thisObject {any}
         */
        executeMainLoop(callback: Function, thisObject: any): void;
        private onEnterFrame(advancedTime);
    }
}
declare module egret_native_external_interface {
    var callBackDic: {};
    function call(functionName: string, value: string): void;
    function addCallback(functionName: string, listener: Function): void;
    function onReceivedPluginInfo(info: string): void;
    function init(): void;
}
declare module egret_native_localStorage {
    var filePath: string;
    function getItem(key: string): string;
    function setItem(key: string, value: string): boolean;
    function removeItem(key: string): void;
    function clear(): void;
    function save(): void;
    function init(): void;
}

declare module egret {
    /**
     * @class egret.NativeRendererContext
     * @classdesc
     * NativeRendererContext 是引擎在Native上的渲染上下文。
     * @extends egret.HashObject
     * @private
     */
    class NativeRendererContext extends RendererContext {
        /**
         * @method egret.NativeRendererContext#constructor
         */
        constructor();
        _setTextureScaleFactor(value: number): void;
        /**
         * @method egret.NativeRendererContext#clearScreen
         * @private
         */
        clearScreen(): void;
        /**
         * 清除Context的渲染区域
         * @method egret.NativeRendererContext#clearRect
         * @param x {number}
         * @param y {number}
         * @param w {number}
         * @param h {numbe}
         */
        clearRect(x: number, y: number, w: number, h: number): void;
        /**
         * 绘制图片
         * @method egret.NativeRendererContext#drawImage
         * @param texture {Texture}
         * @param sourceX {any}
         * @param sourceY {any}
         * @param sourceWidth {any}
         * @param sourceHeight {any}
         * @param destX {any}
         * @param destY {any}
         * @param destWidth {any}
         * @param destHeigh {any}
         * @param repeat {string}
         */
        drawImage(texture: Texture, sourceX: any, sourceY: any, sourceWidth: any, sourceHeight: any, destX: any, destY: any, destWidth: any, destHeight: any, repeat?: any): void;
        private useGlow(texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
        /**
         * 绘制9宫图片
         * @method egret.RendererContext#drawImageScale9
         * @param texture {Texture}
         * @param sourceX {any}
         * @param sourceY {any}
         * @param sourceWidth {any}
         * @param sourceHeight {any}
         * @param destX {any}
         * @param destY {any}
         * @param destWidth {any}
         * @param destHeigh {any}
         */
        drawImageScale9(texture: Texture, sourceX: any, sourceY: any, sourceWidth: any, sourceHeight: any, offX: any, offY: any, destWidth: any, destHeight: any, rect: any): boolean;
        drawRepeatImage(texture: Texture, sourceX: any, sourceY: any, sourceWidth: any, sourceHeight: any, destX: any, destY: any, destWidth: any, destHeight: any, repeat: any): void;
        /**
         * 变换Context的当前渲染矩阵
         * @method egret.NativeRendererContext#setTransform
         * @param matrix {egret.Matrix}
         * @stable A
         */
        setTransform(matrix: egret.Matrix): void;
        private currentAlpha;
        /**
         * 设置渲染alpha
         * @method egret.NativeRendererContext#setAlpha
         * @param value {number}
         * @stable A
         * @param blendMode {egret.BlendMode}
         */
        setAlpha(value: number, blendMode: string): void;
        private currentBlendMode;
        private setBlendMode(blendMode);
        /**
         * 设置渲染文本参数
         * @method egret.NativeRendererContext#setupFont
         * @param textField {TextField}
         */
        setupFont(textField: TextField, style?: egret.ITextStyle): void;
        /**
         * 测量文本
         * @method egret.NativeRendererContext#measureText
         * @param text {string}
         * @returns {number}
         */
        measureText(text: string): number;
        /**
         * 绘制文本
         * @method egret.NativeRendererContext#drawText
         * @param textField {egret.TextField}
         * @param text {string}
         * @param x {number}
         * @param y {number}
         * @param maxWidth {numbe}
         */
        drawText(textField: egret.TextField, text: string, x: number, y: number, maxWidth: number, style?: egret.ITextStyle): void;
        pushMask(mask: Rectangle): void;
        popMask(): void;
        private globalColorTransformEnabled;
        private filters;
        setGlobalFilters(filtersData: Array<Filter>): void;
    }
}
declare var egret_native_graphics: any;

declare module egret {
    /**
     * @private
     */
    class NativeTouchContext extends TouchContext {
        constructor();
        run(): void;
    }
}
declare module egret_native {
    function onTouchesBegin(num: number, ids: Array<any>, xs_array: Array<any>, ys_array: Array<any>): void;
    function onTouchesMove(num: number, ids: Array<any>, xs_array: Array<any>, ys_array: Array<any>): void;
    function onTouchesEnd(num: number, ids: Array<any>, xs_array: Array<any>, ys_array: Array<any>): void;
    function onTouchesCancel(num: number, ids: Array<any>, xs_array: Array<any>, ys_array: Array<any>): void;
    function executeTouchCallback(num: number, ids: Array<any>, xs_array: Array<any>, ys_array: Array<any>, callback: Function): void;
}

declare module egret {
    /**
     * @private
     */
    class NativeNetContext extends NetContext {
        _versionCtr: egret.IVersionController;
        static __use_asyn: boolean;
        constructor();
        initVersion(versionCtr: egret.IVersionController): void;
        private urlData;
        /**
         * @method egret.HTML5NetContext#proceed
         * @param loader {URLLoader}
         */
        proceed(loader: URLLoader): void;
        private getHeaderString(request);
        private loadSound(loader);
        private loadTexture(loader);
        /**
         * 是否是网络地址
         * @param url
         * @returns {boolean}
         */
        private isNetUrl(url);
        /**
         * 获取虚拟url
         * @param url
         * @returns {string}
         */
        private getVirtualUrl(url);
        /**
         * 检查文件是否是最新版本
         */
        private checkIsNewVersion(virtualUrl);
        /**
         * 保存本地版本信息文件
         */
        private saveVersion(virtualUrl);
        /**
         * 获取变化列表
         * @deprecated
         * @returns {any}
         */
        getChangeList(): Array<any>;
    }
}

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


declare module egret_native {

    /**
     * 游戏启动
     * @private
     */
    function startGame():void;

    function loglevel(logType):void;

    /**
     * 启动主循环
     * @param callback 主循环回调函数
     * @param thisObject
     */
    function executeMainLoop(callback:Function, thisObject:any):void;

    function pauseApp():void;

    function resumeApp():void;

    function readXML(filepath:string):any;

    function isFileExists(filepath:string):boolean;

    function isRecordExists(filepath:string):boolean;

    function readFileSync(filepath:string):any;

    function readResourceFileSync(filepath:string):any;

    function readUpdateFileSync(filepath:string):any;

    function deleteUpdateFile(filepath:string):void;

    function readFileAsync(filepath:string, promise:egret.PromiseObject):any;

    function writeFileSync(filepath:string, fileContent:string):any;

    function requireHttpSync(url:string, callback:Function):void;

    function requireHttp(url:string, param:any, callback:Function):void;

    function sendInfoToPlugin(info:string):void;

    function receivedPluginInfo(info:string):void;

    function loadRecord(filepath:string):string;

    function saveRecord(filepath:string, fileContent:string):void;

    function getOption(type:string):string;

    module Audio {
        function preloadBackgroundMusic(path:string):void;

        function playBackgroundMusic(path:string, loop:boolean):void;

        function stopBackgroundMusic(isRelease:boolean):void;

        function preloadEffect(path:string):void;

        function preloadEffectAsync(path:string, promise:egret.PromiseObject):void;

        function playEffect(path:string, loop:boolean):void;

        function unloadEffect(path:string):void;

        function stopEffect(effectId:number):void;
    }

    function download(url:string, savePath:string, promise:any):void;

    module Graphics {


        function clearScreen(r:number, g:number, b:number):void;

        function drawImage(texture:any, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight):void;

        function drawImageScale9(texture:any, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, x, y, width, height):boolean;

        function setTransform(a:number, b:number, c:number, d:number, tx:number, ty:number):void;

        function setGlobalAlpha(alpha:number):void;

        function pushClip(x:number, y:number, w:number, h:number):void;

        function popClip():void;

        function setGlobalColorTransform(colorTransformMatrix:Array<number>):void;

        function setGlobalColorTransformEnabled(bool:boolean):void;

        function setGlobalShader(filterData:any):void;


        function lineStyle(thickness:number, color:number):void;

        function lineTo(x:number, y:number):void;

        function moveTo(x:number, y:number):void;

        function beginFill(color:number, alpha:number):void;

        function endFill():void;

        function setBlendArg(src:number, des:number):void;

        function setTextureScaleFactor(value:number):void;
    }

    module Label {

        function createLabel(font:string, size:number, defaultString:string, defaultStroke:number):void;

        function setTextColor(color:number):void;

        function setStrokeColor(color:number):void;

        function drawText(text:string, x:number, y:number):void;

        function setTextAlignment(type:string):void;

        function getTextSize(text:string):Array<number>;


    }


    module EGTXML {


        function readXML(filepath:string):void;
    }

    module Texture {

        function create(filePath:string):any;

        function addTexture(filePath:string):any;

        function addTextureAsyn(filePath:string, promise:any):any;

        function addTextureUnsyn(filePath:string, promise:any):any;

        function removeTexture(filePath:string):void;
    }


    module TextInputOp {

        function setKeybordOpen(isOpen:boolean):void

        function isFullScreenKeyBoard():boolean

        function setInputTextMaxLenght(value:number):void;


    }

    function EGT_TextInput(text:string):void

    function EGT_keyboardFinish():void


    function EGT_deleteBackward():void;

    function EGT_keyboardDidHide():void;

    function EGT_keyboardDidShow():void;

    function EGT_getTextEditerContentText():string;

    module EGTView {

        function getFrameWidth():number;

        function getFrameHeight():number;

        function setVisibleRect(x:number, y:number, w:number, h:number):number;

        function setDesignSize(w:number, h:number):number;
    }

    class RenderTexture {
        constructor(width:number, height:number);

        begin();

        end();
    }

    module rastergl {
        function arc(x:number, y:number, radius:number, startAngle:number, endAngle:number, anticlockwise?:boolean):void;

        function quadraticCurveTo(cpx:number, cpy:number, x:number, y:number):void;

        function lineTo(x:number, y:number):void;

        function fill(fillRule?:string):void;

        function closePath():void;

        function rect(x:number, y:number, w:number, h:number):void;

        function moveTo(x:number, y:number):void;

        function fillRect(x:number, y:number, w:number, h:number):void;

        function bezierCurveTo(cp1x:number, cp1y:number, cp2x:number, cp2y:number, x:number, y:number):void;

        function stroke():void;

        function strokeRect(x:number, y:number, w:number, h:number):void;

        function beginPath():void;

        function arcTo(x1:number, y1:number, x2:number, y2:number, radius:number):void;

        function transform(m11:number, m12:number, m21:number, m22:number, dx:number, dy:number):void;

        function translate(x:number, y:number):void;

        function scale(x:number, y:number):void;

        function rotate(angle:number):void;

        function save():void;

        function restore():void;

        export var lineWidth:number;
        export var strokeStyle:any;
        export var fillStyle:any;
    }

    module Game {
        function listResource(root, promise);

        function listUpdate(root, promise);
    }
}
declare module egret {
    /**
     * @classdesc
     * @extends egret.StageText
     * @private
     */
    class NativeStageText extends StageText {
        private textValue;
        private tf;
        private container;
        private textBg;
        private textBorder;
        private textType;
        constructor();
        private createText();
        _getText(): string;
        _setText(value: string): void;
        _setTextType(type: string): void;
        _getTextType(): string;
        private resetText();
        private isFinishDown;
        private showScreenKeyboard();
        private showPartKeyboard();
        _show(multiline: boolean, size: number, width: number, height: number): void;
        _remove(): void;
        _hide(): void;
    }
}

declare module egret {
    /**
     * @private
     */
    class NativeResourceLoader extends egret.EventDispatcher {
        private _downCount;
        private _path;
        private _bytesTotal;
        load(path: string, bytesTotal: number): void;
        private reload();
        private downloadingProgress(bytesLoaded);
        private downloadFileError();
        private loadOver();
    }
}

declare module egret {
    /**
     * @private
     */
    class NativeAudio implements IAudio {
        /**
         * audio音频对象
         * @member {any} egret.Sound#audio
         */
        constructor();
        private _loop;
        private _type;
        private _effectId;
        private _path;
        /**
         * 播放声音
         * @method egret.Sound#play
         * @param loop {boolean} 是否循环播放，默认为false
         */
        _play(type?: string): void;
        private paused;
        /**
         * 暂停声音
         * @method egret.Sound#pause
         */
        _pause(): void;
        /**
         * 重新加载声音
         * @method egret.Sound#load
         */
        _load(): void;
        _preload(type: string, callback?: Function, thisObj?: any): void;
        _setAudio(path: string): void;
        private initStart();
        private _listeners;
        /**
         * 添加事件监听
         * @param type 事件类型
         * @param listener 监听函数
         */
        _addEventListener(type: string, listener: Function, useCapture?: boolean): void;
        /**s
         * 移除事件监听
         * @param type 事件类型
         * @param listener 监听函数
         */
        _removeEventListener(type: string, listener: Function, useCapture?: boolean): void;
        /**
         * 获取当前音量值
         * @returns number
         */
        _getVolume(): number;
        _setVolume(value: number): void;
        _setLoop(value: boolean): void;
        private _startTime;
        _getCurrentTime(): number;
        _setCurrentTime(value: number): void;
        _destroy(): void;
    }
}
declare module egret_native_sound {
    var currentPath: string;
}

