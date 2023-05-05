/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from 'react';
import './App.css';
import { axiosInstant } from './apis/axios/request';
import { umiRequestInstant } from './apis/umirequest/request';
import { privateRequest, request } from './apis/token-management/request';
import { privateRequestNew, requestNew } from './apis/brainless-token-management/request';
import { GithubCorners } from '@uiw/github-corners';
import GitHubCorners from '@uiw/react-github-corners';
const Post1 = () => {
  useEffect(() => {
    privateRequestNew(requestNew.get, '/posts');
  }, []);

  return <h1>Component 1</h1>;
};

const Post2 = () => {
  useEffect(() => {
    privateRequestNew(requestNew.get, '/posts?page=2');
  }, []);

  return <h1>Component 2</h1>;
};

function App() {
  useEffect(() => {
    privateRequestNew(requestNew.get, '/posts?page=1');
  }, []);

  const onLogin = async () => {
    const r = await fetch('https://test-react.agiletech.vn/auth/login', {
      method: 'post',
      body: JSON.stringify({
        username: 'adminRefresh2',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((r) => r.json());

    if (r?.accessToken) {
      localStorage.setItem('accessToken', r?.accessToken);
      localStorage.setItem('refreshToken', r?.refreshToken);
    }
  };

  return (
    <div className='App'>
      <Post1 />
      <br />
      <Post2 />
      <br />

      <div>
        <button onClick={onLogin}>Login and save token to localStorage</button>
        <p>Token will expire after 2m. Please check network</p>
      </div>

      <GitHubCorners
        position='right'
        href='https://stackblitz.com/edit/react-ts-mdxcmx?file=App.tsx'
        bgColor='dodgerblue'
      />
    </div>
  );
}

export default App;
