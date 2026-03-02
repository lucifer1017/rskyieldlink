# Sovryn Adapter

The Sovryn adapter enables Yield-Link to deposit rBTC into Sovryn's lending protocol (iRBTC LoanToken) for yield.

## Flow

1. User creates peg-in quote via Flyover
2. User sends BTC to the generated address
3. LP advances rBTC to user's Rootstock address
4. On peg-in completion → adapter automatically deposits rBTC into Sovryn
5. User receives iRBTC (interest-bearing token)

## Usage

### useSovrynDeposit (recommended)

Combined hook for Flyover peg-in + Sovryn deposit:

```tsx
import { useSovrynDeposit } from "@rootstock-kits/yield-link/hooks";
import { useAccount } from "wagmi";

function SovrynDepositCard() {
  const { address } = useAccount();
  const [amount, setAmount] = useState("0.001");

  const {
    createQuote,
    btcDepositAddress,
    qrCodeDataUrl,
    pegInState,
    isPegInComplete,
    executeSovrynDeposit,
  } = useSovrynDeposit({
    rskAddress: address,
    amountWei: parseEther(amount),
    network: "Testnet",
  });

  return (
    <div>
      <input value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button onClick={createQuote}>Generate BTC address</button>
      {btcDepositAddress && (
        <>
          <p>Send BTC to: {btcDepositAddress}</p>
          {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="QR" />}
          <p>Status: {pegInState}</p>
          {isPegInComplete && <p>Depositing into Sovryn...</p>}
        </>
      )}
    </div>
  );
}
```

### Manual adapter usage

```tsx
import { getAdapter, sovrynAdapter } from "@rootstock-kits/yield-link";
import { useWalletClient } from "wagmi";

const adapter = getAdapter("sovryn");
const params = await adapter.getDepositParams(amountWei, receiver, protocol);

// Execute with wallet
const hash = await walletClient.sendTransaction({
  to: params.to,
  data: params.data,
  value: params.value,
});
```

## Contract addresses

| Network | iRBTC LoanToken |
|---------|-----------------|
| Mainnet | `0xa9DcM63e9d6F35F997E7B4e72F8595f737c6A138` |
| Testnet | Same (verify from Sovryn) |

**Important:** Verify addresses from Sovryn's official sources before mainnet use:
- https://github.com/DistributedCollective/Sovryn-smart-contracts
- https://sovryn.app

## Deposit methods

Sovryn adapter supports:
- **deposit** (default): ERC-4626 `deposit(uint256 assets, address receiver)`
- **mint**: Sovryn LoanToken `mint(address receiver, uint256 depositAmount)`

```ts
import { SovrynAdapter } from "@rootstock-kits/yield-link";

const adapter = new SovrynAdapter("mint");
```
