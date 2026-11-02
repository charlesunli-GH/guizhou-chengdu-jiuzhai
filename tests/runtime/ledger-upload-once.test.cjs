"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const TRIP_ID = "guizhou-chengdu-jiuzhai-202408";
const LEGACY_KEY = `travel-plan:runtime:v1:${encodeURIComponent(TRIP_ID)}`;
const UPLOAD_MARKER_KEY = `travel-plan:runtime:v1:ledger-uploaded:${encodeURIComponent(TRIP_ID)}`;

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(String(key), String(value));
    },
    removeItem(key) {
      values.delete(key);
    }
  };
}

function traveler(id, name) {
  return { id, name, initial: name.slice(0, 1), color: "#D96C42" };
}

function bill(id, payerId, cents = 100) {
  return {
    id,
    originalAmountCents: cents,
    baseAmountCents: cents,
    currency: "CNY",
    category: "餐饮",
    note: "",
    orderedAt: "2024-08-01",
    payerId,
    participantIds: [payerId],
    createdAt: "2024-08-01T00:00:00.000Z",
    updatedAt: "2024-08-01T00:00:00.000Z"
  };
}

function snapshot(travelers, bills) {
  return {
    version: 1,
    settings: {
      baseCurrency: "CNY",
      commonCurrencies: ["EUR", "CHF", "HKD"],
      lastCurrency: "CNY",
      families: []
    },
    travelers,
    bills,
    updatedAt: "2024-08-01T00:00:00.000Z"
  };
}

function createRoot() {
  const listeners = new Map();
  return {
    dataset: {},
    innerHTML: "",
    setAttribute() {},
    removeAttribute() {},
    addEventListener(type, fn) {
      const list = listeners.get(type) || [];
      list.push(fn);
      listeners.set(type, list);
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    contains() {
      return true;
    },
    dispatchEvent(event) {
      for (const fn of listeners.get(event.type) || []) fn(event);
    }
  };
}

function installBrowser(storage) {
  const dialogs = [];
  globalThis.window = globalThis;
  globalThis.localStorage = storage;
  globalThis.location = { hash: "", pathname: "/ledger-test" };
  globalThis.requestAnimationFrame = (callback) => {
    callback();
    return 1;
  };
  globalThis.document = {
    documentElement: { dataset: {} },
    body: {
      append(node) {
        dialogs.push(node);
      }
    },
    addEventListener() {},
    createElement() {
      const listeners = new Map();
      return {
        className: "",
        open: false,
        innerHTML: "",
        dataset: {},
        setAttribute() {},
        addEventListener(type, fn) {
          const list = listeners.get(type) || [];
          list.push(fn);
          listeners.set(type, list);
        },
        close() {
          this.open = false;
        },
        remove() {},
        showModal() {
          this.open = true;
        },
        querySelector() {
          return null;
        },
        confirm() {
          const event = {
            target: {
              closest(selector) {
                if (selector === "[data-ledger-confirm]") return { dataset: { ledgerConfirm: "confirm" } };
                return null;
              }
            }
          };
          for (const fn of listeners.get("click") || []) fn(event);
        }
      };
    }
  };
  return dialogs;
}

function loadLedger() {
  const source = fs.readFileSync(path.resolve(__dirname, "../../ledger.js"), "utf8");
  const module = { exports: {} };
  return new Function("module", "exports", "require", `${source}\nreturn module.exports;`)(module, module.exports, require);
}

function formDataClass() {
  return class FakeFormData {
    constructor(form) {
      this.form = form;
    }
    get(name) {
      return Object.prototype.hasOwnProperty.call(this.form.fields || {}, name) ? this.form.fields[name] : null;
    }
    getAll(name) {
      return this.form.fieldsAll?.[name] || [];
    }
  };
}

async function waitFor(predicate) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error("timed out waiting for ledger condition");
}

async function openLedger(storage, remote, adapter) {
  installBrowser(storage);
  globalThis.FormData = formDataClass();
  delete globalThis.tripAccess;
  const ledger = loadLedger();
  const root = createRoot();
  const loaded = await ledger.init({
    root,
    tripId: TRIP_ID,
    config: { persistence: { mode: "d1", sharedCollections: ["ledger"], apiBase: "/api/trip" } },
    adapter
  });
  return { ledger, root, loaded };
}

test("a local ledger uploads once, then stays off an emptied cloud", async () => {
  const local = snapshot([traveler("person-local", "本机甲")], [bill("bill-local", "person-local")]);
  const storage = memoryStorage({ [LEGACY_KEY]: JSON.stringify(local) });
  const saves = [];
  const first = await openLedger(storage, null, {
    mode: "d1",
    async load() {
      return snapshot([], []);
    },
    async save(next) {
      saves.push(JSON.parse(JSON.stringify(next)));
      return next;
    }
  });

  assert.equal(saves.length, 1);
  assert.equal(saves[0].bills[0].id, "bill-local");
  assert.equal(first.loaded.travelers[0].name, "本机甲");
  assert.equal(storage.getItem(UPLOAD_MARKER_KEY), "1");

  const secondSaves = [];
  const second = await openLedger(storage, null, {
    mode: "d1",
    async load() {
      return snapshot([], []);
    },
    async save(next) {
      secondSaves.push(next);
      return next;
    }
  });
  assert.equal(secondSaves.length, 0);
  assert.equal(second.loaded.bills.length, 0);
  assert.equal(second.loaded.travelers.length, 0);

  storage.removeItem(UPLOAD_MARKER_KEY);
  const cloudSaves = [];
  await openLedger(storage, null, {
    mode: "d1",
    async load() {
      return snapshot([traveler("person-cloud", "云端乙")], [bill("bill-cloud", "person-cloud")]);
    },
    async save(next) {
      cloudSaves.push(next);
      return next;
    }
  });
  assert.equal(cloudSaves.length, 0);
  assert.equal(storage.getItem(UPLOAD_MARKER_KEY), null);

  const retrySaves = [];
  await openLedger(storage, null, {
    mode: "d1",
    async load() {
      return snapshot([], []);
    },
    async save(next) {
      retrySaves.push(next);
      return next;
    }
  });
  assert.equal(retrySaves.length, 1);
  assert.equal(retrySaves[0].bills[0].id, "bill-local");
  assert.equal(storage.getItem(UPLOAD_MARKER_KEY), "1");
});

test("a failed upload is retried, and read-only mode does not upload", async () => {
  const local = snapshot([traveler("person-local", "本机甲")], [bill("bill-local", "person-local")]);
  const storage = memoryStorage({ [LEGACY_KEY]: JSON.stringify(local) });
  let attempts = 0;
  await openLedger(storage, null, {
    mode: "d1",
    async load() {
      return snapshot([], []);
    },
    async save() {
      attempts += 1;
      throw new Error("offline");
    }
  });
  assert.equal(attempts, 1);
  assert.equal(storage.getItem(UPLOAD_MARKER_KEY), null);

  const retrySaves = [];
  await openLedger(storage, null, {
    mode: "d1",
    async load() {
      return snapshot([], []);
    },
    async save(next) {
      retrySaves.push(next);
      return next;
    }
  });
  assert.equal(retrySaves.length, 1);
  assert.equal(storage.getItem(UPLOAD_MARKER_KEY), "1");

  const readStorage = memoryStorage({ [LEGACY_KEY]: JSON.stringify(local) });
  installBrowser(readStorage);
  globalThis.tripAccess = { canEdit: () => false };
  const ledger = loadLedger();
  const readSaves = [];
  await ledger.init({
    root: createRoot(),
    tripId: TRIP_ID,
    config: { persistence: { mode: "d1", sharedCollections: ["ledger"], apiBase: "/api/trip" } },
    adapter: {
      mode: "d1",
      async load() {
        return snapshot([], []);
      },
      async save(next) {
        readSaves.push(next);
        return next;
      }
    }
  });
  assert.equal(readSaves.length, 0);
  assert.equal(readStorage.getItem(UPLOAD_MARKER_KEY), null);
});

test("pasting waits for an in-flight bill save and keeps the pasted ledger", async () => {
  const storage = memoryStorage();
  let releaseSave = null;
  const gate = new Promise((resolve) => {
    releaseSave = resolve;
  });
  const saves = [];
  const { ledger, root } = await openLedger(storage, null, {
    mode: "d1",
    async load() {
      return snapshot([traveler("person-a", "甲")], [bill("bill-old", "person-a")]);
    },
    async save(next) {
      const cloned = JSON.parse(JSON.stringify(next));
      saves.push(cloned);
      if (saves.length === 1) await gate;
      return cloned;
    }
  });
  const dialogs = installBrowser(storage);
  globalThis.FormData = formDataClass();

  root.dispatchEvent({
    type: "submit",
    preventDefault() {},
    target: {
      dataset: { ledgerForm: "bill" },
      fields: {
        currency: "CNY",
        originalAmount: "12.00",
        category: "餐饮",
        payerId: "person-a",
        note: "在途",
        orderedAt: "2024-08-03"
      },
      fieldsAll: { participantIds: ["person-a"] },
      closest(selector) {
        return selector.startsWith("form") ? this : null;
      },
      querySelector() {
        return null;
      },
      elements: {}
    }
  });
  await waitFor(() => saves.length === 1);
  assert.equal(saves[0].bills.length, 2);

  const pasted = snapshot([traveler("person-paste", "粘贴乙")], [bill("bill-paste", "person-paste", 200)]);
  pasted.bills[0].category = "交通";
  root.dispatchEvent({
    type: "submit",
    preventDefault() {},
    target: {
      dataset: { ledgerForm: "paste-ledger" },
      fields: { payload: JSON.stringify(pasted) },
      closest(selector) {
        return selector.startsWith("form") ? this : null;
      },
      querySelector() {
        return null;
      }
    }
  });
  await waitFor(() => dialogs.length === 1);
  assert.equal(saves.length, 1);
  dialogs[0].confirm();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(saves.length, 1);

  releaseSave();
  await waitFor(() => ledger.getSnapshot().bills.some((entry) => entry.id === "bill-paste"));
  const visible = ledger.getSnapshot();
  assert.deepEqual(visible.bills.map((entry) => entry.id), ["bill-paste"]);
  assert.deepEqual(visible.travelers.map((entry) => entry.id), ["person-paste"]);
  assert.equal(saves.at(-1).bills[0].id, "bill-paste");
  assert.equal(saves[0].bills.some((entry) => entry.id === "bill-paste"), false);
});
