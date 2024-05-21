import { Base64Writer } from './base64Writer';
import { Base64Reader } from './base64Reader';

describe('Base64Writer and Base64Reader', () => {
    it('should write and read back the same data', () => {
        const writer = new Base64Writer();

        // Write some data with the writer
        writer.write(8, 123);
        writer.writeBool(true);
        writer.write(16, 45678);

        // Convert the data to Base64 and then back
        const base64 = writer.getBase64();
        const reader = new Base64Reader(base64);

        // Check if the original data is recovered
        expect(reader.read(8)).toEqual(123);
        expect(reader.readBool()).toEqual(true);
        expect(reader.read(16)).toEqual(45678);
    });

    it('should handle writing and reading back zero', () => {
        const writer = new Base64Writer();

        // Write zero with the writer
        writer.write(8, 0);

        // Convert the data to Base64 and then back
        const base64 = writer.getBase64();
        const reader = new Base64Reader(base64);

        // Check if the original data is recovered
        expect(reader.read(8)).toEqual(0);
    });

    it('should handle writing and reading back maximum values', () => {
        const writer = new Base64Writer();

        // Write maximum values with the writer
        writer.write(8, 255);
        writer.write(16, 65535);

        // Convert the data to Base64 and then back
        const base64 = writer.getBase64();
        const reader = new Base64Reader(base64);

        // Check if the original data is recovered
        expect(reader.read(8)).toEqual(255);
        expect(reader.read(16)).toEqual(65535);
    });

    it('should handle writing and reading back random values and sizes', () => {
        const writer = new Base64Writer();

        const values = Array.from({ length: 10 }, () => {
            const bits = Math.floor(Math.random() * 16) + 1;
            const value = Math.floor(Math.random() * Math.pow(2, bits));
            return { bits, value };
        });
        values.forEach(({ bits, value }) => writer.write(bits, value));

        const base64 = writer.getBase64();
        const reader = new Base64Reader(base64);

        values.forEach(({ bits, value }) => expect(reader.read(bits)).toEqual(value));
    });
});