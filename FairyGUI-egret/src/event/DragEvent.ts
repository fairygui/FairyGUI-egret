
module fairygui {

    export class DragEvent extends egret.Event {
        public stageX: number;
        public stageY: number;
        public touchPointID: number = 0;

        private _prevented: boolean;

        public static DRAG_START: string = "__dragStart";
        public static DRAG_END: string = "__dragEnd";
        public static DRAG_MOVING: string = "__dragMoving";

        public constructor(type: string, stageX: number= 0, stageY: number= 0, touchPointID: number= -1) {
            super(type, false);

            this.stageX = stageX;
            this.stageY = stageY;
            this.touchPointID = touchPointID;
        }

        public preventDefault(): void {
            this._prevented = true;
        }

        public isDefaultPrevented(): boolean {
            return this._prevented;
        }
    }
}