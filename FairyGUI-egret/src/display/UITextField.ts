
module fairygui {

    export class UITextField extends egret.TextField implements UIDisplayObject {
        private _owner: GObject;

        public constructor(owner: GObject) {
            super();
            this.touchEnabled = false;
            this._owner = owner;
        }

        public get owner(): GObject {
            return this._owner;
        }
    }
}