
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
            let arr;
            if (this._ubbEnabled)
                arr = GTextField._htmlParser.parser(ToolSet.parseUBB(text2));
            else
                arr = GTextField._htmlParser.parser(text2);
            if (this._underline) {
                for (var i = 0; i < arr.length; i++) {
                    let element = arr[i];
                    if (element.style)
                        element.style.underline = true;
                    else
                        element.style = <egret.ITextStyle>{ underline: true };
                }
            }
            this._textField.textFlow = arr;
        }
    }
}