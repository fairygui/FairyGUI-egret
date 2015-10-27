
module fairygui {

    export class GSwfObject extends GObject implements IAnimationGear {
        public _container: UIContainer;
        public _content: egret.DisplayObject;
        public _playing: boolean;
        public _frame: number = 0;
        public _gearAnimation: GearAnimation;

        public constructor() {
            super();
            this._playing = true;

            this._gearAnimation = new GearAnimation(this);
        }

        protected createDisplayObject(): void {
            this._container = new UIContainer(this);
            //this.setDisplayObject(this._container);
        }

        public get playing(): boolean {
            return this._playing;
        }

        public set playing(value: boolean) {
            if (this._playing != value) {
                this._playing = value;
                if (this._gearAnimation.controller)
                    this._gearAnimation.updateState();
            }
        }

        public get frame(): number {
            return this._frame;
        }

        public set frame(value: number) {
            if (this._frame != value) {
                this._frame = value;

                if (this._gearAnimation.controller)
                    this._gearAnimation.updateState();
            }
        }

        public get gearAnimation(): GearAnimation {
            return this._gearAnimation;
        }

        protected handleSizeChanged(): void {
            if (this._content) {
                this._container.scaleX = this.width / this._sourceWidth * this.scaleX * GRoot.contentScaleFactor;
                this._container.scaleY = this.height / this._sourceHeight * this.scaleY * GRoot.contentScaleFactor;
            }
        }

        public handleControllerChanged(c: Controller): void {
            super.handleControllerChanged(c);
            if(this._gearAnimation.controller == c)
                this._gearAnimation.apply();
        }

        public constructFromResource(pkgItem: PackageItem): void {

        }

    }
}