import sqlite3 from 'sqlite3';
import { Database as SQLiteDatabase } from 'sqlite3';
import path from 'path';
import fs from 'fs';

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
  privacySettings: string; // JSON string
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

export class Database {
  private db: SQLiteDatabase;

  constructor(dbPath: string) {
    this.db = new sqlite3.Database(dbPath);
    this.initialize();
  }

  private initialize(): void {
    this.db.serialize(() => {
      // Create users table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          address TEXT UNIQUE NOT NULL,
          nonce INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL,
          last_active_at INTEGER NOT NULL
        )
      `);

      // Create transactions table
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

      // Create mixing_steps table for detailed progress tracking
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

      // Create indexes for better performance
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_users_address ON users(address)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_user_address ON transactions(user_address)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_mixing_steps_transaction_id ON mixing_steps(transaction_id)`);
    });
  }

  // User operations
  async createOrUpdateUser(address: string): Promise<User> {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const userId = `user_${address.slice(2, 10)}_${now}`;

      this.db.run(
        `INSERT OR REPLACE INTO users (id, address, created_at, last_active_at) VALUES (?, ?, ?, ?)`,
        [userId, address, now, now],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: userId,
              address,
              nonce: 0,
              createdAt: now,
              lastActiveAt: now,
            });
          }
        }
      );
    });
  }

  async getUserByAddress(address: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE address = ?',
        [address],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve({
              id: row.id,
              address: row.address,
              nonce: row.nonce,
              createdAt: row.created_at,
              lastActiveAt: row.last_active_at,
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  // Transaction operations
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const transactionId = `tx_${now}_${Math.random().toString(36).substr(2, 9)}`;

      this.db.run(
        `INSERT INTO transactions (
          id, user_address, recipient, token_address, token_symbol,
          amount, fee, lightning_invoice, status, privacy_settings,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
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
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              ...transaction,
              id: transactionId,
              createdAt: now,
              updatedAt: now,
            });
          }
        }
      );
    });
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    return new Promise((resolve, reject) => {
      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = ?${index > 0 ? ', ' : ''}`)
        .join(', ');
      const values = Object.values(updates);
      values.push(Date.now()); // updated_at
      values.push(id);

      this.db.run(
        `UPDATE transactions SET ${setClause}, updated_at = ? WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM transactions WHERE id = ?',
        [id],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (row) {
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
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async getUserTransactions(
    userAddress: string,
    limit: number = 50,
    offset: number = 0,
    status?: string
  ): Promise<{ transactions: Transaction[]; totalCount: number }> {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM transactions WHERE user_address = ?';
      const params: any[] = [userAddress];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      this.db.all(query, params, (err, rows: any[]) => {
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

        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM transactions WHERE user_address = ?';
        const countParams: any[] = [userAddress];

        if (status) {
          countQuery += ' AND status = ?';
          countParams.push(status);
        }

        this.db.get(countQuery, countParams, (err, countRow: any) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              transactions,
              totalCount: countRow.count,
            });
          }
        });
      });
    });
  }

  // Mixing steps operations
  async createMixingStep(
    transactionId: string,
    stepName: string,
    stepDescription: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO mixing_steps (transaction_id, step_name, step_description) VALUES (?, ?, ?)`,
        [transactionId, stepName, stepDescription],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async updateMixingStep(
    transactionId: string,
    stepName: string,
    updates: {
      status?: string;
      progress?: number;
      startedAt?: number;
      completedAt?: number;
      error?: string;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = ?${index > 0 ? ', ' : ''}`)
        .join(', ');
      const values = Object.values(updates);
      values.push(transactionId, stepName);

      this.db.run(
        `UPDATE mixing_steps SET ${setClause} WHERE transaction_id = ? AND step_name = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async getMixingSteps(transactionId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM mixing_steps WHERE transaction_id = ? ORDER BY id',
        [transactionId],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  close(): void {
    this.db.close();
  }
}

// Singleton database instance
let dbInstance: Database | null = null;

export function getDatabase(): Database {
  if (!dbInstance) {
    const dbPath = process.env.DATABASE_PATH || './database/mixer.db';

    // Ensure database directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    dbInstance = new Database(dbPath);
  }

  return dbInstance;
}