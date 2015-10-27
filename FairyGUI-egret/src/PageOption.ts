
module fairygui {

    export class PageOption {
        private _controller: Controller;
        private _id: string;

        public constructor() {
        }

        public set controller(val: Controller) {
            this._controller = val;
        }

        public set index(pageIndex: number) {
            this._id = this._controller.getPageId(pageIndex);
        }

        public set name(pageName: string) {
            this._id = this._controller.getPageIdByName(pageName);
        }

        public get index(): number {
            if (this._id)
                return this._controller.getPageIndexById(this._id);
            else
                return -1;
        }

        public get name(): string {
            if (this._id)
                return this._controller.getPageNameById(this._id);
            else
                return null;
        }

        public clear(): void {
            this._id = null;
        }

        public set id(id: string) {
            this._id = id;
        }

        public get id(): string {
            return this._id;
        }
    }
}