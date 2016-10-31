
module fairygui {

    export class GRichTextField extends GTextField {

        public constructor() {
            super();
            
            this._textField.touchEnabled = true;
            this._textField.addEventListener(egret.TextEvent.LINK,this.__clickLink,this);
        }

        public get text(): string {
            return this._text;
        }
        
        public set text(value: string) {
            this._text = value;
            if(this._text == null)
                this._text = "";
            this._textField.width = this.width;
            if(this._ubbEnabled)
                this._textField.textFlow = (new egret.HtmlTextParser).parser(ToolSet.parseUBB(this._text));
            else
                this._textField.textFlow = (new egret.HtmlTextParser).parser(this._text);
            this.updateGear(6);
            this.render();
        }
        
        private __clickLink(evt: egret.TextEvent) {
            this.dispatchEvent(new egret.TextEvent(egret.TextEvent.LINK,false,false,evt.text));
        }
    }
}