import { customSkill } from './customskill';
import { Context } from 'aws-lambda';
import { AmazonSmartHomeSkillEvent } from '../amazon.interface';
import { smarthome } from './smarthome';

/**
 * Handle Alexa custom skill
 * @param event
 * @param ctx
 */
export const alexaCustomSkill = async (event: any, ctx: Context) => {
    console.log(`amazon custom skill: ${JSON.stringify(event)}`);
    return customSkill.invoke(event, ctx);
};

/**
 * Handle Alexa Smart Home skill
 * @param event
 * @param ctx
 */
export const alexaSmartHomeSkill = async (event: AmazonSmartHomeSkillEvent, ctx: Context) => {
    console.log(`alexa smarthome: ${JSON.stringify(event)}`);
    return smarthome(event, ctx);
};
