
class MailItem extends fairygui.GButton {

    private _timeText: fairygui.GTextField;
    private _readController: fairygui.Controller;
    private _fetchController: fairygui.Controller;
    private _trans: fairygui.Transition;

    public constructor() {
        super();
    }
    
    protected constructFromXML(xml: any): void {
        super.constructFromXML(xml);

        this._timeText = this.getChild("timeText").asTextField;
        this._readController = this.getController("IsRead");
        this._fetchController = this.getController("c1");
        this._trans = this.getTransition("t0");
    }

    public setTime(value: string): void {
        this._timeText.text = value;
    }

    public setRead(value: boolean): void {
        this._readController.selectedIndex = value ? 1 : 0;
    }

    public setFetched(value: boolean): void {
        this._fetchController.selectedIndex = value ? 1 : 0;
    }

    public playEffect(delay: number): void {
        this.visible = false;
        this._trans.play(null,null,null,1,delay);
    }
}
