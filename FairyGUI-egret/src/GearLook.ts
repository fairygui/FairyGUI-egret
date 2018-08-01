
module fairygui {

    export class GearLook extends GearBase {
        private _storage: any;
        private _default: GearLookValue;
        private _tweener: tween.GTweener;

        public constructor(owner: GObject) {
            super(owner);
        }

        protected init(): void {
            this._default = new GearLookValue(this._owner.alpha, this._owner.rotation, this._owner.grayed, this._owner.touchable);
            this._storage = {};
        }

        protected addStatus(pageId: string, value: string): void {
            if (value == "-" || value.length == 0)
                return;

            var arr: string[] = value.split(",");
            var gv: GearLookValue;
            if (pageId == null)
                gv = this._default;
            else {
                gv = new GearLookValue();
                this._storage[pageId] = gv;
            }
            gv.alpha = parseFloat(arr[0]);
            gv.rotation = parseInt(arr[1]);
            gv.grayed = arr[2] == "1" ? true : false;
            if (arr.length < 4)
                gv.touchable = this._owner.touchable;
            else
                gv.touchable = arr[3] == "1" ? true : false;
        }

        public apply(): void {
            var gv: GearLookValue = this._storage[this._controller.selectedPageId];
            if (!gv)
                gv = this._default;

            if (this._tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect) {
                this._owner._gearLocked = true;
                this._owner.grayed = gv.grayed;
                this._owner.touchable = gv.touchable;
                this._owner._gearLocked = false;
                if (this._tweener != null) {
                    if (this._tweener.endValue.x != gv.alpha || this._tweener.endValue.y != gv.rotation) {
                        this._tweener.kill(true);
                        this._tweener = null;
                    }
                    else
                        return;
                }

                var a: Boolean = gv.alpha != this._owner.alpha;
                var b: Boolean = gv.rotation != this._owner.rotation;
                if (a || b) {
                    if (this._owner.checkGearController(0, this._controller))
                        this._displayLockToken = this._owner.addDisplayLock();

                    this._tweener = tween.GTween.to2(this._owner.alpha, this._owner.rotation, gv.alpha, gv.rotation, this._tweenTime)
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
                this._owner.grayed = gv.grayed;
                this._owner.touchable = gv.touchable;
                this._owner.alpha = gv.alpha;
                this._owner.rotation = gv.rotation;
                this._owner._gearLocked = false;
            }
        }

        private __tweenUpdate(tweener: tween.GTweener): void {
            var flag: number = tweener.userData;
            this._owner._gearLocked = true;
            if ((flag & 1) != 0)
                this._owner.alpha = tweener.value.x;
            if ((flag & 2) != 0)
                this._owner.rotation = tweener.value.y;
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
            var gv: GearLookValue = this._storage[this._controller.selectedPageId];
            if (!gv) {
                gv = new GearLookValue();
                this._storage[this._controller.selectedPageId] = gv;
            }

            gv.alpha = this._owner.alpha;
            gv.rotation = this._owner.rotation;
            gv.grayed = this._owner.grayed;
            gv.touchable = this._owner.touchable;
        }
    }

    class GearLookValue {
        public alpha: number;
        public rotation: number;
        public grayed: boolean;
        public touchable: boolean;

        public constructor(alpha: number = 0, rotation: number = 0, grayed: boolean = false, touchable: boolean = true) {
            this.alpha = alpha;
            this.rotation = rotation;
            this.grayed = grayed;
            this.touchable = touchable;
        }
    }
}
