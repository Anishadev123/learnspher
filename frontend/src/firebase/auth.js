import { auth } from "./Firebase";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword,GoogleAuthProvider,sendPasswordResetEmail,updatePassword,sendEmailVerification } from "firebase/auth";

export const doCreateUserWithEmailAndPassword = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInWithEmailAndPassword = async (email, password) => {
  return signInWithEmailAndPassword(auth,email, password);
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await auth.signInWithPopup(provider);
  result.user
  return result;
}

export const doSignOut = async () => {
  return auth.signOut();
}

export const doPasswordReset = async (email) => {
    return sendPasswordResetEmail(auth,email);
};
export const doPasswordUpdate = async (password) => {
    return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = async () => {
    return sendEmailVerification(auth.currentUser,{
        url:`${window.location.origin}/login`,});
};
