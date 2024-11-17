import { IndexService } from "@ethsign/sp-sdk";
import { useQuery } from "@tanstack/react-query";

export function useAttestations() {
  const indexService = new IndexService("testnet");

  return useQuery({
    queryKey: ["attestations"],
    queryFn: async () => {
      const res = await indexService.queryAttestationList({
        id: "",
        // schemaId: "0x31d",
        attester: "0x2D6DdAC0924Ca9C2a06Daec151Cb9A61a1F084f9",
        page: 1,
        mode: "onchain",
        indexingValue: "",
      });

      // const res = await indexService.queryAttestation(
      //   "onchain_evm_11155111_0x41f",
      // );

      return res;
    },
  });
}
