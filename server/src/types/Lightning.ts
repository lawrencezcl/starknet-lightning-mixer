export interface Invoice {
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

export interface Payment {
  paymentHash: string;
  paymentPreimage: string;
  value: number;
  fee: number;
  status: string;
  creationDate: number;
  paymentIndex: string;
}

export interface ChannelBalance {
  localBalance: number;
  remoteBalance: number;
  unsettledLocalBalance: number;
  unsettledRemoteBalance: number;
  pendingOpenLocalBalance: number;
  pendingOpenRemoteBalance: number;
}

export interface WalletBalance {
  confirmedBalance: number;
  unconfirmedBalance: number;
}

export interface NodeInfo {
  identityPubkey: string;
  alias: string;
  numPeers: number;
  numActiveChannels: number;
  numPendingChannels: number;
  blockHeight: number;
  syncedToChain: boolean;
  chains: Array<{
    chain: string;
    network: string;
  }>;
}

export interface Channel {
  active: boolean;
  remotePubkey: string;
  channelPoint: string;
  chanId: string;
  capacity: number;
  localBalance: number;
  remoteBalance: number;
  commitFee: number;
  commitWeight: number;
  feePerKw: number;
  unsettledBalance: number;
  totalSatoshisReceived: number;
  totalSatoshisSent: number;
  numUpdates: number;
  pendingHtlcs: Array<{
    incoming: boolean;
    amount: number;
    hashLock: string;
    expirationHeight: number;
  }>;
}

export interface Peer {
  pubKey: string;
  address: string;
  bytesSent: number;
  bytesRecv: number;
  satSent: number;
  satRecv: number;
  inbound: boolean;
  pingTime: number;
}

export interface Transaction {
  txHash: string;
  amount: number;
  numConfirmations: number;
  blockHash: string;
  blockHeight: number;
  timeStamp: number;
  totalFees: number;
  destAddresses: string[];
}