
module fgui {

    export class GScrollBar extends GComponent {
        private _grip: GObject;
        private _arrowButton1: GObject;
        private _arrowButton2: GObject;
        private _bar: GObject;
        private _target: ScrollPane;

        private _vertical: boolean;
        private _scrollPerc: number;
        private _fixedGripSize: boolean;

        private _dragOffset: egret.Point;
        private _gripDragging: boolean;

        public constructor() {
            super();
            this._dragOffset = new egret.Point();
            this._scrollPerc = 0;
        }

        public setScrollPane(target: ScrollPane, vertical: boolean): void {
            this._target = target;
            this._vertical = vertical;
        }

        public setDisplayPerc(value: number) {
            if (this._vertical) {
                if (!this._fixedGripSize)
                    this._grip.height = Math.floor(value * this._bar.height);
                this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;

            }
            else {
                if (!this._fixedGripSize)
                    this._grip.width = Math.floor(value * this._bar.width);
                this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
            }
            this._grip.visible = value != 0 && value != 1;
        }

        public setScrollPerc(val: number) {
            this._scrollPerc = val;
            if (this._vertical)
                this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;
            else
                this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
        }

        public get minSize(): number {
            if (this._vertical)
                return (this._arrowButton1 != null ? this._arrowButton1.height : 0) + (this._arrowButton2 != null ? this._arrowButton2.height : 0);
            else
                return (this._arrowButton1 != null ? this._arrowButton1.width : 0) + (this._arrowButton2 != null ? this._arrowButton2.width : 0);
        }

        public get gripDragging(): boolean {
            return this._gripDragging;
        }

        protected constructExtension(buffer: ByteBuffer): void {
            buffer.seek(0, 6);

            this._fixedGripSize = buffer.readBool();

            this._grip = this.getChild("grip");
            if (!this._grip) {
                console.error("需要定义grip");
                return;
            }

            this._bar = this.getChild("bar");
            if (!this._bar) {
                console.error("需要定义bar");
                return;
            }

            this._arrowButton1 = this.getChild("arrow1");
            this._arrowButton2 = this.getChild("arrow2");

            this._grip.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__gripMouseDown, this);

            if (this._arrowButton1)
                this._arrowButton1.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__arrowButton1Click, this);
            if (this._arrowButton2)
                this._arrowButton2.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__arrowButton2Click, this);

            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__barMouseDown, this);
        }

        private __gripMouseDown(evt: egret.TouchEvent): void {
            this._gripDragging = true;
            this._target.updateScrollBarVisible();

            evt.stopPropagation();

            this.globalToLocal(evt.stageX, evt.stageY, this._dragOffset);
            this._dragOffset.x -= this._grip.x;
            this._dragOffset.y -= this._grip.y;

            this._grip.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__gripMouseMove, this);
            this._grip.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.__gripMouseUp, this);
        }

        private static sScrollbarHelperPoint: egret.Point = new egret.Point();
        private __gripMouseMove(evt: egret.TouchEvent): void {
            if (!this.onStage)
                return;

            var pt: egret.Point = this.globalToLocal(evt.stageX, evt.stageY, GScrollBar.sScrollbarHelperPoint);
            if (this._vertical) {
                var curY: number = pt.y - this._dragOffset.y;
                this._target.setPercY((curY - this._bar.y) / (this._bar.height - this._grip.height), false);
            }
            else {
                var curX: number = pt.x - this._dragOffset.x;
                this._target.setPercX((curX - this._bar.x) / (this._bar.width - this._grip.width), false);
            }
        }

        private __gripMouseUp(evt: egret.TouchEvent): void {
            var st: egret.Stage = evt.currentTarget;
            st.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__gripMouseMove, this);
            st.removeEventListener(egret.TouchEvent.TOUCH_END, this.__gripMouseUp, this);

            if (this.onStage)
                return;

            this._gripDragging = false;
            this._target.updateScrollBarVisible();
        }

        private __arrowButton1Click(evt: egret.TouchEvent): void {
            evt.stopPropagation();

            if (this._vertical)
                this._target.scrollUp();
            else
                this._target.scrollLeft();
        }

        private __arrowButton2Click(evt: egret.TouchEvent): void {
            evt.stopPropagation();

            if (this._vertical)
                this._target.scrollDown();
            else
                this._target.scrollRight();
        }

        private __barMouseDown(evt: egret.TouchEvent): void {
            var pt: egret.Point = this._grip.globalToLocal(evt.stageX, evt.stageY, GScrollBar.sScrollbarHelperPoint);
            if (this._vertical) {
                if (pt.y < 0)
                    this._target.scrollUp(4);
                else
                    this._target.scrollDown(4);
            }
            else {
                if (pt.x < 0)
                    this._target.scrollLeft(4);
                else
                    this._target.scrollRight(4);
            }
        }
    }
}