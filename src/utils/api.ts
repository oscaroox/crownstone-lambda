import { UserCurrentLocation, SpherePresentPeople, UserInSphere } from './../interface';
import got, { Response } from 'got';
import { config } from './config';
import { User, Stone, SwitchState } from '../interface';
import { Headers } from 'actions-on-google';
import { createLogger } from './logger';
import { getAccessToken } from './getAccessToken';

const log = createLogger('api');

const baseGot = got.extend({
    responseType: 'json',
    hooks: {
        beforeRequest: [
            resp => {
                log.info(`Running ${resp.method} request for ${resp.url}`);
            },
        ],
    },
});

const cloudGot = baseGot.extend({
    prefixUrl: `${config.REMOTE_CLOUD_HOSTNAME}${config.REMOTE_CLOUD_BASE_PATH}`,
});

const eventHttp = baseGot.extend({
    prefixUrl: `${config.EVENT_SERVER_URL}`,
    headers: {
        Authorization: `Bearer ${config.EVENT_SERVER_JWT}`,
    },
});

const handleResponse = <T>(res: Response<T>) => res.body;

export type Api = ReturnType<typeof getApi>;

export const getApi = (headers: Headers | string) => {
    const accessToken = typeof headers !== 'string' ? getAccessToken(headers) : headers;
    const cloudHttp = cloudGot.extend({
        searchParams: {
            // eslint-disable-next-line @typescript-eslint/camelcase
            access_token: accessToken,
        },
    });

    const api = {
        getStones: () =>
            cloudHttp
                .get<Stone[]>('Stones', {
                    searchParams: { filter: JSON.stringify({ include: { abilities: 'properties' } }) },
                })
                .then(handleResponse),
        getStone: (stoneId: string) => cloudHttp.get<Stone>(`Stones/${stoneId}/owner`).then(handleResponse),
        setSwitchState: (stoneId: string, switchState: number) =>
            cloudHttp
                .put(`Stones/${stoneId}/setSwitchStateRemotely`, { searchParams: { switchState } })
                .then(handleResponse),
        getSwitchState: (stoneId: string) =>
            cloudHttp.get<SwitchState>(`Stones/${stoneId}/currentSwitchState`).then(handleResponse),
        setBrightness: (stoneId: string, brightness: number) => api.setSwitchState(stoneId, brightness / 100),
        getUser: () => cloudHttp.get<User>('users/me').then(handleResponse),
        getUserCurrentLocation: (user: User) =>
            cloudHttp.get<UserCurrentLocation[]>(`users/${user.id}/currentLocation`).then(handleResponse),
        getUsersInSphere: (sphereId: string) =>
            cloudHttp.get<UserInSphere>(`Spheres/${sphereId}/users`).then(handleResponse),
        getPresentPeopleInSphere: (sphereId: string) =>
            cloudHttp.get<SpherePresentPeople[]>(`Spheres/${sphereId}/presentPeople`).then(handleResponse),

        setEventListener: (user: User) =>
            eventHttp.post('users', { json: { userId: user.id, accessToken } }).then(handleResponse),
        removeEventListener: (user: User) =>
            eventHttp.post('users/disconnect', { json: { userId: user.id } }).then(handleResponse),
    };

    return api;
};
