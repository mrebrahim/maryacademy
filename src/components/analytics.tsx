'use client'

import Script from 'next/script'

/**
 * Google Tag Manager and the Meta Pixel.
 *
 * The funnel events were already being pushed to `window.dataLayer` and to
 * `fbq` — but with no container on the page, nothing was listening. Every
 * event since they were written has gone nowhere. This is the receiver.
 *
 * Both are opt-in by id: with no NEXT_PUBLIC_GTM_ID and no
 * NEXT_PUBLIC_FB_PIXEL_ID nothing is injected, so local development and
 * previews stay clean and nobody's visit is recorded by accident.
 *
 * `afterInteractive` on purpose. A tag manager is not worth a slower first
 * paint on a page bought with ad spend, and none of the events fire before
 * the page is usable anyway.
 */

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID
const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

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
    </>
  )
}
