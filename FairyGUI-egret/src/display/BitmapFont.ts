
module fairygui {

    export class BitmapFont {
        public id: string;
        public size: number = 0;
        public ttf: boolean;
        public glyphs: any;
        public resizable: boolean;

        public constructor() {
            this.glyphs = {};
        }
    }
}