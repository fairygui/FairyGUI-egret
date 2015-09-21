
module fairygui {

    export class UIImage extends egret.Bitmap implements UIDisplayObject {
        private _owner: GObject;

        public constructor(owner: GObject) {
            super();
            this._owner = owner;
            this.touchEnabled = false;
        }

        public get owner(): GObject {
            return this._owner;
        }
    }
}