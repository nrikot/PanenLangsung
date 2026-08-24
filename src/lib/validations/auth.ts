import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password maksimal 128 karakter"),
  role: z.enum(["petani", "pembeli"]),
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  phone: z.string().min(8, "Nomor telepon minimal 8 karakter").max(20),
  address: z.string().min(5, "Alamat minimal 5 karakter").max(500),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  businessName: z.string().min(2).max(200).optional(),
  npwp: z.string().max(30).optional(),
  nib: z.string().max(30).optional(),
  businessType: z.string().max(100).optional(),
  groupFarmerNumber: z.string().max(50).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(8).max(20).optional(),
  address: z.string().min(5).max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  businessName: z.string().min(2).max(200).optional(),
  npwp: z.string().max(30).optional(),
  nib: z.string().max(30).optional(),
  businessType: z.string().max(100).optional(),
  groupFarmerNumber: z.string().max(50).optional(),
});

export const VerificationDocumentSchema = z.object({
  documentType: z.string().min(1, "Tipe dokumen wajib diisi"),
  fileUrl: z.string().url("URL file tidak valid"),
});

export const RejectVerificationSchema = z.object({
  reason: z.string().min(1, "Alasan penolakan wajib diisi"),
});
