class MainPanel {
    private _view: fairygui.GComponent;
    private _joystick: JoystickModule;
    private _text: fairygui.GTextField;

    public constructor() {
        this._view = fairygui.UIPackage.createObject("Demo","Main").asCom;
        this._view.setSize(fairygui.GRoot.inst.width,fairygui.GRoot.inst.height);
        fairygui.GRoot.inst.addChild(this._view);

        this._text = this._view.getChild("n4").asTextField;

        this._joystick = new JoystickModule(this._view);
        this._joystick.addEventListener(JoystickModule.JoystickMoving,this.onJoystickMoving,this);
        this._joystick.addEventListener(JoystickModule.JoystickUp,this.onJoystickUp,this);
    }

    private onJoystickMoving(evt: egret.Event): void {
        this._text.text = "" + evt.data;
    }

    private onJoystickUp(evt: egret.Event): void {
        this._text.text = "";
    }
}