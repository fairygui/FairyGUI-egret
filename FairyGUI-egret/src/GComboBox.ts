
module fairygui {

    export class GComboBox extends GComponent {
        public dropdown: GComponent;
                
        protected _titleObject: GTextField;
        protected _list: GList;

        private _visibleItemCount: number = 0;
        private _items: Array<string>;
        private _values: Array<string>;
        private _itemsUpdated: boolean;
        private _selectedIndex: number = 0;
        private _buttonController: Controller;
        private _popupDownward: any = true;

        private _over: boolean;
        private _down: boolean;

        public constructor() {
            super();
            this._visibleItemCount = UIConfig.defaultComboBoxVisibleItemCount;
            this._itemsUpdated = true;
            this._selectedIndex = -1;
            this._items = [];
            this._values = [];
        }

        public get text(): string {
            if (this._titleObject)
                return this._titleObject.text;
            else
                return null;
        }

        public set text(value: string) {
            if (this._titleObject)
                this._titleObject.text = value;
        }

        public get titleColor(): number {
            if (this._titleObject)
                return this._titleObject.color;
            else
                return 0;
        }

        public set titleColor(value: number) {
            if (this._titleObject)
                this._titleObject.color = value;
        }

        public get visibleItemCount(): number {
            return this._visibleItemCount;
        }

        public set visibleItemCount(value: number) {
            this._visibleItemCount = value;
        }

        public get popupDownward(): any {
            return this._popupDownward;
        }

        public set popupDownward(value: any) {
            this._popupDownward = value;
        }

        public get items(): Array<string> {
            return this._items;
        }

        public set items(value: Array<string>) {
            if (!value)
                this._items.length = 0;
            else
                this._items = value.concat();
            if(this._items.length > 0) {
                if(this._selectedIndex >= this._items.length)
                    this._selectedIndex = this._items.length - 1;
                else if(this._selectedIndex == -1)
                    this._selectedIndex = 0;

                this.text = this._items[this._selectedIndex];
            }
            else
                this.text = "";
            this._itemsUpdated = true;
        }

        public get values(): Array<string> {
            return this._values;
        }

        public set values(value: Array<string>) {
            if (!value)
                this._values.length = 0;
            else
                this._values = value.concat();
        }

        public get selectedIndex(): number {
            return this._selectedIndex;
        }

        public set selectedIndex(val: number) {
            if (this._selectedIndex == val)
                return;

            this._selectedIndex = val;
            if (this.selectedIndex >= 0 && this.selectedIndex < this._items.length)
                this.text = this._items[this._selectedIndex];
            else
                this.text = "";
        }

        public get value(): string {
            return this._values[this._selectedIndex];
        }

        public set value(val: string) {
            this.selectedIndex = this._values.indexOf(val);
        }

        protected setState(val: string): void {
            if (this._buttonController)
                this._buttonController.selectedPage = val;
        }

        protected constructFromXML(xml: any): void {
            super.constructFromXML(xml);

            xml = ToolSet.findChildNode(xml, "ComboBox");

            var str: string;

            this._buttonController = this.getController("button");
            this._titleObject = <GTextField><any> (this.getChild("title"));
            str = xml.attributes.dropdown;
            if (str) {
                this.dropdown = <GComponent><any> (UIPackage.createObjectFromURL(str));
                if (!this.dropdown) {
                    console.error("下拉框必须为元件");
                    return;
                }
                this.dropdown.name = "this.dropdown";
                this._list = this.dropdown.getChild("list").asList;
                if (this._list == null) {
                    console.error(this.resourceURL + ": 下拉框的弹出元件里必须包含名为list的列表");
                    return;
                }
                this._list.addEventListener(ItemEvent.CLICK, this.__clickItem, this);

                this._list.addRelation(this.dropdown, RelationType.Width);
                this._list.removeRelation(this.dropdown, RelationType.Height);

                this.dropdown.addRelation(this._list, RelationType.Height);
                this.dropdown.removeRelation(this._list, RelationType.Width);

                this.dropdown.displayObject.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.__popupWinClosed, this);
            }

            /*not support
            if (!GRoot.touchScreen) {
                this.displayObject.addEventListener(egret.TouchEvent.TOUCH_ROLL_OVER, this.__rollover, this);
                this.displayObject.addEventListener(egret.TouchEvent.TOUCH_ROLL_OUT, this.__rollout, this);
            }*/

            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__mousedown, this);
        }
        
         public dispose(): void {
             if(this.dropdown) {
                 this.dropdown.dispose();
                 this.dropdown = null;
             }
             
             super.dispose();
         }

        public setup_afterAdd(xml: any): void {
            super.setup_afterAdd(xml);

            xml = ToolSet.findChildNode(xml, "ComboBox");
            if (xml) {
                var str: string;
                str = xml.attributes.titleColor;
                if (str)
                    this.titleColor = ToolSet.convertFromHtmlColor(str);
                str = xml.attributes.visibleItemCount;
                if (str)
                    this._visibleItemCount = parseInt(str);

                var col: any = xml.children;
                if (col) {
                    var length: number = col.length;
                    for (var i: number = 0; i < length; i++) {
                        var cxml: any = col[i];
                        if(cxml.name == "item") {
                            this._items.push(<string><any> (cxml.attributes.title));
                            this._values.push(<string><any> (cxml.attributes.value));
                        }
                    }
                }

                str = xml.attributes.title;
                if(str)
                {
                    this.text = str;
                    this._selectedIndex = this._items.indexOf(str);
                }
                else if(this._items.length>0)
                {
                    this._selectedIndex = 0;
                    this.text = this._items[0];
                }
                else
                    this._selectedIndex = -1;
                    
                str = xml.attributes.direction;
				if(str)
				{
					if(str=="up")
						this._popupDownward = false;
					else if(str=="auto")
						this._popupDownward = null;
				}
            }
        }

        protected showDropdown(): void {
            if (this._itemsUpdated) {
                this._itemsUpdated = false;
 
                this._list.removeChildrenToPool();
                var cnt: number = this._items.length;
                for (var i: number = 0; i < cnt; i++) {
                    var item: GObject = this._list.addItemFromPool();
                    item.name = i < this._values.length ? this._values[i] : "";
                    item.text = this._items[i];
                }
                this._list.resizeToFit(this._visibleItemCount);
            }
            this._list.selectedIndex = -1;
            this.dropdown.width = this.width;

            this.root.togglePopup(this.dropdown, this, this._popupDownward);
            if (this.dropdown.parent)
                this.setState(GButton.DOWN);
        }

        private __popupWinClosed(evt: egret.Event): void {
            if(this._over)
                this.setState(GButton.OVER);
            else
                this.setState(GButton.UP);
        }

        private __clickItem(evt: ItemEvent): void {
            GTimers.inst.add(100, 1, this.__clickItem2, this, this._list.getChildIndex(evt.itemObject))
        }
        
        private __clickItem2(index:number):void {
            if (this.dropdown.parent instanceof GRoot)
                (<GRoot><any> (this.dropdown.parent)).hidePopup();

            this._selectedIndex = index;
            if (this._selectedIndex >= 0)
                this.text = this._items[this._selectedIndex];
            else
                this.text = "";
            this.dispatchEvent(new StateChangeEvent(StateChangeEvent.CHANGED));
        }

        private __rollover(evt: egret.TouchEvent): void {
            this._over = true;
            if (this._down || this.dropdown && this.dropdown.parent)
                return;

            this.setState(GButton.OVER);
        }

        private __rollout(evt: egret.TouchEvent): void {
            this._over = false;
            if (this._down || this.dropdown && this.dropdown.parent)
                return;

            this.setState(GButton.UP);
        }

        private __mousedown(evt: egret.TouchEvent): void {
            this._down = true;
            GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_END, this.__mouseup, this);

            if (this.dropdown)
                this.showDropdown();
        }

        private __mouseup(evt: egret.TouchEvent): void {
            if(this._down) {
                this._down = false;
                GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__mouseup, this);

                if(this.dropdown && !this.dropdown.parent) {
                    if(this._over)
                        this.setState(GButton.OVER);
                    else
                        this.setState(GButton.UP);
                }
            }
        }
    }
}