
class PullToRefreshDemo {
    private _view: fgui.GComponent;
    private _list1: fgui.GList;
    private _list2: fgui.GList;

    public async start() {
        await fgui.UIPackage.loadPackage("PullToRefresh");

        fgui.UIObjectFactory.setExtension("ui://PullToRefresh/Header", ScrollPaneHeader);

        this._view = fgui.UIPackage.createObject("PullToRefresh", "Main").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);

        this._list1 = this._view.getChild("list1").asList;
        this._list1.itemRenderer = this.renderListItem1;
        this._list1.callbackThisObj = this;
        this._list1.setVirtual();
        this._list1.numItems = 1;
        this._list1.scrollPane.addEventListener(fgui.ScrollPane.PULL_DOWN_RELEASE, this.onPullDownToRefresh, this);

        this._list2 = this._view.getChild("list2").asList;
        this._list2.itemRenderer = this.renderListItem2;
        this._list2.callbackThisObj = this;
        this._list2.setVirtual();
        this._list2.numItems = 1;
        this._list2.scrollPane.addEventListener(fgui.ScrollPane.PULL_UP_RELEASE, this.onPullUpToRefresh, this);
    }

    private renderListItem1(index: number, item: fgui.GObject): void {
        item.text = "Item " + (this._list1.numItems - index - 1);
    }

    private renderListItem2(index: number, item: fgui.GObject): void {
        item.text = "Item " + index;
    }

    private onPullDownToRefresh(evt: egret.Event): void {
        var header: ScrollPaneHeader = <ScrollPaneHeader>(this._list1.scrollPane.header);
        if (header.readyToRefresh) {
            header.setRefreshStatus(2);
            this._list1.scrollPane.lockHeader(header.sourceHeight);

            //Simulate a async resquest
            fgui.GTimers.inst.add(2000, 1, function (): void {
                this._list1.numItems += 5;

                //Refresh completed
                header.setRefreshStatus(3);
                this._list1.scrollPane.lockHeader(35);

                fgui.GTimers.inst.add(2000, 1, function (): void {
                    header.setRefreshStatus(0);
                    this._list1.scrollPane.lockHeader(0);
                }, this);
            }, this);
        }
    }

    private onPullUpToRefresh(evt: egret.Event): void {
        var footer: fgui.GComponent = this._list2.scrollPane.footer.asCom;

        footer.getController("c1").selectedIndex = 1;
        this._list2.scrollPane.lockFooter(footer.sourceHeight);

        //Simulate a async resquest
        fgui.GTimers.inst.add(2000, 1, function (): void {
            this._list2.numItems += 5;

            //Refresh completed
            footer.getController("c1").selectedIndex = 0;
            this._list2.scrollPane.lockFooter(0);
        }, this);
    }
}

