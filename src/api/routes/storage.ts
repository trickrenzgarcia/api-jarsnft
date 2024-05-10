import supabase from "@/supabase";
import multer from "multer";
import { Router } from "express";
import { randomUUID } from "crypto";
import { prisma } from "@/prisma";
import { z } from "zod";
import { ethers } from "ethers";

const store = multer.memoryStorage();
const upload = multer({ storage: store });

export const storage = Router();

const schema = z.object({
    address: z.string().refine((value) => ethers.utils.isAddress(value), {
        message: "Invalid address"
    })
})

const updateAvatarSchema = z.object({
    address: z.string().refine((value) => ethers.utils.isAddress(value), {
        message: "Invalid address"
    }),
    image_url: z.string().min(1)
})

storage.post("/profile", async (req, res) => {
    const addressSchema = schema.safeParse(req.body);

    if (!addressSchema.success) return res.status(400).json(addressSchema.error.errors);

    try {
        const user_profile = await prisma.userProfile.create({
            data: {
                address: addressSchema.data.address,
            }
        })
        return res.status(200).json(user_profile);
    } catch (error) {
        return res.status(500).json({ error });
    }
})

storage.post("/profile/updateAvatar", async (req, res) => {
    const updateAvatar = updateAvatarSchema.safeParse(req.body);

    if (!updateAvatar.success) return res.status(400).json(updateAvatar.error.errors);

    try {
        const user_profile = await prisma.userProfile.update({
            where: {
                address: updateAvatar.data.address
            },
            data: {
                image_url: updateAvatar.data.image_url
            }
        })
        return res.status(200).json(user_profile);
    } catch (error) {
        return res.status(500).json({ error });
    }
})

storage.post("/profile/image", upload.single('image'), async (req, res) => {
    const addressSchema = schema.safeParse(req.body);

    if (!addressSchema.success) return res.status(400).json(addressSchema.error.errors);

    const file = req.file

    if (!file) return res.status(400).send("No file uploaded")

    try {
        const uuid = randomUUID();
        const fileName = `${uuid}.${file.originalname.split('.').pop()}`;
        const { data: result, error } = await supabase.storage.from("jarsnft_profile").upload(fileName, file.buffer, {
            contentType: file.mimetype
        })  

        if(error) {
            return res.status(500).json({ error });
        }

        const fileUrl = supabase.storage.from("jarsnft_profile").getPublicUrl(result.path).data.publicUrl;

        const user_cover = await prisma.userProfile.update({
            where: {
                address: addressSchema.data.address
            },
            data: {
                image_url: fileUrl
            }
        })

        return res.status(200).json({
            image_url: user_cover.banner_url
        })
    } catch (error) {
        return res.status(500).json({ error });
    }
    
})

storage.post("/profile/cover", upload.single('cover'), async (req, res) => {
    const addressSchema = schema.safeParse(req.body);

    if (!addressSchema.success) return res.status(400).json(addressSchema.error.errors);

    const file = req.file

    if (!file) return res.status(400).send("No file uploaded")

    try {
        const uuid = randomUUID();
        const fileName = `${uuid}.${file.originalname.split('.').pop()}`;
        const { data: result, error } = await supabase.storage.from("jarsnft_profile").upload(fileName, file.buffer, {
            contentType: file.mimetype
        })

        if(error) {
            return res.status(500).json({ error });
        }

        const fileUrl = supabase.storage.from("jarsnft_profile").getPublicUrl(result.path).data.publicUrl;

        const user_cover = await prisma.userProfile.update({
            where: {
                address: addressSchema.data.address
            },
            data: {
                banner_url: fileUrl
            }
        })

        return res.status(200).json({
            banner_url: user_cover.banner_url
        })
    } catch (error) {
        return res.status(500).json({ error });
    }
    
})