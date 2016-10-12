
module fairygui {

	export class GTextInput extends GTextField{
        private _changed: boolean;
        private _promptText: string;
        private _password: boolean;

		public constructor(){
			super();
			
            this._widthAutoSize = false;
            this._heightAutoSize = false;

            (<egret.DisplayObjectContainer>this.displayObject).touchChildren = true;
            this._textField.type = egret.TextFieldType.INPUT;
            this._textField.addEventListener(egret.Event.CHANGE,this.__textChanged,this);
            this._textField.addEventListener(egret.FocusEvent.FOCUS_IN,this.__focusIn,this);
            this._textField.addEventListener(egret.FocusEvent.FOCUS_OUT,this.__focusOut,this);
		}
		
		public dispose():void{
			super.dispose();
		}
        
		public set editable(val:boolean){
            if (val)
                this._textField.type == egret.TextFieldType.INPUT;
            else
                this._textField.type == egret.TextFieldType.DYNAMIC;
		}
		
		public get editable():boolean{
            return this._textField.type == egret.TextFieldType.INPUT;
		}
		
		public set maxLength(val:number){
            this._textField.maxChars = val;
		}
		
		public get maxLength():number{
            return this._textField.maxChars;
		}
		
        public set promptText(val: string) {
            this._promptText = val;
            this.updateTextFieldText();
        }

        public get promptText(): string {
            return this._promptText;
        }

        public set restrict(value:string) {
			this._textField.restrict = value;
		}
		
		public get restrict():string {
			return this._textField.restrict;
		}

        public get password(): boolean {
            return this._password;
        }

        public set password(val: boolean) {
            if(this._password != val) {
                this._password = val;
                this._textField.displayAsPassword = this._password;
                this.render();
            }
        }
		
        public set verticalAlign(value: VertAlignType) {
            if(this._verticalAlign != value) {
                this._verticalAlign = value;
                this.updateVertAlign();
            }
        }
        
        private updateVertAlign(): void {
            switch(this._verticalAlign) {
                case VertAlignType.Top:
                    this._textField.verticalAlign = egret.VerticalAlign.TOP;
                    break;
                case VertAlignType.Middle:
                    this._textField.verticalAlign = egret.VerticalAlign.MIDDLE;
                    break;

                case VertAlignType.Bottom:
                    this._textField.verticalAlign = egret.VerticalAlign.BOTTOM;
                    break;
            }
        }
        
        protected updateTextFieldText(): void {
            if(!this._text && this._promptText) {
                this._textField.displayAsPassword = false;
                this._textField.textFlow = (new egret.HtmlTextParser).parser(ToolSet.parseUBB(this._promptText));
            }
            else {
                this._textField.displayAsPassword = this._password;
                if(this._ubbEnabled)
                    this._textField.textFlow = (new egret.HtmlTextParser).parser(ToolSet.parseUBB(ToolSet.encodeHTML(this._text)));
                else
                    this._textField.text = this._text;
            }
        }
        
        protected handleSizeChanged(): void {
            if(!this._updatingSize) {
                this._textField.width = Math.ceil(this.width);
                this._textField.height = Math.ceil(this.height);
            }
        }
        
        protected doAlign(): void {
            //nothing here
        }
        
        public setup_beforeAdd(xml: any): void {
            super.setup_beforeAdd(xml);

            this._promptText = xml.attributes.prompt;
            var str:string = xml.attributes.maxLength;
            if(str != null)
                this._textField.maxChars = parseInt(str);
            str = xml.attributes.restrict;
            if(str != null)
                this._textField.restrict = str;
            str = xml.attributes.password;
            if(str=="true")
                this.password = true;
            this.updateVertAlign();
        }
        
        public setup_afterAdd(xml: any): void {
            super.setup_afterAdd(xml);
            
            if(!this._text && this._promptText) {
                this._textField.displayAsPassword = false;
                this._textField.textFlow = (new egret.HtmlTextParser).parser(ToolSet.parseUBB(ToolSet.encodeHTML(this._promptText)));
            }
        }
		
		private __textChanged(evt:egret.Event):void {
            this._text = this._textField.text;
		}
		
        private __focusIn(evt: egret.Event): void {
            if(!this._text && this._promptText) {
                this._textField.displayAsPassword = this._password;
                this._textField.text = "";
            }
        }
		
        private __focusOut(evt: egret.Event): void {
            this._text = this._textField.text;
            if(!this._text && this._promptText) {
                this._textField.displayAsPassword = false;
                this._textField.textFlow = (new egret.HtmlTextParser).parser(ToolSet.parseUBB(ToolSet.encodeHTML(this._promptText)));
            }
		}
	}
}