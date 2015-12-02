
module fairygui {

	export class GTextInput extends GTextField{
        private _changed: Boolean;

		public constructor(){
			super();
			
            this._widthAutoSize = false;
            this._heightAutoSize = false;

            (<egret.DisplayObjectContainer>this.displayObject).touchChildren = true;
            this._textField.type = egret.TextFieldType.INPUT;
            this._textField.addEventListener(egret.Event.CHANGE,this.__textChanged,this);
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
		
        protected handleSizeChanged(): void {
            if(!this._updatingSize) {
                this._textField.width = Math.ceil(this.width * GRoot.contentScaleFactor);
                this._textField.height = Math.ceil(this.height * GRoot.contentScaleFactor);
            }
        }
        
        protected doAlign(): void {
            //nothing here
        }
        
        public setup_beforeAdd(xml: any): void {
            super.setup_beforeAdd(xml);
            
            this.updateVertAlign();
        }
		
		private __textChanged(evt:egret.Event):void {
            this._text = this._textField.text;
		}
		
        private __focusOut(evt: egret.Event): void {
            this._text = this._textField.text;
		}
	}
}