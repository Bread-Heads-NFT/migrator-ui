import { Card, Group, Image, Skeleton, Text } from '@mantine/core';
import { CollectionV1 } from '@metaplex-foundation/mpl-core';
import { useAssetJson } from '../../hooks/asset';

import classes from './TmCard.module.css';
import RetainQueryLink from '../RetainQueryLink';

export function CoreCollectionCard({ collection }: { collection: CollectionV1 }) {
  const { error, isPending, data: json } = useAssetJson(collection.publicKey, collection.uri);

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
            <Text fw={500}>{collection.name}</Text>
          </Group>

        </Card>

      </Skeleton>
    </RetainQueryLink>
  );
}
