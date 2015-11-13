
class TestWin extends fairygui.Window {
    public constructor() {
        super();
    }

    protected onInit(): void {
        this.contentPane = fairygui.UIPackage.createObject("Demo","TestWin").asCom;
        this.contentPane.getChild("n1").addClickListener(this.onClick,this);
    }

    private onClick(): void {
        //这里模拟一个要锁住当前窗口的过程，在锁定过程中，窗口仍然是可以移动和关闭的
        this.showModalWait();
        fairygui.GTimers.inst.add(3000,1,function(): void { this.closeModalWait(); },this);
    }
}
