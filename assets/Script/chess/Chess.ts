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
    isStatic: boolean = false;

}

