module fgui {

    export class ByteBuffer extends egret.ByteArray {
        public stringTable: Array<string> = null;
        public version: number = 0;

        public constructor(buffer?: ArrayBuffer | Uint8Array, bufferExtSize?: number) {
            super(buffer, bufferExtSize);
        }

        public skip(count: number): void {
            this.position += count;
        }

        public readBool(): boolean {
            return this.readByte() == 1;
        }

        public readS(): string {
            var index: number = this.readUnsignedShort();
            if (index == 65534) //null
                return null;
            else if (index == 65533)
                return ""
            else
                return this.stringTable[index];
        }

        public readSArray(cnt: number): Array<string> {
            var ret: Array<string> = new Array<string>(cnt);
            for (var i: number = 0; i < cnt; i++)
                ret[i] = this.readS();

            return ret;
        }

        public writeS(value: string): void {
            var index: number = this.readUnsignedShort();
            if (index != 65534 && index != 65533)
                this.stringTable[index] = value;
        }

        public readColor(hasAlpha: boolean = false): number {
            var r: number = this.readUnsignedByte();
            var g: number = this.readUnsignedByte();
            var b: number = this.readUnsignedByte();
            var a: number = this.readUnsignedByte();

            return (hasAlpha ? (a << 24) : 0) + (r << 16) + (g << 8) + b;
        }

        public readChar(): string {
            var i: number = this.readUnsignedShort();
            return String.fromCharCode(i);
        }

        public readBuffer(): ByteBuffer {
            var count: number = this.readUnsignedInt();
            var ba: ByteBuffer = new ByteBuffer(new Uint8Array(this.buffer, this.position, count));
            ba.stringTable = this.stringTable;
            ba.version = this.version;
            this.position += count;
            return ba;
        }

        public seek(indexTablePos: number, blockIndex: number): boolean {
            var tmp: number = this.position;
            this.position = indexTablePos;
            var segCount: number = this.readByte();
            if (blockIndex < segCount) {
                var useShort: boolean = this.readByte() == 1;
                var newPos: number;
                if (useShort) {
                    this.position += 2 * blockIndex;
                    newPos = this.readUnsignedShort();
                }
                else {
                    this.position += 4 * blockIndex;
                    newPos = this.readUnsignedInt();
                }

                if (newPos > 0) {
                    this.position = indexTablePos + newPos;
                    return true;
                }
                else {
                    this.position = tmp;
                    return false;
                }
            }
            else {
                this.position = tmp;
                return false;
            }
        }
    }
}