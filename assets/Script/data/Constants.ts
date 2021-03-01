import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

enum GameState {
    IDLE = 'idle',
    PLAYING = 'playing',
    PAUSE = 'pause',
    OVER = 'over'
}

enum EventName {
    MOVE = 'move',
    CORRECT_POSITION = 'correct_position',
    COLLISION = 'collision'
}


@ccclass
export default class Constants extends Component {
    public static GameState = GameState;
    public static EventName = EventName;
}
