import ReadableStream from "../readablestream.js";

export default class ReadableMemoryStream extends ReadableStream {
    arr: Uint8Array;
    index = 0;

    constructor(data: ArrayBuffer) {
        super();
        this.arr = new Uint8Array(data);
    }

    readByte() {return this.arr[this.index++];}
    readBytes(length: number) {
        const out = this.arr.subarray(this.index, this.index + length);
        this.index += length;
        return out;
    }
}