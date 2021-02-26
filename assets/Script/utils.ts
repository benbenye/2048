import { _decorator, Vec3, Node, Component } from 'cc';
import RunTimeData from './data/RuntimeData';
const { ccclass, property } = _decorator;

const runtimeData = RunTimeData.instance();
// const dimensionX = runtimeData.dimensionX;
// const dimensionY = runtimeData.dimensionY;
// const maxPositionX = (dimensionX / 2 - 1 + 1/2) * runtimeData.chessWidth
// const maxPositionY = (dimensionY / 2 - 1 + 1/2) * runtimeData.chessWidth

@ccclass('Utils')
export default class Utils extends Component  {
    public static correctPosition (node: Node) {
        const position = node.getPosition();
        const x = Math.round(position.x / runtimeData.chessWidth)
        const y = Math.round(position.y / runtimeData.chessWidth)
        return new Vec3(x * runtimeData.chessWidth, y * runtimeData.chessWidth, 0);
    }
}

