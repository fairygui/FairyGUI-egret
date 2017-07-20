module fairygui {

    export class ControllerAction {

        public fromPage: string[];
        public toPage: string[];

        public static createAction(type: string): ControllerAction {
            switch (type) {
                case "play_transition":
                    return new PlayTransitionAction();

                case "change_page":
                    return new ChangePageAction();
            }
            return null;
        }

        public constructor() {
        }

        public run(controller: Controller, prevPage: string, curPage: string): void {
            if ( (this.fromPage == null || this.fromPage.length == 0 || this.fromPage.indexOf(prevPage) != -1)
                && (this.toPage == null || this.toPage.length == 0 || this.toPage.indexOf(curPage) != -1))
                this.enter(controller);
            else
                this.leave(controller);
        }

        protected enter(controller: Controller): void {

        }

        protected leave(controller: Controller): void {

        }

        public setup(xml: any): void {
            var str: string;

            str = xml.attributes.fromPage;
            if (str)
                this.fromPage = str.split(",");

            str = xml.attributes.toPage;
            if (str)
                this.toPage = str.split(",");
        }
    }
}