import { Coordinate, PlaceWall, WallType } from "quoridor-engine";

export interface QFBoard {
    boardState?: QFBoardState;
    recordState?: QFRecordState;
}

export interface QFBoardState {
    playerPositions: Array<Coordinate>;
    wallsByPlayer: Array<[number, Coordinate, WallType]>;
    lastMove: LastMove;
    moveNumber: number;
}

export interface QFRecordState {
    actions: Array<QFReplayMove>;
}

export type LastMove = {
    playerNum: number;
} & ({
    isWallPlacement: true;
    coordinate: Coordinate;
} | {
    isWallPlacement: false;
})

export type WallPlacement = [number, Coordinate, WallType];

export type QFReplayMove = QFReplayMoveDir | QFReplayWall;

export type QFReplayWall = PlaceWall;

export enum QFReplayMoveDir {
    Up = 0,
    UpRight = 1,
    Right = 2,
    DownRight = 3,
    Down = 4,
    DownLeft = 5,
    Left = 6,
    UpLeft = 7,
}
