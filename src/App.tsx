import { Heading } from "@radix-ui/themes";
import { TransferCoin } from "./component/TransferCoin";

function App() {
  return (
    <>
      <Heading>SUI Coin Transfer</Heading>
      <main className="min-h-screen w-full flex flex-col justify-center">
        <TransferCoin />
      </main>
    </>
  );
}

export default App;
