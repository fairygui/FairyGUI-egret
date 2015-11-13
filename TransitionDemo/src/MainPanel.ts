class MainPanel {
    private _view: fairygui.GComponent;

    private _btnGroup: fairygui.GGroup;
    private _g1: fairygui.GComponent;
    private _g2: fairygui.GComponent;
    private _g3: fairygui.GComponent;
    private _g4: fairygui.GComponent;
    private _g5: fairygui.GComponent;

    private _tweeObject: any;
    private _startValue: number;
    private _endValue: number;

    public constructor() {
        this._view = fairygui.UIPackage.createObject("Demo","Main").asCom;
        this._view.setSize(fairygui.GRoot.inst.width,fairygui.GRoot.inst.height);
        fairygui.GRoot.inst.addChild(this._view);

        this._tweeObject = { value: 0 };
        this._btnGroup = this._view.getChild("g0").asGroup;

        this._g1 = fairygui.UIPackage.createObject("Demo","BOSS").asCom;
        this._g2 = fairygui.UIPackage.createObject("Demo","BOSS_SKILL").asCom;
        this._g3 = fairygui.UIPackage.createObject("Demo","TRAP").asCom;
        this._g4 = fairygui.UIPackage.createObject("Demo","GoodHit").asCom;
        this._g5 = fairygui.UIPackage.createObject("Demo","PowerUp").asCom;
        //play_num_now是在编辑器里设定的名称，这里表示播放到'play_num_now'这个位置时才开始播放数字变化效果
        this._g5.getTransition("t0").setHook("play_num_now",this.__playNum,this);

        this._view.getChild("btn0").addClickListener(function(): void { this.__play(this._g1); },this);
        this._view.getChild("btn1").addClickListener(function(): void { this.__play(this._g2); },this);
        this._view.getChild("btn2").addClickListener(function(): void { this.__play(this._g3); },this);
        this._view.getChild("btn3").addClickListener(this.__play4,this);
        this._view.getChild("btn4").addClickListener(this.__play5,this);
    }

    private __play(target: fairygui.GComponent): void {
        this._btnGroup.visible = false;
        fairygui.GRoot.inst.addChild(target);
        var t: fairygui.Transition = target.getTransition("t0");
        t.play(function(): void {
            this._btnGroup.visible = true;
            fairygui.GRoot.inst.removeChild(target);
        },this);
    }

    private __play4(evt: egret.Event): void {
        this._btnGroup.visible = false;
        this._g4.x = fairygui.GRoot.inst.width - this._g4.width - 20;
        this._g4.y = 100;
        fairygui.GRoot.inst.addChild(this._g4);
        var t: fairygui.Transition = this._g4.getTransition("t0");
        //播放3次
        t.play(function(): void {
            this._btnGroup.visible = true;
            fairygui.GRoot.inst.removeChild(this._g4);
        },this,null,3);
    }

    private __play5(evt: egret.Event): void {
        this._btnGroup.visible = false;
        this._g5.x = 20;
        this._g5.y = fairygui.GRoot.inst.height - this._g5.height - 100;
        fairygui.GRoot.inst.addChild(this._g5);
        var t: fairygui.Transition = this._g5.getTransition("t0");
        this._startValue = 10000;
        var add: number = Math.ceil(Math.random() * 2000 + 1000);
        this._endValue = this._startValue + add;
        this._g5.getChild("value").text = "" + this._startValue;
        this._g5.getChild("add_value").text = "" + add;
        t.play(function(): void {
            this._btnGroup.visible = true;
            fairygui.GRoot.inst.removeChild(this._g5);
        },this);
    }

    private __playNum(): void {
        //这里演示了一个数字变化的过程
        this._tweeObject.value = this._startValue;
        var vars: any = {
            onChange: function(): void {
                this._g5.getChild("value").text = "" + Math.floor(this._tweeObject.value);
            },
            onChangeObj: this
        };
        egret.Tween.get(this._tweeObject, vars).to({ value: this._endValue },300);
    }
}

