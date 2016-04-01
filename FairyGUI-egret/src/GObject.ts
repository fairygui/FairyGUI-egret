
module fairygui {

    export class GObject extends egret.EventDispatcher {
        public data: any;

        private _x: number = 0;
        private _y: number = 0;
        private _width: number = 0;
        private _height: number = 0;
        private _pivotX: number = 0;
        private _pivotY: number = 0;
        private _alpha: number = 1;
        private _rotation: number = 0;
        private _visible: boolean = true;
        private _touchable: boolean = true;
        private _grayed: boolean = false;
        private _draggable: boolean = false;
        private _scaleX: number = 1;
        private _scaleY: number = 1;
        private _pivotOffsetX: number = 0;
        private _pivotOffsetY: number = 0;
        private _sortingOrder: number = 0;
        private _internalVisible: number = 1;
        private _focusable: boolean = false;
        private _tooltips: string;

        private _relations: Relations;
        private _group: GGroup;
        private _gearDisplay: GearDisplay;
        private _gearXY: GearXY;
        private _gearSize: GearSize;
        private _gearLook: GearLook;
        private _displayObject: egret.DisplayObject;
        private _dragBounds: egret.Rectangle;

        public _parent: GComponent;
        public _rawWidth: number = 0;
        public _rawHeight: number = 0;
        public _sourceWidth: number = 0;
        public _sourceHeight: number = 0;
        public _initWidth: number = 0;
        public _initHeight: number = 0;
        public _id: string;
        public _name: string;
        public _packageItem: PackageItem;
        public _underConstruct: boolean;
        public _constructingData: any;
        public _gearLocked: boolean;

        public static _gInstanceCounter: number = 0;

        public static XY_CHANGED: string = "__xyChanged";
        public static SIZE_CHANGED: string = "__sizeChanged";
        public static SIZE_DELAY_CHANGE: string = "__sizeDelayChange";

        public constructor() {
            super();

            this._id = "" + GObject._gInstanceCounter++;
            this._name = "";

            this.createDisplayObject();

            this._relations = new Relations(this);

            this._gearDisplay = new GearDisplay(this);
            this._gearXY = new GearXY(this);
            this._gearSize = new GearSize(this);
            this._gearLook = new GearLook(this);
        }

        public get id(): string {
            return this._id;
        }

        public get name(): string {
            return this._name;
        }

        public set name(value: string) {
            this._name = value;
        }

        public get x(): number {
            return this._x;
        }

        public set x(value: number) {
            this.setXY(value,this._y);
        }

        public get y(): number {
            return this._y;
        }

        public set y(value: number) {
            this.setXY(this._x,value);
        }

        public setXY(xv: number,yv: number): void {
            if(this._x != xv || this._y != yv) {
                var dx: number = xv - this._x;
                var dy: number = yv - this._y;
                this._x = xv;
                this._y = yv;

                this.handleXYChanged();
                if(this instanceof GGroup)
                    (<GGroup><any>this).moveChildren(dx,dy);

                if(this._gearXY.controller)
                    this._gearXY.updateState();
                    
                if(this._parent && !(this._parent instanceof GList)) {
                    this._parent.setBoundsChangedFlag();
                    this.dispatchEventWith(GObject.XY_CHANGED);
                }
            }
        }

        public center(restraint: boolean = false): void {
            var r: GComponent;
            if(this._parent != null)
                r = this.parent;
            else
                r = this.root;

            this.setXY((r.width - this.width) / 2,(r.height - this.height) / 2);
            if(restraint) {
                this.addRelation(r,RelationType.Center_Center);
                this.addRelation(r,RelationType.Middle_Middle);
            }
        }

        public get width(): number {
            this.ensureSizeCorrect();
            if(this._relations.sizeDirty)
                this._relations.ensureRelationsSizeCorrect();
            return this._width;
        }

        public set width(value: number) {
            this.setSize(value,this._rawHeight);
        }

        public get height(): number {
            this.ensureSizeCorrect();
            if(this._relations.sizeDirty)
                this._relations.ensureRelationsSizeCorrect();
            return this._height;
        }

        public set height(value: number) {
            this.setSize(this._rawWidth,value);
        }

        public setSize(wv: number,hv: number,ignorePivot: boolean = false): void {
            if(this._rawWidth != wv || this._rawHeight != hv) {
                this._rawWidth = wv;
                this._rawHeight = hv;
                if(wv < 0)
                    wv = 0;
                if(hv < 0)
                    hv = 0;
                var dWidth: number = wv - this._width;
                var dHeight: number = hv - this._height;
                this._width = wv;
                this._height = hv;

                if((this._pivotX != 0 || this._pivotY != 0) && this.sourceWidth != 0 && this.sourceHeight != 0) {
                    if(!ignorePivot)
                        this.setXY(this.x - this._pivotX * dWidth / this.sourceWidth,
                            this.y - this._pivotY * dHeight / this.sourceHeight);
                    this.applyPivot();
                }

                this.handleSizeChanged();

                if(this._gearSize.controller)
                    this._gearSize.updateState();

                if(this._parent) {
                    this._relations.onOwnerSizeChanged(dWidth,dHeight);
                    this._parent.setBoundsChangedFlag();
                }

                this.dispatchEventWith(GObject.SIZE_CHANGED);
            }
        }

        public ensureSizeCorrect(): void {
        }

        public get sourceHeight(): number {
            return this._sourceHeight;
        }

        public get sourceWidth(): number {
            return this._sourceWidth;
        }

        public get initHeight(): number {
            return this._initHeight;
        }

        public get initWidth(): number {
            return this._initWidth;
        }

        public get actualWidth(): number {
            return this.width * this._scaleX;
        }
        
        public get actualHeight(): number {
            return this.height * this._scaleY;
        }

        public get scaleX(): number {
            return this._scaleX;
        }

        public set scaleX(value: number) {
            this.setScale(value,this._scaleY);
        }

        public get scaleY(): number {
            return this._scaleY;
        }

        public set scaleY(value: number) {
            this.setScale(this._scaleX,value);
        }

        public setScale(sx: number,sy: number) {
            if(this._scaleX != sx || this._scaleY != sy) {
                this._scaleX = sx;
                this._scaleY = sy;
                this.applyPivot();
                this.handleSizeChanged();

                if(this._gearSize.controller)
                    this._gearSize.updateState();
            }
        }

        public get pivotX(): number {
            return this._pivotX;
        }

        public set pivotX(value: number) {
            this.setPivot(value,this._pivotY);
        }

        public get pivotY(): number {
            return this._pivotY;
        }

        public set pivotY(value: number) {
            this.setPivot(this._pivotX,value);
        }

        public setPivot(xv: number,yv: number = 0): void {
            if(this._pivotX != xv || this._pivotY != yv) {
                this._pivotX = xv;
                this._pivotY = yv;

                this.applyPivot();
            }
        }

        private applyPivot(): void {
            var ox: number = this._pivotOffsetX;
            var oy: number = this._pivotOffsetY;
            if(this._pivotX != 0 || this._pivotY != 0) {
                var rot: number = this.normalizeRotation;
                if(rot != 0 || this._scaleX != 1 || this._scaleY != 1) {
                    var rotInRad: number = rot * Math.PI / 180;
                    var cos: number = Math.cos(rotInRad);
                    var sin: number = Math.sin(rotInRad);
                    var a: number = this._scaleX * cos;
                    var b: number = this._scaleX * sin;
                    var c: number = this._scaleY * -sin;
                    var d: number = this._scaleY * cos;
                    var sx: number = this.sourceWidth != 0 ? (this._width / this.sourceWidth) : 1;
                    var sy: number = this.sourceHeight != 0 ? (this._height / this.sourceHeight) : 1;
                    var px: number = this._pivotX * sx;
                    var py: number = this._pivotY * sy;
                    this._pivotOffsetX = px - (a * px + c * py);
                    this._pivotOffsetY = py - (d * py + b * px);
                }
                else {
                    this._pivotOffsetX = 0;
                    this._pivotOffsetY = 0;
                }
            }
            else {
                this._pivotOffsetX = 0;
                this._pivotOffsetY = 0;
            }
            if(ox != this._pivotOffsetX || oy != this._pivotOffsetY)
                this.handleXYChanged();
        }

        public get touchable(): boolean {
            return this._touchable;
        }

        public set touchable(value: boolean) {
            this._touchable = value;
            if((this instanceof GImage) || (this instanceof GMovieClip)
                || (this instanceof GTextField) && !(this instanceof GTextInput) && !(this instanceof GRichTextField))
                //Touch is not supported by GImage/GMovieClip/GTextField
                return;

            if(this._displayObject != null) {
                this._displayObject.touchEnabled = this._touchable;
                if(this._displayObject instanceof egret.DisplayObjectContainer)
                    (<egret.DisplayObjectContainer>this._displayObject).touchChildren = this._touchable;
            }
        }

        public get grayed(): boolean {
            return this._grayed;
        }

        public set grayed(value: boolean) {
            if(this._grayed != value) {
                this._grayed = value;
                this.handleGrayChanged();
            }
        }

        public get enabled(): boolean {
            return !this._grayed && this._touchable;
        }

        public set enabled(value: boolean) {
            this.grayed = !value;
            this.touchable = value;
        }

        public get rotation(): number {
            return this._rotation;
        }

        public set rotation(value: number) {
            if(this._rotation != value) {
                this._rotation = value;
                this.applyPivot();
                if(this._displayObject)
                    this._displayObject.rotation = this.normalizeRotation;
                    
                if(this._gearLook.controller)
                    this._gearLook.updateState();
            }
        }

        public get normalizeRotation(): number {
            var rot: number = this._rotation % 360;
            if(rot > 180)
                rot = rot - 360;
            else if(rot < -180)
                rot = 360 + rot;
            return rot;
        }

        public get alpha(): number {
            return this._alpha;
        }

        public set alpha(value: number) {
            if(this._alpha!=value) {
                this._alpha = value;
                this.updateAlpha();
             }
        }
        
        protected updateAlpha():void {
            if(this._displayObject)
                this._displayObject.alpha = this._alpha;

            if(this._gearLook.controller)
                this._gearLook.updateState();
        }

        public get visible(): boolean {
            return this._visible;
        }

        public set visible(value: boolean) {
            if (this._visible != value) {
                this._visible = value;
                if (this._displayObject)
                    this._displayObject.visible = this._visible;
                if (this._parent)
                    this._parent.childStateChanged(this);
            }
        }

        public set internalVisible(value: number) {
            if(value < 0)
                value = 0;
            var oldValue: boolean = this._internalVisible > 0;
            var newValue: boolean = value > 0;
            this._internalVisible = value;
            if(oldValue != newValue) {
                if(this._parent)
                    this._parent.childStateChanged(this);
            }
        }
        
        public get internalVisible(): number {
            return this._internalVisible;
        }

        public get finalVisible(): boolean {
            return this._visible && this._internalVisible>0 && (!this._group || this._group.finalVisible);
        }

        public get sortingOrder(): number {
            return this._sortingOrder;
        }

        public set sortingOrder(value: number) {
            if (value < 0)
                value = 0;
            if (this._sortingOrder != value) {
                var old: number = this._sortingOrder;
                this._sortingOrder = value;
                if (this._parent != null)
                    this._parent.childSortingOrderChanged(this, old, this._sortingOrder);
            }
        }

        public get focusable(): boolean {
            return this._focusable;
        }

        public set focusable(value: boolean) {
            this._focusable = value;
        }

        public get focused(): boolean {
            return this.root.focus == this;
        }

        public requestFocus(): void {
            var p: GObject = this;
            while (p && !p._focusable)
                p = p.parent;
            if (p != null)
                this.root.focus = p;
        }

        public get tooltips(): string {
            return this._tooltips;
        }

        public set tooltips(value: string) {
            this._tooltips = value;
        }

        public get inContainer(): boolean {
            return this._displayObject != null && this._displayObject.parent != null;
        }

        public get onStage(): boolean {
            return this._displayObject != null && this._displayObject.stage != null;
        }

        public get resourceURL(): string {
            if (this._packageItem != null)
                return "ui://" + this._packageItem.owner.id + this._packageItem.id;
            else
                return null;
        }

        public set group(value: GGroup) {
            this._group = value;
        }

        public get group(): GGroup {
            return this._group;
        }

        public get gearDisplay(): GearDisplay {
            return this._gearDisplay;
        }

        public get gearXY(): GearXY {
            return this._gearXY;
        }

        public get gearSize(): GearSize {
            return this._gearSize;
        }
        
        public get gearLook(): GearLook {
            return this._gearLook;
        }

        public get relations(): Relations {
            return this._relations;
        }

        public addRelation(target: GObject, relationType: number, usePercent: boolean = false): void {
            this._relations.add(target, relationType, usePercent);
        }

        public removeRelation(target: GObject, relationType: number = 0): void {
            this._relations.remove(target, relationType);
        }

        public get displayObject(): egret.DisplayObject {
            return this._displayObject;
        }

        protected setDisplayObject(value: egret.DisplayObject): void {
            this._displayObject = value;
        }

        public get parent(): GComponent {
            return this._parent;
        }

        public set parent(val: GComponent) {
            this._parent = val;
        }

        public removeFromParent(): void {
            if (this._parent)
                this._parent.removeChild(this);
        }

        public get root(): GRoot {
            if(this instanceof GRoot)
                return <GRoot><any>this;
                
            var p: GObject = this._parent;
            while (p) {
                if (p instanceof GRoot)
                    return <GRoot><any> p;
                p = p.parent;
            }
            return GRoot.inst;
        }
        
        public get asCom(): GComponent {
            return <GComponent><any> this;
        }

        public get asButton(): GButton {
            return <GButton><any> this;
        }

        public get asLabel(): GLabel {
            return <GLabel><any> this;
        }

        public get asProgress(): GProgressBar {
            return <GProgressBar><any> this;
        }

        public get asTextField(): GTextField {
            return <GTextField><any> this;
        }

        public get asRichTextField(): GRichTextField {
            return <GRichTextField><any> this;
        }

        public get asTextInput(): GTextInput {
            return <GTextInput><any> this;
        }

        public get asLoader(): GLoader {
            return <GLoader><any> this;
        }

        public get asList(): GList {
            return <GList><any> this;
        }

        public get asGraph(): GGraph {
            return <GGraph><any> this;
        }

        public get asGroup(): GGroup {
            return <GGroup><any> this;
        }

        public get asSlider(): GSlider {
            return <GSlider><any> this;
        }

        public get asComboBox(): GComboBox {
            return <GComboBox><any> this;
        }
        
        public get asImage(): GImage {
            return <GImage><any> this;
        }

        public get asMovieClip(): GMovieClip {
            return <GMovieClip><any> this;
        }

        public get text(): string {
            return null;
        }

        public set text(value: string) {
        }

        public dispose(): void {
            this.removeFromParent();
            this._relations.dispose();
        }

        public addClickListener(listener: Function, thisObj: any): void {
            this.addEventListener(egret.TouchEvent.TOUCH_TAP, listener, thisObj);
        }

        public removeClickListener(listener: Function, thisObj: any): void {
            this.removeEventListener(egret.TouchEvent.TOUCH_TAP, listener, thisObj);
        }

        public hasClickListener(): boolean {
            return this.hasEventListener(egret.TouchEvent.TOUCH_TAP);
        }

        public addEventListener(type: string, listener: Function, thisObject: any): void {
            super.addEventListener(type, listener, thisObject);

            if (this._displayObject != null) {
                this._displayObject.addEventListener(type, this._reDispatch, this);
            }
        }

        public removeEventListener(type: string, listener: Function, thisObject: any): void {
            super.removeEventListener(type, listener, thisObject);

            if (this._displayObject != null && !this.hasEventListener(type)) {
                this._displayObject.removeEventListener(type, this._reDispatch, this);
            }
        }

        private _reDispatch(evt: egret.Event): void {
            this.dispatchEvent(evt);
        }

        public get draggable(): boolean {
            return this._draggable;
        }

        public set draggable(value: boolean) {
            if (this._draggable != value) {
                this._draggable = value;
                this.initDrag();
            }
        }

        public get dragBounds(): egret.Rectangle {
            return this._dragBounds;
        }

        public set dragBounds(value: egret.Rectangle) {
            this._dragBounds = value;
        }

        public startDrag(touchPointID: number= -1): void {
            if (this._displayObject.stage == null)
                return;

            this.dragBegin(null);
        }

        public stopDrag(): void {
            this.dragEnd();
        }

        public get dragging(): boolean {
            return GObject.sDragging == this;
        }

        public localToGlobal(ax:number=0, ay:number=0, resultPoint?:egret.Point): egret.Point {
            return this._displayObject.localToGlobal(ax, ay, resultPoint);
        }

        public globalToLocal(ax:number=0, ay:number=0, resultPoint?:egret.Point): egret.Point {
            return this._displayObject.globalToLocal(ax, ay, resultPoint);
        }
        
        public localToRoot(ax: number = 0,ay: number = 0,resultPoint?: egret.Point): egret.Point {
            var pt: egret.Point = this._displayObject.localToGlobal(ax,ay,resultPoint);
            pt.x /= GRoot.contentScaleFactor;
            pt.y /= GRoot.contentScaleFactor;
            return pt;
        }

        public rootToLocal(ax: number = 0,ay: number = 0,resultPoint?: egret.Point): egret.Point {
            ax *= GRoot.contentScaleFactor;
            ay *= GRoot.contentScaleFactor;
            return this._displayObject.globalToLocal(ax,ay,resultPoint);
        }

        public localToGlobalRect(ax: number = 0,ay: number = 0,aWidth: number = 0,aHeight: number = 0,resultRect?: egret.Rectangle): egret.Rectangle {
            if(resultRect == null)
                resultRect = new egret.Rectangle();
            var pt: egret.Point = this.localToGlobal(ax,ay);
            resultRect.x = pt.x;
            resultRect.y = pt.y;
            pt = this.localToGlobal(ax + aWidth,ay + aHeight);
            resultRect.right = pt.x;
            resultRect.bottom = pt.y;
            return resultRect;
        }

        public globalToLocalRect(ax: number = 0,ay: number = 0,aWidth: number = 0,aHeight: number = 0,resultRect?: egret.Rectangle): egret.Rectangle {
            if(resultRect == null)
                resultRect = new egret.Rectangle();
            var pt: egret.Point = this.globalToLocal(ax,ay);
            resultRect.x = pt.x;
            resultRect.y = pt.y;
            pt = this.globalToLocal(ax + aWidth,ay + aHeight);
            resultRect.right = pt.x;
            resultRect.bottom = pt.y;
            return resultRect;
        }
        
        public handleControllerChanged(c: Controller): void {
            if(this._gearDisplay.controller == c)
                this._gearDisplay.apply();
            if(this._gearXY.controller == c)
                this._gearXY.apply();
            if(this._gearSize.controller == c)
                this._gearSize.apply();
            if(this._gearLook.controller == c)
                this._gearLook.apply();
        }

        protected createDisplayObject(): void {
        }
        
        protected switchDisplayObject(newObj:egret.DisplayObject):void {
            if(newObj == this._displayObject)
                return;
    
            var old: egret.DisplayObject = this._displayObject;
            if(this._displayObject.parent != null) {
                var i: number = this._displayObject.parent.getChildIndex(this._displayObject);
                this._displayObject.parent.addChildAt(newObj,i);
                this._displayObject.parent.removeChild(this._displayObject);
            }
            this._displayObject = newObj;
            this._displayObject.x = old.x;
            this._displayObject.y = old.y;
            this._displayObject.rotation = old.rotation;
            this._displayObject.alpha = old.alpha;
            this._displayObject.visible = old.visible;
            this._displayObject.touchEnabled = old.touchEnabled;

            if(this._displayObject instanceof egret.DisplayObjectContainer)
                (<egret.DisplayObjectContainer>this._displayObject).touchChildren = this._touchable;
        }

        protected handleXYChanged(): void {
            if(this._displayObject) {
                this._displayObject.x = this._x + this._pivotOffsetX;
                this._displayObject.y = this._y + this._pivotOffsetY;
            }
        }

        protected handleSizeChanged(): void {
        }

        protected handleGrayChanged(): void {
            if(this._displayObject) {
                /*if(this._grayed)
                    this._displayObject.filter = new ColorMatrixFilter(ToolSet.GRAY_FILTERS_MATRIX);
                else
                    this._displayObject.filter = null;*/
            }
        }

        public constructFromResource(pkgItem: PackageItem): void {
            this._packageItem = pkgItem;
        }

        public setup_beforeAdd(xml: any): void {
            var str: string;
            var arr: string[];

            this._id = xml.attributes.id;
            this._name = xml.attributes.name;

            str = xml.attributes.xy;
            arr = str.split(",");
            this.setXY(parseInt(arr[0]), parseInt(arr[1]));

            str = xml.attributes.size;
            if (str) {
                arr = str.split(",");
                this._initWidth = parseInt(arr[0]);
                this._initHeight = parseInt(arr[1]);
                this.setSize(this._initWidth, this._initHeight);
            }
            
            str = xml.attributes.scale;
            if(str) {
                arr = str.split(",");
                this.setScale(parseFloat(arr[0]),parseFloat(arr[1]));
            }

            str = xml.attributes.rotation;
            if (str)
                this.rotation = parseInt(str);

            str = xml.attributes.pivot;
            if (str) {
                arr = str.split(",");
                this.setPivot(parseFloat(arr[0]),parseFloat(arr[1]));
            }

            str = xml.attributes.alpha;
            if (str)
                this.alpha = parseFloat(str);

            this.touchable = xml.attributes.touchable != "false";
            this.visible = xml.attributes.visible != "false";
            this.grayed = xml.attributes.grayed == "true";
            this.tooltips = xml.attributes.tooltips;
        }

        public setup_afterAdd(xml: any): void {
            var cxml: any;

            var str: string = xml.attributes.group;
            if (str)
                this._group = <GGroup><any> (this._parent.getChildById(str));

            var col: any = xml.children;
            if (col) {
                var length1: number = col.length;
                for (var i1: number = 0; i1 < length1; i1++) {
                    var cxml: any = col[i1];
                    if (cxml.name == "gearDisplay") {
                        this._gearDisplay.setup(cxml);
                    }
                    else if (cxml.name == "gearXY") {
                        this._gearXY.setup(cxml);
                    }
                    else if (cxml.name == "gearSize") {
                        this._gearSize.setup(cxml);
                    }
                    else if (cxml.name == "gearLook") {
                        this._gearLook.setup(cxml);
                    }
                }
            }
        }

        //drag support
        //-------------------------------------------------------------------
        private static sDragging: GObject;
        private static sGlobalDragStart: egret.Point = new egret.Point();
        private static sGlobalRect: egret.Rectangle = new egret.Rectangle();
        private static sHelperPoint: egret.Point = new egret.Point();
        private static sDragHelperRect: egret.Rectangle = new egret.Rectangle();
        private _touchDownPoint: egret.Point;
        
        private initDrag(): void {
            if (this._draggable)
                this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__begin, this);
            else
                this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__begin, this);
        }

        private dragBegin(evt: egret.TouchEvent): void {
            if (GObject.sDragging != null)
                GObject.sDragging.stopDrag();

            if (evt != null) {
                GObject.sGlobalDragStart.x = evt.stageX;
                GObject.sGlobalDragStart.y = evt.stageY;
            }
            else {
                GObject.sGlobalDragStart.x = GRoot.mouseX;
                GObject.sGlobalDragStart.y = GRoot.mouseY;
            }
            this.localToGlobalRect(0,0,this.width,this.height,GObject.sGlobalRect);
            GObject.sDragging = this;

            GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__moving2, this);
            GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_END, this.__end2, this);
        }

        private dragEnd(): void {
            if (GObject.sDragging == this) {
                GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__moving2, this);
                GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__end2, this);
                GObject.sDragging = null;
            }
        }

        private reset(): void {
            GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__moving, this);
            GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__end, this);
        }

        private __begin(evt: egret.TouchEvent): void {
            if(this._touchDownPoint==null)
                this._touchDownPoint = new egret.Point();
            this._touchDownPoint.x = evt.stageX;
            this._touchDownPoint.y = evt.stageY;
            
            GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__moving, this);
            GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_END, this.__end, this);
        }

        private __end(evt: egret.TouchEvent): void {
            this.reset();
        }

        private __moving(evt: egret.TouchEvent): void {
            var sensitivity: number = UIConfig.touchDragSensitivity;
            if(this._touchDownPoint != null
                && Math.abs(this._touchDownPoint.x - evt.stageX) < sensitivity
                && Math.abs(this._touchDownPoint.y - evt.stageY) < sensitivity)
                return;
            
            this.reset();

            var dragEvent: DragEvent = new DragEvent(DragEvent.DRAG_START);
            dragEvent.stageX = evt.stageX;
            dragEvent.stageY = evt.stageY;
            dragEvent.touchPointID = evt.touchPointID;
            this.dispatchEvent(dragEvent);

            if (!dragEvent.isDefaultPrevented())
                this.dragBegin(evt);
        }

        private __moving2(evt: egret.TouchEvent): void {
            var xx: number = evt.stageX - GObject.sGlobalDragStart.x + GObject.sGlobalRect.x;
            var yy: number = evt.stageY - GObject.sGlobalDragStart.y + GObject.sGlobalRect.y;

            if(this._dragBounds != null) {
                var rect: egret.Rectangle = GRoot.inst.localToGlobalRect(this._dragBounds.x,this._dragBounds.y,
                    this._dragBounds.width,this._dragBounds.height,GObject.sDragHelperRect);
                if(xx < rect.x)
                    xx = rect.x;
                else if(xx + GObject.sGlobalRect.width > rect.right) {
                    xx = rect.right - GObject.sGlobalRect.width;
                    if(xx < rect.x)
                        xx = rect.x;
                }

                if(yy < rect.y)
                    yy = rect.y;
                else if(yy + GObject.sGlobalRect.height > rect.bottom) {
                    yy = rect.bottom - GObject.sGlobalRect.height;
                    if(yy < rect.y)
                        yy = rect.y;
                }
            }

            var pt: egret.Point = this.parent.globalToLocal(xx,yy,GObject.sHelperPoint);
            this.setXY(Math.round(pt.x),Math.round(pt.y));
        }

        private __end2(evt: egret.TouchEvent): void {
            if (GObject.sDragging == this) {
                this.stopDrag();

                var dragEvent: DragEvent = new DragEvent(DragEvent.DRAG_END);
                dragEvent.stageX = evt.stageX;
                dragEvent.stageY = evt.stageY;
                dragEvent.touchPointID = evt.touchPointID;
                this.dispatchEvent(dragEvent);
            }
        }
        //-------------------------------------------------------------------
    }
}