
module fairygui {

    export class Margin {
        public left: number = 0;
        public right: number = 0;
        public top: number = 0;
        public bottom: number = 0;

        public constructor() {
        }

        public parse(str: string): void {
            if (!str) {
                this.left = 0;
                this.right = 0;
                this.top = 0;
                this.bottom = 0;
                return;
            }
            var arr: string[] = str.split(",");
            if (arr.length == 1) {
                var k: number = parseInt(arr[0]);
                this.top = k;
                this.bottom = k;
                this.left = k;
                this.right = k;
            }
            else {
                this.top = parseInt(arr[0]);
                this.bottom = parseInt(arr[1]);
                this.left = parseInt(arr[2]);
                this.right = parseInt(arr[3]);
            }
        }

        public copy(source: Margin): void {
            this.top = source.top;
            this.bottom = source.bottom;
            this.left = source.left;
            this.right = source.right;
        }
    }
}