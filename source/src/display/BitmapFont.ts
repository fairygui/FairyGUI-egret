
module fgui {

    export class BitmapFont {
        public id: string;
        public size: number = 0;
        public ttf: boolean;
        public glyphs: any;
        public resizable: boolean;
        public tint: boolean;

        public constructor() {
            this.glyphs = {};
        }
    }

    export class BMGlyph {
        public x: number = 0;
        public y: number = 0;
        public offsetX: number = 0;
        public offsetY: number = 0;
        public width: number = 0;
        public height: number = 0;
        public advance: number = 0;
        public lineHeight: number = 0;
        public channel: number = 0;
        public texture: egret.Texture;

        public constructor() {
        }
    }
}