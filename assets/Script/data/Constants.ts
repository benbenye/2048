import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

enum GameState {
    IDLE = 'idle',
    MOVING = 'moving',
    MOVE_OVER = 'move_over',
    NEW_CHESS = 'new_chess',
    PAUSE = 'pause',
    GAME_OVER = 'game_over'
}

enum EventName {
    MOVE = 'move',
    CORRECT_POSITION = 'correct_position',
    COLLISION = 'collision'
}

enum DaxiguaGameState {
    IDLE = 'idle',
    DROPPING = 'dropping',
    MERGING = 'merging',
    PAUSE = 'pause',
    GAME_OVER = 'game_over'
}


@ccclass
export default class Constants extends Component {
    public static GameState = GameState;
    public static EventName = EventName;
    public static DaxiguaGameState = DaxiguaGameState;
}
