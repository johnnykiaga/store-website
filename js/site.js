(function () {
  function visual(product, className) {
    if (product.image) {
      return '<img src="' + product.image + '" alt="' + escapeHtml(product.name) + '">';
    }
    return '<div class="swatch ' + product.swatch + '" aria-hidden="true"><b>' + escapeHtml(product.material) + '</b></div>';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&" + "amp;")
      .replace(/</g, "&" + "lt;")
      .replace(/>/g, "&" + "gt;")
      .replace(/"/g, "&" + "quot;");
  }

  function toast(message) {
    var el = document.querySelector(".toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("show"); }, 2200);
  }

  function params() {
    return new URLSearchParams(location.search);
  }

  function card(product) {
    return (
      '<a class="card" href="product.html?id=' + product.id + '">' +
        '<div class="visual">' + visual(product) + '</div>' +
        '<div><h3>' + escapeHtml(product.name) + '</h3>' +
        '<div class="card-meta"><span>' + escapeHtml(product.material) + '</span><span class="price">' + QUIRE.money(product.price) + '</span></div></div>' +
      '</a>'
    );
  }

  function renderShop() {
    var root = document.querySelector("[data-shop]");
    if (!root) return;
    var cat = params().get("cat") || "All";
    var q = (params().get("q") || "").trim().toLowerCase();
    var list = QUIRE.products.filter(function (p) {
      var catOk = cat === "All" || p.category === cat;
      var qOk = !q || (p.name + " " + p.material + " " + p.lead).toLowerCase().indexOf(q) !== -1;
      return catOk && qOk;
    });
    document.querySelectorAll("[data-cat]").forEach(function (btn) {
      var on = btn.getAttribute("data-cat") === cat;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var title = document.querySelector("[data-shop-title]");
    if (title) title.textContent = q ? "Results for “" + q + "”" : (cat === "All" ? "The edit" : cat);
    var count = document.querySelector("[data-shop-count]");
    if (count) count.textContent = list.length + (list.length === 1 ? " piece" : " pieces");
    root.innerHTML = list.length
      ? list.map(card).join("")
      : '<div class="empty"><h2>Nothing under that name.</h2><p class="muted">Try a notebook, a pen, or clear the search.</p></div>';
  }

  function renderProduct() {
    var root = document.querySelector("[data-product]");
    if (!root) return;
    var product = QUIRE.byId(params().get("id"));
    if (!product) {
      root.innerHTML = '<div class="empty"><h1>That piece has left the shelf.</h1><p class="muted"><a href="shop.html">Back to the shop</a></p></div>';
      return;
    }
    document.title = product.name + " — Quire";
    root.innerHTML =
      '<div class="product-stage"><div class="visual">' + visual(product) + '</div></div>' +
      '<div class="product-copy">' +
        '<p class="kicker">' + escapeHtml(product.category) + '</p>' +
        '<h1>' + escapeHtml(product.name) + '</h1>' +
        '<p class="price">' + QUIRE.money(product.price) + '</p>' +
        '<p class="lede">' + escapeHtml(product.story) + '</p>' +
        '<div class="specs">' + product.specs.map(function (spec) {
          return '<div class="spec"><span>Detail</span>' + escapeHtml(spec) + '</div>';
        }).join("") + '</div>' +
        '<div class="buy-row">' +
          '<div class="qty"><button type="button" data-qty="-1" aria-label="Decrease quantity">−</button><span data-qty-value>1</span><button type="button" data-qty="1" aria-label="Increase quantity">+</button></div>' +
          '<button class="btn btn-primary" type="button" data-add="' + product.id + '">Add to bag</button>' +
        '</div>' +
        '<p class="note" data-note></p>' +
      '</div>';

    var qty = 1;
    root.querySelectorAll("[data-qty]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        qty = Math.max(1, Math.min(9, qty + Number(btn.getAttribute("data-qty"))));
        root.querySelector("[data-qty-value]").textContent = String(qty);
      });
    });
    root.querySelector("[data-add]").addEventListener("click", function () {
      QuireCart.add(product.id, qty);
      root.querySelector("[data-note]").textContent = "Added " + qty + " to the bag.";
      toast(product.name + " added");
    });

    var related = document.querySelector("[data-related]");
    if (related) {
      related.innerHTML = QUIRE.products
        .filter(function (p) { return p.category === product.category && p.id !== product.id; })
        .slice(0, 4)
        .map(card)
        .join("");
    }
  }

  function renderCart() {
    var root = document.querySelector("[data-cart-lines]");
    if (!root) return;
    var lines = QuireCart.lines().map(function (line) {
      return { line: line, product: QUIRE.byId(line.id) };
    }).filter(function (row) { return row.product; });

    if (!lines.length) {
      root.innerHTML = '<div class="empty"><h2>The bag is empty.</h2><p class="muted">The edit is short on purpose. Start with a notebook.</p><p style="margin-top:16px"><a class="btn btn-primary" href="shop.html">Shop the edit</a></p></div>';
      var summary = document.querySelector("[data-summary]");
      if (summary) summary.hidden = true;
      return;
    }

    root.innerHTML = lines.map(function (row) {
      var p = row.product;
      return (
        '<article class="line">' +
          '<div class="visual">' + visual(p) + '</div>' +
          '<div><h3>' + escapeHtml(p.name) + '</h3><p class="muted">' + escapeHtml(p.material) + '</p>' +
          '<div class="qty" style="margin-top:8px;width:fit-content">' +
            '<button type="button" data-set="' + p.id + '" data-q="' + (row.line.qty - 1) + '" aria-label="Decrease">−</button>' +
            '<span>' + row.line.qty + '</span>' +
            '<button type="button" data-set="' + p.id + '" data-q="' + (row.line.qty + 1) + '" aria-label="Increase">+</button>' +
          '</div></div>' +
          '<div style="text-align:right"><div class="price">' + QUIRE.money(p.price * row.line.qty) + '</div>' +
          '<button class="text-btn" type="button" data-remove="' + p.id + '">Remove</button></div>' +
        '</article>'
      );
    }).join("");

    document.querySelector("[data-subtotal]").textContent = QUIRE.money(QuireCart.subtotal());
    var ship = QuireCart.subtotal() >= 75 ? 0 : 8;
    document.querySelector("[data-ship]").textContent = ship ? QUIRE.money(ship) : "Included";
    document.querySelector("[data-total]").textContent = QUIRE.money(QuireCart.subtotal() + ship);

    root.querySelectorAll("[data-set]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        QuireCart.setQty(btn.getAttribute("data-set"), Number(btn.getAttribute("data-q")));
        renderCart();
      });
    });
    root.querySelectorAll("[data-remove]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        QuireCart.remove(btn.getAttribute("data-remove"));
        renderCart();
      });
    });
  }

  function bindChrome() {
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = String(QuireCart.count());
    });
    var menu = document.querySelector("[data-menu]");
    var mobile = document.querySelector("[data-mobile]");
    if (menu && mobile) {
      menu.addEventListener("click", function () {
        var open = mobile.classList.toggle("open");
        menu.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    var searchBtn = document.querySelector("[data-search-open]");
    var panel = document.querySelector("[data-search]");
    if (searchBtn && panel) {
      searchBtn.addEventListener("click", function () {
        var open = panel.classList.toggle("open");
        searchBtn.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) panel.querySelector("input").focus();
      });
    }
    document.querySelectorAll("[data-newsletter]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        if (!input.value || input.value.indexOf("@") === -1) {
          toast("Add a real email address");
          return;
        }
        input.value = "";
        toast("You are on the list");
        var fine = form.parentElement.querySelector(".fine");
        if (fine) fine.textContent = "Saved in this browser only — wire this form to your list when you launch.";
      });
    });
    var order = document.querySelector("[data-order]");
    if (order) {
      order.addEventListener("click", function () {
        if (!QuireCart.count()) return;
        var n = Math.floor(1000 + Math.random() * 9000);
        QuireCart.clear();
        var layout = document.querySelector("[data-cart-page]");
        layout.innerHTML = '<div class="confirm"><p class="kicker">Sample order</p><h2>Order Q-' + n + ' is noted.</h2><p class="lede" style="margin-top:10px">This template does not charge a card. In a live shop this is where checkout would begin. The bag has been cleared so you can walk the flow again.</p><p style="margin-top:18px"><a class="btn btn-primary" href="shop.html">Continue browsing</a></p></div>';
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindChrome();
    renderShop();
    renderProduct();
    renderCart();
    document.querySelectorAll("[data-home-grid]").forEach(function (el) {
      var ids = (el.getAttribute("data-home-grid") || "").split(",");
      el.innerHTML = ids.map(function (id) {
        var product = QUIRE.byId(id.trim());
        return product ? card(product) : "";
      }).join("");
    });
  });
})();
