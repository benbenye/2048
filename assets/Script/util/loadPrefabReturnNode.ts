
import { _decorator, Component, Node, Prefab, instantiate, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoadPrefabReturnNode')
export default class LoadPrefabReturnNode {
    static prefabMap = new Map<string, Prefab>();

    static getNode(url: string, cb?: Function, ...args: any[]): Promise<Node> {
        return new Promise((res, rej) => {
            if (this.prefabMap.has(url)) {
                res(instantiate(this.prefabMap.get(url)) as Node)
                return;
            }
            resources.load([url], Prefab, () => {}, (err, prefab) => {
                if (err) {
                    rej(err)
                    return
                }

                this.prefabMap.set(url, prefab[0]);
                res(instantiate(this.prefabMap.get(url)) as Node)
            })
        })
    }
}