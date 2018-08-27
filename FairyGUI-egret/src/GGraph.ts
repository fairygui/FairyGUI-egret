
module fairygui {

    export class GGraph extends GObject {
        private _graphics: egret.Graphics;

        private _type: number = 0;
        private _lineSize: number = 0;
        private _lineColor: number = 0;
        private _lineAlpha: number;
        private _fillColor: number = 0;
        private _fillAlpha: number;
        private _cornerRadius: Array<number>;

        public constructor() {
            super();

            this._lineSize = 1;
            this._lineAlpha = 1;
            this._fillAlpha = 1;
            this._fillColor = 0xFFFFFF;
            this._cornerRadius = null;
        }

        public get graphics(): egret.Graphics {
            if (this._graphics)
                return this._graphics;

            this.delayCreateDisplayObject();
            this._graphics = (<egret.Sprite>(this.displayObject)).graphics;
            return this._graphics;
        }

        public drawRect(lineSize: number, lineColor: number, lineAlpha: number,
            fillColor: number, fillAlpha: number, corner: Array<number> = null): void {
            this._type = 1;
            this._lineSize = lineSize;
            this._lineColor = lineColor;
            this._lineAlpha = lineAlpha;
            this._fillColor = fillColor;
            this._fillAlpha = fillAlpha;
            this._cornerRadius = corner;
            this.drawCommon();
        }

        public drawEllipse(lineSize: number, lineColor: number, lineAlpha: number,
            fillColor: number, fillAlpha: number): void {
            this._type = 2;
            this._lineSize = lineSize;
            this._lineColor = lineColor;
            this._lineAlpha = lineAlpha;
            this._fillColor = fillColor;
            this._fillAlpha = fillAlpha;
            this._cornerRadius = null;
            this.drawCommon();
        }

        public clearGraphics(): void {
            if (this._graphics) {
                this._type = 0;
                this._graphics.clear();
            }
        }

        public get color(): number {
            return this._fillColor;
        }

        public set color(value: number) {
            this._fillColor = value;
            if (this._type != 0)
                this.drawCommon();
        }

        private drawCommon(): void {
            this.graphics;

            this._graphics.clear();

            var w: number = this.width;
            var h: number = this.height;
            if (w == 0 || h == 0)
                return;

            if (this._lineSize == 0)
                this._graphics.lineStyle(0, 0, 0);
            else
                this._graphics.lineStyle(this._lineSize, this._lineColor, this._lineAlpha);
            this._graphics.beginFill(this._fillColor, this._fillAlpha);
            if (this._type == 1) {
                if (this._cornerRadius) {
                    if (this._cornerRadius.length == 1)
                        this._graphics.drawRoundRect(0, 0, w, h, this._cornerRadius[0] * 2, this._cornerRadius[0] * 2);
                    else
                        this._graphics.drawRoundRect(0, 0, w, h, this._cornerRadius[0] * 2, this._cornerRadius[1] * 2);
                }
                else
                    this._graphics.drawRect(0, 0, w, h);
            }
            else
                this._graphics.drawEllipse(0, 0, w, h);
            this._graphics.endFill();
        }

        public replaceMe(target: GObject): void {
            if (!this._parent)
                throw "parent not set";

            target.name = this.name;
            target.alpha = this.alpha;
            target.rotation = this.rotation;
            target.visible = this.visible;
            target.touchable = this.touchable;
            target.grayed = this.grayed;
            target.setXY(this.x, this.y);
            target.setSize(this.width, this.height);

            var index: number = this._parent.getChildIndex(this);
            this._parent.addChildAt(target, index);
            target.relations.copyFrom(this.relations);

            this._parent.removeChild(this, true);
        }

        public addBeforeMe(target: GObject): void {
            if (this._parent == null)
                throw "parent not set";

            var index: number = this._parent.getChildIndex(this);
            this._parent.addChildAt(target, index);
        }

        public addAfterMe(target: GObject): void {
            if (this._parent == null)
                throw "parent not set";

            var index: number = this._parent.getChildIndex(this);
            index++;
            this._parent.addChildAt(target, index);
        }

        public setNativeObject(obj: egret.DisplayObject): void {
            this.delayCreateDisplayObject();
            (<egret.Sprite>(this.displayObject)).addChild(obj);
        }

        private delayCreateDisplayObject(): void {
            if (!this.displayObject) {
                var sprite: UISprite = new UISprite();
                sprite["$owner"] = this;
                this.setDisplayObject(sprite);
                if (this._parent)
                    this._parent.childStateChanged(this);
                this.handleXYChanged();
                sprite.alpha = this.alpha;
                sprite.rotation = this.rotation;
                sprite.visible = this.visible;
                sprite.touchEnabled = this.touchable;
                sprite.touchChildren = this.touchable;
                sprite.hitArea = new egret.Rectangle(0, 0, this.width, this.height);
            }
            else {
                (<egret.Sprite>(this.displayObject)).graphics.clear();
                (<egret.Sprite>(this.displayObject)).removeChildren();
                this._graphics = null;
            }
        }

        protected handleSizeChanged(): void {
            if (this._graphics) {
                if (this._type != 0)
                    this.drawCommon();
            }

            if (this.displayObject instanceof UISprite) {
                if ((<UISprite>(this.displayObject)).hitArea == null)
                    (<UISprite>(this.displayObject)).hitArea = new egret.Rectangle(0, 0, this.width, this.height);
                else {
                    (<UISprite>(this.displayObject)).hitArea.width = this.width;
                    (<UISprite>(this.displayObject)).hitArea.height = this.height;
                }
            }
        }

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            buffer.seek(beginPos, 5);

            var type: number = buffer.readByte();
            if (type != 0) {
                this._lineSize = buffer.readInt();
                var c: number = buffer.readColor(true);
                this._lineColor = c & 0xFFFFFF;
                this._lineAlpha = ((c >> 24) & 0xFF) / 0xFF;
                c = buffer.readColor(true);
                this._fillColor = c & 0xFFFFFF;
                this._fillAlpha = ((c >> 24) & 0xFF) / 0xFF;
                if (buffer.readBool()) {
                    this._cornerRadius = new Array<number>(4);
                    for (var i: number = 0; i < 4; i++)
                        this._cornerRadius[i] = buffer.readFloat();
                }

                var sprite: UISprite = new UISprite();
                sprite["$owner"] = this;
                this.setDisplayObject(sprite);
            }

            super.setup_beforeAdd(buffer, beginPos);

            if (this.displayObject != null) {
                this._graphics = (<egret.Sprite>(this.displayObject)).graphics;
                this._type = type;
                this.drawCommon();
            }
        }
    }
}