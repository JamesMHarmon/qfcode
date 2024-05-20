export class Base64Writer {
    public write(bits: number, val: number) {
    }

    public writeBool(val: boolean) {
        this.write(1, val ? 1 : 0);
    }

    public getBase64() {
    }
}