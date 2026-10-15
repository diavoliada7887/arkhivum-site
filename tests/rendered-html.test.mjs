import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// Test the deployed artifact, not the retired Sites/Vinext worker.
const read = (route = "") =>
  readFileSync(
    new URL(`../out/${route ? `${route}/` : ""}index.html`, import.meta.url),
    "utf8",
  );
const main = (html) => html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "";
const linksWithClass = (html, className) =>
  [...html.matchAll(/<a\b([^>]+)>/g)]
    .filter(([, attrs]) =>
      new RegExp(`class="[^"]*\\b${className}\\b`).test(attrs),
    )
    .map(([, attrs]) => attrs.match(/href="([^"]+)"/)?.[1]);

test("company home provides two equal, working direction entries", () => {
  assert.deepEqual(linksWithClass(main(read()), "direction-card"), [
    "/arkhivum-site/digitization/",
    "/arkhivum-site/software/",
  ]);
  assert.match(read("digitization"), /Оцифровываем фонды/);
  assert.match(read("software"), /Программные решения для сложных задач/);
});

test("digitization catalogue excludes software services but retains physical services", () => {
  for (const [route, cls] of [
    ["digitization", "home-service-card"],
    ["services", "service-card"],
  ]) {
    const hrefs = linksWithClass(main(read(route)), cls);
    assert.equal(hrefs.length, 8);
    assert.ok(
      hrefs.every(
        (href) => !/archive-software|databases-integrations/.test(href),
      ),
    );
    assert.ok(hrefs.includes("/arkhivum-site/services/books/"));
    assert.ok(hrefs.includes("/arkhivum-site/services/binding/"));
  }
});

test("legacy software URLs have static redirects, canonical URLs and visible fallback links", () => {
  for (const [old, destination] of [
    ["databases-integrations", "databases-integrations"],
    ["archive-software", "document-automation"],
  ]) {
    const html = read(`services/${old}`);
    const target = `/arkhivum-site/software/${destination}/`;
    assert.ok(html.includes(`0;url=${target}`));
    assert.ok(html.includes(`href="${target}"`));
    assert.ok(
      html.includes(
        `rel="canonical" href="https://diavoliada7887.github.io${target}"`,
      ),
    );
  }
});

test("database and server competencies are explicit and connected to real evidence", () => {
  const software = main(read("software"));
  for (const route of ["databases-integrations", "server-solutions"]) {
    assert.ok(software.includes(`/arkhivum-site/software/${route}/`));
    assert.match(read(`software/${route}`), /<h1[ >]/);
  }
  const databases = main(read("software/databases-integrations"));
  for (const slug of ["shalya", "database-flow"])
    assert.ok(databases.includes(`/arkhivum-site/experience/${slug}/`));
  assert.match(databases, /конкретных проектов/);
});

test("portfolio separates engineering from applications and provides substantive product pages", () => {
  const catalogue = main(read("software/products"));
  assert.match(catalogue, /id="engineering"/);
  assert.match(catalogue, /id="applications"/);
  const slugs = [
    "sboeboy",
    "pdfa-pipeline",
    "document-extraction",
    "pdf-bookmarks",
    "image-processing",
    "source-monitoring",
    "hvati",
    "profit",
    "rpg-life",
  ];
  for (const slug of slugs) {
    assert.ok(catalogue.includes(`/arkhivum-site/software/products/${slug}/`));
    const page = main(read(`software/products/${slug}`));
    for (const section of [
      "Что уже реализовано",
      "Входные данные",
      "Выходной результат",
      "Применение и готовность",
    ])
      assert.ok(page.includes(section), `${slug}: ${section}`);
  }
  assert.match(read("software/products/image-processing"), /GPL-3\.0/);
  assert.match(
    read("software/products/document-extraction"),
    /экспериментальная разработка/,
  );
});

test("all HTML fragment links resolve and each new page has a unique title and one H1", () => {
  const root = new URL("../out/", import.meta.url).pathname;
  const files = [];
  function walk(dir) {
    for (const item of readdirSync(dir, { withFileTypes: true }))
      item.isDirectory()
        ? walk(join(dir, item.name))
        : item.name.endsWith(".html") && files.push(join(dir, item.name));
  }
  walk(root);
  const pages = new Map(
    files.map((file) => [file, readFileSync(file, "utf8")]),
  );
  const titles = new Set();
  for (const [file, html] of pages) {
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (!href.includes("#") || /^(https?:|mailto:|tel:)/.test(href)) continue;
      const [path, fragment] = href.split("#");
      if (!fragment) continue;
      const dest = path
        ? join(root, path.replace(/^\/arkhivum-site\//, ""), "index.html")
        : file;
      assert.ok(
        pages.get(dest)?.includes(`id="${decodeURIComponent(fragment)}"`),
        `${file}: ${href}`,
      );
    }
    if (
      file.includes("/software/") ||
      file.endsWith("/digitization/index.html")
    ) {
      assert.equal((main(html).match(/<h1[ >]/g) ?? []).length, 1, file);
      const title = html.match(/<title>(.*?)<\/title>/)?.[1];
      assert.ok(
        title && !titles.has(title),
        `Missing/duplicate title: ${file}`,
      );
      titles.add(title);
    }
  }
});

test("both direction shortcuts precede the large homepage panels", () => {
  const html = main(read());
  const shortcutNav =
    html.match(/<nav class="home-quick-directions"[\s\S]*?<\/nav>/)?.[0] ?? "";
  for (const route of ["digitization", "software"])
    assert.ok(shortcutNav.includes(`/arkhivum-site/${route}/`));
  assert.ok(
    html.indexOf("home-quick-directions") < html.indexOf("company-directions"),
  );
});

test("software navigation has four primary controls and discoverable native submenus", () => {
  const html = main(read("software"));
  const nav = html.match(/<nav class="software-nav[\s\S]*?<\/nav>/)?.[0] ?? "";
  assert.match(nav, /<details[^>]*class="competence-menu"/);
  assert.match(nav, /<summary>/);
  for (const route of ["databases-integrations", "server-solutions"])
    assert.ok(nav.includes(`/arkhivum-site/software/${route}/`));
  const primary = nav.replace(/<details[\s\S]*?<\/details>/, "");
  assert.equal((primary.match(/<a\b/g) ?? []).length + 1, 4);
});

test("each product has a distinct labelled visual, a mobile asset, and an early contact action", () => {
  const slugs = [
    "sboeboy",
    "pdfa-pipeline",
    "document-extraction",
    "pdf-bookmarks",
    "image-processing",
    "source-monitoring",
    "hvati",
    "profit",
    "rpg-life",
  ];
  const sourceAssets = new URL("../public/assets/solutions/", import.meta.url);
  for (const slug of slugs) {
    const html = main(read(`software/products/${slug}`));
    assert.ok(html.includes(`data-visual="${slug}"`), slug);
    assert.ok(
      html.includes(`/arkhivum-site/assets/solutions/${slug}.svg`),
      slug,
    );
    assert.ok(
      html.includes(`/arkhivum-site/assets/solutions/${slug}-mobile.svg`),
      slug,
    );
    assert.ok(
      html.indexOf("/arkhivum-site/contact/") < html.indexOf("data-visual="),
      slug,
    );
    assert.match(
      html,
      ["hvati", "profit", "rpg-life"].includes(slug)
        ? /Концепт интерфейса · условные данные/
        : /Схема принципа работы · условные данные/,
    );
    for (const suffix of ["", "-mobile"]) {
      const svg = readFileSync(
        new URL(`${slug}${suffix}.svg`, sourceAssets),
        "utf8",
      );
      assert.match(svg, /<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
      assert.ok(!/<script|<foreignObject|href=|url\(https?:/i.test(svg), slug);
    }
  }
});
