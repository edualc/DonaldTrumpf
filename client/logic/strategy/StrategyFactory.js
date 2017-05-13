import { ObenabeStrategy } from './IStrategy.js';

export class StrategyFactory {
	constructor(){ }
	
	getStrategies(){
			return new ObenabeStrategy();
	}
}
