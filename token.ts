import {
  PublicKey,
  Transaction,
  type Connection,
  sendAndConfirmTransaction,
  Keypair,
} from '@solana/web3.js';
import { getAssociatedTokenAddressSync, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export function ataFor(owner: string, mint: string): string {
  const ata = getAssociatedTokenAddressSync(new PublicKey(mint), new PublicKey(owner), false, TOKEN_PROGRAM_ID);
  return ata.toBase58();
}

export async function getTokenAccountBalanceRaw(connection: Connection, tokenAccount: string): Promise<bigint> {
  const info = await connection.getTokenAccountBalance(new PublicKey(tokenAccount));
  // amount is string in base units.
  return BigInt(info.value.amount);
}

export async function transferSpl(params: {
  connection: Connection;
  payer: Keypair;
  sourceTokenAccount: string;
  destinationOwner: string;
  mint: string;
  amountRaw: bigint;
}): Promise<string> {
  const { connection, payer, sourceTokenAccount, destinationOwner, mint, amountRaw } = params;
  const source = new PublicKey(sourceTokenAccount);
  const destOwner = new PublicKey(destinationOwner);
  const mintPk = new PublicKey(mint);

  const destinationAta = getAssociatedTokenAddressSync(mintPk, destOwner, false, TOKEN_PROGRAM_ID);

  const ix = createTransferInstruction(
    source,
    destinationAta,
    payer.publicKey,
    Number(amountRaw),
    [],
    TOKEN_PROGRAM_ID,
  );

  const tx = new Transaction().add(ix);
  const sig = await sendAndConfirmTransaction(connection, tx, [payer], { commitment: 'confirmed' });
  return sig;
}
