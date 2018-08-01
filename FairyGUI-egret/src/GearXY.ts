
module fairygui {

    export class GearXY extends GearBase {
        private _storage: any;
        private _default: egret.Point;
        private _tweener: GTweener;

        public constructor(owner: GObject) {
            super(owner);
        }

        protected init(): void {
            this._default = new egret.Point(this._owner.x, this._owner.y);
            this._storage = {};
        }

        protected addStatus(pageId: string, value: string): void {
            if (value == "-" || value.length == 0)
                return;

            var arr: string[] = value.split(",");
            var pt: egret.Point;
            if (pageId == null)
                pt = this._default;
            else {
                pt = new egret.Point();
                this._storage[pageId] = pt;
            }
            pt.x = parseInt(arr[0]);
            pt.y = parseInt(arr[1]);
        }

        public apply(): void {
            var pt: egret.Point = this._storage[this._controller.selectedPageId];
            if (!pt)
                pt = this._default;

            if (this._tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect) {
                if (this._tweener != null) {
                    if (this._tweener.endValue.x != pt.x || this._tweener.endValue.y != pt.y) {
                        this._tweener.kill(true);
                        this._tweener = null;
                    }
                    else
                        return;
                }

                if (this._owner.x != pt.x || this._owner.y != pt.y) {
                    if (this._owner.checkGearController(0, this._controller))
                        this._displayLockToken = this._owner.addDisplayLock();

                    this._tweener = GTween.to2(this._owner.x, this._owner.y, pt.x, pt.y, this._tweenTime)
                        .setDelay(this._tweenDelay)
                        .setEase(this._easeType)
                        .setTarget(this)
                        .onUpdate(this.__tweenUpdate, this)
                        .onComplete(this.__tweenComplete, this);
                }
            }
            else {
                this._owner._gearLocked = true;
                this._owner.setXY(pt.x, pt.y);
                this._owner._gearLocked = false;
            }
        }

        private __tweenUpdate(tweener: GTweener): void {
            this._owner._gearLocked = true;
            this._owner.setXY(tweener.value.x, tweener.value.y);
            this._owner._gearLocked = false;
        }

        private __tweenComplete(): void {
            if (this._displayLockToken != 0) {
                this._owner.releaseDisplayLock(this._displayLockToken);
                this._displayLockToken = 0;
            }
            this._tweener = null;
        }

        public updateState(): void {
            var pt: egret.Point = this._storage[this._controller.selectedPageId];
            if (!pt) {
                pt = new egret.Point();
                this._storage[this._controller.selectedPageId] = pt;
            }

            pt.x = this._owner.x;
            pt.y = this._owner.y;
        }

        public updateFromRelations(dx: number, dy: number): void {
            if (this._controller == null || this._storage == null)
                return;

            for (var key in this._storage) {
                var pt: egret.Point = this._storage[key];
                pt.x += dx;
                pt.y += dy;
            }
            this._default.x += dx;
            this._default.y += dy;

            this.updateState();
        }
    }
}
