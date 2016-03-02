
module fairygui {

    export class GList extends GComponent {
        private _layout: ListLayoutType;        
        private _lineGap: number = 0;
        private _columnGap: number = 0;
        private _defaultItem: string;
        private _autoResizeItem: boolean;
        private _selectionMode: ListSelectionMode;
        private _lastSelectedIndex: number = 0;
        private _pool: GObjectPool;
        private _selectionHandled: boolean;

        public constructor() {
            super();

            this._trackBounds = true;
            this._pool = new GObjectPool();
            this._layout = ListLayoutType.SingleColumn;
            this._autoResizeItem = true;
            this._lastSelectedIndex = -1;
            this._selectionMode = ListSelectionMode.Single;
        }

        public dispose(): void {
            this._pool.clear();
            super.dispose();
        }

        public get layout(): ListLayoutType {
            return this._layout;
        }

        public set layout(value: ListLayoutType) {
            if (this._layout != value) {
                this._layout = value;
                this.setBoundsChangedFlag();
            }
        }

        public get lineGap(): number {
            return this._lineGap;
        }

        public set lineGap(value: number) {
            if (this._lineGap != value) {
                this._lineGap = value;
                this.setBoundsChangedFlag();
            }
        }

        public get columnGap(): number {
            return this._columnGap;
        }

        public set columnGap(value: number) {
            if (this._columnGap != value) {
                this._columnGap = value;
                this.setBoundsChangedFlag();
            }
        }

        public get defaultItem(): string {
            return this._defaultItem;
        }

        public set defaultItem(val: string) {
            this._defaultItem = val;
        }

        public get autoResizeItem(): boolean {
            return this._autoResizeItem;
        }

        public set autoResizeItem(value: boolean) {
            this._autoResizeItem = value;
        }

        public get selectionMode(): ListSelectionMode {
            return this._selectionMode;
        }

        public set selectionMode(value: ListSelectionMode) {
            this._selectionMode = value;
        }

        public getFromPool(url: string= null): GObject {
            if (!url)
                url = this._defaultItem;

            return this._pool.getObject(url);
        }

        public returnToPool(obj: GObject): void {
            this._pool.returnObject(obj);
        }

        public addChildAt(child: GObject, index: number = 0): GObject {
            if (this._autoResizeItem) {
                if (this._layout == ListLayoutType.SingleColumn)
                    child.width = this.viewWidth;
                else if (this._layout == ListLayoutType.SingleRow)
                    child.height = this.viewHeight;
            }

            super.addChildAt(child, index);

            if (child instanceof GButton) {
                var button: GButton = <GButton><any> child;
                button.selected = false;
                button.changeStateOnClick = false;
            }
            child.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__mouseDownItem, this);
            child.addEventListener(egret.TouchEvent.TOUCH_TAP, this.__clickItem, this);

            return child;
        }

        public addItem(url: string= null): GObject {
            if (!url)
                url = this._defaultItem;

            return this.addChild(UIPackage.createObjectFromURL(url));
        }

        public addItemFromPool(url: string= null): GObject {
            return this.addChild(this.getFromPool(url));
        }

        public removeChildAt(index: number, dispose: boolean= false): GObject {
            var child: GObject = super.removeChildAt(index, dispose);
            child.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__mouseDownItem, this);
            child.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.__clickItem, this);

            return child;
        }

        public removeChildToPoolAt(index: number = 0): void {
            var child: GObject = super.removeChildAt(index);
            this.returnToPool(child);
        }

        public removeChildToPool(child: GObject): void {
            super.removeChild(child);
            this.returnToPool(child);
        }

        public removeChildrenToPool(beginIndex: number= 0, endIndex: number= -1): void {
            if (endIndex < 0 || endIndex >= this.numChildren)
                endIndex = this.numChildren - 1;

            for (var i: number = beginIndex; i <= endIndex; ++i)
                this.removeChildToPoolAt(beginIndex);
        }

        public get selectedIndex(): number {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; i++) {
                var obj: GButton = this._children[i].asButton;
                if (obj != null && obj.selected)
                    return i;
            }
            return -1;
        }

        public set selectedIndex(value: number) {
            this.clearSelection();
            if (value >= 0 && value < this._children.length)
                this.addSelection(value);
        }

        public getSelection(): Array<number> {
            var ret: Array<number> = new Array<number>();
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; i++) {
                var obj: GButton = this._children[i].asButton;
                if (obj != null && obj.selected)
                    ret.push(i);
            }
            return ret;
        }

        public addSelection(index: number, scrollItToView: boolean= false): void {
            if (this._selectionMode == ListSelectionMode.None)
                return;

            if (this._selectionMode == ListSelectionMode.Single)
                this.clearSelection();

            var obj: GButton = this.getChildAt(index).asButton;
            if (obj != null) {
                if (!obj.selected)
                    obj.selected = true;
                if (scrollItToView && this._scrollPane != null)
                    this._scrollPane.scrollToView(obj);
            }
        }

        public removeSelection(index: number = 0): void {
            if (this._selectionMode == ListSelectionMode.None)
                return;

            var obj: GButton = this.getChildAt(index).asButton;
            if (obj != null && obj.selected)
                obj.selected = false;
        }

        public clearSelection(): void {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; i++) {
                var obj: GButton = this._children[i].asButton;
                if (obj != null)
                    obj.selected = false;
            }
        }

        public selectAll(): void {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; i++) {
                var obj: GButton = this._children[i].asButton;
                if (obj != null)
                    obj.selected = true;
            }
        }

        public selectNone(): void {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; i++) {
                var obj: GButton = this._children[i].asButton;
                if (obj != null)
                    obj.selected = false;
            }
        }

        public selectReverse(): void {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; i++) {
                var obj: GButton = this._children[i].asButton;
                if (obj != null)
                    obj.selected = !obj.selected;
            }
        }

        public handleArrowKey(dir: number = 0): void {
            var index: number = this.selectedIndex;
            if (index == -1)
                return;

            switch (dir) {
                case 1://up
                    if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowVertical) {
                        index--;
                        if (index >= 0) {
                            this.clearSelection();
                            this.addSelection(index, true);
                        }
                    }
                    else if (this._layout == ListLayoutType.FlowHorizontal) {
                        var current: GObject = this._children[index];
                        var k: number = 0;
                        for (var i: number = index - 1; i >= 0; i--) {
                            var obj: GObject = this._children[i];
                            if (obj.y != current.y) {
                                current = obj;
                                break;
                            }
                            k++;
                        }
                        for (; i >= 0; i--) {
                            obj = this._children[i];
                            if (obj.y != current.y) {
                                this.clearSelection();
                                this.addSelection(i + k + 1, true);
                                break;
                            }
                        }
                    }
                    break;

                case 3://right
                    if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowHorizontal) {
                        index++;
                        if (index < this._children.length) {
                            this.clearSelection();
                            this.addSelection(index, true);
                        }
                    }
                    else if (this._layout == ListLayoutType.FlowVertical) {
                        current = this._children[index];
                        k = 0;
                        var cnt: number = this._children.length;
                        for (i = index + 1; i < cnt; i++) {
                            obj = this._children[i];
                            if (obj.x != current.x) {
                                current = obj;
                                break;
                            }
                            k++;
                        }
                        for (; i < cnt; i++) {
                            obj = this._children[i];
                            if (obj.x != current.x) {
                                this.clearSelection();
                                this.addSelection(i - k - 1, true);
                                break;
                            }
                        }
                    }
                    break;

                case 5://down
                    if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowVertical) {
                        index++;
                        if (index < this._children.length) {
                            this.clearSelection();
                            this.addSelection(index, true);
                        }
                    }
                    else if (this._layout == ListLayoutType.FlowHorizontal) {
                        current = this._children[index];
                        k = 0;
                        cnt = this._children.length;
                        for (i = index + 1; i < cnt; i++) {
                            obj = this._children[i];
                            if (obj.y != current.y) {
                                current = obj;
                                break;
                            }
                            k++;
                        }
                        for (; i < cnt; i++) {
                            obj = this._children[i];
                            if (obj.y != current.y) {
                                this.clearSelection();
                                this.addSelection(i - k - 1, true);
                                break;
                            }
                        }
                    }
                    break;

                case 7://left
                    if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowHorizontal) {
                        index--;
                        if (index >= 0) {
                            this.clearSelection();
                            this.addSelection(index, true);
                        }
                    }
                    else if (this._layout == ListLayoutType.FlowVertical) {
                        current = this._children[index];
                        k = 0;
                        for (i = index - 1; i >= 0; i--) {
                            obj = this._children[i];
                            if (obj.x != current.x) {
                                current = obj;
                                break;
                            }
                            k++;
                        }
                        for (; i >= 0; i--) {
                            obj = this._children[i];
                            if (obj.x != current.x) {
                                this.clearSelection();
                                this.addSelection(i + k + 1, true);
                                break;
                            }
                        }
                    }
                    break;
            }
        }

        private __mouseDownItem(evt: egret.TouchEvent): void {
            var item: GButton = <GButton><any> (evt.currentTarget);
            if (item == null || this._selectionMode == ListSelectionMode.None)
                return;

            this._selectionHandled = false;

            if (UIConfig.defaultScrollTouchEffect && this.scrollPane != null)
                return;

            if (this._selectionMode == ListSelectionMode.Single) {
                this.setSelectionOnEvent(item);
            }
            else {
                if (!item.selected)
                    this.setSelectionOnEvent(item);
                //如果item.selected，这里不处理selection，因为可能用户在拖动
            }
        }

        private __clickItem(evt: egret.TouchEvent): void {
            if (this._scrollPane != null && this._scrollPane._isMouseMoved)
                return;

            var item: GObject = <GObject><any> (evt.currentTarget);
            if (!this._selectionHandled)
                this.setSelectionOnEvent(item);
            this._selectionHandled = false;
            
            if(this.scrollPane)
                this.scrollPane.scrollToView(item,true);

            var ie: ItemEvent = new ItemEvent(ItemEvent.CLICK, item);
            ie.stageX = evt.stageX;
            ie.stageY = evt.stageY;
            this.dispatchEvent(ie);
        }

        private setSelectionOnEvent(item: GObject): void {
            if (!(item instanceof GButton) || this._selectionMode == ListSelectionMode.None)
                return;

            this._selectionHandled = true;
            var dontChangeLastIndex: boolean = false;
            var button: GButton = <GButton><any> item;
            var index: number = this.getChildIndex(item);
            
            if (this._selectionMode == ListSelectionMode.Single) {
                if (!button.selected) {
                    this.clearSelectionExcept(button);
                    button.selected = true;
                }
            }
            else {
                if (GRoot.shiftKeyDown) {
                    if (!button.selected) {
                        if (this._lastSelectedIndex != -1) {
                            var min: number = Math.min(this._lastSelectedIndex, index);
                            var max: number = Math.max(this._lastSelectedIndex, index);
                            max = Math.min(max, this.numChildren - 1);
                            for (var i: number = min; i <= max; i++) {
                                var obj: GButton = this.getChildAt(i).asButton;
                                if (obj != null && !obj.selected)
                                    obj.selected = true;
                            }

                            dontChangeLastIndex = true;
                        }
                        else {
                            button.selected = true;
                        }
                    }
                }
                else if (GRoot.ctrlKeyDown || this._selectionMode == ListSelectionMode.Multiple_SingleClick) {
                    button.selected = !button.selected;
                }
                else {
                    if (!button.selected) {
                        this.clearSelectionExcept(button);
                        button.selected = true;
                    }
                    else
                        this.clearSelectionExcept(button);
                }
            }

            if (!dontChangeLastIndex)
                this._lastSelectedIndex = index;

            return;
        }

        private clearSelectionExcept(obj: GObject): void {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; i++) {
                var button: GButton = this._children[i].asButton;
                if (button != null && button != obj && button.selected)
                    button.selected = false;
            }
        }

        public resizeToFit(itemCount: number= Number.POSITIVE_INFINITY, minSize: number= 0): void {
            this.ensureBoundsCorrect();

            var curCount: number = this.numChildren;
            if (itemCount > curCount)
                itemCount = curCount;

            if (itemCount == 0) {
                if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal)
                    this.viewHeight = minSize;
                else
                    this.viewWidth = minSize;
            }
            else {
                var i: number = itemCount - 1;
                var obj: GObject = null;
                while (i >= 0) {
                    obj = this.getChildAt(i);
                    if (obj.visible)
                        break;
                    i--;
                }
                if (i < 0) {
                    if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal)
                        this.viewHeight = minSize;
                    else
                        this.viewWidth = minSize;
                }
                else {
                    var size: number = 0;
                    if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
                        size = obj.y + obj.height;
                        if (size < minSize)
                            size = minSize;
                        this.viewHeight = size;
                    }
                    else {
                        size = obj.x + obj.width;
                        if (size < minSize)
                            size = minSize;
                        this.viewWidth = size;
                    }
                }
            }
        }

        public getMaxItemWidth(): number {
            var cnt: number = this.numChildren;
            var max: number = 0;
            for (var i: number = 0; i < cnt; i++) {
                var child: GObject = this.getChildAt(i);
                if (child.width > max)
                    max = child.width;
            }
            return max;
        }

        protected handleSizeChanged(): void {
            super.handleSizeChanged();

            if (this._autoResizeItem)
                this.adjustItemsSize();

            if (this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.FlowVertical)
                this.setBoundsChangedFlag();
        }

        public adjustItemsSize(): void {
            if (this._layout == ListLayoutType.SingleColumn) {
                var cnt: number = this.numChildren;
                var cw: number = this.viewWidth;
                for (var i: number = 0; i < cnt; i++) {
                    var child: GObject = this.getChildAt(i);
                    child.width = cw;
                }
            }
            else if (this._layout == ListLayoutType.SingleRow) {
                cnt = this.numChildren;
                var ch: number = this.viewHeight;
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    child.height = ch;
                }
            }
        }

        public findObjectNear(xValue: number, yValue: number, resultPoint?:egret.Point):egret.Point {
            if(!resultPoint)
                resultPoint = new egret.Point();
                
            var cnt: number = this._children.length;
            if(cnt==0) {
                resultPoint.x = 0;
                resultPoint.y = 0;
                return resultPoint;
            }
            
            this.ensureBoundsCorrect();
            var obj: GObject = null;
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
                            var prev: GObject = this._children[i - 1];
                            if (yValue < prev.y + prev.actualHeight / 2) //inside item, top half part
                                yValue = prev.y;
                            else if (yValue < prev.y + prev.actualHeight)//inside item, bottom half part
                                yValue = obj.y;
                            else //between two items
                                yValue = obj.y + this._lineGap / 2;
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
                            if (xValue < prev.x + prev.actualWidth / 2) //inside item, top half part
                                xValue = prev.x;
                            else if (xValue < prev.x + prev.actualWidth)//inside item, bottom half part
                                xValue = obj.x;
                            else //between two items
                                xValue = obj.x + this._columnGap / 2;
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

        protected updateBounds(): void {
            var cnt: number = this.numChildren;
            var i: number = 0;
            var child: GObject;
            var curX: number = 0;
            var curY: number = 0;;
            var maxWidth: number = 0;
            var maxHeight: number = 0;
            var cw: number, ch: number = 0;
            
            for(i = 0;i < cnt;i++) {
                child = this.getChildAt(i);
                child.ensureSizeCorrect();
            }
            
            if (this._layout == ListLayoutType.SingleColumn) {                
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (!child.visible)
                        continue;

                    if (curY != 0)
                        curY += this._lineGap;
                    child.setXY(curX, curY);
                    curY += child.height;
                    if (child.width > maxWidth)
                        maxWidth = child.width;
                }
                cw = curX + maxWidth;
                ch = curY;
            }
            else if (this._layout == ListLayoutType.SingleRow) {                
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (!child.visible)
                        continue;

                    if (curX != 0)
                        curX += this._columnGap;
                    child.setXY(curX, curY);
                    curX += child.width;
                    if (child.height > maxHeight)
                        maxHeight = child.height;
                }
                cw = curX;
                ch = curY + maxHeight;
            }
            else if (this._layout == ListLayoutType.FlowHorizontal) {
                cw = this.viewWidth;
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (!child.visible)
                        continue;

                    if (curX != 0)
                        curX += this._columnGap;

                    if (curX + child.width > cw && maxHeight != 0) {
                        //new line
                        curX = 0;
                        curY += maxHeight + this._lineGap;
                        maxHeight = 0;
                    }
                    child.setXY(curX, curY);
                    curX += child.width;
                    if (child.height > maxHeight)
                        maxHeight = child.height;
                }
                ch = curY + maxHeight;
            }
            else {
                ch = this.viewHeight;
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (!child.visible)
                        continue;

                    if (curY != 0)
                        curY += this._lineGap;

                    if (curY + child.height > ch && maxWidth != 0) {
                        curY = 0;
                        curX += maxWidth + this._columnGap;
                        maxWidth = 0;
                    }
                    child.setXY(curX, curY);
                    curY += child.height;
                    if (child.width > maxWidth)
                        maxWidth = child.width;
                }
                cw = curX + maxWidth;
            }
            this.setBounds(0, 0, cw, ch);
        }

        public setup_beforeAdd(xml: any): void {
            super.setup_beforeAdd(xml);

            var str: string;
            var arr: string[];
            
            str = xml.attributes.layout;
            if (str)
                this._layout = parseListLayoutType(str);

            var overflow: OverflowType;
            str = xml.attributes.overflow;
            if (str)
                overflow = parseOverflowType(str);
            else
                overflow = OverflowType.Visible;

            str = xml.attributes.margin;
            if(str)
                this._margin.parse(str);
                
            if(overflow == OverflowType.Scroll) {
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
    
                var scrollBarMargin: Margin = new Margin();
                str = xml.attributes.scrollBarMargin;
                if(str)
                     scrollBarMargin.parse(str);
                
                var vtScrollBarRes: string;
                var hzScrollBarRes: string;
                str = xml.attributes.scrollBarRes;
                if(str) {
                    arr = str.split(",");
                    vtScrollBarRes = arr[0];
                    hzScrollBarRes = arr[1];
                }
                
                this.setupScroll(scrollBarMargin,scroll,scrollBarDisplay,scrollBarFlags,vtScrollBarRes,hzScrollBarRes);
            }
            else
                this.setupOverflow(overflow);
            
            str = xml.attributes.lineGap;
            if (str)
                this._lineGap = parseInt(str);
            else
                this._lineGap = 0;

            str = xml.attributes.colGap;
            if (str)
                this._columnGap = parseInt(str);
            else
                this._columnGap = 0;
                
            str = xml.attributes.selectionMode;
            if (str)
                this._selectionMode = parseListSelectionMode(str);

            str = xml.attributes.defaultItem;
            if (str)
                this._defaultItem = str;
                
            str = xml.attributes.autoItemSize;
            this._autoResizeItem = str != "false";

            var col: any = xml.children;
            if (col) {
                var length: number = col.length;
                for (var i: number = 0; i < length; i++) {
                    var cxml: any = col[i];
                    if(cxml.name != "item")
                        continue;
                    
                    var url: string = cxml.attributes.url;
                    if (!url)
                        url = this._defaultItem;
                    if (!url)
                        continue;

                    var obj: GObject = this.getFromPool(url);
                    if(obj != null) {
                        this.addChild(obj);                    
                        if (obj instanceof GButton) {
                            (<GButton><any> obj).title = <string><any> (cxml.attributes.title);
                            (<GButton><any> obj).icon = <string><any> (cxml.attributes.icon);
                        }
                        else if (obj instanceof GLabel) {
                            (<GLabel><any> obj).title = <string><any> (cxml.attributes.title);
                            (<GLabel><any> obj).icon = <string><any> (cxml.attributes.icon);
                        }
                    }
                }
            }
        }
    }
}