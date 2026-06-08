import mongoose from "mongoose";
import "dotenv/config";
import productModel from "./models/productModel.js";
import { getEmbedding } from "./utils/gemini.js";

const seedProducts = [
  {
    name: "Classic Denim Jacket",
    description: "A premium classic blue denim jacket with double chest pockets, copper button closures, and a comfortable relaxed fit. Perfect for layering in autumn and winter.",
    price: 80,
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["M", "L", "XL"],
    image: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80"],
    bestSeller: true
  },
  {
    name: "Heavyweight Fleece Pullover Hoodie",
    description: "Super soft and thick black cotton fleece hoodie featuring a double-lined drawstring hood, kangaroo pocket, and ribbed cuffs. Keep warm and comfortable in cold weather.",
    price: 60,
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    image: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80"],
    bestSeller: true
  },
  {
    name: "Slim Fit Flat-Front Chinos",
    description: "Tailored beige chino trousers made from stretch cotton twill. Flat-front design with button closure and side pockets. Clean casual styling for any occasion.",
    price: 45,
    category: "Men",
    subCategory: "Bottomwear",
    sizes: ["M", "L", "XL"],
    image: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80"],
    bestSeller: false
  },
  {
    name: "Minimalist White Cotton T-Shirt",
    description: "Ultra-soft premium organic white cotton t-shirt with a classic crew neck and short sleeves. Breathable and perfect for hot summer days or layering.",
    price: 25,
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80"],
    bestSeller: true
  },
  {
    name: "Vintage Oversized Graphic Tee",
    description: "Faded charcoal grey cotton t-shirt with a vintage retro print on the front. Relaxed drop-shoulder silhouette for a modern streetwear look.",
    price: 30,
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    image: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80"],
    bestSeller: false
  },
  {
    name: "Cozy Cable Knit Winter Sweater",
    description: "Thick cream-colored cable knit sweater featuring a cozy turtleneck and relaxed drop-shoulder sleeves. Crafted from soft wool blend to keep you warm.",
    price: 75,
    category: "Women",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L"],
    image: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80"],
    bestSeller: true
  },
  {
    name: "Water-Resistant Quilted Puffer Coat",
    description: "Long olive green quilted puffer jacket insulated with recycled down-alternative fill. Features a windproof high collar, detachable hood, and zip pockets.",
    price: 120,
    category: "Women",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    image: ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80"],
    bestSeller: false
  },
  {
    name: "High-Waisted Ribbed Knit Leggings",
    description: "Stretchy dark grey ribbed leggings with a wide supportive waistband. Seamless knit construction makes it perfect for lounging or active workouts.",
    price: 35,
    category: "Women",
    subCategory: "Bottomwear",
    sizes: ["XS", "S", "M", "L"],
    image: ["https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=600&auto=format&fit=crop&q=80"],
    bestSeller: false
  },
  {
    name: "Flowy Floral Print Summer Dress",
    description: "A lightweight, breathable yellow wrap dress with a romantic red floral print, V-neckline, and self-tie waist belt. Perfect for sunny beach outings.",
    price: 55,
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L"],
    image: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80"],
    bestSeller: true
  },
  {
    name: "Linen Blend Button-Down Blouse",
    description: "Relaxed fit sky blue button-up shirt crafted from pre-washed linen blend. Features roll-up sleeves and a single chest pocket for a smart-casual beach vibe.",
    price: 40,
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    image: ["https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600&auto=format&fit=crop&q=80"],
    bestSeller: false
  },
  {
    name: "Kids Waterproof Hooded Rain Jacket",
    description: "Bright yellow windproof and waterproof rain coat with a breathable mesh lining, reflective safety strips, and easy snap closures. Perfect for wet outdoors.",
    price: 45,
    category: "Kids",
    subCategory: "Winterwear",
    sizes: ["3-4Y", "5-6Y", "7-8Y"],
    image: ["https://images.unsplash.com/photo-1604916287784-c324202b3205?w=600&auto=format&fit=crop&q=80"],
    bestSeller: false
  },
  {
    name: "Kids Organic Cotton Dungarees",
    description: "Classic blue denim overalls for children. Made from durable, chemical-free organic cotton with adjustable button shoulder straps and side pockets.",
    price: 38,
    category: "Kids",
    subCategory: "Bottomwear",
    sizes: ["2-3Y", "4-5Y", "6-7Y"],
    image: ["https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&auto=format&fit=crop&q=80"],
    bestSeller: true
  },
  {
    name: "Kids Lightweight Graphic Sweatshirt",
    description: "Light grey crewneck cotton sweatshirt for boys and girls, featuring a cute printed cartoon dinosaur illustration. Elastic cuffs and hem.",
    price: 28,
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y"],
    image: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80"],
    bestSeller: false
  },
  {
    name: "Striped Cotton Summer Tee",
    description: "Soft navy and white striped crewneck tee with short sleeves. Breathable knit cotton keeps active children cool and comfortable all day.",
    price: 18,
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["2-3Y", "4-5Y", "6-7Y"],
    image: ["https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&auto=format&fit=crop&q=80"],
    bestSeller: false
  },
  {
    name: "Casual Twill Drawstring Joggers",
    description: "Dark khaki joggers with an elastic waistband, functional drawstring, and ribbed ankle cuffs. Built for comfort with lightweight cotton-spandex twill.",
    price: 48,
    category: "Men",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL"],
    image: ["https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=600&auto=format&fit=crop&q=80"],
    bestSeller: false
  }
];

const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("Error: MONGODB_URI is not set!");
      process.exit(1);
    }

    console.log("Connecting to database at:", uri);
    await mongoose.connect(uri);
    console.log("Connected! Clearing product collection...");
    
    // Clear product collection
    await productModel.deleteMany({});
    console.log("Deleted all existing products.");

    console.log("Seeding products and generating vector embeddings...");
    for (let i = 0; i < seedProducts.length; i++) {
      const p = seedProducts[i];
      console.log(`[${i + 1}/${seedProducts.length}] Seeding: ${p.name}`);
      const embedText = `Name: ${p.name}. Category: ${p.category} / ${p.subCategory}. Description: ${p.description}`;
      
      const embedding = await getEmbedding(embedText);
      
      const newProduct = new productModel({
        ...p,
        embedding,
        date: Date.now() - (seedProducts.length - i) * 60000 // stagger dates slightly
      });
      
      await newProduct.save();
    }

    console.log("\nDatabase seeded successfully!");
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
