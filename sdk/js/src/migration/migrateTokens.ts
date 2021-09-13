import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { ixFromRust } from "../solana";

export default async function migrateTokens(
  connection: Connection,
  payerAddress: string,
  program_id: string,
  from_mint: string,
  to_mint: string,
  input_token_account: string,
  output_token_account: string,
  amount: BigInt
) {
  const { authority_address, migrate_tokens } = await import(
    "../solana/migration/wormhole_migration"
  );
  const approvalIx = Token.createApproveInstruction(
    TOKEN_PROGRAM_ID,
    new PublicKey(input_token_account),
    new PublicKey(authority_address(program_id)),
    new PublicKey(payerAddress),
    [],
    Number(amount)
  );
  const ix = ixFromRust(
    migrate_tokens(
      program_id,
      from_mint,
      to_mint,
      input_token_account,
      output_token_account,
      amount
    )
  );
  const transaction = new Transaction().add(approvalIx, ix);
  const { blockhash } = await connection.getRecentBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = new PublicKey(payerAddress);
  return transaction;
}
