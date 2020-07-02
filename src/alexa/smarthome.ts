import { alexaSmartHomeBuilder } from './utils/alexaSmartHomeBuilder';
import { createLogger } from '../utils/logger';

const log = createLogger('alexa/smarthome');

/**
 * Handle Alexa smart home intents
 */
export const smarthome = alexaSmartHomeBuilder({
    'Alexa.Discovery': async ({ header }, api) => {
        const stones = await api.getStones();

        const endpoints = stones.map(stone => {
            return {
                endpointId: stone.id,
                manufacturerName: 'Crownstone',
                description: stone.type,
                friendlyName: stone.name,
                displayCategories: ['SWITCH'],
                cookie: {
                    address: stone.address,
                    sphere: stone.sphereId,
                    appliance_type: stone.applianceId,
                },
                capabilities: [
                    {
                        type: 'AlexaInterface',
                        interface: 'Alexa.PowerController',
                        version: '3',
                        properties: {
                            supported: [
                                {
                                    name: 'powerState',
                                },
                            ],
                            proactivelyReported: true,
                            retrievable: false,
                        },
                    },
                ],
            };
        });

        const result = {
            event: {
                header: {
                    ...header,
                    name: 'Discover.Response',
                },
                payload: {
                    endpoints: endpoints,
                },
            },
        };

        log.info(`Discovery response ${JSON.stringify(result)}`);
        return result;
    },

    'Alexa.PowerController': async ({ header, endpoint }, api) => {
        const switchState = header.name === 'TurnOn' ? 1 : 0;

        await api.setSwitchState(endpoint.endpointId, switchState);

        // get device ID passed in during discovery
        const responseHeader = header;
        responseHeader.namespace = 'Alexa';
        responseHeader.name = 'Response';
        responseHeader.messageId = responseHeader.messageId + '-R';

        const powerResult = !!switchState ? 'ON' : 'OFF';

        const result = {
            context: {
                properties: [
                    {
                        namespace: 'Alexa.PowerController',
                        name: 'powerState',
                        value: powerResult,
                        timeOfSample: new Date().toISOString(),
                        uncertaintyInMilliseconds: 500,
                    },
                ],
            },
            event: {
                header: responseHeader,
                endpoint: endpoint,
                payload: {},
            },
        };

        log.info(`PowerController response ${JSON.stringify(result)}`);

        return result;
    },
});
