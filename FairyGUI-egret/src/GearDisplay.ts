
module fairygui {

    export class GearDisplay extends GearBase {
        public pages:Array<string>;
                
        public constructor(owner: GObject) {
            super(owner);
        }
        
        protected init():void
		{
			if(this.pages==null)
				this.pages = new Array<string>();
			else
				this.pages.length = 0;
		}

        public apply(): void {
            if(this._controller && this.pages!=null && this.pages.length>0 
				&& this.pages.indexOf(this._controller.selectedPageId)!=-1)
                this._owner.internalVisible++;
            else
                this._owner.internalVisible = 0;
        }
    }
}