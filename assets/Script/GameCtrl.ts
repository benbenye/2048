import { _decorator, Component, find, Vec3, tween, Node, systemEvent, SystemEvent, EventTouch, Vec2, ITriggerEvent, BoxCollider2D, PhysicsSystem2D, Contact2DType, RigidBody2D, RigidBodyComponent, PhysicsSystem, RigidBody } from 'cc';
import { game, Game, EPhysics2DDrawFlags } from "cc";
const { ccclass, property } = _decorator;

@ccclass
export default class GameCtrl extends Component {
	onLoad() {
		PhysicsSystem2D.instance.gravity = new Vec2(0, 0);
	}
}


game.on(Game.EVENT_GAME_INITED, () => {
    PhysicsSystem2D.instance.debugDrawFlags = 1
})