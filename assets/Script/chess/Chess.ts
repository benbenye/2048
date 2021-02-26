import { _decorator, Component, Vec3, BoxCollider, BoxCollider2D, ITriggerEvent, RigidBody2D, Collider2D, Node, Vec2, utils, PhysicsSystem } from 'cc';
import Constants from '../data/Constants';
import { CustomEventListener } from '../data/CustumerLisenter';
import RunTimeData from '../data/RuntimeData';
const { ccclass, property } = _decorator;
const runtimeData = RunTimeData.instance();
const dimensionX = runtimeData.dimensionX;
const dimensionY = runtimeData.dimensionY;
const maxPositionX = (dimensionX / 2 - 1 + 1/2) * runtimeData.chessWidth
const maxPositionY = (dimensionY / 2 - 1 + 1/2) * runtimeData.chessWidth

@ccclass
export default class Chess extends Component {

    @property
    cooX: number = 0;
    @property
    cooY: number = 0;
    @property
    num: number = 0;
    @property
    bgColor: string = '';
    @property
    fontColor: string = '';
    @property
    fontSize: number = 50;
    speedX: number = 0;
    speedY: number = 0;
    speed: Vec3 = new Vec3(0, 0, 0)
    newMerged: boolean = false; // 是否新合成的
    isNew: boolean = false; // 是否新生成的
    start () {
        // box.on('onTriggerStay', this.cc, this)
        // box.on('onTriggerExit', this.bb, this)
    }
    onLoad() {
        // CustomEventListener.on(Constants.EventName.CORRECT_POSITION, this.correctPosition, this);
    }

    update (dt) {
        // this.node.setPosition(this.node.position.add(this.speed))
        // if (this.speed.x === this.speed.y) {
        //     this.node.setPosition(this.correctPosition(this.node))
        // }
        // if ()
    }
    correctPosition (node: Node) {
        const position = node.getPosition();
        const x = Math.round(position.x / runtimeData.chessWidth)
        const y = Math.round(position.y / runtimeData.chessWidth)
        return new Vec3(x * runtimeData.chessWidth, y * runtimeData.chessWidth, 0);
    }
    public static correctPosition (node: Node) {
        const position = node.getPosition();
        const x = Math.round(position.x / runtimeData.chessWidth)
        const y = Math.round(position.y / runtimeData.chessWidth)
        return new Vec3(x * runtimeData.chessWidth, y * runtimeData.chessWidth, 0);
    }

    onBeginContact() {console.log(1)}
    onCollisionEnter() {console.log(3)}
}

