export default function Head() {
  const url = process.env.NEXT_PUBLIC_APP_DOMAIN || '';
  return (
    <>
      <title>CastCard</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {/* Mini App meta */}
      <meta name="fc:miniapp" content="1" />
      <meta name="fc:frame" content="vNext" />
      <meta property="og:title" content="CastCard" />
      <meta property="og:image" content={`${url}/og.png`} />
    </>
  );
}
