declare module fairygui {
    class GObject extends egret.EventDispatcher {
        data: any;
        packageItem: PackageItem;
        static draggingObject: GObject;
        private _x;
        private _y;
        private _alpha;
        private _rotation;
        private _visible;
        private _touchable;
        private _grayed;
        private _draggable;
        private _scaleX;
        private _scaleY;
        private _skewX;
        private _skewY;
        private _pivotX;
        private _pivotY;
        private _pivotAsAnchor;
        private _pivotOffsetX;
        private _pivotOffsetY;
        private _sortingOrder;
        private _internalVisible;
        private _handlingController;
        private _focusable;
        private _tooltips;
        private _pixelSnapping;
        private _relations;
        private _group;
        private _gears;
        private _displayObject;
        private _dragBounds;
        sourceWidth: number;
        sourceHeight: number;
        initWidth: number;
        initHeight: number;
        minWidth: number;
        minHeight: number;
        maxWidth: number;
        maxHeight: number;
        _parent: GComponent;
        _width: number;
        _height: number;
        _rawWidth: number;
        _rawHeight: number;
        _id: string;
        _name: string;
        _underConstruct: boolean;
        _gearLocked: boolean;
        _sizePercentInGroup: number;
        _sizeImplType: number;
        static _gInstanceCounter: number;
        static XY_CHANGED: string;
        static SIZE_CHANGED: string;
        static SIZE_DELAY_CHANGE: string;
        static GEAR_STOP: string;
        constructor();
        readonly id: string;
        name: string;
        x: number;
        y: number;
        setXY(xv: number, yv: number): void;
        xMin: number;
        yMin: number;
        pixelSnapping: boolean;
        center(restraint?: boolean): void;
        width: number;
        height: number;
        setSize(wv: number, hv: number, ignorePivot?: boolean): void;
        ensureSizeCorrect(): void;
        readonly actualWidth: number;
        readonly actualHeight: number;
        scaleX: number;
        scaleY: number;
        setScale(sx: number, sy: number): void;
        skewX: number;
        skewY: number;
        setSkew(xv: number, yv: number): void;
        pivotX: number;
        pivotY: number;
        setPivot(xv: number, yv?: number, asAnchor?: boolean): void;
        readonly pivotAsAnchor: boolean;
        protected internalSetPivot(xv: number, yv: number, asAnchor: boolean): void;
        private updatePivotOffset();
        private applyPivot();
        touchable: boolean;
        grayed: boolean;
        enabled: boolean;
        rotation: number;
        readonly normalizeRotation: number;
        alpha: number;
        visible: boolean;
        readonly internalVisible: boolean;
        readonly internalVisible2: boolean;
        sortingOrder: number;
        focusable: boolean;
        readonly focused: boolean;
        requestFocus(): void;
        tooltips: string;
        blendMode: string;
        filters: egret.Filter[];
        readonly inContainer: boolean;
        readonly onStage: boolean;
        readonly resourceURL: string;
        group: GGroup;
        getGear(index: number): GearBase;
        protected updateGear(index: number): void;
        checkGearController(index: number, c: Controller): boolean;
        updateGearFromRelations(index: number, dx: number, dy: number): void;
        addDisplayLock(): number;
        releaseDisplayLock(token: number): void;
        private checkGearDisplay();
        readonly gearXY: GearXY;
        readonly gearSize: GearSize;
        readonly gearLook: GearLook;
        readonly relations: Relations;
        addRelation(target: GObject, relationType: number, usePercent?: boolean): void;
        removeRelation(target: GObject, relationType?: number): void;
        readonly displayObject: egret.DisplayObject;
        protected setDisplayObject(value: egret.DisplayObject): void;
        parent: GComponent;
        removeFromParent(): void;
        readonly root: GRoot;
        readonly asCom: GComponent;
        readonly asButton: GButton;
        readonly asLabel: GLabel;
        readonly asProgress: GProgressBar;
        readonly asTextField: GTextField;
        readonly asRichTextField: GRichTextField;
        readonly asTextInput: GTextInput;
        readonly asLoader: GLoader;
        readonly asList: GList;
        readonly asGraph: GGraph;
        readonly asGroup: GGroup;
        readonly asSlider: GSlider;
        readonly asComboBox: GComboBox;
        readonly asImage: GImage;
        readonly asMovieClip: GMovieClip;
        static cast(obj: egret.DisplayObject): GObject;
        text: string;
        icon: string;
        dispose(): void;
        addClickListener(listener: Function, thisObj: any): void;
        removeClickListener(listener: Function, thisObj: any): void;
        hasClickListener(): boolean;
        addEventListener(type: string, listener: Function, thisObject: any): void;
        removeEventListener(type: string, listener: Function, thisObject: any): void;
        private _reDispatch(evt);
        draggable: boolean;
        dragBounds: egret.Rectangle;
        startDrag(touchPointID?: number): void;
        stopDrag(): void;
        readonly dragging: boolean;
        localToGlobal(ax?: number, ay?: number, resultPoint?: egret.Point): egret.Point;
        globalToLocal(ax?: number, ay?: number, resultPoint?: egret.Point): egret.Point;
        localToRoot(ax?: number, ay?: number, resultPoint?: egret.Point): egret.Point;
        rootToLocal(ax?: number, ay?: number, resultPoint?: egret.Point): egret.Point;
        localToGlobalRect(ax?: number, ay?: number, aWidth?: number, aHeight?: number, resultRect?: egret.Rectangle): egret.Rectangle;
        globalToLocalRect(ax?: number, ay?: number, aWidth?: number, aHeight?: number, resultRect?: egret.Rectangle): egret.Rectangle;
        handleControllerChanged(c: Controller): void;
        protected createDisplayObject(): void;
        protected switchDisplayObject(newObj: egret.DisplayObject): void;
        protected handleXYChanged(): void;
        protected handleSizeChanged(): void;
        protected handleScaleChanged(): void;
        private static colorMatrix;
        protected handleGrayedChanged(): void;
        protected handleAlphaChanged(): void;
        handleVisibleChanged(): void;
        constructFromResource(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        private static sGlobalDragStart;
        private static sGlobalRect;
        private static sHelperPoint;
        private static sDragHelperRect;
        private static sUpdateInDragging;
        private _touchDownPoint;
        private initDrag();
        private dragBegin(evt);
        private dragEnd();
        private reset();
        private __begin(evt);
        private __end(evt);
        private __moving(evt);
        private __moving2(evt);
        private __end2(evt);
    }
}
declare module fairygui {
    class UBBParser {
        private _text;
        private _readPos;
        protected _handlers: any;
        smallFontSize: number;
        normalFontSize: number;
        largeFontSize: number;
        defaultImgWidth: number;
        defaultImgHeight: number;
        static inst: UBBParser;
        constructor();
        protected onTag_URL(tagName: string, end: boolean, attr: string): string;
        protected onTag_IMG(tagName: string, end: boolean, attr: string): string;
        protected onTag_Simple(tagName: string, end: boolean, attr: string): string;
        protected onTag_COLOR(tagName: string, end: boolean, attr: string): string;
        protected onTag_FONT(tagName: string, end: boolean, attr: string): string;
        protected onTag_SIZE(tagName: string, end: boolean, attr: string): string;
        protected getTagText(remove?: boolean): string;
        parse(text: string, remove?: boolean): string;
    }
}
declare module fairygui {
    class GearBase {
        static disableAllTweenEffect: boolean;
        protected _tweenConfig: GearTweenConfig;
        protected _owner: GObject;
        protected _controller: Controller;
        constructor(owner: GObject);
        controller: Controller;
        readonly tweenConfig: GearTweenConfig;
        setup(buffer: ByteBuffer): void;
        updateFromRelations(dx: number, dy: number): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        protected init(): void;
        apply(): void;
        updateState(): void;
    }
    class GearTweenConfig {
        tween: boolean;
        easeType: number;
        duration: number;
        delay: number;
        _displayLockToken: number;
        _tweener: GTweener;
        constructor();
    }
}
declare module fairygui {
    enum ButtonMode {
        Common = 0,
        Check = 1,
        Radio = 2,
    }
    enum AutoSizeType {
        None = 0,
        Both = 1,
        Height = 2,
    }
    enum AlignType {
        Left = 0,
        Center = 1,
        Right = 2,
    }
    enum VertAlignType {
        Top = 0,
        Middle = 1,
        Bottom = 2,
    }
    enum LoaderFillType {
        None = 0,
        Scale = 1,
        ScaleMatchHeight = 2,
        ScaleMatchWidth = 3,
        ScaleFree = 4,
        ScaleNoBorder = 5,
    }
    enum ListLayoutType {
        SingleColumn = 0,
        SingleRow = 1,
        FlowHorizontal = 2,
        FlowVertical = 3,
        Pagination = 4,
    }
    enum ListSelectionMode {
        Single = 0,
        Multiple = 1,
        Multiple_SingleClick = 2,
        None = 3,
    }
    enum OverflowType {
        Visible = 0,
        Hidden = 1,
        Scroll = 2,
    }
    enum PackageItemType {
        Image = 0,
        MovieClip = 1,
        Sound = 2,
        Component = 3,
        Atlas = 4,
        Font = 5,
        Swf = 6,
        Misc = 7,
        Unknown = 8,
    }
    enum ObjectType {
        Image = 0,
        MovieClip = 1,
        Swf = 2,
        Graph = 3,
        Loader = 4,
        Group = 5,
        Text = 6,
        RichText = 7,
        InputText = 8,
        Component = 9,
        List = 10,
        Label = 11,
        Button = 12,
        ComboBox = 13,
        ProgressBar = 14,
        Slider = 15,
        ScrollBar = 16,
    }
    enum ProgressTitleType {
        Percent = 0,
        ValueAndMax = 1,
        Value = 2,
        Max = 3,
    }
    enum ScrollBarDisplayType {
        Default = 0,
        Visible = 1,
        Auto = 2,
        Hidden = 3,
    }
    enum ScrollType {
        Horizontal = 0,
        Vertical = 1,
        Both = 2,
    }
    enum FlipType {
        None = 0,
        Horizontal = 1,
        Vertical = 2,
        Both = 3,
    }
    enum ChildrenRenderOrder {
        Ascent = 0,
        Descent = 1,
        Arch = 2,
    }
    enum GroupLayoutType {
        None = 0,
        Horizontal = 1,
        Vertical = 2,
    }
    enum PopupDirection {
        Auto = 0,
        Up = 1,
        Down = 2,
    }
    enum RelationType {
        Left_Left = 0,
        Left_Center = 1,
        Left_Right = 2,
        Center_Center = 3,
        Right_Left = 4,
        Right_Center = 5,
        Right_Right = 6,
        Top_Top = 7,
        Top_Middle = 8,
        Top_Bottom = 9,
        Middle_Middle = 10,
        Bottom_Top = 11,
        Bottom_Middle = 12,
        Bottom_Bottom = 13,
        Width = 14,
        Height = 15,
        LeftExt_Left = 16,
        LeftExt_Right = 17,
        RightExt_Left = 18,
        RightExt_Right = 19,
        TopExt_Top = 20,
        TopExt_Bottom = 21,
        BottomExt_Top = 22,
        BottomExt_Bottom = 23,
        Size = 24,
    }
}
declare module fairygui {
    class ControllerAction {
        fromPage: string[];
        toPage: string[];
        static createAction(type: number): ControllerAction;
        constructor();
        run(controller: Controller, prevPage: string, curPage: string): void;
        protected enter(controller: Controller): void;
        protected leave(controller: Controller): void;
        setup(buffer: ByteBuffer): void;
    }
}
declare module fairygui {
    class GComponent extends GObject {
        private _sortingChildCount;
        private _opaque;
        private _applyingController;
        protected _margin: Margin;
        protected _trackBounds: boolean;
        protected _boundsChanged: boolean;
        protected _childrenRenderOrder: ChildrenRenderOrder;
        protected _apexIndex: number;
        _buildingDisplayList: boolean;
        _children: Array<GObject>;
        _controllers: Array<Controller>;
        _transitions: Array<Transition>;
        _rootContainer: UIContainer;
        _container: egret.DisplayObjectContainer;
        _scrollPane: ScrollPane;
        _alignOffset: egret.Point;
        constructor();
        protected createDisplayObject(): void;
        dispose(): void;
        readonly displayListContainer: egret.DisplayObjectContainer;
        addChild(child: GObject): GObject;
        addChildAt(child: GObject, index?: number): GObject;
        private getInsertPosForSortingChild(target);
        removeChild(child: GObject, dispose?: boolean): GObject;
        removeChildAt(index: number, dispose?: boolean): GObject;
        removeChildren(beginIndex?: number, endIndex?: number, dispose?: boolean): void;
        getChildAt(index?: number): GObject;
        getChild(name: string): GObject;
        getVisibleChild(name: string): GObject;
        getChildInGroup(name: string, group: GGroup): GObject;
        getChildById(id: string): GObject;
        getChildIndex(child: GObject): number;
        setChildIndex(child: GObject, index?: number): void;
        setChildIndexBefore(child: GObject, index: number): number;
        private _setChildIndex(child, oldIndex, index?);
        swapChildren(child1: GObject, child2: GObject): void;
        swapChildrenAt(index1: number, index2?: number): void;
        readonly numChildren: number;
        isAncestorOf(child: GObject): boolean;
        addController(controller: Controller): void;
        getControllerAt(index: number): Controller;
        getController(name: string): Controller;
        removeController(c: Controller): void;
        readonly controllers: Array<Controller>;
        childStateChanged(child: GObject): void;
        private buildNativeDisplayList();
        applyController(c: Controller): void;
        applyAllControllers(): void;
        adjustRadioGroupDepth(obj: GObject, c: Controller): void;
        getTransitionAt(index: number): Transition;
        getTransition(transName: string): Transition;
        isChildInView(child: GObject): boolean;
        getFirstChildInView(): number;
        readonly scrollPane: ScrollPane;
        opaque: boolean;
        margin: Margin;
        childrenRenderOrder: ChildrenRenderOrder;
        apexIndex: number;
        mask: egret.DisplayObject | egret.Rectangle;
        readonly baseUserData: string;
        protected updateOpaque(): void;
        protected updateScrollRect(): void;
        protected setupScroll(buffer: ByteBuffer): void;
        protected setupOverflow(overflow: OverflowType): void;
        protected handleSizeChanged(): void;
        protected handleGrayedChanged(): void;
        handleControllerChanged(c: Controller): void;
        setBoundsChangedFlag(): void;
        private __render();
        ensureBoundsCorrect(): void;
        protected updateBounds(): void;
        setBounds(ax: number, ay: number, aw: number, ah?: number): void;
        viewWidth: number;
        viewHeight: number;
        getSnappingPosition(xValue: number, yValue: number, resultPoint?: egret.Point): egret.Point;
        childSortingOrderChanged(child: GObject, oldValue: number, newValue?: number): void;
        constructFromResource(): void;
        constructFromResource2(objectPool: Array<GObject>, poolIndex: number): void;
        protected constructExtension(buffer: ByteBuffer): void;
        protected constructFromXML(xml: any): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        private ___added(evt);
        private ___removed(evt);
    }
}
declare module fairygui {
    class GObjectPool {
        private _pool;
        private _count;
        constructor();
        clear(): void;
        readonly count: number;
        getObject(url: string): GObject;
        returnObject(obj: GObject): void;
    }
}
declare module fairygui {
    class GTextField extends GObject {
        protected _textField: egret.TextField;
        protected _bitmapContainer: egret.DisplayObjectContainer;
        protected _font: string;
        protected _fontSize: number;
        protected _align: AlignType;
        protected _verticalAlign: VertAlignType;
        protected _color: number;
        protected _leading: number;
        protected _letterSpacing: number;
        protected _text: string;
        protected _ubbEnabled: boolean;
        protected _templateVars: any;
        protected _autoSize: AutoSizeType;
        protected _widthAutoSize: boolean;
        protected _heightAutoSize: boolean;
        protected _updatingSize: boolean;
        protected _sizeDirty: boolean;
        protected _textWidth: number;
        protected _textHeight: number;
        protected _requireRender: boolean;
        protected _bitmapFont: BitmapFont;
        protected _lines: Array<LineInfo>;
        protected _bitmapPool: Array<egret.Bitmap>;
        protected static GUTTER_X: number;
        protected static GUTTER_Y: number;
        constructor();
        protected createDisplayObject(): void;
        private switchBitmapMode(val);
        dispose(): void;
        text: string;
        protected updateTextFieldText(): void;
        font: string;
        fontSize: number;
        color: number;
        align: AlignType;
        verticalAlign: VertAlignType;
        private getAlignTypeString(type);
        private getVertAlignTypeString(type);
        leading: number;
        letterSpacing: number;
        underline: boolean;
        bold: boolean;
        italic: boolean;
        singleLine: boolean;
        stroke: number;
        strokeColor: number;
        ubbEnabled: boolean;
        autoSize: AutoSizeType;
        readonly textWidth: number;
        ensureSizeCorrect(): void;
        protected updateTextFormat(): void;
        protected render(): void;
        private __render();
        protected renderNow(updateBounds?: boolean): void;
        private renderWithBitmapFont(updateBounds);
        protected handleSizeChanged(): void;
        protected parseTemplate(template: string): string;
        templateVars: any;
        setVar(name: string, value: string): GTextField;
        flushVars(): void;
        protected handleGrayedChanged(): void;
        private doAlign();
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
    }
    class LineInfo {
        width: number;
        height: number;
        textHeight: number;
        text: string;
        y: number;
        private static pool;
        static borrow(): LineInfo;
        static returns(value: LineInfo): void;
        static returnList(value: Array<LineInfo>): void;
        constructor();
    }
}
declare module fairygui {
    class PackageItem {
        owner: UIPackage;
        type: PackageItemType;
        objectType: ObjectType;
        id: string;
        name: string;
        width: number;
        height: number;
        file: string;
        decoded: boolean;
        rawData: ByteBuffer;
        scale9Grid: egret.Rectangle;
        scaleByTile: boolean;
        tileGridIndice: number;
        smoothing: boolean;
        texture: egret.Texture;
        interval: number;
        repeatDelay: number;
        swing: boolean;
        frames: Array<Frame>;
        extensionType: any;
        sound: egret.Sound;
        bitmapFont: BitmapFont;
        constructor();
        load(): any;
        toString(): string;
    }
}
declare module fairygui {
    class BMGlyph {
        x: number;
        y: number;
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
        advance: number;
        lineHeight: number;
        channel: number;
        texture: egret.Texture;
        constructor();
    }
}
declare module fairygui {
    class DragEvent extends egret.Event {
        stageX: number;
        stageY: number;
        touchPointID: number;
        private _prevented;
        static DRAG_START: string;
        static DRAG_END: string;
        static DRAG_MOVING: string;
        constructor(type: string, stageX?: number, stageY?: number, touchPointID?: number);
        preventDefault(): void;
        isDefaultPrevented(): boolean;
    }
}
declare module fairygui {
    class DropEvent extends egret.Event {
        source: any;
        static DROP: string;
        constructor(type: string, source?: any);
    }
}
declare module fairygui {
    class ItemEvent extends egret.Event {
        itemObject: GObject;
        stageX: number;
        stageY: number;
        static CLICK: string;
        constructor(type: string, itemObject?: GObject, stageX?: number, stageY?: number);
    }
}
declare module fairygui {
    class StateChangeEvent extends egret.Event {
        static CHANGED: string;
        constructor(type: string);
    }
}
declare module fairygui {
    class Controller extends egret.EventDispatcher {
        private _selectedIndex;
        private _previousIndex;
        private _pageIds;
        private _pageNames;
        private _actions;
        name: string;
        parent: GComponent;
        autoRadioGroupDepth: boolean;
        changing: boolean;
        private static _nextPageId;
        constructor();
        dispose(): void;
        selectedIndex: number;
        setSelectedIndex(value?: number): void;
        readonly previsousIndex: number;
        selectedPage: string;
        setSelectedPage(value: string): void;
        readonly previousPage: string;
        readonly pageCount: number;
        getPageName(index?: number): string;
        addPage(name?: string): void;
        addPageAt(name: string, index?: number): void;
        removePage(name: string): void;
        removePageAt(index?: number): void;
        clearPages(): void;
        hasPage(aName: string): boolean;
        getPageIndexById(aId: string): number;
        getPageIdByName(aName: string): string;
        getPageNameById(aId: string): string;
        getPageId(index?: number): string;
        selectedPageId: string;
        oppositePageId: string;
        readonly previousPageId: string;
        runActions(): void;
        setup(buffer: ByteBuffer): void;
    }
}
declare module fairygui {
    class ToolSet {
        constructor();
        static getFileName(source: string): string;
        static startsWith(source: string, str: string, ignoreCase?: boolean): boolean;
        static endsWith(source: string, str: string, ignoreCase?: boolean): boolean;
        static trim(targetString: string): string;
        static trimLeft(targetString: string): string;
        static trimRight(targetString: string): string;
        static convertToHtmlColor(argb: number, hasAlpha?: boolean): string;
        static convertFromHtmlColor(str: string, hasAlpha?: boolean): number;
        static displayObjectToGObject(obj: egret.DisplayObject): GObject;
        static encodeHTML(str: string): string;
        static defaultUBBParser: UBBParser;
        static parseUBB(text: string): string;
        static clamp(value: number, min: number, max: number): number;
        static clamp01(value: number): number;
        static lerp(start: number, end: number, percent: number): number;
    }
}
declare module fairygui {
    class ColorMatrix {
        matrix: Array<number>;
        private static IDENTITY_MATRIX;
        private static LENGTH;
        private static LUMA_R;
        private static LUMA_G;
        private static LUMA_B;
        static create(p_brightness: number, p_contrast: number, p_saturation: number, p_hue: number): ColorMatrix;
        constructor();
        reset(): void;
        invert(): void;
        adjustColor(p_brightness: number, p_contrast: number, p_saturation: number, p_hue: number): void;
        adjustBrightness(p_val: number): void;
        adjustContrast(p_val: number): void;
        adjustSaturation(p_val: number): void;
        adjustHue(p_val: number): void;
        concat(p_matrix: Array<number>): void;
        clone(): ColorMatrix;
        protected copyMatrix(p_matrix: Array<number>): void;
        protected multiplyMatrix(p_matrix: Array<number>): void;
        protected cleanValue(p_val: number, p_limit: number): number;
    }
}
declare module fairygui {
    class EaseManager {
        private static _PiOver2;
        private static _TwoPi;
        static evaluate(easeType: number, time: number, duration: number, overshootOrAmplitude: number, period: number): number;
    }
}
declare module fairygui {
    class EaseType {
        static Linear: number;
        static SineIn: number;
        static SineOut: number;
        static SineInOut: number;
        static QuadIn: number;
        static QuadOut: number;
        static QuadInOut: number;
        static CubicIn: number;
        static CubicOut: number;
        static CubicInOut: number;
        static QuartIn: number;
        static QuartOut: number;
        static QuartInOut: number;
        static QuintIn: number;
        static QuintOut: number;
        static QuintInOut: number;
        static ExpoIn: number;
        static ExpoOut: number;
        static ExpoInOut: number;
        static CircIn: number;
        static CircOut: number;
        static CircInOut: number;
        static ElasticIn: number;
        static ElasticOut: number;
        static ElasticInOut: number;
        static BackIn: number;
        static BackOut: number;
        static BackInOut: number;
        static BounceIn: number;
        static BounceOut: number;
        static BounceInOut: number;
        static Custom: number;
    }
}
declare module fairygui {
    class GTween {
        static catchCallbackExceptions: boolean;
        static to(start: number, end: number, duration: number): GTweener;
        static to2(start: number, start2: number, end: number, end2: number, duration: number): GTweener;
        static to3(start: number, start2: number, start3: number, end: number, end2: number, end3: number, duration: number): GTweener;
        static to4(start: number, start2: number, start3: number, start4: number, end: number, end2: number, end3: number, end4: number, duration: number): GTweener;
        static toColor(start: number, end: number, duration: number): GTweener;
        static delayedCall(delay: number): GTweener;
        static shake(startX: number, startY: number, amplitude: number, duration: number): GTweener;
        static isTweening(target: Object, propType: Object): Boolean;
        static kill(target: Object, complete?: Boolean, propType?: Object): void;
        static getTween(target: Object, propType?: Object): GTweener;
    }
}
declare module fairygui {
    class GTweener {
        _target: any;
        _propType: any;
        _killed: boolean;
        _paused: boolean;
        private _delay;
        private _duration;
        private _breakpoint;
        private _easeType;
        private _easeOvershootOrAmplitude;
        private _easePeriod;
        private _repeat;
        private _yoyo;
        private _timeScale;
        private _snapping;
        private _userData;
        private _onUpdate;
        private _onStart;
        private _onComplete;
        private _onUpdateCaller;
        private _onStartCaller;
        private _onCompleteCaller;
        private _startValue;
        private _endValue;
        private _value;
        private _deltaValue;
        private _valueSize;
        private _started;
        private _ended;
        private _elapsedTime;
        private _normalizedTime;
        constructor();
        setDelay(value: number): GTweener;
        readonly delay: number;
        setDuration(value: number): GTweener;
        readonly duration: number;
        setBreakpoint(value: number): GTweener;
        setEase(value: number): GTweener;
        setEasePeriod(value: number): GTweener;
        setEaseOvershootOrAmplitude(value: number): GTweener;
        setRepeat(repeat: number, yoyo?: boolean): GTweener;
        readonly repeat: number;
        setTimeScale(value: number): GTweener;
        setSnapping(value: boolean): GTweener;
        setTarget(value: Object, propType?: Object): GTweener;
        readonly target: Object;
        setUserData(value: any): GTweener;
        readonly userData: any;
        onUpdate(callback: Function, caller: any): GTweener;
        onStart(callback: Function, caller: any): GTweener;
        onComplete(callback: Function, caller: any): GTweener;
        readonly startValue: TweenValue;
        readonly endValue: TweenValue;
        readonly value: TweenValue;
        readonly deltaValue: TweenValue;
        readonly normalizedTime: number;
        readonly completed: boolean;
        readonly allCompleted: boolean;
        setPaused(paused: boolean): GTweener;
        /**
         * seek position of the tween, in seconds.
         */
        seek(time: number): void;
        kill(complete?: boolean): void;
        _to(start: number, end: number, duration: number): GTweener;
        _to2(start: number, start2: number, end: number, end2: number, duration: number): GTweener;
        _to3(start: number, start2: number, start3: number, end: number, end2: number, end3: number, duration: number): GTweener;
        _to4(start: number, start2: number, start3: number, start4: number, end: number, end2: number, end3: number, end4: number, duration: number): GTweener;
        _toColor(start: number, end: number, duration: number): GTweener;
        _shake(startX: number, startY: number, amplitude: number, duration: number): GTweener;
        _init(): void;
        _reset(): void;
        _update(dt: number): void;
        private update();
        private callStartCallback();
        private callUpdateCallback();
        private callCompleteCallback();
    }
}
declare module fairygui {
    class TweenManager {
        private static _activeTweens;
        private static _tweenerPool;
        private static _totalActiveTweens;
        private static _lastTime;
        private static _inited;
        static createTween(): GTweener;
        static isTweening(target: any, propType: any): boolean;
        static killTweens(target: any, completed: boolean, propType: any): boolean;
        static getTween(target: any, propType: any): GTweener;
        private static update(timestamp);
    }
}
declare module fairygui {
    class TweenValue {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor();
        color: number;
        getField(index: number): number;
        setField(index: number, value: number): void;
        setZero(): void;
    }
}
declare module fairygui {
    class PlayTransitionAction extends ControllerAction {
        transitionName: string;
        playTimes: number;
        delay: number;
        stopOnExit: boolean;
        private _currentTransition;
        constructor();
        protected enter(controller: Controller): void;
        protected leave(controller: Controller): void;
        setup(buffer: ByteBuffer): void;
    }
}
declare module fairygui {
    class GearSize extends GearBase {
        private _storage;
        private _default;
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        apply(): void;
        private __tweenUpdate(tweener);
        private __tweenComplete();
        updateState(): void;
        updateFromRelations(dx: number, dy: number): void;
    }
}
declare module fairygui {
    class GearXY extends GearBase {
        private _storage;
        private _default;
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        apply(): void;
        private __tweenUpdate(tweener);
        private __tweenComplete();
        updateState(): void;
        updateFromRelations(dx: number, dy: number): void;
    }
}
declare module fairygui {
    class GearText extends GearBase {
        private _storage;
        private _default;
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        apply(): void;
        updateState(): void;
    }
}
declare module fairygui {
    class GearIcon extends GearBase {
        private _storage;
        private _default;
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        apply(): void;
        updateState(): void;
    }
}
declare module fairygui {
    class GearAnimation extends GearBase {
        private _storage;
        private _default;
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        apply(): void;
        updateState(): void;
    }
}
declare module fairygui {
    class GearColor extends GearBase {
        private _storage;
        private _default;
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        apply(): void;
        updateState(): void;
    }
}
declare module fairygui {
    class GearDisplay extends GearBase {
        pages: string[];
        private _visible;
        private _displayLockToken;
        constructor(owner: GObject);
        protected init(): void;
        apply(): void;
        addLock(): number;
        releaseLock(token: number): void;
        readonly connected: boolean;
    }
}
declare module fairygui {
    class GearLook extends GearBase {
        private _storage;
        private _default;
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        apply(): void;
        private __tweenUpdate(tweener);
        private __tweenComplete();
        updateState(): void;
    }
}
declare module fairygui {
    class ChangePageAction extends ControllerAction {
        objectId: string;
        controllerName: string;
        targetPage: string;
        constructor();
        protected enter(controller: Controller): void;
        setup(buffer: ByteBuffer): void;
    }
}
declare module fairygui {
    class Transition {
        name: string;
        private _owner;
        private _ownerBaseX;
        private _ownerBaseY;
        private _items;
        private _totalTimes;
        private _totalTasks;
        private _playing;
        private _paused;
        private _onComplete;
        private _onCompleteCaller;
        private _onCompleteParam;
        private _options;
        private _reversed;
        private _totalDuration;
        private _autoPlay;
        private _autoPlayTimes;
        private _autoPlayDelay;
        private _timeScale;
        private _startTime;
        private _endTime;
        static OPTION_IGNORE_DISPLAY_CONTROLLER: number;
        static OPTION_AUTO_STOP_DISABLED: number;
        static OPTION_AUTO_STOP_AT_END: number;
        constructor(owner: GComponent);
        play(onComplete?: Function, onCompleteObj?: any, onCompleteParam?: any, times?: number, delay?: number, startTime?: number, endTime?: number): void;
        playReverse(onComplete?: Function, onCompleteObj?: any, onCompleteParam?: any, times?: number, delay?: number): void;
        changePlayTimes(value: number): void;
        setAutoPlay(value: boolean, times?: number, delay?: number): void;
        private _play(onComplete?, onCompleteCaller?, onCompleteParam?, times?, delay?, startTime?, endTime?, reversed?);
        stop(setToComplete?: boolean, processCallback?: boolean): void;
        private stopItem(item, setToComplete);
        setPaused(paused: boolean): void;
        dispose(): void;
        readonly playing: boolean;
        setValue(label: string, ...args: any[]): void;
        setHook(label: string, callback: Function, caller: any): void;
        clearHooks(): void;
        setTarget(label: string, newTarget: GObject): void;
        setDuration(label: string, value: number): void;
        getLabelTime(label: string): number;
        timeScale: number;
        updateFromRelations(targetId: string, dx: number, dy: number): void;
        onOwnerAddedToStage(): void;
        onOwnerRemovedFromStage(): void;
        private onDelayedPlay();
        private internalPlay();
        private playItem(item);
        private skipAnimations();
        private onDelayedPlayItem(tweener);
        private onTweenStart(tweener);
        private onTweenUpdate(tweener);
        private onTweenComplete(tweener);
        private onPlayTransCompleted(item);
        private callHook(item, tweenEnd);
        private checkAllComplete();
        private applyValue(item);
        setup(buffer: ByteBuffer): void;
        private decodeValue(item, buffer, value);
    }
}
declare module fairygui {
    class Frame {
        rect: egret.Rectangle;
        addDelay: number;
        texture: egret.Texture;
        constructor();
    }
}
declare module fairygui {
    class MovieClip extends egret.DisplayObject {
        interval: number;
        swing: boolean;
        repeatDelay: number;
        timeScale: number;
        private _texture;
        private _needRebuild;
        private _frameRect;
        private _playing;
        private _frameCount;
        private _frames;
        private _frame;
        private _start;
        private _end;
        private _times;
        private _endAt;
        private _status;
        private _callback;
        private _callbackObj;
        private _smoothing;
        private _frameElapsed;
        private _reversed;
        private _repeatedCount;
        constructor();
        protected createNativeDisplayObject(): void;
        frames: Array<Frame>;
        readonly frameCount: number;
        frame: number;
        playing: boolean;
        smoothing: boolean;
        rewind(): void;
        syncStatus(anotherMc: MovieClip): void;
        advance(timeInMiniseconds: number): void;
        setPlaySettings(start?: number, end?: number, times?: number, endAt?: number, endCallback?: Function, callbackObj?: any): void;
        private update();
        private drawFrame();
        private checkTimer();
        $updateRenderNode(): void;
        $measureContentBounds(bounds: egret.Rectangle): void;
        $onAddToStage(stage: egret.Stage, nestLevel: number): void;
        $onRemoveFromStage(): void;
    }
}
declare module fairygui {
    class UIContainer extends egret.DisplayObjectContainer {
        private _hitArea;
        constructor();
        hitArea: egret.Rectangle;
        $hitTest(stageX: number, stageY: number): egret.DisplayObject;
    }
}
declare module fairygui {
    class GButton extends GComponent {
        protected _titleObject: GObject;
        protected _iconObject: GObject;
        protected _relatedController: Controller;
        private _mode;
        private _selected;
        private _title;
        private _selectedTitle;
        private _icon;
        private _selectedIcon;
        private _sound;
        private _soundVolumeScale;
        private _pageOption;
        private _buttonController;
        private _changeStateOnClick;
        private _linkedPopup;
        private _downEffect;
        private _downEffectValue;
        private _downScaled;
        private _down;
        private _over;
        static UP: string;
        static DOWN: string;
        static OVER: string;
        static SELECTED_OVER: string;
        static DISABLED: string;
        static SELECTED_DISABLED: string;
        constructor();
        icon: string;
        selectedIcon: string;
        title: string;
        text: string;
        selectedTitle: string;
        titleColor: number;
        titleFontSize: number;
        sound: string;
        soundVolumeScale: number;
        selected: boolean;
        mode: ButtonMode;
        relatedController: Controller;
        readonly pageOption: PageOption;
        changeStateOnClick: boolean;
        linkedPopup: GObject;
        getTextField(): GTextField;
        addStateListener(listener: Function, thisObj: any): void;
        removeStateListener(listener: Function, thisObj: any): void;
        fireClick(downEffect?: boolean): void;
        protected setState(val: string): void;
        handleControllerChanged(c: Controller): void;
        protected handleGrayedChanged(): void;
        protected constructExtension(buffer: ByteBuffer): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        private __rollover(evt);
        private __rollout(evt);
        private __mousedown(evt);
        private __mouseup(evt);
        private __click(evt);
    }
}
declare module fairygui {
    class GComboBox extends GComponent {
        dropdown: GComponent;
        protected _titleObject: GObject;
        protected _iconObject: GObject;
        protected _list: GList;
        private _items;
        private _values;
        private _icons;
        private _visibleItemCount;
        private _itemsUpdated;
        private _selectedIndex;
        private _buttonController;
        private _popupDirection;
        private _selectionController;
        private _over;
        private _down;
        constructor();
        text: string;
        icon: string;
        titleColor: number;
        titleFontSize: number;
        visibleItemCount: number;
        popupDirection: PopupDirection;
        items: Array<string>;
        icons: Array<string>;
        values: Array<string>;
        selectedIndex: number;
        value: string;
        selectionController: Controller;
        getTextField(): GTextField;
        protected setState(val: string): void;
        protected constructExtension(buffer: ByteBuffer): void;
        handleControllerChanged(c: Controller): void;
        private updateSelectionController();
        dispose(): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        protected showDropdown(): void;
        private __popupWinClosed(evt);
        private __clickItem(evt);
        private __clickItem2(index);
        private __rollover(evt);
        private __rollout(evt);
        private __mousedown(evt);
        private __mouseup(evt);
    }
}
declare module fairygui {
    class GGraph extends GObject {
        private _graphics;
        private _type;
        private _lineSize;
        private _lineColor;
        private _lineAlpha;
        private _fillColor;
        private _fillAlpha;
        private _cornerRadius;
        constructor();
        readonly graphics: egret.Graphics;
        drawRect(lineSize: number, lineColor: number, lineAlpha: number, fillColor: number, fillAlpha: number, corner?: Array<number>): void;
        drawEllipse(lineSize: number, lineColor: number, lineAlpha: number, fillColor: number, fillAlpha: number): void;
        clearGraphics(): void;
        color: number;
        private drawCommon();
        replaceMe(target: GObject): void;
        addBeforeMe(target: GObject): void;
        addAfterMe(target: GObject): void;
        setNativeObject(obj: egret.DisplayObject): void;
        private delayCreateDisplayObject();
        protected handleSizeChanged(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare module fairygui {
    class GGroup extends GObject {
        private _layout;
        private _lineGap;
        private _columnGap;
        private _percentReady;
        private _boundsChanged;
        _updating: number;
        constructor();
        layout: number;
        lineGap: number;
        columnGap: number;
        setBoundsChangedFlag(childSizeChanged?: boolean): void;
        ensureBoundsCorrect(): void;
        private updateBounds();
        private handleLayout();
        private updatePercent();
        moveChildren(dx: number, dy: number): void;
        resizeChildren(dw: number, dh: number): void;
        protected handleAlphaChanged(): void;
        handleVisibleChanged(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare module fairygui {
    class GImage extends GObject {
        private _content;
        private _color;
        private _flip;
        private _matrix;
        constructor();
        private getColorMatrix();
        color: number;
        private applyColor();
        flip: FlipType;
        texture: egret.Texture;
        protected createDisplayObject(): void;
        dispose(): void;
        constructFromResource(): void;
        protected handleXYChanged(): void;
        protected handleSizeChanged(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare module fairygui {
    class GLabel extends GComponent {
        protected _titleObject: GObject;
        protected _iconObject: GObject;
        constructor();
        icon: string;
        title: string;
        text: string;
        titleColor: number;
        color: number;
        titleFontSize: number;
        editable: boolean;
        getTextField(): GTextField;
        protected constructExtension(buffer: ByteBuffer): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare module fairygui {
    class GList extends GComponent {
        /**
        * itemRenderer(number number, GObject item);
        */
        itemRenderer: Function;
        /**
         * itemProvider(index:number):string;
        */
        itemProvider: Function;
        callbackThisObj: any;
        scrollItemToViewOnClick: boolean;
        foldInvisibleItems: boolean;
        private _layout;
        private _lineCount;
        private _columnCount;
        private _lineGap;
        private _columnGap;
        private _defaultItem;
        private _autoResizeItem;
        private _selectionMode;
        private _align;
        private _verticalAlign;
        private _selectionController;
        private _lastSelectedIndex;
        private _pool;
        private _virtual;
        private _loop;
        private _numItems;
        private _realNumItems;
        private _firstIndex;
        private _curLineItemCount;
        private _curLineItemCount2;
        private _itemSize;
        private _virtualListChanged;
        private _virtualItems;
        private _eventLocked;
        private itemInfoVer;
        constructor();
        dispose(): void;
        layout: ListLayoutType;
        lineCount: number;
        columnCount: number;
        lineGap: number;
        columnGap: number;
        align: AlignType;
        verticalAlign: VertAlignType;
        virtualItemSize: egret.Point;
        defaultItem: string;
        autoResizeItem: boolean;
        selectionMode: ListSelectionMode;
        selectionController: Controller;
        readonly itemPool: GObjectPool;
        getFromPool(url?: string): GObject;
        returnToPool(obj: GObject): void;
        addChildAt(child: GObject, index?: number): GObject;
        addItem(url?: string): GObject;
        addItemFromPool(url?: string): GObject;
        removeChildAt(index: number, dispose?: boolean): GObject;
        removeChildToPoolAt(index?: number): void;
        removeChildToPool(child: GObject): void;
        removeChildrenToPool(beginIndex?: number, endIndex?: number): void;
        selectedIndex: number;
        getSelection(): Array<number>;
        addSelection(index: number, scrollItToView?: boolean): void;
        removeSelection(index: number): void;
        clearSelection(): void;
        private clearSelectionExcept(g);
        selectAll(): void;
        selectNone(): void;
        selectReverse(): void;
        handleArrowKey(dir?: number): void;
        private __clickItem(evt);
        private setSelectionOnEvent(item);
        resizeToFit(itemCount?: number, minSize?: number): void;
        getMaxItemWidth(): number;
        protected handleSizeChanged(): void;
        handleControllerChanged(c: Controller): void;
        private updateSelectionController(index);
        getSnappingPosition(xValue: number, yValue: number, resultPoint?: egret.Point): egret.Point;
        scrollToView(index: number, ani?: boolean, setFirst?: boolean): void;
        getFirstChildInView(): number;
        childIndexToItemIndex(index: number): number;
        itemIndexToChildIndex(index: number): number;
        setVirtual(): void;
        setVirtualAndLoop(): void;
        private _setVirtual(loop);
        numItems: number;
        refreshVirtualList(): void;
        private checkVirtualList();
        private setVirtualListChangedFlag(layoutChanged?);
        private _refreshVirtualList();
        private __scrolled(evt);
        private getIndexOnPos1(forceUpdate);
        private getIndexOnPos2(forceUpdate);
        private getIndexOnPos3(forceUpdate);
        private handleScroll(forceUpdate);
        private static pos_param;
        private handleScroll1(forceUpdate);
        private handleScroll2(forceUpdate);
        private handleScroll3(forceUpdate);
        private handleArchOrder1();
        private handleArchOrder2();
        private handleAlign(contentWidth, contentHeight);
        protected updateBounds(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare module fairygui {
    class UISprite extends egret.Sprite {
        private _hitArea;
        constructor();
        hitArea: egret.Rectangle;
        $hitTest(stageX: number, stageY: number): egret.DisplayObject;
    }
}
declare module fairygui {
    class GLoader extends GObject {
        private _gearAnimation;
        private _gearColor;
        private _url;
        private _align;
        private _verticalAlign;
        private _autoSize;
        private _fill;
        private _shrinkOnly;
        private _showErrorSign;
        private _playing;
        private _frame;
        private _color;
        private _contentItem;
        private _contentSourceWidth;
        private _contentSourceHeight;
        private _contentWidth;
        private _contentHeight;
        private _container;
        private _content;
        private _errorSign;
        private _content2;
        private _updatingLayout;
        private static _errorSignPool;
        constructor();
        protected createDisplayObject(): void;
        dispose(): void;
        url: string;
        icon: string;
        align: AlignType;
        verticalAlign: VertAlignType;
        fill: LoaderFillType;
        shrinkOnly: boolean;
        autoSize: boolean;
        playing: boolean;
        frame: number;
        timeScale: number;
        advance(timeInMiniseconds: number): void;
        color: number;
        private applyColor();
        showErrorSign: boolean;
        readonly content: egret.Bitmap | fairygui.MovieClip;
        readonly component: GComponent;
        texture: egret.Texture;
        protected loadContent(): void;
        protected loadFromPackage(itemURL: string): void;
        private switchToMovieMode(value);
        protected loadExternal(): void;
        protected freeExternal(texture: egret.Texture): void;
        protected onExternalLoadSuccess(texture: egret.Texture): void;
        protected onExternalLoadFailed(): void;
        private __getResCompleted(res, key);
        private setErrorState();
        private clearErrorState();
        private updateLayout();
        private clearContent();
        protected handleSizeChanged(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare module fairygui {
    class GMovieClip extends GObject {
        private _movieClip;
        constructor();
        color: number;
        protected createDisplayObject(): void;
        playing: boolean;
        frame: number;
        timeScale: number;
        rewind(): void;
        syncStatus(anotherMc: GMovieClip): void;
        advance(timeInMiniseconds: number): void;
        setPlaySettings(start?: number, end?: number, times?: number, endAt?: number, endCallback?: Function, callbackObj?: any): void;
        constructFromResource(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare module fairygui {
    class GProgressBar extends GComponent {
        private _max;
        private _value;
        private _titleType;
        private _reverse;
        private _titleObject;
        private _aniObject;
        private _barObjectH;
        private _barObjectV;
        private _barMaxWidth;
        private _barMaxHeight;
        private _barMaxWidthDelta;
        private _barMaxHeightDelta;
        private _barStartX;
        private _barStartY;
        private _tweening;
        constructor();
        titleType: ProgressTitleType;
        max: number;
        value: number;
        tweenValue(value: number, duration: number): GTweener;
        update(newValue: number): void;
        protected constructExtension(buffer: ByteBuffer): void;
        protected handleSizeChanged(): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        dispose(): void;
    }
}
declare module fairygui {
    class BitmapFont {
        id: string;
        size: number;
        ttf: boolean;
        glyphs: any;
        resizable: boolean;
        constructor();
    }
}
declare module fairygui {
    class GRichTextField extends GTextField {
        constructor();
        protected updateTextFieldText(): void;
    }
}
declare module fairygui {
    class GRoot extends GComponent {
        private _nativeStage;
        private _modalLayer;
        private _popupStack;
        private _justClosedPopups;
        private _modalWaitPane;
        private _focusedObject;
        private _tooltipWin;
        private _defaultTooltipWin;
        private _volumeScale;
        private static _inst;
        static touchScreen: boolean;
        static contentScaleFactor: number;
        static touchDown: boolean;
        static ctrlKeyDown: boolean;
        static shiftKeyDown: boolean;
        static mouseX: number;
        static mouseY: number;
        static FOCUS_CHANGED: string;
        static readonly inst: GRoot;
        constructor();
        readonly nativeStage: egret.Stage;
        showWindow(win: Window): void;
        hideWindow(win: Window): void;
        hideWindowImmediately(win: Window): void;
        bringToFront(win: Window): void;
        showModalWait(msg?: string): void;
        closeModalWait(): void;
        closeAllExceptModals(): void;
        closeAllWindows(): void;
        getTopWindow(): Window;
        readonly modalLayer: GGraph;
        readonly hasModalWindow: boolean;
        readonly modalWaiting: boolean;
        showPopup(popup: GObject, target?: GObject, downward?: any): void;
        togglePopup(popup: GObject, target?: GObject, downward?: any): void;
        hidePopup(popup?: GObject): void;
        readonly hasAnyPopup: boolean;
        private closePopup(target);
        showTooltips(msg: string): void;
        showTooltipsWin(tooltipWin: GObject, position?: egret.Point): void;
        hideTooltips(): void;
        getObjectUnderPoint(globalX: number, globalY: number): GObject;
        focus: GObject;
        private setFocus(value);
        volumeScale: number;
        playOneShotSound(sound: egret.Sound, volumeScale?: number): void;
        private adjustModalLayer();
        private __addedToStage(evt);
        private __stageMouseDownCapture(evt);
        private __stageMouseMoveCapture(evt);
        private __stageMouseUpCapture(evt);
        private __winResize(evt);
    }
}
declare module fairygui {
    class Margin {
        left: number;
        right: number;
        top: number;
        bottom: number;
        constructor();
        copy(source: Margin): void;
    }
}
declare module fairygui {
    class GTimers {
        private _items;
        private _itemPool;
        private _enumI;
        private _enumCount;
        private _lastTime;
        static deltaTime: number;
        static time: number;
        static inst: GTimers;
        private static FPS24;
        constructor();
        private getItem();
        private findItem(callback, thisObj);
        add(delayInMiniseconds: number, repeat: number, callback: Function, thisObj: any, callbackParam?: any): void;
        callLater(callback: Function, thisObj: any, callbackParam?: any): void;
        callDelay(delay: number, callback: Function, thisObj: any, callbackParam?: any): void;
        callBy24Fps(callback: Function, thisObj: any, callbackParam?: any): void;
        exists(callback: Function, thisObj: any): boolean;
        remove(callback: Function, thisObj: any): void;
        private __timer(timeStamp);
    }
}
declare module fairygui {
    class GScrollBar extends GComponent {
        private _grip;
        private _arrowButton1;
        private _arrowButton2;
        private _bar;
        private _target;
        private _vertical;
        private _scrollPerc;
        private _fixedGripSize;
        private _dragOffset;
        constructor();
        setScrollPane(target: ScrollPane, vertical: boolean): void;
        displayPerc: number;
        scrollPerc: number;
        readonly minSize: number;
        protected constructExtension(buffer: ByteBuffer): void;
        private __gripMouseDown(evt);
        private static sScrollbarHelperPoint;
        private __gripMouseMove(evt);
        private __gripMouseUp(evt);
        private __arrowButton1Click(evt);
        private __arrowButton2Click(evt);
        private __barMouseDown(evt);
    }
}
declare module fairygui {
    class GSlider extends GComponent {
        private _max;
        private _value;
        private _titleType;
        private _reverse;
        private _titleObject;
        private _barObjectH;
        private _barObjectV;
        private _barMaxWidth;
        private _barMaxHeight;
        private _barMaxWidthDelta;
        private _barMaxHeightDelta;
        private _gripObject;
        private _clickPos;
        private _clickPercent;
        private _barStartX;
        private _barStartY;
        changeOnClick: boolean;
        canDrag: boolean;
        constructor();
        titleType: ProgressTitleType;
        max: number;
        value: number;
        update(): void;
        private updateWidthPercent(percent);
        protected constructExtension(buffer: ByteBuffer): void;
        protected handleSizeChanged(): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        private __gripMouseDown(evt);
        private static sSilderHelperPoint;
        private __gripMouseMove(evt);
        private __gripMouseUp(evt);
        private __barMouseDown(evt);
    }
}
declare module fairygui {
    class GTextInput extends GTextField {
        private _changed;
        private _promptText;
        private _password;
        constructor();
        dispose(): void;
        editable: boolean;
        maxLength: number;
        promptText: string;
        restrict: string;
        password: boolean;
        verticalAlign: VertAlignType;
        private updateVertAlign();
        protected updateTextFieldText(): void;
        protected handleSizeChanged(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        private __textChanged(evt);
        private __focusIn(evt);
        private __focusOut(evt);
    }
}
declare module fairygui {
    interface IUISource {
        fileName: string;
        loaded: boolean;
        load(callback: Function, thisObj: any): void;
    }
}
declare module fairygui {
    class PageOption {
        private _controller;
        private _id;
        constructor();
        controller: Controller;
        index: number;
        name: string;
        clear(): void;
        id: string;
    }
}
declare module fairygui {
    class PopupMenu {
        protected _contentPane: GComponent;
        protected _list: GList;
        constructor(resourceURL?: string);
        dispose(): void;
        addItem(caption: string, callback?: Function): GButton;
        addItemAt(caption: string, index: number, callback?: Function): GButton;
        addSeperator(): void;
        getItemName(index: number): string;
        setItemText(name: string, caption: string): void;
        setItemVisible(name: string, visible: boolean): void;
        setItemGrayed(name: string, grayed: boolean): void;
        setItemCheckable(name: string, checkable: boolean): void;
        setItemChecked(name: string, checked: boolean): void;
        isItemChecked(name: string): boolean;
        removeItem(name: string): boolean;
        clearItems(): void;
        readonly itemCount: number;
        readonly contentPane: GComponent;
        readonly list: GList;
        show(target?: GObject, downward?: any): void;
        private __clickItem(evt);
        private __clickItem2(evt);
        private __addedToStage(evt);
    }
}
declare module fairygui {
    class RelationItem {
        private _owner;
        private _target;
        private _defs;
        private _targetX;
        private _targetY;
        private _targetWidth;
        private _targetHeight;
        constructor(owner: GObject);
        readonly owner: GObject;
        target: GObject;
        add(relationType: number, usePercent: boolean): void;
        internalAdd(relationType: number, usePercent: boolean): void;
        remove(relationType?: number): void;
        copyFrom(source: RelationItem): void;
        dispose(): void;
        readonly isEmpty: boolean;
        applyOnSelfResized(dWidth: number, dHeight: number, applyPivot: boolean): void;
        private applyOnXYChanged(info, dx, dy);
        private applyOnSizeChanged(info);
        private addRefTarget(target);
        private releaseRefTarget(target);
        private __targetXYChanged(evt);
        private __targetSizeChanged(evt);
        private __targetSizeWillChange(evt);
    }
    class RelationDef {
        percent: boolean;
        type: number;
        axis: number;
        constructor();
        copyFrom(source: RelationDef): void;
    }
}
declare module fairygui {
    class Relations {
        private _owner;
        private _items;
        handling: GObject;
        sizeDirty: boolean;
        constructor(owner: GObject);
        add(target: GObject, relationType: number, usePercent?: boolean): void;
        remove(target: GObject, relationType?: number): void;
        contains(target: GObject): boolean;
        clearFor(target: GObject): void;
        clearAll(): void;
        copyFrom(source: Relations): void;
        dispose(): void;
        onOwnerSizeChanged(dWidth: number, dHeight: number, applyPivot: boolean): void;
        ensureRelationsSizeCorrect(): void;
        readonly empty: boolean;
        setup(buffer: ByteBuffer, parentToChild: boolean): void;
    }
}
declare module fairygui {
    class ScrollPane extends egret.EventDispatcher {
        private _owner;
        private _container;
        private _maskContainer;
        private _alignContainer;
        private _scrollType;
        private _scrollStep;
        private _mouseWheelStep;
        private _decelerationRate;
        private _scrollBarMargin;
        private _bouncebackEffect;
        private _touchEffect;
        private _scrollBarDisplayAuto;
        private _vScrollNone;
        private _hScrollNone;
        private _needRefresh;
        private _refreshBarAxis;
        private _displayOnLeft;
        private _snapToItem;
        private _displayInDemand;
        private _mouseWheelEnabled;
        private _pageMode;
        private _inertiaDisabled;
        private _maskDisabled;
        private _xPos;
        private _yPos;
        private _viewSize;
        private _contentSize;
        private _overlapSize;
        private _pageSize;
        private _containerPos;
        private _beginTouchPos;
        private _lastTouchPos;
        private _lastTouchGlobalPos;
        private _velocity;
        private _velocityScale;
        private _lastMoveTime;
        private _isHoldAreaDone;
        private _aniFlag;
        private _scrollBarVisible;
        _loop: number;
        private _headerLockedSize;
        private _footerLockedSize;
        private _refreshEventDispatching;
        private _tweening;
        private _tweenTime;
        private _tweenDuration;
        private _tweenStart;
        private _tweenChange;
        private _pageController;
        private _hzScrollBar;
        private _vtScrollBar;
        private _header;
        private _footer;
        isDragged: boolean;
        static draggingPane: ScrollPane;
        private static _gestureFlag;
        static SCROLL: string;
        static SCROLL_END: string;
        static PULL_DOWN_RELEASE: string;
        static PULL_UP_RELEASE: string;
        static TWEEN_TIME_GO: number;
        static TWEEN_TIME_DEFAULT: number;
        static PULL_RATIO: number;
        private static sHelperPoint;
        private static sHelperRect;
        private static sEndPos;
        private static sOldChange;
        constructor(owner: GComponent);
        setup(buffer: ByteBuffer): void;
        dispose(): void;
        readonly owner: GComponent;
        readonly hzScrollBar: GScrollBar;
        readonly vtScrollBar: GScrollBar;
        readonly header: GComponent;
        readonly footer: GComponent;
        bouncebackEffect: boolean;
        touchEffect: boolean;
        scrollStep: number;
        decelerationRate: number;
        snapToItem: boolean;
        percX: number;
        setPercX(value: number, ani?: boolean): void;
        percY: number;
        setPercY(value: number, ani?: boolean): void;
        posX: number;
        setPosX(value: number, ani?: boolean): void;
        posY: number;
        setPosY(value: number, ani?: boolean): void;
        readonly contentWidth: number;
        readonly contentHeight: number;
        viewWidth: number;
        viewHeight: number;
        currentPageX: number;
        currentPageY: number;
        setCurrentPageX(value: number, ani: boolean): void;
        setCurrentPageY(value: number, ani: boolean): void;
        readonly isBottomMost: boolean;
        readonly isRightMost: boolean;
        pageController: Controller;
        readonly scrollingPosX: number;
        readonly scrollingPosY: number;
        scrollTop(ani?: boolean): void;
        scrollBottom(ani?: boolean): void;
        scrollUp(ratio?: number, ani?: boolean): void;
        scrollDown(ratio?: number, ani?: boolean): void;
        scrollLeft(ratio?: number, ani?: boolean): void;
        scrollRight(ratio?: number, ani?: boolean): void;
        scrollToView(target: any, ani?: boolean, setFirst?: boolean): void;
        isChildInView(obj: GObject): boolean;
        cancelDragging(): void;
        lockHeader(size: number): void;
        lockFooter(size: number): void;
        onOwnerSizeChanged(): void;
        handleControllerChanged(c: Controller): void;
        private updatePageController();
        adjustMaskContainer(): void;
        setSize(aWidth: number, aHeight: number): void;
        setContentSize(aWidth: number, aHeight: number): void;
        changeContentSizeOnScrolling(deltaWidth: number, deltaHeight: number, deltaPosX: number, deltaPosY: number): void;
        private handleSizeChanged(onScrolling?);
        private posChanged(ani);
        private refresh();
        private refresh2();
        private syncScrollBar(end?);
        private __touchBegin(evt);
        private __touchMove(evt);
        private __touchEnd(evt);
        private __touchTap(evt);
        private __rollOver(evt);
        private __rollOut(evt);
        private showScrollBar(val);
        private __showScrollBar(val);
        private getLoopPartSize(division, axis);
        private loopCheckingCurrent();
        private loopCheckingTarget(endPos);
        private loopCheckingTarget2(endPos, axis);
        private loopCheckingNewPos(value, axis);
        private alignPosition(pos, inertialScrolling);
        private alignByPage(pos, axis, inertialScrolling);
        private updateTargetAndDuration(orignPos, resultPos);
        private updateTargetAndDuration2(pos, axis);
        private fixDuration(axis, oldChange);
        private killTween();
        private checkRefreshBar();
        private tweenUpdate(timestamp);
        private runTween(axis);
        private static easeFunc(t, d);
    }
}
declare module fairygui {
    class UIConfig {
        constructor();
        static defaultFont: string;
        static windowModalWaiting: string;
        static globalModalWaiting: string;
        static modalLayerColor: number;
        static modalLayerAlpha: number;
        static buttonSound: string;
        static buttonSoundVolumeScale: number;
        static horizontalScrollBar: string;
        static verticalScrollBar: string;
        static defaultScrollStep: number;
        static defaultScrollDecelerationRate: number;
        static defaultScrollBarDisplay: number;
        static defaultScrollTouchEffect: boolean;
        static defaultScrollBounceEffect: boolean;
        static popupMenu: string;
        static popupMenu_seperator: string;
        static loaderErrorSign: string;
        static tooltipsWin: string;
        static defaultComboBoxVisibleItemCount: number;
        static touchScrollSensitivity: number;
        static touchDragSensitivity: number;
        static clickDragSensitivity: number;
        static bringWindowToFrontOnClick: boolean;
        static frameTimeForAsyncUIConstruction: number;
    }
}
declare module fairygui {
    class UIObjectFactory {
        static packageItemExtensions: any;
        private static loaderType;
        constructor();
        static setPackageItemExtension(url: string, type: any): void;
        static setLoaderExtension(type: any): void;
        static resolvePackageItemExtension(pi: PackageItem): void;
        static newObject(pi: PackageItem): GObject;
        static newObject2(type: ObjectType): GObject;
    }
}
declare module fairygui {
    class UIPackage {
        private _id;
        private _name;
        private _items;
        private _itemsById;
        private _itemsByName;
        private _customId;
        private _sprites;
        static _constructing: number;
        private static _packageInstById;
        private static _packageInstByName;
        constructor();
        static getById(id: string): UIPackage;
        static getByName(name: string): UIPackage;
        static addPackage(resKey: string, descData?: ArrayBuffer): UIPackage;
        static removePackage(packageId: string): void;
        static createObject(pkgName: string, resName: string, userClass?: any): GObject;
        static createObjectFromURL(url: string, userClass?: any): GObject;
        static getItemURL(pkgName: string, resName: string): string;
        static getItemByURL(url: string): PackageItem;
        static normalizeURL(url: string): string;
        static setStringsSource(source: string): void;
        private loadPackage(buffer, resKey);
        dispose(): void;
        readonly id: string;
        readonly name: string;
        customId: string;
        createObject(resName: string, userClass?: any): GObject;
        internalCreateObject(item: fairygui.PackageItem, userClass?: any): GObject;
        getItemById(itemId: string): PackageItem;
        getItemByName(resName: string): PackageItem;
        getItemAssetByName(resName: string): any;
        getItemAsset(item: PackageItem): any;
        private createSpriteTexture(sprite);
        private createSubTexture(atlasTexture, uvRect);
        private loadMovieClip(item);
        private loadFont(item);
    }
}
declare module fairygui {
    class Window extends GComponent {
        private _contentPane;
        private _modalWaitPane;
        private _closeButton;
        private _dragArea;
        private _contentArea;
        private _frame;
        private _modal;
        private _uiSources;
        private _inited;
        private _loading;
        protected _requestingCmd: number;
        bringToFontOnClick: boolean;
        constructor();
        addUISource(source: IUISource): void;
        contentPane: GComponent;
        readonly frame: GComponent;
        closeButton: GObject;
        dragArea: GObject;
        contentArea: GObject;
        show(): void;
        showOn(root: GRoot): void;
        hide(): void;
        hideImmediately(): void;
        centerOn(r: GRoot, restraint?: boolean): void;
        toggleStatus(): void;
        readonly isShowing: boolean;
        readonly isTop: boolean;
        modal: boolean;
        bringToFront(): void;
        showModalWait(requestingCmd?: number): void;
        protected layoutModalWaitPane(): void;
        closeModalWait(requestingCmd?: number): boolean;
        readonly modalWaiting: boolean;
        init(): void;
        protected onInit(): void;
        protected onShown(): void;
        protected onHide(): void;
        protected doShowAnimation(): void;
        protected doHideAnimation(): void;
        private __uiLoadComplete();
        private _init();
        dispose(): void;
        protected closeEventHandler(evt: egret.Event): void;
        private __onShown(evt);
        private __onHidden(evt);
        private __mouseDown(evt);
        private __dragStart(evt);
    }
}
declare module fairygui {
    class DragDropManager {
        private _agent;
        private _sourceData;
        private static _inst;
        static readonly inst: DragDropManager;
        constructor();
        readonly dragAgent: fairygui.GObject;
        readonly dragging: boolean;
        startDrag(source: fairygui.GObject, icon: string, sourceData: any, touchPointID?: number): void;
        cancel(): void;
        private __dragEnd(evt);
    }
}
declare module fairygui {
    class AsyncOperation {
        /**
         * callback(obj:GObject)
         */
        callback: Function;
        callbackObj: any;
        private _itemList;
        private _objectPool;
        private _index;
        constructor();
        createObject(pkgName: string, resName: string): void;
        createObjectFromURL(url: string): void;
        cancel(): void;
        private internalCreateObject(item);
        private collectComponentChildren(item);
        private collectListChildren(buffer);
        private run();
    }
}
declare module fairygui {
    class TranslationHelper {
        static strings: Object;
        static loadFromXML(source: string): void;
        static translateComponent(item: PackageItem): void;
    }
}
declare module fairygui {
    class ByteBuffer extends egret.ByteArray {
        stringTable: Array<string>;
        version: number;
        constructor(buffer?: ArrayBuffer | Uint8Array, bufferExtSize?: number);
        skip(count: number): void;
        readBool(): boolean;
        readS(): string;
        writeS(value: string): void;
        readColor(hasAlpha?: boolean): number;
        readChar(): string;
        readBuffer(): ByteBuffer;
        seek(indexTablePos: number, blockIndex: number): boolean;
    }
}
