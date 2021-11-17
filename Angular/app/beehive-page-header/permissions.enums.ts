export enum Role {
    deAdministrator = 1,
    deManager = 2,
    deApprover = 3,
    deContributor = 4,
    deDisclosureEditor = 5,
    deSlxAdministrator = 6,
    deMeetingManager = 7,
    deFacebookEditor = 8,
    deThemeEditor = 9
}

export interface ButtonProperties {
    text: string;
    isRoleNeeded?: boolean;
    roleType?: Role
}