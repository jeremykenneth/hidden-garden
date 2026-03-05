import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app);

export const saveFormData = async (collectionName, formData) => {
  try {
    const dataToSave = {
      ...formData,
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, collectionName), dataToSave);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};
