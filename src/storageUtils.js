import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export const uploadFile = async (file, path) => {
  try {
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    throw error;
  }
};

export const getFileURL = async (path) => {
  try {
    const fileRef = ref(storage, path);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    return null;
  }
};

export const listFiles = async (path) => {
  try {
    const directoryRef = ref(storage, path);
    const result = await listAll(directoryRef);
    return result.items;
  } catch (error) {
    return [];
  }
};

export const deleteFile = async (path) => {
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  } catch (error) {
    throw error;
  }
};

export const getFilesURLsFromDirectory = async (path) => {
  try {
    const files = await listFiles(path);

    const urlPromises = files.map(async (fileRef) => {
      try {
        const url = await getDownloadURL(fileRef);
        return { name: fileRef.name, url };
      } catch (error) {
        return null;
      }
    });

    const results = await Promise.all(urlPromises);
    return results.filter(result => result !== null);
  } catch (error) {
    return [];
  }
};

export const setImageFromStorage = async (selector, path, altText = '', fallbackSrc = '') => {
  const imgElement = document.querySelector(selector);
  if (!imgElement) return;

  try {
    const imageUrl = await getFileURL(path);
    if (imageUrl) {
      imgElement.src = imageUrl;
      if (altText) imgElement.alt = altText;
    } else if (fallbackSrc) {
      imgElement.src = fallbackSrc;
    }
  } catch (error) {
    if (fallbackSrc) imgElement.src = fallbackSrc;
  }
};
