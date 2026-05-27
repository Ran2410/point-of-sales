import bcrypt from "bcrypt";
import { Store, User } from "../models/relations.js";

const seederUser = async () => {
  const adminData = {
    name: "Super Admin",
    email: "admin@pos.com",
    password: await bcrypt.hash("admin123", 10),
    role: "admin",
    is_active: true,
    store_id: null,
    branch_id: null,
  };

  const existAdmin = await User.findOne({ where: { email: adminData.email } });
  if (!existAdmin) {
    await User.create(adminData);
    console.log(`Admin '${adminData.email}' created`);
  } else {
    console.log(`Admin '${adminData.email}' already exists`);
  }

  const [store] = await Store.findOrCreate({
    where: { code: "TKMN" },
    defaults: {
      name: "Toko Mineral",
      code: "TKMN",
      is_active: true,
      is_approved: true,
    },
  });

  console.log(
    `Store '${store.name}' ${store.isNewRecord ? "created" : "already exists"}`,
  );

  const ownerData = {
    name: "Owner Mineral",
    email: "owner@tokominereal.com",
    password: await bcrypt.hash("owner123", 10),
    role: "owner",
    is_active: true,
    store_id: store.id,
    branch_id: null,
  };

  const existOwner = await User.findOne({ where: { email: ownerData.email } });
  if (!existOwner) {
    await User.create(ownerData);
    console.log(`Owner '${ownerData.email}' created`);
  } else {
    console.log(`Owner '${ownerData.email}' already exists`);
  }

  console.log("Seeding completed");
};

export default seederUser;
