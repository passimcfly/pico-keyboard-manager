import { exec } from 'child_process'
import { ButtonConfig } from '../models/buttonConfig';
import { ButtonState } from '../models/keyState';
export class Programm {
    public runKeys(newKeys: ButtonState[], oldKeys: ButtonState[] | null, config: ButtonConfig[]) {
        for (let i = 0; i < newKeys.length; i++) {
            const newKey = newKeys[i];
            const oldKey = oldKeys ? oldKeys[i] : null;

            if(newKey.state === "1" && (!oldKey || newKey.state !== oldKey.state, config[i].programmPath.length > 0)){
                const prog = config[i].programmPath;
                const progType = prog.substring(prog.lastIndexOf(".") + 1)
                const args = config[i].args.length > 0 ? config[i].args : undefined
                console.log(progType)
                console.log(prog)
                console.log(args)
                try {
                    switch (progType) {
                        case "exe":
                            exec(`start "" "${prog}"`)
                            break;
                        case "url":
                            exec(`start "" "${prog}"`)
                            break;
                        default:
                            throw new Error("No URL or EXE")
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }
}