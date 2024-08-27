import { isSome, PublicKey, publicKey } from '@metaplex-foundation/umi';
import { AssetV1, collectionAddress, CollectionV1, deserializeAssetV1, deserializeCollectionV1, fetchAssetV1, fetchCollectionV1, getAssetV1GpaBuilder, getCollectionV1GpaBuilder, Key, updateAuthority } from '@metaplex-foundation/mpl-core';
import { fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { BGL_MIGRATOR_PROGRAM_ID } from '@breadheads/bgl-migrator';
import { string, publicKey as publicKeySerializer } from '@metaplex-foundation/umi/serializers';
import { useEnv } from '@/providers/useEnv';
import { useUmi } from '@/providers/useUmi';

export function useFetchAsset(mint: string) {
  const umi = useUmi();
  const env = useEnv();
  return useQuery({
    retry: false,
    refetchOnMount: true,
    queryKey: ['fetch-nft', env, mint],
    queryFn: async () => fetchAssetV1(umi, publicKey(mint)),
  });
}

export function useFetchCollection(mint?: string) {
  const umi = useUmi();
  const env = useEnv();
  if (!mint) return { isPending: false, error: undefined, isLoading: false, isError: false, data: undefined };
  return useQuery({
    retry: false,
    refetchOnMount: true,
    queryKey: ['fetch-collection', env, mint],
    queryFn: async () => fetchCollectionV1(umi, publicKey(mint)),
  });
}

export function useFetchTmAsset(mint?: string) {
  const umi = useUmi();
  const env = useEnv();
  if (!mint) return { isPending: false, error: undefined, isLoading: false, isError: false, data: undefined };
  return useQuery({
    retry: false,
    refetchOnMount: true,
    queryKey: ['fetch-tm-asset', env, mint],
    queryFn: async () => {
      const asset = await fetchDigitalAsset(umi, publicKey(mint));
      console.log(asset);
      return asset;
    },
  });
}

export function useInvalidateFetchAssetWithCollection() {
  const env = useEnv();
  const queryClient = useQueryClient();

  return {
    invalidate: (mint: string) => queryClient.invalidateQueries({ queryKey: ['fetch-asset-with-collection', env, mint] }),
  };
}

export function useFetchAssetWithCollection(mint: string) {
  const umi = useUmi();
  const env = useEnv();

  return useQuery({
    retry: false,
    refetchOnMount: true,
    queryKey: ['fetch-asset-with-collection', env, mint],
    queryFn: async () => {
      const asset = await fetchAssetV1(umi, publicKey(mint));
      const colAddr = collectionAddress(asset);
      let collection;
      if (colAddr) {
        collection = await fetchCollectionV1(umi, colAddr);
      }
      return { asset, collection };
    },
  });
}

export function useFetchAssetsByOwner(owner?: string) {
  const umi = useUmi();
  const env = useEnv();
  const o = owner ? publicKey(owner) : umi.identity.publicKey;
  return useQuery({
    queryKey: ['fetch-assets', env, o],
    queryFn: async () => {
      const accounts = await getAssetV1GpaBuilder(umi).whereField('owner', o).whereField('key', Key.AssetV1).get();
      // TODO use getDeserialized() instead of the following temporary workaround for devnet breaking changes
      return accounts.map((account) => {
        try {
          return deserializeAssetV1(account);
        } catch (e) {
          return null;
        }
      }).filter((a) => a) as AssetV1[];
    },
  });
}

export function useFetchAssetsByCollection(collection: string) {
  const umi = useUmi();
  const env = useEnv();
  return useQuery({
    queryKey: ['fetch-assets-by-collection', env, collection],
    queryFn: async () => {
      const accounts = await getAssetV1GpaBuilder(umi).whereField('updateAuthority', updateAuthority('Collection', [publicKey(collection)])).whereField('key', Key.AssetV1).get();
      return accounts.map((account) => {
        try {
          // TODO use getDeserialized() instead of the following temporary workaround for devnet breaking changes
          return deserializeAssetV1(account);
        } catch (e) {
          return null;
        }
      }).filter((a) => a) as AssetV1[];
    },
  });
}

export function useInvalidateFetchCollectionsByUpdateAuthority() {
  const env = useEnv();
  const queryClient = useQueryClient();

  return {
    invalidate: (updateAuth: string) => queryClient.invalidateQueries({ queryKey: ['fetch-asset-with-collection', env, updateAuth] }),
  };
}

export function useFetchCollectionsByUpdateAuthority(updateAuth: string) {
  const umi = useUmi();
  const env = useEnv();
  return useQuery({
    queryKey: ['fetch-collections', env, updateAuth],
    queryFn: async () => {
      try {
        const accounts = await getCollectionV1GpaBuilder(umi).whereField('updateAuthority', publicKey(updateAuth)).whereField('key', Key.CollectionV1).get();
        // TODO use getDeserialized() instead of the following temporary workaround for devnet breaking changes
        return accounts.map((account) => {
          try {
            return deserializeCollectionV1(account);
          } catch (e) {
            return null;
          }
        }).filter((a) => a) as CollectionV1[];
      } catch (err) {
        console.error('Error fetching collections', err);
        throw err;
      }
    },
  });
}

export function useFetchTmCollectionsByOwner(owner: PublicKey, page?: number) {
  const umi = useUmi();
  const env = useEnv();

  return useQuery({
    queryKey: ['fetch-tm-collections', env, owner, page],
    queryFn: async () => {
      try {
        // eslint-disable-next-line no-await-in-loop
        const assets = await umi.rpc.getAssetsByOwner({ owner, page, limit: 1000 });
        console.log(assets);
        // const assets = await umi.rpc.getAssetsByOwner({ owner });
        const filtered = assets.items.filter((asset) => {
          if (asset.compression.compressed) {
            return false;
          }
          console.log(asset.content.metadata.name);
          // eslint-disable-next-line no-restricted-syntax
          for (const authority of asset.authorities) {
            if (authority.address === owner) {
              return true;
            }
          }
          return false;
        });

        const collections = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const asset of filtered) {
          try { // eslint-disable-next-line no-await-in-loop
            const da = await fetchDigitalAsset(umi, asset.id);
            console.log(da.metadata.name);
            if (isSome(da.metadata.collectionDetails)) {
              collections.push(da);
            }
          } catch (e) {
            console.log(`Error fetching TM collection ${asset.id.toString()}`);
          }
        }
        return { collections, end: (assets.total < 1000) };
      } catch (err) {
        console.error('Error fetching TM collections', err);
        throw err;
      }
    },
  });
}

export function useFetchMigratableTmAssetsByOwner(owner: PublicKey) {
  const umi = useUmi();
  const env = useEnv();

  return useInfiniteQuery({
    queryKey: ['fetch-migratable-tm-collections', env, owner],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      try {
        // eslint-disable-next-line no-await-in-loop
        console.log('Fetching page', pageParam);
        const assets = await umi.rpc.getAssetsByOwner({ owner, page: pageParam, limit: 1000 });
        console.log(assets);
        // const assets = await umi.rpc.getAssetsByOwner({ owner });
        const filtered = assets.items.filter((asset) => {
          if (asset.content.metadata.name.includes('test')) {
            console.log(asset.content.metadata);
          }
          if (asset.interface !== 'V1_NFT' || asset.compression.compressed) {
            return false;
          }
          console.log(asset.content.metadata.name);
          // eslint-disable-next-line no-restricted-syntax
          if (asset.grouping.length > 0) {
            return true;
          }
          // eslint-disable-next-line no-restricted-syntax
          return false;
        });

        const migratableAssets = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const asset of filtered) {
          const coreCollectionPda = umi.eddsa.findPda(BGL_MIGRATOR_PROGRAM_ID, [
            string({ size: 'variable' }).serialize('migrator'),
            publicKeySerializer().serialize(publicKey(asset.grouping[0].group_value)),
          ]);
          try {
            // eslint-disable-next-line no-await-in-loop
            const coreCollection = await umi.rpc.getAccount(publicKey(coreCollectionPda));
            if (coreCollection.exists) {
              // eslint-disable-next-line no-await-in-loop
              const da = await fetchDigitalAsset(umi, asset.id);
              migratableAssets.push(da);
            }
          } catch (e) {
            console.log(`Error fetching TM collection ${asset.id.toString()}`);
          }
        }
        return { migratableAssets, end: (assets.total < 1000) };
      } catch (err) {
        console.error('Error fetching TM collections', err);
        throw err;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      console.log('getNextPageParam', lastPage, lastPageParam);
      if (lastPage.end) {
        return null;
      }
      return lastPageParam + 1;
    },
  });
}
