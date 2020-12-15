import { DataType } from "./datatype.js";

export default abstract class WriteableStream {
    /**
     * Write a single byte to stream. If you override this class, you must override
     * WriteableStream#writeArray() method for better performance.
     * @param b The byte value, from 0 to 255
     */
    abstract writeByte(b: number);

    /**
     * Write an array of bytes
     * @param arr Array of bytes
     */
    writeArray(arr: ArrayLike<number>) {
        for (let i = 0; i < arr.length; i++) this.writeByte(arr[i]);
    }

    //#region IntLE
    writeUint8(v: number) {this.writeByte(v);}
    writeUint32LE(v: number) {this.writeArray(DataType.Write.LittleEdian.uint32(v));}
    writeUint64LE(v: bigint | number) {
        if (typeof v === "number") v = BigInt(v);
        this.writeArray(DataType.Write.LittleEdian.uint64(v));
    }
    writeInt32LE(v: number) {this.writeArray(DataType.Write.LittleEdian.int32(v));}
    writeInt64LE(v: bigint | number) {
        if (typeof v === "number") v = BigInt(v);
        this.writeArray(DataType.Write.LittleEdian.int64(v));
    }
    //#endregion
    //#region IntBE
    writeUint32BE(v: number) {this.writeArray(DataType.Write.BigEdian.uint32(v));}
    writeUint64BE(v: number) {this.writeArray(DataType.Write.BigEdian.uint64(v));}
    //writeInt32BE(v: number) {this.writeArray(DataType.Write.BigEdian.int32(v));}
    //writeInt64BE(v: number) {this.writeArray(DataType.Write.BigEdian.int64(v));}
    //#endregion
    //#region Floats
    writeFloat32(v: number) {this.writeArray(DataType.Write.Float.f32(v))}
    writeFloat64(v: number) {this.writeArray(DataType.Write.Float.f64(v))}
    //#endregion
    //#region Others
    writeMCVarInt(v: number) {this.writeArray(DataType.Write.mcVarInt(v))}
    writeMCString(str: string) {
        this.writeMCVarInt(str.length);
        for (let i = 0; i < str.length; i++) this.writeArray(DataType.Write.Unicode.utf8(str.charCodeAt(i)));
    }
    //#endregion

}