import { _decorator, Component, loader, Prefab, assetManager, resources, instantiate, Node, RigidBody2D, Vec2, PhysicsSystem2D, Vec3, tween, find, BoxCollider2D, Contact2DType, ERigidBody2DType, Label, ECollider2DType } from 'cc';
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
        parent?.children.forEach(node => {
            const bodyComponent = node.getComponent(RigidBody2D);
            const chessComponent = node.getComponent(Chess);
            if (bodyComponent) {
                bodyComponent.enabledContactListener = true;
                bodyComponent.type = ERigidBody2DType.Dynamic;
            }
            if (chessComponent) {
                chessComponent.isNew = false;
                chessComponent.newMerged = false;
            }
            
        })
        runtimeData.beforeCollision = parent?.children.length;
        runtimeData.collisionCount = 0;
        const vector = this.getVector(direction);
        PhysicsSystem2D.instance.gravity = new Vec2(vector.x* runtimeData.gravity, vector.y* runtimeData.gravity);
		console.log(PhysicsSystem2D.instance.gravity)
    }
    testMoveOver () {
        console.log(runtimeData.beforeCollision, runtimeData.collisionCount)
        if (runtimeData.beforeCollision === runtimeData.collisionCount) {
            console.log('move over')
            PhysicsSystem2D.instance.gravity = new Vec2(0, 0);
            console.log(this)
            this.standbyMergeNode.forEach(node => {
                node.active = false;
                this.newChess(`chess-${node.name.split('-')[1] * 2}`, node.getPosition(), {newMerged: true}).then(() => {
                    // this.newChess('chess-2');
                })
                // tween(node).to(0.1, {
                //     scale: new Vec3(1.2, 1.2, 1)
                // }).to(0.1, {
                //     scale: new Vec3(1, 1, 1)
                // }).call(() => {

                // }).start();
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
                const body = node.getComponent(RigidBody2D);
                body.type = ERigidBody2DType.Static;
                body.enabledContactListener = false;
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
        // self 运动中的，other停下来的
		const selfBody = selfCollider.node.getComponent(RigidBody2D);
		const otherBody = otherCollider.node.getComponent(RigidBody2D);
        const selfChessComponent = selfCollider.node.getComponent(Chess);
        const otherChessComponent = otherCollider.node.getComponent(Chess);
        if (!selfChessComponent || !selfBody)  return;
        if (selfChessComponent.isStandbyMerge) {
            // merge
            selfBody.enabledContactListener = false;
            const standbyMergeNode = selfChessComponent.standbyMergeNode
            // =======
            console.log(standbyMergeNode)
            this.standbyMergeNode.push(standbyMergeNode)
            console.log(this)
            this.scheduleOnce(() => {
                // selfBody.type = ERigidBody2DType.Static;
                // selfCollider.node.setPosition(Chess.correctPosition(selfCollider.node))
                if (selfCollider) selfCollider.node.destroy();
            })
            runtimeData.collisionCount ++;
            this.testMoveOver();
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
			if (selfBody) {
				selfBody.enabledContactListener = false;
                console.log('bodytype:' + selfBody.type)
				this.scheduleOnce(() => {
					selfBody.type = ERigidBody2DType.Static;
			        selfCollider.node.setPosition(Chess.correctPosition(selfCollider.node))
				})
                runtimeData.collisionCount ++;
                this.testMoveOver();
                // CustomEventListener.dispatchEvent(Constants.EventName.COLLISION)
			}
            return;
		}
        if (!otherChessComponent) return;
        if (selfChessComponent.isNew || otherChessComponent.isNew) return;
        if (selfChessComponent.newMerged || otherChessComponent.newMerged) return;
		if (selfCollider.node.name === otherCollider.node.name) {
            // 做一下标记，等到下一次再次碰撞时，再做合并处理
            if (selfBody) {
                selfChessComponent.isStandbyMerge = true;    
                selfChessComponent.standbyMergeNode = otherCollider.node;
                return;
            }
            return;
		}
        // 两个不一样的node
        if (selfBody) {
            selfBody.enabledContactListener = false;
            console.log('bodytype:' + selfBody.type)
            this.scheduleOnce(() => {
                selfBody.type = ERigidBody2DType.Static;
                selfCollider.node.setPosition(Chess.correctPosition(selfCollider.node))
            })
            runtimeData.collisionCount ++;
            this.testMoveOver();
            // CustomEventListener.dispatchEvent(Constants.EventName.COLLISION)
        }
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