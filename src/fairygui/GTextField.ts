
module fairygui {

    export class GTextField extends GObject implements IColorGear {
        //below are all protected
        protected _textField: egret.TextField;
        protected _font: string;
        protected _fontSize: number = 0;
        protected _align: AlignType;
        protected _verticalAlign: VertAlignType;
        protected _color: number;
        protected _leading: number = 0;
        protected _letterSpacing: number = 0;                
        protected _text: string;
        protected _ubbEnabled: boolean;
        
        private _autoSize: AutoSizeType;
        private _widthAutoSize: boolean;
        private _heightAutoSize: boolean;
        
        private _gearColor: GearColor;

        private _updatingSize: boolean;
        private _sizeDirty: boolean;
        private _yOffset: number = 0;
        private _textWidth: number = 0;
        private _textHeight: number = 0;
        private _requireRender: boolean;

        private _bitmapFont: BitmapFont;
        private _lines: Array<LineInfo>;
        private _bitmapPool: Array<egret.Bitmap>;

        private static GUTTER_X: number = 2;
        private static GUTTER_Y: number = 2;

        public constructor() {
            super();

            this._fontSize = 12;
            this._align = AlignType.Left;
            this._verticalAlign = VertAlignType.Top;
            this._text = "";
            this._leading = 3;
            this._color = 0;
            
            this._autoSize = AutoSizeType.Both;
            this._widthAutoSize = true;
            this._heightAutoSize = true;

            this._gearColor = new GearColor(this);

            this._bitmapPool = new Array<egret.Bitmap>();
        }

        protected createDisplayObject(): void {
            var obj: UITextField = new UITextField(this);
            this._textField = <egret.TextField>obj.getChildAt(0);
            this.setDisplayObject(obj);
        }

        public dispose(): void {
            super.dispose();

            this._bitmapFont = null;
        }

        public set text(value: string) {
            this._text = value;
            if (this._text == null)
                this._text = "";
            this._textField.width = this.width * GRoot.contentScaleFactor;
            if (this._ubbEnabled)
                this._textField.textFlow = (new egret.HtmlTextParser).parser(ToolSet.parseUBB(ToolSet.encodeHTML(this._text)));
            else
                this._textField.text = this._text;
            
            if(this.parent && this.parent._underConstruct)
                this.renderNow();
            else
                this.render();
        }

        public get text(): string {
            return this._text;
        }

        public get font(): string {
            return this._font;
        }

        public set font(value: string) {
            if (this._font != value) {
                this._font = value;
                this.updateTextFormat();
            }
        }

        public get fontSize(): number {
            return this._fontSize;
        }

        public set fontSize(value: number) {
            if (value < 0)
                return;

            if (this._fontSize != value) {
                this._fontSize = value;
                this.updateTextFormat();
            }
        }

        public get color(): number {
            return this._color;
        }

        public set color(value: number) {
            if (this._color != value) {
                this._color = value;
                if (this._gearColor.controller)
                    this._gearColor.updateState();
                this.updateTextFormat();
            }
        }

        public get align(): AlignType {
            return this._align;
        }

        public set align(value: AlignType) {
            if (this._align != value) {
                this._align = value;
                this.updateTextFormat();
            }
        }

        public get verticalAlign(): VertAlignType {
            return this._verticalAlign;
        }

        public set verticalAlign(value: VertAlignType) {
            if (this._verticalAlign != value) {
                this._verticalAlign = value;
                this.doAlign();
            }
        }

        public get leading(): number {
            return this._leading;
        }

        public set leading(value: number) {
            if (this._leading != value) {
                this._leading = value;
                this.updateTextFormat();
            }
        }

        public get letterSpacing(): number {
            return this._letterSpacing;
        }

        public set letterSpacing(value: number) {
            if (this._letterSpacing != value) {
                this._letterSpacing = value;
                this.updateTextFormat();
            }
        }

        public get underline(): boolean {
            //return this._underline;
            return false;
        }

        public set underline(value: boolean) {
            //not support yet
            //this._textField.underline = value;
        }

        public get bold(): boolean {
            return this._textField.bold;
        }

        public set bold(value: boolean) {
            this._textField.bold = value;
        }

        public get italic(): boolean {
            return this._textField.italic;
        }

        public set italic(value: boolean) {
            this._textField.italic = value;
        }

        public get singleLine(): boolean {
            return !this._textField.multiline;
        }

        public set singleLine(value: boolean) {
            value = !value;
            if (this._textField.multiline != value) {
                this._textField.multiline = value;
                this.render();
            }
        }

        public get stroke(): boolean {
            return this._textField.stroke != 0;
        }

        public set stroke(value: boolean) {
            this._textField.stroke = value ? 2 : 0;
        }

        public get strokeColor(): number {
            return this._textField.strokeColor;
        }

        public set strokeColor(value: number) {
            this._textField.strokeColor = value;
        }

        public set ubbEnabled(value: boolean) {
            if (this._ubbEnabled != value) {
                this._ubbEnabled = value;
                this.render();
            }
        }

        public get ubbEnabled(): boolean {
            return this._ubbEnabled;
        }

        public set autoSize(value: AutoSizeType) {
            if (this._autoSize != value) {
                this._autoSize = value;
                this._widthAutoSize = value == AutoSizeType.Both;
                this._heightAutoSize = value == AutoSizeType.Both || value == AutoSizeType.Height;
                this.render();
            }
        }

        public get autoSize(): AutoSizeType {
            return this._autoSize;
        }

        public get displayAsPassword(): boolean {
            return this._textField.displayAsPassword;
        }

        public set displayAsPassword(val: boolean) {
            if (this._textField.displayAsPassword != val) {
                this._textField.displayAsPassword = val;
                this.render();
            }
        }

        public ensureSizeCorrect(): void {
            if (this._sizeDirty && this._requireRender)
                this.renderNow();
        }

        public get gearColor(): GearColor {
            return this._gearColor;
        }

        public handleControllerChanged(c: Controller): void {
            super.handleControllerChanged(c);

            if(this._gearColor.controller == c)
                this._gearColor.apply();
        }

        protected updateTextFormat(): void {
            if(GRoot.contentScaleFactor == 1)
                this._textField.size = this._fontSize;
            else
                this._textField.size = Math.floor(this._fontSize * GRoot.contentScaleFactor) - 1;

            if(ToolSet.startsWith(this._font,"ui://"))
                this._bitmapFont = UIPackage.getBitmapFontByURL(this._font);
            else {
                this._bitmapFont = null;

                if(this._font)
                    this._textField.fontFamily = this._font;
                else
                    this._textField.fontFamily = UIConfig.defaultFont;
            }
            if(this.grayed)
                this._textField.textColor = 0xAAAAAA;
            else
                this._textField.textColor = this._color;
            this._textField.textAlign = getAlignTypeString(this._align);
            this._textField.lineSpacing = Math.floor(this._leading * GRoot.contentScaleFactor);
            //this._textField.letterSpacing = Math.floor(this._letterSpacing*GRoot.contentScaleFactor);

            if(!this._underConstruct)
                this.render();
        }

        protected render(): void {
            this._requireRender = true;

            if(this._widthAutoSize || this._heightAutoSize) {
                this._sizeDirty = true;
                this.dispatchEventWith(GObject.SIZE_DELAY_CHANGE);
            }

            egret.callLater(this.__render,this);
        }
        
        private __render():void{
            if(this._requireRender)
                this.renderNow();
        }

        protected renderNow(updateBounds: boolean = true): void {
            this._requireRender = false;
            this._sizeDirty = false;

            if(this._bitmapFont != null) {
                this.renderWithBitmapFont(updateBounds);
                return;
            }

            if(this._textField.parent == null) {
                (<egret.DisplayObjectContainer>this.displayObject).removeChildren();
                (<egret.DisplayObjectContainer>this.displayObject).addChild(this._textField);
            }

            this._textField.width; //不加这句动态add的文本对不齐，未知原因
            this._textWidth = Math.ceil(this._textField.textWidth);
            if(this._textWidth > 0)
                this._textWidth += 4;
            this._textHeight = Math.ceil(this._textField.textHeight);
            if(this._textHeight > 0)
                this._textHeight += 4;

            var w: number,h: number = 0;
            if(this._widthAutoSize)
                w = this._textWidth / GRoot.contentScaleFactor;
            else
                w = this.width;

            if(this._heightAutoSize) {
                h = this._textHeight / GRoot.contentScaleFactor;
                if(!this._widthAutoSize)
                    this._textField.height = this._textHeight;
            }
            else {
                h = this.height;
                if(this._textHeight > h * GRoot.contentScaleFactor)
                    this._textHeight = Math.ceil(h * GRoot.contentScaleFactor);
                this._textField.height = this._textHeight;
            }

            if(updateBounds) {
                this._updatingSize = true;
                this.setSize(w,h);
                this._updatingSize = false;

                this.doAlign();
            }
        }

        private renderWithBitmapFont(updateBounds: boolean): void {
            var container: egret.DisplayObjectContainer = (<egret.DisplayObjectContainer>this.displayObject);
            var cnt: number = container.numChildren;
            for (var i: number = 0; i < cnt; i++) {
                var obj: egret.DisplayObject = container.getChildAt(i);
                if (obj instanceof egret.Bitmap)
                    this._bitmapPool.push(<egret.Bitmap>obj);
            }
            container.removeChildren();

            if (!this._lines)
                this._lines = new Array<LineInfo>();
            else
                LineInfo.returnList(this._lines);

            var letterSpacing: number = this._letterSpacing * GRoot.contentScaleFactor;
            var lineSpacing: number = this._leading * GRoot.contentScaleFactor - 1;
            var fontSize: number = this._textField.size;
            var rectWidth: number = (this.width - GTextField.GUTTER_X * 2) * GRoot.contentScaleFactor;
            var lineWidth: number = 0, lineHeight: number = 0, lineTextHeight: number = 0;
            var glyphWidth: number = 0, glyphHeight: number = 0;
            var wordChars: number = 0, wordStart: number = 0, wordEnd: number = 0;
            var lastLineHeight: number = 0;
            var lineBuffer: string = "";
            var lineY: number = GTextField.GUTTER_Y;
            var line: LineInfo;
            var textWidth: number = 0, textHeight: number = 0;
            var wordWrap: boolean = !this._widthAutoSize && this._textField.multiline;

            var textLength: number = this._text.length;
            for (var offset: number = 0; offset < textLength; ++offset) {
                var ch: string = this._text.charAt(offset);
                var cc: number = ch.charCodeAt(offset);

                if (ch == "\n") {
                    lineBuffer += ch;
                    line = LineInfo.borrow();
                    line.width = lineWidth;
                    if (lineTextHeight == 0) {
                        if (lastLineHeight == 0)
                            lastLineHeight = fontSize;
                        if (lineHeight == 0)
                            lineHeight = lastLineHeight;
                        lineTextHeight = lineHeight;
                    }
                    line.height = lineHeight;
                    lastLineHeight = lineHeight;
                    line.textHeight = lineTextHeight;
                    line.text = lineBuffer;
                    line.y = lineY;
                    lineY += (line.height + lineSpacing);
                    if (line.width > textWidth)
                        textWidth = line.width;
                    this._lines.push(line);

                    lineBuffer = "";
                    lineWidth = 0;
                    lineHeight = 0;
                    lineTextHeight = 0;
                    wordChars = 0;
                    wordStart = 0;
                    wordEnd = 0;
                    continue;
                }

                if (cc > 256 || cc <= 32) {
                    if (wordChars > 0)
                        wordEnd = lineWidth;
                    wordChars = 0;
                }
                else {
                    if (wordChars == 0)
                        wordStart = lineWidth;
                    wordChars++;
                }

                if (ch == " ") {
                    glyphWidth = fontSize / 2;
                    glyphHeight = fontSize;
                }
                else {
                    var glyph: BMGlyph = this._bitmapFont.glyphs[ch];
                    if (glyph) {
                        glyphWidth = Math.ceil(glyph.advance*GRoot.contentScaleFactor);
                        glyphHeight = Math.ceil(glyph.lineHeight*GRoot.contentScaleFactor);
                    }
                    else if (ch == " ") {
                        glyphWidth = Math.ceil(this._bitmapFont.lineHeight*GRoot.contentScaleFactor/2);
                        glyphHeight = Math.ceil(this._bitmapFont.lineHeight*GRoot.contentScaleFactor);
                    }
                    else {
                        glyphWidth = 0;
                        glyphHeight = 0;
                    }
                }
                if (glyphHeight > lineTextHeight)
                    lineTextHeight = glyphHeight;

                if (glyphHeight > lineHeight)
                    lineHeight = glyphHeight;

                if (lineWidth != 0)
                    lineWidth += letterSpacing;
                lineWidth += glyphWidth;

                if (!wordWrap || lineWidth <= rectWidth) {
                    lineBuffer += ch;
                }
                else {
                    line = LineInfo.borrow();
                    line.height = lineHeight;
                    line.textHeight = lineTextHeight;

                    if (lineBuffer.length == 0) {//the line cannt fit even a char
                        line.text = ch;
                    }
                    else if (wordChars > 0 && wordEnd > 0) {//if word had broken, move it to new line
                        lineBuffer += ch;
                        var len: number = lineBuffer.length - wordChars;
                        line.text = ToolSet.trimRight(lineBuffer.substr(0, len));
                        line.width = wordEnd;
                        lineBuffer = lineBuffer.substr(len + 1);
                        lineWidth -= wordStart;
                    }
                    else {
                        line.text = lineBuffer;
                        line.width = lineWidth - (glyphWidth + letterSpacing);
                        lineBuffer = ch;
                        lineWidth = glyphWidth;
                        lineHeight = glyphHeight;
                        lineTextHeight = glyphHeight;
                    }
                    line.y = lineY;
                    lineY += (line.height + lineSpacing);
                    if (line.width > textWidth)
                        textWidth = line.width;

                    wordChars = 0;
                    wordStart = 0;
                    wordEnd = 0;
                    this._lines.push(line);
                }
            }

            if (lineBuffer.length > 0
                || this._lines.length > 0 && ToolSet.endsWith(this._lines[this._lines.length - 1].text, "\n")) {
                line = LineInfo.borrow();
                line.width = lineWidth;
                if (lineHeight == 0)
                    lineHeight = lastLineHeight;
                if (lineTextHeight == 0)
                    lineTextHeight = lineHeight;
                line.height = lineHeight;
                line.textHeight = lineTextHeight;
                line.text = lineBuffer;
                line.y = lineY;
                if (line.width > textWidth)
                    textWidth = line.width;
                this._lines.push(line);
            }

            if (textWidth > 0)
                textWidth += GTextField.GUTTER_X * 2;

            var count: number = this._lines.length;
            if (count == 0) {
                textHeight = 0;
            }
            else {
                line = this._lines[this._lines.length - 1];
                textHeight = line.y + line.height + GTextField.GUTTER_Y;
            }

            var w: number, h: number = 0;
            if (this._widthAutoSize) {
                if (textWidth == 0)
                    w = 0;
                else
                    w = textWidth;
            }
            else
                w = this.width * GRoot.contentScaleFactor;

            if (this._heightAutoSize) {
                if (textHeight == 0)
                    h = 0;
                else
                    h = textHeight;
            }
            else
                h = this.height * GRoot.contentScaleFactor;;

            if (updateBounds) {
                this._updatingSize = true;
                this.setSize(w / GRoot.contentScaleFactor, h / GRoot.contentScaleFactor);
                this._updatingSize = false;

                this.doAlign();
            }

            if (w == 0 || h == 0)
                return;

            var charX: number = GTextField.GUTTER_X;
            var lineIndent: number = 0;
            var charIndent: number = 0;

            var lineCount: number = this._lines.length;
            for (var i: number = 0; i < lineCount; i++) {
                line = this._lines[i];
                charX = GTextField.GUTTER_X;

                if (this._align == AlignType.Center)
                    lineIndent = (rectWidth - line.width) / 2;
                else if (this._align == AlignType.Right)
                    lineIndent = rectWidth - line.width;
                else
                    lineIndent = 0;
                textLength = line.text.length;
                for (var j: number = 0; j < textLength; j++) {
                    ch = line.text.charAt(j);

                    glyph = this._bitmapFont.glyphs[ch];
                    if (glyph != null) {
                        charIndent = (line.height + line.textHeight) / 2 - glyph.lineHeight;
                        var bm: egret.Bitmap = this._bitmapPool.length ? this._bitmapPool.pop() : new egret.Bitmap();
                        bm.x = charX + lineIndent + glyph.offsetX;
                        bm.y = line.y + charIndent + glyph.offsetY;
                        bm.texture = glyph.texture;
                        container.addChild(bm);

                        charX += letterSpacing + Math.ceil(glyph.advance*GRoot.contentScaleFactor);
                    }
                    else if (ch == " ") {
                        charX += letterSpacing + Math.ceil(this._bitmapFont.lineHeight*GRoot.contentScaleFactor/2);
                    }
                    else {
                        charX += letterSpacing;
                    }
                }//text loop
            }//line loop
        }

        protected handleXYChanged(): void {
            this.displayObject.x = this.x * GRoot.contentScaleFactor;
            this.displayObject.y = this.y * GRoot.contentScaleFactor + this._yOffset;
        }

        protected handleSizeChanged(): void {
            if(!this._updatingSize) {
                if(!this._widthAutoSize) {
                    this._textField.width = this.width * GRoot.contentScaleFactor;
                }
                else
                    this.doAlign();
            }
        }

        protected handleGrayChanged(): void {
            super.handleGrayChanged();
            this.updateTextFormat();
        }

        private doAlign(): void {
            if(this._verticalAlign == VertAlignType.Top || this._textHeight == 0)
                this._yOffset = GTextField.GUTTER_Y;
            else {
                var dh: number = this.height * GRoot.contentScaleFactor - this._textHeight;
                if(dh < 0)
                    dh = 0;
                if(this._verticalAlign == VertAlignType.Middle)
                    this._yOffset = Math.floor(dh / 2);
                else
                    this._yOffset = Math.floor(dh);
            }
            this.displayObject.y = this.y * GRoot.contentScaleFactor + this._yOffset;
        }

        public setup_beforeAdd(xml: any): void {
            super.setup_beforeAdd(xml);

            var str: string;
            this._textField.displayAsPassword = xml.$password == "true";
            str = xml.$font;
            if (str)
                this._font = str;

            str = xml.$fontSize;
            if (str)
                this._fontSize = parseInt(str);

            str = xml.$color;
            if (str)
                this._color = ToolSet.convertFromHtmlColor(str);

            str = xml.$align;
            if (str)
                this._align = parseAlignType(str);

            str = xml.$vAlign;
            if (str)
                this._verticalAlign = parseVertAlignType(str);

            str = xml.$leading;
            if (str)
                this._leading = parseInt(str);
            else
                this._leading = 3;

            str = xml.$letterSpacing;
            if (str)
                this._letterSpacing = parseInt(str);

            this._ubbEnabled = xml.$ubb == "true";

            str = xml.$autoSize;
            if (str) {
                this._autoSize = parseAutoSizeType(str);
                this._widthAutoSize = this._autoSize == AutoSizeType.Both;
                this._heightAutoSize = this._autoSize == AutoSizeType.Both || this._autoSize == AutoSizeType.Height;
            }

            //this._textField.underline = xml.$underline == "true";
            this._textField.italic = xml.$italic == "true";
            this._textField.bold = xml.$bold == "true";
            this._textField.multiline = xml.$singleLine != "true";
            str = xml.$strokeColor;
            if (str) {
                this._textField.strokeColor = ToolSet.convertFromHtmlColor(str);
                this.stroke = true;
            }
        }

        public setup_afterAdd(xml: any): void {
            super.setup_afterAdd(xml);

            this.updateTextFormat();
            
            var str:string = xml.$text;
            if(str != null && str.length > 0)
                this.text = str;            
            this._sizeDirty = false;
            
            var col: any = xml.children;
            if (col) {
                var length1: number = col.length;
                for (var i1: number = 0; i1 < length1; i1++) {
                    var cxml: any = col[i1];
                    if (cxml.name == "gearColor") {
                        this._gearColor.setup(cxml);
                        break;
                    }
                }
            }
        }
    }


    export class LineInfo {
        public width: number = 0;
        public height: number = 0;
        public textHeight: number = 0;
        public text: string;
        public y: number = 0;

        private static pool: Array<LineInfo> = [];

        public static borrow(): LineInfo {
            if (LineInfo.pool.length) {
                var ret: LineInfo = LineInfo.pool.pop();
                ret.width = 0;
                ret.height = 0;
                ret.textHeight = 0;
                ret.text = null;
                ret.y = 0;
                return ret;
            }
            else
                return new LineInfo();
        }

        public static returns(value: LineInfo): void {
            LineInfo.pool.push(value);
        }

        public static returnList(value: Array<LineInfo>): void {
            var length: number = value.length;
            for (var i: number = 0; i < length; i++) {
                var li: LineInfo = value[i];
                LineInfo.pool.push(li);
            }
            value.length = 0;
        }

        public constructor() {
        }
    }
}