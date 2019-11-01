
class ModalWaitingDemo {
    private _view: fgui.GComponent;
    private _testWin: TestWin;

    public async start() {
        await fgui.UIPackage.loadPackage("ModalWaiting");

        fgui.UIConfig.globalModalWaiting = "ui://ModalWaiting/GlobalModalWaiting";
        fgui.UIConfig.windowModalWaiting = "ui://ModalWaiting/WindowModalWaiting";

        fgui.UIObjectFactory.setExtension("ui://ModalWaiting/GlobalModalWaiting", GlobalWaiting);

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

class GlobalWaiting extends fgui.GComponent {
    private _obj: fgui.GObject;

    public constructor() {
        super();
    }

    protected onConstruct(): void {
        this._obj = this.getChild("n1");
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemoveFromStage, this);
    }

    private onAddedToStage(): void {
        fgui.GTimers.inst.callBy24Fps(this.onTimer, this);
    }

    private onRemoveFromStage(): void {
        fgui.GTimers.inst.remove(this.onTimer, this);
    }

    private onTimer(): void {
        var i: number = this._obj.rotation;
        i += 10;
        if (i > 360)
            i = i % 360;
        this._obj.rotation = i;
    }
}