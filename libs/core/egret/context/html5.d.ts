declare module egret {
    /**
     * @class egret.HTML5DeviceContext
     * @classdesc
     * @extends egret.DeviceContext
     * @private
     */
    class HTML5DeviceContext extends DeviceContext {
        frameRate: number;
        private _time;
        private static instance;
        private static countTime;
        /**
         * @method egret.HTML5DeviceContext#constructor
         */
        constructor(frameRate?: number);
        static requestAnimationFrame: Function;
        static cancelAnimationFrame: Function;
        static _thisObject: any;
        static _callback: Function;
        private _requestAnimationId;
        private static count;
        private enterFrame();
        /**
         * @method egret.HTML5DeviceContext#executeMainLoop
         * @param callback {Function}
         * @param thisObject {any}
         */
        executeMainLoop(callback: Function, thisObject: any): void;
        private reset();
        private _isActivate;
        private registerListener();
    }
}
declare module egret_html5_localStorage {
    function getItem(key: string): string;
    function setItem(key: string, value: string): boolean;
    function removeItem(key: string): void;
    function clear(): void;
    function init(): void;
}

declare module egret {
    /**
     * @class egret.HTML5CanvasRenderer
     * @classdesc
     * @extends egret.RendererContext
     * @private
     */
    class HTML5CanvasRenderer extends RendererContext {
        private canvas;
        /**
         * @member egret.HTML5CanvasRenderer#canvasContext
         */
        private canvasContext;
        private _matrixA;
        private _matrixB;
        private _matrixC;
        private _matrixD;
        private _matrixTx;
        private _matrixTy;
        _transformTx: number;
        _transformTy: number;
        private blendValue;
        private _cacheCanvas;
        private _cacheCanvasContext;
        private useCacheCanvas;
        drawCanvasContext: CanvasRenderingContext2D;
        constructor(canvas?: HTMLCanvasElement, useCacheCanvas?: boolean);
        private createCanvas();
        private onResize();
        clearScreen(): void;
        clearRect(x: number, y: number, w: number, h: number): void;
        drawImage(texture: Texture, sourceX: any, sourceY: any, sourceWidth: any, sourceHeight: any, destX: any, destY: any, destWidth: any, destHeight: any, renderType?: any): void;
        setTransform(matrix: egret.Matrix): void;
        setAlpha(alpha: number, blendMode: string): void;
        private blendModes;
        private initBlendMode();
        setupFont(textField: TextField, style?: egret.ITextStyle): void;
        measureText(text: string): number;
        drawText(textField: egret.TextField, text: string, x: number, y: number, maxWidth: number, style?: egret.ITextStyle): void;
        strokeRect(x: any, y: any, w: any, h: any, color: any): void;
        pushMask(mask: Rectangle): void;
        popMask(): void;
        onRenderStart(): void;
        onRenderFinish(): void;
        drawCursor(x1: number, y1: number, x2: number, y2: number): void;
    }
}

declare module egret {
    /**
     * @private
     */
    interface IWebGLTemplate {
        _bitmapData: any;
        renderContext: any;
    }
}

declare module egret {
    /**
     * @class egret.WebGLRenderer
     * @classdesc
     * WebGL的渲染类
     * @extends egret.RendererContext
     * @private
     */
    class WebGLRenderer extends RendererContext {
        private static glID;
        private static isInit;
        private canvas;
        private gl;
        private glID;
        private size;
        private vertices;
        private vertSize;
        private indices;
        private projectionX;
        private projectionY;
        private shaderManager;
        private width;
        private height;
        constructor(canvas?: HTMLCanvasElement);
        onRenderFinish(): void;
        private static initWebGLCanvas();
        private initAll();
        private createCanvas();
        private onResize();
        private setSize(width, height);
        private contextLost;
        private handleContextLost();
        private handleContextRestored();
        private initWebGL();
        private glContextId;
        private vertexBuffer;
        private indexBuffer;
        private setContext(gl);
        private start();
        clearScreen(): void;
        private currentBlendMode;
        private setBlendMode(blendMode);
        private currentBaseTexture;
        private currentBatchSize;
        drawRepeatImage(texture: Texture, sourceX: any, sourceY: any, sourceWidth: any, sourceHeight: any, destX: any, destY: any, destWidth: any, destHeight: any, repeat: any): void;
        drawImage(texture: Texture, sourceX: any, sourceY: any, sourceWidth: any, sourceHeight: any, destX: any, destY: any, destWidth: any, destHeight: any, repeat?: any): void;
        private _drawImage(texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
        private useGlow(texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
        private _drawWebGL();
        private worldTransform;
        setTransform(matrix: Matrix): void;
        private worldAlpha;
        setAlpha(value: number, blendMode: string): void;
        createWebGLTexture(texture: Texture): void;
        private maskList;
        private maskDataFreeList;
        pushMask(mask: Rectangle): void;
        private getScissorRect(mask);
        popMask(): void;
        private scissor(x, y, w, h);
        private colorTransformMatrix;
        private setGlobalColorTransform(colorTransformMatrix);
        private setBlurData(blurX, blurY);
        setGlobalFilters(filtersData: Array<Filter>): void;
        private filterType;
        private filters;
        private setFilterProperties(filtersData);
        private html5Canvas;
        private canvasContext;
        setupFont(textField: TextField, style?: egret.ITextStyle): void;
        measureText(text: string): number;
        private graphicsPoints;
        private graphicsIndices;
        private graphicsBuffer;
        private graphicsIndexBuffer;
        renderGraphics(graphics: any): void;
        private updateGraphics(graphics);
        private buildRectangle(graphicsData);
        private graphicsStyle;
        setGraphicsStyle(r: number, g: number, b: number, a: number): void;
    }
}
declare module egret_webgl_graphics {
    function beginFill(color: number, alpha?: number): void;
    function drawRect(x: number, y: number, width: number, height: number): void;
    function drawCircle(x: number, y: number, r: number): void;
    function drawRoundRect(x: number, y: number, width: number, height: number, ellipseWidth: number, ellipseHeight?: number): void;
    function drawEllipse(x: number, y: number, width: number, height: number): void;
    function lineStyle(thickness?: number, color?: number, alpha?: number, pixelHinting?: boolean, scaleMode?: string, caps?: string, joints?: string, miterLimit?: number): void;
    function lineTo(x: number, y: number): void;
    function curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void;
    function cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number): void;
    function moveTo(x: number, y: number): void;
    function clear(): void;
    function endFill(): void;
    function _pushCommand(cmd: any): void;
    function _draw(renderContext: egret.WebGLRenderer): void;
    function _setStyle(r: number, g: number, b: number, a: number): void;
    function init(): void;
}

declare module egret {
    /**
     * @private
     */
    class WebGLUtils {
        static compileProgram(gl: WebGLRenderingContext, vertexSrc: string, fragmentSrc: string): WebGLProgram;
        static compileFragmentShader(gl: WebGLRenderingContext, shaderSrc: string): WebGLShader;
        static compileVertexShader(gl: WebGLRenderingContext, shaderSrc: string): WebGLShader;
        private static _compileShader(gl, shaderSrc, shaderType);
        private static canUseWebGL;
        static checkCanUseWebGL(): boolean;
    }
}

declare module egret {
    /**
     * @private
     */
    class EgretShader {
        private defaultVertexSrc;
        private gl;
        program: WebGLProgram;
        fragmentSrc: string;
        private uSampler;
        projectionVector: WebGLUniformLocation;
        private offsetVector;
        private dimensions;
        aVertexPosition: number;
        aTextureCoord: number;
        colorAttribute: number;
        attributes: Array<number>;
        uniforms: any;
        constructor(gl: WebGLRenderingContext);
        init(): void;
        initUniforms(): void;
        syncUniforms(): void;
    }
}

declare module egret {
    /**
     * @private
     */
    class ColorTransformShader extends EgretShader {
        fragmentSrc: string;
        uniforms: {
            matrix: {
                type: string;
                value: number[];
            };
            colorAdd: {
                type: string;
                value: {
                    x: number;
                    y: number;
                    z: number;
                    w: number;
                };
            };
        };
        constructor(gl: WebGLRenderingContext);
    }
}

declare module egret {
    /**
     * @private
     */
    class BlurShader extends EgretShader {
        fragmentSrc: string;
        uniforms: {
            blur: {
                type: string;
                value: {
                    x: number;
                    y: number;
                };
            };
        };
        constructor(gl: WebGLRenderingContext);
    }
}

declare module egret {
    /**
     * @private
     */
    class PrimitiveShader {
        private gl;
        program: WebGLProgram;
        projectionVector: WebGLUniformLocation;
        offsetVector: WebGLUniformLocation;
        tintColor: WebGLUniformLocation;
        aVertexPosition: number;
        colorAttribute: number;
        attributes: Array<number>;
        translationMatrix: WebGLUniformLocation;
        alpha: WebGLUniformLocation;
        fragmentSrc: string;
        vertexSrc: string;
        constructor(gl: WebGLRenderingContext);
        private init();
    }
}

declare module egret {
    /**
     *
     * @private
     */
    class WebGLShaderManager {
        private gl;
        private maxAttibs;
        private attribState;
        private tempAttribState;
        constructor(gl: any);
        currentShader: any;
        defaultShader: EgretShader;
        primitiveShader: PrimitiveShader;
        colorTransformShader: ColorTransformShader;
        blurShader: BlurShader;
        setContext(gl: any): void;
        activateShader(shader: any): void;
        private setAttribs(attribs);
    }
}

declare module egret {
    /**
     * @class egret.HTML5NetContext
     * @classdesc
     * @extends egret.NetContext
     * @private
     */
    class HTML5NetContext extends NetContext {
        _versionCtr: egret.IVersionController;
        constructor();
        initVersion(versionCtr: egret.IVersionController): void;
        proceed(loader: URLLoader): void;
        private loadSound(loader);
        private loadQQAudio(loader);
        private loadWebAudio(loader);
        private getXHR();
        private setResponseType(xhr, responseType);
        private loadTexture(loader);
        /**
         * 获取虚拟url
         * @param url
         * @returns {string}
         */
        private getVirtualUrl(url);
    }
}

declare module egret {
    /**
     * @private
     */
    class HTML5TouchContext extends TouchContext {
        private _isTouchDown;
        private rootDiv;
        constructor();
        private prevent(event);
        run(): void;
        private addMouseListener();
        private addTouchListener();
        private inOutOfCanvas(event);
        private dispatchLeaveStageEvent();
        private _onTouchBegin(event);
        private _onTouchMove(event);
        private _onTouchEnd(event);
        private getLocation(rootDiv, event);
    }
}

declare module egret {
    /**
     * @classdesc
     * @extends egret.StageText
     * @private
     */
    class HTML5StageText extends StageText {
        constructor();
        private _isNeedShow;
        private inputElement;
        private inputDiv;
        private _gscaleX;
        private _gscaleY;
        _initElement(x: number, y: number, cX: number, cY: number): void;
        _show(multiline: boolean, size: number, width: number, height: number): void;
        private onBlurHandler();
        private executeShow();
        private _isNeesHide;
        _hide(): void;
        private textValue;
        _getText(): string;
        _setText(value: string): void;
        private resetText();
        _onInput(): void;
        _onClickHandler(e: any): void;
        _onDisconnect(): void;
        private _styleInfoes;
        private setElementStyle(style, value);
        _removeInput(): void;
        /**
         * 修改位置
         * @private
         */
        _resetStageText(): void;
    }
    class HTMLInput {
        private _stageText;
        private _simpleElement;
        private _multiElement;
        private _inputElement;
        _inputDIV: any;
        isInputOn(): boolean;
        isCurrentStageText(stageText: any): boolean;
        private initValue(dom);
        _needShow: boolean;
        _initStageDelegateDiv(): any;
        private initInputElement(multiline);
        show(): void;
        disconnectStageText(stageText: any): void;
        clearInputElement(): void;
        getInputElement(stageText: any): any;
        private static _instance;
        static getInstance(): HTMLInput;
    }
}

declare module egret {
    /**
     * @private
     */
    class Html5Audio implements IAudio {
        /**
         * audio音频对象
         * @member {any} egret.Sound#audio
         */
        constructor();
        private _audio;
        private _loop;
        /**
         * 播放声音
         * @method egret.Sound#play
         * @param loop {boolean} 是否循环播放，默认为false
         */
        _play(type?: string): void;
        private clear();
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
        _setAudio(audio: any): void;
        private initStart();
        private _listeners;
        private _onEndedCall;
        /**
         * 添加事件监听
         * @param type 事件类型
         * @param listener 监听函数
         */
        _addEventListener(type: string, listener: Function, useCapture?: boolean): void;
        private removeListeners();
        /**
         * 移除事件监听
         * @param type 事件类型
         * @param listener 监听函数
         */
        _removeEventListener(type: string, listener: Function, useCapture?: boolean): void;
        _preload(type: string, callback?: Function, thisObj?: any): void;
        _destroy(): void;
        private _volume;
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
    }
}

declare module egret {
    /**
     * @private
     */
    class WebAudio implements IAudio {
        static canUseWebAudio: any;
        static ctx: any;
        /**
         * audio音频对象
         * @member {any} egret.Sound#audio
         */
        private audioBuffer;
        private _arrayBuffer;
        private context;
        private gain;
        private bufferSource;
        private paused;
        private static decodeArr;
        private static isDecoding;
        static decodeAudios(): void;
        constructor();
        private _loop;
        /**
         * 播放声音
         * @method egret.Sound#play
         * @param loop {boolean} 是否循环播放，默认为false
         */
        _play(type?: string): void;
        private clear();
        private addListeners();
        private removeListeners();
        /**
         * 暂停声音
         * @method egret.Sound#pause
         */
        _pause(): void;
        private _listeners;
        private _onEndedCall;
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
         * 重新加载声音
         * @method egret.Sound#load
         */
        _load(): void;
        _setArrayBuffer(buffer: ArrayBuffer, callback: Function): void;
        _preload(type: string, callback?: Function, thisObj?: any): void;
        private _volume;
        /**
         * 获取当前音量值
         * @returns number
         */
        _getVolume(): number;
        _setVolume(value: number): void;
        _setLoop(value: boolean): void;
        private _startTime;
        private _currentTime;
        _getCurrentTime(): number;
        _setCurrentTime(value: number): void;
        _destroy(): void;
    }
}
/**
 * @private
 */
interface AudioBuffer {
}
/**
 * @private
 */
interface AudioBufferSourceNode {
    buffer: any;
    context: any;
    onended: Function;
    stop(when?: number): void;
    noteOff(when?: number): void;
    addEventListener(type: string, listener: Function, useCapture?: boolean): any;
    removeEventListener(type: string, listener: Function, useCapture?: boolean): any;
    disconnect(): any;
}

declare module QZAppExternal {
    function playLocalSound(call: any, data: any): any;
    function playLocalBackSound(data: any): any;
    function preloadSound(call: any, data: any): any;
    function stopSound(): any;
    function stopBackSound(): any;
}
declare module egret {
    /**
     * @private
     */
    class QQAudio implements IAudio {
        constructor();
        private _loop;
        private _type;
        /**
         * 播放声音
         * @method egret.Sound#play
         * @param loop {boolean} 是否循环播放，默认为false
         */
        _play(type?: string): void;
        /**
         * 暂停声音
         * @method egret.Sound#pause
         */
        _pause(): void;
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
         * 重新加载声音
         * @method egret.Sound#load
         */
        _load(): void;
        _preload(type: string, callback?: Function, thisObj?: any): void;
        private _path;
        _setPath(path: string): void;
        /**
         * 获取当前音量值
         * @returns number
         */
        _getVolume(): number;
        _setVolume(value: number): void;
        _setLoop(value: boolean): void;
        private _currentTime;
        _getCurrentTime(): number;
        _setCurrentTime(value: number): void;
        _destroy(): void;
    }
}

declare module egret {
    class AudioType {
        static QQ_AUDIO: number;
        static WEB_AUDIO: number;
        static HTML5_AUDIO: number;
    }
    class SystemOSType {
        static WPHONE: number;
        static IOS: number;
        static ADNROID: number;
    }
    /**
     * html5兼容性配置
     * @private
     */
    class Html5Capatibility extends HashObject {
        static _canUseBlob: boolean;
        static _audioType: number;
        static _AudioClass: any;
        static _QQRootPath: string;
        static _System_OS: number;
        constructor();
        private static ua;
        static _init(): void;
        /**
         * 获取ios版本
         * @returns {string}
         */
        private static getIOSVersion();
    }
}

