module fairygui {
    export class Transition {

        public name: string;
        public autoPlayRepeat: number = 1;
        public autoPlayDelay: number = 0;
        
        private _owner: GComponent;
        private _ownerBaseX: number = 0;
        private _ownerBaseY: number = 0;
        private _items: Array<TransitionItem>;
        private _totalTimes: number = 0;
        private _totalTasks: number = 0;
        private _playing: boolean = false;
        private _onComplete: Function;
        private _onCompleteObj: any;
        private _onCompleteParam: any;
        private _options: number = 0;
        private _reversed: boolean;
        private _maxTime: number = 0;
        private _autoPlay: boolean;

        public static OPTION_IGNORE_DISPLAY_CONTROLLER: number = 1;
        private static FRAME_RATE: number = 24;

        public constructor(owner: GComponent) {
            this._owner = owner;
            this._items = new Array<TransitionItem>();
        }

		public get autoPlay():boolean
		{
			return this._autoPlay;
		}
		
		public set autoPlay(value:boolean)
		{
			if (this._autoPlay != value)
			{
				this._autoPlay = value;
				if (this._autoPlay)
				{
					if (this._owner.onStage)
						this.play(null, null, this.autoPlayRepeat, this.autoPlayDelay);
				}
				else
				{
					if (!this._owner.onStage)
						this.stop(false, true);
				}
			}
		}
		
        public play(onComplete: Function = null,onCompleteObj: any = null,onCompleteParam: any = null,
            times: number = 1,delay: number = 0) {
            this._play(onComplete,onCompleteObj,onCompleteParam,times,delay,false);
        }
        
        public playReverse(onComplete: Function = null,onCompleteObj: any = null,onCompleteParam: any = null,
            times: number = 1,delay: number = 0) {
            this._play(onComplete,onCompleteObj,onCompleteParam,times,delay,true);
        }
        
        private _play(onComplete: Function = null,onCompleteObj: any = null,onCompleteParam: any = null,
            times: number = 1,delay: number = 0,reversed:boolean=false) {
            this.stop();
            if(times == 0)
                times = 1;
            else if(times==-1)
                times = Number.MAX_VALUE;                
            this._totalTimes = times;
            this._reversed = reversed;
            this.internalPlay(delay);
            this._playing = this._totalTasks > 0;
            if(this._playing) {
                this._onComplete = onComplete;
                this._onCompleteParam = onCompleteParam;
                this._onCompleteObj = onCompleteObj;

                this._owner.internalVisible++;
                if((this._options & Transition.OPTION_IGNORE_DISPLAY_CONTROLLER) != 0) {
                    var cnt: number = this._items.length;
                    for(var i: number = 0;i < cnt;i++) {
                        var item: TransitionItem = this._items[i];
                        if(item.target != null && item.target != this._owner)
                            item.target.internalVisible++;
                    }
                }
            }
            else if(onComplete != null) {
                if(onComplete.length > 0)
                    onComplete.call(this._onCompleteObj,onCompleteParam);
                else
                    onComplete(this._onCompleteObj);
            }
        }

        public stop(setToComplete: boolean = true,processCallback: boolean = false) {
            if(this._playing) {
                this._playing = false;
                this._totalTasks = 0;
                this._totalTimes = 0;
                var func: Function = this._onComplete;
                var param: any = this._onCompleteParam;
                var thisObj: any = this._onCompleteObj;
                this._onComplete = null;
                this._onCompleteParam = null;
                this._onCompleteObj = null;

                this._owner.internalVisible--;

                var cnt: number = this._items.length;
                var i:number;
                var item:TransitionItem;
                if(this._reversed) {
                    for(i = cnt-1;i>=0;i--) {
                        item = this._items[i];
                        if(item.target == null)
                            continue;

                        this.stopItem(item,setToComplete);
                    }
                }
                else {
                    for(i = 0;i < cnt;i++) {
                        item = this._items[i];
                        if(item.target == null)
                            continue;

                        this.stopItem(item,setToComplete);
                    }
                }

                if(processCallback && func != null) {
                    if(func.length > 0)
                        func.call(thisObj,param);
                    else
                        func.call(thisObj);
                }
            }
        }
        
        private stopItem(item:TransitionItem, setToComplete:boolean):void {
            if ((this._options & Transition.OPTION_IGNORE_DISPLAY_CONTROLLER) != 0 && item.target != this._owner)
				item.target.internalVisible--;
			
			if (item.type == TransitionActionType.ColorFilter && item.filterCreated)
				item.target.filters = null;

            if(item.completed)
                return;

            if(item.tweener != null) {
                item.tweener.setPaused(true);
                item.tweener = null;
            }

            if(item.type == TransitionActionType.Transition) {
                var trans: Transition = (<GComponent><any>(item.target)).getTransition(item.value.s);
                if(trans != null)
                    trans.stop(setToComplete,false);
            }
            else if(item.type == TransitionActionType.Shake) {
                if(GTimers.inst.exists(this.__shake,item)) {
                    GTimers.inst.remove(this.__shake,item);
                    item.target._gearLocked = true;
                    item.target.setXY(item.target.x - item.startValue.f1,item.target.y - item.startValue.f2);
                    item.target._gearLocked = false;
                }
            }
            else {
                if(setToComplete) {
                    if(item.tween) {
                        if(!item.yoyo || item.repeat % 2 == 0)
                            this.applyValue(item,this._reversed?item.startValue:item.endValue);
                        else
                            this.applyValue(item,this._reversed?item.endValue:item.startValue);
                    }
                    else if(item.type != TransitionActionType.Sound)
                        this.applyValue(item,item.value);
                }
            }
        }

        public dispose():void
		{
			if (!this._playing)
				return;
			
			this._playing = false;
			var cnt:number = this._items.length;
			for (var i:number = 0; i < cnt; i++)
			{
				var item:TransitionItem = this._items[i];
				if (item.target == null || item.completed)
					continue;
				
				if (item.tweener != null)
				{
					item.tweener.setPaused(true);
					item.tweener = null;
				}
				
				if (item.type == TransitionActionType.Transition)
				{
					var trans:Transition = (<GComponent><any>item.target).getTransition(item.value.s);
					if (trans != null)
						trans.dispose();
				}
				else if (item.type == TransitionActionType.Shake)
				{
					GTimers.inst.remove(this.__shake, item);
				}
			}
		}

        public get playing(): boolean {
            return this._playing;
        }

        public setValue(label: string,...args) {
            var cnt: number = this._items.length;
            var value: TransitionValue;
            for(var i: number = 0;i < cnt;i++) {
                var item: TransitionItem = this._items[i];
                if(item.label == null && item.label2 == null)
                    continue;
                if(item.label == label) {
                    if(item.tween)
                        value = item.startValue;
                    else
                        value = item.value;
                }
                else if(item.label2 == label) {
                    value = item.endValue;
                }
                else
                    continue;
                switch(item.type) {
                    case TransitionActionType.XY:
                    case TransitionActionType.Size:
                    case TransitionActionType.Pivot:
                    case TransitionActionType.Scale:
                    case TransitionActionType.Skew:
                        value.b1 = true;
                        value.b2 = true;
                        value.f1 = parseFloat(args[0]);
                        value.f2 = parseFloat(args[1]);
                        break;
                    case TransitionActionType.Alpha:
                        value.f1 = parseFloat(args[0]);
                        break;
                    case TransitionActionType.Rotation:
                        value.i = parseInt(args[0]);
                        break;
                    case TransitionActionType.Color:
                        value.c = parseFloat(args[0]);
                        break;
                    case TransitionActionType.Animation:
                        value.i = parseInt(args[0]);
                        if(args.length > 1)
                            value.b = args[1];
                        break;
                    case TransitionActionType.Visible:
                        value.b = args[0];
                        break;
                    case TransitionActionType.Sound:
                        value.s = args[0];
                        if(args.length > 1)
                            value.f1 = parseFloat(args[1]);
                        break;
                    case TransitionActionType.Transition:
                        value.s = args[0];
                        if(args.length > 1)
                            value.i = parseInt(args[1]);
                        break;
                    case TransitionActionType.Shake:
                        value.f1 = parseFloat(args[0]);
                        if(args.length > 1)
                            value.f2 = parseFloat(args[1]);
                        break;
                    case TransitionActionType.ColorFilter:
						value.f1 = parseFloat(args[0]);
						value.f2 = parseFloat(args[1]);
						value.f3 = parseFloat(args[2]);
						value.f4 = parseFloat(args[3]);
						break;
                }
            }
        }

        public setHook(label: string,callback: Function,thisObj:any) {
            var cnt: number = this._items.length;
            for(var i: number = 0;i < cnt;i++) {
                var item: TransitionItem = this._items[i];
                if(item.label == label) {
                    item.hook = callback;
                    item.hookObj = thisObj;
                    break;
                }
                else if(item.label2 == label) {
                    item.hook2 = callback;
                    item.hook2Obj = thisObj;
                    break;
                }
            }
        }

        public clearHooks() {
            var cnt: number = this._items.length;
            for(var i: number = 0;i < cnt;i++) {
                var item: TransitionItem = this._items[i];
                item.hook = null;
                item.hookObj = null;
                item.hook2 = null;
                item.hook2Obj = null;
            }
        }

        public setTarget(label: string,newTarget: GObject) {
            var cnt: number = this._items.length;
            var value: TransitionValue;
            for(var i: number = 0;i < cnt;i++) {
                var item: TransitionItem = this._items[i];
                if(item.label == null && item.label2 == null)
                    continue;
                item.targetId = newTarget.id;
            }
        }

        public setDuration(label:string, value:number) {
			 var cnt: number = this._items.length;
			 for(var i: number = 0;i < cnt;i++) {
				var item:TransitionItem = this._items[i];
				if (item.tween && item.label == label)
					item.duration = value;
			}
		}

        public updateFromRelations(targetId: string,dx: number,dy: number) {
            var cnt: number = this._items.length;
            if(cnt == 0)
                return;
            for(var i: number = 0;i < cnt;i++) {
                var item: TransitionItem = this._items[i];
                if(item.type == TransitionActionType.XY && item.targetId == targetId) {
                    if(item.tween) {
                        item.startValue.f1 += dx;
                        item.startValue.f2 += dy;
                        item.endValue.f1 += dx;
                        item.endValue.f2 += dy;
                    }
                    else {
                        item.value.f1 += dx;
                        item.value.f2 += dy;
                    }
                }
            }
        }

        private internalPlay(delay: number=0) {
            this._ownerBaseX = this._owner.x;
            this._ownerBaseY = this._owner.y;
            this._totalTasks = 0;
            var cnt: number = this._items.length;
            var startTime: number;
            var item:TransitionItem;
            for(var i: number = 0;i < cnt;i++) {
                item = this._items[i];
                if(item.targetId)
                    item.target = this._owner.getChildById(item.targetId);
                else
                    item.target = this._owner;
                if(item.target == null)
                    continue;                    
                
                if(item.tween) {
                    if(this._reversed)
                        startTime = delay + (this._maxTime - item.time - item.duration)*1000;
                    else
                        startTime = delay + item.time * 1000;
                   if(startTime>0 && (item.type==TransitionActionType.XY || item.type==TransitionActionType.Size)) {
                        this._totalTasks++;
                        item.completed = false;
                        item.tweener = egret.Tween.get(item.value).wait(startTime).call(this.__delayCall,this,[item]);
                   }
                   else
                        this.startTween(item, startTime);
                }
                else {
                    if(this._reversed)
                        startTime = delay + (this._maxTime - item.time) * 1000;
                    else
                        startTime = delay + item.time * 1000;
                    if(startTime == 0)
                        this.applyValue(item,item.value);
                    else {                       
                        this._totalTasks++;
                        item.completed = false;
                        item.tweener = egret.Tween.get(item.value).wait(startTime).call(this.__delayCall2,this,[item]);
                    }
                }
            }
        }

        private prepareValue(item: TransitionItem, toProps: any, reversed: boolean = false) {
            var startValue:TransitionValue;
			var endValue:TransitionValue;
			if(reversed)
			{
				startValue = item.endValue;
				endValue = item.startValue;
			}
			else
			{
				startValue = item.startValue;
				endValue = item.endValue;
			}

            switch(item.type) {
                case TransitionActionType.XY:
                    case TransitionActionType.Size:
                    if(item.type==TransitionActionType.XY) {
                        if(item.target == this._owner) {
                            if(!startValue.b1)
                                startValue.f1 = 0;
                            if(!startValue.b2)
                                startValue.f2 = 0;  
                        }
                        else {
                            if(!startValue.b1)
                                startValue.f1 = item.target.x;
                            if(!startValue.b2)
                                startValue.f2 = item.target.y;
                        }
                    }
                    else {
                        if(!startValue.b1)
                            startValue.f1 = item.target.width;
                        if(!startValue.b2)
                            startValue.f2 = item.target.height;
                    }
                    item.value.f1 = startValue.f1;
                    item.value.f2 = startValue.f2;
                    item.value.b1 = startValue.b1;
                    item.value.b2 = startValue.b2;

                    if(!endValue.b1)
                        endValue.f1 = item.value.f1;
                    if(!endValue.b2)
                        endValue.f2 = item.value.f2;  
                    toProps.f1 = endValue.f1;
                    toProps.f2 = endValue.f2;
                    break;

                case TransitionActionType.Scale:
                case TransitionActionType.Skew:
                    item.value.f1 = startValue.f1;
                    item.value.f2 = startValue.f2;
                    toProps.f1 = endValue.f1;
                    toProps.f2 = endValue.f2;
                    break;

                case TransitionActionType.Alpha:
                    item.value.f1 = startValue.f1;
                    toProps.f1 = endValue.f1;
                    break;

                case TransitionActionType.Rotation:
                    item.value.i = startValue.i;
                    toProps.i = endValue.i;
                    break;

                case TransitionActionType.ColorFilter:
                    item.value.f1 = startValue.f1;
                    item.value.f2 = startValue.f2;
                    item.value.f3 = startValue.f3;
                    item.value.f4 = startValue.f4;
                    toProps.f1 = endValue.f1;
                    toProps.f2 = endValue.f2;
                    toProps.f3 = endValue.f3;
                    toProps.f4 = endValue.f4;
                    break;
            }
        }

        private startTween(item: TransitionItem, delay: number) {
            var initProps: any,toProps: any;
            initProps = {};
            toProps = {};

            this._totalTasks++;
            item.completed = false;

            this.prepareValue(item,toProps,this._reversed);

            item.tweener = egret.Tween.get(item.value,initProps);
            if(delay!=0)
                item.tweener.wait(delay);
            else
                this.applyValue(item,item.value);

            item.tweener.call(this.__tweenStart,this,[item]);
            item.tweener.to(toProps,item.duration * 1000,item.easeType);
            if(item.repeat != 0) {
                item.tweenTimes = 0;
                item.tweener.call(this.__tweenRepeatComplete,this,[item]);
            }
            else
                item.tweener.call(this.__tweenComplete,this,[item]);
        }

        private __delayCall(item: TransitionItem) {
            item.tweener = null;
            this._totalTasks--;
            
            this.startTween(item, 0);
        }

        private __delayCall2(item: TransitionItem) {
            item.tweener = null;
            this._totalTasks--;
            item.completed = true;

            this.applyValue(item,item.value);
            if(item.hook != null)
                item.hook.call(item.hookObj);
            this.checkAllComplete();
        }

        private __tweenStart(item: TransitionItem) {
            if(item.tweener != null) {
                if(item.hook != null)
                    item.hook.call(item.hookObj);

                //因为egret的onChange在wait的时候已经开始调用，因此只能放在这里注册侦听
                item.tweener.addEventListener("change",this.__tweenUpdate,[this,item]);
            }
        }

        private __tweenUpdate() {
            var args: any[] = <any[]><any>this;
            var trans: Transition = args[0];
            var item: TransitionItem = args[1];
            trans.applyValue(item,item.value);  
        }
        
        private __tweenComplete(item: TransitionItem) {
            item.tweener = null;
            this._totalTasks--;
            item.completed = true;

            if(item.hook2 != null)
                item.hook2.call(item.hook2Obj);
            this.checkAllComplete();
        }
        
        private __tweenRepeatComplete(item: TransitionItem) {
            item.tweenTimes++;
            if(item.repeat==-1 || item.tweenTimes < item.repeat + 1) {
                var initProps: any,toProps: any;
                initProps = {};
                toProps = {};

                initProps.onChange = this.__tweenUpdate;
                initProps.onChangeObj = [this,item];
                var reversed: boolean;
                if(item.yoyo) {
                    if(this._reversed)
                        reversed = item.tweenTimes % 2 == 0;
                    else
                        reversed = item.tweenTimes % 2 == 1;
                }
                else
                    reversed = this._reversed;
                this.prepareValue(item,toProps,reversed);
                item.tweener = egret.Tween.get(item.value,initProps);
                item.tweener.to(toProps,item.duration * 1000,item.easeType)
                    .call(this.__tweenRepeatComplete,this,[item]);
            }
            else
                this.__tweenComplete(item);
        }

        private __playTransComplete(item: TransitionItem) {
            this._totalTasks--;
            item.completed = true;
            this.checkAllComplete();
        }

        private checkAllComplete() {
            if(this._playing && this._totalTasks == 0) {
                if(this._totalTimes < 0) {
                    //不立刻调用的原因是egret.Tween在onComplete之后，还会调用onChange
                    egret.callLater(this.internalPlay,this,0);
                }
                else {
                    this._totalTimes--;
                    if(this._totalTimes > 0)
                    egret.callLater(this.internalPlay,this,0);
                    else {
                        this._playing = false;
                        this._owner.internalVisible--;
                        
                        var cnt: number = this._items.length;
						for (var i:number = 0; i < cnt; i++)
						{
							var item:TransitionItem = this._items[i];
							if (item.target != null)
							{
								if((this._options & Transition.OPTION_IGNORE_DISPLAY_CONTROLLER) != 0 && item.target!=this._owner)
									item.target.internalVisible--;
							}
							
							if (item.filterCreated)
							{
								item.filterCreated = false;
								item.target.filters = null;
							}
						}

                        if(this._onComplete != null) {
                            var func: Function = this._onComplete;
                            var param: any = this._onCompleteParam;
                            var thisObj: any = this._onCompleteObj;
                            this._onComplete = null;
                            this._onCompleteParam = null;
                            this._onCompleteObj = null;
                            if(func.length > 0)
                                func.call(thisObj, param);
                            else
                                func.call(thisObj);
                        }
                    }
                }
            }
        }

        private applyValue(item: TransitionItem,value: TransitionValue) {
            item.target._gearLocked = true;
            switch(item.type) {
                case TransitionActionType.XY:
                    if(item.target == this._owner) {
                        var f1: number = 0,f2: number = 0;
                        if(!value.b1)
                            f1 = item.target.x;
                        else
                            f1 = value.f1 + this._ownerBaseX;
                        if(!value.b2)
                            f2 = item.target.y;
                        else
                            f2 = value.f2 + this._ownerBaseY;
                        item.target.setXY(f1,f2);
                    }
                    else {
                        if(!value.b1)
                            value.f1 = item.target.x;
                        if(!value.b2)
                            value.f2 = item.target.y;
                        item.target.setXY(value.f1,value.f2);
                    }
                    break;
                case TransitionActionType.Size:
                    if(!value.b1)
                        value.f1 = item.target.width;
                    if(!value.b2)
                        value.f2 = item.target.height;
                    item.target.setSize(value.f1,value.f2);
                    break;
                case TransitionActionType.Pivot:
                    item.target.setPivot(value.f1,value.f2);
                    break;
                case TransitionActionType.Alpha:
                    item.target.alpha = value.f1;
                    break;
                case TransitionActionType.Rotation:
                    item.target.rotation = value.i;
                    break;
                case TransitionActionType.Scale:
                    item.target.setScale(value.f1,value.f2);
                    break;
                case TransitionActionType.Skew:
					item.target.setSkew(value.f1, value.f2);
					break;
                case TransitionActionType.Color:
                    (<IColorGear><any>item.target).color = value.c;
                    break;
                case TransitionActionType.Animation:
                    if(!value.b1)
                        value.i = (<IAnimationGear><any>item.target).frame;
                    (<IAnimationGear><any>item.target).frame = value.i;
                    (<IAnimationGear><any>item.target).playing = value.b;
                    break;
                case TransitionActionType.Visible:
                    item.target.visible = value.b;
                    break;
                case TransitionActionType.Transition:
                    var trans: fairygui.Transition = (<GComponent><any>item.target).getTransition(value.s);
                    if(trans != null) {
                        if(value.i == 0)
                            trans.stop(false,true);
                        else if(trans.playing)
                            trans._totalTimes = value.i==-1?Number.MAX_VALUE:value.i;
                        else {
                            item.completed = false;
                            this._totalTasks++;
                            if(this._reversed)
                                trans.playReverse(this.__playTransComplete,this,item,item.value.i);
                            else
                                trans.play(this.__playTransComplete, this, item,item.value.i);
                        }
                    }
                    break;
                case TransitionActionType.Sound:
                    var pi: PackageItem = UIPackage.getItemByURL(value.s);
                    if(pi) {
                        var sound: egret.Sound = <egret.Sound> pi.owner.getItemAsset(pi);
                        if(sound)
                            GRoot.inst.playOneShotSound(sound,value.f1);
                    }
                    break;
                case TransitionActionType.Shake:
                    item.startValue.f1 = 0;//offsetX
                    item.startValue.f2 = 0;//offsetY
                    item.startValue.f3 = item.value.f2;//shakePeriod
                    item.startValue.i = egret.getTimer();//startTime
                    GTimers.inst.add(1,0, this.__shake,item, this);
                    this._totalTasks++;
                    item.completed = false;
                    break;

                case TransitionActionType.ColorFilter:
					var arr:egret.Filter[] = item.target.filters;
                    var cf:egret.ColorMatrixFilter;
					if(!arr || !(arr[0] instanceof egret.ColorMatrixFilter))
                    {
                        cf = new egret.ColorMatrixFilter();
						arr = [cf];
                        item.filterCreated = true;					    
                    }
                    else
                        cf = <egret.ColorMatrixFilter>arr[0];
                    var cm:ColorMatrix = new ColorMatrix();
                    cm.adjustBrightness(value.f1);
					cm.adjustContrast(value.f2);
					cm.adjustSaturation(value.f3);
					cm.adjustHue(value.f4);
                    cf.matrix = cm.matrix;
					item.target.filters = arr;
            }
            item.target._gearLocked = false;
        }

        private __shake(trans: Transition) {
            var item: TransitionItem = <TransitionItem><any>this;
            trans.__shakeItem(item);
        }
        
        private __shakeItem(item:TransitionItem) {
            var r: number = Math.ceil(item.value.f1 * item.startValue.f3 / item.value.f2);
            var rx: number = (Math.random() * 2 - 1) * r;
            var ry: number = (Math.random() * 2 - 1) * r;
            rx = rx > 0 ? Math.ceil(rx) : Math.floor(rx);
            ry = ry > 0 ? Math.ceil(ry) : Math.floor(ry);
            item.target._gearLocked = true;
            item.target.setXY(item.target.x - item.startValue.f1 + rx, item.target.y - item.startValue.f2 + ry);
            item.target._gearLocked = false;
            item.startValue.f1 = rx;
            item.startValue.f2 = ry;
            var t: number = egret.getTimer();
            item.startValue.f3 -= (t - item.startValue.i) / 1000;
            item.startValue.i = t;
            if(item.startValue.f3 <= 0) {
                item.target._gearLocked= true;
                item.target.setXY(item.target.x - item.startValue.f1,item.target.y - item.startValue.f2);
                item.target._gearLocked = false;
                item.completed = true;
                this._totalTasks--;
                GTimers.inst.remove(this.__shake,item);
                this.checkAllComplete();
            }
        }

        public setup(xml: any) {
            this.name = xml.attributes.name;
            var str: string = xml.attributes.options;
            if(str)
                this._options = parseInt(str);
            this._autoPlay = xml.attributes.autoPlay=="true";
            if(this._autoPlay) {
                str = xml.attributes.autoPlayRepeat;
                if(str)
                    this.autoPlayRepeat = parseInt(str);
                str = xml.attributes.autoPlayDelay;
                if(str)
                    this.autoPlayDelay = parseFloat(str);
            }
                
            var col: any = xml.children;
            var length1: number = col.length;
            for(var i1: number = 0;i1 < length1;i1++) {
                var cxml: any = col[i1];
                if(cxml.name != "item")
                    continue;
                    
                var item: TransitionItem = new TransitionItem();
                this._items.push(item);
                item.time = parseInt(cxml.attributes.time) / Transition.FRAME_RATE;
                item.targetId = cxml.attributes.target;
                str = cxml.attributes.type;
                switch(str) {
                    case "XY":
                        item.type = TransitionActionType.XY;
                        break;
                    case "Size":
                        item.type = TransitionActionType.Size;
                        break;
                    case "Scale":
                        item.type = TransitionActionType.Scale;
                        break;
                    case "Pivot":
                        item.type = TransitionActionType.Pivot;
                        break;
                    case "Alpha":
                        item.type = TransitionActionType.Alpha;
                        break;
                    case "Rotation":
                        item.type = TransitionActionType.Rotation;
                        break;
                    case "Color":
                        item.type = TransitionActionType.Color;
                        break;
                    case "Animation":
                        item.type = TransitionActionType.Animation;
                        break;
                    case "Visible":
                        item.type = TransitionActionType.Visible;
                        break;
                    case "Sound":
                        item.type = TransitionActionType.Sound;
                        break;
                    case "Transition":
                        item.type = TransitionActionType.Transition;
                        break;
                    case "Shake":
                        item.type = TransitionActionType.Shake;
                        break;
                	case "ColorFilter":
						item.type = TransitionActionType.ColorFilter;
						break;
					case "Skew":
						item.type = TransitionActionType.Skew;
						break;
                    default:
                        item.type = TransitionActionType.Unknown;
                        break;
                }
                item.tween = cxml.attributes.tween == "true";
                item.label = cxml.attributes.label;
                if(item.tween) {
                    item.duration = parseInt(cxml.attributes.duration) / Transition.FRAME_RATE;
                    if(item.time + item.duration > this._maxTime)
                        this._maxTime = item.time + item.duration;
                    str = cxml.attributes.ease;
                    if(str)
                        item.easeType = ParseEaseType(str);
                    str = cxml.attributes.repeat;
                    if(str)
                        item.repeat = parseInt(str);
                    item.yoyo = cxml.attributes.yoyo == "true";
                    item.label2 = cxml.attributes.label2;
                    var v: string = cxml.attributes.endValue;
                    if(v) {
                        this.decodeValue(item.type,cxml.attributes.startValue,item.startValue);
                        this.decodeValue(item.type,v,item.endValue);
                    }
                    else {
                        item.tween = false;
                        this.decodeValue(item.type,cxml.attributes.startValue,item.value);
                    }
                }
                else {
                    if(item.time > this._maxTime)
                        this._maxTime = item.time;
                    this.decodeValue(item.type,cxml.attributes.value,item.value);
                }
            }
        }

        private decodeValue(type: number,str: string,value: TransitionValue) {
            var arr: Array<any>;
            switch(type) {
                case TransitionActionType.XY:
                case TransitionActionType.Size:
                case TransitionActionType.Pivot:
                case TransitionActionType.Skew:
                    arr = str.split(",");
                    if(arr[0] == "-") {
                        value.b1 = false;
                    }
                    else {
                        value.f1 = parseFloat(arr[0]);
                        value.b1 = true;
                    }
                    if(arr[1] == "-") {
                        value.b2 = false;
                    }
                    else {
                        value.f2 = parseFloat(arr[1]);
                        value.b2 = true;
                    }
                    break;
                case TransitionActionType.Alpha:
                    value.f1 = parseFloat(str);
                    break;
                case TransitionActionType.Rotation:
                    value.i = parseInt(str);
                    break;
                case TransitionActionType.Scale:
                    arr = str.split(",");
                    value.f1 = parseFloat(arr[0]);
                    value.f2 = parseFloat(arr[1]);
                    break;
                case TransitionActionType.Color:
                    value.c = ToolSet.convertFromHtmlColor(str);
                    break;
                case TransitionActionType.Animation:
                    arr = str.split(",");
                    if(arr[0] == "-") {
                        value.b1 = false;
                    }
                    else {
                        value.i = parseInt(arr[0]);
                        value.b1 = true;
                    }
                    value.b = arr[1] == "p";
                    break;
                case TransitionActionType.Visible:
                    value.b = str == "true";
                    break;
                case TransitionActionType.Sound:
                    arr = str.split(",");
                    value.s = arr[0];
                    if(arr.length > 1) {
                        var intv: number = parseInt(arr[1]);
                        if(intv == 0 || intv == 100)
                            value.f1 = 1;
                        else
                            value.f1 = intv / 100;
                    }
                    else
                        value.f1 = 1;
                    break;
                case TransitionActionType.Transition:
                    arr = str.split(",");
                    value.s = arr[0];
                    if(arr.length > 1)
                        value.i = parseInt(arr[1]);
                    else
                        value.i = 1;
                    break;
                case TransitionActionType.Shake:
                    arr = str.split(",");
                    value.f1 = parseFloat(arr[0]);
                    value.f2 = parseFloat(arr[1]);
                    break;

                case TransitionActionType.ColorFilter:
					arr = str.split(",");
					value.f1 = parseFloat(arr[0]);
					value.f2 = parseFloat(arr[1]);
					value.f3 = parseFloat(arr[2]);
					value.f4 = parseFloat(arr[3]);
					break;
            }
        }

    }

    class TransitionActionType  {

        public static XY: number = 0;
        public static Size: number = 1;
        public static Scale: number = 2;
        public static Pivot: number = 3;
        public static Alpha: number = 4;
        public static Rotation: number = 5;
        public static Color: number = 6;
        public static Animation: number = 7;
        public static Visible: number = 8;
        public static Sound: number=9;
        public static Transition: number=10;
        public static Shake: number = 11;
        public static ColorFilter: number = 12;
        public static Skew: number = 13;
        public static Unknown: number = 14;
    }

    class TransitionItem {
        public time: number = 0;
        public targetId: string;
        public type: number = 0;
        public duration: number = 0;
        public value: TransitionValue;
        public startValue: TransitionValue;
        public endValue: TransitionValue;
        public easeType: Function;
        public repeat: number = 0;
        public yoyo: boolean = false;
        public tween: boolean = false;
        public label: string;
        public label2: string;
        public hook: Function;
        public hookObj: any;
        public hook2: Function;
        public hook2Obj: any;
        
        public tweenTimes: number = 0;
        
        public tweener: egret.Tween;
        public completed: boolean = false;
        public target: fairygui.GObject;
        public filterCreated: boolean;

        public constructor() {
            this.easeType = egret.Ease.quadOut;
            this.value = new TransitionValue();
            this.startValue = new TransitionValue();
            this.endValue = new TransitionValue();
        }
    }

    class TransitionValue {
        public f1: number = 0;
        public f2: number = 0;
        public f3: number = 0;
        public f4: number = 0;
        public i: number = 0;
        public c: number = 0;
        public b: boolean = false;
        public s: string;
        public b1: boolean = true;
        public b2: boolean = true;
    }
}                                                                                                                                                                                      
                                                                                                                                                                                                                                                    