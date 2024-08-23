'use client';

import { Center, Container, Loader, Text } from '@mantine/core';
import { BGL_MIGRATOR_PROGRAM_ID } from '@breadheads/bgl-migrator';
import { string, publicKey as publicKeySerializer } from '@metaplex-foundation/umi/serializers';
import { publicKey } from '@metaplex-foundation/umi';
import { MigrateCollection } from '@/components/CreatorMigrate/MigrateCollection';
import { useFetchCollection, useFetchTmAsset } from '@/hooks/fetch';
import { useUmi } from '@/providers/useUmi';

export default function MigrateCollectionPage({ params }: { params: { collection: string } }) {
  const umi = useUmi();
  const { collection } = params;
  const { error: tmError, isPending: tmIsPending, data: tmCollection } = useFetchTmAsset(collection);
  const coreCollectionPda = umi.eddsa.findPda(BGL_MIGRATOR_PROGRAM_ID, [
    string({ size: 'variable' }).serialize('migrator'),
    publicKeySerializer().serialize(collection),
  ]);
  const { error: coreError, isPending: coreIsPending, data: coreCollection } = useFetchCollection(publicKey(coreCollectionPda));

  return (
    <Container size="xl" pb="xl">
      {(tmIsPending || coreIsPending) &&
        <Center h="20vh">
          <Loader />
        </Center>
      }
      {tmError &&
        <Center h="20vh">
          <Text>Collection does not exist</Text>
        </Center>}
      {tmCollection && coreCollection && <MigrateCollection tmCollection={tmCollection} coreCollection={coreCollection} />}
      {tmCollection && coreError && <MigrateCollection tmCollection={tmCollection} />}
    </Container>);
}
