
module fairygui {

    export class GButton extends GComponent {
        protected _titleObject: GObject;
        protected _iconObject: GObject;
        protected _relatedController: Controller;

        private _mode: ButtonMode;
        private _selected: boolean;
        private _title: string;
        private _selectedTitle: string;
        private _icon: string;
        private _selectedIcon: string;
        private _sound: string;
        private _soundVolumeScale: number;
        private _pageOption: PageOption;
        private _buttonController: Controller;
        private _changeStateOnClick: boolean;
        private _linkedPopup: GObject;
        private _downEffect: number;
        private _downEffectValue: number;
        private _downScaled: boolean;

        private _down: boolean;
        private _over: boolean;

        public static UP: string = "up";
        public static DOWN: string = "down";
        public static OVER: string = "over";
        public static SELECTED_OVER: string = "selectedOver";
        public static DISABLED: string = "disabled";
        public static SELECTED_DISABLED: string = "selectedDisabled";

        public constructor() {
            super();

            this._mode = ButtonMode.Common;
            this._title = "";
            this._icon = "";
            this._sound = UIConfig.buttonSound;
            this._soundVolumeScale = UIConfig.buttonSoundVolumeScale;
            this._pageOption = new PageOption();
            this._changeStateOnClick = true;
            this._downEffect = 0;
            this._downEffectValue = 0.8;
        }

        public get icon(): string {
            return this._icon;
        }

        public set icon(value: string) {
            this._icon = value;
            value = (this._selected && this._selectedIcon) ? this._selectedIcon : this._icon;
            if (this._iconObject != null)
                this._iconObject.icon = value;
            this.updateGear(7);
        }

        public get selectedIcon(): string {
            return this._selectedIcon;
        }

        public set selectedIcon(value: string) {
            this._selectedIcon = value;
            value = (this._selected && this._selectedIcon) ? this._selectedIcon : this._icon;
            if (this._iconObject != null)
                this._iconObject.icon = value;
        }

        public get title(): string {
            return this._title;
        }

        public set title(value: string) {
            this._title = value;
            if (this._titleObject)
                this._titleObject.text = (this._selected && this._selectedTitle) ? this._selectedTitle : this._title;
            this.updateGear(6);
        }

        public get text(): string {
            return this.title;
        }

        public set text(value: string) {
            this.title = value;
        }

        public get selectedTitle(): string {
            return this._selectedTitle;
        }

        public set selectedTitle(value: string) {
            this._selectedTitle = value;
            if (this._titleObject)
                this._titleObject.text = (this._selected && this._selectedTitle) ? this._selectedTitle : this._title;
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
        public get sound(): string {
            return this._sound;
        }

        public set sound(val: string) {
            this._sound = val;
        }

        public get soundVolumeScale(): number {
            return this._soundVolumeScale;
        }

        public set soundVolumeScale(value: number) {
            this._soundVolumeScale = value;
        }

        public set selected(val: boolean) {
            if (this._mode == ButtonMode.Common)
                return;

            if (this._selected != val) {
                this._selected = val;
                if (this.grayed && this._buttonController && this._buttonController.hasPage(GButton.DISABLED)) {
                    if (this._selected)
                        this.setState(GButton.SELECTED_DISABLED);
                    else
                        this.setState(GButton.DISABLED);
                }
                else {
                    if (this._selected)
                        this.setState(this._over ? GButton.SELECTED_OVER : GButton.DOWN);
                    else
                        this.setState(this._over ? GButton.OVER : GButton.UP);
                }
                if (this._selectedTitle && this._titleObject)
                    this._titleObject.text = this._selected ? this._selectedTitle : this._title;
                if (this._selectedIcon) {
                    var str: string = this._selected ? this._selectedIcon : this._icon;
                    if (this._iconObject != null)
                        this._iconObject.icon = str;
                }
                if (this._relatedController
                    && this._parent
                    && !this._parent._buildingDisplayList) {
                    if (this._selected) {
                        this._relatedController.selectedPageId = this._pageOption.id;
                        if (this._relatedController.autoRadioGroupDepth)
                            this._parent.adjustRadioGroupDepth(this, this._relatedController);
                    }
                    else if (this._mode == ButtonMode.Check && this._relatedController.selectedPageId == this._pageOption.id)
                        this._relatedController.oppositePageId = this._pageOption.id;
                }
            }
        }

        public get selected(): boolean {
            return this._selected;
        }

        public get mode(): ButtonMode {
            return this._mode;
        }

        public set mode(value: ButtonMode) {
            if (this._mode != value) {
                if (value == ButtonMode.Common)
                    this.selected = false;
                this._mode = value;
            }
        }

        public get relatedController(): Controller {
            return this._relatedController;
        }

        public set relatedController(val: Controller) {
            if (val != this._relatedController) {
                this._relatedController = val;
                this._pageOption.controller = val;
                this._pageOption.clear();
            }
        }

        public get pageOption(): PageOption {
            return this._pageOption;
        }

        public get changeStateOnClick(): boolean {
            return this._changeStateOnClick;
        }

        public set changeStateOnClick(value: boolean) {
            this._changeStateOnClick = value;
        }

        public get linkedPopup(): GObject {
            return this._linkedPopup;
        }

        public set linkedPopup(value: GObject) {
            this._linkedPopup = value;
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

        public addStateListener(listener: Function, thisObj: any): void {
            this.addEventListener(StateChangeEvent.CHANGED, listener, thisObj);
        }

        public removeStateListener(listener: Function, thisObj: any): void {
            this.removeEventListener(StateChangeEvent.CHANGED, listener, thisObj);
        }

        public fireClick(downEffect: boolean = true): void {
            if (downEffect && this._mode == ButtonMode.Common) {
                this.setState(GButton.OVER);
                GTimers.inst.add(100, 1, function () { this.setState(GButton.DOWN); }, this);
                GTimers.inst.add(200, 1, function () { this.setState(GButton.UP); }, this);
            }
            this.__click(null);
        }

        protected setState(val: string): void {
            if (this._buttonController)
                this._buttonController.selectedPage = val;

            if (this._downEffect == 1) {
                var cnt: number = this.numChildren;
                if (val == GButton.DOWN || val == GButton.SELECTED_OVER || val == GButton.SELECTED_DISABLED) {
                    var r: number = this._downEffectValue * 255;
                    var color: number = (r << 16) + (r << 8) + r;
                    for (var i: number = 0; i < cnt; i++) {
                        var obj: GObject = this.getChildAt(i);
                        if (obj["color"] != undefined && !(obj instanceof GTextField))
                            (<any>obj).color = color;
                    }
                }
                else {
                    for (var i: number = 0; i < cnt; i++) {
                        var obj: GObject = this.getChildAt(i);
                        if (obj["color"] != undefined && !(obj instanceof GTextField))
                            (<any>obj).color = 0xFFFFFF;
                    }
                }
            }
            else if (this._downEffect == 2) {
                if (val == GButton.DOWN || val == GButton.SELECTED_OVER || val == GButton.SELECTED_DISABLED) {
                    if (!this._downScaled) {
                        this._downScaled = true;
                        this.setScale(this.scaleX * this._downEffectValue, this.scaleY * this._downEffectValue);
                    }
                }
                else {
                    if (this._downScaled) {
                        this._downScaled = false;
                        this.setScale(this.scaleX / this._downEffectValue, this.scaleY / this._downEffectValue);
                    }
                }
            }
        }

        public handleControllerChanged(c: Controller): void {
            super.handleControllerChanged(c);

            if (this._relatedController == c)
                this.selected = this._pageOption.id == c.selectedPageId;
        }

        protected handleGrayedChanged(): void {
            if (this._buttonController && this._buttonController.hasPage(GButton.DISABLED)) {
                if (this.grayed) {
                    if (this._selected && this._buttonController.hasPage(GButton.SELECTED_DISABLED))
                        this.setState(GButton.SELECTED_DISABLED);
                    else
                        this.setState(GButton.DISABLED);
                }
                else if (this._selected)
                    this.setState(GButton.DOWN);
                else
                    this.setState(GButton.UP);
            }
            else
                super.handleGrayedChanged();
        }

        protected constructExtension(buffer: ByteBuffer): void {
            buffer.seek(0, 6);

            this._mode = buffer.readByte();
            var str: string = buffer.readS();
            if (str)
                this._sound = str;
            this._soundVolumeScale = buffer.readFloat();
            this._downEffect = buffer.readByte();
            this._downEffectValue = buffer.readFloat();
            if (this._downEffect == 2)
                this.setPivot(0.5, 0.5, this.pivotAsAnchor);

            this._buttonController = this.getController("button");
            this._titleObject = this.getChild("title");
            this._iconObject = this.getChild("icon");
            if (this._titleObject != null)
                this._title = this._titleObject.text;
            if (this._iconObject != null)
                this._icon = this._iconObject.icon;

            if (this._mode == ButtonMode.Common)
                this.setState(GButton.UP);

            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__mousedown, this);
            this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.__click, this);
        }

        public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_afterAdd(buffer, beginPos);

            if (!buffer.seek(beginPos, 6))
                return;

            if (buffer.readByte() != this.packageItem.objectType)
                return;

            var str: string;
            var iv: number;

            str = buffer.readS();
            if (str != null)
                this.title = str;
            str = buffer.readS();
            if (str != null)
                this.selectedTitle = str;
            str = buffer.readS();
            if (str != null)
                this.icon = str;
            str = buffer.readS();
            if (str != null)
                this.selectedIcon = str;
            if (buffer.readBool())
                this.titleColor = buffer.readColor();
            iv = buffer.readInt();
            if (iv != 0)
                this.titleFontSize = iv;
            iv = buffer.readShort();
            if (iv >= 0)
                this._relatedController = this.parent.getControllerAt(iv);
            this.pageOption.id = buffer.readS();

            str = buffer.readS();
            if (str != null)
                this._sound = str;
            if (buffer.readBool())
                this._soundVolumeScale = buffer.readFloat();

            this.selected = buffer.readBool();
        }

        private __rollover(evt: egret.TouchEvent): void {
            if (!this._buttonController || !this._buttonController.hasPage(GButton.OVER))
                return;

            this._over = true;
            if (this._down)
                return;

            this.setState(this._selected ? GButton.SELECTED_OVER : GButton.OVER);
        }

        private __rollout(evt: egret.TouchEvent): void {
            if (!this._buttonController || !this._buttonController.hasPage(GButton.OVER))
                return;

            this._over = false;
            if (this._down)
                return;

            this.setState(this._selected ? GButton.DOWN : GButton.UP);
        }

        private __mousedown(evt: egret.TouchEvent): void {
            this._down = true;
            GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_END, this.__mouseup, this);

            if (this._mode == ButtonMode.Common) {
                if (this.grayed && this._buttonController && this._buttonController.hasPage(GButton.DISABLED))
                    this.setState(GButton.SELECTED_DISABLED);
                else
                    this.setState(GButton.DOWN);
            }

            if (this._linkedPopup != null) {
                if (this._linkedPopup instanceof Window)
                    (<Window><any>(this._linkedPopup)).toggleStatus();
                else
                    this.root.togglePopup(this._linkedPopup, this);
            }
        }

        private __mouseup(evt: egret.TouchEvent): void {
            if (this._down) {
                GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__mouseup, this);
                this._down = false;

                if (this.displayObject == null)
                    return;

                if (this._mode == ButtonMode.Common) {
                    if (this.grayed && this._buttonController && this._buttonController.hasPage(GButton.DISABLED))
                        this.setState(GButton.DISABLED);
                    else if (this._over)
                        this.setState(GButton.OVER);
                    else
                        this.setState(GButton.UP);
                }
            }
        }

        private __click(evt: egret.TouchEvent): void {
            if (this._sound) {
                var pi: PackageItem = UIPackage.getItemByURL(this._sound);
                if (pi) {
                    var sound: egret.Sound = <egret.Sound>pi.owner.getItemAsset(pi);
                    if (sound)
                        GRoot.inst.playOneShotSound(sound, this._soundVolumeScale);
                }
            }

            if (this._mode == ButtonMode.Check) {
                if (this._changeStateOnClick) {
                    this.selected = !this._selected;
                    this.dispatchEvent(new StateChangeEvent(StateChangeEvent.CHANGED));
                }
            }
            else if (this._mode == ButtonMode.Radio) {
                if (this._changeStateOnClick && !this._selected) {
                    this.selected = true;
                    this.dispatchEvent(new StateChangeEvent(StateChangeEvent.CHANGED));
                }
            }
            else {
                if (this._relatedController)
                    this._relatedController.selectedPageId = this._pageOption.id;
            }
        }
    }
}