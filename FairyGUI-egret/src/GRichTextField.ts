///<reference path="GTextField.ts"/>

module fairygui {

    export class GRichTextField extends GTextField {

        public constructor() {
            super();

            this._textField.touchEnabled = true;
            this._textField.addEventListener(egret.TextEvent.LINK, this.__clickLink, this);
        }

        protected updateTextFieldText(): void {
            if (this._ubbEnabled)
                this._textField.textFlow = (new egret.HtmlTextParser).parser(ToolSet.parseUBB(this._text));
            else
                this._textField.textFlow = (new egret.HtmlTextParser).parser(this._text);
        }

        private __clickLink(evt: egret.TextEvent) {
            this.dispatchEvent(new egret.TextEvent(egret.TextEvent.LINK, false, false, evt.text));
        }
    }
}