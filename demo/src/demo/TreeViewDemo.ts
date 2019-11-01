class TreeViewDemo {
    private _view: fgui.GComponent;

    public async start() {
        await fgui.UIPackage.loadPackage("TreeView");

        this._view = fgui.UIPackage.createObject("TreeView", "Main").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);
    }
}
