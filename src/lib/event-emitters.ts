// eventEmitter.js
import { EventEmitter } from "events";
export const macroEventEmitter = new EventEmitter();
macroEventEmitter.setMaxListeners(20);

export const textEditorEventEmitter = new EventEmitter();
textEditorEventEmitter.setMaxListeners(20);

export const AIGeneratorEventEmitter = new EventEmitter();
AIGeneratorEventEmitter.setMaxListeners(20);
