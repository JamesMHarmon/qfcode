import { Coordinate, WallType, numericColumnToChar } from 'quoridor-engine';
import { Base64Reader } from './base64Reader';
import { Base64Writer } from './base64Writer';
import { LastMove, QFBoard, QFBoardState, QFRecordState, WallPlacement } from './qfboard';

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
    serialize() { }

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
    serialize() { }

    deserialize(reader: Base64Reader): QFBoardState {
        const playerPositions = [1, 2].map(() => new PlayerPositionSerde().deserialize(reader));

        const wallsByPlayer: WallPlacement[] = [];
        for (const [player, wallType] of [[1, WallType.Horizontal], [1, WallType.Vertical], [2, WallType.Horizontal], [2, WallType.Vertical]] as [number, WallType][]) {
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
    serialize() { }

    deserialize(reader: Base64Reader): QFRecordState { }
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
