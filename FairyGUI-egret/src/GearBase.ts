
module fairygui {

    export class GearBase {
        protected _pageSet: PageOptionSet;
        protected _tween: boolean;
        protected _easeType: Function;
        protected _tweenTime: number;
        protected _tweenDelay: number;

        protected _owner: GObject;
        protected _controller: Controller;

        public constructor(owner: GObject) {
            this._owner = owner;
            this._pageSet = new PageOptionSet();
            this._easeType = egret.Ease.quadOut;
            this._tweenTime = 0.3;
            this._tweenDelay = 0;
        }

        public get controller(): Controller {
            return this._controller;
        }

        public set controller(val: Controller) {
            if (val != this._controller) {
                this._controller = val;
                this._pageSet.controller = val;
                this._pageSet.clear();
                if(this._controller)
                    this.init();
            }
        }

        public getPageSet(): PageOptionSet {
            return this._pageSet;
        }

        public get tween(): boolean {
            return this._tween;
        }

        public set tween(val: boolean) {
            this._tween = val;
        }
        
        public get tweenDelay(): number {
            return this._tweenDelay;
        }

        public set tweenDelay(val: number) {
            this._tweenDelay = val;
        }

        public get tweenTime(): number {
            return this._tweenTime;
        }

        public set tweenTime(value: number) {
            this._tweenTime = value;
        }

        public get easeType(): Function {
            return this._easeType;
        }

        public set easeType(value: Function) {
            this._easeType = value;
        }

        public setup(xml: any): void {
            this._controller = this._owner.parent.getController(xml.attributes.controller);
            if(this._controller == null)
                return;
            
            this.init();
            
            var str: string;
            str = xml.attributes.pages;
            var pages: string[];
            if (str)
                pages = str.split(",");
            else
                pages = [];
            var length1: number = pages.length;
            for (var i1: number = 0; i1 < length1; i1++) {
                str = pages[i1];
                this._pageSet.addById(str);
            }

            str = xml.attributes.tween;
            if (str)
                this._tween = true;

            str = xml.attributes.ease;
            if (str)
                this._easeType = ParseEaseType(str);

            str = xml.attributes.duration;
            if (str)
                this._tweenTime = parseFloat(str);
                
            str = xml.attributes.delay;
            if (str)
                this._tweenDelay = parseFloat(str);

            str = xml.attributes.values;
            var values: string[];
            if (str)
                values = xml.attributes.values.split("|");
            else
                values = [];

            for (var i: number = 0; i < values.length; i++) {
                str = values[i];
                if (str != "-")
                    this.addStatus(pages[i], str);
            }
            str = xml.attributes.default;
            if (str)
                this.addStatus(null, str);
        }

        protected get connected(): boolean {
            if (this._controller && !this._pageSet.empty)
                return this._pageSet.containsId(this._controller.selectedPageId);
            else
                return false;
        }
        
        protected addStatus(pageId: string, value: string): void {
            
        }
        
        protected init():void {
            
        }
                
        public apply(): void {
        }

        public updateState(): void {
        }
    }
}
