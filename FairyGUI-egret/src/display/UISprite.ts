
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

        public $hitTest(stageX: number, stageY: number): egret.DisplayObject {
            var ret: egret.DisplayObject = super.$hitTest(stageX, stageY);
            if(ret == null && this.touchEnabled && this._hitArea != null) {
                var m = this.$getInvertedConcatenatedMatrix();
                var localX = m.a * stageX + m.c * stageY + m.tx;
                var localY = m.b * stageX + m.d * stageY + m.ty;
                if(this._hitArea.contains(localX,localY))
                    ret = this;
            }

            return ret;
        }
    }
}