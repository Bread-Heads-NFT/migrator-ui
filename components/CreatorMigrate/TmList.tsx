import { Alert, Button, Card, Center, Checkbox, Loader, Paper, SimpleGrid, Space, Text, Title } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { DigitalAsset, fetchDigitalAssetWithTokenByMint, findMetadataPda } from '@metaplex-foundation/mpl-token-metadata';
import { IconAlertCircle } from '@tabler/icons-react';
import { BGL_MIGRATOR_PROGRAM_ID, migrateTokenMetadata } from '@breadheads/bgl-migrator';
import { generateSigner, isSome, PublicKey, Transaction } from '@metaplex-foundation/umi';
import { string, publicKey as publicKeySerializer, base58 } from '@metaplex-foundation/umi/serializers';
import { useUmi } from '@/providers/useUmi';
import { useFetchMigratableTmAssetsByOwner } from '@/hooks/fetch';
import { SelectableTmCard } from './SelectableTmCard';
import { notifications } from '@mantine/notifications';

export function TmList() {
  const umi = useUmi();
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<DigitalAsset[]>([]);
  const [migratedAssets, setMigratedAssets] = useState<PublicKey[]>([]);
  const [checked, setChecked] = useState(false);

  const { data, error, fetchNextPage, hasNextPage, isFetching } = useFetchMigratableTmAssetsByOwner(umi.identity.publicKey);

  useEffect(() => {
    if (data) {
      setSelectedAssets([]);
      const allAssets = data.pages.reduce((acc: DigitalAsset[], page) => [...acc, ...page.migratableAssets], []);
      setAssets(allAssets);
    }
  }, [data]);

  useEffect(() => {
    console.log(selectedAssets);
  }, [selectedAssets]);

  useEffect(() => {
    console.log('hasNextPage', hasNextPage);
    console.log('isFetching', isFetching);
    if (!isFetching && hasNextPage) {
      console.log('fetch next page');
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetching]);

  const handleOnClick = useCallback(async () => {
    const txes: Transaction[] = [];
    const mints: PublicKey[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const asset of selectedAssets) {
      if (isSome(asset.metadata.collection)) {
        const collectionMetadata = findMetadataPda(umi, { mint: asset.metadata.collection.value.key });
        const coreCollectionPda = umi.eddsa.findPda(BGL_MIGRATOR_PROGRAM_ID, [
          string({ size: 'variable' }).serialize('migrator'),
          publicKeySerializer().serialize(asset.metadata.collection.value.key),
        ]);
        const newAsset = generateSigner(umi);
        // eslint-disable-next-line no-await-in-loop
        const unsignedTx = await migrateTokenMetadata(umi, {
          collectionMetadata,
          metadata: asset.metadata.publicKey,
          edition: asset.edition!.publicKey,
          mint: asset.publicKey,
          // eslint-disable-next-line no-await-in-loop
          token: (await fetchDigitalAssetWithTokenByMint(umi, asset.publicKey)).token.publicKey,
          asset: newAsset,
          collection: coreCollectionPda,
          updateAuthority: asset.metadata.updateAuthority,
        }).buildWithLatestBlockhash(umi);
        // eslint-disable-next-line no-await-in-loop
        const signedTx = await newAsset.signTransaction(unsignedTx);
        txes.push(signedTx);

        mints.push(asset.publicKey);
      }
    }

    const signedTxes = await umi.identity.signAllTransactions(txes);
    // eslint-disable-next-line no-restricted-syntax
    for (const tx of signedTxes) {
      let currentMint: PublicKey | undefined;
      mints.forEach((mint) => {
        if (tx.message.accounts.includes(mint)) {
          currentMint = mint;
          setMigratedAssets((prevMigratedAssets) => [...prevMigratedAssets, mint]);
        }
      });
      // eslint-disable-next-line no-await-in-loop
      const res = await umi.rpc.sendTransaction(tx);
      notifications.show({ id: currentMint, title: `Migrating ${currentMint || ''}`, message: 'TX: ' + base58.deserialize(res), color: 'gray', loading: true });
      umi.rpc.confirmTransaction(res, { strategy: { type: 'blockhash', ...(await umi.rpc.getLatestBlockhash()) }, }).then((result) => {
        if (result.value.err) {
          notifications.update({ id: currentMint, title: `Failed ${currentMint || ''}`, message: 'TX: ' + base58.deserialize(res), color: 'red', loading: false });
        } else {
          notifications.update({ id: currentMint, title: `Migrated ${currentMint || ''}`, message: 'TX: ' + base58.deserialize(res), color: 'green', loading: false });
        }
      });
    }
  }, [umi, selectedAssets]);

  return (
    <>
      <Title>Your Migratable Assets</Title>
      {error ? (
        <Center h="20vh" ta="center"><Text>There was an error fetching your migratable assets.</Text></Center>
      ) : assets.length ? (
        <>
          <Paper p="xl" radius="md">
            <Alert title="Warning!" color="red" icon={<IconAlertCircle />}>
              Migrating this collection to Core will break provenance with the original SPL Token mints. Migration is not reversible.
              <Checkbox
                checked={checked}
                onChange={() => setChecked(!checked)}
                mt="md"
                label="I understand the risks and want to proceed"
              />
            </Alert>
            <Card mt="md">
              <Text fz="sm" fw={700} c="dimmed">Rent return:</Text>
              <Text fz="sm" fw={700}>{selectedAssets.length * 0.005} SOL</Text>
            </Card>
            <Space h="md" />
            <Button disabled={!checked} fullWidth onClick={handleOnClick}>Migrate to Core</Button>
          </Paper>
          <SimpleGrid
            cols={{
              base: 1,
              sm: 2,
              lg: 5,
              xl: 6,
            }}
          >
            {assets.filter((asset) => !migratedAssets.includes(asset.publicKey)).map((asset) => (
              <SelectableTmCard asset={asset} key={asset.publicKey} selectedAssets={selectedAssets} setSelectedAssets={setSelectedAssets} />
            ))}
          </SimpleGrid>
          {isFetching && hasNextPage && (
            <Center mt="md"><Loader /></Center>
          )}
        </>
      ) : isFetching ? (
        <Center h="20vh"><Loader /></Center>
      ) : (
        <Center h="20vh" ta="center"><Text>You don&apos;t have any migratable assets.</Text></Center>
      )}
    </>
  );
}
