import WriteableStream from "../writeablestream.js";
import ReadableMemoryStream from "./read.js";

export default class WriteableMemoryStream extends WriteableStream {
    arr: BlobPart[] = [];

    constructor() {
        super();
    }

    writeByte(b: number) {this.arr.push(new Uint8Array([b]));}
    writeArray(arr: ArrayLike<number>) {
        if (arr instanceof Uint8Array) this.arr.push(arr);
        else this.arr.push(new Uint8Array(arr));
    }

    toBlob() {return new Blob(this.arr);}
    toArrayBuffer() {return this.toBlob().arrayBuffer();}
    async toReadableStream() {return new ReadableMemoryStream(await this.toArrayBuffer())}
}