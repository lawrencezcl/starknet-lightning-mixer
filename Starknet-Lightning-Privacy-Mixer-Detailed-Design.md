# Starknet Lightning Privacy Mixer - Detailed Design Document

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Smart Contract Design](#smart-contract-design)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Services](#backend-services)
6. [Privacy Protocol](#privacy-protocol)
7. [Security Considerations](#security-considerations)
8. [API Specifications](#api-specifications)
9. [Data Models](#data-models)
10. [Implementation Roadmap](#implementation-roadmap)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Architecture](#deployment-architecture)

---

## Project Overview

### Problem Statement
- **Privacy Gap**: Starknet lacks robust on-chain privacy solutions
- **Current Solutions**: CEX mixing is slow, expensive, and requires trust
- **User Needs**: Fast, trustless, and affordable privacy for Starknet assets

### Solution Overview
A decentralized privacy mixer that leverages Lightning Network and Cashu to break transaction linkability, providing privacy for Starknet users without relying on centralized services.

### Key Features
- **Trustless Operation**: No single point of control or failure
- **Fast Transactions**: Lightning Network enables near-instant mixing
- **Strong Privacy**: Cashu e-cash provides cryptographic unlinkability
- **User Control**: Configurable privacy levels and time delays
- **Multi-Asset Support**: Initially STRK, extensible to other Starknet tokens

---

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Wallet   │    │  Frontend UI    │    │   Backend API   │
│  (Account A)    │────│   (Next.js)     │────│    (Node.js)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
                                ▼                       ▼
                        ┌─────────────────┐    ┌─────────────────┐
                        │ Starknet Network│    │ Lightning Node  │
                        │  (Mixer Contract)│  │   (LND Server)   │
                        └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
                                ▼                       ▼
                        ┌─────────────────┐    ┌─────────────────┐
                        │   Atomiq SDK    │    │  Cashu Mint     │
                        │   (STRK↔BTC)    │    │  (Privacy Mix)  │
                        └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
                                ▼                       ▼
                        ┌─────────────────┐    ┌─────────────────┐
                        │ User Wallet B   │    │ Lightning Payout│
                        │ (Clean Funds)   │    │   (Invoice)     │
                        └─────────────────┘    └─────────────────┘
```

### Component Breakdown

#### 1. Frontend Layer (Next.js + shadcn/ui)
- **User Interface**: React-based web application
- **Wallet Integration**: Starknet wallet connectivity
- **Transaction Monitoring**: Real-time status updates
- **Privacy Controls**: User-configurable privacy settings

#### 2. Backend Services (Node.js)
- **API Gateway**: RESTful API for frontend communication
- **Transaction Manager**: Orchestration of mixing process
- **Lightning Integration**: LND server communication
- **Cashu Operations**: E-cash minting and redemption

#### 3. Smart Contracts (Cairo)
- **Mixer Contract**: Main contract for asset custody
- **Access Control**: Multi-signature security
- **Event Logging**: Transparent operation tracking

#### 4. Lightning Network Infrastructure
- **LND Nodes**: Lightning Network nodes
- **Channel Management**: Liquidity and routing optimization
- **Invoice Processing**: Payment request handling

#### 5. Cashu Mint
- **E-Cash Issuance**: Privacy token minting
- **Proof Verification**: Cryptographic proof validation
- **Redemption Processing**: Anonymous token redemption

---

## Smart Contract Design

### Main Mixer Contract

```cairo
#[contract]
mod StarknetLightningMixer {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use array::ArrayTrait;
    use option::OptionTrait;

    // Storage variables
    #[storage]
    struct Storage {
        // Configuration
        min_deposit: u256,
        max_deposit: u256,
        fee_percentage: u256,
        operator_address: ContractAddress,

        // Multi-signature
        required_signatures: u8,
        signatures: Map<u256, Array<ContractAddress>>,

        // Transaction tracking
        transactions: Map<u256, Transaction>,
        transaction_counter: u256,

        // Fee collection
        total_fees: u256,
        fee_recipient: ContractAddress,

        // Paused state for emergency
        paused: bool,
    }

    // Transaction struct
    #[derive(Copy, Drop, Serde)]
    struct Transaction {
        id: u256,
        depositor: ContractAddress,
        amount: u256,
        token_address: ContractAddress,
        lightning_invoice: felt252,
        status: TransactionStatus,
        created_at: u64,
        completed_at: u64,
        fee: u256,
    }

    // Transaction status enum
    #[derive(Copy, Drop, Serde)]
    enum TransactionStatus {
        Pending,
        Confirmed,
        Processing,
        Completed,
        Failed,
        Refunded,
    }

    // Events
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        DepositReceived: DepositReceived,
        WithdrawalInitiated: WithdrawalInitiated,
        TransactionCompleted: TransactionCompleted,
        TransactionFailed: TransactionFailed,
        FeesCollected: FeesCollected,
        ContractPaused: ContractPaused,
        ContractUnpaused: ContractUnpaused,
    }

    #[derive(Drop, starknet::Event)]
    struct DepositReceived {
        transaction_id: u256,
        depositor: ContractAddress,
        amount: u256,
        token_address: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct WithdrawalInitiated {
        transaction_id: u256,
        recipient: ContractAddress,
        lightning_invoice: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct TransactionCompleted {
        transaction_id: u256,
        amount: u256,
        fee: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct TransactionFailed {
        transaction_id: u256,
        reason: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct FeesCollected {
        amount: u256,
        recipient: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct ContractPaused {
        paused_by: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct ContractUnpaused {
        unpaused_by: ContractAddress,
    }

    // Constructor
    #[constructor]
    fn constructor(
        operator_address: ContractAddress,
        fee_recipient: ContractAddress,
        min_deposit: u256,
        max_deposit: u256,
        fee_percentage: u256,
        required_signatures: u8
    ) {
        let mut storage = Storage::default();
        storage.operator_address.write(operator_address);
        storage.fee_recipient.write(fee_recipient);
        storage.min_deposit.write(min_deposit);
        storage.max_deposit.write(max_deposit);
        storage.fee_percentage.write(fee_percentage);
        storage.required_signatures.write(required_signatures);
        storage.paused.write(false);
        storage.transaction_counter.write(0);
    }

    // External functions

    /// Deposit funds into the mixer
    #[external]
    fn deposit(
        token_address: ContractAddress,
        amount: u256,
        lightning_invoice: felt252
    ) -> u256 {
        let mut storage = Storage::default();

        // Check if contract is paused
        assert!(!storage.paused.read(), 'Contract is paused');

        // Validate deposit amount
        assert!(
            amount >= storage.min_deposit.read() && amount <= storage.max_deposit.read(),
            'Invalid deposit amount'
        );

        // Calculate fee
        let fee = (amount * storage.fee_percentage.read()) / 10000; // basis points
        let net_amount = amount - fee;

        // Create transaction
        let transaction_id = storage.transaction_counter.read();
        storage.transaction_counter.write(transaction_id + 1);

        let transaction = Transaction {
            id: transaction_id,
            depositor: get_caller_address(),
            amount: net_amount,
            token_address,
            lightning_invoice,
            status: TransactionStatus::Pending,
            created_at: starknet::get_block_timestamp(),
            completed_at: 0,
            fee,
        };

        storage.transactions.write(transaction_id, transaction);

        // Transfer tokens from user to contract
        // This would require token approval from the user
        // ERC20 transfer implementation needed here

        // Emit event
        emit(DepositReceived {
            transaction_id,
            depositor: get_caller_address(),
            amount,
            token_address,
        });

        transaction_id
    }

    /// Process withdrawal (only callable by operator)
    #[external]
    fn process_withdrawal(
        transaction_id: u256,
        recipient: ContractAddress,
        multi_signature: Array<ContractAddress>
    ) {
        let mut storage = Storage::default();

        // Verify operator authorization and multi-signature
        assert!(is_authorized_operator(multi_signature), 'Unauthorized operator');

        // Get transaction
        let mut transaction = storage.transactions.read(transaction_id);

        // Validate transaction state
        assert!(
            transaction.status == TransactionStatus::Confirmed,
            'Invalid transaction status'
        );

        // Update status
        transaction.status = TransactionStatus::Processing;
        storage.transactions.write(transaction_id, transaction);

        // Process withdrawal logic
        // This would involve transferring funds to recipient

        // Update final status
        transaction.status = TransactionStatus::Completed;
        transaction.completed_at = starknet::get_block_timestamp();
        storage.transactions.write(transaction_id, transaction);

        // Collect fees
        let mut total_fees = storage.total_fees.read();
        total_fees += transaction.fee;
        storage.total_fees.write(total_fees);

        // Emit events
        emit(TransactionCompleted {
            transaction_id,
            amount: transaction.amount,
            fee: transaction.fee,
        });

        emit(FeesCollected {
            amount: transaction.fee,
            recipient: storage.fee_recipient.read(),
        });
    }

    /// Emergency pause function
    #[external]
    fn pause_contract() {
        let mut storage = Storage::default();

        // Only operator can pause
        assert!(
            get_caller_address() == storage.operator_address.read(),
            'Unauthorized: not operator'
        );

        storage.paused.write(true);

        emit(ContractPaused {
            paused_by: get_caller_address(),
        });
    }

    /// Unpause contract
    #[external]
    fn unpause_contract() {
        let mut storage = Storage::default();

        // Only operator can unpause
        assert!(
            get_caller_address() == storage.operator_address.read(),
            'Unauthorized: not operator'
        );

        storage.paused.write(false);

        emit(ContractUnpaused {
            unpaused_by: get_caller_address(),
        });
    }

    /// View functions

    /// Get transaction details
    #[view]
    fn get_transaction(transaction_id: u256) -> Transaction {
        let storage = Storage::default();
        storage.transactions.read(transaction_id)
    }

    /// Get contract configuration
    #[view]
    fn get_config() -> (
        ContractAddress,  // operator_address
        ContractAddress,  // fee_recipient
        u256,            // min_deposit
        u256,            // max_deposit
        u256,            // fee_percentage
        bool             // paused
    ) {
        let storage = Storage::default();
        (
            storage.operator_address.read(),
            storage.fee_recipient.read(),
            storage.min_deposit.read(),
            storage.max_deposit.read(),
            storage.fee_percentage.read(),
            storage.paused.read(),
        )
    }

    /// Get total fees collected
    #[view]
    fn get_total_fees() -> u256 {
        let storage = Storage::default();
        storage.total_fees.read()
    }

    // Helper functions

    fn is_authorized_operator(multi_signature: Array<ContractAddress>) -> bool {
        let storage = Storage::default();
        let required_sigs = storage.required_signatures.read();
        let operator_address = storage.operator_address.read();

        // Verify required number of signatures
        assert!(multi_signature.len() >= required_sigs.into(), 'Insufficient signatures');

        // Check if all signatures are from authorized operators
        // In a real implementation, this would involve signature verification
        // For now, we'll check if the caller is the operator
        get_caller_address() == operator_address
    }
}
```

### Access Control Contract

```cairo
#[contract]
mod AccessControl {
    use starknet::ContractAddress;
    use starknet::get_caller_address;

    #[storage]
    struct Storage {
        // Role management
        roles: Map<ContractAddress, Role>,
        admin_role: Role,
        operator_role: Role,

        // Role members
        role_members: Map<Role, Array<ContractAddress>>,
    }

    #[derive(Copy, Drop, Serde, PartialEq)]
    enum Role {
        None,
        Admin,
        Operator,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        RoleGranted: RoleGranted,
        RoleRevoked: RoleRevoked,
    }

    #[derive(Drop, starknet::Event)]
    struct RoleGranted {
        role: Role,
        account: ContractAddress,
        sender: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct RoleRevoked {
        role: Role,
        account: ContractAddress,
        sender: ContractAddress,
    }

    #[constructor]
    fn constructor() {
        let mut storage = Storage::default();
        let admin = get_caller_address();

        // Set up initial roles
        storage.admin_role.write(Role::Admin);
        storage.operator_role.write(Role::Operator);

        // Grant admin role to deployer
        storage.roles.write(admin, Role::Admin);

        let mut admin_members = ArrayTrait::new();
        admin_members.append(admin);
        storage.role_members.write(Role::Admin, admin_members);
    }

    /// Grant a role to an account
    #[external]
    fn grant_role(role: Role, account: ContractAddress) {
        let mut storage = Storage::default();

        // Only admin can grant roles
        assert!(has_role(Role::Admin, get_caller_address()), 'Admin role required');

        // Grant role
        storage.roles.write(account, role);

        // Add to role members
        let mut members = storage.role_members.read(role);
        members.append(account);
        storage.role_members.write(role, members);

        emit(RoleGranted {
            role,
            account,
            sender: get_caller_address(),
        });
    }

    /// Revoke a role from an account
    #[external]
    fn revoke_role(role: Role, account: ContractAddress) {
        let mut storage = Storage::default();

        // Only admin can revoke roles
        assert!(has_role(Role::Admin, get_caller_address()), 'Admin role required');

        // Revoke role
        storage.roles.write(account, Role::None);

        // Remove from role members (simplified)
        let mut members = storage.role_members.read(role);
        // Implementation would filter out the account
        storage.role_members.write(role, members);

        emit(RoleRevoked {
            role,
            account,
            sender: get_caller_address(),
        });
    }

    /// Check if an account has a specific role
    #[view]
    fn has_role(role: Role, account: ContractAddress) -> bool {
        let storage = Storage::default();
        storage.roles.read(account) == role
    }

    /// Get role of an account
    #[view]
    fn get_role(account: ContractAddress) -> Role {
        let storage = Storage::default();
        storage.roles.read(account)
    }
}
```

---

## Frontend Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **UI Library**: shadcn/ui components
- **State Management**: Zustand
- **Blockchain Interaction**: @starknet-react/core
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner

### Component Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── (mixer)/
│       ├── page.tsx
│       ├── layout.tsx
│       └── components/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── mixer/
│   │   ├── DepositForm.tsx
│   │   ├── TransactionStatus.tsx
│   │   ├── PrivacySettings.tsx
│   │   └── TransactionHistory.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── common/
│       ├── WalletConnect.tsx
│       ├── LoadingSpinner.tsx
│       └── ErrorBoundary.tsx
├── hooks/
│   ├── useStarknet.ts
│   ├── useMixer.ts
│   └── useTransactions.ts
├── store/
│   ├── mixerStore.ts
│   └── walletStore.ts
├── types/
│   ├── mixer.ts
│   ├── starknet.ts
│   └── api.ts
└── lib/
    ├── utils.ts
    ├── starknet.ts
    └── api.ts
```

### Key Components

#### Main Mixer Interface

```typescript
// components/mixer/DepositForm.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMixer } from '@/hooks/useMixer';
import { useAccount } from '@starknet-react/core';

interface DepositFormProps {
  onSuccess?: (transactionId: string) => void;
}

export function DepositForm({ onSuccess }: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('STRK');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { deposit } = useMixer();
  const { address, isConnected } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const transactionId = await deposit({
        token,
        amount: parseFloat(amount),
        recipient: address, // Can be different for privacy
      });

      onSuccess?.(transactionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tokens = [
    { value: 'STRK', label: 'STRK', min: 10, max: 10000, fee: 0.5 },
    { value: 'ETH', label: 'ETH', min: 0.01, max: 100, fee: 0.3 },
    { value: 'USDC', label: 'USDC', min: 100, max: 100000, fee: 0.2 },
  ];

  const selectedToken = tokens.find(t => t.value === token);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Privacy Mix</CardTitle>
        <CardDescription>
          Mix your funds privately using Lightning Network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <Select value={token} onValueChange={setToken}>
              <SelectTrigger>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{t.label}</span>
                      <Badge variant="secondary">{t.fee}% fee</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min={selectedToken?.min}
              max={selectedToken?.max}
              placeholder={`Min: ${selectedToken?.min}, Max: ${selectedToken?.max}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {selectedToken && amount && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Amount:</span>
                <span>{amount} {selectedToken.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Fee:</span>
                <span>{(parseFloat(amount) * selectedToken.fee / 100).toFixed(4)} {selectedToken.label}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>You'll receive:</span>
                <span>{(parseFloat(amount) * (1 - selectedToken.fee / 100)).toFixed(4)} {selectedToken.label}</span>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!isConnected || isSubmitting}
          >
            {isSubmitting ? 'Processing...' : isConnected ? 'Mix Funds' : 'Connect Wallet'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### Transaction Status Component

```typescript
// components/mixer/TransactionStatus.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock, AlertTriangle } from 'lucide-react';
import { Transaction } from '@/types/mixer';

interface TransactionStatusProps {
  transaction: Transaction;
}

const statusSteps = [
  { key: 'pending', label: 'Pending', icon: Circle },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
];

export function TransactionStatus({ transaction }: TransactionStatusProps) {
  const currentStepIndex = statusSteps.findIndex(step => step.key === transaction.status);
  const progress = ((currentStepIndex + 1) / statusSteps.length) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'confirmed': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'confirmed': return 'outline';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Transaction Status
          <Badge variant={getStatusVariant(transaction.status)}>
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full" />

        <div className="space-y-2">
          {statusSteps.map((step, index) => {
            const isActive = step.key === transaction.status;
            const isCompleted = index < currentStepIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={`flex items-center space-x-2 ${
                  isActive ? 'text-blue-600 font-medium' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                />
                <span>{step.label}</span>
                {isActive && transaction.status === 'processing' && (
                  <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction ID:</span>
            <span className="font-mono">{transaction.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span>{transaction.amount} {transaction.token}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee:</span>
            <span>{transaction.fee} {transaction.token}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>{new Date(transaction.createdAt * 1000).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Privacy Settings Component

```typescript
// components/mixer/PrivacySettings.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Shield, Clock, Wallet } from 'lucide-react';

interface PrivacySettings {
  delayHours: number;
  splitIntoMultiple: boolean;
  splitCount: number;
  useRandomAmounts: boolean;
  privacyLevel: 'low' | 'medium' | 'high';
}

interface PrivacySettingsProps {
  settings: PrivacySettings;
  onChange: (settings: PrivacySettings) => void;
}

export function PrivacySettings({ settings, onChange }: PrivacySettingsProps) {
  const updateSetting = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const privacyLevels = [
    {
      value: 'low',
      label: 'Low',
      description: 'Fast mixing, basic privacy',
      delay: [0, 2],
      splits: 1
    },
    {
      value: 'medium',
      label: 'Medium',
      description: 'Balanced speed and privacy',
      delay: [2, 6],
      splits: 3
    },
    {
      value: 'high',
      label: 'High',
      description: 'Maximum privacy, slower mixing',
      delay: [6, 24],
      splits: 5
    },
  ];

  const currentLevel = privacyLevels.find(l => l.value === settings.privacyLevel);

  const handlePrivacyLevelChange = (level: 'low' | 'medium' | 'high') => {
    const config = privacyLevels.find(l => l.value === level)!;
    updateSetting('privacyLevel', level);
    updateSetting('delayHours', config.delay[0]);
    updateSetting('splitIntoMultiple', config.splits > 1);
    updateSetting('splitCount', config.splits);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Privacy Settings</span>
        </CardTitle>
        <CardDescription>
          Configure your privacy preferences for optimal mixing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Privacy Level */}
        <div className="space-y-2">
          <Label>Privacy Level</Label>
          <Select value={settings.privacyLevel} onValueChange={handlePrivacyLevelChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {privacyLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  <div>
                    <div className="font-medium">{level.label}</div>
                    <div className="text-sm text-muted-foreground">{level.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Delay */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Time Delay: {settings.delayHours} hours</span>
          </Label>
          <Slider
            value={[settings.delayHours]}
            onValueChange={([value]) => updateSetting('delayHours', value)}
            min={0}
            max={24}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Instant</span>
            <span>24 hours</span>
          </div>
        </div>

        {/* Split Outputs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span>Split into Multiple Outputs</span>
            </Label>
            <Switch
              checked={settings.splitIntoMultiple}
              onCheckedChange={(checked) => updateSetting('splitIntoMultiple', checked)}
            />
          </div>

          {settings.splitIntoMultiple && (
            <div className="space-y-2 ml-6">
              <Label>Split Count: {settings.splitCount}</Label>
              <Slider
                value={[settings.splitCount]}
                onValueChange={([value]) => updateSetting('splitCount', value)}
                min={2}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>2 outputs</span>
                <span>10 outputs</span>
              </div>
            </div>
          )}
        </div>

        {/* Random Amounts */}
        <div className="flex items-center justify-between">
          <Label>Use Random Amounts</Label>
          <Switch
            checked={settings.useRandomAmounts}
            onCheckedChange={(checked) => updateSetting('useRandomAmounts', checked)}
          />
        </div>

        {/* Privacy Score */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Privacy Score</span>
            <span className="text-sm font-bold">
              {settings.privacyLevel === 'high' ? '95%' :
               settings.privacyLevel === 'medium' ? '75%' : '50%'}
            </span>
          </div>
          <div className="w-full bg-background rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                settings.privacyLevel === 'high' ? 'bg-green-500 w-[95%]' :
                settings.privacyLevel === 'medium' ? 'bg-yellow-500 w-[75%]' :
                'bg-blue-500 w-[50%]'
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### State Management

```typescript
// store/mixerStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, PrivacySettings } from '@/types/mixer';

interface MixerState {
  // Current transaction
  currentTransaction: Transaction | null;
  isProcessing: boolean;

  // Transaction history
  transactions: Transaction[];

  // Settings
  privacySettings: PrivacySettings;

  // Actions
  setCurrentTransaction: (transaction: Transaction | null) => void;
  setProcessing: (processing: boolean) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  clearTransactions: () => void;
}

const defaultPrivacySettings: PrivacySettings = {
  delayHours: 2,
  splitIntoMultiple: false,
  splitCount: 3,
  useRandomAmounts: false,
  privacyLevel: 'medium',
};

export const useMixerStore = create<MixerState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentTransaction: null,
      isProcessing: false,
      transactions: [],
      privacySettings: defaultPrivacySettings,

      // Actions
      setCurrentTransaction: (transaction) =>
        set({ currentTransaction: transaction }),

      setProcessing: (processing) =>
        set({ isProcessing: processing }),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
          currentTransaction: transaction,
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map(tx =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
          currentTransaction:
            state.currentTransaction?.id === id
              ? { ...state.currentTransaction, ...updates }
              : state.currentTransaction,
        })),

      updatePrivacySettings: (settings) =>
        set((state) => ({
          privacySettings: { ...state.privacySettings, ...settings }
        })),

      clearTransactions: () =>
        set({ transactions: [], currentTransaction: null }),
    }),
    {
      name: 'mixer-storage',
      partialize: (state) => ({
        transactions: state.transactions,
        privacySettings: state.privacySettings,
      }),
    }
  )
);
```

### Custom Hooks

```typescript
// hooks/useMixer.ts
import { useState, useCallback } from 'react';
import { useAccount, useContractWrite } from '@starknet-react/core';
import { useMixerStore } from '@/store/mixerStore';
import { toast } from 'sonner';
import { MIXER_CONTRACT_ADDRESS } from '@/lib/constants';
import mixerABI from '@/lib/abis/mixer.json';

interface DepositParams {
  token: string;
  amount: number;
  recipient: string;
}

export function useMixer() {
  const { account, address } = useAccount();
  const {
    setCurrentTransaction,
    setProcessing,
    addTransaction,
    updateTransaction,
    privacySettings
  } = useMixerStore();

  const [error, setError] = useState<string | null>(null);

  // Contract write hook for deposit
  const { writeAsync, isPending } = useContractWrite({
    address: MIXER_CONTRACT_ADDRESS,
    abi: mixerABI,
    functionName: 'deposit',
  });

  const deposit = useCallback(async (params: DepositParams) => {
    if (!account || !address) {
      throw new Error('Wallet not connected');
    }

    setError(null);
    setProcessing(true);

    try {
      // Generate lightning invoice (this would come from backend)
      const lightningInvoice = await generateLightningInvoice({
        amount: params.amount,
        token: params.token,
        privacySettings,
      });

      // Create transaction record
      const transaction: Transaction = {
        id: generateTransactionId(),
        status: 'pending',
        token: params.token,
        amount: params.amount.toString(),
        fee: calculateFee(params.amount, params.token),
        from: address,
        to: params.recipient,
        lightningInvoice,
        privacySettings,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      addTransaction(transaction);
      setCurrentTransaction(transaction);

      // Execute smart contract call
      const result = await writeAsync({
        args: [
          params.token,
          params.amount,
          lightningInvoice,
        ],
      });

      toast.success('Deposit initiated successfully');

      // Update transaction status
      updateTransaction(transaction.id, {
        status: 'confirmed',
        transactionHash: result.transaction_hash,
        updatedAt: Date.now(),
      });

      // Start monitoring the mixing process
      monitorMixingProgress(transaction.id);

      return transaction.id;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Deposit failed';
      setError(errorMessage);
      toast.error(errorMessage);

      // Update transaction status to failed
      if (currentTransaction) {
        updateTransaction(currentTransaction.id, {
          status: 'failed',
          error: errorMessage,
          updatedAt: Date.now(),
        });
      }

      throw err;
    } finally {
      setProcessing(false);
    }
  }, [account, address, writeAsync, privacySettings, setProcessing, addTransaction, setCurrentTransaction, updateTransaction]);

  const monitorMixingProgress = useCallback(async (transactionId: string) => {
    // This would connect to WebSocket or poll backend for updates
    const pollInterval = setInterval(async () => {
      try {
        const status = await fetchTransactionStatus(transactionId);
        updateTransaction(transactionId, {
          status: status.status,
          progress: status.progress,
          updatedAt: Date.now(),
        });

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(pollInterval);

          if (status.status === 'completed') {
            toast.success('Privacy mixing completed successfully!');
          } else {
            toast.error('Privacy mixing failed');
          }
        }
      } catch (err) {
        console.error('Error monitoring transaction:', err);
      }
    }, 5000);

    // Cleanup after 1 hour max
    setTimeout(() => clearInterval(pollInterval), 3600000);
  }, [updateTransaction]);

  return {
    deposit,
    isProcessing: isPending || useMixerStore(state => state.isProcessing),
    error,
    currentTransaction: useMixerStore(state => state.currentTransaction),
    transactions: useMixerStore(state => state.transactions),
    privacySettings: useMixerStore(state => state.privacySettings),
  };
}

// Helper functions
async function generateLightningInvoice(params: {
  amount: number;
  token: string;
  privacySettings: PrivacySettings;
}): Promise<string> {
  const response = await fetch('/api/lightning/invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to generate lightning invoice');
  }

  const { invoice } = await response.json();
  return invoice;
}

function calculateFee(amount: number, token: string): string {
  const feeRates = {
    STRK: 0.005,  // 0.5%
    ETH: 0.003,   // 0.3%
    USDC: 0.002,  // 0.2%
  };

  const feeRate = feeRates[token as keyof typeof feeRates] || 0.005;
  return (amount * feeRate).toString();
}

function generateTransactionId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function fetchTransactionStatus(transactionId: string) {
  const response = await fetch(`/api/transactions/${transactionId}/status`);
  if (!response.ok) {
    throw new Error('Failed to fetch transaction status');
  }
  return response.json();
}
```

---

## Backend Services

### API Architecture

```typescript
// lib/api.ts
export interface LightningInvoiceRequest {
  amount: number;
  token: string;
  privacySettings: PrivacySettings;
  userAddress: string;
}

export interface LightningInvoiceResponse {
  invoice: string;
  paymentHash: string;
  expiry: number;
  amount: number;
}

export interface TransactionStatusResponse {
  transactionId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'failed';
  progress: number;
  lightningPaymentStatus?: 'pending' | 'in-flight' | 'completed' | 'failed';
  cashuMintStatus?: 'pending' | 'completed' | 'failed';
  swapStatus?: 'pending' | 'completed' | 'failed';
  estimatedCompletion?: number;
  error?: string;
}
```

### API Routes

```typescript
// pages/api/lightning/invoice.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createLightningInvoice } from '@/lib/lightning';
import { calculateSwapAmount } from '@/lib/atomiq';
import { verifyUserAuthorization } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, token, privacySettings, userAddress } = req.body as LightningInvoiceRequest;

    // Verify user authorization
    const isAuthorized = await verifyUserAuthorization(userAddress);
    if (!isAuthorized) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Calculate amount after fees and convert to BTC
    const netAmount = amount * (1 - getFeeRate(token));
    const btcAmount = await calculateSwapAmount(token, 'BTC', netAmount);

    // Apply privacy adjustments
    const adjustedAmount = applyPrivacyAdjustments(btcAmount, privacySettings);

    // Create Lightning invoice
    const invoice = await createLightningInvoice({
      amount: adjustedAmount,
      memo: `Privacy mix for ${userAddress}`,
      expiry: 3600, // 1 hour
    });

    res.status(200).json({
      invoice: invoice.paymentRequest,
      paymentHash: invoice.paymentHash,
      expiry: invoice.expiry,
      amount: adjustedAmount,
    });

  } catch (error) {
    console.error('Error creating lightning invoice:', error);
    res.status(500).json({ error: 'Failed to create lightning invoice' });
  }
}
```

### Lightning Integration

```typescript
// lib/lightning.ts
import { LndClient } from 'lightning-js';

interface LightningNode {
  host: string;
  port: number;
  macaroon: string;
  cert: string;
}

class LightningService {
  private client: LndClient;

  constructor(config: LightningNode) {
    this.client = new LndClient({
      host: config.host,
      port: config.port,
      macaroon: config.macaroon,
      cert: config.cert,
    });
  }

  async createInvoice(params: {
    amount: number;
    memo?: string;
    expiry?: number;
  }) {
    try {
      const response = await this.client.addInvoice({
        value: params.amount * 1000, // Convert to satoshis
        memo: params.memo || '',
        expiry: params.expiry || 3600,
      });

      return {
        paymentRequest: response.payment_request,
        paymentHash: response.r_hash,
        expiry: response.expiry,
        amount: response.value / 1000, // Convert back to BTC
      };
    } catch (error) {
      throw new Error(`Failed to create lightning invoice: ${error}`);
    }
  }

  async payInvoice(invoice: string) {
    try {
      const response = await this.client.payInvoice({
        payment_request: invoice,
      });

      return {
        paymentHash: response.payment_hash,
        paymentPreimage: response.payment_preimage,
        amount: response.payment_route.total_amt / 1000,
        fees: response.payment_route.total_fees / 1000,
        status: response.payment_status,
      };
    } catch (error) {
      throw new Error(`Failed to pay lightning invoice: ${error}`);
    }
  }

  async lookupInvoice(paymentHash: string) {
    try {
      const response = await this.client.lookupInvoice({
        r_hash: paymentHash,
      });

      return {
        settled: response.settled,
        amount: response.value / 1000,
        settleDate: response.settle_date,
      };
    } catch (error) {
      throw new Error(`Failed to lookup invoice: ${error}`);
    }
  }

  async getChannelBalance() {
    try {
      const response = await this.client.channelBalance();
      return {
        localBalance: response.local_balance.sat / 100000000, // Convert to BTC
        remoteBalance: response.remote_balance.sat / 100000000,
        unsettledLocalBalance: response.unsettled_local_balance.sat / 100000000,
        unsettledRemoteBalance: response.unsettled_remote_balance.sat / 100000000,
      };
    } catch (error) {
      throw new Error(`Failed to get channel balance: ${error}`);
    }
  }
}

export { LightningService };
```

### Cashu Integration

```typescript
// lib/cashu.ts
import { CashuMint, CashuWallet } from '@cashu/cashu-ts';

interface CashuConfig {
  mintUrl: string;
  keysUrl: string;
}

class CashuService {
  private mint: CashuMint;
  private wallet: CashuWallet;

  constructor(config: CashuConfig) {
    this.mint = new CashuMint(config.mintUrl);
    this.wallet = new CashuWallet(this.mint);
  }

  async mintTokens(amount: number) {
    try {
      const { keys } = await this.mint.getKeys();
      const { prs, sigs } = await this.wallet.requestTokens(amount);

      const proofs = await this.wallet.constructProofs(
        amount,
        keys,
        prs,
        sigs
      );

      return {
        proofs,
        amount,
        keysetId: keys.keysetId,
      };
    } catch (error) {
      throw new Error(`Failed to mint Cashu tokens: ${error}`);
    }
  }

  async redeemTokens(proofs: any[]) {
    try {
      const result = await this.wallet.redeemTokens(proofs);

      return {
        success: result.success,
        amount: result.amount,
        change: result.change,
      };
    } catch (error) {
      throw new Error(`Failed to redeem Cashu tokens: ${error}`);
    }
  }

  async splitProofs(proofs: any[], amounts: number[]) {
    try {
      const result = await this.wallet.split(proofs, amounts);

      return {
        successProofs: result.successProofs,
        changeProofs: result.changeProofs,
      };
    } catch (error) {
      throw new Error(`Failed to split Cashu proofs: ${error}`);
    }
  }

  async verifyProofs(proofs: any[]) {
    try {
      const result = await this.wallet.verify(proofs);

      return {
        valid: result.valid,
        amount: result.amount,
      };
    } catch (error) {
      throw new Error(`Failed to verify Cashu proofs: ${error}`);
    }
  }
}

export { CashuService };
```

---

## Privacy Protocol

### Mixing Algorithm

```typescript
// lib/mixing.ts
interface MixingRequest {
  transactionId: string;
  amount: number;
  privacySettings: PrivacySettings;
  userAddress: string;
}

interface MixingStrategy {
  name: string;
  description: string;
  minDelay: number;
  maxDelay: number;
  splitCount: number;
  useRandomAmounts: boolean;
}

class PrivacyMixer {
  private lightningService: LightningService;
  private cashuService: CashuService;
  private atomiqService: AtomiqService;

  constructor(
    lightningService: LightningService,
    cashuService: CashuService,
    atomiqService: AtomiqService
  ) {
    this.lightningService = lightningService;
    this.cashuService = cashuService;
    this.atomiqService = atomiqService;
  }

  async executeMixing(request: MixingRequest): Promise<void> {
    try {
      // Step 1: Convert to BTC via Lightning
      await this.step1ConvertToBTC(request);

      // Step 2: Mint Cashu tokens for privacy
      await this.step2MintCashuTokens(request);

      // Step 3: Apply privacy transformations
      await this.step3ApplyPrivacyTransformations(request);

      // Step 4: Redeem and convert back to original token
      await this.step4RedeemAndConvertBack(request);

    } catch (error) {
      console.error('Mixing failed:', error);
      throw error;
    }
  }

  private async step1ConvertToBTC(request: MixingRequest): Promise<void> {
    console.log(`Step 1: Converting ${request.amount} to BTC for transaction ${request.transactionId}`);

    // Create Lightning invoice for the swap
    const invoice = await this.lightningService.createInvoice({
      amount: request.amount,
      memo: `Mixing - Step 1 - ${request.transactionId}`,
    });

    // Execute swap via Atomiq
    const swapResult = await this.atomiqService.swap({
      fromToken: 'STRK', // or whatever token
      toToken: 'BTC',
      amount: request.amount,
      lightningInvoice: invoice.paymentRequest,
    });

    console.log('Step 1 completed: BTC received in Lightning wallet');
  }

  private async step2MintCashuTokens(request: MixingRequest): Promise<void> {
    console.log(`Step 2: Minting Cashu tokens for transaction ${request.transactionId}`);

    // Get available amount from Lightning wallet
    const balance = await this.lightningService.getChannelBalance();

    // Mint Cashu tokens
    const mintResult = await this.cashuService.mintTokens(
      Math.min(request.amount, balance.localBalance)
    );

    console.log(`Step 2 completed: Minted ${mintResult.amount} Cashu tokens`);
  }

  private async step3ApplyPrivacyTransformations(request: MixingRequest): Promise<void> {
    console.log(`Step 3: Applying privacy transformations for transaction ${request.transactionId}`);

    const strategy = this.getMixingStrategy(request.privacySettings);

    // Apply time delay
    if (strategy.minDelay > 0) {
      const delay = this.calculateDelay(strategy.minDelay, strategy.maxDelay);
      console.log(`Applying time delay: ${delay} hours`);
      await this.delay(delay);
    }

    // Split into multiple outputs if requested
    if (strategy.splitCount > 1) {
      console.log(`Splitting into ${strategy.splitCount} outputs`);
      // Implementation would split Cashu proofs
    }

    // Apply random amounts if requested
    if (strategy.useRandomAmounts) {
      console.log('Applying random amount variations');
      // Implementation would vary amounts slightly
    }

    console.log('Step 3 completed: Privacy transformations applied');
  }

  private async step4RedeemAndConvertBack(request: MixingRequest): Promise<void> {
    console.log(`Step 4: Redeeming tokens and converting back for transaction ${request.transactionId}`);

    // Redeem Cashu tokens back to Lightning
    const redeemResult = await this.cashuService.redeemTokens(/* proofs */);

    // Convert BTC back to original token via Atomiq
    const swapResult = await this.atomiqService.swap({
      fromToken: 'BTC',
      toToken: 'STRK', // or whatever original token
      amount: redeemResult.amount,
      recipient: request.userAddress,
    });

    console.log('Step 4 completed: Funds returned to user');
  }

  private getMixingStrategy(settings: PrivacySettings): MixingStrategy {
    const strategies = {
      low: {
        name: 'Fast Mixing',
        description: 'Quick mixing with basic privacy',
        minDelay: 0,
        maxDelay: 2,
        splitCount: 1,
        useRandomAmounts: false,
      },
      medium: {
        name: 'Balanced Mixing',
        description: 'Good balance of speed and privacy',
        minDelay: 2,
        maxDelay: 6,
        splitCount: settings.splitIntoMultiple ? settings.splitCount : 3,
        useRandomAmounts: true,
      },
      high: {
        name: 'Maximum Privacy',
        description: 'Slow mixing with maximum privacy',
        minDelay: 6,
        maxDelay: 24,
        splitCount: settings.splitIntoMultiple ? settings.splitCount : 5,
        useRandomAmounts: true,
      },
    };

    return strategies[settings.privacyLevel];
  }

  private calculateDelay(minHours: number, maxHours: number): number {
    const range = maxHours - minHours;
    const randomDelay = Math.random() * range;
    return minHours + randomDelay;
  }

  private async delay(hours: number): Promise<void> {
    const milliseconds = hours * 60 * 60 * 1000;
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }
}

export { PrivacyMixer };
```

---

## Security Considerations

### Smart Contract Security

1. **Access Control**
   - Multi-signature requirements for critical operations
   - Role-based permissions for different functions
   - Emergency pause mechanisms

2. **Reentrancy Protection**
   - Use of checks-effects-interactions pattern
   - Proper state management
   - Reentrancy guards where necessary

3. **Input Validation**
   - Comprehensive parameter validation
   - Range checks for amounts
   - Address validation

4. **Event Logging**
   - Detailed event emission for all operations
   - Transparent tracking of fund movements
   - Audit trail for compliance

### Frontend Security

1. **Key Management**
   - Private keys never leave user wallet
   - Secure communication with smart contracts
   - Protection against phishing attacks

2. **Data Protection**
   - Secure storage of sensitive data
   - Encryption of local storage
   - Proper session management

3. **Input Sanitization**
   - Validation of all user inputs
   - Prevention of injection attacks
   - XSS protection

### Backend Security

1. **API Security**
   - Authentication and authorization
   - Rate limiting
   - Input validation

2. **Key Management**
   - Secure storage of API keys
   - Rotation of secrets
   - Access control

3. **Infrastructure Security**
   - Network security
   - Monitoring and alerting
   - Backup and recovery

---

## API Specifications

### Core Endpoints

```typescript
// POST /api/mix/deposit
interface DepositRequest {
  userAddress: string;
  token: string;
  amount: number;
  recipient: string;
  privacySettings: PrivacySettings;
}

interface DepositResponse {
  transactionId: string;
  lightningInvoice: string;
  estimatedCompletion: number;
  fee: number;
}

// GET /api/mix/status/{transactionId}
interface StatusResponse {
  transactionId: string;
  status: TransactionStatus;
  progress: number;
  steps: {
    name: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    timestamp?: number;
  }[];
  estimatedCompletion?: number;
}

// POST /api/lightning/invoice
interface InvoiceRequest {
  amount: number;
  token: string;
  memo?: string;
  expiry?: number;
}

interface InvoiceResponse {
  invoice: string;
  paymentHash: string;
  amount: number;
  expiry: number;
}

// GET /api/transactions/history
interface HistoryRequest {
  userAddress: string;
  limit?: number;
  offset?: number;
  status?: TransactionStatus;
}

interface HistoryResponse {
  transactions: Transaction[];
  totalCount: number;
  hasMore: boolean;
}
```

### WebSocket Events

```typescript
// WebSocket connection: ws://localhost:3000/api/ws
interface WebSocketEvents {
  // Client -> Server
  subscribe: {
    transactionId: string;
  };

  unsubscribe: {
    transactionId: string;
  };

  // Server -> Client
  transactionUpdate: {
    transactionId: string;
    status: TransactionStatus;
    progress: number;
    step: string;
    timestamp: number;
  };

  transactionCompleted: {
    transactionId: string;
    status: 'completed' | 'failed';
    result?: {
      amount: number;
      recipient: string;
      transactionHash: string;
    };
    error?: string;
  };
}
```

---

## Data Models

### Core Types

```typescript
// types/mixer.ts
export interface Transaction {
  id: string;
  status: TransactionStatus;
  token: string;
  amount: string;
  fee: string;
  from: string;
  to: string;
  lightningInvoice?: string;
  transactionHash?: string;
  privacySettings: PrivacySettings;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  error?: string;
  progress?: number;
}

export type TransactionStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface PrivacySettings {
  delayHours: number;
  splitIntoMultiple: boolean;
  splitCount: number;
  useRandomAmounts: boolean;
  privacyLevel: 'low' | 'medium' | 'high';
}

export interface MixingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number;
  timestamp?: number;
  error?: string;
}

export interface MixingProgress {
  transactionId: string;
  currentStep: number;
  totalSteps: number;
  steps: MixingStep[];
  overallProgress: number;
  estimatedCompletion?: number;
}

// types/starknet.ts
export interface StarknetNetwork {
  name: 'mainnet' | 'sepolia' | 'goerli';
  chainId: string;
  rpcUrl: string;
  blockExplorerUrl: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  minAmount: number;
  maxAmount: number;
  feeRate: number;
}

export interface WalletInfo {
  address: string;
  isConnected: boolean;
  network: StarknetNetwork;
  balance: Record<string, string>;
}

// types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    totalCount: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

**Week 1: Project Setup**
- [x] Initialize Next.js project with TypeScript
- [x] Set up shadcn/ui components
- [x] Configure development environment
- [ ] Set up testing framework
- [ ] Create project documentation

**Week 2: Smart Contract Development**
- [ ] Develop core mixer contract
- [ ] Implement access control mechanisms
- [ ] Add event logging
- [ ] Write unit tests for contracts
- [ ] Set up local testnet

**Week 3: Backend Infrastructure**
- [ ] Set up Express.js API server
- [ ] Implement Lightning Network integration
- [ ] Configure Cashu mint connection
- [ ] Set up database for transaction tracking
- [ ] Implement basic API endpoints

**Week 4: Frontend Foundation**
- [ ] Create basic UI layout
- [ ] Implement wallet connection
- [ ] Build transaction form
- [ ] Add status display components
- [ ] Set up state management

### Phase 2: Core Features (Weeks 5-8)

**Week 5: Mixing Logic**
- [ ] Implement deposit flow
- [ ] Add Lightning invoice generation
- [ ] Create Cashu minting logic
- [ ] Build transaction monitoring
- [ ] Add error handling

**Week 6: Privacy Features**
- [ ] Implement privacy settings
- [ ] Add time delay functionality
- [ ] Create output splitting logic
- [ ] Implement random amount variations
- [ ] Add privacy score calculation

**Week 7: User Experience**
- [ ] Build transaction history
- [ ] Add real-time updates
- [ ] Implement notifications
- [ ] Create help documentation
- [ ] Add accessibility features

**Week 8: Testing & QA**
- [ ] Write comprehensive tests
- [ ] Perform security audit
- [ ] Test on testnet
- [ ] Fix identified issues
- [ ] Optimize performance

### Phase 3: Advanced Features (Weeks 9-12)

**Week 9: Advanced Privacy**
- [ ] Implement multi-hop mixing
- [ ] Add CoinJoin-like features
- [ ] Create adaptive delay algorithms
- [ ] Implement zk-proof integration
- [ ] Add advanced analytics

**Week 10: Additional Tokens**
- [ ] Support for multiple tokens
- [ ] Implement token bridges
- [ ] Add token swapping logic
- [ ] Create token management UI
- [ ] Update fee structures

**Week 11: Performance & Scaling**
- [ ] Optimize gas usage
- [ ] Implement caching
- [ ] Add load balancing
- [ ] Optimize Lightning channels
- [ ] Improve response times

**Week 12: Final Preparation**
- [ ] Complete security audit
- [ ] Prepare documentation
- [ ] Set up monitoring
- [ ] Create deployment scripts
- [ ] Prepare mainnet launch

### Phase 4: Launch & Maintenance (Weeks 13-16)

**Week 13: Mainnet Deployment**
- [ ] Deploy smart contracts
- [ ] Launch frontend application
- [ ] Start backend services
- [ ] Monitor initial usage
- [ ] Fix any issues

**Week 14: Marketing & Community**
- [ ] Create marketing materials
- [ ] Engage with community
- [ ] Gather user feedback
- [ ] Implement improvements
- [ ] Grow user base

**Week 15: Optimization**
- [ ] Analyze usage patterns
- [ ] Optimize based on data
- [ ] Implement user suggestions
- [ ] Add new features
- [ ] Improve performance

**Week 16: Long-term Planning**
- [ ] Review first month metrics
- [ ] Plan next features
- [ ] Update roadmap
- [ ] Expand team if needed
- [ ] Prepare for scaling

---

## Testing Strategy

### Smart Contract Testing

```typescript
// test/mixer.test.ts
import { Account, Contract, ec } from 'starknet';
import { expect } from 'chai';
import { deployMixerContract, deployTokenContract } from './helpers';

describe('StarknetLightningMixer', () => {
  let mixerContract: Contract;
  let tokenContract: Contract;
  let admin: Account;
  let user1: Account;
  let user2: Account;

  beforeEach(async () => {
    // Deploy fresh contracts for each test
    mixerContract = await deployMixerContract();
    tokenContract = await deployTokenContract();

    // Setup accounts
    admin = await createAccount();
    user1 = await createAccount();
    user2 = await createAccount();
  });

  describe('Deposit', () => {
    it('should accept valid deposit', async () => {
      const amount = 1000n;
      const lightningInvoice = 'lnbc100...';

      // Mint tokens to user
      await tokenContract.mint(user1.address, amount);

      // Approve mixer contract
      await tokenContract.approve(mixerContract.address, amount);

      // Make deposit
      const tx = await mixerContract.deposit(
        tokenContract.address,
        amount,
        lightningInvoice
      );

      expect(tx.events).to.include.deep.members([
        {
          DepositReceived: {
            transaction_id: '0',
            depositor: user1.address,
            amount,
            token_address: tokenContract.address,
          },
        },
      ]);
    });

    it('should reject deposit below minimum', async () => {
      const amount = 10n; // Below minimum
      const lightningInvoice = 'lnbc10...';

      await expect(
        mixerContract.deposit(
          tokenContract.address,
          amount,
          lightningInvoice
        )
      ).to.be.revertedWith('Invalid deposit amount');
    });

    it('should reject deposit above maximum', async () => {
      const amount = 1000000n; // Above maximum
      const lightningInvoice = 'lnbc1000000...';

      await expect(
        mixerContract.deposit(
          tokenContract.address,
          amount,
          lightningInvoice
        )
      ).to.be.revertedWith('Invalid deposit amount');
    });
  });

  describe('Withdrawal', () => {
    let transactionId: number;

    beforeEach(async () => {
      // Create a deposit first
      const amount = 1000n;
      const lightningInvoice = 'lnbc100...';

      await tokenContract.mint(user1.address, amount);
      await tokenContract.approve(mixerContract.address, amount);

      const tx = await mixerContract.deposit(
        tokenContract.address,
        amount,
        lightningInvoice
      );

      transactionId = 0; // First transaction
    });

    it('should process valid withdrawal', async () => {
      const multiSignature = [admin.address];

      const tx = await mixerContract.process_withdrawal(
        transactionId,
        user2.address,
        multiSignature
      );

      expect(tx.events).to.include.deep.members([
        {
          TransactionCompleted: {
            transaction_id: transactionId,
            amount: 950n, // After 5% fee
            fee: 50n,
          },
        },
      ]);
    });

    it('should reject withdrawal from unauthorized operator', async () => {
      const multiSignature = [user1.address]; // Not authorized

      await expect(
        mixerContract.process_withdrawal(
          transactionId,
          user2.address,
          multiSignature
        )
      ).to.be.revertedWith('Unauthorized operator');
    });
  });

  describe('Access Control', () => {
    it('should allow admin to pause contract', async () => {
      await mixerContract.pause_contract();

      const config = await mixerContract.get_config();
      expect(config.paused).to.be.true;
    });

    it('should reject pause from non-admin', async () => {
      await expect(
        mixerContract.connect(user1).pause_contract()
      ).to.be.revertedWith('Unauthorized: not operator');
    });
  });
});
```

### Frontend Testing

```typescript
// components/__tests__/DepositForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DepositForm } from '../mixer/DepositForm';
import { useMixer } from '@/hooks/useMixer';
import { useAccount } from '@starknet-react/core';

// Mock hooks
jest.mock('@/hooks/useMixer');
jest.mock('@starknet-react/core');

const mockUseMixer = useMixer as jest.MockedFunction<typeof useMixer>;
const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;

describe('DepositForm', () => {
  const mockDeposit = jest.fn();

  beforeEach(() => {
    mockUseAccount.mockReturnValue({
      address: '0x123...',
      isConnected: true,
    } as any);

    mockUseMocker.mockReturnValue({
      deposit: mockDeposit,
      isProcessing: false,
      error: null,
    } as any);
  });

  it('should render deposit form', () => {
    render(<DepositForm />);

    expect(screen.getByText('Privacy Mix')).toBeInTheDocument();
    expect(screen.getByLabelText('Token')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mix Funds' })).toBeInTheDocument();
  });

  it('should submit valid deposit', async () => {
    mockDeposit.mockResolvedValue('tx_123');

    render(<DepositForm />);

    // Fill form
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '100' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Mix Funds' }));

    await waitFor(() => {
      expect(mockDeposit).toHaveBeenCalledWith({
        token: 'STRK',
        amount: 100,
        recipient: '0x123...',
      });
    });
  });

  it('should show error for invalid amount', async () => {
    render(<DepositForm />);

    // Submit without amount
    fireEvent.click(screen.getByRole('button', { name: 'Mix Funds' }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid amount')).toBeInTheDocument();
    });
  });

  it('should show connection prompt when wallet not connected', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
    } as any);

    render(<DepositForm />);

    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeInTheDocument();
  });
});
```

### Integration Testing

```typescript
// test/integration/mixing.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { PrivacyMixer } from '../../lib/mixing';
import { LightningService } from '../../lib/lightning';
import { CashuService } from '../../lib/cashu';
import { AtomiqService } from '../../lib/atomiq';

describe('Mixing Integration', () => {
  let mixer: PrivacyMixer;
  let lightningService: LightningService;
  let cashuService: CashuService;
  let atomiqService: AtomiqService;

  beforeEach(() => {
    // Initialize services with test configuration
    lightningService = new LightningService(testLightningConfig);
    cashuService = new CashuService(testCashuConfig);
    atomiqService = new AtomiqService(testAtomiqConfig);

    mixer = new PrivacyMixer(lightningService, cashuService, atomiqService);
  });

  it('should complete full mixing process', async () => {
    const request = {
      transactionId: 'test_tx_123',
      amount: 0.1,
      privacySettings: {
        privacyLevel: 'medium' as const,
        delayHours: 2,
        splitIntoMultiple: true,
        splitCount: 3,
        useRandomAmounts: true,
      },
      userAddress: '0x123...',
    };

    // Mock service responses
    jest.spyOn(lightningService, 'createInvoice')
      .mockResolvedValue({
        paymentRequest: 'lnbc100...',
        paymentHash: 'hash123',
        expiry: Date.now() + 3600000,
        amount: 0.1,
      });

    jest.spyOn(cashuService, 'mintTokens')
      .mockResolvedValue({
        proofs: [],
        amount: 0.1,
        keysetId: 'keyset123',
      });

    jest.spyOn(atomiqService, 'swap')
      .mockResolvedValue({
        success: true,
        outputAmount: 0.099,
        transactionHash: '0xabc...',
      });

    // Execute mixing
    await mixer.executeMixing(request);

    // Verify all steps were called
    expect(lightningService.createInvoice).toHaveBeenCalledTimes(2); // Convert to BTC, convert back
    expect(cashuService.mintTokens).toHaveBeenCalledTimes(1);
    expect(atomiqService.swap).toHaveBeenCalledTimes(2);
  }, 30000); // 30 second timeout for integration test
});
```

---

## Deployment Architecture

### Production Infrastructure

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.starknetmixer.com
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - LIGHTNING_RPC_URL=${LIGHTNING_RPC_URL}
      - CASHU_MINT_URL=${CASHU_MINT_URL}
      - ATOMIQ_API_KEY=${ATOMIQ_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  lnd:
    image: lightninglabs/lnd:latest
    ports:
      - "10009:10009"
      - "8080:8080"
    volumes:
      - lnd_data:/data/.lnd
      - ./lnd/lnd.conf:/data/.lnd/lnd.conf
    environment:
      - LND_RPCUSER=${LND_RPCUSER}
      - LND_RPCPASS=${LND_RPCPASS}
    restart: unless-stopped

  cashu-mint:
    build:
      context: ./cashu-mint
      dockerfile: Dockerfile.prod
    ports:
      - "3338:3338"
    environment:
      - CASHU_MINT_URL=${CASHU_MINT_URL}
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres
    restart: unless-stopped

  monitoring:
    build:
      context: ./monitoring
      dockerfile: Dockerfile.prod
    ports:
      - "9090:9090"  # Prometheus
      - "3001:3001"  # Grafana
    volumes:
      - prometheus_data:/prometheus
      - grafana_data:/var/lib/grafana
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  lnd_data:
  prometheus_data:
  grafana_data:
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: starknet-mixer-backend
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: starknet-mixer-backend
  template:
    metadata:
      labels:
        app: starknet-mixer-backend
    spec:
      containers:
      - name: backend
        image: starknetmixer/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: LIGHTNING_RPC_URL
          valueFrom:
            secretKeyRef:
              name: lightning-secret
              key: rpc-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: starknet-mixer-backend-service
  namespace: production
spec:
  selector:
    app: starknet-mixer-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Run integration tests
      run: npm run test:integration

    - name: Run security audit
      run: npm audit --audit-level high

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push Docker images
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          ghcr.io/${{ github.repository }}:latest
          ghcr.io/${{ github.repository }}:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Deploy to Kubernetes
      run: |
        echo "${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        kubectl set image deployment/starknet-mixer-backend backend=ghcr.io/${{ github.repository }}:${{ github.sha }} -n production
        kubectl rollout status deployment/starknet-mixer-backend -n production

  security-scan:
    needs: test
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'

    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
```

### Monitoring and Alerting

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts.yml"

scrape_configs:
  - job_name: 'starknet-mixer-backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'

  - job_name: 'lnd'
    static_configs:
      - targets: ['lnd:8080']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

```yaml
# monitoring/alerts.yml
groups:
- name: starknet-mixer
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }} errors per second"

  - alert: LightningNodeDown
    expr: up{job="lnd"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Lightning node is down"
      description: "Lightning node has been down for more than 1 minute"

  - alert: DatabaseConnectionFailed
    expr: postgres_up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Database connection failed"
      description: "Cannot connect to PostgreSQL database"

  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage"
      description: "Memory usage is above 90%"
```

---

## Conclusion

This detailed design document provides a comprehensive blueprint for implementing the Starknet Lightning Privacy Mixer. The architecture prioritizes:

1. **Privacy**: Strong cryptographic guarantees through Lightning Network and Cashu
2. **Usability**: Intuitive interface with clear privacy controls
3. **Security**: Multi-layered security approach with thorough testing
4. **Scalability**: Designed to handle growing adoption
5. **Maintainability**: Clean code architecture with comprehensive documentation

The modular design allows for iterative development and deployment, reducing risk while delivering value to users progressively. The combination of established technologies (Lightning Network, Cashu) with innovative approaches creates a unique solution that addresses the privacy gap in the Starknet ecosystem.

Key success factors include:
- Proper execution of the mixing algorithm
- Maintaining Lightning Network liquidity
- Ensuring smart contract security
- Providing excellent user experience
- Building community trust

With this design as a foundation, the project can move forward with confidence, knowing that the technical architecture is sound, scalable, and aligned with user needs for privacy on Starknet.