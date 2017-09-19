
module fairygui {

    export class UBBParser {
        private _text: string;
        private _readPos: number = 0;

        protected _handlers: any;

        public smallFontSize: number = 12;
        public normalFontSize: number = 14;
        public largeFontSize: number = 16;

        public defaultImgWidth: number = 0;
        public defaultImgHeight: number = 0;

        public static inst: UBBParser = new UBBParser();

        public constructor() {
            this._handlers = {};
            this._handlers["url"] = this.onTag_URL;
            this._handlers["img"] = this.onTag_IMG;
            this._handlers["b"] = this.onTag_Simple;
            this._handlers["i"] = this.onTag_Simple;
            this._handlers["u"] = this.onTag_Simple;
            this._handlers["sup"] = this.onTag_Simple;
            this._handlers["sub"] = this.onTag_Simple;
            this._handlers["color"] = this.onTag_COLOR;
            this._handlers["font"] = this.onTag_FONT;
            this._handlers["size"] = this.onTag_SIZE;
        }

        protected onTag_URL(tagName: string, end: boolean, attr: string): string {
            if (!end) {
                if (attr != null)
                    return "<a href=\"" + attr + "\" target=\"_blank\">";
                else {
                    var href: string = this.getTagText();
                    return "<a href=\"" + href + "\" target=\"_blank\">";
                }
            }
            else
                return "</a>";
        }

        protected onTag_IMG(tagName: string, end: boolean, attr: string): string {
            if (!end) {
                var src: string = this.getTagText(true);
                if (!src)
                    return null;

                if (this.defaultImgWidth)
                    return "<img src=\"" + src + "\" width=\"" + this.defaultImgWidth + "\" height=\"" + this.defaultImgHeight + "\"/>";
                else
                    return "<img src=\"" + src + "\"/>";
            }
            else
                return null;
        }

        protected onTag_Simple(tagName: string, end: boolean, attr: string): string {
            return end ? ("</" + tagName + ">") : ("<" + tagName + ">");
        }

        protected onTag_COLOR(tagName: string, end: boolean, attr: string): string {
            if (!end)
                return "<font color=\"" + attr + "\">";
            else
                return "</font>";
        }

        protected onTag_FONT(tagName: string, end: boolean, attr: string): string {
            if (!end)
                return "<font face=\"" + attr + "\">";
            else
                return "</font>";
        }

        protected onTag_SIZE(tagName: string, end: boolean, attr: string): string {
            if (!end) {
                if (attr == "normal")
                    attr = "" + this.normalFontSize;
                else if (attr == "small")
                    attr = "" + this.smallFontSize;
                else if (attr == "large")
                    attr = "" + this.largeFontSize;
                else if (attr.length && attr.charAt(0) == "+")
                    attr = "" + (this.smallFontSize + parseInt(attr.substr(1)));
                else if (attr.length && attr.charAt(0) == "-")
                    attr = "" + (this.smallFontSize - parseInt(attr.substr(1)));
                return "<font size=\"" + attr + "\">";
            }
            else
                return "</font>";
        }

        protected getTagText(remove: boolean = false): string {
            var pos: number = this._text.indexOf("[", this._readPos);
            if (pos == -1)
                return null;

            var ret: string = this._text.substring(this._readPos, pos);
            if (remove)
                this._readPos = pos;
            return ret;
        }

        public parse(text: string): string {
            this._text = text;
            var pos1: number = 0, pos2: number, pos3: number = 0;
            var end: boolean;
            var tag: string, attr: string;
            var repl: string;
            var func: Function;
            while ((pos2 = this._text.indexOf("[", pos1)) != -1) {
                pos1 = pos2;
                pos2 = this._text.indexOf("]", pos1);
                if (pos2 == -1)
                    break;

                end = this._text.charAt(pos1 + 1) == '/';
                tag = this._text.substring(end ? pos1 + 2 : pos1 + 1, pos2);
                pos2++;
                this._readPos = pos2;
                attr = null;
                repl = null;
                pos3 = tag.indexOf("=");
                if (pos3 != -1) {
                    attr = tag.substring(pos3 + 1);
                    tag = tag.substring(0, pos3);
                }
                tag = tag.toLowerCase();
                func = this._handlers[tag];
                if (func != null) {
                    repl = func.call(this, tag, end, attr);
                    if (repl == null)
                        repl = "";
                }
                else {
                    pos1 = pos2;
                    continue;
                }
                this._text = this._text.substring(0, pos1) + repl + this._text.substring(this._readPos);
            }
            return this._text;
        }
    }
}