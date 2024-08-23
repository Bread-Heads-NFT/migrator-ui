'use client';

import { Center, Container, Paper, Text } from '@mantine/core';
import { useWallet } from '@solana/wallet-adapter-react';
import { CollectorMigrateLanding } from '@/components/CreatorMigrate/CollectorMigrateLanding';

export default function ExplorerPage() {
    const wallet = useWallet();
    return (
        <Container size="xl" pb="xl">
            {wallet.connected ? <CollectorMigrateLanding /> :
                <>
                    <Container size="sm">
                        <Paper mt="xl">
                            <Center h="20vh">
                                <Text>Connect your wallet to see your assets.</Text>
                            </Center>
                        </Paper>
                    </Container>
                </>
            }
        </Container>);
}
