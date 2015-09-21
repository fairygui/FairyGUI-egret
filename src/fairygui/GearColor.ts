
module fairygui {

    export class GearColor extends GearBase {
        private _storage: any;
        private _default: number = 0;

        public constructor(owner: GObject) {
            super(owner);
        }
        
        protected init(): void {
            this._default = (<IColorGear><any> this._owner).color;
            this._storage = {};
        }

        protected addStatus(pageId: string, value: string): void {
            var col: number = ToolSet.convertFromHtmlColor(value);
            if (pageId == null)
                this._default = col;
            else
                this._storage[pageId] = col;
        }

        public apply(): void {
            this._owner._gearLocked = true;

            if (this.connected) {
                var data: any = this._storage[this._controller.selectedPageId];
                if (data != undefined)
                    (<IColorGear><any> (this._owner)).color = Math.floor(data);
                else
                    (<IColorGear><any> (this._owner)).color = Math.floor(this._default);
            }
            else
                (<IColorGear><any> (this._owner)).color = this._default;

            this._owner._gearLocked = false;
        }

        public updateState(): void {
            if (this._owner._gearLocked)
                return;

            if (this.connected)
                this._storage[this._controller.selectedPageId] = (<IColorGear><any> (this._owner)).color;
            else
                this._default = (<IColorGear><any> (this._owner)).color;
        }
    }
}