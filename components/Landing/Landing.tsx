/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable jsx-a11y/media-has-caption */

'use client';

import { Container, Title, Button, Group, Text, List, ThemeIcon, rem } from '@mantine/core';
import { IconNotes } from '@tabler/icons-react';
import Link from 'next/link';
import classes from './Landing.module.css';
import RetainQueryLink from '../RetainQueryLink';
// import { FeaturesCards } from './FeaturesCards';

const links: { label: string; href: string }[] = [
  { label: 'Bread Heads', href: 'https://breadheads.io/' },
  { label: 'Buy a Bread Head', href: 'https://www.tensor.trade/trade/lgtb' },
  { label: 'BreadBox DAO', href: 'https://app.realms.today/dao/BLyCvYF6gBxnSwQ7bSDxmGydpZBxTjKYNHnwua47nbjn' },
  { label: 'Solana Digital Assets', href: 'https://developers.metaplex.com/core' },
];

export function Landing() {
  return (
    <>
      <div className={classes.heroSection}>
        <Container size="md" pb="xl">
          <div className={classes.inner}>
            <div className={classes.content}>
              <Title className={classes.title}>
                All the NFT tools you need, in one place
              </Title>
              <Text c="dimmed" mt="md">
                The BHS Tools Suite is a collection of tools that help you create, manage, and use digital assets to their fullest. It is built on top of the Metaplex platform and is designed to be easy to use and powerful.
              </Text>

              <List
                mt={30}
                spacing="sm"
                size="sm"
                icon={
                  <ThemeIcon size={20} radius="xl">
                    <IconNotes style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                  </ThemeIcon>
                }
              >
                {links.map((link) => (
                  <List.Item key={link.href}>
                    {link.label} - <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >here
                    </a>
                  </List.Item>
                ))}
              </List>

            </div>
            <video src="/hero.mp4" autoPlay muted loop className={classes.image} />
          </div>
          <Group pb={60} mt="md">
            <RetainQueryLink href="/collectors">
              <Button radius="xl" size="md" className={classes.control}>
                Collectors
              </Button>
            </RetainQueryLink>
            <Link href="/creators">
              <Button variant="default" radius="xl" size="md" className={classes.control}>
                Creators
              </Button>
            </Link>
            {/*<RetainQueryLink href="/explorer">
              <Button variant="outline" radius="xl" size="md" className={classes.control}>
                View Assets
              </Button>
            </RetainQueryLink> */}
          </Group>
        </Container>
        {/* <FeaturesCards /> */}
      </div>
      {/* <Box bg="rgb(12, 12, 12)" pb="xl" pt="md">
        <FeaturesCards />
        <Container size="md" py="xl" />
      </Box> */}
      <div style={{
        position: 'relative',
      }}
      />
    </>
  );
}
