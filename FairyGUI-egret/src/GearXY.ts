
module fairygui {

    export class GearXY extends GearBase {
        private _storage: any;
        private _default: egret.Point;
        private _tweenValue: egret.Point;
        private _tweener: egret.Tween;

        public constructor(owner: GObject) {
            super(owner);
        }
        
        protected init(): void {
            this._default = new egret.Point(this._owner.x,this._owner.y);
            this._storage = {};
        }

        protected addStatus(pageId: string, value: string): void {
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
            var pt: egret.Point;
            var ct: boolean = this.connected;
            if (ct) {
                pt = this._storage[this._controller.selectedPageId];
                if (!pt)
                    pt = this._default;
            }
            else
                pt = this._default;
                
            if(this._tweener)
                this._tweener.tick(100000000);
                
            if(this._tween && !UIPackage._constructing
                && ct && this._pageSet.containsId(this._controller.previousPageId)) {

                if(this._owner.x != pt.x || this._owner.y != pt.y) {
                    this._owner.internalVisible++;
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
                    this._tweener = egret.Tween.get(this._tweenValue,vars)
                        .to({ x: pt.x,y: pt.y },this._tweenTime * 1000,this._easeType)
                        .call(function(): void {
                            this._owner.internalVisible--;
                            this._tweener = null;
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
            if (this._owner._gearLocked)
                return;

            if (this.connected) {
                var pt: egret.Point = this._storage[this._controller.selectedPageId];
                if(!pt) {
                    pt = new egret.Point();
                    this._storage[this._controller.selectedPageId] = pt;
                }
            }
            else {
                pt = this._default;
            }

            pt.x = this._owner.x;
            pt.y = this._owner.y;
        }

        public updateFromRelations(dx: number, dy: number): void {
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