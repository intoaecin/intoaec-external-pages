import "@/styles/style.css";
import type { AppProps } from "next/app";
import { EnvProvider } from "@/features/components/providers/EnvProvider";
import { ni18nConfig } from "@/lib/ni18n.config";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { appWithI18Next } from "ni18n";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Head from "next/head";
import { createAppTheme } from "@/styles/theme";

const APP_FONT_FAMILY = "'Poppins', system-ui, -apple-system, sans-serif";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

function App({ Component, pageProps }: AppProps) {
  const queryClient = getQueryClient();
  const theme = createAppTheme(APP_FONT_FAMILY);

  return (
    <QueryClientProvider client={queryClient}>
      <EnvProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Lead Capture</title>
          </Head>
          <main style={{ fontFamily: APP_FONT_FAMILY }}>
            <Component {...pageProps} />
          </main>
          <ToastContainer position="top-right" autoClose={4000} />
        </ThemeProvider>
      </EnvProvider>
    </QueryClientProvider>
  );
}

export default appWithI18Next(App, ni18nConfig);
