
module fairygui {

    export class GearXY extends GearBase {
        public tweener: egret.Tween;
        
        private _storage: any;
        private _default: egret.Point;
        private _tweenValue: egret.Point;
        private _tweenTarget: egret.Point;

        public constructor(owner: GObject) {
            super(owner);
        }
        
        protected init(): void {
            this._default = new egret.Point(this._owner.x,this._owner.y);
            this._storage = {};
        }

        protected addStatus(pageId: string, value: string): void {
              if(value=="-")
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

            if(this._tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect) {
                if(this.tweener) {
					if(this._tweenTarget.x!=pt.x || this._tweenTarget.y!=pt.y) {
						this.tweener["tick"]?this.tweener["tick"](100000000):this.tweener["$tick"](100000000);
						this.tweener = null;
					}
					else
						return;
				}
                if(this._owner.x != pt.x || this._owner.y != pt.y) {
					if(this._owner.checkGearController(0, this._controller))
						this._displayLockToken = this._owner.addDisplayLock();
                    this._tweenTarget = pt;
                    
                    var vars: any = {
                        onChange: function(): void {
                            this._owner._gearLocked = true;
                            this._owner.setXY(this._tweenValue.x,this._tweenValue.y);
                            this._owner._gearLocked = false;
                        },
                        onChangeObj: this
                    };
                    if(this._tweenValue == null)
                        this._tweenValue = new egret.Point();
                    this._tweenValue.x = this._owner.x;
                    this._tweenValue.y = this._owner.y;
                    this.tweener = egret.Tween.get(this._tweenValue,vars)
                        .wait(this._tweenDelay * 1000)
                        .to({ x: pt.x,y: pt.y },this._tweenTime * 1000,this._easeType)
                        .call(function(): void {
                            if(this._displayLockToken!=0) {
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
                this._owner.setXY(pt.x,pt.y);
                this._owner._gearLocked = false;
            }
        }

        public updateState(): void {
            var pt: egret.Point = this._storage[this._controller.selectedPageId];
            if(!pt) {
                pt = new egret.Point();
                this._storage[this._controller.selectedPageId] = pt;
            }

            pt.x = this._owner.x;
            pt.y = this._owner.y;
        }

        public updateFromRelations(dx: number, dy: number): void {
            if(this._controller==null || this._storage==null)
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
