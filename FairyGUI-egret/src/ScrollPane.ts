
module fairygui {

    export class ScrollPane extends egret.EventDispatcher {
        private _owner: GComponent;
        private _container: egret.DisplayObjectContainer;
        private _maskHolder: egret.DisplayObjectContainer;
        private _maskContentHolder: egret.DisplayObjectContainer;

        private _maskWidth: number = 0;
        private _maskHeight: number = 0;
        private _contentWidth: number = 0;
        private _contentHeight: number = 0;

        private _scrollType: number = 0;
        private _scrollSpeed: number = 0;
        private _mouseWheelSpeed: number = 0;
        private _scrollBarMargin:Margin;
        private _bouncebackEffect: boolean;
        private _touchEffect: boolean;
        private _scrollBarDisplayAuto: boolean;
        private _vScrollNone:boolean;
        private _hScrollNone:boolean;
        
        private _displayOnLeft: boolean;
        private _snapToItem: boolean;
        private _displayInDemand: boolean;
        private _mouseWheelEnabled: boolean;
        private _pageMode: boolean;
        private _pageSizeH: number;
        private _pageSizeV: number;
        private _inertiaDisabled: boolean;

        private _yPerc: number;
        private _xPerc: number;
        private _vScroll: boolean;
        private _hScroll: boolean;
        private _needRefresh: boolean;

        private static _easeTypeFunc: any;
        private _throwTween: ThrowTween;
        private _tweening: number;

        private _time1: number;
        private _time2: number;
        private _y1: number;
        private _y2: number;
        private _yOverlap: number;
        private _yOffset: number;
        private _x1: number;
        private _x2: number;
        private _xOverlap: number;
        private _xOffset: number;

        public _isMouseMoved: boolean;
        private _holdAreaPoint: egret.Point;
        private _isHoldAreaDone: boolean;
        private _aniFlag: boolean;
        private _scrollBarVisible: boolean;

        private _hzScrollBar: GScrollBar;
        private _vtScrollBar: GScrollBar;
        
        public static SCROLL: string = "__scroll";
        
        private static sHelperRect:egret.Rectangle = new egret.Rectangle();

        public constructor(owner: GComponent,
            scrollType: number,
            scrollBarMargin: Margin,
            scrollBarDisplay: number,
            flags: number,
            vtScrollBarRes: string,
            hzScrollBarRes: string) {
            super();
            if(ScrollPane._easeTypeFunc == null)
                ScrollPane._easeTypeFunc = egret.Ease.cubicOut;
            this._throwTween = new ThrowTween();

            this._owner = owner;
            this._container = this._owner._rootContainer;

            this._maskHolder = new egret.DisplayObjectContainer();
            this._maskHolder.scrollRect = new egret.Rectangle();
            this._container.addChild(this._maskHolder);

            this._maskContentHolder = this._owner._container;
            this._maskContentHolder.x = 0;
            this._maskContentHolder.y = 0;
            this._maskHolder.addChild(this._maskContentHolder);
            
            this._scrollType = scrollType;
            this._scrollBarMargin = scrollBarMargin;
            this._bouncebackEffect = UIConfig.defaultScrollBounceEffect;
            this._touchEffect = UIConfig.defaultScrollTouchEffect;
            this._scrollSpeed = UIConfig.defaultScrollSpeed;
            this._mouseWheelSpeed = this._scrollSpeed * 2;
            this._displayOnLeft = (flags & 1) != 0;
            this._snapToItem = (flags & 2) != 0;
            this._displayInDemand = (flags & 4) != 0;
            this._pageMode = (flags & 8) != 0;
            if(flags & 16)
                this._touchEffect = true;
            else if(flags & 32)
                this._touchEffect = false;
            else
                this._touchEffect = UIConfig.defaultScrollTouchEffect;
            if(flags & 64)
                this._bouncebackEffect = true;
            else if(flags & 128)
                this._bouncebackEffect = false;
            else
                this._bouncebackEffect = UIConfig.defaultScrollBounceEffect;
            this._inertiaDisabled = (flags & 256)!=0;
            
            this._xPerc = 0;
            this._yPerc = 0;
            this._aniFlag = true;
            this._scrollBarVisible = true;
            this._mouseWheelEnabled = false;
            this._holdAreaPoint = new egret.Point();
            
            if(scrollBarDisplay == ScrollBarDisplayType.Default)
                scrollBarDisplay = UIConfig.defaultScrollBarDisplay;

            if(scrollBarDisplay != ScrollBarDisplayType.Hidden) {
                if(this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Vertical) {
                    var res: string = vtScrollBarRes ? vtScrollBarRes : UIConfig.verticalScrollBar;
                    if(res) {
                        this._vtScrollBar = <GScrollBar><any> (UIPackage.createObjectFromURL(res));
                        if(!this._vtScrollBar)
                            throw "cannot create scrollbar from " + res;
                        this._vtScrollBar.setScrollPane(this, true);
                        this._container.addChild(this._vtScrollBar.displayObject);
                    }
                }
                if(this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Horizontal) {
                    var res: string = hzScrollBarRes ? hzScrollBarRes : UIConfig.horizontalScrollBar;
                    if(res) {
                        this._hzScrollBar = <GScrollBar><any> (UIPackage.createObjectFromURL(res));
                        if(!this._hzScrollBar)
                            throw "cannot create scrollbar from " + res;
                        this._hzScrollBar.setScrollPane(this, false);
                        this._container.addChild(this._hzScrollBar.displayObject);
                    }
                }

                this._scrollBarDisplayAuto = scrollBarDisplay == ScrollBarDisplayType.Auto;
                if(this._scrollBarDisplayAuto) {
                    this._scrollBarVisible = false;
                    if(this._vtScrollBar)
                        this._vtScrollBar.displayObject.visible = false;
                    if(this._hzScrollBar)
                        this._hzScrollBar.displayObject.visible = false;
                }
            }

            this._contentWidth = 0;
            this._contentHeight = 0;
            this.setSize(owner.width,owner.height,true);

            this._owner.addEventListener(egret.TouchEvent.TOUCH_BEGIN,this.__mouseDown,this);
        }
        
        public get owner(): GComponent {
            return this._owner;
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

        public set scrollSpeed(val: number) {
            this._scrollSpeed = this.scrollSpeed;
            if (this._scrollSpeed == 0)
                this._scrollSpeed = UIConfig.defaultScrollSpeed;
            this._mouseWheelSpeed = this._scrollSpeed * 2;
        }

        public get scrollSpeed(): number {
            return this._scrollSpeed;
        }

        public get snapToItem(): boolean {
            return this._snapToItem;
        }

        public set snapToItem(value: boolean) {
            this._snapToItem = value;
        }

        public get percX(): number {
            return this._xPerc;
        }

        public set percX(sc: number) {
            this.setPercX(sc, false);
        }

        public setPercX(sc: number, ani: boolean= false): void {
            if (sc > 1)
                sc = 1;
            else if (sc < 0)
                sc = 0;
            if (sc != this._xPerc) {
                this._xPerc = sc;
                this.posChanged(ani);
            }
        }

        public get percY(): number {
            return this._yPerc;
        }

        public set percY(sc: number) {
            this.setPercY(sc, false);
        }

        public setPercY(sc: number, ani: boolean= false): void {
            if (sc > 1)
                sc = 1;
            else if (sc < 0)
                sc = 0;
            if (sc != this._yPerc) {
                this._yPerc = sc;
                this.posChanged(ani);
            }
        }

        public get posX(): number {
            return this._xPerc * Math.max(0, this.contentWidth - this._maskWidth);
        }

        public set posX(val: number) {
            this.setPosX(val, false);
        }

        public setPosX(val: number, ani: boolean= false): void {
            if(this._contentWidth > this._maskWidth)
                this.setPercX(val / (this._contentWidth - this._maskWidth), ani);
            else
                this.setPercX(0, ani);
        }

        public get posY(): number {
            return this._yPerc * Math.max(0,this._contentHeight - this._maskHeight);
        }

        public set posY(val: number) {
            this.setPosY(val, false);
        }

        public setPosY(val: number, ani: boolean= false): void {
            if(this._contentHeight > this._maskHeight)
                this.setPercY(val / (this._contentHeight - this._maskHeight), ani);
            else
                this.setPercY(0, ani);
        }

        public get isBottomMost(): boolean {
            return this._yPerc == 1 || this._maskHeight <= this._maskHeight;
        }

        public get isRightMost(): boolean {
            return this._xPerc == 1 || this._contentWidth <= this._maskWidth;
        }
        
        public get currentPageX(): number {
            return this._pageMode ? Math.floor(this.posX / this._pageSizeH) : 0;
        }

        public set currentPageX(value: number) {
            if(this._pageMode && this._hScroll)
                this.setPosX(value * this._pageSizeH,false);
        }

        public get currentPageY(): number {
            return this._pageMode ? Math.floor(this.posY / this._pageSizeV) : 0;
        }

        public set currentPageY(value: number) {
            if(this._pageMode && this._hScroll)
                this.setPosY(value * this._pageSizeV,false);
        }

        public get contentWidth(): number {
            return this._contentWidth;
        }

        public get contentHeight(): number {
            return this._contentHeight;
        }

        public get viewWidth(): number {
            return this._maskWidth;
        }

        public set viewWidth(value: number) {
            value = value + this._owner.margin.left + this._owner.margin.right;
            if (this._vtScrollBar != null)
                value += this._vtScrollBar.width;
            this._owner.width = value;
        }

        public get viewHeight(): number {
            return this._maskHeight;
        }

        public set viewHeight(value: number) {
            value = value + this._owner.margin.top + this._owner.margin.bottom;
            if (this._hzScrollBar != null)
                value += this._hzScrollBar.height;
            this._owner.height = value;
        }

        private getDeltaX(move: number): number {
            return move / (this._contentWidth - this._maskWidth);
        }

        private getDeltaY(move: number): number {
            return move / (this._contentHeight - this._maskHeight);
        }

        public scrollTop(ani: boolean= false): void {
            this.setPercY(0, ani);
        }

        public scrollBottom(ani: boolean= false): void {
            this.setPercY(1, ani);
        }

        public scrollUp(speed: number= 1, ani: boolean= false): void {
            this.setPercY(this._yPerc - this.getDeltaY(this._scrollSpeed * speed), ani);
        }

        public scrollDown(speed: number= 1, ani: boolean= false): void {
            this.setPercY(this._yPerc + this.getDeltaY(this._scrollSpeed * speed), ani);
        }

        public scrollLeft(speed: number= 1, ani: boolean= false): void {
            this.setPercX(this._xPerc - this.getDeltaX(this._scrollSpeed * speed), ani);
        }

        public scrollRight(speed: number= 1, ani: boolean= false): void {
            this.setPercX(this._xPerc + this.getDeltaX(this._scrollSpeed * speed), ani);
        }

        public scrollToView(target: any, ani: boolean= false, setFirst: boolean = false): void {
            this._owner.ensureBoundsCorrect();
            if(this._needRefresh)
                this.refresh();
                
            var rect:egret.Rectangle;
            if(target instanceof GObject)
            {
                if(target.parent != this._owner) {
                    target.parent.localToGlobalRect(target.x,target.y,
                        target.width,target.height,ScrollPane.sHelperRect);
                    rect = this._owner.globalToLocalRect(ScrollPane.sHelperRect.x,ScrollPane.sHelperRect.y,
                        ScrollPane.sHelperRect.width,ScrollPane.sHelperRect.height,ScrollPane.sHelperRect);
                }
                else {
                    rect = ScrollPane.sHelperRect;
                    rect.setTo(target.x,target.y,target.width,target.height);
                }
            }
			else
                rect = <egret.Rectangle>target;

            if (this._vScroll) {
                var top: number = this.posY;
                var bottom: number = top + this._maskHeight;
                if(setFirst || rect.y < top || rect.height >= this._maskHeight) {
                    if(this._pageMode)
                        this.setPosY(Math.floor(rect.y / this._pageSizeV) * this._pageSizeV, ani);
                    else
                        this.setPosY(rect.y, ani);
                }
                else if(rect.y + rect.height > bottom) {
                    if(this._pageMode)
                        this.setPosY(Math.floor(rect.y / this._pageSizeV) * this._pageSizeV,ani);
                    else if(rect.height <= this._maskHeight/2)
                        this.setPosY(rect.y + rect.height * 2 - this._maskHeight, ani);
                    else
                        this.setPosY(rect.y + rect.height - this._maskHeight, ani);
                }
            }
            if (this._hScroll) {
                var left: number =  this.posX;
                var right: number = left + this._maskWidth;
                if(setFirst || rect.x < left || rect.width >= this._maskWidth) {
                    if(this._pageMode)
                        this.setPosX(Math.floor(rect.x / this._pageSizeH) * this._pageSizeH,ani);
                    else
                        this.setPosX(rect.x, ani);
                }
                else if(rect.x + rect.width > right) {
                    if(this._pageMode)
                        this.setPosX(Math.floor(rect.x / this._pageSizeH) * this._pageSizeH,ani);
                    else if(rect.width <= this._maskWidth/2)
                        this.setPosX(rect.x + rect.width * 2 - this._maskWidth, ani);
                    else
                        this.setPosX(rect.x + rect.width - this._maskWidth, ani);
                }                
            }
            
            if(!ani && this._needRefresh) 
                this.refresh();             
        }
        
        public isChildInView(obj: GObject): boolean {
            var dist:number;
            if(this._vScroll) {
                dist = obj.y + this._maskContentHolder.y;
                if(dist < -obj.height - 20 || dist > this._maskHeight + 20)
                    return false;
            }

            if(this._hScroll) {
                dist = obj.x + this._maskContentHolder.x;
                if(dist < -obj.width - 20 || dist > this._maskWidth + 20)
                    return false;
            }

            return true;
        }

        public setSize(aWidth: number,aHeight: number,noRefresh: Boolean = false): void {
            if(this._displayOnLeft && this._vtScrollBar)
                this._maskHolder.x = Math.floor(this._owner.margin.left + this._vtScrollBar.width);
            else
                this._maskHolder.x = this._owner.margin.left;
            this._maskHolder.y = this._owner.margin.top;
            
            if (this._hzScrollBar) {
                this._hzScrollBar.y = aHeight - this._hzScrollBar.height;
                if(this._vtScrollBar && !this._vScrollNone) {
                    this._hzScrollBar.width = aWidth - this._vtScrollBar.width - this._scrollBarMargin.left - this._scrollBarMargin.right;
                    if(this._displayOnLeft)
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
                if(this._hzScrollBar)
                    this._vtScrollBar.height = aHeight - this._hzScrollBar.height - this._scrollBarMargin.top - this._scrollBarMargin.bottom;
                else
                    this._vtScrollBar.height = aHeight - this._scrollBarMargin.top - this._scrollBarMargin.bottom;
                this._vtScrollBar.y = this._scrollBarMargin.top;
            }
            
            this._maskWidth = aWidth;
            this._maskHeight = aHeight;
            if(this._hzScrollBar && !this._hScrollNone)
                this._maskHeight -= this._hzScrollBar.height;
            if(this._vtScrollBar && !this._vScrollNone)
                this._maskWidth -= this._vtScrollBar.width;
            this._maskWidth -= (this._owner.margin.left + this._owner.margin.right);
            this._maskHeight -= (this._owner.margin.top + this._owner.margin.bottom);

            this._maskWidth = Math.max(1,this._maskWidth);
            this._maskHeight = Math.max(1,this._maskHeight);
            this._pageSizeH = this._maskWidth;
            this._pageSizeV = this._maskHeight;
            
            this.handleSizeChanged();
            if(!noRefresh)
                this.posChanged(false);
        }

        public setContentSize(aWidth: number, aHeight: number): void {
            if (this._contentWidth == aWidth && this._contentHeight == aHeight)
                return;

            this._contentWidth = aWidth;
            this._contentHeight = aHeight;
            this.handleSizeChanged();
            this._aniFlag = false;
            this.refresh();
        }
        
        private handleSizeChanged(): void {
            if(this._displayInDemand) {
                if(this._vtScrollBar) {
                    if(this._contentHeight <= this._maskHeight) {
                        if(!this._vScrollNone) {
                            this._vScrollNone = true;
                            this._maskWidth += this._vtScrollBar.width;
                        }
                    }
                    else {
                        if(this._vScrollNone) {
                            this._vScrollNone = false;
                            this._maskWidth -= this._vtScrollBar.width;
                        }
                    }
                }
                if(this._hzScrollBar) {
                    if(this._contentWidth <= this._maskWidth) {
                        if(!this._hScrollNone) {
                            this._hScrollNone = true;
                            this._maskHeight += this._vtScrollBar.height;
                        }
                    }
                    else {
                        if(this._hScrollNone) {
                            this._hScrollNone = false;
                            this._maskHeight -= this._vtScrollBar.height;
                        }
                    }
                }
            }

            if(this._vtScrollBar) {
                if(this._maskHeight < this._vtScrollBar.minSize)
                    this._vtScrollBar.displayObject.visible = false;
                else {
                    this._vtScrollBar.displayObject.visible = this._scrollBarVisible && !this._vScrollNone;
                    if(this._contentHeight == 0)
                        this._vtScrollBar.displayPerc = 0;
                    else
                        this._vtScrollBar.displayPerc = Math.min(1,this._maskHeight / this._contentHeight);
                }
            }
            if(this._hzScrollBar) {
                if(this._maskWidth < this._hzScrollBar.minSize)
                    this._hzScrollBar.displayObject.visible = false;
                else {
                    this._hzScrollBar.displayObject.visible = this._scrollBarVisible && !this._hScrollNone;
                    if(this._contentWidth == 0)
                        this._hzScrollBar.displayPerc = 0;
                    else
                        this._hzScrollBar.displayPerc = Math.min(1,this._maskWidth / this._contentWidth);
                }
            }

            var rect:egret.Rectangle = this._maskHolder.scrollRect;
            rect.setTo(0,0,this._maskWidth,this._maskHeight);
            this._maskHolder.scrollRect = rect;
                
            this._xOverlap = Math.max(0, this._contentWidth - this._maskWidth);
            this._yOverlap = Math.max(0, this._contentHeight - this._maskHeight);
                    
            switch(this._scrollType) {
                case ScrollType.Both:

                    if(this._contentWidth > this._maskWidth && this._contentHeight <= this._maskHeight) {
                        this._hScroll = true;
                        this._vScroll = false;
                    }
                    else if(this._contentWidth <= this._maskWidth && this._contentHeight > this._maskHeight) {
                        this._hScroll = false;
                        this._vScroll = true;
                    }
                    else if(this._contentWidth > this._maskWidth && this._contentHeight > this._maskHeight) {
                        this._hScroll = true;
                        this._vScroll = true;
                    }
                    else {
                        this._hScroll = false;
                        this._vScroll = false;
                    }
                    break;

                case ScrollType.Vertical:

                    if(this._contentHeight > this._maskHeight) {
                        this._hScroll = false;
                        this._vScroll = true;
                    }
                    else {
                        this._hScroll = false;
                        this._vScroll = false;
                    }
                    break;

                case ScrollType.Horizontal:

                    if(this._contentWidth > this._maskWidth) {
                        this._hScroll = true;
                        this._vScroll = false;
                    }
                    else {
                        this._hScroll = false;
                        this._vScroll = false;
                    }
                    break;
            }
        }

        private posChanged(ani: boolean): void {
            if (this._aniFlag)
                this._aniFlag = ani;

            this._needRefresh = true;
            GTimers.inst.callLater(this.refresh, this);
            
            //如果在甩手指滚动过程中用代码重新设置滚动位置，要停止滚动
            if(this._tweening == 2) {
                this.killTweens();
            }
        }

        private refresh(): void {
            this._needRefresh = false;
            GTimers.inst.remove(this.refresh, this);
            var contentYLoc: number = 0;
            var contentXLoc: number = 0;

            if (this._vScroll)
                contentYLoc = this._yPerc * (this._contentHeight - this._maskHeight);
            if (this._hScroll)
                contentXLoc = this._xPerc * (this._contentWidth - this._maskWidth);

            if(this._pageMode) {
                var page: number;
                var delta: number;
                if(this._vScroll && this._yPerc != 1 && this._yPerc != 0) {
                    page = Math.floor(contentYLoc / this._pageSizeV);
                    delta = contentYLoc - page * this._pageSizeV;
                    if(delta > this._pageSizeV / 2)
                        page++;
                    contentYLoc = page * this._pageSizeV;
                    if(contentYLoc > this._contentHeight - this._maskHeight) {
                        contentYLoc = this._contentHeight - this._maskHeight;
                        this._yPerc = 1;
                    }
                    else
                        this._yPerc = contentYLoc / (this._contentHeight - this._maskHeight);
                }

                if(this._hScroll && this._xPerc != 1 && this._xPerc != 0) {
                    page = Math.floor(contentXLoc / this._pageSizeH);
                    delta = contentXLoc - page * this._pageSizeH;
                    if(delta > this._pageSizeH / 2)
                        page++;
                    contentXLoc = page * this._pageSizeH;
                    if(contentXLoc > this._contentWidth - this._maskWidth) {
                        contentXLoc = this._contentWidth - this._maskWidth;
                        this._xPerc = 1;
                    }
                    else
                        this._xPerc = contentXLoc / (this._contentWidth - this._maskWidth);
                }
            }
            else if(this._snapToItem) {
                var pt: egret.Point = this._owner.getSnappingPosition(contentXLoc,contentYLoc,ScrollPane.sHelperPoint);
                if(this._xPerc != 1 && pt.x != contentXLoc) {
                    this._xPerc = pt.x / (this._contentWidth - this._maskWidth);
                    if(this._xPerc > 1)
                        this._xPerc = 1;
                    contentXLoc = this._xPerc * (this._contentWidth - this._maskWidth);
                }
                if(this._yPerc != 1 && pt.y != contentYLoc) {
                    this._yPerc = pt.y / (this._contentHeight - this._maskHeight);
                    if(this._yPerc > 1)
                        this._yPerc = 1;
                    contentYLoc = this._yPerc * (this._contentHeight - this._maskHeight);
                }
            }
            
            this.refresh2(contentXLoc,contentYLoc);
            this.dispatchEventWith(ScrollPane.SCROLL,false);
            if(this._needRefresh) //user change scroll pos in on scroll
            {
                this._needRefresh = false;
                GTimers.inst.remove(this.refresh, this);

                if(this._hScroll)
                    contentXLoc = this._xPerc * (this._contentWidth - this._maskWidth);
                if(this._vScroll)
                    contentYLoc = this._yPerc * (this._contentHeight - this._maskHeight);
                this.refresh2(contentXLoc,contentYLoc);
            }

            this._aniFlag = true;
        }
        
        private refresh2(contentXLoc:number, contentYLoc:number) {
            contentXLoc = Math.floor(contentXLoc);
            contentYLoc = Math.floor(contentYLoc);

            if(this._aniFlag && !this._isMouseMoved) {
                var toX: number = this._maskContentHolder.x;
                var toY: number = this._maskContentHolder.y;
                if(this._vScroll) {
                    toY = -contentYLoc;
                }
                else {
                    if(this._maskContentHolder.y != 0)
                        this._maskContentHolder.y = 0;
                }
                if(this._hScroll) {
                    toX = -contentXLoc;
                }
                else {
                    if(this._maskContentHolder.x != 0)
                        this._maskContentHolder.x = 0;
                }

                if(toX != this._maskContentHolder.x || toY != this._maskContentHolder.y) {
                    this.killTweens();

                    this._maskHolder.touchEnabled = false;
                    this._tweening = 1;

                    egret.Tween.get(this._maskContentHolder,{ onChange: this.__tweenUpdate,onChangeObj: this })
                        .to({ x: toX,y: toY, },500,ScrollPane._easeTypeFunc)
                        .call(this.__tweenComplete,this);
                }
            }
            else {
                this.killTweens();
                

                //如果在拖动的过程中Refresh，这里要进行处理，保证拖动继续正常进行
                if(this._isMouseMoved) {
                    this._xOffset += this._maskContentHolder.x - (-contentXLoc);
                    this._yOffset += this._maskContentHolder.y - (-contentYLoc);
                }

                this._maskContentHolder.y = -contentYLoc;
                this._maskContentHolder.x = -contentXLoc;
				
                //如果在拖动的过程中Refresh，这里要进行处理，保证手指离开是滚动正常进行
                if(this._isMouseMoved) {
                    this._y1 = this._y2 = this._maskContentHolder.y;
                    this._x1 = this._x2 = this._maskContentHolder.x;
                }

                if(this._vtScrollBar)
                    this._vtScrollBar.scrollPerc = this._yPerc;
                if(this._hzScrollBar)
                    this._hzScrollBar.scrollPerc = this._xPerc;
            }
        }
        
        private killTweens(): void {
            if(this._tweening == 1) {
                this._tweening = 0;
                egret.Tween.pauseTweens(this._maskContentHolder);
            }
            else if(this._tweening == 2) {
                this._tweening = 0;
                egret.Tween.pauseTweens(this._throwTween);
                this._throwTween.value = 1;
                this.__tweenUpdate2();
                this.__tweenComplete2();
            }           
        }

        private calcYPerc(): number {
            if (!this._vScroll)
                return 0;

            var diff: number = this._contentHeight - this._maskHeight;
            var my: number = this._maskContentHolder.y;

            var currY: number;
            if(my > 0)
                currY = 0;
            else if(-my > diff)
                currY = diff;
            else
                currY = -my;

            return currY / diff;
        }

        private calcXPerc(): number {
            if (!this._hScroll)
                return 0;

            var diff: number = this._contentWidth - this._maskWidth;

            var currX: number;
            var mx: number = this._maskContentHolder.x;
            if (mx > 0)
                currX = 0;
            else if (-mx > diff)
                currX = diff;
            else
                currX = -mx;

            return currX / diff;
        }

        private onScrolling(): void {
            if (this._vtScrollBar) {
                this._vtScrollBar.scrollPerc = this.calcYPerc();
                if (this._scrollBarDisplayAuto)
                    this.showScrollBar(true);
            }
            if (this._hzScrollBar) {
                this._hzScrollBar.scrollPerc = this.calcXPerc();
                if (this._scrollBarDisplayAuto)
                    this.showScrollBar(true);
            }
        }

        private onScrollEnd(): void {
            if (this._vtScrollBar) {
                if (this._scrollBarDisplayAuto)
                    this.showScrollBar(false);
            }
            if (this._hzScrollBar) {
                if (this._scrollBarDisplayAuto)
                    this.showScrollBar(false);
            }
        }

        private static sHelperPoint: egret.Point = new egret.Point();
        private __mouseDown(evt: egret.TouchEvent): void {
            if (!this._touchEffect)
                return;
                
            this.killTweens();
            
            this._container.globalToLocal(evt.stageX, evt.stageY, ScrollPane.sHelperPoint);

            this._x1 = this._x2 = this._maskContentHolder.x;
            this._y1 = this._y2 = this._maskContentHolder.y;
            
            this._xOffset = ScrollPane.sHelperPoint.x - this._maskContentHolder.x;
            this._yOffset = ScrollPane.sHelperPoint.y - this._maskContentHolder.y;

            this._time1 = this._time2 = egret.getTimer();
            this._holdAreaPoint.x = ScrollPane.sHelperPoint.x;
            this._holdAreaPoint.y = ScrollPane.sHelperPoint.y;
            this._isHoldAreaDone = false;
            this._isMouseMoved = false;

            this._owner.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__touchMove, this);
            this._owner.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.__touchEnd, this);
            this._owner.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_TAP,this.__touchTap,this);
        }

        private __touchMove(evt: egret.TouchEvent): void {
            var sensitivity: number = UIConfig.touchScrollSensitivity;
                
            var diff: number;
            var sv: boolean, sh: boolean, st: boolean;

            this._container.globalToLocal(evt.stageX, evt.stageY, ScrollPane.sHelperPoint);

            if (this._scrollType == ScrollType.Vertical) {
                if (!this._isHoldAreaDone) {
                    diff = Math.abs(this._holdAreaPoint.y - ScrollPane.sHelperPoint.y);
                    if(diff < sensitivity)
                        return;
                }

                sv = true;
            }
            else if (this._scrollType == ScrollType.Horizontal) {
                if (!this._isHoldAreaDone) {
                    diff = Math.abs(this._holdAreaPoint.x - ScrollPane.sHelperPoint.x);
                    if(diff < sensitivity)
                        return;
                }

                sh = true;
            }
            else {
                if (!this._isHoldAreaDone) {
                    diff = Math.abs(this._holdAreaPoint.y - ScrollPane.sHelperPoint.y);
                    if(diff < sensitivity) {
                        diff = Math.abs(this._holdAreaPoint.x - ScrollPane.sHelperPoint.x);
                        if(diff < sensitivity)
                            return;
                    }
                }

                sv = sh = true;
            }

            var t: number = egret.getTimer();
            if (t - this._time2 > 50) {
                this._time2 = this._time1;
                this._time1 = t;
                st = true;
            }

            if (sv) {
                var y: number = Math.floor(ScrollPane.sHelperPoint.y - this._yOffset);
                if (y > 0) {
                    if (!this._bouncebackEffect || this._inertiaDisabled)
                        this._maskContentHolder.y = 0;
                    else
                        this._maskContentHolder.y = Math.floor(y * 0.5);
                }
                else if (y < -this._yOverlap || this._inertiaDisabled) {
                    if (!this._bouncebackEffect)
                        this._maskContentHolder.y = -Math.floor(this._yOverlap);
                    else
                        this._maskContentHolder.y = Math.floor((y - this._yOverlap) * 0.5);
                }
                else {
                    this._maskContentHolder.y = y;
                }

                if (st) {
                    this._y2 = this._y1;
                    this._y1 = this._maskContentHolder.y;
                }

                this._yPerc = this.calcYPerc();
            }

            if (sh) {
                var x: number = Math.floor(ScrollPane.sHelperPoint.x - this._xOffset);
                if (x > 0) {
                    if (!this._bouncebackEffect || this._inertiaDisabled)
                        this._maskContentHolder.x = 0;
                    else
                        this._maskContentHolder.x = Math.floor(x * 0.5);
                }
                else if (x < 0 - this._xOverlap || this._inertiaDisabled) {
                    if (!this._bouncebackEffect)
                        this._maskContentHolder.x = -Math.floor(this._xOverlap);
                    else
                        this._maskContentHolder.x = Math.floor((x - this._xOverlap) * 0.5);
                }
                else {
                    this._maskContentHolder.x = x;
                }

                if (st) {
                    this._x2 = this._x1;
                    this._x1 = this._maskContentHolder.x;
                }

                this._xPerc = this.calcXPerc();
            }

            this._maskHolder.touchEnabled = false;
            this._isHoldAreaDone = true;
            this._isMouseMoved = true;
            this.onScrolling();
            this.dispatchEventWith(ScrollPane.SCROLL,false);
        }

        private __touchEnd(evt: egret.TouchEvent): void {
            this._owner.displayObject.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE,this.__touchMove,this);
            this._owner.displayObject.stage.removeEventListener(egret.TouchEvent.TOUCH_END,this.__touchEnd,this);
            this._owner.displayObject.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.__touchTap,this);
            
            if (!this._touchEffect) {
                this._isMouseMoved = false;
                return;
            }

            if (!this._isMouseMoved)
                return;
                
            if(this._inertiaDisabled)
                return;

            var time: number = (egret.getTimer() - this._time2) / 1000;
            if (time == 0)
                time = 0.001;
            var yVelocity: number = (this._maskContentHolder.y - this._y2) / time;
            var xVelocity: number = (this._maskContentHolder.x - this._x2) / time;
            var duration: number = 0.3;

            this._throwTween.start.x = this._maskContentHolder.x;
            this._throwTween.start.y = this._maskContentHolder.y;

            var change1: egret.Point = this._throwTween.change1;
            var change2: egret.Point = this._throwTween.change2;
            var endX: number = 0;
            var endY: number = 0;
            var page: number = 0;
            var delta: number = 0;
            
            if (this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Horizontal) {
                change1.x = ThrowTween.calculateChange(xVelocity, duration);
                change2.x = 0;
                endX = this._maskContentHolder.x + change1.x;
                
                if(this._pageMode) {
                    page = Math.floor(-endX / this._pageSizeH);
                    delta = -endX - page * this._pageSizeH;
                    //页面吸附策略
                    if(change1.x > this._pageSizeH) {
                        //如果翻页数量超过1，则需要超过页面的一半，才能到下一页
                        if(delta >= this._pageSizeH / 2)
                            page++;
                    }
                    else if(endX < this._maskContentHolder.x) {
                        if(delta >= this._pageSizeH / 2)
                            page++;
                    }
                    endX = -page * this._pageSizeH;
                    if(endX < this._maskWidth - this._contentWidth)
                        endX = this._maskWidth - this._contentWidth;

                    change1.x = endX - this._maskContentHolder.x;
                }
            }
            else
                change1.x = change2.x = 0;

            if (this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Vertical) {
                change1.y = ThrowTween.calculateChange(yVelocity, duration);
                change2.y = 0;
                endY = this._maskContentHolder.y + change1.y;
                
                if(this._pageMode) {
                    page = Math.floor(-endY / this._pageSizeV);
                    delta = -endY - page * this._pageSizeV;
                    //页面吸附策略
                    if(change1.y > this._pageSizeV) {
                        if(delta >= this._pageSizeV / 2)
                            page++;
                    }
                    else if(endY < this._maskContentHolder.y)
                    {
                        if(delta >= this._pageSizeV / 2)
                            page++;
                    }
                    endY = -page * this._pageSizeV;
                    if(endY < this._maskHeight - this._contentHeight)
                        endY = this._maskHeight - this._contentHeight;

                    change1.y = endY - this._maskContentHolder.y;
                }
            }
            else
                change1.y = change2.y = 0;

            if (this._snapToItem) {
                endX = -endX;
                endY = -endY;
                var pt: egret.Point = this._owner.getSnappingPosition(endX,endY,ScrollPane.sHelperPoint);
                endX = -pt.x;
                endY = -pt.y;
                change1.x = endX - this._maskContentHolder.x;
                change1.y = endY - this._maskContentHolder.y;
            }
            
            if(this._bouncebackEffect) {
                if(endX > 0)
                    change2.x = 0 - this._maskContentHolder.x - change1.x;
                else if(endX < -this._xOverlap)
                    change2.x = -this._xOverlap - this._maskContentHolder.x - change1.x;

                if(endY > 0)
                    change2.y = 0 - this._maskContentHolder.y - change1.y;
                else if(endY < -this._yOverlap)
                    change2.y = -this._yOverlap - this._maskContentHolder.y - change1.y;
            }
            else {
                if(endX > 0)
                    change1.x = 0 - this._maskContentHolder.x;
                else if(endX < -this._xOverlap)
                    change1.x = -this._xOverlap - this._maskContentHolder.x;

                if(endY > 0)
                    change1.y = 0 - this._maskContentHolder.y;
                else if(endY < -this._yOverlap)
                    change1.y = -this._yOverlap - this._maskContentHolder.y;
            }

            this._throwTween.value = 0;
            this._throwTween.change1 = change1;
            this._throwTween.change2 = change2;
            
            this.killTweens();
            this._tweening = 2;

            egret.Tween.get(this._throwTween,{ onChange: this.__tweenUpdate2,onChangeObj: this })
                .to({ value: 1 },duration * 1000,ScrollPane._easeTypeFunc)
                .call(this.__tweenComplete2,this);
        }
        
        private __touchTap(evt: egret.TouchEvent): void {
            this._isMouseMoved = false;
        }

        private __rollOver(evt: egret.TouchEvent): void {
            this.showScrollBar(true);
        }

        private __rollOut(evt: egret.TouchEvent): void {
            this.showScrollBar(false);
        }

        private showScrollBar(val: boolean): void {
            if (val) {
                this.__showScrollBar(true);
                GTimers.inst.remove(this.__showScrollBar, this);
            }
            else
                GTimers.inst.add(500, 1, this.__showScrollBar, this, val);
        }

        private __showScrollBar(val: boolean): void {
            this._scrollBarVisible = val && this._maskWidth > 0 && this._maskHeight > 0;
            if (this._vtScrollBar)
                this._vtScrollBar.displayObject.visible = this._scrollBarVisible && !this._vScrollNone;
            if (this._hzScrollBar)
                this._hzScrollBar.displayObject.visible = this._scrollBarVisible && !this._hScrollNone;
        }

        private __tweenUpdate(): void {
            this.onScrolling();
        }

        private __tweenComplete(): void {
            this._tweening = 0;
            this._maskHolder.touchEnabled = true;
            this.onScrollEnd();
        }

        private __tweenUpdate2(): void {
            this._throwTween.update(this._maskContentHolder);

            if (this._scrollType == ScrollType.Vertical)
                this._yPerc = this.calcYPerc();
            else if (this._scrollType == ScrollType.Horizontal)
                this._xPerc = this.calcXPerc();
            else {
                this._yPerc = this.calcYPerc();
                this._xPerc = this.calcXPerc();
            }

            this.onScrolling();
            this.dispatchEventWith(ScrollPane.SCROLL,false);
        }

        private __tweenComplete2(): void {
            if(this._tweening==0)
                return;
                
            this._tweening = 0;
            if (this._scrollType == ScrollType.Vertical)
                this._yPerc = this.calcYPerc();
            else if (this._scrollType == ScrollType.Horizontal)
                this._xPerc = this.calcXPerc();
            else {
                this._yPerc = this.calcYPerc();
                this._xPerc = this.calcXPerc();
            }

            this._maskHolder.touchEnabled = true;
            this.onScrollEnd();
            this.dispatchEventWith(ScrollPane.SCROLL,false);
        }
    }


    class ThrowTween {
        public value: number;
        public start: egret.Point;
        public change1: egret.Point;
        public change2: egret.Point;

        private static checkpoint: number = 0.05;

        public constructor() {
            this.start = new egret.Point();
            this.change1 = new egret.Point();
            this.change2 = new egret.Point();
        }

        public update(obj: egret.DisplayObject): void {
            obj.x = Math.floor(this.start.x + this.change1.x * this.value + this.change2.x * this.value * this.value);
            obj.y = Math.floor(this.start.y + this.change1.y * this.value + this.change2.y * this.value * this.value);
        }

        public static calculateChange(velocity: number, duration: number): number {
            return (duration * ThrowTween.checkpoint * velocity) / ThrowTween.easeOutCubic(ThrowTween.checkpoint, 0, 1, 1);
        }
        public static easeOutCubic(t: number, b: number, c: number, d: number): number {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        }
    }
}