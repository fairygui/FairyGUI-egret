
module fgui {

    export class ScrollPane extends egret.EventDispatcher {
        private _owner: GComponent;
        private _container: egret.DisplayObjectContainer;
        private _maskContainer: egret.DisplayObjectContainer;
        private _alignContainer: egret.DisplayObjectContainer;

        private _scrollType: number;
        private _scrollStep: number;
        private _decelerationRate: number;
        private _scrollBarMargin: Margin;
        private _bouncebackEffect: boolean;
        private _touchEffect: boolean;
        private _scrollBarDisplayAuto?: boolean;
        private _vScrollNone: boolean;
        private _hScrollNone: boolean;
        private _needRefresh: boolean;
        private _refreshBarAxis: string;

        private _displayOnLeft?: boolean;
        private _snapToItem?: boolean;
        public _displayInDemand?: boolean;
        private _pageMode?: boolean;
        private _inertiaDisabled?: boolean;
        private _floating?: boolean;

        private _xPos: number;
        private _yPos: number;

        private _viewSize: egret.Point;
        private _contentSize: egret.Point;
        private _overlapSize: egret.Point;
        private _pageSize: egret.Point;
        private _containerPos: egret.Point;
        private _beginTouchPos: egret.Point;
        private _lastTouchPos: egret.Point;
        private _lastTouchGlobalPos: egret.Point;
        private _velocity: egret.Point;
        private _velocityScale: number;
        private _lastMoveTime: number;
        private _isHoldAreaDone: boolean;
        private _aniFlag: number;
        public _loop: number;
        private _headerLockedSize: number;
        private _footerLockedSize: number;
        private _refreshEventDispatching: boolean;
        private _dragged: boolean;

        private _tweening: number;
        private _tweenTime: egret.Point;
        private _tweenDuration: egret.Point;
        private _tweenStart: egret.Point;
        private _tweenChange: egret.Point;

        private _pageController?: Controller;

        private _hzScrollBar?: GScrollBar;
        private _vtScrollBar?: GScrollBar;
        private _header?: GComponent;
        private _footer?: GComponent;

        public static draggingPane: ScrollPane;

        public static SCROLL: string = "__scroll";
        public static SCROLL_END: string = "__scrollEnd";
        public static PULL_DOWN_RELEASE: string = "pullDownRelease";
        public static PULL_UP_RELEASE: string = "pullUpRelease";

        public constructor(owner: GComponent) {
            super();

            this._owner = owner;

            this._maskContainer = new egret.DisplayObjectContainer();
            this._owner._rootContainer.addChild(this._maskContainer);

            this._container = this._owner._container;
            this._container.x = 0;
            this._container.y = 0;
            this._maskContainer.addChild(this._container);

            this._scrollBarMargin = new Margin();
            this._xPos = 0;
            this._yPos = 0;
            this._aniFlag = 0;
            this._tweening = 0;
            this._footerLockedSize = 0;
            this._headerLockedSize = 0;
            this._viewSize = new egret.Point();
            this._contentSize = new egret.Point();
            this._pageSize = new egret.Point(1, 1);
            this._overlapSize = new egret.Point();
            this._tweenTime = new egret.Point();
            this._tweenStart = new egret.Point();
            this._tweenDuration = new egret.Point();
            this._tweenChange = new egret.Point();
            this._velocity = new egret.Point();
            this._containerPos = new egret.Point();
            this._beginTouchPos = new egret.Point();
            this._lastTouchPos = new egret.Point();
            this._lastTouchGlobalPos = new egret.Point();
            this._scrollStep = UIConfig.defaultScrollStep;
            this._decelerationRate = UIConfig.defaultScrollDecelerationRate;

            this._owner.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__touchBegin, this);
        }

        public setup(buffer: ByteBuffer): void {
            this._scrollType = buffer.readByte();
            var scrollBarDisplay: ScrollBarDisplayType = buffer.readByte();
            var flags: number = buffer.readInt();

            if (buffer.readBool()) {
                this._scrollBarMargin.top = buffer.readInt();
                this._scrollBarMargin.bottom = buffer.readInt();
                this._scrollBarMargin.left = buffer.readInt();
                this._scrollBarMargin.right = buffer.readInt();
            }

            var vtScrollBarRes: string = buffer.readS();
            var hzScrollBarRes: string = buffer.readS();
            var headerRes: string = buffer.readS();
            var footerRes: string = buffer.readS();

            if ((flags & 1) != 0) this._displayOnLeft = true;
            if ((flags & 2) != 0) this._snapToItem = true;
            if ((flags & 4) != 0) this._displayInDemand = true;
            if ((flags & 8) != 0) this._pageMode = true;
            if (flags & 16)
                this._touchEffect = true;
            else if (flags & 32)
                this._touchEffect = false;
            else
                this._touchEffect = UIConfig.defaultScrollTouchEffect;
            if (flags & 64)
                this._bouncebackEffect = true;
            else if (flags & 128)
                this._bouncebackEffect = false;
            else
                this._bouncebackEffect = UIConfig.defaultScrollBounceEffect;
            if ((flags & 256) != 0) this._inertiaDisabled = true;
            if ((flags & 512) == 0) this._maskContainer.scrollRect = new egret.Rectangle();
            if ((flags & 1024) != 0) this._floating = true;

            if (scrollBarDisplay == ScrollBarDisplayType.Default)
                scrollBarDisplay = UIConfig.defaultScrollBarDisplay;

            if (scrollBarDisplay != ScrollBarDisplayType.Hidden) {
                if (this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Vertical) {
                    var res: string = vtScrollBarRes ? vtScrollBarRes : UIConfig.verticalScrollBar;
                    if (res) {
                        this._vtScrollBar = <GScrollBar>UIPackage.createObjectFromURL(res);
                        if (!this._vtScrollBar)
                            throw "cannot create scrollbar from " + res;
                        this._vtScrollBar.setScrollPane(this, true);
                        this._owner._rootContainer.addChild(this._vtScrollBar.displayObject);
                    }
                }
                if (this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Horizontal) {
                    var res: string = hzScrollBarRes ? hzScrollBarRes : UIConfig.horizontalScrollBar;
                    if (res) {
                        this._hzScrollBar = <GScrollBar>UIPackage.createObjectFromURL(res);
                        if (!this._hzScrollBar)
                            throw "cannot create scrollbar from " + res;
                        this._hzScrollBar.setScrollPane(this, false);
                        this._owner._rootContainer.addChild(this._hzScrollBar.displayObject);
                    }
                }

                this._scrollBarDisplayAuto = scrollBarDisplay == ScrollBarDisplayType.Auto;
                if (this._scrollBarDisplayAuto) {
                    if (this._vtScrollBar)
                        this._vtScrollBar.displayObject.visible = false;
                    if (this._hzScrollBar)
                        this._hzScrollBar.displayObject.visible = false;
                }
            }

            if (headerRes) {
                this._header = <GComponent>UIPackage.createObjectFromURL(headerRes);
                if (!this._header)
                    throw "cannot create scrollPane header from " + headerRes;
            }

            if (footerRes) {
                this._footer = <GComponent>UIPackage.createObjectFromURL(footerRes);
                if (!this._footer)
                    throw "cannot create scrollPane footer from " + footerRes;
            }

            if (this._header || this._footer)
                this._refreshBarAxis = (this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Vertical) ? "y" : "x";

            this.setSize(this._owner.width, this._owner.height);
        }

        public dispose(): void {
            if (this._tweening != 0)
                GTimers.inst.remove(this.tweenUpdate, this);

            this._pageController = null;

            if (this._hzScrollBar)
                this._hzScrollBar.dispose();
            if (this._vtScrollBar)
                this._vtScrollBar.dispose();
            if (this._header)
                this._header.dispose();
            if (this._footer)
                this._footer.dispose();
        }

        public get owner(): GComponent {
            return this._owner;
        }

        public get hzScrollBar(): GScrollBar {
            return this._hzScrollBar;
        }

        public get vtScrollBar(): GScrollBar {
            return this._vtScrollBar;
        }

        public get header(): GComponent {
            return this._header;
        }

        public get footer(): GComponent {
            return this._footer;
        }

        public get bouncebackEffect(): boolean {
            return this._bouncebackEffect;
        }

        public set bouncebackEffect(sc: boolean) {
            this._bouncebackEffect = sc;
        }

        public get touchEffect(): boolean {
            return this._touchEffect;
        }

        public set touchEffect(sc: boolean) {
            this._touchEffect = sc;
        }

        public set scrollStep(val: number) {
            this._scrollStep = val;
            if (this._scrollStep == 0)
                this._scrollStep = UIConfig.defaultScrollStep;
        }

        public get decelerationRate(): number {
            return this._decelerationRate;
        }

        public set decelerationRate(val: number) {
            this._decelerationRate = val;
        }

        public get scrollStep(): number {
            return this._scrollStep;
        }

        public get snapToItem(): boolean {
            return this._snapToItem;
        }

        public set snapToItem(value: boolean) {
            this._snapToItem = value;
        }

        public get isDragged(): boolean {
            return this._dragged;
        }

        public get percX(): number {
            return this._overlapSize.x == 0 ? 0 : this._xPos / this._overlapSize.x;
        }

        public set percX(value: number) {
            this.setPercX(value, false);
        }

        public setPercX(value: number, ani: boolean = false): void {
            this._owner.ensureBoundsCorrect();
            this.setPosX(this._overlapSize.x * ToolSet.clamp01(value), ani);
        }

        public get percY(): number {
            return this._overlapSize.y == 0 ? 0 : this._yPos / this._overlapSize.y;
        }

        public set percY(value: number) {
            this.setPercY(value, false);
        }

        public setPercY(value: number, ani: boolean = false): void {
            this._owner.ensureBoundsCorrect();
            this.setPosY(this._overlapSize.y * ToolSet.clamp01(value), ani);
        }

        public get posX(): number {
            return this._xPos;
        }

        public set posX(value: number) {
            this.setPosX(value, false);
        }

        public setPosX(value: number, ani?: boolean): void {
            this._owner.ensureBoundsCorrect();

            if (this._loop == 1)
                value = this.loopCheckingNewPos(value, "x");

            value = ToolSet.clamp(value, 0, this._overlapSize.x);
            if (value != this._xPos) {
                this._xPos = value;
                this.posChanged(ani);
            }
        }

        public get posY(): number {
            return this._yPos;
        }

        public set posY(value: number) {
            this.setPosY(value, false);
        }

        public setPosY(value: number, ani?: boolean): void {
            this._owner.ensureBoundsCorrect();

            if (this._loop == 1)
                value = this.loopCheckingNewPos(value, "y");

            value = ToolSet.clamp(value, 0, this._overlapSize.y);
            if (value != this._yPos) {
                this._yPos = value;
                this.posChanged(ani);
            }
        }

        public get contentWidth(): number {
            return this._contentSize.x;
        }

        public get contentHeight(): number {
            return this._contentSize.y;
        }

        public get viewWidth(): number {
            return this._viewSize.x;
        }

        public set viewWidth(value: number) {
            value = value + this._owner.margin.left + this._owner.margin.right;
            if (this._vtScrollBar && !this._floating)
                value += this._vtScrollBar.width;
            this._owner.width = value;
        }

        public get viewHeight(): number {
            return this._viewSize.y;
        }

        public set viewHeight(value: number) {
            value = value + this._owner.margin.top + this._owner.margin.bottom;
            if (this._hzScrollBar && !this._floating)
                value += this._hzScrollBar.height;
            this._owner.height = value;
        }

        public get currentPageX(): number {
            if (!this._pageMode)
                return 0;

            var page: number = Math.floor(this._xPos / this._pageSize.x);
            if (this._xPos - page * this._pageSize.x > this._pageSize.x * 0.5)
                page++;

            return page;
        }

        public set currentPageX(value: number) {
            this.setCurrentPageX(value, false);
        }

        public get currentPageY(): number {
            if (!this._pageMode)
                return 0;

            var page: number = Math.floor(this._yPos / this._pageSize.y);
            if (this._yPos - page * this._pageSize.y > this._pageSize.y * 0.5)
                page++;

            return page;
        }

        public set currentPageY(value: number) {
            this.setCurrentPageY(value, false);
        }

        public setCurrentPageX(value: number, ani?: boolean): void {
            if (!this._pageMode)
                return;

            this._owner.ensureBoundsCorrect();

            if (this._overlapSize.x > 0)
                this.setPosX(value * this._pageSize.x, ani);
        }

        public setCurrentPageY(value: number, ani?: boolean): void {
            if (!this._pageMode)
                return;

            this._owner.ensureBoundsCorrect();

            if (this._overlapSize.y > 0)
                this.setPosY(value * this._pageSize.y, ani);
        }

        public get isBottomMost(): boolean {
            return this._yPos == this._overlapSize.y || this._overlapSize.y == 0;
        }

        public get isRightMost(): boolean {
            return this._xPos == this._overlapSize.x || this._overlapSize.x == 0;
        }

        public get pageController(): Controller {
            return this._pageController;
        }

        public set pageController(value: Controller) {
            this._pageController = value;
        }

        public get scrollingPosX(): number {
            return ToolSet.clamp(-this._container.x, 0, this._overlapSize.x);
        }

        public get scrollingPosY(): number {
            return ToolSet.clamp(-this._container.y, 0, this._overlapSize.y);
        }

        public scrollTop(ani?: boolean): void {
            this.setPercY(0, ani);
        }

        public scrollBottom(ani?: boolean): void {
            this.setPercY(1, ani);
        }

        public scrollUp(ratio?: number, ani?: boolean): void {
            ratio = ratio || 1;
            if (this._pageMode)
                this.setPosY(this._yPos - this._pageSize.y * ratio, ani);
            else
                this.setPosY(this._yPos - this._scrollStep * ratio, ani);
        }

        public scrollDown(ratio?: number, ani?: boolean): void {
            ratio = ratio || 1;
            if (this._pageMode)
                this.setPosY(this._yPos + this._pageSize.y * ratio, ani);
            else
                this.setPosY(this._yPos + this._scrollStep * ratio, ani);
        }

        public scrollLeft(ratio?: number, ani?: boolean): void {
            ratio = ratio || 1;
            if (this._pageMode)
                this.setPosX(this._xPos - this._pageSize.x * ratio, ani);
            else
                this.setPosX(this._xPos - this._scrollStep * ratio, ani);
        }

        public scrollRight(ratio?: number, ani?: boolean): void {
            ratio = ratio || 1;
            if (this._pageMode)
                this.setPosX(this._xPos + this._pageSize.x * ratio, ani);
            else
                this.setPosX(this._xPos + this._scrollStep * ratio, ani);
        }

        public scrollToView(target: egret.Rectangle | GObject, ani?: boolean, setFirst?: boolean): void {
            this._owner.ensureBoundsCorrect();
            if (this._needRefresh)
                this.refresh();

            var rect: egret.Rectangle;
            if (target instanceof GObject) {
                if (target.parent != this._owner) {
                    target.parent.localToGlobalRect(target.x, target.y,
                        target.width, target.height, s_rect);
                    rect = this._owner.globalToLocalRect(s_rect.x, s_rect.y,
                        s_rect.width, s_rect.height, s_rect);
                }
                else {
                    rect = s_rect;
                    rect.setTo(target.x, target.y, target.width, target.height);
                }
            }
            else
                rect = target;

            if (this._overlapSize.y > 0) {
                var bottom: number = this._yPos + this._viewSize.y;
                if (setFirst || rect.y <= this._yPos || rect.height >= this._viewSize.y) {
                    if (this._pageMode)
                        this.setPosY(Math.floor(rect.y / this._pageSize.y) * this._pageSize.y, ani);
                    else
                        this.setPosY(rect.y, ani);
                }
                else if (rect.y + rect.height > bottom) {
                    if (this._pageMode)
                        this.setPosY(Math.floor(rect.y / this._pageSize.y) * this._pageSize.y, ani);
                    else if (rect.height <= this._viewSize.y / 2)
                        this.setPosY(rect.y + rect.height * 2 - this._viewSize.y, ani);
                    else
                        this.setPosY(rect.y + rect.height - this._viewSize.y, ani);
                }
            }
            if (this._overlapSize.x > 0) {
                var right: number = this._xPos + this._viewSize.x;
                if (setFirst || rect.x <= this._xPos || rect.width >= this._viewSize.x) {
                    if (this._pageMode)
                        this.setPosX(Math.floor(rect.x / this._pageSize.x) * this._pageSize.x, ani);
                    else
                        this.setPosX(rect.x, ani);
                }
                else if (rect.x + rect.width > right) {
                    if (this._pageMode)
                        this.setPosX(Math.floor(rect.x / this._pageSize.x) * this._pageSize.x, ani);
                    else if (rect.width <= this._viewSize.x / 2)
                        this.setPosX(rect.x + rect.width * 2 - this._viewSize.x, ani);
                    else
                        this.setPosX(rect.x + rect.width - this._viewSize.x, ani);
                }
            }

            if (!ani && this._needRefresh)
                this.refresh();
        }

        public isChildInView(obj: GObject): boolean {
            if (this._overlapSize.y > 0) {
                var dist: number = obj.y + this._container.y;
                if (dist < -obj.height || dist > this._viewSize.y)
                    return false;
            }

            if (this._overlapSize.x > 0) {
                dist = obj.x + this._container.x;
                if (dist < -obj.width || dist > this._viewSize.x)
                    return false;
            }

            return true;
        }

        public cancelDragging(): void {
            this._owner.displayObject.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__touchMove, this);
            this._owner.displayObject.removeEventListener(egret.TouchEvent.TOUCH_END, this.__touchEnd, this);
            this._owner.displayObject.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.__touchTap, this);

            if (ScrollPane.draggingPane == this)
                ScrollPane.draggingPane = null;

            _gestureFlag = 0;
            this._dragged = false;
            this._maskContainer.touchChildren = true;
        }

        public lockHeader(size: number): void {
            if (this._headerLockedSize == size)
                return;

            this._headerLockedSize = size;

            if (!this._refreshEventDispatching && this._container[this._refreshBarAxis] >= 0) {
                this._tweenStart.setTo(this._container.x, this._container.y);
                this._tweenChange.setTo(0, 0);
                this._tweenChange[this._refreshBarAxis] = this._headerLockedSize - this._tweenStart[this._refreshBarAxis];
                this._tweenDuration.setTo(TWEEN_TIME_DEFAULT, TWEEN_TIME_DEFAULT);
                this.startTween(2);
            }
        }

        public lockFooter(size: number): void {
            if (this._footerLockedSize == size)
                return;

            this._footerLockedSize = size;

            if (!this._refreshEventDispatching && this._container[this._refreshBarAxis] <= -this._overlapSize[this._refreshBarAxis]) {
                this._tweenStart.setTo(this._container.x, this._container.y);
                this._tweenChange.setTo(0, 0);
                var max: number = this._overlapSize[this._refreshBarAxis];
                if (max == 0)
                    max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
                else
                    max += this._footerLockedSize;
                this._tweenChange[this._refreshBarAxis] = -max - this._tweenStart[this._refreshBarAxis];
                this._tweenDuration.setTo(TWEEN_TIME_DEFAULT, TWEEN_TIME_DEFAULT);
                this.startTween(2);
            }
        }

        public onOwnerSizeChanged(): void {
            this.setSize(this._owner.width, this._owner.height);
            this.posChanged(false);
        }

        public handleControllerChanged(c: Controller): void {
            if (this._pageController == c) {
                if (this._scrollType == ScrollType.Horizontal)
                    this.setCurrentPageX(c.selectedIndex, true);
                else
                    this.setCurrentPageY(c.selectedIndex, true);
            }
        }

        private updatePageController(): void {
            if (this._pageController && !this._pageController.changing) {
                var index: number;
                if (this._scrollType == ScrollType.Horizontal)
                    index = this.currentPageX;
                else
                    index = this.currentPageY;
                if (index < this._pageController.pageCount) {
                    var c: Controller = this._pageController;
                    this._pageController = null; //防止HandleControllerChanged的调用
                    c.selectedIndex = index;
                    this._pageController = c;
                }
            }
        }

        public adjustMaskContainer(): void {
            var mx: number, my: number;
            if (this._displayOnLeft && this._vtScrollBar && !this._floating)
                mx = Math.floor(this._owner.margin.left + this._vtScrollBar.width);
            else
                mx = Math.floor(this._owner.margin.left);
            my = Math.floor(this._owner.margin.top);

            this._maskContainer.x = mx;
            this._maskContainer.y = my;

            if (this._owner._alignOffset.x != 0 || this._owner._alignOffset.y != 0) {
                if (this._alignContainer == null) {
                    this._alignContainer = new egret.DisplayObjectContainer();
                    this._maskContainer.addChild(this._alignContainer);
                    this._alignContainer.addChild(this._container);
                }

                this._alignContainer.x = this._owner._alignOffset.x;
                this._alignContainer.y = this._owner._alignOffset.y;
            }
            else if (this._alignContainer) {
                this._alignContainer.x = this._alignContainer.y = 0;
            }
        }

        public setSize(aWidth: number, aHeight: number): void {
            this.adjustMaskContainer();

            if (this._hzScrollBar) {
                this._hzScrollBar.y = aHeight - this._hzScrollBar.height;
                if (this._vtScrollBar && !this._vScrollNone) {
                    this._hzScrollBar.width = aWidth - this._vtScrollBar.width - this._scrollBarMargin.left - this._scrollBarMargin.right;
                    if (this._displayOnLeft)
                        this._hzScrollBar.x = this._scrollBarMargin.left + this._vtScrollBar.width;
                    else
                        this._hzScrollBar.x = this._scrollBarMargin.left;
                }
                else {
                    this._hzScrollBar.width = aWidth - this._scrollBarMargin.left - this._scrollBarMargin.right;
                    this._hzScrollBar.x = this._scrollBarMargin.left;
                }
            }
            if (this._vtScrollBar) {
                if (!this._displayOnLeft)
                    this._vtScrollBar.x = aWidth - this._vtScrollBar.width;
                if (this._hzScrollBar)
                    this._vtScrollBar.height = aHeight - this._hzScrollBar.height - this._scrollBarMargin.top - this._scrollBarMargin.bottom;
                else
                    this._vtScrollBar.height = aHeight - this._scrollBarMargin.top - this._scrollBarMargin.bottom;
                this._vtScrollBar.y = this._scrollBarMargin.top;
            }

            this._viewSize.x = aWidth;
            this._viewSize.y = aHeight;
            if (this._hzScrollBar && !this._floating)
                this._viewSize.y -= this._hzScrollBar.height;
            if (this._vtScrollBar && !this._floating)
                this._viewSize.x -= this._vtScrollBar.width;
            this._viewSize.x -= (this._owner.margin.left + this._owner.margin.right);
            this._viewSize.y -= (this._owner.margin.top + this._owner.margin.bottom);

            this._viewSize.x = Math.max(1, this._viewSize.x);
            this._viewSize.y = Math.max(1, this._viewSize.y);
            this._pageSize.x = this._viewSize.x;
            this._pageSize.y = this._viewSize.y;

            this.handleSizeChanged();
        }

        public setContentSize(aWidth: number, aHeight: number): void {
            if (this._contentSize.x == aWidth && this._contentSize.y == aHeight)
                return;

            this._contentSize.x = aWidth;
            this._contentSize.y = aHeight;
            this.handleSizeChanged();
        }

        public changeContentSizeOnScrolling(deltaWidth: number, deltaHeight: number,
            deltaPosX: number, deltaPosY: number): void {
            var isRightmost: boolean = this._xPos == this._overlapSize.x;
            var isBottom: boolean = this._yPos == this._overlapSize.y;

            this._contentSize.x += deltaWidth;
            this._contentSize.y += deltaHeight;
            this.handleSizeChanged();

            if (this._tweening == 1) {
                //如果原来滚动位置是贴边，加入处理继续贴边。
                if (deltaWidth != 0 && isRightmost && this._tweenChange.x < 0) {
                    this._xPos = this._overlapSize.x;
                    this._tweenChange.x = -this._xPos - this._tweenStart.x;
                }

                if (deltaHeight != 0 && isBottom && this._tweenChange.y < 0) {
                    this._yPos = this._overlapSize.y;
                    this._tweenChange.y = -this._yPos - this._tweenStart.y;
                }
            }
            else if (this._tweening == 2) {
                //重新调整起始位置，确保能够顺滑滚下去
                if (deltaPosX != 0) {
                    this._container.x -= deltaPosX;
                    this._tweenStart.x -= deltaPosX;
                    this._xPos = -this._container.x;
                }
                if (deltaPosY != 0) {
                    this._container.y -= deltaPosY;
                    this._tweenStart.y -= deltaPosY;
                    this._yPos = -this._container.y;
                }
            }
            else if (this._dragged) {
                if (deltaPosX != 0) {
                    this._container.x -= deltaPosX;
                    this._containerPos.x -= deltaPosX;
                    this._xPos = -this._container.x;
                }
                if (deltaPosY != 0) {
                    this._container.y -= deltaPosY;
                    this._containerPos.y -= deltaPosY;
                    this._yPos = -this._container.y;
                }
            }
            else {
                //如果原来滚动位置是贴边，加入处理继续贴边。
                if (deltaWidth != 0 && isRightmost) {
                    this._xPos = this._overlapSize.x;
                    this._container.x = -this._xPos;
                }

                if (deltaHeight != 0 && isBottom) {
                    this._yPos = this._overlapSize.y;
                    this._container.y = -this._yPos;
                }
            }

            if (this._pageMode)
                this.updatePageController();
        }

        private handleSizeChanged(): void {
            if (this._displayInDemand) {
                this._vScrollNone = this._contentSize.y <= this._viewSize.y;
                this._hScrollNone = this._contentSize.x <= this._viewSize.x;
            }

            if (this._vtScrollBar) {
                if (this._contentSize.y == 0)
                    this._vtScrollBar.setDisplayPerc(0);
                else
                    this._vtScrollBar.setDisplayPerc(Math.min(1, this._viewSize.y / this._contentSize.y));
            }
            if (this._hzScrollBar) {
                if (this._contentSize.x == 0)
                    this._hzScrollBar.setDisplayPerc(0);
                else
                    this._hzScrollBar.setDisplayPerc(Math.min(1, this._viewSize.x / this._contentSize.x));
            }

            this.updateScrollBarVisible();

            var rect: egret.Rectangle = this._maskContainer.scrollRect;
            if (rect) {
                rect.width = this._viewSize.x;
                rect.height = this._viewSize.y;
                if (this._vScrollNone && this._vtScrollBar)
                    rect.width += this._vtScrollBar.width;
                if (this._hScrollNone && this._hzScrollBar)
                    rect.height += this._hzScrollBar.height;
                this._maskContainer.scrollRect = rect;
            }

            if (this._scrollType == ScrollType.Horizontal || this._scrollType == ScrollType.Both)
                this._overlapSize.x = Math.ceil(Math.max(0, this._contentSize.x - this._viewSize.x));
            else
                this._overlapSize.x = 0;
            if (this._scrollType == ScrollType.Vertical || this._scrollType == ScrollType.Both)
                this._overlapSize.y = Math.ceil(Math.max(0, this._contentSize.y - this._viewSize.y));
            else
                this._overlapSize.y = 0;

            //边界检查
            this._xPos = ToolSet.clamp(this._xPos, 0, this._overlapSize.x);
            this._yPos = ToolSet.clamp(this._yPos, 0, this._overlapSize.y);
            if (this._refreshBarAxis != null) {
                var max: number = this._overlapSize[this._refreshBarAxis];
                if (max == 0)
                    max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
                else
                    max += this._footerLockedSize;

                if (this._refreshBarAxis == "x") {
                    this._container.x = ToolSet.clamp(this._container.x, -max, this._headerLockedSize);
                    this._container.y = ToolSet.clamp(this._container.y, -this._overlapSize.y, 0);
                }
                else {
                    this._container.x = ToolSet.clamp(this._container.x, -this._overlapSize.x, 0);
                    this._container.y = ToolSet.clamp(this._container.y, -max, this._headerLockedSize);
                }

                if (this._header) {
                    if (this._refreshBarAxis == "x")
                        this._header.height = this._viewSize.y;
                    else
                        this._header.width = this._viewSize.x;
                }

                if (this._footer) {
                    if (this._refreshBarAxis == "y")
                        this._footer.height = this._viewSize.y;
                    else
                        this._footer.width = this._viewSize.x;
                }
            }
            else {
                this._container.x = ToolSet.clamp(this._container.x, -this._overlapSize.x, 0);
                this._container.y = ToolSet.clamp(this._container.y, -this._overlapSize.y, 0);
            }

            this.updateScrollBarPos();
            if (this._pageMode)
                this.updatePageController();
        }

        private posChanged(ani: boolean): void {
            if (this._aniFlag == 0)
                this._aniFlag = ani ? 1 : -1;
            else if (this._aniFlag == 1 && !ani)
                this._aniFlag = -1;

            this._needRefresh = true;
            GTimers.inst.callLater(this.refresh, this);
            if (this._tweening != 0)
                this.killTween();
        }

        private refresh(): void {
            this._needRefresh = false;
            GTimers.inst.remove(this.refresh, this);

            if (this._pageMode || this._snapToItem) {
                sEndPos.setTo(-this._xPos, -this._yPos);
                this.alignPosition(sEndPos, false);
                this._xPos = -sEndPos.x;
                this._yPos = -sEndPos.y;
            }

            this.refresh2();

            this.dispatchEventWith(ScrollPane.SCROLL);
            if (this._needRefresh) //在onScroll事件里开发者可能修改位置，这里再刷新一次，避免闪烁
            {
                this._needRefresh = false;
                GTimers.inst.remove(this.refresh, this);

                this.refresh2();
            }

            this.updateScrollBarPos();
            this._aniFlag = 0;
        }

        private refresh2() {
            if (this._aniFlag == 1 && !this._dragged) {
                var posX: number;
                var posY: number;

                if (this._overlapSize.x > 0)
                    posX = -Math.floor(this._xPos);
                else {
                    if (this._container.x != 0)
                        this._container.x = 0;
                    posX = 0;
                }
                if (this._overlapSize.y > 0)
                    posY = -Math.floor(this._yPos);
                else {
                    if (this._container.y != 0)
                        this._container.y = 0;
                    posY = 0;
                }

                if (posX != this._container.x || posY != this._container.y) {
                    this._tweenDuration.setTo(TWEEN_TIME_GO, TWEEN_TIME_GO);
                    this._tweenStart.setTo(this._container.x, this._container.y);
                    this._tweenChange.setTo(posX - this._tweenStart.x, posY - this._tweenStart.y);
                    this.startTween(1);
                }
                else if (this._tweening != 0)
                    this.killTween();
            }
            else {
                if (this._tweening != 0)
                    this.killTween();

                this._container.x = Math.floor(-this._xPos);
                this._container.y = Math.floor(-this._yPos);

                this.loopCheckingCurrent();
            }

            if (this._pageMode)
                this.updatePageController();
        }

        private __touchBegin(evt: egret.TouchEvent): void {
            if (!this._touchEffect)
                return;

            if (this._tweening != 0) {
                this.killTween();
                this._dragged = true;
            }
            else
                this._dragged = false;

            var pt: egret.Point = this._owner.globalToLocal(evt.stageX, evt.stageY, s_vec2);

            this._containerPos.setTo(this._container.x, this._container.y);
            this._beginTouchPos.setTo(pt.x, pt.y);
            this._lastTouchPos.setTo(pt.x, pt.y);
            this._lastTouchGlobalPos.setTo(evt.stageX, evt.stageY);
            this._isHoldAreaDone = false;
            this._velocity.setTo(0, 0);
            this._velocityScale = 1;
            this._lastMoveTime = egret.getTimer() / 1000;

            this._owner.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__touchMove, this);
            this._owner.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.__touchEnd, this);
            this._owner.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.__touchTap, this);
        }

        private __touchMove(evt: egret.TouchEvent): void {
            if (this._owner.displayObject.stage == null)
                return;

            if (!this._touchEffect)
                return;

            if (ScrollPane.draggingPane && ScrollPane.draggingPane != this || GObject.draggingObject) //已经有其他拖动
                return;

            var pt: egret.Point = this._owner.globalToLocal(evt.stageX, evt.stageY, s_vec2);

            var sensitivity: number = UIConfig.touchScrollSensitivity;
            var diff: number, diff2: number;
            var sv: boolean, sh: boolean, st: boolean;

            if (this._scrollType == ScrollType.Vertical) {
                if (!this._isHoldAreaDone) {
                    //表示正在监测垂直方向的手势
                    _gestureFlag |= 1;

                    diff = Math.abs(this._beginTouchPos.y - pt.y);
                    if (diff < sensitivity)
                        return;

                    if ((_gestureFlag & 2) != 0) //已经有水平方向的手势在监测，那么我们用严格的方式检查是不是按垂直方向移动，避免冲突
                    {
                        diff2 = Math.abs(this._beginTouchPos.x - pt.x);
                        if (diff < diff2) //不通过则不允许滚动了
                            return;
                    }
                }

                sv = true;
            }
            else if (this._scrollType == ScrollType.Horizontal) {
                if (!this._isHoldAreaDone) {
                    _gestureFlag |= 2;

                    diff = Math.abs(this._beginTouchPos.x - pt.x);
                    if (diff < sensitivity)
                        return;

                    if ((_gestureFlag & 1) != 0) {
                        diff2 = Math.abs(this._beginTouchPos.y - pt.y);
                        if (diff < diff2)
                            return;
                    }
                }

                sh = true;
            }
            else {
                _gestureFlag = 3;

                if (!this._isHoldAreaDone) {
                    diff = Math.abs(this._beginTouchPos.y - pt.y);
                    if (diff < sensitivity) {
                        diff = Math.abs(this._beginTouchPos.x - pt.x);
                        if (diff < sensitivity)
                            return;
                    }
                }

                sv = sh = true;
            }

            var newPosX: number = Math.floor(this._containerPos.x + pt.x - this._beginTouchPos.x);
            var newPosY: number = Math.floor(this._containerPos.y + pt.y - this._beginTouchPos.y);

            if (sv) {
                if (newPosY > 0) {
                    if (!this._bouncebackEffect)
                        this._container.y = 0;
                    else if (this._header && this._header.maxHeight != 0)
                        this._container.y = Math.floor(Math.min(newPosY * 0.5, this._header.maxHeight));
                    else
                        this._container.y = Math.floor(Math.min(newPosY * 0.5, this._viewSize.y * PULL_RATIO));
                }
                else if (newPosY < -this._overlapSize.y) {
                    if (!this._bouncebackEffect)
                        this._container.y = -this._overlapSize.y;
                    else if (this._footer && this._footer.maxHeight > 0)
                        this._container.y = Math.floor(Math.max((newPosY + this._overlapSize.y) * 0.5, -this._footer.maxHeight) - this._overlapSize.y);
                    else
                        this._container.y = Math.floor(Math.max((newPosY + this._overlapSize.y) * 0.5, -this._viewSize.y * PULL_RATIO) - this._overlapSize.y);
                }
                else
                    this._container.y = newPosY;
            }

            if (sh) {
                if (newPosX > 0) {
                    if (!this._bouncebackEffect)
                        this._container.x = 0;
                    else if (this._header && this._header.maxWidth != 0)
                        this._container.x = Math.floor(Math.min(newPosX * 0.5, this._header.maxWidth));
                    else
                        this._container.x = Math.floor(Math.min(newPosX * 0.5, this._viewSize.x * PULL_RATIO));
                }
                else if (newPosX < 0 - this._overlapSize.x) {
                    if (!this._bouncebackEffect)
                        this._container.x = -this._overlapSize.x;
                    else if (this._footer && this._footer.maxWidth > 0)
                        this._container.x = Math.floor(Math.max((newPosX + this._overlapSize.x) * 0.5, -this._footer.maxWidth) - this._overlapSize.x);
                    else
                        this._container.x = Math.floor(Math.max((newPosX + this._overlapSize.x) * 0.5, -this._viewSize.x * PULL_RATIO) - this._overlapSize.x);
                }
                else
                    this._container.x = newPosX;
            }

            //更新速度
            var now: number = egret.getTimer() / 1000;
            var deltaTime: number = Math.max(now - this._lastMoveTime, 1 / 60);
            var deltaPositionX: number = pt.x - this._lastTouchPos.x;
            var deltaPositionY: number = pt.y - this._lastTouchPos.y;
            if (!sh)
                deltaPositionX = 0;
            if (!sv)
                deltaPositionY = 0;
            if (deltaTime != 0) {
                var frameRate: number = this._owner.displayObject.stage.frameRate;
                var elapsed: number = deltaTime * frameRate - 1;
                if (elapsed > 1) //速度衰减
                {
                    var factor: number = Math.pow(0.833, elapsed);
                    this._velocity.x = this._velocity.x * factor;
                    this._velocity.y = this._velocity.y * factor;
                }
                this._velocity.x = ToolSet.lerp(this._velocity.x, deltaPositionX * 60 / frameRate / deltaTime, deltaTime * 10);
                this._velocity.y = ToolSet.lerp(this._velocity.y, deltaPositionY * 60 / frameRate / deltaTime, deltaTime * 10);
            }

            /*速度计算使用的是本地位移，但在后续的惯性滚动判断中需要用到屏幕位移，所以这里要记录一个位移的比例。
            */
            var deltaGlobalPositionX: number = this._lastTouchGlobalPos.x - evt.stageX;
            var deltaGlobalPositionY: number = this._lastTouchGlobalPos.y - evt.stageY;
            if (deltaPositionX != 0)
                this._velocityScale = Math.abs(deltaGlobalPositionX / deltaPositionX);
            else if (deltaPositionY != 0)
                this._velocityScale = Math.abs(deltaGlobalPositionY / deltaPositionY);

            this._lastTouchPos.setTo(pt.x, pt.y);
            this._lastTouchGlobalPos.setTo(evt.stageX, evt.stageY);
            this._lastMoveTime = now;

            //同步更新pos值
            if (this._overlapSize.x > 0)
                this._xPos = ToolSet.clamp(-this._container.x, 0, this._overlapSize.x);
            if (this._overlapSize.y > 0)
                this._yPos = ToolSet.clamp(-this._container.y, 0, this._overlapSize.y);

            //循环滚动特别检查
            if (this._loop != 0) {
                newPosX = this._container.x;
                newPosY = this._container.y;
                if (this.loopCheckingCurrent()) {
                    this._containerPos.x += this._container.x - newPosX;
                    this._containerPos.y += this._container.y - newPosY;
                }
            }

            ScrollPane.draggingPane = this;
            this._isHoldAreaDone = true;
            this._dragged = true;
            this._maskContainer.touchChildren = false;

            this.updateScrollBarPos();
            this.updateScrollBarVisible();
            if (this._pageMode)
                this.updatePageController();

            this.dispatchEventWith(ScrollPane.SCROLL);
        }

        private __touchEnd(evt: egret.TouchEvent): void {
            evt.currentTarget.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__touchMove, this);
            evt.currentTarget.removeEventListener(egret.TouchEvent.TOUCH_END, this.__touchEnd, this);
            evt.currentTarget.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.__touchTap, this);

            if (ScrollPane.draggingPane == this)
                ScrollPane.draggingPane = null;

            _gestureFlag = 0;

            if (!this._dragged || !this._touchEffect || this._owner.displayObject.stage == null) {
                this._dragged = false;
                this._maskContainer.touchChildren = true;
                return;
            }

            // touch事件不一定都是以tap结束,拖拽的结束动作是touchEnd,这时需要正确处理isDragged标记位.否则在播放滚动动画时会因为处于拖拽状态而使滚动动画失效
            this._dragged = false;
            this._maskContainer.touchChildren = true;

            this._tweenStart.setTo(this._container.x, this._container.y);

            sEndPos.setTo(this._tweenStart.x, this._tweenStart.y);
            var flag: boolean = false;
            if (this._container.x > 0) {
                sEndPos.x = 0;
                flag = true;
            }
            else if (this._container.x < -this._overlapSize.x) {
                sEndPos.x = -this._overlapSize.x;
                flag = true;
            }
            if (this._container.y > 0) {
                sEndPos.y = 0;
                flag = true;
            }
            else if (this._container.y < -this._overlapSize.y) {
                sEndPos.y = -this._overlapSize.y;
                flag = true;
            }
            if (flag) {
                this._tweenChange.setTo(sEndPos.x - this._tweenStart.x, sEndPos.y - this._tweenStart.y);
                if (this._tweenChange.x < -UIConfig.touchDragSensitivity || this._tweenChange.y < -UIConfig.touchDragSensitivity) {
                    this._refreshEventDispatching = true;
                    this.dispatchEventWith(ScrollPane.PULL_DOWN_RELEASE);
                    this._refreshEventDispatching = false;
                }
                else if (this._tweenChange.x > UIConfig.touchDragSensitivity || this._tweenChange.y > UIConfig.touchDragSensitivity) {
                    this._refreshEventDispatching = true;
                    this.dispatchEventWith(ScrollPane.PULL_UP_RELEASE);
                    this._refreshEventDispatching = false;
                }

                if (this._headerLockedSize > 0 && sEndPos[this._refreshBarAxis] == 0) {
                    sEndPos[this._refreshBarAxis] = this._headerLockedSize;
                    this._tweenChange.x = sEndPos.x - this._tweenStart.x;
                    this._tweenChange.y = sEndPos.y - this._tweenStart.y;
                }
                else if (this._footerLockedSize > 0 && sEndPos[this._refreshBarAxis] == -this._overlapSize[this._refreshBarAxis]) {
                    var max: number = this._overlapSize[this._refreshBarAxis];
                    if (max == 0)
                        max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
                    else
                        max += this._footerLockedSize;
                    sEndPos[this._refreshBarAxis] = -max;
                    this._tweenChange.x = sEndPos.x - this._tweenStart.x;
                    this._tweenChange.y = sEndPos.y - this._tweenStart.y;
                }

                this._tweenDuration.setTo(TWEEN_TIME_DEFAULT, TWEEN_TIME_DEFAULT);
            }
            else {
                //更新速度
                if (!this._inertiaDisabled) {
                    var frameRate: number = this._owner.displayObject.stage.frameRate;
                    var elapsed: number = (egret.getTimer() / 1000 - this._lastMoveTime) * frameRate - 1;
                    if (elapsed > 1) {
                        var factor: number = Math.pow(0.833, elapsed);
                        this._velocity.x = this._velocity.x * factor;
                        this._velocity.y = this._velocity.y * factor;
                    }
                    //根据速度计算目标位置和需要时间
                    this.updateTargetAndDuration(this._tweenStart, sEndPos);
                }
                else
                    this._tweenDuration.setTo(TWEEN_TIME_DEFAULT, TWEEN_TIME_DEFAULT);
                sOldChange.setTo(sEndPos.x - this._tweenStart.x, sEndPos.y - this._tweenStart.y);

                //调整目标位置
                this.loopCheckingTarget(sEndPos);
                if (this._pageMode || this._snapToItem)
                    this.alignPosition(sEndPos, true);

                this._tweenChange.x = sEndPos.x - this._tweenStart.x;
                this._tweenChange.y = sEndPos.y - this._tweenStart.y;
                if (this._tweenChange.x == 0 && this._tweenChange.y == 0) {
                    this.updateScrollBarVisible();
                    return;
                }

                //如果目标位置已调整，随之调整需要时间
                if (this._pageMode || this._snapToItem) {
                    this.fixDuration("x", sOldChange.x);
                    this.fixDuration("y", sOldChange.y);
                }
            }

            this.startTween(2);
        }

        private __touchTap(evt: egret.TouchEvent): void {
            this._dragged = false;
        }

        private updateScrollBarPos(): void {
            if (this._vtScrollBar)
                this._vtScrollBar.setScrollPerc(this._overlapSize.y == 0 ? 0 : ToolSet.clamp(-this._container.y, 0, this._overlapSize.y) / this._overlapSize.y);

            if (this._hzScrollBar)
                this._hzScrollBar.setScrollPerc(this._overlapSize.x == 0 ? 0 : ToolSet.clamp(-this._container.x, 0, this._overlapSize.x) / this._overlapSize.x);

            this.checkRefreshBar();
        }

        public updateScrollBarVisible(): void {
            if (this._vtScrollBar) {
                if (this._viewSize.y <= this._vtScrollBar.minSize || this._vScrollNone)
                    this._vtScrollBar.displayObject.visible = false;
                else
                    this.updateScrollBarVisible2(this._vtScrollBar);
            }

            if (this._hzScrollBar) {
                if (this._viewSize.x <= this._hzScrollBar.minSize || this._hScrollNone)
                    this._hzScrollBar.displayObject.visible = false;
                else
                    this.updateScrollBarVisible2(this._hzScrollBar);
            }
        }

        private updateScrollBarVisible2(bar: GScrollBar): void {
            if (this._scrollBarDisplayAuto)
                GTween.kill(bar, false, "alpha");

            if (this._scrollBarDisplayAuto && this._tweening == 0 && !this._dragged && !bar.gripDragging) {
                if (bar.displayObject.visible)
                    GTween.to(1, 0, 0.5).setDelay(0.5).onComplete(this.__barTweenComplete, this).setTarget(bar, "alpha");
            }
            else {
                bar.alpha = 1;
                bar.displayObject.visible = true;
            }
        }

        private __barTweenComplete(tweener: GTweener): void {
            var bar: GObject = <GObject>(tweener.target);
            bar.alpha = 1;
            bar.displayObject.visible = false;
        }

        private getLoopPartSize(division: number, axis: string): number {
            return (this._contentSize[axis] + (axis == "x" ? (<GList><any>this._owner).columnGap : (<GList><any>this._owner).lineGap)) / division;
        }

        private loopCheckingCurrent(): boolean {
            var changed: boolean = false;
            if (this._loop == 1 && this._overlapSize.x > 0) {
                if (this._xPos < 0.001) {
                    this._xPos += this.getLoopPartSize(2, "x");
                    changed = true;
                }
                else if (this._xPos >= this._overlapSize.x) {
                    this._xPos -= this.getLoopPartSize(2, "x");
                    changed = true;
                }
            }
            else if (this._loop == 2 && this._overlapSize.y > 0) {
                if (this._yPos < 0.001) {
                    this._yPos += this.getLoopPartSize(2, "y");
                    changed = true;
                }
                else if (this._yPos >= this._overlapSize.y) {
                    this._yPos -= this.getLoopPartSize(2, "y");
                    changed = true;
                }
            }

            if (changed) {
                this._container.x = Math.floor(-this._xPos);
                this._container.y = Math.floor(-this._yPos);
            }

            return changed;
        }

        private loopCheckingTarget(endPos: egret.Point): void {
            if (this._loop == 1)
                this.loopCheckingTarget2(endPos, "x");

            if (this._loop == 2)
                this.loopCheckingTarget2(endPos, "y");
        }

        private loopCheckingTarget2(endPos: egret.Point, axis: string): void {
            var halfSize: number;
            var tmp: number;
            if (endPos[axis] > 0) {
                halfSize = this.getLoopPartSize(2, axis);
                tmp = this._tweenStart[axis] - halfSize;
                if (tmp <= 0 && tmp >= -this._overlapSize[axis]) {
                    endPos[axis] -= halfSize;
                    this._tweenStart[axis] = tmp;
                }
            }
            else if (endPos[axis] < -this._overlapSize[axis]) {
                halfSize = this.getLoopPartSize(2, axis);
                tmp = this._tweenStart[axis] + halfSize;
                if (tmp <= 0 && tmp >= -this._overlapSize[axis]) {
                    endPos[axis] += halfSize;
                    this._tweenStart[axis] = tmp;
                }
            }
        }

        private loopCheckingNewPos(value: number, axis: string): number {
            if (this._overlapSize[axis] == 0)
                return value;

            var pos: number = axis == "x" ? this._xPos : this._yPos;
            var changed: boolean = false;
            var v: number;
            if (value < 0.001) {
                value += this.getLoopPartSize(2, axis);
                if (value > pos) {
                    v = this.getLoopPartSize(6, axis);
                    v = Math.ceil((value - pos) / v) * v;
                    pos = ToolSet.clamp(pos + v, 0, this._overlapSize[axis]);
                    changed = true;
                }
            }
            else if (value >= this._overlapSize[axis]) {
                value -= this.getLoopPartSize(2, axis);
                if (value < pos) {
                    v = this.getLoopPartSize(6, axis);
                    v = Math.ceil((pos - value) / v) * v;
                    pos = ToolSet.clamp(pos - v, 0, this._overlapSize[axis]);
                    changed = true;
                }
            }

            if (changed) {
                if (axis == "x")
                    this._container.x = -Math.floor(pos);
                else
                    this._container.y = -Math.floor(pos);
            }

            return value;
        }

        private alignPosition(pos: egret.Point, inertialScrolling: boolean): void {
            if (this._pageMode) {
                pos.x = this.alignByPage(pos.x, "x", inertialScrolling);
                pos.y = this.alignByPage(pos.y, "y", inertialScrolling);
            }
            else if (this._snapToItem) {
                var pt: egret.Point = this._owner.getSnappingPosition(-pos.x, -pos.y, s_vec2);
                if (pos.x < 0 && pos.x > -this._overlapSize.x)
                    pos.x = -pt.x;
                if (pos.y < 0 && pos.y > -this._overlapSize.y)
                    pos.y = -pt.y;
            }
        }

        private alignByPage(pos: number, axis: string, inertialScrolling: boolean): number {
            var page: number;

            if (pos > 0)
                page = 0;
            else if (pos < -this._overlapSize[axis])
                page = Math.ceil(this._contentSize[axis] / this._pageSize[axis]) - 1;
            else {
                page = Math.floor(-pos / this._pageSize[axis]);
                var change: number = inertialScrolling ? (pos - this._containerPos[axis]) : (pos - this._container[axis]);
                var testPageSize: number = Math.min(this._pageSize[axis], this._contentSize[axis] - (page + 1) * this._pageSize[axis]);
                var delta: number = -pos - page * this._pageSize[axis];

                //页面吸附策略
                if (Math.abs(change) > this._pageSize[axis])//如果滚动距离超过1页,则需要超过页面的一半，才能到更下一页
                {
                    if (delta > testPageSize * 0.5)
                        page++;
                }
                else //否则只需要页面的1/3，当然，需要考虑到左移和右移的情况
                {
                    if (delta > testPageSize * (change < 0 ? 0.3 : 0.7))
                        page++;
                }

                //重新计算终点
                pos = -page * this._pageSize[axis];
                if (pos < -this._overlapSize[axis]) //最后一页未必有pageSize那么大
                    pos = -this._overlapSize[axis];
            }

            //惯性滚动模式下，会增加判断尽量不要滚动超过一页
            if (inertialScrolling) {
                var oldPos: number = this._tweenStart[axis];
                var oldPage: number;
                if (oldPos > 0)
                    oldPage = 0;
                else if (oldPos < -this._overlapSize[axis])
                    oldPage = Math.ceil(this._contentSize[axis] / this._pageSize[axis]) - 1;
                else
                    oldPage = Math.floor(-oldPos / this._pageSize[axis]);
                var startPage: number = Math.floor(-this._containerPos[axis] / this._pageSize[axis]);
                if (Math.abs(page - startPage) > 1 && Math.abs(oldPage - startPage) <= 1) {
                    if (page > startPage)
                        page = startPage + 1;
                    else
                        page = startPage - 1;
                    pos = -page * this._pageSize[axis];
                }
            }

            return pos;
        }

        private updateTargetAndDuration(orignPos: egret.Point, resultPos: egret.Point): void {
            resultPos.x = this.updateTargetAndDuration2(orignPos.x, "x");
            resultPos.y = this.updateTargetAndDuration2(orignPos.y, "y");
        }

        private updateTargetAndDuration2(pos: number, axis: string): number {
            var v: number = this._velocity[axis];
            var duration: number = 0;
            if (pos > 0)
                pos = 0;
            else if (pos < -this._overlapSize[axis])
                pos = -this._overlapSize[axis];
            else {
                //以屏幕像素为基准
                var isMobile: boolean = egret.Capabilities.isMobile;
                var v2: number = Math.abs(v) * this._velocityScale;
                //在移动设备上，需要对不同分辨率做一个适配，我们的速度判断以1136分辨率为基准
                if (isMobile)
                    v2 *= 1136 / Math.max(this._owner.displayObject.stage.stageWidth, this._owner.displayObject.stage.stageHeight);
                //这里有一些阈值的处理，因为在低速内，不希望产生较大的滚动（甚至不滚动）
                var ratio: number = 0;

                if (this._pageMode || !isMobile) {
                    if (v2 > 500)
                        ratio = Math.pow((v2 - 500) / 500, 2);
                }
                else {
                    if (v2 > 1000)
                        ratio = Math.pow((v2 - 1000) / 1000, 2);
                }
                if (ratio != 0) {
                    if (ratio > 1)
                        ratio = 1;

                    v2 *= ratio;
                    v *= ratio;
                    this._velocity[axis] = v;

                    //算法：v*（this._decelerationRate的n次幂）= 60，即在n帧后速度降为60（假设每秒60帧）。
                    duration = Math.log(60 / v2) / Math.log(this._decelerationRate) / 60;

                    //计算距离要使用本地速度
                    //理论公式貌似滚动的距离不够，改为经验公式
                    //var change:number = (v/ 60 - 1) / (1 - this._decelerationRate);
                    var change: number = Math.floor(v * duration * 0.4);
                    pos += change;
                }
            }

            if (duration < TWEEN_TIME_DEFAULT)
                duration = TWEEN_TIME_DEFAULT;
            this._tweenDuration[axis] = duration;

            return pos;
        }

        private fixDuration(axis: string, oldChange: number): void {
            if (this._tweenChange[axis] == 0 || Math.abs(this._tweenChange[axis]) >= Math.abs(oldChange))
                return;

            var newDuration: number = Math.abs(this._tweenChange[axis] / oldChange) * this._tweenDuration[axis];
            if (newDuration < TWEEN_TIME_DEFAULT)
                newDuration = TWEEN_TIME_DEFAULT;

            this._tweenDuration[axis] = newDuration;
        }

        private startTween(type: number): void {
            this._tweenTime.setTo(0, 0);
            this._tweening = type;
            GTimers.inst.add(1, 0, this.tweenUpdate, this);

            this.updateScrollBarVisible();
        }

        private killTween(): void {
            if (this._tweening == 1) //取消类型为1的tween需立刻设置到终点
            {
                this._container.x = this._tweenStart.x + this._tweenChange.x;
                this._container.y = this._tweenStart.y + this._tweenChange.y;
                this.dispatchEventWith(ScrollPane.SCROLL);
            }

            this._tweening = 0;
            GTimers.inst.remove(this.tweenUpdate, this);

            this.updateScrollBarVisible();

            this.dispatchEventWith(ScrollPane.SCROLL_END);
        }

        private checkRefreshBar(): void {
            if (this._header == null && this._footer == null)
                return;

            var pos: number = this._container[this._refreshBarAxis];
            if (this._header) {
                if (pos > 0) {
                    if (this._header.displayObject.parent == null)
                        this._maskContainer.addChildAt(this._header.displayObject, 0);
                    var pt: egret.Point = s_vec2;
                    pt.setTo(this._header.width, this._header.height);
                    pt[this._refreshBarAxis] = pos;
                    this._header.setSize(pt.x, pt.y);
                }
                else {
                    if (this._header.displayObject.parent)
                        this._maskContainer.removeChild(this._header.displayObject);
                }
            }

            if (this._footer) {
                var max: number = this._overlapSize[this._refreshBarAxis];
                if (pos < -max || max == 0 && this._footerLockedSize > 0) {
                    if (this._footer.displayObject.parent == null)
                        this._maskContainer.addChildAt(this._footer.displayObject, 0);

                    pt = s_vec2;
                    pt.setTo(this._footer.x, this._footer.y);
                    if (max > 0)
                        pt[this._refreshBarAxis] = pos + this._contentSize[this._refreshBarAxis];
                    else
                        pt[this._refreshBarAxis] = Math.max(Math.min(pos + this._viewSize[this._refreshBarAxis], this._viewSize[this._refreshBarAxis] - this._footerLockedSize),
                            this._viewSize[this._refreshBarAxis] - this._contentSize[this._refreshBarAxis]);
                    this._footer.setXY(pt.x, pt.y);

                    pt.setTo(this._footer.width, this._footer.height);
                    if (max > 0)
                        pt[this._refreshBarAxis] = -max - pos;
                    else
                        pt[this._refreshBarAxis] = this._viewSize[this._refreshBarAxis] - this._footer[this._refreshBarAxis];
                    this._footer.setSize(pt.x, pt.y);
                }
                else {
                    if (this._footer.displayObject.parent)
                        this._maskContainer.removeChild(this._footer.displayObject);
                }
            }
        }

        private tweenUpdate(timestamp: number): boolean {
            var nx: number = this.runTween("x");
            var ny: number = this.runTween("y");

            this._container.x = nx;
            this._container.y = ny;

            if (this._tweening == 2) {
                if (this._overlapSize.x > 0)
                    this._xPos = ToolSet.clamp(-nx, 0, this._overlapSize.x);
                if (this._overlapSize.y > 0)
                    this._yPos = ToolSet.clamp(-ny, 0, this._overlapSize.y);

                if (this._pageMode)
                    this.updatePageController();
            }

            if (this._tweenChange.x == 0 && this._tweenChange.y == 0) {
                this._tweening = 0;
                GTimers.inst.remove(this.tweenUpdate, this);

                this.loopCheckingCurrent();
                this.updateScrollBarPos();
                this.updateScrollBarVisible();

                this.dispatchEventWith(ScrollPane.SCROLL);
                this.dispatchEventWith(ScrollPane.SCROLL_END);
            }
            else {
                this.updateScrollBarPos();
                this.dispatchEventWith(ScrollPane.SCROLL);
            }

            return true;
        }

        private runTween(axis: string): number {
            var newValue: number;
            if (this._tweenChange[axis] != 0) {
                this._tweenTime[axis] += GTimers.deltaTime / 1000;
                if (this._tweenTime[axis] >= this._tweenDuration[axis]) {
                    newValue = this._tweenStart[axis] + this._tweenChange[axis];
                    this._tweenChange[axis] = 0;
                }
                else {
                    var ratio: number = easeFunc(this._tweenTime[axis], this._tweenDuration[axis]);
                    newValue = this._tweenStart[axis] + Math.floor(this._tweenChange[axis] * ratio);
                }

                var threshold1: number = 0;
                var threshold2: number = -this._overlapSize[axis];
                if (this._headerLockedSize > 0 && this._refreshBarAxis == axis)
                    threshold1 = this._headerLockedSize;
                if (this._footerLockedSize > 0 && this._refreshBarAxis == axis) {
                    var max: number = this._overlapSize[this._refreshBarAxis];
                    if (max == 0)
                        max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
                    else
                        max += this._footerLockedSize;
                    threshold2 = -max;
                }

                if (this._tweening == 2 && this._bouncebackEffect) {
                    if (newValue > 20 + threshold1 && this._tweenChange[axis] > 0
                        || newValue > threshold1 && this._tweenChange[axis] == 0)//开始回弹
                    {
                        this._tweenTime[axis] = 0;
                        this._tweenDuration[axis] = TWEEN_TIME_DEFAULT;
                        this._tweenChange[axis] = -newValue + threshold1;
                        this._tweenStart[axis] = newValue;
                    }
                    else if (newValue < threshold2 - 20 && this._tweenChange[axis] < 0
                        || newValue < threshold2 && this._tweenChange[axis] == 0)//开始回弹
                    {
                        this._tweenTime[axis] = 0;
                        this._tweenDuration[axis] = TWEEN_TIME_DEFAULT;
                        this._tweenChange[axis] = threshold2 - newValue;
                        this._tweenStart[axis] = newValue;
                    }
                }
                else {
                    if (newValue > threshold1) {
                        newValue = threshold1;
                        this._tweenChange[axis] = 0;
                    }
                    else if (newValue < threshold2) {
                        newValue = threshold2;
                        this._tweenChange[axis] = 0;
                    }
                }
            }
            else
                newValue = this._container[axis];

            return newValue;
        }
    }

    var _gestureFlag: number = 0;

    const TWEEN_TIME_GO: number = 0.5; //调用SetPos(ani)时使用的缓动时间
    const TWEEN_TIME_DEFAULT: number = 0.3; //惯性滚动的最小缓动时间
    const PULL_RATIO: number = 0.5; //下拉过顶或者上拉过底时允许超过的距离占显示区域的比例

    var s_vec2: egret.Point = new egret.Point();
    var s_rect: egret.Rectangle = new egret.Rectangle();
    var sEndPos: egret.Point = new egret.Point();
    var sOldChange: egret.Point = new egret.Point();

    function easeFunc(t: number, d: number): number {
        return (t = t / d - 1) * t * t + 1;//cubicOut
    }
}