import { Inngest } from "inngest";
import connectDB from "../../config/db";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "QuickCart" });

// Inngest Function to save user data to a database
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address, // ✅ Fixed field access
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    };

    try {
      await connectDB();
      await User.create(userData);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
);

// Inngest Function to update user's data to a database
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    };

    try {
      await connectDB();
      await User.findByIdAndUpdate(id, userData, { new: true });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
);

// Inngest Function to delete user from database
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;

    try {
      await connectDB();
      await User.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
);
