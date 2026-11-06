(function () {
  var KEY = "quire-cart-v1";

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function write(lines) {
    localStorage.setItem(KEY, JSON.stringify(lines));
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = String(count(lines));
    });
  }

  function count(lines) {
    return (lines || read()).reduce(function (sum, line) { return sum + line.qty; }, 0);
  }

  window.QuireCart = {
    lines: read,
    count: function () { return count(read()); },
    add: function (id, qty) {
      qty = qty || 1;
      var lines = read();
      var found = lines.find(function (l) { return l.id === id; });
      if (found) found.qty += qty;
      else lines.push({ id: id, qty: qty });
      write(lines);
    },
    setQty: function (id, qty) {
      var lines = read().filter(function (l) { return l.id !== id; });
      if (qty > 0) lines.push({ id: id, qty: qty });
      write(lines);
    },
    remove: function (id) {
      write(read().filter(function (l) { return l.id !== id; }));
    },
    clear: function () { write([]); },
    subtotal: function () {
      return read().reduce(function (sum, line) {
        var product = QUIRE.byId(line.id);
        return sum + (product ? product.price * line.qty : 0);
      }, 0);
    },
  };
})();
