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
  const { error, isPending, data: json } = useAssetJson(asset.publicKey, asset.metadata.uri);

  return (
    <Skeleton
      visible={isPending}
      className={classes.cardContainer}
    >
      <Checkbox.Card
        className={classes.root}
        p="lg"
        radius="md"
        checked={selectedAssets.find((a) => a.publicKey === asset.publicKey) !== undefined}
        onClick={() => {
          if (selectedAssets.find((a) => a.publicKey === asset.publicKey) !== undefined) {
            setSelectedAssets(selectedAssets.filter((a) => a.publicKey !== asset.publicKey));
          } else {
            setSelectedAssets([...selectedAssets, asset]);
          }
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
