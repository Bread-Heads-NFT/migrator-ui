import { Alert, Button, Card, Checkbox, Paper, SimpleGrid, Space, Text } from '@mantine/core';

import { CollectionV1 } from '@metaplex-foundation/mpl-core';
import { DigitalAsset, findMetadataPda } from '@metaplex-foundation/mpl-token-metadata';
import { BGL_MIGRATOR_PROGRAM_ID, startTokenMetadata } from '@breadheads/bgl-migrator';
import { IconAlertCircle } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { isSome } from '@metaplex-foundation/umi';
import { string, publicKey as publicKeySerializer } from '@metaplex-foundation/umi/serializers';
import { TmCollectionDetails } from './TmCollectionDetails';
import { useUmi } from '@/providers/useUmi';
import { CoreCollectionDetails } from './CoreCollectionDetails';

export function MigrateCollection({ tmCollection, coreCollection }: { tmCollection: DigitalAsset, coreCollection?: CollectionV1 }) {
  // const { data: assets, error, isPending } = useFetchAssetsByCollection(collection.publicKey);
  const umi = useUmi();
  const [checked, setChecked] = useState(false);

  const tmCollectionSize = isSome(tmCollection.metadata.collectionDetails) ? tmCollection.metadata.collectionDetails.value.__kind === 'V1' ? tmCollection.metadata.collectionDetails.value.size.toString() : 'Unknown' : 'Unknown';

  const handleOnClick = useCallback(async () => {
    console.log('tmCollection', tmCollection);
    const coreCollectionPda = umi.eddsa.findPda(BGL_MIGRATOR_PROGRAM_ID, [
      string({ size: 'variable' }).serialize('migrator'),
      publicKeySerializer().serialize(tmCollection.publicKey),
    ]);
    await startTokenMetadata(umi, {
      tmCollectionMetadata: findMetadataPda(umi, { mint: tmCollection.publicKey }),
      coreCollection: coreCollectionPda,
    }).sendAndConfirm(umi);
  }, [umi, tmCollection]);

  return (
    <>
      <SimpleGrid cols={2} mt="xl" spacing="lg" pb="xl">
        <Paper p="xl" radius="md">
          <TmCollectionDetails collection={tmCollection} />
        </Paper>
        {coreCollection && (
          <Paper p="xl" radius="md">
            <CoreCollectionDetails collection={coreCollection} />
          </Paper>)}
        {!coreCollection && (
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
              <Text fz="sm" fw={700} c="dimmed">Collection Size</Text>
              {isSome(tmCollection.metadata.collectionDetails) && (<Text fz="sm" fw={700}>{tmCollectionSize} assets</Text>)}
              <Text fz="sm" fw={700} c="dimmed">Rent return for Creator:</Text>
              <Text fz="sm" fw={700}>{parseInt(tmCollectionSize, 10) * 0.0005} SOL</Text>
              <Text fz="sm" fw={700} c="dimmed">Rent return for Collectors:</Text>
              <Text fz="sm" fw={700}>{parseInt(tmCollectionSize, 10) * 0.005} SOL</Text>
            </Card>
            <Space h="md" />
            <Button disabled={!checked} fullWidth onClick={handleOnClick}>Migrate to Core</Button>
          </Paper>)}
      </SimpleGrid>
    </>
  );
}
