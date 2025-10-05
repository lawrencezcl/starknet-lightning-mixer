import { describe, it, expect, beforeEach } from '@jest/globals';
import { starknet } from 'hardhat';
import { Account, Contract, ec } from 'starknet';

describe('StarknetLightningMixer', () => {
  let mixerContract: Contract;
  let tokenContract: Contract;
  let admin: Account;
  let user1: Account;
  let user2: Account;

  beforeEach(async () => {
    // Setup accounts
    admin = await starknet.deployAccount('OpenZeppelin');
    user1 = await starknet.deployAccount('OpenZeppelin');
    user2 = await starknet.deployAccount('OpenZeppelin');

    // Deploy contracts
    const mixerFactory = await starknet.getContractFactory('StarknetLightningMixer');
    mixerContract = await mixerFactory.deploy({
      operator_address: admin.address,
      fee_recipient: admin.address,
      min_deposit: { low: 100, high: 0 },
      max_deposit: { low: 1000000, high: 0 },
      fee_percentage: { low: 50, high: 0 }, // 0.5%
      required_signatures: 1,
    });

    // Deploy mock token contract for testing
    const tokenFactory = await starknet.getContractFactory('MockToken');
    tokenContract = await tokenFactory.deploy({
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 18,
      initial_supply: { low: 1000000, high: 0 },
      recipient: user1.address,
    });

    // Mint additional tokens to users
    await tokenContract.mint(user2.address, { low: 500000, high: 0 });
  });

  describe('Contract Configuration', () => {
    it('should have correct initial configuration', async () => {
      const config = await mixerContract.get_config();
      expect(config.operator_address).toEqual(admin.address);
      expect(config.fee_recipient).toEqual(admin.address);
      expect(config.min_deposit).toEqual({ low: 100, high: 0 });
      expect(config.max_deposit).toEqual({ low: 1000000, high: 0 });
      expect(config.fee_percentage).toEqual({ low: 50, high: 0 });
      expect(config.paused).toEqual(0);
    });

    it('should have zero initial transaction count', async () => {
      const count = await mixerContract.get_transaction_count();
      expect(count).toEqual({ low: 0, high: 0 });
    });

    it('should have zero initial fees', async () => {
      const fees = await mixerContract.get_total_fees();
      expect(fees).toEqual({ low: 0, high: 0 });
    });
  });

  describe('Deposit Functionality', () => {
    it('should accept valid deposit', async () => {
      const amount = { low: 1000, high: 0 };
      const lightningInvoice = 'lnbc1000n1p3k...';

      // Approve tokens to mixer contract
      await tokenContract.approve(mixerContract.address, amount);

      // Make deposit
      const tx = await mixerContract.deposit(
        tokenContract.address,
        amount,
        lightningInvoice
      );

      expect(tx.events).toContainEqual({
        type: 'DepositReceived',
        keys: [
          'transaction_id',
          'depositor',
          'amount',
          'token_address'
        ],
        data: [
          { low: 0, high: 0 }, // First transaction ID
          user1.address,
          amount,
          tokenContract.address
        ]
      });

      // Check transaction was created
      const transaction = await mixerContract.get_transaction({ low: 0, high: 0 });
      expect(transaction.depositor).toEqual(user1.address);
      expect(transaction.token_address).toEqual(tokenContract.address);
      expect(transaction.status).toEqual(0); // Pending
      expect(transaction.lightning_invoice).toEqual(lightningInvoice);
    });

    it('should reject deposit below minimum', async () => {
      const amount = { low: 50, high: 0 }; // Below minimum of 100
      const lightningInvoice = 'lnbc50n1p3k...';

      await expect(
        mixerContract.deposit(
          tokenContract.address,
          amount,
          lightningInvoice
        )
      ).rejects.toThrow('Amount below minimum');
    });

    it('should reject deposit above maximum', async () => {
      const amount = { low: 2000000, high: 0 }; // Above maximum of 1000000
      const lightningInvoice = 'lnbc2000000n1p3k...';

      await expect(
        mixerContract.deposit(
          tokenContract.address,
          amount,
          lightningInvoice
        )
      ).rejects.toThrow('Amount above maximum');
    });

    it('should calculate correct fee', async () => {
      const amount = { low: 1000, high: 0 };
      const lightningInvoice = 'lnbc1000n1p3k...';

      // 0.5% fee on 1000 = 5
      await tokenContract.approve(mixerContract.address, amount);
      await mixerContract.deposit(tokenContract.address, amount, lightningInvoice);

      const transaction = await mixerContract.get_transaction({ low: 0, high: 0 });
      expect(transaction.fee).toEqual({ low: 5, high: 0 }); // 0.5% of 1000
      expect(transaction.amount).toEqual({ low: 995, high: 0 }); // 1000 - 5 fee
    });
  });

  describe('Withdrawal Functionality', () => {
    let transactionId: { low: number, high: number };

    beforeEach(async () => {
      // Create a deposit first
      const amount = { low: 1000, high: 0 };
      const lightningInvoice = 'lnbc1000n1p3k...';

      await tokenContract.approve(mixerContract.address, amount);
      await mixerContract.deposit(tokenContract.address, amount, lightningInvoice);
      transactionId = { low: 0, high: 0 }; // First transaction
    });

    it('should process valid withdrawal by operator', async () => {
      const multiSignature = [admin.address];

      const tx = await mixerContract.process_withdrawal(
        transactionId,
        user2.address,
        1, // signature count
        multiSignature
      );

      expect(tx.events).toContainEqual({
        type: 'TransactionCompleted',
        keys: ['transaction_id', 'amount', 'fee'],
        data: [transactionId, { low: 995, high: 0 }, { low: 5, high: 0 }]
      });

      expect(tx.events).toContainEqual({
        type: 'FeesCollected',
        keys: ['amount', 'recipient'],
        data: [{ low: 5, high: 0 }, admin.address]
      });

      // Check transaction status updated
      const transaction = await mixerContract.get_transaction(transactionId);
      expect(transaction.status).toEqual(3); // Completed
      expect(transaction.completed_at).toBeGreaterThan({ low: 0, high: 0 });
    });

    it('should reject withdrawal from non-operator', async () => {
      const multiSignature = [user1.address]; // Not authorized

      await expect(
        mixerContract.connect(user1).process_withdrawal(
          transactionId,
          user2.address,
          1,
          multiSignature
        )
      ).rejects.toThrow('Unauthorized operator');
    });

    it('should reject withdrawal for non-existent transaction', async () => {
      const nonExistentId = { low: 999, high: 0 };
      const multiSignature = [admin.address];

      await expect(
        mixerContract.process_withdrawal(
          nonExistentId,
          user2.address,
          1,
          multiSignature
        )
      ).rejects.toThrow('Transaction not found');
    });
  });

  describe('Access Control', () => {
    it('should allow admin to pause contract', async () => {
      await mixerContract.pause_contract();

      const config = await mixerContract.get_config();
      expect(config.paused).toEqual(1);

      expect(mixerContract.get_transaction_count()).resolves.toEqual({ low: 0, high: 0 });
    });

    it('should allow admin to unpause contract', async () => {
      await mixerContract.pause_contract();
      await mixerContract.unpause_contract();

      const config = await mixerContract.get_config();
      expect(config.paused).toEqual(0);
    });

    it('should reject pause from non-admin', async () => {
      await expect(
        mixerContract.connect(user1).pause_contract()
      ).rejects.toThrow('Unauthorized: not operator');
    });

    it('should reject deposits when paused', async () => {
      await mixerContract.pause_contract();

      const amount = { low: 1000, high: 0 };
      const lightningInvoice = 'lnbc1000n1p3k...';

      await expect(
        mixerContract.deposit(tokenContract.address, amount, lightningInvoice)
      ).rejects.toThrow('Contract is paused');
    });
  });

  describe('Fee Collection', () => {
    it('should accumulate fees correctly', async () => {
      // Make multiple deposits and withdrawals
      const amounts = [
        { low: 1000, high: 0 },
        { low: 2000, high: 0 },
        { low: 3000, high: 0 }
      ];

      for (let i = 0; i < amounts.length; i++) {
        await tokenContract.approve(mixerContract.address, amounts[i]);
        await mixerContract.deposit(
          tokenContract.address,
          amounts[i],
          `lnbc${amounts[i].low}n1p3k...`
        );

        // Process withdrawal
        await mixerContract.process_withdrawal(
          { low: i, high: 0 },
          user2.address,
          1,
          [admin.address]
        );
      }

      // Expected fees: 5 + 10 + 15 = 30
      const totalFees = await mixerContract.get_total_fees();
      expect(totalFees).toEqual({ low: 30, high: 0 });
    });
  });

  describe('Transaction Management', () => {
    it('should increment transaction counter', async () => {
      const amount = { low: 1000, high: 0 };
      const lightningInvoice = 'lnbc1000n1p3k...';

      // Make multiple deposits
      for (let i = 0; i < 3; i++) {
        await tokenContract.approve(mixerContract.address, amount);
        await mixerContract.deposit(
          tokenContract.address,
          amount,
          `${lightningInvoice}_${i}`
        );
      }

      const count = await mixerContract.get_transaction_count();
      expect(count).toEqual({ low: 3, high: 0 });
    });

    it('should maintain transaction order', async () => {
      const amounts = [
        { low: 1000, high: 0 },
        { low: 2000, high: 0 },
        { low: 3000, high: 0 }
      ];

      for (let i = 0; i < amounts.length; i++) {
        await tokenContract.approve(mixerContract.address, amounts[i]);
        await mixerContract.deposit(
          tokenContract.address,
          amounts[i],
          `lnbc${amounts[i].low}n1p3k...`
        );
      }

      // Check each transaction has correct amount
      for (let i = 0; i < amounts.length; i++) {
        const transaction = await mixerContract.get_transaction({ low: i, high: 0 });
        expect(transaction.amount).toEqual({
          low: amounts[i].low - Math.floor(amounts[i].low * 0.005), // minus fee
          high: 0
        });
      }
    });
  });
});