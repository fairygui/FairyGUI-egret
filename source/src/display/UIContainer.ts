
module fgui {

    export class UIContainer extends egret.DisplayObjectContainer {
        private _hitArea?: PixelHitTest | egret.DisplayObject;
        private _cachedMatrix?: egret.Matrix;
        private _cachedHitArea?: boolean;
        private _opaque?: boolean;

        public constructor() {
            super();
            
            this.touchEnabled = true;
            this.touchChildren = true;
        }

        public cacheHitArea(value: boolean) {
            this._cachedHitArea = value;
            if (value) {
                if (!this._cachedMatrix)
                    this._cachedMatrix = new egret.Matrix();
                this._cachedMatrix.copyFrom(this.$getInvertedConcatenatedMatrix());
            }
        }

        public get hitArea(): PixelHitTest | egret.DisplayObject {
            return this._hitArea;
        }

        public set hitArea(value: PixelHitTest | egret.DisplayObject) {
            this._hitArea = value;
        }

        public get opaque(): boolean {
            return this._opaque;
        }

        public set opaque(value: boolean) {
            this._opaque = value;
        }

        public $hitTest(stageX: number, stageY: number): egret.DisplayObject {
            if (!this.$visible)
                return null;

            if (this._hitArea) {
                if (!this.touchEnabled)
                    return null;

                if ((<any>this._hitArea).$graphics) {
                    if (!(<any>this._hitArea).$graphics.$hitTest(stageX, stageY))
                        return null;
                }
                else {
                    let m: egret.Matrix = this._cachedHitArea ? this._cachedMatrix : this.$getInvertedConcatenatedMatrix();
                    let localX: number = m.a * stageX + m.c * stageY + m.tx;
                    let localY: number = m.b * stageX + m.d * stageY + m.ty;

                    if (!(<PixelHitTest>this._hitArea).contains(localX, localY))
                        return null;
                }

                return this;
            }

            let ret: egret.DisplayObject = super.$hitTest(stageX, stageY);
            if (ret == this && !this.touchEnabled)
                return null;

            if (ret == null && this._opaque) {
                let m: egret.Matrix = this._cachedHitArea ? this._cachedMatrix : this.$getInvertedConcatenatedMatrix();
                let localX: number = m.a * stageX + m.c * stageY + m.tx;
                let localY: number = m.b * stageX + m.d * stageY + m.ty;
                if (localX >= 0 && localY >= 0 && localX <= this.$explicitWidth && localY <= this.$explicitHeight)
                    return this;
                else
                    return null;
            }
            else if (ret == this && !this._opaque)
                return null;
            else
                return ret;
        }
    }
}