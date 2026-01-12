export interface ApiTokenResponse {
    expiration: string;
    token: string;
    user: {
        id: number;
        name: string;
    };
}
