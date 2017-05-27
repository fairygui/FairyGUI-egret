
module fairygui {

    export class GObjectPool {
        private _pool: any;
        private _count: number = 0;

        public constructor() {
            this._pool = {};
        }

        public clear(): void {
            var length1: number = this._pool.length;
            for (var i1: number = 0; i1 < length1; i1++) {
                var arr: Array<GObject> = this._pool[i1];
                var cnt: number = arr.length;
                for (var i: number = 0; i < cnt; i++)
                    arr[i].dispose();
            }
            this._pool = {};
            this._count = 0;
        }

        public get count(): number {
            return this._count;
        }

        public getObject(url: string): GObject {
            url = UIPackage.normalizeURL(url);
            if (url == null)
                return null;

            var arr: Array<GObject> = this._pool[url];
            if (arr != null && arr.length) {
                this._count--;
                return arr.shift();
            }

            var child: GObject = UIPackage.createObjectFromURL(url);
            return child;
        }

        public returnObject(obj: GObject): void {
            var url: string = obj.resourceURL;
            if (!url)
                return;

            var arr: Array<GObject> = this._pool[url];
            if (arr == null) {
                arr = new Array<GObject>();
                this._pool[url] = arr;
            }

            this._count++;
            arr.push(obj);
        }
    }
}