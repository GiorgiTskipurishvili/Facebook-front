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
| `NEXT_PUBLIC_API_URL` | backend server-ის მისამართი | `npm run dev` → `http://localhost:3030`, build → `https://facebook-1-3jla.onrender.com` |

ცვლადი არასავალდებულოა - თუ არ არის მითითებული, გამოიყენება default მისამართი (იხ. `app/lib/api.ts`).
სხვა server-ზე გადასართავად Vercel-ში დაამატეთ `NEXT_PUBLIC_API_URL` (შეცვლის შემდეგ საჭიროა Redeploy).
