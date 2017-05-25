module fairygui {

    export class DisplayListItem {
        public packageItem: PackageItem;
        public type: string;
        public desc: any;
        public listItemCount: number;

        public constructor(packageItem: PackageItem, type: string) {
            this.packageItem = packageItem;
            this.type = type;
        }
    }
}