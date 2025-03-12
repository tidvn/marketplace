import { KoiosProvider } from "@meshsdk/core";

const koiosProviderSingleton = () => {
  return new KoiosProvider("preview");
};

declare const globalThis: {
  koiosProviderGlobal: ReturnType<typeof koiosProviderSingleton>;
} & typeof global;

const koiosProvider = globalThis.koiosProviderGlobal ?? koiosProviderSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.koiosProviderGlobal = koiosProvider;
}

export { koiosProvider };
