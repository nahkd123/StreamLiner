import ReadableStream from "./readablestream.js";

export namespace DataType {
    export namespace Write {
        export namespace LittleEdian {
            export function uint32(v: number) {return new Uint8Array(new Uint32Array([v]).buffer)}
            export function uint64(v: bigint) {return new Uint8Array(new BigUint64Array([v]).buffer);}
            export function int32(v: number) {return new Uint8Array(new Int32Array([v]).buffer)}
            export function int64(v: bigint) {return new Uint8Array(new BigInt64Array([v]).buffer)}
        }
        export namespace BigEdian {
            function createBigEdianInteger(v: number, length: number) {
                const arr = new Uint8Array(length);
                for (let i = 0; i < length; i++) {
                    arr[i] = (v & (0xFF << (8 * i))) >> (8 * i);
                }
                return arr;
            }
            export function uint32(v: number) {return createBigEdianInteger(v, 4);}
            export function uint64(v: number) {return createBigEdianInteger(v, 4);}
        }
        export namespace Float {
            export function f32(v: number) {return new Uint8Array(new Float32Array([v]).buffer)}
            export function f64(v: number) {return new Uint8Array(new Float64Array([v]).buffer)}
        }
        export namespace Unicode {
            export function utf8(char: number) {
                if (char <= 0x7F) return new Uint8Array([char]);
                else if (char <= 0x7FF) return new Uint8Array([
                    0b110_00000 | (char & 0b11111_000000),
                    0b10_000000 | (char & 0b00000_111111)
                ]);
                else if (char <= 0xFFFF) return new Uint8Array([
                    0b1110_0000 | (char & 0b1111_000000_000000),
                    0b10_000000 | (char & 0b0000_111111_000000),
                    0b10_000000 | (char & 0b0000_000000_111111)
                ]); else return new Uint8Array([
                    0b11110_000 | (char & 0b111_000000_000000_000000),
                    0b10_000000 | (char & 0b000_111111_000000_000000),
                    0b10_000000 | (char & 0b000_000000_111111_000000),
                    0b10_000000 | (char & 0b000_000000_000000_111111)
                ]);
            }
        }

        /**
         * Encode number to Minecraft VarInt.
         * @see https://wiki.vg/Protocol#Packet_format
         */
        export function mcVarInt(v: number) {
            let values: number[] = [];
            let temp = 0;
            do {
                temp = (v & 0x7F);
                v >>= 7;
                if (v !== 0) temp |= 0x80;
                values.push(temp);
            } while (v !== 0)
            return values;
        }
    }
    export namespace Read {
        export namespace LittleEdian {
            export function uint32(v: ArrayLike<number>) {new Uint32Array(new Uint8Array(v).buffer)[0]}
            export function uint64(v: ArrayLike<number>) {new BigUint64Array(new Uint8Array(v).buffer)[0]}
            export function int32(v: ArrayLike<number>) {new Int32Array(new Uint8Array(v).buffer)[0]}
            export function int64(v: ArrayLike<number>) {new BigInt64Array(new Uint8Array(v).buffer)[0]}
        }
        export namespace BigEdian {
            function readBigEdianInteger(arr: ArrayLike<number>) {
                let result = 0;
                for (let i = 0; i < arr.length; i++) result += arr[i] << ((arr.length - i - 1) * 8);
                return result;
            }
            export function uint(v: ArrayLike<number>) {return readBigEdianInteger(v);}
        }
        export namespace Float {
            export function f32(arr: ArrayLike<number>) {return new Float32Array(new Uint8Array(arr).buffer)[0]}
            export function f64(arr: ArrayLike<number>) {return new Float64Array(new Uint8Array(arr).buffer)[0]}
        }
        export namespace Unicode {
            export function utf8(stream: ReadableStream) {
                const firstByte = stream.readByte();
                let nextBytesToRead = 0;
                let code = 0;

                if        ((firstByte & 0b110_00000) === 0b110_00000) {
                    code = firstByte &  0b000_11111;
                    nextBytesToRead = 1;
                } else if ((firstByte & 0b1110_0000) === 0b1110_0000) {
                    code = firstByte &  0b0000_1111;
                    nextBytesToRead = 2;
                } else if ((firstByte & 0b11110_000) === 0b11110_000) {
                    code = firstByte &  0b00000_111;
                    nextBytesToRead = 3;
                } else return String.fromCharCode(firstByte);

                while (nextBytesToRead > 0) {
                    const nextByte = stream.readByte();
                    if ((nextByte & 0b10_000000) === 0b10_000000) {
                        code <<= 6;
                        code += nextByte & 0b00_111111;
                    } else return String.fromCharCode(code, nextByte);
                }
                return String.fromCharCode(code);
            }
        }

        export function mcVarInt(stream: ReadableStream) {
            let result = 0, read: number, shift = 0;
            do {
                read = stream.readByte();
                result |= (read & 0x7F) << (shift * 7);
                shift++;
            } while ((read & 0x80) !== 0);
            return result;
        }
    }
}