import { _decorator, Component, Node, Label } from 'cc';
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
    public gravity = 100;
    public speed = 30;
}
