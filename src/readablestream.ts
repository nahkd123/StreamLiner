import { DataType } from "./datatype.js";

export default abstract class ReadableStream {
    /**
     * Read a single byte from stream
     */
    abstract readByte(): number;

    /**
     * Read multiple bytes from stream. This can cause thread blocking, depends on context.
     * @param length The length of bytes array
     */
    readBytes(length: number): ArrayLike<number> {
        const out = new Uint8Array(length);
        for (let i = 0; i < length; i++) out[i] = this.readByte();
        return out;
    }

    //#region IntLE
    readUint32LE() {return DataType.Read.LittleEdian.uint32(this.readBytes(4))}
    readUint64LE() {return DataType.Read.LittleEdian.uint64(this.readBytes(8))}
    readInt32LE() {return DataType.Read.LittleEdian.int32(this.readBytes(4))}
    readInt64LE() {return DataType.Read.LittleEdian.int64(this.readBytes(8))}
    //#endregion
    //#region IntBE
    readUint32BE() {return DataType.Read.BigEdian.uint(this.readBytes(4))}
    readUint64BE() {return DataType.Read.BigEdian.uint(this.readBytes(8))}
    //#endregion
    //#region Floats
    readFloat32() {return DataType.Read.Float.f32(this.readBytes(4))}
    readFloat64() {return DataType.Read.Float.f64(this.readBytes(8))}
    //#endregion
    //#region Others
    readMCVarInt() {return DataType.Read.mcVarInt(this);}
    readMCString() {
        const strArr = new Array<string>(this.readMCVarInt());
        for (let i = 0; i < strArr.length; i++) strArr[i] = DataType.Read.Unicode.utf8(this);
        return strArr.join("");
    }
    //#endregion
}