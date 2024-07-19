/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import './App.css';
import { axiosInstant } from './apis/axios/request';
import { umiRequestInstant } from './apis/umirequest/request';
import { privateRequest, request } from './apis/token-management/request';
import { privateRequestNew, requestNew } from './apis/brainless-token-management/request';
import GitHubCorners from 'react-gh-corners';
import { api } from '@/apis/axios-gentype/request';

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
  const [login, setLogin] = useState(false);

  useEffect(() => {
    setLogin(!!localStorage.getItem('accessToken'));
  }, []);

  useEffect(() => {
    privateRequestNew(requestNew.get, '/posts?page=1');
  }, []);

  const onLogin = async () => {
    const r = await fetch(`${process.env.VITE_APP_API}/auth/login`, {
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
      setLogin(true);
    }
  };

  return (
    <div className='App'>
      <Post1 />
      <br />
      <Post2 />
      <br />

      <div>
        {login ? (
          <>
            <button
              onClick={() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setLogin(false);
              }}
            >
              Logout
            </button>
            <p>Token will expire after 1m. Please check network</p>
          </>
        ) : (
          <button onClick={onLogin}>Login</button>
        )}
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
