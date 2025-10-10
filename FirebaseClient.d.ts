declare class FirebaseClient {
  signInWithPhoneNumber(phoneNumber: string): Promise<{ confirmation: any; error: any }>;
  confirmCode(confirmation: any, code: string): Promise<{ user: any; supabaseUser: any; userRole: string; error: any }>;
  getCurrentUser(): any;
  signOut(): Promise<{ error: any }>;
  onAuthStateChanged(callback: (user: any) => void): () => void;
  getUserRole(firebaseUid: string): Promise<string>;
}

declare const firebaseClient: FirebaseClient;
export default firebaseClient;