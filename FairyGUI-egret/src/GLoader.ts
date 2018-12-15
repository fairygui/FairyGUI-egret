
module fairygui {

    export class GLoader extends GObject {
        private _url: string;
        private _align: AlignType;
        private _verticalAlign: VertAlignType;
        private _autoSize: boolean;
        private _fill: LoaderFillType;
        private _shrinkOnly: boolean;
        private _showErrorSign: boolean;
        private _playing: boolean;
        private _frame: number = 0;
        private _color: number = 0;

        private _contentItem: PackageItem;
        private _contentSourceWidth: number = 0;
        private _contentSourceHeight: number = 0;
        private _contentWidth: number = 0;
        private _contentHeight: number = 0;

        private _container: UIContainer;
        private _content: egret.Bitmap | fairygui.MovieClip;
        private _errorSign: GObject;
        private _content2: GComponent;

        private _updatingLayout: boolean;

        private static _errorSignPool: GObjectPool = new GObjectPool();

        public constructor() {
            super();
            this._playing = true;
            this._url = "";
            this._fill = LoaderFillType.None;
            this._align = AlignType.Left;
            this._verticalAlign = VertAlignType.Top;
            this._showErrorSign = true;
            this._color = 0xFFFFFF;
        }

        protected createDisplayObject(): void {
            this._container = new UIContainer();
            this._container["$owner"] = this;
            this._container.hitArea = new egret.Rectangle();
            this.setDisplayObject(this._container);
        }

        public dispose(): void {
            if (this._contentItem == null && (this._content instanceof egret.Bitmap)) {
                var texture: egret.Texture = <egret.Texture>(<egret.Bitmap>this._content).texture;
                if (texture != null)
                    this.freeExternal(texture);
            }
            if (this._content2 != null)
                this._content2.dispose();
            super.dispose();
        }

        public get url(): string {
            return this._url;
        }

        public set url(value: string) {
            if (this._url == value)
                return;

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
            return this._playing;
        }

        public set playing(value: boolean) {
            if (this._playing != value) {
                this._playing = value;
                if (this._content instanceof MovieClip)
                    (<MovieClip>this._content).playing = value;
                this.updateGear(5);
            }
        }

        public get frame(): number {
            return this._frame;
        }

        public set frame(value: number) {
            if (this._frame != value) {
                this._frame = value;
                if (this._content instanceof MovieClip)
                    (<MovieClip>this._content).frame = value;
                this.updateGear(5);
            }
        }

        public get timeScale(): number {
            if (this._content instanceof MovieClip)
                return (<MovieClip>this._content).timeScale;
            else
                return 1;
        }

        public set timeScale(value: number) {
            if (this._content instanceof MovieClip)
                (<MovieClip>this._content).timeScale = value;
        }

        public advance(timeInMiniseconds: number): void {
            if (this._content instanceof MovieClip)
                (<MovieClip>this._content).advance(timeInMiniseconds);
        }

        public get color(): number {
            return this._color;
        }

        public set color(value: number) {
            if (this._color != value) {
                this._color = value;
                this.updateGear(4);
                this.applyColor();
            }
        }

        private applyColor(): void {
            //todo:
        }

        public get showErrorSign(): boolean {
            return this._showErrorSign;
        }

        public set showErrorSign(value: boolean) {
            this._showErrorSign = value;
        }

        public get content(): egret.Bitmap | fairygui.MovieClip {
            return this._content;
        }

        public get component(): GComponent {
            return this._content2;
        }

        public get texture(): egret.Texture {
            if (this._content instanceof egret.Bitmap)
                return (<egret.Bitmap>this._content).texture;
            else
                return null;
        }

        public set texture(value: egret.Texture) {
            this.url = null;
            this.switchToMovieMode(false);

            (<egret.Bitmap>this._content).texture = value;
            if (value != null) {
                this._contentSourceWidth = value.textureWidth;
                this._contentSourceHeight = value.textureHeight;
            }
            else {
                this._contentSourceWidth = this._contentHeight = 0;
            }

            this.updateLayout();
        }

        protected loadContent(): void {
            this.clearContent();

            if (!this._url)
                return;

            if (ToolSet.startsWith(this._url, "ui://"))
                this.loadFromPackage(this._url);
            else
                this.loadExternal();
        }

        protected loadFromPackage(itemURL: string) {
            this._contentItem = UIPackage.getItemByURL(itemURL);
            if (this._contentItem != null) {
                this._contentItem.load();

                if (this._autoSize)
                    this.setSize(this._contentItem.width, this._contentItem.height);

                if (this._contentItem.type == PackageItemType.Image) {
                    if (this._contentItem.texture == null) {
                        this.setErrorState();
                    }
                    else {
                        this.switchToMovieMode(false);
                        var bm: egret.Bitmap = <egret.Bitmap>this._content;
                        bm.texture = this._contentItem.texture;
                        bm.scale9Grid = this._contentItem.scale9Grid;
                        if (this._contentItem.scaleByTile)
                            bm.fillMode = egret.BitmapFillMode.REPEAT;
                        else
                            bm.fillMode = egret.BitmapFillMode.SCALE;
                        this._contentSourceWidth = this._contentItem.width;
                        this._contentSourceHeight = this._contentItem.height;
                        this.updateLayout();
                    }
                }
                else if (this._contentItem.type == PackageItemType.MovieClip) {
                    this.switchToMovieMode(true);
                    this._contentSourceWidth = this._contentItem.width;
                    this._contentSourceHeight = this._contentItem.height;
                    var mc: MovieClip = <MovieClip>this._content;
                    mc.interval = this._contentItem.interval;
                    mc.swing = this._contentItem.swing;
                    mc.repeatDelay = this._contentItem.repeatDelay;
                    mc.frames = this._contentItem.frames;
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
                        this._contentSourceWidth = this._contentItem.width;
                        this._contentSourceHeight = this._contentItem.height;
                        this.updateLayout();
                    }
                }
                else
                    this.setErrorState();
            }
            else
                this.setErrorState();
        }

        private switchToMovieMode(value: boolean): void {
            if (value) {
                if (!(this._content instanceof MovieClip))
                    this._content = new MovieClip();
            }
            else {
                if (!(this._content instanceof egret.Bitmap))
                    this._content = new egret.Bitmap();
            }
            this._container.addChild(this._content);
        }

        protected loadExternal(): void {
            RES.getResAsync(this._url, this.__getResCompleted, this);
        }

        protected freeExternal(texture: egret.Texture): void {
        }

        protected onExternalLoadSuccess(texture: egret.Texture): void {
            if (!(this._content instanceof egret.Bitmap)) {
                this._content = new egret.Bitmap();
                this._container.addChild(this._content);
            }
            else
                this._container.addChild(this._content);
            (<egret.Bitmap>this._content).texture = texture;
            (<egret.Bitmap>this._content).scale9Grid = null;
            (<egret.Bitmap>this._content).fillMode = egret.BitmapFillMode.SCALE;
            this._contentSourceWidth = texture.textureWidth;
            this._contentSourceHeight = texture.textureHeight;
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

            if (this._errorSign != null) {
                this._errorSign.setSize(this.width, this.height);
                this._container.addChild(this._errorSign.displayObject);
            }
        }

        private clearErrorState(): void {
            if (this._errorSign != null) {
                this._container.removeChild(this._errorSign.displayObject);
                GLoader._errorSignPool.returnObject(this._errorSign);
                this._errorSign = null;
            }
        }

        private updateLayout(): void {
            if (this._content2 == null && this._content == null) {
                if (this._autoSize) {
                    this._updatingLayout = true;
                    this.setSize(50, 30);
                    this._updatingLayout = false;
                }
                return;
            }

            this._contentWidth = this._contentSourceWidth;
            this._contentHeight = this._contentSourceHeight;

            if (this._autoSize) {
                this._updatingLayout = true;
                if (this._contentWidth == 0)
                    this._contentWidth = 50;
                if (this._contentHeight == 0)
                    this._contentHeight = 30;
                this.setSize(this._contentWidth, this._contentHeight);
                this._updatingLayout = false;

                if (this._contentWidth == this._width && this._contentHeight == this._height) {
                    if (this._content2 != null) {
                        this._content2.setXY(0, 0);
                        this._content2.setScale(1, 1);
                    }
                    else {
                        this._content.x = 0;
                        this._content.y = 0;
                        this._content.scaleX = 1;
                        this._content.scaleY = 1;
                    }
                    return;
                }
            }

            var sx: number = 1, sy: number = 1;
            if (this._fill != LoaderFillType.None) {
                sx = this.width / this._contentSourceWidth;
                sy = this.height / this._contentSourceHeight;

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
                    this._contentWidth = this._contentSourceWidth * sx;
                    this._contentHeight = this._contentSourceHeight * sy;
                }
            }

            if (this._content2 != null) {
                this._content2.setScale(sx, sy);
            }
            else if (this._content instanceof egret.Bitmap) {
                this._content.width = this._contentWidth;
                this._content.height = this._contentHeight;
            }
            else {
                this._content.scaleX = sx;
                this._content.scaleY = sy;
            }

            var nx: number, ny: number;
            if (this._align == AlignType.Center)
                nx = Math.floor((this.width - this._contentWidth) / 2);
            else if (this._align == AlignType.Right)
                nx = this.width - this._contentWidth;
            else
                nx = 0;
            if (this._verticalAlign == VertAlignType.Middle)
                ny = Math.floor((this.height - this._contentHeight) / 2);
            else if (this._verticalAlign == VertAlignType.Bottom)
                ny = this.height - this._contentHeight;
            else
                ny = 0;

            if (this._content2 != null)
                this._content2.setXY(nx, ny);
            else {
                this._content.x = nx;
                this._content.y = ny;
            }
        }

        private clearContent(): void {
            this.clearErrorState();

            if (this._content != null && this._content.parent != null)
                this._container.removeChild(this._content);

            if (this._contentItem == null && (this._content instanceof egret.Bitmap)) {
                var texture: egret.Texture = <egret.Texture>(<egret.Bitmap>this._content).texture;
                if (texture != null)
                    this.freeExternal(texture);
            }
            if (this._content2 != null) {
                this._container.removeChild(this._content2.displayObject);
                this._content2.dispose();
                this._content2 = null;
            }
            this._contentItem = null;
        }

        protected handleSizeChanged(): void {
            if (!this._updatingLayout)
                this.updateLayout();

            this._container.hitArea.setTo(0, 0, this.width, this.height);
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
            this._playing = buffer.readBool();
            this._frame = buffer.readInt();

            if (buffer.readBool())
                this.color = buffer.readColor();
            var fillMethod: number = buffer.readByte();
            if (fillMethod != 0)
                buffer.skip(6);

            if (this._url)
                this.loadContent();
        }
    }
}