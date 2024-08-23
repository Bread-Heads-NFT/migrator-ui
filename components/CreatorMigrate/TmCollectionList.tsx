import { Center, Loader, SimpleGrid, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { DigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { useQueryClient } from '@tanstack/react-query';
import { useUmi } from '@/providers/useUmi';
import { TmCollectionCard } from './TmCollectionCard';
import { useFetchTmCollectionsByOwner } from '@/hooks/fetch';

export function TmCollectionList() {
  const umi = useUmi();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [collections, setCollections] = useState<DigitalAsset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<any>(null);

  // const { error, isPending, data } = useFetchTmCollectionsByOwner(umi.identity.publicKey);

  const { data, isError, isFetching } = useFetchTmCollectionsByOwner(umi.identity.publicKey, page);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!hasMore || isLoading) return;

      setIsLoading(true);
      try {
        const result = (await queryClient.fetchQuery({ queryKey: ['fetch-tm-collections', umi.identity.publicKey, page], queryFn: () => useFetchTmCollectionsByOwner(umi.identity.publicKey, page) })).data;
        setCollections((prevCollections) => [...prevCollections, ...result!.collections]);
        setHasMore(!result?.end);
        if (!result?.end) {
          setPage((prevPage) => prevPage + 1);
        }
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, [page, umi.identity.publicKey, queryClient]);

  useEffect(() => {
    if (data) {
      setCollections((prevCollections) => [...prevCollections, ...data.collections]);
      setHasMore(!data.end);
      if (!data.end) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  }, [data]);

  return (
    <>
      <Title>Your Token Metadata Collections</Title>
      {isFetching && page === 1 ? (
        <Center h="20vh"><Loader /></Center>
      ) : isError ? (
        <Center h="20vh" ta="center"><Text>There was an error fetching your Token Metadata collections.</Text></Center>
      ) : collections.length ? (
        <>
          <SimpleGrid
            cols={{
              base: 1,
              sm: 2,
              lg: 5,
              xl: 6,
            }}
          >
            {collections.map((collection) => (
              <TmCollectionCard collection={collection} key={collection.publicKey} />
            ))}
          </SimpleGrid>
          {isFetching && hasMore && (
            <Center mt="md"><Loader /></Center>
          )}
        </>
      ) : (
        <Center h="20vh" ta="center"><Text>You don&apos;t have any Token Metadata collections.</Text></Center>
      )}
    </>
  );
}
