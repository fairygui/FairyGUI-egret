/// <reference path="UBBParser.ts" />

module fgui {

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
                    return GObject.cast(obj);

                obj = obj.parent;
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

        public static lerp(start: number, end: number, percent: number): number {
            return (start + percent * (end - start));
        }

        public static repeat(t: number, length: number): number {
            return t - Math.floor(t / length) * length;
        }

        public static distance(x1: number, y1: number, x2: number, y2: number): number {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        }

        public static fillPath(ctx: egret.Graphics, points: number[], px: number, py: number): void {
            var cnt: number = points.length;
            ctx.moveTo(points[0] + px, points[1] + py);
            for (var i: number = 2; i < cnt; i += 2)
                ctx.lineTo(points[i] + px, points[i + 1] + py);
            ctx.lineTo(points[0] + px, points[1] + py);
        }

        private static grayScaleMatrix = [
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0, 0, 0, 1, 0
        ];
        public static setColorFilter(obj: egret.DisplayObject, color?: number | number[] | boolean): void {
            var filter: egret.ColorMatrixFilter = (<any>obj).$_colorFilter_; //cached instance
            var filters: egret.Filter[] = obj.filters;

            var toApplyColor: any;
            var toApplyGray: boolean;
            var tp: string = typeof (color);
            if (tp == "boolean") //gray
            {
                toApplyColor = filter ? (<any>filter).$_color_ : null;
                toApplyGray = <boolean>color;
            }
            else {
                toApplyColor = color == 0xFFFFFF ? null : color;
                toApplyGray = filter ? (<any>filter).$_grayed_ : false;
            }

            if ((!toApplyColor && toApplyColor != 0) && !toApplyGray) {
                if (filters && filter) {
                    var i: number = filters.indexOf(filter);
                    if (i != -1) {
                        filters.splice(i, 1);
                        if (filters.length > 0)
                            obj.filters = filters;
                        else
                            obj.filters = null;
                    }
                }
                return;
            }

            if (!filter) {
                filter = new egret.ColorMatrixFilter();
                (<any>obj).$_colorFilter_ = filter;
            }
            if (!filters)
                filters = [filter];
            else
                filters.push(filter);
            obj.filters = filters;

            (<any>filter).$_color_ = toApplyColor;
            (<any>filter).$_grayed_ = toApplyGray;

            let mat = filter.matrix;

            if (toApplyGray) {
                for (let i = 0; i < 20; i++)
                    mat[i] = ToolSet.grayScaleMatrix[i];
            }
            else if (toApplyColor instanceof Array) {
                ColorMatrix.getMatrix(toApplyColor[0], toApplyColor[1], toApplyColor[2], toApplyColor[3], mat);
            }
            else {
                for (let i = 0; i < 20; i++) {
                    mat[i] = (i == 0 || i == 6 || i == 12 || i == 18) ? 1 : 0;
                }

                mat[0] = ((<number>color >> 16) & 0xFF) / 255;
                mat[6] = ((<number>color >> 8) & 0xFF) / 255;
                mat[12] = (<number>color & 0xFF) / 255;
            }

            filter.matrix = mat;
        }
    }
}