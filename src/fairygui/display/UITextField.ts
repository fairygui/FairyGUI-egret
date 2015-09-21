
module fairygui {

    export class UITextField extends egret.DisplayObjectContainer implements UIDisplayObject {
        private _owner: GObject;

        public nativeTextField: egret.TextField;

        public constructor(owner: GObject) {
            super();
            this.touchEnabled = false;
            this.touchChildren = false;
            this._owner = owner;

            this.nativeTextField = new egret.TextField();
            this.addChild(this.nativeTextField);
        }

        public get owner(): GObject {
            return this._owner;
        }
    }
}