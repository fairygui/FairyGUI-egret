class MainPanel {
    private _view: fairygui.GComponent;
    private _backBtn: fairygui.GObject;
    private _demoContainer: fairygui.GComponent;
    private _cc: fairygui.Controller;

    private _demoObjects: any;

    public constructor() {
        this._view = fairygui.UIPackage.createObject("Demo","Demo").asCom;
        this._view.setSize(fairygui.GRoot.inst.width, fairygui.GRoot.inst.height);
        this._view.addRelation(fairygui.GRoot.inst, fairygui.RelationType.Size);
        fairygui.GRoot.inst.addChild(this._view);

        this._backBtn = this._view.getChild("btn_Back");
        this._backBtn.visible = false;
        this._backBtn.addClickListener(this.onClickBack,this);

        this._demoContainer = this._view.getChild("container").asCom;
        this._cc = this._view.getController("c1");

        var cnt: number = this._view.numChildren;
        for(var i: number = 0;i < cnt;i++) {
            var obj: fairygui.GObject = this._view.getChildAt(i);
            if(obj.group != null && obj.group.name == "btns")
                obj.addClickListener(this.runDemo,this);
        }

        this._demoObjects = {};
    }

    private runDemo(evt: Event): void {
        var type: string = (<fairygui.GObject><any>(evt.currentTarget)).name.substr(4);
        var obj: fairygui.GComponent = this._demoObjects[type];
        if(obj == null) {
            obj = fairygui.UIPackage.createObject("Demo","Demo_" + type).asCom;
            this._demoObjects[type] = obj;
        }

        this._demoContainer.removeChildren();
        this._demoContainer.addChild(obj);
        this._cc.selectedIndex = 1;
        this._backBtn.visible = true;

        switch(type) {
            case "Button":
                this.playButton();
                break;
                
            case "Text":
                this.playText();
                break;

            case "Transition":
                this.playTransition();
                break;

            case "Window":
                this.playWindow();
                break;

            case "PopupMenu":
                this.playPopupMenu();
                break;

            case "Drag&Drop":
                this.playDragDrop();
                break;
        }
    }

    private onClickBack(evt: Event): void {
        this._cc.selectedIndex = 0;
        this._backBtn.visible = false;
    }
    
    //------------------------------
    private playButton(): void {
        var obj: fairygui.GComponent = this._demoObjects["Button"];
        obj.getChild("n34").addClickListener(function(): void { console.log("click button"); },this);
    }
        
    //------------------------------
    private playText(): void {
        var obj: fairygui.GComponent = this._demoObjects["Text"];
        obj.getChild("n12").asRichTextField.addEventListener(egret.TextEvent.LINK,function(evt: egret.TextEvent): void {
            var obj: fairygui.GRichTextField = <fairygui.GRichTextField><any>evt.currentTarget;
            obj.text = "[img]ui://9leh0eyft9fj5f[/img][color=#FF0000]你点击了链接[/color]：" + evt.text;
        },this);
    }
            
    //------------------------------
    private playTransition(): void {
        var obj: fairygui.GComponent = this._demoObjects["Transition"];
        obj.getChild("n2").asCom.getTransition("t0").play(null,null,null,10000000);
        obj.getChild("n3").asCom.getTransition("peng").play(null,null,null,10000000);

        obj.addEventListener(egret.Event.REMOVED_FROM_STAGE,function(): void {
            obj.getChild("n2").asCom.getTransition("t0").stop();
            obj.getChild("n3").asCom.getTransition("peng").stop();
        },this);
    }
            
    //------------------------------
    private _winA: Window;
    private _winB: Window;
    private playWindow(): void {
        var obj: fairygui.GComponent = this._demoObjects["Window"];
        obj.getChild("n0").addClickListener(function(): void {
            if(this._winA == null)
                this._winA = new WindowA();
            this._winA.show();
        },this);

        obj.getChild("n1").addClickListener(function(): void {
            if(this._winB == null)
                this._winB = new WindowB();
            this._winB.show();
        },this);
    }
                    
    //------------------------------
    private _pm: fairygui.PopupMenu;
    private playPopupMenu(): void {
        if(this._pm == null) {
            this._pm = new fairygui.PopupMenu();
            this._pm.addItem("Item 1");
            this._pm.addItem("Item 2");
            this._pm.addItem("Item 3");
            this._pm.addItem("Item 4");
        }

        var obj: fairygui.GComponent = this._demoObjects["PopupMenu"];
        var btn: fairygui.GObject = obj.getChild("n0");
        btn.addClickListener(function(): void {
            this._pm.show(btn,true);
        },this);

    }
                    
    //------------------------------
    private playDragDrop(): void {
        var obj: fairygui.GComponent = this._demoObjects["Drag&Drop"];
        obj.getChild("n0").draggable = true;

        var btn1: fairygui.GButton = obj.getChild("n1").asButton;
        btn1.draggable = true;
        btn1.addEventListener(fairygui.DragEvent.DRAG_START,function(evt: fairygui.DragEvent): void {
            //取消对原目标的拖动，换成一个替代品
            evt.preventDefault();

                fairygui.DragDropManager.inst.startDrag(btn1,btn1.icon,btn1.icon);
        },this);

        var btn2: fairygui.GButton = obj.getChild("n2").asButton;
        btn2.icon = null;
        btn2.addEventListener(fairygui.DropEvent.DROP,function(evt: fairygui.DropEvent): void {
            btn2.icon = evt.source;
        },this);
    }

}
