
module fairygui {

	export class GTextInput extends GTextField{

		public constructor(){
			super();

            (<egret.DisplayObjectContainer>this.displayObject).touchChildren = true;
            this._textField.type = egret.TextFieldType.INPUT;
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
	}
}