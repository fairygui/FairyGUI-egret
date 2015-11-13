class MainPanel {
    private _view: fairygui.GComponent;
    private _backBtn: fairygui.GObject;
    private _demoContainer: fairygui.GComponent;
    private _cc: fairygui.Controller;

    private _demoObjects: any;

    public constructor() {
        this._view = fairygui.UIPackage.createObject("Demo","Main").asCom;
        this._view.setSize(fairygui.GRoot.inst.width,fairygui.GRoot.inst.height);
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

            case "Window":
                this.playWindow();
                break;

            case "Popup":
                this.playPopup();
                break;

            case "Drag&Drop":
                this.playDragDrop();
                break;

            case "Depth":
                this.playDepth();
                break;

            case "Grid":
                this.playGrid();
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
    private _popupCom: fairygui.GComponent;
    private playPopup(): void {
        if(this._pm == null) {
            this._pm = new fairygui.PopupMenu();
            this._pm.addItem("Item 1");
            this._pm.addItem("Item 2");
            this._pm.addItem("Item 3");
            this._pm.addItem("Item 4");

            if(this._popupCom == null) {
                this._popupCom = fairygui.UIPackage.createObject("Demo","Component12").asCom;
                this._popupCom.center();
            }
        }

        var obj: fairygui.GComponent = this._demoObjects["Popup"];
        var btn: fairygui.GObject = obj.getChild("n0");
        btn.addClickListener(function(): void {
            this._pm.show(btn,true);
        },this);

        var btn2: fairygui.GObject = obj.getChild("n2");
        btn2.addClickListener(function(): void {
            fairygui.GRoot.inst.showPopup(this._popupCom);
        },this);
    }
                    
    //------------------------------
    private playDragDrop(): void {
        var obj: fairygui.GComponent = this._demoObjects["Drag&Drop"];
        var btnA: fairygui.GObject = obj.getChild("a");
        btnA.draggable = true;

        var btnB: fairygui.GButton = obj.getChild("b").asButton;
        btnB.draggable = true;
        btnB.addEventListener(fairygui.DragEvent.DRAG_START,function(evt: fairygui.DragEvent): void {
            //取消对原目标的拖动，换成一个替代品
            evt.preventDefault();

            fairygui.DragDropManager.inst.startDrag(btnB,btnB.icon,btnB.icon);
        },this);

        var btnC: fairygui.GButton = obj.getChild("c").asButton;
        btnC.icon = null;
        btnC.addEventListener(fairygui.DropEvent.DROP,function(evt: fairygui.DropEvent): void {
            btnC.icon = evt.source;
        },this);

        var btnD: fairygui.GObject = obj.getChild("d");
        btnD.draggable = true;
        var bounds: fairygui.GObject = obj.getChild("bounds");
        var pt: egret.Point = bounds.localToGlobal();
        var pt2: egret.Point = obj.localToGlobal();
        pt.x -= pt2.x;
        btnD.dragBounds = new egret.Rectangle(pt.x,pt.y,bounds.width,bounds.height);
    }
    
    //------------------------------
    private playDepth(): void {
        var obj: fairygui.GComponent = this._demoObjects["Depth"];
        var testContainer: fairygui.GComponent = obj.getChild("n22").asCom;
        var fixedObj: fairygui.GObject = testContainer.getChild("n0");
        fixedObj.sortingOrder = 100;
        fixedObj.draggable = true;

        var numChildren: number = testContainer.numChildren;
        var i: number = 0;
        while(i < numChildren) {
            var child: fairygui.GObject = testContainer.getChildAt(i);
            if(child != fixedObj) {
                testContainer.removeChildAt(i);
                numChildren--;
            }
            else
                i++;
        }
        var startPos: egret.Point = new egret.Point(fixedObj.x,fixedObj.y);

        obj.getChild("btn0").addClickListener(function(): void {
            var graph: fairygui.GGraph = new fairygui.GGraph();
            startPos.x += 10;
            startPos.y += 10;
            graph.setXY(startPos.x,startPos.y);
            graph.setSize(150,150);
            graph.drawRect(1,0,1,0xFF0000,1);
            obj.getChild("n22").asCom.addChild(graph);
        },this);

        obj.getChild("btn1").addClickListener(function(): void {
            var graph: fairygui.GGraph = new fairygui.GGraph();
            startPos.x += 10;
            startPos.y += 10;
            graph.setXY(startPos.x,startPos.y);
            graph.setSize(150,150);
            graph.drawRect(1,0,1,0x00FF00,1);
            graph.sortingOrder = 200;
            obj.getChild("n22").asCom.addChild(graph);
        },this);
    }
    
    //------------------------------
    private playGrid(): void {
        var obj: fairygui.GComponent = this._demoObjects["Grid"];
        var list1:fairygui.GList = obj.getChild("list1").asList;
        list1.removeChildrenToPool();
        var testNames: Array<string> = ["苹果手机操作系统","安卓手机操作系统","微软手机操作系统","微软桌面操作系统","苹果桌面操作系统","未知操作系统"];
        var testColors: Array<number> = [ 0xFFFF00,0xFF0000,0xFFFFFF,0x0000FF ];
        var cnt:number = testNames.length;
        for(var i:number = 0;i < cnt; i++)
        {
            var item:fairygui.GButton = list1.addItemFromPool().asButton;
            item.getChild("t0").text = "" + (i + 1);
            item.getChild("t1").text = testNames[i];
            item.getChild("t2").asTextField.color = testColors[Math.floor(Math.random()*4)];
            item.getChild("star").asProgress.value = (Math.floor(Math.random() * 3)+1) / 3 * 100;
        }

        var list2: fairygui.GList = obj.getChild("list2").asList;
        list2.removeChildrenToPool();
        for(var i: number = 0;i < cnt;i++)
        {
            var item: fairygui.GButton = list2.addItemFromPool().asButton;
            item.getChild("cb").asButton.selected = false;
            item.getChild("t1").text = testNames[i];
            item.getChild("mc").asMovieClip.playing = i % 2 == 0;
            item.getChild("t3").text = "" + Math.floor(Math.random() * 10000)
        }
    }
}
