
module fairygui {

    export class UISprite extends egret.Sprite {
        private _hitArea: egret.Rectangle;

        public constructor() {
            super();
            this.touchEnabled = true;
            this.touchChildren = true;
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
            if(ret==this && !this.touchEnabled) //本来this不可触摸时，这里ret不应该返回this，然后egret并没有，所以我自己判断
                return null;
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