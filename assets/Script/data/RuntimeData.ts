import { _decorator, Component, Node, Label } from 'cc';
import Constants from './Constants';
const { ccclass, property } = _decorator;

@ccclass('RunTimeData')
export default class RunTimeData {
    static _instance: RunTimeData | null = null;

    public static instance() {
        if (!this._instance) {
            this._instance = new RunTimeData();
        }
        return this._instance;
    }

    public dimensionX = 4;
    public dimensionY = 4;
    public chessWidth = 217.5;
    // public chessMargin = 30;
    public gravity = 2000;
    public speed = 30;
    public beforeCollision = 0;
    public collisionCount = 0;
    public gameState = Constants.GameState.IDLE;
    public isAutoMerge = false;
    public score = 0;
}
