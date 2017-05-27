
module fairygui {

    export class ToolSet {
        public constructor() {
        }

        public static getFileName(source: string): string {
            var i: number = source.lastIndexOf("/");
            if (i != -1)
                source = source.substr(i + 1);
            i = source.lastIndexOf("\\");
            if (i != -1)
                source = source.substr(i + 1);
            i = source.lastIndexOf(".");
            if (i != -1)
                return source.substring(0, i);
            else
                return source;
        }

        public static startsWith(source: string, str: string, ignoreCase: boolean = false): boolean {
            if (!source)
                return false;
            else if (source.length < str.length)
                return false;
            else {
                source = source.substring(0, str.length);
                if (!ignoreCase)
                    return source == str;
                else
                    return source.toLowerCase() == str.toLowerCase();
            }
        }

        public static endsWith(source: string, str: string, ignoreCase: boolean = false): boolean {
            if (!source)
                return false;
            else if (source.length < str.length)
                return false;
            else {
                source = source.substring(source.length - str.length);
                if (!ignoreCase)
                    return source == str;
                else
                    return source.toLowerCase() == str.toLowerCase();
            }
        }

        public static trim(targetString: string): string {
            return ToolSet.trimLeft(ToolSet.trimRight(targetString));
        }

        public static trimLeft(targetString: string): string {
            var tempChar: string = "";
            for (var i: number = 0; i < targetString.length; i++) {
                tempChar = targetString.charAt(i);
                if (tempChar != " " && tempChar != "\n" && tempChar != "\r") {
                    break;
                }
            }
            return targetString.substr(i);
        }

        public static trimRight(targetString: string): string {
            var tempChar: string = "";
            for (var i: number = targetString.length - 1; i >= 0; i--) {
                tempChar = targetString.charAt(i);
                if (tempChar != " " && tempChar != "\n" && tempChar != "\r") {
                    break;
                }
            }
            return targetString.substring(0, i + 1);
        }


        public static convertToHtmlColor(argb: number, hasAlpha: boolean = false): string {
            var alpha: string;
            if (hasAlpha)
                alpha = (argb >> 24 & 0xFF).toString(16);
            else
                alpha = "";
            var red: string = (argb >> 16 & 0xFF).toString(16);
            var green: string = (argb >> 8 & 0xFF).toString(16);
            var blue: string = (argb & 0xFF).toString(16);
            if (alpha.length == 1)
                alpha = "0" + alpha;
            if (red.length == 1)
                red = "0" + red;
            if (green.length == 1)
                green = "0" + green;
            if (blue.length == 1)
                blue = "0" + blue;
            return "#" + alpha + red + green + blue;
        }

        public static convertFromHtmlColor(str: string, hasAlpha: boolean = false): number {
            if (str.length < 1)
                return 0;

            if (str.charAt(0) == "#")
                str = str.substr(1);

            if (str.length == 8)
                return (parseInt(str.substr(0, 2), 16) << 24) + parseInt(str.substr(2), 16);
            else if (hasAlpha)
                return 0xFF000000 + parseInt(str, 16);
            else
                return parseInt(str, 16);
        }

        public static displayObjectToGObject(obj: egret.DisplayObject): GObject {
            while (obj != null && !(obj instanceof egret.Stage)) {
                if (obj["$owner"])
                    return <GObject><any>obj["$owner"];

                obj = obj.parent;
            }
            return null;
        }

        public static findChildNode(xml: any, name: string): any {
            var col: any = xml.children;
            if (col) {
                var length1: number = col.length;
                for (var i1: number = 0; i1 < length1; i1++) {
                    var cxml: any = col[i1];
                    if (cxml.name == name) {
                        return cxml;
                    }
                }
            }

            return null;
        }

        public static encodeHTML(str: string): string {
            if (!str)
                return "";
            else
                return str.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("'", "&apos;");
        }

        public static defaultUBBParser: UBBParser = new UBBParser();
        public static parseUBB(text: string): string {
            return ToolSet.defaultUBBParser.parse(text);
        }

        public static clamp(value: number, min: number, max: number): number {
            if (value < min)
                value = min;
            else if (value > max)
                value = max;
            return value;
        }

        public static clamp01(value: number): number {
            if (value > 1)
                value = 1;
            else if (value < 0)
                value = 0;
            return value;
        }
    }
}