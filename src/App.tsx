import { GithubCorners } from 'react-gh-corners';

import './App.css';
// import RefreshByInterceptor from '@/components/RefreshByInterceptor/RefreshByInterceptor';
import RefreshByTokenManager from '@/components/RefreshByTokenManager/RefreshByTokenManager';
// import RefreshByTokenManager from '@/components/RefreshByTokenManager/RefreshByTokenManager';

function App() {
  return (
    <div className='App'>
      {/* <RefreshByInterceptor /> */}
      <RefreshByTokenManager />

      <GithubCorners
        position='right'
        href='https://stackblitz.com/edit/react-ts-mdxcmx?file=App.tsx'
        bgColor='dodgerblue'
      />
    </div>
  );
}

export default App;
