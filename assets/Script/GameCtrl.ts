import { _decorator, Component, find, Vec3, tween, Node, systemEvent, SystemEvent, EventTouch, Vec2, ITriggerEvent, BoxCollider2D, PhysicsSystem2D, Contact2DType, RigidBody2D, RigidBodyComponent, PhysicsSystem, RigidBody } from 'cc';
const { ccclass, property } = _decorator;
import ChessManager from './chess/ChessManager';
import Chess from './chess/Chess';
import { CustomEventListener } from './data/CustumerLisenter';
import Constants from './data/Constants';
import RunTimeData from './data/RuntimeData';

@ccclass
export default class GameCtrl extends Component {
	chessboard = null;
	chessManager: ChessManager = null;

	playAreaNode: Node = new Node();

	text: string = 'hello';
	touchStartLocation: Vec2 = new Vec2(0,0);
	touchStartState: boolean = false;
	touchMoveState: boolean = false;
	touchEndState: boolean = false;
	onLoad() {
		PhysicsSystem2D.instance.gravity = new Vec2(0, 0);
		console.log(PhysicsSystem2D.instance.gravity)
		this.chessManager = new ChessManager();	
	}

	async start () {
		this.playAreaNode = find('Canvas').getChildByName('Cell');
		const node = await this.chessManager.getChessNode('chess-2')
		const node1 = await this.chessManager.getChessNode('chess-4')
		this.chessManager.setChessInChessBoard(node, this.chessManager.computeChessPosition(this.chessManager.getRandomChessPosition()), {isNew: true});
		this.chessManager.setChessInChessBoard(node1, this.chessManager.computeChessPosition(this.chessManager.getRandomChessPosition()), {isNew: true});
		this.initEventListener();
	}
	initEventListener() {
		// this.node.addE
		this.playAreaNode.on(SystemEvent.EventType.TOUCH_START, this.onTouchStart, this)
		this.playAreaNode.on(SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove, this)
		this.playAreaNode.on(SystemEvent.EventType.TOUCH_END, this.onTouchEnd, this)
		this.playAreaNode.on(SystemEvent.EventType.TOUCH_CANCEL, this.onTouchEnd, this)
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
			const parent = find('Canvas/Cell/numberNode');
			parent.children.forEach(node => {
				node.getComponent(RigidBody2D).enabledContactListener = true;
				node.getComponent(RigidBody2D).type = 1;
			})
			// 移动没有完成就生成新的，可能会发生意外的碰撞导致正在移动的棋子不能完成移动
			// 分组比较好，新棋子不参与碰撞检测
			this.scheduleOnce(() => {
				PhysicsSystem2D.instance.gravity = new Vec2(0, 0);
				this.newChess('chess-2');
			}, 0.5)
			// this.newChess();
    	}
	}
	onTouchCancel(e: EventTouch) {
		this.touchStartState = false;
		this.touchMoveState = false;
		this.touchEndState = false;
		console.log(e)
	}
	newChess(name: string, coo?: any, options?: object) {
		if (coo && coo.x === -1) {
			console.log('full')
			return;
		}
		if (!coo) {
			coo = this.chessManager.computeChessPosition(this.chessManager.getRandomChessPosition());
		}
		this.chessManager.getChessNode(name).then(node => {
			this.chessManager.setChessInChessBoard(node, coo, options);
		})
	}
    onTriggerEnter (e: ITriggerEvent) {
        console.log(e)
    }
}
