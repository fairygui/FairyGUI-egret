
module fgui {

    export class GImage extends GObject {
        private _content: Image;
        private _flip: FlipType;

        public constructor() {
            super();
            this._flip = FlipType.None;
        }

        public get color(): number {
            return this._content.color;
        }

        public set color(value: number) {
            if (this._content.color != value) {
                this._content.color = value;
                this.updateGear(4);
            }
        }

        public get flip(): FlipType {
            return this._flip;
        }

        public set flip(value: FlipType) {
            if (this._flip != value) {
                this._flip = value;

                var sx: number = 1, sy: number = 1;
                if (this._flip == FlipType.Horizontal || this._flip == FlipType.Both)
                    sx = -1;
                if (this._flip == FlipType.Vertical || this._flip == FlipType.Both)
                    sy = -1;

                this._content.scaleX = sx;
                this._content.scaleY = sy;
                this.handleXYChanged();
            }
        }

        public get fillMethod(): number {
            return this._content.fillMethod;
        }

        public set fillMethod(value: number) {
            this._content.fillMethod = value;
        }

        public get fillOrigin(): number {
            return this._content.fillOrigin;
        }

        public set fillOrigin(value: number) {
            this._content.fillOrigin = value;
        }

        public get fillClockwise(): boolean {
            return this._content.fillClockwise;
        }

        public set fillClockwise(value: boolean) {
            this._content.fillClockwise = value;
        }

        public get fillAmount(): number {
            return this._content.fillAmount;
        }

        public set fillAmount(value: number) {
            this._content.fillAmount = value;
        }

        public get texture(): egret.Texture {
            return this._content.texture;
        }

        public set texture(value: egret.Texture) {
            if (value) {
                this.sourceWidth = value.textureWidth;
                this.sourceHeight = value.textureHeight;
            }
            else {
                this.sourceWidth = 0;
                this.sourceHeight = 0;
            }
            this.initWidth = this.sourceWidth;
            this.initHeight = this.sourceHeight;
            this._content.scale9Grid = null;
            this._content.fillMode = egret.BitmapFillMode.SCALE;
            this._content.texture = value;
        }

        protected createDisplayObject(): void {
            this._content = new Image();
            this._content.touchEnabled = false;
            this.setDisplayObject(this._content);
        }

        public constructFromResource(): void {
            var contentItem: PackageItem = this.packageItem.getBranch();
            this.sourceWidth = contentItem.width;
            this.sourceHeight = contentItem.height;
            this.initWidth = this.sourceWidth;
            this.initHeight = this.sourceHeight;
            this.setSize(this.sourceWidth, this.sourceHeight);

            contentItem = contentItem.getHighResolution();
            contentItem.load();

            this._content.scale9Grid = contentItem.scale9Grid;
            this._content.smoothing = contentItem.smoothing;
            if (contentItem.scaleByTile)
                this._content.fillMode = egret.BitmapFillMode.REPEAT;

            this.setSize(this.sourceWidth, this.sourceHeight);

            this._content.texture = <egret.Texture>contentItem.asset;
        }

        protected handleXYChanged(): void {
            super.handleXYChanged();

            if (this._flip != FlipType.None) {
                if (this._content.scaleX == -1)
                    this._content.x += this.width;
                if (this._content.scaleY == -1)
                    this._content.y += this.height;
            }
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

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_beforeAdd(buffer, beginPos);

            buffer.seek(beginPos, 5);

            if (buffer.readBool())
                this.color = buffer.readColor();
            this.flip = buffer.readByte();
            this._content.fillMethod = buffer.readByte();
            if (this._content.fillMethod != 0) {
                this._content.fillOrigin = buffer.readByte();
                this._content.fillClockwise = buffer.readBool();
                this._content.fillAmount = buffer.readFloat();
            }
        }
    }
}
