
class GlobalWaiting extends fairygui.GComponent {
    private _obj: fairygui.GObject;
    
	public constructor() {
        super();
    }
    
    protected constructFromXML(xml:any):void
    {
        super.constructFromXML(xml);
        
        this._obj = this.getChild("n1");
        this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddedToStage,this);
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE,this.onRemoveFromStage,this);        
    }
    
    private onAddedToStage():void {
        fairygui.GTimers.inst.callBy24Fps(this.onTimer,this);
    }
    
    private onRemoveFromStage():void {
        fairygui.GTimers.inst.remove(this.onTimer,this);
    }
    
    private onTimer():void {
        var i:number = this._obj.rotation;
        i += 10;
        if(i > 360)
            i = i % 360;
        this._obj.rotation = i;
    }
}
