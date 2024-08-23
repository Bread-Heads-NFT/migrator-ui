import { ActionIcon, Center, Group, Image, Loader, Stack, Text, Title } from '@mantine/core';
import { CodeHighlightTabs } from '@mantine/code-highlight';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings } from '@tabler/icons-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { DigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { isSome } from '@metaplex-foundation/umi';
import { useAssetJson } from '../../hooks/asset';
import { ExplorerStat } from '../Explorer/ExplorerStat';

export function TmCollectionDetails({ collection }: { collection: DigitalAsset }) {
  const { connected } = useWallet();
  const jsonInfo = useAssetJson(collection.publicKey, collection.metadata.uri);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <Stack>
      <Group justify="space-between">
        <Text fz="md" tt="uppercase" fw={700} c="dimmed">Token Metadata Collection</Text>
        <ActionIcon
          variant="subtle"
          color="rgba(145, 145, 145, 1)"
          disabled={!connected}
          onClick={() => {
            open();
          }}
        ><IconSettings />
        </ActionIcon>
      </Group>
      {jsonInfo.isPending ? <Center h="20vh"><Loader /></Center> :
        <>
          <Title>{jsonInfo.data.name}</Title>

          <Image src={jsonInfo.data.image} maw={320} />
          {jsonInfo.data.description && <ExplorerStat
            label="Description"
            value={jsonInfo.data.description}
          />}
          <Text fz="sm" fw={700} c="dimmed">Collection Size</Text>
          {isSome(collection.metadata.collectionDetails) && (<Text fz="sm" fw={700}>{collection.metadata.collectionDetails.value.__kind === 'V1' ? collection.metadata.collectionDetails.value.size.toString() : 'Unknown'} assets</Text>)}
          <ExplorerStat
            label="Mint"
            value={collection.publicKey}
            copyable
          />
          <ExplorerStat
            label="Update authority"
            value={collection.metadata.updateAuthority}
            copyable
          />

          <ExplorerStat
            label="Metadata URI"
            value={collection.metadata.uri}
            copyable
            asExternalLink={collection.metadata.uri}
          />

          <CodeHighlightTabs
            withExpandButton
            expandCodeLabel="Show full JSON"
            collapseCodeLabel="Show less"
            defaultExpanded={false}
            mb="lg"
            code={[{
              fileName: 'metadata.json',
              language: 'json',
              code: JSON.stringify(jsonInfo.data, null, 2),
            }]}
          />
        </>}
    </Stack>
  );
}
