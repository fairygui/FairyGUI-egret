
module fairygui {

    export class BitmapFont {
        public id: string;
        public lineHeight: number = 0;
        public ttf: boolean;
        public glyphs: any;

        public constructor() {
            this.glyphs = {};
        }
    }
}