var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
var fairygui;
(function (fairygui) {
    var GObject = (function (_super) {
        __extends(GObject, _super);
        function GObject() {
            var _this = _super.call(this) || this;
            _this._x = 0;
            _this._y = 0;
            _this._alpha = 1;
            _this._rotation = 0;
            _this._visible = true;
            _this._touchable = true;
            _this._grayed = false;
            _this._draggable = false;
            _this._scaleX = 1;
            _this._scaleY = 1;
            _this._skewX = 0;
            _this._skewY = 0;
            _this._pivotX = 0;
            _this._pivotY = 0;
            _this._pivotAsAnchor = false;
            _this._pivotOffsetX = 0;
            _this._pivotOffsetY = 0;
            _this._sortingOrder = 0;
            _this._internalVisible = true;
            _this._handlingController = false;
            _this._focusable = false;
            _this._pixelSnapping = false;
            _this.sourceWidth = 0;
            _this.sourceHeight = 0;
            _this.initWidth = 0;
            _this.initHeight = 0;
            _this.minWidth = 0;
            _this.minHeight = 0;
            _this.maxWidth = 0;
            _this.maxHeight = 0;
            _this._width = 0;
            _this._height = 0;
            _this._rawWidth = 0;
            _this._rawHeight = 0;
            _this._yOffset = 0;
            _this._sizePercentInGroup = 0;
            //Size的实现方式，有两种，0-GObject的w/h等于DisplayObject的w/h。1-GObject的sourceWidth/sourceHeight等于DisplayObject的w/h，剩余部分由scale实现
            _this._sizeImplType = 0;
            _this._id = "" + GObject._gInstanceCounter++;
            _this._name = "";
            _this.createDisplayObject();
            _this._relations = new fairygui.Relations(_this);
            _this._gears = [];
            return _this;
        }
        Object.defineProperty(GObject.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "name", {
            get: function () {
                return this._name;
            },
            set: function (value) {
                this._name = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this.setXY(value, this._y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                this.setXY(this._x, value);
            },
            enumerable: true,
            configurable: true
        });
        GObject.prototype.setXY = function (xv, yv) {
            if (this._x != xv || this._y != yv) {
                var dx = xv - this._x;
                var dy = yv - this._y;
                this._x = xv;
                this._y = yv;
                this.handleXYChanged();
                if (this instanceof fairygui.GGroup)
                    this.moveChildren(dx, dy);
                this.updateGear(1);
                if (this._parent && !(this._parent instanceof fairygui.GList)) {
                    this._parent.setBoundsChangedFlag();
                    if (this._group != null)
                        this._group.setBoundsChangedFlag();
                    this.dispatchEventWith(GObject.XY_CHANGED);
                }
                if (GObject.draggingObject == this && !GObject.sUpdateInDragging)
                    this.localToGlobalRect(0, 0, this.width, this.height, GObject.sGlobalRect);
            }
        };
        Object.defineProperty(GObject.prototype, "xMin", {
            get: function () {
                return this._pivotAsAnchor ? (this._x - this._width * this._pivotX) : this._x;
            },
            set: function (value) {
                if (this._pivotAsAnchor)
                    this.setXY(value + this._width * this._pivotX, this._y);
                else
                    this.setXY(value, this._y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "yMin", {
            get: function () {
                return this._pivotAsAnchor ? (this._y - this._height * this._pivotY) : this._y;
            },
            set: function (value) {
                if (this._pivotAsAnchor)
                    this.setXY(this._x, value + this._height * this._pivotY);
                else
                    this.setXY(this._x, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "pixelSnapping", {
            get: function () {
                return this._pixelSnapping;
            },
            set: function (value) {
                if (this._pixelSnapping != value) {
                    this._pixelSnapping = value;
                    this.handleXYChanged();
                }
            },
            enumerable: true,
            configurable: true
        });
        GObject.prototype.center = function (restraint) {
            if (restraint === void 0) { restraint = false; }
            var r;
            if (this._parent != null)
                r = this.parent;
            else
                r = this.root;
            this.setXY((r.width - this.width) / 2, (r.height - this.height) / 2);
            if (restraint) {
                this.addRelation(r, fairygui.RelationType.Center_Center);
                this.addRelation(r, fairygui.RelationType.Middle_Middle);
            }
        };
        Object.defineProperty(GObject.prototype, "width", {
            get: function () {
                this.ensureSizeCorrect();
                if (this._relations.sizeDirty)
                    this._relations.ensureRelationsSizeCorrect();
                return this._width;
            },
            set: function (value) {
                this.setSize(value, this._rawHeight);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "height", {
            get: function () {
                this.ensureSizeCorrect();
                if (this._relations.sizeDirty)
                    this._relations.ensureRelationsSizeCorrect();
                return this._height;
            },
            set: function (value) {
                this.setSize(this._rawWidth, value);
            },
            enumerable: true,
            configurable: true
        });
        GObject.prototype.setSize = function (wv, hv, ignorePivot) {
            if (ignorePivot === void 0) { ignorePivot = false; }
            if (this._rawWidth != wv || this._rawHeight != hv) {
                this._rawWidth = wv;
                this._rawHeight = hv;
                if (wv < this.minWidth)
                    wv = this.minWidth;
                if (hv < this.minHeight)
                    hv = this.minHeight;
                if (this.maxWidth > 0 && wv > this.maxWidth)
                    wv = this.maxWidth;
                if (this.maxHeight > 0 && hv > this.maxHeight)
                    hv = this.maxHeight;
                var dWidth = wv - this._width;
                var dHeight = hv - this._height;
                this._width = wv;
                this._height = hv;
                this.handleSizeChanged();
                if (this._pivotX != 0 || this._pivotY != 0) {
                    if (!this._pivotAsAnchor) {
                        if (!ignorePivot)
                            this.setXY(this.x - this._pivotX * dWidth, this.y - this._pivotY * dHeight);
                        this.updatePivotOffset();
                    }
                    else {
                        this.applyPivot();
                    }
                }
                if (this instanceof fairygui.GGroup)
                    this.resizeChildren(dWidth, dHeight);
                this.updateGear(2);
                if (this._parent) {
                    this._relations.onOwnerSizeChanged(dWidth, dHeight, this._pivotAsAnchor || !ignorePivot);
                    this._parent.setBoundsChangedFlag();
                    if (this._group != null)
                        this._group.setBoundsChangedFlag(true);
                }
                this.dispatchEventWith(GObject.SIZE_CHANGED);
            }
        };
        GObject.prototype.ensureSizeCorrect = function () {
        };
        Object.defineProperty(GObject.prototype, "actualWidth", {
            get: function () {
                return this.width * Math.abs(this._scaleX);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "actualHeight", {
            get: function () {
                return this.height * Math.abs(this._scaleY);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "scaleX", {
            get: function () {
                return this._scaleX;
            },
            set: function (value) {
                this.setScale(value, this._scaleY);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "scaleY", {
            get: function () {
                return this._scaleY;
            },
            set: function (value) {
                this.setScale(this._scaleX, value);
            },
            enumerable: true,
            configurable: true
        });
        GObject.prototype.setScale = function (sx, sy) {
            if (this._scaleX != sx || this._scaleY != sy) {
                this._scaleX = sx;
                this._scaleY = sy;
                this.handleScaleChanged();
                this.applyPivot();
                this.updateGear(2);
            }
        };
        Object.defineProperty(GObject.prototype, "skewX", {
            get: function () {
                return this._skewX;
            },
            set: function (value) {
                this.setSkew(value, this._skewY);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "skewY", {
            get: function () {
                return this._skewY;
            },
            set: function (value) {
                this.setSkew(this._skewX, value);
            },
            enumerable: true,
            configurable: true
        });
        GObject.prototype.setSkew = function (xv, yv) {
            if (this._skewX != xv || this._skewY != yv) {
                this._skewX = xv;
                this._skewY = yv;
                if (this._displayObject != null) {
                    this._displayObject.skewX = xv;
                    this._displayObject.skewY = yv;
                }
                this.applyPivot();
            }
        };
        Object.defineProperty(GObject.prototype, "pivotX", {
            get: function () {
                return this._pivotX;
            },
            set: function (value) {
                this.setPivot(value, this._pivotY);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "pivotY", {
            get: function () {
                return this._pivotY;
            },
            set: function (value) {
                this.setPivot(this._pivotX, value);
            },
            enumerable: true,
            configurable: true
        });
        GObject.prototype.setPivot = function (xv, yv, asAnchor) {
            if (yv === void 0) { yv = 0; }
            if (asAnchor === void 0) { asAnchor = false; }
            if (this._pivotX != xv || this._pivotY != yv || this._pivotAsAnchor != asAnchor) {
                this._pivotX = xv;
                this._pivotY = yv;
                this._pivotAsAnchor = asAnchor;
                this.updatePivotOffset();
                this.handleXYChanged();
            }
        };
        Object.defineProperty(GObject.prototype, "pivotAsAnchor", {
            get: function () {
                return this._pivotAsAnchor;
            },
            enumerable: true,
            configurable: true
        });
        GObject.prototype.internalSetPivot = function (xv, yv, asAnchor) {
            if (yv === void 0) { yv = 0; }
            this._pivotX = xv;
            this._pivotY = yv;
            this._pivotAsAnchor = asAnchor;
            if (asAnchor)
                this.handleXYChanged();
        };
        GObject.prototype.updatePivotOffset = function () {
            if (this._displayObject != null) {
                if (this._pivotX != 0 || this._pivotY != 0) {
                    var px;
                    var py;
                    if (this._sizeImplType == 0) {
                        px = this._pivotX * this._width;
                        py = this._pivotY * this._height;
                    }
                    else {
                        px = this._pivotX * this.sourceWidth;
                        py = this._pivotY * this.sourceHeight;
                    }
                    var pt = this._displayObject.matrix.transformPoint(px, py, GObject.sHelperPoint);
                    this._pivotOffsetX = this._pivotX * this._width - (pt.x - this._displayObject.x);
                    this._pivotOffsetY = this._pivotY * this._height - (pt.y - this._displayObject.y);
                }
                else {
                    this._pivotOffsetX = 0;
                    this._pivotOffsetY = 0;
                }
            }
        };
        GObject.prototype.applyPivot = function () {
            if (this._pivotX != 0 || this._pivotY != 0) {
                this.updatePivotOffset();
                this.handleXYChanged();
            }
        };
        Object.defineProperty(GObject.prototype, "touchable", {
            get: function () {
                return this._touchable;
            },
            set: function (value) {
                if (this._touchable != value) {
                    this._touchable = value;
                    this.updateGear(3);
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
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "grayed", {
            get: function () {
                return this._grayed;
            },
            set: function (value) {
                if (this._grayed != value) {
                    this._grayed = value;
                    this.handleGrayedChanged();
                    this.updateGear(3);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "enabled", {
            get: function () {
                return !this._grayed && this._touchable;
            },
            set: function (value) {
                this.grayed = !value;
                this.touchable = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "rotation", {
            get: function () {
                return this._rotation;
            },
            set: function (value) {
                if (this._rotation != value) {
                    this._rotation = value;
                    if (this._displayObject)
                        this._displayObject.rotation = this.normalizeRotation;
                    this.applyPivot();
                    this.updateGear(3);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "normalizeRotation", {
            get: function () {
                var rot = this._rotation % 360;
                if (rot > 180)
                    rot -= 360;
                else if (rot < -180)
                    rot += 360;
                return rot;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "alpha", {
            get: function () {
                return this._alpha;
            },
            set: function (value) {
                if (this._alpha != value) {
                    this._alpha = value;
                    this.handleAlphaChanged();
                    this.updateGear(3);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "visible", {
            get: function () {
                return this._visible;
            },
            set: function (value) {
                if (this._visible != value) {
                    this._visible = value;
                    this.handleVisibleChanged();
                    if (this._parent)
                        this._parent.setBoundsChangedFlag();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "internalVisible", {
            get: function () {
                return this._internalVisible && (!this._group || this._group.internalVisible);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "internalVisible2", {
            get: function () {
                return this._visible && (!this._group || this._group.internalVisible2);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "sortingOrder", {
            get: function () {
                return this._sortingOrder;
            },
            set: function (value) {
                if (value < 0)
                    value = 0;
                if (this._sortingOrder != value) {
                    var old = this._sortingOrder;
                    this._sortingOrder = value;
                    if (this._parent != null)
                        this._parent.childSortingOrderChanged(this, old, this._sortingOrder);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "focusable", {
            get: function () {
                return this._focusable;
            },
            set: function (value) {
                this._focusable = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "focused", {
            get: function () {
                return this.root.focus == this;
            },
            enumerable: true,
            configurable: true
        });
        GObject.prototype.requestFocus = function () {
            var p = this;
            while (p && !p._focusable)
                p = p.parent;
            if (p != null)
                this.root.focus = p;
        };
        Object.defineProperty(GObject.prototype, "tooltips", {
            get: function () {
                return this._tooltips;
            },
            set: function (value) {
                this._tooltips = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "blendMode", {
            get: function () {
                return this._displayObject.blendMode;
            },
            set: function (value) {
                this._displayObject.blendMode = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "filters", {
            get: function () {
                return this._displayObject.filters;
            },
            set: function (value) {
                this._displayObject.filters = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "inContainer", {
            get: function () {
                return this._displayObject != null && this._displayObject.parent != null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "onStage", {
            get: function () {
                return this._displayObject != null && this._displayObject.stage != null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "resourceURL", {
            get: function () {
                if (this.packageItem != null)
                    return "ui://" + this.packageItem.owner.id + this.packageItem.id;
                else
                    return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "group", {
            get: function () {
                return this._group;
            },
            set: function (value) {
                if (this._group != value) {
                    if (this._group != null)
                        this._group.setBoundsChangedFlag(true);
                    this._group = value;
                    if (this._group != null)
                        this._group.setBoundsChangedFlag(true);
                }
            },
            enumerable: true,
            configurable: true
        });
        GObject.prototype.getGear = function (index) {
            var gear = this._gears[index];
            if (gear == null) {
                switch (index) {
                    case 0:
                        gear = new fairygui.GearDisplay(this);
                        break;
                    case 1:
                        gear = new fairygui.GearXY(this);
                        break;
                    case 2:
                        gear = new fairygui.GearSize(this);
                        break;
                    case 3:
                        gear = new fairygui.GearLook(this);
                        break;
                    case 4:
                        gear = new fairygui.GearColor(this);
                        break;
                    case 5:
                        gear = new fairygui.GearAnimation(this);
                        break;
                    case 6:
                        gear = new fairygui.GearText(this);
                        break;
                    case 7:
                        gear = new fairygui.GearIcon(this);
                        break;
                    default:
                        throw "FairyGUI: invalid gear index!";
                }
                this._gears[index] = gear;
            }
            return gear;
        };
        GObject.prototype.updateGear = function (index) {
            if (this._underConstruct || this._gearLocked)
                return;
            var gear = this._gears[index];
            if (gear != null && gear.controller != null)
                gear.updateState();
        };
        GObject.prototype.checkGearController = function (index, c) {
            return this._gears[index] != null && this._gears[index].controller == c;
        };
        GObject.prototype.updateGearFromRelations = function (index, dx, dy) {
            if (this._gears[index] != null)
                this._gears[index].updateFromRelations(dx, dy);
        };
        GObject.prototype.addDisplayLock = function () {
            var gearDisplay = this._gears[0];
            if (gearDisplay && gearDisplay.controller) {
                var ret = gearDisplay.addLock();
                this.checkGearDisplay();
                return ret;
            }
            else
                return 0;
        };
        GObject.prototype.releaseDisplayLock = function (token) {
            var gearDisplay = this._gears[0];
            if (gearDisplay && gearDisplay.controller) {
                gearDisplay.releaseLock(token);
                this.checkGearDisplay();
            }
        };
        GObject.prototype.checkGearDisplay = function () {
            if (this._handlingController)
                return;
            var connected = this._gears[0] == null || this._gears[0].connected;
            if (connected != this._internalVisible) {
                this._internalVisible = connected;
                if (this._parent)
                    this._parent.childStateChanged(this);
            }
        };
        Object.defineProperty(GObject.prototype, "gearXY", {
            get: function () {
                return this.getGear(1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "gearSize", {
            get: function () {
                return this.getGear(2);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "gearLook", {
            get: function () {
                return this.getGear(3);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "relations", {
            get: function () {
                return this._relations;
            },
            enumerable: true,
            configurable: true
        });
        GObject.prototype.addRelation = function (target, relationType, usePercent) {
            if (usePercent === void 0) { usePercent = false; }
            this._relations.add(target, relationType, usePercent);
        };
        GObject.prototype.removeRelation = function (target, relationType) {
            if (relationType === void 0) { relationType = 0; }
            this._relations.remove(target, relationType);
        };
        Object.defineProperty(GObject.prototype, "displayObject", {
            get: function () {
                return this._displayObject;
            },
            enumerable: true,
            configurable: true
        });
        GObject.prototype.setDisplayObject = function (value) {
            this._displayObject = value;
        };
        Object.defineProperty(GObject.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            set: function (val) {
                this._parent = val;
            },
            enumerable: true,
            configurable: true
        });
        GObject.prototype.removeFromParent = function () {
            if (this._parent)
                this._parent.removeChild(this);
        };
        Object.defineProperty(GObject.prototype, "root", {
            get: function () {
                if (this instanceof fairygui.GRoot)
                    return this;
                var p = this._parent;
                while (p) {
                    if (p instanceof fairygui.GRoot)
                        return p;
                    p = p.parent;
                }
                return fairygui.GRoot.inst;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "asCom", {
            get: function () {
                return (this instanceof fairygui.GComponent) ? this : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "asButton", {
            get: function () {
                return (this instanceof fairygui.GButton) ? this : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "asLabel", {
            get: function () {
                return (this instanceof fairygui.GLabel) ? this : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "asProgress", {
            get: function () {
                return (this instanceof fairygui.GProgressBar) ? this : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "asTextField", {
            get: function () {
                return (this instanceof fairygui.GTextField) ? this : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "asRichTextField", {
            get: function () {
                return (this instanceof fairygui.GRichTextField) ? this : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "asTextInput", {
            get: function () {
                return (this instanceof fairygui.GTextInput) ? this : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "asLoader", {
            get: function () {
                return (this instanceof fairygui.GLoader) ? this : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "asList", {
            get: function () {
                return (this instanceof fairygui.GList) ? this : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "asGraph", {
            get: function () {
                return (this instanceof fairygui.GGraph) ? this : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "asGroup", {
            get: function () {
                return (this instanceof fairygui.GGroup) ? this : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "asSlider", {
            get: function () {
                return (this instanceof fairygui.GSlider) ? this : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "asComboBox", {
            get: function () {
                return (this instanceof fairygui.GComboBox) ? this : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "asImage", {
            get: function () {
                return (this instanceof fairygui.GImage) ? this : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "asMovieClip", {
            get: function () {
                return (this instanceof fairygui.GMovieClip) ? this : null;
            },
            enumerable: true,
            configurable: true
        });
        GObject.cast = function (obj) {
            return obj["$owner"];
        };
        Object.defineProperty(GObject.prototype, "text", {
            get: function () {
                return null;
            },
            set: function (value) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "icon", {
            get: function () {
                return null;
            },
            set: function (value) {
            },
            enumerable: true,
            configurable: true
        });
        GObject.prototype.dispose = function () {
            this.removeFromParent();
            this._relations.dispose();
        };
        GObject.prototype.addClickListener = function (listener, thisObj) {
            this.addEventListener(egret.TouchEvent.TOUCH_TAP, listener, thisObj);
        };
        GObject.prototype.removeClickListener = function (listener, thisObj) {
            this.removeEventListener(egret.TouchEvent.TOUCH_TAP, listener, thisObj);
        };
        GObject.prototype.hasClickListener = function () {
            return this.hasEventListener(egret.TouchEvent.TOUCH_TAP);
        };
        GObject.prototype.addEventListener = function (type, listener, thisObject) {
            _super.prototype.addEventListener.call(this, type, listener, thisObject);
            if (this._displayObject != null) {
                this._displayObject.addEventListener(type, this._reDispatch, this);
            }
        };
        GObject.prototype.removeEventListener = function (type, listener, thisObject) {
            _super.prototype.removeEventListener.call(this, type, listener, thisObject);
            if (this._displayObject != null && !this.hasEventListener(type)) {
                this._displayObject.removeEventListener(type, this._reDispatch, this);
            }
        };
        GObject.prototype._reDispatch = function (evt) {
            this.dispatchEvent(evt);
        };
        Object.defineProperty(GObject.prototype, "draggable", {
            get: function () {
                return this._draggable;
            },
            set: function (value) {
                if (this._draggable != value) {
                    this._draggable = value;
                    this.initDrag();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GObject.prototype, "dragBounds", {
            get: function () {
                return this._dragBounds;
            },
            set: function (value) {
                this._dragBounds = value;
            },
            enumerable: true,
            configurable: true
        });
        GObject.prototype.startDrag = function (touchPointID) {
            if (touchPointID === void 0) { touchPointID = -1; }
            if (this._displayObject.stage == null)
                return;
            this.dragBegin(null);
        };
        GObject.prototype.stopDrag = function () {
            this.dragEnd();
        };
        Object.defineProperty(GObject.prototype, "dragging", {
            get: function () {
                return GObject.draggingObject == this;
            },
            enumerable: true,
            configurable: true
        });
        GObject.prototype.localToGlobal = function (ax, ay, resultPoint) {
            if (ax === void 0) { ax = 0; }
            if (ay === void 0) { ay = 0; }
            if (this._pivotAsAnchor) {
                ax += this._pivotX * this._width;
                ay += this._pivotY * this._height;
            }
            return this._displayObject.localToGlobal(ax, ay, resultPoint);
        };
        GObject.prototype.globalToLocal = function (ax, ay, resultPoint) {
            if (ax === void 0) { ax = 0; }
            if (ay === void 0) { ay = 0; }
            var pt = this._displayObject.globalToLocal(ax, ay, resultPoint);
            if (this._pivotAsAnchor) {
                pt.x -= this._pivotX * this._width;
                pt.y -= this._pivotY * this._height;
            }
            return pt;
        };
        GObject.prototype.localToRoot = function (ax, ay, resultPoint) {
            if (ax === void 0) { ax = 0; }
            if (ay === void 0) { ay = 0; }
            var pt = this._displayObject.localToGlobal(ax, ay, resultPoint);
            pt.x /= fairygui.GRoot.contentScaleFactor;
            pt.y /= fairygui.GRoot.contentScaleFactor;
            return pt;
        };
        GObject.prototype.rootToLocal = function (ax, ay, resultPoint) {
            if (ax === void 0) { ax = 0; }
            if (ay === void 0) { ay = 0; }
            ax *= fairygui.GRoot.contentScaleFactor;
            ay *= fairygui.GRoot.contentScaleFactor;
            return this._displayObject.globalToLocal(ax, ay, resultPoint);
        };
        GObject.prototype.localToGlobalRect = function (ax, ay, aWidth, aHeight, resultRect) {
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
        GObject.prototype.globalToLocalRect = function (ax, ay, aWidth, aHeight, resultRect) {
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
        GObject.prototype.handleControllerChanged = function (c) {
            this._handlingController = true;
            for (var i = 0; i < 8; i++) {
                var gear = this._gears[i];
                if (gear != null && gear.controller == c)
                    gear.apply();
            }
            this._handlingController = false;
            this.checkGearDisplay();
        };
        GObject.prototype.createDisplayObject = function () {
        };
        GObject.prototype.switchDisplayObject = function (newObj) {
            if (newObj == this._displayObject)
                return;
            var old = this._displayObject;
            if (this._displayObject.parent != null) {
                var i = this._displayObject.parent.getChildIndex(this._displayObject);
                this._displayObject.parent.addChildAt(newObj, i);
                this._displayObject.parent.removeChild(this._displayObject);
            }
            this._displayObject = newObj;
            this._displayObject.x = old.x;
            this._displayObject.y = old.y;
            this._displayObject.rotation = old.rotation;
            this._displayObject.alpha = old.alpha;
            this._displayObject.visible = old.visible;
            this._displayObject.touchEnabled = old.touchEnabled;
            this._displayObject.scaleX = old.scaleX;
            this._displayObject.scaleY = old.scaleY;
            if (this._displayObject instanceof egret.DisplayObjectContainer)
                this._displayObject.touchChildren = this._touchable;
        };
        GObject.prototype.handleXYChanged = function () {
            if (this._displayObject) {
                var xv = this._x;
                var yv = this._y + this._yOffset;
                if (this._pivotAsAnchor) {
                    xv -= this._pivotX * this._width;
                    yv -= this._pivotY * this._height;
                }
                if (this._pixelSnapping) {
                    xv = Math.round(xv);
                    yv = Math.round(yv);
                }
                this._displayObject.x = xv + this._pivotOffsetX;
                this._displayObject.y = yv + this._pivotOffsetY;
            }
        };
        GObject.prototype.handleSizeChanged = function () {
            if (this._displayObject != null && this._sizeImplType == 1 && this.sourceWidth != 0 && this.sourceHeight != 0) {
                this._displayObject.scaleX = this._width / this.sourceWidth * this._scaleX;
                this._displayObject.scaleY = this._height / this.sourceHeight * this._scaleY;
            }
        };
        GObject.prototype.handleScaleChanged = function () {
            if (this._displayObject != null) {
                if (this._sizeImplType == 0 || this.sourceWidth == 0 || this.sourceHeight == 0) {
                    this._displayObject.scaleX = this._scaleX;
                    this._displayObject.scaleY = this._scaleY;
                }
                else {
                    this._displayObject.scaleX = this._width / this.sourceWidth * this._scaleX;
                    this._displayObject.scaleY = this._height / this.sourceHeight * this._scaleY;
                }
            }
        };
        GObject.prototype.handleGrayedChanged = function () {
            if (this._displayObject) {
                if (this._grayed) {
                    var colorFlilter = new egret.ColorMatrixFilter(GObject.colorMatrix);
                    this._displayObject.filters = [colorFlilter];
                }
                else
                    this._displayObject.filters = null;
            }
        };
        GObject.prototype.handleAlphaChanged = function () {
            if (this._displayObject)
                this._displayObject.alpha = this._alpha;
        };
        GObject.prototype.handleVisibleChanged = function () {
            if (this._displayObject)
                this._displayObject.visible = this.internalVisible2;
        };
        GObject.prototype.constructFromResource = function () {
        };
        GObject.prototype.setup_beforeAdd = function (xml) {
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
                this.initWidth = parseInt(arr[0]);
                this.initHeight = parseInt(arr[1]);
                this.setSize(this.initWidth, this.initHeight, true);
            }
            str = xml.attributes.restrictSize;
            if (str) {
                arr = str.split(",");
                this.minWidth = parseInt(arr[0]);
                this.maxWidth = parseInt(arr[1]);
                this.minHeight = parseInt(arr[2]);
                this.maxHeight = parseInt(arr[3]);
            }
            str = xml.attributes.scale;
            if (str) {
                arr = str.split(",");
                this.setScale(parseFloat(arr[0]), parseFloat(arr[1]));
            }
            str = xml.attributes.rotation;
            if (str)
                this.rotation = parseInt(str);
            str = xml.attributes.skew;
            if (str) {
                arr = str.split(",");
                this.setSkew(parseFloat(arr[0]), parseFloat(arr[1]));
            }
            str = xml.attributes.pivot;
            if (str) {
                arr = str.split(",");
                str = xml.attributes.anchor;
                this.setPivot(parseFloat(arr[0]), parseFloat(arr[1]), str == "true");
            }
            str = xml.attributes.alpha;
            if (str)
                this.alpha = parseFloat(str);
            if (xml.attributes.touchable == "false")
                this.touchable = false;
            if (xml.attributes.visible == "false")
                this.visible = false;
            if (xml.attributes.grayed == "true")
                this.grayed = true;
            this.tooltips = xml.attributes.tooltips;
            str = xml.attributes.blend;
            if (str)
                this.blendMode = str;
            str = xml.attributes.filter;
            if (str) {
                switch (str) {
                    case "color":
                        str = xml.attributes.filterData;
                        arr = str.split(",");
                        var cm = new fairygui.ColorMatrix();
                        cm.adjustBrightness(parseFloat(arr[0]));
                        cm.adjustContrast(parseFloat(arr[1]));
                        cm.adjustSaturation(parseFloat(arr[2]));
                        cm.adjustHue(parseFloat(arr[3]));
                        var cf = new egret.ColorMatrixFilter(cm.matrix);
                        this.filters = [cf];
                        break;
                }
            }
            str = xml.attributes.customData;
            if (str) {
                this.data = str;
            }
        };
        GObject.prototype.setup_afterAdd = function (xml) {
            var cxml;
            var str = xml.attributes.group;
            if (str)
                this._group = (this._parent.getChildById(str));
            var col = xml.children;
            if (col) {
                var length1 = col.length;
                for (var i1 = 0; i1 < length1; i1++) {
                    var cxml = col[i1];
                    var index = GObject.GearXMLKeys[cxml.name];
                    if (index != undefined)
                        this.getGear(index).setup(cxml);
                }
            }
        };
        GObject.prototype.initDrag = function () {
            if (this._draggable)
                this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__begin, this);
            else
                this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__begin, this);
        };
        GObject.prototype.dragBegin = function (evt) {
            if (GObject.draggingObject != null)
                GObject.draggingObject.stopDrag();
            if (evt != null) {
                GObject.sGlobalDragStart.x = evt.stageX;
                GObject.sGlobalDragStart.y = evt.stageY;
            }
            else {
                GObject.sGlobalDragStart.x = fairygui.GRoot.mouseX;
                GObject.sGlobalDragStart.y = fairygui.GRoot.mouseY;
            }
            this.localToGlobalRect(0, 0, this.width, this.height, GObject.sGlobalRect);
            GObject.draggingObject = this;
            fairygui.GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__moving2, this);
            fairygui.GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_END, this.__end2, this);
        };
        GObject.prototype.dragEnd = function () {
            if (GObject.draggingObject == this) {
                fairygui.GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__moving2, this);
                fairygui.GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__end2, this);
                GObject.draggingObject = null;
            }
        };
        GObject.prototype.reset = function () {
            fairygui.GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__moving, this);
            fairygui.GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__end, this);
        };
        GObject.prototype.__begin = function (evt) {
            if (this._touchDownPoint == null)
                this._touchDownPoint = new egret.Point();
            this._touchDownPoint.x = evt.stageX;
            this._touchDownPoint.y = evt.stageY;
            fairygui.GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__moving, this);
            fairygui.GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_END, this.__end, this);
        };
        GObject.prototype.__end = function (evt) {
            this.reset();
        };
        GObject.prototype.__moving = function (evt) {
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
        GObject.prototype.__moving2 = function (evt) {
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
            GObject.sUpdateInDragging = true;
            var pt = this.parent.globalToLocal(xx, yy, GObject.sHelperPoint);
            this.setXY(Math.round(pt.x), Math.round(pt.y));
            GObject.sUpdateInDragging = false;
            var dragEvent = new fairygui.DragEvent(fairygui.DragEvent.DRAG_MOVING);
            dragEvent.stageX = evt.stageX;
            dragEvent.stageY = evt.stageY;
            dragEvent.touchPointID = evt.touchPointID;
            this.dispatchEvent(dragEvent);
        };
        GObject.prototype.__end2 = function (evt) {
            if (GObject.draggingObject == this) {
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
        GObject.GEAR_STOP = "gearStop";
        GObject.colorMatrix = [
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0, 0, 0, 1, 0
        ];
        GObject.GearXMLKeys = {
            "gearDisplay": 0,
            "gearXY": 1,
            "gearSize": 2,
            "gearLook": 3,
            "gearColor": 4,
            "gearAni": 5,
            "gearText": 6,
            "gearIcon": 7
        };
        //drag support
        //-------------------------------------------------------------------
        GObject.sGlobalDragStart = new egret.Point();
        GObject.sGlobalRect = new egret.Rectangle();
        GObject.sHelperPoint = new egret.Point();
        GObject.sDragHelperRect = new egret.Rectangle();
        return GObject;
    }(egret.EventDispatcher));
    fairygui.GObject = GObject;
    __reflect(GObject.prototype, "fairygui.GObject");
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
        UBBParser.prototype.onTag_URL = function (tagName, end, attr) {
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
        UBBParser.prototype.onTag_IMG = function (tagName, end, attr) {
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
        UBBParser.prototype.onTag_Simple = function (tagName, end, attr) {
            return end ? ("</" + tagName + ">") : ("<" + tagName + ">");
        };
        UBBParser.prototype.onTag_COLOR = function (tagName, end, attr) {
            if (!end)
                return "<font color=\"" + attr + "\">";
            else
                return "</font>";
        };
        UBBParser.prototype.onTag_FONT = function (tagName, end, attr) {
            if (!end)
                return "<font face=\"" + attr + "\">";
            else
                return "</font>";
        };
        UBBParser.prototype.onTag_SIZE = function (tagName, end, attr) {
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
        UBBParser.prototype.getTagText = function (remove) {
            if (remove === void 0) { remove = false; }
            var pos = this._text.indexOf("[", this._readPos);
            if (pos == -1)
                return null;
            var ret = this._text.substring(this._readPos, pos);
            if (remove)
                this._readPos = pos;
            return ret;
        };
        UBBParser.prototype.parse = function (text) {
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
    }());
    fairygui.UBBParser = UBBParser;
    __reflect(UBBParser.prototype, "fairygui.UBBParser");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var ButtonMode;
    (function (ButtonMode) {
        ButtonMode[ButtonMode["Common"] = 0] = "Common";
        ButtonMode[ButtonMode["Check"] = 1] = "Check";
        ButtonMode[ButtonMode["Radio"] = 2] = "Radio";
    })(ButtonMode = fairygui.ButtonMode || (fairygui.ButtonMode = {}));
    ;
    var AutoSizeType;
    (function (AutoSizeType) {
        AutoSizeType[AutoSizeType["None"] = 0] = "None";
        AutoSizeType[AutoSizeType["Both"] = 1] = "Both";
        AutoSizeType[AutoSizeType["Height"] = 2] = "Height";
    })(AutoSizeType = fairygui.AutoSizeType || (fairygui.AutoSizeType = {}));
    ;
    var AlignType;
    (function (AlignType) {
        AlignType[AlignType["Left"] = 0] = "Left";
        AlignType[AlignType["Center"] = 1] = "Center";
        AlignType[AlignType["Right"] = 2] = "Right";
    })(AlignType = fairygui.AlignType || (fairygui.AlignType = {}));
    ;
    var VertAlignType;
    (function (VertAlignType) {
        VertAlignType[VertAlignType["Top"] = 0] = "Top";
        VertAlignType[VertAlignType["Middle"] = 1] = "Middle";
        VertAlignType[VertAlignType["Bottom"] = 2] = "Bottom";
    })(VertAlignType = fairygui.VertAlignType || (fairygui.VertAlignType = {}));
    ;
    var LoaderFillType;
    (function (LoaderFillType) {
        LoaderFillType[LoaderFillType["None"] = 0] = "None";
        LoaderFillType[LoaderFillType["Scale"] = 1] = "Scale";
        LoaderFillType[LoaderFillType["ScaleMatchHeight"] = 2] = "ScaleMatchHeight";
        LoaderFillType[LoaderFillType["ScaleMatchWidth"] = 3] = "ScaleMatchWidth";
        LoaderFillType[LoaderFillType["ScaleFree"] = 4] = "ScaleFree";
        LoaderFillType[LoaderFillType["ScaleNoBorder"] = 5] = "ScaleNoBorder";
    })(LoaderFillType = fairygui.LoaderFillType || (fairygui.LoaderFillType = {}));
    ;
    var ListLayoutType;
    (function (ListLayoutType) {
        ListLayoutType[ListLayoutType["SingleColumn"] = 0] = "SingleColumn";
        ListLayoutType[ListLayoutType["SingleRow"] = 1] = "SingleRow";
        ListLayoutType[ListLayoutType["FlowHorizontal"] = 2] = "FlowHorizontal";
        ListLayoutType[ListLayoutType["FlowVertical"] = 3] = "FlowVertical";
        ListLayoutType[ListLayoutType["Pagination"] = 4] = "Pagination";
    })(ListLayoutType = fairygui.ListLayoutType || (fairygui.ListLayoutType = {}));
    ;
    var ListSelectionMode;
    (function (ListSelectionMode) {
        ListSelectionMode[ListSelectionMode["Single"] = 0] = "Single";
        ListSelectionMode[ListSelectionMode["Multiple"] = 1] = "Multiple";
        ListSelectionMode[ListSelectionMode["Multiple_SingleClick"] = 2] = "Multiple_SingleClick";
        ListSelectionMode[ListSelectionMode["None"] = 3] = "None";
    })(ListSelectionMode = fairygui.ListSelectionMode || (fairygui.ListSelectionMode = {}));
    ;
    var OverflowType;
    (function (OverflowType) {
        OverflowType[OverflowType["Visible"] = 0] = "Visible";
        OverflowType[OverflowType["Hidden"] = 1] = "Hidden";
        OverflowType[OverflowType["Scroll"] = 2] = "Scroll";
        OverflowType[OverflowType["Scale"] = 3] = "Scale";
        OverflowType[OverflowType["ScaleFree"] = 4] = "ScaleFree";
    })(OverflowType = fairygui.OverflowType || (fairygui.OverflowType = {}));
    ;
    var PackageItemType;
    (function (PackageItemType) {
        PackageItemType[PackageItemType["Image"] = 0] = "Image";
        PackageItemType[PackageItemType["Swf"] = 1] = "Swf";
        PackageItemType[PackageItemType["MovieClip"] = 2] = "MovieClip";
        PackageItemType[PackageItemType["Sound"] = 3] = "Sound";
        PackageItemType[PackageItemType["Component"] = 4] = "Component";
        PackageItemType[PackageItemType["Misc"] = 5] = "Misc";
        PackageItemType[PackageItemType["Font"] = 6] = "Font";
        PackageItemType[PackageItemType["Atlas"] = 7] = "Atlas";
    })(PackageItemType = fairygui.PackageItemType || (fairygui.PackageItemType = {}));
    ;
    var ProgressTitleType;
    (function (ProgressTitleType) {
        ProgressTitleType[ProgressTitleType["Percent"] = 0] = "Percent";
        ProgressTitleType[ProgressTitleType["ValueAndMax"] = 1] = "ValueAndMax";
        ProgressTitleType[ProgressTitleType["Value"] = 2] = "Value";
        ProgressTitleType[ProgressTitleType["Max"] = 3] = "Max";
    })(ProgressTitleType = fairygui.ProgressTitleType || (fairygui.ProgressTitleType = {}));
    ;
    var ScrollBarDisplayType;
    (function (ScrollBarDisplayType) {
        ScrollBarDisplayType[ScrollBarDisplayType["Default"] = 0] = "Default";
        ScrollBarDisplayType[ScrollBarDisplayType["Visible"] = 1] = "Visible";
        ScrollBarDisplayType[ScrollBarDisplayType["Auto"] = 2] = "Auto";
        ScrollBarDisplayType[ScrollBarDisplayType["Hidden"] = 3] = "Hidden";
    })(ScrollBarDisplayType = fairygui.ScrollBarDisplayType || (fairygui.ScrollBarDisplayType = {}));
    ;
    var ScrollType;
    (function (ScrollType) {
        ScrollType[ScrollType["Horizontal"] = 0] = "Horizontal";
        ScrollType[ScrollType["Vertical"] = 1] = "Vertical";
        ScrollType[ScrollType["Both"] = 2] = "Both";
    })(ScrollType = fairygui.ScrollType || (fairygui.ScrollType = {}));
    ;
    var FlipType;
    (function (FlipType) {
        FlipType[FlipType["None"] = 0] = "None";
        FlipType[FlipType["Horizontal"] = 1] = "Horizontal";
        FlipType[FlipType["Vertical"] = 2] = "Vertical";
        FlipType[FlipType["Both"] = 3] = "Both";
    })(FlipType = fairygui.FlipType || (fairygui.FlipType = {}));
    ;
    var ChildrenRenderOrder;
    (function (ChildrenRenderOrder) {
        ChildrenRenderOrder[ChildrenRenderOrder["Ascent"] = 0] = "Ascent";
        ChildrenRenderOrder[ChildrenRenderOrder["Descent"] = 1] = "Descent";
        ChildrenRenderOrder[ChildrenRenderOrder["Arch"] = 2] = "Arch";
    })(ChildrenRenderOrder = fairygui.ChildrenRenderOrder || (fairygui.ChildrenRenderOrder = {}));
    ;
    var GroupLayoutType;
    (function (GroupLayoutType) {
        GroupLayoutType[GroupLayoutType["None"] = 0] = "None";
        GroupLayoutType[GroupLayoutType["Horizontal"] = 1] = "Horizontal";
        GroupLayoutType[GroupLayoutType["Vertical"] = 2] = "Vertical";
    })(GroupLayoutType = fairygui.GroupLayoutType || (fairygui.GroupLayoutType = {}));
    ;
    var RelationType;
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
    })(RelationType = fairygui.RelationType || (fairygui.RelationType = {}));
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
    function getVertAlignTypeString(type) {
        return type == VertAlignType.Top ? egret.VerticalAlign.TOP :
            (type == VertAlignType.Middle ? egret.VerticalAlign.MIDDLE : egret.VerticalAlign.BOTTOM);
    }
    fairygui.getVertAlignTypeString = getVertAlignTypeString;
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
    function parseLoaderFillType(value) {
        switch (value) {
            case "none":
                return LoaderFillType.None;
            case "scale":
                return LoaderFillType.Scale;
            case "scaleMatchHeight":
                return LoaderFillType.ScaleMatchHeight;
            case "scaleMatchWidth":
                return LoaderFillType.ScaleMatchWidth;
            case "scaleFree":
                return LoaderFillType.ScaleFree;
            case "scaleNoBorder":
                return LoaderFillType.ScaleNoBorder;
            default:
                return LoaderFillType.None;
        }
    }
    fairygui.parseLoaderFillType = parseLoaderFillType;
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
            case "pagination":
                return ListLayoutType.Pagination;
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
    function parseEaseType(value) {
        var ret = EaseMap[value];
        if (!ret)
            ret = egret.Ease.quartOut;
        return ret;
    }
    fairygui.parseEaseType = parseEaseType;
    function parseGroupLayoutType(value) {
        switch (value) {
            case "hz":
                return GroupLayoutType.Horizontal;
            case "vt":
                return GroupLayoutType.Vertical;
            default:
                return GroupLayoutType.None;
        }
    }
    fairygui.parseGroupLayoutType = parseGroupLayoutType;
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GearBase = (function () {
        function GearBase(owner) {
            this._owner = owner;
            this._easeType = egret.Ease.quadOut;
            this._tweenTime = 0.3;
            this._tweenDelay = 0;
            this._displayLockToken = 0;
        }
        Object.defineProperty(GearBase.prototype, "controller", {
            get: function () {
                return this._controller;
            },
            set: function (val) {
                if (val != this._controller) {
                    this._controller = val;
                    if (this._controller)
                        this.init();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GearBase.prototype, "tween", {
            get: function () {
                return this._tween;
            },
            set: function (val) {
                this._tween = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GearBase.prototype, "tweenDelay", {
            get: function () {
                return this._tweenDelay;
            },
            set: function (val) {
                this._tweenDelay = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GearBase.prototype, "tweenTime", {
            get: function () {
                return this._tweenTime;
            },
            set: function (value) {
                this._tweenTime = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GearBase.prototype, "easeType", {
            get: function () {
                return this._easeType;
            },
            set: function (value) {
                this._easeType = value;
            },
            enumerable: true,
            configurable: true
        });
        GearBase.prototype.setup = function (xml) {
            this._controller = this._owner.parent.getController(xml.attributes.controller);
            if (this._controller == null)
                return;
            this.init();
            var str;
            str = xml.attributes.tween;
            if (str)
                this._tween = true;
            str = xml.attributes.ease;
            if (str)
                this._easeType = fairygui.parseEaseType(str);
            str = xml.attributes.duration;
            if (str)
                this._tweenTime = parseFloat(str);
            str = xml.attributes.delay;
            if (str)
                this._tweenDelay = parseFloat(str);
            if (this instanceof fairygui.GearDisplay) {
                str = xml.attributes.pages;
                if (str)
                    this.pages = str.split(",");
            }
            else {
                var pages;
                var values;
                str = xml.attributes.pages;
                if (str)
                    pages = str.split(",");
                if (pages) {
                    str = xml.attributes.values;
                    if (str)
                        values = str.split("|");
                    else
                        values = [];
                    for (var i = 0; i < pages.length; i++) {
                        str = values[i];
                        if (str == null)
                            str = "";
                        this.addStatus(pages[i], str);
                    }
                }
                str = xml.attributes.default;
                if (str)
                    this.addStatus(null, str);
            }
        };
        GearBase.prototype.updateFromRelations = function (dx, dy) {
        };
        GearBase.prototype.addStatus = function (pageId, value) {
        };
        GearBase.prototype.init = function () {
        };
        GearBase.prototype.apply = function () {
        };
        GearBase.prototype.updateState = function () {
        };
        GearBase.disableAllTweenEffect = false;
        return GearBase;
    }());
    fairygui.GearBase = GearBase;
    __reflect(GearBase.prototype, "fairygui.GearBase");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GComponent = (function (_super) {
        __extends(GComponent, _super);
        function GComponent() {
            var _this = _super.call(this) || this;
            _this._sortingChildCount = 0;
            _this._childrenRenderOrder = fairygui.ChildrenRenderOrder.Ascent;
            _this._apexIndex = 0;
            _this._children = new Array();
            _this._controllers = new Array();
            _this._transitions = new Array();
            _this._margin = new fairygui.Margin();
            _this._alignOffset = new egret.Point();
            return _this;
        }
        GComponent.prototype.createDisplayObject = function () {
            this._rootContainer = new fairygui.UIContainer();
            this._rootContainer["$owner"] = this;
            this.setDisplayObject(this._rootContainer);
            this._container = this._rootContainer;
        };
        GComponent.prototype.dispose = function () {
            var i;
            var cnt;
            cnt = this._transitions.length;
            for (i = 0; i < cnt; ++i) {
                var trans = this._transitions[i];
                trans.dispose();
            }
            cnt = this._controllers.length;
            for (i = 0; i < cnt; ++i) {
                var cc = this._controllers[i];
                cc.dispose();
            }
            if (this._scrollPane)
                this._scrollPane.dispose();
            cnt = this._children.length;
            for (i = cnt - 1; i >= 0; --i) {
                var obj = this._children[i];
                obj.parent = null; //avoid removeFromParent call
                obj.dispose();
            }
            this._boundsChanged = false;
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(GComponent.prototype, "displayListContainer", {
            get: function () {
                return this._container;
            },
            enumerable: true,
            configurable: true
        });
        GComponent.prototype.addChild = function (child) {
            this.addChildAt(child, this._children.length);
            return child;
        };
        GComponent.prototype.addChildAt = function (child, index) {
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
        GComponent.prototype.getInsertPosForSortingChild = function (target) {
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
        GComponent.prototype.removeChild = function (child, dispose) {
            if (dispose === void 0) { dispose = false; }
            var childIndex = this._children.indexOf(child);
            if (childIndex != -1) {
                this.removeChildAt(childIndex, dispose);
            }
            return child;
        };
        GComponent.prototype.removeChildAt = function (index, dispose) {
            if (dispose === void 0) { dispose = false; }
            if (index >= 0 && index < this.numChildren) {
                var child = this._children[index];
                child.parent = null;
                if (child.sortingOrder != 0)
                    this._sortingChildCount--;
                this._children.splice(index, 1);
                child.group = null;
                if (child.inContainer) {
                    this._container.removeChild(child.displayObject);
                    if (this._childrenRenderOrder == fairygui.ChildrenRenderOrder.Arch)
                        fairygui.GTimers.inst.callLater(this.buildNativeDisplayList, this);
                }
                if (dispose)
                    child.dispose();
                this.setBoundsChangedFlag();
                return child;
            }
            else {
                throw "Invalid child index";
            }
        };
        GComponent.prototype.removeChildren = function (beginIndex, endIndex, dispose) {
            if (beginIndex === void 0) { beginIndex = 0; }
            if (endIndex === void 0) { endIndex = -1; }
            if (dispose === void 0) { dispose = false; }
            if (endIndex < 0 || endIndex >= this.numChildren)
                endIndex = this.numChildren - 1;
            for (var i = beginIndex; i <= endIndex; ++i)
                this.removeChildAt(beginIndex, dispose);
        };
        GComponent.prototype.getChildAt = function (index) {
            if (index === void 0) { index = 0; }
            if (index >= 0 && index < this.numChildren)
                return this._children[index];
            else
                throw "Invalid child index";
        };
        GComponent.prototype.getChild = function (name) {
            var cnt = this._children.length;
            for (var i = 0; i < cnt; ++i) {
                if (this._children[i].name == name)
                    return this._children[i];
            }
            return null;
        };
        GComponent.prototype.getVisibleChild = function (name) {
            var cnt = this._children.length;
            for (var i = 0; i < cnt; ++i) {
                var child = this._children[i];
                if (child.internalVisible && child.internalVisible && child.name == name)
                    return child;
            }
            return null;
        };
        GComponent.prototype.getChildInGroup = function (name, group) {
            var cnt = this._children.length;
            for (var i = 0; i < cnt; ++i) {
                var child = this._children[i];
                if (child.group == group && child.name == name)
                    return child;
            }
            return null;
        };
        GComponent.prototype.getChildById = function (id) {
            var cnt = this._children.length;
            for (var i = 0; i < cnt; ++i) {
                if (this._children[i]._id == id)
                    return this._children[i];
            }
            return null;
        };
        GComponent.prototype.getChildIndex = function (child) {
            return this._children.indexOf(child);
        };
        GComponent.prototype.setChildIndex = function (child, index) {
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
        GComponent.prototype.setChildIndexBefore = function (child, index) {
            var oldIndex = this._children.indexOf(child);
            if (oldIndex == -1)
                throw "Not a child of this container";
            if (child.sortingOrder != 0)
                return oldIndex;
            var cnt = this._children.length;
            if (this._sortingChildCount > 0) {
                if (index > (cnt - this._sortingChildCount - 1))
                    index = cnt - this._sortingChildCount - 1;
            }
            if (oldIndex < index)
                return this._setChildIndex(child, oldIndex, index - 1);
            else
                return this._setChildIndex(child, oldIndex, index);
        };
        GComponent.prototype._setChildIndex = function (child, oldIndex, index) {
            if (index === void 0) { index = 0; }
            var cnt = this._children.length;
            if (index > cnt)
                index = cnt;
            if (oldIndex == index)
                return oldIndex;
            this._children.splice(oldIndex, 1);
            this._children.splice(index, 0, child);
            if (child.inContainer) {
                var displayIndex = 0;
                var g;
                var i;
                if (this._childrenRenderOrder == fairygui.ChildrenRenderOrder.Ascent) {
                    for (i = 0; i < index; i++) {
                        g = this._children[i];
                        if (g.inContainer)
                            displayIndex++;
                    }
                    if (displayIndex == this._container.numChildren)
                        displayIndex--;
                    this._container.setChildIndex(child.displayObject, displayIndex);
                }
                else if (this._childrenRenderOrder == fairygui.ChildrenRenderOrder.Descent) {
                    for (i = cnt - 1; i > index; i--) {
                        g = this._children[i];
                        if (g.inContainer)
                            displayIndex++;
                    }
                    if (displayIndex == this._container.numChildren)
                        displayIndex--;
                    this._container.setChildIndex(child.displayObject, displayIndex);
                }
                else {
                    fairygui.GTimers.inst.callLater(this.buildNativeDisplayList, this);
                }
                this.setBoundsChangedFlag();
            }
            return index;
        };
        GComponent.prototype.swapChildren = function (child1, child2) {
            var index1 = this._children.indexOf(child1);
            var index2 = this._children.indexOf(child2);
            if (index1 == -1 || index2 == -1)
                throw "Not a child of this container";
            this.swapChildrenAt(index1, index2);
        };
        GComponent.prototype.swapChildrenAt = function (index1, index2) {
            if (index2 === void 0) { index2 = 0; }
            var child1 = this._children[index1];
            var child2 = this._children[index2];
            this.setChildIndex(child1, index2);
            this.setChildIndex(child2, index1);
        };
        Object.defineProperty(GComponent.prototype, "numChildren", {
            get: function () {
                return this._children.length;
            },
            enumerable: true,
            configurable: true
        });
        GComponent.prototype.isAncestorOf = function (child) {
            if (child == null)
                return false;
            var p = child.parent;
            while (p) {
                if (p == this)
                    return true;
                p = p.parent;
            }
            return false;
        };
        GComponent.prototype.addController = function (controller) {
            this._controllers.push(controller);
            controller._parent = this;
            this.applyController(controller);
        };
        GComponent.prototype.getControllerAt = function (index) {
            return this._controllers[index];
        };
        GComponent.prototype.getController = function (name) {
            var cnt = this._controllers.length;
            for (var i = 0; i < cnt; ++i) {
                var c = this._controllers[i];
                if (c.name == name)
                    return c;
            }
            return null;
        };
        GComponent.prototype.removeController = function (c) {
            var index = this._controllers.indexOf(c);
            if (index == -1)
                throw "controller not exists";
            c._parent = null;
            this._controllers.splice(index, 1);
            var length = this._children.length;
            for (var i = 0; i < length; i++) {
                var child = this._children[i];
                child.handleControllerChanged(c);
            }
        };
        Object.defineProperty(GComponent.prototype, "controllers", {
            get: function () {
                return this._controllers;
            },
            enumerable: true,
            configurable: true
        });
        GComponent.prototype.childStateChanged = function (child) {
            if (this._buildingDisplayList)
                return;
            var cnt = this._children.length;
            var g;
            var i;
            if (child instanceof fairygui.GGroup) {
                for (i = 0; i < cnt; i++) {
                    g = this._children[i];
                    if (g.group == child)
                        this.childStateChanged(g);
                }
                return;
            }
            if (!child.displayObject)
                return;
            if (child.internalVisible) {
                if (!child.displayObject.parent) {
                    var index = 0;
                    if (this._childrenRenderOrder == fairygui.ChildrenRenderOrder.Ascent) {
                        for (i = 0; i < cnt; i++) {
                            g = this._children[i];
                            if (g == child)
                                break;
                            if (g.displayObject != null && g.displayObject.parent != null)
                                index++;
                        }
                        this._container.addChildAt(child.displayObject, index);
                    }
                    else if (this._childrenRenderOrder == fairygui.ChildrenRenderOrder.Descent) {
                        for (i = cnt - 1; i >= 0; i--) {
                            g = this._children[i];
                            if (g == child)
                                break;
                            if (g.displayObject != null && g.displayObject.parent != null)
                                index++;
                        }
                        this._container.addChildAt(child.displayObject, index);
                    }
                    else {
                        this._container.addChild(child.displayObject);
                        fairygui.GTimers.inst.callLater(this.buildNativeDisplayList, this);
                    }
                }
            }
            else {
                if (child.displayObject.parent)
                    this._container.removeChild(child.displayObject);
            }
        };
        GComponent.prototype.buildNativeDisplayList = function () {
            var cnt = this._children.length;
            if (cnt == 0)
                return;
            var i;
            var child;
            switch (this._childrenRenderOrder) {
                case fairygui.ChildrenRenderOrder.Ascent:
                    {
                        for (i = 0; i < cnt; i++) {
                            child = this._children[i];
                            if (child.displayObject != null && child.internalVisible)
                                this._container.addChild(child.displayObject);
                        }
                    }
                    break;
                case fairygui.ChildrenRenderOrder.Descent:
                    {
                        for (i = cnt - 1; i >= 0; i--) {
                            child = this._children[i];
                            if (child.displayObject != null && child.internalVisible)
                                this._container.addChild(child.displayObject);
                        }
                    }
                    break;
                case fairygui.ChildrenRenderOrder.Arch:
                    {
                        for (i = 0; i < this._apexIndex; i++) {
                            child = this._children[i];
                            if (child.displayObject != null && child.internalVisible)
                                this._container.addChild(child.displayObject);
                        }
                        for (i = cnt - 1; i >= this._apexIndex; i--) {
                            child = this._children[i];
                            if (child.displayObject != null && child.internalVisible)
                                this._container.addChild(child.displayObject);
                        }
                    }
                    break;
            }
        };
        GComponent.prototype.applyController = function (c) {
            this._applyingController = c;
            var child;
            var length = this._children.length;
            for (var i = 0; i < length; i++) {
                child = this._children[i];
                child.handleControllerChanged(c);
            }
            this._applyingController = null;
            c.runActions();
        };
        GComponent.prototype.applyAllControllers = function () {
            var cnt = this._controllers.length;
            for (var i = 0; i < cnt; ++i) {
                this.applyController(this._controllers[i]);
            }
        };
        GComponent.prototype.adjustRadioGroupDepth = function (obj, c) {
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
            if (myIndex < maxIndex) {
                if (this._applyingController != null)
                    this._children[maxIndex].handleControllerChanged(this._applyingController);
                this.swapChildrenAt(myIndex, maxIndex);
            }
        };
        GComponent.prototype.getTransitionAt = function (index) {
            return this._transitions[index];
        };
        GComponent.prototype.getTransition = function (transName) {
            var cnt = this._transitions.length;
            for (var i = 0; i < cnt; ++i) {
                var trans = this._transitions[i];
                if (trans.name == transName)
                    return trans;
            }
            return null;
        };
        GComponent.prototype.isChildInView = function (child) {
            if (this._rootContainer.scrollRect != null) {
                return child.x + child.width >= 0 && child.x <= this.width
                    && child.y + child.height >= 0 && child.y <= this.height;
            }
            else if (this._scrollPane != null) {
                return this._scrollPane.isChildInView(child);
            }
            else
                return true;
        };
        GComponent.prototype.getFirstChildInView = function () {
            var cnt = this._children.length;
            for (var i = 0; i < cnt; ++i) {
                var child = this._children[i];
                if (this.isChildInView(child))
                    return i;
            }
            return -1;
        };
        Object.defineProperty(GComponent.prototype, "scrollPane", {
            get: function () {
                return this._scrollPane;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComponent.prototype, "opaque", {
            get: function () {
                return this._opaque;
            },
            set: function (value) {
                if (this._opaque != value) {
                    this._opaque = value;
                    if (this._opaque)
                        this.updateOpaque();
                    else
                        this._rootContainer.hitArea = null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComponent.prototype, "margin", {
            get: function () {
                return this._margin;
            },
            set: function (value) {
                this._margin.copy(value);
                if (this._rootContainer.scrollRect != null) {
                    this._container.x = this._margin.left + this._alignOffset.x;
                    this._container.y = this._margin.top + this._alignOffset.y;
                }
                this.handleSizeChanged();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComponent.prototype, "childrenRenderOrder", {
            get: function () {
                return this._childrenRenderOrder;
            },
            set: function (value) {
                if (this._childrenRenderOrder != value) {
                    this._childrenRenderOrder = value;
                    this.buildNativeDisplayList();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComponent.prototype, "apexIndex", {
            get: function () {
                return this._apexIndex;
            },
            set: function (value) {
                if (this._apexIndex != value) {
                    this._apexIndex = value;
                    if (this._childrenRenderOrder == fairygui.ChildrenRenderOrder.Arch)
                        this.buildNativeDisplayList();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComponent.prototype, "mask", {
            get: function () {
                return this._rootContainer.mask;
            },
            set: function (value) {
                this._rootContainer.mask = value;
            },
            enumerable: true,
            configurable: true
        });
        GComponent.prototype.updateOpaque = function () {
            if (!this._rootContainer.hitArea)
                this._rootContainer.hitArea = new egret.Rectangle();
            this._rootContainer.hitArea.setTo(0, 0, this.width, this.height);
        };
        GComponent.prototype.updateScrollRect = function () {
            var rect = this._rootContainer.scrollRect;
            if (rect == null)
                rect = new egret.Rectangle();
            var w = this.width - this._margin.right;
            var h = this.height - this._margin.bottom;
            rect.setTo(0, 0, w, h);
            this._rootContainer.scrollRect = rect;
        };
        GComponent.prototype.setupScroll = function (scrollBarMargin, scroll, scrollBarDisplay, flags, vtScrollBarRes, hzScrollBarRes, headerRes, footerRes) {
            if (this._rootContainer == this._container) {
                this._container = new egret.DisplayObjectContainer();
                this._rootContainer.addChild(this._container);
            }
            this._scrollPane = new fairygui.ScrollPane(this, scroll, scrollBarMargin, scrollBarDisplay, flags, vtScrollBarRes, hzScrollBarRes, headerRes, footerRes);
            this.setBoundsChangedFlag();
        };
        GComponent.prototype.setupOverflow = function (overflow) {
            if (overflow == fairygui.OverflowType.Hidden) {
                if (this._rootContainer == this._container) {
                    this._container = new egret.DisplayObjectContainer();
                    this._rootContainer.addChild(this._container);
                }
                this.updateScrollRect();
                this._container.x = this._margin.left;
                this._container.y = this._margin.top;
            }
            else if (this._margin.left != 0 || this._margin.top != 0) {
                if (this._rootContainer == this._container) {
                    this._container = new egret.DisplayObjectContainer();
                    this._rootContainer.addChild(this._container);
                }
                this._container.x = this._margin.left;
                this._container.y = this._margin.top;
            }
            this.setBoundsChangedFlag();
        };
        GComponent.prototype.handleSizeChanged = function () {
            if (this._scrollPane)
                this._scrollPane.onOwnerSizeChanged();
            else if (this._rootContainer.scrollRect != null)
                this.updateScrollRect();
            if (this._opaque)
                this.updateOpaque();
        };
        GComponent.prototype.handleGrayedChanged = function () {
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
        GComponent.prototype.handleControllerChanged = function (c) {
            _super.prototype.handleControllerChanged.call(this, c);
            if (this._scrollPane != null)
                this._scrollPane.handleControllerChanged(c);
        };
        GComponent.prototype.setBoundsChangedFlag = function () {
            if (!this._scrollPane && !this._trackBounds)
                return;
            if (!this._boundsChanged) {
                this._boundsChanged = true;
                egret.callLater(this.__render, this);
            }
        };
        GComponent.prototype.__render = function () {
            if (this._boundsChanged) {
                var len = this._children.length;
                if (len > 0) {
                    for (var i = 0; i < len; i++) {
                        var child = this._children[i];
                        child.ensureSizeCorrect();
                    }
                }
                this.updateBounds();
            }
        };
        GComponent.prototype.ensureBoundsCorrect = function () {
            var len = this._children.length;
            if (len > 0) {
                for (var i = 0; i < len; i++) {
                    var child = this._children[i];
                    child.ensureSizeCorrect();
                }
            }
            if (this._boundsChanged)
                this.updateBounds();
        };
        GComponent.prototype.updateBounds = function () {
            var ax = 0, ay = 0, aw = 0, ah = 0;
            var len = this._children.length;
            if (len > 0) {
                ax = Number.POSITIVE_INFINITY, ay = Number.POSITIVE_INFINITY;
                var ar = Number.NEGATIVE_INFINITY, ab = Number.NEGATIVE_INFINITY;
                var tmp = 0;
                var i = 0;
                for (var i = 0; i < len; i++) {
                    var child = this._children[i];
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
            this.setBounds(ax, ay, aw, ah);
        };
        GComponent.prototype.setBounds = function (ax, ay, aw, ah) {
            if (ah === void 0) { ah = 0; }
            this._boundsChanged = false;
            if (this._scrollPane)
                this._scrollPane.setContentSize(Math.round(ax + aw), Math.round(ay + ah));
        };
        Object.defineProperty(GComponent.prototype, "viewWidth", {
            get: function () {
                if (this._scrollPane != null)
                    return this._scrollPane.viewWidth;
                else
                    return this.width - this._margin.left - this._margin.right;
            },
            set: function (value) {
                if (this._scrollPane != null)
                    this._scrollPane.viewWidth = value;
                else
                    this.width = value + this._margin.left + this._margin.right;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComponent.prototype, "viewHeight", {
            get: function () {
                if (this._scrollPane != null)
                    return this._scrollPane.viewHeight;
                else
                    return this.height - this._margin.top - this._margin.bottom;
            },
            set: function (value) {
                if (this._scrollPane != null)
                    this._scrollPane.viewHeight = value;
                else
                    this.height = value + this._margin.top + this._margin.bottom;
            },
            enumerable: true,
            configurable: true
        });
        GComponent.prototype.getSnappingPosition = function (xValue, yValue, resultPoint) {
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
            var prev = null;
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
                            prev = this._children[i - 1];
                            if (yValue < prev.y + prev.actualHeight / 2)
                                yValue = prev.y;
                            else
                                yValue = obj.y;
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
                            else
                                xValue = obj.x;
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
        GComponent.prototype.childSortingOrderChanged = function (child, oldValue, newValue) {
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
        GComponent.prototype.constructFromResource = function () {
            this.constructFromResource2(null, 0);
        };
        GComponent.prototype.constructFromResource2 = function (objectPool, poolIndex) {
            var xml = this.packageItem.owner.getItemAsset(this.packageItem);
            this._underConstruct = true;
            var str;
            var arr;
            str = xml.attributes.size;
            arr = str.split(",");
            this.sourceWidth = parseInt(arr[0]);
            this.sourceHeight = parseInt(arr[1]);
            this.initWidth = this.sourceWidth;
            this.initHeight = this.sourceHeight;
            this.setSize(this.sourceWidth, this.sourceHeight);
            str = xml.attributes.restrictSize;
            if (str) {
                arr = str.split(",");
                this.minWidth = parseInt(arr[0]);
                this.maxWidth = parseInt(arr[1]);
                this.minHeight = parseInt(arr[2]);
                this.maxHeight = parseInt(arr[3]);
            }
            str = xml.attributes.pivot;
            if (str) {
                arr = str.split(",");
                str = xml.attributes.anchor;
                this.internalSetPivot(parseFloat(arr[0]), parseFloat(arr[1]), str == "true");
            }
            str = xml.attributes.opaque;
            this.opaque = str != "false";
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
                var headerRes;
                var footerRes;
                str = xml.attributes.ptrRes;
                if (str) {
                    arr = str.split(",");
                    headerRes = arr[0];
                    footerRes = arr[1];
                }
                this.setupScroll(scrollBarMargin, scroll, scrollBarDisplay, scrollBarFlags, vtScrollBarRes, hzScrollBarRes, headerRes, footerRes);
            }
            else
                this.setupOverflow(overflow);
            this._buildingDisplayList = true;
            var col = xml.children;
            var length1 = 0;
            if (col)
                length1 = col.length;
            var i;
            var controller;
            for (i = 0; i < length1; i++) {
                var cxml = col[i];
                if (cxml.name == "controller") {
                    controller = new fairygui.Controller();
                    this._controllers.push(controller);
                    controller._parent = this;
                    controller.setup(cxml);
                }
            }
            var child;
            var displayList = this.packageItem.displayList;
            var childCount = displayList.length;
            for (i = 0; i < childCount; i++) {
                var di = displayList[i];
                if (objectPool != null) {
                    child = objectPool[poolIndex + i];
                }
                else if (di.packageItem) {
                    child = fairygui.UIObjectFactory.newObject(di.packageItem);
                    child.packageItem = di.packageItem;
                    child.constructFromResource();
                }
                else
                    child = fairygui.UIObjectFactory.newObject2(di.type);
                child._underConstruct = true;
                child.setup_beforeAdd(di.desc);
                child.parent = this;
                this._children.push(child);
            }
            this.relations.setup(xml);
            for (i = 0; i < childCount; i++)
                this._children[i].relations.setup(displayList[i].desc);
            for (i = 0; i < childCount; i++) {
                child = this._children[i];
                child.setup_afterAdd(displayList[i].desc);
                child._underConstruct = false;
            }
            str = xml.attributes.mask;
            if (str)
                this.mask = this.getChildById(str).displayObject;
            var trans;
            for (i = 0; i < length1; i++) {
                var cxml = col[i];
                if (cxml.name == "transition") {
                    trans = new fairygui.Transition(this);
                    this._transitions.push(trans);
                    trans.setup(cxml);
                }
            }
            if (this._transitions.length > 0) {
                this.displayObject.addEventListener(egret.Event.ADDED_TO_STAGE, this.___added, this);
                this.displayObject.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.___removed, this);
            }
            this.applyAllControllers();
            this._buildingDisplayList = false;
            this._underConstruct = false;
            this.buildNativeDisplayList();
            this.setBoundsChangedFlag();
            this.constructFromXML(xml);
        };
        GComponent.prototype.constructFromXML = function (xml) {
        };
        GComponent.prototype.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            var str;
            if (this.scrollPane) {
                str = xml.attributes.pageController;
                if (str)
                    this.scrollPane.pageController = this.parent.getController(str);
            }
            str = xml.attributes.controller;
            if (str) {
                var arr = str.split(",");
                for (var i = 0; i < arr.length; i += 2) {
                    var cc = this.getController(arr[i]);
                    if (cc)
                        cc.selectedPageId = arr[i + 1];
                }
            }
        };
        GComponent.prototype.___added = function (evt) {
            var cnt = this._transitions.length;
            for (var i = 0; i < cnt; ++i) {
                var trans = this._transitions[i];
                if (trans.autoPlay)
                    trans.play(null, null, null, trans.autoPlayRepeat, trans.autoPlayDelay);
            }
        };
        GComponent.prototype.___removed = function (evt) {
            var cnt = this._transitions.length;
            for (var i = 0; i < cnt; ++i) {
                this._transitions[i].OnOwnerRemovedFromStage();
            }
        };
        return GComponent;
    }(fairygui.GObject));
    fairygui.GComponent = GComponent;
    __reflect(GComponent.prototype, "fairygui.GComponent");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var ControllerAction = (function () {
        function ControllerAction() {
        }
        ControllerAction.createAction = function (type) {
            switch (type) {
                case "play_transition":
                    return new fairygui.PlayTransitionAction();
                case "change_page":
                    return new fairygui.ChangePageAction();
            }
            return null;
        };
        ControllerAction.prototype.run = function (controller, prevPage, curPage) {
            if ((this.fromPage == null || this.fromPage.length == 0 || this.fromPage.indexOf(prevPage) != -1)
                && (this.toPage == null || this.toPage.length == 0 || this.toPage.indexOf(curPage) != -1))
                this.enter(controller);
            else
                this.leave(controller);
        };
        ControllerAction.prototype.enter = function (controller) {
        };
        ControllerAction.prototype.leave = function (controller) {
        };
        ControllerAction.prototype.setup = function (xml) {
            var str;
            str = xml.attributes.fromPage;
            if (str)
                this.fromPage = str.split(",");
            str = xml.attributes.toPage;
            if (str)
                this.toPage = str.split(",");
        };
        return ControllerAction;
    }());
    fairygui.ControllerAction = ControllerAction;
    __reflect(ControllerAction.prototype, "fairygui.ControllerAction");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GObjectPool = (function () {
        function GObjectPool() {
            this._count = 0;
            this._pool = {};
        }
        GObjectPool.prototype.clear = function () {
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
        Object.defineProperty(GObjectPool.prototype, "count", {
            get: function () {
                return this._count;
            },
            enumerable: true,
            configurable: true
        });
        GObjectPool.prototype.getObject = function (url) {
            url = fairygui.UIPackage.normalizeURL(url);
            if (url == null)
                return null;
            var arr = this._pool[url];
            if (arr != null && arr.length) {
                this._count--;
                return arr.shift();
            }
            var child = fairygui.UIPackage.createObjectFromURL(url);
            return child;
        };
        GObjectPool.prototype.returnObject = function (obj) {
            var url = obj.resourceURL;
            if (!url)
                return;
            var arr = this._pool[url];
            if (arr == null) {
                arr = new Array();
                this._pool[url] = arr;
            }
            this._count++;
            arr.push(obj);
        };
        return GObjectPool;
    }());
    fairygui.GObjectPool = GObjectPool;
    __reflect(GObjectPool.prototype, "fairygui.GObjectPool");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GTextField = (function (_super) {
        __extends(GTextField, _super);
        function GTextField() {
            var _this = _super.call(this) || this;
            _this._fontSize = 0;
            _this._leading = 0;
            _this._letterSpacing = 0;
            _this._textWidth = 0;
            _this._textHeight = 0;
            _this._fontSize = 12;
            _this._align = fairygui.AlignType.Left;
            _this._verticalAlign = fairygui.VertAlignType.Top;
            _this._text = "";
            _this._leading = 3;
            _this._color = 0;
            _this._autoSize = fairygui.AutoSizeType.Both;
            _this._widthAutoSize = true;
            _this._heightAutoSize = true;
            _this._bitmapPool = new Array();
            return _this;
        }
        GTextField.prototype.createDisplayObject = function () {
            this._textField = new egret.TextField();
            this._textField["$owner"] = this;
            this._textField.touchEnabled = false;
            this.setDisplayObject(this._textField);
        };
        GTextField.prototype.switchBitmapMode = function (val) {
            if (val && this.displayObject == this._textField) {
                if (this._bitmapContainer == null) {
                    this._bitmapContainer = new egret.Sprite();
                    this._bitmapContainer["$owner"] = this;
                }
                this.switchDisplayObject(this._bitmapContainer);
            }
            else if (!val && this.displayObject == this._bitmapContainer)
                this.switchDisplayObject(this._textField);
        };
        GTextField.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this._bitmapFont = null;
        };
        Object.defineProperty(GTextField.prototype, "text", {
            get: function () {
                return this._text;
            },
            set: function (value) {
                this._text = value;
                if (this._text == null)
                    this._text = "";
                this.updateGear(6);
                if (this.parent && this.parent._underConstruct)
                    this.renderNow();
                else
                    this.render();
            },
            enumerable: true,
            configurable: true
        });
        GTextField.prototype.updateTextFieldText = function () {
            if (this._ubbEnabled)
                this._textField.textFlow = (new egret.HtmlTextParser).parser(fairygui.ToolSet.parseUBB(fairygui.ToolSet.encodeHTML(this._text)));
            else
                this._textField.text = this._text;
        };
        Object.defineProperty(GTextField.prototype, "font", {
            get: function () {
                return this._font;
            },
            set: function (value) {
                if (this._font != value) {
                    this._font = value;
                    this.updateTextFormat();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextField.prototype, "fontSize", {
            get: function () {
                return this._fontSize;
            },
            set: function (value) {
                if (value < 0)
                    return;
                if (this._fontSize != value) {
                    this._fontSize = value;
                    this.updateTextFormat();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextField.prototype, "color", {
            get: function () {
                return this._color;
            },
            set: function (value) {
                if (this._color != value) {
                    this._color = value;
                    this.updateGear(4);
                    this.updateTextFormat();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextField.prototype, "align", {
            get: function () {
                return this._align;
            },
            set: function (value) {
                if (this._align != value) {
                    this._align = value;
                    this._textField.textAlign = fairygui.getAlignTypeString(this._align);
                    if (this._bitmapFont && !this._underConstruct)
                        this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextField.prototype, "verticalAlign", {
            get: function () {
                return this._verticalAlign;
            },
            set: function (value) {
                if (this._verticalAlign != value) {
                    this._verticalAlign = value;
                    this._textField.verticalAlign = fairygui.getVertAlignTypeString(this._verticalAlign);
                    if (this._bitmapFont && !this._underConstruct)
                        this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextField.prototype, "leading", {
            get: function () {
                return this._leading;
            },
            set: function (value) {
                if (this._leading != value) {
                    this._leading = value;
                    this.updateTextFormat();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextField.prototype, "letterSpacing", {
            get: function () {
                return this._letterSpacing;
            },
            set: function (value) {
                if (this._letterSpacing != value) {
                    this._letterSpacing = value;
                    this.updateTextFormat();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextField.prototype, "underline", {
            get: function () {
                //return this._underline;
                return false;
            },
            set: function (value) {
                //not support yet
                //this._textField.underline = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextField.prototype, "bold", {
            get: function () {
                return this._textField.bold;
            },
            set: function (value) {
                this._textField.bold = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextField.prototype, "italic", {
            get: function () {
                return this._textField.italic;
            },
            set: function (value) {
                this._textField.italic = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextField.prototype, "singleLine", {
            get: function () {
                return !this._textField.multiline;
            },
            set: function (value) {
                value = !value;
                if (this._textField.multiline != value) {
                    this._textField.multiline = value;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextField.prototype, "stroke", {
            get: function () {
                return this._textField.stroke;
            },
            set: function (value) {
                this._textField.stroke = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextField.prototype, "strokeColor", {
            get: function () {
                return this._textField.strokeColor;
            },
            set: function (value) {
                this._textField.strokeColor = value;
                this.updateGear(4);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextField.prototype, "ubbEnabled", {
            get: function () {
                return this._ubbEnabled;
            },
            set: function (value) {
                if (this._ubbEnabled != value) {
                    this._ubbEnabled = value;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextField.prototype, "autoSize", {
            get: function () {
                return this._autoSize;
            },
            set: function (value) {
                if (this._autoSize != value) {
                    this._autoSize = value;
                    this._widthAutoSize = value == fairygui.AutoSizeType.Both;
                    this._heightAutoSize = value == fairygui.AutoSizeType.Both || value == fairygui.AutoSizeType.Height;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextField.prototype, "textWidth", {
            get: function () {
                if (this._requireRender)
                    this.renderNow();
                return this._textWidth;
            },
            enumerable: true,
            configurable: true
        });
        GTextField.prototype.ensureSizeCorrect = function () {
            if (this._sizeDirty && this._requireRender)
                this.renderNow();
        };
        GTextField.prototype.updateTextFormat = function () {
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
            this._textField.lineSpacing = this._leading;
            //this._textField.letterSpacing = this._letterSpacing;
            if (!this._underConstruct)
                this.render();
        };
        GTextField.prototype.render = function () {
            if (!this._requireRender) {
                this._requireRender = true;
                egret.callLater(this.__render, this);
            }
            if (!this._sizeDirty && (this._widthAutoSize || this._heightAutoSize)) {
                this._sizeDirty = true;
                this.dispatchEventWith(fairygui.GObject.SIZE_DELAY_CHANGE);
            }
        };
        GTextField.prototype.__render = function () {
            if (this._requireRender)
                this.renderNow();
        };
        GTextField.prototype.renderNow = function (updateBounds) {
            if (updateBounds === void 0) { updateBounds = true; }
            this._requireRender = false;
            this._sizeDirty = false;
            if (this._bitmapFont != null) {
                this.renderWithBitmapFont(updateBounds);
                return;
            }
            this.switchBitmapMode(false);
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
                if (this._textField.height != this._textHeight)
                    this._textField.height = this._textHeight;
            }
            else {
                h = this.height;
                if (this._textHeight > h)
                    this._textHeight = h;
            }
            if (updateBounds) {
                this._updatingSize = true;
                this.setSize(w, h);
                this._updatingSize = false;
            }
        };
        GTextField.prototype.renderWithBitmapFont = function (updateBounds) {
            this.switchBitmapMode(true);
            var cnt = this._bitmapContainer.numChildren;
            for (var i = 0; i < cnt; i++) {
                var obj = this._bitmapContainer.getChildAt(i);
                this._bitmapPool.push(obj);
            }
            this._bitmapContainer.removeChildren();
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
            var wordWrap = !this._widthAutoSize && this._textField.multiline;
            var fontScale = this._bitmapFont.resizable ? this._fontSize / this._bitmapFont.size : 1;
            this._textWidth = 0;
            this._textHeight = 0;
            var textLength = this._text.length;
            for (var offset = 0; offset < textLength; ++offset) {
                var ch = this._text.charAt(offset);
                var cc = ch.charCodeAt(0);
                if (cc == 10) {
                    lineBuffer += ch;
                    line = LineInfo.borrow();
                    line.width = lineWidth;
                    if (lineTextHeight == 0) {
                        if (lastLineHeight == 0)
                            lastLineHeight = this._fontSize;
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
                    if (line.width > this._textWidth)
                        this._textWidth = line.width;
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
                if (cc >= 65 && cc <= 90 || cc >= 97 && cc <= 122) {
                    if (wordChars == 0)
                        wordStart = lineWidth;
                    wordChars++;
                }
                else {
                    if (wordChars > 0)
                        wordEnd = lineWidth;
                    wordChars = 0;
                }
                if (cc == 32) {
                    glyphWidth = Math.ceil(this._fontSize / 2);
                    glyphHeight = this._fontSize;
                }
                else {
                    var glyph = this._bitmapFont.glyphs[ch];
                    if (glyph) {
                        glyphWidth = Math.ceil(glyph.advance * fontScale);
                        glyphHeight = Math.ceil(glyph.lineHeight * fontScale);
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
                        lineBuffer = lineBuffer.substr(len);
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
                    if (line.width > this._textWidth)
                        this._textWidth = line.width;
                    wordChars = 0;
                    wordStart = 0;
                    wordEnd = 0;
                    this._lines.push(line);
                }
            }
            if (lineBuffer.length > 0) {
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
                if (line.width > this._textWidth)
                    this._textWidth = line.width;
                this._lines.push(line);
            }
            if (this._textWidth > 0)
                this._textWidth += GTextField.GUTTER_X * 2;
            var count = this._lines.length;
            if (count == 0) {
                this._textHeight = 0;
            }
            else {
                line = this._lines[this._lines.length - 1];
                this._textHeight = line.y + line.height + GTextField.GUTTER_Y;
            }
            var w, h = 0;
            if (this._widthAutoSize) {
                if (this._textWidth == 0)
                    w = 0;
                else
                    w = this._textWidth;
            }
            else
                w = this.width;
            if (this._heightAutoSize) {
                if (this._textHeight == 0)
                    h = 0;
                else
                    h = this._textHeight;
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
            rectWidth = this.width - GTextField.GUTTER_X * 2;
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
                    cc = ch.charCodeAt(0);
                    if (cc == 10)
                        continue;
                    if (cc == 32) {
                        charX += letterSpacing + Math.ceil(this._fontSize / 2);
                        continue;
                    }
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
                        this._bitmapContainer.addChild(bm);
                        charX += letterSpacing + Math.ceil(glyph.advance * fontScale);
                    }
                    else {
                        charX += letterSpacing;
                    }
                } //text loop
            } //line loop
        };
        GTextField.prototype.handleSizeChanged = function () {
            if (this._updatingSize)
                return;
            if (this._bitmapFont != null) {
                if (!this._widthAutoSize)
                    this.render();
                else
                    this.doAlign();
            }
            else {
                if (this._underConstruct) {
                    this._textField.width = this.width;
                    this._textField.height = this.height;
                }
                else {
                    if (!this._widthAutoSize) {
                        if (!this._heightAutoSize) {
                            this._textField.width = this.width;
                            this._textField.height = this.height;
                        }
                        else
                            this._textField.width = this.width;
                    }
                }
            }
        };
        GTextField.prototype.handleGrayedChanged = function () {
            _super.prototype.handleGrayedChanged.call(this);
            this.updateTextFormat();
        };
        GTextField.prototype.doAlign = function () {
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
        GTextField.prototype.setup_beforeAdd = function (xml) {
            _super.prototype.setup_beforeAdd.call(this, xml);
            var str;
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
                this.align = fairygui.parseAlignType(str);
            str = xml.attributes.vAlign;
            if (str)
                this.verticalAlign = fairygui.parseVertAlignType(str);
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
        GTextField.prototype.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            this.updateTextFormat();
            var str = xml.attributes.text;
            if (str != null && str.length > 0)
                this.text = str;
            this._sizeDirty = false;
        };
        GTextField.GUTTER_X = 2;
        GTextField.GUTTER_Y = 2;
        return GTextField;
    }(fairygui.GObject));
    fairygui.GTextField = GTextField;
    __reflect(GTextField.prototype, "fairygui.GTextField");
    var LineInfo = (function () {
        function LineInfo() {
            this.width = 0;
            this.height = 0;
            this.textHeight = 0;
            this.y = 0;
        }
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
    }());
    fairygui.LineInfo = LineInfo;
    __reflect(LineInfo.prototype, "fairygui.LineInfo");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GearColor = (function (_super) {
        __extends(GearColor, _super);
        function GearColor(owner) {
            return _super.call(this, owner) || this;
        }
        GearColor.prototype.init = function () {
            if (this._owner["strokeColor"] != undefined)
                this._default = new GearColorValue(this._owner.color, this._owner.strokeColor);
            else
                this._default = new GearColorValue(this._owner.color);
            this._storage = {};
        };
        GearColor.prototype.addStatus = function (pageId, value) {
            if (value == "-" || value.length == 0)
                return;
            var pos = value.indexOf(",");
            var col1;
            var col2;
            if (pos == -1) {
                col1 = fairygui.ToolSet.convertFromHtmlColor(value);
                col2 = NaN;
            }
            else {
                col1 = fairygui.ToolSet.convertFromHtmlColor(value.substr(0, pos));
                col2 = fairygui.ToolSet.convertFromHtmlColor(value.substr(pos + 1));
            }
            if (pageId == null) {
                this._default.color = col1;
                this._default.strokeColor = col2;
            }
            else
                this._storage[pageId] = new GearColorValue(col1, col2);
        };
        GearColor.prototype.apply = function () {
            this._owner._gearLocked = true;
            var gv = this._storage[this._controller.selectedPageId];
            if (!gv)
                gv = this._default;
            this._owner.color = gv.color;
            if (this._owner["strokeColor"] != undefined && !isNaN(gv.strokeColor))
                this._owner.strokeColor = gv.strokeColor;
            this._owner._gearLocked = false;
        };
        GearColor.prototype.updateState = function () {
            var gv = this._storage[this._controller.selectedPageId];
            if (!gv) {
                gv = new GearColorValue(null, null);
                this._storage[this._controller.selectedPageId] = gv;
            }
            gv.color = this._owner.color;
            if (this._owner["strokeColor"] != undefined)
                gv.strokeColor = this._owner.strokeColor;
        };
        return GearColor;
    }(fairygui.GearBase));
    fairygui.GearColor = GearColor;
    __reflect(GearColor.prototype, "fairygui.GearColor");
    var GearColorValue = (function () {
        function GearColorValue(color, strokeColor) {
            if (color === void 0) { color = 0; }
            if (strokeColor === void 0) { strokeColor = 0; }
            this.color = color;
            this.strokeColor = strokeColor;
        }
        return GearColorValue;
    }());
    __reflect(GearColorValue.prototype, "GearColorValue");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var BitmapFont = (function () {
        function BitmapFont() {
            this.size = 0;
            this.glyphs = {};
        }
        return BitmapFont;
    }());
    fairygui.BitmapFont = BitmapFont;
    __reflect(BitmapFont.prototype, "fairygui.BitmapFont");
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
        return BMGlyph;
    }());
    fairygui.BMGlyph = BMGlyph;
    __reflect(BMGlyph.prototype, "fairygui.BMGlyph");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var DragEvent = (function (_super) {
        __extends(DragEvent, _super);
        function DragEvent(type, stageX, stageY, touchPointID) {
            if (stageX === void 0) { stageX = 0; }
            if (stageY === void 0) { stageY = 0; }
            if (touchPointID === void 0) { touchPointID = -1; }
            var _this = _super.call(this, type, false) || this;
            _this.touchPointID = 0;
            _this.stageX = stageX;
            _this.stageY = stageY;
            _this.touchPointID = touchPointID;
            return _this;
        }
        DragEvent.prototype.preventDefault = function () {
            this._prevented = true;
        };
        DragEvent.prototype.isDefaultPrevented = function () {
            return this._prevented;
        };
        DragEvent.DRAG_START = "__dragStart";
        DragEvent.DRAG_END = "__dragEnd";
        DragEvent.DRAG_MOVING = "__dragMoving";
        return DragEvent;
    }(egret.Event));
    fairygui.DragEvent = DragEvent;
    __reflect(DragEvent.prototype, "fairygui.DragEvent");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var DropEvent = (function (_super) {
        __extends(DropEvent, _super);
        function DropEvent(type, source) {
            if (source === void 0) { source = null; }
            var _this = _super.call(this, type, false) || this;
            _this.source = source;
            return _this;
        }
        DropEvent.DROP = "__drop";
        return DropEvent;
    }(egret.Event));
    fairygui.DropEvent = DropEvent;
    __reflect(DropEvent.prototype, "fairygui.DropEvent");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var ItemEvent = (function (_super) {
        __extends(ItemEvent, _super);
        function ItemEvent(type, itemObject, stageX, stageY) {
            if (itemObject === void 0) { itemObject = null; }
            if (stageX === void 0) { stageX = 0; }
            if (stageY === void 0) { stageY = 0; }
            var _this = _super.call(this, type, false) || this;
            _this.itemObject = itemObject;
            _this.stageX = stageX;
            _this.stageY = stageY;
            return _this;
        }
        ItemEvent.CLICK = "___itemClick";
        return ItemEvent;
    }(egret.Event));
    fairygui.ItemEvent = ItemEvent;
    __reflect(ItemEvent.prototype, "fairygui.ItemEvent");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var StateChangeEvent = (function (_super) {
        __extends(StateChangeEvent, _super);
        function StateChangeEvent(type) {
            return _super.call(this, type, false) || this;
        }
        StateChangeEvent.CHANGED = "___stateChanged";
        return StateChangeEvent;
    }(egret.Event));
    fairygui.StateChangeEvent = StateChangeEvent;
    __reflect(StateChangeEvent.prototype, "fairygui.StateChangeEvent");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var Controller = (function (_super) {
        __extends(Controller, _super);
        function Controller() {
            var _this = _super.call(this) || this;
            _this._selectedIndex = 0;
            _this._previousIndex = 0;
            _this.changing = false;
            _this._pageIds = [];
            _this._pageNames = [];
            _this._selectedIndex = -1;
            _this._previousIndex = -1;
            return _this;
        }
        Controller.prototype.dispose = function () {
        };
        Object.defineProperty(Controller.prototype, "name", {
            get: function () {
                return this._name;
            },
            set: function (value) {
                this._name = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Controller.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Controller.prototype, "selectedIndex", {
            get: function () {
                return this._selectedIndex;
            },
            set: function (value) {
                if (this._selectedIndex != value) {
                    if (value > this._pageIds.length - 1)
                        throw "index out of bounds: " + value;
                    this.changing = true;
                    this._previousIndex = this._selectedIndex;
                    this._selectedIndex = value;
                    this._parent.applyController(this);
                    this.dispatchEvent(new fairygui.StateChangeEvent(fairygui.StateChangeEvent.CHANGED));
                    this.changing = false;
                }
            },
            enumerable: true,
            configurable: true
        });
        //功能和设置selectedIndex一样，但不会触发事件
        Controller.prototype.setSelectedIndex = function (value) {
            if (value === void 0) { value = 0; }
            if (this._selectedIndex != value) {
                if (value > this._pageIds.length - 1)
                    throw "index out of bounds: " + value;
                this.changing = true;
                this._previousIndex = this._selectedIndex;
                this._selectedIndex = value;
                this._parent.applyController(this);
                this.changing = false;
            }
        };
        Object.defineProperty(Controller.prototype, "previsousIndex", {
            get: function () {
                return this._previousIndex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Controller.prototype, "selectedPage", {
            get: function () {
                if (this._selectedIndex == -1)
                    return null;
                else
                    return this._pageNames[this._selectedIndex];
            },
            set: function (val) {
                var i = this._pageNames.indexOf(val);
                if (i == -1)
                    i = 0;
                this.selectedIndex = i;
            },
            enumerable: true,
            configurable: true
        });
        //功能和设置selectedPage一样，但不会触发事件
        Controller.prototype.setSelectedPage = function (value) {
            var i = this._pageNames.indexOf(value);
            if (i == -1)
                i = 0;
            this.setSelectedIndex(i);
        };
        Object.defineProperty(Controller.prototype, "previousPage", {
            get: function () {
                if (this._previousIndex == -1)
                    return null;
                else
                    return this._pageNames[this._previousIndex];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Controller.prototype, "pageCount", {
            get: function () {
                return this._pageIds.length;
            },
            enumerable: true,
            configurable: true
        });
        Controller.prototype.getPageName = function (index) {
            if (index === void 0) { index = 0; }
            return this._pageNames[index];
        };
        Controller.prototype.addPage = function (name) {
            if (name === void 0) { name = ""; }
            this.addPageAt(name, this._pageIds.length);
        };
        Controller.prototype.addPageAt = function (name, index) {
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
        Controller.prototype.removePage = function (name) {
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
        Controller.prototype.removePageAt = function (index) {
            if (index === void 0) { index = 0; }
            this._pageIds.splice(index, 1);
            this._pageNames.splice(index, 1);
            if (this._selectedIndex >= this._pageIds.length)
                this.selectedIndex = this._selectedIndex - 1;
            else
                this._parent.applyController(this);
        };
        Controller.prototype.clearPages = function () {
            this._pageIds.length = 0;
            this._pageNames.length = 0;
            if (this._selectedIndex != -1)
                this.selectedIndex = -1;
            else
                this._parent.applyController(this);
        };
        Controller.prototype.hasPage = function (aName) {
            return this._pageNames.indexOf(aName) != -1;
        };
        Controller.prototype.getPageIndexById = function (aId) {
            return this._pageIds.indexOf(aId);
        };
        Controller.prototype.getPageIdByName = function (aName) {
            var i = this._pageNames.indexOf(aName);
            if (i != -1)
                return this._pageIds[i];
            else
                return null;
        };
        Controller.prototype.getPageNameById = function (aId) {
            var i = this._pageIds.indexOf(aId);
            if (i != -1)
                return this._pageNames[i];
            else
                return null;
        };
        Controller.prototype.getPageId = function (index) {
            if (index === void 0) { index = 0; }
            return this._pageIds[index];
        };
        Object.defineProperty(Controller.prototype, "selectedPageId", {
            get: function () {
                if (this._selectedIndex == -1)
                    return null;
                else
                    return this._pageIds[this._selectedIndex];
            },
            set: function (val) {
                var i = this._pageIds.indexOf(val);
                this.selectedIndex = i;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Controller.prototype, "oppositePageId", {
            set: function (val) {
                var i = this._pageIds.indexOf(val);
                if (i > 0)
                    this.selectedIndex = 0;
                else if (this._pageIds.length > 1)
                    this.selectedIndex = 1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Controller.prototype, "previousPageId", {
            get: function () {
                if (this._previousIndex == -1)
                    return null;
                else
                    return this._pageIds[this._previousIndex];
            },
            enumerable: true,
            configurable: true
        });
        Controller.prototype.runActions = function () {
            if (this._actions) {
                var cnt = this._actions.length;
                for (var i = 0; i < cnt; i++)
                    this._actions[i].run(this, this.previousPageId, this.selectedPageId);
            }
        };
        Controller.prototype.setup = function (xml) {
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
            var col = xml.children;
            var length1 = col.length;
            if (length1 > 0) {
                if (!this._actions)
                    this._actions = new Array();
                for (var i1 = 0; i1 < length1; i1++) {
                    var cxml = col[i1];
                    var action = fairygui.ControllerAction.createAction(cxml.attributes.type);
                    action.setup(cxml);
                    this._actions.push(action);
                }
            }
            str = xml.attributes.transitions;
            if (str) {
                if (!this._actions)
                    this._actions = new Array();
                arr = str.split(",");
                cnt = arr.length;
                var ii;
                for (i = 0; i < cnt; i++) {
                    str = arr[i];
                    if (!str)
                        continue;
                    var taction = new fairygui.PlayTransitionAction();
                    k = str.indexOf("=");
                    taction.transitionName = str.substr(k + 1);
                    str = str.substring(0, k);
                    k = str.indexOf("-");
                    ii = parseInt(str.substring(k + 1));
                    if (ii < this._pageIds.length)
                        taction.toPage = [this._pageIds[ii]];
                    str = str.substring(0, k);
                    if (str != "*") {
                        ii = parseInt(str);
                        if (ii < this._pageIds.length)
                            taction.fromPage = [this._pageIds[ii]];
                    }
                    taction.stopOnExit = true;
                    this._actions.push(taction);
                }
            }
            if (this._parent && this._pageIds.length > 0)
                this._selectedIndex = 0;
            else
                this._selectedIndex = -1;
        };
        Controller._nextPageId = 0;
        return Controller;
    }(egret.EventDispatcher));
    fairygui.Controller = Controller;
    __reflect(Controller.prototype, "fairygui.Controller");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var ToolSet = (function () {
        function ToolSet() {
        }
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
        ToolSet.displayObjectToGObject = function (obj) {
            while (obj != null && !(obj instanceof egret.Stage)) {
                if (obj["$owner"])
                    return obj["$owner"];
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
        ToolSet.clamp = function (value, min, max) {
            if (value < min)
                value = min;
            else if (value > max)
                value = max;
            return value;
        };
        ToolSet.clamp01 = function (value) {
            if (value > 1)
                value = 1;
            else if (value < 0)
                value = 0;
            return value;
        };
        ToolSet.lerp = function (start, end, percent) {
            return (start + percent * (end - start));
        };
        ToolSet.defaultUBBParser = new fairygui.UBBParser();
        return ToolSet;
    }());
    fairygui.ToolSet = ToolSet;
    __reflect(ToolSet.prototype, "fairygui.ToolSet");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var ColorMatrix = (function () {
        function ColorMatrix() {
            this.matrix = new Array(ColorMatrix.LENGTH);
            this.reset();
        }
        ColorMatrix.create = function (p_brightness, p_contrast, p_saturation, p_hue) {
            var ret = new ColorMatrix();
            ret.adjustColor(p_brightness, p_contrast, p_saturation, p_hue);
            return ret;
        };
        // public methods:
        ColorMatrix.prototype.reset = function () {
            for (var i = 0; i < ColorMatrix.LENGTH; i++) {
                this.matrix[i] = ColorMatrix.IDENTITY_MATRIX[i];
            }
        };
        ColorMatrix.prototype.invert = function () {
            this.multiplyMatrix([-1, 0, 0, 0, 255,
                0, -1, 0, 0, 255,
                0, 0, -1, 0, 255,
                0, 0, 0, 1, 0]);
        };
        ColorMatrix.prototype.adjustColor = function (p_brightness, p_contrast, p_saturation, p_hue) {
            this.adjustHue(p_hue);
            this.adjustContrast(p_contrast);
            this.adjustBrightness(p_brightness);
            this.adjustSaturation(p_saturation);
        };
        ColorMatrix.prototype.adjustBrightness = function (p_val) {
            p_val = this.cleanValue(p_val, 1) * 255;
            this.multiplyMatrix([
                1, 0, 0, 0, p_val,
                0, 1, 0, 0, p_val,
                0, 0, 1, 0, p_val,
                0, 0, 0, 1, 0
            ]);
        };
        ColorMatrix.prototype.adjustContrast = function (p_val) {
            p_val = this.cleanValue(p_val, 1);
            var s = p_val + 1;
            var o = 128 * (1 - s);
            this.multiplyMatrix([
                s, 0, 0, 0, o,
                0, s, 0, 0, o,
                0, 0, s, 0, o,
                0, 0, 0, 1, 0
            ]);
        };
        ColorMatrix.prototype.adjustSaturation = function (p_val) {
            p_val = this.cleanValue(p_val, 1);
            p_val += 1;
            var invSat = 1 - p_val;
            var invLumR = invSat * ColorMatrix.LUMA_R;
            var invLumG = invSat * ColorMatrix.LUMA_G;
            var invLumB = invSat * ColorMatrix.LUMA_B;
            this.multiplyMatrix([
                (invLumR + p_val), invLumG, invLumB, 0, 0,
                invLumR, (invLumG + p_val), invLumB, 0, 0,
                invLumR, invLumG, (invLumB + p_val), 0, 0,
                0, 0, 0, 1, 0
            ]);
        };
        ColorMatrix.prototype.adjustHue = function (p_val) {
            p_val = this.cleanValue(p_val, 1);
            p_val *= Math.PI;
            var cos = Math.cos(p_val);
            var sin = Math.sin(p_val);
            this.multiplyMatrix([
                ((ColorMatrix.LUMA_R + (cos * (1 - ColorMatrix.LUMA_R))) + (sin * -(ColorMatrix.LUMA_R))), ((ColorMatrix.LUMA_G + (cos * -(ColorMatrix.LUMA_G))) + (sin * -(ColorMatrix.LUMA_G))), ((ColorMatrix.LUMA_B + (cos * -(ColorMatrix.LUMA_B))) + (sin * (1 - ColorMatrix.LUMA_B))), 0, 0,
                ((ColorMatrix.LUMA_R + (cos * -(ColorMatrix.LUMA_R))) + (sin * 0.143)), ((ColorMatrix.LUMA_G + (cos * (1 - ColorMatrix.LUMA_G))) + (sin * 0.14)), ((ColorMatrix.LUMA_B + (cos * -(ColorMatrix.LUMA_B))) + (sin * -0.283)), 0, 0,
                ((ColorMatrix.LUMA_R + (cos * -(ColorMatrix.LUMA_R))) + (sin * -((1 - ColorMatrix.LUMA_R)))), ((ColorMatrix.LUMA_G + (cos * -(ColorMatrix.LUMA_G))) + (sin * ColorMatrix.LUMA_G)), ((ColorMatrix.LUMA_B + (cos * (1 - ColorMatrix.LUMA_B))) + (sin * ColorMatrix.LUMA_B)), 0, 0,
                0, 0, 0, 1, 0
            ]);
        };
        ColorMatrix.prototype.concat = function (p_matrix) {
            if (p_matrix.length != ColorMatrix.LENGTH) {
                return;
            }
            this.multiplyMatrix(p_matrix);
        };
        ColorMatrix.prototype.clone = function () {
            var result = new ColorMatrix();
            result.copyMatrix(this.matrix);
            return result;
        };
        ColorMatrix.prototype.copyMatrix = function (p_matrix) {
            var l = ColorMatrix.LENGTH;
            for (var i = 0; i < l; i++) {
                this.matrix[i] = p_matrix[i];
            }
        };
        ColorMatrix.prototype.multiplyMatrix = function (p_matrix) {
            var col = [];
            var i = 0;
            for (var y = 0; y < 4; ++y) {
                for (var x = 0; x < 5; ++x) {
                    col[i + x] = p_matrix[i] * this.matrix[x] +
                        p_matrix[i + 1] * this.matrix[x + 5] +
                        p_matrix[i + 2] * this.matrix[x + 10] +
                        p_matrix[i + 3] * this.matrix[x + 15] +
                        (x == 4 ? p_matrix[i + 4] : 0);
                }
                i += 5;
            }
            this.copyMatrix(col);
        };
        ColorMatrix.prototype.cleanValue = function (p_val, p_limit) {
            return Math.min(p_limit, Math.max(-p_limit, p_val));
        };
        // identity matrix constant:
        ColorMatrix.IDENTITY_MATRIX = [
            1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, 1, 0
        ];
        ColorMatrix.LENGTH = ColorMatrix.IDENTITY_MATRIX.length;
        ColorMatrix.LUMA_R = 0.299;
        ColorMatrix.LUMA_G = 0.587;
        ColorMatrix.LUMA_B = 0.114;
        return ColorMatrix;
    }());
    fairygui.ColorMatrix = ColorMatrix;
    __reflect(ColorMatrix.prototype, "fairygui.ColorMatrix");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var PlayTransitionAction = (function (_super) {
        __extends(PlayTransitionAction, _super);
        function PlayTransitionAction() {
            var _this = _super.call(this) || this;
            _this.repeat = 1;
            _this.delay = 0;
            _this.stopOnExit = false;
            return _this;
        }
        PlayTransitionAction.prototype.enter = function (controller) {
            var trans = controller.parent.getTransition(this.transitionName);
            if (trans) {
                if (this._currentTransition && this._currentTransition.playing)
                    trans.changeRepeat(this.repeat);
                else
                    trans.play(null, null, null, this.repeat, this.delay);
                this._currentTransition = trans;
            }
        };
        PlayTransitionAction.prototype.leave = function (controller) {
            if (this.stopOnExit && this._currentTransition) {
                this._currentTransition.stop();
                this._currentTransition = null;
            }
        };
        PlayTransitionAction.prototype.setup = function (xml) {
            _super.prototype.setup.call(this, xml);
            this.transitionName = xml.attributes.transition;
            var str;
            str = xml.attributes.repeat;
            if (str)
                this.repeat = parseInt(str);
            str = xml.attributes.delay;
            if (str)
                this.delay = parseFloat(str);
            str = xml.attributes.stopOnExit;
            this.stopOnExit = str == "true";
        };
        return PlayTransitionAction;
    }(fairygui.ControllerAction));
    fairygui.PlayTransitionAction = PlayTransitionAction;
    __reflect(PlayTransitionAction.prototype, "fairygui.PlayTransitionAction");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var ChangePageAction = (function (_super) {
        __extends(ChangePageAction, _super);
        function ChangePageAction() {
            return _super.call(this) || this;
        }
        ChangePageAction.prototype.enter = function (controller) {
            if (!this.controllerName)
                return;
            var gcom;
            if (this.objectId) {
                var obj = controller.parent.getChildById(this.objectId);
                if (obj instanceof fairygui.GComponent)
                    gcom = obj;
                else
                    return;
            }
            else
                gcom = controller.parent;
            if (gcom) {
                var cc = gcom.getController(this.controllerName);
                if (cc && cc != controller && !cc.changing)
                    cc.selectedPageId = this.targetPage;
            }
        };
        ChangePageAction.prototype.setup = function (xml) {
            _super.prototype.setup.call(this, xml);
            this.objectId = xml.attributes.objectId;
            this.controllerName = xml.attributes.controller;
            this.targetPage = xml.attributes.targetPage;
        };
        return ChangePageAction;
    }(fairygui.ControllerAction));
    fairygui.ChangePageAction = ChangePageAction;
    __reflect(ChangePageAction.prototype, "fairygui.ChangePageAction");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GearSize = (function (_super) {
        __extends(GearSize, _super);
        function GearSize(owner) {
            return _super.call(this, owner) || this;
        }
        GearSize.prototype.init = function () {
            this._default = new GearSizeValue(this._owner.width, this._owner.height, this._owner.scaleX, this._owner.scaleY);
            this._storage = {};
        };
        GearSize.prototype.addStatus = function (pageId, value) {
            if (value == "-" || value.length == 0)
                return;
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
        GearSize.prototype.apply = function () {
            var gv = this._storage[this._controller.selectedPageId];
            if (!gv)
                gv = this._default;
            if (this._tween && !fairygui.UIPackage._constructing && !fairygui.GearBase.disableAllTweenEffect) {
                if (this.tweener != null) {
                    if (this._tweenTarget.width != gv.width || this._tweenTarget.height != gv.height
                        || this._tweenTarget.scaleX != gv.scaleX || this._tweenTarget.scaleY != gv.scaleY) {
                        this.tweener["tick"] ? this.tweener["tick"](100000000) : this.tweener["$tick"](100000000);
                        this.tweener = null;
                    }
                    else
                        return;
                }
                var a = gv.width != this._owner.width || gv.height != this._owner.height;
                var b = gv.scaleX != this._owner.scaleX || gv.scaleY != this._owner.scaleY;
                if (a || b) {
                    if (this._owner.checkGearController(0, this._controller))
                        this._displayLockToken = this._owner.addDisplayLock();
                    this._tweenTarget = gv;
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
                    this.tweener = egret.Tween.get(this._tweenValue, vars)
                        .wait(this._tweenDelay * 1000)
                        .to({ width: gv.width, height: gv.height, scaleX: gv.scaleX, scaleY: gv.scaleY }, this._tweenTime * 1000, this._easeType)
                        .call(function () {
                        if (this._displayLockToken != 0) {
                            this._owner.releaseDisplayLock(this._displayLockToken);
                            this._displayLockToken = 0;
                        }
                        this._tweener = null;
                        this._owner.dispatchEventWith(fairygui.GObject.GEAR_STOP, false);
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
        GearSize.prototype.updateState = function () {
            var gv = this._storage[this._controller.selectedPageId];
            if (!gv) {
                gv = new GearSizeValue();
                this._storage[this._controller.selectedPageId] = gv;
            }
            gv.width = this._owner.width;
            gv.height = this._owner.height;
            gv.scaleX = this._owner.scaleX;
            gv.scaleY = this._owner.scaleY;
        };
        GearSize.prototype.updateFromRelations = function (dx, dy) {
            if (this._controller == null || this._storage == null)
                return;
            for (var key in this._storage) {
                var gv = this._storage[key];
                gv.width += dx;
                gv.height += dy;
            }
            this._default.width += dx;
            this._default.height += dy;
            this.updateState();
        };
        return GearSize;
    }(fairygui.GearBase));
    fairygui.GearSize = GearSize;
    __reflect(GearSize.prototype, "fairygui.GearSize");
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
        return GearSizeValue;
    }());
    __reflect(GearSizeValue.prototype, "GearSizeValue");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GearXY = (function (_super) {
        __extends(GearXY, _super);
        function GearXY(owner) {
            return _super.call(this, owner) || this;
        }
        GearXY.prototype.init = function () {
            this._default = new egret.Point(this._owner.x, this._owner.y);
            this._storage = {};
        };
        GearXY.prototype.addStatus = function (pageId, value) {
            if (value == "-" || value.length == 0)
                return;
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
        GearXY.prototype.apply = function () {
            var pt = this._storage[this._controller.selectedPageId];
            if (!pt)
                pt = this._default;
            if (this._tween && !fairygui.UIPackage._constructing && !fairygui.GearBase.disableAllTweenEffect) {
                if (this.tweener) {
                    if (this._tweenTarget.x != pt.x || this._tweenTarget.y != pt.y) {
                        this.tweener["tick"] ? this.tweener["tick"](100000000) : this.tweener["$tick"](100000000);
                        this.tweener = null;
                    }
                    else
                        return;
                }
                if (this._owner.x != pt.x || this._owner.y != pt.y) {
                    if (this._owner.checkGearController(0, this._controller))
                        this._displayLockToken = this._owner.addDisplayLock();
                    this._tweenTarget = pt;
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
                    this.tweener = egret.Tween.get(this._tweenValue, vars)
                        .wait(this._tweenDelay * 1000)
                        .to({ x: pt.x, y: pt.y }, this._tweenTime * 1000, this._easeType)
                        .call(function () {
                        if (this._displayLockToken != 0) {
                            this._owner.releaseDisplayLock(this._displayLockToken);
                            this._displayLockToken = 0;
                        }
                        this._tweener = null;
                        this._owner.dispatchEventWith(fairygui.GObject.GEAR_STOP, false);
                    }, this);
                }
            }
            else {
                this._owner._gearLocked = true;
                this._owner.setXY(pt.x, pt.y);
                this._owner._gearLocked = false;
            }
        };
        GearXY.prototype.updateState = function () {
            var pt = this._storage[this._controller.selectedPageId];
            if (!pt) {
                pt = new egret.Point();
                this._storage[this._controller.selectedPageId] = pt;
            }
            pt.x = this._owner.x;
            pt.y = this._owner.y;
        };
        GearXY.prototype.updateFromRelations = function (dx, dy) {
            if (this._controller == null || this._storage == null)
                return;
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
    }(fairygui.GearBase));
    fairygui.GearXY = GearXY;
    __reflect(GearXY.prototype, "fairygui.GearXY");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GearText = (function (_super) {
        __extends(GearText, _super);
        function GearText(owner) {
            return _super.call(this, owner) || this;
        }
        GearText.prototype.init = function () {
            this._default = this._owner.text;
            this._storage = {};
        };
        GearText.prototype.addStatus = function (pageId, value) {
            if (pageId == null)
                this._default = value;
            else
                this._storage[pageId] = value;
        };
        GearText.prototype.apply = function () {
            this._owner._gearLocked = true;
            var data = this._storage[this._controller.selectedPageId];
            if (data != undefined)
                this._owner.text = data;
            else
                this._owner.text = this._default;
            this._owner._gearLocked = false;
        };
        GearText.prototype.updateState = function () {
            this._storage[this._controller.selectedPageId] = this._owner.text;
        };
        return GearText;
    }(fairygui.GearBase));
    fairygui.GearText = GearText;
    __reflect(GearText.prototype, "fairygui.GearText");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GearIcon = (function (_super) {
        __extends(GearIcon, _super);
        function GearIcon(owner) {
            return _super.call(this, owner) || this;
        }
        GearIcon.prototype.init = function () {
            this._default = this._owner.icon;
            this._storage = {};
        };
        GearIcon.prototype.addStatus = function (pageId, value) {
            if (pageId == null)
                this._default = value;
            else
                this._storage[pageId] = value;
        };
        GearIcon.prototype.apply = function () {
            this._owner._gearLocked = true;
            var data = this._storage[this._controller.selectedPageId];
            if (data != undefined)
                this._owner.icon = data;
            else
                this._owner.icon = this._default;
            this._owner._gearLocked = false;
        };
        GearIcon.prototype.updateState = function () {
            this._storage[this._controller.selectedPageId] = this._owner.icon;
        };
        return GearIcon;
    }(fairygui.GearBase));
    fairygui.GearIcon = GearIcon;
    __reflect(GearIcon.prototype, "fairygui.GearIcon");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var Transition = (function () {
        function Transition(owner) {
            this.autoPlayRepeat = 1;
            this.autoPlayDelay = 0;
            this._ownerBaseX = 0;
            this._ownerBaseY = 0;
            this._totalTimes = 0;
            this._totalTasks = 0;
            this._playing = false;
            this._options = 0;
            this._maxTime = 0;
            this._owner = owner;
            this._items = new Array();
        }
        Object.defineProperty(Transition.prototype, "autoPlay", {
            get: function () {
                return this._autoPlay;
            },
            set: function (value) {
                if (this._autoPlay != value) {
                    this._autoPlay = value;
                    if (this._autoPlay) {
                        if (this._owner.onStage)
                            this.play(null, null, this.autoPlayRepeat, this.autoPlayDelay);
                    }
                    else {
                        if (!this._owner.onStage)
                            this.stop(false, true);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Transition.prototype.play = function (onComplete, onCompleteObj, onCompleteParam, times, delay) {
            if (onComplete === void 0) { onComplete = null; }
            if (onCompleteObj === void 0) { onCompleteObj = null; }
            if (onCompleteParam === void 0) { onCompleteParam = null; }
            if (times === void 0) { times = 1; }
            if (delay === void 0) { delay = 0; }
            this._play(onComplete, onCompleteObj, onCompleteParam, times, delay, false);
        };
        Transition.prototype.playReverse = function (onComplete, onCompleteObj, onCompleteParam, times, delay) {
            if (onComplete === void 0) { onComplete = null; }
            if (onCompleteObj === void 0) { onCompleteObj = null; }
            if (onCompleteParam === void 0) { onCompleteParam = null; }
            if (times === void 0) { times = 1; }
            if (delay === void 0) { delay = 0; }
            this._play(onComplete, onCompleteObj, onCompleteParam, times, delay, true);
        };
        Transition.prototype.changeRepeat = function (value) {
            this._totalTimes = value;
        };
        Transition.prototype._play = function (onComplete, onCompleteObj, onCompleteParam, times, delay, reversed) {
            if (onComplete === void 0) { onComplete = null; }
            if (onCompleteObj === void 0) { onCompleteObj = null; }
            if (onCompleteParam === void 0) { onCompleteParam = null; }
            if (times === void 0) { times = 1; }
            if (delay === void 0) { delay = 0; }
            if (reversed === void 0) { reversed = false; }
            this.stop();
            this._totalTimes = times;
            this._reversed = reversed;
            this.internalPlay(delay);
            this._playing = this._totalTasks > 0;
            if (this._playing) {
                this._onComplete = onComplete;
                this._onCompleteParam = onCompleteParam;
                this._onCompleteObj = onCompleteObj;
                if ((this._options & Transition.OPTION_IGNORE_DISPLAY_CONTROLLER) != 0) {
                    var cnt = this._items.length;
                    for (var i = 0; i < cnt; i++) {
                        var item = this._items[i];
                        if (item.target != null && item.target != this._owner)
                            item.displayLockToken = item.target.addDisplayLock();
                    }
                }
            }
            else if (onComplete != null) {
                if (onComplete.length > 0)
                    onComplete.call(onCompleteObj, onCompleteParam);
                else
                    onComplete(onCompleteObj);
            }
        };
        Transition.prototype.stop = function (setToComplete, processCallback) {
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
        Transition.prototype.stopItem = function (item, setToComplete) {
            if (item.displayLockToken != 0) {
                item.target.releaseDisplayLock(item.displayLockToken);
                item.displayLockToken = 0;
            }
            if (item.type == TransitionActionType.ColorFilter && item.filterCreated)
                item.target.filters = null;
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
        Transition.prototype.dispose = function () {
            if (!this._playing)
                return;
            this._playing = false;
            var cnt = this._items.length;
            for (var i = 0; i < cnt; i++) {
                var item = this._items[i];
                if (item.target == null || item.completed)
                    continue;
                if (item.tweener != null) {
                    item.tweener.setPaused(true);
                    item.tweener = null;
                }
                if (item.type == TransitionActionType.Transition) {
                    var trans = item.target.getTransition(item.value.s);
                    if (trans != null)
                        trans.dispose();
                }
                else if (item.type == TransitionActionType.Shake) {
                    fairygui.GTimers.inst.remove(this.__shake, item);
                }
            }
        };
        Object.defineProperty(Transition.prototype, "playing", {
            get: function () {
                return this._playing;
            },
            enumerable: true,
            configurable: true
        });
        Transition.prototype.setValue = function (label) {
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
                        if (args.length > 1)
                            value.b = args[1];
                        break;
                    case TransitionActionType.Visible:
                        value.b = args[0];
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
                    case TransitionActionType.ColorFilter:
                        value.f1 = parseFloat(args[0]);
                        value.f2 = parseFloat(args[1]);
                        value.f3 = parseFloat(args[2]);
                        value.f4 = parseFloat(args[3]);
                        break;
                }
            }
        };
        Transition.prototype.setHook = function (label, callback, thisObj) {
            var cnt = this._items.length;
            for (var i = 0; i < cnt; i++) {
                var item = this._items[i];
                if (item.label == label) {
                    item.hook = callback;
                    item.hookObj = thisObj;
                    break;
                }
                else if (item.label2 == label) {
                    item.hook2 = callback;
                    item.hook2Obj = thisObj;
                    break;
                }
            }
        };
        Transition.prototype.clearHooks = function () {
            var cnt = this._items.length;
            for (var i = 0; i < cnt; i++) {
                var item = this._items[i];
                item.hook = null;
                item.hookObj = null;
                item.hook2 = null;
                item.hook2Obj = null;
            }
        };
        Transition.prototype.setTarget = function (label, newTarget) {
            var cnt = this._items.length;
            var value;
            for (var i = 0; i < cnt; i++) {
                var item = this._items[i];
                if (item.label == null && item.label2 == null)
                    continue;
                item.targetId = newTarget.id;
            }
        };
        Transition.prototype.setDuration = function (label, value) {
            var cnt = this._items.length;
            for (var i = 0; i < cnt; i++) {
                var item = this._items[i];
                if (item.tween && item.label == label)
                    item.duration = value;
            }
        };
        Transition.prototype.updateFromRelations = function (targetId, dx, dy) {
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
        Transition.prototype.OnOwnerRemovedFromStage = function () {
            if ((this._options & Transition.OPTION_AUTO_STOP_DISABLED) == 0)
                this.stop((this._options & Transition.OPTION_AUTO_STOP_AT_END) != 0 ? true : false, false);
        };
        Transition.prototype.internalPlay = function (delay) {
            if (delay === void 0) { delay = 0; }
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
                        startTime = delay + this._maxTime - item.time - item.duration;
                    else
                        startTime = delay + item.time;
                    if (startTime > 0 && (item.type == TransitionActionType.XY || item.type == TransitionActionType.Size)) {
                        this._totalTasks++;
                        item.completed = false;
                        item.tweener = egret.Tween.get(item.value).wait(startTime * 1000).call(this.__delayCall, this, [item]);
                    }
                    else
                        this.startTween(item, startTime);
                }
                else {
                    if (this._reversed)
                        startTime = delay + this._maxTime - item.time;
                    else
                        startTime = delay + item.time;
                    if (startTime == 0)
                        this.applyValue(item, item.value);
                    else {
                        this._totalTasks++;
                        item.completed = false;
                        item.tweener = egret.Tween.get(item.value).wait(startTime * 1000).call(this.__delayCall2, this, [item]);
                    }
                }
            }
        };
        Transition.prototype.prepareValue = function (item, toProps, reversed) {
            if (reversed === void 0) { reversed = false; }
            var startValue;
            var endValue;
            if (reversed) {
                startValue = item.endValue;
                endValue = item.startValue;
            }
            else {
                startValue = item.startValue;
                endValue = item.endValue;
            }
            switch (item.type) {
                case TransitionActionType.XY:
                case TransitionActionType.Size:
                    if (item.type == TransitionActionType.XY) {
                        if (item.target == this._owner) {
                            if (!startValue.b1)
                                startValue.f1 = 0;
                            if (!startValue.b2)
                                startValue.f2 = 0;
                        }
                        else {
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
                    item.value.f1 = startValue.f1;
                    item.value.f2 = startValue.f2;
                    if (!endValue.b1)
                        endValue.f1 = item.value.f1;
                    if (!endValue.b2)
                        endValue.f2 = item.value.f2;
                    item.value.b1 = startValue.b1 || endValue.b1;
                    item.value.b2 = startValue.b2 || endValue.b2;
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
        };
        Transition.prototype.startTween = function (item, delay) {
            var initProps, toProps;
            initProps = {};
            toProps = {};
            this._totalTasks++;
            item.completed = false;
            this.prepareValue(item, toProps, this._reversed);
            item.tweener = egret.Tween.get(item.value, initProps);
            if (delay != 0)
                item.tweener.wait(delay * 1000);
            else
                this.applyValue(item, item.value);
            item.tweener.call(this.__tweenStart, this, [item]);
            item.tweener.to(toProps, item.duration * 1000, item.easeType);
            if (item.repeat != 0) {
                item.tweenTimes = 0;
                item.tweener.call(this.__tweenRepeatComplete, this, [item]);
            }
            else
                item.tweener.call(this.__tweenComplete, this, [item]);
        };
        Transition.prototype.__delayCall = function (item) {
            item.tweener = null;
            this._totalTasks--;
            this.startTween(item, 0);
        };
        Transition.prototype.__delayCall2 = function (item) {
            item.tweener = null;
            this._totalTasks--;
            item.completed = true;
            this.applyValue(item, item.value);
            if (item.hook != null)
                item.hook.call(item.hookObj);
            this.checkAllComplete();
        };
        Transition.prototype.__tweenStart = function (item) {
            if (item.tweener != null) {
                if (item.hook != null)
                    item.hook.call(item.hookObj);
                //因为egret的onChange在wait的时候已经开始调用，因此只能放在这里注册侦听
                item.tweener.addEventListener("change", this.__tweenUpdate, [this, item]);
            }
        };
        Transition.prototype.__tweenUpdate = function () {
            var args = this;
            var trans = args[0];
            var item = args[1];
            trans.applyValue(item, item.value);
        };
        Transition.prototype.__tweenComplete = function (item) {
            item.tweener = null;
            this._totalTasks--;
            item.completed = true;
            if (item.hook2 != null)
                item.hook2.call(item.hook2Obj);
            this.checkAllComplete();
        };
        Transition.prototype.__tweenRepeatComplete = function (item) {
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
        Transition.prototype.__playTransComplete = function (item) {
            this._totalTasks--;
            item.completed = true;
            this.checkAllComplete();
        };
        Transition.prototype.checkAllComplete = function () {
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
                        var cnt = this._items.length;
                        for (var i = 0; i < cnt; i++) {
                            var item = this._items[i];
                            if (item.target != null) {
                                if (item.displayLockToken != 0) {
                                    item.target.releaseDisplayLock(item.displayLockToken);
                                    item.displayLockToken = 0;
                                }
                                if (item.filterCreated) {
                                    item.filterCreated = false;
                                    item.target.filters = null;
                                }
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
        Transition.prototype.applyValue = function (item, value) {
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
                case TransitionActionType.Skew:
                    item.target.setSkew(value.f1, value.f2);
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
                case TransitionActionType.Transition:
                    var trans = item.target.getTransition(value.s);
                    if (trans != null) {
                        if (value.i == 0)
                            trans.stop(false, true);
                        else if (trans.playing)
                            trans._totalTimes = value.i;
                        else {
                            item.completed = false;
                            this._totalTasks++;
                            if (this._reversed)
                                trans.playReverse(this.__playTransComplete, this, item, item.value.i);
                            else
                                trans.play(this.__playTransComplete, this, item, item.value.i);
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
                case TransitionActionType.ColorFilter:
                    var arr = item.target.filters;
                    var cf;
                    if (!arr || !(arr[0] instanceof egret.ColorMatrixFilter)) {
                        cf = new egret.ColorMatrixFilter();
                        arr = [cf];
                        item.filterCreated = true;
                    }
                    else
                        cf = arr[0];
                    var cm = new fairygui.ColorMatrix();
                    cm.adjustBrightness(value.f1);
                    cm.adjustContrast(value.f2);
                    cm.adjustSaturation(value.f3);
                    cm.adjustHue(value.f4);
                    cf.matrix = cm.matrix;
                    item.target.filters = arr;
            }
            item.target._gearLocked = false;
        };
        Transition.prototype.__shake = function (trans) {
            var item = this;
            trans.__shakeItem(item);
        };
        Transition.prototype.__shakeItem = function (item) {
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
        Transition.prototype.setup = function (xml) {
            this.name = xml.attributes.name;
            var str = xml.attributes.options;
            if (str)
                this._options = parseInt(str);
            this._autoPlay = xml.attributes.autoPlay == "true";
            if (this._autoPlay) {
                str = xml.attributes.autoPlayRepeat;
                if (str)
                    this.autoPlayRepeat = parseInt(str);
                str = xml.attributes.autoPlayDelay;
                if (str)
                    this.autoPlayDelay = parseFloat(str);
            }
            var col = xml.children;
            var length1 = col.length;
            for (var i1 = 0; i1 < length1; i1++) {
                var cxml = col[i1];
                if (cxml.name != "item")
                    continue;
                var item = new TransitionItem();
                this._items.push(item);
                item.time = parseInt(cxml.attributes.time) / Transition.FRAME_RATE;
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
                if (item.tween) {
                    item.duration = parseInt(cxml.attributes.duration) / Transition.FRAME_RATE;
                    if (item.time + item.duration > this._maxTime)
                        this._maxTime = item.time + item.duration;
                    str = cxml.attributes.ease;
                    if (str)
                        item.easeType = fairygui.parseEaseType(str);
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
        Transition.prototype.decodeValue = function (type, str, value) {
            var arr;
            switch (type) {
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
                case TransitionActionType.ColorFilter:
                    arr = str.split(",");
                    value.f1 = parseFloat(arr[0]);
                    value.f2 = parseFloat(arr[1]);
                    value.f3 = parseFloat(arr[2]);
                    value.f4 = parseFloat(arr[3]);
                    break;
            }
        };
        Transition.OPTION_IGNORE_DISPLAY_CONTROLLER = 1;
        Transition.OPTION_AUTO_STOP_DISABLED = 2;
        Transition.OPTION_AUTO_STOP_AT_END = 4;
        Transition.FRAME_RATE = 24;
        return Transition;
    }());
    fairygui.Transition = Transition;
    __reflect(Transition.prototype, "fairygui.Transition");
    var TransitionActionType = (function () {
        function TransitionActionType() {
        }
        TransitionActionType.XY = 0;
        TransitionActionType.Size = 1;
        TransitionActionType.Scale = 2;
        TransitionActionType.Pivot = 3;
        TransitionActionType.Alpha = 4;
        TransitionActionType.Rotation = 5;
        TransitionActionType.Color = 6;
        TransitionActionType.Animation = 7;
        TransitionActionType.Visible = 8;
        TransitionActionType.Sound = 9;
        TransitionActionType.Transition = 10;
        TransitionActionType.Shake = 11;
        TransitionActionType.ColorFilter = 12;
        TransitionActionType.Skew = 13;
        TransitionActionType.Unknown = 14;
        return TransitionActionType;
    }());
    __reflect(TransitionActionType.prototype, "TransitionActionType");
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
            this.displayLockToken = 0;
            this.easeType = egret.Ease.quadOut;
            this.value = new TransitionValue();
            this.startValue = new TransitionValue();
            this.endValue = new TransitionValue();
        }
        return TransitionItem;
    }());
    __reflect(TransitionItem.prototype, "TransitionItem");
    var TransitionValue = (function () {
        function TransitionValue() {
            this.f1 = 0;
            this.f2 = 0;
            this.f3 = 0;
            this.f4 = 0;
            this.i = 0;
            this.c = 0;
            this.b = false;
            this.b1 = true;
            this.b2 = true;
        }
        return TransitionValue;
    }());
    __reflect(TransitionValue.prototype, "TransitionValue");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var Frame = (function () {
        function Frame() {
            this.addDelay = 0;
            this.rect = new egret.Rectangle();
        }
        return Frame;
    }());
    fairygui.Frame = Frame;
    __reflect(Frame.prototype, "fairygui.Frame");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var DisplayListItem = (function () {
        function DisplayListItem(packageItem, type) {
            this.packageItem = packageItem;
            this.type = type;
        }
        return DisplayListItem;
    }());
    fairygui.DisplayListItem = DisplayListItem;
    __reflect(DisplayListItem.prototype, "fairygui.DisplayListItem");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var PackageItem = (function () {
        function PackageItem() {
            this.width = 0;
            this.height = 0;
            this.tileGridIndice = 0;
            //movieclip
            this.interval = 0;
            this.repeatDelay = 0;
        }
        PackageItem.prototype.load = function () {
            return this.owner.getItemAsset(this);
        };
        PackageItem.prototype.toString = function () {
            return this.name;
        };
        return PackageItem;
    }());
    fairygui.PackageItem = PackageItem;
    __reflect(PackageItem.prototype, "fairygui.PackageItem");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var MovieClip = (function (_super) {
        __extends(MovieClip, _super);
        function MovieClip() {
            var _this = _super.call(this) || this;
            _this.interval = 0;
            _this.repeatDelay = 0;
            _this._frameCount = 0;
            _this._currentFrame = 0;
            _this._start = 0;
            _this._end = 0;
            _this._times = 0;
            _this._endAt = 0;
            _this._status = 0; //0-none, 1-next loop, 2-ending, 3-ended
            _this._smoothing = true;
            //comment out below line before 5.1.0
            _this.$renderNode = new egret.sys.NormalBitmapNode();
            //comment out below line after 5.1.0
            //this.$renderNode = new egret.sys.BitmapNode();
            _this.playState = new fairygui.PlayState();
            _this._playing = true;
            _this.touchEnabled = false;
            _this.setPlaySettings();
            return _this;
        }
        Object.defineProperty(MovieClip.prototype, "frames", {
            get: function () {
                return this._frames;
            },
            set: function (value) {
                this._frames = value;
                if (this._frames != null)
                    this._frameCount = this._frames.length;
                else
                    this._frameCount = 0;
                if (this._end == -1 || this._end > this._frameCount - 1)
                    this._end = this._frameCount - 1;
                if (this._endAt == -1 || this._endAt > this._frameCount - 1)
                    this._endAt = this._frameCount - 1;
                if (this._currentFrame < 0 || this._currentFrame > this._frameCount - 1)
                    this._currentFrame = this._frameCount - 1;
                if (this._frameCount > 0)
                    this.setFrame(this._frames[this._currentFrame]);
                else
                    this.setFrame(null);
                this.playState.rewind();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovieClip.prototype, "frameCount", {
            get: function () {
                return this._frameCount;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovieClip.prototype, "currentFrame", {
            get: function () {
                return this._currentFrame;
            },
            set: function (value) {
                if (this._currentFrame != value) {
                    this._currentFrame = value;
                    this.playState.currentFrame = value;
                    this.setFrame(this._currentFrame < this._frameCount ? this._frames[this._currentFrame] : null);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovieClip.prototype, "playing", {
            get: function () {
                return this._playing;
            },
            set: function (value) {
                this._playing = value;
                if (value && this.stage != null) {
                    fairygui.GTimers.inst.add(0, 0, this.update, this);
                }
                else {
                    fairygui.GTimers.inst.remove(this.update, this);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovieClip.prototype, "smoothing", {
            get: function () {
                return this._smoothing;
            },
            set: function (value) {
                this._smoothing = value;
            },
            enumerable: true,
            configurable: true
        });
        //从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
        MovieClip.prototype.setPlaySettings = function (start, end, times, endAt, endCallback, callbackObj) {
            if (start === void 0) { start = 0; }
            if (end === void 0) { end = -1; }
            if (times === void 0) { times = 0; }
            if (endAt === void 0) { endAt = -1; }
            if (endCallback === void 0) { endCallback = null; }
            if (callbackObj === void 0) { callbackObj = null; }
            this._start = start;
            this._end = end;
            if (this._end == -1 || this._end > this._frameCount - 1)
                this._end = this._frameCount - 1;
            this._times = times;
            this._endAt = endAt;
            if (this._endAt == -1)
                this._endAt = this._end;
            this._status = 0;
            this._callback = endCallback;
            this._callbackObj = callbackObj;
            this.currentFrame = start;
        };
        MovieClip.prototype.update = function () {
            if (this._playing && this._frameCount != 0 && this._status != 3) {
                this.playState.update(this);
                if (this._currentFrame != this.playState.currentFrame) {
                    if (this._status == 1) {
                        this._currentFrame = this._start;
                        this.playState.currentFrame = this._currentFrame;
                        this._status = 0;
                    }
                    else if (this._status == 2) {
                        this._currentFrame = this._endAt;
                        this.playState.currentFrame = this._currentFrame;
                        this._status = 3;
                        //play end
                        if (this._callback != null) {
                            fairygui.GTimers.inst.callLater(this.__playEnd, this);
                        }
                    }
                    else {
                        this._currentFrame = this.playState.currentFrame;
                        if (this._currentFrame == this._end) {
                            if (this._times > 0) {
                                this._times--;
                                if (this._times == 0)
                                    this._status = 2;
                                else
                                    this._status = 1;
                            }
                            else if (this._start != 0)
                                this._status = 1;
                        }
                    }
                    //draw
                    this.setFrame(this._frames[this._currentFrame]);
                }
            }
        };
        MovieClip.prototype.__playEnd = function () {
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
        };
        MovieClip.prototype.setFrame = function (frame) {
            if (frame == null) {
                this._texture = null;
            }
            else {
                this._texture = frame.texture;
                this._frameRect = frame.rect;
            }
            if (this["$updateRenderNode"]) {
                var self_1 = this;
                self_1.$renderDirty = true;
                var p = self_1.$parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                var maskedObject = self_1.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }
            else {
                var self_2 = this;
                self_2.$invalidateContentBounds();
            }
        };
        //comment this function before 5.1.0
        MovieClip.prototype.$updateRenderNode = function () {
            var texture = this._texture;
            if (texture) {
                var offsetX = Math.round(texture.$offsetX) + this._frameRect.x;
                var offsetY = Math.round(texture.$offsetY) + this._frameRect.y;
                var bitmapWidth = texture.$bitmapWidth;
                var bitmapHeight = texture.$bitmapHeight;
                var textureWidth = texture.$getTextureWidth();
                var textureHeight = texture.$getTextureHeight();
                var destW = Math.round(texture.$getScaleBitmapWidth());
                var destH = Math.round(texture.$getScaleBitmapHeight());
                var sourceWidth = texture.$sourceWidth;
                var sourceHeight = texture.$sourceHeight;
                egret.sys.BitmapNode.$updateTextureData(this.$renderNode, texture.$bitmapData, texture.$bitmapX, texture.$bitmapY, bitmapWidth, bitmapHeight, offsetX, offsetY, textureWidth, textureHeight, destW, destH, sourceWidth, sourceHeight, egret.BitmapFillMode.SCALE, this._smoothing);
            }
        };
        //comment out this function after 5.1.0
        /*
        $render(): void {
            var texture = this._texture;
            if (texture) {
                var offsetX: number = Math.round(texture._offsetX) + this._frameRect.x;
                var offsetY: number = Math.round(texture._offsetY) + this._frameRect.y;
                var bitmapWidth: number = texture._bitmapWidth;
                var bitmapHeight: number = texture._bitmapHeight;
                var textureWidth: number = texture.$getTextureWidth();
                var textureHeight: number = texture.$getTextureHeight();
                var destW: number = Math.round(texture.$getScaleBitmapWidth());
                var destH: number = Math.round(texture.$getScaleBitmapHeight());
                var sourceWidth: number = texture._sourceWidth;
                var sourceHeight: number = texture._sourceHeight;

                egret.sys.BitmapNode.$updateTextureData
                    //before 3.1.7 egret.Bitmap.$drawImage
                    (<egret.sys.BitmapNode>this.$renderNode, texture._bitmapData,
                    texture._bitmapX, texture._bitmapY,
                    bitmapWidth, bitmapHeight,
                    offsetX, offsetY,
                    textureWidth, textureHeight,
                    destW, destH,
                    sourceWidth, sourceHeight,
                    null, egret.BitmapFillMode.SCALE, this._smoothing);
            }
        }*/
        MovieClip.prototype.$measureContentBounds = function (bounds) {
            if (this._texture) {
                var x = this._frameRect.x;
                var y = this._frameRect.y;
                var w = this._texture.$getTextureWidth();
                var h = this._texture.$getTextureHeight();
                bounds.setTo(x, y, w, h);
            }
            else {
                bounds.setEmpty();
            }
        };
        MovieClip.prototype.$onAddToStage = function (stage, nestLevel) {
            _super.prototype.$onAddToStage.call(this, stage, nestLevel);
            if (this._playing)
                fairygui.GTimers.inst.add(0, 0, this.update, this);
        };
        MovieClip.prototype.$onRemoveFromStage = function () {
            _super.prototype.$onRemoveFromStage.call(this);
            if (this._playing)
                fairygui.GTimers.inst.remove(this.update, this);
        };
        return MovieClip;
    }(egret.DisplayObject));
    fairygui.MovieClip = MovieClip;
    __reflect(MovieClip.prototype, "fairygui.MovieClip");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GButton = (function (_super) {
        __extends(GButton, _super);
        function GButton() {
            var _this = _super.call(this) || this;
            _this._mode = fairygui.ButtonMode.Common;
            _this._title = "";
            _this._icon = "";
            _this._sound = fairygui.UIConfig.buttonSound;
            _this._soundVolumeScale = fairygui.UIConfig.buttonSoundVolumeScale;
            _this._pageOption = new fairygui.PageOption();
            _this._changeStateOnClick = true;
            _this._downEffect = 0;
            _this._downEffectValue = 0.8;
            return _this;
        }
        Object.defineProperty(GButton.prototype, "icon", {
            get: function () {
                return this._icon;
            },
            set: function (value) {
                this._icon = value;
                value = (this._selected && this._selectedIcon) ? this._selectedIcon : this._icon;
                if (this._iconObject != null)
                    this._iconObject.icon = value;
                this.updateGear(7);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GButton.prototype, "selectedIcon", {
            get: function () {
                return this._selectedIcon;
            },
            set: function (value) {
                this._selectedIcon = value;
                value = (this._selected && this._selectedIcon) ? this._selectedIcon : this._icon;
                if (this._iconObject != null)
                    this._iconObject.icon = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GButton.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (value) {
                this._title = value;
                if (this._titleObject)
                    this._titleObject.text = (this._selected && this._selectedTitle) ? this._selectedTitle : this._title;
                this.updateGear(6);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GButton.prototype, "text", {
            get: function () {
                return this.title;
            },
            set: function (value) {
                this.title = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GButton.prototype, "selectedTitle", {
            get: function () {
                return this._selectedTitle;
            },
            set: function (value) {
                this._selectedTitle = value;
                if (this._titleObject)
                    this._titleObject.text = (this._selected && this._selectedTitle) ? this._selectedTitle : this._title;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GButton.prototype, "titleColor", {
            get: function () {
                if (this._titleObject instanceof fairygui.GTextField)
                    return this._titleObject.color;
                else if (this._titleObject instanceof fairygui.GLabel)
                    return this._titleObject.titleColor;
                else if (this._titleObject instanceof GButton)
                    return this._titleObject.titleColor;
                else
                    return 0;
            },
            set: function (value) {
                if (this._titleObject instanceof fairygui.GTextField)
                    this._titleObject.color = value;
                else if (this._titleObject instanceof fairygui.GLabel)
                    this._titleObject.titleColor = value;
                else if (this._titleObject instanceof GButton)
                    this._titleObject.titleColor = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GButton.prototype, "titleFontSize", {
            get: function () {
                if (this._titleObject instanceof fairygui.GTextField)
                    return this._titleObject.fontSize;
                else if (this._titleObject instanceof fairygui.GLabel)
                    return this._titleObject.titleFontSize;
                else if (this._titleObject instanceof GButton)
                    return this._titleObject.titleFontSize;
                else
                    return 0;
            },
            set: function (value) {
                if (this._titleObject instanceof fairygui.GTextField)
                    this._titleObject.fontSize = value;
                else if (this._titleObject instanceof fairygui.GLabel)
                    this._titleObject.titleFontSize = value;
                else if (this._titleObject instanceof GButton)
                    this._titleObject.titleFontSize = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GButton.prototype, "sound", {
            get: function () {
                return this._sound;
            },
            set: function (val) {
                this._sound = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GButton.prototype, "soundVolumeScale", {
            get: function () {
                return this._soundVolumeScale;
            },
            set: function (value) {
                this._soundVolumeScale = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GButton.prototype, "selected", {
            get: function () {
                return this._selected;
            },
            set: function (val) {
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
                        if (this._iconObject != null)
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
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GButton.prototype, "mode", {
            get: function () {
                return this._mode;
            },
            set: function (value) {
                if (this._mode != value) {
                    if (value == fairygui.ButtonMode.Common)
                        this.selected = false;
                    this._mode = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GButton.prototype, "relatedController", {
            get: function () {
                return this._relatedController;
            },
            set: function (val) {
                if (val != this._relatedController) {
                    this._relatedController = val;
                    this._pageOption.controller = val;
                    this._pageOption.clear();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GButton.prototype, "pageOption", {
            get: function () {
                return this._pageOption;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GButton.prototype, "changeStateOnClick", {
            get: function () {
                return this._changeStateOnClick;
            },
            set: function (value) {
                this._changeStateOnClick = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GButton.prototype, "linkedPopup", {
            get: function () {
                return this._linkedPopup;
            },
            set: function (value) {
                this._linkedPopup = value;
            },
            enumerable: true,
            configurable: true
        });
        GButton.prototype.addStateListener = function (listener, thisObj) {
            this.addEventListener(fairygui.StateChangeEvent.CHANGED, listener, thisObj);
        };
        GButton.prototype.removeStateListener = function (listener, thisObj) {
            this.removeEventListener(fairygui.StateChangeEvent.CHANGED, listener, thisObj);
        };
        GButton.prototype.fireClick = function (downEffect) {
            if (downEffect === void 0) { downEffect = true; }
            if (downEffect && this._mode == fairygui.ButtonMode.Common) {
                this.setState(GButton.OVER);
                fairygui.GTimers.inst.add(100, 1, this.setState, this, GButton.DOWN);
                fairygui.GTimers.inst.add(200, 1, this.setState, this, GButton.UP);
            }
            this.__click(null);
        };
        GButton.prototype.setState = function (val) {
            if (this._buttonController)
                this._buttonController.selectedPage = val;
            if (this._downEffect == 1) {
                var cnt = this.numChildren;
                if (val == GButton.DOWN || val == GButton.SELECTED_OVER || val == GButton.SELECTED_DISABLED) {
                    var r = this._downEffectValue * 255;
                    var color = (r << 16) + (r << 8) + r;
                    for (var i = 0; i < cnt; i++) {
                        var obj = this.getChildAt(i);
                        if (obj["color"] != undefined && !(obj instanceof fairygui.GTextField))
                            obj.color = color;
                    }
                }
                else {
                    for (var i = 0; i < cnt; i++) {
                        var obj = this.getChildAt(i);
                        if (obj["color"] != undefined && !(obj instanceof fairygui.GTextField))
                            obj.color = 0xFFFFFF;
                    }
                }
            }
            else if (this._downEffect == 2) {
                if (val == GButton.DOWN || val == GButton.SELECTED_OVER || val == GButton.SELECTED_DISABLED) {
                    if (!this._downScaled) {
                        this._downScaled = true;
                        this.setScale(this.scaleX * this._downEffectValue, this.scaleY * this._downEffectValue);
                    }
                }
                else {
                    if (this._downScaled) {
                        this._downScaled = false;
                        this.setScale(this.scaleX / this._downEffectValue, this.scaleY / this._downEffectValue);
                    }
                }
            }
        };
        GButton.prototype.handleControllerChanged = function (c) {
            _super.prototype.handleControllerChanged.call(this, c);
            if (this._relatedController == c)
                this.selected = this._pageOption.id == c.selectedPageId;
        };
        GButton.prototype.handleGrayedChanged = function () {
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
                _super.prototype.handleGrayedChanged.call(this);
        };
        GButton.prototype.constructFromXML = function (xml) {
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
            str = xml.attributes.downEffect;
            if (str) {
                this._downEffect = str == "dark" ? 1 : (str == "scale" ? 2 : 0);
                str = xml.attributes.downEffectValue;
                this._downEffectValue = parseFloat(str);
                if (this._downEffect == 2)
                    this.setPivot(0.5, 0.5);
            }
            this._buttonController = this.getController("button");
            this._titleObject = this.getChild("title");
            this._iconObject = this.getChild("icon");
            if (this._titleObject != null)
                this._title = this._titleObject.text;
            if (this._iconObject != null)
                this._icon = this._iconObject.icon;
            if (this._mode == fairygui.ButtonMode.Common)
                this.setState(GButton.UP);
            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__mousedown, this);
            this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.__click, this);
        };
        GButton.prototype.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "Button");
            if (xml) {
                var str;
                str = xml.attributes.title;
                if (str)
                    this.title = str;
                str = xml.attributes.icon;
                if (str)
                    this.icon = str;
                str = xml.attributes.selectedTitle;
                if (str)
                    this.selectedTitle = str;
                str = xml.attributes.selectedIcon;
                if (str)
                    this.selectedIcon = str;
                str = xml.attributes.titleColor;
                if (str)
                    this.titleColor = fairygui.ToolSet.convertFromHtmlColor(str);
                str = xml.attributes.titleFontSize;
                if (str)
                    this.titleFontSize = parseInt(str);
                str = xml.attributes.sound;
                if (str != null)
                    this._sound = str;
                str = xml.attributes.volume;
                if (str)
                    this._soundVolumeScale = parseInt(str) / 100;
                str = xml.attributes.controller;
                if (str)
                    this._relatedController = this._parent.getController(str);
                else
                    this._relatedController = null;
                this._pageOption.id = xml.attributes.page;
                this.selected = xml.attributes.checked == "true";
            }
        };
        GButton.prototype.__rollover = function (evt) {
            if (!this._buttonController || !this._buttonController.hasPage(GButton.OVER))
                return;
            this._over = true;
            if (this._down)
                return;
            this.setState(this._selected ? GButton.SELECTED_OVER : GButton.OVER);
        };
        GButton.prototype.__rollout = function (evt) {
            if (!this._buttonController || !this._buttonController.hasPage(GButton.OVER))
                return;
            this._over = false;
            if (this._down)
                return;
            this.setState(this._selected ? GButton.DOWN : GButton.UP);
        };
        GButton.prototype.__mousedown = function (evt) {
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
                else
                    this.root.togglePopup(this._linkedPopup, this);
            }
        };
        GButton.prototype.__mouseup = function (evt) {
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
        GButton.prototype.__click = function (evt) {
            if (this._sound) {
                var pi = fairygui.UIPackage.getItemByURL(this._sound);
                if (pi) {
                    var sound = pi.owner.getItemAsset(pi);
                    if (sound)
                        fairygui.GRoot.inst.playOneShotSound(sound, this._soundVolumeScale);
                }
            }
            if (this._mode == fairygui.ButtonMode.Check) {
                if (this._changeStateOnClick) {
                    this.selected = !this._selected;
                    this.dispatchEvent(new fairygui.StateChangeEvent(fairygui.StateChangeEvent.CHANGED));
                }
            }
            else if (this._mode == fairygui.ButtonMode.Radio) {
                if (this._changeStateOnClick && !this._selected) {
                    this.selected = true;
                    this.dispatchEvent(new fairygui.StateChangeEvent(fairygui.StateChangeEvent.CHANGED));
                }
            }
            else {
                if (this._relatedController)
                    this._relatedController.selectedPageId = this._pageOption.id;
            }
        };
        GButton.UP = "up";
        GButton.DOWN = "down";
        GButton.OVER = "over";
        GButton.SELECTED_OVER = "selectedOver";
        GButton.DISABLED = "disabled";
        GButton.SELECTED_DISABLED = "selectedDisabled";
        return GButton;
    }(fairygui.GComponent));
    fairygui.GButton = GButton;
    __reflect(GButton.prototype, "fairygui.GButton");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GComboBox = (function (_super) {
        __extends(GComboBox, _super);
        function GComboBox() {
            var _this = _super.call(this) || this;
            _this._visibleItemCount = 0;
            _this._selectedIndex = 0;
            _this._popupDownward = true;
            _this._visibleItemCount = fairygui.UIConfig.defaultComboBoxVisibleItemCount;
            _this._itemsUpdated = true;
            _this._selectedIndex = -1;
            _this._items = [];
            _this._values = [];
            return _this;
        }
        Object.defineProperty(GComboBox.prototype, "text", {
            get: function () {
                if (this._titleObject)
                    return this._titleObject.text;
                else
                    return null;
            },
            set: function (value) {
                if (this._titleObject)
                    this._titleObject.text = value;
                this.updateGear(6);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComboBox.prototype, "icon", {
            get: function () {
                if (this._iconObject)
                    return this._iconObject.icon;
                else
                    return null;
            },
            set: function (value) {
                if (this._iconObject)
                    this._iconObject.icon = value;
                this.updateGear(7);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComboBox.prototype, "titleColor", {
            get: function () {
                if (this._titleObject instanceof fairygui.GTextField)
                    return this._titleObject.color;
                else if (this._titleObject instanceof fairygui.GLabel)
                    return this._titleObject.titleColor;
                else if (this._titleObject instanceof fairygui.GButton)
                    return this._titleObject.titleColor;
                else
                    return 0;
            },
            set: function (value) {
                if (this._titleObject instanceof fairygui.GTextField)
                    this._titleObject.color = value;
                else if (this._titleObject instanceof fairygui.GLabel)
                    this._titleObject.titleColor = value;
                else if (this._titleObject instanceof fairygui.GButton)
                    this._titleObject.titleColor = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComboBox.prototype, "visibleItemCount", {
            get: function () {
                return this._visibleItemCount;
            },
            set: function (value) {
                this._visibleItemCount = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComboBox.prototype, "popupDownward", {
            get: function () {
                return this._popupDownward;
            },
            set: function (value) {
                this._popupDownward = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComboBox.prototype, "items", {
            get: function () {
                return this._items;
            },
            set: function (value) {
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
                    if (this._icons != null && this._selectedIndex < this._icons.length)
                        this.icon = this._icons[this._selectedIndex];
                }
                else {
                    this.text = "";
                    if (this._icons != null)
                        this.icon = null;
                    this._selectedIndex = -1;
                }
                this._itemsUpdated = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComboBox.prototype, "icons", {
            get: function () {
                return this._icons;
            },
            set: function (value) {
                this._icons = value;
                if (this._icons != null && this._selectedIndex != -1 && this._selectedIndex < this._icons.length)
                    this.icon = this._icons[this._selectedIndex];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComboBox.prototype, "values", {
            get: function () {
                return this._values;
            },
            set: function (value) {
                if (!value)
                    this._values.length = 0;
                else
                    this._values = value.concat();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComboBox.prototype, "selectedIndex", {
            get: function () {
                return this._selectedIndex;
            },
            set: function (val) {
                if (this._selectedIndex == val)
                    return;
                this._selectedIndex = val;
                if (this.selectedIndex >= 0 && this.selectedIndex < this._items.length) {
                    this.text = this._items[this._selectedIndex];
                    if (this._icons != null && this._selectedIndex < this._icons.length)
                        this.icon = this._icons[this._selectedIndex];
                }
                else {
                    this.text = "";
                    if (this._icons != null)
                        this.icon = null;
                }
                this.updateSelectionController();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComboBox.prototype, "value", {
            get: function () {
                return this._values[this._selectedIndex];
            },
            set: function (val) {
                this.selectedIndex = this._values.indexOf(val);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GComboBox.prototype, "selectionController", {
            get: function () {
                return this._selectionController;
            },
            set: function (value) {
                this._selectionController = value;
            },
            enumerable: true,
            configurable: true
        });
        GComboBox.prototype.setState = function (val) {
            if (this._buttonController)
                this._buttonController.selectedPage = val;
        };
        GComboBox.prototype.constructFromXML = function (xml) {
            _super.prototype.constructFromXML.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "ComboBox");
            var str;
            this._buttonController = this.getController("button");
            this._titleObject = this.getChild("title");
            this._iconObject = this.getChild("icon");
            str = xml.attributes.dropdown;
            if (str) {
                this.dropdown = (fairygui.UIPackage.createObjectFromURL(str));
                if (!this.dropdown) {
                    console.error("下拉框必须为元件");
                    return;
                }
                this.dropdown.name = "this.dropdown";
                this._list = this.dropdown.getChild("list").asList;
                if (this._list == null) {
                    console.error(this.resourceURL + ": 下拉框的弹出元件里必须包含名为list的列表");
                    return;
                }
                this._list.addEventListener(fairygui.ItemEvent.CLICK, this.__clickItem, this);
                this._list.addRelation(this.dropdown, fairygui.RelationType.Width);
                this._list.removeRelation(this.dropdown, fairygui.RelationType.Height);
                this.dropdown.addRelation(this._list, fairygui.RelationType.Height);
                this.dropdown.removeRelation(this._list, fairygui.RelationType.Width);
                this.dropdown.displayObject.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.__popupWinClosed, this);
            }
            /*not support
            if (!GRoot.touchScreen) {
                this.displayObject.addEventListener(egret.TouchEvent.TOUCH_ROLL_OVER, this.__rollover, this);
                this.displayObject.addEventListener(egret.TouchEvent.TOUCH_ROLL_OUT, this.__rollout, this);
            }*/
            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__mousedown, this);
        };
        GComboBox.prototype.handleControllerChanged = function (c) {
            _super.prototype.handleControllerChanged.call(this, c);
            if (this._selectionController == c)
                this.selectedIndex = c.selectedIndex;
        };
        GComboBox.prototype.updateSelectionController = function () {
            if (this._selectionController != null && !this._selectionController.changing
                && this._selectedIndex < this._selectionController.pageCount) {
                var c = this._selectionController;
                this._selectionController = null;
                c.selectedIndex = this._selectedIndex;
                this._selectionController = c;
            }
        };
        GComboBox.prototype.dispose = function () {
            if (this.dropdown) {
                this.dropdown.dispose();
                this.dropdown = null;
            }
            _super.prototype.dispose.call(this);
        };
        GComboBox.prototype.setup_afterAdd = function (xml) {
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
                            str = cxml.attributes.icon;
                            if (str) {
                                if (!this._icons)
                                    this._icons = new Array(length);
                                this._icons[i] = str;
                            }
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
                str = xml.attributes.icon;
                if (str)
                    this.icon = str;
                str = xml.attributes.direction;
                if (str) {
                    if (str == "up")
                        this._popupDownward = false;
                    else if (str == "auto")
                        this._popupDownward = null;
                }
                str = xml.attributes.selectionController;
                if (str)
                    this._selectionController = this.parent.getController(str);
            }
        };
        GComboBox.prototype.showDropdown = function () {
            if (this._itemsUpdated) {
                this._itemsUpdated = false;
                this._list.removeChildrenToPool();
                var cnt = this._items.length;
                for (var i = 0; i < cnt; i++) {
                    var item = this._list.addItemFromPool();
                    item.name = i < this._values.length ? this._values[i] : "";
                    item.text = this._items[i];
                    item.icon = (this._icons != null && i < this._icons.length) ? this._icons[i] : null;
                }
                this._list.resizeToFit(this._visibleItemCount);
            }
            this._list.selectedIndex = -1;
            this.dropdown.width = this.width;
            this.root.togglePopup(this.dropdown, this, this._popupDownward);
            if (this.dropdown.parent)
                this.setState(fairygui.GButton.DOWN);
        };
        GComboBox.prototype.__popupWinClosed = function (evt) {
            if (this._over)
                this.setState(fairygui.GButton.OVER);
            else
                this.setState(fairygui.GButton.UP);
        };
        GComboBox.prototype.__clickItem = function (evt) {
            fairygui.GTimers.inst.add(100, 1, this.__clickItem2, this, this._list.getChildIndex(evt.itemObject));
        };
        GComboBox.prototype.__clickItem2 = function (index) {
            if (this.dropdown.parent instanceof fairygui.GRoot)
                (this.dropdown.parent).hidePopup();
            this._selectedIndex = index;
            if (this._selectedIndex >= 0)
                this.text = this._items[this._selectedIndex];
            else
                this.text = "";
            this.dispatchEvent(new fairygui.StateChangeEvent(fairygui.StateChangeEvent.CHANGED));
        };
        GComboBox.prototype.__rollover = function (evt) {
            this._over = true;
            if (this._down || this.dropdown && this.dropdown.parent)
                return;
            this.setState(fairygui.GButton.OVER);
        };
        GComboBox.prototype.__rollout = function (evt) {
            this._over = false;
            if (this._down || this.dropdown && this.dropdown.parent)
                return;
            this.setState(fairygui.GButton.UP);
        };
        GComboBox.prototype.__mousedown = function (evt) {
            if ((evt.target instanceof egret.TextField) && evt.target.type == egret.TextFieldType.INPUT)
                return;
            this._down = true;
            fairygui.GRoot.inst.nativeStage.addEventListener(egret.TouchEvent.TOUCH_END, this.__mouseup, this);
            if (this.dropdown)
                this.showDropdown();
        };
        GComboBox.prototype.__mouseup = function (evt) {
            if (this._down) {
                this._down = false;
                fairygui.GRoot.inst.nativeStage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__mouseup, this);
                if (this.dropdown && !this.dropdown.parent) {
                    if (this._over)
                        this.setState(fairygui.GButton.OVER);
                    else
                        this.setState(fairygui.GButton.UP);
                }
            }
        };
        return GComboBox;
    }(fairygui.GComponent));
    fairygui.GComboBox = GComboBox;
    __reflect(GComboBox.prototype, "fairygui.GComboBox");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GearAnimation = (function (_super) {
        __extends(GearAnimation, _super);
        function GearAnimation(owner) {
            return _super.call(this, owner) || this;
        }
        GearAnimation.prototype.init = function () {
            this._default = new GearAnimationValue(this._owner.playing, this._owner.frame);
            this._storage = {};
        };
        GearAnimation.prototype.addStatus = function (pageId, value) {
            if (value == "-" || value.length == 0)
                return;
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
        GearAnimation.prototype.apply = function () {
            this._owner._gearLocked = true;
            var gv = this._storage[this._controller.selectedPageId];
            if (!gv)
                gv = this._default;
            this._owner.frame = gv.frame;
            this._owner.playing = gv.playing;
            this._owner._gearLocked = false;
        };
        GearAnimation.prototype.updateState = function () {
            var gv = this._storage[this._controller.selectedPageId];
            if (!gv) {
                gv = new GearAnimationValue();
                this._storage[this._controller.selectedPageId] = gv;
            }
            gv.frame = this._owner.frame;
            gv.playing = this._owner.playing;
        };
        return GearAnimation;
    }(fairygui.GearBase));
    fairygui.GearAnimation = GearAnimation;
    __reflect(GearAnimation.prototype, "fairygui.GearAnimation");
    var GearAnimationValue = (function () {
        function GearAnimationValue(playing, frame) {
            if (playing === void 0) { playing = true; }
            if (frame === void 0) { frame = 0; }
            this.playing = playing;
            this.frame = frame;
        }
        return GearAnimationValue;
    }());
    __reflect(GearAnimationValue.prototype, "GearAnimationValue");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var PlayState = (function () {
        function PlayState() {
            this.repeatedCount = 0;
            this._curFrame = 0;
            this._curFrameDelay = 0;
            this._lastUpdateSeq = 0;
        }
        PlayState.prototype.update = function (mc) {
            var elapsed;
            var frameId = fairygui.GTimers.workCount;
            if (frameId - this._lastUpdateSeq != 1)
                //1、如果>1，表示不是连续帧了，说明刚启动（或者停止过），这里不能用流逝的时间了，不然会跳过很多帧
                //2、如果==0，表示在本帧已经处理过了，这通常是因为一个PlayState用于多个MovieClip共享，目的是多个MovieClip同步播放
                elapsed = 0;
            else
                elapsed = fairygui.GTimers.deltaTime;
            this._lastUpdateSeq = frameId;
            var cur = this._curFrame;
            if (cur >= mc.frameCount)
                cur = mc.frameCount - 1;
            this.reachEnding = false;
            this._curFrameDelay += elapsed;
            var interval = mc.interval + mc.frames[cur].addDelay
                + ((cur == 0 && this.repeatedCount > 0) ? mc.repeatDelay : 0);
            if (this._curFrameDelay < interval)
                return;
            this._curFrameDelay -= interval;
            if (this._curFrameDelay > mc.interval)
                this._curFrameDelay = mc.interval;
            if (mc.swing) {
                if (this.reversed) {
                    this._curFrame--;
                    if (this._curFrame <= 0) {
                        this._curFrame = 0;
                        this.repeatedCount++;
                        this.reversed = !this.reversed;
                    }
                }
                else {
                    this._curFrame++;
                    if (this._curFrame > mc.frameCount - 1) {
                        this._curFrame = Math.max(0, mc.frameCount - 2);
                        this.repeatedCount++;
                        this.reachEnding = true;
                        this.reversed = !this.reversed;
                    }
                }
            }
            else {
                this._curFrame++;
                if (this._curFrame > mc.frameCount - 1) {
                    this._curFrame = 0;
                    this.repeatedCount++;
                    this.reachEnding = true;
                }
            }
        };
        Object.defineProperty(PlayState.prototype, "currentFrame", {
            get: function () {
                return this._curFrame;
            },
            set: function (value) {
                this._curFrame = value;
                this._curFrameDelay = 0;
            },
            enumerable: true,
            configurable: true
        });
        PlayState.prototype.rewind = function () {
            this._curFrame = 0;
            this._curFrameDelay = 0;
            this.reversed = false;
            this.reachEnding = false;
        };
        PlayState.prototype.reset = function () {
            this._curFrame = 0;
            this._curFrameDelay = 0;
            this.repeatedCount = 0;
            this.reachEnding = false;
            this.reversed = false;
        };
        PlayState.prototype.copy = function (src) {
            this._curFrame = src._curFrame;
            this._curFrameDelay = src._curFrameDelay;
            this.repeatedCount = src.repeatedCount;
            this.reachEnding = src.reachEnding;
            this.reversed = src.reversed;
        };
        return PlayState;
    }());
    fairygui.PlayState = PlayState;
    __reflect(PlayState.prototype, "fairygui.PlayState");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GearDisplay = (function (_super) {
        __extends(GearDisplay, _super);
        function GearDisplay(owner) {
            var _this = _super.call(this, owner) || this;
            _this._displayLockToken = 1;
            _this._visible = 0;
            return _this;
        }
        GearDisplay.prototype.init = function () {
            this.pages = null;
        };
        GearDisplay.prototype.apply = function () {
            this._displayLockToken++;
            if (this._displayLockToken == 0)
                this._displayLockToken = 1;
            if (this.pages == null || this.pages.length == 0
                || this.pages.indexOf(this._controller.selectedPageId) != -1)
                this._visible = 1;
            else
                this._visible = 0;
        };
        GearDisplay.prototype.addLock = function () {
            this._visible++;
            return this._displayLockToken;
        };
        GearDisplay.prototype.releaseLock = function (token) {
            if (token == this._displayLockToken)
                this._visible--;
        };
        Object.defineProperty(GearDisplay.prototype, "connected", {
            get: function () {
                return this._controller == null || this._visible > 0;
            },
            enumerable: true,
            configurable: true
        });
        return GearDisplay;
    }(fairygui.GearBase));
    fairygui.GearDisplay = GearDisplay;
    __reflect(GearDisplay.prototype, "fairygui.GearDisplay");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GearLook = (function (_super) {
        __extends(GearLook, _super);
        function GearLook(owner) {
            return _super.call(this, owner) || this;
        }
        GearLook.prototype.init = function () {
            this._default = new GearLookValue(this._owner.alpha, this._owner.rotation, this._owner.grayed, this._owner.touchable);
            this._storage = {};
        };
        GearLook.prototype.addStatus = function (pageId, value) {
            if (value == "-" || value.length == 0)
                return;
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
            if (arr.length < 4)
                gv.touchable = this._owner.touchable;
            else
                gv.touchable = arr[3] == "1" ? true : false;
        };
        GearLook.prototype.apply = function () {
            var gv = this._storage[this._controller.selectedPageId];
            if (!gv)
                gv = this._default;
            if (this._tween && !fairygui.UIPackage._constructing && !fairygui.GearBase.disableAllTweenEffect) {
                this._owner._gearLocked = true;
                this._owner.grayed = gv.grayed;
                this._owner.touchable = gv.touchable;
                this._owner._gearLocked = false;
                if (this.tweener != null) {
                    if (this._tweenTarget.alpha != gv.alpha || this._tweenTarget.rotation != gv.rotation) {
                        this.tweener["tick"] ? this.tweener["tick"](100000000) : this.tweener["$tick"](100000000);
                        this.tweener = null;
                    }
                    else
                        return;
                }
                var a = gv.alpha != this._owner.alpha;
                var b = gv.rotation != this._owner.rotation;
                if (a || b) {
                    if (this._owner.checkGearController(0, this._controller))
                        this._displayLockToken = this._owner.addDisplayLock();
                    this._tweenTarget = gv;
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
                    this.tweener = egret.Tween.get(this._tweenValue, vars)
                        .wait(this._tweenDelay * 1000)
                        .to({ x: gv.alpha, y: gv.rotation }, this._tweenTime * 1000, this._easeType)
                        .call(function () {
                        if (this._displayLockToken != 0) {
                            this._owner.releaseDisplayLock(this._displayLockToken);
                            this._displayLockToken = 0;
                        }
                        this._tweener = null;
                        this._owner.dispatchEventWith(fairygui.GObject.GEAR_STOP, false);
                    }, this);
                }
            }
            else {
                this._owner._gearLocked = true;
                this._owner.grayed = gv.grayed;
                this._owner.touchable = gv.touchable;
                this._owner.alpha = gv.alpha;
                this._owner.rotation = gv.rotation;
                this._owner._gearLocked = false;
            }
        };
        GearLook.prototype.updateState = function () {
            var gv = this._storage[this._controller.selectedPageId];
            if (!gv) {
                gv = new GearLookValue();
                this._storage[this._controller.selectedPageId] = gv;
            }
            gv.alpha = this._owner.alpha;
            gv.rotation = this._owner.rotation;
            gv.grayed = this._owner.grayed;
            gv.touchable = this._owner.touchable;
        };
        return GearLook;
    }(fairygui.GearBase));
    fairygui.GearLook = GearLook;
    __reflect(GearLook.prototype, "fairygui.GearLook");
    var GearLookValue = (function () {
        function GearLookValue(alpha, rotation, grayed, touchable) {
            if (alpha === void 0) { alpha = 0; }
            if (rotation === void 0) { rotation = 0; }
            if (grayed === void 0) { grayed = false; }
            if (touchable === void 0) { touchable = true; }
            this.alpha = alpha;
            this.rotation = rotation;
            this.grayed = grayed;
            this.touchable = touchable;
        }
        return GearLookValue;
    }());
    __reflect(GearLookValue.prototype, "GearLookValue");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GGraph = (function (_super) {
        __extends(GGraph, _super);
        function GGraph() {
            var _this = _super.call(this) || this;
            _this._type = 0;
            _this._lineSize = 0;
            _this._lineColor = 0;
            _this._fillColor = 0;
            _this._lineSize = 1;
            _this._lineAlpha = 1;
            _this._fillAlpha = 1;
            _this._fillColor = 0xFFFFFF;
            return _this;
        }
        Object.defineProperty(GGraph.prototype, "graphics", {
            get: function () {
                if (this._graphics)
                    return this._graphics;
                this.delayCreateDisplayObject();
                this._graphics = (this.displayObject).graphics;
                return this._graphics;
            },
            enumerable: true,
            configurable: true
        });
        GGraph.prototype.drawRect = function (lineSize, lineColor, lineAlpha, fillColor, fillAlpha, corner) {
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
        GGraph.prototype.drawEllipse = function (lineSize, lineColor, lineAlpha, fillColor, fillAlpha) {
            this._type = 2;
            this._lineSize = lineSize;
            this._lineColor = lineColor;
            this._lineAlpha = lineAlpha;
            this._fillColor = fillColor;
            this._fillAlpha = fillAlpha;
            this._corner = null;
            this.drawCommon();
        };
        GGraph.prototype.clearGraphics = function () {
            if (this._graphics) {
                this._type = 0;
                this._graphics.clear();
            }
        };
        Object.defineProperty(GGraph.prototype, "color", {
            get: function () {
                return this._fillColor;
            },
            set: function (value) {
                this._fillColor = value;
                if (this._type != 0)
                    this.drawCommon();
            },
            enumerable: true,
            configurable: true
        });
        GGraph.prototype.drawCommon = function () {
            this.graphics;
            this._graphics.clear();
            var w = this.width;
            var h = this.height;
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
                        this._graphics.drawRoundRect(0, 0, w, h, this._corner[0] * 2, this._corner[0] * 2);
                    else
                        this._graphics.drawRoundRect(0, 0, w, h, this._corner[0] * 2, this._corner[1] * 2);
                }
                else
                    this._graphics.drawRect(0, 0, w, h);
            }
            else
                this._graphics.drawEllipse(0, 0, w, h);
            this._graphics.endFill();
        };
        GGraph.prototype.replaceMe = function (target) {
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
        GGraph.prototype.addBeforeMe = function (target) {
            if (this._parent == null)
                throw "parent not set";
            var index = this._parent.getChildIndex(this);
            this._parent.addChildAt(target, index);
        };
        GGraph.prototype.addAfterMe = function (target) {
            if (this._parent == null)
                throw "parent not set";
            var index = this._parent.getChildIndex(this);
            index++;
            this._parent.addChildAt(target, index);
        };
        GGraph.prototype.setNativeObject = function (obj) {
            this.delayCreateDisplayObject();
            (this.displayObject).addChild(obj);
        };
        GGraph.prototype.delayCreateDisplayObject = function () {
            if (!this.displayObject) {
                var sprite = new fairygui.UISprite();
                sprite["$owner"] = this;
                this.setDisplayObject(sprite);
                if (this._parent)
                    this._parent.childStateChanged(this);
                this.handleXYChanged();
                sprite.alpha = this.alpha;
                sprite.rotation = this.rotation;
                sprite.visible = this.visible;
                sprite.touchEnabled = this.touchable;
                sprite.touchChildren = this.touchable;
                sprite.hitArea = new egret.Rectangle(0, 0, this.width, this.height);
            }
            else {
                (this.displayObject).graphics.clear();
                (this.displayObject).removeChildren();
                this._graphics = null;
            }
        };
        GGraph.prototype.handleSizeChanged = function () {
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
        GGraph.prototype.setup_beforeAdd = function (xml) {
            var str;
            var type = xml.attributes.type;
            if (type && type != "empty") {
                var sprite = new fairygui.UISprite();
                sprite["$owner"] = this;
                this.setDisplayObject(sprite);
            }
            _super.prototype.setup_beforeAdd.call(this, xml);
            if (this.displayObject != null) {
                this._graphics = (this.displayObject).graphics;
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
    }(fairygui.GObject));
    fairygui.GGraph = GGraph;
    __reflect(GGraph.prototype, "fairygui.GGraph");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GGroup = (function (_super) {
        __extends(GGroup, _super);
        function GGroup() {
            var _this = _super.call(this) || this;
            _this._layout = 0;
            _this._lineGap = 0;
            _this._columnGap = 0;
            _this._percentReady = false;
            _this._boundsChanged = false;
            _this._updating = 0;
            return _this;
        }
        Object.defineProperty(GGroup.prototype, "layout", {
            get: function () {
                return this._layout;
            },
            set: function (value) {
                if (this._layout != value) {
                    this._layout = value;
                    this.setBoundsChangedFlag(true);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GGroup.prototype, "lineGap", {
            get: function () {
                return this._lineGap;
            },
            set: function (value) {
                if (this._lineGap != value) {
                    this._lineGap = value;
                    this.setBoundsChangedFlag();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GGroup.prototype, "columnGap", {
            get: function () {
                return this._columnGap;
            },
            set: function (value) {
                if (this._columnGap != value) {
                    this._columnGap = value;
                    this.setBoundsChangedFlag();
                }
            },
            enumerable: true,
            configurable: true
        });
        GGroup.prototype.setBoundsChangedFlag = function (childSizeChanged) {
            if (childSizeChanged === void 0) { childSizeChanged = false; }
            if (this._updating == 0 && this._parent != null) {
                if (childSizeChanged)
                    this._percentReady = false;
                if (!this._boundsChanged) {
                    this._boundsChanged = true;
                    if (this._layout != fairygui.GroupLayoutType.None)
                        fairygui.GTimers.inst.callLater(this.ensureBoundsCorrect, this);
                }
            }
        };
        GGroup.prototype.ensureBoundsCorrect = function () {
            if (this._boundsChanged)
                this.updateBounds();
        };
        GGroup.prototype.updateBounds = function () {
            fairygui.GTimers.inst.remove(this.ensureBoundsCorrect, this);
            this._boundsChanged = false;
            if (this._parent == null)
                return;
            this.handleLayout();
            var cnt = this._parent.numChildren;
            var i;
            var child;
            var ax = Number.POSITIVE_INFINITY, ay = Number.POSITIVE_INFINITY;
            var ar = Number.NEGATIVE_INFINITY, ab = Number.NEGATIVE_INFINITY;
            var tmp;
            var empty = true;
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
                    empty = false;
                }
            }
            if (!empty) {
                this._updating = 1;
                this.setXY(ax, ay);
                this._updating = 2;
                this.setSize(ar - ax, ab - ay);
            }
            else {
                this._updating = 2;
                this.setSize(0, 0);
            }
            this._updating = 0;
        };
        GGroup.prototype.handleLayout = function () {
            this._updating |= 1;
            var child;
            var i;
            var cnt;
            if (this._layout == fairygui.GroupLayoutType.Horizontal) {
                var curX = NaN;
                cnt = this._parent.numChildren;
                for (i = 0; i < cnt; i++) {
                    child = this._parent.getChildAt(i);
                    if (child.group != this)
                        continue;
                    if (isNaN(curX))
                        curX = Math.floor(child.x);
                    else
                        child.x = curX;
                    if (child.width != 0)
                        curX += Math.floor(child.width + this._columnGap);
                }
                if (!this._percentReady)
                    this.updatePercent();
            }
            else if (this._layout == fairygui.GroupLayoutType.Vertical) {
                var curY = NaN;
                cnt = this._parent.numChildren;
                for (i = 0; i < cnt; i++) {
                    child = this._parent.getChildAt(i);
                    if (child.group != this)
                        continue;
                    if (isNaN(curY))
                        curY = Math.floor(child.y);
                    else
                        child.y = curY;
                    if (child.height != 0)
                        curY += Math.floor(child.height + this._lineGap);
                }
                if (!this._percentReady)
                    this.updatePercent();
            }
            this._updating &= 2;
        };
        GGroup.prototype.updatePercent = function () {
            this._percentReady = true;
            var cnt = this._parent.numChildren;
            var i;
            var child;
            var size = 0;
            if (this._layout == fairygui.GroupLayoutType.Horizontal) {
                for (i = 0; i < cnt; i++) {
                    child = this._parent.getChildAt(i);
                    if (child.group != this)
                        continue;
                    size += child.width;
                }
                for (i = 0; i < cnt; i++) {
                    child = this._parent.getChildAt(i);
                    if (child.group != this)
                        continue;
                    if (size > 0)
                        child._sizePercentInGroup = child.width / size;
                    else
                        child._sizePercentInGroup = 0;
                }
            }
            else {
                for (i = 0; i < cnt; i++) {
                    child = this._parent.getChildAt(i);
                    if (child.group != this)
                        continue;
                    size += child.height;
                }
                for (i = 0; i < cnt; i++) {
                    child = this._parent.getChildAt(i);
                    if (child.group != this)
                        continue;
                    if (size > 0)
                        child._sizePercentInGroup = child.height / size;
                    else
                        child._sizePercentInGroup = 0;
                }
            }
        };
        GGroup.prototype.moveChildren = function (dx, dy) {
            if ((this._updating & 1) != 0 || this._parent == null)
                return;
            this._updating |= 1;
            var cnt = this._parent.numChildren;
            var i;
            var child;
            for (i = 0; i < cnt; i++) {
                child = this._parent.getChildAt(i);
                if (child.group == this) {
                    child.setXY(child.x + dx, child.y + dy);
                }
            }
            this._updating &= 2;
        };
        GGroup.prototype.resizeChildren = function (dw, dh) {
            if (this._layout == fairygui.GroupLayoutType.None || (this._updating & 2) != 0 || this._parent == null)
                return;
            this._updating |= 2;
            if (!this._percentReady)
                this.updatePercent();
            var cnt = this._parent.numChildren;
            var i;
            var j;
            var child;
            var last = -1;
            var numChildren = 0;
            var lineSize = 0;
            var remainSize = 0;
            var found = false;
            for (i = 0; i < cnt; i++) {
                child = this._parent.getChildAt(i);
                if (child.group != this)
                    continue;
                last = i;
                numChildren++;
            }
            if (this._layout == fairygui.GroupLayoutType.Horizontal) {
                remainSize = lineSize = this.width - (numChildren - 1) * this._columnGap;
                var curX = NaN;
                var nw;
                for (i = 0; i < cnt; i++) {
                    child = this._parent.getChildAt(i);
                    if (child.group != this)
                        continue;
                    if (isNaN(curX))
                        curX = Math.floor(child.x);
                    else
                        child.x = curX;
                    if (last == i)
                        nw = remainSize;
                    else
                        nw = Math.round(child._sizePercentInGroup * lineSize);
                    child.setSize(nw, child._rawHeight + dh, true);
                    remainSize -= child.width;
                    if (last == i) {
                        if (remainSize >= 1) {
                            for (j = 0; j <= i; j++) {
                                child = this._parent.getChildAt(j);
                                if (child.group != this)
                                    continue;
                                if (!found) {
                                    nw = child.width + remainSize;
                                    if ((child.maxWidth == 0 || nw < child.maxWidth)
                                        && (child.minWidth == 0 || nw > child.minWidth)) {
                                        child.setSize(nw, child.height, true);
                                        found = true;
                                    }
                                }
                                else
                                    child.x += remainSize;
                            }
                        }
                    }
                    else
                        curX += (child.width + this._columnGap);
                }
            }
            else if (this._layout == fairygui.GroupLayoutType.Vertical) {
                remainSize = lineSize = this.height - (numChildren - 1) * this._lineGap;
                var curY = NaN;
                var nh;
                for (i = 0; i < cnt; i++) {
                    child = this._parent.getChildAt(i);
                    if (child.group != this)
                        continue;
                    if (isNaN(curY))
                        curY = Math.floor(child.y);
                    else
                        child.y = curY;
                    if (last == i)
                        nh = remainSize;
                    else
                        nh = Math.round(child._sizePercentInGroup * lineSize);
                    child.setSize(child._rawWidth + dw, nh, true);
                    remainSize -= child.height;
                    if (last == i) {
                        if (remainSize >= 1) {
                            for (j = 0; j <= i; j++) {
                                child = this._parent.getChildAt(j);
                                if (child.group != this)
                                    continue;
                                if (!found) {
                                    nh = child.height + remainSize;
                                    if ((child.maxHeight == 0 || nh < child.maxHeight)
                                        && (child.minHeight == 0 || nh > child.minHeight)) {
                                        child.setSize(child.width, nh, true);
                                        found = true;
                                    }
                                }
                                else
                                    child.y += remainSize;
                            }
                        }
                    }
                    else
                        curY += (child.height + this._lineGap);
                }
            }
            this._updating &= 1;
        };
        GGroup.prototype.handleAlphaChanged = function () {
            if (this._underConstruct)
                return;
            var cnt = this._parent.numChildren;
            for (var i = 0; i < cnt; i++) {
                var child = this._parent.getChildAt(i);
                if (child.group == this)
                    child.alpha = this.alpha;
            }
        };
        GGroup.prototype.handleVisibleChanged = function () {
            if (!this._parent)
                return;
            var cnt = this._parent.numChildren;
            for (var i = 0; i < cnt; i++) {
                var child = this._parent.getChildAt(i);
                if (child.group == this)
                    child.handleVisibleChanged();
            }
        };
        GGroup.prototype.setup_beforeAdd = function (xml) {
            _super.prototype.setup_beforeAdd.call(this, xml);
            var str;
            str = xml.attributes.layout;
            if (str != null) {
                this._layout = fairygui.parseGroupLayoutType(str);
                str = xml.attributes.lineGap;
                if (str)
                    this._lineGap = parseInt(str);
                str = xml.attributes.colGap;
                if (str)
                    this._columnGap = parseInt(str);
            }
        };
        GGroup.prototype.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            if (!this.visible)
                this.handleVisibleChanged();
        };
        return GGroup;
    }(fairygui.GObject));
    fairygui.GGroup = GGroup;
    __reflect(GGroup.prototype, "fairygui.GGroup");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GImage = (function (_super) {
        __extends(GImage, _super);
        function GImage() {
            var _this = _super.call(this) || this;
            _this._color = 0xFFFFFF;
            return _this;
        }
        GImage.prototype.getColorMatrix = function () {
            if (this._matrix)
                return this._matrix;
            var filters = this.filters;
            if (filters) {
                for (var i = 0; i < filters.length; i++) {
                    if (egret.is(filters[i], "egret.ColorMatrixFilter")) {
                        this._matrix = filters[i];
                        return this._matrix;
                    }
                }
            }
            var cmf = new egret.ColorMatrixFilter();
            this._matrix = cmf;
            filters = filters || [];
            filters.push(cmf);
            this.filters = filters;
            return cmf;
        };
        Object.defineProperty(GImage.prototype, "color", {
            get: function () {
                return this._color;
            },
            set: function (value) {
                if (this._color != value) {
                    this._color = value;
                    this.updateGear(4);
                    this.applyColor();
                }
            },
            enumerable: true,
            configurable: true
        });
        GImage.prototype.applyColor = function () {
            var cfm = this.getColorMatrix();
            var matrix = cfm.matrix;
            matrix[0] = ((this._color >> 16) & 0xFF) / 255;
            matrix[6] = ((this._color >> 8) & 0xFF) / 255;
            matrix[12] = (this._color & 0xFF) / 255;
            cfm.matrix = matrix;
        };
        Object.defineProperty(GImage.prototype, "flip", {
            get: function () {
                return this._flip;
            },
            set: function (value) {
                if (this._flip != value) {
                    this._flip = value;
                    this._content.scaleX = this._content.scaleY = 1;
                    if (this._flip == fairygui.FlipType.Horizontal || this._flip == fairygui.FlipType.Both)
                        this._content.scaleX = -1;
                    if (this._flip == fairygui.FlipType.Vertical || this._flip == fairygui.FlipType.Both)
                        this._content.scaleY = -1;
                    this.handleXYChanged();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GImage.prototype, "texture", {
            get: function () {
                return this._content.texture;
            },
            set: function (value) {
                if (value != null) {
                    this.sourceWidth = value.textureWidth;
                    this.sourceHeight = value.textureHeight;
                }
                else {
                    this.sourceWidth = 0;
                    this.sourceHeight = 0;
                }
                this.initWidth = this.sourceWidth;
                this.initHeight = this.sourceHeight;
                this._content.scale9Grid = null;
                this._content.fillMode = egret.BitmapFillMode.SCALE;
                this._content.texture = value;
            },
            enumerable: true,
            configurable: true
        });
        GImage.prototype.createDisplayObject = function () {
            this._content = new egret.Bitmap();
            this._content["$owner"] = this;
            this._content.touchEnabled = false;
            this.setDisplayObject(this._content);
        };
        GImage.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        GImage.prototype.constructFromResource = function () {
            this.sourceWidth = this.packageItem.width;
            this.sourceHeight = this.packageItem.height;
            this.initWidth = this.sourceWidth;
            this.initHeight = this.sourceHeight;
            this._content.scale9Grid = this.packageItem.scale9Grid;
            this._content.smoothing = this.packageItem.smoothing;
            if (this.packageItem.scaleByTile)
                this._content.fillMode = egret.BitmapFillMode.REPEAT;
            this.setSize(this.sourceWidth, this.sourceHeight);
            this.packageItem.load();
            this._content.texture = this.packageItem.texture;
        };
        GImage.prototype.handleXYChanged = function () {
            _super.prototype.handleXYChanged.call(this);
            if (this._flip != fairygui.FlipType.None) {
                if (this._content.scaleX == -1)
                    this._content.x += this.width;
                if (this._content.scaleY == -1)
                    this._content.y += this.height;
            }
        };
        GImage.prototype.handleSizeChanged = function () {
            this._content.width = this.width;
            this._content.height = this.height;
        };
        GImage.prototype.setup_beforeAdd = function (xml) {
            _super.prototype.setup_beforeAdd.call(this, xml);
            var str;
            str = xml.attributes.color;
            if (str)
                this.color = fairygui.ToolSet.convertFromHtmlColor(str);
            str = xml.attributes.flip;
            if (str)
                this.flip = fairygui.parseFlipType(str);
        };
        return GImage;
    }(fairygui.GObject));
    fairygui.GImage = GImage;
    __reflect(GImage.prototype, "fairygui.GImage");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GLabel = (function (_super) {
        __extends(GLabel, _super);
        function GLabel() {
            return _super.call(this) || this;
        }
        Object.defineProperty(GLabel.prototype, "icon", {
            get: function () {
                if (this._iconObject != null)
                    return this._iconObject.icon;
            },
            set: function (value) {
                if (this._iconObject != null)
                    this._iconObject.icon = value;
                this.updateGear(7);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLabel.prototype, "title", {
            get: function () {
                if (this._titleObject)
                    return this._titleObject.text;
                else
                    return null;
            },
            set: function (value) {
                if (this._titleObject)
                    this._titleObject.text = value;
                this.updateGear(6);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLabel.prototype, "text", {
            get: function () {
                return this.title;
            },
            set: function (value) {
                this.title = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLabel.prototype, "titleColor", {
            get: function () {
                if (this._titleObject instanceof fairygui.GTextField)
                    return this._titleObject.color;
                else if (this._titleObject instanceof GLabel)
                    return this._titleObject.titleColor;
                else if (this._titleObject instanceof fairygui.GButton)
                    return this._titleObject.titleColor;
                else
                    return 0;
            },
            set: function (value) {
                if (this._titleObject instanceof fairygui.GTextField)
                    this._titleObject.color = value;
                else if (this._titleObject instanceof GLabel)
                    this._titleObject.titleColor = value;
                else if (this._titleObject instanceof fairygui.GButton)
                    this._titleObject.titleColor = value;
                this.updateGear(4);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLabel.prototype, "color", {
            get: function () {
                return this.titleColor;
            },
            set: function (value) {
                this.titleColor = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLabel.prototype, "titleFontSize", {
            get: function () {
                if (this._titleObject instanceof fairygui.GTextField)
                    return this._titleObject.fontSize;
                else if (this._titleObject instanceof GLabel)
                    return this._titleObject.titleFontSize;
                else if (this._titleObject instanceof fairygui.GButton)
                    return this._titleObject.titleFontSize;
                else
                    return 0;
            },
            set: function (value) {
                if (this._titleObject instanceof fairygui.GTextField)
                    this._titleObject.fontSize = value;
                else if (this._titleObject instanceof GLabel)
                    this._titleObject.titleFontSize = value;
                else if (this._titleObject instanceof fairygui.GButton)
                    this._titleObject.titleFontSize = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLabel.prototype, "editable", {
            get: function () {
                if (this._titleObject && (this._titleObject instanceof fairygui.GTextInput))
                    return this._titleObject.asTextInput.editable;
                else
                    return false;
            },
            set: function (val) {
                if (this._titleObject)
                    this._titleObject.asTextInput.editable = val;
            },
            enumerable: true,
            configurable: true
        });
        GLabel.prototype.constructFromXML = function (xml) {
            _super.prototype.constructFromXML.call(this, xml);
            this._titleObject = this.getChild("title");
            this._iconObject = this.getChild("icon");
        };
        GLabel.prototype.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "Label");
            if (xml) {
                var str;
                str = xml.attributes.title;
                if (str)
                    this.text = str;
                str = xml.attributes.icon;
                if (str)
                    this.icon = str;
                str = xml.attributes.titleColor;
                if (str)
                    this.titleColor = fairygui.ToolSet.convertFromHtmlColor(str);
                str = xml.attributes.titleFontSize;
                if (str)
                    this.titleFontSize = parseInt(str);
                if (this._titleObject instanceof fairygui.GTextInput) {
                    str = xml.attributes.prompt;
                    if (str)
                        this._titleObject.promptText = str;
                    str = xml.attributes.maxLength;
                    if (str)
                        this._titleObject.maxLength = parseInt(str);
                    str = xml.attributes.restrict;
                    if (str)
                        this._titleObject.restrict = str;
                    str = xml.attributes.password;
                    if (str)
                        this._titleObject.password = str == "true";
                }
            }
        };
        return GLabel;
    }(fairygui.GComponent));
    fairygui.GLabel = GLabel;
    __reflect(GLabel.prototype, "fairygui.GLabel");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GList = (function (_super) {
        __extends(GList, _super);
        function GList() {
            var _this = _super.call(this) || this;
            _this.scrollItemToViewOnClick = true;
            _this.foldInvisibleItems = false;
            _this._lineCount = 0;
            _this._columnCount = 0;
            _this._lineGap = 0;
            _this._columnGap = 0;
            _this._lastSelectedIndex = 0;
            _this._numItems = 0;
            _this._realNumItems = 0;
            _this._firstIndex = 0; //the top left index
            _this._curLineItemCount = 0; //item count in one line
            _this._curLineItemCount2 = 0; //只用在页面模式，表示垂直方向的项目数
            _this._virtualListChanged = 0; //1-content changed, 2-size changed
            _this.itemInfoVer = 0; //用来标志item是否在本次处理中已经被重用了
            _this.enterCounter = 0; //因为HandleScroll是会重入的，这个用来避免极端情况下的死锁
            _this._trackBounds = true;
            _this._pool = new fairygui.GObjectPool();
            _this._layout = fairygui.ListLayoutType.SingleColumn;
            _this._autoResizeItem = true;
            _this._lastSelectedIndex = -1;
            _this._selectionMode = fairygui.ListSelectionMode.Single;
            _this.opaque = true;
            _this._align = fairygui.AlignType.Left;
            _this._verticalAlign = fairygui.VertAlignType.Top;
            _this._container = new egret.DisplayObjectContainer();
            _this._rootContainer.addChild(_this._container);
            return _this;
        }
        GList.prototype.dispose = function () {
            this._pool.clear();
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(GList.prototype, "layout", {
            get: function () {
                return this._layout;
            },
            set: function (value) {
                if (this._layout != value) {
                    this._layout = value;
                    this.setBoundsChangedFlag();
                    if (this._virtual)
                        this.setVirtualListChangedFlag(true);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GList.prototype, "lineCount", {
            get: function () {
                return this._lineCount;
            },
            set: function (value) {
                if (this._lineCount != value) {
                    this._lineCount = value;
                    this.setBoundsChangedFlag();
                    if (this._virtual)
                        this.setVirtualListChangedFlag(true);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GList.prototype, "columnCount", {
            get: function () {
                return this._columnCount;
            },
            set: function (value) {
                if (this._columnCount != value) {
                    this._columnCount = value;
                    this.setBoundsChangedFlag();
                    if (this._virtual)
                        this.setVirtualListChangedFlag(true);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GList.prototype, "lineGap", {
            get: function () {
                return this._lineGap;
            },
            set: function (value) {
                if (this._lineGap != value) {
                    this._lineGap = value;
                    this.setBoundsChangedFlag();
                    if (this._virtual)
                        this.setVirtualListChangedFlag(true);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GList.prototype, "columnGap", {
            get: function () {
                return this._columnGap;
            },
            set: function (value) {
                if (this._columnGap != value) {
                    this._columnGap = value;
                    this.setBoundsChangedFlag();
                    if (this._virtual)
                        this.setVirtualListChangedFlag(true);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GList.prototype, "align", {
            get: function () {
                return this._align;
            },
            set: function (value) {
                if (this._align != value) {
                    this._align = value;
                    this.setBoundsChangedFlag();
                    if (this._virtual)
                        this.setVirtualListChangedFlag(true);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GList.prototype, "verticalAlign", {
            get: function () {
                return this._verticalAlign;
            },
            set: function (value) {
                if (this._verticalAlign != value) {
                    this._verticalAlign = value;
                    this.setBoundsChangedFlag();
                    if (this._virtual)
                        this.setVirtualListChangedFlag(true);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GList.prototype, "virtualItemSize", {
            get: function () {
                return this._itemSize;
            },
            set: function (value) {
                if (this._virtual) {
                    if (this._itemSize == null)
                        this._itemSize = new egret.Point();
                    this._itemSize.copyFrom(value);
                    this.setVirtualListChangedFlag(true);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GList.prototype, "defaultItem", {
            get: function () {
                return this._defaultItem;
            },
            set: function (val) {
                this._defaultItem = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GList.prototype, "autoResizeItem", {
            get: function () {
                return this._autoResizeItem;
            },
            set: function (value) {
                if (this._autoResizeItem != value) {
                    this._autoResizeItem = value;
                    this.setBoundsChangedFlag();
                    if (this._virtual)
                        this.setVirtualListChangedFlag(true);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GList.prototype, "selectionMode", {
            get: function () {
                return this._selectionMode;
            },
            set: function (value) {
                this._selectionMode = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GList.prototype, "selectionController", {
            get: function () {
                return this._selectionController;
            },
            set: function (value) {
                this._selectionController = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GList.prototype, "itemPool", {
            get: function () {
                return this._pool;
            },
            enumerable: true,
            configurable: true
        });
        GList.prototype.getFromPool = function (url) {
            if (url === void 0) { url = null; }
            if (!url)
                url = this._defaultItem;
            var obj = this._pool.getObject(url);
            if (obj != null)
                obj.visible = true;
            return obj;
        };
        GList.prototype.returnToPool = function (obj) {
            obj.displayObject.cacheAsBitmap = false;
            this._pool.returnObject(obj);
        };
        GList.prototype.addChildAt = function (child, index) {
            if (index === void 0) { index = 0; }
            _super.prototype.addChildAt.call(this, child, index);
            if (child instanceof fairygui.GButton) {
                var button = child;
                button.selected = false;
                button.changeStateOnClick = false;
            }
            child.addEventListener(egret.TouchEvent.TOUCH_TAP, this.__clickItem, this);
            return child;
        };
        GList.prototype.addItem = function (url) {
            if (url === void 0) { url = null; }
            if (!url)
                url = this._defaultItem;
            return this.addChild(fairygui.UIPackage.createObjectFromURL(url));
        };
        GList.prototype.addItemFromPool = function (url) {
            if (url === void 0) { url = null; }
            return this.addChild(this.getFromPool(url));
        };
        GList.prototype.removeChildAt = function (index, dispose) {
            if (dispose === void 0) { dispose = false; }
            var child = _super.prototype.removeChildAt.call(this, index, dispose);
            child.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.__clickItem, this);
            return child;
        };
        GList.prototype.removeChildToPoolAt = function (index) {
            if (index === void 0) { index = 0; }
            var child = _super.prototype.removeChildAt.call(this, index);
            this.returnToPool(child);
        };
        GList.prototype.removeChildToPool = function (child) {
            _super.prototype.removeChild.call(this, child);
            this.returnToPool(child);
        };
        GList.prototype.removeChildrenToPool = function (beginIndex, endIndex) {
            if (beginIndex === void 0) { beginIndex = 0; }
            if (endIndex === void 0) { endIndex = -1; }
            if (endIndex < 0 || endIndex >= this._children.length)
                endIndex = this._children.length - 1;
            for (var i = beginIndex; i <= endIndex; ++i)
                this.removeChildToPoolAt(beginIndex);
        };
        Object.defineProperty(GList.prototype, "selectedIndex", {
            get: function () {
                var i;
                if (this._virtual) {
                    for (i = 0; i < this._realNumItems; i++) {
                        var ii = this._virtualItems[i];
                        if ((ii.obj instanceof fairygui.GButton) && ii.obj.selected
                            || ii.obj == null && ii.selected) {
                            if (this._loop)
                                return i % this._numItems;
                            else
                                return i;
                        }
                    }
                }
                else {
                    var cnt = this._children.length;
                    for (i = 0; i < cnt; i++) {
                        var obj = this._children[i].asButton;
                        if (obj != null && obj.selected)
                            return i;
                    }
                }
                return -1;
            },
            set: function (value) {
                if (value >= 0 && value < this.numItems) {
                    if (this._selectionMode != fairygui.ListSelectionMode.Single)
                        this.clearSelection();
                    this.addSelection(value);
                }
                else
                    this.clearSelection();
            },
            enumerable: true,
            configurable: true
        });
        GList.prototype.getSelection = function () {
            var ret = new Array();
            var i;
            if (this._virtual) {
                for (i = 0; i < this._realNumItems; i++) {
                    var ii = this._virtualItems[i];
                    if ((ii.obj instanceof fairygui.GButton) && ii.obj.selected
                        || ii.obj == null && ii.selected) {
                        var j = i;
                        if (this._loop) {
                            j = i % this._numItems;
                            if (ret.indexOf(j) != -1)
                                continue;
                        }
                        ret.push(j);
                    }
                }
            }
            else {
                var cnt = this._children.length;
                for (i = 0; i < cnt; i++) {
                    var obj = this._children[i].asButton;
                    if (obj != null && obj.selected)
                        ret.push(i);
                }
            }
            return ret;
        };
        GList.prototype.addSelection = function (index, scrollItToView) {
            if (scrollItToView === void 0) { scrollItToView = false; }
            if (this._selectionMode == fairygui.ListSelectionMode.None)
                return;
            this.checkVirtualList();
            if (this._selectionMode == fairygui.ListSelectionMode.Single)
                this.clearSelection();
            if (scrollItToView)
                this.scrollToView(index);
            this._lastSelectedIndex = index;
            var obj = null;
            if (this._virtual) {
                var ii = this._virtualItems[index];
                if (ii.obj != null)
                    obj = ii.obj.asButton;
                ii.selected = true;
            }
            else
                obj = this.getChildAt(index).asButton;
            if (obj != null && !obj.selected) {
                obj.selected = true;
                this.updateSelectionController(index);
            }
        };
        GList.prototype.removeSelection = function (index) {
            if (this._selectionMode == fairygui.ListSelectionMode.None)
                return;
            var obj = null;
            if (this._virtual) {
                var ii = this._virtualItems[index];
                if (ii.obj != null)
                    obj = ii.obj.asButton;
                ii.selected = false;
            }
            else
                obj = this.getChildAt(index).asButton;
            if (obj != null)
                obj.selected = false;
        };
        GList.prototype.clearSelection = function () {
            var i;
            if (this._virtual) {
                for (i = 0; i < this._realNumItems; i++) {
                    var ii = this._virtualItems[i];
                    if (ii.obj instanceof fairygui.GButton)
                        ii.obj.selected = false;
                    ii.selected = false;
                }
            }
            else {
                var cnt = this._children.length;
                for (i = 0; i < cnt; i++) {
                    var obj = this._children[i].asButton;
                    if (obj != null)
                        obj.selected = false;
                }
            }
        };
        GList.prototype.clearSelectionExcept = function (g) {
            var i;
            if (this._virtual) {
                for (i = 0; i < this._realNumItems; i++) {
                    var ii = this._virtualItems[i];
                    if (ii.obj != g) {
                        if ((ii.obj instanceof fairygui.GButton))
                            ii.obj.selected = false;
                        ii.selected = false;
                    }
                }
            }
            else {
                var cnt = this._children.length;
                for (i = 0; i < cnt; i++) {
                    var obj = this._children[i].asButton;
                    if (obj != null && obj != g)
                        obj.selected = false;
                }
            }
        };
        GList.prototype.selectAll = function () {
            this.checkVirtualList();
            var last = -1;
            var i;
            if (this._virtual) {
                for (i = 0; i < this._realNumItems; i++) {
                    var ii = this._virtualItems[i];
                    if ((ii.obj instanceof fairygui.GButton) && !ii.obj.selected) {
                        ii.obj.selected = true;
                        last = i;
                    }
                    ii.selected = true;
                }
            }
            else {
                var cnt = this._children.length;
                for (i = 0; i < cnt; i++) {
                    var obj = this._children[i].asButton;
                    if (obj != null && !obj.selected) {
                        obj.selected = true;
                        last = i;
                    }
                }
            }
            if (last != -1)
                this.updateSelectionController(last);
        };
        GList.prototype.selectNone = function () {
            this.clearSelection();
        };
        GList.prototype.selectReverse = function () {
            this.checkVirtualList();
            var last = -1;
            var i;
            if (this._virtual) {
                for (i = 0; i < this._realNumItems; i++) {
                    var ii = this._virtualItems[i];
                    if (ii.obj instanceof fairygui.GButton) {
                        ii.obj.selected = !ii.obj.selected;
                        if (ii.obj.selected)
                            last = i;
                    }
                    ii.selected = !ii.selected;
                }
            }
            else {
                var cnt = this._children.length;
                for (i = 0; i < cnt; i++) {
                    var obj = this._children[i].asButton;
                    if (obj != null) {
                        obj.selected = !obj.selected;
                        if (obj.selected)
                            last = i;
                    }
                }
            }
            if (last != -1)
                this.updateSelectionController(last);
        };
        GList.prototype.handleArrowKey = function (dir) {
            if (dir === void 0) { dir = 0; }
            var index = this.selectedIndex;
            if (index == -1)
                return;
            switch (dir) {
                case 1://up
                    if (this._layout == fairygui.ListLayoutType.SingleColumn || this._layout == fairygui.ListLayoutType.FlowVertical) {
                        index--;
                        if (index >= 0) {
                            this.clearSelection();
                            this.addSelection(index, true);
                        }
                    }
                    else if (this._layout == fairygui.ListLayoutType.FlowHorizontal || this._layout == fairygui.ListLayoutType.Pagination) {
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
                case 3://right
                    if (this._layout == fairygui.ListLayoutType.SingleRow || this._layout == fairygui.ListLayoutType.FlowHorizontal || this._layout == fairygui.ListLayoutType.Pagination) {
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
                case 5://down
                    if (this._layout == fairygui.ListLayoutType.SingleColumn || this._layout == fairygui.ListLayoutType.FlowVertical) {
                        index++;
                        if (index < this._children.length) {
                            this.clearSelection();
                            this.addSelection(index, true);
                        }
                    }
                    else if (this._layout == fairygui.ListLayoutType.FlowHorizontal || this._layout == fairygui.ListLayoutType.Pagination) {
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
                case 7://left
                    if (this._layout == fairygui.ListLayoutType.SingleRow || this._layout == fairygui.ListLayoutType.FlowHorizontal || this._layout == fairygui.ListLayoutType.Pagination) {
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
        GList.prototype.__clickItem = function (evt) {
            if (this._scrollPane != null && this._scrollPane.isDragged)
                return;
            var item = (evt.currentTarget);
            this.setSelectionOnEvent(item);
            if (this._scrollPane && this.scrollItemToViewOnClick)
                this._scrollPane.scrollToView(item, true);
            var ie = new fairygui.ItemEvent(fairygui.ItemEvent.CLICK, item);
            ie.stageX = evt.stageX;
            ie.stageY = evt.stageY;
            this.dispatchEvent(ie);
        };
        GList.prototype.setSelectionOnEvent = function (item) {
            if (!(item instanceof fairygui.GButton) || this._selectionMode == fairygui.ListSelectionMode.None)
                return;
            var dontChangeLastIndex = false;
            var button = item;
            var index = this.childIndexToItemIndex(this.getChildIndex(item));
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
                            max = Math.min(max, this.numItems - 1);
                            var i;
                            if (this._virtual) {
                                for (i = min; i <= max; i++) {
                                    var ii = this._virtualItems[i];
                                    if (ii.obj instanceof fairygui.GButton)
                                        ii.obj.selected = true;
                                    ii.selected = true;
                                }
                            }
                            else {
                                for (i = min; i <= max; i++) {
                                    var obj = this.getChildAt(i).asButton;
                                    if (obj != null)
                                        obj.selected = true;
                                }
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
            if (button.selected)
                this.updateSelectionController(index);
        };
        GList.prototype.resizeToFit = function (itemCount, minSize) {
            if (itemCount === void 0) { itemCount = Number.POSITIVE_INFINITY; }
            if (minSize === void 0) { minSize = 0; }
            this.ensureBoundsCorrect();
            var curCount = this.numItems;
            if (itemCount > curCount)
                itemCount = curCount;
            if (this._virtual) {
                var lineCount = Math.ceil(itemCount / this._curLineItemCount);
                if (this._layout == fairygui.ListLayoutType.SingleColumn || this._layout == fairygui.ListLayoutType.FlowHorizontal)
                    this.viewHeight = lineCount * this._itemSize.y + Math.max(0, lineCount - 1) * this._lineGap;
                else
                    this.viewWidth = lineCount * this._itemSize.x + Math.max(0, lineCount - 1) * this._columnGap;
            }
            else if (itemCount == 0) {
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
                    if (!this.foldInvisibleItems || obj.visible)
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
        GList.prototype.getMaxItemWidth = function () {
            var cnt = this._children.length;
            var max = 0;
            for (var i = 0; i < cnt; i++) {
                var child = this.getChildAt(i);
                if (child.width > max)
                    max = child.width;
            }
            return max;
        };
        GList.prototype.handleSizeChanged = function () {
            _super.prototype.handleSizeChanged.call(this);
            this.setBoundsChangedFlag();
            if (this._virtual)
                this.setVirtualListChangedFlag(true);
        };
        GList.prototype.handleControllerChanged = function (c) {
            _super.prototype.handleControllerChanged.call(this, c);
            if (this._selectionController == c)
                this.selectedIndex = c.selectedIndex;
        };
        GList.prototype.updateSelectionController = function (index) {
            if (this._selectionController != null && !this._selectionController.changing
                && index < this._selectionController.pageCount) {
                var c = this._selectionController;
                this._selectionController = null;
                c.selectedIndex = index;
                this._selectionController = c;
            }
        };
        GList.prototype.getSnappingPosition = function (xValue, yValue, resultPoint) {
            if (this._virtual) {
                if (!resultPoint)
                    resultPoint = new egret.Point();
                var saved;
                var index;
                if (this._layout == fairygui.ListLayoutType.SingleColumn || this._layout == fairygui.ListLayoutType.FlowHorizontal) {
                    saved = yValue;
                    GList.pos_param = yValue;
                    index = this.getIndexOnPos1(false);
                    yValue = GList.pos_param;
                    if (index < this._virtualItems.length && saved - yValue > this._virtualItems[index].height / 2 && index < this._realNumItems)
                        yValue += this._virtualItems[index].height + this._lineGap;
                }
                else if (this._layout == fairygui.ListLayoutType.SingleRow || this._layout == fairygui.ListLayoutType.FlowVertical) {
                    saved = xValue;
                    GList.pos_param = xValue;
                    index = this.getIndexOnPos2(false);
                    xValue = GList.pos_param;
                    if (index < this._virtualItems.length && saved - xValue > this._virtualItems[index].width / 2 && index < this._realNumItems)
                        xValue += this._virtualItems[index].width + this._columnGap;
                }
                else {
                    saved = xValue;
                    GList.pos_param = xValue;
                    index = this.getIndexOnPos3(false);
                    xValue = GList.pos_param;
                    if (index < this._virtualItems.length && saved - xValue > this._virtualItems[index].width / 2 && index < this._realNumItems)
                        xValue += this._virtualItems[index].width + this._columnGap;
                }
                resultPoint.x = xValue;
                resultPoint.y = yValue;
                return resultPoint;
            }
            else {
                return _super.prototype.getSnappingPosition.call(this, xValue, yValue, resultPoint);
            }
        };
        GList.prototype.scrollToView = function (index, ani, setFirst) {
            if (ani === void 0) { ani = false; }
            if (setFirst === void 0) { setFirst = false; }
            if (this._virtual) {
                if (this._numItems == 0)
                    return;
                this.checkVirtualList();
                if (index >= this._virtualItems.length)
                    throw "Invalid child index: " + index + ">" + this._virtualItems.length;
                if (this._loop)
                    index = Math.floor(this._firstIndex / this._numItems) * this._numItems + index;
                var rect;
                var ii = this._virtualItems[index];
                var pos = 0;
                var i;
                if (this._layout == fairygui.ListLayoutType.SingleColumn || this._layout == fairygui.ListLayoutType.FlowHorizontal) {
                    for (i = 0; i < index; i += this._curLineItemCount)
                        pos += this._virtualItems[i].height + this._lineGap;
                    rect = new egret.Rectangle(0, pos, this._itemSize.x, ii.height);
                }
                else if (this._layout == fairygui.ListLayoutType.SingleRow || this._layout == fairygui.ListLayoutType.FlowVertical) {
                    for (i = 0; i < index; i += this._curLineItemCount)
                        pos += this._virtualItems[i].width + this._columnGap;
                    rect = new egret.Rectangle(pos, 0, ii.width, this._itemSize.y);
                }
                else {
                    var page = index / (this._curLineItemCount * this._curLineItemCount2);
                    rect = new egret.Rectangle(page * this.viewWidth + (index % this._curLineItemCount) * (ii.width + this._columnGap), (index / this._curLineItemCount) % this._curLineItemCount2 * (ii.height + this._lineGap), ii.width, ii.height);
                }
                setFirst = true; //因为在可变item大小的情况下，只有设置在最顶端，位置才不会因为高度变化而改变，所以只能支持setFirst=true
                if (this._scrollPane != null)
                    this._scrollPane.scrollToView(rect, ani, setFirst);
            }
            else {
                var obj = this.getChildAt(index);
                if (obj != null) {
                    if (this._scrollPane != null)
                        this._scrollPane.scrollToView(obj, ani, setFirst);
                    else if (this.parent != null && this.parent.scrollPane != null)
                        this.parent.scrollPane.scrollToView(obj, ani, setFirst);
                }
            }
        };
        GList.prototype.getFirstChildInView = function () {
            return this.childIndexToItemIndex(_super.prototype.getFirstChildInView.call(this));
        };
        GList.prototype.childIndexToItemIndex = function (index) {
            if (!this._virtual)
                return index;
            if (this._layout == fairygui.ListLayoutType.Pagination) {
                for (var i = this._firstIndex; i < this._realNumItems; i++) {
                    if (this._virtualItems[i].obj != null) {
                        index--;
                        if (index < 0)
                            return i;
                    }
                }
                return index;
            }
            else {
                index += this._firstIndex;
                if (this._loop && this._numItems > 0)
                    index = index % this._numItems;
                return index;
            }
        };
        GList.prototype.itemIndexToChildIndex = function (index) {
            if (!this._virtual)
                return index;
            if (this._layout == fairygui.ListLayoutType.Pagination) {
                return this.getChildIndex(this._virtualItems[index].obj);
            }
            else {
                if (this._loop && this._numItems > 0) {
                    var j = this._firstIndex % this._numItems;
                    if (index >= j)
                        index = this._firstIndex + (index - j);
                    else
                        index = this._firstIndex + this._numItems + (j - index);
                }
                else
                    index -= this._firstIndex;
                return index;
            }
        };
        GList.prototype.setVirtual = function () {
            this._setVirtual(false);
        };
        /// <summary>
        /// Set the list to be virtual list, and has loop behavior.
        /// </summary>
        GList.prototype.setVirtualAndLoop = function () {
            this._setVirtual(true);
        };
        /// <summary>
        /// Set the list to be virtual list.
        /// </summary>
        GList.prototype._setVirtual = function (loop) {
            if (!this._virtual) {
                if (this._scrollPane == null)
                    throw "Virtual list must be scrollable!";
                if (loop) {
                    if (this._layout == fairygui.ListLayoutType.FlowHorizontal || this._layout == fairygui.ListLayoutType.FlowVertical)
                        throw "Loop list is not supported for FlowHorizontal or FlowVertical layout!";
                    this._scrollPane.bouncebackEffect = false;
                }
                this._virtual = true;
                this._loop = loop;
                this._virtualItems = new Array();
                this.removeChildrenToPool();
                if (this._itemSize == null) {
                    this._itemSize = new egret.Point();
                    var obj = this.getFromPool(null);
                    if (obj == null) {
                        throw "Virtual List must have a default list item resource.";
                    }
                    else {
                        this._itemSize.x = obj.width;
                        this._itemSize.y = obj.height;
                    }
                    this.returnToPool(obj);
                }
                if (this._layout == fairygui.ListLayoutType.SingleColumn || this._layout == fairygui.ListLayoutType.FlowHorizontal) {
                    this._scrollPane.scrollStep = this._itemSize.y;
                    if (this._loop)
                        this._scrollPane._loop = 2;
                }
                else {
                    this._scrollPane.scrollStep = this._itemSize.x;
                    if (this._loop)
                        this._scrollPane._loop = 1;
                }
                this._scrollPane.addEventListener(fairygui.ScrollPane.SCROLL, this.__scrolled, this);
                this.setVirtualListChangedFlag(true);
            }
        };
        Object.defineProperty(GList.prototype, "numItems", {
            /// <summary>
            /// Set the list item count. 
            /// If the list is not virtual, specified number of items will be created. 
            /// If the list is virtual, only items in view will be created.
            /// </summary>
            get: function () {
                if (this._virtual)
                    return this._numItems;
                else
                    return this._children.length;
            },
            set: function (value) {
                if (this._virtual) {
                    if (this.itemRenderer == null)
                        throw "Set itemRenderer first!";
                    this._numItems = value;
                    if (this._loop)
                        this._realNumItems = this._numItems * 6; //设置6倍数量，用于循环滚动
                    else
                        this._realNumItems = this._numItems;
                    //_virtualItems的设计是只增不减的
                    var oldCount = this._virtualItems.length;
                    if (this._realNumItems > oldCount) {
                        for (i = oldCount; i < this._realNumItems; i++) {
                            var ii = new ItemInfo();
                            ii.width = this._itemSize.x;
                            ii.height = this._itemSize.y;
                            this._virtualItems.push(ii);
                        }
                    }
                    else {
                        for (i = this._realNumItems; i < oldCount; i++)
                            this._virtualItems[i].selected = false;
                    }
                    if (this._virtualListChanged != 0)
                        fairygui.GTimers.inst.remove(this._refreshVirtualList, this);
                    //立即刷新
                    this._refreshVirtualList();
                }
                else {
                    var cnt = this._children.length;
                    if (value > cnt) {
                        for (var i = cnt; i < value; i++) {
                            if (this.itemProvider == null)
                                this.addItemFromPool();
                            else
                                this.addItemFromPool(this.itemProvider.call(this.callbackThisObj, i));
                        }
                    }
                    else {
                        this.removeChildrenToPool(value, cnt);
                    }
                    if (this.itemRenderer != null) {
                        for (i = 0; i < value; i++)
                            this.itemRenderer.call(this.callbackThisObj, i, this.getChildAt(i));
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        GList.prototype.refreshVirtualList = function () {
            this.setVirtualListChangedFlag(false);
        };
        GList.prototype.checkVirtualList = function () {
            if (this._virtualListChanged != 0) {
                this._refreshVirtualList();
                fairygui.GTimers.inst.remove(this._refreshVirtualList, this);
            }
        };
        GList.prototype.setVirtualListChangedFlag = function (layoutChanged) {
            if (layoutChanged === void 0) { layoutChanged = false; }
            if (layoutChanged)
                this._virtualListChanged = 2;
            else if (this._virtualListChanged == 0)
                this._virtualListChanged = 1;
            fairygui.GTimers.inst.callLater(this._refreshVirtualList, this);
        };
        GList.prototype._refreshVirtualList = function () {
            var layoutChanged = this._virtualListChanged == 2;
            this._virtualListChanged = 0;
            this._eventLocked = true;
            if (layoutChanged) {
                if (this._layout == fairygui.ListLayoutType.SingleColumn || this._layout == fairygui.ListLayoutType.SingleRow)
                    this._curLineItemCount = 1;
                else if (this._layout == fairygui.ListLayoutType.FlowHorizontal) {
                    if (this._columnCount > 0)
                        this._curLineItemCount = this._columnCount;
                    else {
                        this._curLineItemCount = Math.floor((this._scrollPane.viewWidth + this._columnGap) / (this._itemSize.x + this._columnGap));
                        if (this._curLineItemCount <= 0)
                            this._curLineItemCount = 1;
                    }
                }
                else if (this._layout == fairygui.ListLayoutType.FlowVertical) {
                    if (this._lineCount > 0)
                        this._curLineItemCount = this._lineCount;
                    else {
                        this._curLineItemCount = Math.floor((this._scrollPane.viewHeight + this._lineGap) / (this._itemSize.y + this._lineGap));
                        if (this._curLineItemCount <= 0)
                            this._curLineItemCount = 1;
                    }
                }
                else {
                    if (this._columnCount > 0)
                        this._curLineItemCount = this._columnCount;
                    else {
                        this._curLineItemCount = Math.floor((this._scrollPane.viewWidth + this._columnGap) / (this._itemSize.x + this._columnGap));
                        if (this._curLineItemCount <= 0)
                            this._curLineItemCount = 1;
                    }
                    if (this._lineCount > 0)
                        this._curLineItemCount2 = this._lineCount;
                    else {
                        this._curLineItemCount2 = Math.floor((this._scrollPane.viewHeight + this._lineGap) / (this._itemSize.y + this._lineGap));
                        if (this._curLineItemCount2 <= 0)
                            this._curLineItemCount2 = 1;
                    }
                }
            }
            var ch = 0, cw = 0;
            if (this._realNumItems > 0) {
                var i;
                var len = Math.ceil(this._realNumItems / this._curLineItemCount) * this._curLineItemCount;
                var len2 = Math.min(this._curLineItemCount, this._realNumItems);
                if (this._layout == fairygui.ListLayoutType.SingleColumn || this._layout == fairygui.ListLayoutType.FlowHorizontal) {
                    for (i = 0; i < len; i += this._curLineItemCount)
                        ch += this._virtualItems[i].height + this._lineGap;
                    if (ch > 0)
                        ch -= this._lineGap;
                    if (this._autoResizeItem)
                        cw = this._scrollPane.viewWidth;
                    else {
                        for (i = 0; i < len2; i++)
                            cw += this._virtualItems[i].width + this._columnGap;
                        if (cw > 0)
                            cw -= this._columnGap;
                    }
                }
                else if (this._layout == fairygui.ListLayoutType.SingleRow || this._layout == fairygui.ListLayoutType.FlowVertical) {
                    for (i = 0; i < len; i += this._curLineItemCount)
                        cw += this._virtualItems[i].width + this._columnGap;
                    if (cw > 0)
                        cw -= this._columnGap;
                    if (this._autoResizeItem)
                        ch = this._scrollPane.viewHeight;
                    else {
                        for (i = 0; i < len2; i++)
                            ch += this._virtualItems[i].height + this._lineGap;
                        if (ch > 0)
                            ch -= this._lineGap;
                    }
                }
                else {
                    var pageCount = Math.ceil(len / (this._curLineItemCount * this._curLineItemCount2));
                    cw = pageCount * this.viewWidth;
                    ch = this.viewHeight;
                }
            }
            this.handleAlign(cw, ch);
            this._scrollPane.setContentSize(cw, ch);
            this._eventLocked = false;
            this.handleScroll(true);
        };
        GList.prototype.__scrolled = function (evt) {
            this.handleScroll(false);
        };
        GList.prototype.getIndexOnPos1 = function (forceUpdate) {
            if (this._realNumItems < this._curLineItemCount) {
                GList.pos_param = 0;
                return 0;
            }
            var i;
            var pos2;
            var pos3;
            if (this.numChildren > 0 && !forceUpdate) {
                pos2 = this.getChildAt(0).y;
                if (pos2 > GList.pos_param) {
                    for (i = this._firstIndex - this._curLineItemCount; i >= 0; i -= this._curLineItemCount) {
                        pos2 -= (this._virtualItems[i].height + this._lineGap);
                        if (pos2 <= GList.pos_param) {
                            GList.pos_param = pos2;
                            return i;
                        }
                    }
                    GList.pos_param = 0;
                    return 0;
                }
                else {
                    for (i = this._firstIndex; i < this._realNumItems; i += this._curLineItemCount) {
                        pos3 = pos2 + this._virtualItems[i].height + this._lineGap;
                        if (pos3 > GList.pos_param) {
                            GList.pos_param = pos2;
                            return i;
                        }
                        pos2 = pos3;
                    }
                    GList.pos_param = pos2;
                    return this._realNumItems - this._curLineItemCount;
                }
            }
            else {
                pos2 = 0;
                for (i = 0; i < this._realNumItems; i += this._curLineItemCount) {
                    pos3 = pos2 + this._virtualItems[i].height + this._lineGap;
                    if (pos3 > GList.pos_param) {
                        GList.pos_param = pos2;
                        return i;
                    }
                    pos2 = pos3;
                }
                GList.pos_param = pos2;
                return this._realNumItems - this._curLineItemCount;
            }
        };
        GList.prototype.getIndexOnPos2 = function (forceUpdate) {
            if (this._realNumItems < this._curLineItemCount) {
                GList.pos_param = 0;
                return 0;
            }
            var i;
            var pos2;
            var pos3;
            if (this.numChildren > 0 && !forceUpdate) {
                pos2 = this.getChildAt(0).x;
                if (pos2 > GList.pos_param) {
                    for (i = this._firstIndex - this._curLineItemCount; i >= 0; i -= this._curLineItemCount) {
                        pos2 -= (this._virtualItems[i].width + this._columnGap);
                        if (pos2 <= GList.pos_param) {
                            GList.pos_param = pos2;
                            return i;
                        }
                    }
                    GList.pos_param = 0;
                    return 0;
                }
                else {
                    for (i = this._firstIndex; i < this._realNumItems; i += this._curLineItemCount) {
                        pos3 = pos2 + this._virtualItems[i].width + this._columnGap;
                        if (pos3 > GList.pos_param) {
                            GList.pos_param = pos2;
                            return i;
                        }
                        pos2 = pos3;
                    }
                    GList.pos_param = pos2;
                    return this._realNumItems - this._curLineItemCount;
                }
            }
            else {
                pos2 = 0;
                for (i = 0; i < this._realNumItems; i += this._curLineItemCount) {
                    pos3 = pos2 + this._virtualItems[i].width + this._columnGap;
                    if (pos3 > GList.pos_param) {
                        GList.pos_param = pos2;
                        return i;
                    }
                    pos2 = pos3;
                }
                GList.pos_param = pos2;
                return this._realNumItems - this._curLineItemCount;
            }
        };
        GList.prototype.getIndexOnPos3 = function (forceUpdate) {
            if (this._realNumItems < this._curLineItemCount) {
                GList.pos_param = 0;
                return 0;
            }
            var viewWidth = this.viewWidth;
            var page = Math.floor(GList.pos_param / viewWidth);
            var startIndex = page * (this._curLineItemCount * this._curLineItemCount2);
            var pos2 = page * viewWidth;
            var i;
            var pos3;
            for (i = 0; i < this._curLineItemCount; i++) {
                pos3 = pos2 + this._virtualItems[startIndex + i].width + this._columnGap;
                if (pos3 > GList.pos_param) {
                    GList.pos_param = pos2;
                    return startIndex + i;
                }
                pos2 = pos3;
            }
            GList.pos_param = pos2;
            return startIndex + this._curLineItemCount - 1;
        };
        GList.prototype.handleScroll = function (forceUpdate) {
            if (this._eventLocked)
                return;
            this.enterCounter = 0;
            if (this._layout == fairygui.ListLayoutType.SingleColumn || this._layout == fairygui.ListLayoutType.FlowHorizontal) {
                this.handleScroll1(forceUpdate);
                this.handleArchOrder1();
            }
            else if (this._layout == fairygui.ListLayoutType.SingleRow || this._layout == fairygui.ListLayoutType.FlowVertical) {
                this.handleScroll2(forceUpdate);
                this.handleArchOrder2();
            }
            else {
                this.handleScroll3(forceUpdate);
            }
            this._boundsChanged = false;
        };
        GList.prototype.handleScroll1 = function (forceUpdate) {
            this.enterCounter++;
            if (this.enterCounter > 3) {
                console.log("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
                return;
            }
            var pos = this._scrollPane.scrollingPosY;
            var max = pos + this._scrollPane.viewHeight;
            var end = max == this._scrollPane.contentHeight; //这个标志表示当前需要滚动到最末，无论内容变化大小
            //寻找当前位置的第一条项目
            GList.pos_param = pos;
            var newFirstIndex = this.getIndexOnPos1(forceUpdate);
            pos = GList.pos_param;
            if (newFirstIndex == this._firstIndex && !forceUpdate) {
                return;
            }
            var oldFirstIndex = this._firstIndex;
            this._firstIndex = newFirstIndex;
            var curIndex = newFirstIndex;
            var forward = oldFirstIndex > newFirstIndex;
            var oldCount = this.numChildren;
            var lastIndex = oldFirstIndex + oldCount - 1;
            var reuseIndex = forward ? lastIndex : oldFirstIndex;
            var curX = 0, curY = pos;
            var needRender;
            var deltaSize = 0;
            var firstItemDeltaSize = 0;
            var url = this.defaultItem;
            var ii, ii2;
            var i, j;
            var partSize = (this._scrollPane.viewWidth - this._columnGap * (this._curLineItemCount - 1)) / this._curLineItemCount;
            this.itemInfoVer++;
            while (curIndex < this._realNumItems && (end || curY < max)) {
                ii = this._virtualItems[curIndex];
                if (ii.obj == null || forceUpdate) {
                    if (this.itemProvider != null) {
                        url = this.itemProvider.call(this.callbackThisObj, curIndex % this._numItems);
                        if (url == null)
                            url = this._defaultItem;
                        url = fairygui.UIPackage.normalizeURL(url);
                    }
                    if (ii.obj != null && ii.obj.resourceURL != url) {
                        if (ii.obj instanceof fairygui.GButton)
                            ii.selected = ii.obj.selected;
                        this.removeChildToPool(ii.obj);
                        ii.obj = null;
                    }
                }
                if (ii.obj == null) {
                    //搜索最适合的重用item，保证每次刷新需要新建或者重新render的item最少
                    if (forward) {
                        for (j = reuseIndex; j >= oldFirstIndex; j--) {
                            ii2 = this._virtualItems[j];
                            if (ii2.obj != null && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
                                if (ii2.obj instanceof fairygui.GButton)
                                    ii2.selected = ii2.obj.selected;
                                ii.obj = ii2.obj;
                                ii2.obj = null;
                                if (j == reuseIndex)
                                    reuseIndex--;
                                break;
                            }
                        }
                    }
                    else {
                        for (j = reuseIndex; j <= lastIndex; j++) {
                            ii2 = this._virtualItems[j];
                            if (ii2.obj != null && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
                                if (ii2.obj instanceof fairygui.GButton)
                                    ii2.selected = ii2.obj.selected;
                                ii.obj = ii2.obj;
                                ii2.obj = null;
                                if (j == reuseIndex)
                                    reuseIndex++;
                                break;
                            }
                        }
                    }
                    if (ii.obj != null) {
                        this.setChildIndex(ii.obj, forward ? curIndex - newFirstIndex : this.numChildren);
                    }
                    else {
                        ii.obj = this._pool.getObject(url);
                        if (forward)
                            this.addChildAt(ii.obj, curIndex - newFirstIndex);
                        else
                            this.addChild(ii.obj);
                    }
                    if (ii.obj instanceof fairygui.GButton)
                        ii.obj.selected = ii.selected;
                    needRender = true;
                }
                else
                    needRender = forceUpdate;
                if (needRender) {
                    if (this._autoResizeItem && (this._layout == fairygui.ListLayoutType.SingleColumn || this._columnCount > 0))
                        ii.obj.setSize(partSize, ii.obj.height, true);
                    this.itemRenderer.call(this.callbackThisObj, curIndex % this._numItems, ii.obj);
                    if (curIndex % this._curLineItemCount == 0) {
                        deltaSize += Math.ceil(ii.obj.height) - ii.height;
                        if (curIndex == newFirstIndex && oldFirstIndex > newFirstIndex) {
                            //当内容向下滚动时，如果新出现的项目大小发生变化，需要做一个位置补偿，才不会导致滚动跳动
                            firstItemDeltaSize = Math.ceil(ii.obj.height) - ii.height;
                        }
                    }
                    ii.width = Math.ceil(ii.obj.width);
                    ii.height = Math.ceil(ii.obj.height);
                }
                ii.updateFlag = this.itemInfoVer;
                ii.obj.setXY(curX, curY);
                if (curIndex == newFirstIndex)
                    max += ii.height;
                curX += ii.width + this._columnGap;
                if (curIndex % this._curLineItemCount == this._curLineItemCount - 1) {
                    curX = 0;
                    curY += ii.height + this._lineGap;
                }
                curIndex++;
            }
            for (i = 0; i < oldCount; i++) {
                ii = this._virtualItems[oldFirstIndex + i];
                if (ii.updateFlag != this.itemInfoVer && ii.obj != null) {
                    if (ii.obj instanceof fairygui.GButton)
                        ii.selected = ii.obj.selected;
                    this.removeChildToPool(ii.obj);
                    ii.obj = null;
                }
            }
            if (deltaSize != 0 || firstItemDeltaSize != 0)
                this._scrollPane.changeContentSizeOnScrolling(0, deltaSize, 0, firstItemDeltaSize);
            if (curIndex > 0 && this.numChildren > 0 && this._container.y < 0 && this.getChildAt(0).y > -this._container.y)
                this.handleScroll1(false);
        };
        GList.prototype.handleScroll2 = function (forceUpdate) {
            this.enterCounter++;
            if (this.enterCounter > 3) {
                console.log("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
                return;
            }
            var pos = this._scrollPane.scrollingPosX;
            var max = pos + this._scrollPane.viewWidth;
            var end = pos == this._scrollPane.contentWidth; //这个标志表示当前需要滚动到最末，无论内容变化大小
            //寻找当前位置的第一条项目
            GList.pos_param = pos;
            var newFirstIndex = this.getIndexOnPos2(forceUpdate);
            pos = GList.pos_param;
            if (newFirstIndex == this._firstIndex && !forceUpdate) {
                return;
            }
            var oldFirstIndex = this._firstIndex;
            this._firstIndex = newFirstIndex;
            var curIndex = newFirstIndex;
            var forward = oldFirstIndex > newFirstIndex;
            var oldCount = this.numChildren;
            var lastIndex = oldFirstIndex + oldCount - 1;
            var reuseIndex = forward ? lastIndex : oldFirstIndex;
            var curX = pos, curY = 0;
            var needRender;
            var deltaSize = 0;
            var firstItemDeltaSize = 0;
            var url = this.defaultItem;
            var ii, ii2;
            var i, j;
            var partSize = (this._scrollPane.viewHeight - this._lineGap * (this._curLineItemCount - 1)) / this._curLineItemCount;
            this.itemInfoVer++;
            while (curIndex < this._realNumItems && (end || curX < max)) {
                ii = this._virtualItems[curIndex];
                if (ii.obj == null || forceUpdate) {
                    if (this.itemProvider != null) {
                        url = this.itemProvider.call(this.callbackThisObj, curIndex % this._numItems);
                        if (url == null)
                            url = this._defaultItem;
                        url = fairygui.UIPackage.normalizeURL(url);
                    }
                    if (ii.obj != null && ii.obj.resourceURL != url) {
                        if (ii.obj instanceof fairygui.GButton)
                            ii.selected = ii.obj.selected;
                        this.removeChildToPool(ii.obj);
                        ii.obj = null;
                    }
                }
                if (ii.obj == null) {
                    if (forward) {
                        for (j = reuseIndex; j >= oldFirstIndex; j--) {
                            ii2 = this._virtualItems[j];
                            if (ii2.obj != null && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
                                if (ii2.obj instanceof fairygui.GButton)
                                    ii2.selected = ii2.obj.selected;
                                ii.obj = ii2.obj;
                                ii2.obj = null;
                                if (j == reuseIndex)
                                    reuseIndex--;
                                break;
                            }
                        }
                    }
                    else {
                        for (j = reuseIndex; j <= lastIndex; j++) {
                            ii2 = this._virtualItems[j];
                            if (ii2.obj != null && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
                                if (ii2.obj instanceof fairygui.GButton)
                                    ii2.selected = ii2.obj.selected;
                                ii.obj = ii2.obj;
                                ii2.obj = null;
                                if (j == reuseIndex)
                                    reuseIndex++;
                                break;
                            }
                        }
                    }
                    if (ii.obj != null) {
                        this.setChildIndex(ii.obj, forward ? curIndex - newFirstIndex : this.numChildren);
                    }
                    else {
                        ii.obj = this._pool.getObject(url);
                        if (forward)
                            this.addChildAt(ii.obj, curIndex - newFirstIndex);
                        else
                            this.addChild(ii.obj);
                    }
                    if (ii.obj instanceof fairygui.GButton)
                        ii.obj.selected = ii.selected;
                    needRender = true;
                }
                else
                    needRender = forceUpdate;
                if (needRender) {
                    if (this._autoResizeItem && (this._layout == fairygui.ListLayoutType.SingleRow || this._lineCount > 0))
                        ii.obj.setSize(ii.obj.width, partSize, true);
                    this.itemRenderer.call(this.callbackThisObj, curIndex % this._numItems, ii.obj);
                    if (curIndex % this._curLineItemCount == 0) {
                        deltaSize += Math.ceil(ii.obj.width) - ii.width;
                        if (curIndex == newFirstIndex && oldFirstIndex > newFirstIndex) {
                            //当内容向下滚动时，如果新出现的一个项目大小发生变化，需要做一个位置补偿，才不会导致滚动跳动
                            firstItemDeltaSize = Math.ceil(ii.obj.width) - ii.width;
                        }
                    }
                    ii.width = Math.ceil(ii.obj.width);
                    ii.height = Math.ceil(ii.obj.height);
                }
                ii.updateFlag = this.itemInfoVer;
                ii.obj.setXY(curX, curY);
                if (curIndex == newFirstIndex)
                    max += ii.width;
                curY += ii.height + this._lineGap;
                if (curIndex % this._curLineItemCount == this._curLineItemCount - 1) {
                    curY = 0;
                    curX += ii.width + this._columnGap;
                }
                curIndex++;
            }
            for (i = 0; i < oldCount; i++) {
                ii = this._virtualItems[oldFirstIndex + i];
                if (ii.updateFlag != this.itemInfoVer && ii.obj != null) {
                    if (ii.obj instanceof fairygui.GButton)
                        ii.selected = ii.obj.selected;
                    this.removeChildToPool(ii.obj);
                    ii.obj = null;
                }
            }
            if (deltaSize != 0 || firstItemDeltaSize != 0)
                this._scrollPane.changeContentSizeOnScrolling(deltaSize, 0, firstItemDeltaSize, 0);
            if (curIndex > 0 && this.numChildren > 0 && this._container.x < 0 && this.getChildAt(0).x > -this._container.x)
                this.handleScroll2(false);
        };
        GList.prototype.handleScroll3 = function (forceUpdate) {
            var pos = this._scrollPane.scrollingPosX;
            //寻找当前位置的第一条项目
            GList.pos_param = pos;
            var newFirstIndex = this.getIndexOnPos3(forceUpdate);
            pos = GList.pos_param;
            if (newFirstIndex == this._firstIndex && !forceUpdate)
                return;
            var oldFirstIndex = this._firstIndex;
            this._firstIndex = newFirstIndex;
            //分页模式不支持不等高，所以渲染满一页就好了
            var reuseIndex = oldFirstIndex;
            var virtualItemCount = this._virtualItems.length;
            var pageSize = this._curLineItemCount * this._curLineItemCount2;
            var startCol = newFirstIndex % this._curLineItemCount;
            var viewWidth = this.viewWidth;
            var page = Math.floor(newFirstIndex / pageSize);
            var startIndex = page * pageSize;
            var lastIndex = startIndex + pageSize * 2; //测试两页
            var needRender;
            var i;
            var ii, ii2;
            var col;
            var url = this._defaultItem;
            var partWidth = (this._scrollPane.viewWidth - this._columnGap * (this._curLineItemCount - 1)) / this._curLineItemCount;
            var partHeight = (this._scrollPane.viewHeight - this._lineGap * (this._curLineItemCount2 - 1)) / this._curLineItemCount2;
            this.itemInfoVer++;
            //先标记这次要用到的项目
            for (i = startIndex; i < lastIndex; i++) {
                if (i >= this._realNumItems)
                    continue;
                col = i % this._curLineItemCount;
                if (i - startIndex < pageSize) {
                    if (col < startCol)
                        continue;
                }
                else {
                    if (col > startCol)
                        continue;
                }
                ii = this._virtualItems[i];
                ii.updateFlag = this.itemInfoVer;
            }
            var lastObj = null;
            var insertIndex = 0;
            for (i = startIndex; i < lastIndex; i++) {
                if (i >= this._realNumItems)
                    continue;
                ii = this._virtualItems[i];
                if (ii.updateFlag != this.itemInfoVer)
                    continue;
                if (ii.obj == null) {
                    //寻找看有没有可重用的
                    while (reuseIndex < virtualItemCount) {
                        ii2 = this._virtualItems[reuseIndex];
                        if (ii2.obj != null && ii2.updateFlag != this.itemInfoVer) {
                            if (ii2.obj instanceof fairygui.GButton)
                                ii2.selected = ii2.obj.selected;
                            ii.obj = ii2.obj;
                            ii2.obj = null;
                            break;
                        }
                        reuseIndex++;
                    }
                    if (insertIndex == -1)
                        insertIndex = this.getChildIndex(lastObj) + 1;
                    if (ii.obj == null) {
                        if (this.itemProvider != null) {
                            url = this.itemProvider(i % this._numItems);
                            if (url == null)
                                url = this._defaultItem;
                            url = fairygui.UIPackage.normalizeURL(url);
                        }
                        ii.obj = this._pool.getObject(url);
                        this.addChildAt(ii.obj, insertIndex);
                    }
                    else {
                        insertIndex = this.setChildIndexBefore(ii.obj, insertIndex);
                    }
                    insertIndex++;
                    if (ii.obj instanceof fairygui.GButton)
                        ii.obj.selected = ii.selected;
                    needRender = true;
                }
                else {
                    needRender = forceUpdate;
                    insertIndex = -1;
                    lastObj = ii.obj;
                }
                if (needRender) {
                    if (this._autoResizeItem) {
                        if (this._curLineItemCount == this._columnCount && this._curLineItemCount2 == this._lineCount)
                            ii.obj.setSize(partWidth, partHeight, true);
                        else if (this._curLineItemCount == this._columnCount)
                            ii.obj.setSize(partWidth, ii.obj.height, true);
                        else if (this._curLineItemCount2 == this._lineCount)
                            ii.obj.setSize(ii.obj.width, partHeight, true);
                    }
                    this.itemRenderer.call(this.callbackThisObj, i % this._numItems, ii.obj);
                    ii.width = Math.ceil(ii.obj.width);
                    ii.height = Math.ceil(ii.obj.height);
                }
            }
            //排列item
            var borderX = (startIndex / pageSize) * viewWidth;
            var xx = borderX;
            var yy = 0;
            var lineHeight = 0;
            for (i = startIndex; i < lastIndex; i++) {
                if (i >= this._realNumItems)
                    continue;
                ii = this._virtualItems[i];
                if (ii.updateFlag == this.itemInfoVer)
                    ii.obj.setXY(xx, yy);
                if (ii.height > lineHeight)
                    lineHeight = ii.height;
                if (i % this._curLineItemCount == this._curLineItemCount - 1) {
                    xx = borderX;
                    yy += lineHeight + this._lineGap;
                    lineHeight = 0;
                    if (i == startIndex + pageSize - 1) {
                        borderX += viewWidth;
                        xx = borderX;
                        yy = 0;
                    }
                }
                else
                    xx += ii.width + this._columnGap;
            }
            //释放未使用的
            for (i = reuseIndex; i < virtualItemCount; i++) {
                ii = this._virtualItems[i];
                if (ii.updateFlag != this.itemInfoVer && ii.obj != null) {
                    if (ii.obj instanceof fairygui.GButton)
                        ii.selected = ii.obj.selected;
                    this.removeChildToPool(ii.obj);
                    ii.obj = null;
                }
            }
        };
        GList.prototype.handleArchOrder1 = function () {
            if (this.childrenRenderOrder == fairygui.ChildrenRenderOrder.Arch) {
                var mid = this._scrollPane.posY + this.viewHeight / 2;
                var minDist = Number.POSITIVE_INFINITY;
                var dist = 0;
                var apexIndex = 0;
                var cnt = this.numChildren;
                for (var i = 0; i < cnt; i++) {
                    var obj = this.getChildAt(i);
                    if (!this.foldInvisibleItems || obj.visible) {
                        dist = Math.abs(mid - obj.y - obj.height / 2);
                        if (dist < minDist) {
                            minDist = dist;
                            apexIndex = i;
                        }
                    }
                }
                this.apexIndex = apexIndex;
            }
        };
        GList.prototype.handleArchOrder2 = function () {
            if (this.childrenRenderOrder == fairygui.ChildrenRenderOrder.Arch) {
                var mid = this._scrollPane.posX + this.viewWidth / 2;
                var minDist = Number.POSITIVE_INFINITY;
                var dist = 0;
                var apexIndex = 0;
                var cnt = this.numChildren;
                for (var i = 0; i < cnt; i++) {
                    var obj = this.getChildAt(i);
                    if (!this.foldInvisibleItems || obj.visible) {
                        dist = Math.abs(mid - obj.x - obj.width / 2);
                        if (dist < minDist) {
                            minDist = dist;
                            apexIndex = i;
                        }
                    }
                }
                this.apexIndex = apexIndex;
            }
        };
        GList.prototype.handleAlign = function (contentWidth, contentHeight) {
            var newOffsetX = 0;
            var newOffsetY = 0;
            if (contentHeight < this.viewHeight) {
                if (this._verticalAlign == fairygui.VertAlignType.Middle)
                    newOffsetY = Math.floor((this.viewHeight - contentHeight) / 2);
                else if (this._verticalAlign == fairygui.VertAlignType.Bottom)
                    newOffsetY = this.viewHeight - contentHeight;
            }
            if (contentWidth < this.viewWidth) {
                if (this._align == fairygui.AlignType.Center)
                    newOffsetX = Math.floor((this.viewWidth - contentWidth) / 2);
                else if (this._align == fairygui.AlignType.Right)
                    newOffsetX = this.viewWidth - contentWidth;
            }
            if (newOffsetX != this._alignOffset.x || newOffsetY != this._alignOffset.y) {
                this._alignOffset.setTo(newOffsetX, newOffsetY);
                if (this._scrollPane != null)
                    this._scrollPane.adjustMaskContainer();
                else {
                    this._container.x = this._margin.left + this._alignOffset.x;
                    this._container.y = this._margin.top + this._alignOffset.y;
                }
            }
        };
        GList.prototype.updateBounds = function () {
            if (this._virtual)
                return;
            var i;
            var child;
            var curX = 0;
            var curY = 0;
            var maxWidth = 0;
            var maxHeight = 0;
            var cw = 0, ch = 0;
            var j = 0;
            var page = 0;
            var k = 0;
            var cnt = this._children.length;
            var viewWidth = this.viewWidth;
            var viewHeight = this.viewHeight;
            var lineSize = 0;
            var lineStart = 0;
            var ratio = 0;
            if (this._layout == fairygui.ListLayoutType.SingleColumn) {
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (this.foldInvisibleItems && !child.visible)
                        continue;
                    if (curY != 0)
                        curY += this._lineGap;
                    child.y = curY;
                    if (this._autoResizeItem)
                        child.setSize(viewWidth, child.height, true);
                    curY += Math.ceil(child.height);
                    if (child.width > maxWidth)
                        maxWidth = child.width;
                }
                cw = Math.ceil(maxWidth);
                ch = curY;
            }
            else if (this._layout == fairygui.ListLayoutType.SingleRow) {
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (this.foldInvisibleItems && !child.visible)
                        continue;
                    if (curX != 0)
                        curX += this._columnGap;
                    child.x = curX;
                    if (this._autoResizeItem)
                        child.setSize(child.width, viewHeight, true);
                    curX += Math.ceil(child.width);
                    if (child.height > maxHeight)
                        maxHeight = child.height;
                }
                cw = curX;
                ch = Math.ceil(maxHeight);
            }
            else if (this._layout == fairygui.ListLayoutType.FlowHorizontal) {
                if (this._autoResizeItem && this._columnCount > 0) {
                    for (i = 0; i < cnt; i++) {
                        child = this.getChildAt(i);
                        if (this.foldInvisibleItems && !child.visible)
                            continue;
                        lineSize += child.sourceWidth;
                        j++;
                        if (j == this._columnCount || i == cnt - 1) {
                            ratio = (viewWidth - lineSize - (j - 1) * this._columnGap) / lineSize;
                            curX = 0;
                            for (j = lineStart; j <= i; j++) {
                                child = this.getChildAt(j);
                                if (this.foldInvisibleItems && !child.visible)
                                    continue;
                                child.setXY(curX, curY);
                                if (j < i) {
                                    child.setSize(child.sourceWidth + Math.round(child.sourceWidth * ratio), child.height, true);
                                    curX += Math.ceil(child.width) + this._columnGap;
                                }
                                else {
                                    child.setSize(viewWidth - curX, child.height, true);
                                }
                                if (child.height > maxHeight)
                                    maxHeight = child.height;
                            }
                            //new line
                            curY += Math.ceil(maxHeight) + this._lineGap;
                            maxHeight = 0;
                            j = 0;
                            lineStart = i + 1;
                            lineSize = 0;
                        }
                    }
                    ch = curY + Math.ceil(maxHeight);
                    cw = viewWidth;
                }
                else {
                    for (i = 0; i < cnt; i++) {
                        child = this.getChildAt(i);
                        if (this.foldInvisibleItems && !child.visible)
                            continue;
                        if (curX != 0)
                            curX += this._columnGap;
                        if (this._columnCount != 0 && j >= this._columnCount
                            || this._columnCount == 0 && curX + child.width > viewWidth && maxHeight != 0) {
                            //new line
                            curX = 0;
                            curY += Math.ceil(maxHeight) + this._lineGap;
                            maxHeight = 0;
                            j = 0;
                        }
                        child.setXY(curX, curY);
                        curX += Math.ceil(child.width);
                        if (curX > maxWidth)
                            maxWidth = curX;
                        if (child.height > maxHeight)
                            maxHeight = child.height;
                        j++;
                    }
                    ch = curY + Math.ceil(maxHeight);
                    cw = Math.ceil(maxWidth);
                }
            }
            else if (this._layout == fairygui.ListLayoutType.FlowVertical) {
                if (this._autoResizeItem && this._lineCount > 0) {
                    for (i = 0; i < cnt; i++) {
                        child = this.getChildAt(i);
                        if (this.foldInvisibleItems && !child.visible)
                            continue;
                        lineSize += child.sourceHeight;
                        j++;
                        if (j == this._lineCount || i == cnt - 1) {
                            ratio = (viewHeight - lineSize - (j - 1) * this._lineGap) / lineSize;
                            curY = 0;
                            for (j = lineStart; j <= i; j++) {
                                child = this.getChildAt(j);
                                if (this.foldInvisibleItems && !child.visible)
                                    continue;
                                child.setXY(curX, curY);
                                if (j < i) {
                                    child.setSize(child.width, child.sourceHeight + Math.round(child.sourceHeight * ratio), true);
                                    curY += Math.ceil(child.height) + this._lineGap;
                                }
                                else {
                                    child.setSize(child.width, viewHeight - curY, true);
                                }
                                if (child.width > maxWidth)
                                    maxWidth = child.width;
                            }
                            //new line
                            curX += Math.ceil(maxWidth) + this._columnGap;
                            maxWidth = 0;
                            j = 0;
                            lineStart = i + 1;
                            lineSize = 0;
                        }
                    }
                    cw = curX + Math.ceil(maxWidth);
                    ch = viewHeight;
                }
                else {
                    for (i = 0; i < cnt; i++) {
                        child = this.getChildAt(i);
                        if (this.foldInvisibleItems && !child.visible)
                            continue;
                        if (curY != 0)
                            curY += this._lineGap;
                        if (this._lineCount != 0 && j >= this._lineCount
                            || this._lineCount == 0 && curY + child.height > viewHeight && maxWidth != 0) {
                            curY = 0;
                            curX += Math.ceil(maxWidth) + this._columnGap;
                            maxWidth = 0;
                            j = 0;
                        }
                        child.setXY(curX, curY);
                        curY += Math.ceil(child.height);
                        if (curY > maxHeight)
                            maxHeight = curY;
                        if (child.width > maxWidth)
                            maxWidth = child.width;
                        j++;
                    }
                    cw = curX + Math.ceil(maxWidth);
                    ch = Math.ceil(maxHeight);
                }
            }
            else {
                var eachHeight;
                if (this._autoResizeItem && this._lineCount > 0)
                    eachHeight = Math.floor((viewHeight - (this._lineCount - 1) * this._lineGap) / this._lineCount);
                if (this._autoResizeItem && this._columnCount > 0) {
                    for (i = 0; i < cnt; i++) {
                        child = this.getChildAt(i);
                        if (this.foldInvisibleItems && !child.visible)
                            continue;
                        lineSize += child.sourceWidth;
                        j++;
                        if (j == this._columnCount || i == cnt - 1) {
                            ratio = (viewWidth - lineSize - (j - 1) * this._columnGap) / lineSize;
                            curX = 0;
                            for (j = lineStart; j <= i; j++) {
                                child = this.getChildAt(j);
                                if (this.foldInvisibleItems && !child.visible)
                                    continue;
                                child.setXY(page * viewWidth + curX, curY);
                                if (j < i) {
                                    child.setSize(child.sourceWidth + Math.round(child.sourceWidth * ratio), this._lineCount > 0 ? eachHeight : child.height, true);
                                    curX += Math.ceil(child.width) + this._columnGap;
                                }
                                else {
                                    child.setSize(viewWidth - curX, this._lineCount > 0 ? eachHeight : child.height, true);
                                }
                                if (child.height > maxHeight)
                                    maxHeight = child.height;
                            }
                            //new line
                            curY += Math.ceil(maxHeight) + this._lineGap;
                            maxHeight = 0;
                            j = 0;
                            lineStart = i + 1;
                            lineSize = 0;
                            k++;
                            if (this._lineCount != 0 && k >= this._lineCount
                                || this._lineCount == 0 && curY + child.height > viewHeight) {
                                //new page
                                page++;
                                curY = 0;
                                k = 0;
                            }
                        }
                    }
                }
                else {
                    for (i = 0; i < cnt; i++) {
                        child = this.getChildAt(i);
                        if (this.foldInvisibleItems && !child.visible)
                            continue;
                        if (curX != 0)
                            curX += this._columnGap;
                        if (this._autoResizeItem && this._lineCount > 0)
                            child.setSize(child.width, eachHeight, true);
                        if (this._columnCount != 0 && j >= this._columnCount
                            || this._columnCount == 0 && curX + child.width > viewWidth && maxHeight != 0) {
                            //new line
                            curX = 0;
                            curY += Math.ceil(maxHeight) + this._lineGap;
                            maxHeight = 0;
                            j = 0;
                            k++;
                            if (this._lineCount != 0 && k >= this._lineCount
                                || this._lineCount == 0 && curY + child.height > viewHeight && maxWidth != 0) {
                                page++;
                                curY = 0;
                                k = 0;
                            }
                        }
                        child.setXY(page * viewWidth + curX, curY);
                        curX += Math.ceil(child.width);
                        if (curX > maxWidth)
                            maxWidth = curX;
                        if (child.height > maxHeight)
                            maxHeight = child.height;
                        j++;
                    }
                }
                ch = page > 0 ? viewHeight : curY + Math.ceil(maxHeight);
                cw = (page + 1) * viewWidth;
            }
            this.handleAlign(cw, ch);
            this.setBounds(0, 0, cw, ch);
        };
        GList.prototype.setup_beforeAdd = function (xml) {
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
            str = xml.attributes.align;
            if (str)
                this._align = fairygui.parseAlignType(str);
            str = xml.attributes.vAlign;
            if (str)
                this._verticalAlign = fairygui.parseVertAlignType(str);
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
                var headerRes;
                var footerRes;
                str = xml.attributes.ptrRes;
                if (str) {
                    arr = str.split(",");
                    headerRes = arr[0];
                    footerRes = arr[1];
                }
                this.setupScroll(scrollBarMargin, scroll, scrollBarDisplay, scrollBarFlags, vtScrollBarRes, hzScrollBarRes, headerRes, footerRes);
            }
            else
                this.setupOverflow(overflow);
            str = xml.attributes.lineGap;
            if (str)
                this._lineGap = parseInt(str);
            str = xml.attributes.colGap;
            if (str)
                this._columnGap = parseInt(str);
            str = xml.attributes.lineItemCount;
            if (str) {
                if (this._layout == fairygui.ListLayoutType.FlowHorizontal || this._layout == fairygui.ListLayoutType.Pagination)
                    this._columnCount = parseInt(str);
                else if (this._layout == fairygui.ListLayoutType.FlowVertical)
                    this._lineCount = parseInt(str);
            }
            str = xml.attributes.lineItemCount2;
            if (str)
                this._lineCount = parseInt(str);
            str = xml.attributes.selectionMode;
            if (str)
                this._selectionMode = fairygui.parseListSelectionMode(str);
            str = xml.attributes.defaultItem;
            if (str)
                this._defaultItem = str;
            str = xml.attributes.autoItemSize;
            if (this._layout == fairygui.ListLayoutType.SingleRow || this._layout == fairygui.ListLayoutType.SingleColumn)
                this._autoResizeItem = str != "false";
            else
                this._autoResizeItem = str == "true";
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
                        str = cxml.attributes.title;
                        if (str)
                            obj.text = str;
                        str = cxml.attributes.icon;
                        if (str)
                            obj.icon = str;
                        str = cxml.attributes.name;
                        if (str)
                            obj.name = str;
                        str = cxml.attributes.selectedIcon;
                        if (str && (obj instanceof fairygui.GButton))
                            obj.selectedIcon = str;
                    }
                }
            }
        };
        GList.prototype.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            var str;
            str = xml.attributes.selectionController;
            if (str)
                this._selectionController = this.parent.getController(str);
        };
        return GList;
    }(fairygui.GComponent));
    fairygui.GList = GList;
    __reflect(GList.prototype, "fairygui.GList");
    var ItemInfo = (function () {
        function ItemInfo() {
            this.width = 0;
            this.height = 0;
            this.updateFlag = 0;
            this.selected = false;
        }
        return ItemInfo;
    }());
    __reflect(ItemInfo.prototype, "ItemInfo");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var UIContainer = (function (_super) {
        __extends(UIContainer, _super);
        function UIContainer() {
            var _this = _super.call(this) || this;
            _this.touchEnabled = true;
            _this.touchChildren = true;
            return _this;
        }
        Object.defineProperty(UIContainer.prototype, "hitArea", {
            get: function () {
                return this._hitArea;
            },
            set: function (value) {
                if (this._hitArea && value) {
                    this._hitArea.x = value.x;
                    this._hitArea.y = value.y;
                    this._hitArea.width = value.width;
                    this._hitArea.height = value.height;
                }
                else
                    this._hitArea = (value ? value.clone() : null);
            },
            enumerable: true,
            configurable: true
        });
        UIContainer.prototype.$hitTest = function (stageX, stageY) {
            var ret = _super.prototype.$hitTest.call(this, stageX, stageY);
            if (ret == this) {
                if (!this.touchEnabled || this._hitArea == null)
                    return null;
            }
            else if (ret == null && this.touchEnabled && this.visible && this._hitArea != null) {
                var m = this.$getInvertedConcatenatedMatrix();
                var localX = m.a * stageX + m.c * stageY + m.tx;
                var localY = m.b * stageX + m.d * stageY + m.ty;
                if (this._hitArea.contains(localX, localY))
                    ret = this;
            }
            return ret;
        };
        return UIContainer;
    }(egret.DisplayObjectContainer));
    fairygui.UIContainer = UIContainer;
    __reflect(UIContainer.prototype, "fairygui.UIContainer");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GLoader = (function (_super) {
        __extends(GLoader, _super);
        function GLoader() {
            var _this = _super.call(this) || this;
            _this._frame = 0;
            _this._color = 0;
            _this._contentSourceWidth = 0;
            _this._contentSourceHeight = 0;
            _this._contentWidth = 0;
            _this._contentHeight = 0;
            _this._playing = true;
            _this._url = "";
            _this._fill = fairygui.LoaderFillType.None;
            _this._align = fairygui.AlignType.Left;
            _this._verticalAlign = fairygui.VertAlignType.Top;
            _this._showErrorSign = true;
            _this._color = 0xFFFFFF;
            _this._gearAnimation = new fairygui.GearAnimation(_this);
            _this._gearColor = new fairygui.GearColor(_this);
            return _this;
        }
        GLoader.prototype.createDisplayObject = function () {
            this._container = new fairygui.UIContainer();
            this._container["$owner"] = this;
            this._container.hitArea = new egret.Rectangle();
            this.setDisplayObject(this._container);
        };
        GLoader.prototype.dispose = function () {
            if (this._contentItem == null && (this._content instanceof egret.Bitmap)) {
                var texture = this._content.texture;
                if (texture != null)
                    this.freeExternal(texture);
            }
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(GLoader.prototype, "url", {
            get: function () {
                return this._url;
            },
            set: function (value) {
                if (this._url == value)
                    return;
                this._url = value;
                this.loadContent();
                this.updateGear(7);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLoader.prototype, "icon", {
            get: function () {
                return this._url;
            },
            set: function (value) {
                this.url = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLoader.prototype, "align", {
            get: function () {
                return this._align;
            },
            set: function (value) {
                if (this._align != value) {
                    this._align = value;
                    this.updateLayout();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLoader.prototype, "verticalAlign", {
            get: function () {
                return this._verticalAlign;
            },
            set: function (value) {
                if (this._verticalAlign != value) {
                    this._verticalAlign = value;
                    this.updateLayout();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLoader.prototype, "fill", {
            get: function () {
                return this._fill;
            },
            set: function (value) {
                if (this._fill != value) {
                    this._fill = value;
                    this.updateLayout();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLoader.prototype, "autoSize", {
            get: function () {
                return this._autoSize;
            },
            set: function (value) {
                if (this._autoSize != value) {
                    this._autoSize = value;
                    this.updateLayout();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLoader.prototype, "playing", {
            get: function () {
                return this._playing;
            },
            set: function (value) {
                if (this._playing != value) {
                    this._playing = value;
                    if (this._content instanceof fairygui.MovieClip)
                        this._content.playing = value;
                    this.updateGear(5);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLoader.prototype, "frame", {
            get: function () {
                return this._frame;
            },
            set: function (value) {
                if (this._frame != value) {
                    this._frame = value;
                    if (this._content instanceof fairygui.MovieClip)
                        this._content.currentFrame = value;
                    this.updateGear(5);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLoader.prototype, "color", {
            get: function () {
                return this._color;
            },
            set: function (value) {
                if (this._color != value) {
                    this._color = value;
                    this.updateGear(4);
                    this.applyColor();
                }
            },
            enumerable: true,
            configurable: true
        });
        GLoader.prototype.applyColor = function () {
            //todo:
        };
        Object.defineProperty(GLoader.prototype, "showErrorSign", {
            get: function () {
                return this._showErrorSign;
            },
            set: function (value) {
                this._showErrorSign = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLoader.prototype, "content", {
            get: function () {
                return this._content;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GLoader.prototype, "texture", {
            get: function () {
                if (this._content instanceof egret.Bitmap)
                    return this._content.texture;
                else
                    return null;
            },
            set: function (value) {
                this.url = null;
                this.switchToMovieMode(false);
                this._content.texture = value;
                if (value != null) {
                    this._contentSourceWidth = value.textureWidth;
                    this._contentSourceHeight = value.textureHeight;
                }
                else {
                    this._contentSourceWidth = this._contentHeight = 0;
                }
                this.updateLayout();
            },
            enumerable: true,
            configurable: true
        });
        GLoader.prototype.loadContent = function () {
            this.clearContent();
            if (!this._url)
                return;
            if (fairygui.ToolSet.startsWith(this._url, "ui://"))
                this.loadFromPackage(this._url);
            else
                this.loadExternal();
        };
        GLoader.prototype.loadFromPackage = function (itemURL) {
            this._contentItem = fairygui.UIPackage.getItemByURL(itemURL);
            if (this._contentItem != null) {
                this._contentItem.load();
                if (this._autoSize)
                    this.setSize(this._contentItem.width, this._contentItem.height);
                if (this._contentItem.type == fairygui.PackageItemType.Image) {
                    if (this._contentItem.texture == null) {
                        this.setErrorState();
                    }
                    else {
                        this.switchToMovieMode(false);
                        var bm = this._content;
                        bm.texture = this._contentItem.texture;
                        bm.scale9Grid = this._contentItem.scale9Grid;
                        if (this._contentItem.scaleByTile)
                            bm.fillMode = egret.BitmapFillMode.REPEAT;
                        else
                            bm.fillMode = egret.BitmapFillMode.SCALE;
                        this._contentSourceWidth = this._contentItem.width;
                        this._contentSourceHeight = this._contentItem.height;
                        this.updateLayout();
                    }
                }
                else if (this._contentItem.type == fairygui.PackageItemType.MovieClip) {
                    this.switchToMovieMode(true);
                    this._contentSourceWidth = this._contentItem.width;
                    this._contentSourceHeight = this._contentItem.height;
                    var mc = this._content;
                    mc.interval = this._contentItem.interval;
                    mc.swing = this._contentItem.swing;
                    mc.repeatDelay = this._contentItem.repeatDelay;
                    mc.frames = this._contentItem.frames;
                    this.updateLayout();
                }
                else
                    this.setErrorState();
            }
            else
                this.setErrorState();
        };
        GLoader.prototype.switchToMovieMode = function (value) {
            if (value) {
                if (!(this._content instanceof fairygui.MovieClip))
                    this._content = new fairygui.MovieClip();
            }
            else {
                if (!(this._content instanceof egret.Bitmap))
                    this._content = new egret.Bitmap();
            }
            this._container.addChild(this._content);
        };
        GLoader.prototype.loadExternal = function () {
            RES.getResAsync(this._url, this.__getResCompleted, this);
        };
        GLoader.prototype.freeExternal = function (texture) {
        };
        GLoader.prototype.onExternalLoadSuccess = function (texture) {
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
        GLoader.prototype.onExternalLoadFailed = function () {
            this.setErrorState();
        };
        GLoader.prototype.__getResCompleted = function (res, key) {
            if (res instanceof egret.Texture)
                this.onExternalLoadSuccess(res);
            else
                this.onExternalLoadFailed();
        };
        GLoader.prototype.setErrorState = function () {
            if (!this._showErrorSign)
                return;
            if (this._errorSign == null) {
                if (fairygui.UIConfig.loaderErrorSign != null) {
                    this._errorSign = GLoader._errorSignPool.getObject(fairygui.UIConfig.loaderErrorSign);
                }
            }
            if (this._errorSign != null) {
                this._errorSign.setSize(this.width, this.height);
                this._container.addChild(this._errorSign.displayObject);
            }
        };
        GLoader.prototype.clearErrorState = function () {
            if (this._errorSign != null) {
                this._container.removeChild(this._errorSign.displayObject);
                GLoader._errorSignPool.returnObject(this._errorSign);
                this._errorSign = null;
            }
        };
        GLoader.prototype.updateLayout = function () {
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
                if (this._contentWidth == this._width && this._contentHeight == this._height)
                    return;
            }
            var sx = 1, sy = 1;
            if (this._fill != fairygui.LoaderFillType.None) {
                sx = this.width / this._contentSourceWidth;
                sy = this.height / this._contentSourceHeight;
                if (sx != 1 || sy != 1) {
                    if (this._fill == fairygui.LoaderFillType.ScaleMatchHeight)
                        sx = sy;
                    else if (this._fill == fairygui.LoaderFillType.ScaleMatchWidth)
                        sy = sx;
                    else if (this._fill == fairygui.LoaderFillType.Scale) {
                        if (sx > sy)
                            sx = sy;
                        else
                            sy = sx;
                    }
                    else if (this._fill == fairygui.LoaderFillType.ScaleNoBorder) {
                        if (sx > sy)
                            sy = sx;
                        else
                            sx = sy;
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
        };
        GLoader.prototype.clearContent = function () {
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
        GLoader.prototype.handleSizeChanged = function () {
            if (!this._updatingLayout)
                this.updateLayout();
            this._container.hitArea.setTo(0, 0, this.width, this.height);
        };
        GLoader.prototype.setup_beforeAdd = function (xml) {
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
                this._fill = fairygui.parseLoaderFillType(str);
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
        GLoader._errorSignPool = new fairygui.GObjectPool();
        return GLoader;
    }(fairygui.GObject));
    fairygui.GLoader = GLoader;
    __reflect(GLoader.prototype, "fairygui.GLoader");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GMovieClip = (function (_super) {
        __extends(GMovieClip, _super);
        function GMovieClip() {
            var _this = _super.call(this) || this;
            _this._sizeImplType = 1;
            return _this;
        }
        Object.defineProperty(GMovieClip.prototype, "color", {
            get: function () {
                return 0;
            },
            set: function (value) {
            },
            enumerable: true,
            configurable: true
        });
        GMovieClip.prototype.createDisplayObject = function () {
            this._movieClip = new fairygui.MovieClip();
            this._movieClip["$owner"] = this;
            this._movieClip.touchEnabled = false;
            this.setDisplayObject(this._movieClip);
        };
        Object.defineProperty(GMovieClip.prototype, "playing", {
            get: function () {
                return this._movieClip.playing;
            },
            set: function (value) {
                if (this._movieClip.playing != value) {
                    this._movieClip.playing = value;
                    this.updateGear(5);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GMovieClip.prototype, "frame", {
            get: function () {
                return this._movieClip.currentFrame;
            },
            set: function (value) {
                if (this._movieClip.currentFrame != value) {
                    this._movieClip.currentFrame = value;
                    this.updateGear(5);
                }
            },
            enumerable: true,
            configurable: true
        });
        //从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
        GMovieClip.prototype.setPlaySettings = function (start, end, times, endAt, endCallback, callbackObj) {
            if (start === void 0) { start = 0; }
            if (end === void 0) { end = -1; }
            if (times === void 0) { times = 0; }
            if (endAt === void 0) { endAt = -1; }
            if (endCallback === void 0) { endCallback = null; }
            if (callbackObj === void 0) { callbackObj = null; }
            this._movieClip.setPlaySettings(start, end, times, endAt, endCallback, callbackObj);
        };
        GMovieClip.prototype.constructFromResource = function () {
            this.sourceWidth = this.packageItem.width;
            this.sourceHeight = this.packageItem.height;
            this.initWidth = this.sourceWidth;
            this.initHeight = this.sourceHeight;
            this.setSize(this.sourceWidth, this.sourceHeight);
            this.packageItem.load();
            this._movieClip.interval = this.packageItem.interval;
            this._movieClip.swing = this.packageItem.swing;
            this._movieClip.repeatDelay = this.packageItem.repeatDelay;
            this._movieClip.frames = this.packageItem.frames;
            this._movieClip.smoothing = this.packageItem.smoothing;
        };
        GMovieClip.prototype.setup_beforeAdd = function (xml) {
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
        return GMovieClip;
    }(fairygui.GObject));
    fairygui.GMovieClip = GMovieClip;
    __reflect(GMovieClip.prototype, "fairygui.GMovieClip");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GProgressBar = (function (_super) {
        __extends(GProgressBar, _super);
        function GProgressBar() {
            var _this = _super.call(this) || this;
            _this._max = 0;
            _this._value = 0;
            _this._barMaxWidth = 0;
            _this._barMaxHeight = 0;
            _this._barMaxWidthDelta = 0;
            _this._barMaxHeightDelta = 0;
            _this._barStartX = 0;
            _this._barStartY = 0;
            _this._tweenValue = 0;
            _this._titleType = fairygui.ProgressTitleType.Percent;
            _this._value = 50;
            _this._max = 100;
            return _this;
        }
        Object.defineProperty(GProgressBar.prototype, "titleType", {
            get: function () {
                return this._titleType;
            },
            set: function (value) {
                if (this._titleType != value) {
                    this._titleType = value;
                    this.update(this._value);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GProgressBar.prototype, "max", {
            get: function () {
                return this._max;
            },
            set: function (value) {
                if (this._max != value) {
                    this._max = value;
                    this.update(this._value);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GProgressBar.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (value) {
                if (this._tweener != null) {
                    this._tweener.setPaused(true);
                    this._tweener = null;
                }
                if (this._value != value) {
                    this._value = value;
                    this.update(this._value);
                }
            },
            enumerable: true,
            configurable: true
        });
        GProgressBar.prototype.tweenValue = function (value, duration) {
            var _this = this;
            if (this._value != value) {
                if (this._tweener)
                    this._tweener.setPaused(true);
                this._tweenValue = this._value;
                this._value = value;
                this._tweener = egret.Tween.get(this, { onChange: this.onUpdateTween, onChangeObj: this })
                    .to({ _tweenValue: value }, duration * 1000, GProgressBar.easeLinear).call(function () { _this._tweener = null; }, this);
                return this._tweener;
            }
            else
                return null;
        };
        GProgressBar.prototype.onUpdateTween = function () {
            this.update(this._tweenValue);
        };
        GProgressBar.prototype.update = function (newValue) {
            var percent = this._max != 0 ? Math.min(newValue / this._max, 1) : 0;
            if (this._titleObject) {
                switch (this._titleType) {
                    case fairygui.ProgressTitleType.Percent:
                        this._titleObject.text = Math.round(percent * 100) + "%";
                        break;
                    case fairygui.ProgressTitleType.ValueAndMax:
                        this._titleObject.text = Math.round(newValue) + "/" + Math.round(this._max);
                        break;
                    case fairygui.ProgressTitleType.Value:
                        this._titleObject.text = "" + Math.round(newValue);
                        break;
                    case fairygui.ProgressTitleType.Max:
                        this._titleObject.text = "" + Math.round(this._max);
                        break;
                }
            }
            var fullWidth = this.width - this._barMaxWidthDelta;
            var fullHeight = this.height - this._barMaxHeightDelta;
            if (!this._reverse) {
                if (this._barObjectH)
                    this._barObjectH.width = Math.round(fullWidth * percent);
                if (this._barObjectV)
                    this._barObjectV.height = Math.round(fullHeight * percent);
            }
            else {
                if (this._barObjectH) {
                    this._barObjectH.width = Math.round(fullWidth * percent);
                    this._barObjectH.x = this._barStartX + (fullWidth - this._barObjectH.width);
                }
                if (this._barObjectV) {
                    this._barObjectV.height = Math.round(fullHeight * percent);
                    this._barObjectV.y = this._barStartY + (fullHeight - this._barObjectV.height);
                }
            }
            if (this._aniObject instanceof fairygui.GMovieClip)
                (this._aniObject).frame = Math.round(percent * 100);
        };
        GProgressBar.prototype.constructFromXML = function (xml) {
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
        GProgressBar.prototype.handleSizeChanged = function () {
            _super.prototype.handleSizeChanged.call(this);
            if (this._barObjectH)
                this._barMaxWidth = this.width - this._barMaxWidthDelta;
            if (this._barObjectV)
                this._barMaxHeight = this.height - this._barMaxHeightDelta;
            if (!this._underConstruct)
                this.update(this._value);
        };
        GProgressBar.prototype.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "ProgressBar");
            if (xml) {
                this._value = parseInt(xml.attributes.value);
                this._max = parseInt(xml.attributes.max);
            }
            this.update(this._value);
        };
        GProgressBar.prototype.dispose = function () {
            if (this._tweener)
                this._tweener.setPaused(true);
            _super.prototype.dispose.call(this);
        };
        GProgressBar.easeLinear = egret.Ease.getPowIn(1);
        return GProgressBar;
    }(fairygui.GComponent));
    fairygui.GProgressBar = GProgressBar;
    __reflect(GProgressBar.prototype, "fairygui.GProgressBar");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var UISprite = (function (_super) {
        __extends(UISprite, _super);
        function UISprite() {
            var _this = _super.call(this) || this;
            _this.touchEnabled = true;
            _this.touchChildren = true;
            return _this;
        }
        Object.defineProperty(UISprite.prototype, "hitArea", {
            get: function () {
                return this._hitArea;
            },
            set: function (value) {
                if (this._hitArea && value) {
                    this._hitArea.x = value.x;
                    this._hitArea.y = value.y;
                    this._hitArea.width = value.width;
                    this._hitArea.height = value.height;
                }
                else
                    this._hitArea = (value ? value.clone() : null);
            },
            enumerable: true,
            configurable: true
        });
        UISprite.prototype.$hitTest = function (stageX, stageY) {
            var ret = _super.prototype.$hitTest.call(this, stageX, stageY);
            if (ret == this) {
                if (!this.touchEnabled || this._hitArea == null)
                    return null;
            }
            else if (ret == null && this.touchEnabled && this._hitArea != null) {
                var m = this.$getInvertedConcatenatedMatrix();
                var localX = m.a * stageX + m.c * stageY + m.tx;
                var localY = m.b * stageX + m.d * stageY + m.ty;
                if (this._hitArea.contains(localX, localY))
                    ret = this;
            }
            return ret;
        };
        return UISprite;
    }(egret.Sprite));
    fairygui.UISprite = UISprite;
    __reflect(UISprite.prototype, "fairygui.UISprite");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GRichTextField = (function (_super) {
        __extends(GRichTextField, _super);
        function GRichTextField() {
            var _this = _super.call(this) || this;
            _this._textField.touchEnabled = true;
            return _this;
        }
        GRichTextField.prototype.updateTextFieldText = function () {
            if (this._ubbEnabled)
                this._textField.textFlow = (new egret.HtmlTextParser).parser(fairygui.ToolSet.parseUBB(this._text));
            else
                this._textField.textFlow = (new egret.HtmlTextParser).parser(this._text);
        };
        return GRichTextField;
    }(fairygui.GTextField));
    fairygui.GRichTextField = GRichTextField;
    __reflect(GRichTextField.prototype, "fairygui.GRichTextField");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GRoot = (function (_super) {
        __extends(GRoot, _super);
        function GRoot() {
            var _this = _super.call(this) || this;
            if (GRoot._inst == null)
                GRoot._inst = _this;
            _this.opaque = false;
            _this._volumeScale = 1;
            _this._popupStack = new Array();
            _this._justClosedPopups = new Array();
            _this.displayObject.addEventListener(egret.Event.ADDED_TO_STAGE, _this.__addedToStage, _this);
            return _this;
        }
        Object.defineProperty(GRoot, "inst", {
            get: function () {
                if (GRoot._inst == null)
                    new GRoot();
                return GRoot._inst;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GRoot.prototype, "nativeStage", {
            get: function () {
                return this._nativeStage;
            },
            enumerable: true,
            configurable: true
        });
        GRoot.prototype.showWindow = function (win) {
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
        GRoot.prototype.hideWindow = function (win) {
            win.hide();
        };
        GRoot.prototype.hideWindowImmediately = function (win) {
            if (win.parent == this)
                this.removeChild(win);
            this.adjustModalLayer();
        };
        GRoot.prototype.bringToFront = function (win) {
            var cnt = this.numChildren;
            var i;
            if (this._modalLayer.parent != null && !win.modal)
                i = this.getChildIndex(this._modalLayer) - 1;
            else
                i = cnt - 1;
            for (; i >= 0; i--) {
                var g = this.getChildAt(i);
                if (g == win)
                    return;
                if (g instanceof fairygui.Window)
                    break;
            }
            if (i >= 0)
                this.setChildIndex(win, i);
        };
        GRoot.prototype.showModalWait = function (msg) {
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
        GRoot.prototype.closeModalWait = function () {
            if (this._modalWaitPane != null && this._modalWaitPane.parent != null)
                this.removeChild(this._modalWaitPane);
        };
        GRoot.prototype.closeAllExceptModals = function () {
            var arr = this._children.slice();
            var cnt = arr.length;
            for (var i = 0; i < cnt; i++) {
                var g = arr[i];
                if ((g instanceof fairygui.Window) && !g.modal)
                    g.hide();
            }
        };
        GRoot.prototype.closeAllWindows = function () {
            var arr = this._children.slice();
            var cnt = arr.length;
            for (var i = 0; i < cnt; i++) {
                var g = arr[i];
                if (g instanceof fairygui.Window)
                    g.hide();
            }
        };
        GRoot.prototype.getTopWindow = function () {
            var cnt = this.numChildren;
            for (var i = cnt - 1; i >= 0; i--) {
                var g = this.getChildAt(i);
                if (g instanceof fairygui.Window) {
                    return g;
                }
            }
            return null;
        };
        Object.defineProperty(GRoot.prototype, "modalLayer", {
            get: function () {
                return this._modalLayer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GRoot.prototype, "hasModalWindow", {
            get: function () {
                return this._modalLayer.parent != null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GRoot.prototype, "modalWaiting", {
            get: function () {
                return this._modalWaitPane && this._modalWaitPane.inContainer;
            },
            enumerable: true,
            configurable: true
        });
        GRoot.prototype.showPopup = function (popup, target, downward) {
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
            if (target != null) {
                var p = target;
                while (p != null) {
                    if (p.parent == this) {
                        if (popup.sortingOrder < p.sortingOrder) {
                            popup.sortingOrder = p.sortingOrder;
                        }
                        break;
                    }
                    p = p.parent;
                }
            }
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
        GRoot.prototype.togglePopup = function (popup, target, downward) {
            if (target === void 0) { target = null; }
            if (downward === void 0) { downward = null; }
            if (this._justClosedPopups.indexOf(popup) != -1)
                return;
            this.showPopup(popup, target, downward);
        };
        GRoot.prototype.hidePopup = function (popup) {
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
        Object.defineProperty(GRoot.prototype, "hasAnyPopup", {
            get: function () {
                return this._popupStack.length != 0;
            },
            enumerable: true,
            configurable: true
        });
        GRoot.prototype.closePopup = function (target) {
            if (target.parent != null) {
                if (target instanceof fairygui.Window)
                    target.hide();
                else
                    this.removeChild(target);
            }
        };
        GRoot.prototype.showTooltips = function (msg) {
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
        GRoot.prototype.showTooltipsWin = function (tooltipWin, position) {
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
        GRoot.prototype.hideTooltips = function () {
            if (this._tooltipWin != null) {
                if (this._tooltipWin.parent)
                    this.removeChild(this._tooltipWin);
                this._tooltipWin = null;
            }
        };
        GRoot.prototype.getObjectUnderPoint = function (globalX, globalY) {
            var ret = this._nativeStage.$hitTest(globalX, globalY);
            if (ret)
                return fairygui.ToolSet.displayObjectToGObject(ret);
            else
                return null;
        };
        Object.defineProperty(GRoot.prototype, "focus", {
            get: function () {
                if (this._focusedObject && !this._focusedObject.onStage)
                    this._focusedObject = null;
                return this._focusedObject;
            },
            set: function (value) {
                if (value && (!value.focusable || !value.onStage))
                    throw "invalid focus target";
                this.setFocus(value);
            },
            enumerable: true,
            configurable: true
        });
        GRoot.prototype.setFocus = function (value) {
            if (this._focusedObject != value) {
                this._focusedObject = value;
                this.dispatchEventWith(GRoot.FOCUS_CHANGED);
            }
        };
        Object.defineProperty(GRoot.prototype, "volumeScale", {
            get: function () {
                return this._volumeScale;
            },
            set: function (value) {
                this._volumeScale = value;
            },
            enumerable: true,
            configurable: true
        });
        GRoot.prototype.playOneShotSound = function (sound, volumeScale) {
            if (volumeScale === void 0) { volumeScale = 1; }
            var vs = this._volumeScale * volumeScale;
            var channel = sound.play(0, 1);
            channel.volume = vs;
        };
        GRoot.prototype.adjustModalLayer = function () {
            var cnt = this.numChildren;
            if (this._modalWaitPane != null && this._modalWaitPane.parent != null)
                this.setChildIndex(this._modalWaitPane, cnt - 1);
            for (var i = cnt - 1; i >= 0; i--) {
                var g = this.getChildAt(i);
                if ((g instanceof fairygui.Window) && g.modal) {
                    if (this._modalLayer.parent == null)
                        this.addChildAt(this._modalLayer, i);
                    else
                        this.setChildIndexBefore(this._modalLayer, i);
                    return;
                }
            }
            if (this._modalLayer.parent != null)
                this.removeChild(this._modalLayer);
        };
        GRoot.prototype.__addedToStage = function (evt) {
            this.displayObject.removeEventListener(egret.Event.ADDED_TO_STAGE, this.__addedToStage, this);
            this._nativeStage = this.displayObject.stage;
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
        GRoot.prototype.__stageMouseDownCapture = function (evt) {
            //GRoot.ctrlKeyDown = evt.ctrlKey;
            //GRoot.shiftKeyDown = evt.shiftKey;
            GRoot.mouseX = evt.stageX;
            GRoot.mouseY = evt.stageY;
            GRoot.touchDown = true;
            var mc = (evt.target);
            while (mc != this.displayObject.stage && mc != null) {
                if (mc["$owner"]) {
                    var gg = mc["$owner"];
                    if (gg.touchable && gg.focusable) {
                        this.setFocus(gg);
                        break;
                    }
                }
                mc = mc.parent;
            }
            if (this._tooltipWin != null)
                this.hideTooltips();
            this._justClosedPopups.length = 0;
            if (this._popupStack.length > 0) {
                mc = (evt.target);
                while (mc != this.displayObject.stage && mc != null) {
                    if (mc["$owner"]) {
                        var pindex = this._popupStack.indexOf(mc["$owner"]);
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
        GRoot.prototype.__stageMouseMoveCapture = function (evt) {
            //GRoot.ctrlKeyDown = evt.ctrlKey;
            //GRoot.shiftKeyDown = evt.shiftKey;
            GRoot.mouseX = evt.stageX;
            GRoot.mouseY = evt.stageY;
        };
        GRoot.prototype.__stageMouseUpCapture = function (evt) {
            GRoot.touchDown = false;
        };
        GRoot.prototype.__winResize = function (evt) {
            this.setSize(this._nativeStage.stageWidth, this._nativeStage.stageHeight);
            //console.info("screen size=" + w + "x" + h + "/" + this.width + "x" + this.height);
        };
        GRoot.contentScaleFactor = 1;
        GRoot.FOCUS_CHANGED = "FocusChanged";
        return GRoot;
    }(fairygui.GComponent));
    fairygui.GRoot = GRoot;
    __reflect(GRoot.prototype, "fairygui.GRoot");
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
        Margin.prototype.parse = function (str) {
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
        Margin.prototype.copy = function (source) {
            this.top = source.top;
            this.bottom = source.bottom;
            this.left = source.left;
            this.right = source.right;
        };
        return Margin;
    }());
    fairygui.Margin = Margin;
    __reflect(Margin.prototype, "fairygui.Margin");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GTimers = (function () {
        function GTimers() {
            this._enumI = 0;
            this._enumCount = 0;
            this._lastTime = 0;
            this._items = new Array();
            this._itemPool = new Array();
            this._lastTime = egret.getTimer();
            GTimers.time = this._lastTime;
            egret.startTick(this.__timer, this);
        }
        GTimers.prototype.getItem = function () {
            if (this._itemPool.length)
                return this._itemPool.pop();
            else
                return new TimerItem();
        };
        GTimers.prototype.findItem = function (callback, thisObj) {
            var len = this._items.length;
            for (var i = 0; i < len; i++) {
                var item = this._items[i];
                if (item.callback == callback && item.thisObj == thisObj)
                    return item;
            }
            return null;
        };
        GTimers.prototype.add = function (delayInMiniseconds, repeat, callback, thisObj, callbackParam) {
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
        GTimers.prototype.callLater = function (callback, thisObj, callbackParam) {
            if (callbackParam === void 0) { callbackParam = null; }
            this.add(1, 1, callback, thisObj, callbackParam);
        };
        GTimers.prototype.callDelay = function (delay, callback, thisObj, callbackParam) {
            if (callbackParam === void 0) { callbackParam = null; }
            this.add(delay, 1, callback, thisObj, callbackParam);
        };
        GTimers.prototype.callBy24Fps = function (callback, thisObj, callbackParam) {
            if (callbackParam === void 0) { callbackParam = null; }
            this.add(GTimers.FPS24, 0, callback, thisObj, callbackParam);
        };
        GTimers.prototype.exists = function (callback, thisObj) {
            var item = this.findItem(callback, thisObj);
            return item != null;
        };
        GTimers.prototype.remove = function (callback, thisObj) {
            var item = this.findItem(callback, thisObj);
            if (item) {
                var i = this._items.indexOf(item);
                this._items.splice(i, 1);
                if (i < this._enumI)
                    this._enumI--;
                this._enumCount--;
                item.reset();
                this._itemPool.push(item);
            }
        };
        GTimers.prototype.__timer = function (timeStamp) {
            GTimers.time = timeStamp;
            GTimers.workCount++;
            GTimers.deltaTime = timeStamp - this._lastTime;
            this._lastTime = timeStamp;
            this._enumI = 0;
            this._enumCount = this._items.length;
            while (this._enumI < this._enumCount) {
                var item = this._items[this._enumI];
                this._enumI++;
                if (item.advance(GTimers.deltaTime)) {
                    if (item.end) {
                        this._enumI--;
                        this._enumCount--;
                        this._items.splice(this._enumI, 1);
                    }
                    if (item.hasParam)
                        item.callback.call(item.thisObj, item.param);
                    else
                        item.callback.call(item.thisObj);
                    if (item.end) {
                        item.reset();
                        this._itemPool.push(item);
                    }
                }
            }
            return false;
        };
        GTimers.deltaTime = 0;
        GTimers.time = 0;
        GTimers.workCount = 0;
        GTimers.inst = new GTimers();
        GTimers.FPS24 = 1000 / 24;
        return GTimers;
    }());
    fairygui.GTimers = GTimers;
    __reflect(GTimers.prototype, "fairygui.GTimers");
    var TimerItem = (function () {
        function TimerItem() {
            this.delay = 0;
            this.counter = 0;
            this.repeat = 0;
        }
        TimerItem.prototype.advance = function (elapsed) {
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
        TimerItem.prototype.reset = function () {
            this.callback = null;
            this.thisObj = null;
            this.param = null;
        };
        return TimerItem;
    }());
    __reflect(TimerItem.prototype, "TimerItem");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GScrollBar = (function (_super) {
        __extends(GScrollBar, _super);
        function GScrollBar() {
            var _this = _super.call(this) || this;
            _this._dragOffset = new egret.Point();
            _this._scrollPerc = 0;
            return _this;
        }
        GScrollBar.prototype.setScrollPane = function (target, vertical) {
            this._target = target;
            this._vertical = vertical;
        };
        Object.defineProperty(GScrollBar.prototype, "displayPerc", {
            set: function (val) {
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
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GScrollBar.prototype, "scrollPerc", {
            set: function (val) {
                this._scrollPerc = val;
                if (this._vertical)
                    this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;
                else
                    this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GScrollBar.prototype, "minSize", {
            get: function () {
                if (this._vertical)
                    return (this._arrowButton1 != null ? this._arrowButton1.height : 0) + (this._arrowButton2 != null ? this._arrowButton2.height : 0);
                else
                    return (this._arrowButton1 != null ? this._arrowButton1.width : 0) + (this._arrowButton2 != null ? this._arrowButton2.width : 0);
            },
            enumerable: true,
            configurable: true
        });
        GScrollBar.prototype.constructFromXML = function (xml) {
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
            if (this._arrowButton1)
                this._arrowButton1.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__arrowButton1Click, this);
            if (this._arrowButton2)
                this._arrowButton2.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__arrowButton2Click, this);
            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__barMouseDown, this);
        };
        GScrollBar.prototype.__gripMouseDown = function (evt) {
            if (!this._bar)
                return;
            evt.stopPropagation();
            this.globalToLocal(evt.stageX, evt.stageY, this._dragOffset);
            this._dragOffset.x -= this._grip.x;
            this._dragOffset.y -= this._grip.y;
            this._grip.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__gripMouseMove, this);
            this._grip.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.__gripMouseUp, this);
        };
        GScrollBar.prototype.__gripMouseMove = function (evt) {
            if (!this.onStage)
                return;
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
        GScrollBar.prototype.__gripMouseUp = function (evt) {
            var st = evt.currentTarget;
            st.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__gripMouseMove, this);
            st.removeEventListener(egret.TouchEvent.TOUCH_END, this.__gripMouseUp, this);
        };
        GScrollBar.prototype.__arrowButton1Click = function (evt) {
            evt.stopPropagation();
            if (this._vertical)
                this._target.scrollUp();
            else
                this._target.scrollLeft();
        };
        GScrollBar.prototype.__arrowButton2Click = function (evt) {
            evt.stopPropagation();
            if (this._vertical)
                this._target.scrollDown();
            else
                this._target.scrollRight();
        };
        GScrollBar.prototype.__barMouseDown = function (evt) {
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
    }(fairygui.GComponent));
    fairygui.GScrollBar = GScrollBar;
    __reflect(GScrollBar.prototype, "fairygui.GScrollBar");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GSlider = (function (_super) {
        __extends(GSlider, _super);
        function GSlider() {
            var _this = _super.call(this) || this;
            _this._max = 0;
            _this._value = 0;
            _this._reverse = false;
            _this._barMaxWidth = 0;
            _this._barMaxHeight = 0;
            _this._barMaxWidthDelta = 0;
            _this._barMaxHeightDelta = 0;
            _this._clickPercent = 0;
            _this._barStartX = 0;
            _this._barStartY = 0;
            _this.changeOnClick = true;
            _this.canDrag = true;
            _this._titleType = fairygui.ProgressTitleType.Percent;
            _this._value = 50;
            _this._max = 100;
            _this._clickPos = new egret.Point();
            return _this;
        }
        Object.defineProperty(GSlider.prototype, "titleType", {
            get: function () {
                return this._titleType;
            },
            set: function (value) {
                this._titleType = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GSlider.prototype, "max", {
            get: function () {
                return this._max;
            },
            set: function (value) {
                if (this._max != value) {
                    this._max = value;
                    this.update();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GSlider.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (value) {
                if (this._value != value) {
                    this._value = value;
                    this.update();
                }
            },
            enumerable: true,
            configurable: true
        });
        GSlider.prototype.update = function () {
            var percent = Math.min(this._value / this._max, 1);
            this.updateWidthPercent(percent);
        };
        GSlider.prototype.updateWidthPercent = function (percent) {
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
            var fullWidth = this.width - this._barMaxWidthDelta;
            var fullHeight = this.height - this._barMaxHeightDelta;
            if (!this._reverse) {
                if (this._barObjectH)
                    this._barObjectH.width = Math.round(fullWidth * percent);
                if (this._barObjectV)
                    this._barObjectV.height = Math.round(fullHeight * percent);
            }
            else {
                if (this._barObjectH) {
                    this._barObjectH.width = Math.round(fullWidth * percent);
                    this._barObjectH.x = this._barStartX + (fullWidth - this._barObjectH.width);
                }
                if (this._barObjectV) {
                    this._barObjectV.height = Math.round(fullHeight * percent);
                    this._barObjectV.y = this._barStartY + (fullHeight - this._barObjectV.height);
                }
            }
        };
        GSlider.prototype.constructFromXML = function (xml) {
            _super.prototype.constructFromXML.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "Slider");
            var str;
            str = xml.attributes.titleType;
            if (str)
                this._titleType = fairygui.parseProgressTitleType(str);
            this._reverse = xml.attributes.reverse == "true";
            this._titleObject = (this.getChild("title"));
            this._barObjectH = this.getChild("bar");
            this._barObjectV = this.getChild("bar_v");
            this._gripObject = this.getChild("grip");
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
            if (this._gripObject) {
                this._gripObject.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__gripMouseDown, this);
            }
            this.displayObject.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.__barMouseDown, this);
        };
        GSlider.prototype.handleSizeChanged = function () {
            _super.prototype.handleSizeChanged.call(this);
            if (this._barObjectH)
                this._barMaxWidth = this.width - this._barMaxWidthDelta;
            if (this._barObjectV)
                this._barMaxHeight = this.height - this._barMaxHeightDelta;
            if (!this._underConstruct)
                this.update();
        };
        GSlider.prototype.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            xml = fairygui.ToolSet.findChildNode(xml, "Slider");
            if (xml) {
                this._value = parseInt(xml.attributes.value);
                this._max = parseInt(xml.attributes.max);
            }
            this.update();
        };
        GSlider.prototype.__gripMouseDown = function (evt) {
            this.canDrag = true;
            evt.stopPropagation();
            this._clickPos = this.globalToLocal(evt.stageX, evt.stageY);
            this._clickPercent = this._value / this._max;
            this._gripObject.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.__gripMouseMove, this);
            this._gripObject.displayObject.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.__gripMouseUp, this);
        };
        GSlider.prototype.__gripMouseMove = function (evt) {
            if (!this.canDrag) {
                return;
            }
            var pt = this.globalToLocal(evt.stageX, evt.stageY, GSlider.sSilderHelperPoint);
            var deltaX = pt.x - this._clickPos.x;
            var deltaY = pt.y - this._clickPos.y;
            if (this._reverse) {
                deltaX = -deltaX;
                deltaY = -deltaY;
            }
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
        GSlider.prototype.__gripMouseUp = function (evt) {
            this._gripObject.displayObject.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__gripMouseMove, this);
            this._gripObject.displayObject.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.__gripMouseUp, this);
        };
        GSlider.prototype.__barMouseDown = function (evt) {
            if (!this.changeOnClick)
                return;
            var pt = this._gripObject.globalToLocal(evt.stageX, evt.stageY, GSlider.sSilderHelperPoint);
            var percent = this._value / this._max;
            var delta;
            if (this._barObjectH)
                delta = (pt.x - this._gripObject.width / 2) / this._barMaxWidth;
            if (this._barObjectV)
                delta = (pt.y - this._gripObject.height / 2) / this._barMaxHeight;
            if (this._reverse)
                percent -= delta;
            else
                percent += delta;
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
        GSlider.sSilderHelperPoint = new egret.Point();
        return GSlider;
    }(fairygui.GComponent));
    fairygui.GSlider = GSlider;
    __reflect(GSlider.prototype, "fairygui.GSlider");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var GTextInput = (function (_super) {
        __extends(GTextInput, _super);
        function GTextInput() {
            var _this = _super.call(this) || this;
            _this._widthAutoSize = false;
            _this._heightAutoSize = false;
            _this.displayObject.touchChildren = true;
            _this._textField.type = egret.TextFieldType.INPUT;
            _this._textField.addEventListener(egret.Event.CHANGE, _this.__textChanged, _this);
            _this._textField.addEventListener(egret.FocusEvent.FOCUS_IN, _this.__focusIn, _this);
            _this._textField.addEventListener(egret.FocusEvent.FOCUS_OUT, _this.__focusOut, _this);
            return _this;
        }
        GTextInput.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(GTextInput.prototype, "editable", {
            get: function () {
                return this._textField.type == egret.TextFieldType.INPUT;
            },
            set: function (val) {
                if (val)
                    this._textField.type == egret.TextFieldType.INPUT;
                else
                    this._textField.type == egret.TextFieldType.DYNAMIC;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextInput.prototype, "maxLength", {
            get: function () {
                return this._textField.maxChars;
            },
            set: function (val) {
                this._textField.maxChars = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextInput.prototype, "promptText", {
            get: function () {
                return this._promptText;
            },
            set: function (val) {
                this._promptText = val;
                this.updateTextFieldText();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextInput.prototype, "restrict", {
            get: function () {
                return this._textField.restrict;
            },
            set: function (value) {
                this._textField.restrict = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextInput.prototype, "password", {
            get: function () {
                return this._password;
            },
            set: function (val) {
                if (this._password != val) {
                    this._password = val;
                    this._textField.displayAsPassword = this._password;
                    if (val)
                        this._textField.inputType = egret.TextFieldInputType.PASSWORD;
                    else
                        this._textField.inputType = egret.TextFieldInputType.TEXT;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTextInput.prototype, "verticalAlign", {
            get: function () {
                return this._verticalAlign;
            },
            set: function (value) {
                if (this._verticalAlign != value) {
                    this._verticalAlign = value;
                    this.updateVertAlign();
                }
            },
            enumerable: true,
            configurable: true
        });
        GTextInput.prototype.updateVertAlign = function () {
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
        GTextInput.prototype.updateTextFieldText = function () {
            if (!this._text && this._promptText) {
                this._textField.displayAsPassword = false;
                this._textField.textFlow = (new egret.HtmlTextParser).parser(fairygui.ToolSet.parseUBB(this._promptText));
            }
            else {
                this._textField.displayAsPassword = this._password;
                if (this._ubbEnabled)
                    this._textField.textFlow = (new egret.HtmlTextParser).parser(fairygui.ToolSet.parseUBB(fairygui.ToolSet.encodeHTML(this._text)));
                else
                    this._textField.text = this._text;
            }
        };
        GTextInput.prototype.handleSizeChanged = function () {
            if (!this._updatingSize) {
                this._textField.width = Math.ceil(this.width);
                this._textField.height = Math.ceil(this.height);
            }
        };
        GTextInput.prototype.setup_beforeAdd = function (xml) {
            _super.prototype.setup_beforeAdd.call(this, xml);
            this._promptText = xml.attributes.prompt;
            var str = xml.attributes.maxLength;
            if (str != null)
                this._textField.maxChars = parseInt(str);
            str = xml.attributes.restrict;
            if (str != null)
                this._textField.restrict = str;
            str = xml.attributes.password;
            if (str == "true")
                this.password = true;
            this.updateVertAlign();
        };
        GTextInput.prototype.setup_afterAdd = function (xml) {
            _super.prototype.setup_afterAdd.call(this, xml);
            if (!this._text && this._promptText) {
                this._textField.displayAsPassword = false;
                this._textField.textFlow = (new egret.HtmlTextParser).parser(fairygui.ToolSet.parseUBB(fairygui.ToolSet.encodeHTML(this._promptText)));
            }
        };
        GTextInput.prototype.__textChanged = function (evt) {
            this._text = this._textField.text;
        };
        GTextInput.prototype.__focusIn = function (evt) {
            if (!this._text && this._promptText) {
                this._textField.displayAsPassword = this._password;
                this._textField.text = "";
            }
        };
        GTextInput.prototype.__focusOut = function (evt) {
            this._text = this._textField.text;
            if (!this._text && this._promptText) {
                this._textField.displayAsPassword = false;
                this._textField.textFlow = (new egret.HtmlTextParser).parser(fairygui.ToolSet.parseUBB(fairygui.ToolSet.encodeHTML(this._promptText)));
            }
        };
        return GTextInput;
    }(fairygui.GTextField));
    fairygui.GTextInput = GTextInput;
    __reflect(GTextInput.prototype, "fairygui.GTextInput");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var PageOption = (function () {
        function PageOption() {
        }
        Object.defineProperty(PageOption.prototype, "controller", {
            set: function (val) {
                this._controller = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PageOption.prototype, "index", {
            get: function () {
                if (this._id)
                    return this._controller.getPageIndexById(this._id);
                else
                    return -1;
            },
            set: function (pageIndex) {
                this._id = this._controller.getPageId(pageIndex);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PageOption.prototype, "name", {
            get: function () {
                if (this._id)
                    return this._controller.getPageNameById(this._id);
                else
                    return null;
            },
            set: function (pageName) {
                this._id = this._controller.getPageIdByName(pageName);
            },
            enumerable: true,
            configurable: true
        });
        PageOption.prototype.clear = function () {
            this._id = null;
        };
        Object.defineProperty(PageOption.prototype, "id", {
            get: function () {
                return this._id;
            },
            set: function (id) {
                this._id = id;
            },
            enumerable: true,
            configurable: true
        });
        return PageOption;
    }());
    fairygui.PageOption = PageOption;
    __reflect(PageOption.prototype, "fairygui.PageOption");
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
        PopupMenu.prototype.dispose = function () {
            this._contentPane.dispose();
        };
        PopupMenu.prototype.addItem = function (caption, callback) {
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
        PopupMenu.prototype.addItemAt = function (caption, index, callback) {
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
        PopupMenu.prototype.addSeperator = function () {
            if (fairygui.UIConfig.popupMenu_seperator == null)
                throw "UIConfig.popupMenu_seperator not defined";
            this.list.addItemFromPool(fairygui.UIConfig.popupMenu_seperator);
        };
        PopupMenu.prototype.getItemName = function (index) {
            var item = this._list.getChildAt(index);
            return item.name;
        };
        PopupMenu.prototype.setItemText = function (name, caption) {
            var item = this._list.getChild(name).asButton;
            item.title = caption;
        };
        PopupMenu.prototype.setItemVisible = function (name, visible) {
            var item = this._list.getChild(name).asButton;
            if (item.visible != visible) {
                item.visible = visible;
                this._list.setBoundsChangedFlag();
            }
        };
        PopupMenu.prototype.setItemGrayed = function (name, grayed) {
            var item = this._list.getChild(name).asButton;
            item.grayed = grayed;
        };
        PopupMenu.prototype.setItemCheckable = function (name, checkable) {
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
        PopupMenu.prototype.setItemChecked = function (name, checked) {
            var item = this._list.getChild(name).asButton;
            var c = item.getController("checked");
            if (c != null)
                c.selectedIndex = checked ? 2 : 1;
        };
        PopupMenu.prototype.isItemChecked = function (name) {
            var item = this._list.getChild(name).asButton;
            var c = item.getController("checked");
            if (c != null)
                return c.selectedIndex == 2;
            else
                return false;
        };
        PopupMenu.prototype.removeItem = function (name) {
            var item = this._list.getChild(name);
            if (item != null) {
                var index = this._list.getChildIndex(item);
                this._list.removeChildToPoolAt(index);
                return true;
            }
            else
                return false;
        };
        PopupMenu.prototype.clearItems = function () {
            this._list.removeChildrenToPool();
        };
        Object.defineProperty(PopupMenu.prototype, "itemCount", {
            get: function () {
                return this._list.numChildren;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PopupMenu.prototype, "contentPane", {
            get: function () {
                return this._contentPane;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PopupMenu.prototype, "list", {
            get: function () {
                return this._list;
            },
            enumerable: true,
            configurable: true
        });
        PopupMenu.prototype.show = function (target, downward) {
            if (target === void 0) { target = null; }
            if (downward === void 0) { downward = null; }
            var r = target != null ? target.root : fairygui.GRoot.inst;
            r.showPopup(this.contentPane, (target instanceof fairygui.GRoot) ? null : target, downward);
        };
        PopupMenu.prototype.__clickItem = function (evt) {
            fairygui.GTimers.inst.add(100, 1, this.__clickItem2, this, evt);
        };
        PopupMenu.prototype.__clickItem2 = function (evt) {
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
        PopupMenu.prototype.__addedToStage = function (evt) {
            this._list.selectedIndex = -1;
            this._list.resizeToFit(100000, 10);
        };
        return PopupMenu;
    }());
    fairygui.PopupMenu = PopupMenu;
    __reflect(PopupMenu.prototype, "fairygui.PopupMenu");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var RelationItem = (function () {
        function RelationItem(owner) {
            this._owner = owner;
            this._defs = new Array();
        }
        Object.defineProperty(RelationItem.prototype, "owner", {
            get: function () {
                return this._owner;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RelationItem.prototype, "target", {
            get: function () {
                return this._target;
            },
            set: function (value) {
                if (this._target != value) {
                    if (this._target)
                        this.releaseRefTarget(this._target);
                    this._target = value;
                    if (this._target)
                        this.addRefTarget(this._target);
                }
            },
            enumerable: true,
            configurable: true
        });
        RelationItem.prototype.add = function (relationType, usePercent) {
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
            this.internalAdd(relationType, usePercent);
        };
        RelationItem.prototype.internalAdd = function (relationType, usePercent) {
            if (relationType == fairygui.RelationType.Size) {
                this.internalAdd(fairygui.RelationType.Width, usePercent);
                this.internalAdd(fairygui.RelationType.Height, usePercent);
                return;
            }
            var info = new RelationDef();
            info.percent = usePercent;
            info.type = relationType;
            info.axis = (relationType <= fairygui.RelationType.Right_Right || relationType == fairygui.RelationType.Width || relationType >= fairygui.RelationType.LeftExt_Left && relationType <= fairygui.RelationType.RightExt_Right) ? 0 : 1;
            this._defs.push(info);
            //当使用中线关联时，因为需要除以2，很容易因为奇数宽度/高度造成小数点坐标；当使用百分比时，也会造成小数坐标；
            //所以设置了这类关联的对象，自动启用pixelSnapping
            if (usePercent || relationType == fairygui.RelationType.Left_Center || relationType == fairygui.RelationType.Center_Center || relationType == fairygui.RelationType.Right_Center
                || relationType == fairygui.RelationType.Top_Middle || relationType == fairygui.RelationType.Middle_Middle || relationType == fairygui.RelationType.Bottom_Middle)
                this._owner.pixelSnapping = true;
        };
        RelationItem.prototype.remove = function (relationType) {
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
        RelationItem.prototype.copyFrom = function (source) {
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
        RelationItem.prototype.dispose = function () {
            if (this._target != null) {
                this.releaseRefTarget(this._target);
                this._target = null;
            }
        };
        Object.defineProperty(RelationItem.prototype, "isEmpty", {
            get: function () {
                return this._defs.length == 0;
            },
            enumerable: true,
            configurable: true
        });
        RelationItem.prototype.applyOnSelfResized = function (dWidth, dHeight, applyPivot) {
            var ox = this._owner.x;
            var oy = this._owner.y;
            var length = this._defs.length;
            for (var i = 0; i < length; i++) {
                var info = this._defs[i];
                switch (info.type) {
                    case fairygui.RelationType.Center_Center:
                        this._owner.x -= (0.5 - (applyPivot ? this._owner.pivotX : 0)) * dWidth;
                        break;
                    case fairygui.RelationType.Right_Center:
                    case fairygui.RelationType.Right_Left:
                    case fairygui.RelationType.Right_Right:
                        this._owner.x -= (1 - (applyPivot ? this._owner.pivotX : 0)) * dWidth;
                        break;
                    case fairygui.RelationType.Middle_Middle:
                        this._owner.y -= (0.5 - (applyPivot ? this._owner.pivotY : 0)) * dHeight;
                        break;
                    case fairygui.RelationType.Bottom_Middle:
                    case fairygui.RelationType.Bottom_Top:
                    case fairygui.RelationType.Bottom_Bottom:
                        this._owner.y -= (1 - (applyPivot ? this._owner.pivotY : 0)) * dHeight;
                        break;
                }
            }
            if (ox != this._owner.x || oy != this._owner.y) {
                ox = this._owner.x - ox;
                oy = this._owner.y - oy;
                this._owner.updateGearFromRelations(1, ox, oy);
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
        RelationItem.prototype.applyOnXYChanged = function (info, dx, dy) {
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
                    tmp = this._owner.xMin;
                    this._owner.width = this._owner._rawWidth - dx;
                    this._owner.xMin = tmp + dx;
                    break;
                case fairygui.RelationType.RightExt_Left:
                case fairygui.RelationType.RightExt_Right:
                    tmp = this._owner.xMin;
                    this._owner.width = this._owner._rawWidth + dx;
                    this._owner.xMin = tmp;
                    break;
                case fairygui.RelationType.TopExt_Top:
                case fairygui.RelationType.TopExt_Bottom:
                    tmp = this._owner.yMin;
                    this._owner.height = this._owner._rawHeight - dy;
                    this._owner.yMin = tmp + dy;
                    break;
                case fairygui.RelationType.BottomExt_Top:
                case fairygui.RelationType.BottomExt_Bottom:
                    tmp = this._owner.yMin;
                    this._owner.height = this._owner._rawHeight + dy;
                    this._owner.yMin = tmp;
                    break;
            }
        };
        RelationItem.prototype.applyOnSizeChanged = function (info) {
            var pos = 0, pivot = 0, delta = 0;
            var v, tmp;
            if (info.axis == 0) {
                if (this._target != this._owner.parent) {
                    pos = this._target.x;
                    if (this._target.pivotAsAnchor)
                        pivot = this._target.pivotX;
                }
                if (info.percent) {
                    if (this._targetWidth != 0)
                        delta = this._target._width / this._targetWidth;
                }
                else
                    delta = this._target._width - this._targetWidth;
            }
            else {
                if (this._target != this._owner.parent) {
                    pos = this._target.y;
                    if (this._target.pivotAsAnchor)
                        pivot = this._target.pivotY;
                }
                if (info.percent) {
                    if (this._targetHeight != 0)
                        delta = this._target._height / this._targetHeight;
                }
                else
                    delta = this._target._height - this._targetHeight;
            }
            switch (info.type) {
                case fairygui.RelationType.Left_Left:
                    if (info.percent)
                        this._owner.xMin = pos + (this._owner.xMin - pos) * delta;
                    else if (pivot != 0)
                        this._owner.x += delta * (-pivot);
                    break;
                case fairygui.RelationType.Left_Center:
                    if (info.percent)
                        this._owner.xMin = pos + (this._owner.xMin - pos) * delta;
                    else
                        this._owner.x += delta * (0.5 - pivot);
                    break;
                case fairygui.RelationType.Left_Right:
                    if (info.percent)
                        this._owner.xMin = pos + (this._owner.xMin - pos) * delta;
                    else
                        this._owner.x += delta * (1 - pivot);
                    break;
                case fairygui.RelationType.Center_Center:
                    if (info.percent)
                        this._owner.xMin = pos + (this._owner.xMin + this._owner._rawWidth * 0.5 - pos) * delta - this._owner._rawWidth * 0.5;
                    else
                        this._owner.x += delta * (0.5 - pivot);
                    break;
                case fairygui.RelationType.Right_Left:
                    if (info.percent)
                        this._owner.xMin = pos + (this._owner.xMin + this._owner._rawWidth - pos) * delta - this._owner._rawWidth;
                    else if (pivot != 0)
                        this._owner.x += delta * (-pivot);
                    break;
                case fairygui.RelationType.Right_Center:
                    if (info.percent)
                        this._owner.xMin = pos + (this._owner.xMin + this._owner._rawWidth - pos) * delta - this._owner._rawWidth;
                    else
                        this._owner.x += delta * (0.5 - pivot);
                    break;
                case fairygui.RelationType.Right_Right:
                    if (info.percent)
                        this._owner.xMin = pos + (this._owner.xMin + this._owner._rawWidth - pos) * delta - this._owner._rawWidth;
                    else
                        this._owner.x += delta * (1 - pivot);
                    break;
                case fairygui.RelationType.Top_Top:
                    if (info.percent)
                        this._owner.yMin = pos + (this._owner.yMin - pos) * delta;
                    else if (pivot != 0)
                        this._owner.y += delta * (-pivot);
                    break;
                case fairygui.RelationType.Top_Middle:
                    if (info.percent)
                        this._owner.yMin = pos + (this._owner.yMin - pos) * delta;
                    else
                        this._owner.y += delta * (0.5 - pivot);
                    break;
                case fairygui.RelationType.Top_Bottom:
                    if (info.percent)
                        this._owner.yMin = pos + (this._owner.yMin - pos) * delta;
                    else
                        this._owner.y += delta * (1 - pivot);
                    break;
                case fairygui.RelationType.Middle_Middle:
                    if (info.percent)
                        this._owner.yMin = pos + (this._owner.yMin + this._owner._rawHeight * 0.5 - pos) * delta - this._owner._rawHeight * 0.5;
                    else
                        this._owner.y += delta * (0.5 - pivot);
                    break;
                case fairygui.RelationType.Bottom_Top:
                    if (info.percent)
                        this._owner.yMin = pos + (this._owner.yMin + this._owner._rawHeight - pos) * delta - this._owner._rawHeight;
                    else if (pivot != 0)
                        this._owner.y += delta * (-pivot);
                    break;
                case fairygui.RelationType.Bottom_Middle:
                    if (info.percent)
                        this._owner.yMin = pos + (this._owner.yMin + this._owner._rawHeight - pos) * delta - this._owner._rawHeight;
                    else
                        this._owner.y += delta * (0.5 - pivot);
                    break;
                case fairygui.RelationType.Bottom_Bottom:
                    if (info.percent)
                        this._owner.yMin = pos + (this._owner.yMin + this._owner._rawHeight - pos) * delta - this._owner._rawHeight;
                    else
                        this._owner.y += delta * (1 - pivot);
                    break;
                case fairygui.RelationType.Width:
                    if (this._owner._underConstruct && this._owner == this._target.parent)
                        v = this._owner.sourceWidth - this._target.initWidth;
                    else
                        v = this._owner._rawWidth - this._targetWidth;
                    if (info.percent)
                        v = v * delta;
                    if (this._target == this._owner.parent) {
                        if (this._owner.pivotAsAnchor) {
                            tmp = this._owner.xMin;
                            this._owner.setSize(this._target._width + v, this._owner._rawHeight, true);
                            this._owner.xMin = tmp;
                        }
                        else
                            this._owner.setSize(this._target._width + v, this._owner._rawHeight, true);
                    }
                    else
                        this._owner.width = this._target._width + v;
                    break;
                case fairygui.RelationType.Height:
                    if (this._owner._underConstruct && this._owner == this._target.parent)
                        v = this._owner.sourceHeight - this._target.initHeight;
                    else
                        v = this._owner._rawHeight - this._targetHeight;
                    if (info.percent)
                        v = v * delta;
                    if (this._target == this._owner.parent) {
                        if (this._owner.pivotAsAnchor) {
                            tmp = this._owner.yMin;
                            this._owner.setSize(this._owner._rawWidth, this._target._height + v, true);
                            this._owner.yMin = tmp;
                        }
                        else
                            this._owner.setSize(this._owner._rawWidth, this._target._height + v, true);
                    }
                    else
                        this._owner.height = this._target._height + v;
                    break;
                case fairygui.RelationType.LeftExt_Left:
                    tmp = this._owner.xMin;
                    if (info.percent)
                        v = pos + (tmp - pos) * delta - tmp;
                    else
                        v = delta * (-pivot);
                    this._owner.width = this._owner._rawWidth - v;
                    this._owner.xMin = tmp + v;
                    break;
                case fairygui.RelationType.LeftExt_Right:
                    tmp = this._owner.xMin;
                    if (info.percent)
                        v = pos + (tmp - pos) * delta - tmp;
                    else
                        v = delta * (1 - pivot);
                    this._owner.width = this._owner._rawWidth - v;
                    this._owner.xMin = tmp + v;
                    break;
                case fairygui.RelationType.RightExt_Left:
                    tmp = this._owner.xMin;
                    if (info.percent)
                        v = pos + (tmp + this._owner._rawWidth - pos) * delta - (tmp + this._owner._rawWidth);
                    else
                        v = delta * (-pivot);
                    this._owner.width = this._owner._rawWidth + v;
                    this._owner.xMin = tmp;
                    break;
                case fairygui.RelationType.RightExt_Right:
                    tmp = this._owner.xMin;
                    if (info.percent) {
                        if (this._owner == this._target.parent) {
                            if (this._owner._underConstruct)
                                this._owner.width = pos + this._target._width - this._target._width * pivot +
                                    (this._owner.sourceWidth - pos - this._target.initWidth + this._target.initWidth * pivot) * delta;
                            else
                                this._owner.width = pos + (this._owner._rawWidth - pos) * delta;
                        }
                        else {
                            v = pos + (tmp + this._owner._rawWidth - pos) * delta - (tmp + this._owner._rawWidth);
                            this._owner.width = this._owner._rawWidth + v;
                            this._owner.xMin = tmp;
                        }
                    }
                    else {
                        if (this._owner == this._target.parent) {
                            if (this._owner._underConstruct)
                                this._owner.width = this._owner.sourceWidth + (this._target._width - this._target.initWidth) * (1 - pivot);
                            else
                                this._owner.width = this._owner._rawWidth + delta * (1 - pivot);
                        }
                        else {
                            v = delta * (1 - pivot);
                            this._owner.width = this._owner._rawWidth + v;
                            this._owner.xMin = tmp;
                        }
                    }
                    break;
                case fairygui.RelationType.TopExt_Top:
                    tmp = this._owner.yMin;
                    if (info.percent)
                        v = pos + (tmp - pos) * delta - tmp;
                    else
                        v = delta * (-pivot);
                    this._owner.height = this._owner._rawHeight - v;
                    this._owner.yMin = tmp + v;
                    break;
                case fairygui.RelationType.TopExt_Bottom:
                    tmp = this._owner.yMin;
                    if (info.percent)
                        v = pos + (tmp - pos) * delta - tmp;
                    else
                        v = delta * (1 - pivot);
                    this._owner.height = this._owner._rawHeight - v;
                    this._owner.yMin = tmp + v;
                    break;
                case fairygui.RelationType.BottomExt_Top:
                    tmp = this._owner.yMin;
                    if (info.percent)
                        v = pos + (tmp + this._owner._rawHeight - pos) * delta - (tmp + this._owner._rawHeight);
                    else
                        v = delta * (-pivot);
                    this._owner.height = this._owner._rawHeight + v;
                    this._owner.yMin = tmp;
                    break;
                case fairygui.RelationType.BottomExt_Bottom:
                    tmp = this._owner.yMin;
                    if (info.percent) {
                        if (this._owner == this._target.parent) {
                            if (this._owner._underConstruct)
                                this._owner.height = pos + this._target._height - this._target._height * pivot +
                                    (this._owner.sourceHeight - pos - this._target.initHeight + this._target.initHeight * pivot) * delta;
                            else
                                this._owner.height = pos + (this._owner._rawHeight - pos) * delta;
                        }
                        else {
                            v = pos + (tmp + this._owner._rawHeight - pos) * delta - (tmp + this._owner._rawHeight);
                            this._owner.height = this._owner._rawHeight + v;
                            this._owner.yMin = tmp;
                        }
                    }
                    else {
                        if (this._owner == this._target.parent) {
                            if (this._owner._underConstruct)
                                this._owner.height = this._owner.sourceHeight + (this._target._height - this._target.initHeight) * (1 - pivot);
                            else
                                this._owner.height = this._owner._rawHeight + delta * (1 - pivot);
                        }
                        else {
                            v = delta * (1 - pivot);
                            this._owner.height = this._owner._rawHeight + v;
                            this._owner.yMin = tmp;
                        }
                    }
                    break;
            }
        };
        RelationItem.prototype.addRefTarget = function (target) {
            if (target != this._owner.parent)
                target.addEventListener(fairygui.GObject.XY_CHANGED, this.__targetXYChanged, this);
            target.addEventListener(fairygui.GObject.SIZE_CHANGED, this.__targetSizeChanged, this);
            target.addEventListener(fairygui.GObject.SIZE_DELAY_CHANGE, this.__targetSizeWillChange, this);
            this._targetX = this._target.x;
            this._targetY = this._target.y;
            this._targetWidth = this._target._width;
            this._targetHeight = this._target._height;
        };
        RelationItem.prototype.releaseRefTarget = function (target) {
            target.removeEventListener(fairygui.GObject.XY_CHANGED, this.__targetXYChanged, this);
            target.removeEventListener(fairygui.GObject.SIZE_CHANGED, this.__targetSizeChanged, this);
            target.removeEventListener(fairygui.GObject.SIZE_DELAY_CHANGE, this.__targetSizeWillChange, this);
        };
        RelationItem.prototype.__targetXYChanged = function (evt) {
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
                this._owner.updateGearFromRelations(1, ox, oy);
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
        RelationItem.prototype.__targetSizeChanged = function (evt) {
            if (this._owner.relations.handling != null)
                return;
            this._owner.relations.handling = this._target;
            var ox = this._owner.x;
            var oy = this._owner.y;
            var ow = this._owner._rawWidth;
            var oh = this._owner._rawHeight;
            var length = this._defs.length;
            for (var i = 0; i < length; i++) {
                var info = this._defs[i];
                this.applyOnSizeChanged(info);
            }
            this._targetWidth = this._target._width;
            this._targetHeight = this._target._height;
            if (ox != this._owner.x || oy != this._owner.y) {
                ox = this._owner.x - ox;
                oy = this._owner.y - oy;
                this._owner.updateGearFromRelations(1, ox, oy);
                if (this._owner.parent != null) {
                    var len = this._owner.parent._transitions.length;
                    if (len > 0) {
                        for (var i = 0; i < len; ++i) {
                            this._owner.parent._transitions[i].updateFromRelations(this._owner.id, ox, oy);
                        }
                    }
                }
            }
            if (ow != this._owner._rawWidth || oh != this._owner._rawHeight) {
                ow = this._owner._rawWidth - ow;
                oh = this._owner._rawHeight - oh;
                this._owner.updateGearFromRelations(2, ow, oh);
            }
            this._owner.relations.handling = null;
        };
        RelationItem.prototype.__targetSizeWillChange = function (evt) {
            this._owner.relations.sizeDirty = true;
        };
        return RelationItem;
    }());
    fairygui.RelationItem = RelationItem;
    __reflect(RelationItem.prototype, "fairygui.RelationItem");
    var RelationDef = (function () {
        function RelationDef() {
        }
        RelationDef.prototype.copyFrom = function (source) {
            this.percent = source.percent;
            this.type = source.type;
            this.axis = source.axis;
        };
        return RelationDef;
    }());
    fairygui.RelationDef = RelationDef;
    __reflect(RelationDef.prototype, "fairygui.RelationDef");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var Relations = (function () {
        function Relations(owner) {
            this._owner = owner;
            this._items = new Array();
        }
        Relations.prototype.add = function (target, relationType, usePercent) {
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
        Relations.prototype.addItems = function (target, sidePairs) {
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
        Relations.prototype.remove = function (target, relationType) {
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
        Relations.prototype.contains = function (target) {
            var length = this._items.length;
            for (var i = 0; i < length; i++) {
                var item = this._items[i];
                if (item.target == target)
                    return true;
            }
            return false;
        };
        Relations.prototype.clearFor = function (target) {
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
        Relations.prototype.clearAll = function () {
            var length = this._items.length;
            for (var i = 0; i < length; i++) {
                var item = this._items[i];
                item.dispose();
            }
            this._items.length = 0;
        };
        Relations.prototype.copyFrom = function (source) {
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
        Relations.prototype.dispose = function () {
            this.clearAll();
        };
        Relations.prototype.onOwnerSizeChanged = function (dWidth, dHeight, applyPivot) {
            if (this._items.length == 0)
                return;
            var length = this._items.length;
            for (var i = 0; i < length; i++) {
                var item = this._items[i];
                item.applyOnSelfResized(dWidth, dHeight, applyPivot);
            }
        };
        Relations.prototype.ensureRelationsSizeCorrect = function () {
            if (this._items.length == 0)
                return;
            this.sizeDirty = false;
            var length = this._items.length;
            for (var i = 0; i < length; i++) {
                var item = this._items[i];
                item.target.ensureSizeCorrect();
            }
        };
        Object.defineProperty(Relations.prototype, "empty", {
            get: function () {
                return this._items.length == 0;
            },
            enumerable: true,
            configurable: true
        });
        Relations.prototype.setup = function (xml) {
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
    }());
    fairygui.Relations = Relations;
    __reflect(Relations.prototype, "fairygui.Relations");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var ScrollPane = (function (_super) {
        __extends(ScrollPane, _super);
        function ScrollPane(owner, scrollType, scrollBarMargin, scrollBarDisplay, flags, vtScrollBarRes, hzScrollBarRes, headerRes, footerRes) {
            var _this = _super.call(this) || this;
            _this._owner = owner;
            _this._maskContainer = new egret.DisplayObjectContainer();
            _this._owner._rootContainer.addChild(_this._maskContainer);
            _this._container = _this._owner._container;
            _this._container.x = 0;
            _this._container.y = 0;
            _this._maskContainer.addChild(_this._container);
            _this._scrollBarMargin = scrollBarMargin;
            _this._scrollType = scrollType;
            _this._scrollStep = fairygui.UIConfig.defaultScrollStep;
            _this._mouseWheelStep = _this._scrollStep * 2;
            _this._decelerationRate = fairygui.UIConfig.defaultScrollDecelerationRate;
            _this._displayOnLeft = (flags & 1) != 0;
            _this._snapToItem = (flags & 2) != 0;
            _this._displayInDemand = (flags & 4) != 0;
            _this._pageMode = (flags & 8) != 0;
            if (flags & 16)
                _this._touchEffect = true;
            else if (flags & 32)
                _this._touchEffect = false;
            else
                _this._touchEffect = fairygui.UIConfig.defaultScrollTouchEffect;
            if (flags & 64)
                _this._bouncebackEffect = true;
            else if (flags & 128)
                _this._bouncebackEffect = false;
            else
                _this._bouncebackEffect = fairygui.UIConfig.defaultScrollBounceEffect;
            _this._inertiaDisabled = (flags & 256) != 0;
            if ((flags & 512) == 0)
                _this._maskContainer.scrollRect = new egret.Rectangle();
            _this._scrollBarVisible = true;
            _this._mouseWheelEnabled = true;
            _this._xPos = 0;
            _this._yPos = 0;
            _this._aniFlag = 0;
            _this._footerLockedSize = 0;
            _this._headerLockedSize = 0;
            if (scrollBarDisplay == fairygui.ScrollBarDisplayType.Default)
                scrollBarDisplay = fairygui.UIConfig.defaultScrollBarDisplay;
            _this._viewSize = new egret.Point();
            _this._contentSize = new egret.Point();
            _this._pageSize = new egret.Point(1, 1);
            _this._overlapSize = new egret.Point();
            _this._tweenTime = new egret.Point();
            _this._tweenStart = new egret.Point();
            _this._tweenDuration = new egret.Point();
            _this._tweenChange = new egret.Point();
            _this._velocity = new egret.Point();
            _this._containerPos = new egret.Point();
            _this._beginTouchPos = new egret.Point();
            _this._lastTouchPos = new egret.Point();
            _this._lastTouchGlobalPos = new egret.Point();
            if (scrollBarDisplay == fairygui.ScrollBarDisplayType.Default)
                scrollBarDisplay = fairygui.UIConfig.defaultScrollBarDisplay;
            if (scrollBarDisplay != fairygui.ScrollBarDisplayType.Hidden) {
                if (_this._scrollType == fairygui.ScrollType.Both || _this._scrollType == fairygui.ScrollType.Vertical) {
                    var res = vtScrollBarRes ? vtScrollBarRes : fairygui.UIConfig.verticalScrollBar;
                    if (res) {
                        _this._vtScrollBar = (fairygui.UIPackage.createObjectFromURL(res));
                        if (!_this._vtScrollBar)
                            throw "cannot create scrollbar from " + res;
                        _this._vtScrollBar.setScrollPane(_this, true);
                        _this._owner._rootContainer.addChild(_this._vtScrollBar.displayObject);
                    }
                }
                if (_this._scrollType == fairygui.ScrollType.Both || _this._scrollType == fairygui.ScrollType.Horizontal) {
                    var res = hzScrollBarRes ? hzScrollBarRes : fairygui.UIConfig.horizontalScrollBar;
                    if (res) {
                        _this._hzScrollBar = (fairygui.UIPackage.createObjectFromURL(res));
                        if (!_this._hzScrollBar)
                            throw "cannot create scrollbar from " + res;
                        _this._hzScrollBar.setScrollPane(_this, false);
                        _this._owner._rootContainer.addChild(_this._hzScrollBar.displayObject);
                    }
                }
                _this._scrollBarDisplayAuto = scrollBarDisplay == fairygui.ScrollBarDisplayType.Auto;
                if (_this._scrollBarDisplayAuto) {
                    _this._scrollBarVisible = false;
                    if (_this._vtScrollBar)
                        _this._vtScrollBar.displayObject.visible = false;
                    if (_this._hzScrollBar)
                        _this._hzScrollBar.displayObject.visible = false;
                }
            }
            if (headerRes) {
                _this._header = (fairygui.UIPackage.createObjectFromURL(headerRes));
                if (_this._header == null)
                    throw "cannot create scrollPane header from " + headerRes;
            }
            if (footerRes) {
                _this._footer = (fairygui.UIPackage.createObjectFromURL(footerRes));
                if (_this._footer == null)
                    throw "cannot create scrollPane footer from " + footerRes;
            }
            if (_this._header != null || _this._footer != null)
                _this._refreshBarAxis = (_this._scrollType == fairygui.ScrollType.Both || _this._scrollType == fairygui.ScrollType.Vertical) ? "y" : "x";
            _this.setSize(owner.width, owner.height);
            _this._owner.addEventListener(egret.TouchEvent.TOUCH_BEGIN, _this.__touchBegin, _this);
            return _this;
        }
        ScrollPane.prototype.dispose = function () {
            if (this._tweening != 0)
                egret.stopTick(this.tweenUpdate, this);
            this._pageController = null;
            if (this._hzScrollBar != null)
                this._hzScrollBar.dispose();
            if (this._vtScrollBar != null)
                this._vtScrollBar.dispose();
            if (this._header != null)
                this._header.dispose();
            if (this._footer != null)
                this._footer.dispose();
        };
        Object.defineProperty(ScrollPane.prototype, "owner", {
            get: function () {
                return this._owner;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "hzScrollBar", {
            get: function () {
                return this._hzScrollBar;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "vtScrollBar", {
            get: function () {
                return this._vtScrollBar;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "header", {
            get: function () {
                return this._header;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "footer", {
            get: function () {
                return this._footer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "bouncebackEffect", {
            get: function () {
                return this._bouncebackEffect;
            },
            set: function (sc) {
                this._bouncebackEffect = sc;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "touchEffect", {
            get: function () {
                return this._touchEffect;
            },
            set: function (sc) {
                this._touchEffect = sc;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "scrollStep", {
            get: function () {
                return this._scrollStep;
            },
            set: function (val) {
                this._scrollStep = val;
                if (this._scrollStep == 0)
                    this._scrollStep = fairygui.UIConfig.defaultScrollStep;
                this._mouseWheelStep = this._scrollStep * 2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "decelerationRate", {
            get: function () {
                return this._decelerationRate;
            },
            set: function (val) {
                this._decelerationRate = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "snapToItem", {
            get: function () {
                return this._snapToItem;
            },
            set: function (value) {
                this._snapToItem = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "percX", {
            get: function () {
                return this._overlapSize.x == 0 ? 0 : this._xPos / this._overlapSize.x;
            },
            set: function (value) {
                this.setPercX(value, false);
            },
            enumerable: true,
            configurable: true
        });
        ScrollPane.prototype.setPercX = function (value, ani) {
            if (ani === void 0) { ani = false; }
            this._owner.ensureBoundsCorrect();
            this.setPosX(this._overlapSize.x * fairygui.ToolSet.clamp01(value), ani);
        };
        Object.defineProperty(ScrollPane.prototype, "percY", {
            get: function () {
                return this._overlapSize.y == 0 ? 0 : this._yPos / this._overlapSize.y;
            },
            set: function (value) {
                this.setPercY(value, false);
            },
            enumerable: true,
            configurable: true
        });
        ScrollPane.prototype.setPercY = function (value, ani) {
            if (ani === void 0) { ani = false; }
            this._owner.ensureBoundsCorrect();
            this.setPosY(this._overlapSize.y * fairygui.ToolSet.clamp01(value), ani);
        };
        Object.defineProperty(ScrollPane.prototype, "posX", {
            get: function () {
                return this._xPos;
            },
            set: function (value) {
                this.setPosX(value, false);
            },
            enumerable: true,
            configurable: true
        });
        ScrollPane.prototype.setPosX = function (value, ani) {
            if (ani === void 0) { ani = false; }
            this._owner.ensureBoundsCorrect();
            if (this._loop == 1)
                value = this.loopCheckingNewPos(value, "x");
            value = fairygui.ToolSet.clamp(value, 0, this._overlapSize.x);
            if (value != this._xPos) {
                this._xPos = value;
                this.posChanged(ani);
            }
        };
        Object.defineProperty(ScrollPane.prototype, "posY", {
            get: function () {
                return this._yPos;
            },
            set: function (value) {
                this.setPosY(value, false);
            },
            enumerable: true,
            configurable: true
        });
        ScrollPane.prototype.setPosY = function (value, ani) {
            if (ani === void 0) { ani = false; }
            this._owner.ensureBoundsCorrect();
            if (this._loop == 1)
                value = this.loopCheckingNewPos(value, "y");
            value = fairygui.ToolSet.clamp(value, 0, this._overlapSize.y);
            if (value != this._yPos) {
                this._yPos = value;
                this.posChanged(ani);
            }
        };
        Object.defineProperty(ScrollPane.prototype, "contentWidth", {
            get: function () {
                return this._contentSize.x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "contentHeight", {
            get: function () {
                return this._contentSize.y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "viewWidth", {
            get: function () {
                return this._viewSize.x;
            },
            set: function (value) {
                value = value + this._owner.margin.left + this._owner.margin.right;
                if (this._vtScrollBar != null)
                    value += this._vtScrollBar.width;
                this._owner.width = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "viewHeight", {
            get: function () {
                return this._viewSize.y;
            },
            set: function (value) {
                value = value + this._owner.margin.top + this._owner.margin.bottom;
                if (this._hzScrollBar != null)
                    value += this._hzScrollBar.height;
                this._owner.height = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "currentPageX", {
            get: function () {
                if (!this._pageMode)
                    return 0;
                var page = Math.floor(this._xPos / this._pageSize.x);
                if (this._xPos - page * this._pageSize.x > this._pageSize.x * 0.5)
                    page++;
                return page;
            },
            set: function (value) {
                if (this._pageMode && this._overlapSize.x > 0)
                    this.setPosX(value * this._pageSize.x, false);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "currentPageY", {
            get: function () {
                if (!this._pageMode)
                    return 0;
                var page = Math.floor(this._yPos / this._pageSize.y);
                if (this._yPos - page * this._pageSize.y > this._pageSize.y * 0.5)
                    page++;
                return page;
            },
            set: function (value) {
                if (this._pageMode && this._overlapSize.y > 0)
                    this.setPosY(value * this._pageSize.y, false);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "isBottomMost", {
            get: function () {
                return this._yPos == this._overlapSize.y || this._overlapSize.y == 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "isRightMost", {
            get: function () {
                return this._xPos == this._overlapSize.x || this._overlapSize.x == 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "pageController", {
            get: function () {
                return this._pageController;
            },
            set: function (value) {
                this._pageController = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "scrollingPosX", {
            get: function () {
                return fairygui.ToolSet.clamp(-this._container.x, 0, this._overlapSize.x);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollPane.prototype, "scrollingPosY", {
            get: function () {
                return fairygui.ToolSet.clamp(-this._container.y, 0, this._overlapSize.y);
            },
            enumerable: true,
            configurable: true
        });
        ScrollPane.prototype.scrollTop = function (ani) {
            if (ani === void 0) { ani = false; }
            this.setPercY(0, ani);
        };
        ScrollPane.prototype.scrollBottom = function (ani) {
            if (ani === void 0) { ani = false; }
            this.setPercY(1, ani);
        };
        ScrollPane.prototype.scrollUp = function (ratio, ani) {
            if (ratio === void 0) { ratio = 1; }
            if (ani === void 0) { ani = false; }
            if (this._pageMode)
                this.setPosY(this._yPos - this._pageSize.y * ratio, ani);
            else
                this.setPosY(this._yPos - this._scrollStep * ratio, ani);
            ;
        };
        ScrollPane.prototype.scrollDown = function (ratio, ani) {
            if (ratio === void 0) { ratio = 1; }
            if (ani === void 0) { ani = false; }
            if (this._pageMode)
                this.setPosY(this._yPos + this._pageSize.y * ratio, ani);
            else
                this.setPosY(this._yPos + this._scrollStep * ratio, ani);
        };
        ScrollPane.prototype.scrollLeft = function (ratio, ani) {
            if (ratio === void 0) { ratio = 1; }
            if (ani === void 0) { ani = false; }
            if (this._pageMode)
                this.setPosX(this._xPos - this._pageSize.x * ratio, ani);
            else
                this.setPosX(this._xPos - this._scrollStep * ratio, ani);
        };
        ScrollPane.prototype.scrollRight = function (ratio, ani) {
            if (ratio === void 0) { ratio = 1; }
            if (ani === void 0) { ani = false; }
            if (this._pageMode)
                this.setPosX(this._xPos + this._pageSize.x * ratio, ani);
            else
                this.setPosX(this._xPos + this._scrollStep * ratio, ani);
        };
        ScrollPane.prototype.scrollToView = function (target, ani, setFirst) {
            if (ani === void 0) { ani = false; }
            if (setFirst === void 0) { setFirst = false; }
            this._owner.ensureBoundsCorrect();
            if (this._needRefresh)
                this.refresh();
            var rect;
            if (target instanceof fairygui.GObject) {
                if (target.parent != this._owner) {
                    target.parent.localToGlobalRect(target.x, target.y, target.width, target.height, ScrollPane.sHelperRect);
                    rect = this._owner.globalToLocalRect(ScrollPane.sHelperRect.x, ScrollPane.sHelperRect.y, ScrollPane.sHelperRect.width, ScrollPane.sHelperRect.height, ScrollPane.sHelperRect);
                }
                else {
                    rect = ScrollPane.sHelperRect;
                    rect.setTo(target.x, target.y, target.width, target.height);
                }
            }
            else
                rect = target;
            if (this._overlapSize.y > 0) {
                var bottom = this._yPos + this._viewSize.y;
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
                var right = this._xPos + this._viewSize.x;
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
        };
        ScrollPane.prototype.isChildInView = function (obj) {
            if (this._overlapSize.y > 0) {
                var dist = obj.y + this._container.y;
                if (dist < -obj.height || dist > this._viewSize.y)
                    return false;
            }
            if (this._overlapSize.x > 0) {
                dist = obj.x + this._container.x;
                if (dist < -obj.width || dist > this._viewSize.x)
                    return false;
            }
            return true;
        };
        ScrollPane.prototype.cancelDragging = function () {
            this._owner.displayObject.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__touchMove, this);
            this._owner.displayObject.removeEventListener(egret.TouchEvent.TOUCH_END, this.__touchEnd, this);
            this._owner.displayObject.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.__touchTap, this);
            if (ScrollPane.draggingPane == this)
                ScrollPane.draggingPane = null;
            ScrollPane._gestureFlag = 0;
            this.isDragged = false;
            this._maskContainer.touchChildren = true;
        };
        ScrollPane.prototype.lockHeader = function (size) {
            if (this._headerLockedSize == size)
                return;
            this._headerLockedSize = size;
            if (!this._refreshEventDispatching && this._container[this._refreshBarAxis] >= 0) {
                this._tweenStart.setTo(this._container.x, this._container.y);
                this._tweenChange.setTo(0, 0);
                this._tweenChange[this._refreshBarAxis] = this._headerLockedSize - this._tweenStart[this._refreshBarAxis];
                this._tweenDuration.setTo(ScrollPane.TWEEN_TIME_DEFAULT, ScrollPane.TWEEN_TIME_DEFAULT);
                this._tweenTime.setTo(0, 0);
                this._tweening = 2;
                egret.startTick(this.tweenUpdate, this);
            }
        };
        ScrollPane.prototype.lockFooter = function (size) {
            if (this._footerLockedSize == size)
                return;
            this._footerLockedSize = size;
            if (!this._refreshEventDispatching && this._container[this._refreshBarAxis] <= -this._overlapSize[this._refreshBarAxis]) {
                this._tweenStart.setTo(this._container.x, this._container.y);
                this._tweenChange.setTo(0, 0);
                var max = this._overlapSize[this._refreshBarAxis];
                if (max == 0)
                    max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
                else
                    max += this._footerLockedSize;
                this._tweenChange[this._refreshBarAxis] = -max - this._tweenStart[this._refreshBarAxis];
                this._tweenDuration.setTo(ScrollPane.TWEEN_TIME_DEFAULT, ScrollPane.TWEEN_TIME_DEFAULT);
                this._tweenTime.setTo(0, 0);
                this._tweening = 2;
                egret.startTick(this.tweenUpdate, this);
            }
        };
        ScrollPane.prototype.onOwnerSizeChanged = function () {
            this.setSize(this._owner.width, this._owner.height);
            this.posChanged(false);
        };
        ScrollPane.prototype.handleControllerChanged = function (c) {
            if (this._pageController == c) {
                if (this._scrollType == fairygui.ScrollType.Horizontal)
                    this.currentPageX = c.selectedIndex;
                else
                    this.currentPageY = c.selectedIndex;
            }
        };
        ScrollPane.prototype.updatePageController = function () {
            if (this._pageController != null && !this._pageController.changing) {
                var index;
                if (this._scrollType == fairygui.ScrollType.Horizontal)
                    index = this.currentPageX;
                else
                    index = this.currentPageY;
                if (index < this._pageController.pageCount) {
                    var c = this._pageController;
                    this._pageController = null; //防止HandleControllerChanged的调用
                    c.selectedIndex = index;
                    this._pageController = c;
                }
            }
        };
        ScrollPane.prototype.adjustMaskContainer = function () {
            var mx, my;
            if (this._displayOnLeft && this._vtScrollBar != null)
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
        };
        ScrollPane.prototype.setSize = function (aWidth, aHeight) {
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
            if (this._hzScrollBar && !this._hScrollNone)
                this._viewSize.y -= this._hzScrollBar.height;
            if (this._vtScrollBar && !this._vScrollNone)
                this._viewSize.x -= this._vtScrollBar.width;
            this._viewSize.x -= (this._owner.margin.left + this._owner.margin.right);
            this._viewSize.y -= (this._owner.margin.top + this._owner.margin.bottom);
            this._viewSize.x = Math.max(1, this._viewSize.x);
            this._viewSize.y = Math.max(1, this._viewSize.y);
            this._pageSize.x = this._viewSize.x;
            this._pageSize.y = this._viewSize.y;
            this.handleSizeChanged();
        };
        ScrollPane.prototype.setContentSize = function (aWidth, aHeight) {
            if (this._contentSize.x == aWidth && this._contentSize.y == aHeight)
                return;
            this._contentSize.x = aWidth;
            this._contentSize.y = aHeight;
            this.handleSizeChanged();
        };
        ScrollPane.prototype.changeContentSizeOnScrolling = function (deltaWidth, deltaHeight, deltaPosX, deltaPosY) {
            var isRightmost = this._xPos == this._overlapSize.x;
            var isBottom = this._yPos == this._overlapSize.y;
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
            else if (this.isDragged) {
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
        };
        ScrollPane.prototype.handleSizeChanged = function (onScrolling) {
            if (onScrolling === void 0) { onScrolling = false; }
            if (this._displayInDemand) {
                if (this._vtScrollBar) {
                    if (this._contentSize.y <= this._viewSize.y) {
                        if (!this._vScrollNone) {
                            this._vScrollNone = true;
                            this._viewSize.x += this._vtScrollBar.width;
                        }
                    }
                    else {
                        if (this._vScrollNone) {
                            this._vScrollNone = false;
                            this._viewSize.x -= this._vtScrollBar.width;
                        }
                    }
                }
                if (this._hzScrollBar) {
                    if (this._contentSize.x <= this._viewSize.x) {
                        if (!this._hScrollNone) {
                            this._hScrollNone = true;
                            this._viewSize.y += this._hzScrollBar.height;
                        }
                    }
                    else {
                        if (this._hScrollNone) {
                            this._hScrollNone = false;
                            this._viewSize.y -= this._hzScrollBar.height;
                        }
                    }
                }
            }
            if (this._vtScrollBar) {
                if (this._viewSize.y < this._vtScrollBar.minSize)
                    //没有使用this._vtScrollBar.visible是因为ScrollBar用了一个trick，它并不在owner的DisplayList里，因此this._vtScrollBar.visible是无效的
                    this._vtScrollBar.displayObject.visible = false;
                else {
                    this._vtScrollBar.displayObject.visible = this._scrollBarVisible && !this._vScrollNone;
                    if (this._contentSize.y == 0)
                        this._vtScrollBar.displayPerc = 0;
                    else
                        this._vtScrollBar.displayPerc = Math.min(1, this._viewSize.y / this._contentSize.y);
                }
            }
            if (this._hzScrollBar) {
                if (this._viewSize.x < this._hzScrollBar.minSize)
                    this._hzScrollBar.displayObject.visible = false;
                else {
                    this._hzScrollBar.displayObject.visible = this._scrollBarVisible && !this._hScrollNone;
                    if (this._contentSize.x == 0)
                        this._hzScrollBar.displayPerc = 0;
                    else
                        this._hzScrollBar.displayPerc = Math.min(1, this._viewSize.x / this._contentSize.x);
                }
            }
            var rect = this._maskContainer.scrollRect;
            if (rect) {
                rect.width = this._viewSize.x;
                rect.height = this._viewSize.y;
                this._maskContainer.scrollRect = rect;
            }
            if (this._scrollType == fairygui.ScrollType.Horizontal || this._scrollType == fairygui.ScrollType.Both)
                this._overlapSize.x = Math.ceil(Math.max(0, this._contentSize.x - this._viewSize.x));
            else
                this._overlapSize.x = 0;
            if (this._scrollType == fairygui.ScrollType.Vertical || this._scrollType == fairygui.ScrollType.Both)
                this._overlapSize.y = Math.ceil(Math.max(0, this._contentSize.y - this._viewSize.y));
            else
                this._overlapSize.y = 0;
            //边界检查
            this._xPos = fairygui.ToolSet.clamp(this._xPos, 0, this._overlapSize.x);
            this._yPos = fairygui.ToolSet.clamp(this._yPos, 0, this._overlapSize.y);
            if (this._refreshBarAxis != null) {
                var max = this._overlapSize[this._refreshBarAxis];
                if (max == 0)
                    max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
                else
                    max += this._footerLockedSize;
                if (this._refreshBarAxis == "x") {
                    this._container.x = fairygui.ToolSet.clamp(this._container.x, -max, this._headerLockedSize);
                    this._container.y = fairygui.ToolSet.clamp(this._container.y, -this._overlapSize.y, 0);
                }
                else {
                    this._container.x = fairygui.ToolSet.clamp(this._container.x, -this._overlapSize.x, 0);
                    this._container.y = fairygui.ToolSet.clamp(this._container.y, -max, this._headerLockedSize);
                }
                if (this._header != null) {
                    if (this._refreshBarAxis == "x")
                        this._header.height = this._viewSize.y;
                    else
                        this._header.width = this._viewSize.x;
                }
                if (this._footer != null) {
                    if (this._refreshBarAxis == "y")
                        this._footer.height = this._viewSize.y;
                    else
                        this._footer.width = this._viewSize.x;
                }
            }
            else {
                this._container.x = fairygui.ToolSet.clamp(this._container.x, -this._overlapSize.x, 0);
                this._container.y = fairygui.ToolSet.clamp(this._container.y, -this._overlapSize.y, 0);
            }
            this.syncScrollBar();
            this.checkRefreshBar();
            if (this._pageMode)
                this.updatePageController();
        };
        ScrollPane.prototype.posChanged = function (ani) {
            if (this._aniFlag == 0)
                this._aniFlag = ani ? 1 : -1;
            else if (this._aniFlag == 1 && !ani)
                this._aniFlag = -1;
            this._needRefresh = true;
            fairygui.GTimers.inst.callLater(this.refresh, this);
        };
        ScrollPane.prototype.refresh = function () {
            this._needRefresh = false;
            fairygui.GTimers.inst.remove(this.refresh, this);
            if (this._pageMode || this._snapToItem) {
                ScrollPane.sEndPos.setTo(-this._xPos, -this._yPos);
                this.alignPosition(ScrollPane.sEndPos, false);
                this._xPos = -ScrollPane.sEndPos.x;
                this._yPos = -ScrollPane.sEndPos.y;
            }
            this.refresh2();
            this.dispatchEventWith(ScrollPane.SCROLL, false);
            if (this._needRefresh) {
                this._needRefresh = false;
                fairygui.GTimers.inst.remove(this.refresh, this);
                this.refresh2();
            }
            this.syncScrollBar();
            this._aniFlag = 0;
        };
        ScrollPane.prototype.refresh2 = function () {
            if (this._aniFlag == 1 && !this.isDragged) {
                var posX;
                var posY;
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
                    this._tweening = 1;
                    this._tweenTime.setTo(0, 0);
                    this._tweenDuration.setTo(ScrollPane.TWEEN_TIME_GO, ScrollPane.TWEEN_TIME_GO);
                    this._tweenStart.setTo(this._container.x, this._container.y);
                    this._tweenChange.setTo(posX - this._tweenStart.x, posY - this._tweenStart.y);
                    egret.startTick(this.tweenUpdate, this);
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
        };
        ScrollPane.prototype.syncScrollBar = function (end) {
            if (end === void 0) { end = false; }
            if (this._vtScrollBar != null) {
                this._vtScrollBar.scrollPerc = this._overlapSize.y == 0 ? 0 : fairygui.ToolSet.clamp(-this._container.y, 0, this._overlapSize.y) / this._overlapSize.y;
                if (this._scrollBarDisplayAuto)
                    this.showScrollBar(!end);
            }
            if (this._hzScrollBar != null) {
                this._hzScrollBar.scrollPerc = this._overlapSize.x == 0 ? 0 : fairygui.ToolSet.clamp(-this._container.x, 0, this._overlapSize.x) / this._overlapSize.x;
                if (this._scrollBarDisplayAuto)
                    this.showScrollBar(!end);
            }
            if (end)
                this._maskContainer.touchChildren = true;
        };
        ScrollPane.prototype.__touchBegin = function (evt) {
            if (!this._touchEffect)
                return;
            if (this._tweening != 0) {
                this.killTween();
                this.isDragged = true;
            }
            else
                this.isDragged = false;
            var pt = this._owner.globalToLocal(evt.stageX, evt.stageY, ScrollPane.sHelperPoint);
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
        };
        ScrollPane.prototype.__touchMove = function (evt) {
            if (this._owner.displayObject.stage == null)
                return;
            if (!this._touchEffect)
                return;
            if (ScrollPane.draggingPane != null && ScrollPane.draggingPane != this || fairygui.GObject.draggingObject != null)
                return;
            var pt = this._owner.globalToLocal(evt.stageX, evt.stageY, ScrollPane.sHelperPoint);
            var sensitivity = fairygui.UIConfig.touchScrollSensitivity;
            var diff, diff2;
            var sv, sh, st;
            if (this._scrollType == fairygui.ScrollType.Vertical) {
                if (!this._isHoldAreaDone) {
                    //表示正在监测垂直方向的手势
                    ScrollPane._gestureFlag |= 1;
                    diff = Math.abs(this._beginTouchPos.y - pt.y);
                    if (diff < sensitivity)
                        return;
                    if ((ScrollPane._gestureFlag & 2) != 0) {
                        diff2 = Math.abs(this._beginTouchPos.x - pt.x);
                        if (diff < diff2)
                            return;
                    }
                }
                sv = true;
            }
            else if (this._scrollType == fairygui.ScrollType.Horizontal) {
                if (!this._isHoldAreaDone) {
                    ScrollPane._gestureFlag |= 2;
                    diff = Math.abs(this._beginTouchPos.x - pt.x);
                    if (diff < sensitivity)
                        return;
                    if ((ScrollPane._gestureFlag & 1) != 0) {
                        diff2 = Math.abs(this._beginTouchPos.y - pt.y);
                        if (diff < diff2)
                            return;
                    }
                }
                sh = true;
            }
            else {
                ScrollPane._gestureFlag = 3;
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
            var newPosX = Math.floor(this._containerPos.x + pt.x - this._beginTouchPos.x);
            var newPosY = Math.floor(this._containerPos.y + pt.y - this._beginTouchPos.y);
            if (sv) {
                if (newPosY > 0) {
                    if (!this._bouncebackEffect)
                        this._container.y = 0;
                    else if (this._header != null && this._header.maxHeight != 0)
                        this._container.y = Math.floor(Math.min(newPosY * 0.5, this._header.maxHeight));
                    else
                        this._container.y = Math.floor(Math.min(newPosY * 0.5, this._viewSize.y * ScrollPane.PULL_RATIO));
                }
                else if (newPosY < -this._overlapSize.y) {
                    if (!this._bouncebackEffect)
                        this._container.y = -this._overlapSize.y;
                    else if (this._footer != null && this._footer.maxHeight > 0)
                        this._container.y = Math.floor(Math.max((newPosY + this._overlapSize.y) * 0.5, -this._footer.maxHeight) - this._overlapSize.y);
                    else
                        this._container.y = Math.floor(Math.max((newPosY + this._overlapSize.y) * 0.5, -this._viewSize.y * ScrollPane.PULL_RATIO) - this._overlapSize.y);
                }
                else
                    this._container.y = newPosY;
            }
            if (sh) {
                if (newPosX > 0) {
                    if (!this._bouncebackEffect)
                        this._container.x = 0;
                    else if (this._header != null && this._header.maxWidth != 0)
                        this._container.x = Math.floor(Math.min(newPosX * 0.5, this._header.maxWidth));
                    else
                        this._container.x = Math.floor(Math.min(newPosX * 0.5, this._viewSize.x * ScrollPane.PULL_RATIO));
                }
                else if (newPosX < 0 - this._overlapSize.x) {
                    if (!this._bouncebackEffect)
                        this._container.x = -this._overlapSize.x;
                    else if (this._footer != null && this._footer.maxWidth > 0)
                        this._container.x = Math.floor(Math.max((newPosX + this._overlapSize.x) * 0.5, -this._footer.maxWidth) - this._overlapSize.x);
                    else
                        this._container.x = Math.floor(Math.max((newPosX + this._overlapSize.x) * 0.5, -this._viewSize.x * ScrollPane.PULL_RATIO) - this._overlapSize.x);
                }
                else
                    this._container.x = newPosX;
            }
            //更新速度
            var now = egret.getTimer() / 1000;
            var deltaTime = Math.max(now - this._lastMoveTime, 1 / 60);
            var deltaPositionX = pt.x - this._lastTouchPos.x;
            var deltaPositionY = pt.y - this._lastTouchPos.y;
            if (!sh)
                deltaPositionX = 0;
            if (!sv)
                deltaPositionY = 0;
            if (deltaTime != 0) {
                var frameRate = this._owner.displayObject.stage.frameRate;
                var elapsed = deltaTime * frameRate - 1;
                if (elapsed > 1) {
                    var factor = Math.pow(0.833, elapsed);
                    this._velocity.x = this._velocity.x * factor;
                    this._velocity.y = this._velocity.y * factor;
                }
                this._velocity.x = fairygui.ToolSet.lerp(this._velocity.x, deltaPositionX * 60 / frameRate / deltaTime, deltaTime * 10);
                this._velocity.y = fairygui.ToolSet.lerp(this._velocity.y, deltaPositionY * 60 / frameRate / deltaTime, deltaTime * 10);
            }
            /*速度计算使用的是本地位移，但在后续的惯性滚动判断中需要用到屏幕位移，所以这里要记录一个位移的比例。
            */
            var deltaGlobalPositionX = this._lastTouchGlobalPos.x - evt.stageX;
            var deltaGlobalPositionY = this._lastTouchGlobalPos.y - evt.stageY;
            if (deltaPositionX != 0)
                this._velocityScale = Math.abs(deltaGlobalPositionX / deltaPositionX);
            else if (deltaPositionY != 0)
                this._velocityScale = Math.abs(deltaGlobalPositionY / deltaPositionY);
            this._lastTouchPos.setTo(pt.x, pt.y);
            this._lastTouchGlobalPos.setTo(evt.stageX, evt.stageY);
            this._lastMoveTime = now;
            //同步更新pos值
            if (this._overlapSize.x > 0)
                this._xPos = fairygui.ToolSet.clamp(-this._container.x, 0, this._overlapSize.x);
            if (this._overlapSize.y > 0)
                this._yPos = fairygui.ToolSet.clamp(-this._container.y, 0, this._overlapSize.y);
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
            this.isDragged = true;
            this._maskContainer.touchChildren = false;
            this.syncScrollBar();
            this.checkRefreshBar();
            if (this._pageMode)
                this.updatePageController();
            this.dispatchEventWith(ScrollPane.SCROLL, false);
        };
        ScrollPane.prototype.__touchEnd = function (evt) {
            evt.currentTarget.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.__touchMove, this);
            evt.currentTarget.removeEventListener(egret.TouchEvent.TOUCH_END, this.__touchEnd, this);
            evt.currentTarget.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.__touchTap, this);
            if (ScrollPane.draggingPane == this)
                ScrollPane.draggingPane = null;
            ScrollPane._gestureFlag = 0;
            if (!this.isDragged || !this._touchEffect || this._owner.displayObject.stage == null) {
                this.isDragged = false;
                this._maskContainer.touchChildren = true;
                return;
            }
            // touch事件不一定都是以tap结束,拖拽的结束动作是touchEnd,这时需要正确处理isDragged标记位.否则在播放滚动动画时会因为处于拖拽状态而使滚动动画失效
            this.isDragged = false;
            this._maskContainer.touchChildren = true;
            this._tweenStart.setTo(this._container.x, this._container.y);
            ScrollPane.sEndPos.setTo(this._tweenStart.x, this._tweenStart.y);
            var flag = false;
            if (this._container.x > 0) {
                ScrollPane.sEndPos.x = 0;
                flag = true;
            }
            else if (this._container.x < -this._overlapSize.x) {
                ScrollPane.sEndPos.x = -this._overlapSize.x;
                flag = true;
            }
            if (this._container.y > 0) {
                ScrollPane.sEndPos.y = 0;
                flag = true;
            }
            else if (this._container.y < -this._overlapSize.y) {
                ScrollPane.sEndPos.y = -this._overlapSize.y;
                flag = true;
            }
            if (flag) {
                this._tweenChange.setTo(ScrollPane.sEndPos.x - this._tweenStart.x, ScrollPane.sEndPos.y - this._tweenStart.y);
                if (this._tweenChange.x < -fairygui.UIConfig.touchDragSensitivity || this._tweenChange.y < -fairygui.UIConfig.touchDragSensitivity) {
                    this._refreshEventDispatching = true;
                    this.dispatchEventWith(ScrollPane.PULL_DOWN_RELEASE);
                    this._refreshEventDispatching = false;
                }
                else if (this._tweenChange.x > fairygui.UIConfig.touchDragSensitivity || this._tweenChange.y > fairygui.UIConfig.touchDragSensitivity) {
                    this._refreshEventDispatching = true;
                    this.dispatchEventWith(ScrollPane.PULL_UP_RELEASE);
                    this._refreshEventDispatching = false;
                }
                if (this._headerLockedSize > 0 && ScrollPane.sEndPos[this._refreshBarAxis] == 0) {
                    ScrollPane.sEndPos[this._refreshBarAxis] = this._headerLockedSize;
                    this._tweenChange.x = ScrollPane.sEndPos.x - this._tweenStart.x;
                    this._tweenChange.y = ScrollPane.sEndPos.y - this._tweenStart.y;
                }
                else if (this._footerLockedSize > 0 && ScrollPane.sEndPos[this._refreshBarAxis] == -this._overlapSize[this._refreshBarAxis]) {
                    var max = this._overlapSize[this._refreshBarAxis];
                    if (max == 0)
                        max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
                    else
                        max += this._footerLockedSize;
                    ScrollPane.sEndPos[this._refreshBarAxis] = -max;
                    this._tweenChange.x = ScrollPane.sEndPos.x - this._tweenStart.x;
                    this._tweenChange.y = ScrollPane.sEndPos.y - this._tweenStart.y;
                }
                this._tweenDuration.setTo(ScrollPane.TWEEN_TIME_DEFAULT, ScrollPane.TWEEN_TIME_DEFAULT);
            }
            else {
                //更新速度
                if (!this._inertiaDisabled) {
                    var frameRate = this._owner.displayObject.stage.frameRate;
                    var elapsed = (egret.getTimer() / 1000 - this._lastMoveTime) * frameRate - 1;
                    if (elapsed > 1) {
                        var factor = Math.pow(0.833, elapsed);
                        this._velocity.x = this._velocity.x * factor;
                        this._velocity.y = this._velocity.y * factor;
                    }
                    //根据速度计算目标位置和需要时间
                    this.updateTargetAndDuration(this._tweenStart, ScrollPane.sEndPos);
                }
                else
                    this._tweenDuration.setTo(ScrollPane.TWEEN_TIME_DEFAULT, ScrollPane.TWEEN_TIME_DEFAULT);
                ScrollPane.sOldChange.setTo(ScrollPane.sEndPos.x - this._tweenStart.x, ScrollPane.sEndPos.y - this._tweenStart.y);
                //调整目标位置
                this.loopCheckingTarget(ScrollPane.sEndPos);
                if (this._pageMode || this._snapToItem)
                    this.alignPosition(ScrollPane.sEndPos, true);
                this._tweenChange.x = ScrollPane.sEndPos.x - this._tweenStart.x;
                this._tweenChange.y = ScrollPane.sEndPos.y - this._tweenStart.y;
                if (this._tweenChange.x == 0 && this._tweenChange.y == 0) {
                    if (this._scrollBarDisplayAuto)
                        this.showScrollBar(false);
                    return;
                }
                //如果目标位置已调整，随之调整需要时间
                if (this._pageMode || this._snapToItem) {
                    this.fixDuration("x", ScrollPane.sOldChange.x);
                    this.fixDuration("y", ScrollPane.sOldChange.y);
                }
            }
            this._tweening = 2;
            this._tweenTime.setTo(0, 0);
            egret.startTick(this.tweenUpdate, this);
        };
        ScrollPane.prototype.__touchTap = function (evt) {
            this.isDragged = false;
        };
        ScrollPane.prototype.__rollOver = function (evt) {
            this.showScrollBar(true);
        };
        ScrollPane.prototype.__rollOut = function (evt) {
            this.showScrollBar(false);
        };
        ScrollPane.prototype.showScrollBar = function (val) {
            if (val) {
                this.__showScrollBar(true);
                fairygui.GTimers.inst.remove(this.__showScrollBar, this);
            }
            else
                fairygui.GTimers.inst.add(500, 1, this.__showScrollBar, this, val);
        };
        ScrollPane.prototype.__showScrollBar = function (val) {
            this._scrollBarVisible = val && this._viewSize.x > 0 && this._viewSize.y > 0;
            if (this._vtScrollBar)
                this._vtScrollBar.displayObject.visible = this._scrollBarVisible && !this._vScrollNone;
            if (this._hzScrollBar)
                this._hzScrollBar.displayObject.visible = this._scrollBarVisible && !this._hScrollNone;
        };
        ScrollPane.prototype.getLoopPartSize = function (division, axis) {
            return (this._contentSize[axis] + (axis == "x" ? this._owner.columnGap : this._owner.lineGap)) / division;
        };
        ScrollPane.prototype.loopCheckingCurrent = function () {
            var changed = false;
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
        };
        ScrollPane.prototype.loopCheckingTarget = function (endPos) {
            if (this._loop == 1)
                this.loopCheckingTarget2(endPos, "x");
            if (this._loop == 2)
                this.loopCheckingTarget2(endPos, "y");
        };
        ScrollPane.prototype.loopCheckingTarget2 = function (endPos, axis) {
            var halfSize;
            var tmp;
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
        };
        ScrollPane.prototype.loopCheckingNewPos = function (value, axis) {
            if (this._overlapSize[axis] == 0)
                return value;
            var pos = axis == "x" ? this._xPos : this._yPos;
            var changed = false;
            var v;
            if (value < 0.001) {
                value += this.getLoopPartSize(2, axis);
                if (value > pos) {
                    v = this.getLoopPartSize(6, axis);
                    v = Math.ceil((value - pos) / v) * v;
                    pos = fairygui.ToolSet.clamp(pos + v, 0, this._overlapSize[axis]);
                    changed = true;
                }
            }
            else if (value >= this._overlapSize[axis]) {
                value -= this.getLoopPartSize(2, axis);
                if (value < pos) {
                    v = this.getLoopPartSize(6, axis);
                    v = Math.ceil((pos - value) / v) * v;
                    pos = fairygui.ToolSet.clamp(pos - v, 0, this._overlapSize[axis]);
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
        };
        ScrollPane.prototype.alignPosition = function (pos, inertialScrolling) {
            if (this._pageMode) {
                pos.x = this.alignByPage(pos.x, "x", inertialScrolling);
                pos.y = this.alignByPage(pos.y, "y", inertialScrolling);
            }
            else if (this._snapToItem) {
                var pt = this._owner.getSnappingPosition(-pos.x, -pos.y, ScrollPane.sHelperPoint);
                if (pos.x < 0 && pos.x > -this._overlapSize.x)
                    pos.x = -pt.x;
                if (pos.y < 0 && pos.y > -this._overlapSize.y)
                    pos.y = -pt.y;
            }
        };
        ScrollPane.prototype.alignByPage = function (pos, axis, inertialScrolling) {
            var page;
            if (pos > 0)
                page = 0;
            else if (pos < -this._overlapSize[axis])
                page = Math.ceil(this._contentSize[axis] / this._pageSize[axis]) - 1;
            else {
                page = Math.floor(-pos / this._pageSize[axis]);
                var change = inertialScrolling ? (pos - this._containerPos[axis]) : (pos - this._container[axis]);
                var testPageSize = Math.min(this._pageSize[axis], this._contentSize[axis] - (page + 1) * this._pageSize[axis]);
                var delta = -pos - page * this._pageSize[axis];
                //页面吸附策略
                if (Math.abs(change) > this._pageSize[axis]) {
                    if (delta > testPageSize * 0.5)
                        page++;
                }
                else {
                    if (delta > testPageSize * (change < 0 ? 0.3 : 0.7))
                        page++;
                }
                //重新计算终点
                pos = -page * this._pageSize[axis];
                if (pos < -this._overlapSize[axis])
                    pos = -this._overlapSize[axis];
            }
            //惯性滚动模式下，会增加判断尽量不要滚动超过一页
            if (inertialScrolling) {
                var oldPos = this._tweenStart[axis];
                var oldPage;
                if (oldPos > 0)
                    oldPage = 0;
                else if (oldPos < -this._overlapSize[axis])
                    oldPage = Math.ceil(this._contentSize[axis] / this._pageSize[axis]) - 1;
                else
                    oldPage = Math.floor(-oldPos / this._pageSize[axis]);
                var startPage = Math.floor(-this._containerPos[axis] / this._pageSize[axis]);
                if (Math.abs(page - startPage) > 1 && Math.abs(oldPage - startPage) <= 1) {
                    if (page > startPage)
                        page = startPage + 1;
                    else
                        page = startPage - 1;
                    pos = -page * this._pageSize[axis];
                }
            }
            return pos;
        };
        ScrollPane.prototype.updateTargetAndDuration = function (orignPos, resultPos) {
            resultPos.x = this.updateTargetAndDuration2(orignPos.x, "x");
            resultPos.y = this.updateTargetAndDuration2(orignPos.y, "y");
        };
        ScrollPane.prototype.updateTargetAndDuration2 = function (pos, axis) {
            var v = this._velocity[axis];
            var duration = 0;
            if (pos > 0)
                pos = 0;
            else if (pos < -this._overlapSize[axis])
                pos = -this._overlapSize[axis];
            else {
                //以屏幕像素为基准
                var isMobile = egret.Capabilities.isMobile;
                var v2 = Math.abs(v) * this._velocityScale;
                //在移动设备上，需要对不同分辨率做一个适配，我们的速度判断以1136分辨率为基准
                if (isMobile)
                    v2 *= 1136 / Math.max(this._owner.displayObject.stage.stageWidth, this._owner.displayObject.stage.stageHeight);
                //这里有一些阈值的处理，因为在低速内，不希望产生较大的滚动（甚至不滚动）
                var ratio = 0;
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
                    var change = Math.floor(v * duration * 0.4);
                    pos += change;
                }
            }
            if (duration < ScrollPane.TWEEN_TIME_DEFAULT)
                duration = ScrollPane.TWEEN_TIME_DEFAULT;
            this._tweenDuration[axis] = duration;
            return pos;
        };
        ScrollPane.prototype.fixDuration = function (axis, oldChange) {
            if (this._tweenChange[axis] == 0 || Math.abs(this._tweenChange[axis]) >= Math.abs(oldChange))
                return;
            var newDuration = Math.abs(this._tweenChange[axis] / oldChange) * this._tweenDuration[axis];
            if (newDuration < ScrollPane.TWEEN_TIME_DEFAULT)
                newDuration = ScrollPane.TWEEN_TIME_DEFAULT;
            this._tweenDuration[axis] = newDuration;
        };
        ScrollPane.prototype.killTween = function () {
            if (this._tweening == 1) {
                this._container.x = this._tweenStart.x + this._tweenChange.x;
                this._container.y = this._tweenStart.y + this._tweenChange.y;
                this.dispatchEventWith(ScrollPane.SCROLL);
            }
            this._tweening = 0;
            egret.stopTick(this.tweenUpdate, this);
            this.dispatchEventWith(ScrollPane.SCROLL_END);
        };
        ScrollPane.prototype.checkRefreshBar = function () {
            if (this._header == null && this._footer == null)
                return;
            var pos = this._container[this._refreshBarAxis];
            if (this._header != null) {
                if (pos > 0) {
                    if (this._header.displayObject.parent == null)
                        this._maskContainer.addChildAt(this._header.displayObject, 0);
                    var pt = ScrollPane.sHelperPoint;
                    pt.setTo(this._header.width, this._header.height);
                    pt[this._refreshBarAxis] = pos;
                    this._header.setSize(pt.x, pt.y);
                }
                else {
                    if (this._header.displayObject.parent != null)
                        this._maskContainer.removeChild(this._header.displayObject);
                }
            }
            if (this._footer != null) {
                var max = this._overlapSize[this._refreshBarAxis];
                if (pos < -max || max == 0 && this._footerLockedSize > 0) {
                    if (this._footer.displayObject.parent == null)
                        this._maskContainer.addChildAt(this._footer.displayObject, 0);
                    pt = ScrollPane.sHelperPoint;
                    pt.setTo(this._footer.x, this._footer.y);
                    if (max > 0)
                        pt[this._refreshBarAxis] = pos + this._contentSize[this._refreshBarAxis];
                    else
                        pt[this._refreshBarAxis] = Math.max(Math.min(pos + this._viewSize[this._refreshBarAxis], this._viewSize[this._refreshBarAxis] - this._footerLockedSize), this._viewSize[this._refreshBarAxis] - this._contentSize[this._refreshBarAxis]);
                    this._footer.setXY(pt.x, pt.y);
                    pt.setTo(this._footer.width, this._footer.height);
                    if (max > 0)
                        pt[this._refreshBarAxis] = -max - pos;
                    else
                        pt[this._refreshBarAxis] = this._viewSize[this._refreshBarAxis] - this._footer[this._refreshBarAxis];
                    this._footer.setSize(pt.x, pt.y);
                }
                else {
                    if (this._footer.displayObject.parent != null)
                        this._maskContainer.removeChild(this._footer.displayObject);
                }
            }
        };
        ScrollPane.prototype.tweenUpdate = function (timestamp) {
            var nx = this.runTween("x");
            var ny = this.runTween("y");
            this._container.x = nx;
            this._container.y = ny;
            if (this._tweening == 2) {
                if (this._overlapSize.x > 0)
                    this._xPos = fairygui.ToolSet.clamp(-nx, 0, this._overlapSize.x);
                if (this._overlapSize.y > 0)
                    this._yPos = fairygui.ToolSet.clamp(-ny, 0, this._overlapSize.y);
                if (this._pageMode)
                    this.updatePageController();
            }
            if (this._tweenChange.x == 0 && this._tweenChange.y == 0) {
                this._tweening = 0;
                egret.stopTick(this.tweenUpdate, this);
                this.loopCheckingCurrent();
                this.syncScrollBar(true);
                this.checkRefreshBar();
                this.dispatchEventWith(ScrollPane.SCROLL);
                this.dispatchEventWith(ScrollPane.SCROLL_END);
            }
            else {
                this.syncScrollBar(false);
                this.checkRefreshBar();
                this.dispatchEventWith(ScrollPane.SCROLL);
            }
            return true;
        };
        ScrollPane.prototype.runTween = function (axis) {
            var newValue;
            if (this._tweenChange[axis] != 0) {
                this._tweenTime[axis] += fairygui.GTimers.deltaTime / 1000;
                if (this._tweenTime[axis] >= this._tweenDuration[axis]) {
                    newValue = this._tweenStart[axis] + this._tweenChange[axis];
                    this._tweenChange[axis] = 0;
                }
                else {
                    var ratio = ScrollPane.easeFunc(this._tweenTime[axis], this._tweenDuration[axis]);
                    newValue = this._tweenStart[axis] + Math.floor(this._tweenChange[axis] * ratio);
                }
                var threshold1 = 0;
                var threshold2 = -this._overlapSize[axis];
                if (this._headerLockedSize > 0 && this._refreshBarAxis == axis)
                    threshold1 = this._headerLockedSize;
                if (this._footerLockedSize > 0 && this._refreshBarAxis == axis) {
                    var max = this._overlapSize[this._refreshBarAxis];
                    if (max == 0)
                        max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
                    else
                        max += this._footerLockedSize;
                    threshold2 = -max;
                }
                if (this._tweening == 2 && this._bouncebackEffect) {
                    if (newValue > 20 + threshold1 && this._tweenChange[axis] > 0
                        || newValue > threshold1 && this._tweenChange[axis] == 0) {
                        this._tweenTime[axis] = 0;
                        this._tweenDuration[axis] = ScrollPane.TWEEN_TIME_DEFAULT;
                        this._tweenChange[axis] = -newValue + threshold1;
                        this._tweenStart[axis] = newValue;
                    }
                    else if (newValue < threshold2 - 20 && this._tweenChange[axis] < 0
                        || newValue < threshold2 && this._tweenChange[axis] == 0) {
                        this._tweenTime[axis] = 0;
                        this._tweenDuration[axis] = ScrollPane.TWEEN_TIME_DEFAULT;
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
        };
        ScrollPane.easeFunc = function (t, d) {
            return (t = t / d - 1) * t * t + 1; //cubicOut
        };
        ScrollPane._gestureFlag = 0;
        ScrollPane.SCROLL = "__scroll";
        ScrollPane.SCROLL_END = "__scrollEnd";
        ScrollPane.PULL_DOWN_RELEASE = "pullDownRelease";
        ScrollPane.PULL_UP_RELEASE = "pullUpRelease";
        ScrollPane.TWEEN_TIME_GO = 0.5; //调用SetPos(ani)时使用的缓动时间
        ScrollPane.TWEEN_TIME_DEFAULT = 0.3; //惯性滚动的最小缓动时间
        ScrollPane.PULL_RATIO = 0.5; //下拉过顶或者上拉过底时允许超过的距离占显示区域的比例
        ScrollPane.sHelperPoint = new egret.Point();
        ScrollPane.sHelperRect = new egret.Rectangle();
        ScrollPane.sEndPos = new egret.Point();
        ScrollPane.sOldChange = new egret.Point();
        return ScrollPane;
    }(egret.EventDispatcher));
    fairygui.ScrollPane = ScrollPane;
    __reflect(ScrollPane.prototype, "fairygui.ScrollPane");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var UIConfig = (function () {
        function UIConfig() {
        }
        //Default font name
        UIConfig.defaultFont = "SimSun";
        //When a modal window is in front, the background becomes dark.
        UIConfig.modalLayerColor = 0x333333;
        UIConfig.modalLayerAlpha = 0.2;
        UIConfig.buttonSoundVolumeScale = 1;
        //Scrolling step in pixels
        UIConfig.defaultScrollStep = 25;
        //Deceleration ratio of scrollpane when its in touch dragging.
        UIConfig.defaultScrollDecelerationRate = 0.967;
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
        // When click the window, brings to front automatically.
        UIConfig.bringWindowToFrontOnClick = true;
        UIConfig.frameTimeForAsyncUIConstruction = 2;
        return UIConfig;
    }());
    fairygui.UIConfig = UIConfig;
    __reflect(UIConfig.prototype, "fairygui.UIConfig");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var UIObjectFactory = (function () {
        function UIObjectFactory() {
        }
        UIObjectFactory.setPackageItemExtension = function (url, type) {
            if (url == null)
                throw "Invaild url: " + url;
            var pi = fairygui.UIPackage.getItemByURL(url);
            if (pi != null)
                pi.extensionType = type;
            UIObjectFactory.packageItemExtensions[url] = type;
        };
        UIObjectFactory.setLoaderExtension = function (type) {
            UIObjectFactory.loaderType = type;
        };
        UIObjectFactory.$resolvePackageItemExtension = function (pi) {
            pi.extensionType = UIObjectFactory.packageItemExtensions["ui://" + pi.owner.id + pi.id];
            if (!pi.extensionType)
                pi.extensionType = UIObjectFactory.packageItemExtensions["ui://" + pi.owner.name + "/" + pi.name];
        };
        UIObjectFactory.newObject = function (pi) {
            switch (pi.type) {
                case fairygui.PackageItemType.Image:
                    return new fairygui.GImage();
                case fairygui.PackageItemType.MovieClip:
                    return new fairygui.GMovieClip();
                case fairygui.PackageItemType.Component:
                    {
                        var cls = pi.extensionType;
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
                case "component":
                    return new fairygui.GComponent();
                case "text":
                    return new fairygui.GTextField();
                case "richtext":
                    return new fairygui.GRichTextField();
                case "inputtext":
                    return new fairygui.GTextInput();
                case "group":
                    return new fairygui.GGroup();
                case "list":
                    return new fairygui.GList();
                case "graph":
                    return new fairygui.GGraph();
                case "loader":
                    if (UIObjectFactory.loaderType != null)
                        return new UIObjectFactory.loaderType();
                    else
                        return new fairygui.GLoader();
            }
            return null;
        };
        UIObjectFactory.packageItemExtensions = {};
        return UIObjectFactory;
    }());
    fairygui.UIObjectFactory = UIObjectFactory;
    __reflect(UIObjectFactory.prototype, "fairygui.UIObjectFactory");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var UIPackage = (function () {
        function UIPackage() {
            this._items = new Array();
            this._sprites = {};
        }
        UIPackage.getById = function (id) {
            return UIPackage._packageInstById[id];
        };
        UIPackage.getByName = function (name) {
            return UIPackage._packageInstByName[name];
        };
        UIPackage.addPackage = function (resKey, descData) {
            if (descData === void 0) { descData = null; }
            var pkg = new UIPackage();
            pkg.create(resKey, descData);
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
                return pi.owner.internalCreateObject(pi, userClass);
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
            var pos1 = url.indexOf("//");
            if (pos1 == -1)
                return null;
            var pos2 = url.indexOf("/", pos1 + 2);
            if (pos2 == -1) {
                if (url.length > 13) {
                    var pkgId = url.substr(5, 8);
                    var pkg = UIPackage.getById(pkgId);
                    if (pkg != null) {
                        var srcId = url.substr(13);
                        return pkg.getItemById(srcId);
                    }
                }
            }
            else {
                var pkgName = url.substr(pos1 + 2, pos2 - pos1 - 2);
                pkg = UIPackage.getByName(pkgName);
                if (pkg != null) {
                    var srcName = url.substr(pos2 + 1);
                    return pkg.getItemByName(srcName);
                }
            }
            return null;
        };
        UIPackage.normalizeURL = function (url) {
            if (url == null)
                return null;
            var pos1 = url.indexOf("//");
            if (pos1 == -1)
                return null;
            var pos2 = url.indexOf("/", pos1 + 2);
            if (pos2 == -1)
                return url;
            var pkgName = url.substr(pos1 + 2, pos2 - pos1 - 2);
            var srcName = url.substr(pos2 + 1);
            return UIPackage.getItemURL(pkgName, srcName);
        };
        UIPackage.getBitmapFontByURL = function (url) {
            return UIPackage._bitmapFonts[url];
        };
        UIPackage.setStringsSource = function (source) {
            UIPackage._stringsSource = {};
            var xml = egret.XML.parse(source);
            var nodes = xml.children;
            var length1 = nodes.length;
            for (var i1 = 0; i1 < length1; i1++) {
                var cxml = nodes[i1];
                if (cxml.name == "string") {
                    var key = cxml.attributes.name;
                    var text = cxml.children.length > 0 ? cxml.children[0].text : "";
                    var i = key.indexOf("-");
                    if (i == -1)
                        continue;
                    var key2 = key.substr(0, i);
                    var key3 = key.substr(i + 1);
                    var col = UIPackage._stringsSource[key2];
                    if (!col) {
                        col = {};
                        UIPackage._stringsSource[key2] = col;
                    }
                    col[key3] = text;
                }
            }
        };
        UIPackage.prototype.create = function (resKey, descData) {
            this._resKey = resKey;
            this.loadPackage(descData);
        };
        UIPackage.prototype.loadPackage = function (descData) {
            var str;
            var arr;
            var buf;
            if (descData)
                buf = descData;
            else {
                buf = RES.getRes(this._resKey);
                if (!buf)
                    buf = RES.getRes(this._resKey + "_fui");
                if (!buf)
                    throw "Resource '" + this._resKey + "' not found, please check default.res.json!";
            }
            this.decompressPackage(buf);
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
                pi.owner = this;
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
                                str = cxml.attributes.gridTile;
                                if (str)
                                    pi.tileGridIndice = parseInt(str);
                            }
                        }
                        else if (str == "tile") {
                            pi.scaleByTile = true;
                        }
                        str = cxml.attributes.smoothing;
                        pi.smoothing = str != "false";
                        break;
                    }
                    case fairygui.PackageItemType.MovieClip:
                        str = cxml.attributes.smoothing;
                        pi.smoothing = str != "false";
                        break;
                    case fairygui.PackageItemType.Component:
                        fairygui.UIObjectFactory.$resolvePackageItemExtension(pi);
                        break;
                }
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
        UIPackage.prototype.decompressPackage = function (buf) {
            this._resData = {};
            var mark = new Uint8Array(buf.slice(0, 2));
            if (mark[0] == 0x50 && mark[1] == 0x4b) {
                this.decodeUncompressed(buf);
                return;
            }
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
        UIPackage.prototype.decodeUncompressed = function (buf) {
            var ba = new egret.ByteArray(buf);
            ba.endian = egret.Endian.LITTLE_ENDIAN;
            var pos = ba.length - 22;
            ba.position = pos + 10;
            var entryCount = ba.readUnsignedShort();
            ba.position = pos + 16;
            pos = ba.readInt();
            for (var i = 0; i < entryCount; i++) {
                ba.position = pos + 28;
                var len = ba.readUnsignedShort();
                var len2 = ba.readUnsignedShort() + ba.readUnsignedShort();
                ba.position = pos + 46;
                var entryName = ba.readUTFBytes(len);
                if (entryName[entryName.length - 1] != '/' && entryName[entryName.length - 1] != '\\') {
                    ba.position = pos + 20;
                    var size = ba.readInt();
                    ba.position = pos + 42;
                    var offset = ba.readInt() + 30 + len;
                    if (size > 0) {
                        ba.position = offset;
                        this._resData[entryName] = ba.readUTFBytes(size);
                    }
                }
                pos += 46 + len + len2;
            }
        };
        UIPackage.prototype.dispose = function () {
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
        Object.defineProperty(UIPackage.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIPackage.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIPackage.prototype, "customId", {
            get: function () {
                return this._customId;
            },
            set: function (value) {
                if (this._customId != null)
                    delete UIPackage._packageInstById[this._customId];
                this._customId = value;
                if (this._customId != null)
                    UIPackage._packageInstById[this._customId] = this;
            },
            enumerable: true,
            configurable: true
        });
        UIPackage.prototype.createObject = function (resName, userClass) {
            if (userClass === void 0) { userClass = null; }
            var pi = this._itemsByName[resName];
            if (pi)
                return this.internalCreateObject(pi, userClass);
            else
                return null;
        };
        UIPackage.prototype.internalCreateObject = function (item, userClass) {
            if (userClass === void 0) { userClass = null; }
            var g;
            if (item.type == fairygui.PackageItemType.Component) {
                if (userClass != null)
                    g = new userClass();
                else
                    g = fairygui.UIObjectFactory.newObject(item);
            }
            else
                g = fairygui.UIObjectFactory.newObject(item);
            if (g == null)
                return null;
            UIPackage._constructing++;
            g.packageItem = item;
            g.constructFromResource();
            UIPackage._constructing--;
            return g;
        };
        UIPackage.prototype.getItemById = function (itemId) {
            return this._itemsById[itemId];
        };
        UIPackage.prototype.getItemByName = function (resName) {
            return this._itemsByName[resName];
        };
        UIPackage.prototype.getItemAssetByName = function (resName) {
            var pi = this._itemsByName[resName];
            if (pi == null) {
                throw "Resource not found -" + resName;
            }
            return this.getItemAsset(pi);
        };
        UIPackage.prototype.getItemAsset = function (item) {
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
                        if (!item.texture)
                            item.texture = RES.getRes(this._resKey + "@" + fileName.replace("\.", "_"));
                    }
                    return item.texture;
                case fairygui.PackageItemType.Sound:
                    if (!item.decoded) {
                        item.decoded = true;
                        var fileName = (item.file != null && item.file.length > 0) ? item.file : (item.id + ".mp3");
                        item.sound = RES.getRes(this._resKey + "@" + fairygui.ToolSet.getFileName(fileName));
                        if (!item.sound)
                            item.sound = RES.getRes(this._resKey + "@" + fileName.replace("\.", "_"));
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
                        var xml = egret.XML.parse(str);
                        item.componentData = xml;
                        this.loadComponentChildren(item);
                        this.translateComponent(item);
                    }
                    return item.componentData;
                default:
                    return RES.getRes(this._resKey + "@" + item.id);
            }
        };
        UIPackage.prototype.loadComponentChildren = function (item) {
            var listNode = fairygui.ToolSet.findChildNode(item.componentData, "displayList");
            if (listNode != null) {
                var col = listNode.children;
                var dcnt = col.length;
                item.displayList = new Array(dcnt);
                var di;
                for (var i = 0; i < dcnt; i++) {
                    var cxml = col[i];
                    var tagName = cxml.name;
                    var src = cxml.attributes.src;
                    if (src) {
                        var pkgId = cxml.attributes.pkg;
                        var pkg;
                        if (pkgId && pkgId != item.owner.id)
                            pkg = UIPackage.getById(pkgId);
                        else
                            pkg = item.owner;
                        var pi = pkg != null ? pkg.getItemById(src) : null;
                        if (pi != null)
                            di = new fairygui.DisplayListItem(pi, null);
                        else
                            di = new fairygui.DisplayListItem(null, tagName);
                    }
                    else {
                        if (tagName == "text" && cxml.attributes.input == "true")
                            di = new fairygui.DisplayListItem(null, "inputtext");
                        else
                            di = new fairygui.DisplayListItem(null, tagName);
                    }
                    di.desc = cxml;
                    item.displayList[i] = di;
                }
            }
            else
                item.displayList = new Array();
        };
        UIPackage.prototype.getDesc = function (fn) {
            return this._resData[fn];
        };
        UIPackage.prototype.translateComponent = function (item) {
            if (UIPackage._stringsSource == null)
                return;
            var strings = UIPackage._stringsSource[this.id + item.id];
            if (strings == null)
                return;
            var length1 = item.displayList.length;
            var length2;
            var value;
            var cxml, dxml, exml;
            var ename;
            var elementId;
            var items;
            var i1, i2, j;
            var str;
            for (i1 = 0; i1 < length1; i1++) {
                cxml = item.displayList[i1].desc;
                ename = cxml.name;
                elementId = cxml.attributes.id;
                str = cxml.attributes.tooltips;
                if (str) {
                    value = strings[elementId + "-tips"];
                    if (value != undefined)
                        cxml.attributes.tooltips = value;
                }
                dxml = fairygui.ToolSet.findChildNode(cxml, "gearText");
                if (dxml) {
                    value = strings[elementId + "-texts"];
                    if (value != undefined)
                        dxml.attributes.values = value;
                    value = strings[elementId + "-texts_def"];
                    if (value != undefined)
                        dxml.attributes.default = value;
                }
                if (ename == "text" || ename == "richtext") {
                    value = strings[elementId];
                    if (value != undefined)
                        cxml.attributes.text = value;
                    value = strings[elementId + "-prompt"];
                    if (value != undefined)
                        cxml.attributes.prompt = value;
                }
                else if (ename == "list") {
                    items = cxml.children;
                    length2 = items.length;
                    j = 0;
                    for (i2 = 0; i2 < length2; i2++) {
                        exml = items[i2];
                        if (exml.name != "item")
                            continue;
                        value = strings[elementId + "-" + j];
                        if (value != undefined)
                            exml.attributes.title = value;
                        j++;
                    }
                }
                else if (ename == "component") {
                    dxml = fairygui.ToolSet.findChildNode(cxml, "Button");
                    if (dxml) {
                        value = strings[elementId];
                        if (value != undefined)
                            dxml.attributes.title = value;
                        value = strings[elementId + "-0"];
                        if (value != undefined)
                            dxml.attributes.selectedTitle = value;
                        continue;
                    }
                    dxml = fairygui.ToolSet.findChildNode(cxml, "Label");
                    if (dxml) {
                        value = strings[elementId];
                        if (value != undefined)
                            dxml.attributes.title = value;
                        value = strings[elementId + "-prompt"];
                        if (value != undefined)
                            dxml.attributes.prompt = value;
                        continue;
                    }
                    dxml = fairygui.ToolSet.findChildNode(cxml, "ComboBox");
                    if (dxml) {
                        value = strings[elementId];
                        if (value != undefined)
                            dxml.attributes.title = value;
                        items = dxml.children;
                        length2 = items.length;
                        j = 0;
                        for (i2 = 0; i2 < length2; i2++) {
                            exml = items[i2];
                            if (exml.name != "item")
                                continue;
                            value = strings[elementId + "-" + j];
                            if (value != undefined)
                                exml.attributes.title = value;
                            j++;
                        }
                        continue;
                    }
                }
            }
        };
        UIPackage.prototype.createSpriteTexture = function (sprite) {
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
        UIPackage.prototype.createSubTexture = function (atlasTexture, uvRect) {
            var texture = new egret.Texture();
            if (atlasTexture["_bitmapData"]) {
                texture["_bitmapData"] = atlasTexture["_bitmapData"];
                texture.$initData(atlasTexture["_bitmapX"] + uvRect.x, atlasTexture["_bitmapY"] + uvRect.y, uvRect.width, uvRect.height, 0, 0, uvRect.width, uvRect.height, atlasTexture["_sourceWidth"], atlasTexture["_sourceHeight"]);
            }
            else {
                texture.bitmapData = atlasTexture.bitmapData;
                texture.$initData(atlasTexture["$bitmapX"] + uvRect.x, atlasTexture["$bitmapY"] + uvRect.y, uvRect.width, uvRect.height, 0, 0, uvRect.width, uvRect.height, atlasTexture["$sourceWidth"], atlasTexture["$sourceHeight"]);
            }
            return texture;
        };
        UIPackage.prototype.loadMovieClip = function (item) {
            var xml = egret.XML.parse(this.getDesc(item.id + ".xml"));
            var str;
            var arr;
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
                if (frame.rect.width == 0)
                    continue;
                str = frameNode.attributes.sprite;
                if (str)
                    str = item.id + "_" + str;
                else
                    str = item.id + "_" + i;
                var sprite = this._sprites[str];
                if (sprite != null) {
                    frame.texture = this.createSpriteTexture(sprite);
                }
            }
        };
        UIPackage.prototype.loadFont = function (item) {
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
            var lineHeight = 0;
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
                        bg.lineHeight = lineHeight;
                    else {
                        if (bg.advance == 0) {
                            if (xadvance == 0)
                                bg.advance = bg.offsetX + bg.width;
                            else
                                bg.advance = xadvance;
                        }
                        bg.lineHeight = bg.offsetY < 0 ? bg.height : (bg.offsetY + bg.height);
                        if (size > 0 && bg.lineHeight < size)
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
                    if (!isNaN(kv.lineHeight))
                        lineHeight = parseInt(kv.lineHeight);
                    if (size == 0)
                        size = lineHeight;
                    else if (lineHeight == 0)
                        lineHeight = size;
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
        UIPackage._stringsSource = null;
        UIPackage.sep0 = ",";
        UIPackage.sep1 = "\n";
        UIPackage.sep2 = " ";
        UIPackage.sep3 = "=";
        return UIPackage;
    }());
    fairygui.UIPackage = UIPackage;
    __reflect(UIPackage.prototype, "fairygui.UIPackage");
    var AtlasSprite = (function () {
        function AtlasSprite() {
            this.rect = new egret.Rectangle();
        }
        return AtlasSprite;
    }());
    __reflect(AtlasSprite.prototype, "AtlasSprite");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var Window = (function (_super) {
        __extends(Window, _super);
        function Window() {
            var _this = _super.call(this) || this;
            _this._requestingCmd = 0;
            _this.focusable = true;
            _this._uiSources = new Array();
            _this.bringToFontOnClick = fairygui.UIConfig.bringWindowToFrontOnClick;
            _this.displayObject.addEventListener(egret.Event.ADDED_TO_STAGE, _this.__onShown, _this);
            _this.displayObject.addEventListener(egret.Event.REMOVED_FROM_STAGE, _this.__onHidden, _this);
            _this.displayObject.addEventListener(egret.TouchEvent.TOUCH_BEGIN, _this.__mouseDown, _this, true);
            return _this;
        }
        Window.prototype.addUISource = function (source) {
            this._uiSources.push(source);
        };
        Object.defineProperty(Window.prototype, "contentPane", {
            get: function () {
                return this._contentPane;
            },
            set: function (val) {
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
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Window.prototype, "frame", {
            get: function () {
                return this._frame;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Window.prototype, "closeButton", {
            get: function () {
                return this._closeButton;
            },
            set: function (value) {
                if (this._closeButton != null)
                    this._closeButton.removeClickListener(this.closeEventHandler, this);
                this._closeButton = value;
                if (this._closeButton != null)
                    this._closeButton.addClickListener(this.closeEventHandler, this);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Window.prototype, "dragArea", {
            get: function () {
                return this._dragArea;
            },
            set: function (value) {
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
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Window.prototype, "contentArea", {
            get: function () {
                return this._contentArea;
            },
            set: function (value) {
                this._contentArea = value;
            },
            enumerable: true,
            configurable: true
        });
        Window.prototype.show = function () {
            fairygui.GRoot.inst.showWindow(this);
        };
        Window.prototype.showOn = function (root) {
            root.showWindow(this);
        };
        Window.prototype.hide = function () {
            if (this.isShowing)
                this.doHideAnimation();
        };
        Window.prototype.hideImmediately = function () {
            var r = (this.parent instanceof fairygui.GRoot) ? (this.parent) : null;
            if (!r)
                r = fairygui.GRoot.inst;
            r.hideWindowImmediately(this);
        };
        Window.prototype.centerOn = function (r, restraint) {
            if (restraint === void 0) { restraint = false; }
            this.setXY(Math.round((r.width - this.width) / 2), Math.round((r.height - this.height) / 2));
            if (restraint) {
                this.addRelation(r, fairygui.RelationType.Center_Center);
                this.addRelation(r, fairygui.RelationType.Middle_Middle);
            }
        };
        Window.prototype.toggleStatus = function () {
            if (this.isTop)
                this.hide();
            else
                this.show();
        };
        Object.defineProperty(Window.prototype, "isShowing", {
            get: function () {
                return this.parent != null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Window.prototype, "isTop", {
            get: function () {
                return this.parent != null && this.parent.getChildIndex(this) == this.parent.numChildren - 1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Window.prototype, "modal", {
            get: function () {
                return this._modal;
            },
            set: function (val) {
                this._modal = val;
            },
            enumerable: true,
            configurable: true
        });
        Window.prototype.bringToFront = function () {
            this.root.bringToFront(this);
        };
        Window.prototype.showModalWait = function (requestingCmd) {
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
        Window.prototype.layoutModalWaitPane = function () {
            if (this._contentArea != null) {
                var pt = this._frame.localToGlobal();
                pt = this.globalToLocal(pt.x, pt.y, pt);
                this._modalWaitPane.setXY(pt.x + this._contentArea.x, pt.y + this._contentArea.y);
                this._modalWaitPane.setSize(this._contentArea.width, this._contentArea.height);
            }
            else
                this._modalWaitPane.setSize(this.width, this.height);
        };
        Window.prototype.closeModalWait = function (requestingCmd) {
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
        Object.defineProperty(Window.prototype, "modalWaiting", {
            get: function () {
                return this._modalWaitPane && this._modalWaitPane.parent != null;
            },
            enumerable: true,
            configurable: true
        });
        Window.prototype.init = function () {
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
        Window.prototype.onInit = function () {
        };
        Window.prototype.onShown = function () {
        };
        Window.prototype.onHide = function () {
        };
        Window.prototype.doShowAnimation = function () {
            this.onShown();
        };
        Window.prototype.doHideAnimation = function () {
            this.hideImmediately();
        };
        Window.prototype.__uiLoadComplete = function () {
            var cnt = this._uiSources.length;
            for (var i = 0; i < cnt; i++) {
                var lib = this._uiSources[i];
                if (!lib.loaded)
                    return;
            }
            this._loading = false;
            this._init();
        };
        Window.prototype._init = function () {
            this._inited = true;
            this.onInit();
            if (this.isShowing)
                this.doShowAnimation();
        };
        Window.prototype.dispose = function () {
            this.displayObject.removeEventListener(egret.Event.ADDED_TO_STAGE, this.__onShown, this);
            this.displayObject.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.__onHidden, this);
            if (this.parent != null)
                this.hideImmediately();
            _super.prototype.dispose.call(this);
        };
        Window.prototype.closeEventHandler = function (evt) {
            this.hide();
        };
        Window.prototype.__onShown = function (evt) {
            if (!this._inited)
                this.init();
            else
                this.doShowAnimation();
        };
        Window.prototype.__onHidden = function (evt) {
            this.closeModalWait();
            this.onHide();
        };
        Window.prototype.__mouseDown = function (evt) {
            if (this.isShowing && this.bringToFontOnClick)
                this.bringToFront();
        };
        Window.prototype.__dragStart = function (evt) {
            evt.preventDefault();
            this.startDrag(evt.touchPointID);
        };
        return Window;
    }(fairygui.GComponent));
    fairygui.Window = Window;
    __reflect(Window.prototype, "fairygui.Window");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var DragDropManager = (function () {
        function DragDropManager() {
            this._agent = new fairygui.GLoader();
            this._agent.draggable = true;
            this._agent.touchable = false; //important
            this._agent.setSize(100, 100);
            this._agent.setPivot(0.5, 0.5, true);
            this._agent.align = fairygui.AlignType.Center;
            this._agent.verticalAlign = fairygui.VertAlignType.Middle;
            this._agent.sortingOrder = 1000000;
            this._agent.addEventListener(fairygui.DragEvent.DRAG_END, this.__dragEnd, this);
        }
        Object.defineProperty(DragDropManager, "inst", {
            get: function () {
                if (DragDropManager._inst == null)
                    DragDropManager._inst = new DragDropManager();
                return DragDropManager._inst;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DragDropManager.prototype, "dragAgent", {
            get: function () {
                return this._agent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DragDropManager.prototype, "dragging", {
            get: function () {
                return this._agent.parent != null;
            },
            enumerable: true,
            configurable: true
        });
        DragDropManager.prototype.startDrag = function (source, icon, sourceData, touchPointID) {
            if (touchPointID === void 0) { touchPointID = -1; }
            if (this._agent.parent != null)
                return;
            this._sourceData = sourceData;
            this._agent.url = icon;
            fairygui.GRoot.inst.addChild(this._agent);
            var pt = fairygui.GRoot.inst.globalToLocal(fairygui.GRoot.mouseX, fairygui.GRoot.mouseY);
            this._agent.setXY(pt.x, pt.y);
            this._agent.startDrag(touchPointID);
        };
        DragDropManager.prototype.cancel = function () {
            if (this._agent.parent != null) {
                this._agent.stopDrag();
                fairygui.GRoot.inst.removeChild(this._agent);
                this._sourceData = null;
            }
        };
        DragDropManager.prototype.__dragEnd = function (evt) {
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
    }());
    fairygui.DragDropManager = DragDropManager;
    __reflect(DragDropManager.prototype, "fairygui.DragDropManager");
})(fairygui || (fairygui = {}));
var fairygui;
(function (fairygui) {
    var AsyncOperation = (function () {
        function AsyncOperation() {
            this._itemList = new Array();
            this._objectPool = new Array();
        }
        AsyncOperation.prototype.createObject = function (pkgName, resName) {
            var pkg = fairygui.UIPackage.getByName(pkgName);
            if (pkg) {
                var pi = pkg.getItemByName(resName);
                if (!pi)
                    throw new Error("resource not found: " + resName);
                this.internalCreateObject(pi);
            }
            else
                throw new Error("package not found: " + pkgName);
        };
        AsyncOperation.prototype.createObjectFromURL = function (url) {
            var pi = fairygui.UIPackage.getItemByURL(url);
            if (pi)
                this.internalCreateObject(pi);
            else
                throw new Error("resource not found: " + url);
        };
        AsyncOperation.prototype.cancel = function () {
            fairygui.GTimers.inst.remove(this.run, this);
            this._itemList.length = 0;
            var cnt = this._objectPool.length;
            if (cnt > 0) {
                for (var i = 0; i < cnt; i++)
                    this._objectPool[i].dispose();
                this._objectPool.length = 0;
            }
        };
        AsyncOperation.prototype.internalCreateObject = function (item) {
            this._itemList.length = 0;
            this._objectPool.length = 0;
            this.collectComponentChildren(item);
            this._itemList.push(new fairygui.DisplayListItem(item, null));
            this._index = 0;
            fairygui.GTimers.inst.add(1, 0, this.run, this);
        };
        AsyncOperation.prototype.collectComponentChildren = function (item) {
            item.owner.getItemAsset(item);
            var cnt = item.displayList.length;
            for (var i = 0; i < cnt; i++) {
                var di = item.displayList[i];
                if (di.packageItem != null && di.packageItem.type == fairygui.PackageItemType.Component)
                    this.collectComponentChildren(di.packageItem);
                else if (di.type == "list") {
                    var defaultItem = null;
                    di.listItemCount = 0;
                    var col = di.desc.children;
                    var length = col.length;
                    for (var j = 0; j < length; j++) {
                        var cxml = col[j];
                        if (cxml.name != "item")
                            continue;
                        var url = cxml.attributes.url;
                        if (!url) {
                            if (defaultItem == null)
                                defaultItem = di.desc.attributes.defaultItem;
                            url = defaultItem;
                            if (!url)
                                continue;
                        }
                        var pi = fairygui.UIPackage.getItemByURL(url);
                        if (pi) {
                            if (pi.type == fairygui.PackageItemType.Component)
                                this.collectComponentChildren(pi);
                            this._itemList.push(new fairygui.DisplayListItem(pi, null));
                            di.listItemCount++;
                        }
                    }
                }
                this._itemList.push(di);
            }
        };
        AsyncOperation.prototype.run = function () {
            var obj;
            var di;
            var poolStart;
            var k;
            var t = egret.getTimer();
            var frameTime = fairygui.UIConfig.frameTimeForAsyncUIConstruction;
            var totalItems = this._itemList.length;
            while (this._index < totalItems) {
                di = this._itemList[this._index];
                if (di.packageItem != null) {
                    obj = fairygui.UIObjectFactory.newObject(di.packageItem);
                    obj.packageItem = di.packageItem;
                    this._objectPool.push(obj);
                    fairygui.UIPackage._constructing++;
                    if (di.packageItem.type == fairygui.PackageItemType.Component) {
                        poolStart = this._objectPool.length - di.packageItem.displayList.length - 1;
                        obj.constructFromResource2(this._objectPool, poolStart);
                        this._objectPool.splice(poolStart, di.packageItem.displayList.length);
                    }
                    else {
                        obj.constructFromResource();
                    }
                    fairygui.UIPackage._constructing--;
                }
                else {
                    obj = fairygui.UIObjectFactory.newObject2(di.type);
                    this._objectPool.push(obj);
                    if (di.type == "list" && di.listItemCount > 0) {
                        poolStart = this._objectPool.length - di.listItemCount - 1;
                        for (k = 0; k < di.listItemCount; k++)
                            obj.itemPool.returnObject(this._objectPool[k + poolStart]);
                        this._objectPool.splice(poolStart, di.listItemCount);
                    }
                }
                this._index++;
                if ((this._index % 5 == 0) && egret.getTimer() - t >= frameTime)
                    return;
            }
            fairygui.GTimers.inst.remove(this.run, this);
            var result = this._objectPool[0];
            this._itemList.length = 0;
            this._objectPool.length = 0;
            if (this.callback != null)
                this.callback.call(this.callbackObj, result);
        };
        return AsyncOperation;
    }());
    fairygui.AsyncOperation = AsyncOperation;
    __reflect(AsyncOperation.prototype, "fairygui.AsyncOperation");
})(fairygui || (fairygui = {}));
