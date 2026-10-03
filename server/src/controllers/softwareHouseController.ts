import type { Request, Response, NextFunction } from "express";
import type { SoftwareHouseRegion } from "@edu/shared";
import { SoftwareHouse } from "../models/SoftwareHouse.js";

function sanitize(doc: InstanceType<typeof SoftwareHouse>) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    region: doc.region,
    country: doc.country,
    city: doc.city,
    description: doc.description,
    hiringFocus: doc.hiringFocus,
    createdAt: doc.createdAt,
  };
}

// Read-only for students: the directory is admin-managed (see adminController
// for create/update/delete), students only ever browse the approved list.
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
