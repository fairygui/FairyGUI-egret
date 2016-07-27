
module fairygui {

    export class GLabel extends GComponent {
        protected _titleObject: GObject;
        protected _iconObject: GObject;

        public constructor() {
            super();
        }

        public get icon(): string {
            if(this._iconObject instanceof GLoader)
                return (<GLoader>this._iconObject).url;
            else if(this._iconObject instanceof GLabel)
                return (<GLabel>this._iconObject).icon;
            else if(this._iconObject instanceof GButton)
                return (<GButton>this._iconObject).icon;
        }

        public set icon(value: string) {
            if(this._iconObject instanceof GLoader)
                (<GLoader>this._iconObject).url = value;
            else if(this._iconObject instanceof GLabel)
                (<GLabel>this._iconObject).icon = value;
            else if(this._iconObject instanceof GButton)
                (<GButton>this._iconObject).icon = value;
        }

        public get title(): string {
            if (this._titleObject)
                return this._titleObject.text;
            else
                return null;
        }

        public set title(value: string) {
            if (this._titleObject)
                this._titleObject.text = value;
        }

        public get text(): string {
            return this.title;
        }

        public set text(value: string) {
            this.title = value;
        }

        public get titleColor(): number {
            if(this._titleObject instanceof GTextField)
                return (<GTextField>this._titleObject).color;
            else if(this._titleObject instanceof GLabel)
                return (<GLabel>this._titleObject).titleColor;
            else if(this._titleObject instanceof GButton)
                return (<GButton>this._titleObject).titleColor;
            else
                return 0;
        }

        public set titleColor(value: number) {
            if(this._titleObject instanceof GTextField)
                (<GTextField>this._titleObject).color = value;
            else if(this._titleObject instanceof GLabel)
                (<GLabel>this._titleObject).titleColor = value;
            else if(this._titleObject instanceof GButton)
                (<GButton>this._titleObject).titleColor = value;
        }

        public set editable(val: boolean) {
            if (this._titleObject)
                this._titleObject.asTextInput.editable = val;
        }

        public get editable(): boolean {
            if (this._titleObject && (this._titleObject instanceof GTextInput))
                return this._titleObject.asTextInput.editable;
            else
                return false;
        }

        protected constructFromXML(xml: any): void {
            super.constructFromXML(xml);

            this._titleObject = this.getChild("title");
            this._iconObject = this.getChild("icon");
        }

        public setup_afterAdd(xml: any): void {
            super.setup_afterAdd(xml);

            xml = ToolSet.findChildNode(xml, "Label");
            if (xml) {
                var str: string;
                str = xml.attributes.title;
                if(str)
                    this.text = str;
                str = xml.attributes.icon;
                if(str)
                    this.icon = str;
               
                str = xml.attributes.titleColor;
                if (str)
                    this.titleColor = ToolSet.convertFromHtmlColor(str);
                    
                if(this._titleObject instanceof GTextInput)
                {
                    str = xml.attributes.promptText;
                    if(str)
                        (<GTextInput><any>this._titleObject).promptText = str;
                }
            }
        }
    }
}