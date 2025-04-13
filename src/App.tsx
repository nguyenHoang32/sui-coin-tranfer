import { TransferCoin } from "./component/TransferCoin";

function App() {
  return (
    <>
      <main className="min-h-screen w-full flex flex-col justify-center items-center">
        <h3 className="text-black mb-[60px] text-2xl font-bold">SUI Coin Transfer</h3>
        <TransferCoin />
      </main>
    </>
  );
}

export default App;
