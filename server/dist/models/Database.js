"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
exports.getDatabase = getDatabase;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class Database {
    constructor(dbPath) {
        this.db = new sqlite3_1.default.Database(dbPath);
        this.initialize();
    }
    initialize() {
        this.db.serialize(() => {
            this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          address TEXT UNIQUE NOT NULL,
          nonce INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL,
          last_active_at INTEGER NOT NULL
        )
      `);
            this.db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          user_address TEXT NOT NULL,
          recipient TEXT NOT NULL,
          token_address TEXT NOT NULL,
          token_symbol TEXT NOT NULL,
          amount TEXT NOT NULL,
          fee TEXT NOT NULL,
          lightning_invoice TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          privacy_settings TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          completed_at INTEGER,
          transaction_hash TEXT,
          error TEXT,
          progress INTEGER DEFAULT 0,
          FOREIGN KEY (user_address) REFERENCES users (address)
        )
      `);
            this.db.run(`
        CREATE TABLE IF NOT EXISTS mixing_steps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          transaction_id TEXT NOT NULL,
          step_name TEXT NOT NULL,
          step_description TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          progress INTEGER DEFAULT 0,
          started_at INTEGER,
          completed_at INTEGER,
          error TEXT,
          FOREIGN KEY (transaction_id) REFERENCES transactions (id)
        )
      `);
            this.db.run(`CREATE INDEX IF NOT EXISTS idx_users_address ON users(address)`);
            this.db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_user_address ON transactions(user_address)`);
            this.db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`);
            this.db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)`);
            this.db.run(`CREATE INDEX IF NOT EXISTS idx_mixing_steps_transaction_id ON mixing_steps(transaction_id)`);
        });
    }
    async createOrUpdateUser(address) {
        return new Promise((resolve, reject) => {
            const now = Date.now();
            const userId = `user_${address.slice(2, 10)}_${now}`;
            this.db.run(`INSERT OR REPLACE INTO users (id, address, created_at, last_active_at) VALUES (?, ?, ?, ?)`, [userId, address, now, now], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        id: userId,
                        address,
                        nonce: 0,
                        createdAt: now,
                        lastActiveAt: now,
                    });
                }
            });
        });
    }
    async getUserByAddress(address) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE address = ?', [address], (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (row) {
                    resolve({
                        id: row.id,
                        address: row.address,
                        nonce: row.nonce,
                        createdAt: row.created_at,
                        lastActiveAt: row.last_active_at,
                    });
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    async createTransaction(transaction) {
        return new Promise((resolve, reject) => {
            const now = Date.now();
            const transactionId = `tx_${now}_${Math.random().toString(36).substr(2, 9)}`;
            this.db.run(`INSERT INTO transactions (
          id, user_address, recipient, token_address, token_symbol,
          amount, fee, lightning_invoice, status, privacy_settings,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                transactionId,
                transaction.depositor,
                transaction.recipient,
                transaction.tokenAddress,
                transaction.tokenSymbol,
                transaction.amount,
                transaction.fee,
                transaction.lightningInvoice,
                transaction.status,
                JSON.stringify(transaction.privacySettings),
                now,
                now,
            ], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        ...transaction,
                        id: transactionId,
                        createdAt: now,
                        updatedAt: now,
                    });
                }
            });
        });
    }
    async updateTransaction(id, updates) {
        return new Promise((resolve, reject) => {
            const setClause = Object.keys(updates)
                .map((key, index) => `${key} = ?${index > 0 ? ', ' : ''}`)
                .join(', ');
            const values = Object.values(updates);
            values.push(Date.now());
            values.push(id);
            this.db.run(`UPDATE transactions SET ${setClause}, updated_at = ? WHERE id = ?`, values, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    async getTransaction(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM transactions WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (row) {
                    resolve({
                        id: row.id,
                        depositor: row.user_address,
                        recipient: row.recipient,
                        tokenAddress: row.token_address,
                        tokenSymbol: row.token_symbol,
                        amount: row.amount,
                        fee: row.fee,
                        lightningInvoice: row.lightning_invoice,
                        status: row.status,
                        privacySettings: JSON.parse(row.privacy_settings),
                        createdAt: row.created_at,
                        updatedAt: row.updated_at,
                        completedAt: row.completed_at,
                        transactionHash: row.transaction_hash,
                        error: row.error,
                        progress: row.progress,
                    });
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    async getUserTransactions(userAddress, limit = 50, offset = 0, status) {
        return new Promise((resolve, reject) => {
            let query = 'SELECT * FROM transactions WHERE user_address = ?';
            const params = [userAddress];
            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const transactions = rows.map(row => ({
                    id: row.id,
                    depositor: row.user_address,
                    recipient: row.recipient,
                    tokenAddress: row.token_address,
                    tokenSymbol: row.token_symbol,
                    amount: row.amount,
                    fee: row.fee,
                    lightningInvoice: row.lightning_invoice,
                    status: row.status,
                    privacySettings: JSON.parse(row.privacy_settings),
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                    completedAt: row.completed_at,
                    transactionHash: row.transaction_hash,
                    error: row.error,
                    progress: row.progress,
                }));
                let countQuery = 'SELECT COUNT(*) as count FROM transactions WHERE user_address = ?';
                const countParams = [userAddress];
                if (status) {
                    countQuery += ' AND status = ?';
                    countParams.push(status);
                }
                this.db.get(countQuery, countParams, (err, countRow) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve({
                            transactions,
                            totalCount: countRow.count,
                        });
                    }
                });
            });
        });
    }
    async createMixingStep(transactionId, stepName, stepDescription) {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO mixing_steps (transaction_id, step_name, step_description) VALUES (?, ?, ?)`, [transactionId, stepName, stepDescription], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async updateMixingStep(transactionId, stepName, updates) {
        return new Promise((resolve, reject) => {
            const setClause = Object.keys(updates)
                .map((key, index) => `${key} = ?${index > 0 ? ', ' : ''}`)
                .join(', ');
            const values = Object.values(updates);
            values.push(transactionId, stepName);
            this.db.run(`UPDATE mixing_steps SET ${setClause} WHERE transaction_id = ? AND step_name = ?`, values, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async getMixingSteps(transactionId) {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM mixing_steps WHERE transaction_id = ? ORDER BY id', [transactionId], (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    close() {
        this.db.close();
    }
}
exports.Database = Database;
let dbInstance = null;
function getDatabase() {
    if (!dbInstance) {
        const dbPath = process.env.DATABASE_PATH || './database/mixer.db';
        const dbDir = path_1.default.dirname(dbPath);
        if (!fs_1.default.existsSync(dbDir)) {
            fs_1.default.mkdirSync(dbDir, { recursive: true });
        }
        dbInstance = new Database(dbPath);
    }
    return dbInstance;
}
//# sourceMappingURL=Database.js.map