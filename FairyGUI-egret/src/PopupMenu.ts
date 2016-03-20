module fairygui {
	export class PopupMenu {

		protected _contentPane:GComponent;
		protected _list:GList;

		public constructor(resourceURL:string = null)
		{
			if(!resourceURL)
			{
				resourceURL = UIConfig.popupMenu;
				if(!resourceURL)
					throw "UIConfig.popupMenu not defined";
			}
			this._contentPane = UIPackage.createObjectFromURL(resourceURL).asCom;
			this._contentPane.addEventListener(egret.Event.ADDED_TO_STAGE, this.__addedToStage,this);
            this._list = <GList>(this._contentPane.getChild("list"));
			this._list.removeChildrenToPool();
			this._list.addRelation(this._contentPane,RelationType.Width);
			this._list.removeRelation(this._contentPane,RelationType.Height);
			this._contentPane.addRelation(this._list,RelationType.Height);
			this._list.addEventListener(ItemEvent.CLICK,this.__clickItem,this);
		}

		public addItem(caption:string,callback:Function = null):GButton
		{
			var item:GButton = this._list.addItemFromPool().asButton;
			item.title = caption;
			item.data = callback;
			item.grayed = false;
			var c:Controller = item.getController("checked");
			if(c != null)
				c.selectedIndex = 0;
			return item;
		}

		public addItemAt(caption:string,index:number,callback:Function = null):GButton
		{
			var item:GButton = this._list.getFromPool().asButton;
			this._list.addChildAt(item,index);
			item.title = caption;
			item.data = callback;
            item.grayed = false;
			var c:Controller = item.getController("checked");
			if(c != null)
				c.selectedIndex = 0;
			return item;
		}

		public addSeperator()
		{
            if(UIConfig.popupMenu_seperator == null)
                throw "UIConfig.popupMenu_seperator not defined";
			this.list.addItemFromPool(UIConfig.popupMenu_seperator);
		}

		public getItemName(index:number):string
		{
            var item: GObject = this._list.getChildAt(index);
			return item.name;
		}

		public setItemText(name:string,caption:string)
		{
			var item:GButton = this._list.getChild(name).asButton;
			item.title = caption;
		}

		public setItemVisible(name:string,visible:boolean)
		{
			var item:GButton = this._list.getChild(name).asButton;
			if(item.visible != visible)
			{
				item.visible = visible;
				this._list.setBoundsChangedFlag();
			}
		}

		public setItemGrayed(name:string,grayed:boolean)
		{
			var item:GButton = this._list.getChild(name).asButton;
            item.grayed = grayed;
		}

		public setItemCheckable(name:string,checkable:boolean)
		{
			var item:GButton = this._list.getChild(name).asButton;
			var c:Controller = item.getController("checked");
			if(c != null)
			{
				if(checkable)
				{
					if(c.selectedIndex == 0)
						c.selectedIndex = 1;
				}
				else
					c.selectedIndex = 0;
			}
		}

		public setItemChecked(name:string,checked:boolean)
		{
			var item:GButton = this._list.getChild(name).asButton;
			var c:Controller = item.getController("checked");
			if(c != null)
				c.selectedIndex = checked?2:1;
		}

		public isItemChecked(name:string):boolean
		{
			var item:GButton = this._list.getChild(name).asButton;
			var c:Controller = item.getController("checked");
			if(c != null)
				return c.selectedIndex == 2;
			else
				return false;
		}

		public removeItem(name:string):boolean
		{
			var item:GButton = <GButton>this._list.getChild(name);
			if(item != null)
			{
				var index:number = this._list.getChildIndex(item);
				this._list.removeChildToPoolAt(index);
				return true;
			}
			else
				return false;
		}

		public clearItems()
		{
			this._list.removeChildrenToPool();
		}

		public get itemCount():number
		{
			return this._list.numChildren;
		}

		public get contentPane():GComponent
		{
			return this._contentPane;
		}

		public get list():GList
		{
			return this._list;
		}

		public show(target:GObject = null,downward:any = null)
		{
			var r:GRoot = target != null?target.root:GRoot.inst;
            r.showPopup(this.contentPane,(target instanceof GRoot)?null:target,downward);
		}
		
        private __clickItem(evt: ItemEvent): void {
            egret.setTimeout(this.__clickItem2,this,100,evt);
        }
                    
        private __clickItem2(evt: ItemEvent): void {
            var item: GButton = evt.itemObject.asButton;
            if(item == null)
                return;
            if(item.grayed) {
                this._list.selectedIndex = -1;
                return;
            }
            var c: Controller = item.getController("checked");
            if(c != null && c.selectedIndex != 0) {
                if(c.selectedIndex == 1)
                    c.selectedIndex = 2;
                else
                    c.selectedIndex = 1;
            }
            var r: GRoot = <GRoot>(this._contentPane.parent);
            r.hidePopup(this.contentPane);
            if(item.data != null) {
                if(item.data.length == 1)
                    item.data(evt);
                else
                    item.data();
            }
        }

		private __addedToStage(evt:egret.Event)
		{
            this._list.selectedIndex = -1;
			this._list.resizeToFit(100000,10);
		}

	}
}

