import { useCallback, useEffect, useState } from 'react';
import { WagmiConfig, createConfig } from 'wagmi';
import { polygon } from 'wagmi/chains'
import { ConnectKitProvider, SIWESession, getDefaultConfig } from 'connectkit';
import { useRouter } from 'next/router';
import { siweClient } from '@lib/siweClient';
import seoConfig from '@/seo';
import { UserContext } from '@/context/UserContext';
import { DefaultSeo, ToastContainer, toast } from '@/components';
import '@/styles/globals.scss';
import 'react-toastify/dist/ReactToastify.min.css';

const ckCustomTheme = {
  '--ck-font-family': 'Space Grotesk',
  '--ck-modal-heading-font-weight': 600,
  '--ck-body-color': '#FFFFFF',
  '--ck-body-color-muted': '#FFFFFF',
  '--ck-body-color-muted-hover': '#FFFFFF',
  '--ck-body-color-danger': '#F3228B',
  '--ck-body-color-valid': '#4FFFB5',
  '--ck-overlay-background': 'rgba(0, 0, 0, 0.8)',
  '--ck-border-radius': '24px',
  '--ck-body-background': '#26262C',
  '--ck-body-background-transparent': '#26262C',
  '--ck-body-background-secondary': '#26262C',
  '--ck-body-background-secondary-hover-background': '#26262C',
  '--ck-body-background-secondary-hover-outline': '#26262C',
  '--ck-body-background-tertiary': '',
  '--ck-primary-button-color': '#FFFFFF',
  '--ck-primary-button-background': '#26262C',
  '--ck-primary-button-hover-color': '#1859FF',
  '--ck-primary-button-hover-background': '#26262C',
  '--ck-primary-button-active-color': '#FFFFFF',
  '--ck-primary-button-active-background': '#26262C',
  '--ck-primary-button-border-radius': '22px',
  '--ck-connectbutton-color': '#FFFFFF',
  '--ck-connectbutton-background': '#26262C',
  '--ck-connectbutton-hover-color': '#1859FF',
  '--ck-connectbutton-hover-background': '#26262C',
  '--ck-connectbutton-active-color': '#FFFFFF',
  '--ck-connectbutton-active-background': '#26262C',
  '--ck-connectbutton-balance-color': '#FFFFFF',
  '--ck-connectbutton-balance-background': '#26262C',
  '--ck-connectbutton-balance-hover-background': '#26262C',
  '--ck-connectbutton-balance-active-background': '#26262C',
  '--ck-secondary-button-color': '#FFFFFF',
  '--ck-secondary-button-background': '#26262C',
  '--ck-secondary-button-hover-color': '#1859FF',
  '--ck-secondary-button-hover-background': '#26262C',
  '--ck-secondary-button-active-color': '#FFFFFF',
  '--ck-secondary-button-active-background': '#26262C',
  '--ck-tertiary-button-color': '#FFFFFF',
  '--ck-tertiary-button-background': '#26262C',
  '--ck-tertiary-button-hover-color': '#1859FF',
  '--ck-tertiary-button-hover-background': '#26262C',
  '--ck-tertiary-button-active-color': '#FFFFFF',
  '--ck-tertiary-button-active-background': '#26262C',
  '--ck-dropdown-button-color': '#FFFFFF',
  '--ck-dropdown-button-background': '#26262C',
  '--ck-dropdown-button-hover-color': '#1859FF',
  '--ck-dropdown-button-hover-background': '#26262C',
  '--ck-dropdown-button-active-color': '#FFFFFF',
  '--ck-dropdown-button-active-background': '#26262C',
  '--ck-body-disclaimer-link-color': '#FFFFFF',
  '--ck-body-disclaimer-link-hover-color': '#1859FF',
  '--ck-body-disclaimer-color': '#FCF5F1',
  '--ck-qr-dot-color': '#000000',
  '--ck-qr-border-color': '#FFFFFF',
  '--ck-focus-color': '#1859FF',
  '--ck-copytoclipboard-stroke': '#FCF5F1',
  '--ck-tooltip-background': '#26262C',
  '--ck-tooltip-background-secondary': '#26262C',
  '--ck-tooltip-color': '#FFFFFF',
  '--ck-siwe-border': '#FFFFFF',
  '--ck-body-action-color': '#FFFFFF',
  '--ck-body-divider': '#FFFFFF',
};

const WithUser = ({ Component, route, ...props }) => {
  const router = useRouter();

  const [user, setUser] = useState({ user: null, isLoading: true });

  const refresh = useCallback(async () => {
    try {
      const { user } = await fetch('/api/me').then((res) => res.json());
      await setUser((prevState) => ({
        ...prevState,
        isLoading: false,
        user,
      }));
    } catch (e) {
      await setUser({ isLoading: false, user: null });
    }
  }, [setUser]);

  useEffect(() => {
    refresh();
  }, []);

  const onWeb3SignIn = async (session?: SIWESession) => {
    const { isAuthenticated } = await fetch('/api/auth/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...session,
        referralById: router?.query?.code || null,
      }),
    }).then((res) => res.json());

    if (isAuthenticated) {
      const { user } = await fetch('/api/me', {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json());
      await setUser({
        user,
        isLoading: false,
      });
    } else {
      toast.error('There was an error connecting wallet. Please try again.');
    }
  };

  const onWeb2SignIn = async ({ chainId = 1, address, email }) => {
    const { isAuthenticated } = await fetch('/api/auth/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chainId,
        address,
        email,
        referralById: router?.query?.code || null,
      }),
    }).then((res) => res.json());

    if (isAuthenticated) {
      const { user } = await fetch('/api/me', {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json());
      await setUser({
        user,
        isLoading: false,
      });
    } else {
      toast.error('There was an error connecting wallet. Please try again.');
    }
  };

  return (
    <UserContext.Provider value={[user, setUser, refresh, onWeb2SignIn]}>
      <siweClient.Provider
        enabled={true} // defaults true
        nonceRefetchInterval={300000} // in milliseconds, defaults to 5 minutes
        sessionRefetchInterval={300000} // in milliseconds, defaults to 5 minutes
        signOutOnDisconnect={true} // defaults true
        signOutOnAccountChange={true} // defaults true
        signOutOnNetworkChange={true} // defaults true
        onSignIn={onWeb3SignIn}
        onSignOut={() => {
          if (user?.user?.issuer) {
            router.push('/api/auth/logout');
          }
        }}
      >
        <ConnectKitProvider
          customTheme={ckCustomTheme}
          options={{
            embedGoogleFonts: true,
            walletConnectName: 'Other Wallets',
          }}
        >
          <Component {...props} user={user?.user} onWeb2SignIn={onWeb2SignIn} onRefreshUser={refresh} />
        </ConnectKitProvider>
      </siweClient.Provider>
      <ToastContainer
        theme="dark"
        position="top-right"
        autoClose={6000}
        hideProgressBar={false}
        newestOnTop={true}
        rtl={false}
        closeOnClick
      />
    </UserContext.Provider>
  );
};

const config = createConfig(
  getDefaultConfig({
    alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    appName: 'Datacache',
    chains: [polygon]
  }),
);

const DatacacheApp = ({ Component, pageProps, router }) => (
  <WagmiConfig config={config}>
    <DefaultSeo
      defaultTitle={seoConfig.defaultTitle}
      titleTemplate={`%s | ${seoConfig.defaultTitle}`}
      description={seoConfig.description}
      openGraph={{
        type: 'website',
        locale: 'en_EN',
        url: `${seoConfig.baseURL}${router.route}`,
        siteName: 'Datacache',
        title: 'Datacache',
        description: seoConfig.description,
        images: [],
      }}
      twitter={{
        handle: '@',
        cardType: 'summary_large_image',
      }}
    />
    <WithUser Component={Component} route={router.route} {...pageProps} />
  </WagmiConfig>
);

export default DatacacheApp;
