
import { _decorator, Component, Node, find, SystemEvent, ITriggerEvent, EventMouse, Sprite, resources, Contact2DType, RigidBody2D, ERigidBody2DType, CircleCollider2D, Vec3, UITransform, Vec2, Camera, View, tween } from 'cc';
const { ccclass, property } = _decorator;
import Fruit from './Fruit';
import LoadPrefabReturnNode from '../util/loadPrefabReturnNode';
import Constants from '../data/Constants';
import { RigidBody } from 'cc';

@ccclass('DaxiguaManager')
export class DaxiguaManager extends Component {
    gameState = Constants.DaxiguaGameState.IDLE;
    oneFruitNode: Node | null = null;
    oneFruitNodePosition: Vec2 = new Vec2(0, 0)

    // @property
    // serializableDummy = 0;
    onLoad() {
        const root = find('Canvas');

        root.on(SystemEvent.EventType.MOUSE_DOWN, this.flagClick, this);
        root.on(SystemEvent.EventType.MOUSE_UP, this.finalClick, this);
        root.on(SystemEvent.EventType.TOUCH_START, this.finalClick, this);
        // root.on(SystemEvent.EventType.TOUCH_MOVE, this.finalClick, this);
        // root.on(SystemEvent.EventType.TOUCH_CANCEL, this.finalClick, this);

    }

    start () {
        if (this.gameState === Constants.DaxiguaGameState.IDLE) {
            this.createFruit(1);
        }
    }

    // update (deltaTime: number) {
    // }

    flagClick() {
        console.log('down')
    }

    finalClick(e: EventMouse) {
        console.log('up')
        if (!this.oneFruitNode || this.gameState === Constants.DaxiguaGameState.DROPPING) return;
        this.gameState = Constants.DaxiguaGameState.DROPPING;
        const bodyCom = this.oneFruitNode.getComponent(RigidBody2D)
        const camera = find('Canvas/Camera')?.getComponent(Camera)
        if (!bodyCom) return;
        this.oneFruitNodePosition =  e.getLocation();
        const aa = camera?.screenToWorld(new Vec3(this.oneFruitNodePosition.x, this.oneFruitNodePosition.y, 0))
        tween(this.oneFruitNode).to(0.2, {
            worldPosition: new Vec3(aa?.x, this.oneFruitNode.getWorldPosition().y, 0)
        }).call(() => {
            bodyCom.type = ERigidBody2DType.Dynamic;
            this.scheduleOnce(() => {
                this.createFruit(1);
                this.gameState = Constants.DaxiguaGameState.IDLE;
            }, 0.2)
        }).start();
    }
    beginContact(selfCollider: CircleCollider2D, otherCollider: CircleCollider2D, contact) {
        const selfFruit = selfCollider.node;
        const otherFruit = otherCollider.node;
        if (selfFruit.name === otherFruit.name) {
            const selfFruitCom = selfFruit.getComponent(Fruit)
            const otherFruitCom = otherFruit.getComponent(Fruit)
            if (!selfFruitCom || !otherFruitCom) return
            if (selfFruitCom.isMerging && otherFruitCom.isMerging) return;
            selfFruitCom.isMerging = otherFruitCom.isMerging = true;
            contact.enabled = true;
            this.scheduleOnce(() => {
                const bodyCom = selfFruit.getComponent(RigidBody2D)
                if (!bodyCom) return;
                bodyCom.enabledContactListener = false;
                tween(selfFruit).to(0.1, {
                    position: otherFruit.position
                }).call(() => {
                    selfFruit.getComponent(CircleCollider2D).group = 0;
                    otherFruit.getComponent(CircleCollider2D).group = 0;
                    console.log(otherFruit.getWorldPosition())
                    this.createFruit(+selfFruit.name + 1, otherFruit.getPosition());
                    otherFruit.destroy();
                    selfFruit.destroy();
                }).start();
            })
        }
    }
    setNode(node: Node, position: Vec3) {
        const fruitNode = find('Canvas/fruitNode');
        if (position) {
            console.log(position)
            node.setPosition(position)
            node.parent = fruitNode;
            const bodyCom = node.getComponent(RigidBody2D)
            const colliderCom = node.getComponent(CircleCollider2D)
            if (!bodyCom) return;
            if (!colliderCom) return;
            colliderCom.on(Contact2DType.BEGIN_CONTACT, this.beginContact, this);
            bodyCom.type = ERigidBody2DType.Dynamic;
            // bodyCom.enabledContactListener = false;
        } else {
            const UI = fruitNode?.getComponent(UITransform)
            if (!UI) {
                return
            }
            const y = UI.contentSize.height / 2 - 200
            node.setPosition(new Vec3(0, y, 0))
            node.parent = fruitNode;
            this.oneFruitNode = node;
            const colliderCom = this.oneFruitNode.getComponent(CircleCollider2D)
            if (!colliderCom) return;
            colliderCom.on(Contact2DType.BEGIN_CONTACT, this.beginContact, this);
        }
        return node;
    }
    createFruit(n: number, position?: Vec3) {
        // position 世界坐标
        return LoadPrefabReturnNode.getNode(`daxigua/${n}`).then( node => {
            return this.setNode(node, position);
        })
    }
}