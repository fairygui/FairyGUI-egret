
module fairygui {

    export class GearDisplay extends GearBase {
        public pages:string[];
                
        public constructor(owner: GObject) {
            super(owner);
        }
        
        protected init():void
		{
			this.pages = null;
		}

        public apply(): void {
            if(!this._controller || this.pages==null || this.pages.length==0 
				|| this.pages.indexOf(this._controller.selectedPageId)!=-1)
                this._owner.internalVisible++;
            else
                this._owner.internalVisible = 0;
        }
    }
}