import { Coordinate, WallType, columnNumericValue, numericColumnToChar } from 'quoridor-engine';
import { Base64Reader } from './base64Reader';
import { Base64Writer } from './base64Writer';
import { LastMove, QFBoard, QFBoardState, QFRecordState, QFReplayMove, QFReplayMoveDir, QFReplayWall, WallPlacement } from './qfboard';

export function deserialize(base64: string): QFBoard {
    const reader = new Base64Reader(base64);
    const deserializer = new QFBoardSerde();
    return deserializer.deserialize(reader);
}

interface Serde<T> {
    serialize(val: T, writer: Base64Writer): void;
    deserialize(reader: Base64Reader): T;
}

export class QFBoardSerde implements Serde<QFBoard> {
    serialize(val: QFBoard, writer: Base64Writer) {
        writer.writeBool(!!val.boardState);
        writer.writeBool(!!val.recordState);

        if (val.boardState) {
            new QFBoardStateSerde().serialize(val.boardState, writer);
        }

        if (val.recordState) {
            new QFRecordStateSerde().serialize(val.recordState, writer);
        }
    }

    deserialize(reader: Base64Reader): QFBoard {
        const hasBoardData = reader.readBool();
        const hasRecordData = reader.readBool();

        const boardState = hasBoardData ? new QFBoardStateSerde().deserialize(reader) : undefined;
        const recordState = hasRecordData ? new QFRecordStateSerde().deserialize(reader) : undefined;

        return {
            boardState,
            recordState,
        };
    }
}

export class QFBoardStateSerde implements Serde<QFBoardState> {
    private playersAndWallTypes = [[1, WallType.Horizontal], [1, WallType.Vertical], [2, WallType.Horizontal], [2, WallType.Vertical]] as [number, WallType][];

    serialize(val: QFBoardState, writer: Base64Writer) {
        val.playerPositions.forEach(playerPosition => new PlayerPositionSerde().serialize(playerPosition, writer));

        for (const [player, wallType] of this.playersAndWallTypes) {
            const wallSerializer = new WallSerde(player, wallType);
            const walls = val.wallsByPlayer.filter(wall => wall[0] === player && wall[2] === wallType);
            writer.write(4, walls.length);
            for (const wall of walls) {
                wallSerializer.serialize(wall, writer);
            }
        }

        new LastMoveSerde().serialize(val.lastMove, writer);
        writer.write(10, val.moveNumber);
    }

    deserialize(reader: Base64Reader): QFBoardState {
        const playerPositions = [1, 2].map(() => new PlayerPositionSerde().deserialize(reader));

        const wallsByPlayer: WallPlacement[] = [];
        for (const [player, wallType] of this.playersAndWallTypes) {
            const numWalls = reader.read(4);
            for (let i = 0; i < numWalls; i++) {
                wallsByPlayer.push(new WallSerde(player, wallType).deserialize(reader));
            }
        }

        const lastMove = new LastMoveSerde().deserialize(reader);

        const moveNumber = reader.read(10);

        return {
            playerPositions,
            wallsByPlayer,
            lastMove,
            moveNumber
        };
    }
}

export class QFRecordStateSerde implements Serde<QFRecordState> {
    serialize({ actions }: QFRecordState, writer: Base64Writer) {
        writer.write(10, actions.length);
        for (const action of actions) {
            if (Number.isInteger(action)) {
                new QFReplayMoveDirSerde().serialize(action as QFReplayMoveDir, writer);
            } else {
                new QFReplayWallSerde().serialize(action as QFReplayWall, writer);
            }
        }
    }

    deserialize(reader: Base64Reader): QFRecordState {
        const numActions = reader.read(10);
        const actions = Array.from({ length: numActions }).map<QFReplayMove>(() => {
            const isWall = reader.readBool();
            if (isWall) {
                return new QFReplayWallSerde().deserialize(reader);
            }

            return new QFReplayMoveDirSerde().deserialize(reader);
        });

        return { actions };
    }
}

export class QFReplayWallSerde implements Serde<QFReplayWall> {
    serialize(val: QFReplayWall, writer: Base64Writer): void {
        writer.write(1, val.wallType === WallType.Horizontal ? 0 : 1);
        new CoordinateSerde({ bits: 6 }).serialize(val.coordinate, writer);
    }

    deserialize(reader: Base64Reader): QFReplayWall {
        const wallType = reader.read(1) === 0 ? WallType.Horizontal : WallType.Vertical;
        const coordinate = new CoordinateSerde({ bits: 6 }).deserialize(reader);
        return { wallType, coordinate };
    }
}

export class QFReplayMoveDirSerde implements Serde<QFReplayMoveDir> {
    serialize(val: QFReplayMoveDir, writer: Base64Writer): void {
        writer.write(3, val);
    }

    deserialize(reader: Base64Reader): QFReplayMoveDir {
        return reader.read(3) as QFReplayMoveDir;
    }

}

export class WallSerde implements Serde<WallPlacement> {
    private coordinateSerde = new CoordinateSerde({ bits: 6 });

    constructor(private player: number, private wallType: WallType) { }

    serialize(val: WallPlacement, writer: Base64Writer): void {
        this.coordinateSerde.serialize(val[1], writer);
    }

    deserialize(reader: Base64Reader): WallPlacement {
        return [this.player, this.coordinateSerde.deserialize(reader), this.wallType];
    }
}

export class PlayerPositionSerde implements Serde<Coordinate> {
    private coordinateSerde = new CoordinateSerde({ bits: 7 });

    serialize(val: Coordinate, writer: Base64Writer): void {
        this.coordinateSerde.serialize(val, writer);
    }

    deserialize(reader: Base64Reader): Coordinate {
        return this.coordinateSerde.deserialize(reader);
    }
}

export class CoordinateSerde implements Serde<Coordinate> {
    private width = this.options.bits + 2;

    constructor(private options: { bits: number }) { }

    serialize(val: Coordinate, writer: Base64Writer): void {
        const coordIdx = (val.row - 1) * this.width + columnNumericValue(val.column) - 1;
        writer.write(this.options.bits, coordIdx);
    }

    deserialize(reader: Base64Reader): Coordinate {
        const colIdx = reader.read(this.options.bits);
        return this.coordinateFromIndex(colIdx);
    }

    coordinateFromIndex(index: number): Coordinate {
        return {
            row: Math.floor(index / this.width) + 1,
            column: numericColumnToChar(index % this.width + 1),
        };
    }
}

export class LastMoveSerde implements Serde<LastMove> {
    serialize(val: LastMove, writer: Base64Writer): void {
        writer.write(1, val.playerNum - 1);
        writer.writeBool(val.isWallPlacement);

        if (val.isWallPlacement) {
            new CoordinateSerde({ bits: 6 }).serialize(val.coordinate, writer);
        }
    }

    deserialize(reader: Base64Reader): LastMove {
        const playerNum = reader.read(1) + 1;
        const isWallPlacement = reader.readBool();

        if (isWallPlacement) {
            return {
                playerNum,
                isWallPlacement: true,
                coordinate: new CoordinateSerde({ bits: 6 }).deserialize(reader),
            }
        }

        return {
            playerNum,
            isWallPlacement
        };
    }
}
