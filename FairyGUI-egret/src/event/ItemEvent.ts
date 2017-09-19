
module fairygui {

    export class ItemEvent extends egret.Event {
        public itemObject: GObject;
        public stageX: number;
        public stageY: number;

        public static CLICK: string = "___itemClick";

        public constructor(type: string, itemObject: GObject = null,
            stageX: number = 0, stageY: number = 0) {
            super(type, false);
            this.itemObject = itemObject;
            this.stageX = stageX;
            this.stageY = stageY;
        }
    }
}