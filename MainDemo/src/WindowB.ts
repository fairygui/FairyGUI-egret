class WindowB extends fairygui.Window{
    public constructor() {
        super();
    }
    
    protected onInit():void {        
        this.contentPane = fairygui.UIPackage.createObject("Demo", "WindowB").asCom;
        this.center();
        
        //弹出窗口的动效已中心为轴心
        this.setPivot(this.width/2, this.height/2);
    }
    
    protected doShowAnimation():void
    {
        this.setScale(0.1, 0.1);
        egret.Tween.get(this).to({ scaleX: 1,scaleY: 1 },300,egret.Ease.quadOut).call(this.onShown,this);
    }
    
    protected doHideAnimation():void
    {
        egret.Tween.get(this).to({ scaleX: 0.1,scaleY: 0.1 },300,egret.Ease.quadOut).call(this.hideImmediately,this);
    }
    
    protected onShown():void
    {
        this.contentPane.getTransition("t1").play();	
    }
    
    protected onHide():void
    {
        this.contentPane.getTransition("t1").stop();
    }
}
