/// <reference path="GObjectPool.ts" />

module fgui {

    export class GLoader extends GObject {
        private _url: string;
        private _align: AlignType;
        private _verticalAlign: VertAlignType;
        private _autoSize: boolean;
        private _fill: LoaderFillType;
        private _shrinkOnly: boolean;
        private _showErrorSign: boolean;
        private _contentItem: PackageItem;
        private _container: UIContainer;
        private _content: MovieClip;
        private _errorSign?: GObject;
        private _content2?: GComponent;
        private _updatingLayout: boolean;

        private static _errorSignPool: GObjectPool = new GObjectPool();

        public constructor() {
            super();

            this._url = "";
            this._fill = LoaderFillType.None;
            this._align = AlignType.Left;
            this._verticalAlign = VertAlignType.Top;
            this._showErrorSign = true;
        }

        protected createDisplayObject(): void {
            this._container = new UIContainer();
            this._container.opaque = true;
            this.setDisplayObject(this._container);

            this._content = new MovieClip();
            this._container.addChild(this._content);
        }

        public dispose(): void {
            if (!this._contentItem) {
                var texture: egret.Texture = this._content.texture;
                if (texture)
                    this.freeExternal(texture);
            }
            if (this._content2)
                this._content2.dispose();
            super.dispose();
        }

        public get url(): string {
            return this._url;
        }

        public set url(value: string) {
            if (this._url == value)
                return;

            //清除旧的url加载的资源
            this.clearContent();

            this._url = value;
            this.loadContent();
            this.updateGear(7);
        }

        public get icon(): string {
            return this._url;
        }

        public set icon(value: string) {
            this.url = value;
        }

        public get align(): AlignType {
            return this._align;
        }

        public set align(value: AlignType) {
            if (this._align != value) {
                this._align = value;
                this.updateLayout();
            }
        }

        public get verticalAlign(): VertAlignType {
            return this._verticalAlign;
        }

        public set verticalAlign(value: VertAlignType) {
            if (this._verticalAlign != value) {
                this._verticalAlign = value;
                this.updateLayout();
            }
        }

        public get fill(): LoaderFillType {
            return this._fill;
        }

        public set fill(value: LoaderFillType) {
            if (this._fill != value) {
                this._fill = value;
                this.updateLayout();
            }
        }

        public get shrinkOnly(): boolean {
            return this._shrinkOnly;
        }

        public set shrinkOnly(value: boolean) {
            if (this._shrinkOnly != value) {
                this._shrinkOnly = value;
                this.updateLayout();
            }
        }

        public get autoSize(): boolean {
            return this._autoSize;
        }

        public set autoSize(value: boolean) {
            if (this._autoSize != value) {
                this._autoSize = value;
                this.updateLayout();
            }
        }

        public get playing(): boolean {
            return this._content.playing;
        }

        public set playing(value: boolean) {
            if (this._content.playing != value) {
                this._content.playing = value;
                this.updateGear(5);
            }
        }

        public get frame(): number {
            return this._content.frame;
        }

        public set frame(value: number) {
            if (this._content.frame != value) {
                this._content.frame = value;
                this.updateGear(5);
            }
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

        public get showErrorSign(): boolean {
            return this._showErrorSign;
        }

        public set showErrorSign(value: boolean) {
            this._showErrorSign = value;
        }

        public get content(): MovieClip {
            return this._content;
        }

        public get component(): GComponent {
            return this._content2;
        }

        public get texture(): egret.Texture {
            return this._content.texture;
        }

        public set texture(value: egret.Texture) {
            this.url = null;
            this._content.frames = null;

            this._content.texture = value;

            if (value) {
                this.sourceWidth = value.textureWidth;
                this.sourceHeight = value.textureHeight;
            }
            else {
                this.sourceWidth = this.sourceHeight = 0;
            }

            this.updateLayout();
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

        protected loadContent(): void {
            //this.clearContent();

            if (!this._url)
                return;

            if (ToolSet.startsWith(this._url, "ui://"))
                this.loadFromPackage(this._url);
            else
                this.loadExternal();
        }

        protected loadFromPackage(itemURL: string) {
            this._contentItem = UIPackage.getItemByURL(itemURL);
            if (this._contentItem) {
                this._contentItem = this._contentItem.getBranch();
                this.sourceWidth = this._contentItem.width;
                this.sourceHeight = this._contentItem.height;
                this._contentItem = this._contentItem.getHighResolution();
                this._contentItem.load();

                if (this._autoSize)
                    this.setSize(this.sourceWidth, this.sourceHeight);

                if (this._contentItem.type == PackageItemType.Image) {
                    if (this._contentItem.asset == null) {
                        this.setErrorState();
                    }
                    else {
                        this._content.texture = <egret.Texture>this._contentItem.asset;
                        this._content.scale9Grid = this._contentItem.scale9Grid;
                        if (this._contentItem.scaleByTile)
                            this._content.fillMode = egret.BitmapFillMode.REPEAT;
                        else
                            this._content.fillMode = egret.BitmapFillMode.SCALE;
                        this.updateLayout();
                    }
                }
                else if (this._contentItem.type == PackageItemType.MovieClip) {
                    this._content.interval = this._contentItem.interval;
                    this._content.swing = this._contentItem.swing;
                    this._content.repeatDelay = this._contentItem.repeatDelay;
                    this._content.frames = this._contentItem.frames;
                    this.updateLayout();
                }
                else if (this._contentItem.type == PackageItemType.Component) {
                    var obj: GObject = UIPackage.createObjectFromURL(itemURL);
                    if (!obj)
                        this.setErrorState();
                    else if (!(obj instanceof GComponent)) {
                        obj.dispose();
                        this.setErrorState();
                    }
                    else {
                        this._content2 = obj.asCom;
                        this._container.addChild(this._content2.displayObject);
                        this.updateLayout();
                    }
                }
                else
                    this.setErrorState();
            }
            else
                this.setErrorState();
        }

        protected loadExternal(): void {
            RES.getResByUrl(this._url, this.__getResCompleted, this);
        }

        protected freeExternal(texture: egret.Texture): void {
        }

        protected onExternalLoadSuccess(texture: egret.Texture): void {
            this._content.texture = texture;
            this._content.scale9Grid = null;
            this._content.fillMode = egret.BitmapFillMode.SCALE;
            this.sourceWidth = texture.textureWidth;
            this.sourceHeight = texture.textureHeight;
            this.updateLayout();
        }

        protected onExternalLoadFailed(): void {
            this.setErrorState();
        }

        private __getResCompleted(res: any, key: string): void {
            if (res instanceof egret.Texture)
                this.onExternalLoadSuccess(<egret.Texture>res);
            else
                this.onExternalLoadFailed();
        }

        private setErrorState(): void {
            if (!this._showErrorSign)
                return;

            if (this._errorSign == null) {
                if (UIConfig.loaderErrorSign != null) {
                    this._errorSign = GLoader._errorSignPool.getObject(UIConfig.loaderErrorSign);
                }
            }

            if (this._errorSign) {
                this._errorSign.setSize(this.width, this.height);
                this._container.addChild(this._errorSign.displayObject);
            }
        }

        private clearErrorState(): void {
            if (this._errorSign) {
                this._container.removeChild(this._errorSign.displayObject);
                GLoader._errorSignPool.returnObject(this._errorSign);
                this._errorSign = null;
            }
        }

        private updateLayout(): void {
            if (!this._content2 && !this._content) {
                if (this._autoSize) {
                    this._updatingLayout = true;
                    this.setSize(50, 30);
                    this._updatingLayout = false;
                }
                return;
            }

            let cw = this.sourceWidth;
            let ch = this.sourceHeight;

            if (this._autoSize) {
                this._updatingLayout = true;
                if (cw == 0)
                    cw = 50;
                if (ch == 0)
                    ch = 30;
                this.setSize(cw, ch);
                this._updatingLayout = false;

                if (cw == this._width && ch == this._height) {
                    if (this._content2) {
                        this._content2.setXY(0, 0);
                        this._content2.setScale(1, 1);
                    }
                    else {
                        this._content.x = 0;
                        this._content.y = 0;
                        this._content.width = cw;
                        this._content.height = ch;
                    }
                    return;
                }
            }

            var sx: number = 1, sy: number = 1;
            if (this._fill != LoaderFillType.None) {
                sx = this.width / this.sourceWidth;
                sy = this.height / this.sourceHeight;

                if (sx != 1 || sy != 1) {
                    if (this._fill == LoaderFillType.ScaleMatchHeight)
                        sx = sy;
                    else if (this._fill == LoaderFillType.ScaleMatchWidth)
                        sy = sx;
                    else if (this._fill == LoaderFillType.Scale) {
                        if (sx > sy)
                            sx = sy;
                        else
                            sy = sx;
                    }
                    else if (this._fill == LoaderFillType.ScaleNoBorder) {
                        if (sx > sy)
                            sy = sx;
                        else
                            sx = sy;
                    }
                    if (this._shrinkOnly) {
                        if (sx > 1)
                            sx = 1;
                        if (sy > 1)
                            sy = 1;
                    }
                    cw = this.sourceWidth * sx;
                    ch = this.sourceHeight * sy;
                }
            }

            if (this._content2) {
                this._content2.setScale(sx, sy);
            }
            else {
                this._content.width = cw;
                this._content.height = ch;
            }

            var nx: number, ny: number;
            if (this._align == AlignType.Center)
                nx = Math.floor((this.width - cw) / 2);
            else if (this._align == AlignType.Right)
                nx = this.width - cw;
            else
                nx = 0;
            if (this._verticalAlign == VertAlignType.Middle)
                ny = Math.floor((this.height - ch) / 2);
            else if (this._verticalAlign == VertAlignType.Bottom)
                ny = this.height - ch;
            else
                ny = 0;

            if (this._content2)
                this._content2.setXY(nx, ny);
            else {
                this._content.x = nx;
                this._content.y = ny;
            }
        }

        private clearContent(): void {
            this.clearErrorState();

            if (!this._contentItem && this._content.texture) {
                this.freeExternal(this._content.texture);
            }
            this._content.texture = null;
            this._content.frames = null;

            if (this._content2) {
                this._container.removeChild(this._content2.displayObject);
                this._content2.dispose();
                this._content2 = null;
            }
            this._contentItem = null;
        }

        protected handleSizeChanged(): void {
            super.handleSizeChanged();

            if (!this._updatingLayout)
                this.updateLayout();
        }

        public getProp(index: number): any {
            switch (index) {
                case ObjectPropID.Color:
                    return this.color;
                case ObjectPropID.Playing:
                    return this.playing;
                case ObjectPropID.Frame:
                    return this.frame;
                case ObjectPropID.TimeScale:
                    return this._content.timeScale;
                default:
                    return super.getProp(index);
            }
        }

        public setProp(index: number, value: any): void {
            switch (index) {
                case ObjectPropID.Color:
                    this.color = value;
                    break;
                case ObjectPropID.Playing:
                    this.playing = value;
                    break;
                case ObjectPropID.Frame:
                    this.frame = value;
                    break;
                case ObjectPropID.TimeScale:
                    this._content.timeScale = value;
                    break;
                case ObjectPropID.DeltaTime:
                    this._content.advance(value);
                    break;
                default:
                    super.setProp(index, value);
                    break;
            }
        }

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_beforeAdd(buffer, beginPos);

            buffer.seek(beginPos, 5);

            this._url = buffer.readS();
            this._align = buffer.readByte();
            this._verticalAlign = buffer.readByte();
            this._fill = buffer.readByte();
            this._shrinkOnly = buffer.readBool();
            this._autoSize = buffer.readBool();
            this._showErrorSign = buffer.readBool();
            this._content.playing = buffer.readBool();
            this._content.frame = buffer.readInt();

            if (buffer.readBool())
                this.color = buffer.readColor();

            this._content.fillMethod = buffer.readByte();
            if (this._content.fillMethod != 0) {
                this._content.fillOrigin = buffer.readByte();
                this._content.fillClockwise = buffer.readBool();
                this._content.fillAmount = buffer.readFloat();
            }

            if (this._url)
                this.loadContent();
        }
    }
}