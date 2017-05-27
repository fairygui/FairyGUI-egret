module fairygui {

    export class AsyncOperation {
        /**
         * callback(obj:GObject)
         */
        public callback: Function;
        public callbackObj: any;

        private _itemList: Array<DisplayListItem>;
        private _objectPool: Array<GObject>;
        private _index: number;

        public constructor() {
            this._itemList = new Array<DisplayListItem>();
            this._objectPool = new Array<GObject>();
        }

        public createObject(pkgName: string, resName: string): void {
            var pkg: UIPackage = UIPackage.getByName(pkgName);
            if (pkg) {
                var pi: PackageItem = pkg.getItemByName(resName);
                if (!pi)
                    throw new Error("resource not found: " + resName);

                this.internalCreateObject(pi);
            }
            else
                throw new Error("package not found: " + pkgName);
        }

        public createObjectFromURL(url: string): void {
            var pi: PackageItem = UIPackage.getItemByURL(url);
            if (pi)
                this.internalCreateObject(pi);
            else
                throw new Error("resource not found: " + url);
        }

        public cancel(): void {
            GTimers.inst.remove(this.run, this);
            this._itemList.length = 0;
            var cnt: number = this._objectPool.length;
            if (cnt > 0) {
                for (var i: number = 0; i < cnt; i++)
                    this._objectPool[i].dispose();
                this._objectPool.length = 0;
            }
        }

        private internalCreateObject(item: PackageItem): void {
            this._itemList.length = 0;
            this._objectPool.length = 0;

            this.collectComponentChildren(item);
            this._itemList.push(new DisplayListItem(item, null));

            this._index = 0;
            GTimers.inst.add(1, 0, this.run, this);
        }

        private collectComponentChildren(item: PackageItem): void {
            item.owner.getItemAsset(item);

            var cnt: number = item.displayList.length;
            for (var i: number = 0; i < cnt; i++) {
                var di: DisplayListItem = item.displayList[i];
                if (di.packageItem != null && di.packageItem.type == PackageItemType.Component)
                    this.collectComponentChildren(di.packageItem);
                else if (di.type == "list") //也要收集列表的item
                {
                    var defaultItem: string = null;
                    di.listItemCount = 0;

                    var col: any = di.desc.children;
                    var length: number = col.length;
                    for (var j: number = 0; j < length; j++) {
                        var cxml: any = col[j];
                        if (cxml.name != "item")
                            continue;

                        var url: string = cxml.attributes.url;
                        if (!url) {
                            if (defaultItem == null)
                                defaultItem = di.desc.attributes.defaultItem;
                            url = defaultItem;
                            if (!url)
                                continue;
                        }

                        var pi: PackageItem = UIPackage.getItemByURL(url);
                        if (pi) {
                            if (pi.type == PackageItemType.Component)
                                this.collectComponentChildren(pi);

                            this._itemList.push(new DisplayListItem(pi, null));
                            di.listItemCount++;
                        }
                    }
                }
                this._itemList.push(di);
            }
        }

        private run(): void {
            var obj: GObject;
            var di: DisplayListItem;
            var poolStart: number;
            var k: number;
            var t: number = egret.getTimer();
            var frameTime: number = fairygui.UIConfig.frameTimeForAsyncUIConstruction;
            var totalItems: number = this._itemList.length;

            while (this._index < totalItems) {
                di = this._itemList[this._index];
                if (di.packageItem != null) {
                    obj = UIObjectFactory.newObject(di.packageItem);
                    obj.packageItem = di.packageItem;
                    this._objectPool.push(obj);

                    UIPackage._constructing++;
                    if (di.packageItem.type == PackageItemType.Component) {
                        poolStart = this._objectPool.length - di.packageItem.displayList.length - 1;

                        (<GComponent><any>obj).constructFromResource2(this._objectPool, poolStart);

                        this._objectPool.splice(poolStart, di.packageItem.displayList.length);
                    }
                    else {
                        obj.constructFromResource();
                    }
                    UIPackage._constructing--;
                }
                else {
                    obj = UIObjectFactory.newObject2(di.type);
                    this._objectPool.push(obj);

                    if (di.type == "list" && di.listItemCount > 0) {
                        poolStart = this._objectPool.length - di.listItemCount - 1;

                        for (k = 0; k < di.listItemCount; k++) //把他们都放到pool里，这样GList在创建时就不需要创建对象了
                            (<GList><any>obj).itemPool.returnObject(this._objectPool[k + poolStart]);

                        this._objectPool.splice(poolStart, di.listItemCount);
                    }
                }

                this._index++;
                if ((this._index % 5 == 0) && egret.getTimer() - t >= frameTime)
                    return;
            }

            GTimers.inst.remove(this.run, this);
            var result: GObject = this._objectPool[0];
            this._itemList.length = 0;
            this._objectPool.length = 0;

            if (this.callback != null)
                this.callback.call(this.callbackObj, result);
        }
    }
}
