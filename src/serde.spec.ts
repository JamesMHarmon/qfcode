import { WallType, parseAction, parseCoordinate } from 'quoridor-engine';
import { serialize, deserialize } from './serde';
import { QFBoard, QFReplayMove, QFReplayMoveDir } from './qfboard';

describe('Serialization and Deserialization', () => {
    test('deserialize yzoAAIBQMBJSskqrh5dHVBA', () => {
        const board = deserialize('yzoAAIBQMBJSskqrh5dHVBA');
        expect(board).toEqual({
            boardState: {
                lastMove: {
                    isWallPlacement: false,
                    playerNum: 2
                },
                moveNumber: 5,
                playerPositions: [
                    parseCoordinate("e3"),
                    parseCoordinate("e7"),
                ],
                wallsByPlayer: []
            },
            recordState: {
                actions: [
                    QFReplayMoveDir.Up,
                    QFReplayMoveDir.Down,
                    parseAction("e3h"),
                    parseAction("e6h"),
                    parseAction("c3h"),
                    parseAction("c6h"),
                    parseAction("b5v"),
                    parseAction("f5v"),
                    parseAction("b3v"),
                    parseAction("f3v"),
                    QFReplayMoveDir.Up,
                    QFReplayMoveDir.Down
                ]
            }
        });
    });

    test('deserialize QEBAQ', () => {
        const board = deserialize('QEBAQ');
        expect(board).toEqual({
            recordState: {
                actions: [
                    QFReplayMoveDir.Up,
                    QFReplayMoveDir.Down,
                    QFReplayMoveDir.Up,
                    QFReplayMoveDir.Down
                ]
            }
        });
    });

    test('serialize QEBAQ', () => {
        const board: QFBoard = {
            recordState: {
                actions: [
                    QFReplayMoveDir.Up,
                    QFReplayMoveDir.Down,
                    QFReplayMoveDir.Up,
                    QFReplayMoveDir.Down
                ]
            }
        };

        const serialized = serialize(board);
        expect(serialized).toEqual('QEBAQ');
    });

    test('serialize lB8klDRh2KqwlZXYEg', () => {
        const board: QFBoard = {
            boardState: {
                lastMove: {
                    isWallPlacement: false,
                    playerNum: 2
                },
                moveNumber: 5,
                playerPositions: [
                    parseCoordinate("e3"),
                    parseCoordinate("e7"),
                ],
                wallsByPlayer: []
            },
            recordState: {
                actions: [
                    QFReplayMoveDir.Up,
                    QFReplayMoveDir.Down,
                    parseAction("e3h") as QFReplayMove,
                    parseAction("e6h") as QFReplayMove,
                    parseAction("c3h") as QFReplayMove,
                    parseAction("c6h") as QFReplayMove,
                    parseAction("b5v") as QFReplayMove,
                    parseAction("f5v") as QFReplayMove,
                    parseAction("b3v") as QFReplayMove,
                    parseAction("f3v") as QFReplayMove,
                    QFReplayMoveDir.Up,
                    QFReplayMoveDir.Down
                ]
            }
        };

        const serialized = serialize(board);
        expect(serialized).toEqual('yzoAAIBQMBJSskqrh5dHVBA');
    });

    test('deserialize lB8klDRh2KqwlZXYEg', () => {
        const board = deserialize('lB8klDRh2KqwlZXYEg');
        expect(board).toEqual({
            boardState: {
                lastMove: {
                    isWallPlacement: true,
                    coordinate: parseCoordinate('g7'),
                    playerNum: 1
                },
                moveNumber: 18,
                playerPositions: [
                    parseCoordinate("e5"),
                    parseCoordinate("e4"),
                ],
                wallsByPlayer: [
                    [1, parseCoordinate('c3'), WallType.Horizontal],
                    [1, parseCoordinate('e3'), WallType.Horizontal],
                    [1, parseCoordinate('b3'), WallType.Vertical],
                    [1, parseCoordinate('b5'), WallType.Vertical],
                    [1, parseCoordinate('g7'), WallType.Vertical],
                    [2, parseCoordinate('c6'), WallType.Horizontal],
                    [2, parseCoordinate('e6'), WallType.Horizontal],
                    [2, parseCoordinate('f3'), WallType.Vertical],
                    [2, parseCoordinate('f5'), WallType.Vertical],
                ]
            }
        });
    });

    test('serialize lB8klDRh2KqwlZXYEg', () => {
        const board: QFBoard = {
            boardState: {
                lastMove: {
                    isWallPlacement: true,
                    coordinate: parseCoordinate('g7'),
                    playerNum: 1
                },
                moveNumber: 18,
                playerPositions: [
                    parseCoordinate("e5"),
                    parseCoordinate("e4"),
                ],
                wallsByPlayer: [
                    [1, parseCoordinate('c3'), WallType.Horizontal],
                    [1, parseCoordinate('e3'), WallType.Horizontal],
                    [1, parseCoordinate('b3'), WallType.Vertical],
                    [1, parseCoordinate('b5'), WallType.Vertical],
                    [1, parseCoordinate('g7'), WallType.Vertical],
                    [2, parseCoordinate('c6'), WallType.Horizontal],
                    [2, parseCoordinate('e6'), WallType.Horizontal],
                    [2, parseCoordinate('f3'), WallType.Vertical],
                    [2, parseCoordinate('f5'), WallType.Vertical],
                ]
            }
        };

        const serialized = serialize(board);
        expect(serialized).toEqual('lB8klDRh2KqwlZXYEg');
    })

    test('serialize and deserialize should be inverses', () => {
        const board = deserialize('yzoAAIBQMBJSskqrh5dHVBA');
        const serialized = serialize(board);
        expect(serialized).toEqual('yzoAAIBQMBJSskqrh5dHVBA');
    });
});