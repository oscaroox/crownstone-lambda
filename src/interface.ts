export interface User {
    id: string;
    firstName: string;
    lastName: string;
}

export interface SwitchState {
    switchState: 0 | 1;
}

export interface CustomData {
    dimmingEnabled: boolean;
    tapToToggle: boolean;
    onlyOnWhenDark: boolean;
    locked: boolean;
    switchCraft: boolean;
}

export interface Stone {
    id: string;
    name: string;
    address: string;
    description: string;
    type: string;
    dimmingEnabled: false;
    deviceType: string;
    major: number;
    minor: number;
    uid: number;
    icon: string;
    json: string;
    touchToToggle: boolean;
    tapToToggle: boolean;
    lastSeenAt: Date;
    firmwareVersion: string;
    bootloaderVersion: string;
    hardwareVersion: string;
    onlyOnWhenDark: boolean;
    hidden: boolean;
    locked: boolean;
    switchCraft: boolean;
    meshDeviceKey: string;
    locationId: string;
    sphereId: string;
    createdAt: Date;
    updatedAt: Date;
    currentPowerUsageId: string;
    currentEnergyUsageId: string;
    applianceId: string;
    currentSwitchStateId: string;
    abilities?: Ability[];
}

export interface Sphere {
    id: string;
    name: string;
}

export interface Ability {
    type: 'dimming' | 'switchcraft' | 'tapToToggle';
    enabled: boolean;
    syncedToCrownstone: boolean;
    id: string;
    stoneId: string;
    sphereId: string;
    createdAt: string;
    updatedAt: string;
    properties: any[];
}

export interface UserCurrentLocation {
    deviceId: string;
    deviceName: string;
    inSpheres: {
        sphereId: string;
        sphereName: string;
        inLocations: {};
    }[];
}

export interface SpherePresentPeople {
    userId: string;
    locations: [];
}

export interface UserInSphere {
    admins: User[];
    members: User[];
    guests: User[];
}
