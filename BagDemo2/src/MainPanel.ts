class MainPanel {
    private _view: fairygui.GComponent;
    private _list: fairygui.GList;

    public constructor() {
        this._view = fairygui.UIPackage.createObject("Demo","Main").asCom;
        this._view.setSize(fairygui.GRoot.inst.width,fairygui.GRoot.inst.height);
        fairygui.GRoot.inst.addChild(this._view);
        
        this._list = this._view.getChild("list").asList;
        this._list.addEventListener(fairygui.ItemEvent.CLICK,this.__clickItem,this);	

       	for(var i:number = 0;i < 10; i++)
        {
            var button:fairygui.GButton = this._list.getChildAt(i).asButton;
            button.icon = "resource/assets/i" + Math.floor(Math.random() * 10) +".png";
            button.title = "" + Math.floor(Math.random() * 100);
        }
    }
    
    private __clickItem(evt:fairygui.ItemEvent):void {
        var item: fairygui.GButton = <fairygui.GButton>evt.itemObject;
        this._view.getChild("n3").asLoader.url = item.icon;
        this._view.getChild("n5").text = item.icon;
    }
}
