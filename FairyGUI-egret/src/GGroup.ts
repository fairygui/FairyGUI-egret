
module fairygui {

    export class GGroup extends GObject {
        public _updating: boolean;
        public _empty: boolean;

        public constructor() {
            super();
        }

        public updateBounds(): void {
            if (this._updating || !this.parent)
                return;

            var cnt: number = this._parent.numChildren;
            var i: number = 0;
            var child: GObject;
            var ax: number = Number.POSITIVE_INFINITY, ay: number = Number.POSITIVE_INFINITY;
            var ar: number = Number.NEGATIVE_INFINITY, ab: number = Number.NEGATIVE_INFINITY;
            var tmp: number = 0;
            this._empty = true;
            for (i = 0; i < cnt; i++) {
                child = this._parent.getChildAt(i);
                if (child.group == this) {
                    tmp = child.x;
                    if (tmp < ax)
                        ax = tmp;
                    tmp = child.y;
                    if (tmp < ay)
                        ay = tmp;
                    tmp = child.x + child.width;
                    if (tmp > ar)
                        ar = tmp;
                    tmp = child.y + child.height;
                    if (tmp > ab)
                        ab = tmp;
                    this._empty = false;
                }
            }

            this._updating = true;
            if (!this._empty) {
                this.setXY(ax, ay);
                this.setSize(ar - ax, ab - ay);
            }
            else
                this.setSize(0, 0);
            this._updating = false;
        }

        public moveChildren(dx:number, dy:number): void {
            if (this._updating || !this.parent)
                return;

            this._updating = true;
            var cnt: number = this._parent.numChildren;
            var i: number = 0;
            var child: GObject;
            for (i = 0; i < cnt; i++) {
                child = this._parent.getChildAt(i);
                if (child.group == this) {
                    child.setXY(child.x + dx, child.y + dy);
                }
            }
            this._updating = false;
        }
    }
}