import { defaultConfig } from 'swagger-typescript-api-es';

export default defaultConfig({
  name: 'api-axios.ts',
  output: './src/apis/axios-gentype',
  url: 'https://agiletech-test-api.zeabur.app/api-json',
  httpClientType: 'axios',
});
