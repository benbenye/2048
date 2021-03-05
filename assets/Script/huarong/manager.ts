
import { _decorator, Component, Node, find, SystemEvent, PhysicsSystem2D, Vec2, BoxCollider2D, Vec3, EventTouch, Camera, UITransform, RigidBody2D, Collider2D, RigidBody } from 'cc';
import Constants from '../data/Constants';
import { CustomEventListener } from '../data/CustumerLisenter';
import RunTimeData from '../data/RuntimeData';
import TouchManager from '../util/touchManager';
const { ccclass, property } = _decorator;

const runtimeData = RunTimeData.instance();
@ccclass('Manager')
export class Manager extends Component {
    touchStartLocation: Vec2 = new Vec2;
    @property({
        type: Camera
    })
    UICamera = null;
    chess: Node[] = [];
    touchChess: Collider2D = null;
    onLoad() {
        const playAreaNode = find('Canvas/Cell')
        this.chess = find('Canvas/Cell/numberNode').children;
		// playAreaNode!.on(SystemEvent.EventType.TOUCH_START, this.onTouchStart, this)
		// playAreaNode!.on(SystemEvent.EventType.TOUCH_END, this.onTouchEnd, this)
        // CustomEventListener.on(Constants.EventName.MOVE, this.move, this);
        // this.UICamera = find('Canvas/Camera')
    }

    start () {
        // [3]
    }

    move(direction: number) {
        const vector = this.getVector(direction);
        if (this.touchChess) {
            console.log(this.touchChess)
            console.log(this.touchChess.body.getMass())
            this.touchChess.body.applyForceToCenter(new Vec2(100 * vector.x, 100 * vector.y), true); 
        }
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
    onTouchStart(e: EventTouch) {
        this.touchStartLocation = e.getUILocation();
        const w = PhysicsSystem2D.instance.testPoint(this.touchStartLocation)
        console.log(w)
        if (w.length) this.touchChess = w[0]
    }
    onTouchMove() {

    }
	onTouchEnd(e: EventTouch) {
		const deltaX = e.getLocation().x - this.touchStartLocation.x;
		const deltaY = e.getLocation().y - this.touchStartLocation.y;
		const absDx = Math.abs(deltaX)
		const absDy = Math.abs(deltaY)
		if (Math.max(absDx, absDy) > 10) {
      		// (right : left) : (down : up)
            this.move(absDx > absDy ? (deltaX > 0 ? 1 : 3) : deltaY > 0 ? 0 : 2)
    	}
	}
}
