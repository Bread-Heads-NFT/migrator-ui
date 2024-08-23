import { Center, Container, Flex, Group, Menu, Title, Image, rem } from '@mantine/core';
import { IconArrowRightToArc, IconChevronDown } from '@tabler/icons-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import classes from './Header.module.css';
import { Env } from '@/providers/useEnv';
import RetainQueryLink from '../RetainQueryLink';

// const HeaderLink = ({ label, link, disabled }: { label: string, link: string, disabled?: boolean }) => {
//   const cls = disabled ? [classes.disabled, classes.link].join(' ') : classes.link;
//   return (
//     <RetainQueryLink href={link} className={cls}>
//       {label}
//     </RetainQueryLink>
//   );
// };

export function Header({ env, setEnv }: { env: string; setEnv: (env: Env) => void }) {
  return (
    <Container
      size="xl"
      h={80}
      pt={12}
    >
      <div className={classes.inner}>
        <Flex justify="center" align="center" gap="md">
          <RetainQueryLink href="/">
            <Image src="/favicon.png" w={50} />
          </RetainQueryLink>
          <Title order={2}>BHS Tools</Title>
        </Flex>
        <Group>
          <Menu trigger="click-hover" width={200}>
            <Menu.Target>
              <div>Collectors</div>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconArrowRightToArc style={{ width: rem(14), height: rem(14) }} />} component="a" href="/collectors/migrate">Migrate</Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Menu trigger="click-hover" width={200}>
            <Menu.Target>
              <div>Creators</div>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconArrowRightToArc style={{ width: rem(14), height: rem(14) }} />} component="a" href="/creators/migrate">Migrate</Menu.Item>
            </Menu.Dropdown>
          </Menu>
          {/* <HeaderLink label="Create" link="/create" />
          <HeaderLink label="Explorer" link="/explorer" /> */}
          <WalletMultiButton />
          <Menu trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
            <Menu.Target>
              <a
                href={undefined}
                className={classes.link}
                onClick={(event) => event.preventDefault()}
              >
                <Center>
                  <span className={classes.linkLabel}>{env}</span>
                  <IconChevronDown size="0.9rem" stroke={1.5} />
                </Center>
              </a>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => setEnv('mainnet')}>Mainnet</Menu.Item>
              <Menu.Item onClick={() => setEnv('devnet')}>Devnet</Menu.Item>
              <Menu.Item onClick={() => setEnv('localhost')}>Localhost</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </div>
    </Container>
  );
}
