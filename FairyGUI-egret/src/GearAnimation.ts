
module fairygui {

    export class GearAnimation extends GearBase {
        private _storage: any;
        private _default: GearAnimationValue;

        public constructor(owner: GObject) {
            super(owner);
        }

        protected init(): void {
            this._default = new GearAnimationValue((<any>this._owner).playing,
                (<any>this._owner).frame);
            this._storage = {};
        }

        protected addStatus(pageId: string, value: string): void {
            if (value == "-")
                return;

            var gv: GearAnimationValue;
            if (pageId == null)
                gv = this._default;
            else {
                gv = new GearAnimationValue();
                this._storage[pageId] = gv;
            }
            var arr: string[] = value.split(",");
            gv.frame = parseInt(arr[0]);
            gv.playing = arr[1] == "p";
        }

        public apply(): void {
            this._owner._gearLocked = true;

            var gv: GearAnimationValue = this._storage[this._controller.selectedPageId];
            if (!gv)
                gv = this._default;

            (<any>this._owner).frame = gv.frame;
            (<any>this._owner).playing = gv.playing;

            this._owner._gearLocked = false;
        }

        public updateState(): void {
            var gv: GearAnimationValue = this._storage[this._controller.selectedPageId];
            if (!gv) {
                gv = new GearAnimationValue();
                this._storage[this._controller.selectedPageId] = gv;
            }

            gv.frame = (<any>this._owner).frame;
            gv.playing = (<any>this._owner).playing;
        }
    }

    class GearAnimationValue {
        public playing: boolean;
        public frame: number;

        public constructor(playing: boolean = true, frame: number = 0) {
            this.playing = playing;
            this.frame = frame;
        }
    }
}