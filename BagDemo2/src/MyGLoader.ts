class MyGLoader extends fairygui.GLoader {
	public constructor() {
        super();
	}
	
	protected loadExternal() {
        RES.getResByUrl(this.url,this.__myGetResCompleted,this);
	}
	
    private __myGetResCompleted(res: any,key: string): void {
        if(res instanceof egret.Texture)
            this.onExternalLoadSuccess(<egret.Texture>res);
        else
            this.onExternalLoadFailed();
    }
}
