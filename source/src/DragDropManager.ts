module fgui {
    export class DragDropManager {

        private _agent: GLoader;
        private _sourceData: any;

        private static _inst: DragDropManager;
        public static get inst(): DragDropManager {
            if (DragDropManager._inst == null)
                DragDropManager._inst = new DragDropManager();
            return DragDropManager._inst;
        }

        public constructor() {
            this._agent = new GLoader();
            this._agent.draggable = true;
            this._agent.touchable = false;//important
            this._agent.setSize(100, 100);
            this._agent.setPivot(0.5, 0.5, true);
            this._agent.align = AlignType.Center;
            this._agent.verticalAlign = VertAlignType.Middle;
            this._agent.sortingOrder = 1000000;
            this._agent.addEventListener(DragEvent.DRAG_END, this.__dragEnd, this);
        }

        public get dragAgent(): GObject {
            return this._agent;
        }

        public get dragging(): boolean {
            return this._agent.parent != null;
        }

        public startDrag(source: GObject, icon: string, sourceData: any, touchPointID: number = -1): void {
            if (this._agent.parent != null)
                return;

            this._sourceData = sourceData;
            this._agent.url = icon;
            GRoot.inst.addChild(this._agent);
            var pt: egret.Point = GRoot.inst.globalToLocal(GRoot.mouseX, GRoot.mouseY);
            this._agent.setXY(pt.x, pt.y);
            this._agent.startDrag(touchPointID);
        }

        public cancel(): void {
            if (this._agent.parent != null) {
                this._agent.stopDrag();
                GRoot.inst.removeChild(this._agent);
                this._sourceData = null;
            }
        }

        private __dragEnd(evt: DragEvent): void {
            if (this._agent.parent == null) //cancelled
                return;

            GRoot.inst.removeChild(this._agent);

            var sourceData: any = this._sourceData;
            this._sourceData = null;

            var obj: GObject = GRoot.inst.getObjectUnderPoint(evt.stageX, evt.stageY);
            while (obj != null) {
                if (obj.hasEventListener(DropEvent.DROP)) {
                    var dropEvt: DropEvent = new DropEvent(DropEvent.DROP, sourceData);
                    obj.requestFocus();
                    obj.dispatchEvent(dropEvt);
                    return;
                }

                obj = obj.parent;
            }
        }
    }
}
