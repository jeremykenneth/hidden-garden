const STORAGE_KEYS = {
  CONTACT_SUBMISSIONS: 'contactSubmissions'
};

export const saveLocalFormData = (collectionName, formData) => {
  try {
    const storageKey = STORAGE_KEYS[collectionName.toUpperCase().replace(/([A-Z])/g, '_$1')] || `${collectionName}Data`;

    const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const newEntry = {
      ...formData,
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    existingData.push(newEntry);
    localStorage.setItem(storageKey, JSON.stringify(existingData));

    return newEntry.id;
  } catch (error) {
    throw error;
  }
};
