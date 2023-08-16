import {execFile} from 'child_process'
import { ButtonConfig } from '../models/buttonConfig';
import { ButtonState } from '../models/keyState';
export class Programm {
    public runKeys(newKeys: ButtonState[], oldKeys: ButtonState[] | null, config: ButtonConfig[]) {
        for (let i = 0; i < newKeys.length; i++) {
            const newKey = newKeys[i];
            const oldKey = oldKeys ? oldKeys[i] : null;

            if(newKey.state === "1" && (!oldKey || newKey.state !== oldKey.state)){
                execFile(config[i].programmPath)
            }
        }
    }
}