/// <reference path="GObject.ts" />

module fgui {

    export class GComponent extends GObject {
        private _sortingChildCount: number = 0;
        private _applyingController?: Controller;

        protected _margin: Margin;
        protected _trackBounds: boolean;
        protected _boundsChanged: boolean;
        protected _childrenRenderOrder: ChildrenRenderOrder = ChildrenRenderOrder.Ascent;
        protected _apexIndex: number = 0;

        public _buildingDisplayList: boolean;
        public _children: Array<GObject>;
        public _controllers: Array<Controller>;
        public _transitions: Array<Transition>;
        public _rootContainer: UIContainer;
        public _container: egret.DisplayObjectContainer;
        public _scrollPane?: ScrollPane;
        public _alignOffset: egret.Point;

        public constructor() {
            super();
            this._children = new Array<GObject>();
            this._controllers = new Array<Controller>();
            this._transitions = new Array<Transition>();
            this._margin = new Margin();
            this._alignOffset = new egret.Point();
        }

        protected createDisplayObject(): void {
            this._rootContainer = new UIContainer();
            this.setDisplayObject(this._rootContainer);
            this._container = this._rootContainer;
        }

        public dispose(): void {
            var i: number;
            var cnt: number;

            cnt = this._transitions.length;
            for (i = 0; i < cnt; ++i) {
                var trans: Transition = this._transitions[i];
                trans.dispose();
            }

            cnt = this._controllers.length;
            for (i = 0; i < cnt; ++i) {
                var cc: Controller = this._controllers[i];
                cc.dispose();
            }

            if (this._scrollPane)
                this._scrollPane.dispose();

            cnt = this._children.length;
            for (i = cnt - 1; i >= 0; --i) {
                var obj: GObject = this._children[i];
                obj.parent = null;//avoid removeFromParent call
                obj.dispose();
            }

            this._boundsChanged = false;
            super.dispose();
        }

        public get displayListContainer(): egret.DisplayObjectContainer {
            return this._container;
        }

        public addChild(child: GObject): GObject {
            this.addChildAt(child, this._children.length);
            return child;
        }

        public addChildAt(child: GObject, index: number = 0): GObject {
            if (!child)
                throw "child is null";

            var numChildren: number = this._children.length;

            if (index >= 0 && index <= numChildren) {
                if (child.parent == this) {
                    this.setChildIndex(child, index);
                }
                else {
                    child.removeFromParent();
                    child.parent = this;

                    var cnt: number = this._children.length;
                    if (child.sortingOrder != 0) {
                        this._sortingChildCount++;
                        index = this.getInsertPosForSortingChild(child);
                    }
                    else if (this._sortingChildCount > 0) {
                        if (index > (cnt - this._sortingChildCount))
                            index = cnt - this._sortingChildCount;
                    }

                    if (index == cnt)
                        this._children.push(child);
                    else
                        this._children.splice(index, 0, child);

                    this.childStateChanged(child);
                    this.setBoundsChangedFlag();
                }

                return child;
            }
            else {
                throw "Invalid child index";
            }
        }

        private getInsertPosForSortingChild(target: GObject): number {
            var cnt: number = this._children.length;
            var i: number = 0;
            for (i = 0; i < cnt; i++) {
                var child: GObject = this._children[i];
                if (child == target)
                    continue;

                if (target.sortingOrder < child.sortingOrder)
                    break;
            }
            return i;
        }

        public removeChild(child: GObject, dispose?: boolean): GObject {
            var childIndex: number = this._children.indexOf(child);
            if (childIndex != -1) {
                this.removeChildAt(childIndex, dispose);
            }
            return child;
        }

        public removeChildAt(index: number, dispose?: boolean): GObject {
            if (index >= 0 && index < this.numChildren) {
                var child: GObject = this._children[index];
                child.parent = null;

                if (child.sortingOrder != 0)
                    this._sortingChildCount--;

                this._children.splice(index, 1);
                child.group = null;
                if (child.inContainer) {
                    this._container.removeChild(child.displayObject);
                    if (this._childrenRenderOrder == ChildrenRenderOrder.Arch)
                        GTimers.inst.callLater(this.buildNativeDisplayList, this);
                }

                if (dispose)
                    child.dispose();

                this.setBoundsChangedFlag();

                return child;
            }
            else {
                throw "Invalid child index";
            }
        }

        public removeChildren(beginIndex?: number, endIndex?: number, dispose?: boolean): void {
            if (beginIndex == undefined) beginIndex = 0;
            if (endIndex == undefined) endIndex = -1;

            if (endIndex < 0 || endIndex >= this.numChildren)
                endIndex = this.numChildren - 1;

            for (var i: number = beginIndex; i <= endIndex; ++i)
                this.removeChildAt(beginIndex, dispose);
        }

        public getChildAt(index: number): GObject {
            if (index >= 0 && index < this.numChildren)
                return this._children[index];
            else
                throw "Invalid child index";
        }

        public getChild(name: string): GObject {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; ++i) {
                if (this._children[i].name == name)
                    return this._children[i];
            }

            return null;
        }

        public getChildByPath(path: String): GObject {
            var arr: string[] = path.split(".");
            var cnt: number = arr.length;
            var gcom: GComponent = this;
            var obj: GObject;
            for (var i: number = 0; i < cnt; ++i) {
                obj = gcom.getChild(arr[i]);
                if (!obj)
                    break;

                if (i != cnt - 1) {
                    if (!(obj instanceof GComponent)) {
                        obj = null;
                        break;
                    }
                    else
                        gcom = obj;
                }
            }

            return obj;
        }

        public getVisibleChild(name: string): GObject {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; ++i) {
                var child: GObject = this._children[i];
                if (child.internalVisible && child.internalVisible && child.name == name)
                    return child;
            }

            return null;
        }

        public getChildInGroup(name: string, group: GGroup): GObject {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; ++i) {
                var child: GObject = this._children[i];
                if (child.group == group && child.name == name)
                    return child;
            }

            return null;
        }

        public getChildById(id: string): GObject {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; ++i) {
                if (this._children[i]._id == id)
                    return this._children[i];
            }

            return null;
        }

        public getChildIndex(child: GObject): number {
            return this._children.indexOf(child);
        }

        public setChildIndex(child: GObject, index: number): void {
            var oldIndex: number = this._children.indexOf(child);
            if (oldIndex == -1)
                throw "Not a child of this container";

            if (child.sortingOrder != 0) //no effect
                return;

            var cnt: number = this._children.length;
            if (this._sortingChildCount > 0) {
                if (index > (cnt - this._sortingChildCount - 1))
                    index = cnt - this._sortingChildCount - 1;
            }

            this._setChildIndex(child, oldIndex, index);
        }

        public setChildIndexBefore(child: GObject, index: number): number {
            var oldIndex: number = this._children.indexOf(child);
            if (oldIndex == -1)
                throw "Not a child of this container";

            if (child.sortingOrder != 0) //no effect
                return oldIndex;

            var cnt: number = this._children.length;
            if (this._sortingChildCount > 0) {
                if (index > (cnt - this._sortingChildCount - 1))
                    index = cnt - this._sortingChildCount - 1;
            }

            if (oldIndex < index)
                return this._setChildIndex(child, oldIndex, index - 1);
            else
                return this._setChildIndex(child, oldIndex, index);
        }

        private _setChildIndex(child: GObject, oldIndex: number, index: number): number {
            var cnt: number = this._children.length;
            if (index > cnt)
                index = cnt;

            if (oldIndex == index)
                return oldIndex;

            this._children.splice(oldIndex, 1);
            this._children.splice(index, 0, child);

            if (child.inContainer) {
                var displayIndex: number = 0;
                var g: GObject;
                var i: number;

                if (this._childrenRenderOrder == ChildrenRenderOrder.Ascent) {
                    for (i = 0; i < index; i++) {
                        g = this._children[i];
                        if (g.inContainer)
                            displayIndex++;
                    }
                    if (displayIndex == this._container.numChildren)
                        displayIndex--;
                    this._container.setChildIndex(child.displayObject, displayIndex);
                }
                else if (this._childrenRenderOrder == ChildrenRenderOrder.Descent) {
                    for (i = cnt - 1; i > index; i--) {
                        g = this._children[i];
                        if (g.inContainer)
                            displayIndex++;
                    }
                    if (displayIndex == this._container.numChildren)
                        displayIndex--;
                    this._container.setChildIndex(child.displayObject, displayIndex);
                }
                else {
                    GTimers.inst.callLater(this.buildNativeDisplayList, this);
                }

                this.setBoundsChangedFlag();
            }

            return index;
        }

        public swapChildren(child1: GObject, child2: GObject): void {
            var index1: number = this._children.indexOf(child1);
            var index2: number = this._children.indexOf(child2);
            if (index1 == -1 || index2 == -1)
                throw "Not a child of this container";
            this.swapChildrenAt(index1, index2);
        }

        public swapChildrenAt(index1: number, index2: number): void {
            var child1: GObject = this._children[index1];
            var child2: GObject = this._children[index2];

            this.setChildIndex(child1, index2);
            this.setChildIndex(child2, index1);
        }

        public get numChildren(): number {
            return this._children.length;
        }

        public isAncestorOf(child: GObject): boolean {
            if (!child)
                return false;

            var p: GComponent = child.parent;
            while (p) {
                if (p == this)
                    return true;

                p = p.parent;
            }
            return false;
        }

        public addController(controller: Controller): void {
            this._controllers.push(controller);
            controller.parent = this;
            this.applyController(controller);
        }

        public getControllerAt(index: number): Controller {
            return this._controllers[index];
        }

        public getController(name: string): Controller {
            var cnt: number = this._controllers.length;
            for (var i: number = 0; i < cnt; ++i) {
                var c: Controller = this._controllers[i];
                if (c.name == name)
                    return c;
            }

            return null;
        }

        public removeController(c: Controller): void {
            var index: number = this._controllers.indexOf(c);
            if (index == -1)
                throw "controller not exists";

            c.parent = null;
            this._controllers.splice(index, 1);

            var length: number = this._children.length;
            for (var i: number = 0; i < length; i++) {
                var child: GObject = this._children[i];
                child.handleControllerChanged(c);
            }
        }

        public get controllers(): Array<Controller> {
            return this._controllers;
        }

        public childStateChanged(child: GObject): void {
            if (this._buildingDisplayList)
                return;

            var cnt: number = this._children.length;
            var g: GObject;
            var i: number;

            if (child instanceof GGroup) {
                for (i = 0; i < cnt; i++) {
                    g = this._children[i];
                    if (g.group == child)
                        this.childStateChanged(g);
                }
                return;
            }

            if (!child.displayObject)
                return;

            if (child.internalVisible) {
                if (!child.displayObject.parent) {
                    var index: number = 0;
                    if (this._childrenRenderOrder == ChildrenRenderOrder.Ascent) {
                        for (i = 0; i < cnt; i++) {
                            g = this._children[i];
                            if (g == child)
                                break;

                            if (g.displayObject && g.displayObject.parent)
                                index++;
                        }
                        this._container.addChildAt(child.displayObject, index);
                    }
                    else if (this._childrenRenderOrder == ChildrenRenderOrder.Descent) {
                        for (i = cnt - 1; i >= 0; i--) {
                            g = this._children[i];
                            if (g == child)
                                break;

                            if (g.displayObject && g.displayObject.parent)
                                index++;
                        }
                        this._container.addChildAt(child.displayObject, index);
                    }
                    else {
                        this._container.addChild(child.displayObject);

                        GTimers.inst.callLater(this.buildNativeDisplayList, this);
                    }
                }
            }
            else {
                if (child.displayObject.parent)
                    this._container.removeChild(child.displayObject);
            }
        }

        private buildNativeDisplayList(): void {
            var cnt: number = this._children.length;
            if (cnt == 0)
                return;

            var i: number;
            var child: GObject;
            switch (this._childrenRenderOrder) {
                case ChildrenRenderOrder.Ascent:
                    {
                        for (i = 0; i < cnt; i++) {
                            child = this._children[i];
                            if (child.displayObject && child.internalVisible)
                                this._container.addChild(child.displayObject);
                        }
                    }
                    break;
                case ChildrenRenderOrder.Descent:
                    {
                        for (i = cnt - 1; i >= 0; i--) {
                            child = this._children[i];
                            if (child.displayObject && child.internalVisible)
                                this._container.addChild(child.displayObject);
                        }
                    }
                    break;

                case ChildrenRenderOrder.Arch:
                    {
                        var apex: number = ToolSet.clamp(this._apexIndex, 0, cnt);
                        for (i = 0; i < apex; i++) {
                            child = this._children[i];
                            if (child.displayObject && child.internalVisible)
                                this._container.addChild(child.displayObject);
                        }
                        for (i = cnt - 1; i >= apex; i--) {
                            child = this._children[i];
                            if (child.displayObject && child.internalVisible)
                                this._container.addChild(child.displayObject);
                        }
                    }
                    break;
            }
        }

        public applyController(c: Controller): void {
            this._applyingController = c;
            var child: GObject;
            var length: number = this._children.length;
            for (var i: number = 0; i < length; i++) {
                child = this._children[i];
                child.handleControllerChanged(c);
            }
            this._applyingController = null;

            c.runActions();
        }

        public applyAllControllers(): void {
            var cnt: number = this._controllers.length;
            for (var i: number = 0; i < cnt; ++i) {
                this.applyController(this._controllers[i]);
            }
        }

        public adjustRadioGroupDepth(obj: GObject, c: Controller): void {
            var cnt: number = this._children.length;
            var i: number;
            var child: GObject;
            var myIndex: number = -1, maxIndex: number = -1;
            for (i = 0; i < cnt; i++) {
                child = this._children[i];
                if (child == obj) {
                    myIndex = i;
                }
                else if ((child instanceof GButton) && child.relatedController == c) {
                    if (i > maxIndex)
                        maxIndex = i;
                }
            }
            if (myIndex < maxIndex) {
                if (this._applyingController)
                    this._children[maxIndex].handleControllerChanged(this._applyingController);
                this.swapChildrenAt(myIndex, maxIndex);
            }
        }

        public getTransitionAt(index: number): Transition {
            return this._transitions[index];
        }

        public getTransition(transName: string): Transition {
            var cnt: number = this._transitions.length;
            for (var i: number = 0; i < cnt; ++i) {
                var trans: Transition = this._transitions[i];
                if (trans.name == transName)
                    return trans;
            }

            return null;
        }

        public isChildInView(child: GObject): boolean {
            if (this._rootContainer.scrollRect) {
                return child.x + child.width >= 0 && child.x <= this.width
                    && child.y + child.height >= 0 && child.y <= this.height;
            }
            else if (this._scrollPane) {
                return this._scrollPane.isChildInView(child);
            }
            else
                return true;
        }

        public getFirstChildInView(): number {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; ++i) {
                var child: GObject = this._children[i];
                if (this.isChildInView(child))
                    return i;
            }
            return -1;
        }

        public get scrollPane(): ScrollPane {
            return this._scrollPane;
        }

        public get opaque(): boolean {
            return this._rootContainer.opaque;
        }

        public set opaque(value: boolean) {
            this._rootContainer.opaque = value;
        }

        public get margin(): Margin {
            return this._margin;
        }

        public set margin(value: Margin) {
            this._margin.copy(value);
            if (this._rootContainer.scrollRect) {
                this._container.x = this._margin.left + this._alignOffset.x;
                this._container.y = this._margin.top + this._alignOffset.y;
            }
            this.handleSizeChanged();
        }

        public get childrenRenderOrder(): ChildrenRenderOrder {
            return this._childrenRenderOrder;
        }

        public set childrenRenderOrder(value: ChildrenRenderOrder) {
            if (this._childrenRenderOrder != value) {
                this._childrenRenderOrder = value;
                this.buildNativeDisplayList();
            }
        }

        public get apexIndex(): number {
            return this._apexIndex;
        }

        public set apexIndex(value: number) {
            if (this._apexIndex != value) {
                this._apexIndex = value;

                if (this._childrenRenderOrder == ChildrenRenderOrder.Arch)
                    this.buildNativeDisplayList();
            }
        }

        public get mask(): egret.DisplayObject | egret.Rectangle {
            return this._rootContainer.mask;
        }

        public set mask(value: egret.DisplayObject | egret.Rectangle) {
            this._rootContainer.mask = value;
        }

        public get baseUserData(): string {
            var buffer: ByteBuffer = this.packageItem.rawData;
            buffer.seek(0, 4);
            return buffer.readS();
        }

        protected updateScrollRect() {
            var rect: egret.Rectangle = this._rootContainer.scrollRect;
            if (rect == null)
                rect = new egret.Rectangle();

            var w: number = this.width - this._margin.right;
            var h: number = this.height - this._margin.bottom;
            rect.setTo(0, 0, w, h);
            this._rootContainer.scrollRect = rect;
        }

        protected setupScroll(buffer: ByteBuffer): void {
            if (this._rootContainer == this._container) {
                this._container = new egret.DisplayObjectContainer();
                this._rootContainer.addChild(this._container);
            }
            this._scrollPane = new ScrollPane(this);
            this._scrollPane.setup(buffer);
            this.setBoundsChangedFlag();
        }

        protected setupOverflow(overflow: OverflowType): void {
            if (overflow == OverflowType.Hidden) {
                if (this._rootContainer == this._container) {
                    this._container = new egret.DisplayObjectContainer();
                    this._rootContainer.addChild(this._container);
                }
                this.updateScrollRect();
                this._container.x = this._margin.left;
                this._container.y = this._margin.top;
            }
            else if (this._margin.left != 0 || this._margin.top != 0) {
                if (this._rootContainer == this._container) {
                    this._container = new egret.DisplayObjectContainer();
                    this._rootContainer.addChild(this._container);
                }
                this._container.x = this._margin.left;
                this._container.y = this._margin.top;
            }

            this.setBoundsChangedFlag();
        }

        protected handleSizeChanged(): void {
            super.handleSizeChanged();

            if (this._scrollPane)
                this._scrollPane.onOwnerSizeChanged();
            else if (this._rootContainer.scrollRect)
                this.updateScrollRect();

            if (this._rootContainer.hitArea instanceof PixelHitTest) {
                var hitTest: PixelHitTest = <PixelHitTest>(this._rootContainer.hitArea);
                if (this.sourceWidth != 0)
                    hitTest.scaleX = this._width / this.sourceWidth;
                if (this.sourceHeight != 0)
                    hitTest.scaleY = this._height / this.sourceHeight;
            }
        }

        protected handleGrayedChanged(): void {
            var c: Controller = this.getController("grayed");
            if (c) {
                c.selectedIndex = this.grayed ? 1 : 0;
                return;
            }

            var v: boolean = this.grayed;
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; ++i) {
                this._children[i].grayed = v;
            }
        }

        public handleControllerChanged(c: Controller): void {
            super.handleControllerChanged(c);

            if (this._scrollPane)
                this._scrollPane.handleControllerChanged(c);
        }

        public setBoundsChangedFlag(): void {
            if (!this._scrollPane && !this._trackBounds)
                return;

            if (!this._boundsChanged) {
                this._boundsChanged = true;

                egret.callLater(this.__render, this);
            }
        }

        private __render(): void {
            if (this._boundsChanged) {
                var len: number = this._children.length;
                if (len > 0) {
                    for (var i: number = 0; i < len; i++) {
                        var child: GObject = this._children[i];
                        child.ensureSizeCorrect();
                    }
                }

                this.updateBounds();
            }
        }

        public ensureBoundsCorrect(): void {
            var len: number = this._children.length;
            if (len > 0) {
                for (var i: number = 0; i < len; i++) {
                    var child: GObject = this._children[i];
                    child.ensureSizeCorrect();
                }
            }

            if (this._boundsChanged)
                this.updateBounds();
        }

        protected updateBounds(): void {
            var ax: number = 0, ay: number = 0, aw: number = 0, ah: number = 0;
            var len: number = this._children.length;
            if (len > 0) {
                ax = Number.POSITIVE_INFINITY, ay = Number.POSITIVE_INFINITY;
                var ar: number = Number.NEGATIVE_INFINITY, ab: number = Number.NEGATIVE_INFINITY;
                var tmp: number = 0;
                var i: number = 0;

                for (var i: number = 0; i < len; i++) {
                    var child: GObject = this._children[i];
                    tmp = child.x;
                    if (tmp < ax)
                        ax = tmp;
                    tmp = child.y;
                    if (tmp < ay)
                        ay = tmp;
                    tmp = child.x + child.actualWidth;
                    if (tmp > ar)
                        ar = tmp;
                    tmp = child.y + child.actualHeight;
                    if (tmp > ab)
                        ab = tmp;
                }
                aw = ar - ax;
                ah = ab - ay;
            }

            this.setBounds(ax, ay, aw, ah);
        }

        public setBounds(ax: number, ay: number, aw: number, ah: number = 0): void {
            this._boundsChanged = false;

            if (this._scrollPane)
                this._scrollPane.setContentSize(Math.round(ax + aw), Math.round(ay + ah));
        }

        public get viewWidth(): number {
            if (this._scrollPane)
                return this._scrollPane.viewWidth;
            else
                return this.width - this._margin.left - this._margin.right;
        }

        public set viewWidth(value: number) {
            if (this._scrollPane)
                this._scrollPane.viewWidth = value;
            else
                this.width = value + this._margin.left + this._margin.right;
        }

        public get viewHeight(): number {
            if (this._scrollPane)
                return this._scrollPane.viewHeight;
            else
                return this.height - this._margin.top - this._margin.bottom;
        }

        public set viewHeight(value: number) {
            if (this._scrollPane)
                this._scrollPane.viewHeight = value;
            else
                this.height = value + this._margin.top + this._margin.bottom;
        }

        public getSnappingPosition(xValue: number, yValue: number, resultPoint?: egret.Point): egret.Point {
            if (!resultPoint)
                resultPoint = new egret.Point();

            var cnt: number = this._children.length;
            if (cnt == 0) {
                resultPoint.x = 0;
                resultPoint.y = 0;
                return resultPoint;
            }

            this.ensureBoundsCorrect();

            var obj: GObject = null;
            var prev: GObject = null;
            var i: number = 0;
            if (yValue != 0) {
                for (; i < cnt; i++) {
                    obj = this._children[i];
                    if (yValue < obj.y) {
                        if (i == 0) {
                            yValue = 0;
                            break;
                        }
                        else {
                            prev = this._children[i - 1];
                            if (yValue < prev.y + prev.actualHeight / 2) //top half part
                                yValue = prev.y;
                            else //bottom half part
                                yValue = obj.y;
                            break;
                        }
                    }
                }

                if (i == cnt)
                    yValue = obj.y;
            }

            if (xValue != 0) {
                if (i > 0)
                    i--;
                for (; i < cnt; i++) {
                    obj = this._children[i];
                    if (xValue < obj.x) {
                        if (i == 0) {
                            xValue = 0;
                            break;
                        }
                        else {
                            prev = this._children[i - 1];
                            if (xValue < prev.x + prev.actualWidth / 2) //top half part
                                xValue = prev.x;
                            else //bottom half part
                                xValue = obj.x;
                            break;
                        }
                    }
                }

                if (i == cnt)
                    xValue = obj.x;
            }

            resultPoint.x = xValue;
            resultPoint.y = yValue;
            return resultPoint;
        }

        public childSortingOrderChanged(child: GObject, oldValue: number, newValue: number = 0): void {
            if (newValue == 0) {
                this._sortingChildCount--;
                this.setChildIndex(child, this._children.length);
            }
            else {
                if (oldValue == 0)
                    this._sortingChildCount++;

                var oldIndex: number = this._children.indexOf(child);
                var index: number = this.getInsertPosForSortingChild(child);
                if (oldIndex < index)
                    this._setChildIndex(child, oldIndex, index - 1);
                else
                    this._setChildIndex(child, oldIndex, index);
            }
        }

        public constructFromResource(): void {
            this.constructFromResource2(null, 0);
        }

        public constructFromResource2(objectPool: Array<GObject>, poolIndex: number): void {
            var contentItem: PackageItem = this.packageItem.getBranch();

            if (!contentItem.decoded) {
                contentItem.decoded = true;
                TranslationHelper.translateComponent(contentItem);
            }

            var i: number;
            var dataLen: number;
            var curPos: number;
            var nextPos: number;
            var f1: number;
            var f2: number;
            var i1: number;
            var i2: number;

            var buffer: ByteBuffer = contentItem.rawData;
            buffer.seek(0, 0);

            this._underConstruct = true;

            this.sourceWidth = buffer.readInt();
            this.sourceHeight = buffer.readInt();
            this.initWidth = this.sourceWidth;
            this.initHeight = this.sourceHeight;

            this.setSize(this.sourceWidth, this.sourceHeight);

            if (buffer.readBool()) {
                this.minWidth = buffer.readInt();
                this.maxWidth = buffer.readInt();
                this.minHeight = buffer.readInt();
                this.maxHeight = buffer.readInt();
            }

            if (buffer.readBool()) {
                f1 = buffer.readFloat();
                f2 = buffer.readFloat();
                this.internalSetPivot(f1, f2, buffer.readBool());
            }

            if (buffer.readBool()) {
                this._margin.top = buffer.readInt();
                this._margin.bottom = buffer.readInt();
                this._margin.left = buffer.readInt();
                this._margin.right = buffer.readInt();
            }

            var overflow: number = buffer.readByte();
            if (overflow == OverflowType.Scroll) {
                var savedPos: number = buffer.position;
                buffer.seek(0, 7);
                this.setupScroll(buffer);
                buffer.position = savedPos;
            }
            else
                this.setupOverflow(overflow);

            if (buffer.readBool())
                buffer.skip(8);

            this._buildingDisplayList = true;

            buffer.seek(0, 1);

            var controllerCount: number = buffer.readShort();
            for (i = 0; i < controllerCount; i++) {
                nextPos = buffer.readShort();
                nextPos += buffer.position;

                var controller: Controller = new Controller();
                this._controllers.push(controller);
                controller.parent = this;
                controller.setup(buffer);

                buffer.position = nextPos;
            }

            buffer.seek(0, 2);

            var child: GObject;
            var childCount: number = buffer.readShort();
            for (i = 0; i < childCount; i++) {
                dataLen = buffer.readShort();
                curPos = buffer.position;

                if (objectPool)
                    child = objectPool[poolIndex + i];
                else {
                    buffer.seek(curPos, 0);

                    var type: ObjectType = buffer.readByte();
                    var src: string = buffer.readS();
                    var pkgId: string = buffer.readS();

                    var pi: PackageItem = null;
                    if (src != null) {
                        var pkg: UIPackage;
                        if (pkgId != null)
                            pkg = UIPackage.getById(pkgId);
                        else
                            pkg = contentItem.owner;

                        pi = pkg ? pkg.getItemById(src) : null;
                    }

                    if (pi) {
                        child = UIObjectFactory.newObject(pi);
                        child.constructFromResource();
                    }
                    else
                        child = UIObjectFactory.newObject(type);
                }

                child._underConstruct = true;
                child.setup_beforeAdd(buffer, curPos);
                child.parent = this;
                this._children.push(child);

                buffer.position = curPos + dataLen;
            }

            buffer.seek(0, 3);
            this.relations.setup(buffer, true);

            buffer.seek(0, 2);
            buffer.skip(2);

            for (i = 0; i < childCount; i++) {
                nextPos = buffer.readShort();
                nextPos += buffer.position;

                buffer.seek(buffer.position, 3);
                this._children[i].relations.setup(buffer, false);

                buffer.position = nextPos;
            }

            buffer.seek(0, 2);
            buffer.skip(2);

            for (i = 0; i < childCount; i++) {
                nextPos = buffer.readShort();
                nextPos += buffer.position;

                child = this._children[i];
                child.setup_afterAdd(buffer, buffer.position);
                child._underConstruct = false;

                buffer.position = nextPos;
            }

            buffer.seek(0, 4);

            buffer.skip(2); //customData
            this.opaque = buffer.readBool();
            var maskId: number = buffer.readShort();
            if (maskId != -1) {
                this.mask = this.getChildAt(maskId).displayObject;
                buffer.readBool(); //reversedMask
            }
            var hitTestId: string = buffer.readS();
            i1 = buffer.readInt();
            i2 = buffer.readInt();
            if (hitTestId != null) {
                pi = contentItem.owner.getItemById(hitTestId);
                if (pi && pi.pixelHitTestData)
                    this._rootContainer.hitArea = new PixelHitTest(pi.pixelHitTestData, i1, i2);
            }
            else if (i1 != 0 && i2 != -1) {
                this._rootContainer.hitArea = this.getChildAt(i2).displayObject;
            }

            buffer.seek(0, 5);

            var transitionCount: number = buffer.readShort();
            for (i = 0; i < transitionCount; i++) {
                nextPos = buffer.readShort();
                nextPos += buffer.position;

                var trans: Transition = new Transition(this);
                trans.setup(buffer);
                this._transitions.push(trans);

                buffer.position = nextPos;
            }

            if (this._transitions.length > 0) {
                this.displayObject.addEventListener(egret.Event.ADDED_TO_STAGE, this.___added, this);
                this.displayObject.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.___removed, this);
            }

            this.applyAllControllers();

            this._buildingDisplayList = false;
            this._underConstruct = false;

            this.buildNativeDisplayList();
            this.setBoundsChangedFlag();

            if (contentItem.objectType != ObjectType.Component)
                this.constructExtension(buffer);

            this.onConstruct();
        }

        protected onConstruct(): void {
            this.constructFromXML(null);
        }

        protected constructExtension(buffer: ByteBuffer): void {
        }

        protected constructFromXML(xml: any): void {
        }

        public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_afterAdd(buffer, beginPos);

            buffer.seek(beginPos, 4);

            var pageController: number = buffer.readShort();
            if (pageController != -1 && this._scrollPane)
                this._scrollPane.pageController = this._parent.getControllerAt(pageController);

            var cnt: number = buffer.readShort();
            for (var i: number = 0; i < cnt; i++) {
                var cc: Controller = this.getController(buffer.readS());
                var pageId: string = buffer.readS();
                if (cc)
                    cc.selectedPageId = pageId;
            }

            if (buffer.version >= 2) {
                cnt = buffer.readShort();
                for (i = 0; i < cnt; i++) {
                    var target: string = buffer.readS();
                    var propertyId: number = buffer.readShort();
                    var value: String = buffer.readS();
                    var obj: GObject = this.getChildByPath(target);
                    if (obj)
                        obj.setProp(propertyId, value);
                }
            }
        }

        private ___added(evt: egret.Event): void {
            var cnt: number = this._transitions.length;
            for (var i: number = 0; i < cnt; ++i) {
                this._transitions[i].onOwnerAddedToStage();
            }
        }

        private ___removed(evt: egret.Event): void {
            var cnt: number = this._transitions.length;
            for (var i: number = 0; i < cnt; ++i) {
                this._transitions[i].onOwnerRemovedFromStage();
            }
        }
    }
}