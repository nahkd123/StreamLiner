import WriteableStream from "../writeablestream.js";

export default class WriteableBlobStream extends WriteableStream {
    arr: BlobPart[] = [];

    constructor() {
        super();
    }

    writeByte(b: number) {this.arr.push(new Uint8Array([b]));}
    writeArray(arr: ArrayLike<number>) {
        if (arr instanceof Uint8Array) this.arr.push(arr);
        else this.arr.push(new Uint8Array(arr));
    }

    finish() {return new Blob(this.arr);}
}