import { _decorator, Component, loader, Prefab, assetManager, resources, instantiate, Node, RigidBody2D, Vec2, PhysicsSystem2D, Vec3, tween, find, BoxCollider2D, Contact2DType, ERigidBody2DType, Label, ECollider2DType, VerticalTextAlignment } from 'cc';
const { ccclass, property } = _decorator;

import Chess from './Chess';
import RunTimeData from '../data/RuntimeData';
import { CustomEventListener } from '../data/CustumerLisenter';
import Constants from '../data/Constants';
const runtimeData = RunTimeData.instance();
const dimensionX = runtimeData.dimensionX;
const dimensionY = runtimeData.dimensionY;

@ccclass('ChessManager')
export default class ChessManager extends Component {
    public standbyMergeNode: Node[] = [];

    public noRandomCoo: boolean = false;

    @property
    public countRandomTime: number = 0;
    public _chessPrefab = new Map<string, Prefab>();

    onLoad () {
        CustomEventListener.on(Constants.EventName.MOVE, this.move, this);
        // CustomEventListener.on(Constants.EventName.COLLISION, this.testMoveOver, this);
        // console.log(find('Canvas/Cell/colliderBox/wall_top'))
        find('Canvas/Cell/colliderBox/wall_top').getComponent(BoxCollider2D).on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
        find('Canvas/Cell/colliderBox/wall_bottom').getComponent(BoxCollider2D).on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
        find('Canvas/Cell/colliderBox/wall_right').getComponent(BoxCollider2D).on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
        find('Canvas/Cell/colliderBox/wall_left').getComponent(BoxCollider2D).on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
    }

    // update(dt) {

    // }

    public getRandomChessPosition (x: number = -1, y: number = -1) {
        const rx = x === -1 ? Math.floor(Math.random() * dimensionX) : x;
        const ry = y === -1 ? Math.floor(Math.random() * dimensionY) : y;
        if (x == -1 && y === -1) {
            this.countRandomTime ++
        }
		const parent = find('Canvas/Cell/numberNode');
        
        const repeatIndex = parent?.children.findIndex(node => {
            const nodePosition = node.getPosition();
            const rPosition = this.computeChessPosition(new Vec3(rx, ry, 0))
            console.log(nodePosition.x - rPosition.x, nodePosition.y - rPosition.y)
            return (Math.abs(nodePosition.x - rPosition.x) < 0.5 && Math.abs(nodePosition.y - rPosition.y) < 0.5)
        });
        if (repeatIndex === -1) {
            this.countRandomTime = 0;
            return new Vec3(rx, ry, 0);
        }
        this.countRandomTime ++
        if (this.countRandomTime >= dimensionX * dimensionY) {
            return new Vec3(-1, -1, 0)
        }
        if (rx + 1 < dimensionX) {
            return this.getRandomChessPosition(rx + 1, ry);
        } else if (ry + 1 < dimensionY) {
            return this.getRandomChessPosition(0, ry + 1);
        } else {
            return this.getRandomChessPosition(0, 0);
        }
    }

    public getChessNode(name: string, cb?: Function, ...args: any[]) {
        return new Promise((res, rej) => {
            if (this._chessPrefab.has(name)) {
                res(instantiate(this._chessPrefab.get(name)) as Node)
                return;
            }
            const path = `chess/2048/${name}`;
            resources.load([path], Prefab, (err, prefab) => {
                if (err) {
                    rej(err)
                    return
                }

                this._chessPrefab.set(name, prefab[0]);
                res(instantiate(this._chessPrefab.get(name)) as Node)
                // return instantiate(prefab[0]) as Node;
            })
        })
    }

    public computeChessPosition(position: Vec3) {
        return new Vec3(position.x * runtimeData.chessWidth + 0.5 * runtimeData.chessWidth, position.y * runtimeData.chessWidth + 0.5 * runtimeData.chessWidth, 0);
    }

    public move (direction: number) {
        // (right : left) : (down : up)
        //   (1 : 3) :2 : 0
        const parent = find('Canvas/Cell/numberNode');
        const vector = this.getVector(direction);
        if (vector.x) {
            find('Canvas/Cell/colliderBox/wall_left').getComponent(RigidBody2D).enabledContactListener = true;
            find('Canvas/Cell/colliderBox/wall_right').getComponent(RigidBody2D).enabledContactListener = true;
            find('Canvas/Cell/colliderBox/wall_top').getComponent(RigidBody2D).enabledContactListener = false;
            find('Canvas/Cell/colliderBox/wall_bottom').getComponent(RigidBody2D).enabledContactListener = false;
        }
        if (vector.y) {
            find('Canvas/Cell/colliderBox/wall_left').getComponent(RigidBody2D).enabledContactListener = false;
            find('Canvas/Cell/colliderBox/wall_right').getComponent(RigidBody2D).enabledContactListener = false;
            find('Canvas/Cell/colliderBox/wall_top').getComponent(RigidBody2D).enabledContactListener = true;
            find('Canvas/Cell/colliderBox/wall_bottom').getComponent(RigidBody2D).enabledContactListener = true;
        }
        parent?.children.forEach(node => {
            const bodyComponent = node.getComponent(RigidBody2D);
            const chessComponent = node.getComponent(Chess);
            const boxComponent = node.getComponent(BoxCollider2D);
            
            if (bodyComponent) {
                // bodyComponent.enabledContactListener = false;
                // bodyComponent.type = ERigidBody2DType.Dynamic;
                // bodyComponent.linearVelocity = new Vec2(vector.x* runtimeData.speed, vector.y* runtimeData.speed);
            }
            if (chessComponent) {
                chessComponent.isNew = false;
                chessComponent.newMerged = false;
            }
            if (boxComponent) {
                if (vector.x) {
                    boxComponent.size.width = 216.5;
                    boxComponent.size.height = 200;
                    boxComponent.apply();
                }
                if (vector.y) {
                    boxComponent.size.width = 200;
                    boxComponent.size.height = 216.5;
                    boxComponent.apply();
                }
            }
            
        })
        runtimeData.beforeCollision = parent?.children.length;
        runtimeData.collisionCount = 0;
        PhysicsSystem2D.instance.gravity = new Vec2(vector.x* runtimeData.gravity, vector.y* runtimeData.gravity);
		console.log(PhysicsSystem2D.instance.gravity) 
    }
    testMoveOver () {
        console.log(runtimeData.beforeCollision, runtimeData.collisionCount)
        
        const parent = find('Canvas/Cell/numberNode');
        const movingNode = parent?.children.filter(node => {
            const body = node.getComponent(RigidBody2D);
            if (body) 
                return Math.abs(body.linearVelocity.x) > 5 || Math.abs(body.linearVelocity.y) > 5
        }).length

        // if (!movingNode) {
        if (runtimeData.beforeCollision === runtimeData.collisionCount) {
            console.log('move over')
            PhysicsSystem2D.instance.gravity = new Vec2(0, 0);
            const q = Promise.resolve();
            this.standbyMergeNode.forEach(node => {
                q.then(() => {
                    return this.newChess(node.name, node.getPosition(), {newMerged: false}).then(() => {
                        node.destroy();
                        return 1;
                    })
                })
                // tween(node).to(0.1, {
                //     scale: new Vec3(1.2, 1.2, 1)
                // }).to(0.1, {
                //     scale: new Vec3(1, 1, 1)
                // }).call(() => {

                // }).start();
            })
            q.then(() => {
                this.newChess('chess-2');
                this.standbyMergeNode = [];
            })
        }
    }
    buildTraversals (vector: object) {
        var traversals = { x: [], y: [] };

        for (let pos = 0; pos < dimensionX; pos++) {
            traversals.x.push(pos);
        }
        for (let pos = 0; pos < dimensionY; pos++) {
            traversals.y.push(pos);
        }
        if (vector.x === 1) traversals.x = traversals.x.reverse();
        if (vector.y === 1) traversals.y = traversals.y.reverse();

        return traversals;
    }
    getVector (direction: number) {
        const map = [
            { x: 0,  y: 1 }, // Up
            { x: 1,  y: 0 },  // Right
            { x: 0,  y: -1 },  // Down
            { x: -1, y: 0 }   // Left
        ];

        return map[direction];
    }
	setChessInChessBoard(node: Node, position: Vec3, options?: any) {
		const parent = find('Canvas/Cell/numberNode');
		
		node.setPosition(position)
		const chessCom = node.getComponent(Chess);
        console.log('init type:' + node.getComponent(RigidBody2D).type)
        
		node.parent = parent;
        const box = node.getComponent(BoxCollider2D);
        console.log(box)
		box?.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
		box?.on('end-contact', this.onEndContact, this);
		if (chessCom) {
			if (options && options.newMerged) {
				chessCom.newMerged = options.newMerged;
                // const body = node.getComponent(RigidBody2D);
                // body.type = ERigidBody2DType.Static;
                // body.enabledContactListener = false;
		        node.setScale(new Vec3(1, 1, 1))
		        tween(node).to(0.1, {scale: new Vec3(1.2, 1.2, 1)}, { easing: 'linear'} ).to(0.1, {scale: new Vec3(1, 1, 1)}, { easing: 'linear'} ).start()
            }
			if (options && options.isNew){
				chessCom.isNew = options.isNew;
		        node.setScale(new Vec3(0.4, 0.4, 0))
		        tween(node).to(0.1, {scale: new Vec3(1, 1, 1)}, { easing: 'linear'} ).start()
            }
		}
	}
	onEndContact (selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact) {
		selfCollider.node.position = Chess.correctPosition(selfCollider.node);
		if (otherCollider.node.name.match('wall')) return;
		otherCollider.node.position = Chess.correctPosition(otherCollider.node);
	}


	onBeginContact (selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact) {
        console.log('starting')
		const otherBody = otherCollider.body;
		const selfBody = selfCollider.body;
        const selfChessComponent = selfCollider.node.getComponent(Chess);
        const otherChessComponent = otherCollider.node.getComponent(Chess);
        if (!selfBody || !otherBody) return;
        if (!selfBody.enabledContactListener) return;
        if (selfCollider.node.name.match('wall')) {
            console.log('撞墙了')
            selfBody.enabledContactListener = false;
            otherBody.enabledContactListener = true;
            return;
        }
        if (!selfChessComponent) return;
        if (selfChessComponent.isStandbyMerge) {
            console.log('开始合并了')
            selfChessComponent.standbyMergeNode.destroy();

            selfCollider.name = `chess-${selfCollider.name.split('-')[1] * 2}`
            selfChessComponent.isStandbyMerge = false;
            return;
        }
        if (!otherChessComponent) return;
        const worldManifold = contact.getWorldManifold();
        const points = worldManifold.points
        if (points.length) {
            console.log('筛选是否回弹碰撞...')
            let pointVelSelf = new Vec2;
            let pointVelOther = new Vec2;
            let relativeVel = new Vec2;
            let relativePoint = new Vec2;
            selfBody.getLinearVelocityFromWorldPoint(points[0], pointVelSelf);
            otherBody.getLinearVelocityFromWorldPoint(points[0], pointVelOther);
            console.log(points[0])
            console.log(selfCollider, otherCollider)
            console.log(pointVelSelf, pointVelOther)
            selfBody.getLocalVector(pointVelOther.subtract(pointVelSelf), relativeVel);
            console.log(relativeVel)
            const gravity = PhysicsSystem2D.instance.gravity
            if ((gravity.x && gravity.x * relativeVel.x >= 0) || (gravity.y && gravity.y * relativeVel.y >= 0)) {
                // 无效
                // store disabled state to contact
                console.log('ignore')
                contact.disabled = true;
                return;
            }
        }
        if (selfChessComponent.num === otherChessComponent.num) {
            console.log('准备合并了')
            selfChessComponent.isStandbyMerge = true;
            selfChessComponent.standbyMergeNode = selfCollider.node;
            // selfBody.enabledContactListener = false;
            // otherBody.enabledContactListener = true;
            contact.disabled = true;
            return;
        }
        console.log('不同的node')
        selfBody.enabledContactListener = false;
        otherBody.enabledContactListener = true;


    }

	onBeginContact1 (selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact) {
        // self 运动中的，other停下来的
        // contact.disabled = true;
        console.log('starting')
		const otherBody = otherCollider.body;
		const selfBody = selfCollider.body;
        const selfChessComponent = selfCollider.node.getComponent(Chess);
        const otherChessComponent = otherCollider.node.getComponent(Chess);
        const worldManifold = contact.getWorldManifold();
        const points = worldManifold.points
        // if (points.length) {
        //     let pointVelSelf = new Vec2;
        //     let pointVelOther = new Vec2;
        //     let relativeVel = new Vec2;
        //     let relativePoint = new Vec2;
        //     selfBody.getLinearVelocityFromWorldPoint(points[0], pointVelSelf);
        //     otherBody.getLinearVelocityFromWorldPoint(points[0], pointVelOther);
        //     // console.log(points[0])
        //     // console.log(selfCollider, otherCollider)
        //     // console.log(pointVelSelf, pointVelOther)
        //     selfBody.getLocalVector(pointVelOther.subtract(pointVelSelf), relativeVel);
        //     // console.log(relativeVel)
        //     const gravity = PhysicsSystem2D.instance.gravity
        //     if ((gravity.x && gravity.x * relativeVel.x >= 0) || (gravity.y && gravity.y * relativeVel.y >= 0)) {
        //         // 无效
        //         // store disabled state to contact
        //         console.log('ignore')
        //         contact.disabled = true;
        //         return;
        //     }
        // }

        if (!selfChessComponent || !selfBody)  return;
        if (selfChessComponent.isStandbyMerge) {
            console.log('merging')
            selfBody.enabledContactListener = false;
            const standbyMergeNode = selfChessComponent.standbyMergeNode
            // =======
            this.standbyMergeNode.push(standbyMergeNode)
            this.scheduleOnce(() => {
                // selfBody.type = ERigidBody2DType.Static;
                // selfCollider.node.setPosition(Chess.correctPosition(selfCollider.node))
                if (selfCollider) selfCollider.node.destroy();
                runtimeData.collisionCount ++;
                this.testMoveOver();
            })
            // CustomEventListener.dispatchEvent(Constants.EventName.COLLISION)
            // =======

            // if (standbyMergeNode && standbyMergeNode.getComponent(RigidBody2D))
            //     standbyMergeNode.getComponent(RigidBody2D).enabledContactListener = false;
            // const n = +standbyMergeNode.getChildByName('n').getComponent(Label).string
            // standbyMergeNode.getChildByName('n').getComponent(Label).string = n * 2;

            // this.newChess(`chess-${2 * n}`, Chess.correctPosition(selfCollider.node), {newMerged: true}).then((node: Node) => {
            //     // 新生成的node具有Dynamic，需要值为static，防止随重力场运动
            //     node.getComponent(RigidBody2D).type = ERigidBody2DType.Static;
            //     selfCollider.node.destroy();
            //     standbyMergeNode.destroy();
            //     runtimeData.collisionCount ++;
            //     CustomEventListener.dispatchEvent(Constants.EventName.COLLISION)
            // })
            return;
        }

		if (otherCollider.node.name.match('wall')) {
            console.log('wall')
            selfBody.enabledContactListener = false;
            // contact.disabled = true;
            // this.scheduleOnce(() => {
            // 	selfBody.type = ERigidBody2DType.Static;
            //     selfCollider.node.setPosition(Chess.correctPosition(selfCollider.node))
                runtimeData.collisionCount ++;
                this.testMoveOver();
            // })
            // contact.disabled = true;
            // CustomEventListener.dispatchEvent(Constants.EventName.COLLISION)
            return;
		}
        console.log(otherChessComponent)
        if (!otherChessComponent) return;
        if (selfChessComponent.isNew || otherChessComponent.isNew) return;
        if (selfChessComponent.newMerged || otherChessComponent.newMerged) return;
        if (!selfBody.enabledContactListener) {
            console.log('回弹')
            contact.enabled = true;
            return;
        }
        console.log('====', selfCollider.node.name, otherCollider.node.name, selfCollider.node.getChildByName('n')?.getComponent(Label)?.string, otherCollider.node.getChildByName('n')?.getComponent(Label)?.string)
		if (selfCollider.node.name === otherCollider.node.name && selfCollider.node.getChildByName('n')?.getComponent(Label)?.string === otherCollider.node.getChildByName('n')?.getComponent(Label)?.string) {
            console.log('standbyMerge')
            // 做一下标记，等到下一次再次碰撞时，再做合并处理
            selfChessComponent.isStandbyMerge = true;    
            selfChessComponent.standbyMergeNode = otherCollider.node;
            otherCollider.node.name = `chess-${otherCollider.node.name.split('-')[1] * 2}`
            contact.disabled = true;
            return;
		}
        // 两个不一样的node
        console.log('diffrent node')
        selfBody.enabledContactListener = false;
        // contact.disabled = true;
        console.log('bodytype:' + selfBody.type)
        // this.scheduleOnce(() => {
        //     selfBody.type = ERigidBody2DType.Static;
        //     selfCollider.node.setPosition(Chess.correctPosition(selfCollider.node))
            runtimeData.collisionCount ++;
            this.testMoveOver();
        // })
        // CustomEventListener.dispatchEvent(Constants.EventName.COLLISION)
	}
	newChess(name: string, coo?: any, options?: object) {
		if (coo && coo.x === -1) {
			console.log('full')
			return;
		}
		if (!coo) {
			coo = this.computeChessPosition(this.getRandomChessPosition());
            options = {isNew: true}
		}
		return this.getChessNode(name).then(node => {
			console.log(node)
			this.setChessInChessBoard(node, coo, options);
            return node;
		})
	}
}