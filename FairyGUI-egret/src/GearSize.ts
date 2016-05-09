
module fairygui {

    export class GearSize extends GearBase {
        private _storage: any;
        private _default: GearSizeValue;
        private _tweenValue: GearSizeValue;
        private _tweener: egret.Tween;

        public constructor(owner: GObject) {
            super(owner);
        }
        
        protected init(): void {
            this._default = new GearSizeValue(this._owner.width,this._owner.height,
                this._owner.scaleX,this._owner.scaleY);
            this._storage = {};
        }

        protected addStatus(pageId: string, value: string): void {
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
            if(arr.length>2)
            {
                gv.scaleX = parseFloat(arr[2]);
                gv.scaleY = parseFloat(arr[3]);
            }
        }

        public apply(): void {
            var gv: GearSizeValue;
            var ct: boolean = this.connected;
            if (ct) {
                gv = this._storage[this._controller.selectedPageId];
                if (!gv)
                    gv = this._default;
            }
            else
                gv = this._default;
                
            if(this._tweener)
                this._tweener.tick(100000000);
                
            if(this._tween && !UIPackage._constructing
                && ct && this._pageSet.containsId(this._controller.previousPageId)) {
                var a: boolean = gv.width != this._owner.width || gv.height != this._owner.height;
                var b: boolean = gv.scaleX != this._owner.scaleX || gv.scaleY != this._owner.scaleY;
                if(a || b) {
                    this._owner.internalVisible++;
                    var vars: any = {
                        onChange: function(): void {
                            this._owner._gearLocked = true;
                            if(a)
                                this._owner.setSize(this._tweenValue.width,this._tweenValue.height,this._owner.gearXY.controller == this._controller);
                            if(b)
                                this._owner.setScale(this._tweenValue.scaleX,this._tweenValue.scaleY);
                            this._owner._gearLocked = false;
                        },
                        onChangeObj: this
                    };
                    if(this._tweenValue == null)
                        this._tweenValue = new GearSizeValue();
                    this._tweenValue.width = this._owner.width;
                    this._tweenValue.height = this._owner.height;
                    this._tweenValue.scaleX = this._owner.scaleX;
                    this._tweenValue.scaleY = this._owner.scaleY;
                    this._tweener = egret.Tween.get(this._tweenValue,vars)
                        .wait(this._tweenDelay * 1000)
                        .to({ width: gv.width, height: gv.height, scaleX: gv.scaleX, scaleY: gv.scaleY },
                            this._tweenTime * 1000, this._easeType)
                        .call(function(): void {
                            this._owner.internalVisible--;
                            this._tweener = null;
                        },this);
                }
            }
            else {
                this._owner._gearLocked = true;
                this._owner.setSize(gv.width,gv.height,this._owner.gearXY.controller == this._controller);
                this._owner.setScale(gv.scaleX,gv.scaleY);
                this._owner._gearLocked = false;
            }
        }

        public updateState(): void {
            if (this._owner._gearLocked)
                return;

            var gv: GearSizeValue;
            if (this.connected) {
                gv = this._storage[this._controller.selectedPageId];
                if(!gv) {
                    gv = new GearSizeValue();
                    this._storage[this._controller.selectedPageId] = gv;
                }
            }
            else {
                gv = this._default;
            }

            gv.width = this._owner.width;
            gv.height = this._owner.height;
            gv.scaleX = this._owner.scaleX;
            gv.scaleY = this._owner.scaleY;
        }
    }
    
    class GearSizeValue
    {
        public width:number;
        public height:number;
        public scaleX:number;
        public scaleY:number;
        
        public constructor(width:number=0, height:number=0, scaleX:number=0, scaleY:number=0)
        {
            this.width = width;
            this.height = height;
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        }
    }
}
