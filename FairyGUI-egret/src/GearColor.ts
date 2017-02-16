
module fairygui {

    export class GearColor extends GearBase {
        private _storage: any;
        private _default: GearColorValue;

        public constructor(owner: GObject) {
            super(owner);
        }
        
        protected init(): void {
            if(this._owner["strokeColor"]!=undefined)
				this._default = new GearColorValue((<any> this._owner).color, (<any> this._owner).strokeColor);
			else
				this._default = new GearColorValue((<any> this._owner).color);
            this._storage = {};
        }

        protected addStatus(pageId: string, value: string): void {
            if(value=="-")
                return;

            var pos:number = value.indexOf(",");
			var col1:number;
			var col2:number;
			if(pos==-1)
			{
                col1 = ToolSet.convertFromHtmlColor(value);
				col2 = NaN;
			}
			else
			{
				col1 = ToolSet.convertFromHtmlColor(value.substr(0,pos));
				col2 = ToolSet.convertFromHtmlColor(value.substr(pos+1));
			}
			if(pageId==null)
			{
				this._default.color = col1;
				this._default.strokeColor = col2;
			}
			else
				this._storage[pageId] = new GearColorValue(col1, col2);
        }

        public apply(): void {
            this._owner._gearLocked = true;

			var gv:GearColorValue = this._storage[this._controller.selectedPageId];
			if(!gv)
				gv = this._default;
			
            (<any> this._owner).color = gv.color;
            if(this._owner["strokeColor"]!=undefined && !isNaN(gv.strokeColor))
				(<any> this._owner).strokeColor = gv.strokeColor;

            this._owner._gearLocked = false;
        }

        public updateState(): void {
			var gv:GearColorValue = this._storage[this._controller.selectedPageId];
			if(!gv)
			{
				gv = new GearColorValue(null, null);
				this._storage[this._controller.selectedPageId] = gv;
			}
			
			gv.color = (<any> this._owner).color;
			if(this._owner["strokeColor"]!=undefined)
				gv.strokeColor =(<any> this._owner).strokeColor;
        }
    }

    class GearColorValue {
        public color: number;
        public strokeColor: number;

        public constructor(color: number = 0,strokeColor: number = 0) {
            this.color = color;
            this.strokeColor = strokeColor;
        }
    }
}