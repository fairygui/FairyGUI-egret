
module fairygui {

    export class GList extends GComponent {
        /**
         * itemRenderer(int index, GObject item);
         */
        public itemRenderer:Function;
        public callbackThisObj:any;
        
        private _layout: ListLayoutType;
        private _lineItemCount:number = 0;
        private _lineGap: number = 0;
        private _columnGap: number = 0;
        private _defaultItem: string;
        private _autoResizeItem: boolean;
        private _selectionMode: ListSelectionMode;
        private _lastSelectedIndex: number = 0;
        private _pool: GObjectPool;
        private _selectionHandled: boolean;
        
        //Virtual List support
        private _virtual:boolean;
        private _loop: boolean;
        private _numItems: number = 0;
        private _firstIndex: number = 0; //the top left index
        private _viewCount: number = 0; //item count in view
        private _curLineItemCount: number = 0; //item count in one line
        private _itemSize:egret.Point;
        private _virtualScrollPane:ScrollPane;

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
            if(this._virtualScrollPane != null) {
                this._virtualScrollPane.owner.removeEventListener(GObject.SIZE_CHANGED, this.refreshVirtualList, this);
                this._virtualScrollPane.removeEventListener(ScrollPane.SCROLL, this.__scrolled, this);
                this._virtualScrollPane = null;
            }
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
        
        public get lineItemCount(): number {
            return this._lineItemCount;
        }

        public set lineItemCount(value:number) {
            if(this._lineItemCount != value) {
                this._lineItemCount = value;
                this.setBoundsChangedFlag();
            }
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

            var obj:GObject = this._pool.getObject(url);
            obj.visible = true;
            return obj;
        }

        public returnToPool(obj: GObject): void {
            obj.displayObject.cacheAsBitmap = false;
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
            if (endIndex < 0 || endIndex >= this._children.length)
                endIndex = this._children.length - 1;

            for (var i: number = beginIndex; i <= endIndex; ++i)
                this.removeChildToPoolAt(beginIndex);
        }

        public get selectedIndex(): number {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; i++) {
                var obj: GButton = this._children[i].asButton;
                if (obj != null && obj.selected) {
                    var j: number = this._firstIndex + i;
                    if(this._loop && j >= this._numItems)
                        j -= this._numItems;
                    return j;
                }
            }
            return -1;
        }

        public set selectedIndex(value: number) {
            this.clearSelection();
            if (value >= 0 && value < this.numItems)
                this.addSelection(value);
        }

        public getSelection(): Array<number> {
            var ret: Array<number> = new Array<number>();
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; i++) {
                var obj: GButton = this._children[i].asButton;
                if (obj != null && obj.selected) {
                    var j: number = this._firstIndex + i;
                    if(this._loop && j >= this._numItems)
                        j -= this._numItems;
                    ret.push(j);
                }
            }
            return ret;
        }

        public addSelection(index: number, scrollItToView: boolean= false): void {
            if (this._selectionMode == ListSelectionMode.None)
                return;

            if (this._selectionMode == ListSelectionMode.Single)
                this.clearSelection();
                
            if(scrollItToView)
                this.scrollToView(index);

            index -= this._firstIndex;
            if(index < 0) {
                if(this._loop && this._numItems > 0)
                    index += this._numItems;
                else
                    return;
            }
            if(index >= this._children.length)
                return;

            var obj: GButton = this.getChildAt(index).asButton;
            if(obj != null && !obj.selected)
                obj.selected = true;
        }

        public removeSelection(index: number = 0): void {
            if (this._selectionMode == ListSelectionMode.None)
                return;

            index -= this._firstIndex;
            if(index < 0) {
                if(this._loop && this._numItems > 0)
                    index += this._numItems;
                else
                    return;
            }
            if(index >= this._children.length)
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

            if (UIConfig.defaultScrollTouchEffect 
                && (this.scrollPane != null || this.parent != null && this.parent.scrollPane != null))
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
                            max = Math.min(max,this._children.length - 1);
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

            var curCount: number = this.numItems;
            if (itemCount > curCount)
                itemCount = curCount;

            if(this._virtual) {
                var lineCount: number = Math.ceil(itemCount / this._curLineItemCount);
                if(this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal)
                    this.viewHeight = lineCount * this._itemSize.y + Math.max(0,lineCount - 1) * this._lineGap;
                else
                    this.viewWidth = lineCount * this._itemSize.x + Math.max(0,lineCount - 1) * this._columnGap;
            }
            else if(itemCount == 0) {
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
            var cnt: number = this._children.length;
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

            if (this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.FlowVertical) {
                this.setBoundsChangedFlag();
            	if (this._virtual)
					this.handleVirtualListSizeChanged();
		    }
        }

        public adjustItemsSize(): void {
            if (this._layout == ListLayoutType.SingleColumn) {
                var cnt: number = this._children.length;
                var cw: number = this.viewWidth;
                for (var i: number = 0; i < cnt; i++) {
                    var child: GObject = this.getChildAt(i);
                    child.width = cw;
                }
            }
            else if (this._layout == ListLayoutType.SingleRow) {
                cnt = this._children.length;
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
            
            if (this._virtual) {
				if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
					var i:number = Math.floor(yValue / (this._itemSize.y + this._lineGap));
					if (yValue > i * (this._itemSize.y + this._lineGap) + this._itemSize.y / 2)
						i++;
					
                    yValue = i * (this._itemSize.y + this._lineGap);
				}
				else
				{
                    i = Math.floor(xValue / (this._itemSize.x + this._columnGap));
                    if(xValue > i * (this._itemSize.x + this._columnGap) + this._itemSize.x / 2)
						i++;
					
                    xValue = i * (this._itemSize.x + this._columnGap);
				}
			}
			else {
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
            }

            resultPoint.x = xValue;
            resultPoint.y = yValue;
            return resultPoint;
        }
        
        public scrollToView(index:number,ani:boolean = false):void  {				
            if(this._virtual) {
                if(this.scrollPane != null)
                    this.scrollPane.scrollToView(this.getItemRect(index),ani);
                else if(this.parent != null && this.parent.scrollPane != null)
                    this.parent.scrollPane.scrollToView(this.getItemRect(index),ani);
            }
            else {
                var obj: GButton = this.getChildAt(index).asButton;
                if(obj != null) {
                    if(this.scrollPane != null)
                        this.scrollPane.scrollToView(obj,ani);
                    else if(this.parent != null && this.parent.scrollPane != null)
                        this.parent.scrollPane.scrollToView(obj,ani);
                }
            }
        }

        public getFirstChildInView(): number {
            var ret: number = super.getFirstChildInView();
            if(ret != -1) {
                ret += this._firstIndex;
                if(this._loop && ret >= this._numItems)
                    ret -= this._numItems;
                return ret;
            }
            else
                return -1;
        }
    
        public setVirtual(): void {
            this._setVirtual(false);
        }
		
        /// <summary>
        /// Set the list to be virtual list, and has loop behavior.
        /// </summary>
        public setVirtualAndLoop(): void {
            this._setVirtual(true);
        }
		
        /// <summary>
        /// Set the list to be virtual list.
        /// </summary>
        private _setVirtual(loop: boolean): void {
            if(!this._virtual) {
                if(loop) {
                    if(this.scrollPane == null)
                        throw new Error("Loop list must be scrollable!");
        
                    if(this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.FlowVertical)
                        throw new Error("Only single row or single column layout type is supported for loop list!");
        
                    this.scrollPane.bouncebackEffect = false;
                }
        
                this._virtual = true;
                this._loop = loop;
                this._itemSize = new egret.Point();
                this.removeChildrenToPool();
        
                var obj: GObject = this.getFromPool(null);
                this._itemSize.x = obj.width;
                this._itemSize.y = obj.height;
                this.returnToPool(obj);
        
                if(this.scrollPane != null) {
                    if(this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal)
                        this.scrollPane.scrollSpeed = this._itemSize.y;
                    else
                        this.scrollPane.scrollSpeed = this._itemSize.x;
        
                    this._virtualScrollPane = this.scrollPane;        
                }
                else if(this.parent != null && this.parent.scrollPane != null) {
                    this._virtualScrollPane = this.parent.scrollPane;
                    this.parent.addEventListener(GObject.SIZE_CHANGED, this.refreshVirtualList, this);
                }
                else
                    throw new Error("Virtual list must be scrollable or in scrollable container!");
        
                this._virtualScrollPane.addEventListener(ScrollPane.SCROLL, this.__scrolled, this);
                this.handleVirtualListSizeChanged();
            }
        }
        		
        /// <summary>
        /// Set the list item count. 
        /// If the list is not virtual, specified number of items will be created. 
        /// If the list is virtual, only items in view will be created.
        /// </summary>
        public get numItems():number
        {
            if(this._virtual)
                return this._numItems;
            else
                return this._children.length;
        }
        
        public set numItems(value:number)
        {
            if(this._virtual) {
                this._numItems = value;
                this.refreshVirtualList();
            }
			else {
                var cnt: number = this._children.length;
                if(value > cnt) {
                    for(var i: number = cnt;i < value;i++)
                        this.addItemFromPool();
                }
    			else {
                     this.removeChildrenToPool(value,cnt);
                }
                if(this.itemRenderer != null) {
                    for(i = 0;i < value;i++)
                        this.itemRenderer.call(this.callbackThisObj, i, this.getChildAt(i));
                }
            }
        }
        
        private handleVirtualListSizeChanged(): void {
            var vw: number = this._virtualScrollPane.viewWidth;
            var vh: number = this._virtualScrollPane.viewHeight;
            if(this._virtualScrollPane != this.scrollPane) //scroll support from parent
            {
                vw = Math.min(vw,this.viewWidth);
                vh = Math.min(vh,this.viewHeight);
            }
        
            if(this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
                if(this._layout == ListLayoutType.SingleColumn)
                    this._curLineItemCount = 1;
                else if(this._lineItemCount != 0)
                    this._curLineItemCount = this._lineItemCount;
                else
                    this._curLineItemCount = Math.floor((vw + this._columnGap) / (this._itemSize.x + this._columnGap));
                this._viewCount = (Math.ceil((vh + this._lineGap) / (this._itemSize.y + this._lineGap)) + 1) * this._curLineItemCount;
                var numChildren: number = this._children.length;
                if(numChildren < this._viewCount) {
                    for(var i: number = numChildren;i < this._viewCount;i++)
                        this.addItemFromPool();
                }
                else if(numChildren > this._viewCount)
                    this.removeChildrenToPool(this._viewCount,numChildren);
            }
            else {
                if(this._layout == ListLayoutType.SingleRow)
                    this._curLineItemCount = 1;
                else if(this._lineItemCount != 0)
                    this._curLineItemCount = this._lineItemCount;
                else
                    this._curLineItemCount = Math.floor((vh + this._lineGap) / (this._itemSize.y + this._lineGap));
                this._viewCount = (Math.ceil((vw + this._columnGap) / (this._itemSize.x + this._columnGap)) + 1) * this._curLineItemCount;
                numChildren = this._children.length;
                if(numChildren < this._viewCount) {
                    for(i = numChildren;i < this._viewCount;i++)
                        this.addItemFromPool();
                }
                else if(numChildren > this._viewCount)
                    this.removeChildrenToPool(this._viewCount,numChildren);
            }
        
            this.refreshVirtualList();
        }
        
        private refreshVirtualList(): void {
            this.ensureBoundsCorrect();
        
            if(this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
                if(this.scrollPane != null) {
                    var ch: number;
                    if(this._layout == ListLayoutType.SingleColumn) {
                        ch = this._numItems * this._itemSize.y + Math.max(0,this._numItems - 1) * this._lineGap;
                        if(this._loop && ch > 0)
                            ch = ch * 2 + this._lineGap;
                    }
                    else {
                        var lineCount: number = Math.ceil(this._numItems / this._curLineItemCount);
                        ch = lineCount * this._itemSize.y + Math.max(0,lineCount - 1) * this._lineGap;
                    }
        
                    this.scrollPane.setContentSize(this.scrollPane.contentWidth,ch);
                }
        
                this.__scrolled(null);
            }
            else {
                if(this.scrollPane != null) {
                    var cw: number;
                    if(this._layout == ListLayoutType.SingleRow) {
                        cw = this._numItems * this._itemSize.x + Math.max(0,this._numItems - 1) * this._columnGap;
                        if(this._loop && cw > 0)
                            cw = cw * 2 + this._columnGap;
                    }
                    else {
                        lineCount = Math.ceil(this._numItems / this._curLineItemCount);
                        cw = lineCount * this._itemSize.x + Math.max(0,lineCount - 1) * this._columnGap;
                    }
        
                    this.scrollPane.setContentSize(cw,this.scrollPane.contentHeight);
                }
        
                this.__scrolled(null);
            }
        }
        
        private renderItems(beginIndex: number,endIndex: number): void {
            for(var i: number = 0;i < this._viewCount;i++) {
                var obj: GObject = this.getChildAt(i);
                var j: number = this._firstIndex + i;
                if(this._loop && j >= this._numItems)
                    j -= this._numItems;
        
                if(j < this._numItems) {
                    obj.visible = true;
                    if(i >= beginIndex && i < endIndex)
                        this.itemRenderer.call(this.callbackThisObj, j,obj);
                }
                else
                    obj.visible = false;
            }
        }
        
        private getItemRect(index: number): egret.Rectangle {
            var rect: egret.Rectangle;
            var index1: number = Math.floor(index / this._curLineItemCount);
            var index2: number = index % this._curLineItemCount;
            switch(this._layout) {
                case ListLayoutType.SingleColumn:
                    rect = new egret.Rectangle(0,index1 * this._itemSize.y + Math.max(0,index1 - 1) * this._lineGap,
                        this.viewWidth,this._itemSize.y);
                    break;
        
                case ListLayoutType.FlowHorizontal:
                    rect = new egret.Rectangle(index2 * this._itemSize.x + Math.max(0,index2 - 1) * this._columnGap,
                        index1 * this._itemSize.y + Math.max(0,index1 - 1) * this._lineGap,
                        this._itemSize.x,this._itemSize.y);
                    break;
        
                case ListLayoutType.SingleRow:
                    rect = new egret.Rectangle(index1 * this._itemSize.x + Math.max(0,index1 - 1) * this._columnGap,0,
                        this._itemSize.x,this.viewHeight);
                    break;
        
                case ListLayoutType.FlowVertical:
                    rect = new egret.Rectangle(index1 * this._itemSize.x + Math.max(0,index1 - 1) * this._columnGap,
                        index2 * this._itemSize.y + Math.max(0,index2 - 1) * this._lineGap,
                        this._itemSize.x,this._itemSize.y);
                    break;
            }
            return rect;
        }
        
        private __scrolled(evt: egret.Event): void {
            if(this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
                if(this._loop) {
                    if(this._virtualScrollPane.percY == 0)
                        this._virtualScrollPane.posY = this._numItems * (this._itemSize.y + this._lineGap);
                    else if(this._virtualScrollPane.percY == 1)
                        this._virtualScrollPane.posY = this._numItems * this._itemSize.y + Math.max(0,this._numItems - 1) * this._lineGap - this.viewHeight;
                }
        
                var scrollPosY: number = this._virtualScrollPane.posY;
                if(this._virtualScrollPane != this.scrollPane) {
                    scrollPosY -= this.y;
                    if(scrollPosY < 0)
                        scrollPosY = 0;
                }
        
                var firstLine: number = Math.floor((scrollPosY + this._lineGap) / (this._itemSize.y + this._lineGap));
                var newFirstIndex: number = firstLine * this._curLineItemCount;
                for(var i: number = 0;i < this._viewCount;i++) {
                    var obj: GObject = this.getChildAt(i);
                    obj.y = (firstLine + Math.floor(i / this._curLineItemCount)) * (this._itemSize.y + this._lineGap);
                }
                if(newFirstIndex >= this._numItems)
                    newFirstIndex -= this._numItems;
        
                if(newFirstIndex != this._firstIndex || evt == null) {
                    var oldFirstIndex: number = this._firstIndex;
                    this._firstIndex = newFirstIndex;
        
                    if(evt == null || oldFirstIndex + this._viewCount < newFirstIndex || oldFirstIndex > newFirstIndex + this._viewCount) {
                        //no intersection, render all
                        for(i = 0;i < this._viewCount;i++) {
                            obj = this.getChildAt(i);
                            if(obj instanceof GButton)
                                (<GButton><any>obj).selected = false;
                        }
                        this.renderItems(0,this._viewCount);
                    }
                    else if(oldFirstIndex > newFirstIndex) {
                        var j1: number = oldFirstIndex - newFirstIndex;
                        var j2: number = this._viewCount - j1;
                        for(i = j2 - 1;i >= 0;i--) {
                            var obj1: GObject = this.getChildAt(i);
                            var obj2: GObject = this.getChildAt(i + j1);
                            if(obj2 instanceof GButton)
                                (<GButton><any>obj2).selected = false;
                            var tmp: number = obj1.y;
                            obj1.y = obj2.y;
                            obj2.y = tmp;
                            this.swapChildrenAt(i + j1,i);
                        }
                        this.renderItems(0,j1);
                    }
                    else {
                        j1 = newFirstIndex - oldFirstIndex;
                        j2 = this._viewCount - j1;
                        for(i = 0;i < j2;i++) {
                            obj1 = this.getChildAt(i);
                            obj2 = this.getChildAt(i + j1);
                            if(obj1 instanceof GButton)
                               (<GButton><any>obj1).selected = false;
                            tmp = obj1.y;
                            obj1.y = obj2.y;
                            obj2.y = tmp;
                            this.swapChildrenAt(i + j1,i);
                        }
                        this.renderItems(j2,this._viewCount);
                    }
                }
            }
            else {
                if(this._loop) {
                    if(this._virtualScrollPane.percX == 0)
                        this._virtualScrollPane.posX = this._numItems * (this._itemSize.x + this._columnGap);
                    else if(this._virtualScrollPane.percX == 1)
                        this._virtualScrollPane.posX = this._numItems * this._itemSize.x + Math.max(0,this._numItems - 1) * this._columnGap - this.viewWidth;
                }
        
                var scrollPosX: number = this._virtualScrollPane.posX;
                if(this._virtualScrollPane != this.scrollPane) {
                    scrollPosX -= this.x;
                    if(scrollPosX < 0)
                        scrollPosX = 0;
                }
        
                firstLine = Math.floor((scrollPosX + this._columnGap) / (this._itemSize.x + this._columnGap));
                newFirstIndex = firstLine * this._curLineItemCount;
        
                for(i = 0;i < this._viewCount;i++) {
                    obj = this.getChildAt(i);
                    obj.x = (firstLine + Math.floor(i / this._curLineItemCount)) * (this._itemSize.x + this._columnGap);
                }
        
                if(newFirstIndex >= this._numItems)
                    newFirstIndex -= this._numItems;
        
                if(newFirstIndex != this._firstIndex || evt == null) {
                    oldFirstIndex = this._firstIndex;
                    this._firstIndex = newFirstIndex;
                    if(evt == null || oldFirstIndex + this._viewCount < newFirstIndex || oldFirstIndex > newFirstIndex + this._viewCount) {
                        //no intersection, render all
                        for(i = 0;i < this._viewCount;i++) {
                            obj = this.getChildAt(i);
                            if(obj1 instanceof GButton)
                                (<GButton><any>obj1).selected = false;
                        }
        
                        this.renderItems(0,this._viewCount);
                    }
                    else if(oldFirstIndex > newFirstIndex) {
                        j1 = oldFirstIndex - newFirstIndex;
                        j2 = this._viewCount - j1;
                        for(i = j2 - 1;i >= 0;i--) {
                            obj1 = this.getChildAt(i);
                            obj2 = this.getChildAt(i + j1);
                            if(obj2 instanceof GButton)
                                (<GButton><any>obj2).selected = false;
                            tmp = obj1.x;
                            obj1.x = obj2.x;
                            obj2.x = tmp;
                            this.swapChildrenAt(i + j1,i);
                        }
        
                        this.renderItems(0,j1);
                    }
                    else {
                        j1 = newFirstIndex - oldFirstIndex;
                        j2 = this._viewCount - j1;
                        for(i = 0;i < j2;i++) {
                            obj1 = this.getChildAt(i);
                            obj2 = this.getChildAt(i + j1);
                            if(obj1 instanceof GButton)
                                (<GButton><any>obj1).selected = false;
                            tmp = obj1.x;
                            obj1.x = obj2.x;
                            obj2.x = tmp;
                            this.swapChildrenAt(i + j1,i);
                        }
        
                        this.renderItems(j2,this._viewCount);
                    }
                }
            }
        
            this._boundsChanged = false;
        }

        protected updateBounds(): void {
            var cnt: number = this._children.length;
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
                var j: number = 0;
                var viewWidth: number = this.viewWidth;
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (!child.visible)
                        continue;

                    if (curX != 0)
                        curX += this._columnGap;

                    if(this._lineItemCount != 0 && j >= this._lineItemCount
                        || this._lineItemCount == 0 && curX + child.width > viewWidth && maxHeight != 0) {
                        //new line
                        curX -= this._columnGap;
                        if(curX > maxWidth)
                            maxWidth = curX;
                        curX = 0;
                        curY += maxHeight + this._lineGap;
                        maxHeight = 0;
                        j = 0;
                    }
                    child.setXY(curX,curY);
                    curX += child.width;
                    if(child.height > maxHeight)
                        maxHeight = child.height;
                    j++;
                }
                ch = curY + maxHeight;
                cw = maxWidth;
            }
            else {
                j = 0;
                var viewHeight: number = this.viewHeight;
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (!child.visible)
                        continue;

                    if (curY != 0)
                        curY += this._lineGap;

                    if(this._lineItemCount != 0 && j >= this._lineItemCount
                        || this._lineItemCount == 0 && curY + child.height > viewHeight && maxWidth != 0) {
                        curY -= this._lineGap;
                        if(curY > maxHeight)
                            maxHeight = curY;
                        curY = 0;
                        curX += maxWidth + this._columnGap;
                        maxWidth = 0;
                        j = 0;
                    }
                    child.setXY(curX,curY);
                    curY += child.height;
                    if(child.width > maxWidth)
                        maxWidth = child.width;
                    j++;
                }
                cw = curX + maxWidth;
                ch = maxHeight;
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

            str = xml.attributes.colGap;
            if (str)
                this._columnGap = parseInt(str);
                
            str = xml.attributes.lineItemCount;
            if(str)
                this._lineItemCount = parseInt(str);
                
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