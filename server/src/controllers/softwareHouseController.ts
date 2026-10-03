import type { Request, Response, NextFunction } from "express";
import { softwareHouseRequestSchema, type SoftwareHouseRegion } from "@edu/shared";
import { SoftwareHouse } from "../models/SoftwareHouse.js";
import { validateBody } from "../utils/validate.js";

export const validateSoftwareHouse = validateBody(softwareHouseRequestSchema);

function sanitize(doc: InstanceType<typeof SoftwareHouse>) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    website: doc.website,
    region: doc.region,
    country: doc.country,
    city: doc.city,
    description: doc.description,
    hiringFocus: doc.hiringFocus,
    approved: doc.approved,
    mine: false,
    createdAt: doc.createdAt,
  };
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const region = req.query.region;
    const filter: Record<string, unknown> = { approved: true };
    if (region === "pakistan" || region === "international") {
      filter.region = region as SoftwareHouseRegion;
    }
    const country = req.query.country;
    if (typeof country === "string" && country.trim()) {
      filter.country = new RegExp(country.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    }

    const docs = await SoftwareHouse.find(filter).sort({ name: 1 }).limit(300);
    res.json({ softwareHouses: docs.map(sanitize) });
  } catch (err) {
    next(err);
  }
}

export async function mine(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const docs = await SoftwareHouse.find({ addedBy: userId }).sort({ createdAt: -1 }).limit(100);
    res.json({ softwareHouses: docs.map((d) => ({ ...sanitize(d), mine: true })) });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const requester = (req as any).user;
    const body = req.body;
    const doc = await SoftwareHouse.create({
      name: body.name.trim(),
      website: body.website ?? "",
      region: body.region,
      country: body.country.trim(),
      city: body.city?.trim() ?? "",
      description: body.description ?? "",
      hiringFocus: body.hiringFocus ?? [],
      addedBy: requester.id,
      // Admins publish immediately; student submissions queue for review.
      approved: requester.role === "admin",
    });
    res.status(201).json({ softwareHouse: { ...sanitize(doc), mine: true } });
  } catch (err) {
    next(err);
  }
}
