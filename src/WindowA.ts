class WindowA extends fairygui.Window {
    public constructor() {
        super();
    }
    
    protected onInit():void {
        this.contentPane = fairygui.UIPackage.createObject("Demo","WindowA").asCom;
        this.center();
    }

    protected onShown(): void {
        var list: fairygui.GList = this.contentPane.getChild("n6").asList;
        list.removeChildrenToPool();

        for(var i: number = 0;i < 6;i++) {
            var item: fairygui.GButton = list.addItemFromPool().asButton;
            item.title = "" + i;
            item.icon = fairygui.UIPackage.getItemURL("Demo","r4");
        }
    }
}
