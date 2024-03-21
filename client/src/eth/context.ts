import { createContext } from "react";
import { JsonRpcProvider } from "ethers";

interface EthContextType {
  provider: JsonRpcProvider | null;
  // Add any other properties you have in your context
}

export const EthContext = createContext<EthContextType | null>({provider: null});