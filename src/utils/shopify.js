import Client from 'shopify-buy';

const client = Client.buildClient({
  domain: 'poukastore.myshopify.com',
  storefrontAccessToken: '9c936f00d67a6dde1c688feae60f5e41',
});

export default client;
