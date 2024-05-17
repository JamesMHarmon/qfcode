const BITS_PER_CHAR = 6;
const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export class Base64Reader {
    private static b64idxs = Array.from(B64_CHARS).reduce((map, char, index) => map.set(char, index), new Map());
    private base64: string;
    private charBits: number = 0;
    private bitIdx: number = 0;

    constructor(base64: string) {
        this.base64 = base64;
    }

    private readNextChar() {
        const charIndex = Math.floor(this.bitIdx / BITS_PER_CHAR);
        if (charIndex >= this.base64.length) {
            throw new Error("Unexpected end of base64 string");
        }

        const char = this.base64.charAt(charIndex);
        this.charBits = Base64Reader.b64idxs.get(char);
    }

    public read(numBits: number): number {
        let result = 0;
        let bitsRead = 0;
        while (bitsRead < numBits) {
            const remainingBitsInChar = BITS_PER_CHAR - (this.bitIdx % BITS_PER_CHAR);

            // Load the next character if we've read all the bits in the current character
            if (remainingBitsInChar === BITS_PER_CHAR) {
                this.readNextChar();
            }

            const numBitsToRead = Math.min(numBits - bitsRead, remainingBitsInChar);
            const readBits = (this.charBits >> (remainingBitsInChar - numBitsToRead)) & ((1 << numBitsToRead) - 1)
            result = (result << numBitsToRead) | readBits;

            this.bitIdx += numBitsToRead;
            bitsRead += numBitsToRead;
        }

        return result;
    }

    public readBool(): boolean {
        return this.read(1) === 1;
    }
}
