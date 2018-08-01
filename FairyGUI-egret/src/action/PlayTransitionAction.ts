module fairygui {

    export class PlayTransitionAction extends ControllerAction {

        public transitionName: string;
        public playTimes: number;
        public delay: number;
        public stopOnExit: boolean;

        private _currentTransition: Transition;

        public constructor() {
            super();

            this.playTimes = 1;
            this.delay = 0;
            this.stopOnExit = false;
        }

        protected enter(controller: Controller): void {
            var trans: Transition = controller.parent.getTransition(this.transitionName);
            if (trans) {
                if (this._currentTransition && this._currentTransition.playing)
                    trans.changePlayTimes(this.playTimes);
                else
                    trans.play(null, null, null, this.playTimes, this.delay);
                this._currentTransition = trans;
            }
        }

        protected leave(controller: Controller): void {
            if (this.stopOnExit && this._currentTransition) {
                this._currentTransition.stop();
                this._currentTransition = null;
            }
        }

        public setup(xml: any): void {
            super.setup(xml);

            this.transitionName = xml.attributes.transition;

            var str: string;

            str = xml.attributes.repeat;
            if (str)
                this.playTimes = parseInt(str);

            str = xml.attributes.delay;
            if (str)
                this.delay = parseFloat(str);

            str = xml.attributes.stopOnExit;
            this.stopOnExit = str == "true";
        }
    }
}