"use server";

import connectToDatabase from "@/db/mongoose";

export async function getAllUsers() {
  try {
    const mongooseInstance = await connectToDatabase();
    const db = mongooseInstance?.connection?.db;

    if (!db) throw new Error("Mongoose connection not found!");

    const users = await db
      .collection("user")
      .find(
        { email: { $exists: true, $ne: null } },
        { projection: { _id: 1, id: 1, name: 1, email: 1, country: 1 } },
      )
      .toArray();

    const validUsers = users
      .filter((user) => user.name && user.email)
      .map((user) => ({
        id: user._id.toString() || user.id || "",
        name: user.name,
        email: user.email,
      }));

    return validUsers;
  } catch (error) {
    console.error("Error fetching users:", error);

    return [];
  }
}
