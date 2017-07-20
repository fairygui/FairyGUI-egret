module fairygui {

    export class ChangePageAction extends ControllerAction {

        public objectId: string;
        public controllerName: string;
        public targetPage: string;

        public constructor() {
            super();
        }

        protected enter(controller: Controller): void {
            if (!this.controllerName)
                return;

            var gcom: GComponent;
            if (this.objectId) {
                var obj: GObject = controller.parent.getChildById(this.objectId);
                if (obj instanceof GComponent)
                    gcom = <GComponent><any>obj;
                else
                    return;
            }
            else
                gcom = controller.parent;
            if (gcom) {
                var cc: Controller = gcom.getController(this.controllerName);
                if (cc && cc != controller && !cc.changing)
                    cc.selectedPageId = this.targetPage;
            }
        }

        public setup(xml: any): void {
            super.setup(xml);

            this.objectId = xml.attributes.objectId;
            this.controllerName = xml.attributes.controller;
            this.targetPage = xml.attributes.targetPage;
        }
    }
}