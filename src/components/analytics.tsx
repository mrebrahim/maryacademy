'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

/**
 * The tracking receivers: GA4, the Meta Pixel and the TikTok Pixel.
 *
 * Every one is opt-in by id. With no ids set, nothing is injected at all,
 * so local development and preview deploys stay out of the numbers and
 * nobody's visit is recorded by accident. That matters more than it
 * sounds: a month of developer page views mixed into a conversion rate is
 * a month of decisions made on a wrong number.
 *
 * GA4 is loaded directly rather than only through the tag manager. Both
 * are supported and both can run at once — but a container that has to be
 * configured in another product before a single event arrives is a
 * container that stays empty, and the academy should not need to learn
 * GTM to find out whether the ads work.
 *
 * `afterInteractive` throughout. None of this is worth a slower first
 * paint on a page bought with ad spend, and no event fires before the
 * page is usable anyway.
 */

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID
const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID
const TIKTOK_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID

export function Analytics() {
  return (
    <>
      {GTM_ID && (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
          {/* For the small share of visitors with JavaScript disabled or
              blocked — common enough on cheap Android browsers to matter
              when the traffic is paid for. */}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="gtm"
            />
          </noscript>
        </>
      )}

      {GA4_ID && (
        <>
          <Script
            id="ga4-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('js',new Date());
// Page views are sent by hand on navigation — see RouteViews below — so
// the automatic one would double-count the first page.
gtag('config','${GA4_ID}',{send_page_view:false});
gtag('event','page_view');`}
          </Script>
        </>
      )}

      {PIXEL_ID && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,
'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}

      {TIKTOK_ID && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function (w, d, t) {
w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};
n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src=r+"?sdkid="+e+"&lib="+t;
e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
ttq.load('${TIKTOK_ID}');ttq.page();
}(window, document, 'ttq');`}
        </Script>
      )}

      {/* useSearchParams has to sit inside Suspense or it opts the whole
          page out of static rendering — which on a landing page bought
          with ad spend is a real cost. */}
      <Suspense fallback={null}>
        <RouteViews />
      </Suspense>
    </>
  )
}

/**
 * Page views on client-side navigation.
 *
 * The snippets above each send one view when they load, and then nothing
 * ever again: App Router navigation does not reload the page, so without
 * this every visitor looks like they landed and left. The first render is
 * skipped here because the snippets already covered it.
 */
function RouteViews() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    const query = searchParams.toString()
    const path = query ? `${pathname}?${query}` : pathname

    try {
      window.gtag?.('event', 'page_view', { page_path: path })
      window.fbq?.('track', 'PageView')
      window.ttq?.page()
    } catch {
      // Analytics must never take the page with it.
    }
  }, [pathname, searchParams])

  return null
}
