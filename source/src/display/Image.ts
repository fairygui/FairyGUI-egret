module fgui {
    export class Image extends egret.Bitmap {
        private _fillMethod: number = 0;
        private _fillOrigin: number = 0;
        private _fillAmount: number = 0;
        private _fillClockwise: boolean = false;
        private _mask: egret.Shape;
        private _maskDirtyFlag: boolean = false;
        private _color: number;

        constructor() {
            super();

            this._color = 0xFFFFFF;
        }

        public get color(): number {
            return this._color;
        }

        public set color(value: number) {
            if (this._color != value) {
                this._color = value;
                if (this.tint == undefined) //5.2.24 之前没有，用滤镜
                    ToolSet.setColorFilter(this, value);
                else
                    this.tint = value;
            }
        }

        public $setX(value: number): boolean {
            if (this.mask)
                this.mask.x = value;
            return super.$setX(value);
        }

        public $setY(value: number): boolean {
            if (this.mask)
                this.mask.y = value;
            return super.$setY(value);
        }

        public get fillMethod(): FillMethod {
            return this._fillMethod;
        }

        public set fillMethod(value: FillMethod) {
            if (this._fillMethod != value) {
                this._fillMethod = value;

                if (this._fillMethod != 0) {
                    if (!this._mask) {
                        this._mask = new egret.Shape();
                        this._mask.touchEnabled = false;
                    }
                    this.mask = this._mask;
                    this._mask.x = this.x;
                    this._mask.y = this.y;
                    this.addEventListener(egret.Event.RESIZE, this.markChanged, this);
                    this.markChanged();
                }
                else if (this.mask) {
                    this._mask.graphics.clear();
                    this.mask = null;
                    this.removeEventListener(egret.Event.RESIZE, this.markChanged, this);
                }
            }
        }

        public get fillOrigin(): number {
            return this._fillOrigin;
        }

        public set fillOrigin(value: number) {
            if (this._fillOrigin != value) {
                this._fillOrigin = value;
                if (this._fillMethod != 0)
                    this.markChanged();
            }
        }

        public get fillClockwise(): boolean {
            return this._fillClockwise;
        }

        public set fillClockwise(value: boolean) {
            if (this._fillClockwise != value) {
                this._fillClockwise = value;
                if (this._fillMethod != 0)
                    this.markChanged();
            }
        }

        public get fillAmount(): number {
            return this._fillAmount;
        }

        public set fillAmount(value: number) {
            if (this._fillAmount != value) {
                this._fillAmount = value;
                if (this._fillMethod != 0)
                    this.markChanged();
            }
        }

        private markChanged(): void {
            if (!this._maskDirtyFlag) {
                this._maskDirtyFlag = true;

                GTimers.inst.callLater(this.doFill, this);
            }
        }

        private doFill(): void {
            this._maskDirtyFlag = false;

            if (!this._mask.parent && this.parent)
                this.parent.addChild(this._mask);

            var w: number = this.width;
            var h: number = this.height;
            var g: egret.Graphics = this._mask.graphics;
            g.clear();

            if (w == 0 || h == 0)
                return;

            var points: any[] = FillUtils.fill(w, h, this._fillMethod, this._fillOrigin, this._fillClockwise, this._fillAmount);
            if (points == null)
                return;

            g.beginFill(0, 1);
            ToolSet.fillPath(g, points, 0, 0);
            g.endFill();
        }
    }
}
