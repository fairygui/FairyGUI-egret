
module fairygui {

    export class GRichTextField extends GTextField {

        public constructor() {
            super();

            this._textField.touchEnabled = true;
        }

        protected updateTextFieldText(): void {
            var text2: string = this._text;
            if (this._templateVars != null)
                text2 = this.parseTemplate(text2);
            if (this._ubbEnabled)
                this._textField.textFlow = (new egret.HtmlTextParser).parser(ToolSet.parseUBB(text2));
            else
                this._textField.textFlow = (new egret.HtmlTextParser).parser(text2);
        }
    }
}