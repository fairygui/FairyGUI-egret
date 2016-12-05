
module fairygui {

    export class ScrollPane extends egret.EventDispatcher {
        private _owner: GComponent;
        private _maskContainer: egret.DisplayObjectContainer;
        private _container: egret.DisplayObjectContainer;

        private _viewWidth: number = 0;
        private _viewHeight: number = 0;
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
        private _xPos: number;
        private _yPos: number;
        private _xOverlap: number;
        private _yOverlap: number;

        private static _easeTypeFunc: any;
        private _throwTween: ThrowTween;
        private _tweening: number;
        private _tweener: egret.Tween;

        private _time1: number;
        private _time2: number;
        private _y1: number;
        private _y2: number;
        private _xOffset: number;
        private _yOffset: number;
        private _x1: number;
        private _x2: number;

        private _needRefresh: boolean;
        private _holdAreaPoint: egret.Point;
        private _isHoldAreaDone: boolean;
        private _aniFlag: number;
        private _scrollBarVisible: boolean;

        private _hzScrollBar: GScrollBar;
        private _vtScrollBar: GScrollBar;

        public isDragged: boolean;
        public static draggingPane:ScrollPane;
		private static _gestureFlag:number = 0;
        
        public static SCROLL: string = "__scroll";
        public static SCROLL_END: string = "__scrollEnd";
    	public static PULL_DOWN_RELEASE:string = "pullDownRelease";
		public static PULL_UP_RELEASE:string = "pullUpRelease";

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

            this._maskContainer = new egret.DisplayObjectContainer();
            this._owner._rootContainer.addChild(this._maskContainer);

            this._container = this._owner._container;
            this._container.x = 0;
            this._container.y = 0;
            this._maskContainer.addChild(this._container);
            
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
            if((flags & 512) == 0)
				this._maskContainer.scrollRect = new egret.Rectangle();

            this._xPerc = 0;
            this._yPerc = 0;
            this._xPos = 0;
            this._yPos = 0;
            this._xOverlap = 0;
            this._yOverlap = 0;
            this._aniFlag = 0;
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
                        this._owner._rootContainer.addChild(this._vtScrollBar.displayObject);
                    }
                }
                if(this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Horizontal) {
                    var res: string = hzScrollBarRes ? hzScrollBarRes : UIConfig.horizontalScrollBar;
                    if(res) {
                        this._hzScrollBar = <GScrollBar><any> (UIPackage.createObjectFromURL(res));
                        if(!this._hzScrollBar)
                            throw "cannot create scrollbar from " + res;
                        this._hzScrollBar.setScrollPane(this, false);
                        this._owner._rootContainer.addChild(this._hzScrollBar.displayObject);
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
            this.setSize(owner.width,owner.height);

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

        public set percX(value: number) {
            this.setPercX(value, false);
        }

        public setPercX(value: number, ani: boolean= false): void {
	        this._owner.ensureBoundsCorrect();

			value = ToolSet.clamp01(value);
			if(value != this._xPerc)
			{
				this._xPerc = value;
				this._xPos = this._xPerc*this._xOverlap;
				this.posChanged(ani);
			}
        }

        public get percY(): number {
            return this._yPerc;
        }

        public set percY(value: number) {
            this.setPercY(value, false);
        }

        public setPercY(value: number, ani: boolean = false): void {
            this._owner.ensureBoundsCorrect();
			
			value = ToolSet.clamp01(value);
			if(value != this._yPerc)
			{
				this._yPerc = value;
				this._yPos = this._yPerc*this._yOverlap;
				this.posChanged(ani);
			}
        }

        public get posX(): number {
            return this._xPos;
        }

        public set posX(value: number) {
            this.setPosX(value, false);
        }

        public setPosX(value: number, ani: boolean = false): void {
            this._owner.ensureBoundsCorrect();

            value = ToolSet.clamp(value, 0, this._xOverlap);
	        if(value!=this._xPos)
			{
				this._xPos = value;
				this._xPerc = this._xOverlap==0?0:this._xPos/this._xOverlap;
				
				this.posChanged(ani);
			}
        }

        public get posY(): number {
            return this._yPos;
        }

        public set posY(value: number) {
            this.setPosY(value, false);
        }

        public setPosY(value: number, ani: boolean= false): void {
            this._owner.ensureBoundsCorrect();

            value = ToolSet.clamp(value, 0, this._yOverlap);
            if(value!=this._yPos)
			{
				this._yPos = value;
				this._yPerc = this._yOverlap==0?0:this._yPos/this._yOverlap;
				
				this.posChanged(ani);
			}
        }

        public get isBottomMost(): boolean {
            return this._yPerc == 1 || this._yOverlap==0;
        }

        public get isRightMost(): boolean {
            return this._xPerc == 1 || this._xOverlap==0;
        }
        
        public get currentPageX(): number {
            return this._pageMode ? Math.floor(this.posX / this._pageSizeH) : 0;
        }

        public set currentPageX(value: number) {
            if(this._pageMode && this._xOverlap>0)
                this.setPosX(value * this._pageSizeH,false);
        }

        public get currentPageY(): number {
            return this._pageMode ? Math.floor(this.posY / this._pageSizeV) : 0;
        }

        public set currentPageY(value: number) {
            if(this._pageMode && this._yOverlap>0)
                this.setPosY(value * this._pageSizeV,false);
        }

        public get scrollingPosX():number
		{
			return ToolSet.clamp(-this._container.x, 0, this._xOverlap);
		}
		
		public get scrollingPosY():number
		{
			return ToolSet.clamp(-this._container.y, 0, this._yOverlap);
		}

        public get contentWidth(): number {
            return this._contentWidth;
        }

        public get contentHeight(): number {
            return this._contentHeight;
        }

        public get viewWidth(): number {
            return this._viewWidth;
        }

        public set viewWidth(value: number) {
            value = value + this._owner.margin.left + this._owner.margin.right;
            if (this._vtScrollBar != null)
                value += this._vtScrollBar.width;
            this._owner.width = value;
        }

        public get viewHeight(): number {
            return this._viewHeight;
        }

        public set viewHeight(value: number) {
            value = value + this._owner.margin.top + this._owner.margin.bottom;
            if (this._hzScrollBar != null)
                value += this._hzScrollBar.height;
            this._owner.height = value;
        }

        private getDeltaX(move: number): number {
            return move / (this._contentWidth - this._viewWidth);
        }

        private getDeltaY(move: number): number {
            return move / (this._contentHeight - this._viewHeight);
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

            if (this._yOverlap>0) {
                var top: number = this.posY;
                var bottom: number = top + this._viewHeight;
                if(setFirst || rect.y < top || rect.height >= this._viewHeight) {
                    if(this._pageMode)
                        this.setPosY(Math.floor(rect.y / this._pageSizeV) * this._pageSizeV, ani);
                    else
                        this.setPosY(rect.y, ani);
                }
                else if(rect.y + rect.height > bottom) {
                    if(this._pageMode)
                        this.setPosY(Math.floor(rect.y / this._pageSizeV) * this._pageSizeV,ani);
                    else if(rect.height <= this._viewHeight/2)
                        this.setPosY(rect.y + rect.height * 2 - this._viewHeight, ani);
                    else
                        this.setPosY(rect.y + rect.height - this._viewHeight, ani);
                }
            }
            if (this._xOverlap>0) {
                var left: number =  this.posX;
                var right: number = left + this._viewWidth;
                if(setFirst || rect.x < left || rect.width >= this._viewWidth) {
                    if(this._pageMode)
                        this.setPosX(Math.floor(rect.x / this._pageSizeH) * this._pageSizeH,ani);
                    else
                        this.setPosX(rect.x, ani);
                }
                else if(rect.x + rect.width > right) {
                    if(this._pageMode)
                        this.setPosX(Math.floor(rect.x / this._pageSizeH) * this._pageSizeH,ani);
                    else if(rect.width <= this._viewWidth/2)
                        this.setPosX(rect.x + rect.width * 2 - this._viewWidth, ani);
                    else
                        this.setPosX(rect.x + rect.width - this._viewWidth, ani);
                }                
            }
            
            if(!ani && this._needRefresh) 
                this.refresh();             
        }
        
        public isChildInView(obj: GObject): boolean {
            var dist:number;
            if(this._yOverlap>0) {
                dist = obj.y + this._container.y;
                if(dist < -obj.height - 20 || dist > this._viewHeight + 20)
                    return false;
            }

             if(this._xOverlap>0) {
                dist = obj.x + this._container.x;
                if(dist < -obj.width - 20 || dist > this._viewWidth + 20)
                    return false;
            }

            return true;
        }
        
        public cancelDragging():void {
            this._owner.displayObject.removeEventListener(egret.TouchEvent.TOUCH_MOVE,this.__touchMove, this);
            this._owner.displayObject.removeEventListener(egret.TouchEvent.TOUCH_END,this.__touchEnd, this);
            this._owner.displayObject.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.__touchTap, this);
			
			if (ScrollPane.draggingPane == this)
				ScrollPane.draggingPane = null;
			
			ScrollPane._gestureFlag = 0;
			this.isDragged = false;
             this._maskContainer.touchChildren = true;
		}
		
		public onOwnerSizeChanged():void {
			this.setSize(this._owner.width, this._owner.height);
			this.posChanged(false);
		}
		
		public adjustMaskContainer():void {
			var mx:number, my:number;
			if (this._displayOnLeft && this._vtScrollBar != null)
				mx = Math.floor(this._owner.margin.left + this._vtScrollBar.width);
			else
				mx = Math.floor(this._owner.margin.left);
			my = Math.floor(this._owner.margin.top);
			mx += this._owner._alignOffset.x;
			my += this._owner._alignOffset.y;
			
			this._maskContainer.x = mx;
            this._maskContainer.y = my;
		}

        public setSize(aWidth: number,aHeight: number): void {
			this.adjustMaskContainer();
            
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
            
            this._viewWidth = aWidth;
            this._viewHeight = aHeight;
            if(this._hzScrollBar && !this._hScrollNone)
                this._viewHeight -= this._hzScrollBar.height;
            if(this._vtScrollBar && !this._vScrollNone)
                this._viewWidth -= this._vtScrollBar.width;
            this._viewWidth -= (this._owner.margin.left + this._owner.margin.right);
            this._viewHeight -= (this._owner.margin.top + this._owner.margin.bottom);

            this._viewWidth = Math.max(1,this._viewWidth);
            this._viewHeight = Math.max(1,this._viewHeight);
            this._pageSizeH = this._viewWidth;
            this._pageSizeV = this._viewHeight;
            
            this.handleSizeChanged();
        }

        public setContentSize(aWidth: number, aHeight: number): void {
            if (this._contentWidth == aWidth && this._contentHeight == aHeight)
                return;

            this._contentWidth = aWidth;
            this._contentHeight = aHeight;
            this.handleSizeChanged();
        }
        
        public changeContentSizeOnScrolling(deltaWidth:number, deltaHeight:number,
													   deltaPosX:number, deltaPosY:number):void
		{
			this._contentWidth += deltaWidth;
			this._contentHeight += deltaHeight;
			
			if (this.isDragged)
			{
				if (deltaPosX != 0)
					this._container.x -= deltaPosX;
				if (deltaPosY != 0)
					this._container.y -= deltaPosY;
				
				this.validateHolderPos();
				
				this._xOffset += deltaPosX;
				this._yOffset += deltaPosY;
				
				var tmp:number = this._y2 - this._y1;
				this._y1 = this._container.y;
				this._y2 = this._y1 + tmp;

				tmp = this._x2 - this._x1;
				this._x1 = this._container.x;
				this._x2 = this._x1 + tmp;
				
				this._yPos = -this._container.y;
				this._xPos = -this._container.x;
			}
			else if (this._tweening == 2)
			{
				if (deltaPosX != 0)
				{
					this._container.x -= deltaPosX;
					this._throwTween.start.x -= deltaPosX;
				}
				if (deltaPosY != 0)
				{
					this._container.y -= deltaPosY;
					this._throwTween.start.y -= deltaPosY;
				}
			}
			
			this.handleSizeChanged(true);
		}

        private handleSizeChanged(onScrolling:boolean=false): void {
            if(this._displayInDemand) {
                if(this._vtScrollBar) {
                    if(this._contentHeight <= this._viewHeight) {
                        if(!this._vScrollNone) {
                            this._vScrollNone = true;
                            this._viewWidth += this._vtScrollBar.width;
                        }
                    }
                    else {
                        if(this._vScrollNone) {
                            this._vScrollNone = false;
                            this._viewWidth -= this._vtScrollBar.width;
                        }
                    }
                }
                if(this._hzScrollBar) {
                    if(this._contentWidth <= this._viewWidth) {
                        if(!this._hScrollNone) {
                            this._hScrollNone = true;
                            this._viewHeight += this._hzScrollBar.height;
                        }
                    }
                    else {
                        if(this._hScrollNone) {
                            this._hScrollNone = false;
                            this._viewHeight -= this._hzScrollBar.height;
                        }
                    }
                }
            }

            if(this._vtScrollBar) {
                if(this._viewHeight < this._vtScrollBar.minSize)
                    this._vtScrollBar.displayObject.visible = false;
                else {
                    this._vtScrollBar.displayObject.visible = this._scrollBarVisible && !this._vScrollNone;
                    if(this._contentHeight == 0)
                        this._vtScrollBar.displayPerc = 0;
                    else
                        this._vtScrollBar.displayPerc = Math.min(1,this._viewHeight / this._contentHeight);
                }
            }
            if(this._hzScrollBar) {
                if(this._viewWidth < this._hzScrollBar.minSize)
                    this._hzScrollBar.displayObject.visible = false;
                else {
                    this._hzScrollBar.displayObject.visible = this._scrollBarVisible && !this._hScrollNone;
                    if(this._contentWidth == 0)
                        this._hzScrollBar.displayPerc = 0;
                    else
                        this._hzScrollBar.displayPerc = Math.min(1,this._viewWidth / this._contentWidth);
                }
            }

            var rect:egret.Rectangle = this._maskContainer.scrollRect;
            if(rect!=null) {
                rect.setTo(0,0,this._viewWidth,this._viewHeight);
                this._maskContainer.scrollRect = rect;
            }
                
            if ( this._scrollType == ScrollType.Horizontal ||  this._scrollType == ScrollType.Both)
				 this._xOverlap = Math.ceil(Math.max(0,  this._contentWidth -  this._viewWidth));
			else
				 this._xOverlap = 0;
			if ( this._scrollType == ScrollType.Vertical ||  this._scrollType == ScrollType.Both)
				 this._yOverlap = Math.ceil(Math.max(0,  this._contentHeight -  this._viewHeight));
			else
				 this._yOverlap = 0;
			
			if( this._tweening==0 && onScrolling)
			{
				//如果原来是在边缘，且不在缓动状态，那么尝试继续贴边。（如果在缓动状态，需要修改tween的终值，暂时未支持）
				if( this._xPerc==0 ||  this._xPerc==1)
				{
					 this._xPos =  this._xPerc *  this._xOverlap;
					 this._container.x = - this._xPos;
				}
				if( this._yPerc==0 ||  this._yPerc==1)
				{
					 this._yPos =  this._yPerc *  this._yOverlap;
					 this._container.y = - this._yPos;
				}
			}
			else
			{
				//边界检查
				 this._xPos = ToolSet.clamp( this._xPos, 0,  this._xOverlap);
				 this._xPerc =  this._xOverlap>0? this._xPos/ this._xOverlap:0;
				
				 this._yPos = ToolSet.clamp( this._yPos, 0,  this._yOverlap);
				 this._yPerc =  this._yOverlap>0? this._yPos/ this._yOverlap:0;
			}
			
			 this.validateHolderPos();
			
			if ( this._vtScrollBar != null)
				 this._vtScrollBar.scrollPerc =  this._yPerc;
			if ( this._hzScrollBar != null)
				 this._hzScrollBar.scrollPerc =  this._xPerc;
        }

        private validateHolderPos():void
		{
			this._container.x = ToolSet.clamp(this._container.x, -this._xOverlap, 0);
			this._container.y = ToolSet.clamp(this._container.y, -this._yOverlap, 0);
		}

        private posChanged(ani: boolean): void {
            if (this._aniFlag == 0)
				this._aniFlag = ani ? 1 : -1;
			else if (this._aniFlag == 1 && !ani)
				this._aniFlag = -1;

            this._needRefresh = true;
            GTimers.inst.callLater(this.refresh, this);
            
            //如果在甩手指滚动过程中用代码重新设置滚动位置，要停止滚动
            if(this._tweening == 2) {
                this.killTween();
            }
        }

        private  killTween():void {
			if(this._tweening==1)
			{
				this._tweener.setPaused(true);
				this._tweening = 0;
				this._tweener = null;
				
				this.syncScrollBar(true);
			}
			else if(this._tweening==2)
			{
				this._tweener.setPaused(true);
				this._tweener = null;
				this._tweening = 0;
				
				this.validateHolderPos();
				this.syncScrollBar(true);

				this.dispatchEventWith(ScrollPane.SCROLL_END,false);
			}			
		}

        private refresh(): void {
            this._needRefresh = false;
            GTimers.inst.remove(this.refresh, this);

            if(this._pageMode)
			{
				var page:number;
				var delta:number;
				if(this._yOverlap>0 && this._yPerc!=1 && this._yPerc!=0)
				{
					page = Math.floor(this._yPos / this._pageSizeV);
					delta = this._yPos - page*this._pageSizeV;
					if(delta>this._pageSizeV/2)
						page++;
					this._yPos = page * this._pageSizeV;
					if(this._yPos>this._yOverlap)
					{
						this._yPos = this._yOverlap;
						this._yPerc = 1;
					}
					else
						this._yPerc = this._yPos / this._yOverlap;
				}
				
				if(this._xOverlap>0 && this._xPerc!=1 && this._xPerc!=0)
				{
					page = Math.floor(this._xPos / this._pageSizeH);
					delta = this._xPos - page*this._pageSizeH;
					if(delta>this._pageSizeH/2)
						page++;
					this._xPos = page * this._pageSizeH;
					if(this._xPos>this._xOverlap)
					{
						this._xPos = this._xOverlap;
						this._xPerc = 1;
					}
					else
						this._xPerc = this._xPos / this._xOverlap;
				}
			}
			else if(this._snapToItem)
			{
				var pt:egret.Point = this._owner.getSnappingPosition(this._xPerc==1?0:this._xPos, this._yPerc==1?0:this._yPos, ScrollPane.sHelperPoint);
				if (this._xPerc != 1 && pt.x!=this._xPos)
				{
					this._xPos = pt.x;
					this._xPerc = this._xPos / this._xOverlap;
					if(this._xPerc>1)
					{
						this._xPerc = 1;
						this._xPos = this._xOverlap;
					}
				}
				if (this._yPerc != 1 && pt.y!=this._yPos)
				{
					this._yPos = pt.y;
					this._yPerc = this._yPos / this._yOverlap;
					if(this._yPerc>1)
					{
						this._yPerc = 1;
						this._yPos = this._yOverlap;
					}
				}
			}
            
            this.refresh2();
            this.dispatchEventWith(ScrollPane.SCROLL,false);
            if(this._needRefresh) //user change scroll pos in on scroll
            {
                this._needRefresh = false;
                GTimers.inst.remove(this.refresh, this);

                this.refresh2();
            }

            this._aniFlag = 0;
        }
        
        private refresh2() {
            var contentXLoc:number = Math.floor(this._xPos);
            var contentYLoc:number = Math.floor(this._yPos);

            if(this._aniFlag==1 && !this.isDragged) {
                var toX: number = this._container.x;
                var toY: number = this._container.y;
                if(this._yOverlap>0)
                    toY = -contentYLoc;
                else {
                    if(this._container.y != 0)
                        this._container.y = 0;
                }
                if(this._xOverlap>0)
                    toX = -contentXLoc;
                else {
                    if(this._container.x != 0)
                        this._container.x = 0;
                }

                if(toX != this._container.x || toY != this._container.y) {
                    if(this._tweener!=null)
                        this.killTween();

                    this._tweening = 1;
                    this._maskContainer.touchChildren = false;

                    this._tweener = egret.Tween.get(this._container,{ onChange: this.__tweenUpdate,onChangeObj: this })
                        .to({ x: toX,y: toY, },500,ScrollPane._easeTypeFunc)
                        .call(this.__tweenComplete,this);
                }
            }
            else {
                if(this._tweener!=null)
                    this.killTween();                

                //如果在拖动的过程中Refresh，这里要进行处理，保证拖动继续正常进行
                if(this.isDragged) {
                    this._xOffset += this._container.x - (-contentXLoc);
                    this._yOffset += this._container.y - (-contentYLoc);
                }

                this._container.y = -contentYLoc;
                this._container.x = -contentXLoc;
				
                //如果在拖动的过程中Refresh，这里要进行处理，保证手指离开是滚动正常进行
                if(this.isDragged) {
                    this._y1 = this._y2 = this._container.y;
                    this._x1 = this._x2 = this._container.x;
                }

                if(this._vtScrollBar)
                    this._vtScrollBar.scrollPerc = this._yPerc;
                if(this._hzScrollBar)
                    this._hzScrollBar.scrollPerc = this._xPerc;
            }
        }
        
        private syncPos():void {
			if(this._xOverlap>0) {
				this._xPos = ToolSet.clamp(-this._container.x, 0, this._xOverlap);
				this._xPerc = this._xPos / this._xOverlap;
			}
			
			if(this._yOverlap>0) {
				this._yPos = ToolSet.clamp(-this._container.y, 0, this._yOverlap);
				this._yPerc = this._yPos / this._yOverlap;
			}
		}
		
		private syncScrollBar(end:boolean=false):void {
			if(end) {
				if(this._vtScrollBar) {
					if(this._scrollBarDisplayAuto)
						this.showScrollBar(false);
				}
				if(this._hzScrollBar) {
					if(this._scrollBarDisplayAuto)
						this.showScrollBar(false);
				}

                this._maskContainer.touchChildren = true;
			}
			else {
				if(this._vtScrollBar) {
					this._vtScrollBar.scrollPerc = this._yOverlap == 0 ? 0 : ToolSet.clamp(-this._container.y, 0, this._yOverlap) / this._yOverlap;
					if(this._scrollBarDisplayAuto)
						this.showScrollBar(true);
				}
				if(this._hzScrollBar) {
					this._hzScrollBar.scrollPerc =  this._xOverlap == 0 ? 0 : ToolSet.clamp(-this._container.x, 0, this._xOverlap) / this._xOverlap;
					if(this._scrollBarDisplayAuto)
						this.showScrollBar(true);
				}
            }
        }

        private static sHelperPoint: egret.Point = new egret.Point();
        private __mouseDown(evt: egret.TouchEvent): void {
            if (!this._touchEffect)
                return;
                
            if(this._tweener!=null)
                this.killTween();
            
            this._maskContainer.globalToLocal(evt.stageX, evt.stageY, ScrollPane.sHelperPoint);

            this._x1 = this._x2 = this._container.x;
            this._y1 = this._y2 = this._container.y;
            
            this._xOffset = ScrollPane.sHelperPoint.x - this._container.x;
            this._yOffset = ScrollPane.sHelperPoint.y - this._container.y;

            this._time1 = this._time2 = egret.getTimer();
            this._holdAreaPoint.x = ScrollPane.sHelperPoint.x;
            this._holdAreaPoint.y = ScrollPane.sHelperPoint.y;
            this._isHoldAreaDone = false;
            this.isDragged = false;

            this._owner.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__touchMove, this);
            this._owner.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.__touchEnd, this);
            this._owner.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_TAP,this.__touchTap, this);
        }

        private __touchMove(evt: egret.TouchEvent): void {
            if(this._owner.displayObject.stage==null)
                return;

            if(!this._touchEffect)
				return;
			
			if (ScrollPane.draggingPane != null && ScrollPane.draggingPane != this || GObject.draggingObject != null) //已经有其他拖动
				return;

            var sensitivity: number = UIConfig.touchScrollSensitivity;
                
            var diff: number, diff2: number;
            var sv: boolean, sh: boolean, st: boolean;

            var pt: egret.Point = this._maskContainer.globalToLocal(evt.stageX, evt.stageY, ScrollPane.sHelperPoint);

            if (this._scrollType == ScrollType.Vertical) 
			{
				if (!this._isHoldAreaDone)
				{
					//表示正在监测垂直方向的手势
					ScrollPane._gestureFlag |= 1;
					
					diff = Math.abs(this._holdAreaPoint.y - pt.y);
					if (diff < sensitivity)
						return;
					
					if ((ScrollPane._gestureFlag & 2) != 0) //已经有水平方向的手势在监测，那么我们用严格的方式检查是不是按垂直方向移动，避免冲突
					{
						diff2 = Math.abs(this._holdAreaPoint.x - pt.x);
						if (diff < diff2) //不通过则不允许滚动了
							return;
					}
				}
				
				sv = true;
			}
			else if (this._scrollType == ScrollType.Horizontal) 
			{
				if (!this._isHoldAreaDone)
				{
					ScrollPane._gestureFlag |= 2;
					
					diff = Math.abs(this._holdAreaPoint.x - pt.x);
					if (diff < sensitivity)
						return;
					
					if ((ScrollPane._gestureFlag & 1) != 0)
					{
						diff2 = Math.abs(this._holdAreaPoint.y - pt.y);
						if (diff < diff2)
							return;
					}
				}
				
				sh = true;
			}
			else
			{
				ScrollPane._gestureFlag = 3;
				
				if (!this._isHoldAreaDone)
				{
					diff = Math.abs(this._holdAreaPoint.y - pt.y);
					if (diff < sensitivity)
					{
						diff = Math.abs(this._holdAreaPoint.x - pt.x);
						if (diff < sensitivity)
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
                        this._container.y = 0;
                    else
                        this._container.y = Math.floor(y * 0.5);
                }
                else if (y < -this._yOverlap || this._inertiaDisabled) {
                    if (!this._bouncebackEffect)
                        this._container.y = -Math.floor(this._yOverlap);
                    else
                        this._container.y = Math.floor((y - this._yOverlap) * 0.5);
                }
                else {
                    this._container.y = y;
                }

                if (st) {
                    this._y2 = this._y1;
                    this._y1 = this._container.y;
                }
            }

            if (sh) {
                var x: number = Math.floor(ScrollPane.sHelperPoint.x - this._xOffset);
                if (x > 0) {
                    if (!this._bouncebackEffect || this._inertiaDisabled)
                        this._container.x = 0;
                    else
                        this._container.x = Math.floor(x * 0.5);
                }
                else if (x < 0 - this._xOverlap || this._inertiaDisabled) {
                    if (!this._bouncebackEffect)
                        this._container.x = -Math.floor(this._xOverlap);
                    else
                        this._container.x = Math.floor((x - this._xOverlap) * 0.5);
                }
                else {
                    this._container.x = x;
                }

                if (st) {
                    this._x2 = this._x1;
                    this._x1 = this._container.x;
                }
            }

            ScrollPane.draggingPane = this;
            this._maskContainer.touchChildren = false;
            this._isHoldAreaDone = true;
            this.isDragged = true;
            this.syncPos();
            this.syncScrollBar();
            this.dispatchEventWith(ScrollPane.SCROLL,false);
        }

        private __touchEnd(evt: egret.TouchEvent): void {
            evt.currentTarget.removeEventListener(egret.TouchEvent.TOUCH_MOVE,this.__touchMove, this);
            evt.currentTarget.removeEventListener(egret.TouchEvent.TOUCH_END,this.__touchEnd, this);
            evt.currentTarget.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.__touchTap, this);

            if (ScrollPane.draggingPane == this)
				ScrollPane.draggingPane = null;
			
			ScrollPane._gestureFlag = 0;
			
			if (!this.isDragged || !this._touchEffect || this._inertiaDisabled || this._owner.displayObject.stage==null)
				return;

            var time: number = (egret.getTimer() - this._time2) / 1000;
            if (time == 0)
                time = 0.001;
            var yVelocity: number = (this._container.y - this._y2) / time * 2 * UIConfig.defaultTouchScrollSpeedRatio;
            var xVelocity: number = (this._container.x - this._x2) / time * 2 * UIConfig.defaultTouchScrollSpeedRatio;
            var duration: number = 0.3;

            this._throwTween.start.x = this._container.x;
            this._throwTween.start.y = this._container.y;

            var change1: egret.Point = this._throwTween.change1;
            var change2: egret.Point = this._throwTween.change2;
            var endX: number = 0;
            var endY: number = 0;
            var page: number = 0;
            var delta: number = 0;
            var fireRelease: number = 0;            
            var testPageSize:number;
			
			if(this._scrollType==ScrollType.Both || this._scrollType==ScrollType.Horizontal)
			{
				if (this._container.x > fairygui.UIConfig.touchDragSensitivity)
					fireRelease = 1;
				else if (this._container.x <  -this._xOverlap - fairygui.UIConfig.touchDragSensitivity)
					fireRelease = 2;
				
				change1.x = ThrowTween.calculateChange(xVelocity, duration);
				change2.x = 0;
				endX = this._container.x + change1.x;
				
				if(this._pageMode && endX<0 && endX>-this._xOverlap)
				{
					page = Math.floor(-endX / this._pageSizeH);
					testPageSize = Math.min(this._pageSizeH, this._contentWidth - (page + 1) * this._pageSizeH);
					delta = -endX - page*this._pageSizeH;
					//页面吸附策略
					if (Math.abs(change1.x) > this._pageSizeH)//如果滚动距离超过1页,则需要超过页面的一半，才能到更下一页
					{
						if (delta > testPageSize * 0.5)
							page++;
					}
					else //否则只需要页面的1/3，当然，需要考虑到左移和右移的情况
					{
						if (delta > testPageSize * (change1.x < 0 ? 0.3 : 0.7))
							page++;
					}
					
					//重新计算终点
					endX = -page * this._pageSizeH;
					if (endX < -this._xOverlap) //最后一页未必有_pageSizeH那么大
						endX = -this._xOverlap;
					
					change1.x = endX - this._container.x;
				}
			}
			else
				change1.x = change2.x = 0;
			
			if(this._scrollType==ScrollType.Both || this._scrollType==ScrollType.Vertical)
			{
				if (this._container.y > fairygui.UIConfig.touchDragSensitivity)
					fireRelease = 1;
				else if (this._container.y <  -this._yOverlap - fairygui.UIConfig.touchDragSensitivity)
					fireRelease = 2;
				
				change1.y = ThrowTween.calculateChange(yVelocity, duration);
				change2.y = 0;
				endY = this._container.y + change1.y;
				
				if(this._pageMode && endY < 0 && endY > -this._yOverlap)
				{
					page = Math.floor(-endY / this._pageSizeV);
					testPageSize = Math.min(this._pageSizeV, this._contentHeight - (page + 1) * this._pageSizeV);
					delta = -endY - page * this._pageSizeV;
					if (Math.abs(change1.y) > this._pageSizeV)
					{
						if (delta > testPageSize * 0.5)
							page++;
					}
					else
					{
						if (delta > testPageSize * (change1.y < 0 ? 0.3 : 0.7))
							page++;
					}
					
					endY = -page * this._pageSizeV;
					if (endY < -this._yOverlap)
						endY = -this._yOverlap;
					
					change1.y = endY - this._container.y;
				}
			}
			else
				change1.y = change2.y = 0;

            if (this._snapToItem && !this._pageMode) {
                endX = -endX;
                endY = -endY;
                var pt: egret.Point = this._owner.getSnappingPosition(endX,endY,ScrollPane.sHelperPoint);
                endX = -pt.x;
                endY = -pt.y;
                change1.x = endX - this._container.x;
                change1.y = endY - this._container.y;
            }
            
            if(this._bouncebackEffect) {
                if(endX > 0)
                    change2.x = 0 - this._container.x - change1.x;
                else if(endX < -this._xOverlap)
                    change2.x = -this._xOverlap - this._container.x - change1.x;

                if(endY > 0)
                    change2.y = 0 - this._container.y - change1.y;
                else if(endY < -this._yOverlap)
                    change2.y = -this._yOverlap - this._container.y - change1.y;
            }
            else {
                if(endX > 0)
                    change1.x = 0 - this._container.x;
                else if(endX < -this._xOverlap)
                    change1.x = -this._xOverlap - this._container.x;

                if(endY > 0)
                    change1.y = 0 - this._container.y;
                else if(endY < -this._yOverlap)
                    change1.y = -this._yOverlap - this._container.y;
            }

            this._throwTween.value = 0;
            this._throwTween.change1 = change1;
            this._throwTween.change2 = change2;
            
            if(this._tweener!=null)
                this.killTween();
            this._tweening = 2;

            this._tweener = egret.Tween.get(this._throwTween,{ onChange: this.__tweenUpdate2,onChangeObj: this })
                .to({ value: 1 },duration * 1000,ScrollPane._easeTypeFunc)
                .call(this.__tweenComplete2,this);

            if (fireRelease == 1)
				this.dispatchEventWith(ScrollPane.PULL_DOWN_RELEASE);
			else if (fireRelease == 2)
				this.dispatchEventWith(ScrollPane.PULL_UP_RELEASE);
        }
        
        private __touchTap(evt: egret.TouchEvent): void {
            this.isDragged = false;
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
            this._scrollBarVisible = val && this._viewWidth > 0 && this._viewHeight > 0;
            if (this._vtScrollBar)
                this._vtScrollBar.displayObject.visible = this._scrollBarVisible && !this._vScrollNone;
            if (this._hzScrollBar)
                this._hzScrollBar.displayObject.visible = this._scrollBarVisible && !this._hScrollNone;
        }

        private __tweenUpdate(): void {
            this.syncScrollBar();
            this.dispatchEventWith(ScrollPane.SCROLL,false);
        }

        private __tweenComplete(): void {
            this._tweening = 0;
            this._tweener = null;

            this.validateHolderPos();
            this.syncScrollBar(true);
            this.dispatchEventWith(ScrollPane.SCROLL,false);
        }

        private __tweenUpdate2(): void {
            this._throwTween.update(this._container);

           	this.syncPos();
			this.syncScrollBar();
            this.dispatchEventWith(ScrollPane.SCROLL,false);
        }

        private __tweenComplete2(): void {
            this._tweening = 0;
            this._tweener = null;

            this.validateHolderPos();
			this.syncPos();
			this.syncScrollBar(true);
            this.dispatchEventWith(ScrollPane.SCROLL,false);
            this.dispatchEventWith(ScrollPane.SCROLL_END,false);
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