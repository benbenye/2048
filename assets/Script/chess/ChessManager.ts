import { _decorator, Component, loader, Prefab, assetManager, resources, instantiate, Node, RigidBody2D, Vec2, PhysicsSystem2D, Vec3, tween, find, BoxCollider2D, Contact2DType } from 'cc';
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
    // public chessBoard: Chess[] = [];

    public noRandomCoo: boolean = false;

    @property
    public countRandomTime: number = 0;
    public _chessPrefab = new Map<string, Prefab>();

    onLoad () {
        CustomEventListener.on(Constants.EventName.MOVE, this.move, this);
    }

    update(dt) {

    }

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
            return (nodePosition.x == rPosition.x && nodePosition.y == rPosition.y)
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

    public computeChessPosition1(index: number, vector: number) {
        const i = index >= (vector > 0 ? dimensionX / 2 : dimensionY / 2) ? index - 1 : index - 2;
        const pre = i < 0 ? -1: 1;
        const n = i / pre - 1;
        const A = 1/2 * runtimeData.chessWidth; 
        const CHESS = runtimeData.chessWidth;
        const res = A * pre + CHESS * n * pre
        console.log(`${res} * ${vector} = ${res * vector}`)
        return res * vector;
    }

    public computeChessPosition(position: Vec3) {
        return new Vec3(position.x * runtimeData.chessWidth, position.y * runtimeData.chessWidth, 0);
    }

    public move (direction: number) {

      // (right : left) : (down : up)
        //   (1 : 3) :2 : 0
        const vector = this.getVector(direction);
        PhysicsSystem2D.instance.gravity = new Vec2(vector.x* runtimeData.gravity, vector.y* runtimeData.gravity);
		console.log(PhysicsSystem2D.instance.gravity)
        const parent = find('Canvas/Cell/numberNode');
        parent?.children.forEach(node => {
            console.log(node.getComponent(RigidBody2D))
            // node.getComponent(RigidBody2D).enabledContactListener = true;
            // node.getComponent(RigidBody2D).type = 1;
        })
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
	public setChessInChessBoard(node: Node, position: Vec3, options?: any) {
		const parent = find('Canvas/Cell/numberNode');
		
		node.setPosition(position)
		node.setScale(new Vec3(0.4, 0.4, 0))
		const chessCom = node.getComponent(Chess);
		if (chessCom) {
			// chessCom.cooX = coo?.x;
			// chessCom.cooY = coo?.y;
			if (options && options.newMerged)
				chessCom.newMerged = options.newMerged;
			if (options && options.isNew)
				chessCom.isNew = options.isNew;
			// this.chessBoard.push(chessCom)
		}

		node.parent = parent;
        const box = node.getComponent(BoxCollider2D);
		box?.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
		box?.on('end-contact', this.onEndContact, this);
		
		tween(node).to(0.3, {scale: new Vec3(1, 1, 1)}, { easing: 'linear'} ).start()
	}
	onEndContact (selfCollider, otherCollider, contact) {
		selfCollider.node.position = Chess.correctPosition(selfCollider.node);
		if (otherCollider.node.name.match('wall')) return;
		otherCollider.node.position = Chess.correctPosition(otherCollider.node);
		// const selfCom = selfCollider.node.getComponent(Chess);
		// const otherCom = otherCollider.node.getComponent(Chess);
		// console.log('end',selfCollider.node.name, otherCollider.node.name, selfCom.speedX, selfCom.speedY, otherCom.speedX, otherCom.speedY)
	}

	onBeginContact (selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact) {
		const selfBody = selfCollider.node.getComponent(RigidBody2D);
		const otherBody = otherCollider.node.getComponent(RigidBody2D);
		if (otherCollider.node.name.match('wall')) {
			if (selfBody) {
				selfBody.enabledContactListener = false;
				this.scheduleOnce(() => {
					selfBody.type = 0;
				})
			}
			// RigidBodyComponent.Type.STATIC
			// selfCollider.node.getComponent(Chess).speed = new Vec3(0,0,0);
			selfCollider.node.setPosition(Chess.correctPosition(selfCollider.node))
		}
		if (selfCollider.node.name === otherCollider.node.name) {

			if (otherCollider.node.getComponent(Chess).speed.x === otherCollider.node.getComponent(Chess).speed.y && !otherCollider.node.getComponent(Chess).isMerged) {
				// 只处理self运动，other静止的碰撞情况
				selfCollider.node.getComponent(Chess).speed = new Vec3(0,0,0)
				tween(selfCollider.node).to(0.3, {
					position: otherCollider.node.getPosition()
				}).call(() => {
					selfCollider.node.destroy();
					otherCollider.node.destroy();
					// otherCollider.node.getComponent(Chess).isMerged = true;
					// otherCollider.node.getCom
					const n = otherCollider.node.name.split('-')[1] * 2
					this.newChess(`chess-${n}`, {x: otherCollider.node.getPosition().x / 217.5, y: otherCollider.node.getPosition().y / 217.5})
				}).start();
			}
		}
	}
}