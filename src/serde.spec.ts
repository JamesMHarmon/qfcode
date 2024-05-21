import { serialize, deserialize } from './serde';

describe('Serialization and Deserialization', () => {
    test('deserialize yzoAAIBQMBJSskqrh5dHVBA', () => {
        const board = deserialize('yzoAAIBQMBJSskqrh5dHVBA');
        expect(board).toEqual({});
    });

    test('serialize and deserialize should be inverses', () => {
        const board = deserialize('yzoAAIBQMBJSskqrh5dHVBA');
        const serialized = serialize(board);
        expect(serialized).toEqual('yzoAAIBQMBJSskqrh5dHVBA');
    });
});