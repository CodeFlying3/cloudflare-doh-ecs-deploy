import { readConfig } from '../src/config';

describe('worker configuration', () => {
  const base = () => ({});

  it('uses safe defaults and accepts valid overrides', () => {
    expect(readConfig(base())).toMatchObject({
      path: '/doh',
      globalUrls: ['https://dns.google/dns-query', 'https://cloudflare-dns.com/dns-query'],
    });
    expect(
      readConfig({
        ...base(),
        DOH_PATH: '/private-doh',
        GLOBAL_DOH_URL: 'https://resolver.example/dns-query',
        GLOBAL_FALLBACK_DOH_URL: 'https://backup.example/dns-query',
      }),
    ).toMatchObject({
      path: '/private-doh',
      globalUrls: ['https://resolver.example/dns-query', 'https://backup.example/dns-query'],
    });
  });

  it.each([
    { DOH_PATH: 'dns-query' },
    { DOH_PATH: '//evil' },
    { GLOBAL_DOH_URL: 'http://8.8.8.8/dns-query' },
    { GLOBAL_DOH_URL: 'https://user:pass@example.com/dns-query' },
    { GLOBAL_DOH_URL: 'https://127.0.0.1/dns-query' },
    { GLOBAL_DOH_URL: 'https://[::1]/dns-query' },
    { GLOBAL_DOH_URL: 'https://example.com/dns-query?target=x' },
  ])('rejects unsafe config %#', (override) => {
    expect(() => readConfig({ ...base(), ...override })).toThrow();
  });
});
