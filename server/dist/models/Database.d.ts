export interface Transaction {
    id: string;
    depositor: string;
    recipient: string;
    tokenAddress: string;
    tokenSymbol: string;
    amount: string;
    fee: string;
    lightningInvoice: string;
    status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'failed' | 'refunded';
    privacySettings: string;
    createdAt: number;
    updatedAt: number;
    completedAt?: number;
    transactionHash?: string;
    error?: string;
    progress?: number;
}
export interface User {
    id: string;
    address: string;
    nonce: number;
    createdAt: number;
    lastActiveAt: number;
}
export interface PrivacySettings {
    privacyLevel: 'low' | 'medium' | 'high';
    delayHours: number;
    splitIntoMultiple: boolean;
    splitCount: number;
    useRandomAmounts: boolean;
}
export declare class Database {
    private db;
    constructor(dbPath: string);
    private initialize;
    createOrUpdateUser(address: string): Promise<User>;
    getUserByAddress(address: string): Promise<User | null>;
    createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction>;
    updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null>;
    getTransaction(id: string): Promise<Transaction | null>;
    getUserTransactions(userAddress: string, limit?: number, offset?: number, status?: string): Promise<{
        transactions: Transaction[];
        totalCount: number;
    }>;
    createMixingStep(transactionId: string, stepName: string, stepDescription: string): Promise<void>;
    updateMixingStep(transactionId: string, stepName: string, updates: {
        status?: string;
        progress?: number;
        startedAt?: number;
        completedAt?: number;
        error?: string;
    }): Promise<void>;
    getMixingSteps(transactionId: string): Promise<any[]>;
    close(): void;
}
export declare function getDatabase(): Database;
//# sourceMappingURL=Database.d.ts.map