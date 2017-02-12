
module fairygui {

    export class Relations {
        private _owner: GObject;
        private _items: Array<RelationItem>;

        public handling: GObject;
        public sizeDirty: boolean;

        private static RELATION_NAMES: Array<string> =
        [
            "left-left",//0
            "left-center",
            "left-right",
            "center-center",
            "right-left",
            "right-center",
            "right-right",
            "top-top",//7
            "top-middle",
            "top-bottom",
            "middle-middle",
            "bottom-top",
            "bottom-middle",
            "bottom-bottom",
            "width-width",//14
            "height-height",//15
            "leftext-left",//16
            "leftext-right",
            "rightext-left",
            "rightext-right",
            "topext-top",//20
            "topext-bottom",
            "bottomext-top",
            "bottomext-bottom"//23
        ];

        public constructor(owner: GObject) {
            this._owner = owner;
            this._items = new Array<RelationItem>();
        }

        public add(target: GObject, relationType: number, usePercent: boolean= false): void {
            var length: number = this._items.length;
            for (var i: number = 0; i < length; i++) {
                var item: RelationItem = this._items[i];
                if (item.target == target) {
                    item.add(relationType, usePercent);
                    return;
                }
            }
            var newItem: RelationItem = new RelationItem(this._owner);
            newItem.target = target;
            newItem.add(relationType, usePercent);
            this._items.push(newItem);
        }

        public addItems(target: GObject, sidePairs: string): void {
            var arr: string[] = sidePairs.split(",");
            var s: string;
            var usePercent: boolean;
            var i: number;

            for (i = 0; i < 2; i++) {
                s = arr[i];
                if (!s)
                    continue;

                if (s.charAt(s.length - 1) == "%") {
                    s = s.substr(0, s.length - 1);
                    usePercent = true;
                }
                else
                    usePercent = false;
                var j: number = s.indexOf("-");
                if (j == -1)
                    s = s + "-" + s;

                var t: number = Relations.RELATION_NAMES.indexOf(s);
                if (t == -1)
                    throw "invalid relation type";

                this.add(target, t, usePercent);
            }
        }

        public remove(target: GObject, relationType: number = 0): void {
            var cnt: number = this._items.length;
            var i: number = 0;
            while (i < cnt) {
                var item: RelationItem = this._items[i];
                if (item.target == target) {
                    item.remove(relationType);
                    if (item.isEmpty) {
                        item.dispose();
                        this._items.splice(i, 1);
                        cnt--;
                    }
                    else
                        i++;
                }
                else
                    i++;
            }
        }

        public contains(target: GObject): boolean {
            var length: number = this._items.length;
            for (var i: number = 0; i < length; i++) {
                var item: RelationItem = this._items[i];
                if (item.target == target)
                    return true;
            }
            return false;
        }

        public clearFor(target: GObject): void {
            var cnt: number = this._items.length;
            var i: number = 0;
            while (i < cnt) {
                var item: RelationItem = this._items[i];
                if (item.target == target) {
                    item.dispose();
                    this._items.splice(i, 1);
                    cnt--;
                }
                else
                    i++;
            }
        }

        public clearAll(): void {
            var length: number = this._items.length;
            for (var i: number = 0; i < length; i++) {
                var item: RelationItem = this._items[i];
                item.dispose();
            }
            this._items.length = 0;
        }

        public copyFrom(source: Relations): void {
            this.clearAll();

            var arr: Array<RelationItem> = source._items;
            var length: number = arr.length;
            for (var i: number = 0; i < length; i++) {
                var ri: RelationItem = arr[i];
                var item: RelationItem = new RelationItem(this._owner);
                item.copyFrom(ri);
                this._items.push(item);
            }
        }

        public dispose(): void {
            this.clearAll();
        }

        public onOwnerSizeChanged(dWidth:number, dHeight:number): void {
            if (this._items.length == 0)
                return;

            var length: number = this._items.length;
            for (var i: number = 0; i < length; i++) {
                var item: RelationItem = this._items[i];
                item.applyOnSelfResized(dWidth, dHeight);
            }
        }

        public ensureRelationsSizeCorrect(): void {
            if (this._items.length == 0)
                return;

            this.sizeDirty = false;
            var length: number = this._items.length;
            for (var i: number = 0; i < length; i++) {
                var item: RelationItem = this._items[i];
                item.target.ensureSizeCorrect();
            }
        }

        public get empty(): boolean {
            return this._items.length == 0;
        }

        public setup(xml: any): void {
            var col: any = xml.children;
            if (col) {
                var targetId: string;
                var target: GObject;
                var length: number = col.length;
                for (var i: number = 0; i < length; i++) {
                    var cxml: any = col[i];
                    if (cxml.name != "relation")
                        continue;

                    targetId = cxml.attributes.target;
                    if (this._owner.parent) {
                        if (targetId)
                            target = this._owner.parent.getChildById(targetId);
                        else
                            target = this._owner.parent;
                    }
                    else {
                        //call from component construction
                        target = (<GComponent><any> (this._owner)).getChildById(targetId);
                    }
                    if (target)
                        this.addItems(target, cxml.attributes.sidePair);
                }
            }
        }
    }
}