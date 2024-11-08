import { defaultConfig } from 'swagger-typescript-api-es';

export default defaultConfig({
  name: 'api-axios.ts',
  output: './src/apis/axios-gentype',
  url: 'https://nestjs-vercel-197.vercel.app/backend-json',
  httpClientType: 'axios',
});
