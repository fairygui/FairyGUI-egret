
module fairygui {

    export class GComponent extends GObject {
        private _boundsChanged: boolean;
        private _bounds: egret.Rectangle;
        private _sortingChildCount: number = 0;
        private _opaque: boolean;

        protected _margin: Margin;
        protected _trackBounds: boolean;
        
        public _buildingDisplayList: boolean;
        public _children: Array<GObject>;
        public _controllers: Array<Controller>;
        public _transitions: Array<Transition>;
        public _rootContainer: UIContainer;
        public _container: egret.DisplayObjectContainer;
        public _scrollPane: ScrollPane;

        public constructor() {
            super();
            this._bounds = new egret.Rectangle();
            this._children = new Array<GObject>();
            this._controllers = new Array<Controller>();
            this._transitions = new Array<Transition>();
            this._margin = new Margin();
            this.opaque = true;
        }

        protected createDisplayObject(): void {
            this._rootContainer = new UIContainer(this);
            this.setDisplayObject(this._rootContainer);
            this._container = this._rootContainer;
        }

        public dispose(): void {
            var numChildren: number = this._children.length;
            for(var i: number = numChildren - 1;i >= 0;--i)
                this._children[i].dispose();

            if(this._scrollPane != null)
                this._scrollPane.dispose();

            super.dispose();
        }

        public get displayListContainer(): egret.DisplayObjectContainer {
            return this._container;
        }

        public addChild(child: GObject): GObject {
            this.addChildAt(child,this._children.length);
            return child;
        }

        public addChildAt(child: GObject,index: number = 0): GObject {
            if(!child)
                throw "child is null";

            var numChildren: number = this._children.length;

            if(index >= 0 && index <= numChildren) {
                if(child.parent == this) {
                    this.setChildIndex(child,index);
                }
                else {
                    child.removeFromParent();
                    child.parent = this;

                    var cnt: number = this._children.length;
                    if(child.sortingOrder != 0) {
                        this._sortingChildCount++;
                        index = this.getInsertPosForSortingChild(child);
                    }
                    else if(this._sortingChildCount > 0) {
                        if(index > (cnt - this._sortingChildCount))
                            index = cnt - this._sortingChildCount;
                    }

                    if(index == cnt)
                        this._children.push(child);
                    else
                        this._children.splice(index,0,child);

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
            for(i = 0;i < cnt;i++) {
                var child: GObject = this._children[i];
                if(child == target)
                    continue;

                if(target.sortingOrder < child.sortingOrder)
                    break;
            }
            return i;
        }

        public removeChild(child: GObject,dispose: boolean = false): GObject {
            var childIndex: number = this._children.indexOf(child);
            if(childIndex != -1) {
                this.removeChildAt(childIndex,dispose);
            }
            return child;
        }

        public removeChildAt(index: number,dispose: boolean = false): GObject {
            if(index >= 0 && index < this.numChildren) {
                var child: GObject = this._children[index];
                child.parent = null;

                if(child.sortingOrder != 0)
                    this._sortingChildCount--;

                this._children.splice(index,1);
                if(child.inContainer)
                    this._container.removeChild(child.displayObject);

                if(dispose)
                    child.dispose();

                this.setBoundsChangedFlag();

                return child;
            }
            else {
                throw "Invalid child index";
            }
        }

        public removeChildren(beginIndex: number = 0,endIndex: number = -1,dispose: boolean = false): void {
            if(endIndex < 0 || endIndex >= this.numChildren)
                endIndex = this.numChildren - 1;

            for(var i: number = beginIndex;i <= endIndex;++i)
                this.removeChildAt(beginIndex,dispose);
        }

        public getChildAt(index: number = 0): GObject {
            if(index >= 0 && index < this.numChildren)
                return this._children[index];
            else
                throw "Invalid child index";
        }

        public getChild(name: string): GObject {
            var cnt: number = this._children.length;
            for(var i: number = 0;i < cnt;++i) {
                if(this._children[i].name == name)
                    return this._children[i];
            }

            return null;
        }

        public getVisibleChild(name: string): GObject {
            var cnt: number = this._children.length;
            for(var i: number = 0;i < cnt;++i) {
                var child: GObject = this._children[i];
                if(child.finalVisible && child.name == name)
                    return child;
            }

            return null;
        }

        public getChildInGroup(name: string,group: GGroup): GObject {
            var cnt: number = this._children.length;
            for(var i: number = 0;i < cnt;++i) {
                var child: GObject = this._children[i];
                if(child.group == group && child.name == name)
                    return child;
            }

            return null;
        }

        public getChildById(id: string): GObject {
            var cnt: number = this._children.length;
            for(var i: number = 0;i < cnt;++i) {
                if(this._children[i]._id == id)
                    return this._children[i];
            }

            return null;
        }

        public getChildIndex(child: GObject): number {
            return this._children.indexOf(child);
        }

        public setChildIndex(child: GObject,index: number = 0): void {
            var oldIndex: number = this._children.indexOf(child);
            if(oldIndex == -1)
                throw "Not a child of this container";

            if(child.sortingOrder != 0) //no effect
                return;

            var cnt: number = this._children.length;
            if(this._sortingChildCount > 0) {
                if(index > (cnt - this._sortingChildCount - 1))
                    index = cnt - this._sortingChildCount - 1;
            }

            this._setChildIndex(child,oldIndex,index);
        }

        private _setChildIndex(child: GObject,oldIndex: number,index: number = 0): void {
            var cnt: number = this._children.length;
            if(index > cnt)
                index = cnt;

            if(oldIndex == index)
                return;

            this._children.splice(oldIndex,1);
            this._children.splice(index,0,child);

            if(child.inContainer) {
                var displayIndex: number = 0;
                for(var i: number = 0;i < index;i++) {
                    var g: GObject = this._children[i];
                    if(g.inContainer)
                        displayIndex++;
                }
                if(displayIndex == this._container.numChildren)
                    displayIndex--;
                this._container.setChildIndex(child.displayObject,displayIndex);

                this.setBoundsChangedFlag();
            }
        }

        public swapChildren(child1: GObject,child2: GObject): void {
            var index1: number = this._children.indexOf(child1);
            var index2: number = this._children.indexOf(child2);
            if(index1 == -1 || index2 == -1)
                throw "Not a child of this container";
            this.swapChildrenAt(index1,index2);
        }

        public swapChildrenAt(index1: number,index2: number = 0): void {
            var child1: GObject = this._children[index1];
            var child2: GObject = this._children[index2];

            this.setChildIndex(child1,index2);
            this.setChildIndex(child2,index1);
        }

        public get numChildren(): number {
            return this._children.length;
        }

        public addController(controller: Controller): void {
            this._controllers.push(controller);
            controller._parent = this;
            this.applyController(controller);
        }

        public getController(name: string): Controller {
            var cnt: number = this._controllers.length;
            for(var i: number = 0;i < cnt;++i) {
                var c: Controller = this._controllers[i];
                if(c.name == name)
                    return c;
            }

            return null;
        }

        public removeController(c: Controller): void {
            var index: number = this._controllers.indexOf(c);
            if(index == -1)
                throw new Error("controller not exists");

            c._parent = null;
            this._controllers.splice(index,1);

            var length: number = this._children.length;
            for(var i: number = 0;i < length;i++) {
                var child: GObject = this._children[i];
                child.handleControllerChanged(c);
            }
        }
        
        public get controllers(): Array<Controller> {
            return this._controllers;
        }

        public childStateChanged(child: GObject): void {
            if(this._buildingDisplayList)
                return;

            if(child instanceof GGroup) {
                var length: number = this._children.length;
                for(var i: number = 0;i < length;i++) {
                    var g: GObject = this._children[i];
                    if(g.group == child)
                        this.childStateChanged(g);
                }
                return;
            }

            if(!child.displayObject)
                return;

            if(child.finalVisible) {
                if(!child.displayObject.parent) {
                    var index: number = 0;
                    var length1: number = this._children.length;
                    for(var i1: number = 0;i1 < length1;i1++) {
                        g = this._children[i1];
                        if(g == child)
                            break;

                        if(g.displayObject && g.displayObject.parent)
                            index++;
                    }
                    this._container.addChildAt(child.displayObject,index);
                }
            }
            else {
                if(child.displayObject.parent)
                    this._container.removeChild(child.displayObject);
            }
        }

        public applyController(c: Controller): void {
            var child: GObject;
            var length: number = this._children.length;
            for(var i: number = 0;i < length;i++) {
                child = this._children[i];
                child.handleControllerChanged(c);
            }
        }

        public applyAllControllers(): void {
            var cnt: number = this._controllers.length;
            for(var i: number = 0;i < cnt;++i) {
                this.applyController(this._controllers[i]);
            }
        }

        public getTransition(transName: string): Transition {
            var cnt: number = this._transitions.length;
            for(var i: number = 0;i < cnt;++i) {
                var trans: Transition = this._transitions[i];
                if(trans.name == transName)
                    return trans;
            }

            return null;
        }

        public isChildInView(child: GObject): boolean {
            if(this._rootContainer.mask != null) {
                return child.x + child.width >= 0 && child.x <= this.width
                    && child.y + child.height >= 0 && child.y <= this.height;
            }
            else if(this._scrollPane != null) {
                return this._scrollPane.isChildInView(child);
            }
            else
                return true;
        }

        public get scrollPane(): ScrollPane {
            return this._scrollPane;
        }

        public get opaque(): boolean {
            return this._opaque;
        }

        public set opaque(value: boolean) {
            if(this._opaque != value) {
                this._opaque = value;
                if(this._opaque)
                    this.updateOpaque();
                else
                    this._rootContainer.hitArea = null;
            }
        }
        
        protected updateOpaque() {
            if(!this._rootContainer.hitArea)
                this._rootContainer.hitArea = new egret.Rectangle();
            this._rootContainer.hitArea.setTo(0, 0, this.width, this.height);
        }
        
        protected updateMask() {
            var mask: egret.Rectangle;
            if(this._rootContainer.mask)
                mask = <egret.Rectangle>this._rootContainer.mask;
            else
                mask = new egret.Rectangle();

            var left: number = this._margin.left;
            var top: number = this._margin.top;
            var w: number = this.width - (this._margin.left + this._margin.right);
            var h: number = this.height - (this._margin.top + this._margin.bottom);
            mask.setTo(left,top,w,h);
            this._rootContainer.mask = mask;
        }

        protected setupOverflowAndScroll(overflow: OverflowType,
            scrollBarMargin: Margin,
            scroll: ScrollType,
            scrollBarDisplay: ScrollBarDisplayType,
            flags: number = 0): void {
            if(overflow == OverflowType.Hidden) {
                this._container = new egret.DisplayObjectContainer();
                this._rootContainer.addChild(this._container);
                this.updateMask();
                this._container.x = this._margin.left;
                this._container.y = this._margin.top;
            }
            else if(overflow == OverflowType.Scroll) {
                this._container = new egret.DisplayObjectContainer();
                this._rootContainer.addChild(this._container);
                this._scrollPane = new ScrollPane(this,scroll,this._margin,scrollBarMargin,scrollBarDisplay,flags);
            }
            else if(this._margin.left != 0 || this._margin.top != 0) {
                this._container = new egret.DisplayObjectContainer();
                this._rootContainer.addChild(this._container);
                this._container.x = this._margin.left;
                this._container.y = this._margin.top;
            }

            this.setBoundsChangedFlag();
        }

        protected handleSizeChanged(): void {
            if(this._scrollPane)
                this._scrollPane.setSize(this.width,this.height);
            else if(this._rootContainer.mask != null)
                this.updateMask();

            if(this._opaque)
                this.updateOpaque();

            this._rootContainer.scaleX = this.scaleX;
            this._rootContainer.scaleY = this.scaleY;
        }

        protected handleGrayChanged(): void {
            var c: Controller = this.getController("grayed");
            if(c != null) {
                c.selectedIndex = this.grayed ? 1 : 0;
                return;
            }

            var v: boolean = this.grayed;
            var cnt: number = this._children.length;
            for(var i: number = 0;i < cnt;++i) {
                this._children[i].grayed = v;
            }
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
            if (this._boundsChanged)
                this.updateBounds();
        }

        public ensureBoundsCorrect(): void {
            if (this._boundsChanged)
                this.updateBounds();
        }

        protected updateBounds(): void {
            var ax: number,ay: number,aw: number,ah: number = 0;
            if(this._children.length > 0) {
                ax = Number.POSITIVE_INFINITY,ay = Number.POSITIVE_INFINITY;
                var ar: number = Number.NEGATIVE_INFINITY,ab: number = Number.NEGATIVE_INFINITY;
                var tmp: number = 0;

                var i: number = 0;
                var length1: number = this._children.length;
                
                for(i1 = 0;i1 < length1;i1++) {
                    child = this._children[i1];
                    child.ensureSizeCorrect();
                }
                
                for(var i1: number = 0;i1 < length1;i1++) {
                    var child: GObject = this._children[i1];
                    tmp = child.x;
                    if(tmp < ax)
                        ax = tmp;
                    tmp = child.y;
                    if(tmp < ay)
                        ay = tmp;
                    tmp = child.x + child.actualWidth;
                    if(tmp > ar)
                        ar = tmp;
                    tmp = child.y + child.actualHeight;
                    if(tmp > ab)
                        ab = tmp;
                }
                aw = ar - ax;
                ah = ab - ay;
            }
            else {
                ax = 0;
                ay = 0;
                aw = 0;
                ah = 0;
            }
            if(ax != this._bounds.x || ay != this._bounds.y || aw != this._bounds.width || ah != this._bounds.height)
                this.setBounds(ax,ay,aw,ah);
            else
                this._boundsChanged = false;
        }

        public setBounds(ax: number, ay: number, aw: number, ah: number = 0): void {
            this._boundsChanged = false;
            this._bounds.x = ax;
            this._bounds.y = ay;
            this._bounds.width = aw;
            this._bounds.height = ah;

            if (this._scrollPane)
                this._scrollPane.setContentSize(this._bounds.x + this._bounds.width, this._bounds.y + this._bounds.height);
        }

        public get bounds(): egret.Rectangle {
            if (this._boundsChanged)
                this.updateBounds();
            return this._bounds;
        }

        public get viewWidth(): number {
            if (this._scrollPane != null)
                return this._scrollPane.viewWidth;
            else
                return this.width - this._margin.left - this._margin.right;
        }

        public set viewWidth(value: number) {
            if (this._scrollPane != null)
                this._scrollPane.viewWidth = value;
            else
                this.width = value + this._margin.left + this._margin.right;
        }

        public get viewHeight(): number {
            if (this._scrollPane != null)
                return this._scrollPane.viewHeight;
            else
                return this.height - this._margin.top - this._margin.bottom;
        }

        public set viewHeight(value: number) {
            if (this._scrollPane != null)
                this._scrollPane.viewHeight = value;
            else
                this.height = value + this._margin.top + this._margin.bottom;
        }

        public findObjectNear(xValue: number, yValue: number, resultPoint?:egret.Point): egret.Point {
            if(!resultPoint)
                resultPoint = new egret.Point();
           
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

        public constructFromResource(pkgItem: PackageItem): void {
            this._packageItem = pkgItem;
            this.constructFromXML(this._packageItem.owner.getItemAsset(this._packageItem));
        }

        protected constructFromXML(xml: any): void {
            this._underConstruct = true;
            
            var str: string;
            var arr: string[];

            str = xml.attributes.size;
            arr = str.split(",");
            this._sourceWidth = parseInt(arr[0]);
            this._sourceHeight = parseInt(arr[1]);
            this._initWidth = this._sourceWidth;
            this._initHeight = this._sourceHeight;

            var overflow: OverflowType;
            str = xml.attributes.overflow;
            if (str)
                overflow = parseOverflowType(str);
            else
                overflow = OverflowType.Visible;

            var scroll: ScrollType;
            str = xml.attributes.scroll;
            if (str)
                scroll = parseScrollType(str);
            else
                scroll = ScrollType.Vertical;

            var scrollBarDisplay: ScrollBarDisplayType;
            str = xml.attributes.scrollBar;
            if (str)
                scrollBarDisplay = parseScrollBarDisplayType(str);
            else
                scrollBarDisplay = ScrollBarDisplayType.Default;
            
            var scrollBarFlags: number;
            str = xml.attributes.scrollBarFlags;
            if(str)
                scrollBarFlags = parseInt(str);
            else
                scrollBarFlags = 0;
            
            var scrollBarMargin: Margin;
            if(overflow==OverflowType.Scroll)
            {
                scrollBarMargin = new Margin();
                str = xml.attributes.scrollBarMargin;
                if(str)
                    scrollBarMargin.parse(str);
            }

            str = xml.attributes.margin;
            if (str)
                this._margin.parse(str);

            this.setSize(this._sourceWidth, this._sourceHeight);
            this.setupOverflowAndScroll(overflow, scrollBarMargin, scroll, scrollBarDisplay, scrollBarFlags);

            this._buildingDisplayList = true;

            var col: any = xml.children;
            if(col) {
                var displayList: any = null;
                var controller: Controller;
                var length1: number = col.length;
                for(var i1: number = 0;i1 < length1;i1++) {
                    var cxml: any = col[i1];
                    if(cxml.name == "displayList") {
                        displayList = cxml.children;
                        continue;
                    }
                    else if(cxml.name == "controller") {
                        controller = new Controller();
                        this._controllers.push(controller);
                        controller._parent = this;
                        controller.setup(cxml);
                    }
                }

                if(displayList) {
                    var u: GObject;
                    var length2: number = displayList.length;
                    for(var i2: number = 0;i2 < length2;i2++) {
                        cxml = displayList[i2];
                        u = this.constructChild(cxml);
                        if(!u)
                            continue;

                        u._underConstruct = true;
                        u._constructingData = cxml;
                        u.setup_beforeAdd(cxml);
                        this.addChild(u);
                    }
                }

                this.relations.setup(xml);

                length2 = this._children.length;
                for(i2 = 0;i2 < length2;i2++) {
                    u = this._children[i2];
                    u.relations.setup(u._constructingData);
                }
                
                for(i2 = 0;i2 < length2;i2++) {
                    u = this._children[i2];
                    u.setup_afterAdd(u._constructingData);
                    u._underConstruct = false;
                    u._constructingData = null;
                }

                var trans: Transition;
                for(i1 = 0;i1 < length1;i1++) {
                    var cxml: any = col[i1];
                    if(cxml.name == "transition") {
                        trans = new Transition(this);
                        this._transitions.push(trans);
                        trans.setup(cxml);
                    }
                }
            }

            this.applyAllControllers();

            this._buildingDisplayList = false;
            this._underConstruct = false;
            
            length1 = this._children.length;
            for (i1 = 0; i1 < length1; i1++) {
                var child: GObject = this._children[i1];
                if (child.displayObject != null && child.finalVisible)
                    this._container.addChild(child.displayObject);
            }
        }

        private constructChild(xml: any): GObject {
            var pkgId: string = xml.attributes.pkg;
            var thisPkg: UIPackage = this._packageItem.owner;
            var pkg: UIPackage;
            if (pkgId && pkgId != thisPkg.id) {
                pkg = UIPackage.getById(pkgId);
                if (!pkg)
                    return null;
            }
            else
                pkg = thisPkg;

            var src: string = xml.attributes.src;
            if (src) {
                var pi: PackageItem = pkg.getItem(src);
                if (!pi)
                    return null;

                var g: GObject = pkg.createObject2(pi);
                return g;
            }
            else {
                var str: string = xml.name;
                if (str == "text" && xml.attributes.input == "true")
                    g = new GTextInput();
                else
                    g = UIObjectFactory.newObject2(str);
                return g;
            }
        }
    }
}