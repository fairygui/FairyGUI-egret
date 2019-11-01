
module fgui {

    export class GComboBox extends GComponent {
        public dropdown: GComponent;

        protected _titleObject: GObject;
        protected _iconObject: GObject;
        protected _list: GList;

        private _items: Array<string>;
        private _values: Array<string>;
        private _icons: Array<string>;

        private _visibleItemCount: number = 0;
        private _itemsUpdated: boolean;
        private _selectedIndex: number = 0;
        private _buttonController: Controller;
        private _popupDirection: number = PopupDirection.Auto;
        private _selectionController: Controller;

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
            this.updateGear(6);
        }

        public get icon(): string {
            if (this._iconObject)
                return this._iconObject.icon;
            else
                return null;
        }

        public set icon(value: string) {
            if (this._iconObject)
                this._iconObject.icon = value;
            this.updateGear(7);
        }

        public get titleColor(): number {
            var tf: GTextField = this.getTextField();
            if (tf != null)
                return tf.color;
            else
                return 0;
        }

        public set titleColor(value: number) {
            var tf: GTextField = this.getTextField();
            if (tf != null)
                tf.color = value;
        }

        public get titleFontSize(): number {
            var tf: GTextField = this.getTextField();
            if (tf != null)
                return tf.fontSize;
            else
                return 0;
        }

        public set titleFontSize(value: number) {
            var tf: GTextField = this.getTextField();
            if (tf != null)
                tf.fontSize = value;
        }

        public get visibleItemCount(): number {
            return this._visibleItemCount;
        }

        public set visibleItemCount(value: number) {
            this._visibleItemCount = value;
        }

        public get popupDirection(): PopupDirection {
            return this._popupDirection;
        }

        public set popupDirection(value: PopupDirection) {
            this._popupDirection = value;
        }

        public get items(): Array<string> {
            return this._items;
        }

        public set items(value: Array<string>) {
            if (!value)
                this._items.length = 0;
            else
                this._items = value.concat();
            if (this._items.length > 0) {
                if (this._selectedIndex >= this._items.length)
                    this._selectedIndex = this._items.length - 1;
                else if (this._selectedIndex == -1)
                    this._selectedIndex = 0;

                this.text = this._items[this._selectedIndex];
                if (this._icons != null && this._selectedIndex < this._icons.length)
                    this.icon = this._icons[this._selectedIndex];
            }
            else {
                this.text = "";
                if (this._icons != null)
                    this.icon = null;
                this._selectedIndex = -1;
            }
            this._itemsUpdated = true;
        }

        public get icons(): Array<string> {
            return this._icons;
        }

        public set icons(value: Array<string>) {
            this._icons = value;
            if (this._icons != null && this._selectedIndex != -1 && this._selectedIndex < this._icons.length)
                this.icon = this._icons[this._selectedIndex];
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
            if (this.selectedIndex >= 0 && this.selectedIndex < this._items.length) {
                this.text = this._items[this._selectedIndex];
                if (this._icons != null && this._selectedIndex < this._icons.length)
                    this.icon = this._icons[this._selectedIndex];
            }
            else {
                this.text = "";
                if (this._icons != null)
                    this.icon = null;
            }

            this.updateSelectionController();
        }

        public get value(): string {
            return this._values[this._selectedIndex];
        }

        public set value(val: string) {
            var index: number = this._values.indexOf(val);
            if (index == -1 && val == null)
                index = this._values.indexOf("");
            this.selectedIndex = index;
        }

        public get selectionController(): Controller {
            return this._selectionController;
        }

        public set selectionController(value: Controller) {
            this._selectionController = value;
        }

        public getTextField(): GTextField {
            if (this._titleObject instanceof GTextField)
                return (<GTextField>this._titleObject);
            else if (this._titleObject instanceof GLabel)
                return (<GLabel>this._titleObject).getTextField();
            else if (this._titleObject instanceof GButton)
                return (<GButton>this._titleObject).getTextField();
            else
                return null;
        }

        protected setState(val: string): void {
            if (this._buttonController)
                this._buttonController.selectedPage = val;
        }

        public getProp(index: number): any {
            switch (index) {
                case ObjectPropID.Color:
                    return this.titleColor;
                case ObjectPropID.OutlineColor:
                    {
                        var tf: GTextField = this.getTextField();
                        if (tf)
                            return tf.strokeColor;
                        else
                            return 0;
                    }
                case ObjectPropID.FontSize:
                    {
                        tf = this.getTextField();
                        if (tf)
                            return tf.fontSize;
                        else
                            return 0;
                    }
                default:
                    return super.getProp(index);
            }
        }

        public setProp(index: number, value: any): void {
            switch (index) {
                case ObjectPropID.Color:
                    this.titleColor = value;
                    break;
                case ObjectPropID.OutlineColor:
                    {
                        var tf: GTextField = this.getTextField();
                        if (tf)
                            tf.strokeColor = value;
                    }
                    break;
                case ObjectPropID.FontSize:
                    {
                        tf = this.getTextField();
                        if (tf)
                            tf.fontSize = value;
                    }
                    break;
                default:
                    super.setProp(index, value);
                    break;
            }
        }

        protected constructExtension(buffer: ByteBuffer): void {
            var str: string;

            this._buttonController = this.getController("button");
            this._titleObject = this.getChild("title");
            this._iconObject = this.getChild("icon");

            str = buffer.readS();
            if (str) {
                this.dropdown = <GComponent><any>(UIPackage.createObjectFromURL(str));
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

        public handleControllerChanged(c: Controller): void {
            super.handleControllerChanged(c);

            if (this._selectionController == c)
                this.selectedIndex = c.selectedIndex;
        }

        private updateSelectionController(): void {
            if (this._selectionController != null && !this._selectionController.changing
                && this._selectedIndex < this._selectionController.pageCount) {
                var c: Controller = this._selectionController;
                this._selectionController = null;
                c.selectedIndex = this._selectedIndex;
                this._selectionController = c;
            }
        }

        public dispose(): void {
            if (this.dropdown) {
                this.dropdown.dispose();
                this.dropdown = null;
            }

            super.dispose();
        }

        public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_afterAdd(buffer, beginPos);

            if (!buffer.seek(beginPos, 6))
                return;

            if (buffer.readByte() != this.packageItem.objectType)
                return;

            var i: number;
            var iv: number;
            var nextPos: number;
            var str: string;
            var itemCount: number = buffer.readShort();
            for (i = 0; i < itemCount; i++) {
                nextPos = buffer.readShort();
                nextPos += buffer.position;

                this._items[i] = buffer.readS();
                this._values[i] = buffer.readS();
                str = buffer.readS();
                if (str != null) {
                    if (this._icons == null)
                        this._icons = new Array<string>();
                    this._icons[i] = str;
                }

                buffer.position = nextPos;
            }

            str = buffer.readS();
            if (str != null) {
                this.text = str;
                this._selectedIndex = this._items.indexOf(str);
            }
            else if (this._items.length > 0) {
                this._selectedIndex = 0;
                this.text = this._items[0];
            }
            else
                this._selectedIndex = -1;

            str = buffer.readS();
            if (str != null)
                this.icon = str;

            if (buffer.readBool())
                this.titleColor = buffer.readColor();
            iv = buffer.readInt();
            if (iv > 0)
                this._visibleItemCount = iv;
            this._popupDirection = buffer.readByte();

            iv = buffer.readShort();
            if (iv >= 0)
                this._selectionController = this.parent.getControllerAt(iv);
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
                    item.icon = (this._icons != null && i < this._icons.length) ? this._icons[i] : null;
                }
                this._list.resizeToFit(this._visibleItemCount);
            }
            this._list.selectedIndex = -1;
            this.dropdown.width = this.width;
            this._list.ensureBoundsCorrect();

            var downward: any = null;
            if (this._popupDirection == PopupDirection.Down)
                downward = true;
            else if (this._popupDirection == PopupDirection.Up)
                downward = false;

            this.root.togglePopup(this.dropdown, this, downward);
            if (this.dropdown.parent)
                this.setState(GButton.DOWN);
        }

        private __popupWinClosed(evt: egret.Event): void {
            if (this._over)
                this.setState(GButton.OVER);
            else
                this.setState(GButton.UP);
        }

        private __clickItem(evt: ItemEvent): void {
            GTimers.inst.add(100, 1, this.__clickItem2, this, this._list.getChildIndex(evt.itemObject))
        }

        private __clickItem2(index: number): void {
            if (this.dropdown.parent instanceof GRoot)
                (<GRoot><any>(this.dropdown.parent)).hidePopup();

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
            if ((evt.target instanceof egret.TextField) && (<egret.TextField><any>evt.target).type == egret.TextFieldType.INPUT)
                return;

            this._down = true;
            GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_END, this.__mouseup, this);

            if (this.dropdown)
                this.showDropdown();
        }

        private __mouseup(evt: egret.TouchEvent): void {
            if (this._down) {
                this._down = false;
                GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__mouseup, this);

                if (this.dropdown && !this.dropdown.parent) {
                    if (this._over)
                        this.setState(GButton.OVER);
                    else
                        this.setState(GButton.UP);
                }
            }
        }
    }
}