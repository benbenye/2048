
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Fruit')
export default class Fruit extends Component {
    level = 1;

    onGround = false;

    isMerging = false;

    isStandby = false;

    start () {
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}