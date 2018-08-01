module fairygui {
    export class Transition {

        public name: string;

        private _owner: GComponent;
        private _ownerBaseX: number = 0;
        private _ownerBaseY: number = 0;
        private _items: Array<TransitionItem>;
        private _totalTimes: number = 0;
        private _totalTasks: number = 0;
        private _playing: boolean = false;
        private _paused: boolean = false;
        private _onComplete: Function;
        private _onCompleteCaller: any;
        private _onCompleteParam: any;
        private _options: number = 0;
        private _reversed: boolean = false;
        private _totalDuration: number = 0;
        private _autoPlay: boolean = false;
        private _autoPlayTimes: number = 1;
        private _autoPlayDelay: number = 0;
        private _timeScale: number = 1;
        private _startTime: number = 0;
        private _endTime: number = 0;

        public static OPTION_IGNORE_DISPLAY_CONTROLLER: number = 1;
        public static OPTION_AUTO_STOP_DISABLED: number = 2;
        public static OPTION_AUTO_STOP_AT_END: number = 4;

        public constructor(owner: GComponent) {
            this._owner = owner;
            this._items = new Array<TransitionItem>();
        }

        public play(onComplete: Function = null, onCompleteObj: any = null, onCompleteParam: any = null,
            times: number = 1, delay: number = 0, startTime: number = 0, endTime: number = -1) {
            this._play(onComplete, onCompleteObj, onCompleteParam, times, delay, startTime, endTime, false);
        }

        public playReverse(onComplete: Function = null, onCompleteObj: any = null, onCompleteParam: any = null,
            times: number = 1, delay: number = 0) {
            this._play(onComplete, onCompleteObj, onCompleteParam, times, delay, 0, -1, true);
        }

        public changePlayTimes(value: number): void {
            this._totalTimes = value;
        }

        public setAutoPlay(value: boolean, times: number = -1, delay: number = 0) {
            if (this._autoPlay != value) {
                this._autoPlay = value;
                this._autoPlayTimes = times;
                this._autoPlayDelay = delay;

                if (this._autoPlay) {
                    if (this._owner.onStage)
                        this.play(null, null, this._autoPlayTimes, this._autoPlayDelay);
                }
                else {
                    if (!this._owner.onStage)
                        this.stop(false, true);
                }
            }
        }

        private _play(onComplete: Function = null, onCompleteCaller: any = null, onCompleteParam: any = null,
            times: number = 1, delay: number = 0, startTime: number = 0, endTime: number = -1, reversed: boolean = false) {
            this.stop(true, true);

            this._totalTimes = times;
            this._reversed = reversed;
            this._startTime = startTime;
            this._endTime = endTime;
            this._playing = true;
            this._paused = false;
            this._onComplete = onComplete;
            this._onCompleteParam = onCompleteParam;
            this._onCompleteCaller = onCompleteCaller;

            var cnt: number = this._items.length;
            for (var i: number = 0; i < cnt; i++) {
                var item: TransitionItem = this._items[i];
                if (item.target == null) {
                    if (item.targetId)
                        item.target = this._owner.getChildById(item.targetId);
                    else
                        item.target = this._owner;
                }
                else if (item.target != this._owner && item.target.parent != this._owner)
                    item.target = null;

                if (item.target != null && item.type == TransitionActionType.Transition) {
                    var trans: Transition = (item.target as GComponent).getTransition(item.value.transName);
                    if (trans == this)
                        trans = null;
                    if (trans != null) {
                        if (item.value.playTimes == 0) //stop
                        {
                            var j: number;
                            for (j = i - 1; j >= 0; j--) {
                                var item2: TransitionItem = this._items[j];
                                if (item2.type == TransitionActionType.Transition) {
                                    if (item2.value.trans == trans) {
                                        item2.value.stopTime = item.time - item2.time;
                                        break;
                                    }
                                }
                            }
                            if (j < 0)
                                item.value.stopTime = 0;
                            else
                                trans = null;//no need to handle stop anymore
                        }
                        else
                            item.value.stopTime = -1;
                    }
                    item.value.trans = trans;
                }
            }

            if (delay == 0)
                this.onDelayedPlay();
            else
                tween.GTween.delayedCall(delay).onComplete(this.onDelayedPlay, this);
        }

        public stop(setToComplete: boolean = true, processCallback: boolean = false): void {
            if (!this._playing)
                return;

            this._playing = false;
            this._totalTasks = 0;
            this._totalTimes = 0;
            var func: Function = this._onComplete;
            var param: any = this._onCompleteParam;
            var thisObj: any = this._onCompleteCaller;
            this._onComplete = null;
            this._onCompleteParam = null;
            this._onCompleteCaller = null;

            tween.GTween.kill(this);//delay start

            var cnt: number = this._items.length;
            if (this._reversed) {
                for (var i: number = cnt - 1; i >= 0; i--) {
                    var item: TransitionItem = this._items[i];
                    if (item.target == null)
                        continue;

                    this.stopItem(item, setToComplete);
                }
            }
            else {
                for (i = 0; i < cnt; i++) {
                    item = this._items[i];
                    if (item.target == null)
                        continue;

                    this.stopItem(item, setToComplete);
                }
            }

            if (processCallback && func != null) {
                func.call(thisObj, param);
            }
        }

        private stopItem(item: TransitionItem, setToComplete: boolean): void {
            if (item.displayLockToken != 0) {
                item.target.releaseDisplayLock(item.displayLockToken);
                item.displayLockToken = 0;
            }

            if (item.tweener != null) {
                item.tweener.kill(setToComplete);
                item.tweener = null;

                if (item.type == TransitionActionType.Shake && !setToComplete) //震动必须归位，否则下次就越震越远了。
                {
                    item.target._gearLocked = true;
                    item.target.setXY(item.target.x - item.value.lastOffsetX, item.target.y - item.value.lastOffsetY);
                    item.target._gearLocked = false;
                }
            }

            if (item.type == TransitionActionType.Transition) {
                var trans: Transition = item.value.trans;
                if (trans != null)
                    trans.stop(setToComplete, false);
            }
        }

        public setPaused(paused: boolean): void {
            if (!this._playing || this._paused == paused)
                return;

            this._paused = paused;
            var tweener: tween.GTweener = tween.GTween.getTween(this);
            if (tweener != null)
                tweener.setPaused(paused);

            var cnt: number = this._items.length;
            for (var i: number = 0; i < cnt; i++) {
                var item: TransitionItem = this._items[i];
                if (item.target == null)
                    continue;

                if (item.type == TransitionActionType.Transition) {
                    if (item.value.trans != null)
                        item.value.trans.setPaused(paused);
                }
                else if (item.type == TransitionActionType.Animation) {
                    if (paused) {
                        item.value.flag = (<any>(item.target)).playing;
                        (<any>(item.target)).playing = false;
                    }
                    else
                        (<any>(item.target)).playing = item.value.flag;
                }

                if (item.tweener != null)
                    item.tweener.setPaused(paused);
            }
        }

        public dispose(): void {
            if (this._playing)
                tween.GTween.kill(this);//delay start

            var cnt: number = this._items.length;
            for (var i: number = 0; i < cnt; i++) {
                var item: TransitionItem = this._items[i];
                if (item.tweener != null) {
                    item.tweener.kill();
                    item.tweener = null;
                }

                item.target = null;
                item.hook = null;
                if (item.tweenConfig != null)
                    item.tweenConfig.endHook = null;
            }

            this._items.length = 0;
            this._playing = false;
            this._onComplete = null;
            this._onCompleteCaller = null;
            this._onCompleteParam = null;
        }

        public get playing(): boolean {
            return this._playing;
        }

        public setValue(label: string, ...args): void {
            var cnt: number = this._items.length;
            var value: any;
            for (var i: number = 0; i < cnt; i++) {
                var item: TransitionItem = this._items[i];
                if (item.label == label) {
                    if (item.tweenConfig != null)
                        value = item.tweenConfig.startValue;
                    else
                        value = item.value;
                }
                else if (item.tweenConfig != null && item.tweenConfig.endLabel == label) {
                    value = item.tweenConfig.endValue;
                }
                else
                    continue;

                switch (item.type) {
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
                        value.f1 = parseFloat(args[0]);
                        break;

                    case TransitionActionType.Color:
                        value.f1 = parseFloat(args[0]);
                        break;

                    case TransitionActionType.Animation:
                        value.frame = parseInt(args[0]);
                        if (args.length > 1)
                            value.playing = args[1];
                        break;

                    case TransitionActionType.Visible:
                        value.visible = args[0];
                        break;

                    case TransitionActionType.Sound:
                        value.sound = args[0];
                        if (args.length > 1)
                            value.volume = parseFloat(args[1]);
                        break;

                    case TransitionActionType.Transition:
                        value.transName = args[0];
                        if (args.length > 1)
                            value.playTimes = parseInt(args[1]);
                        break;

                    case TransitionActionType.Shake:
                        value.amplitude = parseFloat(args[0]);
                        if (args.length > 1)
                            value.duration = parseFloat(args[1]);
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

        public setHook(label: string, callback: Function, caller: any): void {
            var cnt: number = this._items.length;
            for (var i: number = 0; i < cnt; i++) {
                var item: TransitionItem = this._items[i];
                if (item.label == label) {
                    item.hook = callback;
                    item.hookCaller = caller;
                    break;
                }
                else if (item.tweenConfig != null && item.tweenConfig.endLabel == label) {
                    item.tweenConfig.endHook = callback;
                    item.tweenConfig.endHookCaller = caller;
                    break;
                }
            }
        }

        public clearHooks(): void {
            var cnt: number = this._items.length;
            for (var i: number = 0; i < cnt; i++) {
                var item: TransitionItem = this._items[i];
                item.hook = null;
                item.hookCaller = null;
                if (item.tweenConfig != null) {
                    item.tweenConfig.endHook = null;
                    item.tweenConfig.endHookCaller = null;
                }
            }
        }

        public setTarget(label: string, newTarget: GObject): void {
            var cnt: number = this._items.length;
            for (var i: number = 0; i < cnt; i++) {
                var item: TransitionItem = this._items[i];
                if (item.label == label)
                    item.targetId = newTarget.id;
            }
        }

        public setDuration(label: string, value: number): void {
            var cnt: number = this._items.length;
            for (var i: number = 0; i < cnt; i++) {
                var item: TransitionItem = this._items[i];
                if (item.tweenConfig != null && item.label == label)
                    item.tweenConfig.duration = value;
            }
        }

        public getLabelTime(label: string): number {
            var cnt: number = this._items.length;
            for (var i: number = 0; i < cnt; i++) {
                var item: TransitionItem = this._items[i];
                if (item.label == label)
                    return item.time;
                else if (item.tweenConfig != null && item.tweenConfig.endLabel == label)
                    return item.time + item.tweenConfig.duration;
            }

            return Number.NaN;
        }

        public get timeScale(): number {
            return this._timeScale;
        }

        public set timeScale(value: number) {
            this._timeScale = value;
            if (this._timeScale != value) {
                if (this._playing) {
                    var cnt: number = this._items.length;
                    for (var i: number = 0; i < cnt; i++) {
                        var item: TransitionItem = this._items[i];
                        if (item.tweener != null)
                            item.tweener.setTimeScale(value);
                        else if (item.type == TransitionActionType.Transition) {
                            if (item.value.trans != null)
                                item.value.trans.timeScale = value;
                        }
                        else if (item.type == TransitionActionType.Animation) {
                            if (item.target != null)
                                (<any>(item.target)).timeScale = value;
                        }
                    }
                }
            }
        }

        public updateFromRelations(targetId: string, dx: number, dy: number): void {
            var cnt: number = this._items.length;
            if (cnt == 0)
                return;

            for (var i: number = 0; i < cnt; i++) {
                var item: TransitionItem = this._items[i];
                if (item.type == TransitionActionType.XY && item.targetId == targetId) {
                    if (item.tweenConfig != null) {
                        item.tweenConfig.startValue.f1 += dx;
                        item.tweenConfig.startValue.f2 += dy;
                        item.tweenConfig.endValue.f1 += dx;
                        item.tweenConfig.endValue.f2 += dy;
                    }
                    else {
                        item.value.f1 += dx;
                        item.value.f2 += dy;
                    }
                }
            }
        }

        public onOwnerAddedToStage(): void {
            if (this._autoPlay && !this._playing)
                this.play(null, null, null, this._autoPlayTimes, this._autoPlayDelay);
        }

        public onOwnerRemovedFromStage(): void {
            if ((this._options & Transition.OPTION_AUTO_STOP_DISABLED) == 0)
                this.stop((this._options & Transition.OPTION_AUTO_STOP_AT_END) != 0 ? true : false, false);
        }

        private onDelayedPlay(): void {
            this.internalPlay();

            this._playing = this._totalTasks > 0;
            if (this._playing) {
                if ((this._options & Transition.OPTION_IGNORE_DISPLAY_CONTROLLER) != 0) {
                    var cnt: number = this._items.length;
                    for (var i: number = 0; i < cnt; i++) {
                        var item: TransitionItem = this._items[i];
                        if (item.target != null && item.target != this._owner)
                            item.displayLockToken = item.target.addDisplayLock();
                    }
                }
            }
            else if (this._onComplete != null) {
                var func: Function = this._onComplete;
                var param: any = this._onCompleteParam;
                var thisObj: any = this._onCompleteCaller;
                this._onComplete = null;
                this._onCompleteParam = null;
                this._onCompleteCaller = null;
                func.call(thisObj, param);
            }
        }

        private internalPlay(): void {
            this._ownerBaseX = this._owner.x;
            this._ownerBaseY = this._owner.y;

            this._totalTasks = 0;

            var cnt: number = this._items.length;
            var item: TransitionItem;
            var needSkipAnimations: boolean = false;

            if (!this._reversed) {
                for (var i: number = 0; i < cnt; i++) {
                    item = this._items[i];
                    if (item.target == null)
                        continue;

                    if (item.type == TransitionActionType.Animation && this._startTime != 0 && item.time <= this._startTime) {
                        needSkipAnimations = true;
                        item.value.flag = false;
                    }
                    else
                        this.playItem(item);
                }
            }
            else {
                for (i = 0; i < cnt; i++) {
                    item = this._items[i];
                    if (item.target == null)
                        continue;

                    this.playItem(item);
                }
            }

            if (needSkipAnimations)
                this.skipAnimations();
        }

        private playItem(item: TransitionItem): void {
            var time: number;
            if (item.tweenConfig != null) {
                if (this._reversed)
                    time = (this._totalDuration - item.time - item.tweenConfig.duration);
                else
                    time = item.time;
                if (this._endTime == -1 || time <= this._endTime) {
                    var startValue: TValue;
                    var endValue: TValue;
                    if (this._reversed) {
                        startValue = item.tweenConfig.endValue;
                        endValue = item.tweenConfig.startValue;
                    }
                    else {
                        startValue = item.tweenConfig.startValue;
                        endValue = item.tweenConfig.endValue;
                    }

                    item.value.b1 = startValue.b1 || endValue.b1;
                    item.value.b2 = startValue.b2 || endValue.b2;

                    switch (item.type) {
                        case TransitionActionType.XY:
                        case TransitionActionType.Size:
                        case TransitionActionType.Scale:
                        case TransitionActionType.Skew:
                            item.tweener = tween.GTween.to2(startValue.f1, startValue.f2, endValue.f1, endValue.f2, item.tweenConfig.duration);
                            break;

                        case TransitionActionType.Alpha:
                        case TransitionActionType.Rotation:
                            item.tweener = tween.GTween.to(startValue.f1, endValue.f1, item.tweenConfig.duration);
                            break;

                        case TransitionActionType.Color:
                            item.tweener = tween.GTween.toColor(startValue.f1, endValue.f1, item.tweenConfig.duration);
                            break;

                        case TransitionActionType.ColorFilter:
                            item.tweener = tween.GTween.to4(startValue.f1, startValue.f2, startValue.f3, startValue.f4,
                                endValue.f1, endValue.f2, endValue.f3, endValue.f4, item.tweenConfig.duration);
                            break;
                    }

                    item.tweener.setDelay(time)
                        .setEase(item.tweenConfig.easeType)
                        .setRepeat(item.tweenConfig.repeat, item.tweenConfig.yoyo)
                        .setTimeScale(this._timeScale)
                        .setTarget(item)
                        .onStart(this.onTweenStart, this)
                        .onUpdate(this.onTweenUpdate, this)
                        .onComplete(this.onTweenComplete, this);

                    if (this._endTime >= 0)
                        item.tweener.setBreakpoint(this._endTime - time);

                    this._totalTasks++;
                }
            }
            else if (item.type == TransitionActionType.Shake) {
                if (this._reversed)
                    time = (this._totalDuration - item.time - item.value.duration);
                else
                    time = item.time;

                item.value.offsetX = item.value.offsetY = 0;
                item.value.lastOffsetX = item.value.lastOffsetY = 0;
                item.tweener = tween.GTween.shake(0, 0, item.value.amplitude, item.value.duration)
                    .setDelay(time)
                    .setTimeScale(this._timeScale)
                    .setTarget(item)
                    .onUpdate(this.onTweenUpdate, this)
                    .onComplete(this.onTweenComplete, this);

                if (this._endTime >= 0)
                    item.tweener.setBreakpoint(this._endTime - item.time);

                this._totalTasks++;
            }
            else {
                if (this._reversed)
                    time = (this._totalDuration - item.time);
                else
                    time = item.time;

                if (time <= this._startTime) {
                    this.applyValue(item);
                    this.callHook(item, false);
                }
                else if (this._endTime == -1 || time <= this._endTime) {
                    this._totalTasks++;
                    item.tweener = tween.GTween.delayedCall(time)
                        .setTimeScale(this._timeScale)
                        .setTarget(item)
                        .onComplete(this.onDelayedPlayItem, this);
                }
            }

            if (item.tweener != null)
                item.tweener.seek(this._startTime);
        }

        private skipAnimations(): void {
            var frame: number;
            var playStartTime: number;
            var playTotalTime: number;
            var value: any;
            var target: any;
            var item: TransitionItem;

            var cnt: number = this._items.length;
            for (var i: number = 0; i < cnt; i++) {
                item = this._items[i];
                if (item.type != TransitionActionType.Animation || item.time > this._startTime)
                    continue;

                value = item.value;
                if (value.flag)
                    continue;

                target = item.target;
                frame = target.frame;
                playStartTime = target.playing ? 0 : -1;
                playTotalTime = 0;

                for (var j: number = i; j < cnt; j++) {
                    item = this._items[j];
                    if (item.type != TransitionActionType.Animation || item.target != target || item.time > this._startTime)
                        continue;

                    value = item.value;
                    value.flag = true;

                    if (value.frame != -1) {
                        frame = value.frame;
                        if (value.playing)
                            playStartTime = item.time;
                        else
                            playStartTime = -1;
                        playTotalTime = 0;
                    }
                    else {
                        if (value.playing) {
                            if (playStartTime < 0)
                                playStartTime = item.time;
                        }
                        else {
                            if (playStartTime >= 0)
                                playTotalTime += (item.time - playStartTime);
                            playStartTime = -1;
                        }
                    }

                    this.callHook(item, false);
                }

                if (playStartTime >= 0)
                    playTotalTime += (this._startTime - playStartTime);

                target.playing = playStartTime >= 0;
                target.frame = frame;
                if (playTotalTime > 0)
                    target.advance(playTotalTime * 1000);
            }
        }

        private onDelayedPlayItem(tweener: tween.GTweener): void {
            var item: TransitionItem = tweener.target as TransitionItem;
            item.tweener = null;
            this._totalTasks--;

            this.applyValue(item);
            this.callHook(item, false);

            this.checkAllComplete();
        }

        private onTweenStart(tweener: tween.GTweener): void {
            var item: TransitionItem = tweener.target as TransitionItem;

            if (item.type == TransitionActionType.XY || item.type == TransitionActionType.Size) //位置和大小要到start才最终确认起始值
            {
                var startValue: TValue;
                var endValue: TValue;

                if (this._reversed) {
                    startValue = item.tweenConfig.endValue;
                    endValue = item.tweenConfig.startValue;
                }
                else {
                    startValue = item.tweenConfig.startValue;
                    endValue = item.tweenConfig.endValue;
                }

                if (item.type == TransitionActionType.XY) {
                    if (item.target != this._owner) {
                        if (!startValue.b1)
                            startValue.f1 = item.target.x;
                        if (!startValue.b2)
                            startValue.f2 = item.target.y;
                    }
                }
                else {
                    if (!startValue.b1)
                        startValue.f1 = item.target.width;
                    if (!startValue.b2)
                        startValue.f2 = item.target.height;
                }

                if (!endValue.b1)
                    endValue.f1 = startValue.f1;
                if (!endValue.b2)
                    endValue.f2 = startValue.f2;

                tweener.startValue.x = startValue.f1;
                tweener.startValue.y = startValue.f2;
                tweener.endValue.x = endValue.f1;
                tweener.endValue.y = endValue.f2;
            }

            this.callHook(item, false);
        }

        private onTweenUpdate(tweener: tween.GTweener): void {
            var item: TransitionItem = tweener.target as TransitionItem;
            switch (item.type) {
                case TransitionActionType.XY:
                case TransitionActionType.Size:
                case TransitionActionType.Scale:
                case TransitionActionType.Skew:
                    item.value.f1 = tweener.value.x;
                    item.value.f2 = tweener.value.y;
                    break;

                case TransitionActionType.Alpha:
                case TransitionActionType.Rotation:
                    item.value.f1 = tweener.value.x;
                    break;

                case TransitionActionType.Color:
                    item.value.f1 = tweener.value.color;
                    break;

                case TransitionActionType.ColorFilter:
                    item.value.f1 = tweener.value.x;
                    item.value.f2 = tweener.value.y;
                    item.value.f3 = tweener.value.z;
                    item.value.f4 = tweener.value.w;
                    break;

                case TransitionActionType.Shake:
                    item.value.offsetX = tweener.deltaValue.x;
                    item.value.offsetY = tweener.deltaValue.y;
                    break;
            }

            this.applyValue(item);
        }

        private onTweenComplete(tweener: tween.GTweener): void {
            var item: TransitionItem = tweener.target as TransitionItem;
            item.tweener = null;
            this._totalTasks--;

            if (tweener.allCompleted) //当整体播放结束时间在这个tween的中间时不应该调用结尾钩子
                this.callHook(item, true);

            this.checkAllComplete();
        }

        private onPlayTransCompleted(item: TransitionItem): void {
            this._totalTasks--;

            this.checkAllComplete();
        }

        private callHook(item: TransitionItem, tweenEnd: boolean): void {
            if (tweenEnd) {
                if (item.tweenConfig != null && item.tweenConfig.endHook != null)
                    item.tweenConfig.endHook.call(item.tweenConfig.endHookCaller);
            }
            else {
                if (item.time >= this._startTime && item.hook != null)
                    item.hook.call(item.hookCaller);
            }
        }

        private checkAllComplete(): void {
            if (this._playing && this._totalTasks == 0) {
                if (this._totalTimes < 0) {
                    this.internalPlay();
                }
                else {
                    this._totalTimes--;
                    if (this._totalTimes > 0)
                        this.internalPlay();
                    else {
                        this._playing = false;

                        var cnt: number = this._items.length;
                        for (var i: number = 0; i < cnt; i++) {
                            var item: TransitionItem = this._items[i];
                            if (item.target != null && item.displayLockToken != 0) {
                                item.target.releaseDisplayLock(item.displayLockToken);
                                item.displayLockToken = 0;
                            }
                        }

                        if (this._onComplete != null) {
                            var func: Function = this._onComplete;
                            var param: any = this._onCompleteParam;
                            var thisObj: any = this._onCompleteCaller;
                            this._onComplete = null;
                            this._onCompleteParam = null;
                            this._onCompleteCaller = null;
                            func.call(thisObj, param);
                        }
                    }
                }
            }
        }

        private applyValue(item: TransitionItem): void {
            item.target._gearLocked = true;

            switch (item.type) {
                case TransitionActionType.XY:
                    if (item.target == this._owner) {
                        var f1: number, f2: number;
                        if (!item.value.b1)
                            f1 = item.target.x;
                        else
                            f1 = item.value.f1 + this._ownerBaseX;
                        if (!item.value.b2)
                            f2 = item.target.y;
                        else
                            f2 = item.value.f2 + this._ownerBaseY;
                        item.target.setXY(f1, f2);
                    }
                    else {
                        if (!item.value.b1)
                            item.value.f1 = item.target.x;
                        if (!item.value.b2)
                            item.value.f2 = item.target.y;
                        item.target.setXY(item.value.f1, item.value.f2);
                    }
                    break;

                case TransitionActionType.Size:
                    if (!item.value.b1)
                        item.value.f1 = item.target.width;
                    if (!item.value.b2)
                        item.value.f2 = item.target.height;
                    item.target.setSize(item.value.f1, item.value.f2);
                    break;

                case TransitionActionType.Pivot:
                    item.target.setPivot(item.value.f1, item.value.f2, item.target.pivotAsAnchor);
                    break;

                case TransitionActionType.Alpha:
                    item.target.alpha = item.value.f1;
                    break;

                case TransitionActionType.Rotation:
                    item.target.rotation = item.value.f1;
                    break;

                case TransitionActionType.Scale:
                    item.target.setScale(item.value.f1, item.value.f2);
                    break;

                case TransitionActionType.Skew:
                    //todo
                    break;

                case TransitionActionType.Color:
                    (<any>(item.target)).color = item.value.f1;
                    break;

                case TransitionActionType.Animation:
                    if (item.value.frame >= 0)
                        (<any>(item.target)).frame = item.value.frame;
                    (<any>(item.target)).playing = item.value.playing;
                    (<any>(item.target)).timeScale = this._timeScale;
                    break;

                case TransitionActionType.Visible:
                    item.target.visible = item.value.visible;
                    break;

                case TransitionActionType.Transition:
                    if (this._playing) {
                        var trans: Transition = item.value.trans;
                        if (trans != null) {
                            this._totalTasks++;
                            var startTime: number = this._startTime > item.time ? (this._startTime - item.time) : 0;
                            var endTime: number = this._endTime >= 0 ? (this._endTime - item.time) : -1;
                            if (item.value.stopTime >= 0 && (endTime < 0 || endTime > item.value.stopTime))
                                endTime = item.value.stopTime;
                            trans.timeScale = this._timeScale;
                            trans._play(this.onPlayTransCompleted, this, item, item.value.playTimes, 0, startTime, endTime, this._reversed);
                        }
                    }
                    break;

                case TransitionActionType.Sound:
                    if (this._playing && item.time >= this._startTime) {
                        if (item.value.audioClip == null) {
                            var pi: PackageItem = UIPackage.getItemByURL(item.value.sound);
                            if (pi)
                                item.value.audioClip = <egret.Sound>pi.owner.getItemAsset(pi);
                        }
                        if (item.value.audioClip)
                            GRoot.inst.playOneShotSound(item.value.audioClip, item.value.volume);
                    }
                    break;

                case TransitionActionType.Shake:
                    item.target.setXY(item.target.x - item.value.lastOffsetX + item.value.offsetX, item.target.y - item.value.lastOffsetY + item.value.offsetY);
                    item.value.lastOffsetX = item.value.offsetX;
                    item.value.lastOffsetY = item.value.offsetY;
                    break;

                case TransitionActionType.ColorFilter:
                    {
                        var arr: egret.Filter[] = item.target.filters;
                        var cf: egret.ColorMatrixFilter;
                        if (!arr || !(arr[0] instanceof egret.ColorMatrixFilter)) {
                            cf = new egret.ColorMatrixFilter();
                            arr = [cf];
                        }
                        else
                            cf = <egret.ColorMatrixFilter>arr[0];
                        var cm: ColorMatrix = new ColorMatrix();
                        cm.adjustBrightness(item.value.f1);
                        cm.adjustContrast(item.value.f2);
                        cm.adjustSaturation(item.value.f3);
                        cm.adjustHue(item.value.f4);
                        cf.matrix = cm.matrix;
                        item.target.filters = arr;
                        break;
                    }
            }

            item.target._gearLocked = false;
        }

        public setup(xml: any): void {
            this.name = xml.attributes.name;
            var str: string = xml.attributes.options;
            if (str)
                this._options = parseInt(str);
            this._autoPlay = xml.attributes.autoPlay == "true";
            if (this._autoPlay) {
                str = xml.attributes.autoPlayRepeat;
                if (str)
                    this._autoPlayTimes = parseInt(str);
                str = xml.attributes.autoPlayDelay;
                if (str)
                    this._autoPlayDelay = parseFloat(str);
            }

            str = xml.attributes.fps;
            var frameInterval: number;
            if (str)
                frameInterval = 1 / parseInt(str);
            else
                frameInterval = 1 / 24;

            var col: any = xml.children;
            var length1: number = col.length;
            for (var i1: number = 0; i1 < length1; i1++) {
                var cxml: any = col[i1];
                if (cxml.name != "item")
                    continue;

                str = cxml.attributes.type;
                var item: TransitionItem = new TransitionItem(this.parseItemType(str));
                this._items.push(item);
                item.time = parseInt(cxml.attributes.time) * frameInterval;
                item.targetId = cxml.attributes.target;
                if (cxml.attributes.tween == "true")
                    item.tweenConfig = new TweenConfig();
                item.label = cxml.attributes.label;
                if (item.tweenConfig) {
                    item.tweenConfig.duration = parseInt(cxml.attributes.duration) * frameInterval;
                    if (item.time + item.tweenConfig.duration > this._totalDuration)
                        this._totalDuration = item.time + item.tweenConfig.duration;
                    str = cxml.attributes.ease;
                    if (str)
                        item.tweenConfig.easeType = tween.EaseType.parseEaseType(str);
                    str = cxml.attributes.repeat;
                    if (str)
                        item.tweenConfig.repeat = parseInt(str);
                    item.tweenConfig.yoyo = cxml.attributes.yoyo == "true";
                    item.tweenConfig.endLabel = cxml.attributes.label2;
                    var v: string = cxml.attributes.endValue;
                    if (v) {
                        this.decodeValue(item, cxml.attributes.startValue, item.tweenConfig.startValue);
                        this.decodeValue(item, v, item.tweenConfig.endValue);
                    }
                    else {
                        this.decodeValue(item, cxml.attributes.startValue, item.value);
                    }
                }
                else {
                    if (item.time > this._totalDuration)
                        this._totalDuration = item.time;
                    this.decodeValue(item, cxml.attributes.value, item.value);
                }
            }
        }

        private parseItemType(str: string): number {
            var type: number;
            switch (str) {
                case "XY":
                    type = TransitionActionType.XY;
                    break;
                case "Size":
                    type = TransitionActionType.Size;
                    break;
                case "Scale":
                    type = TransitionActionType.Scale;
                    break;
                case "Pivot":
                    type = TransitionActionType.Pivot;
                    break;
                case "Alpha":
                    type = TransitionActionType.Alpha;
                    break;
                case "Rotation":
                    type = TransitionActionType.Rotation;
                    break;
                case "Color":
                    type = TransitionActionType.Color;
                    break;
                case "Animation":
                    type = TransitionActionType.Animation;
                    break;
                case "Visible":
                    type = TransitionActionType.Visible;
                    break;
                case "Sound":
                    type = TransitionActionType.Sound;
                    break;
                case "Transition":
                    type = TransitionActionType.Transition;
                    break;
                case "Shake":
                    type = TransitionActionType.Shake;
                    break;
                case "ColorFilter":
                    type = TransitionActionType.ColorFilter;
                    break;
                case "Skew":
                    type = TransitionActionType.Skew;
                    break;
                default:
                    type = TransitionActionType.Unknown;
                    break;
            }
            return type;
        }

        private decodeValue(item: TransitionItem, str: string, value: any): void {
            var arr: Array<any>;
            switch (item.type) {
                case TransitionActionType.XY:
                case TransitionActionType.Size:
                case TransitionActionType.Pivot:
                case TransitionActionType.Skew:
                    arr = str.split(",");
                    if (arr[0] == "-") {
                        value.b1 = false;
                    }
                    else {
                        value.f1 = parseFloat(arr[0]);
                        value.b1 = true;
                    }
                    if (arr[1] == "-") {
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
                    value.f1 = parseFloat(str);
                    break;

                case TransitionActionType.Scale:
                    arr = str.split(",");
                    value.f1 = parseFloat(arr[0]);
                    value.f2 = parseFloat(arr[1]);
                    break;

                case TransitionActionType.Color:
                    value.f1 = ToolSet.convertFromHtmlColor(str);
                    break;

                case TransitionActionType.Animation:
                    arr = str.split(",");
                    if (arr[0] == "-")
                        value.frame = -1;
                    else
                        value.frame = parseInt(arr[0]);
                    value.playing = arr[1] == "p";
                    break;

                case TransitionActionType.Visible:
                    value.visible = str == "true";
                    break;

                case TransitionActionType.Sound:
                    arr = str.split(",");
                    value.sound = arr[0];
                    if (arr.length > 1) {
                        var intv: number = parseInt(arr[1]);
                        if (intv == 0 || intv == 100)
                            value.volume = 1;
                        else
                            value.volume = intv / 100;
                    }
                    else
                        value.volume = 1;
                    break;

                case TransitionActionType.Transition:
                    arr = str.split(",");
                    value.transName = arr[0];
                    if (arr.length > 1)
                        value.playTimes = parseInt(arr[1]);
                    else
                        value.playTimes = 1;
                    break;

                case TransitionActionType.Shake:
                    arr = str.split(",");
                    value.amplitude = parseFloat(arr[0]);
                    value.duration = parseFloat(arr[1]);
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

    class TransitionActionType {
        public static XY: number = 0;
        public static Size: number = 1;
        public static Scale: number = 2;
        public static Pivot: number = 3;
        public static Alpha: number = 4;
        public static Rotation: number = 5;
        public static Color: number = 6;
        public static Animation: number = 7;
        public static Visible: number = 8;
        public static Sound: number = 9;
        public static Transition: number = 10;
        public static Shake: number = 11;
        public static ColorFilter: number = 12;
        public static Skew: number = 13;
        public static Unknown: number = 14;
    }

    class TransitionItem {
        public time: number;
        public targetId: string;
        public type: number;
        public tweenConfig: TweenConfig;
        public label: string;
        public value: any;
        public hook: Function;
        public hookCaller: any;

        public tweener: tween.GTweener;
        public target: GObject;
        public displayLockToken: number;

        public constructor(type: number) {
            this.type = type;

            switch (type) {
                case TransitionActionType.XY:
                case TransitionActionType.Size:
                case TransitionActionType.Scale:
                case TransitionActionType.Pivot:
                case TransitionActionType.Skew:
                case TransitionActionType.Alpha:
                case TransitionActionType.Rotation:
                case TransitionActionType.Color:
                case TransitionActionType.ColorFilter:
                    this.value = new TValue();
                    break;

                case TransitionActionType.Animation:
                    this.value = new TValue_Animation();
                    break;

                case TransitionActionType.Shake:
                    this.value = new TValue_Shake();
                    break;

                case TransitionActionType.Sound:
                    this.value = new TValue_Sound();
                    break;

                case TransitionActionType.Transition:
                    this.value = new TValue_Transition();
                    break;

                case TransitionActionType.Visible:
                    this.value = new TValue_Visible();
                    break;
            }
        }
    }

    class TweenConfig {
        public duration: number = 0;
        public easeType: number;
        public repeat: number = 0;
        public yoyo: boolean = false;
        public startValue: TValue;
        public endValue: TValue;
        public endLabel: string;
        public endHook: Function;
        public endHookCaller: any;

        public constructor() {
            this.easeType = tween.EaseType.QuadOut;
            this.startValue = new TValue();
            this.endValue = new TValue();
        }
    }

    class TValue_Visible {
        public visible: boolean;
    }

    class TValue_Animation {
        public frame: number;
        public playing: boolean;
        public flag: boolean;
    }

    class TValue_Sound {
        public sound: string;
        public volume: number;
        public audioClip: egret.Sound;
    }

    class TValue_Transition {
        public transName: string;
        public playTimes: number;
        public trans: Transition;
        public stopTime: number;
    }

    class TValue_Shake {
        public amplitude: number;
        public duration: number;
        public offsetX: number;
        public offsetY: number;
        public lastOffsetX: number;
        public lastOffsetY: number;
    }

    class TValue {
        public f1: number;
        public f2: number;
        public f3: number;
        public f4: number;

        public b1: boolean;
        public b2: boolean;

        public constructor() {
            this.f1 = this.f2 = this.f3 = this.f4 = 0;
            this.b1 = this.b2 = true;
        }
    }
}