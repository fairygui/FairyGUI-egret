
module fairygui {

    export class GTextField extends GObject implements IColorGear {
        protected _textField: egret.TextField;
        protected _bitmapContainer: egret.DisplayObjectContainer;
        protected _font: string;
        protected _fontSize: number = 0;
        protected _align: AlignType;
        protected _verticalAlign: VertAlignType;
        protected _color: number;
        protected _leading: number = 0;
        protected _letterSpacing: number = 0;                
        protected _text: string;
        protected _ubbEnabled: boolean;
        protected _displayAsPassword: boolean;
        
        protected _autoSize: AutoSizeType;
        protected _widthAutoSize: boolean;
        protected _heightAutoSize: boolean;
        
        protected _gearColor: GearColor;

        protected _updatingSize: boolean;
        protected _yOffset: number = 0;
        protected _sizeDirty: boolean;
        protected _textWidth: number = 0;
        protected _textHeight: number = 0;
        protected _requireRender: boolean;

        protected _bitmapFont: BitmapFont;
        protected _lines: Array<LineInfo>;
        protected _bitmapPool: Array<egret.Bitmap>;

        protected static GUTTER_X: number = 2;
        protected static GUTTER_Y: number = 2;

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
            this._textField = new egret.TextField();
            this._textField["$owner"] = this;
            this._textField.touchEnabled = false;
            this.setDisplayObject(this._textField);
        }
        
        private switchBitmapMode(val:boolean):void
		{
            if(val && this.displayObject == this._textField) {
                if(this._bitmapContainer == null) {
                    this._bitmapContainer = new egret.Sprite();
                    this._bitmapContainer["$owner"] = this;
                }
                this.switchDisplayObject(this._bitmapContainer);
            }
            else if(!val && this.displayObject == this._bitmapContainer)
                this.switchDisplayObject(this._textField);
        }

        public dispose(): void {
            super.dispose();

            this._bitmapFont = null;
        }

        public set text(value: string) {
            this._text = value;
            if(this._text == null)
                this._text = "";
            
            if(this.parent && this.parent._underConstruct)
                this.renderNow();
            else
                this.render();
        }
        
        protected updateTextFieldText():void {
            if(this._ubbEnabled)
                this._textField.textFlow = (new egret.HtmlTextParser).parser(ToolSet.parseUBB(ToolSet.encodeHTML(this._text)));
            else
                this._textField.text = this._text;
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

        public get stroke(): number {
            return this._textField.stroke;
        }

        public set stroke(value: number) {
            this._textField.stroke = value;
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
            return this._displayAsPassword;
        }

        public set displayAsPassword(val: boolean) {
            if(this._displayAsPassword != val) {
                this._displayAsPassword = val;
                this._textField.displayAsPassword = this._displayAsPassword;
                this.render();
            }
        }
        
        public get textWidth(): number {
            if(this._requireRender)
                this.renderNow();
            return this._textWidth;
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
            this._textField.size = this._fontSize;
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
            this._textField.lineSpacing = this._leading;
            //this._textField.letterSpacing = this._letterSpacing;

            if(!this._underConstruct)
                this.render();
        }

        protected render(): void {
            if(!this._requireRender) {
                this._requireRender = true;
                egret.callLater(this.__render,this);
            }

            if(!this._sizeDirty && (this._widthAutoSize || this._heightAutoSize)) {
                this._sizeDirty = true;
                this.dispatchEventWith(GObject.SIZE_DELAY_CHANGE);
            }            
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

            this.switchBitmapMode(false);
            
            this._textField.width = this._widthAutoSize ? 10000 : Math.ceil(this.width);
            this.updateTextFieldText();
            this._textWidth = Math.ceil(this._textField.textWidth);
            if(this._textWidth > 0)
                this._textWidth += 4;
            this._textHeight = Math.ceil(this._textField.textHeight);
            if(this._textHeight > 0)
                this._textHeight += 4;

            var w: number,h: number = 0;
            if(this._widthAutoSize)
            {
                w = this._textWidth;
                this._textField.width = w;
            }
            else
                w = this.width;

            if(this._heightAutoSize) {
                h = this._textHeight;
                if(!this._widthAutoSize)
                    this._textField.height = this._textHeight;
            }
            else {
                h = this.height;
                if(this._textHeight > h)
                    this._textHeight = h;
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
            this.switchBitmapMode(true);
            
            var cnt: number = this._bitmapContainer.numChildren;
            for (var i: number = 0; i < cnt; i++) {
                var obj: egret.DisplayObject = this._bitmapContainer.getChildAt(i);
                this._bitmapPool.push(<egret.Bitmap>obj);
            }
            this._bitmapContainer.removeChildren();

            if (!this._lines)
                this._lines = new Array<LineInfo>();
            else
                LineInfo.returnList(this._lines);

            var letterSpacing: number = this._letterSpacing;
            var lineSpacing: number = this._leading - 1;
            var rectWidth: number = this.width - GTextField.GUTTER_X * 2;
            var lineWidth: number = 0, lineHeight: number = 0, lineTextHeight: number = 0;
            var glyphWidth: number = 0, glyphHeight: number = 0;
            var wordChars: number = 0, wordStart: number = 0, wordEnd: number = 0;
            var lastLineHeight: number = 0;
            var lineBuffer: string = "";
            var lineY: number = GTextField.GUTTER_Y;
            var line: LineInfo;
            var textWidth: number = 0, textHeight: number = 0;
            var wordWrap: boolean = !this._widthAutoSize && this._textField.multiline;
            var fontScale: number = this._bitmapFont.resizable?this._fontSize/this._bitmapFont.size:1;

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
                            lastLineHeight = Math.ceil(this._fontSize*fontScale);
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
                    glyphWidth = Math.ceil(this._fontSize / 2);
                    glyphHeight = Math.ceil(this._fontSize);
                }
                else {
                    var glyph: BMGlyph = this._bitmapFont.glyphs[ch];
                    if (glyph) {
                        glyphWidth = Math.ceil(glyph.advance*fontScale); 
                        glyphHeight = Math.ceil(glyph.lineHeight*fontScale);
                    }
                    else if (ch == " ") {
                        glyphWidth = Math.ceil(this._bitmapFont.size*fontScale/2);
                        glyphHeight = Math.ceil(this._bitmapFont.size*fontScale);
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
                w = this.width;

            if (this._heightAutoSize) {
                if (textHeight == 0)
                    h = 0;
                else
                    h = textHeight;
            }
            else
                h = this.height;

            if (updateBounds) {
                this._updatingSize = true;
                this.setSize(w, h);
                this._updatingSize = false;

                this.doAlign();
            }

            if (w == 0 || h == 0)
                return;

            var charX: number = GTextField.GUTTER_X;
            var lineIndent: number = 0;
            var charIndent: number = 0;
            rectWidth = this.width - GTextField.GUTTER_X * 2;
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
                        charIndent = (line.height + line.textHeight) / 2 - Math.ceil(glyph.lineHeight*fontScale);
                        var bm: egret.Bitmap;
                        if(this._bitmapPool.length)
                            bm = this._bitmapPool.pop();
                        else { 
                            bm = new egret.Bitmap();
                            bm.smoothing = true;
                        }                      
                        bm.x = charX + lineIndent + Math.ceil(glyph.offsetX*fontScale);
                        bm.y = line.y + charIndent + Math.ceil(glyph.offsetY*fontScale);
                        bm.texture = glyph.texture;
                        bm.scaleX = fontScale;
                        bm.scaleY = fontScale;
                        this._bitmapContainer.addChild(bm);

                        charX += letterSpacing + Math.ceil(glyph.advance*fontScale);
                    }
                    else if (ch == " ") {
                        charX += letterSpacing + Math.ceil(this._bitmapFont.size*fontScale/2);
                    }
                    else {
                        charX += letterSpacing;
                    }
                }//text loop
            }//line loop
        }

        protected handleXYChanged(): void {
            this.displayObject.x = Math.floor(this.x);
            this.displayObject.y = Math.floor(this.y + this._yOffset);
        }
        
        protected handleSizeChanged(): void {
            if(!this._updatingSize) {
                if(!this._widthAutoSize)
                    this.render();
                else
                    this.doAlign();
            }
        }

        protected handleGrayChanged(): void {
            super.handleGrayChanged();
            this.updateTextFormat();
        }

        protected doAlign(): void {
            if(this._verticalAlign == VertAlignType.Top || this._textHeight == 0)
                this._yOffset = GTextField.GUTTER_Y;
            else {
                var dh: number = this.height - this._textHeight;
                if(dh < 0)
                    dh = 0;
                if(this._verticalAlign == VertAlignType.Middle)
                    this._yOffset = Math.floor(dh / 2);
                else
                    this._yOffset = Math.floor(dh);
            }
            this.displayObject.y = this.y + this._yOffset;
        }

        public setup_beforeAdd(xml: any): void {
            super.setup_beforeAdd(xml);

            var str: string;
            
            this._displayAsPassword = xml.attributes.password == "true";
            this._textField.displayAsPassword = this._displayAsPassword;
            
            str = xml.attributes.font;
            if (str)
                this._font = str;

            str = xml.attributes.fontSize;
            if (str)
                this._fontSize = parseInt(str);

            str = xml.attributes.color;
            if (str)
                this._color = ToolSet.convertFromHtmlColor(str);

            str = xml.attributes.align;
            if (str)
                this._align = parseAlignType(str);

            str = xml.attributes.vAlign;
            if (str)
                this._verticalAlign = parseVertAlignType(str);

            str = xml.attributes.leading;
            if (str)
                this._leading = parseInt(str);
            else
                this._leading = 3;

            str = xml.attributes.letterSpacing;
            if (str)
                this._letterSpacing = parseInt(str);

            this._ubbEnabled = xml.attributes.ubb == "true";

            str = xml.attributes.autoSize;
            if (str) {
                this._autoSize = parseAutoSizeType(str);
                this._widthAutoSize = this._autoSize == AutoSizeType.Both;
                this._heightAutoSize = this._autoSize == AutoSizeType.Both || this._autoSize == AutoSizeType.Height;
            }

            //this._textField.underline = xml.attributes.underline == "true";
            this._textField.italic = xml.attributes.italic == "true";
            this._textField.bold = xml.attributes.bold == "true";
            this._textField.multiline = xml.attributes.singleLine != "true";
            str = xml.attributes.strokeColor;
            if (str) {
                this._textField.strokeColor = ToolSet.convertFromHtmlColor(str);
                str = xml.attributes.strokeSize;
                if(str)
                    this.stroke = parseInt(str) + 1;
                else
                    this.stroke = 2;
            }
        }

        public setup_afterAdd(xml: any): void {
            super.setup_afterAdd(xml);

            this.updateTextFormat();
            
            var str:string = xml.attributes.text;
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