import { customSkill } from './customskill';
import { Context } from 'aws-lambda';
import { AmazonSmartHomeSkillEvent } from '../amazon.interface';
import { smarthome } from './smarthome';

export const alexaCustomSkill = async (event: any, ctx: Context) => {
    console.log(`amazon custom skill: ${JSON.stringify(event)}`);
    return customSkill.invoke(event, ctx);
};

export const alexaSmartHomeSkill = async (event: AmazonSmartHomeSkillEvent, ctx: Context) => {
    console.log(`alexa smarthome: ${JSON.stringify(event)}`);
    return smarthome(event, ctx);
};
