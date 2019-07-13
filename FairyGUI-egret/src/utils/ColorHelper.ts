module fairygui {

    export enum ColorEnum {
		Black = 0x000000,
		White= 0xFFFFFF,
		HalfBlack= 0x999999,
		RegionBlack= 0x666666,
		Grey=0x444444,
	}

    let ColorMatrixFilterPool = {}
    /**
     * 修改GObject颜色，color中的字母要使用大写
     */
    export function SetObjectColor(image: egret.DisplayObject, color: number) {
        if (ColorMatrixFilterPool[color] != null) {
            image.filters = [ColorMatrixFilterPool[color]]
            return
        }
        // 将16进制颜色分割成rgb值
        let spliceColor = (color) => {
            let result = { r: -1, g: -1, b: -1 };
            result.r = color >> 16
            result.g = color >> 8 & 0xff
            result.b = color & 0xff
            return result;
        }
        let result = spliceColor(color);
        let colorMatrix = [
            1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, 1, 0
        ];
        colorMatrix[0] = result.r / 255;
        colorMatrix[6] = result.g / 255;
        colorMatrix[12] = result.b / 255;
        let colorFilter = new egret.ColorMatrixFilter(colorMatrix);

        image.filters = [colorFilter];
        ColorMatrixFilterPool[color] = colorFilter
    }

}