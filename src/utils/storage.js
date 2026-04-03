export const saveFileToDB = (id, file) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("KanbanFileStore", 1);
    
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore("files");
    };
    
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      store.put(file, id);
      
      tx.oncomplete = () => {
        resolve(`idb://${id}`);
      };
      
      tx.onerror = () => {
        reject(tx.error);
      };
    };
    
    request.onerror = () => reject(request.error);
  });
};

export const getFileFromDB = (id) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("KanbanFileStore", 1);
    
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore("files");
    };
    
    request.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("files")) {
        return resolve(null);
      }
      const tx = db.transaction("files", "readonly");
      const store = tx.objectStore("files");
      const getReq = store.get(id);
      
      getReq.onsuccess = () => {
        resolve(getReq.result); // Returns the File/Blob
      };
      
      getReq.onerror = () => {
        reject(getReq.error);
      };
    };
    
    request.onerror = () => reject(request.error);
  });
};
