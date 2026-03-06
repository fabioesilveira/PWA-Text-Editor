const { warmStrategyCache } = require('workbox-recipes');
const { CacheFirst, StaleWhileRevalidate } = require('workbox-strategies');
const { registerRoute } = require('workbox-routing');
const { CacheableResponsePlugin } = require('workbox-cacheable-response');
const { ExpirationPlugin } = require('workbox-expiration');
const { precacheAndRoute } = require('workbox-precaching/precacheAndRoute');

// Faz o precache automático dos arquivos gerados no build pelo Webpack.
// O self.__WB_MANIFEST é criado automaticamente pelo Workbox durante o build.
precacheAndRoute(self.__WB_MANIFEST);

// Estratégia para páginas HTML.
// CacheFirst = tenta pegar do cache primeiro; se não tiver, busca na rede.
const pageCache = new CacheFirst({
  cacheName: 'page-cache',
  plugins: [
    // Só armazena respostas válidas.
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    // Expiração do cache das páginas.
    new ExpirationPlugin({
      maxEntries: 20, // limita a quantidade de páginas em cache
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
    }),
  ],
});

// "Aquece" o cache já salvando as rotas principais do app.
warmStrategyCache({
  urls: ['/index.html', '/'],
  strategy: pageCache,
});

// Toda navegação do usuário (abrir/recarregar página) usa o cache de páginas.
registerRoute(({ request }) => request.mode === 'navigate', pageCache);

// Cache para arquivos estáticos como CSS, JS e web workers.
// StaleWhileRevalidate = entrega rápido do cache e atualiza em segundo plano.
registerRoute(
  ({ request }) =>
    ['style', 'script', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'asset-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50, // limite de arquivos estáticos em cache
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
      }),
    ],
  })
);

// Cache para imagens.
// CacheFirst funciona bem para imagens porque elas geralmente não mudam com frequência.
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60, // limita a quantidade de imagens salvas
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
      }),
    ],
  })
);


