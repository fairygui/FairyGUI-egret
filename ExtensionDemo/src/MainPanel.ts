class MainPanel {
    private _view: fairygui.GComponent;
    private _list: fairygui.GList;

    public constructor() {
        this._view = fairygui.UIPackage.createObject("Demo","Main").asCom;
        this._view.setSize(fairygui.GRoot.inst.width,fairygui.GRoot.inst.height);
        fairygui.GRoot.inst.addChild(this._view);

        this._list = this._view.getChild("mailList").asList;
        for(var i: number = 0;i < 10;i++) {
            var item: MailItem = <MailItem>this._list.addItemFromPool();
            item.setFetched(i % 3 == 0);
            item.setRead(i % 2 == 0);
            item.setTime("5 Nov 2015 16:24:33");
            item.title = "Mail title here";
        }

        this._list.ensureBoundsCorrect();
        var delay: number = 0;
        for(var i: number = 0;i < 10;i++) {
            var item: MailItem = <MailItem>this._list.getChildAt(i);
            if(this._list.isChildInView(item)) {
                item.playEffect(delay);
                delay += 200;
            }
            else
                break;
        }
    }
}
