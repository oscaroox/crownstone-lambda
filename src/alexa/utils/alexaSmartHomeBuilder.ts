import { Directive, Mappable, AmazonSmartHomeSkillEvent } from '../../amazon.interface';
import { Api, getApi } from '../../utils/api';
import { Context } from 'aws-lambda';

interface AlexaSmartHomeHandler {
    (event: Directive, api: Api): Promise<{}> | {};
}

/**
 * Helper function for handling Alexa Smart Home intents in a more readable way.
 * @param handlers
 */
export const alexaSmartHomeBuilder = (handlers: Mappable<AlexaSmartHomeHandler>) => {
    /**
     * Return a function that will handle the APIGateway event
     */
    return async (event: AmazonSmartHomeSkillEvent, _ctx: Context) => {
        const namespace = event.directive.header.namespace;

        const handlerKeys = Object.keys(handlers);

        if (!handlerKeys.includes(namespace)) {
            throw new Error(`Alexa Smart home: no handler found for namespace ${namespace} `);
        }

        const token =
            (event.directive.payload.scope && event.directive.payload.scope.token) ||
            (event.directive.endpoint && event.directive.endpoint.scope && event.directive.endpoint.scope.token);

        if (!token) {
            throw new Error('Alexa Smart home requires account linking');
        }

        const res = await handlers[namespace]({ ...event.directive }, getApi(token));

        return res;
    };
};
