/**
 * Auto-generated IDL type for the `quant` program.
 * Re-generate with: anchor build && cat target/idl/quant.json
 */
export type Quant = {
  address: string;
  metadata: { name: 'quant'; version: '0.1.0'; spec: '0.1.0' };
  instructions: [
    {
      name: 'initializeMarket';
      discriminator: [35, 35, 189, 193, 155, 48, 170, 203];
      accounts: [
        { name: 'admin'; writable: true; signer: true },
        { name: 'market'; writable: true; pda: { seeds: [{ kind: 'const'; value: [109, 97, 114, 107, 101, 116] }, { kind: 'arg'; path: 'marketId' }] } },
        { name: 'vault'; writable: true; pda: { seeds: [{ kind: 'const'; value: [118, 97, 117, 108, 116] }, { kind: 'arg'; path: 'marketId' }] } },
        { name: 'systemProgram'; address: '11111111111111111111111111111111' },
      ];
      args: [
        { name: 'marketId'; type: 'u64' },
        { name: 'numOptions'; type: 'u8' },
        { name: 'expiry'; type: 'i64' },
      ];
    },
    {
      name: 'placeBet';
      discriminator: [number, number, number, number, number, number, number, number];
      accounts: [
        { name: 'user'; writable: true; signer: true },
        { name: 'market'; writable: true },
        { name: 'vault'; writable: true },
        { name: 'position'; writable: true },
        { name: 'systemProgram'; address: '11111111111111111111111111111111' },
      ];
      args: [
        { name: 'option'; type: 'u8' },
        { name: 'amount'; type: 'u64' },
      ];
    },
    {
      name: 'resolveMarket';
      discriminator: [number, number, number, number, number, number, number, number];
      accounts: [
        { name: 'admin'; signer: true },
        { name: 'market'; writable: true },
      ];
      args: [{ name: 'winningOption'; type: 'u8' }];
    },
    {
      name: 'claimPayout';
      discriminator: [number, number, number, number, number, number, number, number];
      accounts: [
        { name: 'user'; writable: true; signer: true },
        { name: 'market' },
        { name: 'vault'; writable: true },
        { name: 'position'; writable: true },
        { name: 'systemProgram'; address: '11111111111111111111111111111111' },
      ];
      args: [];
    },
    {
      name: 'withdrawFees';
      discriminator: [number, number, number, number, number, number, number, number];
      accounts: [
        { name: 'admin'; writable: true; signer: true },
        { name: 'market' },
        { name: 'vault'; writable: true },
        { name: 'systemProgram'; address: '11111111111111111111111111111111' },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: 'Market';
      discriminator: [number, number, number, number, number, number, number, number];
    },
    {
      name: 'Position';
      discriminator: [number, number, number, number, number, number, number, number];
    },
  ];
  types: [
    {
      name: 'Market';
      type: {
        kind: 'struct';
        fields: [
          { name: 'id'; type: 'u64' },
          { name: 'admin'; type: 'publicKey' },
          { name: 'numOptions'; type: 'u8' },
          { name: 'bets'; type: { array: ['u64', 8] } },
          { name: 'total'; type: 'u64' },
          { name: 'resolved'; type: 'bool' },
          { name: 'winner'; type: 'u8' },
          { name: 'expiry'; type: 'i64' },
          { name: 'vaultBump'; type: 'u8' },
          { name: 'bump'; type: 'u8' },
        ];
      };
    },
    {
      name: 'Position';
      type: {
        kind: 'struct';
        fields: [
          { name: 'user'; type: 'publicKey' },
          { name: 'market'; type: 'publicKey' },
          { name: 'option'; type: 'u8' },
          { name: 'amount'; type: 'u64' },
          { name: 'claimed'; type: 'bool' },
          { name: 'bump'; type: 'u8' },
        ];
      };
    },
  ];
  errors: [
    { code: 6000; name: 'InvalidOptions'; msg: 'Number of options must be between 2 and 8' },
    { code: 6001; name: 'InvalidExpiry'; msg: 'Expiry must be in the future' },
    { code: 6002; name: 'MarketResolved'; msg: 'Market has already been resolved' },
    { code: 6003; name: 'MarketExpired'; msg: 'Market has expired' },
    { code: 6004; name: 'InvalidOption'; msg: 'Invalid option index' },
    { code: 6005; name: 'ZeroAmount'; msg: 'Bet amount must be greater than zero' },
    { code: 6006; name: 'Overflow'; msg: 'Arithmetic overflow' },
    { code: 6007; name: 'MarketNotResolved'; msg: 'Market has not been resolved yet' },
    { code: 6008; name: 'NotAWinner'; msg: 'This position is not on the winning option' },
    { code: 6009; name: 'AlreadyClaimed'; msg: 'Payout has already been claimed' },
    { code: 6010; name: 'ZeroWinnerPool'; msg: "Winner option has no bets — nothing to pay out" },
    { code: 6011; name: 'OptionMismatch'; msg: 'Cannot change option on an existing position' },
  ];
};
