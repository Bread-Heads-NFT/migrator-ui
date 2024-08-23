import { Checkbox, Group, Image, Skeleton, Text } from '@mantine/core';
import { DigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { useState } from 'react';
import { useAssetJson } from '../../hooks/asset';

import classes from './SelectableTmCard.module.css';

export function SelectableTmCard({
  asset,
  selectedAssets,
  setSelectedAssets,
}: {
  asset: DigitalAsset,
  selectedAssets: DigitalAsset[],
  setSelectedAssets: (assets: DigitalAsset[]) => void
}) {
  const [selected, setSelected] = useState(false);
  const { error, isPending, data: json } = useAssetJson(asset.publicKey, asset.metadata.uri);

  const handleSelect = () => {
    if (selected) {
      setSelectedAssets(selectedAssets.filter((currentAsset) => currentAsset.publicKey !== asset.publicKey));
    } else {
      setSelectedAssets([...selectedAssets, asset]);
    }
  };

  return (
    <Skeleton
      visible={isPending}
      className={classes.cardContainer}
    >
      <Checkbox.Card
        className={classes.root}
        p="lg"
        radius="md"
        checked={selected}
        onClick={() => {
          setSelected(!selected);
          handleSelect();
        }}
      >
        <Skeleton visible={!!error}>
          <Image
            src={json?.image}
            height={200}
          />
        </Skeleton>
        <Group justify="space-between" mt="md">
          <Checkbox.Indicator />
          <Text fw={500}>{asset.metadata.name}</Text>
        </Group>

      </Checkbox.Card>
    </Skeleton>
  );
}
