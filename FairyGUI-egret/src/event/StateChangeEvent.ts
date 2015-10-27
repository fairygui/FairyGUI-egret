
module fairygui {

    export class StateChangeEvent extends egret.Event {
        public static CHANGED: string = "___stateChanged";

        public constructor(type: string) {
            super(type, false);
        }
    }
}