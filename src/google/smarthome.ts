import { smarthome, SmartHomeV1SyncDevices, SmartHomeV1QueryResponse } from 'actions-on-google';
import { config } from '../utils/config';
import { getApi } from '../utils/api';
import { createLogger } from '../utils/logger';
import flatten from 'lodash.flattendeep';
import { CustomData } from '../interface';

const log = createLogger('google/smarthome');

export const smarthomeApp = smarthome({
    jwt: config.GOOGLE_SERVICE_KEY,
    debug: true,
});

/**
 * This method is invoked when we receive a "Discovery" message from a Google Home smart action.
 * We are expected to respond back with a list of appliances that we have discovered for a given
 * customer.
 */
smarthomeApp.onSync(async (body, headers) => {
    const api = getApi(headers);

    // fetch the user and their crownstones
    const user = await api.getUser();
    const stones = await api.getStones();
    console.log('fetching user');
    // add the user to the even server
    await api.setEventListener(user);

    log.info(`stones: ${JSON.stringify(stones)}`);
    log.info(`user: ${JSON.stringify(user)}`);
    const devices: SmartHomeV1SyncDevices[] = [];

    for (const stone of stones) {
        log.info(`stone: ${JSON.stringify(stone)}`);
        let deviceType = 'action.devices.types.OUTLET';
        const traits = ['action.devices.traits.OnOff'];

        // if this crownstone has dimming enable add the brightness trait
        const canDim = stone?.abilities?.find(v => v.type === 'dimming');
        const canTapToToggle = stone?.abilities?.find(v => v.type === 'tapToToggle');
        const canSwitchcraft = stone?.abilities?.find(v => v.type === 'switchcraft');

        if (canDim && canDim.enabled) {
            traits.push('action.devices.traits.Brightness');
            // if this stone supports dimming, we know that this is a light
            deviceType = 'action.devices.types.LIGHT';
        }

        devices.push({
            id: stone.id,
            type: deviceType,
            traits,
            name: {
                defaultNames: [stone.name],
                name: stone.name,
                nicknames: [stone.name],
            },
            willReportState: true,
            attributes: {
                commandOnlyOnOff: true,
            },
            deviceInfo: {
                manufacturer: 'Crownstone',
                model: stone.type,
                hwVersion: stone.hardwareVersion,
                swVersion: stone.firmwareVersion,
            },
            // we can use this property to append custom data for a crownstone
            // we can check if dimming is enabled in Query intent, so we can also send the brightness to google
            customData: {
                dimmingEnabled: canDim?.enabled || false,
                tapToToggle: canTapToToggle?.enabled || false,
                switchCraft: canSwitchcraft?.enabled || false,
            } as CustomData,
        });
    }

    const res = {
        requestId: body.requestId,
        payload: {
            agentUserId: user.id,
            devices,
        },
    };

    log.info(`Response on Sync ${JSON.stringify(res)}`);
    return res;
});

/**
 * This method is invoked when we receive a "EXECUTE" message from Google Home smart action.
 * We are expected to execute the intent received and tell google to resync state
 */
smarthomeApp.onExecute(async (body, headers) => {
    const api = getApi(headers);
    const inputs = body.inputs;

    const user = await api.getUser();

    const stones = flatten(inputs.map(v => v.payload).map(v => flatten(v.commands.map(x => x.devices))));

    const executions = flatten(inputs.map(v => v.payload).map(v => flatten(v.commands.map(x => x.execution))));

    let onState = false;
    let onBrightness = 0;

    log.info(`command ${JSON.stringify(executions)}`);
    for (const execution of executions) {
        switch (execution.command) {
            case 'action.devices.commands.OnOff':
                for (const stone of stones) {
                    // get current switch state from corwnstone
                    const data = await api.getSwitchState(stone.id);
                    onState = execution.params.on;
                    onBrightness = data.switchState;

                    // send switch state to the crownstone
                    await api.setSwitchState(stone.id, execution.params.on ? 1 : 0);

                    // create new state for the crownstone
                    const newState = {
                        agentUserId: user.id,
                        requestId: body.requestId,
                        payload: {
                            devices: {
                                states: {
                                    [stone.id]: {
                                        on: onState,
                                        brightness: onBrightness,
                                        online: true,
                                    },
                                },
                            },
                        },
                    };
                    log.info(`new state ${JSON.stringify(newState)}`);
                    // reporting the new state of a device is required by Google.
                    await smarthomeApp.reportState(newState);
                }
                break;
            case 'action.devices.commands.BrightnessAbsolute':
                for (const stone of stones) {
                    // if dimming is not enabled for this crownstone skip this loop iteration
                    if (!(stone.customData as CustomData).dimmingEnabled) continue;
                    onBrightness = execution.params.brightness;
                    onState = onBrightness > 0;
                    await api.setBrightness(stone.id, onBrightness);
                    const newState = {
                        agentUserId: user.id,
                        requestId: body.requestId,
                        payload: {
                            devices: {
                                states: {
                                    [stone.id]: {
                                        on: onState,
                                        brightness: onBrightness,
                                        online: true,
                                    },
                                },
                            },
                        },
                    };
                    log.info(`new state ${JSON.stringify(newState)}`);
                    // reporting the new state of a device is required by Google.
                    await smarthomeApp.reportState(newState);
                }
                break;
        }
    }

    const command = {
        ids: stones.map(v => v.id),
        status: 'SUCCESS' as 'SUCCESS',
        states: {
            on: onState,
            brightness: onBrightness,
            online: true,
        },
    };

    const res = {
        requestId: body.requestId,
        payload: {
            commands: [command],
        },
    };

    log.info(`Response on Execute ${JSON.stringify(res)}`);
    return res;
});

/**
 * This method is invoked when we receive a "QUERY" message from Google Gome smart action.
 * We are expected to return a list of appliances and the appliance status
 */
smarthomeApp.onQuery(async (body, headers) => {
    const api = getApi(headers);

    const res: SmartHomeV1QueryResponse = {
        requestId: body.requestId,
        payload: {
            devices: {},
        },
    };

    const devices = flatten(body.inputs.map(v => v.payload.devices));

    const ids = devices.map(v => ({ id: v.id, customData: v.customData as CustomData }));

    // get the status for each crownstone
    const promises = ids.map(value =>
        api.getSwitchState(value.id).then(data => {
            const state = {
                on: data.switchState !== 0,
                ...(value.customData.dimmingEnabled ? { brightness: data.switchState * 100 } : {}),
            };
            res.payload.devices[value.id] = state;
        }),
    );

    await Promise.all(promises);

    log.info(`Response on Query ${JSON.stringify(res)}`);
    return res;
});

/**
 * This method is invoked when we receive a "DISCONNECT" message from Google Gome smart action.
 * We are expected to stop reporting the crownstone state of this users devices to Google.
 */
smarthomeApp.onDisconnect(async (body, headers) => {
    const api = getApi(headers);
    const user = await api.getUser();

    // remove user from event server listener
    await api.removeEventListener(user);
});
