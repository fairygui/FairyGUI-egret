
module fairygui {

    export class GTextField extends GObject {
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
        protected _templateVars: any;

        protected _autoSize: AutoSizeType;
        protected _widthAutoSize: boolean;
        protected _heightAutoSize: boolean;

        protected _updatingSize: boolean;
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
            this._templateVars = null;

            this._autoSize = AutoSizeType.Both;
            this._widthAutoSize = true;
            this._heightAutoSize = true;

            this._bitmapPool = new Array<egret.Bitmap>();
        }

        protected createDisplayObject(): void {
            this._textField = new egret.TextField();
            this._textField["$owner"] = this;
            this._textField.touchEnabled = false;
            this.setDisplayObject(this._textField);
        }

        private switchBitmapMode(val: boolean): void {
            if (val && this.displayObject == this._textField) {
                if (this._bitmapContainer == null) {
                    this._bitmapContainer = new egret.Sprite();
                    this._bitmapContainer["$owner"] = this;
                }
                this.switchDisplayObject(this._bitmapContainer);
            }
            else if (!val && this.displayObject == this._bitmapContainer)
                this.switchDisplayObject(this._textField);
        }

        public dispose(): void {
            super.dispose();

            this._bitmapFont = null;
            this._requireRender = false;
        }

        public set text(value: string) {
            this._text = value;
            if (this._text == null)
                this._text = "";
            this.updateGear(6);

            if (this.parent && this.parent._underConstruct)
                this.renderNow();
            else
                this.render();
        }

        protected updateTextFieldText(): void {
            var text2: string = this._text;
            if (this._templateVars != null)
                text2 = this.parseTemplate(text2);
            if (this._ubbEnabled)
                this._textField.textFlow = (new egret.HtmlTextParser).parser(ToolSet.parseUBB(ToolSet.encodeHTML(text2)));
            else
                this._textField.text = text2;
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
                this.updateGear(4);
                this.updateTextFormat();
            }
        }

        public get align(): AlignType {
            return this._align;
        }

        public set align(value: AlignType) {
            if (this._align != value) {
                this._align = value;
                this._textField.textAlign = this.getAlignTypeString(this._align);
                if (this._bitmapFont && !this._underConstruct)
                    this.render();
            }
        }

        public get verticalAlign(): VertAlignType {
            return this._verticalAlign;
        }

        public set verticalAlign(value: VertAlignType) {
            if (this._verticalAlign != value) {
                this._verticalAlign = value;
                this._textField.verticalAlign = this.getVertAlignTypeString(this._verticalAlign);
                if (this._bitmapFont && !this._underConstruct)
                    this.render();
            }
        }

        private getAlignTypeString(type: AlignType): string {
            return type == AlignType.Left ? egret.HorizontalAlign.LEFT :
                (type == AlignType.Center ? egret.HorizontalAlign.CENTER : egret.HorizontalAlign.RIGHT);
        }

        private getVertAlignTypeString(type: VertAlignType): string {
            return type == VertAlignType.Top ? egret.VerticalAlign.TOP :
                (type == VertAlignType.Middle ? egret.VerticalAlign.MIDDLE : egret.VerticalAlign.BOTTOM);
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
            this.updateGear(4);
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

        public get textWidth(): number {
            if (this._requireRender)
                this.renderNow();
            return this._textWidth;
        }

        public ensureSizeCorrect(): void {
            if (this._sizeDirty && this._requireRender)
                this.renderNow();
        }

        protected updateTextFormat(): void {
            this._textField.size = this._fontSize;
            this._bitmapFont = null;
            if (ToolSet.startsWith(this._font, "ui://")) {
                var pi: PackageItem = UIPackage.getItemByURL(this._font);
                if (pi)
                    this._bitmapFont = <BitmapFont>pi.owner.getItemAsset(pi);
            }


            if (this._bitmapFont == null) {
                if (this._font)
                    this._textField.fontFamily = this._font;
                else
                    this._textField.fontFamily = UIConfig.defaultFont;
            }
            if (this.grayed)
                this._textField.textColor = 0xAAAAAA;
            else
                this._textField.textColor = this._color;
            this._textField.lineSpacing = this._leading;
            //this._textField.letterSpacing = this._letterSpacing;

            if (!this._underConstruct)
                this.render();
        }

        protected render(): void {
            if (!this._requireRender) {
                this._requireRender = true;
                egret.callLater(this.__render, this);
            }

            if (!this._sizeDirty && (this._widthAutoSize || this._heightAutoSize)) {
                this._sizeDirty = true;
                this.dispatchEventWith(GObject.SIZE_DELAY_CHANGE);
            }
        }

        private __render(): void {
            if (this._requireRender)
                this.renderNow();
        }

        protected renderNow(updateBounds: boolean = true): void {
            this._requireRender = false;
            this._sizeDirty = false;

            if (this._bitmapFont != null) {
                this.renderWithBitmapFont(updateBounds);
                return;
            }

            this.switchBitmapMode(false);
            this._textField.width = this._widthAutoSize ? (this.maxWidth <= 0 ? 10000 : this.maxWidth) : Math.ceil(this.width);
            this.updateTextFieldText();
            this._textWidth = Math.ceil(this._textField.textWidth);
            if (this._textWidth > 0)
                this._textWidth += 4;
            this._textHeight = Math.ceil(this._textField.textHeight);
            if (this._textHeight > 0)
                this._textHeight += 4;

            var w: number, h: number = 0;
            if (this._widthAutoSize) {
                w = this._textWidth;
                this._textField.width = w;
            }
            else
                w = this.width;

            if (this._heightAutoSize) {
                h = this._textHeight;
                if (this._textField.height != this._textHeight)
                    this._textField.height = this._textHeight;
            }
            else {
                h = this.height;
                if (this._textHeight > h)
                    this._textHeight = h;
            }

            if (updateBounds) {
                this._updatingSize = true;
                this.setSize(w, h);
                this._updatingSize = false;
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
            var wordWrap: boolean = !this._widthAutoSize && this._textField.multiline;
            var fontScale: number = this._bitmapFont.resizable ? this._fontSize / this._bitmapFont.size : 1;
            this._textWidth = 0;
            this._textHeight = 0;

            var text2: string = this._text;
            if (this._templateVars != null)
                text2 = this.parseTemplate(text2);
            var textLength: number = text2.length;
            for (var offset: number = 0; offset < textLength; ++offset) {
                var ch: string = text2.charAt(offset);
                var cc: number = ch.charCodeAt(0);

                if (cc == 10) {
                    lineBuffer += ch;
                    line = LineInfo.borrow();
                    line.width = lineWidth;
                    if (lineTextHeight == 0) {
                        if (lastLineHeight == 0)
                            lastLineHeight = this._fontSize;
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
                    if (line.width > this._textWidth)
                        this._textWidth = line.width;
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

                if (cc >= 65 && cc <= 90 || cc >= 97 && cc <= 122) { //a-z,A-Z
                    if (wordChars == 0)
                        wordStart = lineWidth;
                    wordChars++;
                }
                else {
                    if (wordChars > 0)
                        wordEnd = lineWidth;
                    wordChars = 0;
                }

                if (cc == 32) {
                    glyphWidth = Math.ceil(this._fontSize / 2);
                    glyphHeight = this._fontSize;
                }
                else {
                    var glyph: BMGlyph = this._bitmapFont.glyphs[ch];
                    if (glyph) {
                        glyphWidth = Math.ceil(glyph.advance * fontScale);
                        glyphHeight = Math.ceil(glyph.lineHeight * fontScale);
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
                        lineBuffer = lineBuffer.substr(len);
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
                    if (line.width > this._textWidth)
                        this._textWidth = line.width;

                    wordChars = 0;
                    wordStart = 0;
                    wordEnd = 0;
                    this._lines.push(line);
                }
            }

            if (lineBuffer.length > 0) {
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
                if (line.width > this._textWidth)
                    this._textWidth = line.width;
                this._lines.push(line);
            }

            if (this._textWidth > 0)
                this._textWidth += GTextField.GUTTER_X * 2;

            var count: number = this._lines.length;
            if (count == 0) {
                this._textHeight = 0;
            }
            else {
                line = this._lines[this._lines.length - 1];
                this._textHeight = line.y + line.height + GTextField.GUTTER_Y;
            }

            var w: number, h: number = 0;
            if (this._widthAutoSize) {
                if (this._textWidth == 0)
                    w = 0;
                else
                    w = this._textWidth;
            }
            else
                w = this.width;

            if (this._heightAutoSize) {
                if (this._textHeight == 0)
                    h = 0;
                else
                    h = this._textHeight;
            }
            else
                h = this.height;

            if (updateBounds) {
                this._updatingSize = true;
                this.setSize(w, h);
                this._updatingSize = false;
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
                    cc = ch.charCodeAt(0);

                    if (cc == 10)
                        continue;

                    if (cc == 32) {
                        charX += letterSpacing + Math.ceil(this._fontSize / 2);
                        continue;
                    }

                    glyph = this._bitmapFont.glyphs[ch];
                    if (glyph != null) {
                        charIndent = (line.height + line.textHeight) / 2 - Math.ceil(glyph.lineHeight * fontScale);
                        var bm: egret.Bitmap;
                        if (this._bitmapPool.length)
                            bm = this._bitmapPool.pop();
                        else {
                            bm = new egret.Bitmap();
                            bm.smoothing = true;
                        }
                        bm.x = charX + lineIndent + Math.ceil(glyph.offsetX * fontScale);
                        bm.y = line.y + charIndent + Math.ceil(glyph.offsetY * fontScale);
                        bm["$backupY"] = bm.y;
                        bm.texture = glyph.texture;
                        bm.scaleX = fontScale;
                        bm.scaleY = fontScale;
                        this._bitmapContainer.addChild(bm);

                        charX += letterSpacing + Math.ceil(glyph.advance * fontScale);
                    }
                    else {
                        charX += letterSpacing;
                    }
                }//text loop
            }//line loop

            this.doAlign();
        }

        protected handleSizeChanged(): void {
            if (this._updatingSize)
                return;

            if (this._bitmapFont != null) {
                if (!this._widthAutoSize)
                    this.render();
                else
                    this.doAlign();
            }
            else {
                if (this._underConstruct) {
                    this._textField.width = this.width;
                    this._textField.height = this.height;
                }
                else {
                    if (!this._widthAutoSize) {
                        if (!this._heightAutoSize) {
                            this._textField.width = this.width;
                            this._textField.height = this.height;
                        }
                        else
                            this._textField.width = this.width;
                    }
                }
            }
        }

        protected parseTemplate(template: string): string {
            var pos1: number = 0, pos2: number, pos3: number;
            var tag: string;
            var value: string;
            var result: string = "";
            while ((pos2 = template.indexOf("{", pos1)) != -1) {
                if (pos2 > 0 && template.charCodeAt(pos2 - 1) == 92)//\
                {
                    result += template.substring(pos1, pos2 - 1);
                    result += "{";
                    pos1 = pos2 + 1;
                    continue;
                }

                result += template.substring(pos1, pos2);
                pos1 = pos2;
                pos2 = template.indexOf("}", pos1);
                if (pos2 == -1)
                    break;

                if (pos2 == pos1 + 1) {
                    result += template.substr(pos1, 2);
                    pos1 = pos2 + 1;
                    continue;
                }

                tag = template.substring(pos1 + 1, pos2);
                pos3 = tag.indexOf("=");
                if (pos3 != -1) {
                    value = this._templateVars[tag.substring(0, pos3)];
                    if (value == null)
                        result += tag.substring(pos3 + 1);
                    else
                        result += value;
                }
                else {
                    value = this._templateVars[tag];
                    if (value != null)
                        result += value;
                }
                pos1 = pos2 + 1;
            }

            if (pos1 < template.length)
                result += template.substr(pos1);

            return result;
        }

        public get templateVars(): any {
            return this._templateVars;
        }

        public set templateVars(value: any) {
            if (this._templateVars == null && value == null)
                return;

            this._templateVars = value;
            this.flushVars();
        }

        public setVar(name: string, value: string): GTextField {
            if (!this._templateVars)
                this._templateVars = {};
            this._templateVars[name] = value;

            return this;
        }

        public flushVars(): void {
            this.render();
        }

        protected handleGrayedChanged(): void {
            super.handleGrayedChanged();
            this.updateTextFormat();
        }

        private doAlign(): void {
            var yOffset: number;
            if (this._verticalAlign == VertAlignType.Top || this._textHeight == 0)
                yOffset = GTextField.GUTTER_Y;
            else {
                var dh: number = this.height - this._textHeight;
                if (dh < 0)
                    dh = 0;
                if (this._verticalAlign == VertAlignType.Middle)
                    yOffset = Math.floor(dh / 2);
                else
                    yOffset = Math.floor(dh);
            }

            var cnt: number = this._bitmapContainer.numChildren;
            for (var i: number = 0; i < cnt; i++) {
                var obj: egret.DisplayObject = this._bitmapContainer.getChildAt(i);
                obj.y = obj["$backupY"] + yOffset;
            }
        }

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_beforeAdd(buffer, beginPos);

            buffer.seek(beginPos, 5);

            this._font = buffer.readS();
            this._fontSize = buffer.readShort();
            this._color = buffer.readColor();
            this.align = buffer.readByte();
            this.verticalAlign = buffer.readByte();
            this._leading = buffer.readShort();
            this._letterSpacing = buffer.readShort();
            this._ubbEnabled = buffer.readBool();
            this._autoSize = buffer.readByte();
            this._widthAutoSize = this._autoSize == AutoSizeType.Both;
            this._heightAutoSize = this._autoSize == AutoSizeType.Both || this._autoSize == AutoSizeType.Height;
            buffer.readBool(); //this._textField.underline
            this._textField.italic = buffer.readBool();
            this._textField.bold = buffer.readBool();
            this._textField.multiline = !buffer.readBool();
            if (buffer.readBool()) {
                this._textField.strokeColor = buffer.readColor();
                this.stroke = buffer.readFloat() + 1;
            }

            if (buffer.readBool()) //shadow
                buffer.skip(12);

            if (buffer.readBool())
                this._templateVars = {};
        }

        public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_afterAdd(buffer, beginPos);

            this.updateTextFormat();

            buffer.seek(beginPos, 6);

            var str: string = buffer.readS();
            if (str != null)
                this.text = str;
            this._sizeDirty = false;
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