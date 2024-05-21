import { B64_CHARS, BITS_PER_CHAR } from "./constants";

export class Base64Writer {
    private chars: string[] = [];
    private nextChar: number = 0;
    private position: number = 0;

    public write(bits: number, val: number) {
        while (bits > 0) {
            const remainingBitsInChar = BITS_PER_CHAR - (this.position % BITS_PER_CHAR);
            const numBitsToWrite = Math.min(remainingBitsInChar, bits);
            const bitsToWrite = val >> (bits - numBitsToWrite);
            this.nextChar |= (bitsToWrite << (remainingBitsInChar - numBitsToWrite));
            this.position += numBitsToWrite;
            bits -= numBitsToWrite;
            val &= (1 << bits) - 1;

            if (this.position % BITS_PER_CHAR === 0) {
                this.chars.push(B64_CHARS.charAt(this.nextChar));
                this.nextChar = 0;
            }
        }
    }

    public writeBool(val: boolean) {
        this.write(1, val ? 1 : 0);
    }

    public getBase64() {
        return this.chars.join("") + (this.position % BITS_PER_CHAR === 0 ? "" : B64_CHARS.charAt(this.nextChar));
    }
}