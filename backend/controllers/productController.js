import {v2 as cloudinary} from 'cloudinary';
import productModel from '../models/productModel.js'
import { getEmbedding, cosineSimilarity } from '../utils/gemini.js';


//Function for added product
const addProduct = async (req, res)=>{

  try {
    
    const {name,description,price, category, subCategory, sizes, bestseller} = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter((item)=> item !== undefined);

    let imagesUrl = await Promise.all(
      images.map(async (item) =>{
        let result = await cloudinary.uploader.upload(item.path,{resource_type:'image'});
        return result.secure_url;
      })
    )

    // Generate embedding for the product
    const embedText = `Name: ${name}. Category: ${category} / ${subCategory}. Description: ${description}`;
    const embedding = await getEmbedding(embedText);

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes:JSON.parse(sizes),
      image: imagesUrl,
      embedding,
      date: Date.now()
    }
    
    const product = new productModel(productData);
    await product.save();

    res.json({success:true, message:"Product Added"});

  } catch (error) {
    console.log(error);
    
    res.json({success:false, message:error.message});
  }

}

//Function for list product
const listProduct = async (req, res)=>{

  try {
    
    const products = await productModel.find({});
    res.json({success:true, products});

  } catch (error) {
    console.log(error);
    res.json({success:false, message:error.message});
    
  }

}

//Function for removing product
const removeProduct = async (req, res)=>{

  try {
    
    await productModel.findByIdAndDelete(req.body.id);
    res.json({success:true, message:"Product Removed"});

  } catch (error) {
    console.log(error);
    res.json({success:false, message:error.message});
  }

}

//Function for single product info
const singleProduct = async (req, res)=>{

  try {
    
    const {productId} = req.body;
    const product = await productModel.findById(productId);
    res.json({success:true, product});

  } catch (error) {
    console.log(error);
    res.json({success:false, message:error.message});
  }

}

//Function for semantic search
const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json({ success: false, message: "Query parameter is required" });
    }

    // Generate embedding for the query
    const queryEmbedding = await getEmbedding(query);

    // Fetch all products
    const products = await productModel.find({});

    // Calculate similarity scores
    const productsWithScore = products.map(product => {
      let score = 0;
      if (product.embedding && product.embedding.length > 0) {
        score = cosineSimilarity(queryEmbedding, product.embedding);
      } else {
        // Fallback simple word overlap logic if embeddings are missing
        const queryTerms = query.toLowerCase().split(/\s+/);
        const nameLower = product.name.toLowerCase();
        const descLower = product.description.toLowerCase();
        let matches = 0;
        queryTerms.forEach(term => {
          if (nameLower.includes(term)) matches += 2;
          if (descLower.includes(term)) matches += 1;
        });
        score = matches / (queryTerms.length * 3);
      }
      return {
        ...product.toObject(),
        similarityScore: score
      };
    });

    // Sort by similarity score descending
    productsWithScore.sort((a, b) => b.similarityScore - a.similarityScore);

    res.json({ success: true, products: productsWithScore });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

export {addProduct, listProduct, removeProduct, singleProduct, searchProducts};