import { Card, Group, Image, Skeleton, Text } from '@mantine/core';
import { DigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { useAssetJson } from '../../hooks/asset';

import classes from './TmCard.module.css';
import RetainQueryLink from '../RetainQueryLink';

export function TmCollectionCard({ collection }: { collection: DigitalAsset }) {
  const { error, isPending, data: json } = useAssetJson(collection.publicKey, collection.metadata.uri);

  return (
    <RetainQueryLink
      href={`/creators/migrate/${collection.publicKey}`}
      style={{
        textDecoration: 'none',
      }}
    >
      <Skeleton
        visible={isPending}
        className={classes.cardContainer}
      >
        <Card shadow="sm" padding="lg" radius="md">
          <Card.Section>
            <Skeleton visible={!!error}>
              <Image
                src={json?.image}
                height={200}
              />
            </Skeleton>
          </Card.Section>
          <Group justify="space-between" mt="md">
            <Text fw={500}>{collection.metadata.name}</Text>
          </Group>

        </Card>

      </Skeleton>
    </RetainQueryLink>
  );
}
