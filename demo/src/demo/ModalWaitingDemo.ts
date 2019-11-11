
class ModalWaitingDemo {
    private _view: fgui.GComponent;
    private _testWin: TestWin;

    public async start() {
        await fgui.UIPackage.loadPackage("ModalWaiting");

        fgui.UIConfig.globalModalWaiting = "ui://ModalWaiting/GlobalModalWaiting";
        fgui.UIConfig.windowModalWaiting = "ui://ModalWaiting/WindowModalWaiting";

        this._view = fgui.UIPackage.createObject("ModalWaiting", "Main").asCom;
        this._view.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
        fgui.GRoot.inst.addChild(this._view);

        this._testWin = new TestWin();
        this._view.getChild("n0").addClickListener(function (): void { this._testWin.show(); }, this);

        //这里模拟一个要锁住全屏的等待过程
        fgui.GRoot.inst.showModalWait();
        fgui.GTimers.inst.add(3000, 1, function (): void {
            fgui.GRoot.inst.closeModalWait();
        }, this);
    }
}
