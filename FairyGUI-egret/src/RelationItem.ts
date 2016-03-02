
module fairygui {

    export class RelationItem {
        private _owner: GObject;
        private _target: GObject;
        private _defs: Array<RelationDef>;
        private _targetX: number;
		private _targetY: number;
		private _targetWidth: number;
		private _targetHeight: number;		

        public constructor(owner: GObject) {
            this._owner = owner;
            this._defs = new Array<RelationDef>();
        }

        public get owner(): GObject {
            return this._owner;
        }

        public set target(value: GObject) {
            if (this._target != value) {
                if (this._target)
                    this.releaseRefTarget(this._target);
                this._target = value;
                if (this._target)
                    this.addRefTarget(this._target);
            }
        }

        public get target(): GObject {
            return this._target;
        }

        public add(relationType: number, usePercent: boolean): void {
            if (relationType == RelationType.Size) {
                this.add(RelationType.Width, usePercent);
                this.add(RelationType.Height, usePercent);
                return;
            }

            var length: number = this._defs.length;
            for (var i: number = 0; i < length; i++) {
                var def: RelationDef = this._defs[i];
                if (def.type == relationType)
                    return;
            }

            var info: RelationDef = new RelationDef();
            info.affectBySelfSizeChanged = relationType >= RelationType.Center_Center && relationType <= RelationType.Right_Right
                || relationType >= RelationType.Middle_Middle && relationType <= RelationType.Bottom_Bottom;
            info.percent = usePercent;
            info.type = relationType;
            this._defs.push(info);
        }

        public remove(relationType: number = 0): void {
            if (relationType == RelationType.Size) {
                this.remove(RelationType.Width);
                this.remove(RelationType.Height);
                return;
            }

            var dc: number = this._defs.length;
            for (var k: number = 0; k < dc; k++) {
                if (this._defs[k].type == relationType) {
                    this._defs.splice(k, 1);
                    break;
                }
            }
        }

        public copyFrom(source: RelationItem): void {
            this.target = source.target;

            this._defs.length = 0;
            var length: number = source._defs.length;
            for (var i: number = 0; i < length; i++) {
                var info: RelationDef = source._defs[i];
                var info2: RelationDef = new RelationDef();
                info2.copyFrom(info);
                this._defs.push(info2);
            }
        }

        public dispose(): void {
            if (this._target != null) {
                this.releaseRefTarget(this._target);
                this._target = null;
            }
        }

        public get isEmpty(): boolean {
            return this._defs.length == 0;
        }

        public applyOnSelfResized(dWidth: number, dHeight: number): void {
            var ox: number = this._owner.x;
            var oy: number = this._owner.y;

            var length: number = this._defs.length;
            for (var i: number = 0; i < length; i++) {
                var info: RelationDef = this._defs[i];
                if (info.affectBySelfSizeChanged) {
                    switch (info.type) {
                        case RelationType.Center_Center:
                        case RelationType.Right_Center:
                            this._owner.x -= dWidth / 2;
                            break;

                        case RelationType.Right_Left:
                        case RelationType.Right_Right:
                            this._owner.x -= dWidth;
                            break;

                        case RelationType.Middle_Middle:
                        case RelationType.Bottom_Middle:
                            this._owner.y -= dHeight / 2;
                            break;
                        case RelationType.Bottom_Top:
                        case RelationType.Bottom_Bottom:
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

                if(this._owner.parent != null) {
                    var len: number = this._owner.parent._transitions.length;
                    if(len > 0) {
                        for(var i: number = 0;i < len;++i) {
                            this._owner.parent._transitions[i].updateFromRelations(this._owner.id,ox,oy);
                        }
                    }
                }
            }
        }

        private applyOnXYChanged(info: RelationDef, dx: number, dy: number): void {
            var tmp: number;
            switch (info.type) {
                case RelationType.Left_Left:
                case RelationType.Left_Center:
                case RelationType.Left_Right:
                case RelationType.Center_Center:
                case RelationType.Right_Left:
                case RelationType.Right_Center:
                case RelationType.Right_Right:
                    this._owner.x += dx;
                    break;

                case RelationType.Top_Top:
                case RelationType.Top_Middle:
                case RelationType.Top_Bottom:
                case RelationType.Middle_Middle:
                case RelationType.Bottom_Top:
                case RelationType.Bottom_Middle:
                case RelationType.Bottom_Bottom:
                    this._owner.y += dy;
                    break;

                case RelationType.Width:
                case RelationType.Height:
                    break;

                case RelationType.LeftExt_Left:
                case RelationType.LeftExt_Right:
                    tmp = this._owner.x;
                    this._owner.x += dx;
                    this._owner.width = this._owner._rawWidth - (this._owner.x - tmp);
                    break;

                case RelationType.RightExt_Left:
                case RelationType.RightExt_Right:
                    this._owner.width = this._owner._rawWidth + dx;
                    break;

                case RelationType.TopExt_Top:
                case RelationType.TopExt_Bottom:
                    tmp = this._owner.y;
                    this._owner.y += dy;
                    this._owner.height = this._owner._rawHeight - (this._owner.y - tmp);
                    break;

                case RelationType.BottomExt_Top:
                case RelationType.BottomExt_Bottom:
                    this._owner.height = this._owner._rawHeight + dy;
                    break;
            }
        }

        private applyOnSizeChanged(info: RelationDef): void {
            var targetX: number, targetY: number;
            if (this._target != this._owner.parent) {
                targetX = this._target.x;
                targetY = this._target.y;
            }
            else {
                targetX = 0;
                targetY = 0;
            }
            var v: number, tmp: number;

            switch (info.type) {
                case RelationType.Left_Left:
                    break;
                case RelationType.Left_Center:
                    v = this._owner.x - (targetX + this._targetWidth / 2);
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    this._owner.x = targetX + this._target._rawWidth / 2 + v;
                    break;
                case RelationType.Left_Right:
                    v = this._owner.x - (targetX + this._targetWidth);
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    this._owner.x = targetX + this._target._rawWidth + v;
                    break;
                case RelationType.Center_Center:
                    v = this._owner.x + this._owner._rawWidth / 2 - (targetX + this._targetWidth / 2);
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    this._owner.x = targetX + this._target._rawWidth / 2 + v - this._owner._rawWidth / 2;
                    break;
                case RelationType.Right_Left:
                    v = this._owner.x + this._owner._rawWidth - targetX;
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    this._owner.x = targetX + v - this._owner._rawWidth;
                    break;
                case RelationType.Right_Center:
                    v = this._owner.x + this._owner._rawWidth - (targetX + this._targetWidth / 2);
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    this._owner.x = targetX + this._target._rawWidth / 2 + v - this._owner._rawWidth;
                    break;
                case RelationType.Right_Right:
                    v = this._owner.x + this._owner._rawWidth - (targetX + this._targetWidth);
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    this._owner.x = targetX + this._target._rawWidth + v - this._owner._rawWidth;
                    break;

                case RelationType.Top_Top:
                    break;
                case RelationType.Top_Middle:
                    v = this._owner.y - (targetY + this._targetHeight / 2);
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    this._owner.y = targetY + this._target._rawHeight / 2 + v;
                    break;
                case RelationType.Top_Bottom:
                    v = this._owner.y - (targetY + this._targetHeight);
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    this._owner.y = targetY + this._target._rawHeight + v;
                    break;
                case RelationType.Middle_Middle:
                    v = this._owner.y + this._owner._rawHeight / 2 - (targetY + this._targetHeight / 2);
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    this._owner.y = targetY + this._target._rawHeight / 2 + v - this._owner._rawHeight / 2;
                    break;
                case RelationType.Bottom_Top:
                    v = this._owner.y + this._owner._rawHeight - targetY;
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    this._owner.y = targetY + v - this._owner._rawHeight;
                    break;
                case RelationType.Bottom_Middle:
                    v = this._owner.y + this._owner._rawHeight - (targetY + this._targetHeight / 2);
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    this._owner.y = targetY + this._target._rawHeight / 2 + v - this._owner._rawHeight;
                    break;
                case RelationType.Bottom_Bottom:
                    v = this._owner.y + this._owner._rawHeight - (targetY + this._targetHeight);
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    this._owner.y = targetY + this._target._rawHeight + v - this._owner._rawHeight;
                    break;

                case RelationType.Width:
                    if(this._owner._underConstruct && this._owner==this._target.parent)
                        v = this._owner.sourceWidth - this._target._initWidth;
                    else
                        v = this._owner._rawWidth - this._targetWidth;
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    this._owner.width = this._target._rawWidth + v;
                    break;
                case RelationType.Height:
                    if(this._owner._underConstruct && this._owner==this._target.parent)
                        v = this._owner.sourceHeight - this._target._initHeight;
                    else
                        v = this._owner._rawHeight - this._targetHeight;
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    this._owner.height = this._target._rawHeight + v;
                    break;

                case RelationType.LeftExt_Left:
                    break;
                case RelationType.LeftExt_Right:
                    v = this._owner.x - (targetX + this._targetWidth);
                    if (info.percent)
                        v = v / this._targetWidth * this._target._rawWidth;
                    tmp = this._owner.x;
                    this._owner.x = targetX + this._target._rawWidth + v;
                    this._owner.width = this._owner._rawWidth - (this._owner.x - tmp);
                    break;
                case RelationType.RightExt_Left:
                    break;
                case RelationType.RightExt_Right:
                    if(this._owner._underConstruct && this._owner==this._target.parent)
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
                case RelationType.TopExt_Top:
                    break;
                case RelationType.TopExt_Bottom:
                    v = this._owner.y - (targetY + this._targetHeight);
                    if (info.percent)
                        v = v / this._targetHeight * this._target._rawHeight;
                    tmp = this._owner.y;
                    this._owner.y = targetY + this._target._rawHeight + v;
                    this._owner.height = this._owner._rawHeight - (this._owner.y - tmp);
                    break;
                case RelationType.BottomExt_Top:
                    break;
                case RelationType.BottomExt_Bottom:
                    if(this._owner._underConstruct && this._owner==this._target.parent)
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
        }

        private addRefTarget(target: GObject): void {
            if (target != this._owner.parent)
                target.addEventListener(GObject.XY_CHANGED, this.__targetXYChanged, this);
            target.addEventListener(GObject.SIZE_CHANGED, this.__targetSizeChanged, this);
            target.addEventListener(GObject.SIZE_DELAY_CHANGE, this.__targetSizeWillChange, this);

            this._targetX = this._target.x;
            this._targetY = this._target.y;
            this._targetWidth = this._target._rawWidth;
            this._targetHeight = this._target._rawHeight;
        }

        private releaseRefTarget(target: GObject): void {
            target.removeEventListener(GObject.XY_CHANGED, this.__targetXYChanged, this);
            target.removeEventListener(GObject.SIZE_CHANGED, this.__targetSizeChanged, this);
            target.removeEventListener(GObject.SIZE_DELAY_CHANGE, this.__targetSizeWillChange, this);
        }

        private __targetXYChanged(evt: Event): void {
            if (this._owner.relations.handling != null || this._owner.group!=null && this._owner.group._updating)
            {
                this._targetX = this._target.x;
                this._targetY = this._target.y;
                return;
            }
                    
            this._owner.relations.handling = this._target;
            
            var ox: number = this._owner.x;
            var oy: number = this._owner.y;
            var dx: number = this._target.x - this._targetX;
            var dy: number = this._target.y - this._targetY;
            var length: number = this._defs.length;
            for (var i: number = 0; i < length; i++) {
                var info: RelationDef = this._defs[i];
                this.applyOnXYChanged(info, dx, dy);
            }
            this._targetX = this._target.x;
            this._targetY = this._target.y;

            if (ox != this._owner.x || oy != this._owner.y) {
                ox = this._owner.x - ox;
                oy = this._owner.y - oy;

                if (this._owner.gearXY.controller != null)
                    this._owner.gearXY.updateFromRelations(ox, oy);

                if(this._owner.parent != null) {
                    var len: number = this._owner.parent._transitions.length;
                    if(len > 0) {
                        for(var i: number = 0;i < len;++i) {
                            this._owner.parent._transitions[i].updateFromRelations(this._owner.id,ox,oy);
                        }
                    }
                }
            }
            this._owner.relations.handling = null;
        }

        private __targetSizeChanged(evt: Event): void {
            if (this._owner.relations.handling != null)
                return;

            this._owner.relations.handling = this._target;
            
            var ox: number = this._owner.x;
            var oy: number = this._owner.y;
            var length: number = this._defs.length;
            for (var i: number = 0; i < length; i++) {
                var info: RelationDef = this._defs[i];
                this.applyOnSizeChanged(info);
            }
            this._targetWidth = this._target._rawWidth;
            this._targetHeight = this._target._rawHeight;

            if (ox != this._owner.x || oy != this._owner.y) {
                ox = this._owner.x - ox;
                oy = this._owner.y - oy;

                if (this._owner.gearXY.controller != null)
                    this._owner.gearXY.updateFromRelations(ox, oy);

                if(this._owner.parent != null) {
                    var len: number = this._owner.parent._transitions.length;
                    if(len > 0) {
                        for(var i: number = 0;i < len;++i) {
                            this._owner.parent._transitions[i].updateFromRelations(this._owner.id,ox,oy);
                        }
                    }
                }
            }
            this._owner.relations.handling = null;
        }

        private __targetSizeWillChange(evt: Event): void {
            this._owner.relations.sizeDirty = true;
        }
    }

    export class RelationDef {
        public affectBySelfSizeChanged: boolean;
        public percent: boolean;
        public type: number;

        public constructor() {
        }

        public copyFrom(source: RelationDef): void {
            this.affectBySelfSizeChanged = source.affectBySelfSizeChanged;
            this.percent = source.percent;
            this.type = source.type;
        }
    }
}