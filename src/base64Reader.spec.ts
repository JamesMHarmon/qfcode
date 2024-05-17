import { Base64Reader } from './base64Reader';

describe('Base64Reader', () => {
    it('should read bits correctly', () => {
        const reader = new Base64Reader('A'); // 'A' is '000000' in base64
        expect(reader.read(1)).toBe(0);
        expect(reader.read(1)).toBe(0);
        expect(reader.read(1)).toBe(0);
        expect(reader.read(1)).toBe(0);
        expect(reader.read(1)).toBe(0);
        expect(reader.read(1)).toBe(0);
    });

    it('should read multiple bits at once correctly', () => {
        const reader = new Base64Reader('B'); // 'B' is '000001' in base64
        expect(reader.read(6)).toBe(1);
    });

    it('should read across characters correctly', () => {
        const reader = new Base64Reader('BA'); // 'BA' is '000001000000' in base64
        expect(reader.read(7)).toBe(2);
        expect(reader.read(5)).toBe(0);
    });

    it('should throw an error when trying to read past the end of the string', () => {
        const reader = new Base64Reader('A');
        expect(() => reader.read(7)).toThrow('Unexpected end of base64 string');
    });

    it('should read izoQBJFASNACQ correctly', () => {
        const reader = new Base64Reader('izoQBJFASNACQ');
        expect(reader.readBool()).toBe(true);
        expect(reader.readBool()).toBe(false);
        expect(reader.read(7)).toBe(parseInt('0010110', 2));
        expect(reader.read(7)).toBe(parseInt('0111010', 2));
        expect(reader.read(4)).toBe(parseInt('0001', 2));
        expect(reader.read(6)).toBe(parseInt('0000', 2));
        expect(reader.read(4)).toBe(parseInt('0001', 2));
        expect(reader.read(6)).toBe(parseInt('1001', 2));
        expect(reader.read(4)).toBe(parseInt('0001', 2));
        expect(reader.read(6)).toBe(parseInt('10000', 2));
        expect(reader.read(4)).toBe(parseInt('0001', 2));
        expect(reader.read(6)).toBe(parseInt('1000', 2));
    });
});