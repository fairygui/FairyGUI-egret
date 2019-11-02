
module fgui {

    export class GObject extends egret.EventDispatcher {
        public data: any;
        public packageItem: PackageItem;
        public static draggingObject: GObject;

        private _x: number = 0;
        private _y: number = 0;
        private _alpha: number = 1;
        private _rotation: number = 0;
        private _visible: boolean = true;
        private _touchable: boolean = true;
        private _grayed: boolean = false;
        private _draggable: boolean = false;
        private _scaleX: number = 1;
        private _scaleY: number = 1;
        private _skewX: number = 0;
        private _skewY: number = 0;
        private _pivotX: number = 0;
        private _pivotY: number = 0;
        private _pivotAsAnchor: boolean = false;
        private _pivotOffsetX: number = 0;
        private _pivotOffsetY: number = 0;
        private _sortingOrder: number = 0;
        private _internalVisible: boolean = true;
        private _handlingController: boolean = false;
        private _focusable: boolean = false;
        private _tooltips: string;
        private _pixelSnapping: boolean = false;
        private _disposed: boolean = false;

        private _relations: Relations;
        private _group: GGroup;
        private _gears: GearBase[];
        private _displayObject: egret.DisplayObject;
        private _dragBounds: egret.Rectangle;
        private _colorFilter: egret.ColorMatrixFilter;

        public sourceWidth: number = 0;
        public sourceHeight: number = 0;
        public initWidth: number = 0;
        public initHeight: number = 0;
        public minWidth: number = 0;
        public minHeight: number = 0;
        public maxWidth: number = 0;
        public maxHeight: number = 0;

        public _parent: GComponent;
        public _width: number = 0;
        public _height: number = 0;
        public _rawWidth: number = 0;
        public _rawHeight: number = 0;
        public _id: string;
        public _name: string;
        public _underConstruct: boolean;
        public _gearLocked: boolean;
        public _sizePercentInGroup: number = 0;
        public _treeNode: GTreeNode;

        public static _gInstanceCounter: number = 0;

        public static XY_CHANGED: string = "__xyChanged";
        public static SIZE_CHANGED: string = "__sizeChanged";
        public static SIZE_DELAY_CHANGE: string = "__sizeDelayChange";
        public static GEAR_STOP: string = "gearStop";

        public constructor() {
            super();

            this._id = "" + GObject._gInstanceCounter++;
            this._name = "";

            this.createDisplayObject();

            this._relations = new Relations(this);
            this._gears = new Array<GearBase>(10);
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
            this.setXY(value, this._y);
        }

        public get y(): number {
            return this._y;
        }

        public set y(value: number) {
            this.setXY(this._x, value);
        }

        public setXY(xv: number, yv: number): void {
            if (this._x != xv || this._y != yv) {
                var dx: number = xv - this._x;
                var dy: number = yv - this._y;
                this._x = xv;
                this._y = yv;

                this.handleXYChanged();
                if (this instanceof GGroup)
                    (<GGroup><any>this).moveChildren(dx, dy);

                this.updateGear(1);

                if (this._parent && !(this._parent instanceof GList)) {
                    this._parent.setBoundsChangedFlag();
                    if (this._group != null)
                        this._group.setBoundsChangedFlag(true);
                    this.dispatchEventWith(GObject.XY_CHANGED);
                }

                if (GObject.draggingObject == this && !GObject.sUpdateInDragging)
                    this.localToGlobalRect(0, 0, this._width, this._height, GObject.sGlobalRect);
            }
        }

        public get xMin(): number {
            return this._pivotAsAnchor ? (this._x - this._width * this._pivotX) : this._x;
        }

        public set xMin(value: number) {
            if (this._pivotAsAnchor)
                this.setXY(value + this._width * this._pivotX, this._y);
            else
                this.setXY(value, this._y);
        }

        public get yMin(): number {
            return this._pivotAsAnchor ? (this._y - this._height * this._pivotY) : this._y;
        }

        public set yMin(value: number) {
            if (this._pivotAsAnchor)
                this.setXY(this._x, value + this._height * this._pivotY);
            else
                this.setXY(this._x, value);
        }

        public get pixelSnapping(): boolean {
            return this._pixelSnapping;
        }

        public set pixelSnapping(value: boolean) {
            if (this._pixelSnapping != value) {
                this._pixelSnapping = value;
                this.handleXYChanged();
            }
        }

        public center(restraint: boolean = false): void {
            var r: GComponent;
            if (this._parent != null)
                r = this.parent;
            else
                r = this.root;

            this.setXY((r.width - this._width) / 2, (r.height - this._height) / 2);
            if (restraint) {
                this.addRelation(r, RelationType.Center_Center);
                this.addRelation(r, RelationType.Middle_Middle);
            }
        }

        public get width(): number {
            this.ensureSizeCorrect();
            if (this._relations.sizeDirty)
                this._relations.ensureRelationsSizeCorrect();
            return this._width;
        }

        public set width(value: number) {
            this.setSize(value, this._rawHeight);
        }

        public get height(): number {
            this.ensureSizeCorrect();
            if (this._relations.sizeDirty)
                this._relations.ensureRelationsSizeCorrect();
            return this._height;
        }

        public set height(value: number) {
            this.setSize(this._rawWidth, value);
        }

        public setSize(wv: number, hv: number, ignorePivot: boolean = false): void {
            if (this._rawWidth != wv || this._rawHeight != hv) {
                this._rawWidth = wv;
                this._rawHeight = hv;
                if (wv < this.minWidth)
                    wv = this.minWidth;
                if (hv < this.minHeight)
                    hv = this.minHeight;
                if (this.maxWidth > 0 && wv > this.maxWidth)
                    wv = this.maxWidth;
                if (this.maxHeight > 0 && hv > this.maxHeight)
                    hv = this.maxHeight;
                var dWidth: number = wv - this._width;
                var dHeight: number = hv - this._height;
                this._width = wv;
                this._height = hv;

                this.handleSizeChanged();
                if (this._pivotX != 0 || this._pivotY != 0) {
                    if (!this._pivotAsAnchor) {
                        if (!ignorePivot)
                            this.setXY(this.x - this._pivotX * dWidth, this.y - this._pivotY * dHeight);
                        this.updatePivotOffset();
                    }
                    else {
                        this.applyPivot();
                    }
                }

                if (this instanceof GGroup)
                    (<GGroup><any>this).resizeChildren(dWidth, dHeight);

                this.updateGear(2);

                if (this._parent) {
                    this._relations.onOwnerSizeChanged(dWidth, dHeight, this._pivotAsAnchor || !ignorePivot);
                    this._parent.setBoundsChangedFlag();
                    if (this._group != null)
                        this._group.setBoundsChangedFlag();
                }

                this.dispatchEventWith(GObject.SIZE_CHANGED);
            }
        }

        public makeFullScreen(): void {
            this.setSize(GRoot.inst.width, GRoot.inst.height);
        }

        public ensureSizeCorrect(): void {
        }

        public get actualWidth(): number {
            return this.width * Math.abs(this._scaleX);
        }

        public get actualHeight(): number {
            return this.height * Math.abs(this._scaleY);
        }

        public get scaleX(): number {
            return this._scaleX;
        }

        public set scaleX(value: number) {
            this.setScale(value, this._scaleY);
        }

        public get scaleY(): number {
            return this._scaleY;
        }

        public set scaleY(value: number) {
            this.setScale(this._scaleX, value);
        }

        public setScale(sx: number, sy: number) {
            if (this._scaleX != sx || this._scaleY != sy) {
                this._scaleX = sx;
                this._scaleY = sy;
                this.handleScaleChanged();
                this.applyPivot();

                this.updateGear(2);
            }
        }

        public get skewX(): number {
            return this._skewX;
        }

        public set skewX(value: number) {
            this.setSkew(value, this._skewY);
        }

        public get skewY(): number {
            return this._skewY;
        }

        public set skewY(value: number) {
            this.setSkew(this._skewX, value);
        }

        public setSkew(xv: number, yv: number) {
            if (this._skewX != xv || this._skewY != yv) {
                this._skewX = xv;
                this._skewY = yv;
                if (this._displayObject != null) {
                    this._displayObject.skewX = xv;
                    this._displayObject.skewY = yv;
                }
                this.applyPivot();
            }
        }

        public get pivotX(): number {
            return this._pivotX;
        }

        public set pivotX(value: number) {
            this.setPivot(value, this._pivotY);
        }

        public get pivotY(): number {
            return this._pivotY;
        }

        public set pivotY(value: number) {
            this.setPivot(this._pivotX, value);
        }

        public setPivot(xv: number, yv: number = 0, asAnchor: boolean = false): void {
            if (this._pivotX != xv || this._pivotY != yv || this._pivotAsAnchor != asAnchor) {
                this._pivotX = xv;
                this._pivotY = yv;
                this._pivotAsAnchor = asAnchor;
                this.updatePivotOffset();
                this.handleXYChanged();
            }
        }

        public get pivotAsAnchor(): boolean {
            return this._pivotAsAnchor;
        }

        protected internalSetPivot(xv: number, yv: number = 0, asAnchor: boolean): void {
            this._pivotX = xv;
            this._pivotY = yv;
            this._pivotAsAnchor = asAnchor;
            if (asAnchor)
                this.handleXYChanged();
        }

        private updatePivotOffset(): void {
            if (this._displayObject != null) {
                if (this._pivotX != 0 || this._pivotY != 0) {
                    var px: number = this._pivotX * this._width;
                    var py: number = this._pivotY * this._height;
                    var pt: egret.Point = this._displayObject.matrix.transformPoint(px, py, GObject.sHelperPoint);
                    this._pivotOffsetX = this._pivotX * this._width - (pt.x - this._displayObject.x);
                    this._pivotOffsetY = this._pivotY * this._height - (pt.y - this._displayObject.y);
                }
                else {
                    this._pivotOffsetX = 0;
                    this._pivotOffsetY = 0;
                }
            }
        }

        private applyPivot(): void {
            if (this._pivotX != 0 || this._pivotY != 0) {
                this.updatePivotOffset();
                this.handleXYChanged();
            }
        }

        public get touchable(): boolean {
            return this._touchable;
        }

        public set touchable(value: boolean) {
            if (this._touchable != value) {
                this._touchable = value;
                this.updateGear(3);

                if ((this instanceof GImage) || (this instanceof GMovieClip)
                    || (this instanceof GTextField) && !(this instanceof GTextInput) && !(this instanceof GRichTextField))
                    //Touch is not supported by GImage/GMovieClip/GTextField
                    return;

                if (this._displayObject != null) {
                    this._displayObject.touchEnabled = this._touchable;
                    if (this._displayObject instanceof egret.DisplayObjectContainer)
                        (<egret.DisplayObjectContainer>this._displayObject).touchChildren = this._touchable;
                }
            }
        }

        public get grayed(): boolean {
            return this._grayed;
        }

        public set grayed(value: boolean) {
            if (this._grayed != value) {
                this._grayed = value;
                this.handleGrayedChanged();
                this.updateGear(3);
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
            if (this._rotation != value) {
                this._rotation = value;
                if (this._displayObject)
                    this._displayObject.rotation = this.normalizeRotation;

                this.applyPivot();

                this.updateGear(3);
            }
        }

        public get normalizeRotation(): number {
            var rot: number = this._rotation % 360;
            if (rot > 180)
                rot -= 360;
            else if (rot < -180)
                rot += 360;
            return rot;
        }

        public get alpha(): number {
            return this._alpha;
        }

        public set alpha(value: number) {
            if (this._alpha != value) {
                this._alpha = value;
                this.handleAlphaChanged();
                this.updateGear(3);
            }
        }

        public get visible(): boolean {
            return this._visible;
        }

        public set visible(value: boolean) {
            if (this._visible != value) {
                this._visible = value;
                this.handleVisibleChanged();
                if (this._parent)
                    this._parent.setBoundsChangedFlag();
                if (this._group && this._group.excludeInvisibles)
                    this._group.setBoundsChangedFlag();
            }
        }

        public get internalVisible(): boolean {
            return this._internalVisible && (!this._group || this._group.internalVisible);
        }

        public get internalVisible2(): boolean {
            return this._visible && (!this._group || this._group.internalVisible2);
        }

        public get internalVisible3(): boolean {
            return this._visible && this._internalVisible;
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

        public get blendMode(): string {
            return this._displayObject.blendMode;
        }

        public set blendMode(value: string) {
            this._displayObject.blendMode = value;
        }

        public get filters(): egret.Filter[] {
            return this._displayObject.filters;
        }

        public set filters(value: egret.Filter[]) {
            this._displayObject.filters = value;
        }

        public get inContainer(): boolean {
            return this._displayObject != null && this._displayObject.parent != null;
        }

        public get onStage(): boolean {
            return this._displayObject != null && this._displayObject.stage != null;
        }

        public get resourceURL(): string {
            if (this.packageItem != null)
                return "ui://" + this.packageItem.owner.id + this.packageItem.id;
            else
                return null;
        }

        public set group(value: GGroup) {
            if (this._group != value) {
                if (this._group != null)
                    this._group.setBoundsChangedFlag();
                this._group = value;
                if (this._group != null)
                    this._group.setBoundsChangedFlag();
            }
        }

        public get group(): GGroup {
            return this._group;
        }

        public getGear(index: number): GearBase {
            var gear: GearBase = this._gears[index];
            if (gear == null)
                this._gears[index] = gear = GearBase.create(this, index);
            return gear;
        }

        protected updateGear(index: number): void {
            if (this._underConstruct || this._gearLocked)
                return;

            var gear: GearBase = this._gears[index];
            if (gear != null && gear.controller != null)
                gear.updateState();
        }

        public checkGearController(index: number, c: Controller): boolean {
            return this._gears[index] != null && this._gears[index].controller == c;
        }

        public updateGearFromRelations(index: number, dx: number, dy: number): void {
            if (this._gears[index] != null)
                this._gears[index].updateFromRelations(dx, dy);
        }

        public addDisplayLock(): number {
            var gearDisplay: GearDisplay = <GearDisplay>this._gears[0];
            if (gearDisplay && gearDisplay.controller) {
                var ret: number = gearDisplay.addLock();
                this.checkGearDisplay();

                return ret;
            }
            else
                return 0;
        }

        public releaseDisplayLock(token: number): void {
            var gearDisplay: GearDisplay = <GearDisplay>this._gears[0];
            if (gearDisplay && gearDisplay.controller) {
                gearDisplay.releaseLock(token);
                this.checkGearDisplay();
            }
        }

        private checkGearDisplay(): void {
            if (this._handlingController)
                return;

            var connected: boolean = this._gears[0] == null || (<GearDisplay>this._gears[0]).connected;
            if (this._gears[8])
                connected = (<GearDisplay2>this._gears[8]).evaluate(connected);
            if (connected != this._internalVisible) {
                this._internalVisible = connected;
                if (this._parent)
                    this._parent.childStateChanged(this);
                if (this._group && this._group.excludeInvisibles)
                    this._group.setBoundsChangedFlag();
            }
        }

        public get gearXY(): GearXY {
            return <GearXY>this.getGear(1);
        }

        public get gearSize(): GearSize {
            return <GearSize>this.getGear(2);
        }

        public get gearLook(): GearLook {
            return <GearLook>this.getGear(3);
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
            if (this._displayObject != value) {
                if (this._displayObject)
                    delete this._displayObject["$owner"];
                this._displayObject = value;
                this._displayObject["$owner"] = this;
            }
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
            if (this instanceof GRoot)
                return <GRoot><any>this;

            var p: GObject = this._parent;
            while (p) {
                if (p instanceof GRoot)
                    return <GRoot><any>p;
                p = p.parent;
            }
            return GRoot.inst;
        }

        public get asCom(): GComponent {
            return <GComponent><any>this;
        }

        public get asButton(): GButton {
            return <GButton><any>this;
        }

        public get asLabel(): GLabel {
            return <GLabel><any>this;
        }

        public get asProgress(): GProgressBar {
            return <GProgressBar><any>this;
        }

        public get asTextField(): GTextField {
            return <GTextField><any>this;
        }

        public get asRichTextField(): GRichTextField {
            return <GRichTextField><any>this;
        }

        public get asTextInput(): GTextInput {
            return <GTextInput><any>this;
        }

        public get asLoader(): GLoader {
            return <GLoader><any>this;
        }

        public get asList(): GList {
            return <GList><any>this;
        }

        public get asTree(): GTree {
            return <GTree><any>this;
        }

        public get asGraph(): GGraph {
            return <GGraph><any>this;
        }

        public get asGroup(): GGroup {
            return <GGroup><any>this;
        }

        public get asSlider(): GSlider {
            return <GSlider><any>this;
        }

        public get asComboBox(): GComboBox {
            return <GComboBox><any>this;
        }

        public get asImage(): GImage {
            return <GImage><any>this;
        }

        public get asMovieClip(): GMovieClip {
            return <GMovieClip><any>this;
        }

        public static cast(obj: egret.DisplayObject): GObject {
            return <GObject><any>obj["$owner"];
        }

        public get text(): string {
            return null;
        }

        public set text(value: string) {
        }

        public get icon(): string {
            return null;
        }

        public set icon(value: string) {
        }

        public get isDisposed(): boolean {
            return this._disposed;
        }

        public get treeNode(): GTreeNode {
            return this._treeNode;
        }

        public dispose(): void {
            if (this._disposed)
                return;

            this._disposed = true;
            this.removeFromParent();
            this._relations.dispose();
            this._displayObject = null;
            for (var i: number = 0; i < 10; i++) {
                var gear: GearBase = this._gears[i];
                if (gear != null)
                    gear.dispose();
            }
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

        public startDrag(touchPointID: number = -1): void {
            if (this._displayObject.stage == null)
                return;

            this.dragBegin(null);
        }

        public stopDrag(): void {
            this.dragEnd();
        }

        public get dragging(): boolean {
            return GObject.draggingObject == this;
        }

        public localToGlobal(ax: number = 0, ay: number = 0, resultPoint?: egret.Point): egret.Point {
            if (this._pivotAsAnchor) {
                ax += this._pivotX * this._width;
                ay += this._pivotY * this._height;
            }

            return this._displayObject.localToGlobal(ax, ay, resultPoint);
        }

        public globalToLocal(ax: number = 0, ay: number = 0, resultPoint?: egret.Point): egret.Point {
            var pt: egret.Point = this._displayObject.globalToLocal(ax, ay, resultPoint);
            if (this._pivotAsAnchor) {
                pt.x -= this._pivotX * this._width;
                pt.y -= this._pivotY * this._height;
            }
            return pt;
        }

        public localToRoot(ax: number = 0, ay: number = 0, resultPoint?: egret.Point): egret.Point {
            var pt: egret.Point = this._displayObject.localToGlobal(ax, ay, resultPoint);
            pt.x /= GRoot.contentScaleFactor;
            pt.y /= GRoot.contentScaleFactor;
            return pt;
        }

        public rootToLocal(ax: number = 0, ay: number = 0, resultPoint?: egret.Point): egret.Point {
            ax *= GRoot.contentScaleFactor;
            ay *= GRoot.contentScaleFactor;
            return this._displayObject.globalToLocal(ax, ay, resultPoint);
        }

        public localToGlobalRect(ax: number = 0, ay: number = 0, aWidth: number = 0, aHeight: number = 0, resultRect?: egret.Rectangle): egret.Rectangle {
            if (resultRect == null)
                resultRect = new egret.Rectangle();
            var pt: egret.Point = this.localToGlobal(ax, ay);
            resultRect.x = pt.x;
            resultRect.y = pt.y;
            pt = this.localToGlobal(ax + aWidth, ay + aHeight);
            resultRect.right = pt.x;
            resultRect.bottom = pt.y;
            return resultRect;
        }

        public globalToLocalRect(ax: number = 0, ay: number = 0, aWidth: number = 0, aHeight: number = 0, resultRect?: egret.Rectangle): egret.Rectangle {
            if (resultRect == null)
                resultRect = new egret.Rectangle();
            var pt: egret.Point = this.globalToLocal(ax, ay);
            resultRect.x = pt.x;
            resultRect.y = pt.y;
            pt = this.globalToLocal(ax + aWidth, ay + aHeight);
            resultRect.right = pt.x;
            resultRect.bottom = pt.y;
            return resultRect;
        }

        public handleControllerChanged(c: Controller): void {
            this._handlingController = true;
            for (var i: number = 0; i < 10; i++) {
                var gear: GearBase = this._gears[i];
                if (gear != null && gear.controller == c)
                    gear.apply();
            }
            this._handlingController = false;

            this.checkGearDisplay();
        }

        protected createDisplayObject(): void {
        }

        protected switchDisplayObject(newObj: egret.DisplayObject): void {
            if (newObj == this._displayObject)
                return;

            var old: egret.DisplayObject = this._displayObject;
            if (this._displayObject.parent != null) {
                var i: number = this._displayObject.parent.getChildIndex(this._displayObject);
                this._displayObject.parent.addChildAt(newObj, i);
                this._displayObject.parent.removeChild(this._displayObject);
            }
            this._displayObject = newObj;
            this._displayObject.x = old.x;
            this._displayObject.y = old.y;
            this._displayObject.rotation = old.rotation;
            this._displayObject.alpha = old.alpha;
            this._displayObject.visible = old.visible;
            this._displayObject.touchEnabled = old.touchEnabled;
            this._displayObject.scaleX = old.scaleX;
            this._displayObject.scaleY = old.scaleY;

            if (this._displayObject instanceof egret.DisplayObjectContainer)
                (<egret.DisplayObjectContainer>this._displayObject).touchChildren = this._touchable;
        }

        protected handleXYChanged(): void {
            if (this._displayObject) {
                var xv: number = this._x;
                var yv: number = this._y;
                if (this._pivotAsAnchor) {
                    xv -= this._pivotX * this._width;
                    yv -= this._pivotY * this._height;
                }
                if (this._pixelSnapping) {
                    xv = Math.round(xv);
                    yv = Math.round(yv);
                }
                this._displayObject.x = xv + this._pivotOffsetX;
                this._displayObject.y = yv + this._pivotOffsetY;
            }
        }

        protected handleSizeChanged(): void {
            if (this._displayObject) {
                this._displayObject.width = this._width;
                this._displayObject.height = this._height;
            }
        }

        protected handleScaleChanged(): void {
            if (this._displayObject) {
                this._displayObject.scaleX = this._scaleX;
                this._displayObject.scaleY = this._scaleY;
            }
        }

        protected handleGrayedChanged(): void {
            if (this._displayObject) {
                ToolSet.setColorFilter(this._displayObject, this._grayed);
            }
        }

        protected handleAlphaChanged(): void {
            if (this._displayObject)
                this._displayObject.alpha = this._alpha;
        }

        public handleVisibleChanged(): void {
            if (this._displayObject)
                this._displayObject.visible = this.internalVisible2;
            if (this instanceof GGroup)
                (<GGroup>this).handleVisibleChanged();
        }

        public getProp(index: number): any {
            switch (index) {
                case ObjectPropID.Text:
                    return this.text;
                case ObjectPropID.Icon:
                    return this.icon;
                case ObjectPropID.Color:
                    return NaN;
                case ObjectPropID.OutlineColor:
                    return NaN;
                case ObjectPropID.Playing:
                    return false;
                case ObjectPropID.Frame:
                    return 0;
                case ObjectPropID.DeltaTime:
                    return 0;
                case ObjectPropID.TimeScale:
                    return 1;
                case ObjectPropID.FontSize:
                    return 0;
                case ObjectPropID.Selected:
                    return false;
                default:
                    return undefined;
            }
        }

        public setProp(index: number, value: any): void {
            switch (index) {
                case ObjectPropID.Text:
                    this.text = value;
                    break;

                case ObjectPropID.Icon:
                    this.icon = value;
                    break;
            }
        }

        public constructFromResource(): void {
        }

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            buffer.seek(beginPos, 0);
            buffer.skip(5);

            var f1: number;
            var f2: number;

            this._id = buffer.readS();
            this._name = buffer.readS();
            f1 = buffer.readInt();
            f2 = buffer.readInt();
            this.setXY(f1, f2);

            if (buffer.readBool()) {
                this.initWidth = buffer.readInt();
                this.initHeight = buffer.readInt();
                this.setSize(this.initWidth, this.initHeight, true);
            }

            if (buffer.readBool()) {
                this.minWidth = buffer.readInt();
                this.maxWidth = buffer.readInt();
                this.minHeight = buffer.readInt();
                this.maxHeight = buffer.readInt();
            }

            if (buffer.readBool()) {
                f1 = buffer.readFloat();
                f2 = buffer.readFloat();
                this.setScale(f1, f2);
            }

            if (buffer.readBool()) {
                f1 = buffer.readFloat();
                f2 = buffer.readFloat();
                this.setSkew(f1, f2);
            }

            if (buffer.readBool()) {
                f1 = buffer.readFloat();
                f2 = buffer.readFloat();
                this.setPivot(f1, f2, buffer.readBool());
            }

            f1 = buffer.readFloat();
            if (f1 != 1)
                this.alpha = f1;

            f1 = buffer.readFloat();
            if (f1 != 0)
                this.rotation = f1;

            if (!buffer.readBool())
                this.visible = false;
            if (!buffer.readBool())
                this.touchable = false;
            if (buffer.readBool())
                this.grayed = true;
            var bm: number = buffer.readByte();
            if (bm == 2)
                this.blendMode = egret.BlendMode.ADD;
            else if (bm == 5)
                this.blendMode = egret.BlendMode.ERASE;

            var filter: number = buffer.readByte();
            if (filter == 1 && this._displayObject)
                ToolSet.setColorFilter(this._displayObject,
                    [buffer.readFloat(), buffer.readFloat(), buffer.readFloat(), buffer.readFloat()]);

            var str: string = buffer.readS();
            if (str != null)
                this.data = str;
        }

        public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
            buffer.seek(beginPos, 1);

            var str: string = buffer.readS();
            if (str != null)
                this.tooltips = str;

            var groupId: number = buffer.readShort();
            if (groupId >= 0)
                this.group = <GGroup>this.parent.getChildAt(groupId);

            buffer.seek(beginPos, 2);

            var cnt: number = buffer.readShort();
            for (var i: number = 0; i < cnt; i++) {
                var nextPos: number = buffer.readShort();
                nextPos += buffer.position;

                var gear: GearBase = this.getGear(buffer.readByte());
                gear.setup(buffer);

                buffer.position = nextPos;
            }
        }

        //drag support
        //-------------------------------------------------------------------
        private static sGlobalDragStart: egret.Point = new egret.Point();
        private static sGlobalRect: egret.Rectangle = new egret.Rectangle();
        private static sHelperPoint: egret.Point = new egret.Point();
        private static sDragHelperRect: egret.Rectangle = new egret.Rectangle();
        private static sUpdateInDragging: boolean;
        private _touchDownPoint: egret.Point;

        private initDrag(): void {
            if (this._draggable)
                this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__begin, this);
            else
                this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__begin, this);
        }

        private dragBegin(evt: egret.TouchEvent): void {
            if (GObject.draggingObject != null)
                GObject.draggingObject.stopDrag();

            if (evt != null) {
                GObject.sGlobalDragStart.x = evt.stageX;
                GObject.sGlobalDragStart.y = evt.stageY;
            }
            else {
                GObject.sGlobalDragStart.x = GRoot.mouseX;
                GObject.sGlobalDragStart.y = GRoot.mouseY;
            }
            this.localToGlobalRect(0, 0, this._width, this._height, GObject.sGlobalRect);
            GObject.draggingObject = this;

            GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__moving2, this);
            GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_END, this.__end2, this);
        }

        private dragEnd(): void {
            if (GObject.draggingObject == this) {
                GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__moving2, this);
                GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__end2, this);
                GObject.draggingObject = null;
            }
        }

        private reset(): void {
            GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__moving, this);
            GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__end, this);
        }

        private __begin(evt: egret.TouchEvent): void {
            if (this._touchDownPoint == null)
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
            if (this._touchDownPoint != null
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

            if (this._dragBounds != null) {
                var rect: egret.Rectangle = GRoot.inst.localToGlobalRect(this._dragBounds.x, this._dragBounds.y,
                    this._dragBounds.width, this._dragBounds.height, GObject.sDragHelperRect);
                if (xx < rect.x)
                    xx = rect.x;
                else if (xx + GObject.sGlobalRect.width > rect.right) {
                    xx = rect.right - GObject.sGlobalRect.width;
                    if (xx < rect.x)
                        xx = rect.x;
                }

                if (yy < rect.y)
                    yy = rect.y;
                else if (yy + GObject.sGlobalRect.height > rect.bottom) {
                    yy = rect.bottom - GObject.sGlobalRect.height;
                    if (yy < rect.y)
                        yy = rect.y;
                }
            }

            GObject.sUpdateInDragging = true;
            var pt: egret.Point = this.parent.globalToLocal(xx, yy, GObject.sHelperPoint);
            this.setXY(Math.round(pt.x), Math.round(pt.y));
            GObject.sUpdateInDragging = false;

            var dragEvent: DragEvent = new DragEvent(DragEvent.DRAG_MOVING);
            dragEvent.stageX = evt.stageX;
            dragEvent.stageY = evt.stageY;
            dragEvent.touchPointID = evt.touchPointID;
            this.dispatchEvent(dragEvent);
        }

        private __end2(evt: egret.TouchEvent): void {
            if (GObject.draggingObject == this) {
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