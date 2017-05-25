
module fairygui {

    export class GSlider extends GComponent {
        private _max: number = 0;
        private _value: number = 0;
        private _titleType: ProgressTitleType;

        private _titleObject: GTextField;
        private _aniObject: GObject;
        private _barObjectH: GObject;
        private _barObjectV: GObject;
        private _barMaxWidth: number = 0;
        private _barMaxHeight: number = 0;
        private _barMaxWidthDelta: number = 0;
        private _barMaxHeightDelta: number = 0;
        private _gripObject: GObject;
        private _clickPos: egret.Point;
        private _clickPercent: number;

        public constructor() {
            super();

            this._titleType = ProgressTitleType.Percent;
            this._value = 50;
            this._max = 100;
            this._clickPos = new egret.Point();
        }

        public get titleType(): ProgressTitleType {
            return this._titleType;
        }

        public set titleType(value: ProgressTitleType) {
            this._titleType = value;
        }

        public get max(): number {
            return this._max;
        }

        public set max(value: number) {
            if (this._max != value) {
                this._max = value;
                this.update();
            }
        }

        public get value(): number {
            return this._value;
        }

        public set value(value: number) {
            if (this._value != value) {
                this._value = value;
                this.update();
            }
        }

        public update(): void {
            var percent: number = Math.min(this._value / this._max, 1);
            this.updateWidthPercent(percent);
        }

        private updateWidthPercent(percent: number): void {
            if (this._titleObject) {
                switch (this._titleType) {
                    case ProgressTitleType.Percent:
                        this._titleObject.text = Math.round(percent * 100) + "%";
                        break;

                    case ProgressTitleType.ValueAndMax:
                        this._titleObject.text = this._value + "/" + this._max;
                        break;

                    case ProgressTitleType.Value:
                        this._titleObject.text = "" + this._value;
                        break;

                    case ProgressTitleType.Max:
                        this._titleObject.text = "" + this._max;
                        break;
                }
            }

            if (this._barObjectH)
                this._barObjectH.width = (this.width - this._barMaxWidthDelta) * percent;
            if (this._barObjectV)
                this._barObjectV.height = (this.height - this._barMaxHeightDelta) * percent;

            if (this._aniObject instanceof GMovieClip)
                (<GMovieClip><any>(this._aniObject)).frame = Math.round(percent * 100);
        }

        protected constructFromXML(xml: any): void {
            super.constructFromXML(xml);

            xml = ToolSet.findChildNode(xml, "Slider");

            var str: string;
            str = xml.attributes.titleType;
            if (str)
                this._titleType = parseProgressTitleType(str);

            this._titleObject = <GTextField><any>(this.getChild("title"));
            this._barObjectH = this.getChild("bar");
            this._barObjectV = this.getChild("bar_v");
            this._aniObject = this.getChild("ani");
            this._gripObject = this.getChild("grip");

            if (this._barObjectH) {
                this._barMaxWidth = this._barObjectH.width;
                this._barMaxWidthDelta = this.width - this._barMaxWidth;
            }
            if (this._barObjectV) {
                this._barMaxHeight = this._barObjectV.height;
                this._barMaxHeightDelta = this.height - this._barMaxHeight;
            }
            if (this._gripObject) {
                this._gripObject.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__gripMouseDown, this);
            }
        }

        protected handleSizeChanged(): void {
            super.handleSizeChanged();

            if (this._barObjectH)
                this._barMaxWidth = this.width - this._barMaxWidthDelta;
            if (this._barObjectV)
                this._barMaxHeight = this.height - this._barMaxHeightDelta;
            if (!this._underConstruct)
                this.update();
        }

        public setup_afterAdd(xml: any): void {
            super.setup_afterAdd(xml);

            xml = ToolSet.findChildNode(xml, "Slider");
            if (xml) {
                this._value = parseInt(xml.attributes.value);
                this._max = parseInt(xml.attributes.max);
            }

            this.update();
        }

        private __gripMouseDown(evt: egret.TouchEvent): void {
            this._clickPos = this.globalToLocal(evt.stageX, evt.stageY);
            this._clickPercent = this._value / this._max;

            this._gripObject.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__gripMouseMove, this);
            this._gripObject.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.__gripMouseUp, this);
        }

        private static sSilderHelperPoint: egret.Point = new egret.Point();
        private __gripMouseMove(evt: egret.TouchEvent): void {
            var pt: egret.Point = this.globalToLocal(evt.stageX, evt.stageY, GSlider.sSilderHelperPoint);
            var deltaX: number = pt.x - this._clickPos.x;
            var deltaY: number = pt.y - this._clickPos.y;

            var percent: number;
            if (this._barObjectH)
                percent = this._clickPercent + deltaX / this._barMaxWidth;
            else
                percent = this._clickPercent + deltaY / this._barMaxHeight;
            if (percent > 1)
                percent = 1;
            else if (percent < 0)
                percent = 0;
            var newValue: number = Math.round(this._max * percent);
            if (newValue != this._value) {
                this._value = newValue;
                this.dispatchEvent(new StateChangeEvent(StateChangeEvent.CHANGED));
            }
            this.updateWidthPercent(percent);
        }

        private __gripMouseUp(evt: egret.TouchEvent): void {
            var percent: number = this._value / this._max;
            this.updateWidthPercent(percent);

            this._gripObject.displayObject.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__gripMouseMove, this);
            this._gripObject.displayObject.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__gripMouseUp, this);
        }
    }
}