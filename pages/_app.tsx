import { ThemeProvider } from "@mui/material";
import type { AppProps } from "next/app";
import type { EmotionCache } from "@emotion/react";
import "../styles/globals.css";
import theme from "../utils/theme";
import createEmotionCache from "../utils/createEmotionCache";
import { CacheProvider } from "@emotion/react";

type AppPropsType = AppProps & {
  emotionCache: EmotionCache;
};

const clientSideEmotionCache = createEmotionCache();

export default function App({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}: AppPropsType) {
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
}
