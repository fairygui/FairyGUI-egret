
module fairygui {

    export class GearLook extends GearBase {
        public tweener: egret.Tween;

        private _storage: any;
        private _default: GearLookValue;
        private _tweenValue: egret.Point;
        private _tweenTarget: GearLookValue;

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

                if (this.tweener != null) {
                    if (this._tweenTarget.alpha != gv.alpha || this._tweenTarget.rotation != gv.rotation) {
                        this.tweener["tick"] ? this.tweener["tick"](100000000) : this.tweener["$tick"](100000000);
                        this.tweener = null;
                    }
                    else
                        return;
                }

                var a: boolean = gv.alpha != this._owner.alpha;
                var b: boolean = gv.rotation != this._owner.rotation;
                if (a || b) {
                    if (this._owner.checkGearController(0, this._controller))
                        this._displayLockToken = this._owner.addDisplayLock();
                    this._tweenTarget = gv;

                    var vars: any = {
                        onChange: function (): void {
                            this._owner._gearLocked = true;
                            if (a)
                                this._owner.alpha = this._tweenValue.x;
                            if (b)
                                this._owner.rotation = this._tweenValue.y;
                            this._owner._gearLocked = false;
                        },
                        onChangeObj: this
                    };

                    if (this._tweenValue == null)
                        this._tweenValue = new egret.Point();
                    this._tweenValue.x = this._owner.alpha;
                    this._tweenValue.y = this._owner.rotation;
                    this.tweener = egret.Tween.get(this._tweenValue, vars)
                        .wait(this._tweenDelay * 1000)
                        .to({ x: gv.alpha, y: gv.rotation }, this._tweenTime * 1000, this._easeType)
                        .call(function (): void {
                            if (this._displayLockToken != 0) {
                                this._owner.releaseDisplayLock(this._displayLockToken);
                                this._displayLockToken = 0;
                            }
                            this._tweener = null;
                            this._owner.dispatchEventWith(GObject.GEAR_STOP, false);
                        }, this);
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
