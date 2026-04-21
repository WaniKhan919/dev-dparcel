import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY ;

// Encrypt and store
export function encryptLocalStorage(key: string, data: any) {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    SECRET_KEY
  ).toString();
  localStorage.setItem(key, encrypted);
}

// Decrypt and retrieve
export function decryptLocalStorage(key: string) {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
}

// Remove item
export const removeLocalStorage = (key: string): void => {
  localStorage.removeItem(key);
};

//get user
export function getUser() {
  return decryptLocalStorage("user") || {};
}

//get permission for storage
export function getPermissions() {
  return decryptLocalStorage("permissions") || [];
}

//get specific permission
export function userHasPermission(permission:string) {
  const permissions = getPermissions();
  return permissions.includes(permission);
}

// Check if user has a specific role
export function userHasRole(role: string) {
  const user = decryptLocalStorage("user") || {};
  return user?.roles?.includes(role) || false;
}

//get status bage buy pass status title
export const getStatusBadge = (rawStatus?: string) => {
  const status = rawStatus?.toLowerCase() ?? "pending";

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",

    "offer placed": "bg-blue-100 text-blue-800",
    "offer accepted": "bg-green-100 text-green-800",

    "payment pending": "bg-orange-100 text-orange-800",

    inprogress: "bg-purple-100 text-purple-800",
    processed: "bg-indigo-100 text-indigo-800",

    forwarded: "bg-cyan-100 text-cyan-800",
    received: "bg-teal-100 text-teal-800",

    completed: "bg-green-200 text-green-900",
  };

  return {
    label: rawStatus ?? "Pending",
    className:
      statusColors[status] || "bg-gray-100 text-gray-800",
  };
};