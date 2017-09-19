
module fairygui {

    export class GRichTextField extends GTextField {

        public constructor() {
            super();

            this._textField.touchEnabled = true;
        }

        protected updateTextFieldText(): void {
            if (this._ubbEnabled)
                this._textField.textFlow = (new egret.HtmlTextParser).parser(ToolSet.parseUBB(this._text));
            else
                this._textField.textFlow = (new egret.HtmlTextParser).parser(this._text);
        }
    }
}