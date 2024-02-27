// @ts ctx types for database

export type User = {
    id?: number;
    uid: string;
    name?: string;
    email?: string;
    address: string;
    is_listed: boolean;
    createdAt?: Date;
}