import bcrypt from "bcrypt";
import { connectDB } from "./db/connect.js";
import { User } from "./models/User.js";
import { Town } from "./models/Town.js";
import { StreetGroup } from "./models/StreetGroup.js";
import { Address } from "./models/Address.js";
import { AddressResident } from "./models/AddressResident.js";
import { StreetMembership } from "./models/StreetMembership.js";
import { Post } from "./models/Post.js";
import { Comment } from "./models/Comment.js";
import { StreetChatMessage } from "./models/StreetChatMessage.js";

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Town.deleteMany({}),
    StreetGroup.deleteMany({}),
    Address.deleteMany({}),
    AddressResident.deleteMany({}),
    StreetMembership.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    StreetChatMessage.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("Password123", 10);

  const town = await Town.create({ name: "Irvine", county: "North Ayrshire", lat: 55.614, lon: -4.664, memberCount: 0 });

  const streets = await StreetGroup.create([
    { name: "High Street", townId: town._id, memberCount: 0 },
    { name: "Seagate", townId: town._id, memberCount: 0 },
    { name: "Harbourside", townId: town._id, memberCount: 0 },
  ]);

  const admin = await User.create({
    email: "admin@connectedcommunity.uk",
    passwordHash,
    firstName: "Admin",
    postcode: "KA12 8EE",
    emailVerifiedAt: new Date(),
    isAdmin: true,
    townId: town._id,
    streetGroupId: streets[0]._id,
  });

  const addresses = await Address.create([
    { line1: "1 High Street", town: "Irvine", postcode: "KA12 8EE", ownerUserId: admin._id, residentCount: 1 },
    { line1: "2 Seagate", town: "Irvine", postcode: "KA12 8ER", ownerUserId: null, residentCount: 0 },
    { line1: "3 Harbourside", town: "Irvine", postcode: "KA12 8PP", ownerUserId: null, residentCount: 0 },
  ]);

  await AddressResident.create({
    userId: admin._id,
    addressId: addresses[0]._id,
    role: "OWNER",
    state: "ACTIVE",
    approvedAt: new Date(),
  });

  await StreetMembership.create({ userId: admin._id, streetGroupId: streets[0]._id, joinedAt: new Date() });

  const neighbours = await User.create([
    {
      email: "neighbour1@example.com",
      passwordHash,
      firstName: "Niamh",
      postcode: "KA12 8EE",
      emailVerifiedAt: new Date(),
      streetGroupId: streets[0]._id,
      townId: town._id,
      addressId: addresses[0]._id,
      addressRole: "RESIDENT",
    },
    {
      email: "neighbour2@example.com",
      passwordHash,
      firstName: "Jamie",
      postcode: "KA12 8ER",
      emailVerifiedAt: new Date(),
      streetGroupId: streets[1]._id,
      townId: town._id,
    },
  ]);

  await AddressResident.create({
    userId: neighbours[0]._id,
    addressId: addresses[0]._id,
    role: "RESIDENT",
    state: "ACTIVE",
    approvedAt: new Date(),
  });

  await StreetMembership.create({ userId: neighbours[0]._id, streetGroupId: streets[0]._id, joinedAt: new Date() });

  await AddressResident.create({
    userId: neighbours[1]._id,
    addressId: addresses[1]._id,
    role: "OWNER",
    state: "ACTIVE",
    approvedAt: new Date(),
  });

  await StreetMembership.create({ userId: neighbours[1]._id, streetGroupId: streets[1]._id, joinedAt: new Date() });

  const categories = ["FOR_SALE", "FREE", "SERVICES", "LOST_FOUND", "ANNOUNCEMENT", "EVENT"] as const;

  const posts = await Post.create(
    categories.map((category, index) => ({
      authorId: admin._id,
      streetGroupId: streets[0]._id,
      townId: town._id,
      category,
      title: `${category.replace("_", " ")} example`,
      body: "Welcome to ConnectedCommunity!",
      visibility: index % 2 === 0 ? "STREET" : "STREET_AND_TOWN",
    }))
  );

  for (const post of posts) {
    await Comment.create({ postId: post._id, authorId: neighbours[0]._id, body: "Looks great!" });
  }

  const now = new Date();
  await StreetChatMessage.create([
    { streetGroupId: streets[0]._id, senderId: admin._id, text: "Morning neighbours!", createdAt: new Date(now.getTime() - 600000) },
    { streetGroupId: streets[0]._id, senderId: neighbours[0]._id, text: "Morning!", createdAt: new Date(now.getTime() - 300000) },
    { streetGroupId: streets[0]._id, senderId: admin._id, text: "Community tidy up at noon.", createdAt: now },
  ]);

  console.log("🌱 Seed data inserted. Default admin: admin@connectedcommunity.uk / Password123");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
