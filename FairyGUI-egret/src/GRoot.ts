
module fairygui {

    export class GRoot extends GComponent {
        private _nativeStage: egret.Stage;
        private _modalLayer: GGraph;
        private _popupStack: Array<GObject>;
        private _justClosedPopups: Array<GObject>;
        private _modalWaitPane: GObject;
        private _focusedObject: GObject;
        private _tooltipWin: GObject;
        private _defaultTooltipWin: GObject;
        private _focusManagement: boolean;
        private _volumeScale: number;

        private static _inst: GRoot;

        public static touchScreen: boolean;
        public static contentScaleFactor: number = 1;
        public static touchDown: boolean;
        public static ctrlKeyDown: boolean;
        public static shiftKeyDown: boolean;
        public static mouseX: number;
        public static mouseY: number;

        public static get inst(): GRoot {
            if(GRoot._inst == null)
                new GRoot();
            return GRoot._inst;
        }

        public constructor() {
            super();
            if(GRoot._inst == null)
                GRoot._inst = this;

            this.opaque = false;
            this._volumeScale = 1;
            this._popupStack = new Array<GObject>();
            this._justClosedPopups = new Array<GObject>();
            this.displayObject.addEventListener(egret.Event.ADDED_TO_STAGE,this.__addedToStage,this);
        }

        public get nativeStage(): egret.Stage {
            return this._nativeStage;
        }

        public setContentScaleFactor(designUIWidth: number,designUIHeight: number): void {
            var w: number,h: number = 0;

            w = this._nativeStage.stageWidth;
            h = this._nativeStage.stageHeight;

            if(designUIWidth > 0 && designUIHeight > 0) {
                var s1: number = w / designUIWidth;
                var s2: number = h / designUIHeight;
                GRoot.contentScaleFactor = Math.min(s1,s2);
            }
            else if(designUIWidth > 0)
                GRoot.contentScaleFactor = w / designUIWidth;
            else if(designUIHeight > 0)
                GRoot.contentScaleFactor = h / designUIHeight;
            else
                GRoot.contentScaleFactor = 1;

            this.setSize(Math.round(w / GRoot.contentScaleFactor),Math.round(h / GRoot.contentScaleFactor));
            this.scaleX = GRoot.contentScaleFactor;
            this.scaleY = GRoot.contentScaleFactor;
        }

        public enableFocusManagement(): void {
            this._focusManagement = true;
        }

        public showWindow(win: Window): void {
            this.addChild(win);
            win.requestFocus();

            if(win.x > this.width)
                win.x = this.width - win.width;
            else if(win.x + win.width < 0)
                win.x = 0;

            if(win.y > this.height)
                win.y = this.height - win.height;
            else if(win.y + win.height < 0)
                win.y = 0;

            this.adjustModalLayer();
        }

        public hideWindow(win: Window): void {
            win.hide();
        }

        public hideWindowImmediately(win: Window): void {
            if(win.parent == this)
                this.removeChild(win);

            this.adjustModalLayer();
        }

        public showModalWait(msg: string = null): void {
            if(UIConfig.globalModalWaiting != null) {
                if(this._modalWaitPane == null)
                    this._modalWaitPane = UIPackage.createObjectFromURL(UIConfig.globalModalWaiting);
                this._modalWaitPane.setSize(this.width,this.height);
                this._modalWaitPane.addRelation(this,RelationType.Size);

                this.addChild(this._modalWaitPane);
                this._modalWaitPane.text = msg;
            }
        }

        public closeModalWait(): void {
            if(this._modalWaitPane != null && this._modalWaitPane.parent != null)
                this.removeChild(this._modalWaitPane);
        }

        public closeAllExceptModals(): void {
            var arr: Array<GObject> = this._children.slice();
            var cnt: number = arr.length;
            for(var i: number = 0;i < cnt;i++) {
                var g: GObject = arr[i];
                if((g instanceof Window) && !(<Window><any> g).modal)
                    (<Window><any> g).hide();
            }
        }

        public closeAllWindows(): void {
            var arr: Array<GObject> = this._children.slice();
            var cnt: number = arr.length;
            for(var i: number = 0;i < cnt;i++) {
                var g: GObject = arr[i];
                if(g instanceof Window)
                    (<Window><any> g).hide();
            }
        }

        public getTopWindow(): Window {
            var cnt: number = this.numChildren;
            for(var i: number = cnt - 1;i >= 0;i--) {
                var g: GObject = this.getChildAt(i);
                if(g instanceof Window) {
                    return <Window><any> g;
                }
            }

            return null;
        }

        public get hasModalWindow(): boolean {
            return this._modalLayer.parent != null;
        }

        public get modalWaiting(): boolean {
            return this._modalWaitPane && this._modalWaitPane.inContainer;
        }

        public showPopup(popup: GObject,target: GObject = null,downward: any = null): void {
            if(this._popupStack.length > 0) {
                var k: number = this._popupStack.indexOf(popup);
                if(k != -1) {
                    for(var i: number = this._popupStack.length - 1;i >= k;i--)
                        this.removeChild(this._popupStack.pop());
                }
            }
            this._popupStack.push(popup);

            this.addChild(popup);
            this.adjustModalLayer();

            var pos: egret.Point;
            var sizeW: number,sizeH: number = 0;
            if(target) {
                pos = target.localToRoot();
                sizeW = target.width;
                sizeH = target.height;
            }
            else {
                pos = this.globalToLocal(GRoot.mouseX, GRoot.mouseY);
            }
            var xx: number,yy: number;
            xx = pos.x;
            if(xx + popup.width > this.width)
                xx = xx + sizeW - popup.width;
            yy = pos.y + sizeH;
            if((downward == null && yy + popup.height > this.height)
                || downward == false) {
                yy = pos.y - popup.height - 1;
                if(yy < 0) {
                    yy = 0;
                    xx += sizeW / 2;
                }
            }

            popup.x = xx;
            popup.y = yy;
        }

        public togglePopup(popup: GObject,target: GObject = null,downward: any = null): void {
            if(this._justClosedPopups.indexOf(popup) != -1)
                return;

            this.showPopup(popup,target,downward);
        }

        public hidePopup(popup: GObject = null): void {
            if(popup != null) {
                var k: number = this._popupStack.indexOf(popup);
                if(k != -1) {
                    for(var i: number = this._popupStack.length - 1;i >= k;i--)
                        this.closePopup(this._popupStack.pop());
                }
            }
            else {
                var cnt: number = this._popupStack.length;
                for(i = cnt - 1;i >= 0;i--)
                    this.closePopup(this._popupStack[i]);
                this._popupStack.length = 0;
            }
        }

        public get hasAnyPopup(): boolean {
            return this._popupStack.length != 0;
        }

        private closePopup(target: GObject): void {
            if(target.parent != null) {
                if(target instanceof Window)
                    (<Window><any>target).hide();
                else
                    this.removeChild(target);
            }
        }

        public showTooltips(msg: string): void {
            if (this._defaultTooltipWin == null) {
                var resourceURL: string = UIConfig.tooltipsWin;
                if (!resourceURL) {
                    console.error("UIConfig.tooltipsWin not defined");
                    return;
                }

                this._defaultTooltipWin = UIPackage.createObjectFromURL(resourceURL);
            }

            this._defaultTooltipWin.text = msg;
            this.showTooltipsWin(this._defaultTooltipWin);
        }

        public showTooltipsWin(tooltipWin: GObject, position: egret.Point= null): void {
            this.hideTooltips();

            this._tooltipWin = tooltipWin;

            var xx: number = 0;
            var yy: number = 0;
            if (position == null) {
                xx = GRoot.mouseX + 10;
                yy = GRoot.mouseY + 20;
            }
            else {
                xx = position.x;
                yy = position.y;
            }
            var pt: egret.Point = this.globalToLocal(xx,yy);
            xx = pt.x;
            yy = pt.y;
            
            if (xx + this._tooltipWin.width > this.width) {
                xx = xx - this._tooltipWin.width - 1;
                if (xx < 0)
                    xx = 10;
            }
            if (yy + this._tooltipWin.height > this.height) {
                yy = yy - this._tooltipWin.height - 1;
                if (xx - this._tooltipWin.width - 1 > 0)
                    xx = xx - this._tooltipWin.width - 1;
                if (yy < 0)
                    yy = 10;
            }

            this._tooltipWin.x = xx;
            this._tooltipWin.y = yy;
            this.addChild(this._tooltipWin);
        }

        public hideTooltips(): void {
            if (this._tooltipWin != null) {
                if (this._tooltipWin.parent)
                    this.removeChild(this._tooltipWin);
                this._tooltipWin = null;
            }
        }
        
        public getObjectUnderPoint(globalX:number, globalY:number):GObject
        {
            var ret:egret.DisplayObject = this._nativeStage.$hitTest(globalX,globalY);
            if(ret)
                return ToolSet.displayObjectToGObject(ret);
            else
                return null;
        }

        public get focus(): GObject {
            if (this._focusedObject && !this._focusedObject.onStage)
                this._focusedObject = null;

            return this._focusedObject;
        }

        public set focus(value: GObject) {
            if (!this._focusManagement)
                return;

            if (value && (!value.focusable || !value.onStage))
                throw "invalid focus target";

            if (this._focusedObject != value) {
                var old: GObject;
                if (this._focusedObject != null && this._focusedObject.onStage)
                    old = this._focusedObject;
                this._focusedObject = value;
                this.dispatchEvent(new FocusChangeEvent(FocusChangeEvent.CHANGED, old, value));
            }
        }
        
        public get volumeScale():number
        {
            return this._volumeScale;
        }
        
        public set volumeScale(value:number)
        {
            this._volumeScale = value;
        }
        
        public playOneShotSound(sound: egret.Sound,volumeScale: number = 1) {
            var vs: number = this._volumeScale * volumeScale;
            var channel:egret.SoundChannel = sound.play(0,1);
            channel.volume = vs;
        }

        private adjustModalLayer(): void {
            var cnt: number = this.numChildren;
            var modalLayerIsTop: boolean = false;

            if (this._modalWaitPane != null && this._modalWaitPane.parent != null)
                this.setChildIndex(this._modalWaitPane, cnt - 1);

            for(var i: number = cnt - 1;i >= 0;i--) {
                var g: GObject = this.getChildAt(i);
                if(g == this._modalLayer)
                    modalLayerIsTop = true;
                else if((g instanceof Window) && (<Window><any> g).modal) {
                    if(this._modalLayer.parent == null)
                        this.addChildAt(this._modalLayer,i);
                    else if(i > 0) {
                        if(modalLayerIsTop)
                            this.setChildIndex(this._modalLayer,i);
                        else
                            this.setChildIndex(this._modalLayer,i - 1);
                    }
                    else
                        this.addChildAt(this._modalLayer,0);
                    return;
                }
            }

            if (this._modalLayer.parent != null)
                this.removeChild(this._modalLayer);
        }

        private __addedToStage(evt: egret.Event): void {
            this.displayObject.removeEventListener(egret.Event.ADDED_TO_STAGE, this.__addedToStage, this);

            this._nativeStage = this.displayObject.stage;

            GRoot.touchScreen = egret.MainContext.deviceType == egret.MainContext.DEVICE_MOBILE;

            this._nativeStage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__stageMouseDownCapture, this, true);
            this._nativeStage.addEventListener(egret.TouchEvent.TOUCH_END, this.__stageMouseUpCapture, this, true);
            this._nativeStage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__stageMouseMoveCapture, this, true);

            this._modalLayer = new GGraph();
            this._modalLayer.setSize(this.width, this.height);
            this._modalLayer.drawRect(0, 0, 0, UIConfig.modalLayerColor, UIConfig.modalLayerAlpha);
            this._modalLayer.addRelation(this, RelationType.Size);

            this.displayObject.stage.addEventListener(egret.Event.RESIZE, this.__winResize, this);

            this.__winResize(null);
        }

        private __stageMouseDownCapture(evt: egret.TouchEvent): void {
            //GRoot.ctrlKeyDown = evt.ctrlKey;
            //GRoot.shiftKeyDown = evt.shiftKey;
            GRoot.mouseX = evt.stageX;
            GRoot.mouseY = evt.stageY;
            GRoot.touchDown = true;

            if (this._focusManagement) {
                var mc: egret.DisplayObject = <egret.DisplayObject><any> (evt.target);
                while (mc != this.displayObject.stage && mc != null) {
                    if (ToolSet.isUIObject(mc)) {
                        var gg: GObject = (<UIDisplayObject><any> mc).owner;
                        if (gg.touchable && gg.focusable) {
                            this.focus = gg;
                            break;
                        }
                    }
                    mc = mc.parent;
                }
            }

            if (this._tooltipWin != null)
                this.hideTooltips();

            this._justClosedPopups.length = 0;
            if (this._popupStack.length > 0) {
                mc = <egret.DisplayObject><any> (evt.target);
                while (mc != this.displayObject.stage && mc != null) {
                    if (ToolSet.isUIObject(mc)) {
                        var pindex: number = this._popupStack.indexOf((<UIDisplayObject><any> mc).owner);
                        if (pindex != -1) {
                            for(var i: number = this._popupStack.length - 1;i > pindex;i--) {
                                var popup: GObject = this._popupStack.pop();
                                this.closePopup(popup);
                                this._justClosedPopups.push(popup);
                            }
                            return;
                        }
                    }
                    mc = mc.parent;
                }

                var cnt: number = this._popupStack.length;
                for(i = cnt - 1;i >= 0;i--) {
                    popup = this._popupStack[i];
                    this.closePopup(popup);
                    this._justClosedPopups.push(popup);
                }
                this._popupStack.length = 0;
            }
        }

        private __stageMouseMoveCapture(evt: egret.TouchEvent): void {
            //GRoot.ctrlKeyDown = evt.ctrlKey;
            //GRoot.shiftKeyDown = evt.shiftKey;
            GRoot.mouseX = evt.stageX;
            GRoot.mouseY = evt.stageY;
        }

        private __stageMouseUpCapture(evt: egret.TouchEvent): void {
            GRoot.touchDown = false;
        }

        private __winResize(evt: egret.Event): void {
            var w: number, h: number = 0;
            w = this._nativeStage.stageWidth;
            h = this._nativeStage.stageHeight;
            
            this.setSize(Math.round(w / GRoot.contentScaleFactor), Math.round( h / GRoot.contentScaleFactor));

            //console.info("screen size=" + w + "x" + h + "/" + this.width + "x" + this.height);
        }

    }
}