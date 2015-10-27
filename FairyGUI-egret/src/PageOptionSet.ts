
module fairygui {

    export class PageOptionSet {
        private _controller: Controller;
        private _items: Array<string>;

        public constructor() {
            this._items = [];
        }

        public set controller(val: Controller) {
            this._controller = val;
        }

        public add(pageIndex: number = 0): void {
            var id: string = this._controller.getPageId(pageIndex);
            var i: number = this._items.indexOf(id);
            if (i == -1)
                this._items.push(id);
        }

        public remove(pageIndex: number = 0): void {
            var id: string = this._controller.getPageId(pageIndex);
            var i: number = this._items.indexOf(id);
            if (i != -1)
                this._items.splice(i, 1);
        }

        public addByName(pageName: string): void {
            var id: string = this._controller.getPageIdByName(pageName);
            var i: number = this._items.indexOf(id);
            if (i != -1)
                this._items.push(id);
        }

        public removeByName(pageName: string): void {
            var id: string = this._controller.getPageIdByName(pageName);
            var i: number = this._items.indexOf(id);
            if (i != -1)
                this._items.splice(i, 1);
        }

        public clear(): void {
            this._items.length = 0;
        }

        public get empty(): boolean {
            return this._items.length == 0;
        }

        public addById(id: string): void {
            this._items.push(id);
        }

        public containsId(id: string): boolean {
            return this._items.indexOf(id) != -1;
        }
    }
}