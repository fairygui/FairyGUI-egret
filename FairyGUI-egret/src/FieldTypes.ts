module fairygui {
    export enum ButtonMode { Common, Check, Radio };
    export enum AutoSizeType { None, Both, Height };
    export enum AlignType { Left, Center, Right };
    export enum VertAlignType { Top, Middle, Bottom };
    export enum FillType { None, Scale, ScaleFree };
    export enum ListLayoutType { SingleColumn, SingleRow, FlowHorizontal, FlowVertical };
    export enum ListSelectionMode { Single, Multiple, Multiple_SingleClick, None };
    export enum OverflowType { Visible, Hidden, Scroll, Scale, ScaleFree };
    export enum PackageItemType { Image, Swf, MovieClip, Sound, Component, Misc, Font, Atlas };
    export enum ProgressTitleType { Percent, ValueAndMax, Value, Max };
    export enum ScrollBarDisplayType { Default, Visible, Auto, Hidden };
    export enum ScrollType { Horizontal, Vertical, Both };
    export enum FlipType { None,  Horizontal, Vertical, Both };

    export enum RelationType {
        Left_Left = 0,
        Left_Center = 1,
        Left_Right = 2,
        Center_Center = 3,
        Right_Left = 4,
        Right_Center = 5,
        Right_Right = 6,

        Top_Top = 7,
        Top_Middle = 8,
        Top_Bottom = 9,
        Middle_Middle = 10,
        Bottom_Top = 11,
        Bottom_Middle = 12,
        Bottom_Bottom = 13,

        Width = 14,
        Height = 15,

        LeftExt_Left = 16,
        LeftExt_Right = 17,
        RightExt_Left = 18,
        RightExt_Right = 19,
        TopExt_Top = 20,
        TopExt_Bottom = 21,
        BottomExt_Top = 22,
        BottomExt_Bottom = 23,

        Size = 24
    };

    export function parseButtonMode(value: string): ButtonMode {
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

    export function parseAutoSizeType(value: string): AutoSizeType {
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

    export function parseAlignType(value: string): AlignType {
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

    export function getAlignTypeString(type: AlignType): string {
        return type == AlignType.Left ? egret.HorizontalAlign.LEFT :
            (type == AlignType.Center ? egret.HorizontalAlign.CENTER : egret.HorizontalAlign.RIGHT);
    }

    export function parseVertAlignType(value: string): VertAlignType {
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

    export function parseFillType(value: string): FillType {
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

    export function parseListLayoutType(value: string): ListLayoutType {
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

    export function parseListSelectionMode(value: string): ListSelectionMode {
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

    export function parseOverflowType(value: string): OverflowType {
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

    export function parsePackageItemType(value: string): PackageItemType {
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

    export function parseProgressTitleType(value: string): ProgressTitleType {
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

    export function parseScrollBarDisplayType(value: string): ScrollBarDisplayType {
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

    export function parseScrollType(value: string): ScrollType {
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
    

    export function parseFlipType(value: string): FlipType {
        switch(value) {
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

    var EaseMap: any =
        {
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
    export function ParseEaseType(value: string): Function {
        var ret: Function = EaseMap[value];
        if (!ret)
            ret = egret.Ease.quartOut;
        return ret;
    }
} 