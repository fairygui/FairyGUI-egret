
module fairygui {

    export class GearDisplay extends GearBase {
        public constructor(owner: GObject) {
            super(owner);
        }

        protected get connected(): boolean {
            if (this._controller && !this._pageSet.empty)
                return this._pageSet.containsId(this._controller.selectedPageId);
            else
                return true;
        }

        public apply(): void {
            if(this.connected)
                this._owner.internalVisible++;
            else
                this._owner.internalVisible = 0;
        }
    }
}