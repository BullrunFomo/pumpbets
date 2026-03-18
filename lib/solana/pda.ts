import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_QUANT_PROGRAM_ID ?? '7sbjfUqWWkMET7grRqUZggA3nMDTWcnX8MLNQnECx9CX'
);

/** Convert a JS number / bigint to an 8-byte little-endian Buffer (u64). */
function u64ToLeBytes(id: number | bigint): Buffer {
  const buf = Buffer.alloc(8);
  const bn = new BN(id.toString());
  bn.toArrayLike(Buffer, 'le', 8).copy(buf);
  return buf;
}

export function marketPda(marketId: number | bigint): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('market'), u64ToLeBytes(marketId)],
    PROGRAM_ID
  );
}

export function vaultPda(marketId: number | bigint): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), u64ToLeBytes(marketId)],
    PROGRAM_ID
  );
}

export function positionPda(
  marketPubkey: PublicKey,
  userPubkey: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('position'), marketPubkey.toBytes(), userPubkey.toBytes()],
    PROGRAM_ID
  );
}
