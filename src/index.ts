import 'source-map-support/register';
import { AmazonSmartHomeSkillEvent, AmazonCustomSkillEvent, Mappable } from './amazon.interface';
import { alexaCustomSkill, alexaSmartHomeSkill } from './alexa';
import { APIGatewayEvent } from 'aws-lambda';
import { googleSmartHome } from './google';

/**
 * Check if this is a SmartHome skill evebt
 * @param event
 */
const isSmartHomeEvent = (event: Mappable): event is AmazonSmartHomeSkillEvent => {
    return event && event.directive && event.directive.header;
};

/**
 * Check if this a custom skill event
 * @param event
 */
const isCustomSkillEvent = (event: Mappable): event is AmazonCustomSkillEvent => {
    return event.request && event.request.intent && event.request.intent.name;
};

/**
 * Check if this is an Api Gateway event
 * @param event
 */
const isApiGateWayEvent = (event: Mappable): event is APIGatewayEvent => {
    return event.httpMethod && event.requestContext && event.requestContext.requestId;
};

/**
 * Entrypoint for AWS Lambda
 * Set the function name as the handler in the Lambda configuration
 * @param event
 * @param context
 */
export const handler = async (
    event: AmazonSmartHomeSkillEvent | AmazonCustomSkillEvent | APIGatewayEvent,
    context: any,
) => {
    if (isSmartHomeEvent(event)) {
        // if this is a request from Alexa smart home skill return handler for Alexa
        return alexaSmartHomeSkill(event, context);
    } else if (isCustomSkillEvent(event)) {
        // this request is a alexa custom skill event
        return await alexaCustomSkill(event, context);
    } else if (isApiGateWayEvent(event) && ['/smarthome', '/dialogflow'].includes(event.path)) {
        // Unlike the Alexa smart home and custom event, Api gateway sends a different type of event.
        // With this we can determine if this request is sent by Google, by checking the url path.
        return await googleSmartHome(event, context);
    }

    return {
        statusCode: 404,
        headers: {},
        body: { message: 'Event not found' },
    };
};
