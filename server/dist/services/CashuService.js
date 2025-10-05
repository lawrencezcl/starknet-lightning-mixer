"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashuService = void 0;
const helpers_1 = require("../utils/helpers");
class CashuService {
    constructor(mintUrl, keysUrl) {
        this.keys = null;
        this.lastKeyUpdate = 0;
        this.keyUpdateInterval = 5 * 60 * 1000;
        this.mintUrl = mintUrl;
        this.keysUrl = keysUrl || `${mintUrl}/keys`;
        this.initializeKeys();
    }
    async initializeKeys() {
        try {
            console.log('Fetching Cashu mint keys...');
            this.keys = this.generateMockKeys();
            this.lastKeyUpdate = Date.now();
            console.log(`Loaded ${this.keys.keys.length} Cashu keys for unit ${this.keys.unit}`);
        }
        catch (error) {
            console.error('Failed to initialize Cashu keys:', error);
            throw new Error(`Failed to initialize Cashu keys: ${error}`);
        }
    }
    async ensureKeysUpdated() {
        const now = Date.now();
        if (!this.keys || (now - this.lastKeyUpdate) > this.keyUpdateInterval) {
            await this.initializeKeys();
        }
    }
    async mintTokens(request) {
        await this.ensureKeysUpdated();
        try {
            if (!this.keys) {
                throw new Error('Cashu keys not available');
            }
            console.log(`Minting ${request.amount} ${request.unit} Cashu tokens`);
            const promises = this.generateProofs(request.amount);
            const response = {
                promises,
                keys: this.keys.keys,
                unit: this.keys.unit,
            };
            console.log(`Successfully minted Cashu tokens`);
            return response;
        }
        catch (error) {
            console.error('Error minting Cashu tokens:', error);
            throw new Error(`Failed to mint Cashu tokens: ${error}`);
        }
    }
    async redeemTokens(request) {
        await this.ensureKeysUpdated();
        try {
            console.log(`Redeeming ${request.proofs.length} Cashu proofs`);
            const verification = await this.verifyProofs({ proofs: request.proofs });
            if (!verification.valid) {
                throw new Error('Invalid proofs provided for redemption');
            }
            const totalAmount = this.calculateProofAmount(request.proofs);
            const response = {
                paid: totalAmount,
            };
            if (request.outputs && request.outputs.length > 0) {
                const outputAmount = request.outputs.reduce((sum, output) => sum + output.amount, 0);
                const changeAmount = totalAmount - outputAmount;
                if (changeAmount > 0) {
                    response.change = this.generateProofs(changeAmount);
                }
                response.outputs = request.outputs;
            }
            console.log(`Successfully redeemed ${totalAmount} Cashu tokens`);
            return response;
        }
        catch (error) {
            console.error('Error redeeming Cashu tokens:', error);
            throw new Error(`Failed to redeem Cashu tokens: ${error}`);
        }
    }
    async splitProofs(request) {
        await this.ensureKeysUpdated();
        try {
            console.log(`Splitting ${request.proofs.length} proofs into ${request.outputs.length} outputs`);
            const verification = await this.verifyProofs({ proofs: request.proofs });
            if (!verification.valid) {
                throw new Error('Invalid proofs provided for splitting');
            }
            const totalInputAmount = this.calculateProofAmount(request.proofs);
            const totalOutputAmount = request.outputs.reduce((sum, amount) => sum + amount, 0);
            if (totalInputAmount < totalOutputAmount) {
                throw new Error('Insufficient input amount for requested outputs');
            }
            const successProofs = [];
            for (const amount of request.outputs) {
                const proofs = this.generateProofs(amount);
                successProofs.push(...proofs);
            }
            const changeAmount = totalInputAmount - totalOutputAmount;
            let changeProofs = [];
            if (changeAmount > 0) {
                changeProofs = this.generateProofs(changeAmount);
            }
            const response = {
                success: successProofs,
                change: changeProofs,
            };
            console.log(`Successfully split proofs: ${successProofs.length} success, ${changeProofs.length} change`);
            return response;
        }
        catch (error) {
            console.error('Error splitting Cashu proofs:', error);
            throw new Error(`Failed to split Cashu proofs: ${error}`);
        }
    }
    async verifyProofs(request) {
        await this.ensureKeysUpdated();
        try {
            console.log(`Verifying ${request.proofs.length} Cashu proofs`);
            const validProofs = [];
            const invalidProofs = [];
            for (const proof of request.proofs) {
                if (this.isValidProof(proof)) {
                    validProofs.push(proof);
                }
                else {
                    invalidProofs.push(proof);
                }
            }
            const totalAmount = validProofs.reduce((sum, proof) => sum + proof.amount, 0);
            const response = {
                valid: invalidProofs.length === 0,
                amount: totalAmount,
                invalid: invalidProofs.length > 0 ? invalidProofs : undefined,
            };
            console.log(`Verification complete: ${validProofs.length} valid, ${invalidProofs.length} invalid`);
            return response;
        }
        catch (error) {
            console.error('Error verifying Cashu proofs:', error);
            throw new Error(`Failed to verify Cashu proofs: ${error}`);
        }
    }
    async getMintInfo() {
        try {
            return {
                name: 'Starknet Lightning Mixer Mint',
                pubkey: (0, helpers_1.generateId)('mint_pubkey'),
                unit: 'sat',
                description: 'Cashu mint for Starknet Lightning Privacy Mixer',
                contacts: [
                    {
                        method: 'email',
                        info: 'support@starknetmixer.com',
                    },
                ],
                nuts: {
                    4: true,
                    5: true,
                    9: true,
                },
            };
        }
        catch (error) {
            console.error('Error getting mint info:', error);
            throw new Error(`Failed to get mint info: ${error}`);
        }
    }
    generateMockKeys() {
        const keySetId = (0, helpers_1.generateId)('keyset');
        const keys = [];
        const amounts = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
        for (const amount of amounts) {
            keys.push({
                id: `${keySetId}_${amount}`,
                amount,
                pubkey: (0, helpers_1.generateId)(`pubkey_${amount}`),
            });
        }
        return {
            id: keySetId,
            unit: 'sat',
            keys,
            maxAmount: amounts.reduce((sum, amount) => sum + amount, 0),
            precision: 0,
        };
    }
    generateProofs(amount) {
        if (!this.keys) {
            throw new Error('Keys not available');
        }
        const proofs = [];
        let remainingAmount = amount;
        for (const key of this.keys.keys.sort((a, b) => b.amount - a.amount)) {
            if (remainingAmount >= key.amount) {
                const count = Math.floor(remainingAmount / key.amount);
                for (let i = 0; i < count; i++) {
                    proofs.push({
                        id: key.id,
                        amount: key.amount,
                        C: (0, helpers_1.generateId)('commitment'),
                        secret: (0, helpers_1.generateId)('secret'),
                    });
                }
                remainingAmount -= count * key.amount;
            }
        }
        return proofs;
    }
    isValidProof(proof) {
        return (proof.id.length > 0 &&
            proof.amount > 0 &&
            proof.secret.length > 0 &&
            proof.C.length > 0);
    }
    calculateProofAmount(proofs) {
        return proofs.reduce((sum, proof) => sum + proof.amount, 0);
    }
    async checkAvailability() {
        try {
            await this.getMintInfo();
            return true;
        }
        catch (error) {
            console.error('Cashu mint not available:', error);
            return false;
        }
    }
    async refreshKeys() {
        console.log('Refreshing Cashu keys...');
        await this.initializeKeys();
    }
}
exports.CashuService = CashuService;
//# sourceMappingURL=CashuService.js.map