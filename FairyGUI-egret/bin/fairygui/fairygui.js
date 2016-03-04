var fairygui;
(function (fairygui) {
    var Controller = (function (_super) {
        __extends(Controller, _super);
        function Controller() {
            _super.call(this);
            this._selectedIndex = 0;
            this._previousIndex = 0;
            this._pageIds = [];
            this._pageNames = [];
            this._selectedIndex = -1;
            this._previousIndex = -1;
        }
        var d = __define,c=Controller,p=c.prototype;
        d(p, "name"
            ,function () {
                return this._name;
            }
            ,function (value) {
                this._name = value;
            }
        );
        d(p, "parent"
            ,function () {
                return this._parent;
            }
        );
        d(p, "selectedIndex"
            ,function () {
                return this._selectedIndex;
            }
            ,function (value) {
                if (this._selectedIndex != value) {
                    if (value > this._pageIds.length - 1)
                        throw "index out of bounds: " + value;
                    this._previousIndex = this._selectedIndex;
                    this._selectedIndex = value;
                    this._parent.applyController(this);
                    this.dispatchEvent(new fairygui.StateChangeEvent(fairygui.StateChangeEvent.CHANGED));
                    if (this._playingTransition) {
                        this._playingTransition.stop();
                        this._playingTransition = null;
                    }
                    if (this._pageTransitions) {
                        var len = this._pageTransitions.length;
                        for (var i = 0; i < len; i++) {
                            var pt = this._pageTransitions[i];
                            if (pt.toIndex == this._selectedIndex && (pt.fromIndex == this._previousIndex)) {
                                this._playingTransition = this.parent.getTransition(pt.transitionName);
                                break;
                            }
                        }
                        if (this._playingTransition)
                            this._playingTransition.play(function () { this._playingTransition = null; }, this);
                    }
                }
            }
        );
        //功能和设置selectedIndex一样，但不会触发事件
        p.setSelectedIndex = function (value) {
            if (value === void 0) { value = 0; }
            if (this._selectedIndex != value) {
                if (value > this._pageIds.length - 1)
                    throw "index out of bounds: " + value;
                this._previousIndex = this._selectedIndex;
                this._selectedIndex = value;
                this._parent.applyController(this);
                if (this._playingTransition) {
                    this._playingTransition.stop();
                    this._playingTransition = null;
                }
            }
        };
        d(p, "previsousIndex"
            ,function () {
                return this._previousIndex;
            }
        );
        d(p, "selectedPage"
            ,function () {
                if (this._selectedIndex == -1)
                    return null;
                else
                    return this._pageNames[this._selectedIndex];
            }
            ,function (val) {
                var i = this._pageNames.indexOf(val);
                if (i == -1)
                    i = 0;
                this.selectedIndex = i;
            }
        );
        //功能和设置selectedPage一样，但不会触发事件
        p.setSelectedPage = function (value) {
            var i = this._pageNames.indexOf(value);
            if (i == -1)
                i = 0;
            this.setSelectedIndex(i);
        };
        d(p, "previousPage"
            ,function () {
                if (this._previousIndex == -1)
                    return null;
                else
                    return this._pageNames[this._previousIndex];
            }
        );
        d(p, "pageCount"
            ,function () {
                return this._pageIds.length;
            }
        );
        p.getPageName = function (index) {
            if (index === void 0) { index = 0; }
            return this._pageNames[index];
        };
        p.addPage = function (name) {
            if (name === void 0) { name = ""; }
            this.addPageAt(name, this._pageIds.length);
        };
        p.addPageAt = function (name, index) {
            if (index === void 0) { index = 0; }
            var nid = "" + (Controller._nextPageId++);
            if (index == this._pageIds.length) {
                this._pageIds.push(nid);
                this._pageNames.push(name);
            }
            else {
                this._pageIds.splice(index, 0, nid);
                this._pageNames.splice(index, 0, name);
            }
        };
        p.removePage = function (name) {
            var i = this._pageNames.indexOf(name);
            if (i != -1) {
                this._pageIds.splice(i, 1);
                this._pageNames.splice(i, 1);
                if (this._selectedIndex >= this._pageIds.length)
                    this.selectedIndex = this._selectedIndex - 1;
                else
                    this._parent.applyController(this);
            }
        };
        p.removePageAt = function (index) {
            if (index === void 0) { index = 0; }
            this._pageIds.splice(index, 1);
            this._pageNames.splice(index, 1);
            if (this._selectedIndex >= this._pageIds.length)
                this.selectedIndex = this._selectedIndex - 1;
            else
                this._parent.applyController(this);
        };
        p.clearPages = function () {
            this._pageIds.length = 0;
            this._pageNames.length = 0;
            if (this._selectedIndex != -1)
                this.selectedIndex = -1;
            else
                this._parent.applyController(this);
        };
        p.hasPage = function (aName) {
            return this._pageNames.indexOf(aName) != -1;
        };
        p.getPageIndexById = function (aId) {
            return this._pageIds.indexOf(aId);
        };
        p.getPageIdByName = function (aName) {
            var i = this._pageNames.indexOf(aName);
            if (i != -1)
                return this._pageIds[i];
            else
                return null;
        };
        p.getPageNameById = function (aId) {
            var i = this._pageIds.indexOf(aId);
            if (i != -1)
                return this._pageNames[i];
            else
                return null;
        };
        p.getPageId = function (index) {
            if (index === void 0) { index = 0; }
            return this._pageIds[index];
        };
        d(p, "selectedPageId"
            ,function () {
                if (this._selectedIndex == -1)
                    return null;
                else
                    return this._pageIds[this._selectedIndex];
            }
            ,function (val) {
                var i = this._pageIds.indexOf(val);
                this.selectedIndex = i;
            }
        );
        d(p, "oppositePageId",undefined
            ,function (val) {
                var i = this._pageIds.indexOf(val);
                if (i > 0)
                    this.selectedIndex = 0;
                else if (this._pageIds.length > 1)
                    this.selectedIndex = 1;
            }
        );
        d(p, "previousPageId"
            ,function () {
                if (this._previousIndex == -1)
                    return null;
                else
                    return this._pageIds[this._previousIndex];
            }
        );
        p.setup = function (xml) {
            this._name = xml.attributes.name;
            this._autoRadioGroupDepth = xml.attributes.autoRadioGroupDepth == "true";
            var i = 0;
            var k = 0;
            var str = xml.attributes.pages;
            if (str) {
                var arr = str.split(",");
                var cnt = arr.length;
                for (i = 0; i < cnt; i += 2) {
                    this._pageIds.push(arr[i]);
                    this._pageNames.push(arr[i + 1]);
                }
            }
            str = xml.attributes.transitions;
            if (str) {
                this._pageTransitions = new Array();
                arr = str.split(",");
                cnt = arr.length;
                for (i = 0; i < cnt; i++) {
                    str = arr[i];
                    if (!str)
                        continue;
                    var pt = new PageTransition();
                    k = str.indexOf("=");
                    pt.transitionName = str.substr(k + 1);
                    str = str.substring(0, k);
                    k = str.indexOf("-");
                    pt.toIndex = parseInt(str.substring(k + 1));
                    str = str.substring(0, k);
                    if (str == "*")
                        pt.fromIndex = -1;
                    else
                        pt.fromIndex = parseInt(str);
                    this._pageTransitions.push(pt);
                }
            }
            if (this._parent && this._pageIds.length > 0)
                this._selectedIndex = 0;
            else
                this._selectedIndex = -1;
        };
        Controller._nextPageId = 0;
        return Controller;
    })(egret.EventDispatcher);
    fairygui.Controller = Controller;
    egret.registerClass(Controller,'fairygui.Controller');
    var PageTransition = (function () {
        function PageTransition() {
            this.fromIndex = 0;
            this.toIndex = 0;
        }
        var d = __define,c=PageTransition,p=c.prototype;
        return PageTransition;
    })();
    egret.registerClass(PageTransition,'PageTransition');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var Frame = (function () {
        function Frame() {
            this.addDelay = 0;
            this.rect = new egret.Rectangle();
        }
        var d = __define,c=Frame,p=c.prototype;
        return Frame;
    })();
    fairygui.Frame = Frame;
    egret.registerClass(Frame,'fairygui.Frame');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var MovieClip = (function (_super) {
        __extends(MovieClip, _super);
        function MovieClip() {
            _super.call(this);
            this.interval = 0;
            this.repeatDelay = 0;
            this._frameCount = 0;
            this._currentFrame = 0;
            this._start = 0;
            this._end = 0;
            this._times = 0;
            this._endAt = 0;
            this._status = 0; //0-none, 1-next loop, 2-ending, 3-ended
            this.$renderRegion = new egret.sys.Region();
            this._playState = new fairygui.PlayState();
            this._playing = true;
            this.touchEnabled = false;
        }
        var d = __define,c=MovieClip,p=c.prototype;
        d(p, "frames"
            ,function () {
                return this._frames;
            }
            ,function (value) {
                this._frames = value;
                if (this._frames != null)
                    this._frameCount = this._frames.length;
                else
                    this._frameCount = 0;
                this._currentFrame = -1;
                this.setPlaySettings();
            }
        );
        d(p, "frameCount"
            ,function () {
                return this._frameCount;
            }
        );
        d(p, "boundsRect"
            ,function () {
                return this._boundsRect;
            }
            ,function (value) {
                this._boundsRect = value;
            }
        );
        d(p, "currentFrame"
            ,function () {
                return this._currentFrame;
            }
            ,function (value) {
                if (this._currentFrame != value) {
                    this._currentFrame = value;
                    this._playState.currentFrame = value;
                    this.setFrame(this._currentFrame < this.frameCount ? this._frames[this._currentFrame] : null);
                }
            }
        );
        d(p, "playing"
            ,function () {
                return this._playing;
            }
            ,function (value) {
                this._playing = value;
                if (this.playing && this.frameCount != 0 && this._status != 3)
                    fairygui.GTimers.inst.callBy24Fps(this.update, this);
                else
                    fairygui.GTimers.inst.remove(this.update, this);
            }
        );
        //从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
        p.setPlaySettings = function (start, end, times, endAt, endCallback, callbackObj) {
            if (start === void 0) { start = 0; }
            if (end === void 0) { end = -1; }
            if (times === void 0) { times = 0; }
            if (endAt === void 0) { endAt = -1; }
            if (endCallback === void 0) { endCallback = null; }
            if (callbackObj === void 0) { callbackObj = null; }
            this._start = start;
            this._end = end;
            if (this._end == -1)
                this._end = this.frameCount - 1;
            this._times = times;
            this._endAt = endAt;
            if (this._endAt == -1)
                this._endAt = this._end;
            this._status = 0;
            this._callback = endCallback;
            this._callbackObj = callbackObj;
            this.currentFrame = start;
            if (this.playing && this.frameCount != 0)
                fairygui.GTimers.inst.callBy24Fps(this.update, this);
            else
                fairygui.GTimers.inst.remove(this.update, this);
        };
        p.update = function () {
            if (this.playing && this.frameCount != 0 && this._status != 3) {
                this._playState.update(this);
                if (this._currentFrame != this._playState.currentFrame) {
                    if (this._status == 1) {
                        this._currentFrame = this._start;
                        this._playState.currentFrame = this._currentFrame;
                        this._status = 0;
                    }
                    else if (this._status == 2) {
                        this._currentFrame = this._endAt;
                        this._playState.currentFrame = this._currentFrame;
                        this._status = 3;
                        //play end
                        fairygui.GTimers.inst.remove(this.update, this);
                        if (this._callback != null) {
                            var f = this._callback;
                            var fObj = this._callbackObj;
                            this._callback = null;
                            this._callbackObj = null;
                            if (f.length == 1)
                                f.call(fObj, this);
                            else
                                f.call(fObj);
                        }
                    }
                    else {
                        this._currentFrame = this._playState.currentFrame;
                        if (this._currentFrame == this._end) {
                            if (this._times > 0) {
                                this._times--;
                                if (this._times == 0)
                                    this._status = 2;
                                else
                                    this._status = 1;
                            }
                        }
                    }
                    //draw
                    this.setFrame(this._frames[this._currentFrame]);
                }
            }
            else
                this.setFrame(null);
        };
        p.setFrame = function (frame) {
            if (frame == null) {
                this._texture = null;
            }
            else {
                this._texture = frame.texture;
                this._frameRect = frame.rect;
            }
            this.$invalidateContentBounds();
        };
        p.$render = function (context) {
            var texture = this._texture;
            if (texture) {
                var offsetX = Math.round(texture._offsetX) + this._frameRect.x;
                var offsetY = Math.round(texture._offsetY) + this._frameRect.y;
                var bitmapWidth = texture._bitmapWidth;
                var bitmapHeight = texture._bitmapHeight;
                var destW = Math.round(texture.$getScaleBitmapWidth());
                var destH = Math.round(texture.$getScaleBitmapHeight());
                context.drawImage(texture._bitmapData, texture._bitmapX, texture._bitmapY, bitmapWidth, bitmapHeight, offsetX, offsetY, destW, destH);
            }
        };
        p.$measureContentBounds = function (bounds) {
            if (this._texture) {
                var x = Math.round(this._texture._offsetX) + this._frameRect.x;
                var y = Math.round(this._texture._offsetY) + this._frameRect.y;
                var w = this._texture.$getTextureWidth();
                var h = this._texture.$getTextureHeight();
                bounds.setTo(x, y, w, h);
            }
            else {
                bounds.setEmpty();
            }
        };
        return MovieClip;
    })(egret.DisplayObject);
    fairygui.MovieClip = MovieClip;
    egret.registerClass(MovieClip,'fairygui.MovieClip');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var PlayState = (function () {
        function PlayState() {
            this.repeatedCount = 0;
            this._curFrame = 0;
            this._curFrameDelay = 0;
        }
        var d = __define,c=PlayState,p=c.prototype;
        p.update = function (mc) {
            var t = egret.getTimer();
            var elapsed = t - this._lastTime;
            this._lastTime = t;
            this.reachEnding = false;
            this.frameStarting = false;
            this._curFrameDelay += elapsed;
            var realFrame = this.reversed ? mc.frameCount - this._curFrame - 1 : this._curFrame;
            var interval = mc.interval + mc.frames[realFrame].addDelay + ((realFrame == 0 && this.repeatedCount > 0) ? mc.repeatDelay : 0);
            if (this._curFrameDelay < interval)
                return;
            this._curFrameDelay = 0;
            this._curFrame++;
            this.frameStarting = true;
            if (this._curFrame > mc.frameCount - 1) {
                this._curFrame = 0;
                this.repeatedCount++;
                this.reachEnding = true;
                if (mc.swing) {
                    this.reversed = !this.reversed;
                    this._curFrame++;
                }
            }
        };
        d(p, "currentFrame"
            ,function () {
                return this._curFrame;
            }
            ,function (value) {
                this._curFrame = value;
                this._curFrameDelay = 0;
            }
        );
        p.rewind = function () {
            this._curFrame = 0;
            this._curFrameDelay = 0;
            this.reversed = false;
            this.reachEnding = false;
        };
        p.reset = function () {
            this._curFrame = 0;
            this._curFrameDelay = 0;
            this.repeatedCount = 0;
            this.reachEnding = false;
            this.reversed = false;
        };
        p.copy = function (src) {
            this._curFrame = src._curFrame;
            this._curFrameDelay = src._curFrameDelay;
            this.repeatedCount = src.repeatedCount;
            this.reachEnding = src.reachEnding;
            this.reversed = src.reversed;
        };
        return PlayState;
    })();
    fairygui.PlayState = PlayState;
    egret.registerClass(PlayState,'fairygui.PlayState');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var UIContainer = (function (_super) {
        __extends(UIContainer, _super);
        function UIContainer(owner) {
            _super.call(this);
            this._owner = owner;
            this.touchEnabled = true;
            this.touchChildren = true;
        }
        var d = __define,c=UIContainer,p=c.prototype;
        d(p, "owner"
            ,function () {
                return this._owner;
            }
        );
        d(p, "hitArea"
            ,function () {
                return this._hitArea;
            }
            ,function (value) {
                if (this._hitArea && value) {
                    this._hitArea.x = value.x;
                    this._hitArea.y = value.y;
                    this._hitArea.width = value.width;
                    this._hitArea.height = value.height;
                }
                else
                    this._hitArea = (value ? value.clone() : null);
            }
        );
        p.$hitTest = function (stageX, stageY) {
            var ret = _super.prototype.$hitTest.call(this, stageX, stageY);
            if (ret == null && this.touchEnabled && this._hitArea != null) {
                var m = this.$getInvertedConcatenatedMatrix();
                var localX = m.a * stageX + m.c * stageY + m.tx;
                var localY = m.b * stageX + m.d * stageY + m.ty;
                if (this._hitArea.contains(localX, localY))
                    ret = this;
            }
            return ret;
        };
        return UIContainer;
    })(egret.DisplayObjectContainer);
    fairygui.UIContainer = UIContainer;
    egret.registerClass(UIContainer,'fairygui.UIContainer',["fairygui.UIDisplayObject"]);
})(fairygui || (fairygui = {}));


var fairygui;
(function (fairygui) {
    var UIImage = (function (_super) {
        __extends(UIImage, _super);
        function UIImage(owner) {
            _super.call(this);
            this._owner = owner;
            this.touchEnabled = false;
        }
        var d = __define,c=UIImage,p=c.prototype;
        d(p, "owner"
            ,function () {
                return this._owner;
            }
        );
        return UIImage;
    })(egret.Bitmap);
    fairygui.UIImage = UIImage;
    egret.registerClass(UIImage,'fairygui.UIImage',["fairygui.UIDisplayObject"]);
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var UIMovieClip = (function (_super) {
        __extends(UIMovieClip, _super);
        function UIMovieClip(owner) {
            _super.call(this);
            this._owner = owner;
            this.touchEnabled = false;
        }
        var d = __define,c=UIMovieClip,p=c.prototype;
        d(p, "owner"
            ,function () {
                return this._owner;
            }
        );
        return UIMovieClip;
    })(fairygui.MovieClip);
    fairygui.UIMovieClip = UIMovieClip;
    egret.registerClass(UIMovieClip,'fairygui.UIMovieClip',["fairygui.UIDisplayObject"]);
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var UISprite = (function (_super) {
        __extends(UISprite, _super);
        function UISprite(owner) {
            _super.call(this);
            this._owner = owner;
            this.touchEnabled = true;
            this.touchChildren = true;
        }
        var d = __define,c=UISprite,p=c.prototype;
        d(p, "owner"
            ,function () {
                return this._owner;
            }
        );
        d(p, "hitArea"
            ,function () {
                return this._hitArea;
            }
            ,function (value) {
                if (this._hitArea && value) {
                    this._hitArea.x = value.x;
                    this._hitArea.y = value.y;
                    this._hitArea.width = value.width;
                    this._hitArea.height = value.height;
                }
                else
                    this._hitArea = (value ? value.clone() : null);
            }
        );
        p.$hitTest = function (stageX, stageY) {
            var ret = _super.prototype.$hitTest.call(this, stageX, stageY);
            if (ret == null && this.touchEnabled && this._hitArea != null) {
                var m = this.$getInvertedConcatenatedMatrix();
                var localX = m.a * stageX + m.c * stageY + m.tx;
                var localY = m.b * stageX + m.d * stageY + m.ty;
                if (this._hitArea.contains(localX, localY))
                    ret = this;
            }
            return ret;
        };
        return UISprite;
    })(egret.Sprite);
    fairygui.UISprite = UISprite;
    egret.registerClass(UISprite,'fairygui.UISprite',["fairygui.UIDisplayObject"]);
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var UITextField = (function (_super) {
        __extends(UITextField, _super);
        function UITextField(owner) {
            _super.call(this);
            this.touchEnabled = false;
            this.touchChildren = false;
            this._owner = owner;
            this.nativeTextField = new egret.TextField();
            this.addChild(this.nativeTextField);
        }
        var d = __define,c=UITextField,p=c.prototype;
        d(p, "owner"
            ,function () {
                return this._owner;
            }
        );
        return UITextField;
    })(egret.DisplayObjectContainer);
    fairygui.UITextField = UITextField;
    egret.registerClass(UITextField,'fairygui.UITextField',["fairygui.UIDisplayObject"]);
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var DragEvent = (function (_super) {
        __extends(DragEvent, _super);
        function DragEvent(type, stageX, stageY, touchPointID) {
            if (stageX === void 0) { stageX = 0; }
            if (stageY === void 0) { stageY = 0; }
            if (touchPointID === void 0) { touchPointID = -1; }
            _super.call(this, type, false);
            this.touchPointID = 0;
            this.stageX = stageX;
            this.stageY = stageY;
            this.touchPointID = touchPointID;
        }
        var d = __define,c=DragEvent,p=c.prototype;
        p.preventDefault = function () {
            this._prevented = true;
        };
        p.isDefaultPrevented = function () {
            return this._prevented;
        };
        DragEvent.DRAG_START = "__dragStart";
        DragEvent.DRAG_END = "__dragEnd";
        return DragEvent;
    })(egret.Event);
    fairygui.DragEvent = DragEvent;
    egret.registerClass(DragEvent,'fairygui.DragEvent');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var DropEvent = (function (_super) {
        __extends(DropEvent, _super);
        function DropEvent(type, source) {
            if (source === void 0) { source = null; }
            _super.call(this, type, false);
            this.source = source;
        }
        var d = __define,c=DropEvent,p=c.prototype;
        DropEvent.DROP = "__drop";
        return DropEvent;
    })(egret.Event);
    fairygui.DropEvent = DropEvent;
    egret.registerClass(DropEvent,'fairygui.DropEvent');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var FocusChangeEvent = (function (_super) {
        __extends(FocusChangeEvent, _super);
        function FocusChangeEvent(type, oldObject, newObject) {
            _super.call(this, type, false);
            this._oldFocusedObject = oldObject;
            this._newFocusedObject = newObject;
        }
        var d = __define,c=FocusChangeEvent,p=c.prototype;
        d(p, "oldFocusedObject"
            ,function () {
                return this._oldFocusedObject;
            }
        );
        d(p, "newFocusedObject"
            ,function () {
                return this._newFocusedObject;
            }
        );
        FocusChangeEvent.CHANGED = "___focusChanged";
        return FocusChangeEvent;
    })(egret.Event);
    fairygui.FocusChangeEvent = FocusChangeEvent;
    egret.registerClass(FocusChangeEvent,'fairygui.FocusChangeEvent');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var ItemEvent = (function (_super) {
        __extends(ItemEvent, _super);
        function ItemEvent(type, itemObject, stageX, stageY) {
            if (itemObject === void 0) { itemObject = null; }
            if (stageX === void 0) { stageX = 0; }
            if (stageY === void 0) { stageY = 0; }
            _super.call(this, type, false);
            this.itemObject = itemObject;
            this.stageX = stageX;
            this.stageY = stageY;
        }
        var d = __define,c=ItemEvent,p=c.prototype;
        ItemEvent.CLICK = "___itemClick";
        return ItemEvent;
    })(egret.Event);
    fairygui.ItemEvent = ItemEvent;
    egret.registerClass(ItemEvent,'fairygui.ItemEvent');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var StateChangeEvent = (function (_super) {
        __extends(StateChangeEvent, _super);
        function StateChangeEvent(type) {
            _super.call(this, type, false);
        }
        var d = __define,c=StateChangeEvent,p=c.prototype;
        StateChangeEvent.CHANGED = "___stateChanged";
        return StateChangeEvent;
    })(egret.Event);
    fairygui.StateChangeEvent = StateChangeEvent;
    egret.registerClass(StateChangeEvent,'fairygui.StateChangeEvent');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    (function (ButtonMode) {
        ButtonMode[ButtonMode["Common"] = 0] = "Common";
        ButtonMode[ButtonMode["Check"] = 1] = "Check";
        ButtonMode[ButtonMode["Radio"] = 2] = "Radio";
    })(fairygui.ButtonMode || (fairygui.ButtonMode = {}));
    var ButtonMode = fairygui.ButtonMode;
    ;
    (function (AutoSizeType) {
        AutoSizeType[AutoSizeType["None"] = 0] = "None";
        AutoSizeType[AutoSizeType["Both"] = 1] = "Both";
        AutoSizeType[AutoSizeType["Height"] = 2] = "Height";
    })(fairygui.AutoSizeType || (fairygui.AutoSizeType = {}));
    var AutoSizeType = fairygui.AutoSizeType;
    ;
    (function (AlignType) {
        AlignType[AlignType["Left"] = 0] = "Left";
        AlignType[AlignType["Center"] = 1] = "Center";
        AlignType[AlignType["Right"] = 2] = "Right";
    })(fairygui.AlignType || (fairygui.AlignType = {}));
    var AlignType = fairygui.AlignType;
    ;
    (function (VertAlignType) {
        VertAlignType[VertAlignType["Top"] = 0] = "Top";
        VertAlignType[VertAlignType["Middle"] = 1] = "Middle";
        VertAlignType[VertAlignType["Bottom"] = 2] = "Bottom";
    })(fairygui.VertAlignType || (fairygui.VertAlignType = {}));
    var VertAlignType = fairygui.VertAlignType;
    ;
    (function (FillType) {
        FillType[FillType["None"] = 0] = "None";
        FillType[FillType["Scale"] = 1] = "Scale";
        FillType[FillType["ScaleFree"] = 2] = "ScaleFree";
    })(fairygui.FillType || (fairygui.FillType = {}));
    var FillType = fairygui.FillType;
    ;
    (function (ListLayoutType) {
        ListLayoutType[ListLayoutType["SingleColumn"] = 0] = "SingleColumn";
        ListLayoutType[ListLayoutType["SingleRow"] = 1] = "SingleRow";
        ListLayoutType[ListLayoutType["FlowHorizontal"] = 2] = "FlowHorizontal";
        ListLayoutType[ListLayoutType["FlowVertical"] = 3] = "FlowVertical";
    })(fairygui.ListLayoutType || (fairygui.ListLayoutType = {}));
    var ListLayoutType = fairygui.ListLayoutType;
    ;
    (function (ListSelectionMode) {
        ListSelectionMode[ListSelectionMode["Single"] = 0] = "Single";
        ListSelectionMode[ListSelectionMode["Multiple"] = 1] = "Multiple";
        ListSelectionMode[ListSelectionMode["Multiple_SingleClick"] = 2] = "Multiple_SingleClick";
        ListSelectionMode[ListSelectionMode["None"] = 3] = "None";
    })(fairygui.ListSelectionMode || (fairygui.ListSelectionMode = {}));
    var ListSelectionMode = fairygui.ListSelectionMode;
    ;
    (function (OverflowType) {
        OverflowType[OverflowType["Visible"] = 0] = "Visible";
        OverflowType[OverflowType["Hidden"] = 1] = "Hidden";
        OverflowType[OverflowType["Scroll"] = 2] = "Scroll";
        OverflowType[OverflowType["Scale"] = 3] = "Scale";
        OverflowType[OverflowType["ScaleFree"] = 4] = "ScaleFree";
    })(fairygui.OverflowType || (fairygui.OverflowType = {}));
    var OverflowType = fairygui.OverflowType;
    ;
    (function (PackageItemType) {
        PackageItemType[PackageItemType["Image"] = 0] = "Image";
        PackageItemType[PackageItemType["Swf"] = 1] = "Swf";
        PackageItemType[PackageItemType["MovieClip"] = 2] = "MovieClip";
        PackageItemType[PackageItemType["Sound"] = 3] = "Sound";
        PackageItemType[PackageItemType["Component"] = 4] = "Component";
        PackageItemType[PackageItemType["Misc"] = 5] = "Misc";
        PackageItemType[PackageItemType["Font"] = 6] = "Font";
        PackageItemType[PackageItemType["Atlas"] = 7] = "Atlas";
    })(fairygui.PackageItemType || (fairygui.PackageItemType = {}));
    var PackageItemType = fairygui.PackageItemType;
    ;
    (function (ProgressTitleType) {
        ProgressTitleType[ProgressTitleType["Percent"] = 0] = "Percent";
        ProgressTitleType[ProgressTitleType["ValueAndMax"] = 1] = "ValueAndMax";
        ProgressTitleType[ProgressTitleType["Value"] = 2] = "Value";
        ProgressTitleType[ProgressTitleType["Max"] = 3] = "Max";
    })(fairygui.ProgressTitleType || (fairygui.ProgressTitleType = {}));
    var ProgressTitleType = fairygui.ProgressTitleType;
    ;
    (function (ScrollBarDisplayType) {
        ScrollBarDisplayType[ScrollBarDisplayType["Default"] = 0] = "Default";
        ScrollBarDisplayType[ScrollBarDisplayType["Visible"] = 1] = "Visible";
        ScrollBarDisplayType[ScrollBarDisplayType["Auto"] = 2] = "Auto";
        ScrollBarDisplayType[ScrollBarDisplayType["Hidden"] = 3] = "Hidden";
    })(fairygui.ScrollBarDisplayType || (fairygui.ScrollBarDisplayType = {}));
    var ScrollBarDisplayType = fairygui.ScrollBarDisplayType;
    ;
    (function (ScrollType) {
        ScrollType[ScrollType["Horizontal"] = 0] = "Horizontal";
        ScrollType[ScrollType["Vertical"] = 1] = "Vertical";
        ScrollType[ScrollType["Both"] = 2] = "Both";
    })(fairygui.ScrollType || (fairygui.ScrollType = {}));
    var ScrollType = fairygui.ScrollType;
    ;
    (function (FlipType) {
        FlipType[FlipType["None"] = 0] = "None";
        FlipType[FlipType["Horizontal"] = 1] = "Horizontal";
        FlipType[FlipType["Vertical"] = 2] = "Vertical";
        FlipType[FlipType["Both"] = 3] = "Both";
    })(fairygui.FlipType || (fairygui.FlipType = {}));
    var FlipType = fairygui.FlipType;
    ;
    (function (RelationType) {
        RelationType[RelationType["Left_Left"] = 0] = "Left_Left";
        RelationType[RelationType["Left_Center"] = 1] = "Left_Center";
        RelationType[RelationType["Left_Right"] = 2] = "Left_Right";
        RelationType[RelationType["Center_Center"] = 3] = "Center_Center";
        RelationType[RelationType["Right_Left"] = 4] = "Right_Left";
        RelationType[RelationType["Right_Center"] = 5] = "Right_Center";
        RelationType[RelationType["Right_Right"] = 6] = "Right_Right";
        RelationType[RelationType["Top_Top"] = 7] = "Top_Top";
        RelationType[RelationType["Top_Middle"] = 8] = "Top_Middle";
        RelationType[RelationType["Top_Bottom"] = 9] = "Top_Bottom";
        RelationType[RelationType["Middle_Middle"] = 10] = "Middle_Middle";
        RelationType[RelationType["Bottom_Top"] = 11] = "Bottom_Top";
        RelationType[RelationType["Bottom_Middle"] = 12] = "Bottom_Middle";
        RelationType[RelationType["Bottom_Bottom"] = 13] = "Bottom_Bottom";
        RelationType[RelationType["Width"] = 14] = "Width";
        RelationType[RelationType["Height"] = 15] = "Height";
        RelationType[RelationType["LeftExt_Left"] = 16] = "LeftExt_Left";
        RelationType[RelationType["LeftExt_Right"] = 17] = "LeftExt_Right";
        RelationType[RelationType["RightExt_Left"] = 18] = "RightExt_Left";
        RelationType[RelationType["RightExt_Right"] = 19] = "RightExt_Right";
        RelationType[RelationType["TopExt_Top"] = 20] = "TopExt_Top";
        RelationType[RelationType["TopExt_Bottom"] = 21] = "TopExt_Bottom";
        RelationType[RelationType["BottomExt_Top"] = 22] = "BottomExt_Top";
        RelationType[RelationType["BottomExt_Bottom"] = 23] = "BottomExt_Bottom";
        RelationType[RelationType["Size"] = 24] = "Size";
    })(fairygui.RelationType || (fairygui.RelationType = {}));
    var RelationType = fairygui.RelationType;
    ;
    function parseButtonMode(value) {
        switch (value) {
            case "Common":
                return ButtonMode.Common;
            case "Check":
                return ButtonMode.Check;
            case "Radio":
                return ButtonMode.Radio;
            default:
                return ButtonMode.Common;
        }
    }
    fairygui.parseButtonMode = parseButtonMode;
    function parseAutoSizeType(value) {
        switch (value) {
            case "none":
                return AutoSizeType.None;
            case "both":
                return AutoSizeType.Both;
            case "height":
                return AutoSizeType.Height;
            default:
                return AutoSizeType.None;
        }
    }
    fairygui.parseAutoSizeType = parseAutoSizeType;
    function parseAlignType(value) {
        switch (value) {
            case "left":
                return AlignType.Left;
            case "center":
                return AlignType.Center;
            case "right":
                return AlignType.Right;
            default:
                return AlignType.Left;
        }
    }
    fairygui.parseAlignType = parseAlignType;
    function getAlignTypeString(type) {
        return type == AlignType.Left ? egret.HorizontalAlign.LEFT :
            (type == AlignType.Center ? egret.HorizontalAlign.CENTER : egret.HorizontalAlign.RIGHT);
    }
    fairygui.getAlignTypeString = getAlignTypeString;
    function parseVertAlignType(value) {
        switch (value) {
            case "top":
                return VertAlignType.Top;
            case "middle":
                return VertAlignType.Middle;
            case "bottom":
                return VertAlignType.Bottom;
            default:
                return VertAlignType.Top;
        }
    }
    fairygui.parseVertAlignType = parseVertAlignType;
    function parseFillType(value) {
        switch (value) {
            case "none":
                return FillType.None;
            case "scale":
                return FillType.Scale;
            case "scaleFree":
                return FillType.ScaleFree;
            default:
                return FillType.None;
        }
    }
    fairygui.parseFillType = parseFillType;
    function parseListLayoutType(value) {
        switch (value) {
            case "column":
                return ListLayoutType.SingleColumn;
            case "row":
                return ListLayoutType.SingleRow;
            case "flow_hz":
                return ListLayoutType.FlowHorizontal;
            case "flow_vt":
                return ListLayoutType.FlowVertical;
            default:
                return ListLayoutType.SingleColumn;
        }
    }
    fairygui.parseListLayoutType = parseListLayoutType;
    function parseListSelectionMode(value) {
        switch (value) {
            case "single":
                return ListSelectionMode.Single;
            case "multiple":
                return ListSelectionMode.Multiple;
            case "multipleSingleClick":
                return ListSelectionMode.Multiple_SingleClick;
            case "none":
                return ListSelectionMode.None;
            default:
                return ListSelectionMode.Single;
        }
    }
    fairygui.parseListSelectionMode = parseListSelectionMode;
    function parseOverflowType(value) {
        switch (value) {
            case "visible":
                return OverflowType.Visible;
            case "hidden":
                return OverflowType.Hidden;
            case "scroll":
                return OverflowType.Scroll;
            case "scale":
                return OverflowType.Scale;
            case "scaleFree":
                return OverflowType.ScaleFree;
            default:
                return OverflowType.Visible;
        }
    }
    fairygui.parseOverflowType = parseOverflowType;
    function parsePackageItemType(value) {
        switch (value) {
            case "image":
                return PackageItemType.Image;
            case "movieclip":
                return PackageItemType.MovieClip;
            case "sound":
                return PackageItemType.Sound;
            case "component":
                return PackageItemType.Component;
            case "swf":
                return PackageItemType.Swf;
            case "font":
                return PackageItemType.Font;
            case "atlas":
                return PackageItemType.Atlas;
            default:
                return PackageItemType.Misc;
        }
    }
    fairygui.parsePackageItemType = parsePackageItemType;
    function parseProgressTitleType(value) {
        switch (value) {
            case "percent":
                return ProgressTitleType.Percent;
            case "valueAndmax":
                return ProgressTitleType.ValueAndMax;
            case "value":
                return ProgressTitleType.Value;
            case "max":
                return ProgressTitleType.Max;
            default:
                return ProgressTitleType.Percent;
        }
    }
    fairygui.parseProgressTitleType = parseProgressTitleType;
    function parseScrollBarDisplayType(value) {
        switch (value) {
            case "default":
                return ScrollBarDisplayType.Default;
            case "visible":
                return ScrollBarDisplayType.Visible;
            case "auto":
                return ScrollBarDisplayType.Auto;
            case "hidden":
                return ScrollBarDisplayType.Hidden;
            default:
                return ScrollBarDisplayType.Default;
        }
    }
    fairygui.parseScrollBarDisplayType = parseScrollBarDisplayType;
    function parseScrollType(value) {
        switch (value) {
            case "horizontal":
                return ScrollType.Horizontal;
            case "vertical":
                return ScrollType.Vertical;
            case "both":
                return ScrollType.Both;
            default:
                return ScrollType.Vertical;
        }
    }
    fairygui.parseScrollType = parseScrollType;
    function parseFlipType(value) {
        switch (value) {
            case "hz":
                return FlipType.Horizontal;
            case "vt":
                return FlipType.Vertical;
            case "both":
                return FlipType.Both;
            default:
                return FlipType.None;
        }
    }
    fairygui.parseFlipType = parseFlipType;
    var EaseMap = {
        "Linear": egret.Ease.getPowIn(1),
        "Elastic.In": egret.Ease.elasticIn,
        "Elastic.Out": egret.Ease.elasticOut,
        "Elastic.InOut": egret.Ease.elasticInOut,
        "Quad.In": egret.Ease.quadIn,
        "Quad.Out": egret.Ease.quadOut,
        "Quad.InOut": egret.Ease.quadInOut,
        "Cube.In": egret.Ease.cubicIn,
        "Cube.Out": egret.Ease.cubicOut,
        "Cube.InOut": egret.Ease.cubicInOut,
        "Quart.In": egret.Ease.quartIn,
        "Quart.Out": egret.Ease.quartOut,
        "Quart.InOut": egret.Ease.quartInOut,
        "Quint.In": egret.Ease.quintIn,
        "Quint.Out": egret.Ease.quintOut,
        "Quint.InOut": egret.Ease.quintInOut,
        "Sine.In": egret.Ease.sineIn,
        "Sine.Out": egret.Ease.sineOut,
        "Sine.InOut": egret.Ease.sineInOut,
        "Bounce.In": egret.Ease.bounceIn,
        "Bounce.Out": egret.Ease.bounceOut,
        "Bounce.InOut": egret.Ease.bounceInOut,
        "Circ.In": egret.Ease.circIn,
        "Circ.Out": egret.Ease.circOut,
        "Circ.InOut": egret.Ease.circInOut,
        "Expo.In": egret.Ease.quartIn,
        "Expo.Out": egret.Ease.quartOut,
        "Expo.InOut": egret.Ease.quartInOut,
        "Back.In": egret.Ease.backIn,
        "Back.Out": egret.Ease.backOut,
        "Back.InOut": egret.Ease.backInOut
    };
    function ParseEaseType(value) {
        var ret = EaseMap[value];
        if (!ret)
            ret = egret.Ease.quartOut;
        return ret;
    }
    fairygui.ParseEaseType = ParseEaseType;
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GearBase = (function () {
        function GearBase(owner) {
            this._owner = owner;
            this._pageSet = new fairygui.PageOptionSet();
            this._easeType = egret.Ease.quadOut;
            this._tweenTime = 0.3;
        }
        var d = __define,c=GearBase,p=c.prototype;
        d(p, "controller"
            ,function () {
                return this._controller;
            }
            ,function (val) {
                if (val != this._controller) {
                    this._controller = val;
                    this._pageSet.controller = val;
                    this._pageSet.clear();
                    if (this._controller)
                        this.init();
                }
            }
        );
        p.getPageSet = function () {
            return this._pageSet;
        };
        d(p, "tween"
            ,function () {
                return this._tween;
            }
            ,function (val) {
                this._tween = val;
            }
        );
        d(p, "tweenTime"
            ,function () {
                return this._tweenTime;
            }
            ,function (value) {
                this._tweenTime = value;
            }
        );
        d(p, "easeType"
            ,function () {
                return this._easeType;
            }
            ,function (value) {
                this._easeType = value;
            }
        );
        p.setup = function (xml) {
            this._controller = this._owner.parent.getController(xml.attributes.controller);
            if (this._controller == null)
                return;
            this.init();
            var str;
            str = xml.attributes.pages;
            var pages;
            if (str)
                pages = str.split(",");
            else
                pages = [];
            var length1 = pages.length;
            for (var i1 = 0; i1 < length1; i1++) {
                str = pages[i1];
                this._pageSet.addById(str);
            }
            str = xml.attributes.tween;
            if (str)
                this._tween = true;
            str = xml.attributes.ease;
            if (str)
                this._easeType = fairygui.ParseEaseType(str);
            str = xml.attributes.duration;
            if (str)
                this._tweenTime = parseFloat(str);
            str = xml.attributes.values;
            var values;
            if (str)
                values = xml.attributes.values.split("|");
            else
                values = [];
            for (var i = 0; i < values.length; i++) {
                str = values[i];
                if (str != "-")
                    this.addStatus(pages[i], str);
            }
            str = xml.attributes.default;
            if (str)
                this.addStatus(null, str);
        };
        d(p, "connected"
            ,function () {
                if (this._controller && !this._pageSet.empty)
                    return this._pageSet.containsId(this._controller.selectedPageId);
                else
                    return false;
            }
        );
        p.addStatus = function (pageId, value) {
        };
        p.init = function () {
        };
        p.apply = function () {
        };
        p.updateState = function () {
        };
        return GearBase;
    })();
    fairygui.GearBase = GearBase;
    egret.registerClass(GearBase,'fairygui.GearBase');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GearSize = (function (_super) {
        __extends(GearSize, _super);
        function GearSize(owner) {
            _super.call(this, owner);
        }
        var d = __define,c=GearSize,p=c.prototype;
        p.init = function () {
            this._default = new GearSizeValue(this._owner.width, this._owner.height, this._owner.scaleX, this._owner.scaleY);
            this._storage = {};
        };
        p.addStatus = function (pageId, value) {
            var arr = value.split(",");
            var gv;
            if (pageId == null)
                gv = this._default;
            else {
                gv = new GearSizeValue();
                this._storage[pageId] = gv;
            }
            gv.width = parseInt(arr[0]);
            gv.height = parseInt(arr[1]);
            if (arr.length > 2) {
                gv.scaleX = parseFloat(arr[2]);
                gv.scaleY = parseFloat(arr[3]);
            }
        };
        p.apply = function () {
            var gv;
            var ct = this.connected;
            if (ct) {
                gv = this._storage[this._controller.selectedPageId];
                if (!gv)
                    gv = this._default;
            }
            else
                gv = this._default;
            if (this._tweener)
                this._tweener.tick(100000000);
            if (this._tween && !fairygui.UIPackage._constructing
                && ct && this._pageSet.containsId(this._controller.previousPageId)) {
                var a = gv.width != this._owner.width || gv.height != this._owner.height;
                var b = gv.scaleX != this._owner.scaleX || gv.scaleY != this._owner.scaleY;
                if (a || b) {
                    this._owner.internalVisible++;
                    var vars = {
                        onChange: function () {
                            this._owner._gearLocked = true;
                            if (a)
                                this._owner.setSize(this._tweenValue.width, this._tweenValue.height, this._owner.gearXY.controller == this._controller);
                            if (b)
                                this._owner.setScale(this._tweenValue.scaleX, this._tweenValue.scaleY);
                            this._owner._gearLocked = false;
                        },
                        onChangeObj: this
                    };
                    if (this._tweenValue == null)
                        this._tweenValue = new GearSizeValue();
                    this._tweenValue.width = this._owner.width;
                    this._tweenValue.height = this._owner.height;
                    this._tweenValue.scaleX = this._owner.scaleX;
                    this._tweenValue.scaleY = this._owner.scaleY;
                    this._tweener = egret.Tween.get(this._tweenValue, vars)
                        .to({ width: gv.width, height: gv.height, scaleX: gv.scaleX, scaleY: gv.scaleY }, this._tweenTime * 1000, this._easeType)
                        .call(function () {
                        this._owner.internalVisible--;
                        this._tweener = null;
                    }, this);
                }
            }
            else {
                this._owner._gearLocked = true;
                this._owner.setSize(gv.width, gv.height, this._owner.gearXY.controller == this._controller);
                this._owner.setScale(gv.scaleX, gv.scaleY);
                this._owner._gearLocked = false;
            }
        };
        p.updateState = function () {
            if (this._owner._gearLocked)
                return;
            var gv;
            if (this.connected) {
                gv = this._storage[this._controller.selectedPageId];
                if (!gv) {
                    gv = new GearSizeValue();
                    this._storage[this._controller.selectedPageId] = gv;
                }
            }
            else {
                gv = this._default;
            }
            gv.width = this._owner.width;
            gv.height = this._owner.height;
            gv.scaleX = this._owner.scaleX;
            gv.scaleY = this._owner.scaleY;
        };
        return GearSize;
    })(fairygui.GearBase);
    fairygui.GearSize = GearSize;
    egret.registerClass(GearSize,'fairygui.GearSize');
    var GearSizeValue = (function () {
        function GearSizeValue(width, height, scaleX, scaleY) {
            if (width === void 0) { width = 0; }
            if (height === void 0) { height = 0; }
            if (scaleX === void 0) { scaleX = 0; }
            if (scaleY === void 0) { scaleY = 0; }
            this.width = width;
            this.height = height;
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        }
        var d = __define,c=GearSizeValue,p=c.prototype;
        return GearSizeValue;
    })();
    egret.registerClass(GearSizeValue,'GearSizeValue');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GearXY = (function (_super) {
        __extends(GearXY, _super);
        function GearXY(owner) {
            _super.call(this, owner);
        }
        var d = __define,c=GearXY,p=c.prototype;
        p.init = function () {
            this._default = new egret.Point(this._owner.x, this._owner.y);
            this._storage = {};
        };
        p.addStatus = function (pageId, value) {
            var arr = value.split(",");
            var pt;
            if (pageId == null)
                pt = this._default;
            else {
                pt = new egret.Point();
                this._storage[pageId] = pt;
            }
            pt.x = parseInt(arr[0]);
            pt.y = parseInt(arr[1]);
        };
        p.apply = function () {
            var pt;
            var ct = this.connected;
            if (ct) {
                pt = this._storage[this._controller.selectedPageId];
                if (!pt)
                    pt = this._default;
            }
            else
                pt = this._default;
            if (this._tweener)
                this._tweener.tick(100000000);
            if (this._tween && !fairygui.UIPackage._constructing
                && ct && this._pageSet.containsId(this._controller.previousPageId)) {
                if (this._owner.x != pt.x || this._owner.y != pt.y) {
                    this._owner.internalVisible++;
                    var vars = {
                        onChange: function () {
                            this._owner._gearLocked = true;
                            this._owner.setXY(this._tweenValue.x, this._tweenValue.y);
                            this._owner._gearLocked = false;
                        },
                        onChangeObj: this
                    };
                    if (this._tweenValue == null)
                        this._tweenValue = new egret.Point();
                    this._tweenValue.x = this._owner.x;
                    this._tweenValue.y = this._owner.y;
                    this._tweener = egret.Tween.get(this._tweenValue, vars)
                        .to({ x: pt.x, y: pt.y }, this._tweenTime * 1000, this._easeType)
                        .call(function () {
                        this._owner.internalVisible--;
                        this._tweener = null;
                    }, this);
                }
            }
            else {
                this._owner._gearLocked = true;
                this._owner.setXY(pt.x, pt.y);
                this._owner._gearLocked = false;
            }
        };
        p.updateState = function () {
            if (this._owner._gearLocked)
                return;
            if (this.connected) {
                var pt = this._storage[this._controller.selectedPageId];
                if (!pt) {
                    pt = new egret.Point();
                    this._storage[this._controller.selectedPageId] = pt;
                }
            }
            else {
                pt = this._default;
            }
            pt.x = this._owner.x;
            pt.y = this._owner.y;
        };
        p.updateFromRelations = function (dx, dy) {
            for (var key in this._storage) {
                var pt = this._storage[key];
                pt.x += dx;
                pt.y += dy;
            }
            this._default.x += dx;
            this._default.y += dy;
            this.updateState();
        };
        return GearXY;
    })(fairygui.GearBase);
    fairygui.GearXY = GearXY;
    egret.registerClass(GearXY,'fairygui.GearXY');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var Transition = (function () {
        function Transition(owner) {
            this._ownerBaseX = 0;
            this._ownerBaseY = 0;
            this._totalTimes = 0;
            this._totalTasks = 0;
            this._playing = false;
            this._options = 0;
            this._maxTime = 0;
            this.OPTION_IGNORE_DISPLAY_CONTROLLER = 1;
            this.FRAME_RATE = 24;
            this._owner = owner;
            this._items = new Array();
        }
        var d = __define,c=Transition,p=c.prototype;
        d(p, "name"
            ,function () {
                return this._name;
            }
            ,function (value) {
                this._name = value;
            }
        );
        p.play = function (onComplete, onCompleteObj, onCompleteParam, times, delay) {
            if (onComplete === void 0) { onComplete = null; }
            if (onCompleteObj === void 0) { onCompleteObj = null; }
            if (onCompleteParam === void 0) { onCompleteParam = null; }
            if (times === void 0) { times = 1; }
            if (delay === void 0) { delay = 0; }
            this._play(onComplete, onCompleteObj, onCompleteParam, times, delay, false);
        };
        p.playReverse = function (onComplete, onCompleteObj, onCompleteParam, times, delay) {
            if (onComplete === void 0) { onComplete = null; }
            if (onCompleteObj === void 0) { onCompleteObj = null; }
            if (onCompleteParam === void 0) { onCompleteParam = null; }
            if (times === void 0) { times = 1; }
            if (delay === void 0) { delay = 0; }
            this._play(onComplete, onCompleteObj, onCompleteParam, times, delay, true);
        };
        p._play = function (onComplete, onCompleteObj, onCompleteParam, times, delay, reversed) {
            if (onComplete === void 0) { onComplete = null; }
            if (onCompleteObj === void 0) { onCompleteObj = null; }
            if (onCompleteParam === void 0) { onCompleteParam = null; }
            if (times === void 0) { times = 1; }
            if (delay === void 0) { delay = 0; }
            if (reversed === void 0) { reversed = false; }
            this.stop();
            if (times == 0)
                times = 1;
            else if (times == -1)
                times = Number.MAX_VALUE;
            this._totalTimes = times;
            this._reversed = reversed;
            this.internalPlay(delay);
            this._playing = this._totalTasks > 0;
            if (this._playing) {
                this._onComplete = onComplete;
                this._onCompleteParam = onCompleteParam;
                this._onCompleteObj = onCompleteObj;
                this._owner.internalVisible++;
                if ((this._options & this.OPTION_IGNORE_DISPLAY_CONTROLLER) != 0) {
                    var cnt = this._items.length;
                    for (var i = 0; i < cnt; i++) {
                        var item = this._items[i];
                        if (item.target != null && item.target != this._owner)
                            item.target.internalVisible++;
                    }
                }
            }
            else if (onComplete != null) {
                if (onComplete.length > 0)
                    onComplete.call(this._onCompleteObj, onCompleteParam);
                else
                    onComplete(this._onCompleteObj);
            }
        };
        p.stop = function (setToComplete, processCallback) {
            if (setToComplete === void 0) { setToComplete = true; }
            if (processCallback === void 0) { processCallback = false; }
            if (this._playing) {
                this._playing = false;
                this._totalTasks = 0;
                this._totalTimes = 0;
                var func = this._onComplete;
                var param = this._onCompleteParam;
                var thisObj = this._onCompleteObj;
                this._onComplete = null;
                this._onCompleteParam = null;
                this._onCompleteObj = null;
                this._owner.internalVisible--;
                var cnt = this._items.length;
                var i;
                var item;
                if (this._reversed) {
                    for (i = cnt - 1; i >= 0; i--) {
                        item = this._items[i];
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
                    if (func.length > 0)
                        func.call(thisObj, param);
                    else
                        func.call(thisObj);
                }
            }
        };
        p.stopItem = function (item, setToComplete) {
            if ((this._options & this.OPTION_IGNORE_DISPLAY_CONTROLLER) != 0) {
                if (item.target != this._owner)
                    item.target.internalVisible--;
            }
            if (item.completed)
                return;
            if (item.tweener != null) {
                item.tweener.setPaused(true);
                item.tweener = null;
            }
            if (item.type == TransitionActionType.Transition) {
                var trans = (item.target).getTransition(item.value.s);
                if (trans != null)
                    trans.stop(setToComplete, false);
            }
            else if (item.type == TransitionActionType.Shake) {
                if (fairygui.GTimers.inst.exists(this.__shake, item)) {
                    fairygui.GTimers.inst.remove(this.__shake, item);
                    item.target._gearLocked = true;
                    item.target.setXY(item.target.x - item.startValue.f1, item.target.y - item.startValue.f2);
                    item.target._gearLocked = false;
                }
            }
            else {
                if (setToComplete) {
                    if (item.tween) {
                        if (!item.yoyo || item.repeat % 2 == 0)
                            this.applyValue(item, this._reversed ? item.startValue : item.endValue);
                        else
                            this.applyValue(item, this._reversed ? item.endValue : item.startValue);
                    }
                    else if (item.type != TransitionActionType.Sound)
                        this.applyValue(item, item.value);
                }
            }
        };
        d(p, "playing"
            ,function () {
                return this._playing;
            }
        );
        p.setValue = function (label) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var cnt = this._items.length;
            var value;
            for (var i = 0; i < cnt; i++) {
                var item = this._items[i];
                if (item.label == null && item.label2 == null)
                    continue;
                if (item.label == label) {
                    if (item.tween)
                        value = item.startValue;
                    else
                        value = item.value;
                }
                else if (item.label2 == label) {
                    value = item.endValue;
                }
                else
                    continue;
                switch (item.type) {
                    case TransitionActionType.XY:
                    case TransitionActionType.Size:
                    case TransitionActionType.Pivot:
                    case TransitionActionType.Scale:
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
                        if (args.length > 1)
                            value.b = args[1];
                        break;
                    case TransitionActionType.Visible:
                        value.b = args[0];
                        break;
                    case TransitionActionType.Controller:
                        value.s = args[0];
                        break;
                    case TransitionActionType.Sound:
                        value.s = args[0];
                        if (args.length > 1)
                            value.f1 = parseFloat(args[1]);
                        break;
                    case TransitionActionType.Transition:
                        value.s = args[0];
                        if (args.length > 1)
                            value.i = parseInt(args[1]);
                        break;
                    case TransitionActionType.Shake:
                        value.f1 = parseFloat(args[0]);
                        if (args.length > 1)
                            value.f2 = parseFloat(args[1]);
                        break;
                }
            }
        };
        p.setHook = function (label, callback, thisObj) {
            var cnt = this._items.length;
            for (var i = 0; i < cnt; i++) {
                var item = this._items[i];
                if (item.label == null && item.label2 == null)
                    continue;
                if (item.label == label) {
                    item.hook = callback;
                    item.hookObj = thisObj;
                }
                else if (item.label2 == label) {
                    item.hook2 = callback;
                    item.hook2Obj = thisObj;
                }
            }
        };
        p.clearHooks = function () {
            var cnt = this._items.length;
            for (var i = 0; i < cnt; i++) {
                var item = this._items[i];
                item.hook = null;
                item.hookObj = null;
                item.hook2 = null;
                item.hook2Obj = null;
            }
        };
        p.setTarget = function (label, newTarget) {
            var cnt = this._items.length;
            var value;
            for (var i = 0; i < cnt; i++) {
                var item = this._items[i];
                if (item.label == null && item.label2 == null)
                    continue;
                item.targetId = newTarget.id;
            }
        };
        p.updateFromRelations = function (targetId, dx, dy) {
            var cnt = this._items.length;
            if (cnt == 0)
                return;
            for (var i = 0; i < cnt; i++) {
                var item = this._items[i];
                if (item.type == TransitionActionType.XY && item.targetId == targetId) {
                    if (item.tween) {
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
        };
        p.internalPlay = function (delay) {
            this._ownerBaseX = this._owner.x;
            this._ownerBaseY = this._owner.y;
            this._totalTasks = 0;
            var cnt = this._items.length;
            var startTime;
            var item;
            for (var i = 0; i < cnt; i++) {
                item = this._items[i];
                if (item.targetId)
                    item.target = this._owner.getChildById(item.targetId);
                else
                    item.target = this._owner;
                if (item.target == null)
                    continue;
                if (item.tween) {
                    if (this._reversed)
                        startTime = delay + (this._maxTime - item.time - item.duration) * 1000;
                    else
                        startTime = delay + item.time * 1000;
                    item.completed = false;
                    switch (item.type) {
                        case TransitionActionType.XY:
                        case TransitionActionType.Size:
                            this._totalTasks++;
                            if (startTime == 0)
                                this.startTween(item);
                            else
                                item.tweener = egret.Tween.get(item.value).wait(startTime).call(this.__delayCall, this, [item]);
                            break;
                        case TransitionActionType.Scale:
                        case TransitionActionType.Alpha:
                        case TransitionActionType.Rotation:
                            this._totalTasks++;
                            var toProps = {};
                            this.prepareValue(item, toProps, this._reversed);
                            item.tweener = egret.Tween.get(item.value);
                            if (startTime > 0)
                                item.tweener.wait(startTime);
                            else
                                this.applyValue(item, item.value);
                            item.tweener.call(this.__tweenStart, this, [item])
                                .to(toProps, item.duration * 1000, item.easeType);
                            if (item.repeat != 0) {
                                //egret.Tween不支持yoyo，这里自行实现
                                item.tweenTimes = 0;
                                item.tweener.call(this.__tweenRepeatComplete, this, [item]);
                            }
                            else
                                item.tweener.call(this.__tweenComplete, this, [item]);
                            break;
                    }
                }
                else {
                    if (this._reversed)
                        startTime = delay + (this._maxTime - item.time) * 1000;
                    else
                        startTime = delay + item.time * 1000;
                    if (startTime == 0)
                        this.applyValue(item, item.value);
                    else {
                        item.completed = false;
                        this._totalTasks++;
                        item.tweener = egret.Tween.get(item.value).wait(startTime).call(this.__delayCall2, this, [item]);
                    }
                }
            }
        };
        p.prepareValue = function (item, toProps, reversed) {
            if (reversed === void 0) { reversed = false; }
            if (!reversed) {
                switch (item.type) {
                    case TransitionActionType.XY:
                        if (item.target == this._owner) {
                            if (!item.startValue.b1)
                                item.startValue.f1 = 0;
                            if (!item.startValue.b2)
                                item.startValue.f2 = 0;
                        }
                        else {
                            if (!item.startValue.b1)
                                item.startValue.f1 = item.target.x;
                            if (!item.startValue.b2)
                                item.startValue.f2 = item.target.y;
                        }
                        item.value.f1 = item.startValue.f1;
                        item.value.f2 = item.startValue.f2;
                        if (!item.endValue.b1)
                            item.endValue.f1 = item.value.f1;
                        if (!item.endValue.b2)
                            item.endValue.f2 = item.value.f2;
                        toProps.f1 = item.endValue.f1;
                        toProps.f2 = item.endValue.f2;
                        break;
                    case TransitionActionType.Size:
                        if (!item.startValue.b1)
                            item.startValue.f1 = item.target.width;
                        if (!item.startValue.b2)
                            item.startValue.f2 = item.target.height;
                        item.value.f1 = item.startValue.f1;
                        item.value.f2 = item.startValue.f2;
                        if (!item.endValue.b1)
                            item.endValue.f1 = item.value.f1;
                        if (!item.endValue.b2)
                            item.endValue.f2 = item.value.f2;
                        toProps.f1 = item.endValue.f1;
                        toProps.f2 = item.endValue.f2;
                        break;
                    case TransitionActionType.Scale:
                        item.value.f1 = item.startValue.f1;
                        item.value.f2 = item.startValue.f2;
                        toProps.f1 = item.endValue.f1;
                        toProps.f2 = item.endValue.f2;
                        break;
                    case TransitionActionType.Alpha:
                        item.value.f1 = item.startValue.f1;
                        toProps.f1 = item.endValue.f1;
                        break;
                    case TransitionActionType.Rotation:
                        item.value.i = item.startValue.i;
                        toProps.i = item.endValue.i;
                        break;
                }
            }
            else {
                switch (item.type) {
                    case TransitionActionType.XY:
                    case TransitionActionType.Size:
                    case TransitionActionType.Scale:
                        toProps.f1 = item.startValue.f1;
                        toProps.f2 = item.startValue.f2;
                    case TransitionActionType.Alpha:
                        toProps.f1 = item.startValue.f1;
                        break;
                    case TransitionActionType.Rotation:
                        toProps.i = item.startValue.i;
                        break;
                }
            }
        };
        p.startTween = function (item) {
            var initProps, toProps;
            initProps = {};
            toProps = {};
            this.prepareValue(item, toProps, this._reversed);
            this.applyValue(item, item.value);
            initProps.onChange = this.__tweenUpdate;
            initProps.onChangeObj = [this, item];
            item.tweener = egret.Tween.get(item.value, initProps);
            item.tweener.to(toProps, item.duration * 1000, item.easeType);
            if (item.repeat != 0) {
                item.tweenTimes = 0;
                item.tweener.call(this.__tweenRepeatComplete, this, [item]);
            }
            else
                item.tweener.call(this.__tweenComplete, this, [item]);
            if (item.hook != null)
                item.hook.call(item.hookObj);
        };
        p.__delayCall = function (item) {
            item.tweener = null;
            this.startTween(item);
        };
        p.__delayCall2 = function (item) {
            item.tweener = null;
            this._totalTasks--;
            item.completed = true;
            this.applyValue(item, item.value);
            if (item.hook != null)
                item.hook.call(item.hookObj);
            this.checkAllComplete();
        };
        p.__tweenStart = function (item) {
            if (item.tweener != null) {
                if (item.hook != null)
                    item.hook.call(item.hookObj);
                //因为egret的onChange在wait的时候已经开始调用，因此只能放在这里注册侦听
                item.tweener.addEventListener("change", this.__tweenUpdate, [this, item]);
            }
        };
        p.__tweenUpdate = function () {
            var args = this;
            var trans = args[0];
            var item = args[1];
            trans.applyValue(item, item.value);
        };
        p.__tweenComplete = function (item) {
            item.tweener = null;
            this._totalTasks--;
            item.completed = true;
            if (item.hook2 != null)
                item.hook2.call(item.hook2Obj);
            this.checkAllComplete();
        };
        p.__tweenRepeatComplete = function (item) {
            item.tweenTimes++;
            if (item.repeat == -1 || item.tweenTimes < item.repeat + 1) {
                var initProps, toProps;
                initProps = {};
                toProps = {};
                initProps.onChange = this.__tweenUpdate;
                initProps.onChangeObj = [this, item];
                var reversed;
                if (item.yoyo) {
                    if (this._reversed)
                        reversed = item.tweenTimes % 2 == 0;
                    else
                        reversed = item.tweenTimes % 2 == 1;
                }
                else
                    reversed = this._reversed;
                this.prepareValue(item, toProps, reversed);
                item.tweener = egret.Tween.get(item.value, initProps);
                item.tweener.to(toProps, item.duration * 1000, item.easeType)
                    .call(this.__tweenRepeatComplete, this, [item]);
            }
            else
                this.__tweenComplete(item);
        };
        p.__playTransComplete = function (item) {
            this._totalTasks--;
            item.completed = true;
            this.checkAllComplete();
        };
        p.checkAllComplete = function () {
            if (this._playing && this._totalTasks == 0) {
                if (this._totalTimes < 0) {
                    //不立刻调用的原因是egret.Tween在onComplete之后，还会调用onChange
                    egret.callLater(this.internalPlay, this, 0);
                }
                else {
                    this._totalTimes--;
                    if (this._totalTimes > 0)
                        egret.callLater(this.internalPlay, this, 0);
                    else {
                        this._playing = false;
                        this._owner.internalVisible--;
                        var cnt = this._items.length;
                        if ((this._options & this.OPTION_IGNORE_DISPLAY_CONTROLLER) != 0) {
                            for (var i = 0; i < cnt; i++) {
                                var item = this._items[i];
                                if (item.target != null && item.target != this._owner)
                                    item.target.internalVisible--;
                            }
                        }
                        if (this._onComplete != null) {
                            var func = this._onComplete;
                            var param = this._onCompleteParam;
                            var thisObj = this._onCompleteObj;
                            this._onComplete = null;
                            this._onCompleteParam = null;
                            this._onCompleteObj = null;
                            if (func.length > 0)
                                func.call(thisObj, param);
                            else
                                func.call(thisObj);
                        }
                    }
                }
            }
        };
        p.applyValue = function (item, value) {
            item.target._gearLocked = true;
            switch (item.type) {
                case TransitionActionType.XY:
                    if (item.target == this._owner) {
                        var f1 = 0, f2 = 0;
                        if (!value.b1)
                            f1 = item.target.x;
                        else
                            f1 = value.f1 + this._ownerBaseX;
                        if (!value.b2)
                            f2 = item.target.y;
                        else
                            f2 = value.f2 + this._ownerBaseY;
                        item.target.setXY(f1, f2);
                    }
                    else {
                        if (!value.b1)
                            value.f1 = item.target.x;
                        if (!value.b2)
                            value.f2 = item.target.y;
                        item.target.setXY(value.f1, value.f2);
                    }
                    break;
                case TransitionActionType.Size:
                    if (!value.b1)
                        value.f1 = item.target.width;
                    if (!value.b2)
                        value.f2 = item.target.height;
                    item.target.setSize(value.f1, value.f2);
                    break;
                case TransitionActionType.Pivot:
                    item.target.setPivot(value.f1, value.f2);
                    break;
                case TransitionActionType.Alpha:
                    item.target.alpha = value.f1;
                    break;
                case TransitionActionType.Rotation:
                    item.target.rotation = value.i;
                    break;
                case TransitionActionType.Scale:
                    item.target.setScale(value.f1, value.f2);
                    break;
                case TransitionActionType.Color:
                    item.target.color = value.c;
                    break;
                case TransitionActionType.Animation:
                    if (!value.b1)
                        value.i = item.target.frame;
                    item.target.frame = value.i;
                    item.target.playing = value.b;
                    break;
                case TransitionActionType.Visible:
                    item.target.visible = value.b;
                    break;
                case TransitionActionType.Controller:
                    var arr = value.s.split(",");
                    var len = arr.length;
                    for (var i = 0; i < len; i++) {
                        var str = arr[i];
                        var arr2 = str.split("=");
                        var cc = item.target.getController(arr2[0]);
                        if (cc) {
                            str = arr2[1];
                            if (str.charAt(0) == "$") {
                                str = str.substring(1);
                                cc.selectedPage = str;
                            }
                            else
                                cc.selectedIndex = parseInt(str);
                        }
                    }
                    break;
                case TransitionActionType.Transition:
                    var trans = item.target.getTransition(value.s);
                    if (trans != null) {
                        if (value.i == 0)
                            trans.stop(false, true);
                        else if (trans.playing)
                            trans._totalTimes = value.i == -1 ? Number.MAX_VALUE : value.i;
                        else {
                            item.completed = false;
                            this._totalTasks++;
                            if (this._reversed)
                                trans.playReverse(this.__playTransComplete, this, item.value.i);
                            else
                                trans.play(this.__playTransComplete, this, item.value.i);
                        }
                    }
                    break;
                case TransitionActionType.Sound:
                    var pi = fairygui.UIPackage.getItemByURL(value.s);
                    if (pi) {
                        var sound = pi.owner.getItemAsset(pi);
                        if (sound)
                            fairygui.GRoot.inst.playOneShotSound(sound, value.f1);
                    }
                    break;
                case TransitionActionType.Shake:
                    item.startValue.f1 = 0; //offsetX
                    item.startValue.f2 = 0; //offsetY
                    item.startValue.f3 = item.value.f2; //shakePeriod
                    item.startValue.i = egret.getTimer(); //startTime
                    fairygui.GTimers.inst.add(1, 0, this.__shake, item, this);
                    this._totalTasks++;
                    item.completed = false;
                    break;
            }
            item.target._gearLocked = false;
        };
        p.__shake = function (trans) {
            var item = this;
            trans.__shakeItem(item);
        };
        p.__shakeItem = function (item) {
            var r = Math.ceil(item.value.f1 * item.startValue.f3 / item.value.f2);
            var rx = (Math.random() * 2 - 1) * r;
            var ry = (Math.random() * 2 - 1) * r;
            rx = rx > 0 ? Math.ceil(rx) : Math.floor(rx);
            ry = ry > 0 ? Math.ceil(ry) : Math.floor(ry);
            item.target._gearLocked = true;
            item.target.setXY(item.target.x - item.startValue.f1 + rx, item.target.y - item.startValue.f2 + ry);
            item.target._gearLocked = false;
            item.startValue.f1 = rx;
            item.startValue.f2 = ry;
            var t = egret.getTimer();
            item.startValue.f3 -= (t - item.startValue.i) / 1000;
            item.startValue.i = t;
            if (item.startValue.f3 <= 0) {
                item.target._gearLocked = true;
                item.target.setXY(item.target.x - item.startValue.f1, item.target.y - item.startValue.f2);
                item.target._gearLocked = false;
                item.completed = true;
                this._totalTasks--;
                fairygui.GTimers.inst.remove(this.__shake, item);
                this.checkAllComplete();
            }
        };
        p.setup = function (xml) {
            this.name = xml.attributes.name;
            var str = xml.attributes.options;
            if (str)
                this._options = parseInt(str);
            var col = xml.children;
            var length1 = col.length;
            for (var i1 = 0; i1 < length1; i1++) {
                var cxml = col[i1];
                if (cxml.name != "item")
                    continue;
                var item = new TransitionItem();
                this._items.push(item);
                item.time = parseInt(cxml.attributes.time) / this.FRAME_RATE;
                item.targetId = cxml.attributes.target;
                str = cxml.attributes.type;
                switch (str) {
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
                    case "Controller":
                        item.type = TransitionActionType.Controller;
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
                    default:
                        item.type = TransitionActionType.Unknown;
                        break;
                }
                item.tween = cxml.attributes.tween == "true";
                item.label = cxml.attributes.label;
                if (item.tween) {
                    item.duration = parseInt(cxml.attributes.duration) / this.FRAME_RATE;
                    if (item.time + item.duration > this._maxTime)
                        this._maxTime = item.time + item.duration;
                    str = cxml.attributes.ease;
                    if (str)
                        item.easeType = fairygui.ParseEaseType(str);
                    str = cxml.attributes.repeat;
                    if (str)
                        item.repeat = parseInt(str);
                    item.yoyo = cxml.attributes.yoyo == "true";
                    item.label2 = cxml.attributes.label2;
                    var v = cxml.attributes.endValue;
                    if (v) {
                        this.decodeValue(item.type, cxml.attributes.startValue, item.startValue);
                        this.decodeValue(item.type, v, item.endValue);
                    }
                    else {
                        item.tween = false;
                        this.decodeValue(item.type, cxml.attributes.startValue, item.value);
                    }
                }
                else {
                    if (item.time > this._maxTime)
                        this._maxTime = item.time;
                    this.decodeValue(item.type, cxml.attributes.value, item.value);
                }
            }
        };
        p.decodeValue = function (type, str, value) {
            var arr;
            switch (type) {
                case TransitionActionType.XY:
                case TransitionActionType.Size:
                case TransitionActionType.Pivot:
                    arr = str.split(",");
                    if (arr[0] == "-") {
                        value.b1 = false;
                    }
                    else {
                        value.f1 = parseInt(arr[0]);
                        value.b1 = true;
                    }
                    if (arr[1] == "-") {
                        value.b2 = false;
                    }
                    else {
                        value.f2 = parseInt(arr[1]);
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
                    value.c = fairygui.ToolSet.convertFromHtmlColor(str);
                    break;
                case TransitionActionType.Animation:
                    arr = str.split(",");
                    if (arr[0] == "-") {
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
                case TransitionActionType.Controller:
                    value.s = str;
                    break;
                case TransitionActionType.Sound:
                    arr = str.split(",");
                    value.s = arr[0];
                    if (arr.length > 1) {
                        var intv = parseInt(arr[1]);
                        if (intv == 0 || intv == 100)
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
                    if (arr.length > 1)
                        value.i = parseInt(arr[1]);
                    else
                        value.i = 1;
                    break;
                case TransitionActionType.Shake:
                    arr = str.split(",");
                    value.f1 = parseFloat(arr[0]);
                    value.f2 = parseFloat(arr[1]);
                    break;
            }
        };
        return Transition;
    })();
    fairygui.Transition = Transition;
    egret.registerClass(Transition,'fairygui.Transition');
    var TransitionActionType = (function () {
        function TransitionActionType() {
        }
        var d = __define,c=TransitionActionType,p=c.prototype;
        TransitionActionType.XY = 0;
        TransitionActionType.Size = 1;
        TransitionActionType.Scale = 2;
        TransitionActionType.Pivot = 3;
        TransitionActionType.Alpha = 4;
        TransitionActionType.Rotation = 5;
        TransitionActionType.Color = 6;
        TransitionActionType.Animation = 7;
        TransitionActionType.Visible = 8;
        TransitionActionType.Controller = 9;
        TransitionActionType.Sound = 10;
        TransitionActionType.Transition = 11;
        TransitionActionType.Shake = 12;
        TransitionActionType.Unknown = 13;
        return TransitionActionType;
    })();
    egret.registerClass(TransitionActionType,'TransitionActionType');
    var TransitionItem = (function () {
        function TransitionItem() {
            this.time = 0;
            this.type = 0;
            this.duration = 0;
            this.repeat = 0;
            this.yoyo = false;
            this.tween = false;
            this.tweenTimes = 0;
            this.completed = false;
            this.easeType = egret.Ease.quadOut;
            this.value = new TransitionValue();
            this.startValue = new TransitionValue();
            this.endValue = new TransitionValue();
        }
        var d = __define,c=TransitionItem,p=c.prototype;
        return TransitionItem;
    })();
    egret.registerClass(TransitionItem,'TransitionItem');
    var TransitionValue = (function () {
        function TransitionValue() {
            this.f1 = 0;
            this.f2 = 0;
            this.f3 = 0;
            this.i = 0;
            this.c = 0;
            this.b = false;
            this.b1 = true;
            this.b2 = true;
        }
        var d = __define,c=TransitionValue,p=c.prototype;
        return TransitionValue;
    })();
    egret.registerClass(TransitionValue,'TransitionValue');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GObject = (function (_super) {
        __extends(GObject, _super);
        function GObject() {
            _super.call(this);
            this._x = 0;
            this._y = 0;
            this._width = 0;
            this._height = 0;
            this._pivotX = 0;
            this._pivotY = 0;
            this._alpha = 1;
            this._rotation = 0;
            this._visible = true;
            this._touchable = true;
            this._grayed = false;
            this._draggable = false;
            this._scaleX = 1;
            this._scaleY = 1;
            this._pivotOffsetX = 0;
            this._pivotOffsetY = 0;
            this._sortingOrder = 0;
            this._internalVisible = 1;
            this._focusable = false;
            this._rawWidth = 0;
            this._rawHeight = 0;
            this._sourceWidth = 0;
            this._sourceHeight = 0;
            this._initWidth = 0;
            this._initHeight = 0;
            this._id = "" + GObject._gInstanceCounter++;
            this._name = "";
            this.createDisplayObject();
            this._relations = new fairygui.Relations(this);
            this._gearDisplay = new fairygui.GearDisplay(this);
            this._gearXY = new fairygui.GearXY(this);
            this._gearSize = new fairygui.GearSize(this);
            this._gearLook = new fairygui.GearLook(this);
        }
        var d = __define,c=GObject,p=c.prototype;
        d(p, "id"
            ,function () {
                return this._id;
            }
        );
        d(p, "name"
            ,function () {
                return this._name;
            }
            ,function (value) {
                this._name = value;
            }
        );
        d(p, "x"
            ,function () {
                return this._x;
            }
            ,function (value) {
                this.setXY(value, this._y);
            }
        );
        d(p, "y"
            ,function () {
                return this._y;
            }
            ,function (value) {
                this.setXY(this._x, value);
            }
        );
        p.setXY = function (xv, yv) {
            if (this._x != xv || this._y != yv) {
                var dx = xv - this._x;
                var dy = yv - this._y;
                this._x = xv;
                this._y = yv;
                this.handleXYChanged();
                if (this instanceof fairygui.GGroup)
                    this.moveChildren(dx, dy);
                if (this._gearXY.controller)
                    this._gearXY.updateState();
                if (this._parent && !(this._parent instanceof fairygui.GList)) {
                    this._parent.setBoundsChangedFlag();
                    this.dispatchEventWith(GObject.XY_CHANGED);
                }
            }
        };
        p.center = function (restraint) {
            if (restraint === void 0) { restraint = false; }
            var r;
            if (this._parent != null)
                r = this.parent;
            else {
                r = this.root;
                if (r == null)
                    r = fairygui.GRoot.inst;
            }
            this.setXY((r.width - this.width) / 2, (r.height - this.height) / 2);
            if (restraint) {
                this.addRelation(r, fairygui.RelationType.Center_Center);
                this.addRelation(r, fairygui.RelationType.Middle_Middle);
            }
        };
        d(p, "width"
            ,function () {
                this.ensureSizeCorrect();
                if (this._relations.sizeDirty)
                    this._relations.ensureRelationsSizeCorrect();
                return this._width;
            }
            ,function (value) {
                this.setSize(value, this._rawHeight);
            }
        );
        d(p, "height"
            ,function () {
                this.ensureSizeCorrect();
                if (this._relations.sizeDirty)
                    this._relations.ensureRelationsSizeCorrect();
                return this._height;
            }
            ,function (value) {
                this.setSize(this._rawWidth, value);
            }
        );
        p.setSize = function (wv, hv, ignorePivot) {
            if (ignorePivot === void 0) { ignorePivot = false; }
            if (this._rawWidth != wv || this._rawHeight != hv) {
                this._rawWidth = wv;
                this._rawHeight = hv;
                if (wv < 0)
                    wv = 0;
                if (hv < 0)
                    hv = 0;
                var dWidth = wv - this._width;
                var dHeight = hv - this._height;
                this._width = wv;
                this._height = hv;
                if ((this._pivotX != 0 || this._pivotY != 0) && this.sourceWidth != 0 && this.sourceHeight != 0) {
                    if (!ignorePivot)
                        this.setXY(this.x - this._pivotX * dWidth / this.sourceWidth, this.y - this._pivotY * dHeight / this.sourceHeight);
                    this.applyPivot();
                }
                this.handleSizeChanged();
                if (this._gearSize.controller)
                    this._gearSize.updateState();
                if (this._parent) {
                    this._relations.onOwnerSizeChanged(dWidth, dHeight);
                    this._parent.setBoundsChangedFlag();
                }
                this.dispatchEventWith(GObject.SIZE_CHANGED);
            }
        };
        p.ensureSizeCorrect = function () {
        };
        d(p, "sourceHeight"
            ,function () {
                return this._sourceHeight;
            }
        );
        d(p, "sourceWidth"
            ,function () {
                return this._sourceWidth;
            }
        );
        d(p, "initHeight"
            ,function () {
                return this._initHeight;
            }
        );
        d(p, "initWidth"
            ,function () {
                return this._initWidth;
            }
        );
        d(p, "actualWidth"
            ,function () {
                return this.width * this._scaleX;
            }
        );
        d(p, "actualHeight"
            ,function () {
                return this.height * this._scaleY;
            }
        );
        d(p, "scaleX"
            ,function () {
                return this._scaleX;
            }
            ,function (value) {
                this.setScale(value, this._scaleY);
            }
        );
        d(p, "scaleY"
            ,function () {
                return this._scaleY;
            }
            ,function (value) {
                this.setScale(this._scaleX, value);
            }
        );
        p.setScale = function (sx, sy) {
            if (this._scaleX != sx || this._scaleY != sy) {
                this._scaleX = sx;
                this._scaleY = sy;
                this.applyPivot();
                this.handleSizeChanged();
                if (this._gearSize.controller)
                    this._gearSize.updateState();
            }
        };
        d(p, "pivotX"
            ,function () {
                return this._pivotX;
            }
            ,function (value) {
                this.setPivot(value, this._pivotY);
            }
        );
        d(p, "pivotY"
            ,function () {
                return this._pivotY;
            }
            ,function (value) {
                this.setPivot(this._pivotX, value);
            }
        );
        p.setPivot = function (xv, yv) {
            if (yv === void 0) { yv = 0; }
            if (this._pivotX != xv || this._pivotY != yv) {
                this._pivotX = xv;
                this._pivotY = yv;
                this.applyPivot();
            }
        };
        p.applyPivot = function () {
            var ox = this._pivotOffsetX;
            var oy = this._pivotOffsetY;
            if (this._pivotX != 0 || this._pivotY != 0) {
                var rot = this.normalizeRotation;
                if (rot != 0 || this._scaleX != 1 || this._scaleY != 1) {
                    var rotInRad = rot * Math.PI / 180;
                    var cos = Math.cos(rotInRad);
                    var sin = Math.sin(rotInRad);
                    var a = this._scaleX * cos;
                    var b = this._scaleX * sin;
                    var c = this._scaleY * -sin;
                    var d = this._scaleY * cos;
                    var sx = this.sourceWidth != 0 ? (this._width / this.sourceWidth) : 1;
                    var sy = this.sourceHeight != 0 ? (this._height / this.sourceHeight) : 1;
                    var px = this._pivotX * sx;
                    var py = this._pivotY * sy;
                    this._pivotOffsetX = px - (a * px + c * py);
                    this._pivotOffsetY = py - (d * py + b * px);
                }
                else {
                    this._pivotOffsetX = 0;
                    this._pivotOffsetY = 0;
                }
            }
            else {
                this._pivotOffsetX = 0;
                this._pivotOffsetY = 0;
            }
            if (ox != this._pivotOffsetX || oy != this._pivotOffsetY)
                this.handleXYChanged();
        };
        d(p, "touchable"
            ,function () {
                return this._touchable;
            }
            ,function (value) {
                this._touchable = value;
                if ((this instanceof fairygui.GImage) || (this instanceof fairygui.GMovieClip)
                    || (this instanceof fairygui.GTextField) && !(this instanceof fairygui.GTextInput) && !(this instanceof fairygui.GRichTextField))
                    //Touch is not supported by GImage/GMovieClip/GTextField
                    return;
                if (this._displayObject != null) {
                    this._displayObject.touchEnabled = this._touchable;
                    if (this._displayObject instanceof egret.DisplayObjectContainer)
                        this._displayObject.touchChildren = this._touchable;
                }
            }
        );
        d(p, "grayed"
            ,function () {
                return this._grayed;
            }
            ,function (value) {
                if (this._grayed != value) {
                    this._grayed = value;
                    this.handleGrayChanged();
                }
            }
        );
        d(p, "enabled"
            ,function () {
                return !this._grayed && this._touchable;
            }
            ,function (value) {
                this.grayed = !value;
                this.touchable = value;
            }
        );
        d(p, "rotation"
            ,function () {
                return this._rotation;
            }
            ,function (value) {
                if (this._rotation != value) {
                    this._rotation = value;
                    this.applyPivot();
                    if (this._displayObject)
                        this._displayObject.rotation = this.normalizeRotation;
                    if (this._gearLook.controller)
                        this._gearLook.updateState();
                }
            }
        );
        d(p, "normalizeRotation"
            ,function () {
                var rot = this._rotation % 360;
                if (rot > 180)
                    rot = rot - 360;
                else if (rot < -180)
                    rot = 360 + rot;
                return rot;
            }
        );
        d(p, "alpha"
            ,function () {
                return this._alpha;
            }
            ,function (value) {
                this._alpha = value;
                if (this._displayObject)
                    this._displayObject.alpha = this._alpha;
            }
        );
        d(p, "visible"
            ,function () {
                return this._visible;
            }
            ,function (value) {
                if (this._visible != value) {
                    this._visible = value;
                    if (this._displayObject)
                        this._displayObject.visible = this._visible;
                    if (this._parent)
                        this._parent.childStateChanged(this);
                }
            }
        );
        d(p, "internalVisible"
            ,function () {
                return this._internalVisible;
            }
            ,function (value) {
                if (value < 0)
                    value = 0;
                var oldValue = this._internalVisible > 0;
                var newValue = value > 0;
                this._internalVisible = value;
                if (oldValue != newValue) {
                    if (this._parent)
                        this._parent.childStateChanged(this);
                }
            }
        );
        d(p, "finalVisible"
            ,function () {
                return this._visible && this._internalVisible > 0 && (!this._group || this._group.finalVisible);
            }
        );
        d(p, "sortingOrder"
            ,function () {
                return this._sortingOrder;
            }
            ,function (value) {
                if (value < 0)
                    value = 0;
                if (this._sortingOrder != value) {
                    var old = this._sortingOrder;
                    this._sortingOrder = value;
                    if (this._parent != null)
                        this._parent.childSortingOrderChanged(this, old, this._sortingOrder);
                }
            }
        );
        d(p, "focusable"
            ,function () {
                return this._focusable;
            }
            ,function (value) {
                this._focusable = value;
            }
        );
        d(p, "focused"
            ,function () {
                var r = this.root;
                if (r)
                    return r.focus == this;
                else
                    return false;
            }
        );
        p.requestFocus = function () {
            var r = this.root;
            if (r) {
                var p = this;
                while (p && !p._focusable)
                    p = p.parent;
                if (p != null)
                    r.focus = p;
            }
        };
        d(p, "tooltips"
            ,function () {
                return this._tooltips;
            }
            ,function (value) {
                this._tooltips = value;
            }
        );
        d(p, "inContainer"
            ,function () {
                return this._displayObject != null && this._displayObject.parent != null;
            }
        );
        d(p, "onStage"
            ,function () {
                return this._displayObject != null && this._displayObject.stage != null;
            }
        );
        d(p, "resourceURL"
            ,function () {
                if (this._packageItem != null)
                    return "ui://" + this._packageItem.owner.id + this._packageItem.id;
                else
                    return null;
            }
        );
        d(p, "group"
            ,function () {
                return this._group;
            }
            ,function (value) {
                this._group = value;
            }
        );
        d(p, "gearDisplay"
            ,function () {
                return this._gearDisplay;
            }
        );
        d(p, "gearXY"
            ,function () {
                return this._gearXY;
            }
        );
        d(p, "gearSize"
            ,function () {
                return this._gearSize;
            }
        );
        d(p, "gearLook"
            ,function () {
                return this._gearLook;
            }
        );
        d(p, "relations"
            ,function () {
                return this._relations;
            }
        );
        p.addRelation = function (target, relationType, usePercent) {
            if (usePercent === void 0) { usePercent = false; }
            this._relations.add(target, relationType, usePercent);
        };
        p.removeRelation = function (target, relationType) {
            if (relationType === void 0) { relationType = 0; }
            this._relations.remove(target, relationType);
        };
        d(p, "displayObject"
            ,function () {
                return this._displayObject;
            }
        );
        p.setDisplayObject = function (value) {
            this._displayObject = value;
        };
        d(p, "parent"
            ,function () {
                return this._parent;
            }
            ,function (val) {
                this._parent = val;
            }
        );
        p.removeFromParent = function () {
            if (this._parent)
                this._parent.removeChild(this);
        };
        d(p, "root"
            ,function () {
                var p = this._parent;
                while (p) {
                    if (p instanceof fairygui.GRoot)
                        return p;
                    p = p.parent;
                }
                return null;
            }
        );
        d(p, "asCom"
            ,function () {
                return this;
            }
        );
        d(p, "asButton"
            ,function () {
                return this;
            }
        );
        d(p, "asLabel"
            ,function () {
                return this;
            }
        );
        d(p, "asProgress"
            ,function () {
                return this;
            }
        );
        d(p, "asTextField"
            ,function () {
                return this;
            }
        );
        d(p, "asRichTextField"
            ,function () {
                return this;
            }
        );
        d(p, "asTextInput"
            ,function () {
                return this;
            }
        );
        d(p, "asLoader"
            ,function () {
                return this;
            }
        );
        d(p, "asList"
            ,function () {
                return this;
            }
        );
        d(p, "asGraph"
            ,function () {
                return this;
            }
        );
        d(p, "asGroup"
            ,function () {
                return this;
            }
        );
        d(p, "asSlider"
            ,function () {
                return this;
            }
        );
        d(p, "asComboBox"
            ,function () {
                return this;
            }
        );
        d(p, "asImage"
            ,function () {
                return this;
            }
        );
        d(p, "asMovieClip"
            ,function () {
                return this;
            }
        );
        d(p, "text"
            ,function () {
                return null;
            }
            ,function (value) {
            }
        );
        p.dispose = function () {
            this._relations.dispose();
            /*if(this._displayObject!=null){
                this._displayObject.dispose();
                this._displayObject = null;
            }*/
        };
        p.addClickListener = function (listener, thisObj) {
            this.addEventListener(egret.TouchEvent.TOUCH_TAP, listener, thisObj);
        };
        p.removeClickListener = function (listener, thisObj) {
            this.removeEventListener(egret.TouchEvent.TOUCH_TAP, listener, thisObj);
        };
        p.hasClickListener = function () {
            return this.hasEventListener(egret.TouchEvent.TOUCH_TAP);
        };
        p.addEventListener = function (type, listener, thisObject) {
            _super.prototype.addEventListener.call(this, type, listener, thisObject);
            if (this._displayObject != null) {
                this._displayObject.addEventListener(type, this._reDispatch, this);
            }
        };
        p.removeEventListener = function (type, listener, thisObject) {
            _super.prototype.removeEventListener.call(this, type, listener, thisObject);
            if (this._displayObject != null && !this.hasEventListener(type)) {
                this._displayObject.removeEventListener(type, this._reDispatch, this);
            }
        };
        p._reDispatch = function (evt) {
            this.dispatchEvent(evt);
        };
        d(p, "draggable"
            ,function () {
                return this._draggable;
            }
            ,function (value) {
                if (this._draggable != value) {
                    this._draggable = value;
                    this.initDrag();
                }
            }
        );
        d(p, "dragBounds"
            ,function () {
                return this._dragBounds;
            }
            ,function (value) {
                this._dragBounds = value;
            }
        );
        p.startDrag = function (touchPointID) {
            if (touchPointID === void 0) { touchPointID = -1; }
            if (this._displayObject.stage == null)
                return;
            this.dragBegin(null);
        };
        p.stopDrag = function () {
            this.dragEnd();
        };
        d(p, "dragging"
            ,function () {
                return GObject.sDragging == this;
            }
        );
        p.localToGlobal = function (ax, ay, resultPoint) {
            if (ax === void 0) { ax = 0; }
            if (ay === void 0) { ay = 0; }
            return this._displayObject.localToGlobal(ax, ay, resultPoint);
        };
        p.globalToLocal = function (ax, ay, resultPoint) {
            if (ax === void 0) { ax = 0; }
            if (ay === void 0) { ay = 0; }
            return this._displayObject.globalToLocal(ax, ay, resultPoint);
        };
        p.localToRoot = function (ax, ay, resultPoint) {
            if (ax === void 0) { ax = 0; }
            if (ay === void 0) { ay = 0; }
            var pt = this._displayObject.localToGlobal(ax, ay, resultPoint);
            pt.x /= fairygui.GRoot.contentScaleFactor;
            pt.y /= fairygui.GRoot.contentScaleFactor;
            return pt;
        };
        p.rootToLocal = function (ax, ay, resultPoint) {
            if (ax === void 0) { ax = 0; }
            if (ay === void 0) { ay = 0; }
            ax *= fairygui.GRoot.contentScaleFactor;
            ay *= fairygui.GRoot.contentScaleFactor;
            return this._displayObject.globalToLocal(ax, ay, resultPoint);
        };
        p.localToGlobalRect = function (ax, ay, aWidth, aHeight, resultRect) {
            if (ax === void 0) { ax = 0; }
            if (ay === void 0) { ay = 0; }
            if (aWidth === void 0) { aWidth = 0; }
            if (aHeight === void 0) { aHeight = 0; }
            if (resultRect == null)
                resultRect = new egret.Rectangle();
            var pt = this.localToGlobal(ax, ay);
            resultRect.x = pt.x;
            resultRect.y = pt.y;
            pt = this.localToGlobal(ax + aWidth, ay + aHeight);
            resultRect.right = pt.x;
            resultRect.bottom = pt.y;
            return resultRect;
        };
        p.globalToLocalRect = function (ax, ay, aWidth, aHeight, resultRect) {
            if (ax === void 0) { ax = 0; }
            if (ay === void 0) { ay = 0; }
            if (aWidth === void 0) { aWidth = 0; }
            if (aHeight === void 0) { aHeight = 0; }
            if (resultRect == null)
                resultRect = new egret.Rectangle();
            var pt = this.globalToLocal(ax, ay);
            resultRect.x = pt.x;
            resultRect.y = pt.y;
            pt = this.globalToLocal(ax + aWidth, ay + aHeight);
            resultRect.right = pt.x;
            resultRect.bottom = pt.y;
            return resultRect;
        };
        p.handleControllerChanged = function (c) {
            if (this._gearDisplay.controller == c)
                this._gearDisplay.apply();
            if (this._gearXY.controller == c)
                this._gearXY.apply();
            if (this._gearSize.controller == c)
                this._gearSize.apply();
            if (this._gearLook.controller == c)
                this._gearLook.apply();
        };
        p.createDisplayObject = function () {
        };
        p.handleXYChanged = function () {
            if (this._displayObject) {
                this._displayObject.x = this._x + this._pivotOffsetX;
                this._displayObject.y = this._y + this._pivotOffsetY;
            }
        };
        p.handleSizeChanged = function () {
        };
        p.handleGrayChanged = function () {
            if (this._displayObject) {
            }
        };
        p.constructFromResource = function (pkgItem) {
            this._packageItem = pkgItem;
        };
        p.setup_beforeAdd = function (xml) {
            var str;
            var arr;
            this._id = xml.attributes.id;
            this._name = xml.attributes.name;
            str = xml.attributes.xy;
            arr = str.split(",");
            this.setXY(parseInt(arr[0]), parseInt(arr[1]));
            str = xml.attributes.size;
            if (str) {
                arr = str.split(",");
                this._initWidth = parseInt(arr[0]);
                this._initHeight = parseInt(arr[1]);
                this.setSize(this._initWidth, this._initHeight);
            }
            str = xml.attributes.scale;
            if (str) {
                arr = str.split(",");
                this.setScale(parseFloat(arr[0]), parseFloat(arr[1]));
            }
            str = xml.attributes.rotation;
            if (str)
                this.rotation = parseInt(str);
            str = xml.attributes.pivot;
            if (str) {
                arr = str.split(",");
                this.setPivot(parseFloat(arr[0]), parseFloat(arr[1]));
            }
            str = xml.attributes.alpha;
            if (str)
                this.alpha = parseFloat(str);
            this.touchable = xml.attributes.touchable != "false";
            this.visible = xml.attributes.visible != "false";
            this.grayed = xml.attributes.grayed == "true";
            this.tooltips = xml.attributes.tooltips;
        };
        p.setup_afterAdd = function (xml) {
            var cxml;
            var str = xml.attributes.group;
            if (str)
                this._group = (this._parent.getChildById(str));
            var col = xml.children;
            if (col) {
                var length1 = col.length;
                for (var i1 = 0; i1 < length1; i1++) {
                    var cxml = col[i1];
                    if (cxml.name == "gearDisplay") {
                        this._gearDisplay.setup(cxml);
                    }
                    else if (cxml.name == "gearXY") {
                        this._gearXY.setup(cxml);
                    }
                    else if (cxml.name == "gearSize") {
                        this._gearSize.setup(cxml);
                    }
                    else if (cxml.name == "gearLook") {
                        this._gearLook.setup(cxml);
                    }
                }
            }
        };
        p.initDrag = function () {
            if (this._draggable)
                this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__begin, this);
            else
                this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__begin, this);
        };
        p.dragBegin = function (evt) {
            if (GObject.sDragging != null)
                GObject.sDragging.stopDrag();
            if (evt != null) {
                GObject.sGlobalDragStart.x = evt.stageX;
                GObject.sGlobalDragStart.y = evt.stageY;
            }
            else {
                GObject.sGlobalDragStart.x = fairygui.GRoot.mouseX;
                GObject.sGlobalDragStart.y = fairygui.GRoot.mouseY;
            }
            this.localToGlobalRect(0, 0, this.width, this.height, GObject.sGlobalRect);
            GObject.sDragging = this;
            fairygui.GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__moving2, this);
            fairygui.GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_END, this.__end2, this);
        };
        p.dragEnd = function () {
            if (GObject.sDragging == this) {
                fairygui.GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__moving2, this);
                fairygui.GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__end2, this);
                GObject.sDragging = null;
            }
        };
        p.reset = function () {
            fairygui.GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__moving, this);
            fairygui.GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__end, this);
        };
        p.__begin = function (evt) {
            if (this._touchDownPoint == null)
                this._touchDownPoint = new egret.Point();
            this._touchDownPoint.x = evt.stageX;
            this._touchDownPoint.y = evt.stageY;
            fairygui.GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__moving, this);
            fairygui.GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_END, this.__end, this);
        };
        p.__end = function (evt) {
            this.reset();
        };
        p.__moving = function (evt) {
            var sensitivity = fairygui.UIConfig.touchDragSensitivity;
            if (this._touchDownPoint != null
                && Math.abs(this._touchDownPoint.x - evt.stageX) < sensitivity
                && Math.abs(this._touchDownPoint.y - evt.stageY) < sensitivity)
                return;
            this.reset();
            var dragEvent = new fairygui.DragEvent(fairygui.DragEvent.DRAG_START);
            dragEvent.stageX = evt.stageX;
            dragEvent.stageY = evt.stageY;
            dragEvent.touchPointID = evt.touchPointID;
            this.dispatchEvent(dragEvent);
            if (!dragEvent.isDefaultPrevented())
                this.dragBegin(evt);
        };
        p.__moving2 = function (evt) {
            var xx = evt.stageX - GObject.sGlobalDragStart.x + GObject.sGlobalRect.x;
            var yy = evt.stageY - GObject.sGlobalDragStart.y + GObject.sGlobalRect.y;
            if (this._dragBounds != null) {
                var rect = fairygui.GRoot.inst.localToGlobalRect(this._dragBounds.x, this._dragBounds.y, this._dragBounds.width, this._dragBounds.height, GObject.sDragHelperRect);
                if (xx < rect.x)
                    xx = rect.x;
                else if (xx + GObject.sGlobalRect.width > rect.right) {
                    xx = rect.right - GObject.sGlobalRect.width;
                    if (xx < rect.x)
                        xx = rect.x;
                }
                if (yy < rect.y)
                    yy = rect.y;
                else if (yy + GObject.sGlobalRect.height > rect.bottom) {
                    yy = rect.bottom - GObject.sGlobalRect.height;
                    if (yy < rect.y)
                        yy = rect.y;
                }
            }
            var pt = this.parent.globalToLocal(xx, yy, GObject.sHelperPoint);
            this.setXY(Math.round(pt.x), Math.round(pt.y));
        };
        p.__end2 = function (evt) {
            if (GObject.sDragging == this) {
                this.stopDrag();
                var dragEvent = new fairygui.DragEvent(fairygui.DragEvent.DRAG_END);
                dragEvent.stageX = evt.stageX;
                dragEvent.stageY = evt.stageY;
                dragEvent.touchPointID = evt.touchPointID;
                this.dispatchEvent(dragEvent);
            }
        };
        GObject._gInstanceCounter = 0;
        GObject.XY_CHANGED = "__xyChanged";
        GObject.SIZE_CHANGED = "__sizeChanged";
        GObject.SIZE_DELAY_CHANGE = "__sizeDelayChange";
        GObject.sGlobalDragStart = new egret.Point();
        GObject.sGlobalRect = new egret.Rectangle();
        GObject.sHelperPoint = new egret.Point();
        GObject.sDragHelperRect = new egret.Rectangle();
        return GObject;
    })(egret.EventDispatcher);
    fairygui.GObject = GObject;
    egret.registerClass(GObject,'fairygui.GObject');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var PackageItem = (function () {
        function PackageItem() {
            this.width = 0;
            this.height = 0;
        }
        var d = __define,c=PackageItem,p=c.prototype;
        p.load = function () {
            return this.owner.getItemAsset(this);
        };
        p.toString = function () {
            return this.name;
        };
        return PackageItem;
    })();
    fairygui.PackageItem = PackageItem;
    egret.registerClass(PackageItem,'fairygui.PackageItem');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GComponent = (function (_super) {
        __extends(GComponent, _super);
        function GComponent() {
            _super.call(this);
            this._sortingChildCount = 0;
            this._bounds = new egret.Rectangle();
            this._children = new Array();
            this._controllers = new Array();
            this._transitions = new Array();
            this._margin = new fairygui.Margin();
            this.opaque = true;
        }
        var d = __define,c=GComponent,p=c.prototype;
        p.createDisplayObject = function () {
            this._rootContainer = new fairygui.UIContainer(this);
            this.setDisplayObject(this._rootContainer);
            this._container = this._rootContainer;
        };
        p.dispose = function () {
            var numChildren = this._children.length;
            for (var i = numChildren - 1; i >= 0; --i)
                this._children[i].dispose();
            if (this._scrollPane != null)
                this._scrollPane.dispose();
            _super.prototype.dispose.call(this);
        };
        d(p, "displayListContainer"
            ,function () {
                return this._container;
            }
        );
        p.addChild = function (child) {
            this.addChildAt(child, this._children.length);
            return child;
        };
        p.addChildAt = function (child, index) {
            if (index === void 0) { index = 0; }
            if (!child)
                throw "child is null";
            var numChildren = this._children.length;
            if (index >= 0 && index <= numChildren) {
                if (child.parent == this) {
                    this.setChildIndex(child, index);
                }
                else {
                    child.removeFromParent();
                    child.parent = this;
                    var cnt = this._children.length;
                    if (child.sortingOrder != 0) {
                        this._sortingChildCount++;
                        index = this.getInsertPosForSortingChild(child);
                    }
                    else if (this._sortingChildCount > 0) {
                        if (index > (cnt - this._sortingChildCount))
                            index = cnt - this._sortingChildCount;
                    }
                    if (index == cnt)
                        this._children.push(child);
                    else
                        this._children.splice(index, 0, child);
                    this.childStateChanged(child);
                    this.setBoundsChangedFlag();
                }
                return child;
            }
            else {
                throw "Invalid child index";
            }
        };
        p.getInsertPosForSortingChild = function (target) {
            var cnt = this._children.length;
            var i = 0;
            for (i = 0; i < cnt; i++) {
                var child = this._children[i];
                if (child == target)
                    continue;
                if (target.sortingOrder < child.sortingOrder)
                    break;
            }
            return i;
        };
        p.removeChild = function (child, dispose) {
            if (dispose === void 0) { dispose = false; }
            var childIndex = this._children.indexOf(child);
            if (childIndex != -1) {
                this.removeChildAt(childIndex, dispose);
            }
            return child;
        };
        p.removeChildAt = function (index, dispose) {
            if (dispose === void 0) { dispose = false; }
            if (index >= 0 && index < this.numChildren) {
                var child = this._children[index];
                child.parent = null;
                if (child.sortingOrder != 0)
                    this._sortingChildCount--;
                this._children.splice(index, 1);
                if (child.inContainer)
                    this._container.removeChild(child.displayObject);
                if (dispose)
                    child.dispose();
                this.setBoundsChangedFlag();
                return child;
            }
            else {
                throw "Invalid child index";
            }
        };
        p.removeChildren = function (beginIndex, endIndex, dispose) {
            if (beginIndex === void 0) { beginIndex = 0; }
            if (endIndex === void 0) { endIndex = -1; }
            if (dispose === void 0) { dispose = false; }
            if (endIndex < 0 || endIndex >= this.numChildren)
                endIndex = this.numChildren - 1;
            for (var i = beginIndex; i <= endIndex; ++i)
                this.removeChildAt(beginIndex, dispose);
        };
        p.getChildAt = function (index) {
            if (index === void 0) { index = 0; }
            if (index >= 0 && index < this.numChildren)
                return this._children[index];
            else
                throw "Invalid child index";
        };
        p.getChild = function (name) {
            var cnt = this._children.length;
            for (var i = 0; i < cnt; ++i) {
                if (this._children[i].name == name)
                    return this._children[i];
            }
            return null;
        };
        p.getVisibleChild = function (name) {
            var cnt = this._children.length;
            for (var i = 0; i < cnt; ++i) {
                var child = this._children[i];
                if (child.finalVisible && child.name == name)
                    return child;
            }
            return null;
        };
        p.getChildInGroup = function (name, group) {
            var cnt = this._children.length;
            for (var i = 0; i < cnt; ++i) {
                var child = this._children[i];
                if (child.group == group && child.name == name)
                    return child;
            }
            return null;
        };
        p.getChildById = function (id) {
            var cnt = this._children.length;
            for (var i = 0; i < cnt; ++i) {
                if (this._children[i]._id == id)
                    return this._children[i];
            }
            return null;
        };
        p.getChildIndex = function (child) {
            return this._children.indexOf(child);
        };
        p.setChildIndex = function (child, index) {
            if (index === void 0) { index = 0; }
            var oldIndex = this._children.indexOf(child);
            if (oldIndex == -1)
                throw "Not a child of this container";
            if (child.sortingOrder != 0)
                return;
            var cnt = this._children.length;
            if (this._sortingChildCount > 0) {
                if (index > (cnt - this._sortingChildCount - 1))
                    index = cnt - this._sortingChildCount - 1;
            }
            this._setChildIndex(child, oldIndex, index);
        };
        p._setChildIndex = function (child, oldIndex, index) {
            if (index === void 0) { index = 0; }
            var cnt = this._children.length;
            if (index > cnt)
                index = cnt;
            if (oldIndex == index)
                return;
            this._children.splice(oldIndex, 1);
            this._children.splice(index, 0, child);
            if (child.inContainer) {
                var displayIndex = 0;
                for (var i = 0; i < index; i++) {
                    var g = this._children[i];
                    if (g.inContainer)
                        displayIndex++;
                }
                if (displayIndex == this._container.numChildren)
                    displayIndex--;
                this._container.setChildIndex(child.displayObject, displayIndex);
                this.setBoundsChangedFlag();
            }
        };
        p.swapChildren = function (child1, child2) {
            var index1 = this._children.indexOf(child1);
            var index2 = this._children.indexOf(child2);
            if (index1 == -1 || index2 == -1)
                throw "Not a child of this container";
            this.swapChildrenAt(index1, index2);
        };
        p.swapChildrenAt = function (index1, index2) {
            if (index2 === void 0) { index2 = 0; }
            var child1 = this._children[index1];
            var child2 = this._children[index2];
            this.setChildIndex(child1, index2);
            this.setChildIndex(child2, index1);
        };
        d(p, "numChildren"
            ,function () {
                return this._children.length;
            }
        );
        p.addController = function (controller) {
            this._controllers.push(controller);
            controller._parent = this;
            this.applyController(controller);
        };
        p.getControllerAt = function (index) {
            return this._controllers[index];
        };
        p.getController = function (name) {
            var cnt = this._controllers.length;
            for (var i = 0; i < cnt; ++i) {
                var c = this._controllers[i];
                if (c.name == name)
                    return c;
            }
            return null;
        };
        p.removeController = function (c) {
            var index = this._controllers.indexOf(c);
            if (index == -1)
                throw new Error("controller not exists");
            c._parent = null;
            this._controllers.splice(index, 1);
            var length = this._children.length;
            for (var i = 0; i < length; i++) {
                var child = this._children[i];
                child.handleControllerChanged(c);
            }
        };
        d(p, "controllers"
            ,function () {
                return this._controllers;
            }
        );
        p.childStateChanged = function (child) {
            if (this._buildingDisplayList)
                return;
            if (child instanceof fairygui.GGroup) {
                var length = this._children.length;
                for (var i = 0; i < length; i++) {
                    var g = this._children[i];
                    if (g.group == child)
                        this.childStateChanged(g);
                }
                return;
            }
            if (!child.displayObject)
                return;
            if (child.finalVisible) {
                if (!child.displayObject.parent) {
                    var index = 0;
                    var length1 = this._children.length;
                    for (var i1 = 0; i1 < length1; i1++) {
                        g = this._children[i1];
                        if (g == child)
                            break;
                        if (g.displayObject && g.displayObject.parent)
                            index++;
                    }
                    this._container.addChildAt(child.displayObject, index);
                }
            }
            else {
                if (child.displayObject.parent)
                    this._container.removeChild(child.displayObject);
            }
        };
        p.applyController = function (c) {
            var child;
            var length = this._children.length;
            for (var i = 0; i < length; i++) {
                child = this._children[i];
                child.handleControllerChanged(c);
            }
        };
        p.applyAllControllers = function () {
            var cnt = this._controllers.length;
            for (var i = 0; i < cnt; ++i) {
                this.applyController(this._controllers[i]);
            }
        };
        p.adjustRadioGroupDepth = function (obj, c) {
            var cnt = this._children.length;
            var i;
            var child;
            var myIndex = -1, maxIndex = -1;
            for (i = 0; i < cnt; i++) {
                child = this._children[i];
                if (child == obj) {
                    myIndex = i;
                }
                else if ((child instanceof fairygui.GButton)
                    && child.relatedController == c) {
                    if (i > maxIndex)
                        maxIndex = i;
                }
            }
            if (myIndex < maxIndex)
                this.swapChildrenAt(myIndex, maxIndex);
        };
        p.getTransitionAt = function (index) {
            return this._transitions[index];
        };
        p.getTransition = function (transName) {
            var cnt = this._transitions.length;
            for (var i = 0; i < cnt; ++i) {
                var trans = this._transitions[i];
                if (trans.name == transName)
                    return trans;
            }
            return null;
        };
        p.isChildInView = function (child) {
            if (this._rootContainer.mask != null) {
                return child.x + child.width >= 0 && child.x <= this.width
                    && child.y + child.height >= 0 && child.y <= this.height;
            }
            else if (this._scrollPane != null) {
                return this._scrollPane.isChildInView(child);
            }
            else
                return true;
        };
        d(p, "scrollPane"
            ,function () {
                return this._scrollPane;
            }
        );
        d(p, "opaque"
            ,function () {
                return this._opaque;
            }
            ,function (value) {
                if (this._opaque != value) {
                    this._opaque = value;
                    if (this._opaque)
                        this.updateOpaque();
                    else
                        this._rootContainer.hitArea = null;
                }
            }
        );
        p.updateOpaque = function () {
            if (!this._rootContainer.hitArea)
                this._rootContainer.hitArea = new egret.Rectangle();
            this._rootContainer.hitArea.setTo(0, 0, this.width, this.height);
        };
        p.updateMask = function () {
            var mask;
            if (this._rootContainer.mask)
                mask = this._rootContainer.mask;
            else
                mask = new egret.Rectangle();
            var left = this._margin.left;
            var top = this._margin.top;
            var w = this.width - (this._margin.left + this._margin.right);
            var h = this.height - (this._margin.top + this._margin.bottom);
            mask.setTo(left, top, w, h);
            this._rootContainer.mask = mask;
        };
        p.setupScroll = function (scrollBarMargin, scroll, scrollBarDisplay, flags, vtScrollBarRes, hzScrollBarRes) {
            this._container = new egret.DisplayObjectContainer();
            this._rootContainer.addChild(this._container);
            this._scrollPane = new fairygui.ScrollPane(this, scroll, this._margin, scrollBarMargin, scrollBarDisplay, flags, vtScrollBarRes, hzScrollBarRes);
            this.setBoundsChangedFlag();
        };
        p.setupOverflow = function (overflow) {
            if (overflow == fairygui.OverflowType.Hidden) {
                this._container = new egret.DisplayObjectContainer();
                this._rootContainer.addChild(this._container);
                this.updateMask();
                this._container.x = this._margin.left;
                this._container.y = this._margin.top;
            }
            else if (this._margin.left != 0 || this._margin.top != 0) {
                this._container = new egret.DisplayObjectContainer();
                this._rootContainer.addChild(this._container);
                this._container.x = this._margin.left;
                this._container.y = this._margin.top;
            }
            this.setBoundsChangedFlag();
        };
        p.handleSizeChanged = function () {
            if (this._scrollPane)
                this._scrollPane.setSize(this.width, this.height);
            else if (this._rootContainer.mask != null)
                this.updateMask();
            if (this._opaque)
                this.updateOpaque();
            this._rootContainer.scaleX = this.scaleX;
            this._rootContainer.scaleY = this.scaleY;
        };
        p.handleGrayChanged = function () {
            var c = this.getController("grayed");
            if (c != null) {
                c.selectedIndex = this.grayed ? 1 : 0;
                return;
            }
            var v = this.grayed;
            var cnt = this._children.length;
            for (var i = 0; i < cnt; ++i) {
                this._children[i].grayed = v;
            }
        };
        p.setBoundsChangedFlag = function () {
            if (!this._scrollPane && !this._trackBounds)
                return;
            if (!this._boundsChanged) {
                this._boundsChanged = true;
                egret.callLater(this.__render, this);
            }
        };
        p.__render = function () {
            if (this._boundsChanged)
                this.updateBounds();
        };
        p.ensureBoundsCorrect = function () {
            if (this._boundsChanged)
                this.updateBounds();
        };
        p.updateBounds = function () {
            var ax, ay, aw, ah = 0;
            if (this._children.length > 0) {
                ax = Number.POSITIVE_INFINITY, ay = Number.POSITIVE_INFINITY;
                var ar = Number.NEGATIVE_INFINITY, ab = Number.NEGATIVE_INFINITY;
                var tmp = 0;
                var i = 0;
                var length1 = this._children.length;
                for (i1 = 0; i1 < length1; i1++) {
                    child = this._children[i1];
                    child.ensureSizeCorrect();
                }
                for (var i1 = 0; i1 < length1; i1++) {
                    var child = this._children[i1];
                    tmp = child.x;
                    if (tmp < ax)
                        ax = tmp;
                    tmp = child.y;
                    if (tmp < ay)
                        ay = tmp;
                    tmp = child.x + child.actualWidth;
                    if (tmp > ar)
                        ar = tmp;
                    tmp = child.y + child.actualHeight;
                    if (tmp > ab)
                        ab = tmp;
                }
                aw = ar - ax;
                ah = ab - ay;
            }
            else {
                ax = 0;
                ay = 0;
                aw = 0;
                ah = 0;
            }
            if (ax != this._bounds.x || ay != this._bounds.y || aw != this._bounds.width || ah != this._bounds.height)
                this.setBounds(ax, ay, aw, ah);
            else
                this._boundsChanged = false;
        };
        p.setBounds = function (ax, ay, aw, ah) {
            if (ah === void 0) { ah = 0; }
            this._boundsChanged = false;
            this._bounds.x = ax;
            this._bounds.y = ay;
            this._bounds.width = aw;
            this._bounds.height = ah;
            if (this._scrollPane)
                this._scrollPane.setContentSize(this._bounds.x + this._bounds.width, this._bounds.y + this._bounds.height);
        };
        d(p, "bounds"
            ,function () {
                if (this._boundsChanged)
                    this.updateBounds();
                return this._bounds;
            }
        );
        d(p, "viewWidth"
            ,function () {
                if (this._scrollPane != null)
                    return this._scrollPane.viewWidth;
                else
                    return this.width - this._margin.left - this._margin.right;
            }
            ,function (value) {
                if (this._scrollPane != null)
                    this._scrollPane.viewWidth = value;
                else
                    this.width = value + this._margin.left + this._margin.right;
            }
        );
        d(p, "viewHeight"
            ,function () {
                if (this._scrollPane != null)
                    return this._scrollPane.viewHeight;
                else
                    return this.height - this._margin.top - this._margin.bottom;
            }
            ,function (value) {
                if (this._scrollPane != null)
                    this._scrollPane.viewHeight = value;
                else
                    this.height = value + this._margin.top + this._margin.bottom;
            }
        );
        p.findObjectNear = function (xValue, yValue, resultPoint) {
            if (!resultPoint)
                resultPoint = new egret.Point();
            resultPoint.x = xValue;
            resultPoint.y = yValue;
            return resultPoint;
        };
        p.childSortingOrderChanged = function (child, oldValue, newValue) {
            if (newValue === void 0) { newValue = 0; }
            if (newValue == 0) {
                this._sortingChildCount--;
                this.setChildIndex(child, this._children.length);
            }
            else {
                if (oldValue == 0)
                    this._sortingChildCount++;
                var oldIndex = this._children.indexOf(child);
                var index = this.getInsertPosForSortingChild(child);
                if (oldIndex < index)
                    this._setChildIndex(child, oldIndex, index - 1);
                else
                    this._setChildIndex(child, oldIndex, index);
            }
        };
        p.constructFromResource = function (pkgItem) {
            this._packageItem = pkgItem;
            this.constructFromXML(this._packageItem.owner.getItemAsset(this._packageItem));
        };
        p.constructFromXML = function (xml) {
            this._underConstruct = true;
            var str;
            var arr;
            str = xml.attributes.size;
            arr = str.split(",");
            this._sourceWidth = parseInt(arr[0]);
            this._sourceHeight = parseInt(arr[1]);
            this._initWidth = this._sourceWidth;
            this._initHeight = this._sourceHeight;
            this.setSize(this._sourceWidth, this._sourceHeight);
            var overflow;
            str = xml.attributes.overflow;
            if (str)
                overflow = fairygui.parseOverflowType(str);
            else
                overflow = fairygui.OverflowType.Visible;
            str = xml.attributes.margin;
            if (str)
                this._margin.parse(str);
            if (overflow == fairygui.OverflowType.Scroll) {
                var scroll;
                str = xml.attributes.scroll;
                if (str)
                    scroll = fairygui.parseScrollType(str);
                else
                    scroll = fairygui.ScrollType.Vertical;
                var scrollBarDisplay;
                str = xml.attributes.scrollBar;
                if (str)
                    scrollBarDisplay = fairygui.parseScrollBarDisplayType(str);
                else
                    scrollBarDisplay = fairygui.ScrollBarDisplayType.Default;
                var scrollBarFlags;
                str = xml.attributes.scrollBarFlags;
                if (str)
                    scrollBarFlags = parseInt(str);
                else
                    scrollBarFlags = 0;
                var scrollBarMargin = new fairygui.Margin();
                str = xml.attributes.scrollBarMargin;
                if (str)
                    scrollBarMargin.parse(str);
                var vtScrollBarRes;
                var hzScrollBarRes;
                str = xml.attributes.scrollBarRes;
                if (str) {
                    arr = str.split(",");
                    vtScrollBarRes = arr[0];
                    hzScrollBarRes = arr[1];
                }
                this.setupScroll(scrollBarMargin, scroll, scrollBarDisplay, scrollBarFlags, vtScrollBarRes, hzScrollBarRes);
            }
            else
                this.setupOverflow(overflow);
            this._buildingDisplayList = true;
            var col = xml.children;
            if (col) {
                var displayList = null;
                var controller;
                var length1 = col.length;
                for (var i1 = 0; i1 < length1; i1++) {
                    var cxml = col[i1];
                    if (cxml.name == "displayList") {
                        displayList = cxml.children;
                        continue;
                    }
                    else if (cxml.name == "controller") {
                        controller = new fairygui.Controller();
                        this._controllers.push(controller);
                        controller._parent = this;
                        controller.setup(cxml);
                    }
                }
                if (displayList) {
                    var u;
                    var length2 = displayList.length;
                    for (var i2 = 0; i2 < length2; i2++) {
                        cxml = displayList[i2];
                        u = this.constructChild(cxml);
                        if (!u)
                            continue;
                        u._underConstruct = true;
                        u._constructingData = cxml;
                        u.setup_beforeAdd(cxml);
                        this.addChild(u);
                    }
                }
                this.relations.setup(xml);
                length2 = this._children.length;
                for (i2 = 0; i2 < length2; i2++) {
                    u = this._children[i2];
                    u.relations.setup(u._constructingData);
                }
                for (i2 = 0; i2 < length2; i2++) {
                    u = this._children[i2];
                    u.setup_afterAdd(u._constructingData);
                    u._underConstruct = false;
                    u._constructingData = null;
                }
                var trans;
                for (i1 = 0; i1 < length1; i1++) {
                    var cxml = col[i1];
                    if (cxml.name == "transition") {
                        trans = new fairygui.Transition(this);
                        this._transitions.push(trans);
                        trans.setup(cxml);
                    }
                }
            }
            this.applyAllControllers();
            this._buildingDisplayList = false;
            this._underConstruct = false;
            length1 = this._children.length;
            for (i1 = 0; i1 < length1; i1++) {
                var child = this._children[i1];
                if (child.displayObject != null && child.finalVisible)
                    this._container.addChild(child.displayObject);
            }
        };
        p.constructChild = function (xml) {
            var pkgId = xml.attributes.pkg;
            var thisPkg = this._packageItem.owner;
            var pkg;
            if (pkgId && pkgId != thisPkg.id) {
                pkg = fairygui.UIPackage.getById(pkgId);
                if (!pkg)
                    return null;
            }
            else
                pkg = thisPkg;
            var src = xml.attributes.src;
            if (src) {
                var pi = pkg.getItem(src);
                if (!pi)
                    return null;
                var g = pkg.createObject2(pi);
                return g;
            }
            else {
                var str = xml.name;
                if (str == "text" && xml.attributes.input == "true")
                    g = new fairygui.GTextInput();
                else
                    g = fairygui.UIObjectFactory.newObject2(str);
                return g;
            }
        };
        return GComponent;
    })(fairygui.GObject);
    fairygui.GComponent = GComponent;
    egret.registerClass(GComponent,'fairygui.GComponent');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GButton = (function (_super) {
        __extends(GButton, _super);
        function GButton() {
            _super.call(this);
            this._mode = fairygui.ButtonMode.Common;
            this._title = "";
            this._icon = "";
            this._sound = fairygui.UIConfig.buttonSound;
            this._soundVolumeScale = fairygui.UIConfig.buttonSoundVolumeScale;
            this._pageOption = new fairygui.PageOption();
            this._changeStateOnClick = true;
        }
        var d = __define,c=GButton,p=c.prototype;
        d(p, "icon"
            ,function () {
                return this._icon;
            }
            ,function (value) {
                this._icon = value;
                value = (this._selected && this._selectedIcon) ? this._selectedIcon : this._icon;
                if (this._iconObject instanceof fairygui.GLoader)
                    this._iconObject.url = value;
                else if (this._iconObject instanceof fairygui.GLabel)
                    this._iconObject.icon = value;
                else if (this._iconObject instanceof GButton)
                    this._iconObject.icon = value;
            }
        );
        d(p, "selectedIcon"
            ,function () {
                return this._selectedIcon;
            }
            ,function (value) {
                this._selectedIcon = value;
                value = (this._selected && this._selectedIcon) ? this._selectedIcon : this._icon;
                if (this._iconObject instanceof fairygui.GLoader)
                    this._iconObject.url = value;
                else if (this._iconObject instanceof fairygui.GLabel)
                    this._iconObject.icon = value;
                else if (this._iconObject instanceof GButton)
                    this._iconObject.icon = value;
            }
        );
        d(p, "title"
            ,function () {
                return this._title;
            }
            ,function (value) {
                this._title = value;
                if (this._titleObject)
                    this._titleObject.text = (this._selected && this._selectedTitle) ? this._selectedTitle : this._title;
            }
        );
        d(p, "text"
            ,function () {
                return this.title;
            }
            ,function (value) {
                this.title = value;
            }
        );
        d(p, "selectedTitle"
            ,function () {
                return this._selectedTitle;
            }
            ,function (value) {
                this._selectedTitle = value;
                if (this._titleObject)
                    this._titleObject.text = (this._selected && this._selectedTitle) ? this._selectedTitle : this._title;
            }
        );
        d(p, "titleColor"
            ,function () {
                if (this._titleObject instanceof fairygui.GTextField)
                    return this._titleObject.color;
                else if (this._titleObject instanceof fairygui.GLabel)
                    return this._titleObject.titleColor;
                else if (this._titleObject instanceof GButton)
                    return this._titleObject.titleColor;
                else
                    return 0;
            }
            ,function (value) {
                if (this._titleObject instanceof fairygui.GTextField)
                    this._titleObject.color = value;
                else if (this._titleObject instanceof fairygui.GLabel)
                    this._titleObject.titleColor = value;
                else if (this._titleObject instanceof GButton)
                    this._titleObject.titleColor = value;
            }
        );
        d(p, "sound"
            ,function () {
                return this._sound;
            }
            ,function (val) {
                this._sound = val;
            }
        );
        d(p, "soundVolumeScale"
            ,function () {
                return this._soundVolumeScale;
            }
            ,function (value) {
                this._soundVolumeScale = value;
            }
        );
        d(p, "selected"
            ,function () {
                return this._selected;
            }
            ,function (val) {
                if (this._mode == fairygui.ButtonMode.Common)
                    return;
                if (this._selected != val) {
                    this._selected = val;
                    if (this.grayed && this._buttonController && this._buttonController.hasPage(GButton.DISABLED)) {
                        if (this._selected)
                            this.setState(GButton.SELECTED_DISABLED);
                        else
                            this.setState(GButton.DISABLED);
                    }
                    else {
                        if (this._selected)
                            this.setState(this._over ? GButton.SELECTED_OVER : GButton.DOWN);
                        else
                            this.setState(this._over ? GButton.OVER : GButton.UP);
                    }
                    if (this._selectedTitle && this._titleObject)
                        this._titleObject.text = this._selected ? this._selectedTitle : this._title;
                    if (this._selectedIcon) {
                        var str = this._selected ? this._selectedIcon : this._icon;
                        if (this._iconObject instanceof fairygui.GLoader)
                            this._iconObject.url = str;
                        else if (this._iconObject instanceof fairygui.GLabel)
                            this._iconObject.icon = str;
                        else if (this._iconObject instanceof GButton)
                            this._iconObject.icon = str;
                    }
                    if (this._relatedController
                        && this._parent
                        && !this._parent._buildingDisplayList) {
                        if (this._selected) {
                            this._relatedController.selectedPageId = this._pageOption.id;
                            if (this._relatedController._autoRadioGroupDepth)
                                this._parent.adjustRadioGroupDepth(this, this._relatedController);
                        }
                        else if (this._mode == fairygui.ButtonMode.Check && this._relatedController.selectedPageId == this._pageOption.id)
                            this._relatedController.oppositePageId = this._pageOption.id;
                    }
                }
            }
        );
        d(p, "mode"
            ,function () {
                return this._mode;
            }
            ,function (value) {
                if (this._mode != value) {
                    if (value == fairygui.ButtonMode.Common)
                        this.selected = false;
                    this._mode = value;
                }
            }
        );
        d(p, "relatedController"
            ,function () {
                return this._relatedController;
            }
            ,function (val) {
                if (val != this._relatedController) {
                    this._relatedController = val;
                    this._pageOption.controller = val;
                    this._pageOption.clear();
                }
            }
        );
        d(p, "pageOption"
            ,function () {
                return this._pageOption;
            }
        );
        d(p, "changeStateOnClick"
            ,function () {
                return this._changeStateOnClick;
            }
            ,function (value) {
                this._changeStateOnClick = value;
            }
        );
        d(p, "linkedPopup"
            ,function () {
                return this._linkedPopup;
            }
            ,function (value) {
                this._linkedPopup = value;
            }
        );
        p.addStateListener = function (listener, thisObj) {
            this.addEventListener(fairygui.StateChangeEvent.CHANGED, listener, thisObj);
        };
        p.removeStateListener = function (listener, thisObj) {
            this.removeEventListener(fairygui.StateChangeEvent.CHANGED, listener, thisObj);
        };
        p.fireClick = function (downEffect) {
            if (downEffect === void 0) { downEffect = true; }
            if (downEffect && this._mode == fairygui.ButtonMode.Common) {
                this.setState(GButton.OVER);
                fairygui.GTimers.inst.add(100, 1, this.setState, this, GButton.DOWN);
                fairygui.GTimers.inst.add(200, 1, this.setState, this, GButton.UP);
            }
            this.__click(null);
        };
        p.setState = function (val) {
            if (this._buttonController)
                this._buttonController.selectedPage = val;
        };
        p.handleControllerChanged = function (c) {
            _super.prototype.handleControllerChanged.call(this, c);
            if (this._relatedController == c)
                this.selected = this._pageOption.id == c.selectedPageId;
        };
        p.handleGrayChanged = function () {
            if (this._buttonController && this._buttonController.hasPage(GButton.DISABLED)) {
                if (this.grayed) {
                    if (this._selected && this._buttonController.hasPage(GButton.SELECTED_DISABLED))
                        this.setState(GButton.SELECTED_DISABLED);
                    else
                        this.setState(GButton.DISABLED);
                }
                else if (this._selected)
                    this.setState(GButton.DOWN);
                else
                    this.setState(GButton.UP);
            }
            else
                _super.prototype.handleGrayChanged.call(this);
        };
        p.constructFromXML = function (xml) {
            _super.prototype.constructFromXML.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "Button");
            var str;
            str = xml.attributes.mode;
            if (str)
                this._mode = fairygui.parseButtonMode(str);
            str = xml.attributes.sound;
            if (str != null)
                this._sound = str;
            str = xml.attributes.volume;
            if (str)
                this._soundVolumeScale = parseInt(str) / 100;
            this._buttonController = this.getController("button");
            this._titleObject = this.getChild("title");
            this._iconObject = this.getChild("icon");
            if (this._mode == fairygui.ButtonMode.Common)
                this.setState(GButton.UP);
            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__mousedown, this);
            this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.__click, this);
        };
        p.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "Button");
            if (xml) {
                var str;
                this.title = xml.attributes.title;
                this.icon = xml.attributes.icon;
                str = xml.attributes.selectedTitle;
                if (str)
                    this.selectedTitle = str;
                str = xml.attributes.selectedIcon;
                ;
                if (str)
                    this.selectedIcon = str;
                str = xml.attributes.titleColor;
                if (str)
                    this.titleColor = fairygui.ToolSet.convertFromHtmlColor(str);
                str = xml.attributes.controller;
                if (str)
                    this._relatedController = this._parent.getController(xml.attributes.controller);
                else
                    this._relatedController = null;
                this._pageOption.id = xml.attributes.page;
                this.selected = xml.attributes.checked == "true";
            }
        };
        p.__rollover = function (evt) {
            if (!this._buttonController || !this._buttonController.hasPage(GButton.OVER))
                return;
            this._over = true;
            if (this._down)
                return;
            this.setState(this._selected ? GButton.SELECTED_OVER : GButton.OVER);
        };
        p.__rollout = function (evt) {
            if (!this._buttonController || !this._buttonController.hasPage(GButton.OVER))
                return;
            this._over = false;
            if (this._down)
                return;
            this.setState(this._selected ? GButton.DOWN : GButton.UP);
        };
        p.__mousedown = function (evt) {
            this._down = true;
            fairygui.GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_END, this.__mouseup, this);
            if (this._mode == fairygui.ButtonMode.Common) {
                if (this.grayed && this._buttonController && this._buttonController.hasPage(GButton.DISABLED))
                    this.setState(GButton.SELECTED_DISABLED);
                else
                    this.setState(GButton.DOWN);
            }
            if (this._linkedPopup != null) {
                if (this._linkedPopup instanceof fairygui.Window)
                    (this._linkedPopup).toggleStatus();
                else {
                    var r = this.root;
                    if (r)
                        r.togglePopup(this._linkedPopup, this);
                }
            }
        };
        p.__mouseup = function (evt) {
            if (this._down) {
                fairygui.GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__mouseup, this);
                this._down = false;
                if (this._mode == fairygui.ButtonMode.Common) {
                    if (this.grayed && this._buttonController && this._buttonController.hasPage(GButton.DISABLED))
                        this.setState(GButton.DISABLED);
                    else if (this._over)
                        this.setState(GButton.OVER);
                    else
                        this.setState(GButton.UP);
                }
            }
        };
        p.__click = function (evt) {
            if (this._sound) {
                var pi = fairygui.UIPackage.getItemByURL(this._sound);
                if (pi) {
                    var sound = pi.owner.getItemAsset(pi);
                    if (sound)
                        fairygui.GRoot.inst.playOneShotSound(sound, this._soundVolumeScale);
                }
            }
            if (!this._changeStateOnClick)
                return;
            if (this._mode == fairygui.ButtonMode.Check) {
                this.selected = !this._selected;
                this.dispatchEvent(new fairygui.StateChangeEvent(fairygui.StateChangeEvent.CHANGED));
            }
            else if (this._mode == fairygui.ButtonMode.Radio) {
                if (!this._selected) {
                    this.selected = true;
                    this.dispatchEvent(new fairygui.StateChangeEvent(fairygui.StateChangeEvent.CHANGED));
                }
            }
        };
        GButton.UP = "up";
        GButton.DOWN = "down";
        GButton.OVER = "over";
        GButton.SELECTED_OVER = "selectedOver";
        GButton.DISABLED = "disabled";
        GButton.SELECTED_DISABLED = "selectedDisabled";
        return GButton;
    })(fairygui.GComponent);
    fairygui.GButton = GButton;
    egret.registerClass(GButton,'fairygui.GButton');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GComboBox = (function (_super) {
        __extends(GComboBox, _super);
        function GComboBox() {
            _super.call(this);
            this._visibleItemCount = 0;
            this._selectedIndex = 0;
            this._visibleItemCount = fairygui.UIConfig.defaultComboBoxVisibleItemCount;
            this._itemsUpdated = true;
            this._selectedIndex = -1;
            this._items = [];
            this._values = [];
        }
        var d = __define,c=GComboBox,p=c.prototype;
        d(p, "text"
            ,function () {
                if (this._titleObject)
                    return this._titleObject.text;
                else
                    return null;
            }
            ,function (value) {
                if (this._titleObject)
                    this._titleObject.text = value;
            }
        );
        d(p, "titleColor"
            ,function () {
                if (this._titleObject)
                    return this._titleObject.color;
                else
                    return 0;
            }
            ,function (value) {
                if (this._titleObject)
                    this._titleObject.color = value;
            }
        );
        d(p, "visibleItemCount"
            ,function () {
                return this._visibleItemCount;
            }
            ,function (value) {
                this._visibleItemCount = value;
            }
        );
        d(p, "items"
            ,function () {
                return this._items;
            }
            ,function (value) {
                if (!value)
                    this._items.length = 0;
                else
                    this._items = value.concat();
                if (this._items.length > 0) {
                    if (this._selectedIndex >= this._items.length)
                        this._selectedIndex = this._items.length - 1;
                    else if (this._selectedIndex == -1)
                        this._selectedIndex = 0;
                    this.text = this._items[this._selectedIndex];
                }
                else
                    this.text = "";
                this._itemsUpdated = true;
            }
        );
        d(p, "values"
            ,function () {
                return this._values;
            }
            ,function (value) {
                if (!value)
                    this._values.length = 0;
                else
                    this._values = value.concat();
            }
        );
        d(p, "selectedIndex"
            ,function () {
                return this._selectedIndex;
            }
            ,function (val) {
                if (this._selectedIndex == val)
                    return;
                this._selectedIndex = val;
                if (this.selectedIndex >= 0 && this.selectedIndex < this._items.length)
                    this.text = this._items[this._selectedIndex];
                else
                    this.text = "";
            }
        );
        d(p, "value"
            ,function () {
                return this._values[this._selectedIndex];
            }
            ,function (val) {
                this.selectedIndex = this._values.indexOf(val);
            }
        );
        p.setState = function (val) {
            if (this._buttonController)
                this._buttonController.selectedPage = val;
        };
        p.constructFromXML = function (xml) {
            _super.prototype.constructFromXML.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "ComboBox");
            var str;
            this._buttonController = this.getController("button");
            this._titleObject = (this.getChild("title"));
            str = xml.attributes.dropdown;
            if (str) {
                this._dropdownObject = (fairygui.UIPackage.createObjectFromURL(str));
                if (!this._dropdownObject) {
                    console.error("下拉框必须为元件");
                    return;
                }
                this._dropdownObject.name = "this._dropdownObject";
                this._list = this._dropdownObject.getChild("list").asList;
                if (this._list == null) {
                    console.error(this.resourceURL + ": 下拉框的弹出元件里必须包含名为list的列表");
                    return;
                }
                this._list.addEventListener(fairygui.ItemEvent.CLICK, this.__clickItem, this);
                this._list.addRelation(this._dropdownObject, fairygui.RelationType.Width);
                this._list.removeRelation(this._dropdownObject, fairygui.RelationType.Height);
                this._dropdownObject.addRelation(this._list, fairygui.RelationType.Height);
                this._dropdownObject.removeRelation(this._list, fairygui.RelationType.Width);
                this._dropdownObject.displayObject.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.__popupWinClosed, this);
            }
            /*not support
            if (!GRoot.touchScreen) {
                this.displayObject.addEventListener(egret.TouchEvent.TOUCH_ROLL_OVER, this.__rollover, this);
                this.displayObject.addEventListener(egret.TouchEvent.TOUCH_ROLL_OUT, this.__rollout, this);
            }*/
            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__mousedown, this);
        };
        p.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "ComboBox");
            if (xml) {
                var str;
                str = xml.attributes.titleColor;
                if (str)
                    this.titleColor = fairygui.ToolSet.convertFromHtmlColor(str);
                str = xml.attributes.visibleItemCount;
                if (str)
                    this._visibleItemCount = parseInt(str);
                var col = xml.children;
                if (col) {
                    var length = col.length;
                    for (var i = 0; i < length; i++) {
                        var cxml = col[i];
                        if (cxml.name == "item") {
                            this._items.push((cxml.attributes.title));
                            this._values.push((cxml.attributes.value));
                        }
                    }
                }
                str = xml.attributes.title;
                if (str) {
                    this.text = str;
                    this._selectedIndex = this._items.indexOf(str);
                }
                else if (this._items.length > 0) {
                    this._selectedIndex = 0;
                    this.text = this._items[0];
                }
                else
                    this._selectedIndex = -1;
            }
        };
        p.showDropdown = function () {
            if (this._itemsUpdated) {
                this._itemsUpdated = false;
                this._list.removeChildren();
                var cnt = this._items.length;
                for (var i = 0; i < cnt; i++) {
                    var item = this._list.addItemFromPool();
                    item.name = i < this._values.length ? this._values[i] : "";
                    item.text = this._items[i];
                }
                this._list.resizeToFit(this._visibleItemCount);
            }
            this._list.selectedIndex = -1;
            this._dropdownObject.width = this.width;
            var r = this.root;
            if (r)
                r.togglePopup(this._dropdownObject, this, true);
            if (this._dropdownObject.parent)
                this.setState(fairygui.GButton.DOWN);
        };
        p.__popupWinClosed = function (evt) {
            if (this._over)
                this.setState(fairygui.GButton.OVER);
            else
                this.setState(fairygui.GButton.UP);
        };
        p.__clickItem = function (evt) {
            egret.setTimeout(this.__clickItem2, this, 100, this._list.getChildIndex(evt.itemObject));
        };
        p.__clickItem2 = function (index) {
            if (this._dropdownObject.parent instanceof fairygui.GRoot)
                (this._dropdownObject.parent).hidePopup();
            this._selectedIndex = index;
            if (this._selectedIndex >= 0)
                this.text = this._items[this._selectedIndex];
            else
                this.text = "";
            this.dispatchEvent(new fairygui.StateChangeEvent(fairygui.StateChangeEvent.CHANGED));
        };
        p.__rollover = function (evt) {
            this._over = true;
            if (this._down || this._dropdownObject && this._dropdownObject.parent)
                return;
            this.setState(fairygui.GButton.OVER);
        };
        p.__rollout = function (evt) {
            this._over = false;
            if (this._down || this._dropdownObject && this._dropdownObject.parent)
                return;
            this.setState(fairygui.GButton.UP);
        };
        p.__mousedown = function (evt) {
            this._down = true;
            fairygui.GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_END, this.__mouseup, this);
            if (this._dropdownObject)
                this.showDropdown();
        };
        p.__mouseup = function (evt) {
            if (this._down) {
                this._down = false;
                fairygui.GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__mouseup, this);
                if (this._dropdownObject && !this._dropdownObject.parent) {
                    if (this._over)
                        this.setState(fairygui.GButton.OVER);
                    else
                        this.setState(fairygui.GButton.UP);
                }
            }
        };
        return GComboBox;
    })(fairygui.GComponent);
    fairygui.GComboBox = GComboBox;
    egret.registerClass(GComboBox,'fairygui.GComboBox');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GearAnimation = (function (_super) {
        __extends(GearAnimation, _super);
        function GearAnimation(owner) {
            _super.call(this, owner);
        }
        var d = __define,c=GearAnimation,p=c.prototype;
        p.init = function () {
            this._default = new GearAnimationValue(this._owner.playing, this._owner.frame);
            this._storage = {};
        };
        p.addStatus = function (pageId, value) {
            var gv;
            if (pageId == null)
                gv = this._default;
            else {
                gv = new GearAnimationValue();
                this._storage[pageId] = gv;
            }
            var arr = value.split(",");
            gv.frame = parseInt(arr[0]);
            gv.playing = arr[1] == "p";
        };
        p.apply = function () {
            this._owner._gearLocked = true;
            var gv;
            if (this.connected) {
                gv = this._storage[this._controller.selectedPageId];
                if (!gv)
                    gv = this._default;
            }
            else
                gv = this._default;
            this._owner.frame = gv.frame;
            this._owner.playing = gv.playing;
            this._owner._gearLocked = false;
        };
        p.updateState = function () {
            if (this._owner._gearLocked)
                return;
            var mc = this._owner;
            var gv;
            if (this.connected) {
                gv = this._storage[this._controller.selectedPageId];
                if (!gv) {
                    gv = new GearAnimationValue();
                    this._storage[this._controller.selectedPageId] = gv;
                }
            }
            else
                gv = this._default;
            gv.frame = mc.frame;
            gv.playing = mc.playing;
        };
        return GearAnimation;
    })(fairygui.GearBase);
    fairygui.GearAnimation = GearAnimation;
    egret.registerClass(GearAnimation,'fairygui.GearAnimation');
    var GearAnimationValue = (function () {
        function GearAnimationValue(playing, frame) {
            if (playing === void 0) { playing = true; }
            if (frame === void 0) { frame = 0; }
            this.playing = playing;
            this.frame = frame;
        }
        var d = __define,c=GearAnimationValue,p=c.prototype;
        return GearAnimationValue;
    })();
    egret.registerClass(GearAnimationValue,'GearAnimationValue');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GearColor = (function (_super) {
        __extends(GearColor, _super);
        function GearColor(owner) {
            _super.call(this, owner);
            this._default = 0;
        }
        var d = __define,c=GearColor,p=c.prototype;
        p.init = function () {
            this._default = this._owner.color;
            this._storage = {};
        };
        p.addStatus = function (pageId, value) {
            var col = fairygui.ToolSet.convertFromHtmlColor(value);
            if (pageId == null)
                this._default = col;
            else
                this._storage[pageId] = col;
        };
        p.apply = function () {
            this._owner._gearLocked = true;
            if (this.connected) {
                var data = this._storage[this._controller.selectedPageId];
                if (data != undefined)
                    (this._owner).color = Math.floor(data);
                else
                    (this._owner).color = Math.floor(this._default);
            }
            else
                (this._owner).color = this._default;
            this._owner._gearLocked = false;
        };
        p.updateState = function () {
            if (this._owner._gearLocked)
                return;
            if (this.connected)
                this._storage[this._controller.selectedPageId] = (this._owner).color;
            else
                this._default = (this._owner).color;
        };
        return GearColor;
    })(fairygui.GearBase);
    fairygui.GearColor = GearColor;
    egret.registerClass(GearColor,'fairygui.GearColor');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GearDisplay = (function (_super) {
        __extends(GearDisplay, _super);
        function GearDisplay(owner) {
            _super.call(this, owner);
        }
        var d = __define,c=GearDisplay,p=c.prototype;
        d(p, "connected"
            ,function () {
                if (this._controller && !this._pageSet.empty)
                    return this._pageSet.containsId(this._controller.selectedPageId);
                else
                    return true;
            }
        );
        p.apply = function () {
            if (this.connected)
                this._owner.internalVisible++;
            else
                this._owner.internalVisible = 0;
        };
        return GearDisplay;
    })(fairygui.GearBase);
    fairygui.GearDisplay = GearDisplay;
    egret.registerClass(GearDisplay,'fairygui.GearDisplay');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GearLook = (function (_super) {
        __extends(GearLook, _super);
        function GearLook(owner) {
            _super.call(this, owner);
        }
        var d = __define,c=GearLook,p=c.prototype;
        p.init = function () {
            this._default = new GearLookValue(this._owner.alpha, this._owner.rotation, this._owner.grayed);
            this._storage = {};
        };
        p.addStatus = function (pageId, value) {
            var arr = value.split(",");
            var gv;
            if (pageId == null)
                gv = this._default;
            else {
                gv = new GearLookValue();
                this._storage[pageId] = gv;
            }
            gv.alpha = parseFloat(arr[0]);
            gv.rotation = parseInt(arr[1]);
            gv.grayed = arr[2] == "1" ? true : false;
        };
        p.apply = function () {
            var gv;
            var ct = this.connected;
            if (ct) {
                gv = this._storage[this._controller.selectedPageId];
                if (!gv)
                    gv = this._default;
            }
            else
                gv = this._default;
            if (this._tweener)
                this._tweener.tick(100000000);
            if (this._tween && !fairygui.UIPackage._constructing
                && ct && this._pageSet.containsId(this._controller.previousPageId)) {
                this._owner._gearLocked = true;
                this._owner.grayed = gv.grayed;
                this._owner._gearLocked = false;
                var a = gv.alpha != this._owner.alpha;
                var b = gv.rotation != this._owner.rotation;
                if (a || b) {
                    this._owner.internalVisible++;
                    var vars = {
                        onChange: function () {
                            this._owner._gearLocked = true;
                            if (a)
                                this._owner.alpha = this._tweenValue.x;
                            if (b)
                                this._owner.rotation = this._tweenValue.y;
                            this._owner._gearLocked = false;
                        },
                        onChangeObj: this
                    };
                    if (this._tweenValue == null)
                        this._tweenValue = new egret.Point();
                    this._tweenValue.x = this._owner.alpha;
                    this._tweenValue.y = this._owner.rotation;
                    this._tweener = egret.Tween.get(this._tweenValue, vars)
                        .to({ x: gv.alpha, y: gv.rotation }, this._tweenTime * 1000, this._easeType)
                        .call(function () {
                        this._owner.internalVisible--;
                        this._tweener = null;
                    }, this);
                }
            }
            else {
                this._owner._gearLocked = true;
                this._owner.grayed = gv.grayed;
                this._owner.alpha = gv.alpha;
                this._owner.rotation = gv.rotation;
                this._owner._gearLocked = false;
            }
        };
        p.updateState = function () {
            if (this._owner._gearLocked)
                return;
            var gv;
            if (this.connected) {
                gv = this._storage[this._controller.selectedPageId];
                if (!gv) {
                    gv = new GearLookValue();
                    this._storage[this._controller.selectedPageId] = gv;
                }
            }
            else {
                gv = this._default;
            }
            gv.alpha = this._owner.alpha;
            gv.rotation = this._owner.rotation;
            gv.grayed = this._owner.grayed;
        };
        return GearLook;
    })(fairygui.GearBase);
    fairygui.GearLook = GearLook;
    egret.registerClass(GearLook,'fairygui.GearLook');
    var GearLookValue = (function () {
        function GearLookValue(alpha, rotation, grayed) {
            if (alpha === void 0) { alpha = 0; }
            if (rotation === void 0) { rotation = 0; }
            if (grayed === void 0) { grayed = false; }
            this.alpha = alpha;
            this.rotation = rotation;
            this.grayed = grayed;
        }
        var d = __define,c=GearLookValue,p=c.prototype;
        return GearLookValue;
    })();
    egret.registerClass(GearLookValue,'GearLookValue');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GGraph = (function (_super) {
        __extends(GGraph, _super);
        function GGraph() {
            _super.call(this);
            this._type = 0;
            this._lineSize = 0;
            this._lineColor = 0;
            this._fillColor = 0;
            this._lineSize = 1;
            this._lineAlpha = 1;
            this._fillAlpha = 1;
            this._fillColor = 0xFFFFFF;
        }
        var d = __define,c=GGraph,p=c.prototype;
        d(p, "graphics"
            ,function () {
                if (this._graphics)
                    return this._graphics;
                this.delayCreateDisplayObject();
                this._graphics = (this.displayObject).graphics;
                return this._graphics;
            }
        );
        p.drawRect = function (lineSize, lineColor, lineAlpha, fillColor, fillAlpha, corner) {
            if (corner === void 0) { corner = null; }
            this._type = 1;
            this._lineSize = lineSize;
            this._lineColor = lineColor;
            this._lineAlpha = lineAlpha;
            this._fillColor = fillColor;
            this._fillAlpha = fillAlpha;
            this._corner = corner;
            this.drawCommon();
        };
        p.drawEllipse = function (lineSize, lineColor, lineAlpha, fillColor, fillAlpha) {
            this._type = 2;
            this._lineSize = lineSize;
            this._lineColor = lineColor;
            this._lineAlpha = lineAlpha;
            this._fillColor = fillColor;
            this._fillAlpha = fillAlpha;
            this._corner = null;
            this.drawCommon();
        };
        p.clearGraphics = function () {
            if (this._graphics) {
                this._type = 0;
                this._graphics.clear();
            }
        };
        p.drawCommon = function () {
            this.graphics;
            this._graphics.clear();
            var w = this.width * this.scaleX;
            var h = this.height * this.scaleY;
            if (w == 0 || h == 0)
                return;
            if (this._lineSize == 0)
                this._graphics.lineStyle(0, 0, 0);
            else
                this._graphics.lineStyle(this._lineSize, this._lineColor, this._lineAlpha);
            this._graphics.beginFill(this._fillColor, this._fillAlpha);
            if (this._type == 1) {
                if (this._corner) {
                    if (this._corner.length == 1)
                        this._graphics.drawRoundRect(0, 0, w, h, this._corner[0], this._corner[0]);
                    else
                        this._graphics.drawRoundRect(0, 0, w, h, this._corner[0], this._corner[1]);
                }
                else
                    this._graphics.drawRect(0, 0, w, h);
            }
            else
                this._graphics.drawEllipse(0, 0, w, h);
            this._graphics.endFill();
        };
        p.replaceMe = function (target) {
            if (!this._parent)
                throw "parent not set";
            target.name = this.name;
            target.alpha = this.alpha;
            target.rotation = this.rotation;
            target.visible = this.visible;
            target.touchable = this.touchable;
            target.grayed = this.grayed;
            target.setXY(this.x, this.y);
            target.setSize(this.width, this.height);
            var index = this._parent.getChildIndex(this);
            this._parent.addChildAt(target, index);
            target.relations.copyFrom(this.relations);
            this._parent.removeChild(this, true);
        };
        p.addBeforeMe = function (target) {
            if (this._parent == null)
                throw "parent not set";
            var index = this._parent.getChildIndex(this);
            this._parent.addChildAt(target, index);
        };
        p.addAfterMe = function (target) {
            if (this._parent == null)
                throw "parent not set";
            var index = this._parent.getChildIndex(this);
            index++;
            this._parent.addChildAt(target, index);
        };
        p.setNativeObject = function (obj) {
            this.delayCreateDisplayObject();
            (this.displayObject).addChild(obj);
        };
        p.delayCreateDisplayObject = function () {
            if (!this.displayObject) {
                this.setDisplayObject(new fairygui.UISprite(this));
                if (this._parent)
                    this._parent.childStateChanged(this);
                this.handleXYChanged();
                this.displayObject.alpha = this.alpha;
                this.displayObject.rotation = this.rotation;
                this.displayObject.visible = this.visible;
                (this.displayObject).touchEnabled = this.touchable;
                (this.displayObject).touchChildren = this.touchable;
                (this.displayObject).hitArea = new egret.Rectangle(0, 0, this.width, this.height);
            }
            else {
                (this.displayObject).graphics.clear();
                (this.displayObject).removeChildren();
                this._graphics = null;
            }
        };
        p.handleSizeChanged = function () {
            if (this._graphics) {
                if (this._type != 0)
                    this.drawCommon();
            }
            if (this.displayObject instanceof fairygui.UISprite) {
                if ((this.displayObject).hitArea == null)
                    (this.displayObject).hitArea = new egret.Rectangle(0, 0, this.width, this.height);
                else {
                    (this.displayObject).hitArea.width = this.width;
                    (this.displayObject).hitArea.height = this.height;
                }
            }
        };
        p.setup_beforeAdd = function (xml) {
            var str;
            var type = xml.attributes.type;
            if (type && type != "empty") {
                this.setDisplayObject(new fairygui.UISprite(this));
            }
            _super.prototype.setup_beforeAdd.call(this, xml);
            if (this.displayObject != null) {
                this._graphics = (this.displayObject).graphics;
                var str;
                str = xml.attributes.lineSize;
                if (str)
                    this._lineSize = parseInt(str);
                str = xml.attributes.lineColor;
                if (str) {
                    var c = fairygui.ToolSet.convertFromHtmlColor(str, true);
                    this._lineColor = c & 0xFFFFFF;
                    this._lineAlpha = ((c >> 24) & 0xFF) / 0xFF;
                }
                str = xml.attributes.fillColor;
                if (str) {
                    c = fairygui.ToolSet.convertFromHtmlColor(str, true);
                    this._fillColor = c & 0xFFFFFF;
                    this._fillAlpha = ((c >> 24) & 0xFF) / 0xFF;
                }
                var arr;
                str = xml.attributes.corner;
                if (str) {
                    arr = str.split(",");
                    if (arr.length > 1)
                        this._corner = [parseInt(arr[0]), parseInt(arr[1])];
                    else
                        this._corner = [parseInt(arr[0])];
                }
                if (type == "rect")
                    this._type = 1;
                else
                    this._type = 2;
                this.drawCommon();
            }
        };
        return GGraph;
    })(fairygui.GObject);
    fairygui.GGraph = GGraph;
    egret.registerClass(GGraph,'fairygui.GGraph');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GGroup = (function (_super) {
        __extends(GGroup, _super);
        function GGroup() {
            _super.call(this);
        }
        var d = __define,c=GGroup,p=c.prototype;
        p.updateBounds = function () {
            if (this._updating || !this.parent)
                return;
            var cnt = this._parent.numChildren;
            var i = 0;
            var child;
            var ax = Number.POSITIVE_INFINITY, ay = Number.POSITIVE_INFINITY;
            var ar = Number.NEGATIVE_INFINITY, ab = Number.NEGATIVE_INFINITY;
            var tmp = 0;
            this._empty = true;
            for (i = 0; i < cnt; i++) {
                child = this._parent.getChildAt(i);
                if (child.group == this) {
                    tmp = child.x;
                    if (tmp < ax)
                        ax = tmp;
                    tmp = child.y;
                    if (tmp < ay)
                        ay = tmp;
                    tmp = child.x + child.width;
                    if (tmp > ar)
                        ar = tmp;
                    tmp = child.y + child.height;
                    if (tmp > ab)
                        ab = tmp;
                    this._empty = false;
                }
            }
            this._updating = true;
            if (!this._empty) {
                this.setXY(ax, ay);
                this.setSize(ar - ax, ab - ay);
            }
            else
                this.setSize(0, 0);
            this._updating = false;
        };
        p.moveChildren = function (dx, dy) {
            if (this._updating || !this.parent)
                return;
            this._updating = true;
            var cnt = this._parent.numChildren;
            var i = 0;
            var child;
            for (i = 0; i < cnt; i++) {
                child = this._parent.getChildAt(i);
                if (child.group == this) {
                    child.setXY(child.x + dx, child.y + dy);
                }
            }
            this._updating = false;
        };
        return GGroup;
    })(fairygui.GObject);
    fairygui.GGroup = GGroup;
    egret.registerClass(GGroup,'fairygui.GGroup');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GImage = (function (_super) {
        __extends(GImage, _super);
        function GImage() {
            _super.call(this);
            this._color = 0xFFFFFF;
            this._gearColor = new fairygui.GearColor(this);
        }
        var d = __define,c=GImage,p=c.prototype;
        d(p, "color"
            ,function () {
                return this._color;
            }
            ,function (value) {
                if (this._color != value) {
                    this._color = value;
                    if (this._gearColor.controller != null)
                        this._gearColor.updateState();
                    this.applyColor();
                }
            }
        );
        p.applyColor = function () {
            /*然而下面的代码egret还不支持
            var ct:egret.ColorTransform = this._content.transform.colorTransform;
            ct.redMultiplier = ((this._color>>16)&0xFF)/255;
            ct.greenMultiplier =  ((this._color>>8)&0xFF)/255;
            ct.blueMultiplier = (this._color&0xFF)/255;
            this._content.transform.colorTransform = ct;
            */
        };
        d(p, "flip"
            ,function () {
                return this._flip;
            }
            ,function (value) {
                if (this._flip != value) {
                    this._flip = value;
                    this._content.scaleX = this._content.scaleY = 1;
                    if (this._flip == fairygui.FlipType.Horizontal || this._flip == fairygui.FlipType.Both)
                        this._content.scaleX = -1;
                    if (this._flip == fairygui.FlipType.Vertical || this._flip == fairygui.FlipType.Both)
                        this._content.scaleY = -1;
                    this.handleXYChanged();
                }
            }
        );
        d(p, "gearColor"
            ,function () {
                return this._gearColor;
            }
        );
        p.handleControllerChanged = function (c) {
            _super.prototype.handleControllerChanged.call(this, c);
            if (this._gearColor.controller == c)
                this._gearColor.apply();
        };
        p.createDisplayObject = function () {
            this._content = new fairygui.UIImage(this);
            this.setDisplayObject(this._content);
        };
        p.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        p.constructFromResource = function (pkgItem) {
            this._packageItem = pkgItem;
            this._sourceWidth = this._packageItem.width;
            this._sourceHeight = this._packageItem.height;
            this._initWidth = this._sourceWidth;
            this._initHeight = this._sourceHeight;
            this._content.scale9Grid = pkgItem.scale9Grid;
            this._content.smoothing = pkgItem.smoothing;
            if (pkgItem.scaleByTile)
                this._content.fillMode = egret.BitmapFillMode.REPEAT;
            this.setSize(this._sourceWidth, this._sourceHeight);
            pkgItem.load();
            this._content.texture = pkgItem.texture;
        };
        p.handleXYChanged = function () {
            _super.prototype.handleXYChanged.call(this);
            if (this._content.scaleX == -1)
                this._content.x += this.width;
            if (this._content.scaleY == -1)
                this._content.y += this.height;
        };
        p.handleSizeChanged = function () {
            this._content.width = this.width * Math.abs(this.scaleX);
            this._content.height = this.height * Math.abs(this.scaleY);
        };
        p.setup_beforeAdd = function (xml) {
            _super.prototype.setup_beforeAdd.call(this, xml);
            var str;
            str = xml.attributes.color;
            if (str)
                this.color = fairygui.ToolSet.convertFromHtmlColor(str);
            str = xml.attributes.flip;
            if (str)
                this.flip = fairygui.parseFlipType(str);
        };
        p.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            var col = xml.children;
            if (col) {
                var length1 = col.length;
                for (var i1 = 0; i1 < length1; i1++) {
                    var cxml = col[i1];
                    if (cxml.name == "gearColor") {
                        this._gearColor.setup(cxml);
                        break;
                    }
                }
            }
        };
        return GImage;
    })(fairygui.GObject);
    fairygui.GImage = GImage;
    egret.registerClass(GImage,'fairygui.GImage',["fairygui.IColorGear"]);
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GLabel = (function (_super) {
        __extends(GLabel, _super);
        function GLabel() {
            _super.call(this);
        }
        var d = __define,c=GLabel,p=c.prototype;
        d(p, "icon"
            ,function () {
                if (this._iconObject instanceof fairygui.GLoader)
                    return this._iconObject.url;
                else if (this._iconObject instanceof GLabel)
                    return this._iconObject.icon;
                else if (this._iconObject instanceof fairygui.GButton)
                    return this._iconObject.icon;
            }
            ,function (value) {
                if (this._iconObject instanceof fairygui.GLoader)
                    this._iconObject.url = value;
                else if (this._iconObject instanceof GLabel)
                    this._iconObject.icon = value;
                else if (this._iconObject instanceof fairygui.GButton)
                    this._iconObject.icon = value;
            }
        );
        d(p, "title"
            ,function () {
                if (this._titleObject)
                    return this._titleObject.text;
                else
                    return null;
            }
            ,function (value) {
                if (this._titleObject)
                    this._titleObject.text = value;
            }
        );
        d(p, "text"
            ,function () {
                return this.title;
            }
            ,function (value) {
                this.title = value;
            }
        );
        d(p, "titleColor"
            ,function () {
                if (this._titleObject instanceof fairygui.GTextField)
                    return this._titleObject.color;
                else if (this._titleObject instanceof GLabel)
                    return this._titleObject.titleColor;
                else if (this._titleObject instanceof fairygui.GButton)
                    return this._titleObject.titleColor;
                else
                    return 0;
            }
            ,function (value) {
                if (this._titleObject instanceof fairygui.GTextField)
                    this._titleObject.color = value;
                else if (this._titleObject instanceof GLabel)
                    this._titleObject.titleColor = value;
                else if (this._titleObject instanceof fairygui.GButton)
                    this._titleObject.titleColor = value;
            }
        );
        d(p, "editable"
            ,function () {
                if (this._titleObject && (this._titleObject instanceof fairygui.GTextInput))
                    return this._titleObject.asTextInput.editable;
                else
                    return false;
            }
            ,function (val) {
                if (this._titleObject)
                    this._titleObject.asTextInput.editable = val;
            }
        );
        p.constructFromXML = function (xml) {
            _super.prototype.constructFromXML.call(this, xml);
            this._titleObject = this.getChild("title");
            this._iconObject = this.getChild("icon");
        };
        p.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "Label");
            if (xml) {
                this.text = xml.attributes.title;
                this.icon = xml.attributes.icon;
                var str;
                str = xml.attributes.titleColor;
                if (str)
                    this.titleColor = fairygui.ToolSet.convertFromHtmlColor(str);
            }
        };
        return GLabel;
    })(fairygui.GComponent);
    fairygui.GLabel = GLabel;
    egret.registerClass(GLabel,'fairygui.GLabel');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GList = (function (_super) {
        __extends(GList, _super);
        function GList() {
            _super.call(this);
            this._lineGap = 0;
            this._columnGap = 0;
            this._lastSelectedIndex = 0;
            this._trackBounds = true;
            this._pool = new fairygui.GObjectPool();
            this._layout = fairygui.ListLayoutType.SingleColumn;
            this._autoResizeItem = true;
            this._lastSelectedIndex = -1;
            this._selectionMode = fairygui.ListSelectionMode.Single;
        }
        var d = __define,c=GList,p=c.prototype;
        p.dispose = function () {
            this._pool.clear();
            _super.prototype.dispose.call(this);
        };
        d(p, "layout"
            ,function () {
                return this._layout;
            }
            ,function (value) {
                if (this._layout != value) {
                    this._layout = value;
                    this.setBoundsChangedFlag();
                }
            }
        );
        d(p, "lineGap"
            ,function () {
                return this._lineGap;
            }
            ,function (value) {
                if (this._lineGap != value) {
                    this._lineGap = value;
                    this.setBoundsChangedFlag();
                }
            }
        );
        d(p, "columnGap"
            ,function () {
                return this._columnGap;
            }
            ,function (value) {
                if (this._columnGap != value) {
                    this._columnGap = value;
                    this.setBoundsChangedFlag();
                }
            }
        );
        d(p, "defaultItem"
            ,function () {
                return this._defaultItem;
            }
            ,function (val) {
                this._defaultItem = val;
            }
        );
        d(p, "autoResizeItem"
            ,function () {
                return this._autoResizeItem;
            }
            ,function (value) {
                this._autoResizeItem = value;
            }
        );
        d(p, "selectionMode"
            ,function () {
                return this._selectionMode;
            }
            ,function (value) {
                this._selectionMode = value;
            }
        );
        p.getFromPool = function (url) {
            if (url === void 0) { url = null; }
            if (!url)
                url = this._defaultItem;
            return this._pool.getObject(url);
        };
        p.returnToPool = function (obj) {
            this._pool.returnObject(obj);
        };
        p.addChildAt = function (child, index) {
            if (index === void 0) { index = 0; }
            if (this._autoResizeItem) {
                if (this._layout == fairygui.ListLayoutType.SingleColumn)
                    child.width = this.viewWidth;
                else if (this._layout == fairygui.ListLayoutType.SingleRow)
                    child.height = this.viewHeight;
            }
            _super.prototype.addChildAt.call(this, child, index);
            if (child instanceof fairygui.GButton) {
                var button = child;
                button.selected = false;
                button.changeStateOnClick = false;
            }
            child.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__mouseDownItem, this);
            child.addEventListener(egret.TouchEvent.TOUCH_TAP, this.__clickItem, this);
            return child;
        };
        p.addItem = function (url) {
            if (url === void 0) { url = null; }
            if (!url)
                url = this._defaultItem;
            return this.addChild(fairygui.UIPackage.createObjectFromURL(url));
        };
        p.addItemFromPool = function (url) {
            if (url === void 0) { url = null; }
            return this.addChild(this.getFromPool(url));
        };
        p.removeChildAt = function (index, dispose) {
            if (dispose === void 0) { dispose = false; }
            var child = _super.prototype.removeChildAt.call(this, index, dispose);
            child.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__mouseDownItem, this);
            child.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.__clickItem, this);
            return child;
        };
        p.removeChildToPoolAt = function (index) {
            if (index === void 0) { index = 0; }
            var child = _super.prototype.removeChildAt.call(this, index);
            this.returnToPool(child);
        };
        p.removeChildToPool = function (child) {
            _super.prototype.removeChild.call(this, child);
            this.returnToPool(child);
        };
        p.removeChildrenToPool = function (beginIndex, endIndex) {
            if (beginIndex === void 0) { beginIndex = 0; }
            if (endIndex === void 0) { endIndex = -1; }
            if (endIndex < 0 || endIndex >= this.numChildren)
                endIndex = this.numChildren - 1;
            for (var i = beginIndex; i <= endIndex; ++i)
                this.removeChildToPoolAt(beginIndex);
        };
        d(p, "selectedIndex"
            ,function () {
                var cnt = this._children.length;
                for (var i = 0; i < cnt; i++) {
                    var obj = this._children[i].asButton;
                    if (obj != null && obj.selected)
                        return i;
                }
                return -1;
            }
            ,function (value) {
                this.clearSelection();
                if (value >= 0 && value < this._children.length)
                    this.addSelection(value);
            }
        );
        p.getSelection = function () {
            var ret = new Array();
            var cnt = this._children.length;
            for (var i = 0; i < cnt; i++) {
                var obj = this._children[i].asButton;
                if (obj != null && obj.selected)
                    ret.push(i);
            }
            return ret;
        };
        p.addSelection = function (index, scrollItToView) {
            if (scrollItToView === void 0) { scrollItToView = false; }
            if (this._selectionMode == fairygui.ListSelectionMode.None)
                return;
            if (this._selectionMode == fairygui.ListSelectionMode.Single)
                this.clearSelection();
            var obj = this.getChildAt(index).asButton;
            if (obj != null) {
                if (!obj.selected)
                    obj.selected = true;
                if (scrollItToView && this._scrollPane != null)
                    this._scrollPane.scrollToView(obj);
            }
        };
        p.removeSelection = function (index) {
            if (index === void 0) { index = 0; }
            if (this._selectionMode == fairygui.ListSelectionMode.None)
                return;
            var obj = this.getChildAt(index).asButton;
            if (obj != null && obj.selected)
                obj.selected = false;
        };
        p.clearSelection = function () {
            var cnt = this._children.length;
            for (var i = 0; i < cnt; i++) {
                var obj = this._children[i].asButton;
                if (obj != null)
                    obj.selected = false;
            }
        };
        p.selectAll = function () {
            var cnt = this._children.length;
            for (var i = 0; i < cnt; i++) {
                var obj = this._children[i].asButton;
                if (obj != null)
                    obj.selected = true;
            }
        };
        p.selectNone = function () {
            var cnt = this._children.length;
            for (var i = 0; i < cnt; i++) {
                var obj = this._children[i].asButton;
                if (obj != null)
                    obj.selected = false;
            }
        };
        p.selectReverse = function () {
            var cnt = this._children.length;
            for (var i = 0; i < cnt; i++) {
                var obj = this._children[i].asButton;
                if (obj != null)
                    obj.selected = !obj.selected;
            }
        };
        p.handleArrowKey = function (dir) {
            if (dir === void 0) { dir = 0; }
            var index = this.selectedIndex;
            if (index == -1)
                return;
            switch (dir) {
                case 1:
                    if (this._layout == fairygui.ListLayoutType.SingleColumn || this._layout == fairygui.ListLayoutType.FlowVertical) {
                        index--;
                        if (index >= 0) {
                            this.clearSelection();
                            this.addSelection(index, true);
                        }
                    }
                    else if (this._layout == fairygui.ListLayoutType.FlowHorizontal) {
                        var current = this._children[index];
                        var k = 0;
                        for (var i = index - 1; i >= 0; i--) {
                            var obj = this._children[i];
                            if (obj.y != current.y) {
                                current = obj;
                                break;
                            }
                            k++;
                        }
                        for (; i >= 0; i--) {
                            obj = this._children[i];
                            if (obj.y != current.y) {
                                this.clearSelection();
                                this.addSelection(i + k + 1, true);
                                break;
                            }
                        }
                    }
                    break;
                case 3:
                    if (this._layout == fairygui.ListLayoutType.SingleRow || this._layout == fairygui.ListLayoutType.FlowHorizontal) {
                        index++;
                        if (index < this._children.length) {
                            this.clearSelection();
                            this.addSelection(index, true);
                        }
                    }
                    else if (this._layout == fairygui.ListLayoutType.FlowVertical) {
                        current = this._children[index];
                        k = 0;
                        var cnt = this._children.length;
                        for (i = index + 1; i < cnt; i++) {
                            obj = this._children[i];
                            if (obj.x != current.x) {
                                current = obj;
                                break;
                            }
                            k++;
                        }
                        for (; i < cnt; i++) {
                            obj = this._children[i];
                            if (obj.x != current.x) {
                                this.clearSelection();
                                this.addSelection(i - k - 1, true);
                                break;
                            }
                        }
                    }
                    break;
                case 5:
                    if (this._layout == fairygui.ListLayoutType.SingleColumn || this._layout == fairygui.ListLayoutType.FlowVertical) {
                        index++;
                        if (index < this._children.length) {
                            this.clearSelection();
                            this.addSelection(index, true);
                        }
                    }
                    else if (this._layout == fairygui.ListLayoutType.FlowHorizontal) {
                        current = this._children[index];
                        k = 0;
                        cnt = this._children.length;
                        for (i = index + 1; i < cnt; i++) {
                            obj = this._children[i];
                            if (obj.y != current.y) {
                                current = obj;
                                break;
                            }
                            k++;
                        }
                        for (; i < cnt; i++) {
                            obj = this._children[i];
                            if (obj.y != current.y) {
                                this.clearSelection();
                                this.addSelection(i - k - 1, true);
                                break;
                            }
                        }
                    }
                    break;
                case 7:
                    if (this._layout == fairygui.ListLayoutType.SingleRow || this._layout == fairygui.ListLayoutType.FlowHorizontal) {
                        index--;
                        if (index >= 0) {
                            this.clearSelection();
                            this.addSelection(index, true);
                        }
                    }
                    else if (this._layout == fairygui.ListLayoutType.FlowVertical) {
                        current = this._children[index];
                        k = 0;
                        for (i = index - 1; i >= 0; i--) {
                            obj = this._children[i];
                            if (obj.x != current.x) {
                                current = obj;
                                break;
                            }
                            k++;
                        }
                        for (; i >= 0; i--) {
                            obj = this._children[i];
                            if (obj.x != current.x) {
                                this.clearSelection();
                                this.addSelection(i + k + 1, true);
                                break;
                            }
                        }
                    }
                    break;
            }
        };
        p.__mouseDownItem = function (evt) {
            var item = (evt.currentTarget);
            if (item == null || this._selectionMode == fairygui.ListSelectionMode.None)
                return;
            this._selectionHandled = false;
            if (fairygui.UIConfig.defaultScrollTouchEffect && this.scrollPane != null)
                return;
            if (this._selectionMode == fairygui.ListSelectionMode.Single) {
                this.setSelectionOnEvent(item);
            }
            else {
                if (!item.selected)
                    this.setSelectionOnEvent(item);
            }
        };
        p.__clickItem = function (evt) {
            if (this._scrollPane != null && this._scrollPane._isMouseMoved)
                return;
            var item = (evt.currentTarget);
            if (!this._selectionHandled)
                this.setSelectionOnEvent(item);
            this._selectionHandled = false;
            if (this.scrollPane)
                this.scrollPane.scrollToView(item, true);
            var ie = new fairygui.ItemEvent(fairygui.ItemEvent.CLICK, item);
            ie.stageX = evt.stageX;
            ie.stageY = evt.stageY;
            this.dispatchEvent(ie);
        };
        p.setSelectionOnEvent = function (item) {
            if (!(item instanceof fairygui.GButton) || this._selectionMode == fairygui.ListSelectionMode.None)
                return;
            this._selectionHandled = true;
            var dontChangeLastIndex = false;
            var button = item;
            var index = this.getChildIndex(item);
            if (this._selectionMode == fairygui.ListSelectionMode.Single) {
                if (!button.selected) {
                    this.clearSelectionExcept(button);
                    button.selected = true;
                }
            }
            else {
                if (fairygui.GRoot.shiftKeyDown) {
                    if (!button.selected) {
                        if (this._lastSelectedIndex != -1) {
                            var min = Math.min(this._lastSelectedIndex, index);
                            var max = Math.max(this._lastSelectedIndex, index);
                            max = Math.min(max, this.numChildren - 1);
                            for (var i = min; i <= max; i++) {
                                var obj = this.getChildAt(i).asButton;
                                if (obj != null && !obj.selected)
                                    obj.selected = true;
                            }
                            dontChangeLastIndex = true;
                        }
                        else {
                            button.selected = true;
                        }
                    }
                }
                else if (fairygui.GRoot.ctrlKeyDown || this._selectionMode == fairygui.ListSelectionMode.Multiple_SingleClick) {
                    button.selected = !button.selected;
                }
                else {
                    if (!button.selected) {
                        this.clearSelectionExcept(button);
                        button.selected = true;
                    }
                    else
                        this.clearSelectionExcept(button);
                }
            }
            if (!dontChangeLastIndex)
                this._lastSelectedIndex = index;
            return;
        };
        p.clearSelectionExcept = function (obj) {
            var cnt = this._children.length;
            for (var i = 0; i < cnt; i++) {
                var button = this._children[i].asButton;
                if (button != null && button != obj && button.selected)
                    button.selected = false;
            }
        };
        p.resizeToFit = function (itemCount, minSize) {
            if (itemCount === void 0) { itemCount = Number.POSITIVE_INFINITY; }
            if (minSize === void 0) { minSize = 0; }
            this.ensureBoundsCorrect();
            var curCount = this.numChildren;
            if (itemCount > curCount)
                itemCount = curCount;
            if (itemCount == 0) {
                if (this._layout == fairygui.ListLayoutType.SingleColumn || this._layout == fairygui.ListLayoutType.FlowHorizontal)
                    this.viewHeight = minSize;
                else
                    this.viewWidth = minSize;
            }
            else {
                var i = itemCount - 1;
                var obj = null;
                while (i >= 0) {
                    obj = this.getChildAt(i);
                    if (obj.visible)
                        break;
                    i--;
                }
                if (i < 0) {
                    if (this._layout == fairygui.ListLayoutType.SingleColumn || this._layout == fairygui.ListLayoutType.FlowHorizontal)
                        this.viewHeight = minSize;
                    else
                        this.viewWidth = minSize;
                }
                else {
                    var size = 0;
                    if (this._layout == fairygui.ListLayoutType.SingleColumn || this._layout == fairygui.ListLayoutType.FlowHorizontal) {
                        size = obj.y + obj.height;
                        if (size < minSize)
                            size = minSize;
                        this.viewHeight = size;
                    }
                    else {
                        size = obj.x + obj.width;
                        if (size < minSize)
                            size = minSize;
                        this.viewWidth = size;
                    }
                }
            }
        };
        p.getMaxItemWidth = function () {
            var cnt = this.numChildren;
            var max = 0;
            for (var i = 0; i < cnt; i++) {
                var child = this.getChildAt(i);
                if (child.width > max)
                    max = child.width;
            }
            return max;
        };
        p.handleSizeChanged = function () {
            _super.prototype.handleSizeChanged.call(this);
            if (this._autoResizeItem)
                this.adjustItemsSize();
            if (this._layout == fairygui.ListLayoutType.FlowHorizontal || this._layout == fairygui.ListLayoutType.FlowVertical)
                this.setBoundsChangedFlag();
        };
        p.adjustItemsSize = function () {
            if (this._layout == fairygui.ListLayoutType.SingleColumn) {
                var cnt = this.numChildren;
                var cw = this.viewWidth;
                for (var i = 0; i < cnt; i++) {
                    var child = this.getChildAt(i);
                    child.width = cw;
                }
            }
            else if (this._layout == fairygui.ListLayoutType.SingleRow) {
                cnt = this.numChildren;
                var ch = this.viewHeight;
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    child.height = ch;
                }
            }
        };
        p.findObjectNear = function (xValue, yValue, resultPoint) {
            if (!resultPoint)
                resultPoint = new egret.Point();
            var cnt = this._children.length;
            if (cnt == 0) {
                resultPoint.x = 0;
                resultPoint.y = 0;
                return resultPoint;
            }
            this.ensureBoundsCorrect();
            var obj = null;
            var i = 0;
            if (yValue != 0) {
                for (; i < cnt; i++) {
                    obj = this._children[i];
                    if (yValue < obj.y) {
                        if (i == 0) {
                            yValue = 0;
                            break;
                        }
                        else {
                            var prev = this._children[i - 1];
                            if (yValue < prev.y + prev.actualHeight / 2)
                                yValue = prev.y;
                            else if (yValue < prev.y + prev.actualHeight)
                                yValue = obj.y;
                            else
                                yValue = obj.y + this._lineGap / 2;
                            break;
                        }
                    }
                }
                if (i == cnt)
                    yValue = obj.y;
            }
            if (xValue != 0) {
                if (i > 0)
                    i--;
                for (; i < cnt; i++) {
                    obj = this._children[i];
                    if (xValue < obj.x) {
                        if (i == 0) {
                            xValue = 0;
                            break;
                        }
                        else {
                            prev = this._children[i - 1];
                            if (xValue < prev.x + prev.actualWidth / 2)
                                xValue = prev.x;
                            else if (xValue < prev.x + prev.actualWidth)
                                xValue = obj.x;
                            else
                                xValue = obj.x + this._columnGap / 2;
                            break;
                        }
                    }
                }
                if (i == cnt)
                    xValue = obj.x;
            }
            resultPoint.x = xValue;
            resultPoint.y = yValue;
            return resultPoint;
        };
        p.updateBounds = function () {
            var cnt = this.numChildren;
            var i = 0;
            var child;
            var curX = 0;
            var curY = 0;
            ;
            var maxWidth = 0;
            var maxHeight = 0;
            var cw, ch = 0;
            for (i = 0; i < cnt; i++) {
                child = this.getChildAt(i);
                child.ensureSizeCorrect();
            }
            if (this._layout == fairygui.ListLayoutType.SingleColumn) {
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (!child.visible)
                        continue;
                    if (curY != 0)
                        curY += this._lineGap;
                    child.setXY(curX, curY);
                    curY += child.height;
                    if (child.width > maxWidth)
                        maxWidth = child.width;
                }
                cw = curX + maxWidth;
                ch = curY;
            }
            else if (this._layout == fairygui.ListLayoutType.SingleRow) {
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (!child.visible)
                        continue;
                    if (curX != 0)
                        curX += this._columnGap;
                    child.setXY(curX, curY);
                    curX += child.width;
                    if (child.height > maxHeight)
                        maxHeight = child.height;
                }
                cw = curX;
                ch = curY + maxHeight;
            }
            else if (this._layout == fairygui.ListLayoutType.FlowHorizontal) {
                cw = this.viewWidth;
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (!child.visible)
                        continue;
                    if (curX != 0)
                        curX += this._columnGap;
                    if (curX + child.width > cw && maxHeight != 0) {
                        //new line
                        curX = 0;
                        curY += maxHeight + this._lineGap;
                        maxHeight = 0;
                    }
                    child.setXY(curX, curY);
                    curX += child.width;
                    if (child.height > maxHeight)
                        maxHeight = child.height;
                }
                ch = curY + maxHeight;
            }
            else {
                ch = this.viewHeight;
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (!child.visible)
                        continue;
                    if (curY != 0)
                        curY += this._lineGap;
                    if (curY + child.height > ch && maxWidth != 0) {
                        curY = 0;
                        curX += maxWidth + this._columnGap;
                        maxWidth = 0;
                    }
                    child.setXY(curX, curY);
                    curY += child.height;
                    if (child.width > maxWidth)
                        maxWidth = child.width;
                }
                cw = curX + maxWidth;
            }
            this.setBounds(0, 0, cw, ch);
        };
        p.setup_beforeAdd = function (xml) {
            _super.prototype.setup_beforeAdd.call(this, xml);
            var str;
            var arr;
            str = xml.attributes.layout;
            if (str)
                this._layout = fairygui.parseListLayoutType(str);
            var overflow;
            str = xml.attributes.overflow;
            if (str)
                overflow = fairygui.parseOverflowType(str);
            else
                overflow = fairygui.OverflowType.Visible;
            str = xml.attributes.margin;
            if (str)
                this._margin.parse(str);
            if (overflow == fairygui.OverflowType.Scroll) {
                var scroll;
                str = xml.attributes.scroll;
                if (str)
                    scroll = fairygui.parseScrollType(str);
                else
                    scroll = fairygui.ScrollType.Vertical;
                var scrollBarDisplay;
                str = xml.attributes.scrollBar;
                if (str)
                    scrollBarDisplay = fairygui.parseScrollBarDisplayType(str);
                else
                    scrollBarDisplay = fairygui.ScrollBarDisplayType.Default;
                var scrollBarFlags;
                str = xml.attributes.scrollBarFlags;
                if (str)
                    scrollBarFlags = parseInt(str);
                else
                    scrollBarFlags = 0;
                var scrollBarMargin = new fairygui.Margin();
                str = xml.attributes.scrollBarMargin;
                if (str)
                    scrollBarMargin.parse(str);
                var vtScrollBarRes;
                var hzScrollBarRes;
                str = xml.attributes.scrollBarRes;
                if (str) {
                    arr = str.split(",");
                    vtScrollBarRes = arr[0];
                    hzScrollBarRes = arr[1];
                }
                this.setupScroll(scrollBarMargin, scroll, scrollBarDisplay, scrollBarFlags, vtScrollBarRes, hzScrollBarRes);
            }
            else
                this.setupOverflow(overflow);
            str = xml.attributes.lineGap;
            if (str)
                this._lineGap = parseInt(str);
            else
                this._lineGap = 0;
            str = xml.attributes.colGap;
            if (str)
                this._columnGap = parseInt(str);
            else
                this._columnGap = 0;
            str = xml.attributes.selectionMode;
            if (str)
                this._selectionMode = fairygui.parseListSelectionMode(str);
            str = xml.attributes.defaultItem;
            if (str)
                this._defaultItem = str;
            str = xml.attributes.autoItemSize;
            this._autoResizeItem = str != "false";
            var col = xml.children;
            if (col) {
                var length = col.length;
                for (var i = 0; i < length; i++) {
                    var cxml = col[i];
                    if (cxml.name != "item")
                        continue;
                    var url = cxml.attributes.url;
                    if (!url)
                        url = this._defaultItem;
                    if (!url)
                        continue;
                    var obj = this.getFromPool(url);
                    if (obj != null) {
                        this.addChild(obj);
                        if (obj instanceof fairygui.GButton) {
                            obj.title = (cxml.attributes.title);
                            obj.icon = (cxml.attributes.icon);
                        }
                        else if (obj instanceof fairygui.GLabel) {
                            obj.title = (cxml.attributes.title);
                            obj.icon = (cxml.attributes.icon);
                        }
                    }
                }
            }
        };
        return GList;
    })(fairygui.GComponent);
    fairygui.GList = GList;
    egret.registerClass(GList,'fairygui.GList');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GObjectPool = (function () {
        function GObjectPool() {
            this._count = 0;
            this._pool = {};
        }
        var d = __define,c=GObjectPool,p=c.prototype;
        p.clear = function () {
            var length1 = this._pool.length;
            for (var i1 = 0; i1 < length1; i1++) {
                var arr = this._pool[i1];
                var cnt = arr.length;
                for (var i = 0; i < cnt; i++)
                    arr[i].dispose();
            }
            this._pool = {};
            this._count = 0;
        };
        d(p, "count"
            ,function () {
                return this._count;
            }
        );
        p.getObject = function (url) {
            var arr = this._pool[url];
            if (arr == null) {
                arr = new Array();
                this._pool[url] = arr;
            }
            if (arr.length) {
                this._count--;
                return arr.shift();
            }
            var child = fairygui.UIPackage.createObjectFromURL(url);
            if (!child) {
                console.log("FairyGUI: getObject failed - " + url + " not exists");
                return null;
            }
            return child;
        };
        p.returnObject = function (obj) {
            var url = obj.resourceURL;
            if (!url)
                return;
            var arr = this._pool[url];
            if (!arr)
                return;
            this._count++;
            arr.push(obj);
        };
        return GObjectPool;
    })();
    fairygui.GObjectPool = GObjectPool;
    egret.registerClass(GObjectPool,'fairygui.GObjectPool');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GLoader = (function (_super) {
        __extends(GLoader, _super);
        function GLoader() {
            _super.call(this);
            this._frame = 0;
            this._color = 0;
            this._contentSourceWidth = 0;
            this._contentSourceHeight = 0;
            this._contentWidth = 0;
            this._contentHeight = 0;
            this._playing = true;
            this._url = "";
            this._align = fairygui.AlignType.Left;
            this._verticalAlign = fairygui.VertAlignType.Top;
            this._showErrorSign = true;
            this._color = 0xFFFFFF;
            this._gearAnimation = new fairygui.GearAnimation(this);
            this._gearColor = new fairygui.GearColor(this);
        }
        var d = __define,c=GLoader,p=c.prototype;
        p.createDisplayObject = function () {
            this._container = new fairygui.UIContainer(this);
            this.setDisplayObject(this._container);
        };
        p.dispose = function () {
            if (this._contentItem == null && (this._content instanceof egret.Bitmap)) {
                var texture = this._content.texture;
                if (texture != null)
                    this.freeExternal(texture);
            }
            _super.prototype.dispose.call(this);
        };
        d(p, "url"
            ,function () {
                return this._url;
            }
            ,function (value) {
                if (this._url == value)
                    return;
                this._url = value;
                this.loadContent();
            }
        );
        d(p, "align"
            ,function () {
                return this._align;
            }
            ,function (value) {
                if (this._align != value) {
                    this._align = value;
                    this.updateLayout();
                }
            }
        );
        d(p, "verticalAlign"
            ,function () {
                return this._verticalAlign;
            }
            ,function (value) {
                if (this._verticalAlign != value) {
                    this._verticalAlign = value;
                    this.updateLayout();
                }
            }
        );
        d(p, "fill"
            ,function () {
                return this._fill;
            }
            ,function (value) {
                if (this._fill != value) {
                    this._fill = value;
                    this.updateLayout();
                }
            }
        );
        d(p, "autoSize"
            ,function () {
                return this._autoSize;
            }
            ,function (value) {
                if (this._autoSize != value) {
                    this._autoSize = value;
                    this.updateLayout();
                }
            }
        );
        d(p, "playing"
            ,function () {
                return this._playing;
            }
            ,function (value) {
                if (this._playing != value) {
                    this._playing = value;
                    if (this._content instanceof fairygui.MovieClip)
                        this._content.playing = value;
                    if (this._gearAnimation.controller != null)
                        this._gearAnimation.updateState();
                }
            }
        );
        d(p, "frame"
            ,function () {
                return this._frame;
            }
            ,function (value) {
                if (this._frame != value) {
                    this._frame = value;
                    if (this._content instanceof fairygui.MovieClip)
                        this._content.currentFrame = value;
                    if (this._gearAnimation.controller != null)
                        this._gearAnimation.updateState();
                }
            }
        );
        d(p, "color"
            ,function () {
                return this._color;
            }
            ,function (value) {
                if (this._color != value) {
                    this._color = value;
                    if (this._gearColor.controller != null)
                        this._gearColor.updateState();
                    this.applyColor();
                }
            }
        );
        p.applyColor = function () {
            //todo:
        };
        d(p, "showErrorSign"
            ,function () {
                return this._showErrorSign;
            }
            ,function (value) {
                this._showErrorSign = value;
            }
        );
        d(p, "content"
            ,function () {
                return this._content;
            }
        );
        p.loadContent = function () {
            this.clearContent();
            if (!this._url)
                return;
            if (fairygui.ToolSet.startsWith(this._url, "ui://"))
                this.loadFromPackage(this._url);
            else
                this.loadExternal();
        };
        p.loadFromPackage = function (itemURL) {
            this._contentItem = fairygui.UIPackage.getItemByURL(itemURL);
            if (this._contentItem != null) {
                this._contentItem.load();
                if (this._contentItem.type == fairygui.PackageItemType.Image) {
                    if (this._contentItem.texture == null) {
                        this.setErrorState();
                    }
                    else {
                        if (!(this._content instanceof egret.Bitmap)) {
                            this._content = new egret.Bitmap();
                            this._container.addChild(this._content);
                        }
                        else
                            this._container.addChild(this._content);
                        this._content.texture = this._contentItem.texture;
                        this._content.scale9Grid = this._contentItem.scale9Grid;
                        if (this._contentItem.scaleByTile)
                            this._content.fillMode = egret.BitmapFillMode.REPEAT;
                        else
                            this._content.fillMode = egret.BitmapFillMode.SCALE;
                        this._contentSourceWidth = this._contentItem.width;
                        this._contentSourceHeight = this._contentItem.height;
                        this.updateLayout();
                    }
                }
                else if (this._contentItem.type == fairygui.PackageItemType.MovieClip) {
                    if (!(this._content instanceof fairygui.MovieClip)) {
                        this._content = new fairygui.MovieClip();
                        this._container.addChild(this._content);
                    }
                    else
                        this._container.addChild(this._content);
                    this._contentSourceWidth = this._contentItem.width;
                    this._contentSourceHeight = this._contentItem.height;
                    this._content.interval = this._contentItem.interval;
                    this._content.frames = this._contentItem.frames;
                    this._content.boundsRect = new egret.Rectangle(0, 0, this._contentSourceWidth, this._contentSourceHeight);
                    this.updateLayout();
                }
                else
                    this.setErrorState();
            }
            else
                this.setErrorState();
        };
        p.loadExternal = function () {
            RES.getResAsync(this._url, this.__getResCompleted, this);
        };
        p.freeExternal = function (texture) {
        };
        p.onExternalLoadSuccess = function (texture) {
            if (!(this._content instanceof egret.Bitmap)) {
                this._content = new egret.Bitmap();
                this._container.addChild(this._content);
            }
            else
                this._container.addChild(this._content);
            this._content.texture = texture;
            this._content.scale9Grid = null;
            this._content.fillMode = egret.BitmapFillMode.SCALE;
            this._contentSourceWidth = texture.textureWidth;
            this._contentSourceHeight = texture.textureHeight;
            this.updateLayout();
        };
        p.onExternalLoadFailed = function () {
            this.setErrorState();
        };
        p.__getResCompleted = function (res, key) {
            if (res instanceof egret.Texture)
                this.onExternalLoadSuccess(res);
            else
                this.onExternalLoadFailed();
        };
        p.setErrorState = function () {
            if (!this._showErrorSign)
                return;
            if (this._errorSign == null) {
                if (fairygui.UIConfig.loaderErrorSign != null) {
                    this._errorSign = GLoader._errorSignPool.getObject(fairygui.UIConfig.loaderErrorSign);
                }
            }
            if (this._errorSign != null) {
                this._errorSign.width = this.width;
                this._errorSign.height = this.height;
                this._container.addChild(this._errorSign.displayObject);
            }
        };
        p.clearErrorState = function () {
            if (this._errorSign != null) {
                this._container.removeChild(this._errorSign.displayObject);
                GLoader._errorSignPool.returnObject(this._errorSign);
                this._errorSign = null;
            }
        };
        p.updateLayout = function () {
            if (this._content == null) {
                if (this._autoSize) {
                    this._updatingLayout = true;
                    this.setSize(50, 30);
                    this._updatingLayout = false;
                }
                return;
            }
            this._content.x = 0;
            this._content.y = 0;
            this._content.scaleX = 1;
            this._content.scaleY = 1;
            this._contentWidth = this._contentSourceWidth;
            this._contentHeight = this._contentSourceHeight;
            if (this._autoSize) {
                this._updatingLayout = true;
                if (this._contentWidth == 0)
                    this._contentWidth = 50;
                if (this._contentHeight == 0)
                    this._contentHeight = 30;
                this.setSize(this._contentWidth, this._contentHeight);
                this._updatingLayout = false;
            }
            else {
                var sx = 1, sy = 1;
                if (this._fill == fairygui.FillType.Scale || this._fill == fairygui.FillType.ScaleFree) {
                    sx = this.width / this._contentSourceWidth;
                    sy = this.height / this._contentSourceHeight;
                    if (sx != 1 || sy != 1) {
                        if (this._fill == fairygui.FillType.Scale) {
                            if (sx > sy)
                                sx = sy;
                            else
                                sy = sx;
                        }
                        this._contentWidth = this._contentSourceWidth * sx;
                        this._contentHeight = this._contentSourceHeight * sy;
                    }
                }
                if (this._content instanceof egret.Bitmap) {
                    this._content.width = this._contentWidth;
                    this._content.height = this._contentHeight;
                }
                else {
                    this._content.scaleX = sx;
                    this._content.scaleY = sy;
                }
                if (this._align == fairygui.AlignType.Center)
                    this._content.x = Math.floor((this.width - this._contentWidth) / 2);
                else if (this._align == fairygui.AlignType.Right)
                    this._content.x = this.width - this._contentWidth;
                if (this._verticalAlign == fairygui.VertAlignType.Middle)
                    this._content.y = Math.floor((this.height - this._contentHeight) / 2);
                else if (this._verticalAlign == fairygui.VertAlignType.Bottom)
                    this._content.y = this.height - this._contentHeight;
            }
        };
        p.clearContent = function () {
            this.clearErrorState();
            if (this._content != null && this._content.parent != null)
                this._container.removeChild(this._content);
            if (this._contentItem == null && (this._content instanceof egret.Bitmap)) {
                var texture = this._content.texture;
                if (texture != null)
                    this.freeExternal(texture);
            }
            this._contentItem = null;
        };
        d(p, "gearAnimation"
            ,function () {
                return this._gearAnimation;
            }
        );
        d(p, "gearColor"
            ,function () {
                return this._gearColor;
            }
        );
        p.handleControllerChanged = function (c) {
            _super.prototype.handleControllerChanged.call(this, c);
            if (this._gearAnimation.controller == c)
                this._gearAnimation.apply();
            if (this._gearColor.controller == c)
                this._gearColor.apply();
        };
        p.handleSizeChanged = function () {
            if (!this._updatingLayout)
                this.updateLayout();
            this._container.scaleX = this.scaleX;
            this._container.scaleY = this.scaleY;
        };
        p.setup_beforeAdd = function (xml) {
            _super.prototype.setup_beforeAdd.call(this, xml);
            var str;
            str = xml.attributes.url;
            if (str)
                this._url = str;
            str = xml.attributes.align;
            if (str)
                this._align = fairygui.parseAlignType(str);
            str = xml.attributes.vAlign;
            if (str)
                this._verticalAlign = fairygui.parseVertAlignType(str);
            str = xml.attributes.fill;
            if (str)
                this._fill = fairygui.parseFillType(str);
            this._autoSize = xml.attributes.autoSize == "true";
            str = xml.attributes.errorSign;
            if (str)
                this._showErrorSign = str == "true";
            this._playing = xml.attributes.playing != "false";
            str = xml.attributes.color;
            if (str)
                this.color = fairygui.ToolSet.convertFromHtmlColor(str);
            if (this._url)
                this.loadContent();
        };
        p.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            var col = xml.children;
            if (col) {
                var length1 = col.length;
                for (var i1 = 0; i1 < length1; i1++) {
                    var cxml = col[i1];
                    if (cxml.name == "gearAni") {
                        this._gearAnimation.setup(cxml);
                        break;
                    }
                    else if (cxml.name == "gearColor") {
                        this._gearColor.setup(cxml);
                        break;
                    }
                }
            }
        };
        GLoader._errorSignPool = new fairygui.GObjectPool();
        return GLoader;
    })(fairygui.GObject);
    fairygui.GLoader = GLoader;
    egret.registerClass(GLoader,'fairygui.GLoader',["fairygui.IAnimationGear","fairygui.IColorGear"]);
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GMovieClip = (function (_super) {
        __extends(GMovieClip, _super);
        function GMovieClip() {
            _super.call(this);
            this._gearAnimation = new fairygui.GearAnimation(this);
            this._gearColor = new fairygui.GearColor(this);
        }
        var d = __define,c=GMovieClip,p=c.prototype;
        d(p, "color"
            ,function () {
                return 0;
            }
            ,function (value) {
            }
        );
        p.createDisplayObject = function () {
            this._movieClip = new fairygui.UIMovieClip(this);
            this.setDisplayObject(this._movieClip);
        };
        d(p, "playing"
            ,function () {
                return this._movieClip.playing;
            }
            ,function (value) {
                if (this._movieClip.playing != value) {
                    this._movieClip.playing = value;
                    if (this._gearAnimation.controller)
                        this._gearAnimation.updateState();
                }
            }
        );
        d(p, "frame"
            ,function () {
                return this._movieClip.currentFrame;
            }
            ,function (value) {
                if (this._movieClip.currentFrame != value) {
                    this._movieClip.currentFrame = value;
                    if (this._gearAnimation.controller)
                        this._gearAnimation.updateState();
                }
            }
        );
        d(p, "gearAnimation"
            ,function () {
                return this._gearAnimation;
            }
        );
        d(p, "gearColor"
            ,function () {
                return this._gearColor;
            }
        );
        p.handleControllerChanged = function (c) {
            _super.prototype.handleControllerChanged.call(this, c);
            if (this._gearAnimation.controller == c)
                this._gearAnimation.apply();
            if (this._gearColor.controller == c)
                this._gearColor.apply();
        };
        p.handleSizeChanged = function () {
            this.displayObject.scaleX = this.width / this._sourceWidth * this.scaleX;
            this.displayObject.scaleY = this.height / this._sourceHeight * this.scaleY;
        };
        p.constructFromResource = function (pkgItem) {
            this._packageItem = pkgItem;
            this._sourceWidth = this._packageItem.width;
            this._sourceHeight = this._packageItem.height;
            this._initWidth = this._sourceWidth;
            this._initHeight = this._sourceHeight;
            this.setSize(this._sourceWidth, this._sourceHeight);
            pkgItem.load();
            this._movieClip.interval = this._packageItem.interval;
            this._movieClip.frames = this._packageItem.frames;
            this._movieClip.boundsRect = new egret.Rectangle(0, 0, this.sourceWidth, this.sourceHeight);
        };
        p.setup_beforeAdd = function (xml) {
            _super.prototype.setup_beforeAdd.call(this, xml);
            var str;
            str = xml.attributes.frame;
            if (str)
                this._movieClip.currentFrame = parseInt(str);
            str = xml.attributes.playing;
            this._movieClip.playing = str != "false";
            str = xml.attributes.color;
            if (str)
                this.color = fairygui.ToolSet.convertFromHtmlColor(str);
        };
        p.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            var col = xml.children;
            if (col) {
                var length1 = col.length;
                for (var i1 = 0; i1 < length1; i1++) {
                    var cxml = col[i1];
                    if (cxml.name == "gearAni") {
                        this._gearAnimation.setup(cxml);
                        break;
                    }
                    else if (cxml.name == "gearColor") {
                        this._gearColor.setup(cxml);
                        break;
                    }
                }
            }
        };
        return GMovieClip;
    })(fairygui.GObject);
    fairygui.GMovieClip = GMovieClip;
    egret.registerClass(GMovieClip,'fairygui.GMovieClip',["fairygui.IAnimationGear","fairygui.IColorGear"]);
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GProgressBar = (function (_super) {
        __extends(GProgressBar, _super);
        function GProgressBar() {
            _super.call(this);
            this._max = 0;
            this._value = 0;
            this._barMaxWidth = 0;
            this._barMaxHeight = 0;
            this._barMaxWidthDelta = 0;
            this._barMaxHeightDelta = 0;
            this._barStartX = 0;
            this._barStartY = 0;
            this._tweenValue = 0;
            this._titleType = fairygui.ProgressTitleType.Percent;
            this._value = 50;
            this._max = 100;
        }
        var d = __define,c=GProgressBar,p=c.prototype;
        d(p, "titleType"
            ,function () {
                return this._titleType;
            }
            ,function (value) {
                if (this._titleType != value) {
                    this._titleType = value;
                    this.update(this._value);
                }
            }
        );
        d(p, "max"
            ,function () {
                return this._max;
            }
            ,function (value) {
                if (this._max != value) {
                    this._max = value;
                    this.update(this._value);
                }
            }
        );
        d(p, "value"
            ,function () {
                return this._value;
            }
            ,function (value) {
                if (this._tweener != null) {
                    this._tweener.setPaused(true);
                    this._tweener = null;
                }
                if (this._value != value) {
                    this._value = value;
                    this.update(this._value);
                }
            }
        );
        p.tweenValue = function (value, duration) {
            if (this._value != value) {
                if (this._tweener)
                    this._tweener.setPaused(true);
                this._tweenValue = this._value;
                this._value = value;
                this._tweener = egret.Tween.get(this, { onChange: this.onUpdateTween, onChangeObj: this })
                    .to({ _tweenValue: value }, duration * 1000, GProgressBar.easeLinear);
            }
        };
        p.onUpdateTween = function () {
            this.update(this._tweenValue);
        };
        p.update = function (newValue) {
            var percent = Math.min(newValue / this._max, 1);
            if (this._titleObject) {
                switch (this._titleType) {
                    case fairygui.ProgressTitleType.Percent:
                        this._titleObject.text = Math.round(percent * 100) + "%";
                        break;
                    case fairygui.ProgressTitleType.ValueAndMax:
                        this._titleObject.text = newValue + "/" + this._max;
                        break;
                    case fairygui.ProgressTitleType.Value:
                        this._titleObject.text = "" + newValue;
                        break;
                    case fairygui.ProgressTitleType.Max:
                        this._titleObject.text = "" + this._max;
                        break;
                }
            }
            var fullWidth = this.width - this._barMaxWidthDelta;
            var fullHeight = this.height - this._barMaxHeightDelta;
            if (!this._reverse) {
                if (this._barObjectH)
                    this._barObjectH.width = fullWidth * percent;
                if (this._barObjectV)
                    this._barObjectV.height = fullHeight * percent;
            }
            else {
                if (this._barObjectH) {
                    this._barObjectH.width = fullWidth * percent;
                    this._barObjectH.x = this._barStartX + (fullWidth - this._barObjectH.width);
                }
                if (this._barObjectV) {
                    this._barObjectV.height = fullHeight * percent;
                    this._barObjectV.y = this._barStartY + (fullHeight - this._barObjectV.height);
                }
            }
            if (this._aniObject instanceof fairygui.GMovieClip)
                (this._aniObject).frame = Math.round(percent * 100);
            else if (this._aniObject instanceof fairygui.GSwfObject)
                (this._aniObject).frame = Math.round(percent * 100);
        };
        p.constructFromXML = function (xml) {
            _super.prototype.constructFromXML.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "ProgressBar");
            var str;
            str = xml.attributes.titleType;
            if (str)
                this._titleType = fairygui.parseProgressTitleType(str);
            this._reverse = xml.attributes.reverse == "true";
            this._titleObject = (this.getChild("title"));
            this._barObjectH = this.getChild("bar");
            this._barObjectV = this.getChild("bar_v");
            this._aniObject = this.getChild("ani");
            if (this._barObjectH) {
                this._barMaxWidth = this._barObjectH.width;
                this._barMaxWidthDelta = this.width - this._barMaxWidth;
                this._barStartX = this._barObjectH.x;
            }
            if (this._barObjectV) {
                this._barMaxHeight = this._barObjectV.height;
                this._barMaxHeightDelta = this.height - this._barMaxHeight;
                this._barStartY = this._barObjectV.y;
            }
        };
        p.handleSizeChanged = function () {
            _super.prototype.handleSizeChanged.call(this);
            if (this._barObjectH)
                this._barMaxWidth = this.width - this._barMaxWidthDelta;
            if (this._barObjectV)
                this._barMaxHeight = this.height - this._barMaxHeightDelta;
            if (!this._underConstruct)
                this.update(this._value);
        };
        p.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "ProgressBar");
            if (xml) {
                this._value = parseInt(xml.attributes.value);
                this._max = parseInt(xml.attributes.max);
            }
            this.update(this._value);
        };
        p.dispose = function () {
            if (this._tweener)
                this._tweener.setPaused(true);
            _super.prototype.dispose.call(this);
        };
        GProgressBar.easeLinear = egret.Ease.getPowIn(1);
        return GProgressBar;
    })(fairygui.GComponent);
    fairygui.GProgressBar = GProgressBar;
    egret.registerClass(GProgressBar,'fairygui.GProgressBar');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GTextField = (function (_super) {
        __extends(GTextField, _super);
        function GTextField() {
            _super.call(this);
            this._fontSize = 0;
            this._leading = 0;
            this._letterSpacing = 0;
            this._yOffset = 0;
            this._textWidth = 0;
            this._textHeight = 0;
            this._fontSize = 12;
            this._align = fairygui.AlignType.Left;
            this._verticalAlign = fairygui.VertAlignType.Top;
            this._text = "";
            this._leading = 3;
            this._color = 0;
            this._autoSize = fairygui.AutoSizeType.Both;
            this._widthAutoSize = true;
            this._heightAutoSize = true;
            this._gearColor = new fairygui.GearColor(this);
            this._bitmapPool = new Array();
        }
        var d = __define,c=GTextField,p=c.prototype;
        p.createDisplayObject = function () {
            var obj = new fairygui.UITextField(this);
            this._textField = obj.getChildAt(0);
            this.setDisplayObject(obj);
        };
        p.dispose = function () {
            _super.prototype.dispose.call(this);
            this._bitmapFont = null;
        };
        d(p, "text"
            ,function () {
                return this._text;
            }
            ,function (value) {
                this._text = value;
                if (this._text == null)
                    this._text = "";
                if (this.parent && this.parent._underConstruct)
                    this.renderNow();
                else
                    this.render();
            }
        );
        p.updateTextFieldText = function () {
            if (this._ubbEnabled)
                this._textField.textFlow = (new egret.HtmlTextParser).parser(fairygui.ToolSet.parseUBB(fairygui.ToolSet.encodeHTML(this._text)));
            else
                this._textField.text = this._text;
        };
        d(p, "font"
            ,function () {
                return this._font;
            }
            ,function (value) {
                if (this._font != value) {
                    this._font = value;
                    this.updateTextFormat();
                }
            }
        );
        d(p, "fontSize"
            ,function () {
                return this._fontSize;
            }
            ,function (value) {
                if (value < 0)
                    return;
                if (this._fontSize != value) {
                    this._fontSize = value;
                    this.updateTextFormat();
                }
            }
        );
        d(p, "color"
            ,function () {
                return this._color;
            }
            ,function (value) {
                if (this._color != value) {
                    this._color = value;
                    if (this._gearColor.controller)
                        this._gearColor.updateState();
                    this.updateTextFormat();
                }
            }
        );
        d(p, "align"
            ,function () {
                return this._align;
            }
            ,function (value) {
                if (this._align != value) {
                    this._align = value;
                    this.updateTextFormat();
                }
            }
        );
        d(p, "verticalAlign"
            ,function () {
                return this._verticalAlign;
            }
            ,function (value) {
                if (this._verticalAlign != value) {
                    this._verticalAlign = value;
                    this.doAlign();
                }
            }
        );
        d(p, "leading"
            ,function () {
                return this._leading;
            }
            ,function (value) {
                if (this._leading != value) {
                    this._leading = value;
                    this.updateTextFormat();
                }
            }
        );
        d(p, "letterSpacing"
            ,function () {
                return this._letterSpacing;
            }
            ,function (value) {
                if (this._letterSpacing != value) {
                    this._letterSpacing = value;
                    this.updateTextFormat();
                }
            }
        );
        d(p, "underline"
            ,function () {
                //return this._underline;
                return false;
            }
            ,function (value) {
                //not support yet
                //this._textField.underline = value;
            }
        );
        d(p, "bold"
            ,function () {
                return this._textField.bold;
            }
            ,function (value) {
                this._textField.bold = value;
            }
        );
        d(p, "italic"
            ,function () {
                return this._textField.italic;
            }
            ,function (value) {
                this._textField.italic = value;
            }
        );
        d(p, "singleLine"
            ,function () {
                return !this._textField.multiline;
            }
            ,function (value) {
                value = !value;
                if (this._textField.multiline != value) {
                    this._textField.multiline = value;
                    this.render();
                }
            }
        );
        d(p, "stroke"
            ,function () {
                return this._textField.stroke;
            }
            ,function (value) {
                this._textField.stroke = value;
            }
        );
        d(p, "strokeColor"
            ,function () {
                return this._textField.strokeColor;
            }
            ,function (value) {
                this._textField.strokeColor = value;
            }
        );
        d(p, "ubbEnabled"
            ,function () {
                return this._ubbEnabled;
            }
            ,function (value) {
                if (this._ubbEnabled != value) {
                    this._ubbEnabled = value;
                    this.render();
                }
            }
        );
        d(p, "autoSize"
            ,function () {
                return this._autoSize;
            }
            ,function (value) {
                if (this._autoSize != value) {
                    this._autoSize = value;
                    this._widthAutoSize = value == fairygui.AutoSizeType.Both;
                    this._heightAutoSize = value == fairygui.AutoSizeType.Both || value == fairygui.AutoSizeType.Height;
                    this.render();
                }
            }
        );
        d(p, "displayAsPassword"
            ,function () {
                return this._displayAsPassword;
            }
            ,function (val) {
                if (this._displayAsPassword != val) {
                    this._displayAsPassword = val;
                    this._textField.displayAsPassword = this._displayAsPassword;
                    this.render();
                }
            }
        );
        d(p, "textWidth"
            ,function () {
                this.ensureSizeCorrect();
                return this._textWidth;
            }
        );
        p.ensureSizeCorrect = function () {
            if (this._sizeDirty && this._requireRender)
                this.renderNow();
        };
        d(p, "gearColor"
            ,function () {
                return this._gearColor;
            }
        );
        p.handleControllerChanged = function (c) {
            _super.prototype.handleControllerChanged.call(this, c);
            if (this._gearColor.controller == c)
                this._gearColor.apply();
        };
        p.updateTextFormat = function () {
            this._textField.size = this._fontSize;
            if (fairygui.ToolSet.startsWith(this._font, "ui://"))
                this._bitmapFont = fairygui.UIPackage.getBitmapFontByURL(this._font);
            else {
                this._bitmapFont = null;
                if (this._font)
                    this._textField.fontFamily = this._font;
                else
                    this._textField.fontFamily = fairygui.UIConfig.defaultFont;
            }
            if (this.grayed)
                this._textField.textColor = 0xAAAAAA;
            else
                this._textField.textColor = this._color;
            this._textField.textAlign = fairygui.getAlignTypeString(this._align);
            this._textField.lineSpacing = this._leading;
            //this._textField.letterSpacing = this._letterSpacing;
            if (!this._underConstruct)
                this.render();
        };
        p.render = function () {
            this._requireRender = true;
            if (this._widthAutoSize || this._heightAutoSize) {
                this._sizeDirty = true;
                this.dispatchEventWith(fairygui.GObject.SIZE_DELAY_CHANGE);
            }
            egret.callLater(this.__render, this);
        };
        p.__render = function () {
            if (this._requireRender)
                this.renderNow();
        };
        p.renderNow = function (updateBounds) {
            if (updateBounds === void 0) { updateBounds = true; }
            this._requireRender = false;
            this._sizeDirty = false;
            if (this._bitmapFont != null) {
                this.renderWithBitmapFont(updateBounds);
                return;
            }
            if (this._textField.parent == null) {
                this.displayObject.removeChildren();
                this.displayObject.addChild(this._textField);
            }
            this._textField.width = this._widthAutoSize ? 10000 : Math.ceil(this.width);
            this.updateTextFieldText();
            this._textWidth = Math.ceil(this._textField.textWidth);
            if (this._textWidth > 0)
                this._textWidth += 4;
            this._textHeight = Math.ceil(this._textField.textHeight);
            if (this._textHeight > 0)
                this._textHeight += 4;
            var w, h = 0;
            if (this._widthAutoSize) {
                w = this._textWidth;
                this._textField.width = w;
            }
            else
                w = this.width;
            if (this._heightAutoSize) {
                h = this._textHeight;
                if (!this._widthAutoSize)
                    this._textField.height = this._textHeight;
            }
            else {
                h = this.height;
                if (this._textHeight > h)
                    this._textHeight = h;
                this._textField.height = this._textHeight;
            }
            if (updateBounds) {
                this._updatingSize = true;
                this.setSize(w, h);
                this._updatingSize = false;
                this.doAlign();
            }
        };
        p.renderWithBitmapFont = function (updateBounds) {
            var container = this.displayObject;
            var cnt = container.numChildren;
            for (var i = 0; i < cnt; i++) {
                var obj = container.getChildAt(i);
                if (obj instanceof egret.Bitmap)
                    this._bitmapPool.push(obj);
            }
            container.removeChildren();
            if (!this._lines)
                this._lines = new Array();
            else
                LineInfo.returnList(this._lines);
            var letterSpacing = this._letterSpacing;
            var lineSpacing = this._leading - 1;
            var rectWidth = this.width - GTextField.GUTTER_X * 2;
            var lineWidth = 0, lineHeight = 0, lineTextHeight = 0;
            var glyphWidth = 0, glyphHeight = 0;
            var wordChars = 0, wordStart = 0, wordEnd = 0;
            var lastLineHeight = 0;
            var lineBuffer = "";
            var lineY = GTextField.GUTTER_Y;
            var line;
            var textWidth = 0, textHeight = 0;
            var wordWrap = !this._widthAutoSize && this._textField.multiline;
            var fontScale = this._bitmapFont.resizable ? this._fontSize / this._bitmapFont.size : 1;
            var textLength = this._text.length;
            for (var offset = 0; offset < textLength; ++offset) {
                var ch = this._text.charAt(offset);
                var cc = ch.charCodeAt(offset);
                if (ch == "\n") {
                    lineBuffer += ch;
                    line = LineInfo.borrow();
                    line.width = lineWidth;
                    if (lineTextHeight == 0) {
                        if (lastLineHeight == 0)
                            lastLineHeight = Math.ceil(this._fontSize * fontScale);
                        if (lineHeight == 0)
                            lineHeight = lastLineHeight;
                        lineTextHeight = lineHeight;
                    }
                    line.height = lineHeight;
                    lastLineHeight = lineHeight;
                    line.textHeight = lineTextHeight;
                    line.text = lineBuffer;
                    line.y = lineY;
                    lineY += (line.height + lineSpacing);
                    if (line.width > textWidth)
                        textWidth = line.width;
                    this._lines.push(line);
                    lineBuffer = "";
                    lineWidth = 0;
                    lineHeight = 0;
                    lineTextHeight = 0;
                    wordChars = 0;
                    wordStart = 0;
                    wordEnd = 0;
                    continue;
                }
                if (cc > 256 || cc <= 32) {
                    if (wordChars > 0)
                        wordEnd = lineWidth;
                    wordChars = 0;
                }
                else {
                    if (wordChars == 0)
                        wordStart = lineWidth;
                    wordChars++;
                }
                if (ch == " ") {
                    glyphWidth = Math.ceil(this._fontSize / 2);
                    glyphHeight = Math.ceil(this._fontSize);
                }
                else {
                    var glyph = this._bitmapFont.glyphs[ch];
                    if (glyph) {
                        glyphWidth = Math.ceil(glyph.advance * fontScale);
                        glyphHeight = Math.ceil(glyph.lineHeight * fontScale);
                    }
                    else if (ch == " ") {
                        glyphWidth = Math.ceil(this._bitmapFont.size * fontScale / 2);
                        glyphHeight = Math.ceil(this._bitmapFont.size * fontScale);
                    }
                    else {
                        glyphWidth = 0;
                        glyphHeight = 0;
                    }
                }
                if (glyphHeight > lineTextHeight)
                    lineTextHeight = glyphHeight;
                if (glyphHeight > lineHeight)
                    lineHeight = glyphHeight;
                if (lineWidth != 0)
                    lineWidth += letterSpacing;
                lineWidth += glyphWidth;
                if (!wordWrap || lineWidth <= rectWidth) {
                    lineBuffer += ch;
                }
                else {
                    line = LineInfo.borrow();
                    line.height = lineHeight;
                    line.textHeight = lineTextHeight;
                    if (lineBuffer.length == 0) {
                        line.text = ch;
                    }
                    else if (wordChars > 0 && wordEnd > 0) {
                        lineBuffer += ch;
                        var len = lineBuffer.length - wordChars;
                        line.text = fairygui.ToolSet.trimRight(lineBuffer.substr(0, len));
                        line.width = wordEnd;
                        lineBuffer = lineBuffer.substr(len + 1);
                        lineWidth -= wordStart;
                    }
                    else {
                        line.text = lineBuffer;
                        line.width = lineWidth - (glyphWidth + letterSpacing);
                        lineBuffer = ch;
                        lineWidth = glyphWidth;
                        lineHeight = glyphHeight;
                        lineTextHeight = glyphHeight;
                    }
                    line.y = lineY;
                    lineY += (line.height + lineSpacing);
                    if (line.width > textWidth)
                        textWidth = line.width;
                    wordChars = 0;
                    wordStart = 0;
                    wordEnd = 0;
                    this._lines.push(line);
                }
            }
            if (lineBuffer.length > 0
                || this._lines.length > 0 && fairygui.ToolSet.endsWith(this._lines[this._lines.length - 1].text, "\n")) {
                line = LineInfo.borrow();
                line.width = lineWidth;
                if (lineHeight == 0)
                    lineHeight = lastLineHeight;
                if (lineTextHeight == 0)
                    lineTextHeight = lineHeight;
                line.height = lineHeight;
                line.textHeight = lineTextHeight;
                line.text = lineBuffer;
                line.y = lineY;
                if (line.width > textWidth)
                    textWidth = line.width;
                this._lines.push(line);
            }
            if (textWidth > 0)
                textWidth += GTextField.GUTTER_X * 2;
            var count = this._lines.length;
            if (count == 0) {
                textHeight = 0;
            }
            else {
                line = this._lines[this._lines.length - 1];
                textHeight = line.y + line.height + GTextField.GUTTER_Y;
            }
            var w, h = 0;
            if (this._widthAutoSize) {
                if (textWidth == 0)
                    w = 0;
                else
                    w = textWidth;
            }
            else
                w = this.width;
            if (this._heightAutoSize) {
                if (textHeight == 0)
                    h = 0;
                else
                    h = textHeight;
            }
            else
                h = this.height;
            if (updateBounds) {
                this._updatingSize = true;
                this.setSize(w, h);
                this._updatingSize = false;
                this.doAlign();
            }
            if (w == 0 || h == 0)
                return;
            var charX = GTextField.GUTTER_X;
            var lineIndent = 0;
            var charIndent = 0;
            var lineCount = this._lines.length;
            for (var i = 0; i < lineCount; i++) {
                line = this._lines[i];
                charX = GTextField.GUTTER_X;
                if (this._align == fairygui.AlignType.Center)
                    lineIndent = (rectWidth - line.width) / 2;
                else if (this._align == fairygui.AlignType.Right)
                    lineIndent = rectWidth - line.width;
                else
                    lineIndent = 0;
                textLength = line.text.length;
                for (var j = 0; j < textLength; j++) {
                    ch = line.text.charAt(j);
                    glyph = this._bitmapFont.glyphs[ch];
                    if (glyph != null) {
                        charIndent = (line.height + line.textHeight) / 2 - Math.ceil(glyph.lineHeight * fontScale);
                        var bm;
                        if (this._bitmapPool.length)
                            bm = this._bitmapPool.pop();
                        else {
                            bm = new egret.Bitmap();
                            bm.smoothing = true;
                        }
                        bm.x = charX + lineIndent + Math.ceil(glyph.offsetX * fontScale);
                        bm.y = line.y + charIndent + Math.ceil(glyph.offsetY * fontScale);
                        bm.texture = glyph.texture;
                        bm.scaleX = fontScale;
                        bm.scaleY = fontScale;
                        container.addChild(bm);
                        charX += letterSpacing + Math.ceil(glyph.advance * fontScale);
                    }
                    else if (ch == " ") {
                        charX += letterSpacing + Math.ceil(this._bitmapFont.size * fontScale / 2);
                    }
                    else {
                        charX += letterSpacing;
                    }
                } //text loop
            } //line loop
        };
        p.handleXYChanged = function () {
            this.displayObject.x = Math.floor(this.x);
            this.displayObject.y = Math.floor(this.y + this._yOffset);
        };
        p.handleSizeChanged = function () {
            if (!this._updatingSize) {
                if (!this._widthAutoSize)
                    this.render();
                else
                    this.doAlign();
            }
        };
        p.handleGrayChanged = function () {
            _super.prototype.handleGrayChanged.call(this);
            this.updateTextFormat();
        };
        p.doAlign = function () {
            if (this._verticalAlign == fairygui.VertAlignType.Top || this._textHeight == 0)
                this._yOffset = GTextField.GUTTER_Y;
            else {
                var dh = this.height - this._textHeight;
                if (dh < 0)
                    dh = 0;
                if (this._verticalAlign == fairygui.VertAlignType.Middle)
                    this._yOffset = Math.floor(dh / 2);
                else
                    this._yOffset = Math.floor(dh);
            }
            this.displayObject.y = this.y + this._yOffset;
        };
        p.setup_beforeAdd = function (xml) {
            _super.prototype.setup_beforeAdd.call(this, xml);
            var str;
            this._displayAsPassword = xml.attributes.password == "true";
            this._textField.displayAsPassword = this._displayAsPassword;
            str = xml.attributes.font;
            if (str)
                this._font = str;
            str = xml.attributes.fontSize;
            if (str)
                this._fontSize = parseInt(str);
            str = xml.attributes.color;
            if (str)
                this._color = fairygui.ToolSet.convertFromHtmlColor(str);
            str = xml.attributes.align;
            if (str)
                this._align = fairygui.parseAlignType(str);
            str = xml.attributes.vAlign;
            if (str)
                this._verticalAlign = fairygui.parseVertAlignType(str);
            str = xml.attributes.leading;
            if (str)
                this._leading = parseInt(str);
            else
                this._leading = 3;
            str = xml.attributes.letterSpacing;
            if (str)
                this._letterSpacing = parseInt(str);
            this._ubbEnabled = xml.attributes.ubb == "true";
            str = xml.attributes.autoSize;
            if (str) {
                this._autoSize = fairygui.parseAutoSizeType(str);
                this._widthAutoSize = this._autoSize == fairygui.AutoSizeType.Both;
                this._heightAutoSize = this._autoSize == fairygui.AutoSizeType.Both || this._autoSize == fairygui.AutoSizeType.Height;
            }
            //this._textField.underline = xml.attributes.underline == "true";
            this._textField.italic = xml.attributes.italic == "true";
            this._textField.bold = xml.attributes.bold == "true";
            this._textField.multiline = xml.attributes.singleLine != "true";
            str = xml.attributes.strokeColor;
            if (str) {
                this._textField.strokeColor = fairygui.ToolSet.convertFromHtmlColor(str);
                str = xml.attributes.strokeSize;
                if (str)
                    this.stroke = parseInt(str) + 1;
                else
                    this.stroke = 2;
            }
        };
        p.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            this.updateTextFormat();
            var str = xml.attributes.text;
            if (str != null && str.length > 0)
                this.text = str;
            this._sizeDirty = false;
            var col = xml.children;
            if (col) {
                var length1 = col.length;
                for (var i1 = 0; i1 < length1; i1++) {
                    var cxml = col[i1];
                    if (cxml.name == "gearColor") {
                        this._gearColor.setup(cxml);
                        break;
                    }
                }
            }
        };
        GTextField.GUTTER_X = 2;
        GTextField.GUTTER_Y = 2;
        return GTextField;
    })(fairygui.GObject);
    fairygui.GTextField = GTextField;
    egret.registerClass(GTextField,'fairygui.GTextField',["fairygui.IColorGear"]);
    var LineInfo = (function () {
        function LineInfo() {
            this.width = 0;
            this.height = 0;
            this.textHeight = 0;
            this.y = 0;
        }
        var d = __define,c=LineInfo,p=c.prototype;
        LineInfo.borrow = function () {
            if (LineInfo.pool.length) {
                var ret = LineInfo.pool.pop();
                ret.width = 0;
                ret.height = 0;
                ret.textHeight = 0;
                ret.text = null;
                ret.y = 0;
                return ret;
            }
            else
                return new LineInfo();
        };
        LineInfo.returns = function (value) {
            LineInfo.pool.push(value);
        };
        LineInfo.returnList = function (value) {
            var length = value.length;
            for (var i = 0; i < length; i++) {
                var li = value[i];
                LineInfo.pool.push(li);
            }
            value.length = 0;
        };
        LineInfo.pool = [];
        return LineInfo;
    })();
    fairygui.LineInfo = LineInfo;
    egret.registerClass(LineInfo,'fairygui.LineInfo');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GRichTextField = (function (_super) {
        __extends(GRichTextField, _super);
        function GRichTextField() {
            _super.call(this);
            this._textField.touchEnabled = true;
            this._textField.addEventListener(egret.TextEvent.LINK, this.__clickLink, this);
        }
        var d = __define,c=GRichTextField,p=c.prototype;
        d(p, "text",undefined
            ,function (value) {
                this._text = value;
                if (this._text == null)
                    this._text = "";
                this._textField.width = this.width;
                if (this._ubbEnabled)
                    this._textField.textFlow = (new egret.HtmlTextParser).parser(fairygui.ToolSet.parseUBB(this._text));
                else
                    this._textField.textFlow = (new egret.HtmlTextParser).parser(this._text);
                this.render();
            }
        );
        p.__clickLink = function (evt) {
            this.dispatchEvent(new egret.TextEvent(egret.TextEvent.LINK, false, false, evt.text));
        };
        return GRichTextField;
    })(fairygui.GTextField);
    fairygui.GRichTextField = GRichTextField;
    egret.registerClass(GRichTextField,'fairygui.GRichTextField');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GRoot = (function (_super) {
        __extends(GRoot, _super);
        function GRoot() {
            _super.call(this);
            if (GRoot._inst == null)
                GRoot._inst = this;
            this.opaque = false;
            this._volumeScale = 1;
            this._popupStack = new Array();
            this._justClosedPopups = new Array();
            this.displayObject.addEventListener(egret.Event.ADDED_TO_STAGE, this.__addedToStage, this);
        }
        var d = __define,c=GRoot,p=c.prototype;
        d(GRoot, "inst"
            ,function () {
                if (GRoot._inst == null)
                    new GRoot();
                return GRoot._inst;
            }
        );
        d(p, "nativeStage"
            ,function () {
                return this._nativeStage;
            }
        );
        p.setContentScaleFactor = function (designUIWidth, designUIHeight) {
            var w, h = 0;
            w = this._nativeStage.stageWidth;
            h = this._nativeStage.stageHeight;
            if (designUIWidth > 0 && designUIHeight > 0) {
                var s1 = w / designUIWidth;
                var s2 = h / designUIHeight;
                GRoot.contentScaleFactor = Math.min(s1, s2);
            }
            else if (designUIWidth > 0)
                GRoot.contentScaleFactor = w / designUIWidth;
            else if (designUIHeight > 0)
                GRoot.contentScaleFactor = h / designUIHeight;
            else
                GRoot.contentScaleFactor = 1;
            this.setSize(Math.round(w / GRoot.contentScaleFactor), Math.round(h / GRoot.contentScaleFactor));
            this.scaleX = GRoot.contentScaleFactor;
            this.scaleY = GRoot.contentScaleFactor;
        };
        p.enableFocusManagement = function () {
            this._focusManagement = true;
        };
        p.showWindow = function (win) {
            this.addChild(win);
            win.requestFocus();
            if (win.x > this.width)
                win.x = this.width - win.width;
            else if (win.x + win.width < 0)
                win.x = 0;
            if (win.y > this.height)
                win.y = this.height - win.height;
            else if (win.y + win.height < 0)
                win.y = 0;
            this.adjustModalLayer();
        };
        p.hideWindow = function (win) {
            win.hide();
        };
        p.hideWindowImmediately = function (win) {
            if (win.parent == this)
                this.removeChild(win);
            this.adjustModalLayer();
        };
        p.showModalWait = function (msg) {
            if (msg === void 0) { msg = null; }
            if (fairygui.UIConfig.globalModalWaiting != null) {
                if (this._modalWaitPane == null)
                    this._modalWaitPane = fairygui.UIPackage.createObjectFromURL(fairygui.UIConfig.globalModalWaiting);
                this._modalWaitPane.setSize(this.width, this.height);
                this._modalWaitPane.addRelation(this, fairygui.RelationType.Size);
                this.addChild(this._modalWaitPane);
                this._modalWaitPane.text = msg;
            }
        };
        p.closeModalWait = function () {
            if (this._modalWaitPane != null && this._modalWaitPane.parent != null)
                this.removeChild(this._modalWaitPane);
        };
        p.closeAllExceptModals = function () {
            var arr = this._children.slice();
            var cnt = arr.length;
            for (var i = 0; i < cnt; i++) {
                var g = arr[i];
                if ((g instanceof fairygui.Window) && !g.modal)
                    g.hide();
            }
        };
        p.closeAllWindows = function () {
            var arr = this._children.slice();
            var cnt = arr.length;
            for (var i = 0; i < cnt; i++) {
                var g = arr[i];
                if (g instanceof fairygui.Window)
                    g.hide();
            }
        };
        p.getTopWindow = function () {
            var cnt = this.numChildren;
            for (var i = cnt - 1; i >= 0; i--) {
                var g = this.getChildAt(i);
                if (g instanceof fairygui.Window) {
                    return g;
                }
            }
            return null;
        };
        d(p, "hasModalWindow"
            ,function () {
                return this._modalLayer.parent != null;
            }
        );
        d(p, "modalWaiting"
            ,function () {
                return this._modalWaitPane && this._modalWaitPane.inContainer;
            }
        );
        p.showPopup = function (popup, target, downward) {
            if (target === void 0) { target = null; }
            if (downward === void 0) { downward = null; }
            if (this._popupStack.length > 0) {
                var k = this._popupStack.indexOf(popup);
                if (k != -1) {
                    for (var i = this._popupStack.length - 1; i >= k; i--)
                        this.removeChild(this._popupStack.pop());
                }
            }
            this._popupStack.push(popup);
            this.addChild(popup);
            this.adjustModalLayer();
            var pos;
            var sizeW, sizeH = 0;
            if (target) {
                pos = target.localToRoot();
                sizeW = target.width;
                sizeH = target.height;
            }
            else {
                pos = this.globalToLocal(GRoot.mouseX, GRoot.mouseY);
            }
            var xx, yy;
            xx = pos.x;
            if (xx + popup.width > this.width)
                xx = xx + sizeW - popup.width;
            yy = pos.y + sizeH;
            if ((downward == null && yy + popup.height > this.height)
                || downward == false) {
                yy = pos.y - popup.height - 1;
                if (yy < 0) {
                    yy = 0;
                    xx += sizeW / 2;
                }
            }
            popup.x = xx;
            popup.y = yy;
        };
        p.togglePopup = function (popup, target, downward) {
            if (target === void 0) { target = null; }
            if (downward === void 0) { downward = null; }
            if (this._justClosedPopups.indexOf(popup) != -1)
                return;
            this.showPopup(popup, target, downward);
        };
        p.hidePopup = function (popup) {
            if (popup === void 0) { popup = null; }
            if (popup != null) {
                var k = this._popupStack.indexOf(popup);
                if (k != -1) {
                    for (var i = this._popupStack.length - 1; i >= k; i--)
                        this.closePopup(this._popupStack.pop());
                }
            }
            else {
                var cnt = this._popupStack.length;
                for (i = cnt - 1; i >= 0; i--)
                    this.closePopup(this._popupStack[i]);
                this._popupStack.length = 0;
            }
        };
        d(p, "hasAnyPopup"
            ,function () {
                return this._popupStack.length != 0;
            }
        );
        p.closePopup = function (target) {
            if (target.parent != null) {
                if (target instanceof fairygui.Window)
                    target.hide();
                else
                    this.removeChild(target);
            }
        };
        p.showTooltips = function (msg) {
            if (this._defaultTooltipWin == null) {
                var resourceURL = fairygui.UIConfig.tooltipsWin;
                if (!resourceURL) {
                    console.error("UIConfig.tooltipsWin not defined");
                    return;
                }
                this._defaultTooltipWin = fairygui.UIPackage.createObjectFromURL(resourceURL);
            }
            this._defaultTooltipWin.text = msg;
            this.showTooltipsWin(this._defaultTooltipWin);
        };
        p.showTooltipsWin = function (tooltipWin, position) {
            if (position === void 0) { position = null; }
            this.hideTooltips();
            this._tooltipWin = tooltipWin;
            var xx = 0;
            var yy = 0;
            if (position == null) {
                xx = GRoot.mouseX + 10;
                yy = GRoot.mouseY + 20;
            }
            else {
                xx = position.x;
                yy = position.y;
            }
            var pt = this.globalToLocal(xx, yy);
            xx = pt.x;
            yy = pt.y;
            if (xx + this._tooltipWin.width > this.width) {
                xx = xx - this._tooltipWin.width - 1;
                if (xx < 0)
                    xx = 10;
            }
            if (yy + this._tooltipWin.height > this.height) {
                yy = yy - this._tooltipWin.height - 1;
                if (xx - this._tooltipWin.width - 1 > 0)
                    xx = xx - this._tooltipWin.width - 1;
                if (yy < 0)
                    yy = 10;
            }
            this._tooltipWin.x = xx;
            this._tooltipWin.y = yy;
            this.addChild(this._tooltipWin);
        };
        p.hideTooltips = function () {
            if (this._tooltipWin != null) {
                if (this._tooltipWin.parent)
                    this.removeChild(this._tooltipWin);
                this._tooltipWin = null;
            }
        };
        p.getObjectUnderPoint = function (globalX, globalY) {
            var ret = this._nativeStage.$hitTest(globalX, globalY);
            if (ret)
                return fairygui.ToolSet.displayObjectToGObject(ret);
            else
                return null;
        };
        d(p, "focus"
            ,function () {
                if (this._focusedObject && !this._focusedObject.onStage)
                    this._focusedObject = null;
                return this._focusedObject;
            }
            ,function (value) {
                if (!this._focusManagement)
                    return;
                if (value && (!value.focusable || !value.onStage))
                    throw "invalid focus target";
                if (this._focusedObject != value) {
                    var old;
                    if (this._focusedObject != null && this._focusedObject.onStage)
                        old = this._focusedObject;
                    this._focusedObject = value;
                    this.dispatchEvent(new fairygui.FocusChangeEvent(fairygui.FocusChangeEvent.CHANGED, old, value));
                }
            }
        );
        d(p, "volumeScale"
            ,function () {
                return this._volumeScale;
            }
            ,function (value) {
                this._volumeScale = value;
            }
        );
        p.playOneShotSound = function (sound, volumeScale) {
            if (volumeScale === void 0) { volumeScale = 1; }
            var vs = this._volumeScale * volumeScale;
            var channel = sound.play(0, 1);
            channel.volume = vs;
        };
        p.adjustModalLayer = function () {
            var cnt = this.numChildren;
            var modalLayerIsTop = false;
            if (this._modalWaitPane != null && this._modalWaitPane.parent != null)
                this.setChildIndex(this._modalWaitPane, cnt - 1);
            for (var i = cnt - 1; i >= 0; i--) {
                var g = this.getChildAt(i);
                if (g == this._modalLayer)
                    modalLayerIsTop = true;
                else if ((g instanceof fairygui.Window) && g.modal) {
                    if (this._modalLayer.parent == null)
                        this.addChildAt(this._modalLayer, i);
                    else if (i > 0) {
                        if (modalLayerIsTop)
                            this.setChildIndex(this._modalLayer, i);
                        else
                            this.setChildIndex(this._modalLayer, i - 1);
                    }
                    else
                        this.addChildAt(this._modalLayer, 0);
                    return;
                }
            }
            if (this._modalLayer.parent != null)
                this.removeChild(this._modalLayer);
        };
        p.__addedToStage = function (evt) {
            this.displayObject.removeEventListener(egret.Event.ADDED_TO_STAGE, this.__addedToStage, this);
            this._nativeStage = this.displayObject.stage;
            GRoot.touchScreen = egret.MainContext.deviceType == egret.MainContext.DEVICE_MOBILE;
            this._nativeStage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__stageMouseDownCapture, this, true);
            this._nativeStage.addEventListener(egret.TouchEvent.TOUCH_END, this.__stageMouseUpCapture, this, true);
            this._nativeStage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__stageMouseMoveCapture, this, true);
            this._modalLayer = new fairygui.GGraph();
            this._modalLayer.setSize(this.width, this.height);
            this._modalLayer.drawRect(0, 0, 0, fairygui.UIConfig.modalLayerColor, fairygui.UIConfig.modalLayerAlpha);
            this._modalLayer.addRelation(this, fairygui.RelationType.Size);
            this.displayObject.stage.addEventListener(egret.Event.RESIZE, this.__winResize, this);
            this.__winResize(null);
        };
        p.__stageMouseDownCapture = function (evt) {
            //GRoot.ctrlKeyDown = evt.ctrlKey;
            //GRoot.shiftKeyDown = evt.shiftKey;
            GRoot.mouseX = evt.stageX;
            GRoot.mouseY = evt.stageY;
            GRoot.touchDown = true;
            if (this._focusManagement) {
                var mc = (evt.target);
                while (mc != this.displayObject.stage && mc != null) {
                    if (fairygui.ToolSet.isUIObject(mc)) {
                        var gg = mc.owner;
                        if (gg.touchable && gg.focusable) {
                            this.focus = gg;
                            break;
                        }
                    }
                    mc = mc.parent;
                }
            }
            if (this._tooltipWin != null)
                this.hideTooltips();
            this._justClosedPopups.length = 0;
            if (this._popupStack.length > 0) {
                mc = (evt.target);
                while (mc != this.displayObject.stage && mc != null) {
                    if (fairygui.ToolSet.isUIObject(mc)) {
                        var pindex = this._popupStack.indexOf(mc.owner);
                        if (pindex != -1) {
                            for (var i = this._popupStack.length - 1; i > pindex; i--) {
                                var popup = this._popupStack.pop();
                                this.closePopup(popup);
                                this._justClosedPopups.push(popup);
                            }
                            return;
                        }
                    }
                    mc = mc.parent;
                }
                var cnt = this._popupStack.length;
                for (i = cnt - 1; i >= 0; i--) {
                    popup = this._popupStack[i];
                    this.closePopup(popup);
                    this._justClosedPopups.push(popup);
                }
                this._popupStack.length = 0;
            }
        };
        p.__stageMouseMoveCapture = function (evt) {
            //GRoot.ctrlKeyDown = evt.ctrlKey;
            //GRoot.shiftKeyDown = evt.shiftKey;
            GRoot.mouseX = evt.stageX;
            GRoot.mouseY = evt.stageY;
        };
        p.__stageMouseUpCapture = function (evt) {
            GRoot.touchDown = false;
        };
        p.__winResize = function (evt) {
            var w, h = 0;
            w = this._nativeStage.stageWidth;
            h = this._nativeStage.stageHeight;
            this.setSize(Math.round(w / GRoot.contentScaleFactor), Math.round(h / GRoot.contentScaleFactor));
            //console.info("screen size=" + w + "x" + h + "/" + this.width + "x" + this.height);
        };
        GRoot.contentScaleFactor = 1;
        return GRoot;
    })(fairygui.GComponent);
    fairygui.GRoot = GRoot;
    egret.registerClass(GRoot,'fairygui.GRoot');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var Margin = (function () {
        function Margin() {
            this.left = 0;
            this.right = 0;
            this.top = 0;
            this.bottom = 0;
        }
        var d = __define,c=Margin,p=c.prototype;
        p.parse = function (str) {
            if (!str) {
                this.left = 0;
                this.right = 0;
                this.top = 0;
                this.bottom = 0;
                return;
            }
            var arr = str.split(",");
            if (arr.length == 1) {
                var k = parseInt(arr[0]);
                this.top = k;
                this.bottom = k;
                this.left = k;
                this.right = k;
            }
            else {
                this.top = parseInt(arr[0]);
                this.bottom = parseInt(arr[1]);
                this.left = parseInt(arr[2]);
                this.right = parseInt(arr[3]);
            }
        };
        p.copy = function (source) {
            this.top = source.top;
            this.bottom = source.bottom;
            this.left = source.left;
            this.right = source.right;
        };
        return Margin;
    })();
    fairygui.Margin = Margin;
    egret.registerClass(Margin,'fairygui.Margin');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GTimers = (function () {
        function GTimers() {
            this._enumI = 0;
            this._enumCount = 0;
            this._items = new Array();
            this._itemPool = new Array();
            egret.Ticker.getInstance().register(this.__timer, this);
        }
        var d = __define,c=GTimers,p=c.prototype;
        p.getItem = function () {
            if (this._itemPool.length)
                return this._itemPool.pop();
            else
                return new TimerItem();
        };
        p.findItem = function (callback, thisObj) {
            var len = this._items.length;
            for (var i = 0; i < len; i++) {
                var item = this._items[i];
                if (item.callback == callback && item.thisObj == thisObj)
                    return item;
            }
            return null;
        };
        p.add = function (delayInMiniseconds, repeat, callback, thisObj, callbackParam) {
            if (callbackParam === void 0) { callbackParam = null; }
            var item = this.findItem(callback, thisObj);
            if (!item) {
                item = this.getItem();
                item.callback = callback;
                item.hasParam = callback.length == 1;
                item.thisObj = thisObj;
                this._items.push(item);
            }
            item.delay = delayInMiniseconds;
            item.counter = 0;
            item.repeat = repeat;
            item.param = callbackParam;
            item.end = false;
        };
        p.callLater = function (callback, thisObj, callbackParam) {
            if (callbackParam === void 0) { callbackParam = null; }
            this.add(1, 1, callback, thisObj, callbackParam);
        };
        p.callDelay = function (delay, callback, thisObj, callbackParam) {
            if (callbackParam === void 0) { callbackParam = null; }
            this.add(delay, 1, callback, thisObj, callbackParam);
        };
        p.callBy24Fps = function (callback, thisObj, callbackParam) {
            if (callbackParam === void 0) { callbackParam = null; }
            this.add(GTimers.FPS24, 0, callback, thisObj, callbackParam);
        };
        p.exists = function (callback, thisObj) {
            var item = this.findItem(callback, thisObj);
            return item != null;
        };
        p.remove = function (callback, thisObj) {
            var item = this.findItem(callback, thisObj);
            if (item) {
                var i = this._items.indexOf(item);
                this._items.splice(i, 1);
                if (i < this._enumI)
                    this._enumI--;
                this._enumCount--;
                item.callback = null;
                item.param = null;
                this._itemPool.push(item);
            }
        };
        p.__timer = function (advancedTime) {
            this._enumI = 0;
            this._enumCount = this._items.length;
            while (this._enumI < this._enumCount) {
                var item = this._items[this._enumI];
                this._enumI++;
                if (item.advance(advancedTime)) {
                    if (item.end) {
                        this._enumI--;
                        this._enumCount--;
                        this._items.splice(this._enumI, 1);
                        this._itemPool.push(item);
                    }
                    if (item.hasParam)
                        item.callback.call(item.thisObj, item.param);
                    else
                        item.callback.call(item.thisObj);
                }
            }
        };
        GTimers.inst = new GTimers();
        GTimers.FPS24 = 1000 / 24;
        return GTimers;
    })();
    fairygui.GTimers = GTimers;
    egret.registerClass(GTimers,'fairygui.GTimers');
    var TimerItem = (function () {
        function TimerItem() {
            this.delay = 0;
            this.counter = 0;
            this.repeat = 0;
        }
        var d = __define,c=TimerItem,p=c.prototype;
        p.advance = function (elapsed) {
            if (elapsed === void 0) { elapsed = 0; }
            this.counter += elapsed;
            if (this.counter >= this.delay) {
                this.counter -= this.delay;
                if (this.counter > this.delay)
                    this.counter = this.delay;
                if (this.repeat > 0) {
                    this.repeat--;
                    if (this.repeat == 0)
                        this.end = true;
                }
                return true;
            }
            else
                return false;
        };
        return TimerItem;
    })();
    egret.registerClass(TimerItem,'TimerItem');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GScrollBar = (function (_super) {
        __extends(GScrollBar, _super);
        function GScrollBar() {
            _super.call(this);
            this._dragOffset = new egret.Point();
            this._scrollPerc = 0;
        }
        var d = __define,c=GScrollBar,p=c.prototype;
        p.setScrollPane = function (target, vertical) {
            this._target = target;
            this._vertical = vertical;
        };
        d(p, "displayPerc",undefined
            ,function (val) {
                if (this._vertical) {
                    if (!this._fixedGripSize)
                        this._grip.height = val * this._bar.height;
                    this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;
                }
                else {
                    if (!this._fixedGripSize)
                        this._grip.width = val * this._bar.width;
                    this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
                }
            }
        );
        d(p, "scrollPerc",undefined
            ,function (val) {
                this._scrollPerc = val;
                if (this._vertical)
                    this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;
                else
                    this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
            }
        );
        d(p, "minSize"
            ,function () {
                if (this._vertical)
                    return (this._arrowButton1 != null ? this._arrowButton1.height : 0) + (this._arrowButton2 != null ? this._arrowButton2.height : 0);
                else
                    return (this._arrowButton1 != null ? this._arrowButton1.width : 0) + (this._arrowButton2 != null ? this._arrowButton2.width : 0);
            }
        );
        p.constructFromXML = function (xml) {
            _super.prototype.constructFromXML.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "ScrollBar");
            if (xml != null)
                this._fixedGripSize = xml.attributes.fixedGripSize == "true";
            this._grip = this.getChild("grip");
            if (!this._grip) {
                console.error("需要定义grip");
                return;
            }
            this._bar = this.getChild("bar");
            if (!this._bar) {
                console.error("需要定义bar");
                return;
            }
            this._arrowButton1 = this.getChild("arrow1");
            this._arrowButton2 = this.getChild("arrow2");
            this._grip.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__gripMouseDown, this);
            this._grip.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__gripDragging, this);
            if (this._arrowButton1)
                this._arrowButton1.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__arrowButton1Click, this);
            if (this._arrowButton2)
                this._arrowButton2.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__arrowButton2Click, this);
            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__barMouseDown, this);
        };
        p.__gripMouseDown = function (evt) {
            if (!this._bar)
                return;
            evt.stopPropagation();
            this.globalToLocal(evt.stageX, evt.stageY, this._dragOffset);
            this._dragOffset.x -= this._grip.x;
            this._dragOffset.y -= this._grip.y;
        };
        p.__gripDragging = function (evt) {
            var pt = this.globalToLocal(evt.stageX, evt.stageY, GScrollBar.sScrollbarHelperPoint);
            if (this._vertical) {
                var curY = pt.y - this._dragOffset.y;
                this._target.setPercY((curY - this._bar.y) / (this._bar.height - this._grip.height), false);
            }
            else {
                var curX = pt.x - this._dragOffset.x;
                this._target.setPercX((curX - this._bar.x) / (this._bar.width - this._grip.width), false);
            }
        };
        p.__arrowButton1Click = function (evt) {
            evt.stopPropagation();
            if (this._vertical)
                this._target.scrollUp();
            else
                this._target.scrollLeft();
        };
        p.__arrowButton2Click = function (evt) {
            evt.stopPropagation();
            if (this._vertical)
                this._target.scrollDown();
            else
                this._target.scrollRight();
        };
        p.__barMouseDown = function (evt) {
            var pt = this._grip.globalToLocal(evt.stageX, evt.stageY, GScrollBar.sScrollbarHelperPoint);
            if (this._vertical) {
                if (pt.y < 0)
                    this._target.scrollUp(4);
                else
                    this._target.scrollDown(4);
            }
            else {
                if (pt.x < 0)
                    this._target.scrollLeft(4);
                else
                    this._target.scrollRight(4);
            }
        };
        GScrollBar.sScrollbarHelperPoint = new egret.Point();
        return GScrollBar;
    })(fairygui.GComponent);
    fairygui.GScrollBar = GScrollBar;
    egret.registerClass(GScrollBar,'fairygui.GScrollBar');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GSlider = (function (_super) {
        __extends(GSlider, _super);
        function GSlider() {
            _super.call(this);
            this._max = 0;
            this._value = 0;
            this._barMaxWidth = 0;
            this._barMaxHeight = 0;
            this._barMaxWidthDelta = 0;
            this._barMaxHeightDelta = 0;
            this._titleType = fairygui.ProgressTitleType.Percent;
            this._value = 50;
            this._max = 100;
            this._clickPos = new egret.Point();
        }
        var d = __define,c=GSlider,p=c.prototype;
        d(p, "titleType"
            ,function () {
                return this._titleType;
            }
            ,function (value) {
                this._titleType = value;
            }
        );
        d(p, "max"
            ,function () {
                return this._max;
            }
            ,function (value) {
                if (this._max != value) {
                    this._max = value;
                    this.update();
                }
            }
        );
        d(p, "value"
            ,function () {
                return this._value;
            }
            ,function (value) {
                if (this._value != value) {
                    this._value = value;
                    this.update();
                }
            }
        );
        p.update = function () {
            var percent = Math.min(this._value / this._max, 1);
            this.updateWidthPercent(percent);
        };
        p.updateWidthPercent = function (percent) {
            if (this._titleObject) {
                switch (this._titleType) {
                    case fairygui.ProgressTitleType.Percent:
                        this._titleObject.text = Math.round(percent * 100) + "%";
                        break;
                    case fairygui.ProgressTitleType.ValueAndMax:
                        this._titleObject.text = this._value + "/" + this._max;
                        break;
                    case fairygui.ProgressTitleType.Value:
                        this._titleObject.text = "" + this._value;
                        break;
                    case fairygui.ProgressTitleType.Max:
                        this._titleObject.text = "" + this._max;
                        break;
                }
            }
            if (this._barObjectH)
                this._barObjectH.width = (this.width - this._barMaxWidthDelta) * percent;
            if (this._barObjectV)
                this._barObjectV.height = (this.height - this._barMaxHeightDelta) * percent;
            if (this._aniObject instanceof fairygui.GMovieClip)
                (this._aniObject).frame = Math.round(percent * 100);
            else if (this._aniObject instanceof fairygui.GSwfObject)
                (this._aniObject).frame = Math.round(percent * 100);
        };
        p.constructFromXML = function (xml) {
            _super.prototype.constructFromXML.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "Slider");
            var str;
            str = xml.attributes.titleType;
            if (str)
                this._titleType = fairygui.parseProgressTitleType(str);
            this._titleObject = (this.getChild("title"));
            this._barObjectH = this.getChild("bar");
            this._barObjectV = this.getChild("bar_v");
            this._aniObject = this.getChild("ani");
            this._gripObject = this.getChild("grip");
            if (this._barObjectH) {
                this._barMaxWidth = this._barObjectH.width;
                this._barMaxWidthDelta = this.width - this._barMaxWidth;
            }
            if (this._barObjectV) {
                this._barMaxHeight = this._barObjectV.height;
                this._barMaxHeightDelta = this.height - this._barMaxHeight;
            }
            if (this._gripObject) {
                this._gripObject.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__gripMouseDown, this);
            }
        };
        p.handleSizeChanged = function () {
            _super.prototype.handleSizeChanged.call(this);
            if (this._barObjectH)
                this._barMaxWidth = this.width - this._barMaxWidthDelta;
            if (this._barObjectV)
                this._barMaxHeight = this.height - this._barMaxHeightDelta;
            if (!this._underConstruct)
                this.update();
        };
        p.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "Slider");
            if (xml) {
                this._value = parseInt(xml.attributes.value);
                this._max = parseInt(xml.attributes.max);
            }
            this.update();
        };
        p.__gripMouseDown = function (evt) {
            this._clickPos = this.globalToLocal(evt.stageX, evt.stageY);
            this._clickPercent = this._value / this._max;
            this._gripObject.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__gripMouseMove, this);
            this._gripObject.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.__gripMouseUp, this);
        };
        p.__gripMouseMove = function (evt) {
            var pt = this.globalToLocal(evt.stageX, evt.stageY, GSlider.sSilderHelperPoint);
            var deltaX = pt.x - this._clickPos.x;
            var deltaY = pt.y - this._clickPos.y;
            var percent;
            if (this._barObjectH)
                percent = this._clickPercent + deltaX / this._barMaxWidth;
            else
                percent = this._clickPercent + deltaY / this._barMaxHeight;
            if (percent > 1)
                percent = 1;
            else if (percent < 0)
                percent = 0;
            var newValue = Math.round(this._max * percent);
            if (newValue != this._value) {
                this._value = newValue;
                this.dispatchEvent(new fairygui.StateChangeEvent(fairygui.StateChangeEvent.CHANGED));
            }
            this.updateWidthPercent(percent);
        };
        p.__gripMouseUp = function (evt) {
            var percent = this._value / this._max;
            this.updateWidthPercent(percent);
            this._gripObject.displayObject.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__gripMouseMove, this);
            this._gripObject.displayObject.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__gripMouseUp, this);
        };
        GSlider.sSilderHelperPoint = new egret.Point();
        return GSlider;
    })(fairygui.GComponent);
    fairygui.GSlider = GSlider;
    egret.registerClass(GSlider,'fairygui.GSlider');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GSwfObject = (function (_super) {
        __extends(GSwfObject, _super);
        function GSwfObject() {
            _super.call(this);
            this._frame = 0;
            this._playing = true;
            this._gearAnimation = new fairygui.GearAnimation(this);
        }
        var d = __define,c=GSwfObject,p=c.prototype;
        p.createDisplayObject = function () {
            this._container = new fairygui.UIContainer(this);
            //this.setDisplayObject(this._container);
        };
        d(p, "playing"
            ,function () {
                return this._playing;
            }
            ,function (value) {
                if (this._playing != value) {
                    this._playing = value;
                    if (this._gearAnimation.controller)
                        this._gearAnimation.updateState();
                }
            }
        );
        d(p, "frame"
            ,function () {
                return this._frame;
            }
            ,function (value) {
                if (this._frame != value) {
                    this._frame = value;
                    if (this._gearAnimation.controller)
                        this._gearAnimation.updateState();
                }
            }
        );
        d(p, "gearAnimation"
            ,function () {
                return this._gearAnimation;
            }
        );
        p.handleSizeChanged = function () {
            if (this._content) {
                this._container.scaleX = this.width / this._sourceWidth * this.scaleX;
                this._container.scaleY = this.height / this._sourceHeight * this.scaleY;
            }
        };
        p.handleControllerChanged = function (c) {
            _super.prototype.handleControllerChanged.call(this, c);
            if (this._gearAnimation.controller == c)
                this._gearAnimation.apply();
        };
        p.constructFromResource = function (pkgItem) {
        };
        return GSwfObject;
    })(fairygui.GObject);
    fairygui.GSwfObject = GSwfObject;
    egret.registerClass(GSwfObject,'fairygui.GSwfObject',["fairygui.IAnimationGear"]);
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var GTextInput = (function (_super) {
        __extends(GTextInput, _super);
        function GTextInput() {
            _super.call(this);
            this._widthAutoSize = false;
            this._heightAutoSize = false;
            this.displayObject.touchChildren = true;
            this._textField.type = egret.TextFieldType.INPUT;
            this._textField.addEventListener(egret.Event.CHANGE, this.__textChanged, this);
            this._textField.addEventListener(egret.FocusEvent.FOCUS_IN, this.__focusIn, this);
            this._textField.addEventListener(egret.FocusEvent.FOCUS_OUT, this.__focusOut, this);
        }
        var d = __define,c=GTextInput,p=c.prototype;
        p.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        d(p, "editable"
            ,function () {
                return this._textField.type == egret.TextFieldType.INPUT;
            }
            ,function (val) {
                if (val)
                    this._textField.type == egret.TextFieldType.INPUT;
                else
                    this._textField.type == egret.TextFieldType.DYNAMIC;
            }
        );
        d(p, "maxLength"
            ,function () {
                return this._textField.maxChars;
            }
            ,function (val) {
                this._textField.maxChars = val;
            }
        );
        d(p, "promptText"
            ,function () {
                return this._promptText;
            }
            ,function (val) {
                this._promptText = val;
                this.updateTextFieldText();
            }
        );
        d(p, "verticalAlign",undefined
            ,function (value) {
                if (this._verticalAlign != value) {
                    this._verticalAlign = value;
                    this.updateVertAlign();
                }
            }
        );
        p.updateVertAlign = function () {
            switch (this._verticalAlign) {
                case fairygui.VertAlignType.Top:
                    this._textField.verticalAlign = egret.VerticalAlign.TOP;
                    break;
                case fairygui.VertAlignType.Middle:
                    this._textField.verticalAlign = egret.VerticalAlign.MIDDLE;
                    break;
                case fairygui.VertAlignType.Bottom:
                    this._textField.verticalAlign = egret.VerticalAlign.BOTTOM;
                    break;
            }
        };
        p.updateTextFieldText = function () {
            if (!this._text && this._promptText) {
                this._textField.displayAsPassword = false;
                this._textField.textFlow = (new egret.HtmlTextParser).parser(fairygui.ToolSet.parseUBB(this._promptText));
            }
            else {
                this._textField.displayAsPassword = this._displayAsPassword;
                if (this._ubbEnabled)
                    this._textField.textFlow = (new egret.HtmlTextParser).parser(fairygui.ToolSet.parseUBB(fairygui.ToolSet.encodeHTML(this._text)));
                else
                    this._textField.text = this._text;
            }
        };
        p.handleSizeChanged = function () {
            if (!this._updatingSize) {
                this._textField.width = Math.ceil(this.width);
                this._textField.height = Math.ceil(this.height);
            }
        };
        p.doAlign = function () {
            //nothing here
        };
        p.setup_beforeAdd = function (xml) {
            _super.prototype.setup_beforeAdd.call(this, xml);
            this._promptText = xml.attributes.prompt;
            this.updateVertAlign();
        };
        p.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            if (!this._text && this._promptText) {
                this._textField.displayAsPassword = false;
                this._textField.textFlow = (new egret.HtmlTextParser).parser(fairygui.ToolSet.parseUBB(fairygui.ToolSet.encodeHTML(this._promptText)));
            }
        };
        p.__textChanged = function (evt) {
            this._text = this._textField.text;
        };
        p.__focusIn = function (evt) {
            if (!this._text && this._promptText) {
                this._textField.displayAsPassword = this._displayAsPassword;
                this._textField.text = "";
            }
        };
        p.__focusOut = function (evt) {
            this._text = this._textField.text;
            if (!this._text && this._promptText) {
                this._textField.displayAsPassword = false;
                this._textField.textFlow = (new egret.HtmlTextParser).parser(fairygui.ToolSet.parseUBB(fairygui.ToolSet.encodeHTML(this._promptText)));
            }
        };
        return GTextInput;
    })(fairygui.GTextField);
    fairygui.GTextInput = GTextInput;
    egret.registerClass(GTextInput,'fairygui.GTextInput');
})(fairygui || (fairygui = {}));




var fairygui;
(function (fairygui) {
    var PageOption = (function () {
        function PageOption() {
        }
        var d = __define,c=PageOption,p=c.prototype;
        d(p, "controller",undefined
            ,function (val) {
                this._controller = val;
            }
        );
        d(p, "index"
            ,function () {
                if (this._id)
                    return this._controller.getPageIndexById(this._id);
                else
                    return -1;
            }
            ,function (pageIndex) {
                this._id = this._controller.getPageId(pageIndex);
            }
        );
        d(p, "name"
            ,function () {
                if (this._id)
                    return this._controller.getPageNameById(this._id);
                else
                    return null;
            }
            ,function (pageName) {
                this._id = this._controller.getPageIdByName(pageName);
            }
        );
        p.clear = function () {
            this._id = null;
        };
        d(p, "id"
            ,function () {
                return this._id;
            }
            ,function (id) {
                this._id = id;
            }
        );
        return PageOption;
    })();
    fairygui.PageOption = PageOption;
    egret.registerClass(PageOption,'fairygui.PageOption');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var PageOptionSet = (function () {
        function PageOptionSet() {
            this._items = [];
        }
        var d = __define,c=PageOptionSet,p=c.prototype;
        d(p, "controller",undefined
            ,function (val) {
                this._controller = val;
            }
        );
        p.add = function (pageIndex) {
            if (pageIndex === void 0) { pageIndex = 0; }
            var id = this._controller.getPageId(pageIndex);
            var i = this._items.indexOf(id);
            if (i == -1)
                this._items.push(id);
        };
        p.remove = function (pageIndex) {
            if (pageIndex === void 0) { pageIndex = 0; }
            var id = this._controller.getPageId(pageIndex);
            var i = this._items.indexOf(id);
            if (i != -1)
                this._items.splice(i, 1);
        };
        p.addByName = function (pageName) {
            var id = this._controller.getPageIdByName(pageName);
            var i = this._items.indexOf(id);
            if (i != -1)
                this._items.push(id);
        };
        p.removeByName = function (pageName) {
            var id = this._controller.getPageIdByName(pageName);
            var i = this._items.indexOf(id);
            if (i != -1)
                this._items.splice(i, 1);
        };
        p.clear = function () {
            this._items.length = 0;
        };
        d(p, "empty"
            ,function () {
                return this._items.length == 0;
            }
        );
        p.addById = function (id) {
            this._items.push(id);
        };
        p.containsId = function (id) {
            return this._items.indexOf(id) != -1;
        };
        return PageOptionSet;
    })();
    fairygui.PageOptionSet = PageOptionSet;
    egret.registerClass(PageOptionSet,'fairygui.PageOptionSet');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var PopupMenu = (function () {
        function PopupMenu(resourceURL) {
            if (resourceURL === void 0) { resourceURL = null; }
            if (!resourceURL) {
                resourceURL = fairygui.UIConfig.popupMenu;
                if (!resourceURL)
                    throw "UIConfig.popupMenu not defined";
            }
            this._contentPane = fairygui.UIPackage.createObjectFromURL(resourceURL).asCom;
            this._contentPane.addEventListener(egret.Event.ADDED_TO_STAGE, this.__addedToStage, this);
            this._list = (this._contentPane.getChild("list"));
            this._list.removeChildrenToPool();
            this._list.addRelation(this._contentPane, fairygui.RelationType.Width);
            this._list.removeRelation(this._contentPane, fairygui.RelationType.Height);
            this._contentPane.addRelation(this._list, fairygui.RelationType.Height);
            this._list.addEventListener(fairygui.ItemEvent.CLICK, this.__clickItem, this);
        }
        var d = __define,c=PopupMenu,p=c.prototype;
        p.addItem = function (caption, callback) {
            if (callback === void 0) { callback = null; }
            var item = this._list.addItemFromPool().asButton;
            item.title = caption;
            item.data = callback;
            item.grayed = false;
            var c = item.getController("checked");
            if (c != null)
                c.selectedIndex = 0;
            return item;
        };
        p.addItemAt = function (caption, index, callback) {
            if (callback === void 0) { callback = null; }
            var item = this._list.getFromPool().asButton;
            this._list.addChildAt(item, index);
            item.title = caption;
            item.data = callback;
            item.grayed = false;
            var c = item.getController("checked");
            if (c != null)
                c.selectedIndex = 0;
            return item;
        };
        p.addSeperator = function () {
            if (fairygui.UIConfig.popupMenu_seperator == null)
                throw "UIConfig.popupMenu_seperator not defined";
            this.list.addItemFromPool(fairygui.UIConfig.popupMenu_seperator);
        };
        p.getItemName = function (index) {
            var item = this._list.getChildAt(index);
            return item.name;
        };
        p.setItemText = function (name, caption) {
            var item = this._list.getChild(name).asButton;
            item.title = caption;
        };
        p.setItemVisible = function (name, visible) {
            var item = this._list.getChild(name).asButton;
            if (item.visible != visible) {
                item.visible = visible;
                this._list.setBoundsChangedFlag();
            }
        };
        p.setItemGrayed = function (name, grayed) {
            var item = this._list.getChild(name).asButton;
            item.grayed = grayed;
        };
        p.setItemCheckable = function (name, checkable) {
            var item = this._list.getChild(name).asButton;
            var c = item.getController("checked");
            if (c != null) {
                if (checkable) {
                    if (c.selectedIndex == 0)
                        c.selectedIndex = 1;
                }
                else
                    c.selectedIndex = 0;
            }
        };
        p.setItemChecked = function (name, checked) {
            var item = this._list.getChild(name).asButton;
            var c = item.getController("checked");
            if (c != null)
                c.selectedIndex = checked ? 2 : 1;
        };
        p.isItemChecked = function (name) {
            var item = this._list.getChild(name).asButton;
            var c = item.getController("checked");
            if (c != null)
                return c.selectedIndex == 2;
            else
                return false;
        };
        p.removeItem = function (name) {
            var item = this._list.getChild(name);
            if (item != null) {
                var index = this._list.getChildIndex(item);
                this._list.removeChildToPoolAt(index);
                return true;
            }
            else
                return false;
        };
        p.clearItems = function () {
            this._list.removeChildrenToPool();
        };
        d(p, "itemCount"
            ,function () {
                return this._list.numChildren;
            }
        );
        d(p, "contentPane"
            ,function () {
                return this._contentPane;
            }
        );
        d(p, "list"
            ,function () {
                return this._list;
            }
        );
        p.show = function (target, downward) {
            if (target === void 0) { target = null; }
            if (downward === void 0) { downward = null; }
            var r = (target instanceof fairygui.GRoot) ? target : (target != null ? target.root : null);
            if (!r)
                r = fairygui.GRoot.inst;
            if (target instanceof fairygui.GRoot)
                target = null;
            r.showPopup(this.contentPane, target, downward);
        };
        p.__clickItem = function (evt) {
            egret.setTimeout(this.__clickItem2, this, 100, evt);
        };
        p.__clickItem2 = function (evt) {
            var item = evt.itemObject.asButton;
            if (item == null)
                return;
            if (item.grayed) {
                this._list.selectedIndex = -1;
                return;
            }
            var c = item.getController("checked");
            if (c != null && c.selectedIndex != 0) {
                if (c.selectedIndex == 1)
                    c.selectedIndex = 2;
                else
                    c.selectedIndex = 1;
            }
            var r = (this._contentPane.parent);
            r.hidePopup(this.contentPane);
            if (item.data != null) {
                if (item.data.length == 1)
                    item.data(evt);
                else
                    item.data();
            }
        };
        p.__addedToStage = function (evt) {
            this._list.selectedIndex = -1;
            this._list.resizeToFit(100000, 10);
        };
        return PopupMenu;
    })();
    fairygui.PopupMenu = PopupMenu;
    egret.registerClass(PopupMenu,'fairygui.PopupMenu');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var RelationItem = (function () {
        function RelationItem(owner) {
            this._owner = owner;
            this._defs = new Array();
        }
        var d = __define,c=RelationItem,p=c.prototype;
        d(p, "owner"
            ,function () {
                return this._owner;
            }
        );
        d(p, "target"
            ,function () {
                return this._target;
            }
            ,function (value) {
                if (this._target != value) {
                    if (this._target)
                        this.releaseRefTarget(this._target);
                    this._target = value;
                    if (this._target)
                        this.addRefTarget(this._target);
                }
            }
        );
        p.add = function (relationType, usePercent) {
            if (relationType == fairygui.RelationType.Size) {
                this.add(fairygui.RelationType.Width, usePercent);
                this.add(fairygui.RelationType.Height, usePercent);
                return;
            }
            var length = this._defs.length;
            for (var i = 0; i < length; i++) {
                var def = this._defs[i];
                if (def.type == relationType)
                    return;
            }
            var info = new RelationDef();
            info.affectBySelfSizeChanged = relationType >= fairygui.RelationType.Center_Center && relationType <= fairygui.RelationType.Right_Right
                || relationType >= fairygui.RelationType.Middle_Middle && relationType <= fairygui.RelationType.Bottom_Bottom;
            info.percent = usePercent;
            info.type = relationType;
            this._defs.push(info);
        };
        p.remove = function (relationType) {
            if (relationType === void 0) { relationType = 0; }
            if (relationType == fairygui.RelationType.Size) {
                this.remove(fairygui.RelationType.Width);
                this.remove(fairygui.RelationType.Height);
                return;
            }
            var dc = this._defs.length;
            for (var k = 0; k < dc; k++) {
                if (this._defs[k].type == relationType) {
                    this._defs.splice(k, 1);
                    break;
                }
            }
        };
        p.copyFrom = function (source) {
            this.target = source.target;
            this._defs.length = 0;
            var length = source._defs.length;
            for (var i = 0; i < length; i++) {
                var info = source._defs[i];
                var info2 = new RelationDef();
                info2.copyFrom(info);
                this._defs.push(info2);
            }
        };
        p.dispose = function () {
            if (this._target != null) {
                this.releaseRefTarget(this._target);
                this._target = null;
            }
        };
        d(p, "isEmpty"
            ,function () {
                return this._defs.length == 0;
            }
        );
        p.applyOnSelfResized = function (dWidth, dHeight) {
            var ox = this._owner.x;
            var oy = this._owner.y;
            var length = this._defs.length;
            for (var i = 0; i < length; i++) {
                var info = this._defs[i];
                if (info.affectBySelfSizeChanged) {
                    switch (info.type) {
                        case fairygui.RelationType.Center_Center:
                        case fairygui.RelationType.Right_Center:
                            this._owner.x -= dWidth / 2;
                            break;
                        case fairygui.RelationType.Right_Left:
                        case fairygui.RelationType.Right_Right:
                            this._owner.x -= dWidth;
                            break;
                        case fairygui.RelationType.Middle_Middle:
                        case fairygui.RelationType.Bottom_Middle:
                            this._owner.y -= dHeight / 2;
                            break;
                        case fairygui.RelationType.Bottom_Top:
                        case fairygui.RelationType.Bottom_Bottom:
                            this._owner.y -= dHeight;
                            break;
                    }
                }
            }
            if (ox != this._owner.x || oy != this._owner.y) {
                ox = this._owner.x - ox;
                oy = this._owner.y - oy;
                if (this._owner.gearXY.controller != null)
                    this._owner.gearXY.updateFromRelations(ox, oy);
                if (this._owner.parent != null) {
                    var len = this._owner.parent._transitions.length;
                    if (len > 0) {
                        for (var i = 0; i < len; ++i) {
                            this._owner.parent._transitions[i].updateFromRelations(this._owner.id, ox, oy);
                        }
                    }
                }
            }
        };
        p.applyOnXYChanged = function (info, dx, dy) {
            var tmp;
            switch (info.type) {
                case fairygui.RelationType.Left_Left:
                case fairygui.RelationType.Left_Center:
                case fairygui.RelationType.Left_Right:
                case fairygui.RelationType.Center_Center:
                case fairygui.RelationType.Right_Left:
                case fairygui.RelationType.Right_Center:
                case fairygui.RelationType.Right_Right:
                    this._owner.x += dx;
                    break;
                case fairygui.RelationType.Top_Top:
                case fairygui.RelationType.Top_Middle:
                case fairygui.RelationType.Top_Bottom:
                case fairygui.RelationType.Middle_Middle:
                case fairygui.RelationType.Bottom_Top:
                case fairygui.RelationType.Bottom_Middle:
                case fairygui.RelationType.Bottom_Bottom:
                    this._owner.y += dy;
                    break;
                case fairygui.RelationType.Width:
                case fairygui.RelationType.Height:
                    break;
                case fairygui.RelationType.LeftExt_Left:
                case fairygui.RelationType.LeftExt_Right:
                    tmp = this._owner.x;
                    this._owner.x += dx;
                    this._owner.width = this._owner._rawWidth - (this._owner.x - tmp);
                    break;
                case fairygui.RelationType.RightExt_Left:
                case fairygui.RelationType.RightExt_Right:
                    this._owner.width = this._owner._rawWidth + dx;
                    break;
                case fairygui.RelationType.TopExt_Top:
                case fairygui.RelationType.TopExt_Bottom:
                    tmp = this._owner.y;
                    this._owner.y += dy;
                    this._owner.height = this._owner._rawHeight - (this._owner.y - tmp);
                    break;
                case fairygui.RelationType.BottomExt_Top:
                case fairygui.RelationType.BottomExt_Bottom:
                    this._owner.height = this._owner._rawHeight + dy;
                    break;
            }
        };
        p.applyOnSizeChanged = function (info) {
            var targetX, targetY;
            if (this._target != this._owner.parent) {
                targetX = this._target.x;
                targetY = this._target.y;
            }
            else {
                targetX = 0;
                targetY = 0;
            }
            var v, tmp;
            switch (info.type) {
                case fairygui.RelationType.Left_Left:
                    break;
                case fairygui.RelationType.Left_Center:
                    v = this._owner.x - (targetX + this._targetWidth / 2);
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    this._owner.x = targetX + this._target._rawWidth / 2 + v;
                    break;
                case fairygui.RelationType.Left_Right:
                    v = this._owner.x - (targetX + this._targetWidth);
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    this._owner.x = targetX + this._target._rawWidth + v;
                    break;
                case fairygui.RelationType.Center_Center:
                    v = this._owner.x + this._owner._rawWidth / 2 - (targetX + this._targetWidth / 2);
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    this._owner.x = targetX + this._target._rawWidth / 2 + v - this._owner._rawWidth / 2;
                    break;
                case fairygui.RelationType.Right_Left:
                    v = this._owner.x + this._owner._rawWidth - targetX;
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    this._owner.x = targetX + v - this._owner._rawWidth;
                    break;
                case fairygui.RelationType.Right_Center:
                    v = this._owner.x + this._owner._rawWidth - (targetX + this._targetWidth / 2);
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    this._owner.x = targetX + this._target._rawWidth / 2 + v - this._owner._rawWidth;
                    break;
                case fairygui.RelationType.Right_Right:
                    v = this._owner.x + this._owner._rawWidth - (targetX + this._targetWidth);
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    this._owner.x = targetX + this._target._rawWidth + v - this._owner._rawWidth;
                    break;
                case fairygui.RelationType.Top_Top:
                    break;
                case fairygui.RelationType.Top_Middle:
                    v = this._owner.y - (targetY + this._targetHeight / 2);
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    this._owner.y = targetY + this._target._rawHeight / 2 + v;
                    break;
                case fairygui.RelationType.Top_Bottom:
                    v = this._owner.y - (targetY + this._targetHeight);
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    this._owner.y = targetY + this._target._rawHeight + v;
                    break;
                case fairygui.RelationType.Middle_Middle:
                    v = this._owner.y + this._owner._rawHeight / 2 - (targetY + this._targetHeight / 2);
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    this._owner.y = targetY + this._target._rawHeight / 2 + v - this._owner._rawHeight / 2;
                    break;
                case fairygui.RelationType.Bottom_Top:
                    v = this._owner.y + this._owner._rawHeight - targetY;
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    this._owner.y = targetY + v - this._owner._rawHeight;
                    break;
                case fairygui.RelationType.Bottom_Middle:
                    v = this._owner.y + this._owner._rawHeight - (targetY + this._targetHeight / 2);
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    this._owner.y = targetY + this._target._rawHeight / 2 + v - this._owner._rawHeight;
                    break;
                case fairygui.RelationType.Bottom_Bottom:
                    v = this._owner.y + this._owner._rawHeight - (targetY + this._targetHeight);
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    this._owner.y = targetY + this._target._rawHeight + v - this._owner._rawHeight;
                    break;
                case fairygui.RelationType.Width:
                    if (this._owner._underConstruct && this._owner == this._target.parent)
                        v = this._owner.sourceWidth - this._target._initWidth;
                    else
                        v = this._owner._rawWidth - this._targetWidth;
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    this._owner.width = this._target._rawWidth + v;
                    break;
                case fairygui.RelationType.Height:
                    if (this._owner._underConstruct && this._owner == this._target.parent)
                        v = this._owner.sourceHeight - this._target._initHeight;
                    else
                        v = this._owner._rawHeight - this._targetHeight;
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    this._owner.height = this._target._rawHeight + v;
                    break;
                case fairygui.RelationType.LeftExt_Left:
                    break;
                case fairygui.RelationType.LeftExt_Right:
                    v = this._owner.x - (targetX + this._targetWidth);
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    tmp = this._owner.x;
                    this._owner.x = targetX + this._target._rawWidth + v;
                    this._owner.width = this._owner._rawWidth - (this._owner.x - tmp);
                    break;
                case fairygui.RelationType.RightExt_Left:
                    break;
                case fairygui.RelationType.RightExt_Right:
                    if (this._owner._underConstruct && this._owner == this._target.parent)
                        v = this._owner.sourceWidth - (targetX + this._target._initWidth);
                    else
                        v = this._owner.width - (targetX + this._targetWidth);
                    if (this._owner != this._target.parent)
                        v += this._owner.x;
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    if (this._owner != this._target.parent)
                        this._owner.width = targetX + this._target._rawWidth + v - this._owner.x;
                    else
                        this._owner.width = targetX + this._target._rawWidth + v;
                    break;
                case fairygui.RelationType.TopExt_Top:
                    break;
                case fairygui.RelationType.TopExt_Bottom:
                    v = this._owner.y - (targetY + this._targetHeight);
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    tmp = this._owner.y;
                    this._owner.y = targetY + this._target._rawHeight + v;
                    this._owner.height = this._owner._rawHeight - (this._owner.y - tmp);
                    break;
                case fairygui.RelationType.BottomExt_Top:
                    break;
                case fairygui.RelationType.BottomExt_Bottom:
                    if (this._owner._underConstruct && this._owner == this._target.parent)
                        v = this._owner.sourceHeight - (targetY + this._target._initHeight);
                    else
                        v = this._owner._rawHeight - (targetY + this._targetHeight);
                    if (this._owner != this._target.parent)
                        v += this._owner.y;
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    if (this._owner != this._target.parent)
                        this._owner.height = targetY + this._target._rawHeight + v - this._owner.y;
                    else
                        this._owner.height = targetY + this._target._rawHeight + v;
                    break;
            }
        };
        p.addRefTarget = function (target) {
            if (target != this._owner.parent)
                target.addEventListener(fairygui.GObject.XY_CHANGED, this.__targetXYChanged, this);
            target.addEventListener(fairygui.GObject.SIZE_CHANGED, this.__targetSizeChanged, this);
            target.addEventListener(fairygui.GObject.SIZE_DELAY_CHANGE, this.__targetSizeWillChange, this);
            this._targetX = this._target.x;
            this._targetY = this._target.y;
            this._targetWidth = this._target._rawWidth;
            this._targetHeight = this._target._rawHeight;
        };
        p.releaseRefTarget = function (target) {
            target.removeEventListener(fairygui.GObject.XY_CHANGED, this.__targetXYChanged, this);
            target.removeEventListener(fairygui.GObject.SIZE_CHANGED, this.__targetSizeChanged, this);
            target.removeEventListener(fairygui.GObject.SIZE_DELAY_CHANGE, this.__targetSizeWillChange, this);
        };
        p.__targetXYChanged = function (evt) {
            if (this._owner.relations.handling != null || this._owner.group != null && this._owner.group._updating) {
                this._targetX = this._target.x;
                this._targetY = this._target.y;
                return;
            }
            this._owner.relations.handling = this._target;
            var ox = this._owner.x;
            var oy = this._owner.y;
            var dx = this._target.x - this._targetX;
            var dy = this._target.y - this._targetY;
            var length = this._defs.length;
            for (var i = 0; i < length; i++) {
                var info = this._defs[i];
                this.applyOnXYChanged(info, dx, dy);
            }
            this._targetX = this._target.x;
            this._targetY = this._target.y;
            if (ox != this._owner.x || oy != this._owner.y) {
                ox = this._owner.x - ox;
                oy = this._owner.y - oy;
                if (this._owner.gearXY.controller != null)
                    this._owner.gearXY.updateFromRelations(ox, oy);
                if (this._owner.parent != null) {
                    var len = this._owner.parent._transitions.length;
                    if (len > 0) {
                        for (var i = 0; i < len; ++i) {
                            this._owner.parent._transitions[i].updateFromRelations(this._owner.id, ox, oy);
                        }
                    }
                }
            }
            this._owner.relations.handling = null;
        };
        p.__targetSizeChanged = function (evt) {
            if (this._owner.relations.handling != null)
                return;
            this._owner.relations.handling = this._target;
            var ox = this._owner.x;
            var oy = this._owner.y;
            var length = this._defs.length;
            for (var i = 0; i < length; i++) {
                var info = this._defs[i];
                this.applyOnSizeChanged(info);
            }
            this._targetWidth = this._target._rawWidth;
            this._targetHeight = this._target._rawHeight;
            if (ox != this._owner.x || oy != this._owner.y) {
                ox = this._owner.x - ox;
                oy = this._owner.y - oy;
                if (this._owner.gearXY.controller != null)
                    this._owner.gearXY.updateFromRelations(ox, oy);
                if (this._owner.parent != null) {
                    var len = this._owner.parent._transitions.length;
                    if (len > 0) {
                        for (var i = 0; i < len; ++i) {
                            this._owner.parent._transitions[i].updateFromRelations(this._owner.id, ox, oy);
                        }
                    }
                }
            }
            this._owner.relations.handling = null;
        };
        p.__targetSizeWillChange = function (evt) {
            this._owner.relations.sizeDirty = true;
        };
        return RelationItem;
    })();
    fairygui.RelationItem = RelationItem;
    egret.registerClass(RelationItem,'fairygui.RelationItem');
    var RelationDef = (function () {
        function RelationDef() {
        }
        var d = __define,c=RelationDef,p=c.prototype;
        p.copyFrom = function (source) {
            this.affectBySelfSizeChanged = source.affectBySelfSizeChanged;
            this.percent = source.percent;
            this.type = source.type;
        };
        return RelationDef;
    })();
    fairygui.RelationDef = RelationDef;
    egret.registerClass(RelationDef,'fairygui.RelationDef');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var Relations = (function () {
        function Relations(owner) {
            this._owner = owner;
            this._items = new Array();
        }
        var d = __define,c=Relations,p=c.prototype;
        p.add = function (target, relationType, usePercent) {
            if (usePercent === void 0) { usePercent = false; }
            var length = this._items.length;
            for (var i = 0; i < length; i++) {
                var item = this._items[i];
                if (item.target == target) {
                    item.add(relationType, usePercent);
                    return;
                }
            }
            var newItem = new fairygui.RelationItem(this._owner);
            newItem.target = target;
            newItem.add(relationType, usePercent);
            this._items.push(newItem);
        };
        p.addItems = function (target, sidePairs) {
            var arr = sidePairs.split(",");
            var s;
            var usePercent;
            var i;
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
                var j = s.indexOf("-");
                if (j == -1)
                    s = s + "-" + s;
                var t = Relations.RELATION_NAMES.indexOf(s);
                if (t == -1)
                    throw "invalid relation type";
                this.add(target, t, usePercent);
            }
        };
        p.remove = function (target, relationType) {
            if (relationType === void 0) { relationType = 0; }
            var cnt = this._items.length;
            var i = 0;
            while (i < cnt) {
                var item = this._items[i];
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
        };
        p.contains = function (target) {
            var length = this._items.length;
            for (var i = 0; i < length; i++) {
                var item = this._items[i];
                if (item.target == target)
                    return true;
            }
            return false;
        };
        p.clearFor = function (target) {
            var cnt = this._items.length;
            var i = 0;
            while (i < cnt) {
                var item = this._items[i];
                if (item.target == target) {
                    item.dispose();
                    this._items.splice(i, 1);
                    cnt--;
                }
                else
                    i++;
            }
        };
        p.clearAll = function () {
            var length = this._items.length;
            for (var i = 0; i < length; i++) {
                var item = this._items[i];
                item.dispose();
            }
            this._items.length = 0;
        };
        p.copyFrom = function (source) {
            this.clearAll();
            var arr = source._items;
            var length = arr.length;
            for (var i = 0; i < length; i++) {
                var ri = arr[i];
                var item = new fairygui.RelationItem(this._owner);
                item.copyFrom(ri);
                this._items.push(item);
            }
        };
        p.dispose = function () {
            this.clearAll();
        };
        p.onOwnerSizeChanged = function (dWidth, dHeight) {
            if (this._items.length == 0)
                return;
            var length = this._items.length;
            for (var i = 0; i < length; i++) {
                var item = this._items[i];
                item.applyOnSelfResized(dWidth, dHeight);
            }
        };
        p.ensureRelationsSizeCorrect = function () {
            if (this._items.length == 0)
                return;
            this.sizeDirty = false;
            var length = this._items.length;
            for (var i = 0; i < length; i++) {
                var item = this._items[i];
                item.target.ensureSizeCorrect();
            }
        };
        d(p, "empty"
            ,function () {
                return this._items.length == 0;
            }
        );
        p.setup = function (xml) {
            var col = xml.children;
            if (col) {
                var targetId;
                var target;
                var length = col.length;
                for (var i = 0; i < length; i++) {
                    var cxml = col[i];
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
                        target = (this._owner).getChildById(targetId);
                    }
                    if (target)
                        this.addItems(target, cxml.attributes.sidePair);
                }
            }
        };
        Relations.RELATION_NAMES = [
            "left-left",
            "left-center",
            "left-right",
            "center-center",
            "right-left",
            "right-center",
            "right-right",
            "top-top",
            "top-middle",
            "top-bottom",
            "middle-middle",
            "bottom-top",
            "bottom-middle",
            "bottom-bottom",
            "width-width",
            "height-height",
            "leftext-left",
            "leftext-right",
            "rightext-left",
            "rightext-right",
            "topext-top",
            "topext-bottom",
            "bottomext-top",
            "bottomext-bottom" //23
        ];
        return Relations;
    })();
    fairygui.Relations = Relations;
    egret.registerClass(Relations,'fairygui.Relations');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var ScrollPane = (function () {
        function ScrollPane(owner, scrollType, margin, scrollBarMargin, scrollBarDisplay, flags, vtScrollBarRes, hzScrollBarRes) {
            this._maskWidth = 0;
            this._maskHeight = 0;
            this._contentWidth = 0;
            this._contentHeight = 0;
            this._scrollType = 0;
            this._scrollSpeed = 0;
            this._mouseWheelSpeed = 0;
            if (ScrollPane._easeTypeFunc == null)
                ScrollPane._easeTypeFunc = egret.Ease.cubicOut;
            this._throwTween = new ThrowTween();
            this._owner = owner;
            this._container = this._owner._rootContainer;
            this._maskHolder = new egret.DisplayObjectContainer();
            this._container.addChild(this._maskHolder);
            this._maskContentHolder = this._owner._container;
            this._maskContentHolder.x = 0;
            this._maskContentHolder.y = 0;
            this._maskHolder.addChild(this._maskContentHolder);
            this._holdAreaPoint = new egret.Point();
            this._margin = margin;
            this._scrollBarMargin = scrollBarMargin;
            this._bouncebackEffect = fairygui.UIConfig.defaultScrollBounceEffect;
            this._touchEffect = fairygui.UIConfig.defaultScrollTouchEffect;
            this._xPerc = 0;
            this._yPerc = 0;
            this._aniFlag = true;
            this._scrollBarVisible = true;
            this._scrollSpeed = fairygui.UIConfig.defaultScrollSpeed;
            this._mouseWheelSpeed = this._scrollSpeed * 2;
            this._displayOnLeft = (flags & 1) != 0;
            this._snapToItem = (flags & 2) != 0;
            this._displayInDemand = (flags & 4) != 0;
            this._scrollType = scrollType;
            this._mouseWheelEnabled = false;
            if (scrollBarDisplay == fairygui.ScrollBarDisplayType.Default)
                scrollBarDisplay = fairygui.UIConfig.defaultScrollBarDisplay;
            if (scrollBarDisplay != fairygui.ScrollBarDisplayType.Hidden) {
                if (this._scrollType == fairygui.ScrollType.Both || this._scrollType == fairygui.ScrollType.Vertical) {
                    var res = vtScrollBarRes ? vtScrollBarRes : fairygui.UIConfig.verticalScrollBar;
                    if (res) {
                        this._vtScrollBar = (fairygui.UIPackage.createObjectFromURL(res));
                        if (!this._vtScrollBar)
                            throw "cannot create scrollbar from " + res;
                        this._vtScrollBar.setScrollPane(this, true);
                        this._container.addChild(this._vtScrollBar.displayObject);
                    }
                }
                if (this._scrollType == fairygui.ScrollType.Both || this._scrollType == fairygui.ScrollType.Horizontal) {
                    var res = hzScrollBarRes ? hzScrollBarRes : fairygui.UIConfig.horizontalScrollBar;
                    if (res) {
                        this._hzScrollBar = (fairygui.UIPackage.createObjectFromURL(res));
                        if (!this._hzScrollBar)
                            throw "cannot create scrollbar from " + res;
                        this._hzScrollBar.setScrollPane(this, false);
                        this._container.addChild(this._hzScrollBar.displayObject);
                    }
                }
                this._scrollBarDisplayAuto = scrollBarDisplay == fairygui.ScrollBarDisplayType.Auto;
                if (this._scrollBarDisplayAuto) {
                    this._scrollBarVisible = false;
                    if (this._vtScrollBar)
                        this._vtScrollBar.displayObject.visible = false;
                    if (this._hzScrollBar)
                        this._hzScrollBar.displayObject.visible = false;
                }
            }
            this._margin.left = margin.left;
            this._margin.top = margin.top;
            this._margin.right = margin.right;
            this._margin.bottom = margin.bottom;
            if (this._displayOnLeft && this._vtScrollBar)
                this._maskHolder.x = Math.round(this._margin.left + this._vtScrollBar.width);
            else
                this._maskHolder.x = this._margin.left;
            this._maskHolder.y = this._margin.top;
            this._contentWidth = 0;
            this._contentHeight = 0;
            this.setSize(owner.width, owner.height);
            this.setContentSize(owner.bounds.width, owner.bounds.height);
            this._owner.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__mouseDown, this);
        }
        var d = __define,c=ScrollPane,p=c.prototype;
        p.dispose = function () {
            this._owner.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__mouseDown, this);
            this._container.removeChildren();
            this._maskContentHolder.x = 0;
            this._maskContentHolder.y = 0;
            this._container.addChild(this._maskContentHolder);
        };
        d(p, "owner"
            ,function () {
                return this._owner;
            }
        );
        d(p, "bouncebackEffect"
            ,function () {
                return this._bouncebackEffect;
            }
            ,function (sc) {
                this._bouncebackEffect = sc;
            }
        );
        d(p, "touchEffect"
            ,function () {
                return this._touchEffect;
            }
            ,function (sc) {
                this._touchEffect = sc;
            }
        );
        d(p, "scrollSpeed"
            ,function () {
                return this._scrollSpeed;
            }
            ,function (val) {
                this._scrollSpeed = this.scrollSpeed;
                if (this._scrollSpeed == 0)
                    this._scrollSpeed = fairygui.UIConfig.defaultScrollSpeed;
                this._mouseWheelSpeed = this._scrollSpeed * 2;
            }
        );
        d(p, "snapToItem"
            ,function () {
                return this._snapToItem;
            }
            ,function (value) {
                this._snapToItem = value;
            }
        );
        d(p, "percX"
            ,function () {
                return this._xPerc;
            }
            ,function (sc) {
                this.setPercX(sc, false);
            }
        );
        p.setPercX = function (sc, ani) {
            if (ani === void 0) { ani = false; }
            if (sc > 1)
                sc = 1;
            else if (sc < 0)
                sc = 0;
            if (sc != this._xPerc) {
                this._xPerc = sc;
                this._owner.dispatchEventWith(ScrollPane.SCROLL, false);
                this.posChanged(ani);
            }
        };
        d(p, "percY"
            ,function () {
                return this._yPerc;
            }
            ,function (sc) {
                this.setPercY(sc, false);
            }
        );
        p.setPercY = function (sc, ani) {
            if (ani === void 0) { ani = false; }
            if (sc > 1)
                sc = 1;
            else if (sc < 0)
                sc = 0;
            if (sc != this._yPerc) {
                this._yPerc = sc;
                this._owner.dispatchEventWith(ScrollPane.SCROLL, false);
                this.posChanged(ani);
            }
        };
        d(p, "posX"
            ,function () {
                return this._xPerc * (this.contentWidth - this._maskWidth);
            }
            ,function (val) {
                this.setPosX(val, false);
            }
        );
        p.setPosX = function (val, ani) {
            if (ani === void 0) { ani = false; }
            this.setPercX(val / (this.contentWidth - this._maskWidth), ani);
        };
        d(p, "posY"
            ,function () {
                return this._yPerc * (this.contentHeight - this._maskHeight);
            }
            ,function (val) {
                this.setPosY(val, false);
            }
        );
        p.setPosY = function (val, ani) {
            if (ani === void 0) { ani = false; }
            this.setPercY(val / (this.contentHeight - this._maskHeight), ani);
        };
        d(p, "isBottomMost"
            ,function () {
                return this._yPerc == 1 || this.contentHeight <= this._maskHeight;
            }
        );
        d(p, "isRightMost"
            ,function () {
                return this._xPerc == 1 || this.contentWidth <= this._maskWidth;
            }
        );
        d(p, "contentWidth"
            ,function () {
                this._owner.ensureBoundsCorrect();
                return this._contentWidth;
            }
        );
        d(p, "contentHeight"
            ,function () {
                this._owner.ensureBoundsCorrect();
                return this._contentHeight;
            }
        );
        d(p, "viewWidth"
            ,function () {
                return this._maskWidth;
            }
            ,function (value) {
                value = value + this._margin.left + this._margin.right;
                if (this._vtScrollBar != null)
                    value += this._vtScrollBar.width;
                this._owner.width = value;
            }
        );
        d(p, "viewHeight"
            ,function () {
                return this._maskHeight;
            }
            ,function (value) {
                value = value + this._margin.top + this._margin.bottom;
                if (this._hzScrollBar != null)
                    value += this._hzScrollBar.height;
                this._owner.height = value;
            }
        );
        p.getDeltaX = function (move) {
            return move / (this._contentWidth - this._maskWidth);
        };
        p.getDeltaY = function (move) {
            return move / (this._contentHeight - this._maskHeight);
        };
        p.scrollTop = function (ani) {
            if (ani === void 0) { ani = false; }
            this.setPercY(0, ani);
        };
        p.scrollBottom = function (ani) {
            if (ani === void 0) { ani = false; }
            this.setPercY(1, ani);
        };
        p.scrollUp = function (speed, ani) {
            if (speed === void 0) { speed = 1; }
            if (ani === void 0) { ani = false; }
            this.setPercY(this._yPerc - this.getDeltaY(this._scrollSpeed * speed), ani);
        };
        p.scrollDown = function (speed, ani) {
            if (speed === void 0) { speed = 1; }
            if (ani === void 0) { ani = false; }
            this.setPercY(this._yPerc + this.getDeltaY(this._scrollSpeed * speed), ani);
        };
        p.scrollLeft = function (speed, ani) {
            if (speed === void 0) { speed = 1; }
            if (ani === void 0) { ani = false; }
            this.setPercX(this._xPerc - this.getDeltaX(this._scrollSpeed * speed), ani);
        };
        p.scrollRight = function (speed, ani) {
            if (speed === void 0) { speed = 1; }
            if (ani === void 0) { ani = false; }
            this.setPercX(this._xPerc + this.getDeltaX(this._scrollSpeed * speed), ani);
        };
        p.scrollToView = function (obj, ani) {
            if (ani === void 0) { ani = false; }
            this._owner.ensureBoundsCorrect();
            if (fairygui.GTimers.inst.exists(this.refresh, this))
                this.refresh();
            if (this._vScroll) {
                var top = (this._contentHeight - this._maskHeight) * this._yPerc;
                var bottom = top + this._maskHeight;
                if (obj.y < top)
                    this.setPosY(obj.y, ani);
                else if (obj.y + obj.height > bottom) {
                    if (obj.y + obj.height * 2 >= top)
                        this.setPosY(obj.y + obj.height * 2 - this._maskHeight, ani);
                    else
                        this.setPosY(obj.y + obj.height - this._maskHeight, ani);
                }
            }
            if (this._hScroll) {
                var left = (this._contentWidth - this._maskWidth) * this._xPerc;
                var right = left + this._maskWidth;
                if (obj.x < left)
                    this.setPosX(obj.x, ani);
                else if (obj.x + obj.width > right) {
                    if (obj.x + obj.width * 2 >= left)
                        this.setPosX(obj.x + obj.width * 2 - this._maskWidth, ani);
                    else
                        this.setPosX(obj.x + obj.width - this._maskWidth, ani);
                }
            }
            if (!ani && fairygui.GTimers.inst.exists(this.refresh, this))
                this.refresh();
        };
        p.isChildInView = function (obj) {
            if (this._vScroll) {
                var top = (this._contentHeight - this._maskHeight) * this._yPerc;
                var bottom = top + this._maskHeight;
                if (obj.y + obj.height < top || obj.y > bottom)
                    return false;
            }
            if (this._hScroll) {
                var left = (this._contentWidth - this._maskWidth) * this._xPerc;
                var right = left + this._maskWidth;
                if (obj.x + obj.width < left || obj.x > right)
                    return false;
            }
            return true;
        };
        p.setSize = function (aWidth, aHeight) {
            var w, h;
            w = aWidth;
            h = aHeight;
            if (this._hzScrollBar) {
                if (!this._hScrollNone)
                    h -= this._hzScrollBar.height;
                this._hzScrollBar.y = h;
                if (this._vtScrollBar && !this._vScrollNone) {
                    this._hzScrollBar.width = w - this._vtScrollBar.width - this._scrollBarMargin.left - this._scrollBarMargin.right;
                    if (this._displayOnLeft)
                        this._hzScrollBar.x = this._scrollBarMargin.left + this._vtScrollBar.width;
                    else
                        this._hzScrollBar.x = this._scrollBarMargin.left;
                }
                else {
                    this._hzScrollBar.width = w - this._scrollBarMargin.left - this._scrollBarMargin.right;
                    this._hzScrollBar.x = this._scrollBarMargin.left;
                }
            }
            if (this._vtScrollBar) {
                if (!this._vScrollNone)
                    w -= this._vtScrollBar.width;
                if (!this._displayOnLeft)
                    this._vtScrollBar.x = w;
                this._vtScrollBar.height = h - this._scrollBarMargin.top - this._scrollBarMargin.bottom;
                this._vtScrollBar.y = this._scrollBarMargin.top;
            }
            w -= (this._margin.left + this._margin.right);
            h -= (this._margin.top + this._margin.bottom);
            this._maskWidth = Math.max(1, w);
            this._maskHeight = Math.max(1, h);
            this.handleSizeChanged();
            this.posChanged(false);
        };
        p.setContentSize = function (aWidth, aHeight) {
            if (this._contentWidth == aWidth && this._contentHeight == aHeight)
                return;
            this._contentWidth = aWidth;
            this._contentHeight = aHeight;
            this.handleSizeChanged();
            this._aniFlag = false;
            this.refresh();
        };
        p.handleSizeChanged = function () {
            if (this._displayInDemand) {
                if (this._vtScrollBar) {
                    if (this._contentHeight <= this._maskHeight) {
                        if (!this._vScrollNone) {
                            this._vScrollNone = true;
                            this._maskWidth += this._vtScrollBar.width;
                        }
                    }
                    else {
                        if (this._vScrollNone) {
                            this._vScrollNone = false;
                            this._maskWidth -= this._vtScrollBar.width;
                        }
                    }
                }
                if (this._hzScrollBar) {
                    if (this._contentWidth <= this._maskWidth) {
                        if (!this._hScrollNone) {
                            this._hScrollNone = true;
                            this._maskHeight += this._vtScrollBar.height;
                        }
                    }
                    else {
                        if (this._hScrollNone) {
                            this._hScrollNone = false;
                            this._maskHeight -= this._vtScrollBar.height;
                        }
                    }
                }
            }
            if (this._vtScrollBar) {
                if (this._maskHeight < this._vtScrollBar.minSize)
                    this._vtScrollBar.displayObject.visible = false;
                else {
                    this._vtScrollBar.displayObject.visible = this._scrollBarVisible && !this._vScrollNone;
                    if (this._contentHeight == 0)
                        this._vtScrollBar.displayPerc = 0;
                    else
                        this._vtScrollBar.displayPerc = Math.min(1, this._maskHeight / this._contentHeight);
                }
            }
            if (this._hzScrollBar) {
                if (this._maskWidth < this._hzScrollBar.minSize)
                    this._hzScrollBar.displayObject.visible = false;
                else {
                    this._hzScrollBar.displayObject.visible = this._scrollBarVisible && !this._hScrollNone;
                    if (this._contentWidth == 0)
                        this._hzScrollBar.displayPerc = 0;
                    else
                        this._hzScrollBar.displayPerc = Math.min(1, this._maskWidth / this._contentWidth);
                }
            }
            this._maskHolder.mask = new egret.Rectangle(0, 0, this._maskWidth, this._maskHeight);
            this._xOverlap = Math.max(0, this._contentWidth - this._maskWidth);
            this._yOverlap = Math.max(0, this._contentHeight - this._maskHeight);
            switch (this._scrollType) {
                case fairygui.ScrollType.Both:
                    if (this._contentWidth > this._maskWidth && this._contentHeight <= this._maskHeight) {
                        this._hScroll = true;
                        this._vScroll = false;
                    }
                    else if (this._contentWidth <= this._maskWidth && this._contentHeight > this._maskHeight) {
                        this._hScroll = false;
                        this._vScroll = true;
                    }
                    else if (this._contentWidth > this._maskWidth && this._contentHeight > this._maskHeight) {
                        this._hScroll = true;
                        this._vScroll = true;
                    }
                    else {
                        this._hScroll = false;
                        this._vScroll = false;
                    }
                    break;
                case fairygui.ScrollType.Vertical:
                    if (this._contentHeight > this._maskHeight) {
                        this._hScroll = false;
                        this._vScroll = true;
                    }
                    else {
                        this._hScroll = false;
                        this._vScroll = false;
                    }
                    break;
                case fairygui.ScrollType.Horizontal:
                    if (this._contentWidth > this._maskWidth) {
                        this._hScroll = true;
                        this._vScroll = false;
                    }
                    else {
                        this._hScroll = false;
                        this._vScroll = false;
                    }
                    break;
            }
        };
        p.posChanged = function (ani) {
            if (this._aniFlag)
                this._aniFlag = ani;
            fairygui.GTimers.inst.callLater(this.refresh, this);
        };
        p.refresh = function () {
            if (this._isMouseMoved) {
                fairygui.GTimers.inst.callLater(this.refresh, this);
                return;
            }
            fairygui.GTimers.inst.remove(this.refresh, this);
            var contentYLoc;
            var contentXLoc;
            if (this._vScroll)
                contentYLoc = this._yPerc * (this._contentHeight - this._maskHeight);
            if (this._hScroll)
                contentXLoc = this._xPerc * (this._contentWidth - this._maskWidth);
            if (this._snapToItem) {
                var pt = this._owner.findObjectNear(contentXLoc, contentYLoc);
                var scrolled = false;
                if (this._xPerc != 1 && pt.x != contentXLoc) {
                    this._xPerc = pt.x / (this._contentWidth - this._maskWidth);
                    if (this._xPerc > 1)
                        this._xPerc = 1;
                    contentXLoc = this._xPerc * (this._contentWidth - this._maskWidth);
                    scrolled = true;
                }
                if (this._yPerc != 1 && pt.y != contentYLoc) {
                    this._yPerc = pt.y / (this._contentHeight - this._maskHeight);
                    if (this._yPerc > 1)
                        this._yPerc = 1;
                    contentYLoc = this._yPerc * (this._contentHeight - this._maskHeight);
                    scrolled = true;
                }
                if (scrolled)
                    this._owner.dispatchEventWith(ScrollPane.SCROLL, false);
            }
            contentXLoc = Math.floor(contentXLoc);
            contentYLoc = Math.floor(contentYLoc);
            if (this._aniFlag) {
                var toX = this._maskContentHolder.x;
                var toY = this._maskContentHolder.y;
                if (this._vScroll) {
                    toY = -contentYLoc;
                }
                else {
                    if (this._maskContentHolder.y != 0)
                        this._maskContentHolder.y = 0;
                }
                if (this._hScroll) {
                    toX = -contentXLoc;
                }
                else {
                    if (this._maskContentHolder.x != 0)
                        this._maskContentHolder.x = 0;
                }
                if (toX != this._maskContentHolder.x || toY != this._maskContentHolder.y) {
                    this.killTweens();
                    this._maskHolder.touchEnabled = false;
                    this._tweening = 1;
                    egret.Tween.get(this._maskContentHolder, { onChange: this.__tweenUpdate, onChangeObj: this })
                        .to({ x: toX, y: toY, }, 500, ScrollPane._easeTypeFunc)
                        .call(this.__tweenComplete, this);
                }
            }
            else {
                this.killTweens();
                if (this._vScroll)
                    this._maskContentHolder.y = -contentYLoc;
                else
                    this._maskContentHolder.y = 0;
                if (this._hScroll)
                    this._maskContentHolder.x = -contentXLoc;
                else
                    this._maskContentHolder.x = 0;
                if (this._vtScrollBar)
                    this._vtScrollBar.scrollPerc = this._yPerc;
                if (this._hzScrollBar)
                    this._hzScrollBar.scrollPerc = this._xPerc;
            }
            this._aniFlag = true;
        };
        p.killTweens = function () {
            if (this._tweening == 1) {
                egret.Tween.pauseTweens(this._maskContentHolder);
            }
            else if (this._tweening == 2) {
                egret.Tween.pauseTweens(this._throwTween);
                this._throwTween.value = 1;
                this.__tweenUpdate2();
                this.__tweenComplete2();
            }
            this._tweening = 0;
        };
        p.calcYPerc = function () {
            if (!this._vScroll)
                return 0;
            var diff = this._contentHeight - this._maskHeight;
            var my = this._maskContentHolder.y;
            var currY;
            if (my > 0)
                currY = 0;
            else if (-my > diff)
                currY = diff;
            else
                currY = -my;
            return currY / diff;
        };
        p.calcXPerc = function () {
            if (!this._hScroll)
                return 0;
            var diff = this._contentWidth - this._maskWidth;
            var currX;
            var mx = this._maskContentHolder.x;
            if (mx > 0)
                currX = 0;
            else if (-mx > diff)
                currX = diff;
            else
                currX = -mx;
            return currX / diff;
        };
        p.onScrolling = function () {
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
        };
        p.onScrollEnd = function () {
            if (this._vtScrollBar) {
                if (this._scrollBarDisplayAuto)
                    this.showScrollBar(false);
            }
            if (this._hzScrollBar) {
                if (this._scrollBarDisplayAuto)
                    this.showScrollBar(false);
            }
            this._tweening = 0;
        };
        p.__mouseDown = function (evt) {
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
            this._owner.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__mouseMove, this);
            this._owner.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.__mouseUp, this);
        };
        p.__mouseMove = function (evt) {
            var sensitivity = fairygui.UIConfig.touchScrollSensitivity;
            var diff;
            var sv, sh, st;
            this._container.globalToLocal(evt.stageX, evt.stageY, ScrollPane.sHelperPoint);
            if (this._scrollType == fairygui.ScrollType.Vertical) {
                if (!this._isHoldAreaDone) {
                    diff = Math.abs(this._holdAreaPoint.y - ScrollPane.sHelperPoint.y);
                    if (diff < sensitivity)
                        return;
                }
                sv = true;
            }
            else if (this._scrollType == fairygui.ScrollType.Horizontal) {
                if (!this._isHoldAreaDone) {
                    diff = Math.abs(this._holdAreaPoint.x - ScrollPane.sHelperPoint.x);
                    if (diff < sensitivity)
                        return;
                }
                sh = true;
            }
            else {
                if (!this._isHoldAreaDone) {
                    diff = Math.abs(this._holdAreaPoint.y - ScrollPane.sHelperPoint.y);
                    if (diff < sensitivity) {
                        diff = Math.abs(this._holdAreaPoint.x - ScrollPane.sHelperPoint.x);
                        if (diff < sensitivity)
                            return;
                    }
                }
                sv = sh = true;
            }
            var t = egret.getTimer();
            if (t - this._time2 > 50) {
                this._time2 = this._time1;
                this._time1 = t;
                st = true;
            }
            if (sv) {
                var y = Math.floor(ScrollPane.sHelperPoint.y - this._yOffset);
                if (y > 0) {
                    if (!this._bouncebackEffect)
                        this._maskContentHolder.y = 0;
                    else
                        this._maskContentHolder.y = Math.floor(y * 0.5);
                }
                else if (y < -this._yOverlap) {
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
                var x = Math.floor(ScrollPane.sHelperPoint.x - this._xOffset);
                if (x > 0) {
                    if (!this._bouncebackEffect)
                        this._maskContentHolder.x = 0;
                    else
                        this._maskContentHolder.x = Math.floor(x * 0.5);
                }
                else if (x < 0 - this._xOverlap) {
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
            this._owner.dispatchEventWith(ScrollPane.SCROLL, false);
        };
        p.__mouseUp = function (evt) {
            if (!this._touchEffect) {
                this._isMouseMoved = false;
                return;
            }
            this._owner.displayObject.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__mouseMove, this);
            this._owner.displayObject.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__mouseUp, this);
            if (!this._isMouseMoved)
                return;
            this._isMouseMoved = false;
            var time = (egret.getTimer() - this._time2) / 1000;
            if (time == 0)
                time = 0.001;
            var yVelocity = (this._maskContentHolder.y - this._y2) / time;
            var xVelocity = (this._maskContentHolder.x - this._x2) / time;
            var duration = 0.3;
            var xMin = -this._xOverlap;
            var yMin = -this._yOverlap;
            var xMax = 0;
            var yMax = 0;
            this._throwTween.start.x = this._maskContentHolder.x;
            this._throwTween.start.y = this._maskContentHolder.y;
            var change1 = this._throwTween.change1;
            var change2 = this._throwTween.change2;
            var endX = 0;
            var endY = 0;
            if (this._scrollType == fairygui.ScrollType.Both || this._scrollType == fairygui.ScrollType.Horizontal) {
                change1.x = ThrowTween.calculateChange(xVelocity, duration);
                change2.x = 0;
                endX = this._maskContentHolder.x + change1.x;
            }
            else
                change1.x = change2.x = 0;
            if (this._scrollType == fairygui.ScrollType.Both || this._scrollType == fairygui.ScrollType.Vertical) {
                change1.y = ThrowTween.calculateChange(yVelocity, duration);
                change2.y = 0;
                endY = this._maskContentHolder.y + change1.y;
            }
            else
                change1.y = change2.y = 0;
            if (this._snapToItem) {
                endX = -endX;
                endY = -endY;
                var pt = this._owner.findObjectNear(endX, endY);
                endX = -pt.x;
                endY = -pt.y;
                change1.x = endX - this._maskContentHolder.x;
                change1.y = endY - this._maskContentHolder.y;
            }
            if (this._bouncebackEffect) {
                if (xMax < endX)
                    change2.x = xMax - this._maskContentHolder.x - change1.x;
                else if (xMin > endX)
                    change2.x = xMin - this._maskContentHolder.x - change1.x;
                if (yMax < endY)
                    change2.y = yMax - this._maskContentHolder.y - change1.y;
                else if (yMin > endY)
                    change2.y = yMin - this._maskContentHolder.y - change1.y;
            }
            else {
                if (xMax < endX)
                    change1.x = xMax - this._maskContentHolder.x;
                else if (xMin > endX)
                    change1.x = xMin - this._maskContentHolder.x;
                if (yMax < endY)
                    change1.y = yMax - this._maskContentHolder.y;
                else if (yMin > endY)
                    change1.y = yMin - this._maskContentHolder.y;
            }
            this._throwTween.value = 0;
            this._throwTween.change1 = change1;
            this._throwTween.change2 = change2;
            this.killTweens();
            this._tweening = 2;
            egret.Tween.get(this._throwTween, { onChange: this.__tweenUpdate2, onChangeObj: this })
                .to({ value: 1 }, duration * 1000, ScrollPane._easeTypeFunc)
                .call(this.__tweenComplete2, this);
        };
        p.__rollOver = function (evt) {
            this.showScrollBar(true);
        };
        p.__rollOut = function (evt) {
            this.showScrollBar(false);
        };
        p.showScrollBar = function (val) {
            if (val) {
                this.__showScrollBar(true);
                fairygui.GTimers.inst.remove(this.__showScrollBar, this);
            }
            else
                fairygui.GTimers.inst.add(500, 1, this.__showScrollBar, this, val);
        };
        p.__showScrollBar = function (val) {
            this._scrollBarVisible = val && this._maskWidth > 0 && this._maskHeight > 0;
            if (this._vtScrollBar)
                this._vtScrollBar.displayObject.visible = this._scrollBarVisible && !this._vScrollNone;
            if (this._hzScrollBar)
                this._hzScrollBar.displayObject.visible = this._scrollBarVisible && !this._hScrollNone;
        };
        p.__tweenUpdate = function () {
            this.onScrolling();
        };
        p.__tweenComplete = function () {
            this._maskHolder.touchEnabled = true;
            this.onScrollEnd();
        };
        p.__tweenUpdate2 = function () {
            this._throwTween.update(this._maskContentHolder);
            if (this._scrollType == fairygui.ScrollType.Vertical)
                this._yPerc = this.calcYPerc();
            else if (this._scrollType == fairygui.ScrollType.Horizontal)
                this._xPerc = this.calcXPerc();
            else {
                this._yPerc = this.calcYPerc();
                this._xPerc = this.calcXPerc();
            }
            this.onScrolling();
            this._owner.dispatchEventWith(ScrollPane.SCROLL, false);
        };
        p.__tweenComplete2 = function () {
            if (this._scrollType == fairygui.ScrollType.Vertical)
                this._yPerc = this.calcYPerc();
            else if (this._scrollType == fairygui.ScrollType.Horizontal)
                this._xPerc = this.calcXPerc();
            else {
                this._yPerc = this.calcYPerc();
                this._xPerc = this.calcXPerc();
            }
            this._maskHolder.touchEnabled = true;
            this.onScrollEnd();
            this._owner.dispatchEventWith(ScrollPane.SCROLL, false);
        };
        ScrollPane.SCROLL = "__scroll";
        ScrollPane.sHelperPoint = new egret.Point();
        return ScrollPane;
    })();
    fairygui.ScrollPane = ScrollPane;
    egret.registerClass(ScrollPane,'fairygui.ScrollPane');
    var ThrowTween = (function () {
        function ThrowTween() {
            this.start = new egret.Point();
            this.change1 = new egret.Point();
            this.change2 = new egret.Point();
        }
        var d = __define,c=ThrowTween,p=c.prototype;
        p.update = function (obj) {
            obj.x = Math.floor(this.start.x + this.change1.x * this.value + this.change2.x * this.value * this.value);
            obj.y = Math.floor(this.start.y + this.change1.y * this.value + this.change2.y * this.value * this.value);
        };
        ThrowTween.calculateChange = function (velocity, duration) {
            return (duration * ThrowTween.checkpoint * velocity) / ThrowTween.easeOutCubic(ThrowTween.checkpoint, 0, 1, 1);
        };
        ThrowTween.easeOutCubic = function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        };
        ThrowTween.checkpoint = 0.05;
        return ThrowTween;
    })();
    egret.registerClass(ThrowTween,'ThrowTween');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var BitmapFont = (function () {
        function BitmapFont() {
            this.size = 0;
            this.glyphs = {};
        }
        var d = __define,c=BitmapFont,p=c.prototype;
        return BitmapFont;
    })();
    fairygui.BitmapFont = BitmapFont;
    egret.registerClass(BitmapFont,'fairygui.BitmapFont');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var BMGlyph = (function () {
        function BMGlyph() {
            this.x = 0;
            this.y = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.width = 0;
            this.height = 0;
            this.advance = 0;
            this.lineHeight = 0;
            this.channel = 0;
        }
        var d = __define,c=BMGlyph,p=c.prototype;
        return BMGlyph;
    })();
    fairygui.BMGlyph = BMGlyph;
    egret.registerClass(BMGlyph,'fairygui.BMGlyph');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var UIConfig = (function () {
        function UIConfig() {
        }
        var d = __define,c=UIConfig,p=c.prototype;
        //Default font name
        UIConfig.defaultFont = "宋体";
        //When a modal window is in front, the background becomes dark.
        UIConfig.modalLayerColor = 0x333333;
        UIConfig.modalLayerAlpha = 0.2;
        UIConfig.buttonSoundVolumeScale = 1;
        //Scrolling step in pixels
        UIConfig.defaultScrollSpeed = 25;
        //Default scrollbar display mode. Recommened visible for Desktop and Auto for mobile.
        UIConfig.defaultScrollBarDisplay = fairygui.ScrollBarDisplayType.Visible;
        //Allow dragging the content to scroll. Recommeded true for mobile.
        UIConfig.defaultScrollTouchEffect = true;
        //The "rebound" effect in the scolling container. Recommeded true for mobile.
        UIConfig.defaultScrollBounceEffect = true;
        //Max items displayed in combobox without scrolling.
        UIConfig.defaultComboBoxVisibleItemCount = 10;
        // Pixel offsets of finger to trigger scrolling.
        UIConfig.touchScrollSensitivity = 20;
        // Pixel offsets of finger to trigger dragging.
        UIConfig.touchDragSensitivity = 10;
        // Pixel offsets of mouse pointer to trigger dragging.
        UIConfig.clickDragSensitivity = 2;
        return UIConfig;
    })();
    fairygui.UIConfig = UIConfig;
    egret.registerClass(UIConfig,'fairygui.UIConfig');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var UBBParser = (function () {
        function UBBParser() {
            this._readPos = 0;
            this.smallFontSize = 12;
            this.normalFontSize = 14;
            this.largeFontSize = 16;
            this.defaultImgWidth = 0;
            this.defaultImgHeight = 0;
            this._handlers = {};
            this._handlers["url"] = this.onTag_URL;
            this._handlers["img"] = this.onTag_IMG;
            this._handlers["b"] = this.onTag_Simple;
            this._handlers["i"] = this.onTag_Simple;
            this._handlers["u"] = this.onTag_Simple;
            this._handlers["sup"] = this.onTag_Simple;
            this._handlers["sub"] = this.onTag_Simple;
            this._handlers["color"] = this.onTag_COLOR;
            this._handlers["font"] = this.onTag_FONT;
            this._handlers["size"] = this.onTag_SIZE;
        }
        var d = __define,c=UBBParser,p=c.prototype;
        p.onTag_URL = function (tagName, end, attr) {
            if (!end) {
                if (attr != null)
                    return "<a href=\"" + attr + "\" target=\"_blank\">";
                else {
                    var href = this.getTagText();
                    return "<a href=\"" + href + "\" target=\"_blank\">";
                }
            }
            else
                return "</a>";
        };
        p.onTag_IMG = function (tagName, end, attr) {
            if (!end) {
                var src = this.getTagText(true);
                if (!src)
                    return null;
                if (this.defaultImgWidth)
                    return "<img src=\"" + src + "\" width=\"" + this.defaultImgWidth + "\" height=\"" + this.defaultImgHeight + "\"/>";
                else
                    return "<img src=\"" + src + "\"/>";
            }
            else
                return null;
        };
        p.onTag_Simple = function (tagName, end, attr) {
            return end ? ("</" + tagName + ">") : ("<" + tagName + ">");
        };
        p.onTag_COLOR = function (tagName, end, attr) {
            if (!end)
                return "<font color=\"" + attr + "\">";
            else
                return "</font>";
        };
        p.onTag_FONT = function (tagName, end, attr) {
            if (!end)
                return "<font face=\"" + attr + "\">";
            else
                return "</font>";
        };
        p.onTag_SIZE = function (tagName, end, attr) {
            if (!end) {
                if (attr == "normal")
                    attr = "" + this.normalFontSize;
                else if (attr == "small")
                    attr = "" + this.smallFontSize;
                else if (attr == "large")
                    attr = "" + this.largeFontSize;
                else if (attr.length && attr.charAt(0) == "+")
                    attr = "" + (this.smallFontSize + parseInt(attr.substr(1)));
                else if (attr.length && attr.charAt(0) == "-")
                    attr = "" + (this.smallFontSize - parseInt(attr.substr(1)));
                return "<font size=\"" + attr + "\">";
            }
            else
                return "</font>";
        };
        p.getTagText = function (remove) {
            if (remove === void 0) { remove = false; }
            var pos = this._text.indexOf("[", this._readPos);
            if (pos == -1)
                return null;
            var ret = this._text.substring(this._readPos, pos);
            if (remove)
                this._readPos = pos;
            return ret;
        };
        p.parse = function (text) {
            this._text = text;
            var pos1 = 0, pos2, pos3 = 0;
            var end;
            var tag, attr;
            var repl;
            var func;
            while ((pos2 = this._text.indexOf("[", pos1)) != -1) {
                pos1 = pos2;
                pos2 = this._text.indexOf("]", pos1);
                if (pos2 == -1)
                    break;
                end = this._text.charAt(pos1 + 1) == '/';
                tag = this._text.substring(end ? pos1 + 2 : pos1 + 1, pos2);
                pos2++;
                this._readPos = pos2;
                attr = null;
                repl = null;
                pos3 = tag.indexOf("=");
                if (pos3 != -1) {
                    attr = tag.substring(pos3 + 1);
                    tag = tag.substring(0, pos3);
                }
                tag = tag.toLowerCase();
                func = this._handlers[tag];
                if (func != null) {
                    repl = func.call(this, tag, end, attr);
                    if (repl == null)
                        repl = "";
                }
                else {
                    pos1 = pos2;
                    continue;
                }
                this._text = this._text.substring(0, pos1) + repl + this._text.substring(this._readPos);
            }
            return this._text;
        };
        UBBParser.inst = new UBBParser();
        return UBBParser;
    })();
    fairygui.UBBParser = UBBParser;
    egret.registerClass(UBBParser,'fairygui.UBBParser');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var ToolSet = (function () {
        function ToolSet() {
        }
        var d = __define,c=ToolSet,p=c.prototype;
        ToolSet.getFileName = function (source) {
            var i = source.lastIndexOf("/");
            if (i != -1)
                source = source.substr(i + 1);
            i = source.lastIndexOf("\\");
            if (i != -1)
                source = source.substr(i + 1);
            i = source.lastIndexOf(".");
            if (i != -1)
                return source.substring(0, i);
            else
                return source;
        };
        ToolSet.startsWith = function (source, str, ignoreCase) {
            if (ignoreCase === void 0) { ignoreCase = false; }
            if (!source)
                return false;
            else if (source.length < str.length)
                return false;
            else {
                source = source.substring(0, str.length);
                if (!ignoreCase)
                    return source == str;
                else
                    return source.toLowerCase() == str.toLowerCase();
            }
        };
        ToolSet.endsWith = function (source, str, ignoreCase) {
            if (ignoreCase === void 0) { ignoreCase = false; }
            if (!source)
                return false;
            else if (source.length < str.length)
                return false;
            else {
                source = source.substring(source.length - str.length);
                if (!ignoreCase)
                    return source == str;
                else
                    return source.toLowerCase() == str.toLowerCase();
            }
        };
        ToolSet.trim = function (targetString) {
            return ToolSet.trimLeft(ToolSet.trimRight(targetString));
        };
        ToolSet.trimLeft = function (targetString) {
            var tempChar = "";
            for (var i = 0; i < targetString.length; i++) {
                tempChar = targetString.charAt(i);
                if (tempChar != " " && tempChar != "\n" && tempChar != "\r") {
                    break;
                }
            }
            return targetString.substr(i);
        };
        ToolSet.trimRight = function (targetString) {
            var tempChar = "";
            for (var i = targetString.length - 1; i >= 0; i--) {
                tempChar = targetString.charAt(i);
                if (tempChar != " " && tempChar != "\n" && tempChar != "\r") {
                    break;
                }
            }
            return targetString.substring(0, i + 1);
        };
        ToolSet.convertToHtmlColor = function (argb, hasAlpha) {
            if (hasAlpha === void 0) { hasAlpha = false; }
            var alpha;
            if (hasAlpha)
                alpha = (argb >> 24 & 0xFF).toString(16);
            else
                alpha = "";
            var red = (argb >> 16 & 0xFF).toString(16);
            var green = (argb >> 8 & 0xFF).toString(16);
            var blue = (argb & 0xFF).toString(16);
            if (alpha.length == 1)
                alpha = "0" + alpha;
            if (red.length == 1)
                red = "0" + red;
            if (green.length == 1)
                green = "0" + green;
            if (blue.length == 1)
                blue = "0" + blue;
            return "#" + alpha + red + green + blue;
        };
        ToolSet.convertFromHtmlColor = function (str, hasAlpha) {
            if (hasAlpha === void 0) { hasAlpha = false; }
            if (str.length < 1)
                return 0;
            if (str.charAt(0) == "#")
                str = str.substr(1);
            if (str.length == 8)
                return (parseInt(str.substr(0, 2), 16) << 24) + parseInt(str.substr(2), 16);
            else if (hasAlpha)
                return 0xFF000000 + parseInt(str, 16);
            else
                return parseInt(str, 16);
        };
        ToolSet.isUIObject = function (obj) {
            return (obj instanceof fairygui.UIImage)
                || (obj instanceof fairygui.UIMovieClip)
                || (obj instanceof fairygui.UISprite)
                || (obj instanceof fairygui.UIContainer)
                || (obj instanceof fairygui.UITextField);
        };
        ToolSet.displayObjectToGObject = function (obj) {
            while (obj != null && !(obj instanceof egret.Stage)) {
                if (ToolSet.isUIObject(obj))
                    return obj.owner;
                obj = obj.parent;
            }
            return null;
        };
        ToolSet.findChildNode = function (xml, name) {
            var col = xml.children;
            if (col) {
                var length1 = col.length;
                for (var i1 = 0; i1 < length1; i1++) {
                    var cxml = col[i1];
                    if (cxml.name == name) {
                        return cxml;
                    }
                }
            }
            return null;
        };
        ToolSet.encodeHTML = function (str) {
            if (!str)
                return "";
            else
                return str.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("'", "&apos;");
        };
        ToolSet.parseUBB = function (text) {
            return ToolSet.defaultUBBParser.parse(text);
        };
        ToolSet.defaultUBBParser = new fairygui.UBBParser();
        return ToolSet;
    })();
    fairygui.ToolSet = ToolSet;
    egret.registerClass(ToolSet,'fairygui.ToolSet');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var UIObjectFactory = (function () {
        function UIObjectFactory() {
        }
        var d = __define,c=UIObjectFactory,p=c.prototype;
        UIObjectFactory.setPackageItemExtension = function (url, type) {
            UIObjectFactory.packageItemExtensions[url.substring(5)] = type;
        };
        UIObjectFactory.setLoaderExtension = function (type) {
            UIObjectFactory.loaderExtension = type;
        };
        UIObjectFactory.newObject = function (pi) {
            switch (pi.type) {
                case fairygui.PackageItemType.Image:
                    return new fairygui.GImage();
                case fairygui.PackageItemType.MovieClip:
                    return new fairygui.GMovieClip();
                case fairygui.PackageItemType.Swf:
                    return new fairygui.GSwfObject();
                case fairygui.PackageItemType.Component:
                    {
                        var cls = UIObjectFactory.packageItemExtensions[pi.owner.id + pi.id];
                        if (cls)
                            return new cls();
                        var xml = pi.owner.getItemAsset(pi);
                        var extention = xml.attributes.extention;
                        if (extention != null) {
                            switch (extention) {
                                case "Button":
                                    return new fairygui.GButton();
                                case "Label":
                                    return new fairygui.GLabel();
                                case "ProgressBar":
                                    return new fairygui.GProgressBar();
                                case "Slider":
                                    return new fairygui.GSlider();
                                case "ScrollBar":
                                    return new fairygui.GScrollBar();
                                case "ComboBox":
                                    return new fairygui.GComboBox();
                                default:
                                    return new fairygui.GComponent();
                            }
                        }
                        else
                            return new fairygui.GComponent();
                    }
            }
            return null;
        };
        UIObjectFactory.newObject2 = function (type) {
            switch (type) {
                case "image":
                    return new fairygui.GImage();
                case "movieclip":
                    return new fairygui.GMovieClip();
                case "swf":
                    return new fairygui.GSwfObject();
                case "component":
                    return new fairygui.GComponent();
                case "text":
                    return new fairygui.GTextField();
                case "richtext":
                    return new fairygui.GRichTextField();
                case "group":
                    return new fairygui.GGroup();
                case "list":
                    return new fairygui.GList();
                case "graph":
                    return new fairygui.GGraph();
                case "loader":
                    if (UIObjectFactory.loaderExtension != null)
                        return new UIObjectFactory.loaderExtension();
                    else
                        return new fairygui.GLoader();
            }
            return null;
        };
        UIObjectFactory.packageItemExtensions = {};
        return UIObjectFactory;
    })();
    fairygui.UIObjectFactory = UIObjectFactory;
    egret.registerClass(UIObjectFactory,'fairygui.UIObjectFactory');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var UIPackage = (function () {
        function UIPackage() {
            this._items = new Array();
            this._sprites = {};
        }
        var d = __define,c=UIPackage,p=c.prototype;
        UIPackage.getById = function (id) {
            return UIPackage._packageInstById[id];
        };
        UIPackage.getByName = function (name) {
            return UIPackage._packageInstByName[name];
        };
        UIPackage.addPackage = function (resKey) {
            var pkg = new UIPackage();
            pkg.create(resKey);
            UIPackage._packageInstById[pkg.id] = pkg;
            UIPackage._packageInstByName[pkg.name] = pkg;
            pkg.customId = resKey;
            return pkg;
        };
        UIPackage.removePackage = function (packageId) {
            var pkg = UIPackage._packageInstById[packageId];
            pkg.dispose();
            delete UIPackage._packageInstById[pkg.id];
            if (pkg._customId != null)
                delete UIPackage._packageInstById[pkg._customId];
            delete UIPackage._packageInstByName[pkg.name];
        };
        UIPackage.createObject = function (pkgName, resName, userClass) {
            if (userClass === void 0) { userClass = null; }
            var pkg = UIPackage.getByName(pkgName);
            if (pkg)
                return pkg.createObject(resName, userClass);
            else
                return null;
        };
        UIPackage.createObjectFromURL = function (url, userClass) {
            if (userClass === void 0) { userClass = null; }
            var pi = UIPackage.getItemByURL(url);
            if (pi)
                return pi.owner.createObject2(pi, userClass);
            else
                return null;
        };
        UIPackage.getItemURL = function (pkgName, resName) {
            var pkg = UIPackage.getByName(pkgName);
            if (!pkg)
                return null;
            var pi = pkg._itemsByName[resName];
            if (!pi)
                return null;
            return "ui://" + pkg.id + pi.id;
        };
        UIPackage.getItemByURL = function (url) {
            if (fairygui.ToolSet.startsWith(url, "ui://")) {
                var pkgId = url.substr(5, 8);
                var srcId = url.substr(13);
                var pkg = UIPackage.getById(pkgId);
                if (pkg)
                    return pkg.getItem(srcId);
            }
            return null;
        };
        UIPackage.getBitmapFontByURL = function (url) {
            return UIPackage._bitmapFonts[url];
        };
        p.create = function (resKey) {
            this._resKey = resKey;
            this.loadPackage();
        };
        p.loadPackage = function () {
            var str;
            var arr;
            this.decompressPackage(RES.getRes(this._resKey));
            str = this.getDesc("sprites.bytes");
            arr = str.split(UIPackage.sep1);
            var cnt = arr.length;
            for (var i = 1; i < cnt; i++) {
                str = arr[i];
                if (!str)
                    continue;
                var arr2 = str.split(UIPackage.sep2);
                var sprite = new AtlasSprite();
                var itemId = arr2[0];
                var binIndex = parseInt(arr2[1]);
                if (binIndex >= 0)
                    sprite.atlas = "atlas" + binIndex;
                else {
                    var pos = itemId.indexOf("_");
                    if (pos == -1)
                        sprite.atlas = "atlas_" + itemId;
                    else
                        sprite.atlas = "atlas_" + itemId.substr(0, pos);
                }
                sprite.rect.x = parseInt(arr2[2]);
                sprite.rect.y = parseInt(arr2[3]);
                sprite.rect.width = parseInt(arr2[4]);
                sprite.rect.height = parseInt(arr2[5]);
                sprite.rotated = arr2[6] == "1";
                this._sprites[itemId] = sprite;
            }
            str = this.getDesc("package.xml");
            var xml = egret.XML.parse(str);
            this._id = xml.attributes.id;
            this._name = xml.attributes.name;
            var resources = xml.children[0].children;
            this._itemsById = {};
            this._itemsByName = {};
            var pi;
            var cxml;
            var length1 = resources.length;
            for (var i1 = 0; i1 < length1; i1++) {
                cxml = resources[i1];
                pi = new fairygui.PackageItem();
                pi.type = fairygui.parsePackageItemType(cxml.name);
                pi.id = cxml.attributes.id;
                pi.name = cxml.attributes.name;
                pi.file = cxml.attributes.file;
                str = cxml.attributes.size;
                if (str) {
                    arr = str.split(UIPackage.sep0);
                    pi.width = parseInt(arr[0]);
                    pi.height = parseInt(arr[1]);
                }
                switch (pi.type) {
                    case fairygui.PackageItemType.Image: {
                        str = cxml.attributes.scale;
                        if (str == "9grid") {
                            pi.scale9Grid = new egret.Rectangle();
                            str = cxml.attributes.scale9grid;
                            if (str) {
                                arr = str.split(UIPackage.sep0);
                                pi.scale9Grid.x = parseInt(arr[0]);
                                pi.scale9Grid.y = parseInt(arr[1]);
                                pi.scale9Grid.width = parseInt(arr[2]);
                                pi.scale9Grid.height = parseInt(arr[3]);
                            }
                        }
                        else if (str == "tile") {
                            pi.scaleByTile = true;
                        }
                        str = cxml.attributes.smoothing;
                        pi.smoothing = str != "false";
                        break;
                    }
                }
                pi.owner = this;
                this._items.push(pi);
                this._itemsById[pi.id] = pi;
                if (pi.name != null)
                    this._itemsByName[pi.name] = pi;
            }
            cnt = this._items.length;
            for (i = 0; i < cnt; i++) {
                pi = this._items[i];
                if (pi.type == fairygui.PackageItemType.Font) {
                    this.loadFont(pi);
                    UIPackage._bitmapFonts[pi.bitmapFont.id] = pi.bitmapFont;
                }
            }
        };
        p.decompressPackage = function (buf) {
            this._resData = {};
            var inflater = new Zlib.RawInflate(buf);
            var data = inflater.decompress();
            var tmp = new egret.ByteArray();
            var source = tmp["decodeUTF8"](data); //ByteArray.decodeUTF8 is private @_@
            var curr = 0;
            var fn;
            var size;
            while (true) {
                var pos = source.indexOf("|", curr);
                if (pos == -1)
                    break;
                fn = source.substring(curr, pos);
                curr = pos + 1;
                pos = source.indexOf("|", curr);
                size = parseInt(source.substring(curr, pos));
                curr = pos + 1;
                this._resData[fn] = source.substr(curr, size);
                curr += size;
            }
        };
        p.dispose = function () {
            var cnt = this._items.length;
            for (var i = 0; i < cnt; i++) {
                var pi = this._items[i];
                var texture = pi.texture;
                if (texture != null)
                    texture.dispose();
                else if (pi.frames != null) {
                    var frameCount = pi.frames.length;
                    for (var j = 0; j < frameCount; j++) {
                        texture = pi.frames[j].texture;
                        if (texture != null)
                            texture.dispose();
                    }
                }
                else if (pi.bitmapFont != null) {
                    delete UIPackage._bitmapFonts[pi.bitmapFont.id];
                }
            }
        };
        d(p, "id"
            ,function () {
                return this._id;
            }
        );
        d(p, "name"
            ,function () {
                return this._name;
            }
        );
        d(p, "customId"
            ,function () {
                return this._customId;
            }
            ,function (value) {
                if (this._customId != null)
                    delete UIPackage._packageInstById[this._customId];
                this._customId = value;
                if (this._customId != null)
                    UIPackage._packageInstById[this._customId] = this;
            }
        );
        p.createObject = function (resName, userClass) {
            if (userClass === void 0) { userClass = null; }
            var pi = this._itemsByName[resName];
            if (pi)
                return this.createObject2(pi, userClass);
            else
                return null;
        };
        p.createObject2 = function (pi, userClass) {
            if (userClass === void 0) { userClass = null; }
            var g;
            if (pi.type == fairygui.PackageItemType.Component) {
                if (userClass != null)
                    g = new userClass();
                else
                    g = fairygui.UIObjectFactory.newObject(pi);
            }
            else
                g = fairygui.UIObjectFactory.newObject(pi);
            if (g == null)
                return null;
            UIPackage._constructing++;
            g.constructFromResource(pi);
            UIPackage._constructing--;
            return g;
        };
        p.getItem = function (itemId) {
            return this._itemsById[itemId];
        };
        p.getItemAssetByName = function (resName) {
            var pi = this._itemsByName[resName];
            if (pi == null) {
                throw "Resource not found -" + resName;
            }
            return this.getItemAsset(pi);
        };
        p.getItemAsset = function (item) {
            switch (item.type) {
                case fairygui.PackageItemType.Image:
                    if (!item.decoded) {
                        item.decoded = true;
                        var sprite = this._sprites[item.id];
                        if (sprite != null)
                            item.texture = this.createSpriteTexture(sprite);
                    }
                    return item.texture;
                case fairygui.PackageItemType.Atlas:
                    if (!item.decoded) {
                        item.decoded = true;
                        var fileName = (item.file != null && item.file.length > 0) ? item.file : (item.id + ".png");
                        item.texture = RES.getRes(this._resKey + "@" + fairygui.ToolSet.getFileName(fileName));
                    }
                    return item.texture;
                case fairygui.PackageItemType.Sound:
                    if (!item.decoded) {
                        item.decoded = true;
                        item.sound = RES.getRes(this._resKey + "@" + item.id);
                    }
                    return item.sound;
                case fairygui.PackageItemType.Font:
                    if (!item.decoded) {
                        item.decoded = true;
                        this.loadFont(item);
                    }
                    return item.bitmapFont;
                case fairygui.PackageItemType.MovieClip:
                    if (!item.decoded) {
                        item.decoded = true;
                        this.loadMovieClip(item);
                    }
                    return item.frames;
                case fairygui.PackageItemType.Component:
                    if (!item.decoded) {
                        item.decoded = true;
                        var str = this.getDesc(item.id + ".xml");
                        item.componentData = egret.XML.parse(str);
                    }
                    return item.componentData;
                default:
                    return RES.getRes(this._resKey + "@" + item.id);
            }
        };
        p.getDesc = function (fn) {
            return this._resData[fn];
        };
        p.createSpriteTexture = function (sprite) {
            var atlasItem = this._itemsById[sprite.atlas];
            if (atlasItem != null) {
                var atlasTexture = this.getItemAsset(atlasItem);
                if (atlasTexture == null)
                    return null;
                else
                    return this.createSubTexture(atlasTexture, sprite.rect);
            }
            else
                return null;
        };
        p.createSubTexture = function (atlasTexture, uvRect) {
            var texture = new egret.Texture();
            texture._bitmapData = atlasTexture._bitmapData;
            texture.$initData(atlasTexture._bitmapX + uvRect.x, atlasTexture._bitmapY + uvRect.y, uvRect.width, uvRect.height, 0, 0, uvRect.width, uvRect.height, atlasTexture._sourceWidth, atlasTexture._sourceHeight);
            return texture;
        };
        p.loadMovieClip = function (item) {
            var xml = egret.XML.parse(this.getDesc(item.id + ".xml"));
            item.pivot = new egret.Point();
            var str = xml.attributes.pivot;
            if (str) {
                var arr = str.split(UIPackage.sep0);
                item.pivot.x = parseInt(arr[0]);
                item.pivot.y = parseInt(arr[1]);
            }
            str = xml.attributes.interval;
            if (str != null)
                item.interval = parseInt(str);
            str = xml.attributes.swing;
            if (str != null)
                item.swing = str == "true";
            str = xml.attributes.repeatDelay;
            if (str != null)
                item.repeatDelay = parseInt(str);
            var frameCount = parseInt(xml.attributes.frameCount);
            item.frames = new Array(frameCount);
            var frameNodes = xml.children[0].children;
            for (var i = 0; i < frameCount; i++) {
                var frame = new fairygui.Frame();
                var frameNode = frameNodes[i];
                str = frameNode.attributes.rect;
                arr = str.split(UIPackage.sep0);
                frame.rect = new egret.Rectangle(parseInt(arr[0]), parseInt(arr[1]), parseInt(arr[2]), parseInt(arr[3]));
                str = frameNode.attributes.addDelay;
                if (str)
                    frame.addDelay = parseInt(str);
                item.frames[i] = frame;
                var sprite = this._sprites[item.id + "_" + i];
                if (sprite != null) {
                    frame.texture = this.createSpriteTexture(sprite);
                }
            }
        };
        p.loadFont = function (item) {
            var font = new fairygui.BitmapFont();
            font.id = "ui://" + this.id + item.id;
            var str = this.getDesc(item.id + ".fnt");
            var lines = str.split(UIPackage.sep1);
            var lineCount = lines.length;
            var i = 0;
            var kv = {};
            var ttf = false;
            var size = 0;
            var xadvance = 0;
            var resizable = false;
            var atlasOffsetX = 0, atlasOffsetY = 0;
            var charImg;
            var mainTexture;
            for (i = 0; i < lineCount; i++) {
                str = lines[i];
                if (str.length == 0)
                    continue;
                str = fairygui.ToolSet.trim(str);
                var arr = str.split(UIPackage.sep2);
                for (var j = 1; j < arr.length; j++) {
                    var arr2 = arr[j].split(UIPackage.sep3);
                    kv[arr2[0]] = arr2[1];
                }
                str = arr[0];
                if (str == "char") {
                    var bg = new fairygui.BMGlyph();
                    bg.x = isNaN(kv.x) ? 0 : parseInt(kv.x);
                    bg.y = isNaN(kv.y) ? 0 : parseInt(kv.y);
                    bg.offsetX = isNaN(kv.xoffset) ? 0 : parseInt(kv.xoffset);
                    bg.offsetY = isNaN(kv.yoffset) ? 0 : parseInt(kv.yoffset);
                    bg.width = isNaN(kv.width) ? 0 : parseInt(kv.width);
                    bg.height = isNaN(kv.height) ? 0 : parseInt(kv.height);
                    bg.advance = isNaN(kv.xadvance) ? 0 : parseInt(kv.xadvance);
                    if (kv.chnl != undefined) {
                        bg.channel = parseInt(kv.chnl);
                        if (bg.channel == 15)
                            bg.channel = 4;
                        else if (bg.channel == 1)
                            bg.channel = 3;
                        else if (bg.channel == 2)
                            bg.channel = 2;
                        else
                            bg.channel = 1;
                    }
                    if (!ttf) {
                        if (kv.img) {
                            charImg = this._itemsById[kv.img];
                            if (charImg != null) {
                                charImg.load();
                                bg.width = charImg.width;
                                bg.height = charImg.height;
                                bg.texture = charImg.texture;
                            }
                        }
                    }
                    else if (mainTexture != null) {
                        bg.texture = this.createSubTexture(mainTexture, new egret.Rectangle(bg.x + atlasOffsetX, bg.y + atlasOffsetY, bg.width, bg.height));
                    }
                    if (ttf)
                        bg.lineHeight = size;
                    else {
                        if (bg.advance == 0) {
                            if (xadvance == 0)
                                bg.advance = bg.offsetX + bg.width;
                            else
                                bg.advance = xadvance;
                        }
                        bg.lineHeight = bg.offsetY < 0 ? bg.height : (bg.offsetY + bg.height);
                        if (bg.lineHeight < size)
                            bg.lineHeight = size;
                    }
                    font.glyphs[String.fromCharCode(kv.id)] = bg;
                }
                else if (str == "info") {
                    ttf = kv.face != null;
                    if (!isNaN(kv.size))
                        size = parseInt(kv.size);
                    resizable = kv.resizable == "true";
                    if (ttf) {
                        var sprite = this._sprites[item.id];
                        if (sprite != null) {
                            atlasOffsetX = sprite.rect.x;
                            atlasOffsetY = sprite.rect.y;
                            var atlasItem = this._itemsById[sprite.atlas];
                            if (atlasItem != null)
                                mainTexture = this.getItemAsset(atlasItem);
                        }
                    }
                }
                else if (str == "common") {
                    if (size == 0 && !isNaN(kv.lineHeight))
                        size = parseInt(kv.lineHeight);
                    if (!isNaN(kv.xadvance))
                        xadvance = parseInt(kv.xadvance);
                }
            }
            if (size == 0 && bg)
                size = bg.height;
            font.ttf = ttf;
            font.size = size;
            font.resizable = resizable;
            item.bitmapFont = font;
        };
        //internal
        UIPackage._constructing = 0;
        UIPackage._packageInstById = {};
        UIPackage._packageInstByName = {};
        UIPackage._bitmapFonts = {};
        UIPackage.sep0 = ",";
        UIPackage.sep1 = "\n";
        UIPackage.sep2 = " ";
        UIPackage.sep3 = "=";
        return UIPackage;
    })();
    fairygui.UIPackage = UIPackage;
    egret.registerClass(UIPackage,'fairygui.UIPackage');
    var AtlasSprite = (function () {
        function AtlasSprite() {
            this.rect = new egret.Rectangle();
        }
        var d = __define,c=AtlasSprite,p=c.prototype;
        return AtlasSprite;
    })();
    egret.registerClass(AtlasSprite,'AtlasSprite');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var Window = (function (_super) {
        __extends(Window, _super);
        function Window() {
            _super.call(this);
            this._requestingCmd = 0;
            this.focusable = true;
            this._uiSources = new Array();
            this.displayObject.addEventListener(egret.Event.ADDED_TO_STAGE, this.__onShown, this);
            this.displayObject.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.__onHidden, this);
            this.displayObject.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__mouseDown, this, true);
        }
        var d = __define,c=Window,p=c.prototype;
        p.addUISource = function (source) {
            this._uiSources.push(source);
        };
        d(p, "contentPane"
            ,function () {
                return this._contentPane;
            }
            ,function (val) {
                if (this._contentPane != val) {
                    if (this._contentPane != null)
                        this.removeChild(this._contentPane);
                    this._contentPane = val;
                    if (this._contentPane != null) {
                        this.addChild(this._contentPane);
                        this.setSize(this._contentPane.width, this._contentPane.height);
                        this._contentPane.addRelation(this, fairygui.RelationType.Size);
                        this._frame = (this._contentPane.getChild("frame"));
                        if (this._frame != null) {
                            this.closeButton = this._frame.getChild("closeButton");
                            this.dragArea = this._frame.getChild("dragArea");
                            this.contentArea = this._frame.getChild("contentArea");
                        }
                    }
                }
            }
        );
        d(p, "frame"
            ,function () {
                return this._frame;
            }
        );
        d(p, "closeButton"
            ,function () {
                return this._closeButton;
            }
            ,function (value) {
                if (this._closeButton != null)
                    this._closeButton.removeClickListener(this.closeEventHandler, this);
                this._closeButton = value;
                if (this._closeButton != null)
                    this._closeButton.addClickListener(this.closeEventHandler, this);
            }
        );
        d(p, "dragArea"
            ,function () {
                return this._dragArea;
            }
            ,function (value) {
                if (this._dragArea != value) {
                    if (this._dragArea != null) {
                        this._dragArea.draggable = false;
                        this._dragArea.removeEventListener(fairygui.DragEvent.DRAG_START, this.__dragStart, this);
                    }
                    this._dragArea = value;
                    if (this._dragArea != null) {
                        if ((this._dragArea instanceof fairygui.GGraph) && (this._dragArea).displayObject == null)
                            this._dragArea.asGraph.drawRect(0, 0, 0, 0, 0);
                        this._dragArea.draggable = true;
                        this._dragArea.addEventListener(fairygui.DragEvent.DRAG_START, this.__dragStart, this);
                    }
                }
            }
        );
        d(p, "contentArea"
            ,function () {
                return this._contentArea;
            }
            ,function (value) {
                this._contentArea = value;
            }
        );
        p.show = function () {
            fairygui.GRoot.inst.showWindow(this);
        };
        p.showOn = function (root) {
            root.showWindow(this);
        };
        p.hide = function () {
            if (this.isShowing)
                this.doHideAnimation();
        };
        p.hideImmediately = function () {
            var r = (this.parent instanceof fairygui.GRoot) ? (this.parent) : null;
            if (!r)
                r = fairygui.GRoot.inst;
            r.hideWindowImmediately(this);
        };
        p.center = function (restraint) {
            if (restraint === void 0) { restraint = false; }
            var r = this.root;
            if (!r)
                r = fairygui.GRoot.inst;
            this.centerOn(r, restraint);
        };
        p.centerOn = function (r, restraint) {
            if (restraint === void 0) { restraint = false; }
            this.setXY(Math.round((r.width - this.width) / 2), Math.round((r.height - this.height) / 2));
            if (restraint) {
                this.addRelation(r, fairygui.RelationType.Center_Center);
                this.addRelation(r, fairygui.RelationType.Middle_Middle);
            }
        };
        p.toggleStatus = function () {
            if (this.isTop)
                this.hide();
            else
                this.show();
        };
        d(p, "isShowing"
            ,function () {
                return this.parent != null;
            }
        );
        d(p, "isTop"
            ,function () {
                return this.parent != null && this.parent.getChildIndex(this) == this.parent.numChildren - 1;
            }
        );
        d(p, "modal"
            ,function () {
                return this._modal;
            }
            ,function (val) {
                this._modal = val;
            }
        );
        p.bringToFront = function () {
            var r = this.root;
            if (!r)
                r = fairygui.GRoot.inst;
            r.showWindow(this);
        };
        p.showModalWait = function (requestingCmd) {
            if (requestingCmd === void 0) { requestingCmd = 0; }
            if (requestingCmd != 0)
                this._requestingCmd = requestingCmd;
            if (fairygui.UIConfig.windowModalWaiting) {
                if (!this._modalWaitPane)
                    this._modalWaitPane = fairygui.UIPackage.createObjectFromURL(fairygui.UIConfig.windowModalWaiting);
                this.layoutModalWaitPane();
                this.addChild(this._modalWaitPane);
            }
        };
        p.layoutModalWaitPane = function () {
            if (this._contentArea != null) {
                var pt = this._frame.localToGlobal();
                pt = this.globalToLocal(pt.x, pt.y, pt);
                this._modalWaitPane.setXY(pt.x + this._contentArea.x, pt.y + this._contentArea.y);
                this._modalWaitPane.setSize(this._contentArea.width, this._contentArea.height);
            }
            else
                this._modalWaitPane.setSize(this.width, this.height);
        };
        p.closeModalWait = function (requestingCmd) {
            if (requestingCmd === void 0) { requestingCmd = 0; }
            if (requestingCmd != 0) {
                if (this._requestingCmd != requestingCmd)
                    return false;
            }
            this._requestingCmd = 0;
            if (this._modalWaitPane && this._modalWaitPane.parent != null)
                this.removeChild(this._modalWaitPane);
            return true;
        };
        d(p, "modalWaiting"
            ,function () {
                return this._modalWaitPane && this._modalWaitPane.parent != null;
            }
        );
        p.init = function () {
            if (this._inited || this._loading)
                return;
            if (this._uiSources.length > 0) {
                this._loading = false;
                var cnt = this._uiSources.length;
                for (var i = 0; i < cnt; i++) {
                    var lib = this._uiSources[i];
                    if (!lib.loaded) {
                        lib.load(this.__uiLoadComplete, this);
                        this._loading = true;
                    }
                }
                if (!this._loading)
                    this._init();
            }
            else
                this._init();
        };
        p.onInit = function () {
        };
        p.onShown = function () {
        };
        p.onHide = function () {
        };
        p.doShowAnimation = function () {
            this.onShown();
        };
        p.doHideAnimation = function () {
            this.hideImmediately();
        };
        p.__uiLoadComplete = function () {
            var cnt = this._uiSources.length;
            for (var i = 0; i < cnt; i++) {
                var lib = this._uiSources[i];
                if (!lib.loaded)
                    return;
            }
            this._loading = false;
            this._init();
        };
        p._init = function () {
            this._inited = true;
            this.onInit();
            if (this.isShowing)
                this.doShowAnimation();
        };
        p.dispose = function () {
            this.displayObject.removeEventListener(egret.Event.ADDED_TO_STAGE, this.__onShown, this);
            this.displayObject.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.__onHidden, this);
            if (this.parent != null)
                this.hideImmediately();
            _super.prototype.dispose.call(this);
        };
        p.closeEventHandler = function (evt) {
            this.hide();
        };
        p.__onShown = function (evt) {
            if (!this._inited)
                this.init();
            else
                this.doShowAnimation();
        };
        p.__onHidden = function (evt) {
            this.closeModalWait();
            this.onHide();
        };
        p.__mouseDown = function (evt) {
            if (this.isShowing) {
                var r = this.root;
                if (r)
                    r.showWindow(this);
            }
        };
        p.__dragStart = function (evt) {
            evt.preventDefault();
            this.startDrag(evt.touchPointID);
        };
        return Window;
    })(fairygui.GComponent);
    fairygui.Window = Window;
    egret.registerClass(Window,'fairygui.Window');
})(fairygui || (fairygui = {}));

var fairygui;
(function (fairygui) {
    var DragDropManager = (function () {
        function DragDropManager() {
            this._agent = new fairygui.GLoader();
            this._agent.draggable = true;
            this._agent.touchable = false; //important
            this._agent.setSize(100, 100);
            this._agent.sortingOrder = 1000000;
            this._agent.addEventListener(fairygui.DragEvent.DRAG_END, this.__dragEnd, this);
        }
        var d = __define,c=DragDropManager,p=c.prototype;
        d(DragDropManager, "inst"
            ,function () {
                if (DragDropManager._inst == null)
                    DragDropManager._inst = new DragDropManager();
                return DragDropManager._inst;
            }
        );
        d(p, "dragAgent"
            ,function () {
                return this._agent;
            }
        );
        d(p, "dragging"
            ,function () {
                return this._agent.parent != null;
            }
        );
        p.startDrag = function (source, icon, sourceData, touchPointID) {
            if (touchPointID === void 0) { touchPointID = -1; }
            if (this._agent.parent != null)
                return;
            this._sourceData = sourceData;
            this._agent.url = icon;
            fairygui.GRoot.inst.addChild(this._agent);
            var pt = source.localToRoot();
            this._agent.setXY(pt.x, pt.y);
            this._agent.startDrag(touchPointID);
        };
        p.cancel = function () {
            if (this._agent.parent != null) {
                this._agent.stopDrag();
                fairygui.GRoot.inst.removeChild(this._agent);
                this._sourceData = null;
            }
        };
        p.__dragEnd = function (evt) {
            if (this._agent.parent == null)
                return;
            fairygui.GRoot.inst.removeChild(this._agent);
            var sourceData = this._sourceData;
            this._sourceData = null;
            var obj = fairygui.GRoot.inst.getObjectUnderPoint(evt.stageX, evt.stageY);
            while (obj != null) {
                if (obj.hasEventListener(fairygui.DropEvent.DROP)) {
                    var dropEvt = new fairygui.DropEvent(fairygui.DropEvent.DROP, sourceData);
                    obj.requestFocus();
                    obj.dispatchEvent(dropEvt);
                    return;
                }
                obj = obj.parent;
            }
        };
        return DragDropManager;
    })();
    fairygui.DragDropManager = DragDropManager;
    egret.registerClass(DragDropManager,'fairygui.DragDropManager');
})(fairygui || (fairygui = {}));

