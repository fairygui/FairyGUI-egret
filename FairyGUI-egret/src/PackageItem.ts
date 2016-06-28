
module fairygui {

    export class PackageItem {
        public owner: UIPackage;

        public type: PackageItemType;
        public id: string;
        public name: string;
        public width: number = 0;
        public height: number = 0;
        public file: string;
        public decoded: boolean;

        //image
        public scale9Grid: egret.Rectangle;
        public scaleByTile: boolean;
        public smoothing: boolean;
        public texture: egret.Texture;

        //movieclip
        public interval: number;
        public repeatDelay: number;
        public swing: boolean;
        public frames: Array<Frame>;

        //componenet
        public componentData: any;

        //sound
        public sound: egret.Sound;

        //font 
        public bitmapFont: BitmapFont;

        public constructor() {
        }

        public load(): any {
            return this.owner.getItemAsset(this);
        }

        public toString(): string {
            return this.name;
        }
    }
}