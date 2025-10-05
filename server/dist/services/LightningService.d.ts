import { ChannelBalance } from '../types/Lightning';
export interface LightningNodeConfig {
    host: string;
    port: number;
    macaroon: string;
    cert: string;
}
export interface CreateInvoiceParams {
    amount: number;
    memo?: string;
    expiry?: number;
    private?: boolean;
}
export interface PayInvoiceParams {
    invoice: string;
    maxFee?: number;
    timeout?: number;
}
export interface InvoiceResponse {
    paymentRequest: string;
    paymentHash: string;
    addIndex: string;
    rHash: string;
    rPreimage: string;
    value: number;
    settled: boolean;
    creationDate: number;
    settleDate?: number;
    expiry: number;
    memo?: string;
    private: boolean;
    amtPaidSat?: string;
    description?: string;
}
export interface PaymentResponse {
    paymentHash: string;
    paymentPreimage: string;
    value: number;
    fee: number;
    status: string;
    creationDate: number;
    paymentIndex: string;
}
export declare class LightningService {
    private config;
    constructor(config: LightningNodeConfig);
    createInvoice(params: CreateInvoiceParams): Promise<InvoiceResponse>;
    payInvoice(params: PayInvoiceParams): Promise<PaymentResponse>;
    lookupInvoice(paymentHash: string): Promise<InvoiceResponse | null>;
    getChannelBalance(): Promise<ChannelBalance>;
    getWalletBalance(): Promise<{
        confirmedBalance: number;
        unconfirmedBalance: number;
    }>;
    listTransactions(): Promise<any[]>;
    connectPeer(pubKey: string, host: string, port: number): Promise<void>;
    openChannel(pubKey: string, localFundingAmount: number, pushSat?: number, private?: boolean): Promise<void>;
    closeChannel(fundingTxid: string, outputIndex: number, force?: boolean): Promise<void>;
    private generateMockInvoice;
    private extractPaymentHash;
    private extractInvoiceAmount;
    checkConnectivity(): Promise<boolean>;
    getNodeInfo(): Promise<any>;
}
//# sourceMappingURL=LightningService.d.ts.map