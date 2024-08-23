import { PublicKey, Umi } from '@metaplex-foundation/umi';
import { useQuery } from '@tanstack/react-query';
import { AssetV1 } from '@metaplex-foundation/mpl-core';

export async function accountExists(umi: Umi, account: PublicKey) {
  const maybeAccount = await umi.rpc.getAccount(account);
  if (maybeAccount.exists) {
    return true;
  }
  return false;
}

export const useAssetJson = (address: PublicKey, uri: string) => useQuery({
  queryKey: ['fetch-asset-json', address],
  queryFn: async () => {
    const j = await (await fetch(uri)).json();
    return j;
  },
});

export const useUriBlob = (uri: string) => useQuery({
  queryKey: ['fetch-uri-blob', uri],
  queryFn: async () => {
    if (!uri) {
      return null;
    }
    const blob = await (await fetch(uri)).blob();
    return blob;
  },
});

export const useAssetJsonWithImage = (asset: Pick<AssetV1, 'publicKey' | 'uri'>) => {
  const { isPending: jsonPending, data: json } = useAssetJson(asset.publicKey, asset.uri);
  const { isPending: imagePending, data: blob } = useUriBlob(json?.image);

  return { isPending: jsonPending || imagePending, json, image: blob };
};
