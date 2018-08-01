
module fairygui {

    export class GearSize extends GearBase {
        private _storage: any;
        private _default: GearSizeValue;
        private _tweener: tween.GTweener;

        public constructor(owner: GObject) {
            super(owner);
        }

        protected init(): void {
            this._default = new GearSizeValue(this._owner.width, this._owner.height,
                this._owner.scaleX, this._owner.scaleY);
            this._storage = {};
        }

        protected addStatus(pageId: string, value: string): void {
            if (value == "-" || value.length == 0)
                return;

            var arr: string[] = value.split(",");
            var gv: GearSizeValue;
            if (pageId == null)
                gv = this._default;
            else {
                gv = new GearSizeValue();
                this._storage[pageId] = gv;
            }
            gv.width = parseInt(arr[0]);
            gv.height = parseInt(arr[1]);
            if (arr.length > 2) {
                gv.scaleX = parseFloat(arr[2]);
                gv.scaleY = parseFloat(arr[3]);
            }
        }

        public apply(): void {
            var gv: GearSizeValue = this._storage[this._controller.selectedPageId];
            if (!gv)
                gv = this._default;

            if (this._tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect) {
                if (this._tweener != null) {
                    if (this._tweener.endValue.x != gv.width || this._tweener.endValue.y != gv.height
                        || this._tweener.endValue.z != gv.scaleX || this._tweener.endValue.w != gv.scaleY) {
                        this._tweener.kill(true);
                        this._tweener = null;
                    }
                    else
                        return;
                }

                var a: Boolean = gv.width != this._owner.width || gv.height != this._owner.height;
                var b: Boolean = gv.scaleX != this._owner.scaleX || gv.scaleY != this._owner.scaleY;
                if (a || b) {
                    if (this._owner.checkGearController(0, this._controller))
                        this._displayLockToken = this._owner.addDisplayLock();

                    this._tweener = tween.GTween.to4(this._owner.width, this._owner.height, this._owner.scaleX, this._owner.scaleY, gv.width, gv.height, gv.scaleX, gv.scaleY, this.tweenTime)
                        .setDelay(this._tweenDelay)
                        .setEase(this._easeType)
                        .setUserData((a ? 1 : 0) + (b ? 2 : 0))
                        .setTarget(this)
                        .onUpdate(this.__tweenUpdate, this)
                        .onComplete(this.__tweenComplete, this);
                }
            }
            else {
                this._owner._gearLocked = true;
                this._owner.setSize(gv.width, gv.height, this._owner.gearXY.controller == this._controller);
                this._owner.setScale(gv.scaleX, gv.scaleY);
                this._owner._gearLocked = false;
            }
        }

        private __tweenUpdate(tweener: tween.GTweener): void {
            var flag: number = tweener.userData;
            this._owner._gearLocked = true;
            if ((flag & 1) != 0)
                this._owner.setSize(tweener.value.x, tweener.value.y, this._owner.checkGearController(1, this._controller));
            if ((flag & 2) != 0)
                this._owner.setScale(tweener.value.z, tweener.value.w);
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
            var gv: GearSizeValue = this._storage[this._controller.selectedPageId];
            if (!gv) {
                gv = new GearSizeValue();
                this._storage[this._controller.selectedPageId] = gv;
            }

            gv.width = this._owner.width;
            gv.height = this._owner.height;
            gv.scaleX = this._owner.scaleX;
            gv.scaleY = this._owner.scaleY;
        }

        public updateFromRelations(dx: number, dy: number): void {
            if (this._controller == null || this._storage == null)
                return;

            for (var key in this._storage) {
                var gv: GearSizeValue = this._storage[key];
                gv.width += dx;
                gv.height += dy;
            }
            this._default.width += dx;
            this._default.height += dy;

            this.updateState();
        }
    }

    class GearSizeValue {
        public width: number;
        public height: number;
        public scaleX: number;
        public scaleY: number;

        public constructor(width: number = 0, height: number = 0, scaleX: number = 0, scaleY: number = 0) {
            this.width = width;
            this.height = height;
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        }
    }
}