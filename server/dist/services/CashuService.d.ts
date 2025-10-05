export interface CashuKey {
    id: string;
    amount: number;
    pubkey: string;
}
export interface CashuKeys {
    id: string;
    unit: string;
    keys: CashuKey[];
    maxAmount: number;
    precision: number;
}
export interface Proof {
    id: string;
    amount: number;
    secret: string;
    C: string;
    witness?: string;
}
export interface MintRequest {
    amount: number;
    unit: string;
}
export interface MintResponse {
    promises: Array<{
        id: string;
        amount: number;
        C: string;
        secret: string;
    }>;
    keys: CashuKey[];
    unit: string;
}
export interface RedeemRequest {
    proofs: Proof[];
    outputs?: Array<{
        id: string;
        amount: number;
        C: string;
        secret: string;
    }>;
}
export interface RedeemResponse {
    paid: number;
    change?: Proof[];
    outputs?: Array<{
        id: string;
        amount: number;
        C: string;
        secret: string;
    }>;
}
export interface SplitRequest {
    proofs: Proof[];
    outputs: number[];
}
export interface SplitResponse {
    success: Proof[];
    change: Proof[];
}
export interface VerifyRequest {
    proofs: Proof[];
}
export interface VerifyResponse {
    valid: boolean;
    amount: number;
    invalid?: Proof[];
}
export declare class CashuService {
    private mintUrl;
    private keysUrl;
    private keys;
    private lastKeyUpdate;
    private keyUpdateInterval;
    constructor(mintUrl: string, keysUrl?: string);
    private initializeKeys;
    private ensureKeysUpdated;
    mintTokens(request: MintRequest): Promise<MintResponse>;
    redeemTokens(request: RedeemRequest): Promise<RedeemResponse>;
    splitProofs(request: SplitRequest): Promise<SplitResponse>;
    verifyProofs(request: VerifyRequest): Promise<VerifyResponse>;
    getMintInfo(): Promise<{
        name: string;
        pubkey: string;
        unit: string;
        description?: string;
        contacts?: Array<{
            method: string;
            info: string;
        }>;
        nuts: {
            4: boolean;
            5: boolean;
            9: boolean;
        };
    }>;
    private generateMockKeys;
    private generateProofs;
    private isValidProof;
    private calculateProofAmount;
    checkAvailability(): Promise<boolean>;
    refreshKeys(): Promise<void>;
}
//# sourceMappingURL=CashuService.d.ts.map