# Quire — stationery shop template

A static shop for paper, pens, and desk goods. No build step, no framework, no accounts. Open the pages, edit the catalog, and publish on Cloudflare Pages.

## Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| Shop, with category and search | `shop.html` |
| Product | `product.html?id=field-notebook` |
| Bag | `cart.html` |
| About | `about.html` |
| Journal | `journal.html` |

The bag is stored in the browser (`localStorage`). “Place a sample order” confirms the flow and does not take payment.

## Customize

- Shop name, prices, and copy: [`js/catalog.js`](js/catalog.js)
- Colors and type: the `:root` block in [`css/styles.css`](css/styles.css)
- Photographs: replace files in `images/` and point `image:` at them. Pieces without an image use a material swatch.
- Footer address and the announcement bar: the HTML files

## Deploy on Cloudflare Pages

1. Push this repo to GitHub (it is meant to live at `johnnykiaga/store-website`).
2. In the Cloudflare dashboard open **Workers & Pages → Create → Pages → Connect to Git**.
3. Choose the **store-website** repository.
4. Set the framework preset to **None**.
5. Leave the **build command empty**.
6. Set the **build output directory** to `/` (the repository root).
7. Save and deploy. Cloudflare will give you a `*.pages.dev` address.

Any later push to `main` redeploys the site.

### Optional: deploy from your machine

```bash
npx wrangler pages deploy . --project-name store-website
```

## Preview on your computer

The site is plain HTML. From this folder:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`. Opening `index.html` directly also works for reading the pages; the bag needs a local server in some browsers.
