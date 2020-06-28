
module fgui {

    export class GGraph extends GObject {
        private _graphics: egret.Graphics;

        private _type: number = 0;
        private _lineSize: number = 0;
        private _lineColor: number = 0;
        private _lineAlpha: number;
        private _fillColor: number = 0;
        private _fillAlpha: number;
        private _cornerRadius?: Array<number>;
        private _sides?: number;
        private _startAngle?: number;
        private _polygonPoints?: any[];
        private _distances?: number[];

        public constructor() {
            super();

            this._lineSize = 1;
            this._lineAlpha = 1;
            this._fillAlpha = 1;
            this._fillColor = 0xFFFFFF;
        }

        public get graphics(): egret.Graphics {
            return this._graphics;
        }

        public drawRect(lineSize: number, lineColor: number, lineAlpha: number,
            fillColor: number, fillAlpha: number, corner?: Array<number>): void {
            this._type = 1;
            this._lineSize = lineSize;
            this._lineColor = lineColor;
            this._lineAlpha = lineAlpha;
            this._fillColor = fillColor;
            this._fillAlpha = fillAlpha;
            this._cornerRadius = corner;
            this.updateGraph();
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
            this.updateGraph();
        }

        public drawRegularPolygon(lineSize: number, lineColor: number, lineAlpha: number,
            fillColor: number, fillAlpha: number, sides: number, startAngle?: number, distances?: number[]): void {
            this._type = 4;
            this._lineSize = lineSize;
            this._lineColor = lineColor;
            this._lineAlpha = lineAlpha;
            this._fillColor = fillColor;
            this._fillAlpha = fillAlpha;
            this._sides = sides;
            this._startAngle = startAngle || 0;
            this._distances = distances;
            this.updateGraph();
        }

        public drawPolygon(lineSize: number, lineColor: number, lineAlpha: number, fillColor: number, fillAlpha: number, points: number[]): void {
            this._type = 3;
            this._lineSize = lineSize;
            this._lineColor = lineColor;
            this._lineAlpha = lineAlpha;
            this._fillColor = fillColor;
            this._fillAlpha = fillAlpha;
            this._polygonPoints = points;
            this.updateGraph();
        }

        public get distances(): number[] {
            return this._distances;
        }

        public set distances(value: number[]) {
            this._distances = value;
            if (this._type == 3)
                this.updateGraph();
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
                this.updateGraph();
        }

        private updateGraph(): void {
            let ctx = this.graphics;

            ctx.clear();

            var w: number = this.width;
            var h: number = this.height;
            if (w == 0 || h == 0)
                return;

            if (this._lineSize == 0)
                ctx.lineStyle(0, 0, 0);
            else
                ctx.lineStyle(this._lineSize, this._lineColor, this._lineAlpha);
            ctx.beginFill(this._fillColor, this._fillAlpha);
            if (this._type == 1) {
                if (this._cornerRadius) {
                    if (this._cornerRadius.length == 1)
                        ctx.drawRoundRect(0, 0, w, h, this._cornerRadius[0] * 2, this._cornerRadius[0] * 2);
                    else
                        ctx.drawRoundRect(0, 0, w, h, this._cornerRadius[0] * 2, this._cornerRadius[1] * 2);
                }
                else
                    ctx.drawRect(0, 0, w, h);
            }
            else if (this._type == 2)
                ctx.drawEllipse(0, 0, w, h);
            else if (this._type == 3) {
                ToolSet.fillPath(ctx, this._polygonPoints, 0, 0);
            }
            else if (this._type == 4) {
                if (!this._polygonPoints)
                    this._polygonPoints = [];
                var radius: number = Math.min(this._width, this._height) / 2;
                this._polygonPoints.length = 0;
                var angle: number = this._startAngle * Math.PI / 180;
                var deltaAngle: number = 2 * Math.PI / this._sides;
                var dist: number;
                for (var i: number = 0; i < this._sides; i++) {
                    if (this._distances) {
                        dist = this._distances[i];
                        if (isNaN(dist))
                            dist = 1;
                    }
                    else
                        dist = 1;

                    var xv: number = radius + radius * dist * Math.cos(angle);
                    var yv: number = radius + radius * dist * Math.sin(angle);
                    this._polygonPoints.push(xv, yv);

                    angle += deltaAngle;
                }

                ToolSet.fillPath(ctx, this._polygonPoints, 0, 0);
            }
            ctx.endFill();
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
            var sprite: egret.Sprite = new egret.Sprite();
            this.setDisplayObject(sprite);
            if (this._parent)
                this._parent.childStateChanged(this);
            this.handleXYChanged();
            sprite.alpha = this.alpha;
            sprite.rotation = this.rotation;
            sprite.visible = this.visible;
            sprite.touchEnabled = this.touchable;
            sprite.touchChildren = this.touchable;
            sprite.addChild(obj);
        }

        protected createDisplayObject(): void {
            let sprite: egret.Sprite = new egret.Sprite();
            sprite.touchEnabled = true;
            this._graphics = sprite.graphics;
            this.setDisplayObject(sprite);
        }

        public getProp(index: number): any {
            if (index == ObjectPropID.Color)
                return this.color;
            else
                return super.getProp(index);
        }

        public setProp(index: number, value: any): void {
            if (index == ObjectPropID.Color)
                this.color = value;
            else
                super.setProp(index, value);
        }

        protected handleSizeChanged(): void {
            super.handleSizeChanged();

            if (this._type != 0)
                this.updateGraph();
        }

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_beforeAdd(buffer, beginPos);

            buffer.seek(beginPos, 5);

            this._type = buffer.readByte();
            if (this._type != 0) {
                var i: number;
                var cnt: number;

                this._lineSize = buffer.readInt();
                var c: number = buffer.readColor(true);
                this._lineColor = c & 0xFFFFFF;
                this._lineAlpha = ((c >> 24) & 0xFF) / 0xFF;
                c = buffer.readColor(true);
                this._fillColor = c & 0xFFFFFF;
                this._fillAlpha = ((c >> 24) & 0xFF) / 0xFF;
                if (buffer.readBool()) {
                    this._cornerRadius = new Array<number>(4);
                    for (i = 0; i < 4; i++)
                        this._cornerRadius[i] = buffer.readFloat();
                }

                if (this._type == 3) {
                    cnt = buffer.readShort();
                    this._polygonPoints = [];
                    this._polygonPoints.length = cnt;
                    for (i = 0; i < cnt; i++)
                        this._polygonPoints[i] = buffer.readFloat();
                }
                else if (this._type == 4) {
                    this._sides = buffer.readShort();
                    this._startAngle = buffer.readFloat();
                    cnt = buffer.readShort();
                    if (cnt > 0) {
                        this._distances = [];
                        for (i = 0; i < cnt; i++)
                            this._distances[i] = buffer.readFloat();
                    }
                }

                this.updateGraph();
            }
        }
    }
}