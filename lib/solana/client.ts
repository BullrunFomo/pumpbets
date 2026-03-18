/**
 * Quant on-chain client.
 *
 * All functions return a prepared `Transaction` that the caller must sign and
 * send via the wallet adapter (or a raw keypair in tests).
 *
 * Usage example:
 *   const tx = await buildPlaceBet(connection, wallet.publicKey, chainMarketId, 1, 0.5e9);
 *   const sig = await wallet.sendTransaction(tx, connection);
 */

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { BorshCoder, BorshInstructionCoder } from '@coral-xyz/anchor';
import BN from 'bn.js';
import { marketPda, vaultPda, positionPda, PROGRAM_ID } from './pda';

// ── helpers ──────────────────────────────────────────────────────────────────

function solToLamports(sol: number): bigint {
  return BigInt(Math.round(sol * LAMPORTS_PER_SOL));
}

/** Encode an instruction using a raw 8-byte discriminator + borsh args. */
function makeIx(
  accounts: { pubkey: PublicKey; isSigner: boolean; isWritable: boolean }[],
  data: Buffer
): TransactionInstruction {
  return new TransactionInstruction({ keys: accounts, programId: PROGRAM_ID, data });
}

// ── Discriminators (sha256("global:<instruction_name>")[0..8]) ───────────────
// These are stable values produced by `anchor build`.  Re-run to confirm after
// any instruction rename.

// Pre-computed with: node -e "const c=require('crypto');
//   ['initialize_market','place_bet','resolve_market','claim_payout','withdraw_fees']
//   .forEach(n=>{ const d=c.createHash('sha256').update('global:'+n).digest();
//   console.log(n, JSON.stringify([...d.slice(0,8)])); })"

const DISC = {
  initializeMarket: Buffer.from([35, 35, 189, 193, 155, 48, 170, 203]),
  placeBet:         Buffer.from([222, 62, 67, 220, 63, 166, 126, 33]),
  resolveMarket:    Buffer.from([155, 23, 80, 173, 46, 74, 23, 239]),
  claimPayout:      Buffer.from([127, 240, 132, 62, 227, 198, 146, 133]),
  withdrawFees:     Buffer.from([198, 212, 171, 109, 144, 215, 174, 89]),
} as const;

// ── Instruction builders ─────────────────────────────────────────────────────

/**
 * Admin: create a market on-chain.
 *
 * @param chainMarketId  Unique u64 — use Date.now() or a hash of the DB id
 * @param numOptions     2–8 (2 for binary Yes/No)
 * @param expiryUnixSec  Unix timestamp (seconds) when the market closes
 */
export async function buildInitializeMarket(
  connection: Connection,
  admin: PublicKey,
  chainMarketId: bigint,
  numOptions: number,
  expiryUnixSec: number
): Promise<Transaction> {
  const [market] = marketPda(chainMarketId);
  const [vault]  = vaultPda(chainMarketId);

  // Encode args: u64 (le) + u8 + i64 (le)
  const args = Buffer.alloc(8 + 1 + 8);
  new BN(chainMarketId.toString()).toArrayLike(Buffer, 'le', 8).copy(args, 0);
  args.writeUInt8(numOptions, 8);
  new BN(expiryUnixSec.toString()).toArrayLike(Buffer, 'le', 8).copy(args, 9);

  const data = Buffer.concat([DISC.initializeMarket, args]);

  const ix = makeIx(
    [
      { pubkey: admin,              isSigner: true,  isWritable: true  },
      { pubkey: market,             isSigner: false, isWritable: true  },
      { pubkey: vault,              isSigner: false, isWritable: true  },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data
  );

  const tx = new Transaction().add(ix);
  tx.feePayer = admin;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  return tx;
}

/**
 * User: place (or add to) a bet on a market option.
 *
 * @param option     0-based index of the chosen option
 * @param amountSol  Amount in SOL (e.g. 0.5 = 0.5 SOL)
 */
export async function buildPlaceBet(
  connection: Connection,
  user: PublicKey,
  chainMarketId: bigint,
  option: number,
  amountSol: number
): Promise<Transaction> {
  const [market] = marketPda(chainMarketId);
  const [vault]  = vaultPda(chainMarketId);
  const [position] = positionPda(market, user);

  const amountLamports = solToLamports(amountSol);

  // Encode args: u8 (option) + u64 (amount, le)
  const args = Buffer.alloc(1 + 8);
  args.writeUInt8(option, 0);
  new BN(amountLamports.toString()).toArrayLike(Buffer, 'le', 8).copy(args, 1);

  const data = Buffer.concat([DISC.placeBet, args]);

  const ix = makeIx(
    [
      { pubkey: user,               isSigner: true,  isWritable: true  },
      { pubkey: market,             isSigner: false, isWritable: true  },
      { pubkey: vault,              isSigner: false, isWritable: true  },
      { pubkey: position,           isSigner: false, isWritable: true  },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data
  );

  const tx = new Transaction().add(ix);
  tx.feePayer = user;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  return tx;
}

/**
 * Admin: resolve a market by declaring the winning option index.
 */
export async function buildResolveMarket(
  connection: Connection,
  admin: PublicKey,
  chainMarketId: bigint,
  winningOption: number
): Promise<Transaction> {
  const [market] = marketPda(chainMarketId);

  const args = Buffer.alloc(1);
  args.writeUInt8(winningOption, 0);
  const data = Buffer.concat([DISC.resolveMarket, args]);

  const ix = makeIx(
    [
      { pubkey: admin,  isSigner: true,  isWritable: false },
      { pubkey: market, isSigner: false, isWritable: true  },
    ],
    data
  );

  const tx = new Transaction().add(ix);
  tx.feePayer = admin;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  return tx;
}

/**
 * Winner: claim proportional payout from a resolved market.
 */
export async function buildClaimPayout(
  connection: Connection,
  user: PublicKey,
  chainMarketId: bigint
): Promise<Transaction> {
  const [market]   = marketPda(chainMarketId);
  const [vault]    = vaultPda(chainMarketId);
  const [position] = positionPda(market, user);

  const data = Buffer.from(DISC.claimPayout);

  const ix = makeIx(
    [
      { pubkey: user,               isSigner: true,  isWritable: true  },
      { pubkey: market,             isSigner: false, isWritable: false },
      { pubkey: vault,              isSigner: false, isWritable: true  },
      { pubkey: position,           isSigner: false, isWritable: true  },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data
  );

  const tx = new Transaction().add(ix);
  tx.feePayer = user;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  return tx;
}

/**
 * Admin: sweep fee lamports from a resolved market's vault.
 */
export async function buildWithdrawFees(
  connection: Connection,
  admin: PublicKey,
  chainMarketId: bigint
): Promise<Transaction> {
  const [market] = marketPda(chainMarketId);
  const [vault]  = vaultPda(chainMarketId);

  const data = Buffer.from(DISC.withdrawFees);

  const ix = makeIx(
    [
      { pubkey: admin,              isSigner: true,  isWritable: true  },
      { pubkey: market,             isSigner: false, isWritable: false },
      { pubkey: vault,              isSigner: false, isWritable: true  },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data
  );

  const tx = new Transaction().add(ix);
  tx.feePayer = admin;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  return tx;
}

// ── Read helpers ─────────────────────────────────────────────────────────────

export interface OnChainMarket {
  id: bigint;
  admin: PublicKey;
  numOptions: number;
  bets: bigint[];       // lamports per option
  total: bigint;        // total lamports
  resolved: boolean;
  winner: number;       // 255 = unresolved
  expiry: number;       // unix seconds
}

export interface OnChainPosition {
  user: PublicKey;
  market: PublicKey;
  option: number;
  amount: bigint;       // lamports
  claimed: boolean;
}

/** Fetch and decode an on-chain Market account. Returns null if not found. */
export async function fetchMarket(
  connection: Connection,
  chainMarketId: bigint
): Promise<OnChainMarket | null> {
  const [pda] = marketPda(chainMarketId);
  const info = await connection.getAccountInfo(pda);
  if (!info) return null;
  const d = info.data;
  let offset = 8; // skip discriminator

  const id = d.readBigUInt64LE(offset); offset += 8;
  const admin = new PublicKey(d.slice(offset, offset + 32)); offset += 32;
  const numOptions = d.readUInt8(offset); offset += 1;
  const bets: bigint[] = [];
  for (let i = 0; i < 8; i++) { bets.push(d.readBigUInt64LE(offset)); offset += 8; }
  const total = d.readBigUInt64LE(offset); offset += 8;
  const resolved = d.readUInt8(offset) !== 0; offset += 1;
  const winner = d.readUInt8(offset); offset += 1;
  const expiry = Number(d.readBigInt64LE(offset));

  return { id, admin, numOptions, bets, total, resolved, winner, expiry };
}

/** Fetch and decode an on-chain Position account. Returns null if not found. */
export async function fetchPosition(
  connection: Connection,
  chainMarketId: bigint,
  user: PublicKey
): Promise<OnChainPosition | null> {
  const [market] = marketPda(chainMarketId);
  const [pda]    = positionPda(market, user);
  const info = await connection.getAccountInfo(pda);
  if (!info) return null;
  const d = info.data;
  let offset = 8;

  const posUser  = new PublicKey(d.slice(offset, offset + 32)); offset += 32;
  const posMarket = new PublicKey(d.slice(offset, offset + 32)); offset += 32;
  const option   = d.readUInt8(offset); offset += 1;
  const amount   = d.readBigUInt64LE(offset); offset += 8;
  const claimed  = d.readUInt8(offset) !== 0;

  return { user: posUser, market: posMarket, option, amount, claimed };
}
