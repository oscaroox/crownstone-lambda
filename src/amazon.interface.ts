export type DirectiveHeader = {
    namespace: string;
    name: string;
    payloadVersion: string;
    messageId: string;
};

type Scope = {
    type: string;
    token: string;
};

export type DirectivePayload = {
    scope: Scope;
};

export type Mappable<T = any> = {
    [key: string]: T;
};
export type Directive = {
    header: DirectiveHeader;
    payload: DirectivePayload;
    endpoint: Endpoint;
};

export type Endpoint = {
    scope: Scope;
    endpointId: string;
    cookie: Mappable<string>;
};

export interface AmazonSmartHomeSkillEvent {
    directive: Directive;
}

type IntentSlot = { name: string; value: any };

export interface AmazonCustomSkillEvent {
    session: {
        new: boolean;
        sessionId: string;
        application: {
            applicationId: string;
        };
        user: {
            userId: string;
            accessToken: string;
        };
    };
    request: {
        type: 'IntentRequest';
        requestId: string;
        timestamp: string;
        locale: string;
        intent: {
            name: string;
            slots: Mappable<IntentSlot>;
        };
    };
}
