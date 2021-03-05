
import { _decorator, Component, Node, Vec2, EventTouch } from 'cc';
import Constants from '../data/Constants';
import { CustomEventListener } from '../data/CustumerLisenter';
const { ccclass, property } = _decorator;

@ccclass('TouchManager')
export default class TouchManager extends Component {
	static touchStartLocation: Vec2 = new Vec2(0,0);

    // [2]
    // @property
    // serializableDummy = 0;

    start () {
        // [3]
    }

	static onTouchStart(e: EventTouch) {
		this.touchStartLocation = e.getLocation();
	}

	static onTouchEnd(e: EventTouch) {
		const deltaX = e.getLocation().x - this.touchStartLocation.x;
		const deltaY = e.getLocation().y - this.touchStartLocation.y;
		const absDx = Math.abs(deltaX)
		const absDy = Math.abs(deltaY)
		if (Math.max(absDx, absDy) > 10) {
      		// (right : left) : (down : up)
			CustomEventListener.dispatchEvent(Constants.EventName.MOVE, absDx > absDy ? (deltaX > 0 ? 1 : 3) : deltaY > 0 ? 0 : 2)
    	}
	}
}