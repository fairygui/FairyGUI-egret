
module fairygui {

    export class GProgressBar extends GComponent {
        private _max: number = 0;
        private _value: number = 0;
        private _titleType: ProgressTitleType;
        private _reverse: boolean;

        private _titleObject: GTextField;
        private _aniObject: GObject;
        private _barObjectH: GObject;
        private _barObjectV: GObject;
        private _barMaxWidth: number = 0;
        private _barMaxHeight: number = 0;
        private _barMaxWidthDelta: number = 0;
        private _barMaxHeightDelta: number = 0;
        private _barStartX: number = 0;
        private _barStartY: number = 0;
        
        private _tweener: egret.Tween;
        private _tweenValue: number = 0;
        
        private static easeLinear: Function = egret.Ease.getPowIn(1);

        public constructor() {
            super();

            this._titleType = ProgressTitleType.Percent;
            this._value = 50;
            this._max = 100;
        }

        public get titleType(): ProgressTitleType {
            return this._titleType;
        }

        public set titleType(value: ProgressTitleType) {
            if(this._titleType != value) {
                this._titleType = value;
                this.update(this._value);
            }
        }

        public get max(): number {
            return this._max;
        }

        public set max(value: number) {
            if(this._max != value) {
                this._max = value;
                this.update(this._value);
            }
        }

        public get value(): number {
            return this._value;
        }

        public set value(value: number) {
            if(this._tweener != null) {
                this._tweener.setPaused(true);
                this._tweener = null;
            }
            
            if(this._value != value) {
                this._value = value;
                this.update(this._value);
            }
        }
        
        public tweenValue(value:number, duration:number):void
		{
            if(this._value != value) {
                if(this._tweener)
                    this._tweener.setPaused(true);
    
                this._tweenValue = this._value;
                this._value = value;
                this._tweener = egret.Tween.get(this,{ onChange: this.onUpdateTween,onChangeObj: this })
                    .to({ _tweenValue: value },duration * 1000, GProgressBar.easeLinear);
            }
        }
    
        private onUpdateTween(): void {
            this.update(this._tweenValue);
        }

        public update(newValue:number): void {
            var percent: number = Math.min(newValue / this._max,1);
            if(this._titleObject) {
                switch(this._titleType) {
                    case ProgressTitleType.Percent:
                        this._titleObject.text = Math.round(percent * 100) + "%";
                        break;

                    case ProgressTitleType.ValueAndMax:
                        this._titleObject.text = Math.round(newValue) + "/" + Math.round(this._max);
                        break;

                    case ProgressTitleType.Value:
                        this._titleObject.text = "" + Math.round(newValue);
                        break;

                    case ProgressTitleType.Max:
                        this._titleObject.text = "" + Math.round(this._max);
                        break;
                }
            }

            var fullWidth: number = this.width - this._barMaxWidthDelta;
            var fullHeight: number = this.height - this._barMaxHeightDelta;
            if(!this._reverse) {
                if(this._barObjectH)
                    this._barObjectH.width = fullWidth * percent;
                if(this._barObjectV)
                    this._barObjectV.height = fullHeight * percent;
            }
            else {
                if(this._barObjectH) {
                    this._barObjectH.width = fullWidth * percent;
                    this._barObjectH.x = this._barStartX + (fullWidth - this._barObjectH.width);

                }
                if(this._barObjectV) {
                    this._barObjectV.height = fullHeight * percent;
                    this._barObjectV.y = this._barStartY + (fullHeight - this._barObjectV.height);
                }
            }
            if(this._aniObject instanceof GMovieClip)
                (<GMovieClip><any> (this._aniObject)).frame = Math.round(percent * 100);
        }

        protected constructFromXML(xml: any): void {
            super.constructFromXML(xml);

            xml = ToolSet.findChildNode(xml,"ProgressBar");

            var str: string;
            str = xml.attributes.titleType;
            if(str)
                this._titleType = parseProgressTitleType(str);

            this._reverse = xml.attributes.reverse == "true";

            this._titleObject = <GTextField><any> (this.getChild("title"));
            this._barObjectH = this.getChild("bar");
            this._barObjectV = this.getChild("bar_v");
            this._aniObject = this.getChild("ani");

            if(this._barObjectH) {
                this._barMaxWidth = this._barObjectH.width;
                this._barMaxWidthDelta = this.width - this._barMaxWidth;
                this._barStartX = this._barObjectH.x;
            }
            if(this._barObjectV) {
                this._barMaxHeight = this._barObjectV.height;
                this._barMaxHeightDelta = this.height - this._barMaxHeight;
                this._barStartY = this._barObjectV.y;
            }
        }

        protected handleSizeChanged(): void {
            super.handleSizeChanged();

            if(this._barObjectH)
                this._barMaxWidth = this.width - this._barMaxWidthDelta;
            if(this._barObjectV)
                this._barMaxHeight = this.height - this._barMaxHeightDelta;
            if(!this._underConstruct)
                this.update(this._value);
        }

        public setup_afterAdd(xml: any): void {
            super.setup_afterAdd(xml);

            xml = ToolSet.findChildNode(xml, "ProgressBar");
            if (xml) {
                this._value = parseInt(xml.attributes.value);
                this._max = parseInt(xml.attributes.max);
            }
            this.update(this._value);
        }
        
        public dispose(): void {
            if(this._tweener)
                this._tweener.setPaused(true);
            super.dispose();
        }
    }
}