
module fairygui {

    export class UISprite extends egret.Sprite implements UIDisplayObject {
        private _owner: GObject;
        private _hitArea: egret.Rectangle;

        public constructor(owner: GObject) {
            super();
            this._owner = owner;
            this.touchEnabled = true;
            this.touchChildren = true;
        }

        public get owner(): GObject {
            return this._owner;
        }

        public get hitArea(): egret.Rectangle {
            return this._hitArea;
        }

        public set hitArea(value: egret.Rectangle) {
            if (this._hitArea && value) {
                this._hitArea.x = value.x;
                this._hitArea.y = value.y;
                this._hitArea.width = value.width;
                this._hitArea.height = value.height;
            }
            else this._hitArea = (value ? value.clone() : null);
        }

        public hitTest(x: number, y: number, ignoreTouchEnabled: boolean = false): egret.DisplayObject {
            var ret: egret.DisplayObject = super.hitTest(x, y, ignoreTouchEnabled);
            if (ret == null && (this.touchEnabled || !ignoreTouchEnabled)
                && this._hitArea != null && this._hitArea.contains(x, y))
                ret = this;

            return ret;
        }
    }
}