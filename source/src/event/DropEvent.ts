module fgui {
    export class DropEvent extends egret.Event {

        public source: any;

        public static DROP: string = "__drop";

        public constructor(type: string, source?: any) {
            super(type, false);
            this.source = source;
        }
    }
}
