import { _decorator, Component, loader, Prefab, assetManager, resources, instantiate, Node, RigidBody2D, Vec2, PhysicsSystem2D, Vec3, tween, find, BoxCollider2D, Contact2DType, ERigidBody2DType, Label, ECollider2DType, VerticalTextAlignment, UITransform, EventTouch, SystemEvent } from 'cc';
const { ccclass, property } = _decorator;

import Chess from './Chess';
import RunTimeData from '../data/RuntimeData';
import { CustomEventListener } from '../data/CustumerLisenter';
import _ from '../lodash';
import Constants from '../data/Constants';
const runtimeData = RunTimeData.instance();
const dimensionX = runtimeData.dimensionX;
const dimensionY = runtimeData.dimensionY;

@ccclass('ChessManager')
export default class ChessManager extends Component {
    standbyMergeNode: Node[] = [];

    collisionNode: WeakMap<Node, Set<Node>> = new WeakMap();
    countMoveNode: object = {};
    countCollision: number = 0;

    @property
    countRandomTime: number = 0;
    _chessPrefab = new Map<string, Prefab>();
	playAreaNode: Node = new Node();
	touchStartLocation: Vec2 = new Vec2(0,0);
	touchStartState: boolean = false;
	touchMoveState: boolean = false;
	touchEndState: boolean = false;
    vectorFlag: string = '00';

    onLoad () {
        CustomEventListener.on(Constants.EventName.MOVE, this.move, this);
		this.playAreaNode = find('Canvas').getChildByName('Cell');
        this.newChess('chess-2').then(() => {
            this.newChess('chess-2')
        }).then(() => {this.initEventListener()})
    }
	initEventListener() {
		this.playAreaNode.on(SystemEvent.EventType.TOUCH_START, this.onTouchStart, this)
		this.playAreaNode.on(SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove, this)
		this.playAreaNode.on(SystemEvent.EventType.TOUCH_END, this.onTouchEnd, this)
		// this.playAreaNode.on(SystemEvent.EventType.TOUCH_CANCEL, this.onTouchEnd, this)
	}
	onTouchStart(e: EventTouch) {
		this.touchStartState = true;
		this.touchStartLocation = e.getLocation();
	}
	onTouchMove(e: EventTouch) {
		if (!this.touchStartState) return;
		this.touchMoveState = true;
	}
	onTouchEnd(e: EventTouch) {
		if (!this.touchMoveState) return;
		this.touchEndState = true;
		this.touchStartState = false;
		this.touchMoveState = false;
		const deltaX = e.getLocation().x - this.touchStartLocation.x;
		const deltaY = e.getLocation().y - this.touchStartLocation.y;
		const absDx = Math.abs(deltaX)
		const absDy = Math.abs(deltaY)
		if (Math.max(absDx, absDy) > 10) {
      		// (right : left) : (down : up)
			CustomEventListener.dispatchEvent(Constants.EventName.MOVE, absDx > absDy ? (deltaX > 0 ? 1 : 3) : deltaY > 0 ? 0 : 2)
    	}
	}
	onTouchCancel(e: EventTouch) {
		this.touchStartState = false;
		this.touchMoveState = false;
		this.touchEndState = false;
	}

    getRandomChessPosition (x: number = -1, y: number = -1) {
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

    getChessNode(name: string, cb?: Function, ...args: any[]) {
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
            })
        })
    }

    computeChessPosition(position: Vec3) {
        return new Vec3(position.x * runtimeData.chessWidth + 0.5 * runtimeData.chessWidth, position.y * runtimeData.chessWidth + 0.5 * runtimeData.chessWidth, 0);
    }

    move (direction: number) {
        // (right : left) : (down : up)
        //   (1 : 3) :2 : 0
        // if (runtimeData.gameState !== Constants.GameState.IDLE) return;
        runtimeData.gameState = Constants.GameState.MOVING;
        const parent = find('Canvas/Cell/numberNode');
        const vector = this.getVector(direction);
        this.vectorFlag = `${vector.x}${vector.y}`;
        parent?.children.forEach(node => {
            const chessComponent = node.getComponent(Chess);
            const boxComponent = node.getComponent(BoxCollider2D);
            
            if (chessComponent) {
                chessComponent.isNew = false;
                chessComponent.newMerged = false;
                chessComponent.isStatic = false;
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
                boxComponent.group = Math.pow(2, +node.name.split('-')[1]);
            }
            
        })
        this.countCollision = 0;
        PhysicsSystem2D.instance.gravity = new Vec2(vector.x* runtimeData.gravity, vector.y* runtimeData.gravity);

    }
    testMoveOver () {
        console.log(this.countMoveNode, this.collisionNode)
        
        const parent = find('Canvas/Cell/numberNode');
        const isAllStatic = parent?.children.length === this.countCollision
        if (!isAllStatic) {
            return;
        }
            runtimeData.gameState = Constants.GameState.MOVE_OVER;
            console.log('move over')
            this.testRepeatPositionChess();
            this.collisionNode = new WeakMap();
            PhysicsSystem2D.instance.gravity = new Vec2(0, 0);
                runtimeData.gameState = Constants.GameState.NEW_CHESS;
                this.newChess('chess-2');
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
		
		const chessCom = node.getComponent(Chess);
        
		node.setPosition(position)
		node.parent = parent;
        const box = node.getComponent(BoxCollider2D);
		if (chessCom && box) {
		    box.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
			if (options && options.newMerged) {
				chessCom.newMerged = options.newMerged;
                box.group = 268435456;
		        node.setScale(new Vec3(1, 1, 1))
		        tween(node).to(0.1, {scale: new Vec3(1.2, 1.2, 1)}, { easing: 'linear'} ).to(0.1, {scale: new Vec3(1, 1, 1)}, { easing: 'linear'} ).call(() => {
                    runtimeData.gameState = Constants.GameState.IDLE;
                }).start()
            }
			if (options && options.isNew){
				chessCom.isNew = options.isNew;
		        node.setScale(new Vec3(0.4, 0.4, 0))
		        tween(node).to(0.1, {scale: new Vec3(1, 1, 1)}, { easing: 'linear'} ).call(() => {
                    runtimeData.gameState = Constants.GameState.IDLE;
                }).start()
            }
		}
	}
    
	onBeginContact (selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact) {
        console.log(selfCollider.node.name + selfCollider.body?.linearVelocity)
        console.log(otherCollider.node.name + otherCollider.body?.linearVelocity)
        console.log(this.countMoveNode, this.collisionNode)
        const otherBody = otherCollider.body;
        const selfChess = selfCollider.node.getComponent(Chess);
        const otherChess = selfCollider.node.getComponent(Chess);
        if (!otherBody || !selfChess) return;

        if (otherBody.type === ERigidBody2DType.Static && otherBody.node.name.split('_')[2] === this.vectorFlag) {
            selfChess.isStatic = true;
            this.countCollision += 1;
            this.testMoveOver();
            console.log(this.countCollision)
            return;
        }
        if (!otherChess) return;
        if (!otherChess.isStatic) return 
        selfChess.isStatic = true;
        this.countCollision += 1;
        this.testMoveOver();
        console.log(this.countCollision)
    }

    testRepeatPositionChess() {
		const parent = find('Canvas/Cell/numberNode');
        if (!parent || !parent.children.length) return;
        const arr = parent.children;
        console.log(arr)
        const chess = _.groupBy(arr, (node) => {
            console.log(node.position)
            const x = Math.floor((node.position.x  ) / runtimeData.chessWidth);
            const y = Math.floor((node.position.y  ) / runtimeData.chessWidth);
            console.log(x, y)
            return `x${x}y${y}`;
        });
        const mergeChess = Object.values(chess).filter(e => e.length > 1)
        console.log(mergeChess)
        if (!mergeChess.length) return;

        mergeChess.forEach(chessArr => {
            console.log(chessArr)
            this.scheduleOnce(() => {
                this.newChess(`chess-${chessArr[0].name.split('-')[1] * 2}`, chessArr[0].position, {newMerged: true})
                chessArr[0].destroy();
                chessArr[1].destroy();
            })
        });

    }

	newChess(name: string, coo?: any, options?: object) {
		if (coo && coo.x === -1) {
            runtimeData.gameState = Constants.GameState.GAME_OVER;
			console.log('full')
			return;
		}
		if (!coo) {
			coo = this.computeChessPosition(this.getRandomChessPosition());
            options = {isNew: true}
		}
		return this.getChessNode(name).then(node => {
			this.setChessInChessBoard(node, coo, options);
            return node;
		})
	}
}