
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
            this._default = new GearLookValue(this._owner.alpha,this._owner.rotation,this._owner.grayed);
            this._storage = {};
        }

        protected addStatus(pageId: string,value: string): void {
            var arr: string[] = value.split(",");
            var gv: GearLookValue;
            if(pageId == null)
                gv = this._default;
            else {
                gv = new GearLookValue();
                this._storage[pageId] = gv;
            }
            gv.alpha = parseFloat(arr[0]);
            gv.rotation = parseInt(arr[1]);
            gv.grayed = arr[2] == "1" ? true : false;
        }

        public apply(): void {
            var gv: GearLookValue = this._storage[this._controller.selectedPageId];
            if(!gv)
                gv = this._default;

            if(this._tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect) {
                this._owner._gearLocked = true;
                this._owner.grayed = gv.grayed;
                this._owner._gearLocked = false;
                
                if (this.tweener != null) {
					if (this._tweenTarget.alpha != gv.alpha || this._tweenTarget.rotation != gv.rotation) {
						this.tweener.tick(100000000);
						this.tweener = null;
					}
					else
						return;
				}
                
                var a: boolean = gv.alpha != this._owner.alpha;
                var b: boolean = gv.rotation != this._owner.rotation;
                if(a || b) {
                    this._owner.internalVisible++;
                    this._tweenTarget = gv;
                    
                    var vars: any = {
                        onChange: function(): void {
                            this._owner._gearLocked = true;
                            if(a)
                                this._owner.alpha = this._tweenValue.x;
                            if(b)
                                this._owner.rotation = this._tweenValue.y;
                            this._owner._gearLocked = false;
                        },
                        onChangeObj: this
                    };

                    if(this._tweenValue == null)
                        this._tweenValue = new egret.Point();
                    this._tweenValue.x = this._owner.alpha;
                    this._tweenValue.y = this._owner.rotation;
                    this.tweener = egret.Tween.get(this._tweenValue,vars)
                        .wait(this._tweenDelay * 1000)
                        .to({ x: gv.alpha,y: gv.rotation },this._tweenTime * 1000,this._easeType)
                        .call(function(): void {
                            this._owner.internalVisible--;
                            this._tweener = null;
                        },this);
                }
            }
            else {
                this._owner._gearLocked = true;
                this._owner.grayed = gv.grayed;
                this._owner.alpha = gv.alpha;
                this._owner.rotation = gv.rotation;
                this._owner._gearLocked = false;
            }            
        }

        public updateState(): void {
            if(this._owner._gearLocked)
                return;

            var gv: GearLookValue = this._storage[this._controller.selectedPageId];
            if(!gv) {
                gv = new GearLookValue();
                this._storage[this._controller.selectedPageId] = gv;
            }

            gv.alpha = this._owner.alpha;
            gv.rotation = this._owner.rotation;
            gv.grayed = this._owner.grayed;
        }
    }

    class GearLookValue {
        public alpha: number;
        public rotation: number;
        public grayed: boolean;

        public constructor(alpha: number = 0,rotation: number = 0,grayed: boolean = false) {
            this.alpha = alpha;
            this.rotation = rotation;
            this.grayed = grayed;
        }
    }
}
