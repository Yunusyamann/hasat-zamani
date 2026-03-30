import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { slugify } from '../utils/slug';

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function saveProfile(uid, email, profileData, previousSlug = '') {
  const cleanSlug = slugify(profileData.slug || profileData.displayName || 'hasat-zamani');
  if (!cleanSlug) {
    throw new Error('Geçerli bir profil bağlantısı oluşturulamadı.');
  }

  const newProfileRef = doc(db, 'publicProfiles', cleanSlug);
  const newProfileSnap = await getDoc(newProfileRef);

  if (newProfileSnap.exists() && newProfileSnap.data().ownerId !== uid) {
    throw new Error('Bu profil bağlantısı daha önce alınmış. Lütfen başka bir bağlantı seçin.');
  }

  const payload = {
    uid,
    email,
    displayName: profileData.displayName,
    title: profileData.title,
    about: profileData.about,
    currentCity: profileData.currentCity,
    linkedinUrl: profileData.linkedinUrl,
    welcomeMessage: profileData.welcomeMessage,
    slug: cleanSlug,
    published: true,
    updatedAt: serverTimestamp(),
  };

  await setDoc(
    doc(db, 'users', uid),
    {
      ...payload,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    newProfileRef,
    {
      ownerId: uid,
      displayName: profileData.displayName,
      title: profileData.title,
      about: profileData.about,
      currentCity: profileData.currentCity,
      linkedinUrl: profileData.linkedinUrl,
      welcomeMessage: profileData.welcomeMessage,
      slug: cleanSlug,
      published: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  if (previousSlug && previousSlug !== cleanSlug) {
    await deleteDoc(doc(db, 'publicProfiles', previousSlug));
  }

  return cleanSlug;
}

export async function getPublicProfile(slug) {
  const snapshot = await getDoc(doc(db, 'publicProfiles', slug));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function createSlot(slotData) {
  return addDoc(collection(db, 'slots'), {
    ...slotData,
    isActive: true,
    createdAt: serverTimestamp(),
  });
}

export async function getSlotsByHost(uid) {
  const q = query(collection(db, 'slots'), where('hostId', '==', uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getPublicSlotsBySlug(slug) {
  const q = query(collection(db, 'slots'), where('hostSlug', '==', slug));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((item) => item.isActive);
}

export async function removeSlot(slotId) {
  await deleteDoc(doc(db, 'slots', slotId));
}

export async function createMeetingRequest(requestData) {
  await addDoc(collection(db, 'requests'), {
    ...requestData,
    status: 'pending',
    responseMessage: '',
    createdAt: serverTimestamp(),
  });
}

export async function getRequestsByHost(uid) {
  const q = query(collection(db, 'requests'), where('hostId', '==', uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function acceptRequest(requestId, slotId, responseMessage = '') {
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'accepted',
    responseMessage,
    updatedAt: serverTimestamp(),
  });

  if (slotId) {
    await updateDoc(doc(db, 'slots', slotId), {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function rejectRequest(requestId, responseMessage = '') {
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'rejected',
    responseMessage,
    updatedAt: serverTimestamp(),
  });
}
