class MainPanel {
    private _view: fairygui.GComponent;
    private _testWin: TestWin;

    public constructor() {
        this._view = fairygui.UIPackage.createObject("Demo","Main").asCom;
        this._view.setSize(fairygui.GRoot.inst.width,fairygui.GRoot.inst.height);
        fairygui.GRoot.inst.addChild(this._view);

        this._testWin = new TestWin();
        this._view.getChild("n0").addClickListener(function(): void { this._testWin.show(); },this);
        
        //这里模拟一个要锁住全屏的等待过程
        fairygui.GRoot.inst.showModalWait();
        fairygui.GTimers.inst.add(3000,1,function(): void {
            fairygui.GRoot.inst.closeModalWait();
        },this);
    }
}

