///<reference path="utils/PixelHitTest.ts"/>

module fgui {

    export class PackageItem {
        public owner: UIPackage;

        public type: PackageItemType;
        public objectType?: ObjectType;
        public id: string;
        public name: string;
        public width: number = 0;
        public height: number = 0;
        public file: string;
        public decoded?: boolean;
        public loading?: Array<Function>;
        public rawData?: ByteBuffer;
        public asset?: egret.Texture | egret.Sound | any;

        public highResolution?: Array<string>;
        public branches?: Array<string>;

        //image
        public scale9Grid?: egret.Rectangle;
        public scaleByTile?: boolean;
        public tileGridIndice?: number;
        public smoothing?: boolean;
        public pixelHitTestData?: PixelHitTestData;

        //movieclip
        public interval?: number;
        public repeatDelay?: number;
        public swing?: boolean;
        public frames?: Array<Frame>;

        //componenet
        public extensionType?: any;

        //font 
        public bitmapFont?: BitmapFont;

        //skeleton
        public skeletonAnchor?: egret.Point;
        public armatureName?: string;

        public constructor() {
        }

        public load(): Object {
            return this.owner.getItemAsset(this);
        }

        public getBranch(): PackageItem {
            if (this.branches && this.owner._branchIndex != -1) {
                var itemId: string = this.branches[this.owner._branchIndex];
                if (itemId)
                    return this.owner.getItemById(itemId);
            }

            return this;
        }

        public getHighResolution(): PackageItem {
            if (this.highResolution && GRoot.contentScaleLevel > 0) {
                var itemId: string = this.highResolution[GRoot.contentScaleLevel - 1];
                if (itemId)
                    return this.owner.getItemById(itemId);
            }

            return this;
        }

        public toString(): string {
            return this.name;
        }
    }
}