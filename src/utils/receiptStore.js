const DB_NAME = "ee_receipts_db";
const STORE_NAME = "receipts";
const DB_VERSION = 1;

const isSupported = () => typeof indexedDB !== "undefined";

const openDB = () =>
  new Promise((resolve, reject) => {
    if (!isSupported()) {
      reject(new Error("IndexedDB is not supported in this browser."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async mode => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, mode);
  const store = tx.objectStore(STORE_NAME);
  return { store, tx };
};

export const saveReceiptBlob = async (bookingId, file) => {
  const { store, tx } = await withStore("readwrite");
  store.put(file, bookingId);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

export const getReceiptBlob = async bookingId => {
  const { store } = await withStore("readonly");
  return new Promise((resolve, reject) => {
    const request = store.get(bookingId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

export const deleteReceiptBlob = async bookingId => {
  const { store, tx } = await withStore("readwrite");
  store.delete(bookingId);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

export const getReceiptObjectURL = async bookingId => {
  try {
    const blob = await getReceiptBlob(bookingId);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error("Failed to read receipt blob:", err);
    return null;
  }
};

