import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

const Auth0ProviderComponent = ({ children }) => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_AUTH0_CALLBACK_URL || window.location.origin;

  console.log('Auth0 Config:', { domain, clientId, redirectUri });

  if (!domain || !clientId) {
    console.error('Auth0 credentials not found in .env.local');
    console.error('REACT_APP_AUTH0_DOMAIN:', domain);
    console.error('REACT_APP_AUTH0_CLIENT_ID:', clientId);
    throw new Error('Missing Auth0 credentials in .env.local');
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderComponent;
