import { useHoldingsStore } from "@/store/holdingsStore";
import { useQuery } from "@tanstack/react-query";
import { coingeckoApi } from "@/services/coingecko";

function App() {
  const { holdings, addHolding } = useHoldingsStore();

  // Test API
  const { data: bitcoinPrice, isLoading } = useQuery({
    queryKey: ["coin-price", "bitcoin"],
    queryFn: () => coingeckoApi.getCoinPrice("bitcoin"),
  });

  // Test add holding
  const handleAddTest = () => {
    addHolding({
      coinId: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      amount: 0.5,
      buyPrice: 45000,
      buyDate: new Date().toISOString(),
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Crypto Portfolio Tracker</h1>

      <div className="mt-4">
        <h2 className="text-xl">Bitcoin Price:</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <p>${bitcoinPrice?.current_price.toLocaleString()}</p>
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={handleAddTest}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add Test Holding
        </button>
      </div>

      <div className="mt-4">
        <h2 className="text-xl">Holdings ({holdings.length}):</h2>
        <pre className="bg-gray-100 p-4 rounded mt-2">
          {JSON.stringify(holdings, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default App;
