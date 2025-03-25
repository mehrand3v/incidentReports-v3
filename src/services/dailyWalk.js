// src/services/dailyWalk.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { getCurrentUser } from "@/services/auth";
import { toast } from "sonner";

// Collection names
const INSPECTIONS_COLLECTION = "inspections";
const STORES_COLLECTION = "stores";

// Checklist items data
export const CHECKLIST_ITEMS = [
  { id: 1, description: "Is the hotdog/Grill Area clean ?" },
  {
    id: 2,
    description:
      "Are there product Tags/IDs available for each product on roller grill ?",
  },
  { id: 3, description: "Hotdog Buns labeled and are in date ?" },
  { id: 4, description: "Are tongs clean ? Are Tongs in place ?" },
  { id: 5, description: "Fresh Condiments and Bottle Condiments labeled ?" },
  { id: 6, description: "Under Counter Hotdog Containers labeled properly ?" },
  { id: 7, description: "Is fountain area clean ?" },
  { id: 8, description: "Are fountain machine nozzles free of any buildup ?" },
  {
    id: 9,
    description:
      "Are top of coffee machine and container tops free of beans and dust ?",
  },
  { id: 10, description: "Is coffee area clean ?" },
  {
    id: 11,
    description:
      "Do cold creamers have expiration labels on them and machine free from buildup ?",
  },
  {
    id: 12,
    description: "Pizza Warmer / Flexserve free of any expired products ?",
  },
  {
    id: 13,
    description:
      "Does bakery case has all labels/tags that include calories information",
  },
  { id: 14, description: 'Only "Approved" chemicals in chemical area ?' },
  { id: 15, description: "Any chemical bottle without lid ?" },
  { id: 16, description: "Santizer Bucket prepared and labeled ?" },
  { id: 17, description: "Santizer Sink Prepared and labeled ?" },
  { id: 18, description: "Sanitizer bottle prepared and labeled ?" },
  {
    id: 19,
    description: "Handwashing Sink free of any clutter and Employee Cups/Mugs",
  },
  {
    id: 20,
    description: "Ecosure Logs are in Conspicuous and visible place ?",
  },
  {
    id: 21,
    description:
      "Restrooms Clean and stocked with Handwashing soap,tissue and paper towels ?",
  },
  { id: 22, description: "Dumspter Lid Closed ?" },
  { id: 23, description: "Paper Towels available near handwashing sink ?" },
  { id: 24, description: "Mops Stored properly ?" },
  { id: 25, description: "Cashier knows about 6 food allergens ?" },
  { id: 26, description: "Microwaves clean ?" },
];

// Create a new inspection
export const createInspection = async (inspectionData) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const newInspection = {
      ...inspectionData,
      inspectedBy: {
        userId: user.uid,
        name: user.displayName || user.email,
      },
      status: inspectionData.status || "draft",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, INSPECTIONS_COLLECTION),
      newInspection
    );

    return {
      id: docRef.id,
      ...newInspection,
    };
  } catch (error) {
    console.error("Error creating inspection:", error);
    throw error;
  }
};

// Get all inspections for a user's store
export const getInspections = async (storeId = null, limitCount = 50) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    let queryConstraints = [orderBy("createdAt", "desc")];

    if (storeId) {
      queryConstraints.push(where("storeId", "==", storeId));
    }

    const q = query(
      collection(db, INSPECTIONS_COLLECTION),
      ...queryConstraints,
      firestoreLimit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    const inspections = [];
    querySnapshot.forEach((doc) => {
      inspections.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return inspections;
  } catch (error) {
    console.error("Error getting inspections:", error);
    throw error;
  }
};

// Get a single inspection by ID
export const getInspectionById = async (inspectionId) => {
  try {
    const docRef = doc(db, INSPECTIONS_COLLECTION, inspectionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      throw new Error("Inspection not found");
    }
  } catch (error) {
    console.error(`Error getting inspection ${inspectionId}:`, error);
    throw error;
  }
};

// Update an inspection
export const updateInspection = async (inspectionId, updateData) => {
  try {
    const docRef = doc(db, INSPECTIONS_COLLECTION, inspectionId);

    // Get the current inspection first to verify permissions
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Inspection not found");
    }

    // Add timestamp
    const dataToUpdate = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, dataToUpdate);

    return {
      id: inspectionId,
      ...docSnap.data(),
      ...dataToUpdate,
    };
  } catch (error) {
    console.error(`Error updating inspection ${inspectionId}:`, error);
    throw error;
  }
};

// Complete an inspection
export const completeInspection = async (
  inspectionId,
  correctedByUser = null
) => {
  try {
    const docRef = doc(db, INSPECTIONS_COLLECTION, inspectionId);

    // Build the update data
    const updateData = {
      status: "completed",
      updatedAt: serverTimestamp(),
    };

    // Add correctedBy if provided
    if (correctedByUser) {
      updateData.correctedBy = {
        userId: correctedByUser.uid,
        name: correctedByUser.displayName || correctedByUser.email,
      };
    }

    await updateDoc(docRef, updateData);

    return true;
  } catch (error) {
    console.error(`Error completing inspection ${inspectionId}:`, error);
    throw error;
  }
};

// Get stores for dropdown
export const getStores = async () => {
  try {
    // For demo purposes, if there are no stores, create one
    const storesSnapshot = await getDocs(collection(db, STORES_COLLECTION));
    const storesExist = !storesSnapshot.empty;

    if (!storesExist) {
      // Create a default store
      await addDoc(collection(db, STORES_COLLECTION), {
        name: "Store #123",
        location: "Main Street",
        createdAt: serverTimestamp(),
      });

      toast.success("Demo store created");
    }

    // Get all stores
    const querySnapshot = await getDocs(collection(db, STORES_COLLECTION));

    const stores = [];
    querySnapshot.forEach((doc) => {
      stores.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return stores;
  } catch (error) {
    console.error("Error getting stores:", error);
    toast.error("Failed to load stores");
    // Return at least one default store to prevent UI from breaking
    return [{ id: "demo-store", name: "Demo Store" }];
  }
};

// Initialize default checklist items for a new inspection
export const initializeChecklistItems = () => {
  return CHECKLIST_ITEMS.map((item) => ({
    ...item,
    passed: null,
    fixed: false,
    comments: "",
  }));
};
