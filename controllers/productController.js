import productModel from "../models/productModel.js";
import fs from "fs";



export const createProductController = async (req,res) => {
    try {
        const {name, slug, description, price, category, quantity, shipping } = req.fields;
        const {photo} = req.files;
        switch (true) {
            case !name:
                return res.status(500).send({error: 'Name is required'});
            case !description:
                return res.status(500).send({error: 'Description is required'});
            case !price:
                return res.status(500).send({error: 'Price is required'});
            case !quantity:
                return res.status(500).send({error: 'Quantity is required'});
            case photo && photo.size > 1000000:
                return res.status(500).send({error: 'Photo is required and should be less than 1mb'});
        };
        const products = new productModel({...req.fields, slug:slugify(name)});
        if (photo) {
            products.photo.data = readFileSync(photo.path);
            products.photo.contentType = photo.path;
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error in creating product"
        });
    };
};

export const productPhotoController = async (req,res) => {
    try {
        const product = await productModel.findById(req.params.pid).select("photo").populate("category");
        if (product.photo.data) {
            res.set("content-type", product.photo.contentType);
            return res.status(200).send(product.photo.data);
        };
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while getting product photo",
            error
        });
    };
};

export const getProductController = async (req, res) => {
    try {
        const products = await productModel.find({}).populate('category').select("-photo").limit(12).sort({createdAt:-1});
        res.status(200).send({
            success:true,
            countTotal: products.length,
            message: 'All Products',
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message: 'Error in getting products',
            error: error.message,
        });
    };
};


export const getSingleProductController = async (req,res) => {
    try {
        const product = await productModel.findOne({slug:req.params.slug}).select("-photo").populate("category");
        res.status(200).send({
            success: true,
            message: "Single product fetched",
            product
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while getting single product",
            error
        });
    };
};

export const deleteProductController = async (req,res) => {
    try {
        await productModel.findByIdAndDelete(req.params.pid).select("-photo");
        res.status(200).send({
            success: true,
            message: "Product Deleted Successfully",
            error
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while deleting product",
            error
        });
    };
};

//search product
export const searchProductController = async (req,res) => {
    try {

        const {keyword} = req.params;
        const result = await productModel;
            .find({
                $or: [
                    {name:{$regex :keyword, $options:"i" } },
                    {description:{$regex :keyword, $options:"i" } },
                ],
            })
            .select('-photo');
        res.json(result);
    }   catch (error) {
        console.log(error);
        res.status(400).send({
            success:false,
            message:'Error In Search Product API',
            error 
      });
    };
};

export const updateProductController = async (req,res) => {
    try {
        const {name, slug, description, price, category, quantity, shipping } = req.fields;
        const {photo} = req.files;
        switch (true) {
            case !name:
                return res.status(500).send({error: 'Name is required'});
            case !description:
                return res.status(500).send({error: 'Description is required'});
            case !price:
                return res.status(500).send({error: 'Price is required'});
            case !quantity:
                return res.status(500).send({error: 'Quantity is required'});
            case photo && photo.size > 1000000:
                return res.status(500).send({error: 'Photo is required and should be less than 1mb'});
        };
        const products = await productModel.findByIdAndUpdate(req.params.pid, {...req.fields, slug:slugify(name)}, {new:true});
        if (photo) {
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({
            success: true,
            message: "Product Updated Successfully",
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error in updating product"
        });
    };
};

//product filter
export const productFilterController = async (req,res) => {
    try {

        const {checked, radio} = req.body;
        let args = {}
        if (checked.length) >0  argrs.category = checked
        if (radio.length) argrs.price = {$gte: radio[0], $lte:radio[1]}
        const products = await productModel.find(args)
        res.status(200).send{
        success:true,
        products,
    }   catch (error) {
        console.log(error);
        res.status(400).send({
            success:false,
            message:'Error While Filtering Products',
            error 
      });
    };
};

