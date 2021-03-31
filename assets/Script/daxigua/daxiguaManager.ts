
import { _decorator, Component, Node, find, SystemEvent, EventMouse, Contact2DType, RigidBody2D, ERigidBody2DType, CircleCollider2D, Vec3, UITransform, Vec2, Camera,  tween, Label, Sprite, macro, ParticleSystem2D, Animation } from 'cc';
const { ccclass, property } = _decorator;
import _ from '../lodash';
import Fruit from './Fruit';
import LoadPrefabReturnNode from '../util/loadPrefabReturnNode';
import Constants from '../data/Constants';
import RunTimeData from '../data/RuntimeData';

@ccclass('DaxiguaManager')
export class DaxiguaManager extends Component {
    gameState = Constants.DaxiguaGameState.IDLE;
    fruitNode: Node = new Node;
    oneFruitNode: Node | null = new Node();
    oneFruitNodePosition: Vec2 = new Vec2(0, 0)
    scoreLabel: Label = new Label();
    count: number = 0;
    warningLine: Node = new Node();
    warningPosition: number = 0;
    gameOverUI: Node = new Node();
    touchArea: Node = new Node();
    camera: Camera = new Camera();

    onLoad() {
        this.scoreLabel = find('Canvas/Score').getComponent(Label);
        this.warningLine = find('Canvas/WarningLine');
        this.gameOverUI = find('Canvas/GameOver');
        this.touchArea = find('Canvas/bg');
        this.camera = find('Canvas/Camera').getComponent(Camera);
        this.fruitNode = find('Canvas/fruitNode');
    }

    start () {
        if (this.gameState === Constants.DaxiguaGameState.IDLE) {
            this.touchArea.on(SystemEvent.EventType.TOUCH_START, this.finalClick, this, true);
            this.createFruit(1).then((node: Node) => this.oneFruitNode = node);
            this.count ++;
            RunTimeData.instance().score = 0;
            this.scoreLabel.string = `score: ${RunTimeData.instance().score}`;
        }
    }

    update (deltaTime: number) {
    }

    flagClick() {
        console.log('down')
    }

    finalClick(e: EventMouse) {
        if (!this.oneFruitNode || this.gameState === Constants.DaxiguaGameState.DROPPING) return;
        const bodyCom = this.oneFruitNode.getComponent(RigidBody2D)
        const fruitCom = this.oneFruitNode.getComponent(Fruit)
        if (!bodyCom || !fruitCom) return;
        this.gameState = Constants.DaxiguaGameState.DROPPING;
        this.oneFruitNodePosition =  e.getLocation();
        const aa = this.camera.screenToWorld(new Vec3(this.oneFruitNodePosition.x, this.oneFruitNodePosition.y, 0))
        tween(this.oneFruitNode).to(0.2, {
            worldPosition: new Vec3(aa?.x, this.oneFruitNode.getWorldPosition().y, 0)
        }).call(() => {
            const colliderCom = this.oneFruitNode.getComponent(CircleCollider2D);
            if (!colliderCom) return;
            colliderCom.radius = this.oneFruitNode.height / 2;
            colliderCom.apply();
            bodyCom.type = ERigidBody2DType.Dynamic;
            this.oneFruitNode = null;
            this.scheduleOnce(() => {
                if (this.gameState === Constants.DaxiguaGameState.GAME_OVER) {
                    if (this.oneFruitNode) {
                        this.oneFruitNode.destroy();
                    }
                    return;
                }
                fruitCom.isStandby = false;
                if (this.count < 3) {
                    this.createFruit(this.count).then(node => {
                        this.oneFruitNode = node
                        this.gameState = Constants.DaxiguaGameState.IDLE;
                    });
                } else {
                    this.createFruit(Math.floor(Math.random() * 3) + 1).then(node => {
                        this.oneFruitNode = node
                        this.gameState = Constants.DaxiguaGameState.IDLE;
                    });
                }
                this.count++;
            }, 0.5)
        }).start();
    }
    beginContact(selfCollider: CircleCollider2D, otherCollider: CircleCollider2D, contact) {
        let selfFruit = selfCollider.node;
        let otherFruit = otherCollider.node;
        this.findHighestFruit()
        if (selfFruit.name === otherFruit.name) {
            const selfFruitCom = selfFruit.getComponent(Fruit)
            const otherFruitCom = otherFruit.getComponent(Fruit)
            if (!selfFruitCom || !otherFruitCom) return
            if (selfFruitCom.isMerging || otherFruitCom.isMerging) return;
            selfFruitCom.isMerging = otherFruitCom.isMerging = true;
            contact.enabled = true;
            this.scheduleOnce(() => {
                const bodyCom = selfFruit.getComponent(RigidBody2D)
                const otherBodyCom = otherFruit.getComponent(RigidBody2D)
                if (!bodyCom || !otherBodyCom) return;
                otherBodyCom.enabledContactListener = false;
                bodyCom.enabledContactListener = false;
                bodyCom.type = ERigidBody2DType.Static;
                otherBodyCom.type = ERigidBody2DType.Static;
                let _tween = null;
                if (selfFruit.position.y > otherFruit.position.y) {
                    _tween = tween(selfFruit).to(0.15, {
                        position: otherFruit.position
                    }, { easing: 'quadIn'})
                } else {
                    _tween = tween(otherFruit).to(0.15, {
                        position: selfFruit.position
                    }, { easing: 'quadIn'})
                }
                _tween.call(() => {
                    this.createFruit(+selfFruit.name + 1, otherFruit.getPosition());
                    this.createJuice(otherFruit.getPosition());
                    otherFruit.active = false;
                    selfFruit.active = false;
                    otherFruit.destroy();
                    selfFruit.destroy();
                    RunTimeData.instance().score += +selfFruit.name*2;
                    this.scoreLabel.string = `score: ${RunTimeData.instance().score}`;
                    this.findHighestFruit()
                }).start();
            })
        }
    }
    setNode(node: Node, position: Vec3): Node {
        if (position.x === 0 && position.y === 0 && position.z === 0) {
            const UI = this.fruitNode?.getComponent(UITransform)
            if (!UI) {
                return new Node;
            }
            const y = UI.contentSize.height / 2 - 200
            node.setPosition(new Vec3(0, y, 0))
            node.setScale(new Vec3(0, 0, 0));
            node.parent = this.fruitNode;
            const colliderCom = node.getComponent(CircleCollider2D)
            const bodyCom = node.getComponent(RigidBody2D)
            const fruitCom = node.getComponent(Fruit)
            if (!colliderCom || !bodyCom || !fruitCom) return new Node;
            fruitCom.isStandby = true;
            bodyCom.linearDamping = 6;
            colliderCom.friction = 16;
            colliderCom.radius = 0;
            colliderCom.apply();
            tween(node).to(.3, {
                scale: new Vec3(2, 2, 2)
            }, {easing: 'backOut'}).call(() => {
                colliderCom.on(Contact2DType.BEGIN_CONTACT, this.beginContact, this);
            }).start();
        } else {
            node.setPosition(position)
            node.parent = this.fruitNode;
            node.setScale(new Vec3(0, 0, 0));
            const bodyCom = node.getComponent(RigidBody2D)
            const colliderCom = node.getComponent(CircleCollider2D)
            if (!bodyCom) return new Node;
            if (!colliderCom) return new Node;

            bodyCom.type = ERigidBody2DType.Kinematic;
            bodyCom.linearVelocity = new Vec2(0, 5)
            bodyCom.linearDamping = 6;
            colliderCom.friction = 16;
            colliderCom.apply();
            tween(node).to(.3, {
                scale: new Vec3(2, 2, 2)
            }, {easing: 'backOut'}).call(() => {
                colliderCom.on(Contact2DType.BEGIN_CONTACT, this.beginContact, this);
                bodyCom.type = ERigidBody2DType.Dynamic;
            }).start();
        }
        return node;
    }
    createFruit(n: number, position: Vec3 = new Vec3(0, 0, 0)): Promise<Node> {
        // position 世界坐标
        return LoadPrefabReturnNode.getNode(`daxigua/${n}`).then( (node: Node) => {
            return this.setNode(node, position);
        })
    }

    createJuice(position: Vec3) {
        return LoadPrefabReturnNode.getNode(`daxigua/juice`).then((node: Node) => {
            const effect = find('Canvas/Effect');
            node.setPosition(position)
            node.parent = effect;
            const guozhi = node.getChildByName('guozhi')
            const guoli = node.getChildByName('guoli')
            const shui = node.getChildByName('shui')
            console.log(shui, guozhi, guoli) 
            guozhi.getComponent(ParticleSystem2D).resetSystem();
            guoli.getComponent(ParticleSystem2D).resetSystem();
            shui.getComponent(Animation).play();
        });
    }

    findHighestFruit() {
        const allFruit = this.fruitNode.children;
        const withoutStandby = allFruit.filter(node => {
            return !node.getComponent(Fruit).isStandby
        })
        const sorted = _.sortBy(withoutStandby, (o) => 
            o.worldPosition.y
        )
        if (!sorted.length) return;
        const highestPosition = _.last(sorted).worldPosition.y + _.last(sorted).height
        this.warningPosition = this.warningLine.worldPosition.y - this.warningLine.height / 2;
        if (this.warningPosition - highestPosition < 1400) {
            if (this.warningPosition - highestPosition < 1100) {
                this.gameOver();
            }
            if (this.warningLine.scale.y) return;
            this.warningLine.setScale(new Vec3(1, 1, 1));
            const interval = 0.1
            const delay = 0;
            let count = 1;
            this.schedule(() => {
                this.warningLine.getComponent(Sprite).color.a = count % 2 ? 100 : 255;
                count++
            }, interval, macro.REPEAT_FOREVER, delay);
            return
        }
        this.warningLine.setScale(new Vec3(1, 0, 1));
    }

    getAllFruits() {
        const allFruitNode = this.fruitNode.children;
        allFruitNode.forEach((node: Node) => {
            const fruitCom = node.getComponent(Fruit)
            if (!fruitCom) return;
            if (fruitCom.isStandby) {
                node.destroy();
                return;
            };
            RunTimeData.instance().score += +node.name;
            this.scoreLabel.string = `score: ${RunTimeData.instance().score}`;
            node.destroy();
        });
    }

    gameOver() {
        this.gameState = Constants.DaxiguaGameState.GAME_OVER;
        this.touchArea.off(SystemEvent.EventType.TOUCH_START, this.finalClick, this, true);
        this.scheduleOnce(() => {
            this.getAllFruits();
            this.gameOverUI.active = true;
            this.gameOverUI.getChildByName('FinalScore').getComponent(Label).string = `总得分：${RunTimeData.instance().score}`;
            this.warningLine.setScale(new Vec3(1, 0, 1));
        });
        // ParticleSystem2D
    }

    reStart(event: TouchEvent) {
        this.gameState = Constants.DaxiguaGameState.IDLE;
        this.gameOverUI.active = false;
        this.start();
    }
}