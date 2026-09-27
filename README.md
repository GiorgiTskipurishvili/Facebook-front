# Facebook-front

Facebook-ის ანალოგის frontend (Next.js 16, React 19, Tailwind CSS 4, socket.io-client).

## გაშვება

```bash
npm install
npm run dev
```

გახსენით [http://localhost:3000](http://localhost:3000).

## Environment Variables

| ცვლადი | აღწერა | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | backend server-ის მისამართი | `http://localhost:3030` |

Vercel-ზე `NEXT_PUBLIC_API_URL` Project Settings → Environment Variables-ში უნდა დაემატოს (შეცვლის შემდეგ საჭიროა Redeploy).
