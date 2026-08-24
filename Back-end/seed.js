import mongoose from "mongoose";
import dotenv from "dotenv";
import MenuItem from "./models/MenuItem.js";

dotenv.config();

const items = [
  ["Veg Biryani","Aromatic & spicy",80,"Meals","🍛",true],
  ["Veg Sandwich","Grilled & delicious",50,"Snacks","🥪",true],
  ["Veg Hakka Noodles","Stir-fried perfection",70,"Meals","🍜",true],
  ["Cold Coffee","Chilled & refreshing",60,"Drinks","🥤",true],
  ["Masala Dosa","Crispy & fresh",55,"Breakfast","🥞",true],
  ["Paneer Roll","Loaded & tasty",65,"Snacks","🌯",false],
  ["French Fries","Crispy & golden",45,"Snacks","🍟",false],
  ["Fresh Lime","Cool & refreshing",30,"Drinks","🍋",false],
  ["Idli Sambar","Soft idli with sambar",40,"Breakfast","🍽️",false],
  ["Chicken Rice","Flavorful rice meal",100,"Meals","🍗",false]
].map(([name,description,price,category,emoji,popular]) => ({name,description,price,category,emoji,popular}));

await mongoose.connect(process.env.MONGO_URI);
await MenuItem.deleteMany({});
await MenuItem.insertMany(items);
console.log(`Seeded ${items.length} menu items`);
await mongoose.disconnect();
