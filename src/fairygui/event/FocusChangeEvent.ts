
module fairygui {

    export class FocusChangeEvent extends egret.Event {
        public static CHANGED: string = "___focusChanged";

        private _oldFocusedObject: GObject;
        private _newFocusedObject: GObject;

        public constructor(type: string, oldObject: GObject, newObject: GObject) {
            super(type, false);
            this._oldFocusedObject = oldObject;
            this._newFocusedObject = newObject;
        }

        public get oldFocusedObject(): GObject {
            return this._oldFocusedObject;
        }

        public get newFocusedObject(): GObject {
            return this._newFocusedObject;
        }
    }
}