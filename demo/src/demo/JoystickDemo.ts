
class JoystickDemo {
    private _view: fgui.GComponent;
    private _joystick: JoystickModule;
    private _text: fgui.GTextField;

    constructor() {
    }

    public async start() {
        await fgui.UIPackage.loadPackage("Joystick");

        this._view = fgui.UIPackage.createObject("Joystick", "Main").asCom;
        this._view.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
        fgui.GRoot.inst.addChild(this._view);

        this._text = this._view.getChild("n9").asTextField;

        this._joystick = new JoystickModule(this._view);
        this._joystick.addEventListener(JoystickModule.JoystickMoving, this.onJoystickMoving, this);
        this._joystick.addEventListener(JoystickModule.JoystickUp, this.onJoystickUp, this);
    }

    private onJoystickMoving(evt: egret.Event): void {
        this._text.text = "" + evt.data;
    }

    private onJoystickUp(): void {
        this._text.text = "";
    }
}