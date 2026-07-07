const CACHE_NAME = 'topomap-cache-v8082';

// Lista de todos os arquivos que o celular precisa salvar para funcionar sem internet
const urlsToCache = [
  '/',
  '/index.html',
  '/demandas.html',
  '/qualidade_sistematizacao.html',
  '/historico_qualidade.html',
  '/ambiental.html',
  '/kml_individual.html',
  '/informativo_voo.html',
  '/relatorio.html',
  '/entrega_hd.html',
  '/manifest.json'
];

// INSTALAÇÃO: Salva os arquivos no cache do celular
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto e arquivos salvos para modo offline.');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// INTERCEPTADOR: Quando o topógrafo clica em algo, tenta pegar do Cache primeiro (Offline)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrou no celular, retorna instantaneamente (Offline)
        if (response) {
          return response;
        }
        // Se não tem no celular, busca na internet e já salva para a próxima vez
        return fetch(event.request).then(fetchResponse => {
            // Verifica se a resposta é válida
            if(!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                return fetchResponse;
            }
            let responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
            });
            return fetchResponse;
        });
      })
  );
});

// ATUALIZAÇÃO: Limpa os caches velhos se você atualizar o aplicativo
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
